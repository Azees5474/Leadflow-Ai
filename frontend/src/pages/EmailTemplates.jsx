import React, { useState, useEffect } from 'react';
import {
  Mail,
  Edit3,
  Eye,
  Copy,
  Check,
  Send,
  Sparkles,
  User,
  Building
} from 'lucide-react';
import { EMAIL_TEMPLATES_CATALOG } from '../data/demoData';

export default function EmailTemplates({ leads = [], preselectedLead = null }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('high_priority');
  const [selectedLeadId, setSelectedLeadId] = useState(
    preselectedLead ? preselectedLead.id : (leads[0]?.id || '')
  );

  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  // Active template state
  const activeTemplate = EMAIL_TEMPLATES_CATALOG.find(t => t.id === selectedTemplateId) || EMAIL_TEMPLATES_CATALOG[0];

  // Selected lead
  const currentLead = leads.find(l => l.id === Number(selectedLeadId)) || leads[0];

  // Editable Subject & Body
  const [subject, setSubject] = useState(activeTemplate.subject);
  const [body, setBody] = useState(activeTemplate.body);

  // When template changes, reload template content
  useEffect(() => {
    setSubject(activeTemplate.subject);
    setBody(activeTemplate.body);
  }, [selectedTemplateId]);

  // When preselected lead changes from outside
  useEffect(() => {
    if (preselectedLead) {
      setSelectedLeadId(preselectedLead.id);
      // Auto-switch template based on lead priority
      if (preselectedLead.priority === 'HIGH') setSelectedTemplateId('high_priority');
      else if (preselectedLead.priority === 'MEDIUM') setSelectedTemplateId('medium_priority');
      else if (preselectedLead.priority === 'LOW') setSelectedTemplateId('low_priority');
    }
  }, [preselectedLead]);

  // Interpolate variables
  const renderPreview = (text) => {
    if (!text || !currentLead) return text || '';
    return text
      .replace(/{{name}}/g, currentLead.name || 'Valued Partner')
      .replace(/{{company}}/g, currentLead.company || 'your organization')
      .replace(/{{requirements_summary}}/g, currentLead.requirements || 'your business inquiries');
  };

  const previewSubject = renderPreview(subject);
  const previewBody = renderPreview(body);

  const handleCopy = () => {
    const fullText = `Subject: ${previewSubject}\n\n${previewBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSend = () => {
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3000);
  };

  return (
    <div className="page-container">
      {/* Top Selector Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        background: 'var(--bg-card)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Template Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Template Type:
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            {EMAIL_TEMPLATES_CATALOG.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.targetPriority})
              </option>
            ))}
          </select>
        </div>

        {/* Lead Context Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Inject Context:
          </label>
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            style={{
              flex: 1,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            {leads.map(l => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.company || l.email} ({l.priority})
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              border: '1px solid var(--border-color)'
            }}
          >
            {copied ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
            <span>{copied ? 'Copied!' : 'Copy Email'}</span>
          </button>

          <button
            onClick={handleSimulateSend}
            className="primary-action-btn"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
          >
            <Send size={15} />
            <span>Simulate SDR Send</span>
          </button>
        </div>
      </div>

      {sentNotice && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <Check size={16} />
          <span>Email simulation complete. Actual sends are recorded from the n8n workflow.</span>
        </div>
      )}

      {/* Dual Pane: Editor (Left) & Real Preview (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Left Pane: Interactive Editor */}
        <div className="form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Edit3 size={18} color="var(--accent-primary)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Template Editor & Variables</h4>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Email Body Content (Supports <code>{`{{name}}`}</code>, <code>{`{{company}}`}</code>, <code>{`{{requirements_summary}}`}</code>)
            </label>
            <textarea
              rows={14}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 Tip: Variables in curly braces are automatically replaced with real lead data on the right.
          </div>
        </div>

        {/* Right Pane: Live Superhuman-style Email Preview */}
        <div className="form-card" style={{ background: '#0e1424' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Eye size={18} color="var(--success)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Live Rendered Client Preview</h4>
            <span className="badge badge-low" style={{ marginLeft: 'auto' }}>Client View</span>
          </div>

          {/* Email Header Simulation */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>To: </span>
              <strong>{currentLead?.name}</strong> &lt;{currentLead?.email}&gt;
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>From: </span>
              <span>Azees S &lt;azees@visailabs.com&gt;</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subject: </span>
              <strong>{previewSubject}</strong>
            </div>
          </div>

          {/* Rendered Body */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            fontSize: '0.88rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            color: 'var(--text-primary)',
            minHeight: '260px'
          }}>
            {previewBody}
          </div>
        </div>
      </div>
    </div>
  );
}
