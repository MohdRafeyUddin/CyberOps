import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Wifi,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import DeviceTypeIcon from '../components/DeviceTypeIcon';
import DeviceDetailsModal from '../components/DeviceDetailsModal';

export default function Devices() {
  const [deviceData, setDeviceData] = useState({ total_devices: 0, online_devices: 0, devices: [] });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(new Date().toLocaleTimeString());

  const fetchDevices = async (shouldRefresh = false) => {
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.device_type = typeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (shouldRefresh) params.refresh = true;

      const data = await api.getDevices(params);
      setDeviceData(data);
      setLastRefreshedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, [statusFilter, typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDevices();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDevices(true);
  };

  const parseUtcDate = (dateStr) => {
    if (!dateStr) return null;
    const s = typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')
      ? `${dateStr}Z`
      : dateStr;
    return new Date(s);
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '--';
    const parsed = parseUtcDate(dateStr);
    const diffMs = new Date() - parsed;
    const seconds = Math.max(0, Math.floor(diffMs / 1000));
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const formatBytes = (b) => {
    if (!b || b === 0) return '0 B';
    for (const unit of ['B', 'KB', 'MB', 'GB', 'TB']) {
      if (b < 1024.0) return `${b.toFixed(1)} ${unit}`;
      b /= 1024.0;
    }
    return `${b.toFixed(1)} PB`;
  };

  const deviceTypes = [
    'ALL',
    'Smartphone',
    'Laptop / PC',
    'Smart TV',
    'IoT Device',
    'Gateway / Router',
    'Gaming Console',
    'Printer',
    'Network Client',
  ];

  const deviceList = deviceData.devices || [];
  const totalCount = deviceData.total_devices || deviceList.length;
  const onlineCount = deviceData.online_devices !== undefined ? deviceData.online_devices : deviceList.filter(d => d.status === 'ONLINE').length;
  const offlineCount = Math.max(0, totalCount - onlineCount);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 sm:p-6 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-[#F5F5F5] uppercase flex items-center gap-2.5">
              <Laptop className="w-5 h-5 text-[#D4AF37]" />
              CONNECTED DEVICES ({onlineCount})
            </h1>
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs font-mono">
              <span className="text-[#D4AF37] font-semibold">
                {totalCount} known / {onlineCount} online
              </span>
              <span className="text-[#555555]">&bull;</span>
              <span className="text-[#888888]">
                Last Refreshed: <span className="text-[#F5F5F5]">{lastRefreshedTime}</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#2D2D2D] text-xs font-mono font-medium text-[#F5F5F5] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'PROBING LAN...' : 'REFRESH LIST'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-4 shadow-panel space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Status Tabs with counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: `ALL (${totalCount})` },
              { id: 'ONLINE', label: `ONLINE (${onlineCount})` },
              { id: 'OFFLINE', label: `OFFLINE (${offlineCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#1C1C1C] text-[#F5F5F5] font-bold border border-[#333333]'
                    : 'bg-[#121212] text-[#888888] hover:text-[#F5F5F5] border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hostname, IP, MAC, vendor..."
                className="w-full bg-[#050505] border border-[#222222] focus:border-[#D4AF37] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-[#F5F5F5] placeholder-[#555555] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#2D2D2D] text-xs font-mono text-[#F5F5F5]"
            >
              Search
            </button>
          </form>

        </div>
      </div>

      {/* Connected Devices Table (Desktop) */}
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl overflow-hidden shadow-panel">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left monitor-table font-mono text-xs">
            <thead>
              <tr>
                <th>DEVICE</th>
                <th>IP ADDRESS</th>
                <th>MAC ADDRESS</th>
                <th>VENDOR</th>
                <th>STATUS</th>
                <th>FIRST SEEN</th>
                <th>LAST SEEN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-[#888888]">
                    Retrieving connected device inventory...
                  </td>
                </tr>
              ) : deviceList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-[#888888]">
                    No matching devices found on home network.
                  </td>
                </tr>
              ) : (
                deviceList.map((dev) => (
                  <tr
                    key={dev.id}
                    onClick={() => setSelectedDeviceId(dev.id)}
                    className="cursor-pointer hover:bg-[#111111] transition-colors"
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[#161616] border border-[#222222] flex items-center justify-center shrink-0">
                          <DeviceTypeIcon type={dev.device_type || dev.vendor} isGateway={dev.is_gateway} />
                        </div>
                        <div>
                          <div className="font-semibold text-[#F5F5F5] truncate max-w-xs">
                            {dev.custom_name || dev.hostname || `Device ${dev.ip || dev.ip_address}`}
                          </div>
                          <div className="text-[10px] text-[#666666]">
                            {dev.device_type}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="font-bold text-[#F5F5F5]">{dev.ip_address || dev.ip}</td>

                    <td className="text-[#888888] text-[11px]">{dev.mac_address || dev.mac || 'N/A'}</td>

                    <td className="text-[#A69D86] font-medium">{dev.vendor}</td>

                    <td>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold ${
                          dev.status === 'ONLINE'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                        {dev.status}
                      </span>
                    </td>

                    <td className="text-[#888888]">{formatTimeAgo(dev.first_seen)}</td>

                    <td className="text-[#D4AF37] font-medium">{formatTimeAgo(dev.last_seen)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Device Cards View */}
        <div className="md:hidden divide-y divide-[#1A1A1A]">
          {loading ? (
            <div className="text-center py-10 text-xs font-mono text-[#888888]">
              Loading devices...
            </div>
          ) : deviceList.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono text-[#888888]">
              No devices found.
            </div>
          ) : (
            deviceList.map((dev) => (
              <div
                key={dev.id}
                onClick={() => setSelectedDeviceId(dev.id)}
                className="p-4 flex items-center justify-between hover:bg-[#121212] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center shrink-0">
                    <DeviceTypeIcon type={dev.device_type || dev.vendor} isGateway={dev.is_gateway} />
                  </div>
                  <div className="truncate">
                    <div className="font-mono font-bold text-xs text-[#F5F5F5] truncate">
                      {dev.custom_name || dev.hostname || `Device ${dev.ip || dev.ip_address}`}
                    </div>
                    <div className="text-[11px] font-mono text-[#888888]">
                      {dev.ip_address || dev.ip} &bull; {dev.vendor}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dev.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-zinc-600'
                    }`}
                  />
                  <ChevronRight className="w-4 h-4 text-[#555555]" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Device Details Modal */}
      {selectedDeviceId && (
        <DeviceDetailsModal
          deviceId={selectedDeviceId}
          onClose={() => setSelectedDeviceId(null)}
          onDeviceUpdated={() => fetchDevices()}
          onDeviceDeleted={() => fetchDevices()}
        />
      )}

    </div>
  );
}
