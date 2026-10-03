import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ConnectionBanner({ onRetry }) {
  return (
    <div className="mb-6 rounded-xl bg-[#120505] border border-[#FF3333]/40 p-4 shadow-[0_0_20px_-3px_rgba(255,51,51,0.2)] text-[#F5F1E8]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#260A0A] border border-[#FF3333]/40 text-[#FF6B6B]">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-mono font-bold text-xs sm:text-sm text-[#FF8080] tracking-wider uppercase">
              [!] TELEMETRY API UNREACHABLE
            </h4>
            <p className="text-xs text-[#A69D86] font-mono mt-0.5">
              Unable to establish handshake with CYBEROPS backend services. Check endpoint configuration.
            </p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1F0C0C] hover:bg-[#331414] border border-[#FF4D4D]/50 text-xs font-mono font-semibold text-[#FFA3A3] transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            RETRY HANDSHAKE
          </button>
        )}
      </div>
    </div>
  );
}
