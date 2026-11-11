import React from 'react';

/**
 * Priority Distribution visual breakdown
 */
export function PriorityDistributionChart({ high = 0, medium = 0, low = 0, pending = 0 }) {
  const total = high + medium + low + pending || 1;
  const pHigh = Math.round((high / total) * 100);
  const pMedium = Math.round((medium / total) * 100);
  const pLow = Math.round((low / total) * 100);
  const pPending = 100 - pHigh - pMedium - pLow;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between' }}>
        <span>AI Qualification Breakdown</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{total} Total Leads</span>
      </h4>

      {/* Segmented Progress Bar */}
      <div style={{
        display: 'flex',
        height: '14px',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        background: 'var(--bg-tertiary)',
        marginBottom: '1.25rem'
      }}>
        <div style={{ width: `${pHigh}%`, background: 'var(--danger)', transition: 'width 0.5s ease' }} title={`High: ${high} (${pHigh}%)`} />
        <div style={{ width: `${pMedium}%`, background: 'var(--warning)', transition: 'width 0.5s ease' }} title={`Medium: ${medium} (${pMedium}%)`} />
        <div style={{ width: `${pLow}%`, background: 'var(--info)', transition: 'width 0.5s ease' }} title={`Low: ${low} (${pLow}%)`} />
        <div style={{ width: `${pPending}%`, background: '#64748b', transition: 'width 0.5s ease' }} title={`Pending: ${pending} (${pPending}%)`} />
      </div>

      {/* Legend & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>High Priority:</span>
          <strong>{high} ({pHigh}%)</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Medium Priority:</span>
          <strong>{medium} ({pMedium}%)</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--info)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Low Priority:</span>
          <strong>{low} ({pLow}%)</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748b' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Pending:</span>
          <strong>{pending} ({pPending}%)</strong>
        </div>
      </div>
    </div>
  );
}

/**
 * Inbound Volume Trend chart (Weekly bar representation)
 */
export function InboundTrendChart({ leads = [] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Sample simulated weekly distribution
  const counts = [4, 7, 12, 9, 15, 6, 8];
  const max = Math.max(...counts, 1);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Inbound Lead Velocity</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily capture volume across web intake</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>+34% this week</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', paddingTop: '10px' }}>
        {days.map((day, idx) => {
          const heightPct = Math.round((counts[idx] / max) * 100);
          return (
            <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{counts[idx]}</span>
              <div
                style={{
                  width: '24px',
                  height: `${heightPct}%`,
                  background: idx === 4 ? 'var(--accent-primary)' : 'rgba(59, 130, 246, 0.35)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease',
                  boxShadow: idx === 4 ? '0 0 10px var(--accent-glow)' : 'none'
                }}
                title={`${day}: ${counts[idx]} leads`}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Conversion Funnel Status Bar
 */
export function PipelineStatusChart({ leads = [] }) {
  const statuses = [
    { label: 'New', count: leads.filter(l => l.status === 'NEW').length, color: '#3b82f6' },
    { label: 'Contacted', count: leads.filter(l => l.status === 'CONTACTED').length, color: '#f59e0b' },
    { label: 'Qualified', count: leads.filter(l => l.status === 'QUALIFIED').length, color: '#10b981' },
    { label: 'Converted', count: leads.filter(l => l.status === 'CONVERTED').length, color: '#8b5cf6' },
    { label: 'Closed', count: leads.filter(l => l.status === 'CLOSED').length, color: '#64748b' }
  ];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>GTM Pipeline Conversion Stage</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {statuses.map(s => {
          const total = leads.length || 1;
          const pct = Math.round((s.count / total) * 100);
          return (
            <div key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 500 }}>{s.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{s.count} leads ({pct}%)</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
