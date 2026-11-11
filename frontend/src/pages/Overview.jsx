import React from 'react';
import {
  Users,
  Flame,
  Clock,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import Badge from '../components/Badge';
import { PriorityDistributionChart, InboundTrendChart, PipelineStatusChart } from '../components/Charts';

export default function Overview({ leads = [], onNavigateToLeads, onInspectLead, onNavigateToAddLead }) {
  const totalLeads = leads.length;
  const highPriority = leads.filter(l => l.priority === 'HIGH').length;
  const mediumPriority = leads.filter(l => l.priority === 'MEDIUM').length;
  const lowPriority = leads.filter(l => l.priority === 'LOW').length;
  const pendingLeads = leads.filter(l => l.priority === 'PENDING').length;

  return (
    <div className="page-container">
      {/* 4 Metric Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Inbound Leads"
          value={totalLeads}
          icon={Users}
          color="var(--accent-primary)"
          subtitle="Captured from web forms"
          trend="+18% MoM"
        />

        <MetricCard
          title="High Priority Leads"
          value={highPriority}
          badgeText="HOT ICP"
          badgeType="high"
          color="var(--danger)"
          subtitle="Requires 15m SDR outreach"
        />

        <MetricCard
          title="Medium Priority Leads"
          value={mediumPriority}
          badgeText="WARM"
          badgeType="medium"
          color="var(--warning)"
          subtitle="Assigned to standard cadence"
        />

        <MetricCard
          title="Low Priority / Nurture"
          value={lowPriority}
          badgeText="NURTURE"
          badgeType="low"
          color="var(--info)"
          subtitle="Self-serve educational track"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <PriorityDistributionChart
          high={highPriority}
          medium={mediumPriority}
          low={lowPriority}
          pending={pendingLeads}
        />
        <InboundTrendChart leads={leads} />
        <PipelineStatusChart leads={leads} />
      </div>

      {/* Recent Leads Section */}
      <div className="section-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recently Captured Inbound Leads</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest submissions processed by FastAPI and triaged by Ollama AI</p>
          </div>
          <button
            onClick={onNavigateToLeads}
            style={{
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span>View All Leads ({totalLeads})</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Contact</th>
                <th>Company</th>
                <th>Priority</th>
                <th>Status</th>
                <th>AI Insight Preview</th>
                <th>Intake Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                    <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{lead.email}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{lead.company || '—'}</span>
                  </td>
                  <td>
                    <Badge variant={lead.priority}>{lead.priority}</Badge>
                  </td>
                  <td>
                    <Badge variant={lead.status}>{lead.status}</Badge>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <Sparkles size={13} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                      <span>{lead.ai_analysis || lead.requirements}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <button
                      className="table-action-btn"
                      onClick={() => onInspectLead(lead)}
                      title="Inspect Lead Details"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No leads captured yet. Click "Add Lead" to register your first inquiry!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
