import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Building,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function AddLead({ onAddLead, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    requirements: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const validate = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Contact Name must be at least 2 characters long.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid work or corporate email address.');
      return false;
    }
    if (!formData.requirements.trim() || formData.requirements.trim().length < 5) {
      setError('Business requirements must contain at least 5 characters explaining project scope.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const created = await onAddLead(formData);
      setSuccess(created);
      setFormData({ name: '', email: '', company: '', phone: '', requirements: '' });
    } catch (err) {
      setError(err.message || 'Failed to register lead. Please check network or duplicate email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '780px' }}>
      <div className="form-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={20} color="var(--accent-primary)" />
              Inbound Customer Intake Form
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Submitting registers the lead in SQLite, triggers FastAPI schema validation, and dispatches the n8n Ollama pipeline.
            </p>
          </div>
          <span className="badge badge-new">Live Web Intake</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600 }}>Validation or Intake Error</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>{error}</div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Lead Captured Successfully!</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.15rem' }}>
                Lead #{success.id} ({success.name}) is registered. Dispatched webhook to n8n for Ollama evaluation.
              </div>
            </div>
            <button
              onClick={onCancel}
              style={{
                fontSize: '0.82rem',
                color: 'var(--success)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                border: '1px solid var(--success)',
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span>View in Table</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Name & Email */}
          <div className="form-row">
            <div className="form-group">
              <label>Contact Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="input-with-icon">
                <UserPlus size={16} />
                <input
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Corporate / Work Email <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  placeholder="e.g. sarah@cyberdyne.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 2: Company & Phone */}
          <div className="form-row">
            <div className="form-group">
              <label>Company / Organization Name</label>
              <div className="input-with-icon">
                <Building size={16} />
                <input
                  type="text"
                  placeholder="e.g. Cyberdyne Systems Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contact Phone / Mobile</label>
              <div className="input-with-icon">
                <Phone size={16} />
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 019-2831"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Row 3: Business Requirements */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label>Project Scope & Business Requirements <span style={{ color: 'var(--danger)' }}>*</span></label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formData.requirements.length} characters (min 5)
              </span>
            </div>
            <textarea
              rows={5}
              placeholder="Detail your operational bottlenecks, team size, desired timeline, security constraints (e.g. on-premise LLM inference, local data residency)..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              required
            />
          </div>

          {/* AI Helper Banner */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)'
          }}>
            <Sparkles size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Automation Trigger:</strong> Once saved, the requirements text will be parsed by Ollama's <code>qwen2.5:3b</code> model to score urgency and produce an outreach email.
            </span>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="secondary-btn"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-action-btn"
              disabled={loading}
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
            >
              <UserPlus size={16} />
              <span>{loading ? 'Validating & Persisting...' : 'Submit Lead & Trigger Workflow'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
