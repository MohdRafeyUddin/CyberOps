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
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#090e1a] border-r border-[#1f2e4d] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1f2e4d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow-green">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-mono font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
                CYBER<span className="text-emerald-400">OPS</span>
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                SOC INTELLIGENCE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
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
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-glow-green'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
        <div className="p-4 border-t border-[#1f2e4d] bg-[#070b14] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              SYSTEM STATUS
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              SOC-LIVE
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    systemStatus?.api ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
                  }`}
                ></span>
                API SERVER
              </span>
              <span className={`text-[10px] ${systemStatus?.api ? 'text-emerald-400' : 'text-red-400'}`}>
                {systemStatus?.api ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    systemStatus?.database ? 'bg-emerald-400' : 'bg-red-500'
                  }`}
                ></span>
                DATABASE
              </span>
              <span
                className={`text-[10px] ${
                  systemStatus?.database ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {systemStatus?.database ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {isAuthenticated && onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-red-950/40 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-slate-400 text-xs font-mono transition-colors"
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
