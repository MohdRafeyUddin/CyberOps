import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Copy, Check, Trash2, Maximize2, Minimize2, Sparkles } from 'lucide-react';

export default function TerminalWindow({
  title = 'CYBEROPS / ANALYSIS',
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

    let textColor = 'text-[#F5F1E8]';
    let prefixColor = 'text-[#D4AF37]';

    if (line.startsWith('[+]') || line.includes('COMPLETE') || line.includes('ONLINE') || line.includes('SUCCESS')) {
      textColor = 'text-[#F3D77A]';
      prefixColor = 'text-[#F3D77A] font-bold';
    } else if (line.startsWith('[-]') || line.includes('ERROR') || line.includes('FAIL')) {
      textColor = 'text-[#FF8080]';
      prefixColor = 'text-[#FF4D4D] font-bold';
    } else if (line.startsWith('[!]') || line.includes('WARNING')) {
      textColor = 'text-[#FAD02C]';
      prefixColor = 'text-[#D4AF37] font-bold';
    } else if (line.startsWith('[*]')) {
      textColor = 'text-[#E8DFC8]';
      prefixColor = 'text-[#D4AF37] font-semibold';
    } else if (line.startsWith('$')) {
      textColor = 'text-[#F5F1E8] font-bold';
    }

    return (
      <div key={index} className="flex items-start gap-2.5 leading-relaxed break-all font-mono">
        <span className="text-[#8F6F1B]/70 select-none text-[11px] w-6 text-right shrink-0">
          {(index + 1).toString().padStart(2, '0')}
        </span>
        <span className={`${textColor} text-xs sm:text-sm tracking-wide`}>
          {line}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden border border-[#D4AF37]/30 bg-[#000000] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.8)] transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 h-auto' : 'h-[380px] sm:h-[440px]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#080808] border-b border-[#D4AF37]/25 select-none">
        <div className="flex items-center gap-3">
          {/* Subtle gold / dark metallic dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#333333] border border-[#555555] inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#8F6F1B]/80 border border-[#D4AF37]/40 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] border border-[#F3D77A] inline-block shadow-glow-gold-sm"></span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F3D77A] tracking-wider">
            <TerminalIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[#A69D86]">CYBEROPS /</span>
            <span className="text-[#F5F1E8]">{title.replace('CYBEROPS /', '').replace('CYBEROPS //', '').trim() || 'ANALYSIS'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {onClear && (
            <button
              onClick={onClear}
              title="Clear Terminal Buffer"
              className="p-1.5 rounded-md text-[#A69D86] hover:text-[#F5F1E8] hover:bg-[#141414] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={copyToClipboard}
            title="Copy Output"
            className="p-1.5 rounded-md text-[#A69D86] hover:text-[#F3D77A] hover:bg-[#141414] transition-colors flex items-center gap-1 text-xs font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#F3D77A]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
            className="p-1.5 rounded-md text-[#A69D86] hover:text-[#F5F1E8] hover:bg-[#141414] transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="relative flex-1 p-4 sm:p-5 overflow-y-auto font-mono text-xs sm:text-sm space-y-1.5 bg-[#000000] gold-micro-grid">
        {/* Command echo if provided */}
        {command && (
          <div className="flex items-center gap-2 text-[#F3D77A] font-semibold mb-3 bg-[#0A0A0A] p-2 rounded border border-[#D4AF37]/20">
            <span className="text-[#D4AF37] font-bold">$</span>
            <span className="text-[#F5F1E8]">{command}</span>
          </div>
        )}

        {/* Output lines */}
        {logs.map((line, idx) => formatLine(line, idx))}

        {/* Loading animation state */}
        {isLoading && (
          <div className="flex items-center gap-2 py-1.5 text-[#F3D77A]">
            <span className="text-[#8F6F1B] text-[11px] w-6 text-right shrink-0">..</span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span>
            <span className="font-mono text-xs sm:text-sm text-[#F3D77A]">
              Executing intelligence analysis pipeline...
            </span>
          </div>
        )}

        {/* Blinking gold cursor */}
        {!isLoading && (
          <div className="flex items-center gap-2 text-[#A69D86] pt-1">
            <span className="text-[#8F6F1B]/60 text-[11px] w-6 text-right shrink-0">..</span>
            <span className="text-[#D4AF37] font-bold">$</span>
            <span className="terminal-cursor"></span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Bottom Terminal Status Bar */}
      <div className="px-4 py-1.5 bg-[#060606] border-t border-[#D4AF37]/20 flex items-center justify-between text-[10px] font-mono text-[#A69D86]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#F5F1E8]">
            <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-[#F3D77A] animate-ping' : 'bg-[#D4AF37]'}`}></span>
            {isLoading ? 'ANALYZING' : 'IDLE / READY'}
          </span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline">SEC-LEVEL: HIGH</span>
        </div>
        <div className="text-[#8F6F1B] font-semibold">
          CYBEROPS-INTELLIGENCE // V1.0
        </div>
      </div>
    </div>
  );
}
