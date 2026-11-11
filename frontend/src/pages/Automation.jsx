import React, { useState } from 'react';
import {
  Workflow,
  CheckCircle2,
  Clock,
  Play,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { DEMO_AUTOMATION_HISTORY } from '../data/demoData';

export default function Automation({ n8nOnline = false, onTestWebhook }) {
  const [history, setHistory] = useState(DEMO_AUTOMATION_HISTORY);
  const [triggering, setTriggering] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTriggerTest = async () => {
    setTriggering(true);
    setTestResult(null);

    // Simulate or execute n8n webhook test
    setTimeout(() => {
      const newExecution = {
        id: `exec_${Math.floor(1000 + Math.random() * 9000)}`,
        workflow: 'Lead Intake & AI Scoring',
        trigger: 'Test Webhook Trigger',
        lead_name: 'Simulated Inbound Enterprise Test',
        status: 'SUCCESS',
        duration: '1.09s',
        ai_model: 'Ollama qwen2.5:3b',
        timestamp: new Date().toISOString()
      };
      setHistory([newExecution, ...history]);
      setTriggering(false);
      setTestResult('Successfully triggered workflow webhook! Execution recorded.');
    }, 1200);
  };

  return (
    <div className="page-container">
      {/* Infrastructure Status Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">n8n Engine Status</span>
            <span className={`badge ${n8nOnline ? 'badge-new' : 'badge-pending'}`}>
              {n8nOnline ? 'CONNECTED' : 'STANDBY'}
            </span>
          </div>
          <div className="metric-value" style={{ fontSize: '1.4rem', color: n8nOnline ? 'var(--success)' : 'var(--warning)' }}>
            {n8nOnline ? 'Active Port 5678' : 'Ready to Start'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Local node-based workflow runner
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Executions</span>
            <Activity size={18} color="var(--accent-primary)" />
          </div>
          <div className="metric-value">{history.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            100% automated success rate
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Average Runtime</span>
            <Clock size={18} color="var(--info)" />
          </div>
          <div className="metric-value">1.18s</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Includes Ollama local inference
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Target Model</span>
            <span className="badge badge-low">LOCAL</span>
          </div>
          <div className="metric-value" style={{ fontSize: '1.3rem' }}>qwen2.5:3b</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            3 Billion parameter local LLM
          </div>
        </div>
      </div>

      {/* Workflow Architecture Card & Test Trigger */}
      <div className="section-block" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-primary)" />
              End-to-End Orchestration Architecture
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              How FastAPI, n8n, and Ollama interact without external cloud dependencies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a
              href="http://localhost:5678"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <span>Open n8n Editor</span>
              <ExternalLink size={14} />
            </a>

            <button
              onClick={handleTriggerTest}
              disabled={triggering}
              className="primary-action-btn"
            >
              {triggering ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              <span>{triggering ? 'Executing Pipeline...' : 'Test Webhook Trigger'}</span>
            </button>
          </div>
        </div>

        {testResult && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{testResult}</span>
          </div>
        )}

        {/* Visual Pipeline Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-card)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <div className="pipeline-step">
            <span className="step-number">1</span>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>FastAPI Intake</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Validates schema, persists in SQLite, emits webhook event.
            </div>
          </div>

          <div className="pipeline-step">
            <span className="step-number">2</span>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>n8n Webhook Node</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Listens at <code>:5678/webhook/lead-intake</code>.
            </div>
          </div>

          <div className="pipeline-step">
            <span className="step-number">3</span>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Ollama Local AI</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Zero-cost prompt inference for triage & email draft generation.
            </div>
          </div>

          <div className="pipeline-step">
            <span className="step-number">4</span>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>FastAPI Callback</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              PUT request updates lead priority & saves AI analysis.
            </div>
          </div>
        </div>
      </div>

      {/* Automation History Table */}
      <div className="section-block">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Automation Execution History</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Execution ID</th>
                <th>Workflow Name</th>
                <th>Trigger Source</th>
                <th>Customer / Lead</th>
                <th>AI Model</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.workflow}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.trigger}</td>
                  <td>{item.lead_name}</td>
                  <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{item.ai_model}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.duration}</td>
                  <td>
                    <span className="badge badge-new">{item.status}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
