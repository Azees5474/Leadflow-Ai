import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LeadDetailsModal from './components/LeadDetailsModal';

// Pages
import Overview from './pages/Overview';
import Leads from './pages/Leads';
import AddLead from './pages/AddLead';
import AiAnalysis from './pages/AiAnalysis';
import Automation from './pages/Automation';
import EmailTemplates from './pages/EmailTemplates';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';

import { INITIAL_DEMO_LEADS } from './data/demoData';
import { leadsApi } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState(INITIAL_DEMO_LEADS);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [n8nOnline, setN8nOnline] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [preselectedEmailLead, setPreselectedEmailLead] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Trigger Notification Banner
  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Check Backend & n8n Health
  const checkHealth = async () => {
    try {
      await leadsApi.checkHealth();
      setBackendOnline(true);
      fetchLeads();
    } catch {
      setBackendOnline(false);
    }

    // Check n8n availability on standard port 5678
    try {
      const n8nRes = await fetch('http://localhost:5678/healthz', { mode: 'no-cors' }).catch(() => null);
      if (n8nRes) setN8nOnline(true);
    } catch {
      setN8nOnline(false);
    }
  };

  // Fetch leads from backend
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await leadsApi.getLeads();
      if (Array.isArray(data) && data.length > 0) {
        setLeads(data);
      }
    } catch (err) {
      console.warn('Backend fetch unviable, retaining current lead set:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial mount health check & polling
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Add Lead
  const handleAddLead = async (formData) => {
    if (backendOnline) {
      // Connect to actual FastAPI backend
      const created = await leadsApi.createLead(formData);
      setLeads((prev) => [created, ...prev]);
      showNotification(`Lead for ${created.name} registered and saved to SQLite!`);
      return created;
    } else {
      // Local preview fallback when backend is offline
      const mockLead = {
        id: Date.now(),
        ...formData,
        priority: 'PENDING',
        status: 'NEW',
        ai_analysis: 'Pending Ollama AI analysis (FastAPI is offline).',
        recommended_action: 'Start FastAPI backend to trigger automated n8n triage.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setLeads((prev) => [mockLead, ...prev]);
      showNotification(`Lead added in local view mode (Start FastAPI to persist)`, 'success');
      return mockLead;
    }
  };

  // Handle Update Lead (Status / Priority)
  const handleUpdateLead = async (id, updateData) => {
    if (backendOnline) {
      try {
        const updated = await leadsApi.updateLead(id, updateData);
        setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
        setSelectedLead(updated);
        showNotification(`Lead #${id} updated successfully.`);
        return updated;
      } catch (err) {
        showNotification(err.message || 'Failed to update lead.', 'error');
        throw err;
      }
    } else {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updateData, updated_at: new Date().toISOString() } : l))
      );
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, ...updateData });
      }
      showNotification(`Lead #${id} updated locally.`);
    }
  };

  // Handle Delete Lead
  const handleDeleteLead = async (id) => {
    if (backendOnline) {
      try {
        await leadsApi.deleteLead(id);
        setLeads((prev) => prev.filter((l) => l.id !== id));
        showNotification(`Lead #${id} deleted from database.`);
      } catch (err) {
        showNotification(err.message || 'Failed to delete lead.', 'error');
      }
    } else {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      showNotification(`Lead #${id} deleted locally.`);
    }
  };

  // Seed Demo Data into Backend
  const handleSeedDemoData = async () => {
    if (backendOnline) {
      let createdCount = 0;
      for (const demo of INITIAL_DEMO_LEADS) {
        try {
          await leadsApi.createLead({
            name: demo.name,
            email: demo.email,
            company: demo.company,
            phone: demo.phone,
            requirements: demo.requirements
          });
          createdCount++;
        } catch {
          // Skip duplicate emails if already seeded
        }
      }
      await fetchLeads();
      showNotification(`Seeded ${createdCount} demo leads to SQLite backend!`);
    } else {
      setLeads(INITIAL_DEMO_LEADS);
      showNotification(`Reset to ${INITIAL_DEMO_LEADS.length} realistic demo leads.`);
    }
  };

  // Quick navigation to Email Templates with preselected lead
  const handleDraftEmail = (lead) => {
    setPreselectedEmailLead(lead);
    if (selectedLead) setSelectedLead(null);
    setActiveTab('emails');
  };

  const highPriorityCount = leads.filter((l) => l.priority === 'HIGH').length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalLeads={leads.length}
        highPriorityCount={highPriorityCount}
        backendOnline={backendOnline}
        n8nOnline={n8nOnline}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Topbar
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSync={checkHealth}
          loading={loading}
          notification={notification}
          onAddLeadClick={() => setActiveTab('add-lead')}
        />

        <main className="content-body">
          {activeTab === 'overview' && (
            <Overview
              leads={leads}
              onNavigateToLeads={() => setActiveTab('leads')}
              onInspectLead={(lead) => setSelectedLead(lead)}
              onNavigateToAddLead={() => setActiveTab('add-lead')}
            />
          )}

          {activeTab === 'leads' && (
            <Leads
              leads={leads}
              onInspectLead={(lead) => setSelectedLead(lead)}
              onDeleteLead={handleDeleteLead}
              onNavigateToAddLead={() => setActiveTab('add-lead')}
            />
          )}

          {activeTab === 'add-lead' && (
            <AddLead
              onAddLead={handleAddLead}
              onCancel={() => setActiveTab('leads')}
            />
          )}

          {activeTab === 'ai-analysis' && (
            <AiAnalysis
              leads={leads}
              onInspectLead={(lead) => setSelectedLead(lead)}
              onDraftEmail={handleDraftEmail}
            />
          )}

          {activeTab === 'automation' && (
            <Automation
              n8nOnline={n8nOnline}
              onTestWebhook={() => showNotification('Triggered n8n webhook test!')}
            />
          )}

          {activeTab === 'emails' && (
            <EmailTemplates
              leads={leads}
              preselectedLead={preselectedEmailLead}
            />
          )}

          {activeTab === 'logs' && (
            <ActivityLogs />
          )}

          {activeTab === 'settings' && (
            <Settings
              onSeedDemoData={handleSeedDemoData}
              backendOnline={backendOnline}
            />
          )}
        </main>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <LeadDetailsModal
          lead={leads.find((lead) => lead.id === selectedLead.id) || selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onDraftEmail={handleDraftEmail}
        />
      )}
    </div>
  );
}
