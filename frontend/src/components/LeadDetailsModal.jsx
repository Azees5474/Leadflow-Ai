import React, { useState } from 'react';
import {
  X,
  Mail,
  Building,
  Phone,
  Calendar,
  Sparkles,
  Trash2,
  Save,
  CheckCircle2,
  ExternalLink,
  FileText,
  AlertTriangle,
  Target,
  ArrowRight
} from 'lucide-react';
import Badge from './Badge';
import EmailStatus from './EmailStatus';

// Helper to split long requirement paragraphs into clean, scannable items
const parseRequirements = (text) => {
  if (!text) return [];
  const items = text
    .split(/\r?\n+|\.\s+(?=[A-Z0-9])/)
    .map(s => s.trim().replace(/^[-*•\d.]+\s*/, '').replace(/\.$/, ''))
    .filter(s => s.length > 3);
  return items.length > 0 ? items : [text];
};

// Helper to extract key AI highlights: positive scope vs qualification gaps
const parseAiInsights = (explanation) => {
  if (!explanation) return { summary: '', gaps: [] };

  const splitMatch = explanation.split(/\b(?:However|Although|On the other hand)[,\s]+/i);
  const summary = splitMatch[0] ? splitMatch[0].trim().replace(/\.$/, '') : explanation;
  const gapPart = splitMatch[1] ? splitMatch[1].trim() : '';

  const gaps = [];
  if (gapPart) {
    if (/company.*?(?:not specified|unknown|unspecified)/i.test(gapPart)) {
      gaps.push('Company not specified');
    }
    if (/budget/i.test(gapPart)) {
      gaps.push('No explicit budget stated');
    }
    if (/timeline|urgent/i.test(gapPart)) {
      gaps.push('Timeline unconfirmed');
    }
    if (gaps.length === 0) {
      gaps.push(gapPart.replace(/\.?\s*which prevents.*/i, '').trim());
    }
  } else {
    if (/no explicit budget/i.test(explanation) || /budget.*?not/i.test(explanation)) {
      gaps.push('Budget not stated');
    }
    if (/timeline.*?not/i.test(explanation) || /no.*?timeline/i.test(explanation)) {
      gaps.push('Timeline unstated');
    }
  }

  return { summary, gaps };
};

export default function LeadDetailsModal({ lead, onClose, onUpdateLead, onDeleteLead, onDraftEmail }) {
  if (!lead) return null;

  const [status, setStatus] = useState(lead.status || 'NEW');
  const [priority, setPriority] = useState(lead.priority || 'PENDING');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await onUpdateLead(lead.id, { status, priority });
      setSuccessMsg('Updated successfully!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{lead.name}</h3>
              <Badge variant={priority}>{priority}</Badge>
              <Badge variant={status}>{status}</Badge>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Lead ID: #{lead.id} • Registered {new Date(lead.created_at).toLocaleString()}
            </div>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {successMsg && (
            <div style={{
              padding: '0.6rem 1rem',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Contact Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="info-block">
              <span className="info-label"><Mail size={14} /> Email Address</span>
              <span className="info-value mono">{lead.email}</span>
            </div>

            <div className="info-block">
              <span className="info-label"><Mail size={14} /> Email Status</span>
              <div><EmailStatus sentAt={lead.email_sent_at} /></div>
              {lead.email_sent_at && (
                <span className="info-value">Accepted by mail server · {new Date(lead.email_sent_at).toLocaleString()}</span>
              )}
            </div>

            <div className="info-block">
              <span className="info-label"><Building size={14} /> Company</span>
              <span className="info-value">{lead.company || 'Not Specified'}</span>
            </div>

            <div className="info-block">
              <span className="info-label"><Phone size={14} /> Phone</span>
              <span className="info-value">{lead.phone || 'Not Specified'}</span>
            </div>

            <div className="info-block">
              <span className="info-label"><Calendar size={14} /> Last Updated</span>
              <span className="info-value">{new Date(lead.updated_at || lead.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Stated Business Requirements */}
          <div style={{ marginBottom: '1.5rem' }}>
            {(() => {
              const reqItems = parseRequirements(lead.requirements);
              return (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FileText size={15} style={{ color: 'var(--accent-primary)' }} />
                      <span>Stated Scope & Requirements</span>
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      {reqItems.length} Key {reqItems.length === 1 ? 'Point' : 'Points'}
                    </span>
                  </div>

                  <div style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {reqItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--accent-primary)',
                          marginTop: '0.55rem',
                          flexShrink: 0
                        }} />
                        <span style={{ flex: 1 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* AI Qualification & Action */}
          {(() => {
            let explanation = lead.ai_analysis || 'Awaiting n8n Ollama webhook trigger to analyze customer requirements.';
            let action = lead.recommended_action || '';
            let modelSource = 'Ollama AI';

            try {
              if (lead.ai_analysis && lead.ai_analysis.startsWith('{')) {
                const parsed = JSON.parse(lead.ai_analysis);
                explanation = parsed.explanation || explanation;
                action = parsed.recommended_action || action;
                if (parsed.source) modelSource = parsed.source;
              }
            } catch {}

            const { summary, gaps } = parseAiInsights(explanation);

            return (
              <div style={{
                background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.08), rgba(17, 24, 39, 0.6))',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.15rem',
                marginBottom: '1.5rem'
              }}>
                {/* AI Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontWeight: 700, fontSize: '0.9rem' }}>
                    <Sparkles size={16} />
                    <span>Ollama AI Qualification Summary</span>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    color: '#93c5fd',
                    background: 'rgba(59, 130, 246, 0.15)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    border: '1px solid rgba(59, 130, 246, 0.25)'
                  }}>
                    {modelSource}
                  </span>
                </div>

                {/* Primary AI Summary */}
                <div style={{
                  fontSize: '0.86rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.55,
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(17, 24, 39, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  {summary || explanation}
                </div>

                {/* Identified Gaps / Missing Qualification Items */}
                {gaps.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      marginBottom: '0.4rem'
                    }}>
                      <AlertTriangle size={12} />
                      <span>Missing / Needs Qualification:</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {gaps.map((gap, i) => (
                        <span key={i} style={{
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          color: '#fde68a',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          • {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prominent GTM Next Action */}
                {action && (
                  <div style={{
                    marginTop: '0.85rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      color: '#6ee7b7',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.3rem'
                    }}>
                      <Target size={13} />
                      <span>Recommended GTM Action</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#ecfdf5', lineHeight: 1.5, fontWeight: 500 }}>
                      {action}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Editable Pipeline Controls */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Triage Priority</span>
                <Badge variant={priority}>{priority}</Badge>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <option value="HIGH">HIGH (Urgent Outreach)</option>
                <option value="MEDIUM">MEDIUM (Standard Nurture)</option>
                <option value="LOW">LOW (Educational Cadence)</option>
                <option value="PENDING">PENDING (Unclassified)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Lifecycle Status</span>
                <Badge variant={status}>{status}</Badge>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.6rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUALIFIED">QUALIFIED</option>
                <option value="CONVERTED">CONVERTED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to permanently delete lead #${lead.id} (${lead.name})?`)) {
                onDeleteLead(lead.id);
                onClose();
              }
            }}
            style={{
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <Trash2 size={15} />
            <span>Delete Lead</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
            <button
              onClick={() => onDraftEmail && onDraftEmail(lead)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)'
              }}
            >
              <Mail size={15} />
              <span>Draft Outreach</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-primary)',
                color: '#fff',
                fontWeight: 600
              }}
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
