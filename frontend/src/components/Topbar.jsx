import React from 'react';
import {
  Menu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserPlus
} from 'lucide-react';

export default function Topbar({
  activeTab,
  onOpenMobileMenu,
  onSync,
  loading = false,
  notification = null,
  onAddLeadClick
}) {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Executive GTM Dashboard', desc: 'Real-time overview of inbound lead volume, priority triage, and system throughput.' };
      case 'leads':
        return { title: 'Inbound Leads Management', desc: 'Search, filter, and inspect verified inbound enterprise customer inquiries.' };
      case 'add-lead':
        return { title: 'Capture Inbound Lead', desc: 'Submit a new customer inquiry to initiate FastAPI schema validation and n8n triage.' };
      case 'ai-analysis':
        return { title: 'Ollama AI Lead Qualification', desc: 'Local LLM inference classifying high-intent opportunities with zero cloud API costs.' };
      case 'automation':
        return { title: 'n8n Business Workflows', desc: 'Orchestrator monitoring webhook dispatch, condition branching, and execution logs.' };
      case 'emails':
        return { title: 'AI-Generated Email Outreach', desc: 'Context-aware personalized draft templates ready for SDR review and dispatch.' };
      case 'logs':
        return { title: 'System Activity Logs', desc: 'Audit trail of database events, webhook executions, and AI inferences.' };
      case 'settings':
        return { title: 'Platform Settings & Config', desc: 'Environment variables, webhook endpoints, and data seeding utilities.' };
      default:
        return { title: 'Dashboard', desc: '' };
    }
  };

  const { title, desc } = getPageTitle();

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="mobile-menu-toggle" onClick={onOpenMobileMenu}>
          <Menu size={20} />
        </button>

        <div>
          <div className="page-title">{title}</div>
          {desc && (
            <div className="page-subtitle">{desc}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {notification && (
          <div className={`notification-pill ${notification.type}`}>
            {notification.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            <span>{notification.msg}</span>
          </div>
        )}

        {activeTab !== 'add-lead' && (
          <button className="primary-action-btn" onClick={onAddLeadClick}>
            <UserPlus size={15} />
            <span className="btn-text">Add Lead</span>
          </button>
        )}

        <button className="sync-btn" onClick={onSync} title="Sync data with FastAPI">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="btn-text">Sync</span>
        </button>
      </div>
    </header>
  );
}
