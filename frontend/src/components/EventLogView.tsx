import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  XCircle,
  Filter
} from 'lucide-react';
import type { NetworkEvent, EventSeverity } from '../types';

interface EventLogViewProps {
  events: NetworkEvent[];
  onClearEvents: () => void;
}

export const EventLogView: React.FC<EventLogViewProps> = ({ events, onClearEvents }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredEvents = events.filter((e) => {
    if (filterSeverity === 'ALL') return true;
    return e.severity.toUpperCase() === filterSeverity;
  });

  const getSeverityBadge = (severity: EventSeverity) => {
    switch (severity) {
      case 'success':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Success</span>;
      case 'warning':
        return <span className="badge badge-warning"><AlertTriangle size={12} /> Warning</span>;
      case 'error':
        return <span className="badge badge-error"><XCircle size={12} /> Error</span>;
      default:
        return <span className="badge badge-cyan"><Info size={12} /> Info</span>;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <History size={18} color="#38bdf8" />
          <span>Operational Event & Self-Healing Audit Log</span>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            {filteredEvents.length} Events
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Severity Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <Filter size={14} />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: 6,
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Severities</option>
              <option value="ERROR">Errors Only</option>
              <option value="WARNING">Warnings Only</option>
              <option value="SUCCESS">Success Only</option>
              <option value="INFO">Info Only</option>
            </select>
          </div>

          {/* Clear Log */}
          <button
            onClick={onClearEvents}
            className="btn btn-secondary btn-sm"
            title="Clear displayed event history"
          >
            <Trash2 size={13} />
            Clear Log
          </button>
        </div>
      </div>

      <div style={{
        maxHeight: 320,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingRight: '0.25rem'
      }}>
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
            No operational events recorded.
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 8,
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  {getSeverityBadge(evt.severity)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', fontFamily: 'monospace' }}>
                    {evt.event_type}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {evt.message}
                </div>
                {evt.details && Object.keys(evt.details).length > 0 && (
                  <div style={{
                    marginTop: '0.35rem',
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                    background: '#131c31',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 4,
                    display: 'inline-block'
                  }}>
                    {JSON.stringify(evt.details)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
