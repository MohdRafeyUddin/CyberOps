import React, { useState, useEffect } from 'react';
import { Menu, ShieldCheck, Clock, UserCheck } from 'lucide-react';

export default function Header({ onMenuClick, title = 'SECURITY DASHBOARD' }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-[#1f2e4d] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm sm:text-base font-mono font-bold text-white tracking-wide flex items-center gap-2">
            <span className="text-emerald-400">SOC //</span> {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr || 'SYNCHRONIZING UTC...'}</span>
        </div>

        {/* Security Status Tag */}
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline font-semibold">DEFCON-5 (NORMAL)</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 text-slate-300 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1.5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline font-mono">admin</span>
        </div>
      </div>
    </header>
  );
}
