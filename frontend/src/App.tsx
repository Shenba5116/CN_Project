import React, { useState, useEffect, useCallback } from 'react';
import { 
  Network, 
  GitCompare, 
  Activity, 
  History, 
  Sliders, 
  AlertTriangle, 
  RefreshCw,
  Server
} from 'lucide-react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TopologyView } from './components/TopologyView';
import { RoutingComparison } from './components/RoutingComparison';
import { EventLogView } from './components/EventLogView';
import { SettingsView } from './components/SettingsView';
import { PerformanceCharts } from './components/PerformanceCharts';
import { api } from './services/api';
import type { 
  SystemStatus, 
  TopologyModel, 
  MetricsSummary, 
  NetworkEvent, 
  RouteResult, 
  ComparisonResult, 
  WeightConfig, 
  RoutingAlgorithm,
  LinkMetricsUpdate
} from './types';

export const App: React.FC = () => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'topology' | 'comparison' | 'events' | 'settings'>('overview');

  // Application Data States
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [topology, setTopology] = useState<TopologyModel>({ nodes: [], links: [] });
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [weights, setWeights] = useState<WeightConfig | null>(null);

  // Active Endpoints and Algorithm
  const [source, setSource] = useState<string>('H1');
  const [destination, setDestination] = useState<string>('H4');
  const [activeAlgorithm, setActiveAlgorithm] = useState<RoutingAlgorithm>('quality_aware');

  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'warning' } | null>(null);

  const notify = (msg: string, type: 'success' | 'warning' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Primary Data Fetcher
  const fetchData = useCallback(async () => {
    try {
      const [
        statusRes,
        topoRes,
        metricsRes,
        eventsRes,
        compRes,
        weightsRes
      ] = await Promise.all([
        api.getStatus(),
        api.getTopology(),
        api.getMetrics(),
        api.getEvents(50),
        api.getComparison(source, destination),
        api.getWeights()
      ]);

      setStatus(statusRes);
      setTopology(topoRes);
      setMetrics(metricsRes);
      setEvents(eventsRes);
      setComparison(compRes);
      setWeights(weightsRes);

      // Set active route depending on selected algorithm
      if (activeAlgorithm === 'shortest_path') {
        setActiveRoute(compRes.baseline_route);
      } else {
        setActiveRoute(compRes.quality_aware_route);
      }

      setBackendError(null);
    } catch (err: any) {
      console.warn('Backend fetch failed:', err);
      setBackendError('Backend API unreachable at http://127.0.0.1:8000. Is FastAPI server running?');
    }
  }, [source, destination, activeAlgorithm]);

  // Initial Load and Polling Loop (every 3 seconds)
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle Endpoint selection
  const handleSelectEndpoints = (src: string, dst: string) => {
    setSource(src);
    setDestination(dst);
  };

  // Handle Algorithm Switch
  const handleSelectAlgorithm = (algo: RoutingAlgorithm) => {
    setActiveAlgorithm(algo);
  };

  // Link Action: Fail
  const handleFailLink = async (linkId: string) => {
    setLoading(true);
    try {
      const res = await api.failLink(linkId);
      notify(`Simulated Failure: Link ${linkId} is DOWN. Self-healing triggered!`, 'warning');
      await fetchData();
    } catch (err: any) {
      notify(`Failure failed: ${err.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Link Action: Restore
  const handleRestoreLink = async (linkId: string) => {
    setLoading(true);
    try {
      await api.restoreLink(linkId);
      notify(`Link ${linkId} RESTORED to healthy UP status.`);
      await fetchData();
    } catch (err: any) {
      notify(`Restore failed: ${err.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Link Action: Update Metrics
  const handleUpdateMetrics = async (linkId: string, updates: LinkMetricsUpdate) => {
    setLoading(true);
    try {
      await api.updateLinkMetrics(linkId, updates);
      notify(`Metrics updated for ${linkId}. Quality route re-evaluated.`);
      await fetchData();
    } catch (err: any) {
      notify(`Update failed: ${err.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Demo Action: Reset Scenario
  const handleReset = async () => {
    if (!window.confirm('Reset network topology, link metrics, and routes back to default?')) return;
    setLoading(true);
    try {
      await api.resetSimulation();
      setSource('H1');
      setDestination('H4');
      notify('Simulation scenario restored to clean baseline.');
      await fetchData();
    } catch (err: any) {
      notify(`Reset failed: ${err.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Demo Action: Inject Congestion Preset
  const handleInjectCongestion = async () => {
    setLoading(true);
    try {
      await api.injectCongestion();
      notify('Congestion injected on link L_S1_S3! Quality-Aware rerouted via S2.', 'warning');
      await fetchData();
    } catch (err: any) {
      notify(`Congestion injection failed: ${err.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Weights Update
  const handleUpdateWeights = async (newWeights: WeightConfig) => {
    setLoading(true);
    try {
      const res = await api.updateWeights(newWeights);
      setWeights(res);
      notify('Routing weights updated successfully.');
      await fetchData();
    } catch (err: any) {
      notify(`Failed to update weights: ${err.message}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Mode Switch
  const handleSwitchMode = async (mode: 'simulation' | 'sdn') => {
    try {
      await api.switchMode(mode);
      notify(`Switched operating mode to ${mode.toUpperCase()}.`);
      await fetchData();
    } catch (err: any) {
      notify(`Mode switch failed: ${err.message}`, 'warning');
    }
  };

  // Clear Events
  const handleClearEvents = async () => {
    try {
      await api.clearEvents();
      setEvents([]);
      notify('Event history cleared.');
    } catch (err: any) {
      notify(`Failed to clear events: ${err.message}`, 'warning');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        status={status}
        activeAlgorithm={activeAlgorithm}
        onSelectAlgorithm={handleSelectAlgorithm}
        onReset={handleReset}
        onInjectCongestion={handleInjectCongestion}
        onSwitchMode={handleSwitchMode}
        source={source}
        destination={destination}
        onSelectEndpoints={handleSelectEndpoints}
        loading={loading}
      />

      {/* Backend Error Alert Banner */}
      {backendError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          borderBottom: '1px solid #ef4444',
          color: '#f87171',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} />
            <span>{backendError}</span>
          </div>
          <button onClick={fetchData} className="btn btn-secondary btn-sm">
            <RefreshCw size={12} />
            Retry Connection
          </button>
        </div>
      )}

      {/* Floating Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 100,
          background: notification.type === 'warning' ? '#78350f' : '#064e3b',
          border: `1px solid ${notification.type === 'warning' ? '#f59e0b' : '#10b981'}`,
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          fontSize: '0.85rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {notification.msg}
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <nav style={{
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '0 1.5rem'
      }}>
        <div style={{
          maxWidth: 1440,
          margin: '0 auto',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'overview' ? '#38bdf8' : '#94a3b8',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Activity size={15} />
            Overview Dashboard
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'topology' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'topology' ? '#38bdf8' : '#94a3b8',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Network size={15} />
            Network Topology & Control
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'comparison' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'comparison' ? '#38bdf8' : '#94a3b8',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <GitCompare size={15} />
            Routing Analysis & Proof
          </button>

          <button
            onClick={() => setActiveTab('events')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'events' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'events' ? '#38bdf8' : '#94a3b8',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <History size={15} />
            Operational Events ({events.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'settings' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'settings' ? '#38bdf8' : '#94a3b8',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Sliders size={15} />
            Weights & SDN Settings
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Metric Summary Cards always visible on overview and topology */}
        {(activeTab === 'overview' || activeTab === 'topology') && (
          <MetricCards
            metrics={metrics}
            status={status}
            activeRoute={activeRoute}
          />
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <>
            <TopologyView
              nodes={topology.nodes}
              links={topology.links}
              activeRoute={activeRoute}
              onFailLink={handleFailLink}
              onRestoreLink={handleRestoreLink}
              onUpdateMetrics={handleUpdateMetrics}
            />
            <RoutingComparison comparison={comparison} />
            <PerformanceCharts
              history={metrics?.history ?? []}
              comparison={comparison}
            />
            <EventLogView
              events={events}
              onClearEvents={handleClearEvents}
            />
          </>
        )}

        {/* Tab 2: Full Topology */}
        {activeTab === 'topology' && (
          <>
            <TopologyView
              nodes={topology.nodes}
              links={topology.links}
              activeRoute={activeRoute}
              onFailLink={handleFailLink}
              onRestoreLink={handleRestoreLink}
              onUpdateMetrics={handleUpdateMetrics}
            />
            <PerformanceCharts
              history={metrics?.history ?? []}
              comparison={comparison}
            />
          </>
        )}

        {/* Tab 3: Routing Comparison */}
        {activeTab === 'comparison' && (
          <>
            <RoutingComparison comparison={comparison} />
            <PerformanceCharts
              history={metrics?.history ?? []}
              comparison={comparison}
            />
          </>
        )}

        {/* Tab 4: Operational Events */}
        {activeTab === 'events' && (
          <EventLogView
            events={events}
            onClearEvents={handleClearEvents}
          />
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <SettingsView
            weights={weights}
            status={status}
            onUpdateWeights={handleUpdateWeights}
            onSwitchMode={handleSwitchMode}
          />
        )}
      </main>
    </div>
  );
};

export default App;
