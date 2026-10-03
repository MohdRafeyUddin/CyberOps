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
  Check,
  Shield,
  Layers,
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
    '[*] CYBEROPS Security Analysis Engine v1.0.0',
    '[*] Select an authorized asset or endpoint to initiate security analysis.',
    '[*] Ready for operator command.',
  ]);
  const [activeCommand, setActiveCommand] = useState('');

  const sampleTargets = [
    { label: 'example.com', val: 'example.com', type: 'http' },
    { label: 'Cloudflare DNS (1.1.1.1)', val: '1.1.1.1', type: 'port' },
    { label: 'Google Public DNS (8.8.8.8)', val: '8.8.8.8', type: 'dns' },
    { label: 'Localhost Gateway (127.0.0.1)', val: '127.0.0.1', type: 'all' },
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
      `[*] Initializing security analysis engine...`,
      `[*] Target resolved: ${trimmedTarget}`,
      `[*] Dispatching ${scanType.toUpperCase()} security audit profile...`,
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
        `[!] Analysis pipeline aborted due to network timeout.`,
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearLogs = () => {
    setTerminalLogs(['[*] Terminal buffer cleared.', '[*] Ready for operator command.']);
    setActiveCommand('');
    setScanResult(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#080808] border border-[#D4AF37]/25 p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0D0D] border border-[#D4AF37]/30 text-[11px] font-mono text-[#F3D77A]">
              <Radar className="w-3 h-3 text-[#D4AF37]" />
              <span>SECURITY ANALYSIS CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight text-[#F5F1E8]">
              TARGET <span className="text-gold-gradient">ANALYSIS</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A69D86] font-light">
              Analyze authorized assets and review security observations.
            </p>
          </div>
        </div>
      </div>

      {error && <ConnectionBanner onRetry={handleStartScan} />}

      {/* Target Configuration Console Box */}
      <div className="bg-[#080808] rounded-2xl p-6 sm:p-8 border border-[#D4AF37]/25 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.6)]">
        <form onSubmit={handleStartScan} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Target Input */}
            <div className="lg:col-span-2 space-y-2">
              <label className="text-xs font-mono font-bold text-[#F3D77A] uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                TARGET DOMAIN / IP
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="example.com or 192.168.1.1"
                  disabled={isScanning}
                  className="w-full bg-[#020202] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl px-4 py-3.5 text-sm font-mono text-[#F5F1E8] placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-inner"
                  required
                />
                <span className="absolute right-3.5 top-3.5 text-[11px] font-mono text-[#8F6F1B] px-2 py-0.5 rounded bg-[#0D0D0D] border border-[#D4AF37]/20">
                  FQDN / IPV4
                </span>
              </div>
            </div>

            {/* Scan Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#F3D77A] uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4 text-[#D4AF37]" />
                SCAN PROFILE
              </label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                disabled={isScanning}
                className="w-full bg-[#020202] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl px-4 py-3.5 text-sm font-mono text-[#F5F1E8] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-inner"
              >
                <option value="http" className="bg-black text-[#F5F1E8]">HTTP CHECK</option>
                <option value="port" className="bg-black text-[#F5F1E8]">PORT CHECK</option>
                <option value="dns" className="bg-black text-[#F5F1E8]">DNS CHECK</option>
                <option value="all" className="bg-black text-[#F5F1E8]">FULL RECON SUITE</option>
              </select>
            </div>
          </div>

          {/* Quick Presets & Start Analysis Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#D4AF37]/15">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-[#A69D86] uppercase tracking-wider mr-1">
                PRESETS:
              </span>
              {sampleTargets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTarget(p.val);
                    setScanType(p.type);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#0D0D0D] hover:bg-[#1A1A1A] border border-[#D4AF37]/25 hover:border-[#D4AF37] text-[#A69D86] hover:text-[#F3D77A] transition-all duration-200"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isScanning || !target.trim()}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-glow-gold ${
                isScanning
                  ? 'bg-[#141414] text-[#F3D77A] border border-[#D4AF37]/40 cursor-wait'
                  : 'bg-gradient-to-r from-[#F3D77A] via-[#D4AF37] to-[#8F6F1B] hover:from-[#FFF0B8] hover:via-[#F3D77A] hover:to-[#D4AF37] text-black hover:scale-[1.02]'
              }`}
            >
              {isScanning ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>ANALYSIS IN PROGRESS...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>START ANALYSIS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Structured Scan Summary Results */}
      {scanResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-5 rounded-xl bg-[#080808] border border-[#D4AF37]/35 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#A69D86]">Target Resolved IP</div>
            <div className="text-lg font-serif font-bold text-[#F5F1E8] mt-1">
              {scanResult.summary?.resolved_ip || 'N/A'}
            </div>
            <div className="text-xs font-mono text-[#F3D77A] flex items-center gap-1.5 mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> DNS Resolved
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080808] border border-[#D4AF37]/35 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#A69D86]">HTTP Protocol Status</div>
            <div className="text-lg font-serif font-bold text-[#F5F1E8] mt-1">
              {scanResult.summary?.http_status ? `HTTP ${scanResult.summary.http_status}` : 'Port Only'}
            </div>
            <div className="text-xs font-mono text-[#F3D77A] flex items-center gap-1.5 mt-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              {scanResult.summary?.https_enabled ? 'HTTPS / TLS Secured' : 'Unencrypted HTTP'}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080808] border border-[#D4AF37]/35 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#A69D86]">Open Ports / Services</div>
            <div className="text-lg font-serif font-bold text-[#F5F1E8] mt-1">
              {scanResult.summary?.open_ports ? scanResult.summary.open_ports.join(', ') : '80, 443'}
            </div>
            <div className="text-xs font-mono text-[#D4AF37] flex items-center gap-1.5 mt-1.5">
              <Network className="w-3.5 h-3.5 text-[#D4AF37]" /> Filtered Ports
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#080808] border border-[#D4AF37]/35 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#A69D86]">Analysis Execution Time</div>
            <div className="text-lg font-serif font-bold text-[#F3D77A] mt-1">
              {scanResult.duration_ms} ms
            </div>
            <div className="text-xs font-mono text-[#A69D86] flex items-center gap-1.5 mt-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> Safe Inspection Pass
            </div>
          </div>
        </div>
      )}

      {/* Terminal Window View */}
      <div>
        <TerminalWindow
          title="CYBEROPS / ANALYSIS"
          command={activeCommand}
          logs={terminalLogs}
          isLoading={isScanning}
          onClear={handleClearLogs}
        />
      </div>
    </div>
  );
}
