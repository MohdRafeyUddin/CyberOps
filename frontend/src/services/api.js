import axios from 'axios';

// Get API base URL from environment or fallback
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Remove trailing slash if present
const BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  getHealth: async () => {
    const res = await apiClient.get('/api/health');
    return res.data;
  },

  // Dashboard Stats
  getDashboard: async () => {
    const res = await apiClient.get('/api/dashboard');
    return res.data;
  },

  // Events
  getEvents: async (params = {}) => {
    const res = await apiClient.get('/api/events', { params });
    return res.data;
  },

  createEvent: async (eventData) => {
    const res = await apiClient.post('/api/events', eventData);
    return res.data;
  },

  deleteEvent: async (eventId) => {
    const res = await apiClient.delete(`/api/events/${eventId}`);
    return res.data;
  },

  // Scanner
  runScan: async (target, scanType = 'http') => {
    const res = await apiClient.post('/api/scanner/scan', {
      target,
      scan_type: scanType,
    });
    return res.data;
  },

  // Assets
  getAssets: async () => {
    const res = await apiClient.get('/api/assets');
    return res.data;
  },

  addAsset: async (assetData) => {
    const res = await apiClient.post('/api/assets', assetData);
    return res.data;
  },

  deleteAsset: async (assetId) => {
    const res = await apiClient.delete(`/api/assets/${assetId}`);
    return res.data;
  },

  // System
  getSystemInfo: async () => {
    const res = await apiClient.get('/api/system');
    return res.data;
  },
};

export default api;
