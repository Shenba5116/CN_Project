import React from 'react';
import { 
  Activity, 
  RotateCcw, 
  Flame, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Server, 
  Zap, 
  Sliders
} from 'lucide-react';
import type { RoutingAlgorithm, SystemStatus } from '../types';

interface HeaderProps {
  status: SystemStatus | null;
  activeAlgorithm: RoutingAlgorithm;
  onSelectAlgorithm: (algo: RoutingAlgorithm) => void;
  onReset: () => void;
  onInjectCongestion: () => void;
  onSwitchMode: (mode: 'simulation' | 'sdn') => void;
  source: string;
  destination: string;
  onSelectEndpoints: (src: string, dst: string) => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeAlgorithm,
  onSelectAlgorithm,
  onReset,
  onInjectCongestion,
  onSwitchMode,
  source,
  destination,
  onSelectEndpoints,
  loading
}) => {
  const hosts = ['H1', 'H2', 'H3', 'H4'];

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1e293b',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.5rem',
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)'
          }}>
            <Activity color="#fff" size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                NetResQ
              </span>
              <span className={`badge ${status?.backend_online ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.7rem' }}>
                {status?.backend_online ? <Wifi size={12} /> : <WifiOff size={12} />}
                {status?.backend_online ? 'BACKEND LIVE' : 'DISCONNECTED'}
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                <Server size={12} />
                {status?.mode === 'sdn' ? 'REAL SDN (RYU)' : 'SIMULATION MODE'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              Adaptive Self-Healing Network | Quality-Aware Routing Engine
            </p>
          </div>
        </div>

        {/* Route Selector & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Source -> Destination Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#131c31',
            padding: '0.35rem 0.65rem',
            borderRadius: 8,
            border: '1px solid #1e293b'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Route:</span>
            <select
              value={source}
              onChange={(e) => onSelectEndpoints(e.target.value, destination)}
              style={{
                background: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                borderRadius: 4,
                padding: '0.2rem 0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {hosts.map((h) => (
                <option key={`src-${h}`} value={h}>{h}</option>
              ))}
            </select>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>&rarr;</span>
            <select
              value={destination}
              onChange={(e) => onSelectEndpoints(source, e.target.value)}
              style={{
                background: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                borderRadius: 4,
                padding: '0.2rem 0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {hosts.map((h) => (
                <option key={`dst-${h}`} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Algorithm Toggle */}
          <div style={{
            display: 'flex',
            background: '#131c31',
            borderRadius: 8,
            padding: '2px',
            border: '1px solid #1e293b'
          }}>
            <button
              onClick={() => onSelectAlgorithm('quality_aware')}
              className="btn btn-sm"
              style={{
                background: activeAlgorithm === 'quality_aware' ? '#0284c7' : 'transparent',
                color: activeAlgorithm === 'quality_aware' ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: 6
              }}
              title="Normalized composite quality cost (Latency, Loss, Utilization)"
            >
              <Zap size={13} />
              Quality-Aware
            </button>
            <button
              onClick={() => onSelectAlgorithm('shortest_path')}
              className="btn btn-sm"
              style={{
                background: activeAlgorithm === 'shortest_path' ? '#0284c7' : 'transparent',
                color: activeAlgorithm === 'shortest_path' ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: 6
              }}
              title="Standard Dijkstra shortest path (hop count / admin cost)"
            >
              Baseline Dijkstra
            </button>
          </div>

          {/* Demo Congestion Preset Action */}
          <button
            onClick={onInjectCongestion}
            disabled={loading}
            className="btn btn-warning btn-sm"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
            title="Inject 65ms latency and 18% packet loss on direct link L_S1_S3 to test rerouting"
          >
            <Flame size={14} />
            Demo Congestion
          </button>

          {/* Reset Demo */}
          <button
            onClick={onReset}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            title="Restore baseline topology and healthy link state"
          >
            <RotateCcw size={14} />
            Reset Scenario
          </button>
        </div>
      </div>
    </header>
  );
};
