import React from 'react';
import { 
  Server, 
  Share2, 
  Clock, 
  Activity, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  TrendingDown
} from 'lucide-react';
import type { MetricsSummary, RouteResult, SystemStatus } from '../types';

interface MetricCardsProps {
  metrics: MetricsSummary | null;
  status: SystemStatus | null;
  activeRoute: RouteResult | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  status,
  activeRoute
}) => {
  const switchesCount = status?.switches_count ?? 3;
  const healthyLinks = metrics?.healthy_links_count ?? 7;
  const failedLinks = metrics?.failed_links_count ?? 0;
  const degradedLinks = metrics?.degraded_links_count ?? 0;
  const avgLatency = metrics?.average_latency_ms ?? 5.5;
  const healthScore = metrics?.network_health_score ?? 100;
  const computationTime = activeRoute?.computation_time_ms ?? 1.1;

  return (
    <div className="grid-cols-4">
      {/* 1. Switches Online */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
            Switches Online
          </span>
          <div style={{
            background: 'rgba(56, 189, 248, 0.15)',
            padding: '0.35rem',
            borderRadius: 8,
            color: '#38bdf8'
          }}>
            <Server size={18} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            {switchesCount}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
            Triangle Core Active
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
          OpenFlow 1.3 DPIDs: S1, S2, S3
        </div>
      </div>

      {/* 2. Link Health */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
            Link Health Status
          </span>
          <div style={{
            background: failedLinks > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            padding: '0.35rem',
            borderRadius: 8,
            color: failedLinks > 0 ? '#f87171' : '#34d399'
          }}>
            <Share2 size={18} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            {healthyLinks}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            / {metrics?.total_links ?? 7} Links UP
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', gap: '0.5rem' }}>
          {failedLinks > 0 ? (
            <span style={{ color: '#ef4444', fontWeight: 600 }}>
              {failedLinks} Link(s) DOWN
            </span>
          ) : (
            <span style={{ color: '#10b981', fontWeight: 500 }}>
              0 Link Failures
            </span>
          )}
          {degradedLinks > 0 && (
            <span style={{ color: '#f59e0b', fontWeight: 500 }}>
              • {degradedLinks} Degraded
            </span>
          )}
        </div>
      </div>

      {/* 3. Average Latency & Telemetry */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
            Average Link Latency
          </span>
          <div style={{
            background: 'rgba(139, 92, 246, 0.15)',
            padding: '0.35rem',
            borderRadius: 8,
            color: '#a78bfa'
          }}>
            <Activity size={18} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>
            {avgLatency}
          </span>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>ms</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
          Packet Loss: {metrics?.average_packet_loss_percent ?? 0}% • Util: {metrics?.average_utilization_percent ?? 12}%
        </div>
      </div>

      {/* 4. Health Score & Failover Time */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
            Network Health & Recalc
          </span>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            padding: '0.35rem',
            borderRadius: 8,
            color: '#38bdf8'
          }}>
            <ShieldCheck size={18} />
          </div>
        </div>
        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ 
            fontSize: '1.75rem', 
            fontWeight: 700, 
            color: healthScore > 80 ? '#34d399' : healthScore > 50 ? '#fbbf24' : '#f87171' 
          }}>
            {healthScore}%
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Health Score</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.25rem' }}>
          Route Recalc: {computationTime.toFixed(2)}ms (software benchmark)
        </div>
      </div>
    </div>
  );
};
