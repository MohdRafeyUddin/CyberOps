import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  HardDrive,
  RefreshCw,
  Clock,
  Radio,
  Zap,
} from 'lucide-react';
import api from '../services/api';
import TrafficChart from '../components/TrafficChart';

export default function Traffic() {
  const [trafficData, setTrafficData] = useState([]);
  const [status, setStatus] = useState(null);
  const [range, setRange] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTraffic = async () => {
    try {
      const [trafficRes, statusRes] = await Promise.all([
        api.getTraffic(range),
        api.getNetworkStatus(),
      ]);
      setTrafficData(trafficRes);
      setStatus(statusRes);
    } catch (err) {
      console.error('Failed to load traffic history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTraffic();
    const interval = setInterval(fetchTraffic, 5000);
    return () => clearInterval(interval);
  }, [range]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTraffic();
  };

  const formatBytes = (b) => {
    if (!b || b === 0) return '0 B';
    for (const unit of ['B', 'KB', 'MB', 'GB', 'TB']) {
      if (b < 1024.0) return `${b.toFixed(1)} ${unit}`;
      b /= 1024.0;
    }
    return `${b.toFixed(1)} PB`;
  };

  const formatRate = (bytesPerSec) => {
    if (!bytesPerSec || bytesPerSec < 0) return '0 B/s';
    if (bytesPerSec < 1024) return `${bytesPerSec.toFixed(0)} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(2)} MB/s`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 sm:p-6 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-[#F5F5F5] uppercase flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#D4AF37]" />
              NETWORK TRAFFIC
            </h1>
            <p className="text-xs sm:text-sm text-[#888888] font-sans">
              Real-time and historical interface bandwidth counters and throughput telemetry.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#2D2D2D] text-xs font-mono font-medium text-[#F5F5F5] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'POLLING...' : 'REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* Main Traffic Charts Card */}
      <div>
        <TrafficChart
          data={trafficData}
          range={range}
          onRangeChange={(newRange) => setRange(newRange)}
        />
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Total Download Card */}
        <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 shadow-panel space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#888888]">Total Ingress (Download)</span>
            <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400">
            {status?.total_download_formatted || 'Traffic data unavailable'}
          </div>
          <p className="text-[11px] font-mono text-[#666666]">
            Cumulative bytes received across primary interface
          </p>
        </div>

        {/* Total Upload Card */}
        <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 shadow-panel space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#888888]">Total Egress (Upload)</span>
            <ArrowUpCircle className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-sky-400">
            {status?.total_upload_formatted || 'Traffic data unavailable'}
          </div>
          <p className="text-[11px] font-mono text-[#666666]">
            Cumulative bytes transmitted across primary interface
          </p>
        </div>

        {/* Interface State Card */}
        <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 shadow-panel space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#888888]">Collector Interface</span>
            <HardDrive className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-xl font-mono font-bold text-[#F5F5F5] truncate">
            {status?.interface || 'Auto Detect'}
          </div>
          <p className="text-[11px] font-mono text-[#666666]">
            Gateway: {status?.gateway || '192.168.1.1'} &bull; Rate polling: 5s
          </p>
        </div>

      </div>

    </div>
  );
}
