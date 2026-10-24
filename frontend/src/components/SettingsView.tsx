import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  Server, 
  Info, 
  ExternalLink,
  Terminal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { WeightConfig, SystemStatus } from '../types';

interface SettingsViewProps {
  weights: WeightConfig | null;
  status: SystemStatus | null;
  onUpdateWeights: (newWeights: WeightConfig) => void;
  onSwitchMode: (mode: 'simulation' | 'sdn') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  weights,
  status,
  onUpdateWeights,
  onSwitchMode
}) => {
  const [costWeight, setCostWeight] = useState<number>(1.0);
  const [latWeight, setLatWeight] = useState<number>(1.0);
  const [lossWeight, setLossWeight] = useState<number>(2.0);
  const [utilWeight, setUtilWeight] = useState<number>(1.5);
  const [latRef, setLatRef] = useState<number>(50.0);
  const [savedMsg, setSavedMsg] = useState<string>('');

  useEffect(() => {
    if (weights) {
      setCostWeight(weights.configured_cost_weight);
      setLatWeight(weights.latency_weight);
      setLossWeight(weights.loss_weight);
      setUtilWeight(weights.utilization_weight);
      setLatRef(weights.latency_reference_ms);
    }
  }, [weights]);

  const handleSave = () => {
    onUpdateWeights({
      configured_cost_weight: costWeight,
      latency_weight: latWeight,
      loss_weight: lossWeight,
      utilization_weight: utilWeight,
      latency_reference_ms: latRef
    });
    setSavedMsg('Weights saved and routing recalculated!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleResetDefaults = () => {
    setCostWeight(1.0);
    setLatWeight(1.0);
    setLossWeight(2.0);
    setUtilWeight(1.5);
    setLatRef(50.0);
    onUpdateWeights({
      configured_cost_weight: 1.0,
      latency_weight: 1.0,
      loss_weight: 2.0,
      utilization_weight: 1.5,
      latency_reference_ms: 50.0
    });
    setSavedMsg('Restored default routing coefficients.');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Quality-Aware Routing Algorithm Weights */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Sliders size={18} color="#38bdf8" />
            <span>Quality-Aware Edge-Cost Weight Configuration</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {savedMsg && (
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                {savedMsg}
              </span>
            )}
            <button onClick={handleResetDefaults} className="btn btn-secondary btn-sm">
              <RotateCcw size={13} />
              Reset Defaults
            </button>
            <button onClick={handleSave} className="btn btn-primary btn-sm">
              <Save size={13} />
              Save Weights
            </button>
          </div>
        </div>

        {/* Formula Representation Box */}
        <div style={{
          background: '#0a0f1d',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          color: '#38bdf8',
          overflowX: 'auto'
        }}>
          <div><strong>Cost Formula:</strong></div>
          <div style={{ marginTop: '0.25rem', color: '#f8fafc' }}>
            link_cost = ({costWeight.toFixed(1)} &times; C_admin) + ({latWeight.toFixed(1)} &times; [Lat / {latRef}ms]) + ({lossWeight.toFixed(1)} &times; [Loss% / 100]) + ({utilWeight.toFixed(1)} &times; [Util% / 100])
          </div>
        </div>

        <div className="grid-cols-2">
          {/* Configured Cost Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span style={{ color: '#94a3b8' }}>Configured Administrative Cost Weight (w_cost):</span>
              <strong style={{ color: '#f8fafc' }}>{costWeight.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={costWeight}
              onChange={(e) => setCostWeight(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7' }}
            />
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              Base weight given to configured hop cost.
            </p>
          </div>

          {/* Latency Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span style={{ color: '#94a3b8' }}>Latency Weight (w_latency):</span>
              <strong style={{ color: '#f8fafc' }}>{latWeight.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={latWeight}
              onChange={(e) => setLatWeight(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              Penalizes paths with high transmission and queuing delays.
            </p>
          </div>

          {/* Packet Loss Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span style={{ color: '#94a3b8' }}>Packet Loss Weight (w_loss):</span>
              <strong style={{ color: '#f8fafc' }}>{lossWeight.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={lossWeight}
              onChange={(e) => setLossWeight(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              Heavily penalizes drop-prone links to prevent TCP retransmissions.
            </p>
          </div>

          {/* Utilization Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span style={{ color: '#94a3b8' }}>Utilization Weight (w_util):</span>
              <strong style={{ color: '#f8fafc' }}>{utilWeight.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={utilWeight}
              onChange={(e) => setUtilWeight(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#8b5cf6' }}
            />
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              Prevents bottlenecks by routing away from saturated links.
            </p>
          </div>

          {/* Latency Reference Normalization */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span style={{ color: '#94a3b8' }}>Latency Reference Normalizer (ms):</span>
              <strong style={{ color: '#f8fafc' }}>{latRef} ms</strong>
            </div>
            <input
              type="number"
              min="10"
              max="500"
              step="5"
              value={latRef}
              onChange={(e) => setLatRef(Math.max(1, parseFloat(e.target.value) || 50))}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #1e293b',
                color: '#fff',
                padding: '0.4rem 0.6rem',
                borderRadius: 6,
                fontSize: '0.85rem'
              }}
            />
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              Reference latency scaling factor (normalized_lat = lat / ref).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Real SDN / Mininet Integration Panel */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Server size={18} color="#a78bfa" />
            <span>Operating Mode & Real SDN Environment Integration</span>
          </div>
          <span className={`badge ${status?.controller_connected ? 'badge-success' : 'badge-purple'}`}>
            {status?.controller_connected ? 'SDN Controller Connected' : 'Simulation Mode (Standalone)'}
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
          NetResQ supports two operating modes: an in-memory <strong>Simulation Mode</strong> (demonstrating all failure recovery and quality routing on any machine) and an optional <strong>Real SDN Mode</strong> interfacing with an OpenFlow 1.3 controller (Ryu) and Mininet.
        </p>

        <div style={{
          background: '#0a0f1d',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: '1rem',
          fontSize: '0.8rem'
        }}>
          <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Terminal size={16} />
            Ubuntu / WSL2 Real SDN Setup Commands:
          </div>
          <pre style={{ color: '#cbd5e1', overflowX: 'auto', lineHeight: 1.6, padding: '0.5rem', background: '#070b14', borderRadius: 6 }}>
{`# 1. Install prerequisites in Ubuntu/WSL:
sudo apt update && sudo apt install -y openvswitch-switch mininet python3-pip

# 2. Launch Ryu OpenFlow 1.3 Controller with REST topology:
ryu-manager ryu.app.rest_topology ryu.app.ofctl_rest ryu.app.simple_switch_13

# 3. In another terminal, start the Mininet triangle topology:
sudo python3 scripts/mininet_topology.py

# 4. In Mininet CLI, test ping and trigger link failures:
mininet> h1 ping -c 4 h4
mininet> link s1 s2 down`}
          </pre>
        </div>
      </div>
    </div>
  );
};
