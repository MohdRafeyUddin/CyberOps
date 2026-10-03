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
    <header className="h-16 bg-[#000000]/80 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-[#0D0D0D] border border-[#D4AF37]/30 text-[#A69D86] hover:text-[#F5F1E8]"
        >
          <Menu className="w-5 h-5 text-[#D4AF37]" />
        </button>
        <div>
          <h2 className="text-sm sm:text-base font-serif font-bold text-[#F5F1E8] tracking-wide flex items-center gap-2">
            <span className="text-[#D4AF37]">CYBEROPS //</span> {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 text-[#A69D86] bg-[#0A0A0A] px-3 py-1.5 rounded-lg border border-[#D4AF37]/20">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{timeStr || 'SYNCHRONIZING UTC...'}</span>
        </div>

        {/* Security Status Tag */}
        <div className="flex items-center gap-2 bg-[#0D0D0D] border border-[#D4AF37]/30 px-2.5 py-1.5 rounded-lg text-[#F3D77A]">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span className="hidden sm:inline font-semibold">DEFCON-5 (NORMAL)</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 text-[#F5F1E8] bg-[#0D0D0D] border border-[#D4AF37]/30 px-2.5 py-1.5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
          <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden sm:inline font-mono">admin</span>
        </div>
      </div>
    </header>
  );
}
