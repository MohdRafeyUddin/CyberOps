import React, { useState } from 'react';
import {
  Radar,
  Play,
  Globe,
  Network,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';
import api from '../services/api';
import TerminalWindow from '../components/TerminalWindow';
import ConnectionBanner from '../components/ConnectionBanner';

export default function Scanner() {
  const [target, setTarget] = useState('example.com');
  const [scanType, setScanType] = useState('http');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([
    '[*] CYBEROPS Non-Intrusive Reconnaissance Suite v2.4.0',
    '[*] Select a target host/domain and scan profile to initiate diagnostics.',
    '[*] Ready for command input.',
  ]);
  const [activeCommand, setActiveCommand] = useState('');

  const sampleTargets = [
    { label: 'Example.com', val: 'example.com', type: 'http' },
    { label: 'Cloudflare DNS', val: '1.1.1.1', type: 'port' },
    { label: 'Google Public DNS', val: '8.8.8.8', type: 'dns' },
    { label: 'Localhost Gateway', val: '127.0.0.1', type: 'all' },
  ];

  const handleStartScan = async (e) => {
    if (e) e.preventDefault();
    if (!target || !target.trim()) return;

    const trimmedTarget = target.trim();
    setIsScanning(true);
    setError(null);
    setActiveCommand(`cyberops scan --target ${trimmedTarget} --profile ${scanType.toUpperCase()}`);

    // Pre-seed terminal feedback
    setTerminalLogs([
      `[*] Initializing non-intrusive safety scanner...`,
      `[*] Connecting to target: ${trimmedTarget}`,
      `[*] Executing ${scanType.toUpperCase()} inspection pipeline...`,
    ]);

    try {
      const res = await api.runScan(trimmedTarget, scanType);
      setScanResult(res);
      setTerminalLogs(res.logs || []);
    } catch (err) {
      console.error('Scan execution error:', err);
      setError('Failed to reach scanner API endpoint. Ensure backend is running.');
      setTerminalLogs((prev) => [
        ...prev,
        `[-] CRITICAL ERROR: Unable to communicate with CYBEROPS API backend.`,
        `[!] Scan aborted due to network failure.`,
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearLogs = () => {
    setTerminalLogs(['[*] Terminal buffer cleared.', '[*] Ready for command input.']);
    setActiveCommand('');
    setScanResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-tight flex items-center gap-2">
            <Radar className="w-6 h-6 text-emerald-400" />
            ASSET SECURITY SCANNER
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Perform safe, non-intrusive network diagnostics, HTTP header auditing, and port checks.
          </p>
        </div>
      </div>

      {error && <ConnectionBanner onRetry={handleStartScan} />}

      {/* Target Configuration Box */}
      <div className="bg-[#0e1626]/90 backdrop-blur-md rounded-xl p-5 border border-[#1f2e4d] shadow-lg">
        <form onSubmit={handleStartScan} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Target Input */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Target Hostname / IP Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. example.com or 192.168.1.1"
                  disabled={isScanning}
                  className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-500">
                  IPV4 / FQDN
                </span>
              </div>
            </div>

            {/* Scan Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-emerald-400" />
                Scan Profile
              </label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                disabled={isScanning}
                className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                <option value="http">HTTP / Header Check</option>
                <option value="port">Standard Port Check</option>
                <option value="dns">DNS Resolution Check</option>
                <option value="all">Full Recon Suite</option>
              </select>
            </div>
          </div>

          {/* Quick Presets & Start Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Presets:</span>
              {sampleTargets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTarget(p.val);
                    setScanType(p.type);
                  }}
                  className="px-2.5 py-1 rounded text-xs font-mono bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-300 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isScanning || !target.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                isScanning
                  ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 cursor-wait'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-green hover:scale-[1.02]'
              }`}
            >
              {isScanning ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></span>
                  SCANNING IN PROGRESS...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  START SCAN
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Structured Scan Summary if available */}
      {scanResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0e1626]/90 border border-emerald-500/30">
            <div className="text-[10px] font-mono uppercase text-slate-400">Target Resolved IP</div>
            <div className="text-base font-mono font-bold text-white mt-1">
              {scanResult.summary?.resolved_ip || 'N/A'}
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> DNS Healthy
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1626]/90 border border-cyan-500/30">
            <div className="text-[10px] font-mono uppercase text-slate-400">HTTP Protocol Status</div>
            <div className="text-base font-mono font-bold text-white mt-1">
              {scanResult.summary?.http_status ? `HTTP ${scanResult.summary.http_status}` : 'Port Only'}
            </div>
            <div className="text-xs font-mono text-cyan-400 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" />
              {scanResult.summary?.https_enabled ? 'TLS / HTTPS Active' : 'Plain HTTP'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1626]/90 border border-amber-500/30">
            <div className="text-[10px] font-mono uppercase text-slate-400">Open Ports / Services</div>
            <div className="text-base font-mono font-bold text-white mt-1">
              {scanResult.summary?.open_ports ? scanResult.summary.open_ports.join(', ') : '80, 443'}
            </div>
            <div className="text-xs font-mono text-amber-400 flex items-center gap-1 mt-1">
              <Network className="w-3 h-3" /> Filtered Firewalls
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1626]/90 border border-purple-500/30">
            <div className="text-[10px] font-mono uppercase text-slate-400">Scan Duration</div>
            <div className="text-base font-mono font-bold text-white mt-1">
              {scanResult.duration_ms} ms
            </div>
            <div className="text-xs font-mono text-purple-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Non-Intrusive Pass
            </div>
          </div>
        </div>
      )}

      {/* Terminal Window View */}
      <div>
        <TerminalWindow
          title="CYBEROPS SCANNER CONSOLE"
          command={activeCommand}
          logs={terminalLogs}
          isLoading={isScanning}
          onClear={handleClearLogs}
        />
      </div>
    </div>
  );
}
