import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Laptop,
  ArrowDownCircle,
  ArrowUpCircle,
  Activity,
  RefreshCw,
  Router as RouterIcon,
  Wifi,
  ArrowUpRight,
  Shield,
  Clock,
  Radio,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import DeviceTypeIcon from '../components/DeviceTypeIcon';
import NetworkTopologyMap from '../components/NetworkTopologyMap';
import DeviceDetailsModal from '../components/DeviceDetailsModal';

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  const [deviceData, setDeviceData] = useState({ total_devices: 0, online_devices: 0, devices: [] });
  const [events, setEvents] = useState([]);
  const [topology, setTopology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [lastVerifiedTime, setLastVerifiedTime] = useState(new Date().toLocaleTimeString());

  const fetchDashboardData = async (shouldRefresh = false) => {
    try {
      const [statusRes, devicesRes, eventsRes, topoRes] = await Promise.all([
        api.getNetworkStatus(),
        api.getDevices(shouldRefresh ? { refresh: true } : {}),
        api.getNetworkEvents({ limit: 6 }),
        api.getTopology(),
      ]);
      setStatus(statusRes);
      setDeviceData(devicesRes);
      setEvents(eventsRes);
      setTopology(topoRes);
      setLastVerifiedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
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

  const isOnline = status?.network_status === 'ONLINE';
  const onlineCount = deviceData.online_devices;
  const totalCount = deviceData.total_devices;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Hero Header Card */}
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-6 sm:p-7 shadow-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-[#F5F5F5] uppercase flex items-center gap-2.5">
              <Wifi className="w-5 h-5 text-[#D4AF37]" />
              YOUR NETWORK AT A GLANCE
            </h1>
            <p className="text-xs sm:text-sm text-[#888888] font-sans">
              Monitor devices, bandwidth and network activity across your home network.
            </p>

            {/* Quick Network Metadata Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[#666666]">Network:</span>
                <span className={`font-semibold ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#666666]">Gateway:</span>
                <span className="text-[#F5F5F5] font-medium">{status?.gateway || '192.168.1.1'}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#666666]">Interface:</span>
                <span className="text-[#F5F5F5]">{status?.interface || 'Auto Detect'}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#666666]">Last Verified:</span>
                <span className="text-[#D4AF37] font-semibold">{lastVerifiedTime}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#2D2D2D] hover:border-[#3D3D3D] text-xs font-mono font-medium text-[#F5F5F5] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'PROBING LAN...' : 'REFRESH'}</span>
            </button>

            <Link
              to="/devices"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#F3D77A] text-black font-mono font-bold text-xs transition-colors"
            >
              <span>ALL DEVICES</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="CONNECTED DEVICES"
          value={status?.collector_online ? onlineCount : null}
          subtext={status?.collector_online ? `${totalCount} known / ${onlineCount} online` : 'Collector offline'}
          icon={Laptop}
          statusColor="text-[#F5F5F5]"
          badge={status?.collector_online ? `${totalCount} KNOWN` : null}
        />
        <StatCard
          title="TOTAL DOWNLOAD"
          value={status?.total_download_formatted}
          subtext="Interface ingress"
          icon={ArrowDownCircle}
          statusColor="text-emerald-400"
        />
        <StatCard
          title="TOTAL UPLOAD"
          value={status?.total_upload_formatted}
          subtext="Interface egress"
          icon={ArrowUpCircle}
          statusColor="text-sky-400"
        />
        <StatCard
          title="NETWORK STATUS"
          value={status?.network_status}
          subtext={isOnline ? `${onlineCount} active hosts on LAN` : 'Collector agent offline'}
          icon={Activity}
          statusColor={isOnline ? 'text-emerald-400' : 'text-red-400'}
        />
      </div>

      {/* Network Topology Map */}
      <div>
        <NetworkTopologyMap
          topology={topology}
          onSelectDevice={(node) => {
            if (node.id.startsWith('dev_')) {
              const devId = parseInt(node.id.replace('dev_', ''), 10);
              setSelectedDeviceId(devId);
            }
          }}
        />
      </div>

      {/* Two Column Section: Connected Devices Preview & Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Connected Devices Quick List (2 cols) */}
        <div className="lg:col-span-2 bg-[#0B0B0B] border border-[#222222] rounded-xl overflow-hidden shadow-panel">
          <div className="p-4 sm:p-5 border-b border-[#1C1C1C] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-mono font-bold text-xs sm:text-sm text-[#F5F5F5] uppercase tracking-wider">
                CONNECTED DEVICES ({onlineCount})
              </h3>
              <span className="text-[11px] font-mono text-[#888888] ml-2">
                ({totalCount} known / {onlineCount} online)
              </span>
            </div>
            <Link
              to="/devices"
              className="text-xs font-mono text-[#D4AF37] hover:text-[#F3D77A] flex items-center gap-1 transition-colors"
            >
              <span>MANAGE INVENTORY</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left monitor-table font-mono text-xs">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>IP Address</th>
                  <th>MAC Address</th>
                  <th>Vendor</th>
                  <th>Last Seen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-[#777777]">
                      Discovering local devices...
                    </td>
                  </tr>
                ) : deviceData.devices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-[#777777]">
                      No devices discovered. Run the collector agent to scan network.
                    </td>
                  </tr>
                ) : (
                  deviceData.devices.slice(0, 7).map((dev) => (
                    <tr
                      key={dev.id}
                      onClick={() => setSelectedDeviceId(dev.id)}
                      className="cursor-pointer hover:bg-[#121212] transition-colors"
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <DeviceTypeIcon type={dev.device_type || dev.vendor} isGateway={dev.is_gateway} />
                          <span className="font-semibold text-[#F5F5F5] truncate max-w-[140px]">
                            {dev.custom_name || dev.hostname || `Device ${dev.ip}`}
                          </span>
                        </div>
                      </td>
                      <td className="text-[#888888]">{dev.ip}</td>
                      <td className="text-[#777777] text-[11px]">{dev.mac || 'N/A'}</td>
                      <td className="text-[#888888] truncate max-w-[120px]">{dev.vendor}</td>
                      <td className="text-[#777777] text-[11px]">{formatTimeAgo(dev.last_seen)}</td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            dev.status === 'ONLINE'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dev.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                          {dev.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Events (1 col) */}
        <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl overflow-hidden shadow-panel flex flex-col">
          <div className="p-4 sm:p-5 border-b border-[#1C1C1C] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-mono font-bold text-xs sm:text-sm text-[#F5F5F5] uppercase tracking-wider">
                NETWORK EVENTS
              </h3>
            </div>
            <Link
              to="/events"
              className="text-xs font-mono text-[#D4AF37] hover:text-[#F3D77A] flex items-center gap-1 transition-colors"
            >
              <span>VIEW ALL</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-[#666666]">
                No network events recorded yet.
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C] text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F5F5F5] truncate">{ev.event_type}</span>
                    <span className="text-[10px] text-[#666666]">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888888] line-clamp-2">{ev.details}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Device Details Modal */}
      {selectedDeviceId && (
        <DeviceDetailsModal
          deviceId={selectedDeviceId}
          onClose={() => setSelectedDeviceId(null)}
          onDeviceUpdated={() => fetchDashboardData()}
          onDeviceDeleted={() => fetchDashboardData()}
        />
      )}

    </div>
  );
}
