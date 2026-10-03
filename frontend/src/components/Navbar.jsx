import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Laptop,
  Activity,
  ListOrdered,
  Settings as SettingsIcon,
  Menu,
  X,
  Radio,
  Wifi,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

export default function Navbar({ networkStatus, wsConnected }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Devices', path: '/devices', icon: Laptop },
    { name: 'Traffic', path: '/traffic', icon: Activity },
    { name: 'Events', path: '/events', icon: ListOrdered },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isOnline = networkStatus?.network_status === 'ONLINE';
  const collectorOnline = networkStatus?.collector_online;

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-[#222222] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#2D2D2D] flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]/50 transition-colors">
              <Wifi className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm tracking-wider text-[#F5F5F5]">
                  CYBER<span className="text-[#D4AF37]">OPS</span>
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-[#141414] text-[#D4AF37] border border-[#D4AF37]/30">
                  HOME
                </span>
              </div>
              <span className="text-[10px] font-sans text-[#888888] tracking-tight">
                Home Network Monitoring Dashboard
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0E0E0E] px-2 py-1 rounded-lg border border-[#222222]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1C1C1C] text-[#F5F5F5] font-semibold border border-[#333333] shadow-sm'
                        : 'text-[#888888] hover:text-[#F5F5F5] hover:bg-[#141414]'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Status Badges */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Real-time WebSocket Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
                wsConnected
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
              <span>{wsConnected ? 'LIVE' : 'POLLING'}</span>
            </div>

            {/* Network Online Status */}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium border ${
                isOnline
                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-950/30 text-red-400 border-red-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span>{isOnline ? 'NETWORK ONLINE' : 'COLLECTOR OFFLINE'}</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${
                isOnline
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-950/40 text-red-400 border-red-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#141414] border border-[#222222] text-[#F5F5F5] hover:border-[#333333]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-b border-[#222222] px-4 pt-2 pb-5 space-y-2 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1A1A1A] text-[#F5F5F5] font-semibold border border-[#333333]'
                        : 'text-[#888888] hover:text-[#F5F5F5] hover:bg-[#121212]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </NavLink>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-xs font-mono text-[#888888]">
            <span>Gateway: {networkStatus?.gateway || '192.168.1.1'}</span>
            <span className="text-emerald-400">{networkStatus?.connected_devices || 0} Devices Active</span>
          </div>
        </div>
      )}
    </header>
  );
}
