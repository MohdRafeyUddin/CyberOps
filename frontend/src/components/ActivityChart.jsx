import React from 'react';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

export default function ActivityChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#080808] border border-[#D4AF37]/25 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-[#D4AF37]/40 mb-2" />
        <span className="text-[#A69D86] font-mono text-xs tracking-wider uppercase">
          NO TELEMETRY DATA RECORDED
        </span>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.events_count || 1), 8);

  return (
    <div className="bg-[#080808] rounded-xl p-6 border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0D0D0D] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Activity className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#F5F1E8] tracking-wide uppercase">
              SECURITY ACTIVITY
            </h3>
            <p className="text-[11px] font-mono text-[#A69D86]">
              24-Hour Telemetry & Anomaly Distribution
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#A69D86]">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-[#D4AF37] to-[#F3D77A] inline-block shadow-glow-gold-sm"></span>
            <span>Total Events</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#A69D86]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FF4D4D] inline-block"></span>
            <span>Critical Alerts</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-48 flex items-end justify-between gap-2.5 pt-8 pb-3 px-3 border-b border-[#D4AF37]/20 relative bg-[#040404]/60 rounded-lg">
        {/* Subtle Horizontal grid lines */}
        <div className="absolute inset-x-0 top-1/4 border-b border-[#D4AF37]/10 pointer-events-none"></div>
        <div className="absolute inset-x-0 top-2/4 border-b border-[#D4AF37]/10 pointer-events-none"></div>
        <div className="absolute inset-x-0 top-3/4 border-b border-[#D4AF37]/10 pointer-events-none"></div>

        {data.map((item, idx) => {
          const heightPercent = Math.min(100, Math.max(12, (item.events_count / maxVal) * 100));
          const hasCritical = item.critical_count > 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Gold Tooltip on hover */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 bg-[#0D0D0D] border border-[#D4AF37]/60 px-3 py-1.5 rounded-md text-[11px] font-mono whitespace-nowrap text-[#F5F1E8] shadow-glow-gold-sm -translate-y-1 group-hover:translate-y-0">
                <div className="font-semibold text-[#F3D77A]">Events: {item.events_count}</div>
                {hasCritical && <div className="text-[#FF6B6B] font-bold">Critical: {item.critical_count}</div>}
              </div>

              {/* Bar */}
              <div className="w-full max-w-[32px] flex flex-col justify-end h-full">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-500 relative ${
                    hasCritical
                      ? 'bg-gradient-to-t from-[#801010] to-[#FF4D4D] border-t-2 border-[#FFA3A3] shadow-[0_0_12px_rgba(255,77,77,0.4)]'
                      : 'bg-gradient-to-t from-[#8F6F1B]/40 via-[#D4AF37]/80 to-[#F3D77A] border-t-2 border-[#FFF0B8] shadow-glow-gold-sm group-hover:shadow-glow-gold'
                  }`}
                >
                  {hasCritical && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#FF4D4D] animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between text-[11px] font-mono text-[#A69D86] mt-3 px-2">
        {data.map((item, idx) => (
          <span key={idx} className="text-center flex-1">
            {item.time}
          </span>
        ))}
      </div>
    </div>
  );
}
