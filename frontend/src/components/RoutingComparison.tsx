import React from 'react';
import { 
  GitCompare, 
  Zap, 
  Compass, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import type { ComparisonResult } from '../types';

interface RoutingComparisonProps {
  comparison: ComparisonResult | null;
}

export const RoutingComparison: React.FC<RoutingComparisonProps> = ({ comparison }) => {
  if (!comparison) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
        Loading routing comparison...
      </div>
    );
  }

  const { baseline_route, quality_aware_route, paths_differ, cost_difference, explanation } = comparison;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <GitCompare size={18} color="#06b6d4" />
          <span>Routing Strategy Comparison (Baseline Dijkstra vs. Quality-Aware)</span>
        </div>
        <div>
          {paths_differ ? (
            <span className="badge badge-warning">
              Paths Differ: Quality-Aware Diverged to Avoid Degradation
            </span>
          ) : (
            <span className="badge badge-success">
              Paths Identical: Lowest Cost Path is Also Healthy
            </span>
          )}
        </div>
      </div>

      {/* Side-by-Side Algorithm Cards */}
      <div className="grid-cols-2" style={{ marginBottom: '1.25rem' }}>
        {/* Baseline Dijkstra */}
        <div style={{
          background: '#0f172a',
          borderRadius: 10,
          border: '1px solid #1e293b',
          padding: '1rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Compass size={16} />
              Baseline Dijkstra Routing
            </span>
            <span className="badge" style={{ background: '#1e293b', color: '#94a3b8' }}>
              Hop Count Metric
            </span>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Computed Active Path:</div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#f8fafc',
              margin: '0.25rem 0',
              fontFamily: 'monospace'
            }}>
              {baseline_route.status === 'found' ? (
                baseline_route.path.join(' → ')
              ) : (
                <span style={{ color: '#ef4444' }}>NO PATH (Partitioned)</span>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginTop: '0.75rem',
            background: '#131c31',
            padding: '0.5rem',
            borderRadius: 8
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Hop Count</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {baseline_route.hop_count}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Admin Cost</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {baseline_route.total_cost.toFixed(1)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Compute Time</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
                {baseline_route.computation_time_ms.toFixed(2)}ms
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.6rem' }}>
            Routes strictly based on configured link hop cost. Ignores packet loss, latency, and utilization.
          </p>
        </div>

        {/* Quality-Aware Proposed */}
        <div style={{
          background: '#0f172a',
          borderRadius: 10,
          border: '1px solid rgba(6, 182, 212, 0.4)',
          padding: '1rem',
          position: 'relative',
          boxShadow: '0 0 16px rgba(6, 182, 212, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} />
              Proposed Quality-Aware Routing
            </span>
            <span className="badge badge-cyan">
              Composite Metric
            </span>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Computed Active Path:</div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#38bdf8',
              margin: '0.25rem 0',
              fontFamily: 'monospace'
            }}>
              {quality_aware_route.status === 'found' ? (
                quality_aware_route.path.join(' → ')
              ) : (
                <span style={{ color: '#ef4444' }}>NO PATH (Partitioned)</span>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginTop: '0.75rem',
            background: '#131c31',
            padding: '0.5rem',
            borderRadius: 8
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Hop Count</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {quality_aware_route.hop_count}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Composite Cost</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
                {quality_aware_route.total_cost.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Compute Time</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
                {quality_aware_route.computation_time_ms.toFixed(2)}ms
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.6rem' }}>
            Dynamically incorporates normalized latency, packet loss, and link utilization to maximize service quality.
          </p>
        </div>
      </div>

      {/* Natural Language Explanation Box */}
      <div style={{
        background: '#0c1322',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        fontSize: '0.825rem',
        color: '#e2e8f0'
      }}>
        <HelpCircle size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ color: '#38bdf8' }}>Engineering Explanation: </strong>
          {explanation}
        </div>
      </div>

      {/* Per-Link Telemetry Breakdown for Active Path */}
      {quality_aware_route.status === 'found' && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
            Active Path Hop Breakdown (Per-Link Metrics)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Link ID</th>
                  <th style={{ padding: '0.5rem' }}>Latency</th>
                  <th style={{ padding: '0.5rem' }}>Packet Loss</th>
                  <th style={{ padding: '0.5rem' }}>Utilization</th>
                  <th style={{ padding: '0.5rem' }}>Calculated Edge Cost</th>
                </tr>
              </thead>
              <tbody>
                {quality_aware_route.links.map((linkId) => {
                  const m = quality_aware_route.per_link_metrics[linkId] || {};
                  return (
                    <tr key={linkId} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600, color: '#38bdf8' }}>{linkId}</td>
                      <td style={{ padding: '0.5rem' }}>{m.latency_ms ?? 0} ms</td>
                      <td style={{ padding: '0.5rem' }}>{m.packet_loss_percent ?? 0} %</td>
                      <td style={{ padding: '0.5rem' }}>{m.utilization_percent ?? 0} %</td>
                      <td style={{ padding: '0.5rem', fontWeight: 600, color: '#34d399' }}>
                        {quality_aware_route.per_link_costs[linkId]?.toFixed(3) ?? '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
