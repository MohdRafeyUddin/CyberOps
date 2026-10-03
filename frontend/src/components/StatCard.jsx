import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  statusColor = 'text-[#F5F5F5]',
  badge,
}) {
  const isAvailable = value !== undefined && value !== null && value !== '' && value !== 'Traffic data unavailable';

  return (
    <div className="bg-[#0B0B0B] border border-[#222222] hover:border-[#2D2D2D] rounded-xl p-5 transition-all shadow-panel">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#888888] font-medium">
            {title}
          </p>

          <div className="flex items-baseline gap-2">
            <h3 className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight ${statusColor}`}>
              {isAvailable ? value : '--'}
            </h3>
            {badge && (
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#161616] text-[#A69D86] border border-[#262626]">
                {badge}
              </span>
            )}
          </div>

          <p className="text-xs text-[#777777] font-sans pt-0.5">
            {isAvailable ? subtext : (value === 'Traffic data unavailable' ? 'Traffic data unavailable' : 'Collector data pending')}
          </p>
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center text-[#A69D86] shrink-0">
            <Icon className="w-5 h-5 text-[#D4AF37]" />
          </div>
        )}
      </div>
    </div>
  );
}
