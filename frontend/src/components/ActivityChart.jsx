import React from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

export default function ActivityChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 font-mono text-xs">
        NO TELEMETRY DATA RECORDED
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.events_count || 1), 8);

  return (
    <div className="bg-[#0e1626]/90 backdrop-blur-md rounded-xl p-5 border border-[#1f2e4d] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold font-mono text-white uppercase tracking-wider">
            Security Event Telemetry (24h)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
            Total Events
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"></span>
            Critical Alerts
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-800 relative">
        {/* Subtle Horizontal grid lines */}
        <div className="absolute inset-x-0 top-1/4 border-b border-slate-800/60 pointer-events-none"></div>
        <div className="absolute inset-x-0 top-2/4 border-b border-slate-800/60 pointer-events-none"></div>
        <div className="absolute inset-x-0 top-3/4 border-b border-slate-800/60 pointer-events-none"></div>

        {data.map((item, idx) => {
          const heightPercent = Math.min(100, Math.max(12, (item.events_count / maxVal) * 100));
          const hasCritical = item.critical_count > 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-[#060910] border border-slate-700 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap text-slate-200 shadow-xl">
                <div>Events: {item.events_count}</div>
                {hasCritical && <div className="text-red-400">Critical: {item.critical_count}</div>}
              </div>

              {/* Bar */}
              <div className="w-full max-w-[28px] flex flex-col justify-end h-full">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t transition-all duration-500 relative ${
                    hasCritical
                      ? 'bg-gradient-to-t from-red-600/70 to-red-400 border-t-2 border-red-300 shadow-glow-red'
                      : 'bg-gradient-to-t from-emerald-600/40 to-cyan-400/80 border-t-2 border-cyan-300 shadow-glow-cyan'
                  }`}
                >
                  {hasCritical && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <ShieldAlert className="w-3 h-3 text-red-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
        {data.map((item, idx) => (
          <span key={idx} className="text-center flex-1">
            {item.time}
          </span>
        ))}
      </div>
    </div>
  );
}
