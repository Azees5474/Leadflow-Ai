import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Settings({ onSeedDemoData, backendOnline = false }) {
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedNotice(null);
    try {
      await onSeedDemoData();
      setSeedNotice({ type: 'success', msg: 'Successfully seeded realistic enterprise demo leads!' });
    } catch (err) {
      setSeedNotice({ type: 'error', msg: err.message || 'Failed to seed demo data.' });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      {seedNotice && (
        <div className={`alert alert-${seedNotice.type}`} style={{ marginBottom: '1.5rem' }}>
          {seedNotice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{seedNotice.msg}</span>
        </div>
      )}

      {/* Environment Config Cards */}
      <div className="section-block" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} color="var(--accent-primary)" />
          Service Endpoints & System Architecture
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>FastAPI REST API Base URL</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CORS-enabled endpoint for React requests</div>
            </div>
            <code style={{ fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>http://localhost:8000/api</code>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>n8n Webhook Intake URL</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Asynchronous event dispatcher endpoint</div>
            </div>
            <code style={{ fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>http://localhost:5678/webhook/lead-intake</code>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Ollama Local Inference Base</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On-premise zero-cost local LLM server</div>
            </div>
            <code style={{ fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>http://localhost:11434</code>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Active LLM Model Tag</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compact 3B parameter model suited for laptop execution</div>
            </div>
            <code style={{ fontFamily: 'var(--font-mono)', color: '#93c5fd' }}>qwen2.5:3b</code>
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="section-block">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} color="var(--success)" />
          Interview Demonstration Utilities
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Use these controls to quickly populate realistic enterprise leads into the database for live demonstration during your interview at VisAI Labs.
        </p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="primary-action-btn"
          >
            <RefreshCw size={15} className={seeding ? 'animate-spin' : ''} />
            <span>{seeding ? 'Seeding Leads...' : 'Seed Realistic Demo Leads'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
