import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]',
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.15)]',
    },
    red: {
      border: 'border-red-500/20 hover:border-red-500/50',
      iconBg: 'bg-red-500/10 text-red-400',
      text: 'text-red-400',
      glow: 'shadow-[0_0_15px_-3px_rgba(239,68,68,0.15)]',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div
      className={`relative overflow-hidden bg-[#0e1626]/90 backdrop-blur-md rounded-xl p-5 border transition-all duration-300 ${scheme.border} ${scheme.glow}`}
    >
      {/* Subtle corner tech decoration */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-400"></div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold font-mono text-white mt-1 tracking-tight">
            {value !== undefined ? value : '--'}
          </h3>
          {subtext && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
              {subtext}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${scheme.iconBg} border border-white/5`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
