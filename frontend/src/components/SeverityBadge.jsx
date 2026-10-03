import React from 'react';

export default function SeverityBadge({ severity }) {
  const sev = (severity || '').toUpperCase();

  switch (sev) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#1C0505] text-[#FF6B6B] border border-[#FF3333]/50 shadow-[0_0_12px_-2px_rgba(255,51,51,0.3)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3333] animate-pulse"></span>
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#1A1405] text-[#F3D77A] border border-[#D4AF37]/70 shadow-[0_0_12px_-2px_rgba(212,175,55,0.25)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-[#12100A] text-[#D4AF37] border border-[#D4AF37]/35">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/70"></span>
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-medium bg-[#0A0A0A] text-[#A69D86] border border-[#A69D86]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A69D86]"></span>
          LOW
        </span>
      );
  }
}
