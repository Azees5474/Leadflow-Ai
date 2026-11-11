import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Filter,
  Target,
  AlertTriangle,
  FileText
} from 'lucide-react';
import Badge from '../components/Badge';

// Helper to format requirements into scannable bullets
const parseRequirements = (text) => {
  if (!text) return [];
  const items = text
    .split(/\r?\n+|\.\s+(?=[A-Z0-9])/)
    .map(s => s.trim().replace(/^[-*•\d.]+\s*/, '').replace(/\.$/, ''))
    .filter(s => s.length > 3);
  return items.length > 0 ? items : [text];
};

// Helper to extract positive summary vs qualification gaps
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
      gaps.push('No budget stated');
    }
    if (/timeline|urgent/i.test(gapPart)) {
      gaps.push('Timeline unconfirmed');
    }
    if (gaps.length === 0) {
      gaps.push(gapPart.replace(/\.?\s*which prevents.*/i, '').trim());
    }
  }

  return { summary, gaps };
};

export default function AiAnalysis({ leads = [], onInspectLead, onDraftEmail }) {
  const [filterPriority, setFilterPriority] = useState('ALL');

  const parseAiAnalysis = (lead) => {
    if (!lead || !lead.ai_analysis) {
      return {
        explanation: 'Awaiting n8n Ollama webhook trigger to analyze customer requirements.',
        action: lead?.recommended_action || 'Review inquiry details and assign dedicated account executive.',
        source: 'pending'
      };
    }
    try {
      const parsed = JSON.parse(lead.ai_analysis);
      return {
        explanation: parsed.explanation || lead.ai_analysis,
        action: parsed.recommended_action || lead.recommended_action || 'Follow up with lead.',
        source: parsed.source || 'ollama'
      };
    } catch {
      return {
        explanation: lead.ai_analysis,
        action: lead.recommended_action || 'Review inquiry details and assign dedicated account executive.',
        source: 'analysis'
      };
    }
  };

  const filteredLeads = leads.filter(l => {
    if (filterPriority === 'ALL') return true;
    return l.priority === filterPriority;
  });

  return (
    <div className="page-container">
      {/* Overview Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(99, 102, 241, 0.08))',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontWeight: 700, fontSize: '1.1rem' }}>
            <BrainCircuit size={22} />
            <span>Ollama AI Local Triage Pipeline</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '650px' }}>
            Every inbound lead is parsed locally using <strong>qwen2.5:3b</strong>. The model extracts enterprise intent signals, assigns urgency ratings, explains its rationale, and generates recommended GTM steps.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI Model</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd' }}>qwen2.5:3b</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cloud API Cost</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>$0.00 (Local)</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Privacy</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--info)' }}>100% On-Prem</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {['ALL', 'HIGH', 'MEDIUM', 'LOW', 'PENDING'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: filterPriority === p ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: filterPriority === p ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s ease'
            }}
          >
            {p === 'ALL' ? 'All Analyses' : `${p} Priority`}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="ai-card">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{lead.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {lead.company ? `${lead.company} • ` : ''}{lead.email}
                </div>
              </div>
              <Badge variant={lead.priority}>{lead.priority}</Badge>
            </div>

            {/* Requirement Box */}
            {(() => {
              const reqItems = parseRequirements(lead.requirements);
              return (
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  marginBottom: '1rem',
                  fontSize: '0.82rem'
                }}>
                  <div style={{
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '0.45rem',
                    textTransform: 'uppercase',
                    fontSize: '0.68rem',
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <FileText size={12} />
                    <span>Customer Requirements ({reqItems.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {reqItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        <span style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: 'var(--accent-primary)',
                          marginTop: '0.5rem',
                          flexShrink: 0
                        }} />
                        <span style={{ flex: 1 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* AI Explanation Box */}
            {(() => {
              const { explanation, action, source } = parseAiAnalysis(lead);
              const { summary, gaps } = parseAiInsights(explanation);

              return (
                <>
                  <div style={{
                    background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.08), rgba(17, 24, 39, 0.5))',
                    border: '1px solid rgba(59, 130, 246, 0.22)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.9rem',
                    marginBottom: '1rem',
                    fontSize: '0.84rem',
                    flex: 1
                  }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontSize: '0.82rem' }}>
                        <Sparkles size={14} />
                        Ollama Qualification Summary:
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        color: '#93c5fd',
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(59, 130, 246, 0.15)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {source}
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: gaps.length > 0 ? '0.6rem' : '0' }}>
                      {summary || explanation}
                    </div>

                    {/* Identified Gaps */}
                    {gaps.length > 0 && (
                      <div style={{
                        marginTop: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.35rem'
                      }}>
                        {gaps.map((gap, i) => (
                          <span key={i} style={{
                            fontSize: '0.72rem',
                            color: '#fde68a',
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)'
                          }}>
                            • {gap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommended Action */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.06))',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 0.85rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontWeight: 700,
                      color: '#6ee7b7',
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.25rem'
                    }}>
                      <Target size={13} />
                      <span>Recommended GTM Action</span>
                    </div>
                    <div style={{ color: '#ecfdf5', lineHeight: 1.45, fontWeight: 500 }}>
                      {action}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
              <button
                onClick={() => onInspectLead(lead)}
                style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}
              >
                Inspect Lead #{lead.id}
              </button>

              <button
                onClick={() => onDraftEmail && onDraftEmail(lead)}
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <Mail size={14} />
                <span>Generate Outreach Email</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
