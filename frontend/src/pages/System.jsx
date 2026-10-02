import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Server,
  Database,
  Globe,
  Radio,
  Clock,
  ShieldCheck,
  RefreshCw,
  Terminal as TerminalIcon,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import TerminalWindow from '../components/TerminalWindow';
import ConnectionBanner from '../components/ConnectionBanner';

export default function System() {
  const [sysInfo, setSysInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [latency, setLatency] = useState(null);
  const [pinging, setPinging] = useState(false);
  const [sysLogs, setSysLogs] = useState([
    '[*] System monitor initialized.',
    '[*] Subsystems reporting nominal telemetry.',
  ]);

  const fetchSystemData = async () => {
    try {
      setError(false);
      const start = Date.now();
      const data = await api.getSystemInfo();
      const elapsed = Date.now() - start;
      setLatency(elapsed);
      setSysInfo(data);
      setSysLogs((prev) => [
        `[+] Heartbeat check: API [ONLINE], Database [${data.database_status}], Latency [${elapsed}ms]`,
        `[*] Runtime: Python ${data.python_version || '3.11'} on ${data.platform || 'Linux'}`,
        ...prev.slice(0, 15),
      ]);
    } catch (err) {
      console.error('System query error:', err);
      setError(true);
      setLatency(null);
    } finally {
      setLoading(false);
      setPinging(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePing = () => {
    setPinging(true);
    fetchSystemData();
  };

  const formatUptime = (sec) => {
    if (!sec && sec !== 0) return '--';
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs}h ${mins}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            SYSTEM DIAGNOSTICS & STATUS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Infrastructure telemetry, microservice health, and configuration metadata.
          </p>
        </div>

        <button
          onClick={handlePing}
          disabled={pinging}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-xs font-mono text-slate-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin text-emerald-400' : ''}`} />
          EXECUTE HEARTBEAT PING
        </button>
      </div>

      {error && <ConnectionBanner onRetry={fetchSystemData} />}

      {/* Grid of System Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* API Backend Card */}
        <div className="bg-[#0e1626]/90 backdrop-blur-md rounded-xl p-5 border border-emerald-500/30 shadow-glow-green">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-mono text-xs uppercase font-semibold">
              <Server className="w-4 h-4 text-emerald-400" />
              API Server
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/50">
              {sysInfo?.api_status || (error ? 'OFFLINE' : 'ONLINE')}
            </span>
          </div>
          <div className="mt-4 space-y-1 font-mono text-xs">
            <div className="text-slate-400 flex justify-between">
              <span>Framework:</span>
              <span className="text-slate-200">FastAPI + Uvicorn</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>Port:</span>
              <span className="text-slate-200">8000</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>Latency:</span>
              <span className="text-emerald-400 font-bold">{latency !== null ? `${latency} ms` : '--'}</span>
            </div>
          </div>
        </div>

        {/* Database Card */}
        <div className="bg-[#0e1626]/90 backdrop-blur-md rounded-xl p-5 border border-cyan-500/30 shadow-glow-cyan">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-mono text-xs uppercase font-semibold">
              <Database className="w-4 h-4 text-cyan-400" />
              Database Engine
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                sysInfo?.database_status === 'ONLINE'
                  ? 'bg-cyan-950 text-cyan-400 border-cyan-500/50'
                  : 'bg-red-950 text-red-400 border-red-500/50'
              }`}
            >
              {sysInfo?.database_status || 'OFFLINE'}
            </span>
          </div>
          <div className="mt-4 space-y-1 font-mono text-xs">
            <div className="text-slate-400 flex justify-between">
              <span>Engine:</span>
              <span className="text-slate-200">SQLite / SQLAlchemy</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>Mode:</span>
              <span className="text-slate-200">Persistent Disk</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>Connection:</span>
              <span className="text-cyan-400 font-bold">Active Pool</span>
            </div>
          </div>
        </div>

        {/* Frontend Web Card */}
        <div className="bg-[#0e1626]/90 backdrop-blur-md rounded-xl p-5 border border-purple-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300 font-mono text-xs uppercase font-semibold">
              <Globe className="w-4 h-4 text-purple-400" />
              Frontend UI
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/50">
              ONLINE
            </span>
          </div>
          <div className="mt-4 space-y-1 font-mono text-xs">
            <div className="text-slate-400 flex justify-between">
              <span>Runtime:</span>
              <span className="text-slate-200">React + Vite + Nginx</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>Client Host:</span>
              <span className="text-slate-200">{window.location.host}</span>
            </div>
            <div className="text-slate-400 flex justify-between">
              <span>Styling:</span>
              <span className="text-purple-300 font-bold">Tailwind SOC Theme</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Specification Table */}
      <div className="bg-[#0e1626]/90 backdrop-blur-md rounded-xl p-5 border border-[#1f2e4d]">
        <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          SYSTEM CONFIGURATION & SPECS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[11px]">API VERSION</div>
            <div className="text-white font-bold text-sm mt-0.5">
              {sysInfo?.api_version || 'v1.0.0'}
            </div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[11px]">APP VERSION</div>
            <div className="text-white font-bold text-sm mt-0.5">
              {sysInfo?.app_version || '1.0.0'}
            </div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[11px]">ENVIRONMENT</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5 uppercase">
              {sysInfo?.environment || 'PRODUCTION'}
            </div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-[11px]">SYSTEM UPTIME</div>
            <div className="text-cyan-400 font-bold text-sm mt-0.5">
              {formatUptime(sysInfo?.uptime_seconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Live Diagnostic Logs Terminal */}
      <div>
        <TerminalWindow
          title="CYBEROPS SYSTEM MONITOR CONSOLE"
          command="cyberops sysinfo --verbose"
          logs={sysLogs}
          isLoading={pinging}
          onClear={() => setSysLogs(['[*] Console cleared.'])}
        />
      </div>
    </div>
  );
}
