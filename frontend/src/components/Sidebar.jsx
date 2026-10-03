import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Radar,
  AlertOctagon,
  Server,
  Cpu,
  LogOut,
  X,
  Radio,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, systemStatus, onLogout, isAuthenticated }) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Scanner', path: '/scanner', icon: Radar },
    { name: 'Security Events', path: '/events', icon: AlertOctagon },
    { name: 'Assets', path: '/assets', icon: Server },
    { name: 'System', path: '/system', icon: Cpu },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#080808] border-r border-[#D4AF37]/20 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0D0D0D] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-glow-gold-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg tracking-wider text-[#F5F1E8]">
                CYBER<span className="text-gold-gradient">OPS</span>
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-[#A69D86] uppercase">
                SECURITY PLATFORM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-[#A69D86] hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#A69D86]">
            Operations Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F3D77A] via-[#D4AF37] to-[#8F6F1B] text-black font-bold shadow-glow-gold-sm'
                      : 'text-[#A69D86] hover:text-[#F5F1E8] hover:bg-[#141414]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom System Status Section */}
        <div className="p-4 border-t border-[#D4AF37]/20 bg-[#040404] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A69D86]">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[#F3D77A]">
              <Radio className="w-3 h-3 text-[#D4AF37] animate-pulse" />
              SYSTEM STATUS
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0D0D0D] text-[#F3D77A] border border-[#D4AF37]/20">
              ONLINE
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[#F5F1E8] bg-[#0A0A0A] px-2.5 py-1.5 rounded border border-[#D4AF37]/15">
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    systemStatus?.api ? 'bg-[#D4AF37] animate-pulse' : 'bg-red-500'
                  }`}
                ></span>
                API SERVER
              </span>
              <span className={`text-[10px] font-bold ${systemStatus?.api ? 'text-[#F3D77A]' : 'text-red-400'}`}>
                {systemStatus?.api ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#F5F1E8] bg-[#0A0A0A] px-2.5 py-1.5 rounded border border-[#D4AF37]/15">
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    systemStatus?.database ? 'bg-[#D4AF37]' : 'bg-red-500'
                  }`}
                ></span>
                DATABASE
              </span>
              <span
                className={`text-[10px] font-bold ${
                  systemStatus?.database ? 'text-[#F3D77A]' : 'text-red-400'
                }`}
              >
                {systemStatus?.database ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {isAuthenticated && onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#0D0D0D] hover:bg-[#1A0A0A] hover:text-red-400 border border-[#D4AF37]/20 hover:border-red-500/40 text-[#A69D86] text-xs font-mono transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              TERMINATE SESSION
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
