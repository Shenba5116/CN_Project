import React, { useState } from 'react';
import { 
  Server, 
  Laptop, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  RotateCcw,
  Info,
  Zap
} from 'lucide-react';
import type { LinkModel, NodeModel, RouteResult, LinkMetricsUpdate } from '../types';

interface TopologyViewProps {
  nodes: NodeModel[];
  links: LinkModel[];
  activeRoute: RouteResult | null;
  onFailLink: (linkId: string) => void;
  onRestoreLink: (linkId: string) => void;
  onUpdateMetrics: (linkId: string, updates: LinkMetricsUpdate) => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  nodes,
  links,
  activeRoute,
  onFailLink,
  onRestoreLink,
  onUpdateMetrics
}) => {
  const [selectedLink, setSelectedLink] = useState<LinkModel | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeModel | null>(null);

  // Edit metrics state for selected link
  const [editLatency, setEditLatency] = useState<number>(5);
  const [editLoss, setEditLoss] = useState<number>(0);
  const [editUtil, setEditUtil] = useState<number>(15);

  const handleSelectLink = (link: LinkModel) => {
    setSelectedLink(link);
    setSelectedNode(null);
    setEditLatency(link.latency_ms);
    setEditLoss(link.packet_loss_percent);
    setEditUtil(link.utilization_percent);
  };

  const handleSelectNode = (node: NodeModel) => {
    setSelectedNode(node);
    setSelectedLink(null);
  };

  const handleApplyMetrics = () => {
    if (!selectedLink) return;
    onUpdateMetrics(selectedLink.id, {
      latency_ms: editLatency,
      packet_loss_percent: editLoss,
      utilization_percent: editUtil
    });
  };

  // Check if link is in active route
  const isLinkInActiveRoute = (linkId: string): boolean => {
    return activeRoute?.links?.includes(linkId) ?? false;
  };

  // Node position map
  const nodeMap = new Map<string, NodeModel>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  return (
    <div className="card" style={{ padding: '1rem', position: 'relative' }}>
      <div className="card-header" style={{ marginBottom: '0.5rem' }}>
        <div className="card-title">
          <Server size={18} color="#38bdf8" />
          <span>Interactive Network Topology (3-Switch Triangle Core & Hosts)</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Click any node or link to inspect & control
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
        flexWrap: 'wrap',
        minHeight: 460
      }}>
        {/* Topology SVG Canvas */}
        <div style={{
          flex: '1 1 560px',
          background: 'radial-gradient(circle at 50% 50%, #17233f 0%, #0c1322 100%)',
          borderRadius: 10,
          border: '1px solid #1e293b',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg
            viewBox="0 0 720 480"
            style={{ width: '100%', height: '100%', maxHeight: 500 }}
          >
            <defs>
              {/* Glow filter for active route */}
              <filter id="active-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* 1. Render Links (Edges) */}
            {links.map((link) => {
              const srcNode = nodeMap.get(link.source);
              const tgtNode = nodeMap.get(link.target);
              if (!srcNode || !tgtNode) return null;

              const isDown = link.status === 'down';
              const isDegraded = link.status === 'degraded';
              const isActive = isLinkInActiveRoute(link.id);
              const isSelected = selectedLink?.id === link.id;

              // Color determination
              let strokeColor = '#10b981'; // Green (UP)
              if (isDown) strokeColor = '#ef4444'; // Red (DOWN)
              else if (isDegraded) strokeColor = '#f59e0b'; // Amber (DEGRADED)

              const midX = (srcNode.x + tgtNode.x) / 2;
              const midY = (srcNode.y + tgtNode.y) / 2;

              return (
                <g 
                  key={link.id} 
                  onClick={() => handleSelectLink(link)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Invisible wide hit area for easy clicking */}
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke="transparent"
                    strokeWidth={20}
                  />

                  {/* Base Line */}
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={strokeColor}
                    strokeWidth={link.is_core ? (isSelected ? 5 : 3.5) : (isSelected ? 4 : 2)}
                    strokeDasharray={isDown ? '6,6' : undefined}
                    opacity={isDown ? 0.6 : 0.85}
                  />

                  {/* Active Route Overlay with animated glowing flow */}
                  {isActive && !isDown && (
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={tgtNode.x}
                      y2={tgtNode.y}
                      stroke="#06b6d4"
                      strokeWidth={link.is_core ? 5 : 4}
                      className="active-route-line"
                      filter="url(#active-glow)"
                    />
                  )}

                  {/* Link Label Tag (Latency / Loss on hover or core links) */}
                  {link.is_core && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-38"
                        y="-12"
                        width="76"
                        height="24"
                        rx="6"
                        fill="#0f172a"
                        stroke={isSelected ? '#38bdf8' : isDown ? '#ef4444' : isDegraded ? '#f59e0b' : '#334155'}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fontSize="9.5"
                        fill={isDown ? '#f87171' : isDegraded ? '#fbbf24' : '#94a3b8'}
                        fontWeight="600"
                        fontFamily="monospace"
                      >
                        {isDown ? 'OFFLINE' : `${link.latency_ms}ms|${link.packet_loss_percent}%`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* 2. Render Nodes (Switches & Hosts) */}
            {nodes.map((node) => {
              const isSwitch = node.type === 'switch';
              const isSelected = selectedNode?.id === node.id;
              const isInPath = activeRoute?.path?.includes(node.id) ?? false;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleSelectNode(node)}
                  style={{ cursor: 'pointer' }}
                >
                  {isSwitch ? (
                    // Switch Node: Hexagonal / Rounded Card
                    <>
                      {/* Selection / Active ring */}
                      {(isInPath || isSelected) && (
                        <circle
                          r={30}
                          fill="none"
                          stroke={isInPath ? '#06b6d4' : '#38bdf8'}
                          strokeWidth={isSelected ? 3 : 2}
                          strokeDasharray={isInPath ? '4,4' : undefined}
                          className={isInPath ? 'pulse-animation' : undefined}
                        />
                      )}
                      <rect
                        x="-24"
                        y="-24"
                        width="48"
                        height="48"
                        rx="10"
                        fill="#131c31"
                        stroke={isInPath ? '#06b6d4' : '#3b82f6'}
                        strokeWidth={2}
                      />
                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="800"
                        fill="#f8fafc"
                      >
                        {node.id}
                      </text>
                      <text
                        x="0"
                        y="12"
                        textAnchor="middle"
                        fontSize="8.5"
                        fill="#94a3b8"
                        fontWeight="600"
                      >
                        SW
                      </text>
                    </>
                  ) : (
                    // Host Node: Circular Endpoint
                    <>
                      {isInPath && (
                        <circle
                          r={22}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          className="pulse-animation"
                        />
                      )}
                      <circle
                        r={16}
                        fill="#0f172a"
                        stroke={isInPath ? '#06b6d4' : isSelected ? '#38bdf8' : '#64748b'}
                        strokeWidth={2}
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill={isInPath ? '#38bdf8' : '#e2e8f0'}
                      >
                        {node.id}
                      </text>
                      <text
                        x="0"
                        y="28"
                        textAnchor="middle"
                        fontSize="9"
                        fill="#94a3b8"
                        fontWeight="500"
                      >
                        {node.ip}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Topology Legend Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            border: '1px solid #1e293b',
            borderRadius: 8,
            padding: '0.4rem 0.75rem',
            display: 'flex',
            gap: '1rem',
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 10, height: 3, background: '#10b981', borderRadius: 2 }} />
              <span>Healthy</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 10, height: 3, background: '#f59e0b', borderRadius: 2 }} />
              <span>Degraded</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 10, height: 3, background: '#ef4444', borderBottom: '1px dashed #ef4444' }} />
              <span>Down / Failed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: 10, height: 3, background: '#06b6d4', boxShadow: '0 0 4px #06b6d4' }} />
              <span>Active Route</span>
            </div>
          </div>
        </div>

        {/* Inspector & Link Control Panel */}
        <div style={{
          flex: '1 1 280px',
          maxWidth: 360,
          background: '#0f172a',
          borderRadius: 10,
          border: '1px solid #1e293b',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {selectedLink ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Link: {selectedLink.id}
                </span>
                <span className={`badge ${selectedLink.status === 'up' ? 'badge-success' : selectedLink.status === 'down' ? 'badge-error' : 'badge-warning'}`}>
                  {selectedLink.status}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Connects <strong>{selectedLink.source}</strong> &larr;&rarr; <strong>{selectedLink.target}</strong>
                {selectedLink.is_core ? ' (Core Triangle Link)' : ' (Access Link)'}
              </p>

              {/* Action Buttons: Fail vs Restore */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                {selectedLink.status !== 'down' ? (
                  <button
                    onClick={() => onFailLink(selectedLink.id)}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                  >
                    <XCircle size={14} />
                    Fail Link
                  </button>
                ) : (
                  <button
                    onClick={() => onRestoreLink(selectedLink.id)}
                    className="btn btn-success btn-sm"
                    style={{ flex: 1 }}
                  >
                    <CheckCircle2 size={14} />
                    Restore Link
                  </button>
                )}
              </div>

              {/* Metrics Adjustment Controls */}
              <div style={{
                marginTop: '0.5rem',
                borderTop: '1px solid #1e293b',
                paddingTop: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>
                  Simulated Link Metrics
                </span>

                {/* Latency Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>Latency (ms):</span>
                    <strong style={{ color: '#f8fafc' }}>{editLatency} ms</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="150"
                    value={editLatency}
                    onChange={(e) => setEditLatency(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0284c7' }}
                  />
                </div>

                {/* Packet Loss Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>Packet Loss (%):</span>
                    <strong style={{ color: '#f8fafc' }}>{editLoss}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={editLoss}
                    onChange={(e) => setEditLoss(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }}
                  />
                </div>

                {/* Utilization Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>Utilization (%):</span>
                    <strong style={{ color: '#f8fafc' }}>{editUtil}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editUtil}
                    onChange={(e) => setEditUtil(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#8b5cf6' }}
                  />
                </div>

                <button
                  onClick={handleApplyMetrics}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.25rem' }}
                >
                  <Sliders size={13} />
                  Apply Metrics Update
                </button>
              </div>
            </>
          ) : selectedNode ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  Node: {selectedNode.name}
                </span>
                <span className="badge badge-cyan">{selectedNode.type}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                <div><strong>ID:</strong> {selectedNode.id}</div>
                {selectedNode.dpid && <div><strong>DPID:</strong> {selectedNode.dpid}</div>}
                {selectedNode.ip && <div><strong>IP Address:</strong> {selectedNode.ip}</div>}
                {selectedNode.mac && <div><strong>MAC Address:</strong> {selectedNode.mac}</div>}
                <div>
                  <strong>Active in Route:</strong> {activeRoute?.path?.includes(selectedNode.id) ? (
                    <span style={{ color: '#34d399', fontWeight: 600 }}> Yes</span>
                  ) : (
                    <span style={{ color: '#64748b' }}> No</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center', 
              color: '#64748b',
              padding: '1rem'
            }}>
              <Info size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>
                Select any link or switch on the diagram to test failure, adjust latency, or inspect properties.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
