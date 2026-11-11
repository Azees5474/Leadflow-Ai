import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import Badge from '../components/Badge';
import EmailStatus from '../components/EmailStatus';

export default function Leads({
  leads = [],
  onInspectLead,
  onDeleteLead,
  onNavigateToAddLead
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter and Sort leads
  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        const matchesSearch =
          searchTerm === '' ||
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (lead.requirements && lead.requirements.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;
        const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

        return matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'priority-high') {
          const rank = { HIGH: 3, MEDIUM: 2, LOW: 1, PENDING: 0 };
          return (rank[b.priority] || 0) - (rank[a.priority] || 0);
        }
        return 0;
      });
  }, [leads, searchTerm, priorityFilter, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedLeads.length / itemsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedLeads.slice(start, start + itemsPerPage);
  }, [filteredAndSortedLeads, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="page-container">
      {/* Search, Filter & Actions Toolbar */}
      <div className="toolbar-container">
        {/* Search Input */}
        <div className="search-bar">
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search leads by name, email, company, or requirement keywords..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Priority Filter */}
        <div className="filter-dropdown">
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">🔥 High Priority</option>
            <option value="MEDIUM">⚡ Medium Priority</option>
            <option value="LOW">🌱 Low Priority</option>
            <option value="PENDING">⏳ Pending Analysis</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-dropdown">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Converted</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="filter-dropdown">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="priority-high">Highest Priority</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>

        {/* Add Lead CTA */}
        <button className="primary-action-btn" onClick={onNavigateToAddLead}>
          <UserPlus size={16} />
          <span>New Lead</span>
        </button>
      </div>

      {/* Leads Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead Name & ID</th>
              <th>Company & Phone</th>
              <th>Email</th>
              <th>Priority</th>
              <th>Lifecycle Status</th>
              <th>Email Status</th>
              <th>Intake Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: #{lead.id}</div>
                </td>

                <td>
                  <div style={{ fontWeight: 500 }}>{lead.company || '—'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.phone || 'No phone'}</div>
                </td>

                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#93c5fd' }}>
                    {lead.email}
                  </span>
                </td>

                <td>
                  <Badge variant={lead.priority}>{lead.priority}</Badge>
                </td>

                <td>
                  <Badge variant={lead.status}>{lead.status}</Badge>
                </td>

                <td><EmailStatus sentAt={lead.email_sent_at} /></td>

                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(lead.created_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>

                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button
                      className="icon-action-btn"
                      onClick={() => onInspectLead(lead)}
                      title="Inspect full lead details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="icon-action-btn danger"
                      onClick={() => {
                        if (window.confirm(`Delete lead #${lead.id} (${lead.name})?`)) {
                          onDeleteLead(lead.id);
                        }
                      }}
                      title="Delete lead"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {paginatedLeads.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.3rem' }}>No leads found</div>
                  <div style={{ fontSize: '0.85rem' }}>No records match your active search or filter criteria.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-bar">
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Showing {paginatedLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredAndSortedLeads.length)} of{' '}
          {filteredAndSortedLeads.length} leads
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
