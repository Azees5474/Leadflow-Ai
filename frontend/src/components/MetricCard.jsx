import React from 'react';

export default function MetricCard({ title, value, icon: Icon, badgeText, badgeType, subtitle, trend, color }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-label">{title}</span>
        {badgeText && (
          <span className={`badge badge-${badgeType || 'pending'}`}>
            {badgeText}
          </span>
        )}
        {Icon && !badgeText && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color || 'var(--accent-primary)'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-value" style={{ color: color || 'inherit' }}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{subtitle}</span>
          {trend && (
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{trend}</span>
          )}
        </div>
      )}
    </div>
  );
}
