import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BrainCircuit,
  Workflow,
  Mail,
  History,
  Settings as SettingsIcon,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  totalLeads = 0,
  highPriorityCount = 0,
  backendOnline = false,
  n8nOnline = false,
  isOpen = false,
  onClose
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'leads', label: 'All Leads', icon: Users, badge: totalLeads },
    { id: 'add-lead', label: 'Add New Lead', icon: UserPlus },
    { id: 'ai-analysis', label: 'AI Lead Analysis', icon: BrainCircuit, badge: highPriorityCount ? `${highPriorityCount} Hot` : null, badgeColor: 'var(--danger)' },
    { id: 'automation', label: 'n8n Workflows', icon: Workflow },
    { id: 'emails', label: 'Email Templates', icon: Mail },
    { id: 'logs', label: 'Activity Logs', icon: History },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">⚡</div>
          <div>
            <div className="brand-title">LeadFlow AI</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GTM Lead Platform</div>
          </div>
          <span className="brand-badge">v1.0</span>

          {onClose && (
            <button className="mobile-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge !== null && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: item.badgeColor ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      color: item.badgeColor || 'inherit'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Real-Time System Connectivity Monitor */}
        <div className="system-status">
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
            Live Infrastructure
          </div>
          <div className="status-indicator">
            <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
            <span>FastAPI: <strong>{backendOnline ? 'Connected (8000)' : 'Offline'}</strong></span>
          </div>
          <div className="status-indicator">
            <span className={`status-dot ${n8nOnline ? 'online' : 'offline'}`} />
            <span>n8n Engine: <strong>{n8nOnline ? 'Active (5678)' : 'Standby'}</strong></span>
          </div>
          <div className="status-indicator">
            <span className="status-dot online" />
            <span>Ollama AI: <strong>qwen2.5:3b</strong></span>
          </div>
        </div>
      </aside>
    </>
  );
}
