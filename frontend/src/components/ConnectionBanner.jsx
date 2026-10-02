import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ConnectionBanner({ onRetry }) {
  return (
    <div className="mb-6 rounded-lg bg-red-950/80 border border-red-500/50 p-4 shadow-glow-red text-red-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-900/50 border border-red-500/30 text-red-400">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-mono font-bold text-sm text-red-400 tracking-wide">
              [!] CONNECTION ERROR
            </h4>
            <p className="text-xs text-red-300/80 font-mono mt-0.5">
              Unable to communicate with CYBEROPS API. Ensure the backend service is running on the configured endpoint.
            </p>
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-900/40 hover:bg-red-800/60 border border-red-500/40 text-xs font-mono font-medium text-red-200 transition-colors whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            RETRY CONNECTION
          </button>
        )}
      </div>
    </div>
  );
}
