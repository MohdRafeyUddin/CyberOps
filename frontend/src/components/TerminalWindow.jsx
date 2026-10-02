import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Copy, Check, Trash2, Maximize2, Minimize2 } from 'lucide-react';

export default function TerminalWindow({
  title = 'CYBEROPS TERMINAL',
  command = 'cyberops status',
  logs = [],
  isLoading = false,
  onClear,
}) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isLoading]);

  const copyToClipboard = () => {
    const textToCopy = `${command ? '$ ' + command + '\n' : ''}${logs.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLine = (line, index) => {
    if (typeof line !== 'string') return null;

    let textColor = 'text-slate-300';
    let prefixColor = 'text-emerald-400';

    if (line.startsWith('[+]')) {
      textColor = 'text-emerald-300';
      prefixColor = 'text-emerald-400 font-bold';
    } else if (line.startsWith('[-]')) {
      textColor = 'text-slate-400';
      prefixColor = 'text-rose-400 font-bold';
    } else if (line.startsWith('[!]')) {
      textColor = 'text-amber-300';
      prefixColor = 'text-amber-400 font-bold';
    } else if (line.startsWith('[*]')) {
      textColor = 'text-cyan-300';
      prefixColor = 'text-cyan-400 font-bold';
    } else if (line.startsWith('[i]')) {
      textColor = 'text-blue-300';
      prefixColor = 'text-blue-400 font-bold';
    } else if (line.startsWith('$')) {
      textColor = 'text-white font-semibold';
    }

    return (
      <div key={index} className="flex items-start gap-2 leading-relaxed break-all">
        <span className="text-slate-600 select-none text-[11px] w-6 text-right shrink-0">
          {(index + 1).toString().padStart(2, '0')}
        </span>
        <span className={`${textColor} font-mono text-xs sm:text-sm`}>
          {line}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden border border-emerald-500/30 bg-[#060910] shadow-2xl transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 h-auto' : 'h-[380px] sm:h-[440px]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b101c] border-b border-emerald-500/20 select-none">
        <div className="flex items-center gap-2">
          {/* Mac-style colored dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400 inline-block"></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">┌──[</span>
            <span>{title}</span>
            <span className="hidden sm:inline">]─</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onClear && (
            <button
              onClick={onClear}
              title="Clear Terminal"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={copyToClipboard}
            title="Copy Output"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1 text-xs font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="relative flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-sm space-y-1 cyber-grid bg-[#060910]/95">
        {/* Terminal Scanline overlay */}
        <div className="terminal-scanlines absolute inset-0 pointer-events-none opacity-40"></div>

        {/* Command echo if provided */}
        {command && (
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
            <span className="text-emerald-500 font-bold">$</span>
            <span className="text-slate-100">{command}</span>
          </div>
        )}

        {/* Output lines */}
        {logs.map((line, idx) => formatLine(line, idx))}

        {/* Loading animation state */}
        {isLoading && (
          <div className="flex items-center gap-2 py-1 text-cyan-400 animate-pulse">
            <span className="text-slate-600 text-[11px] w-6 text-right shrink-0">..</span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-mono text-xs sm:text-sm">Executing telemetry routines...</span>
          </div>
        )}

        {/* Interactive / Idle prompt */}
        {!isLoading && (
          <div className="flex items-center gap-2 text-slate-400 pt-1">
            <span className="text-slate-600 text-[11px] w-6 text-right shrink-0">..</span>
            <span className="text-emerald-400 font-bold">$</span>
            <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block"></span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Bottom Terminal Footer status */}
      <div className="px-4 py-1.5 bg-[#080d17] border-t border-emerald-500/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`}></span>
            {isLoading ? 'SCANNING' : 'READY'}
          </span>
          <span>UTF-8</span>
          <span>LINUX x86_64</span>
        </div>
        <div>
          <span>CYBEROPS-AGENT // SOC-SEC</span>
        </div>
      </div>
    </div>
  );
}
