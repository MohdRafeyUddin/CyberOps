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
  Sparkles,
  Layers,
  Activity,
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
    '[*] CYBEROPS System Diagnostics daemon initialized.',
    '[*] Health check routines active and reporting nominal telemetry.',
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
        `[+] Telemetry Heartbeat: API [ONLINE], Database [${data.database_status}], Latency [${elapsed}ms]`,
        `[*] Runtime Environment: Python ${data.python_version || '3.11'} on ${data.platform || 'Linux'}`,
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#080808] border border-[#D4AF37]/25 p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0D0D] border border-[#D4AF37]/30 text-[11px] font-mono text-[#F3D77A]">
              <Cpu className="w-3 h-3 text-[#D4AF37]" />
              <span>PLATFORM DIAGNOSTICS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight text-[#F5F1E8]">
              SYSTEM <span className="text-gold-gradient">STATUS</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A69D86] font-light">
              Infrastructure telemetry, microservice health, and configuration metadata.
            </p>
          </div>

          <button
            onClick={handlePing}
            disabled={pinging}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#141414] text-xs font-mono font-bold text-[#F5F1E8] transition-all duration-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${pinging ? 'animate-spin' : ''}`} />
            <span>EXECUTE HEARTBEAT PING</span>
          </button>
        </div>
      </div>

      {error && <ConnectionBanner onRetry={fetchSystemData} />}

      {/* Grid of Microservice Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* API Backend Card */}
        <div className="bg-[#080808] rounded-xl p-6 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#F5F1E8] font-mono text-xs uppercase font-bold tracking-wider">
              <Server className="w-4 h-4 text-[#D4AF37]" />
              <span>API SERVER</span>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#0E1A0A] text-[#93E993] border border-[#4ADE80]/40">
              {sysInfo?.api_status || (error ? 'OFFLINE' : 'ONLINE')}
            </span>
          </div>

          <div className="mt-5 space-y-2 font-mono text-xs pt-4 border-t border-[#D4AF37]/15">
            <div className="text-[#A69D86] flex justify-between">
              <span>Framework:</span>
              <span className="text-[#F5F1E8] font-semibold">FastAPI + Uvicorn</span>
            </div>
            <div className="text-[#A69D86] flex justify-between">
              <span>Port:</span>
              <span className="text-[#F5F1E8]">8000</span>
            </div>
            <div className="text-[#A69D86] flex justify-between">
              <span>Response Latency:</span>
              <span className="text-[#F3D77A] font-bold">{latency !== null ? `${latency} ms` : '--'}</span>
            </div>
          </div>
        </div>

        {/* Database Card */}
        <div className="bg-[#080808] rounded-xl p-6 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#F5F1E8] font-mono text-xs uppercase font-bold tracking-wider">
              <Database className="w-4 h-4 text-[#D4AF37]" />
              <span>DATABASE ENGINE</span>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                sysInfo?.database_status === 'ONLINE'
                  ? 'bg-[#0E1A0A] text-[#93E993] border-[#4ADE80]/40'
                  : 'bg-[#1C0505] text-[#FF6B6B] border-[#FF3333]/50'
              }`}
            >
              {sysInfo?.database_status || 'OFFLINE'}
            </span>
          </div>

          <div className="mt-5 space-y-2 font-mono text-xs pt-4 border-t border-[#D4AF37]/15">
            <div className="text-[#A69D86] flex justify-between">
              <span>Storage Driver:</span>
              <span className="text-[#F5F1E8] font-semibold">SQLite / SQLAlchemy</span>
            </div>
            <div className="text-[#A69D86] flex justify-between">
              <span>Persistence:</span>
              <span className="text-[#F5F1E8]">Encrypted Disk Pool</span>
            </div>
            <div className="text-[#A69D86] flex justify-between">
              <span>Telemetry State:</span>
              <span className="text-[#D4AF37] font-bold">Active Stream</span>
            </div>
          </div>
        </div>

        {/* Frontend Web Card */}
        <div className="bg-[#080808] rounded-xl p-6 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#F5F1E8] font-mono text-xs uppercase font-bold tracking-wider">
              <Globe className="w-4 h-4 text-[#D4AF37]" />
              <span>FRONTEND UI</span>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#0E1A0A] text-[#93E993] border border-[#4ADE80]/40">
              ONLINE
            </span>
          </div>

          <div className="mt-5 space-y-2 font-mono text-xs pt-4 border-t border-[#D4AF37]/15">
            <div className="text-[#A69D86] flex justify-between">
              <span>Architecture:</span>
              <span className="text-[#F5F1E8] font-semibold">React + Vite + Tailwind</span>
            </div>
            <div className="text-[#A69D86] flex justify-between">
              <span>Client Host:</span>
              <span className="text-[#F5F1E8] truncate max-w-[140px]">{window.location.host}</span>
            </div>
            <div className="text-[#A69D86] flex justify-between">
              <span>Visual Theme:</span>
              <span className="text-[#F3D77A] font-bold">Aurum Black & Gold</span>
            </div>
          </div>
        </div>

      </div>

      {/* Metadata Specification Grid */}
      <div className="bg-[#080808] rounded-xl p-6 border border-[#D4AF37]/25 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <h3 className="font-serif font-bold text-sm text-[#F5F1E8] uppercase tracking-wider mb-5 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>ENVIRONMENT & METRICS SPECIFICATION</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 bg-[#020202] rounded-xl border border-[#D4AF37]/20">
            <div className="text-[#A69D86] text-[11px] uppercase tracking-wider">API VERSION</div>
            <div className="text-[#F5F1E8] font-bold text-base mt-1">
              {sysInfo?.api_version || 'v1.0.0'}
            </div>
          </div>

          <div className="p-4 bg-[#020202] rounded-xl border border-[#D4AF37]/20">
            <div className="text-[#A69D86] text-[11px] uppercase tracking-wider">APP VERSION</div>
            <div className="text-[#F5F1E8] font-bold text-base mt-1">
              {sysInfo?.app_version || '1.0.0'}
            </div>
          </div>

          <div className="p-4 bg-[#020202] rounded-xl border border-[#D4AF37]/20">
            <div className="text-[#A69D86] text-[11px] uppercase tracking-wider">ENVIRONMENT</div>
            <div className="text-[#F3D77A] font-bold text-base mt-1 uppercase">
              {sysInfo?.environment || 'PRODUCTION'}
            </div>
          </div>

          <div className="p-4 bg-[#020202] rounded-xl border border-[#D4AF37]/20">
            <div className="text-[#A69D86] text-[11px] uppercase tracking-wider">SYSTEM UPTIME</div>
            <div className="text-[#D4AF37] font-bold text-base mt-1">
              {formatUptime(sysInfo?.uptime_seconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Live Diagnostic Logs Terminal */}
      <div>
        <TerminalWindow
          title="CYBEROPS / SYSTEM DIAGNOSTICS"
          command="cyberops sysinfo --verbose"
          logs={sysLogs}
          isLoading={pinging}
          onClear={() => setSysLogs(['[*] Diagnostics console buffer reset.'])}
        />
      </div>
    </div>
  );
}
