import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Database,
  BrainCircuit,
  Server
} from 'lucide-react';

const INITIAL_LOGS = [
  {
    id: 'log_101',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    source: 'FastAPI Backend',
    event: 'Database session created; SQLite connection pool verified',
    level: 'INFO',
    status: 'SUCCESS'
  },
  {
    id: 'log_102',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    source: 'n8n Webhook',
    event: 'Dispatched payload to http://localhost:5678/webhook/lead-intake',
    level: 'INFO',
    status: 'PROCESSED'
  },
  {
    id: 'log_103',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    source: 'Ollama AI',
    event: 'Prompt execution completed for lead #1 via model qwen2.5:3b (tokens: 342, duration: 1.12s)',
    level: 'INFO',
    status: 'COMPLETED'
  },
  {
    id: 'log_104',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    source: 'FastAPI Backend',
    event: 'Lead creation POST /api/leads verified with Pydantic validator (ID #1)',
    level: 'INFO',
    status: 'SUCCESS'
  },
  {
    id: 'log_105',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    source: 'SQLite Database',
    event: 'Unique constraint verification on column `leads.email` succeeded',
    level: 'DEBUG',
    status: 'SUCCESS'
  }
];

export default function ActivityLogs() {
  const [logs] = useState(INITIAL_LOGS);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const matchSearch = log.event.toLowerCase().includes(search.toLowerCase()) ||
      log.source.toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === 'ALL' || log.source === sourceFilter;
    return matchSearch && matchSource;
  });

  return (
    <div className="page-container">
      {/* Filters Toolbar */}
      <div className="toolbar-container">
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search activity events, sources, or trace IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="ALL">All Subsystems</option>
            <option value="FastAPI Backend">FastAPI Backend</option>
            <option value="n8n Webhook">n8n Webhook</option>
            <option value="Ollama AI">Ollama AI</option>
            <option value="SQLite Database">SQLite Database</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Subsystem</th>
              <th>Event Description</th>
              <th>Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.source}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{log.event}</td>
                <td>
                  <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    {log.level}
                  </span>
                </td>
                <td>
                  <span className="badge badge-new">{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
