import axios from 'axios';

// Get API base URL from environment or fallback
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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

  // Network Status
  getNetworkStatus: async () => {
    const res = await apiClient.get('/api/network/status');
    return res.data;
  },

  // Devices
  getDevices: async (params = {}) => {
    const res = await apiClient.get('/api/network/devices', { params });
    // Normalize response: returns { total_devices, online_devices, devices }
    const data = res.data;
    if (Array.isArray(data)) {
      const online = data.filter((d) => d.status === 'ONLINE').length;
      return {
        total_devices: data.length,
        online_devices: online,
        devices: data,
      };
    }
    return {
      total_devices: data.total_devices || (data.devices ? data.devices.length : 0),
      online_devices: data.online_devices !== undefined ? data.online_devices : 0,
      devices: data.devices || [],
    };
  },

  getDeviceDetails: async (deviceId) => {
    const res = await apiClient.get(`/api/network/devices/${deviceId}`);
    return res.data;
  },

  updateDevice: async (deviceId, data) => {
    const res = await apiClient.put(`/api/network/devices/${deviceId}`, data);
    return res.data;
  },

  deleteDevice: async (deviceId) => {
    const res = await apiClient.delete(`/api/network/devices/${deviceId}`);
    return res.data;
  },

  // Traffic
  getTraffic: async (range = '1h') => {
    const res = await apiClient.get('/api/network/traffic', { params: { range } });
    return res.data;
  },

  // Network Events
  getNetworkEvents: async (params = {}) => {
    const res = await apiClient.get('/api/network/events', { params });
    return res.data;
  },

  // Topology Map
  getTopology: async () => {
    const res = await apiClient.get('/api/network/topology');
    return res.data;
  },

  // Settings
  getSettings: async () => {
    const res = await apiClient.get('/api/network/settings');
    return res.data;
  },

  saveSettings: async (settingsData) => {
    const res = await apiClient.post('/api/network/settings', settingsData);
    return res.data;
  },

  // WebSocket URL Generator
  getWebSocketUrl: () => {
    const wsProtocol = BASE_URL.startsWith('https') ? 'wss:' : 'ws:';
    const host = BASE_URL.replace(/^https?:\/\//, '');
    return `${wsProtocol}//${host}/ws/network`;
  },
};

export default api;
