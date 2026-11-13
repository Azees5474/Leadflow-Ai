/**
 * LeadFlow AI - Centralized Backend API Client
 * Configures base URL from environment variables and handles JSON parsing / errors.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8010/api';

/**
 * Generic request helper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || `HTTP Error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      const networkError = new Error(`Cannot connect to the backend at ${API_BASE_URL}. Check that FastAPI is running.`);
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export const leadsApi = {
  // Check backend health
  checkHealth: () => request('/health'),

  // Fetch all leads with optional filters
  getLeads: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.priority && params.priority !== 'ALL') query.append('priority', params.priority);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/leads${queryString}`);
  },

  // Get lead by ID
  getLeadById: (id) => request(`/leads/${id}`),

  // Create a new lead
  createLead: (leadData) => request('/leads', {
    method: 'POST',
    body: JSON.stringify(leadData),
  }),

  // Update lead
  updateLead: (id, updateData) => request(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  }),

  // Delete lead
  deleteLead: (id) => request(`/leads/${id}`, {
    method: 'DELETE',
  }),

  // Record email sent confirmation from mail server
  recordEmailSent: (id, accepted = []) => request(`/leads/${id}/email-sent`, {
    method: 'POST',
    body: JSON.stringify({ accepted }),
  }),
};
