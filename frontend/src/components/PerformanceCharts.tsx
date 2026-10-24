import React from 'react';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';
import type { ComparisonResult, TelemetrySnapshot } from '../types';

interface PerformanceChartsProps {
  history: TelemetrySnapshot[];
  comparison: ComparisonResult | null;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  history,
  comparison
}) => {
  const data = history.length > 0 ? history : [
    { time: '00:00', avg_latency: 5, avg_loss: 0, avg_utilization: 10, health_score: 100 }
  ];

  // SVG dimensions for Line Chart
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 35;

  const maxLatency = Math.max(...data.map(d => d.avg_latency), 40);
  const minLatency = 0;

  // Generate path string for Latency line
  const points = data.map((d, idx) => {
    const x = padding + (idx / Math.max(1, data.length - 1)) * (svgWidth - 2 * padding);
    const y = svgHeight - padding - ((d.avg_latency - minLatency) / (maxLatency - minLatency || 1)) * (svgHeight - 2 * padding);
    return `${x},${y}`;
  });
  const pathD = points.length > 1 ? `M ${points.join(' L ')}` : '';

  // Generate path string for Health Score line
  const healthPoints = data.map((d, idx) => {
    const x = padding + (idx / Math.max(1, data.length - 1)) * (svgWidth - 2 * padding);
    const y = svgHeight - padding - (d.health_score / 100) * (svgHeight - 2 * padding);
    return `${x},${y}`;
  });
  const healthPathD = healthPoints.length > 1 ? `M ${healthPoints.join(' L ')}` : '';

  return (
    <div className="grid-cols-2">
      {/* 1. Rolling Telemetry Line Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={18} color="#38bdf8" />
            <span>Real-Time Network Telemetry Trend</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
              Latency (ms)
            </span>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              Health Score (%)
            </span>
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', maxHeight: 200 }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding + ratio * (svgHeight - 2 * padding);
              return (
                <line
                  key={ratio}
                  x1={padding}
                  y1={y}
                  x2={svgWidth - padding}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Health line (green) */}
            {healthPathD && (
              <path
                d={healthPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                opacity="0.8"
              />
            )}

            {/* Latency line (cyan) */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
              />
            )}

            {/* Dots */}
            {data.map((d, idx) => {
              const x = padding + (idx / Math.max(1, data.length - 1)) * (svgWidth - 2 * padding);
              const y = svgHeight - padding - ((d.avg_latency - minLatency) / (maxLatency - minLatency || 1)) * (svgHeight - 2 * padding);
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#06b6d4"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', padding: '0 0.5rem' }}>
          <span>{data[0]?.time ?? 'Start'}</span>
          <span>Rolling Live Snapshots</span>
          <span>{data[data.length - 1]?.time ?? 'Now'}</span>
        </div>
      </div>

      {/* 2. Algorithm Metric Comparison Bar Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BarChart2 size={18} color="#34d399" />
            <span>Routing Metric Comparison Under Current Scenario</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#94a3b8' }}>Dijkstra Baseline</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Quality-Aware</span>
          </div>
        </div>

        {comparison ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0.5rem 0' }}>
            {/* Metric 1: Hop Count */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#cbd5e1' }}>Hop Count</span>
                <span style={{ color: '#94a3b8' }}>
                  Baseline: <strong>{comparison.baseline_route.hop_count}</strong> | Quality: <strong style={{ color: '#38bdf8' }}>{comparison.quality_aware_route.hop_count}</strong>
                </span>
              </div>
              <div style={{ height: 10, background: '#1e293b', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${Math.min(100, comparison.baseline_route.hop_count * 20)}%`, background: '#64748b' }} />
                <div style={{ width: `${Math.min(100, comparison.quality_aware_route.hop_count * 20)}%`, background: '#0284c7' }} />
              </div>
            </div>

            {/* Metric 2: Path Cost */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#cbd5e1' }}>Calculated Routing Cost</span>
                <span style={{ color: '#94a3b8' }}>
                  Baseline: <strong>{comparison.baseline_route.total_cost.toFixed(2)}</strong> | Quality: <strong style={{ color: '#34d399' }}>{comparison.quality_aware_route.total_cost.toFixed(2)}</strong>
                </span>
              </div>
              <div style={{ height: 10, background: '#1e293b', borderRadius: 5, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${Math.min(100, comparison.baseline_route.total_cost * 18)}%`, background: '#64748b' }} />
                <div style={{ width: `${Math.min(100, comparison.quality_aware_route.total_cost * 18)}%`, background: '#10b981' }} />
              </div>
            </div>

            {/* Metric 3: Software Recalculation Time */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#cbd5e1' }}>Route Computation Time</span>
                <span style={{ color: '#38bdf8' }}>
                  {comparison.quality_aware_route.computation_time_ms.toFixed(2)} ms (Monotonic clock benchmark)
                </span>
              </div>
              <div style={{ height: 10, background: '#1e293b', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: '25%', background: '#38bdf8' }} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem', fontSize: '0.8rem' }}>
            No comparison data available.
          </div>
        )}
      </div>
    </div>
  );
};
