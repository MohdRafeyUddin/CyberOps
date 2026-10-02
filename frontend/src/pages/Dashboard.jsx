import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Radio,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Terminal as TerminalIcon,
  Shield,
  Activity,
} from 'lucide-react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import ActivityChart from '../components/ActivityChart';
import ConnectionBanner from '../components/ConnectionBanner';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      setError(false);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-tight flex items-center gap-2">
            SECURITY INTELLIGENCE OVERVIEW
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time threat monitoring, vulnerability tracking, and infrastructure health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            REFRESH
          </button>
          <Link
            to="/scanner"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs shadow-glow-green transition-all"
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            LAUNCH SCANNER
          </Link>
        </div>
      </div>

      {error && <ConnectionBanner onRetry={fetchDashboard} />}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assets"
          value={data?.total_assets}
          subtext="Registered targets"
          icon={Server}
          color="cyan"
        />
        <StatCard
          title="Online Assets"
          value={data?.online_assets}
          subtext="Healthy & reachable"
          icon={Radio}
          color="emerald"
        />
        <StatCard
          title="Security Events"
          value={data?.security_events}
          subtext="Total telemetry logs"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Critical Alerts"
          value={data?.critical_alerts}
          subtext="Immediate action required"
          icon={ShieldAlert}
          color="red"
        />
      </div>

      {/* Activity Chart Section */}
      <div>
        <ActivityChart data={data?.activity_chart || []} />
      </div>

      {/* Recent Security Events Table */}
      <div className="bg-[#0e1626]/90 backdrop-blur-md rounded-xl border border-[#1f2e4d] overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-[#1f2e4d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider">
              Recent Security Events
            </h3>
          </div>
          <Link
            to="/events"
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            VIEW ALL EVENTS <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#090e1a]/80 text-slate-400 uppercase text-[11px] border-b border-[#1f2e4d]">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && !data ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500 font-mono">
                    <span className="animate-pulse text-cyan-400">LOADING TELEMETRY EVENTS...</span>
                  </td>
                </tr>
              ) : data?.recent_events?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500 font-mono">
                    No security events recorded yet.
                  </td>
                </tr>
              ) : (
                data?.recent_events?.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-cyan-400 font-bold">
                      #{ev.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-medium">{ev.event_type}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{ev.source}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={ev.severity} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(ev.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
