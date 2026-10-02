import React from 'react';

export default function SeverityBadge({ severity }) {
  const sev = (severity || '').toUpperCase();

  switch (sev) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-red-950/80 text-red-400 border border-red-500/50 shadow-glow-red">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-orange-950/70 text-orange-400 border border-orange-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          LOW
        </span>
      );
  }
}
