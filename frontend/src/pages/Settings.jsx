import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  HardDrive,
  Router as RouterIcon,
  Clock,
  Radio,
  Save,
  Check,
  Shield,
  Key,
  HelpCircle,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    interface: 'Auto Detect',
    gateway: 'Auto Detect',
    collection_interval: '5',
    router_adapter: 'Generic (Passive)',
    router_host: '192.168.1.1',
    collector_online: false,
    collector_name: 'Home-Agent',
    collector_ip: '127.0.0.1',
    collector_version: '1.0.0',
    last_heartbeat: null,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Router integration state
  const [routerType, setRouterType] = useState('Generic (Passive)');
  const [routerHost, setRouterHost] = useState('192.168.1.1');
  const [routerUser, setRouterUser] = useState('');
  const [routerPass, setRouterPass] = useState('');
  const [routerAuthStatus, setRouterAuthStatus] = useState('Not configured');

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      setRouterType(data.router_adapter || 'Generic (Passive)');
      setRouterHost(data.router_host || '192.168.1.1');
      if (data.router_adapter && data.router_adapter !== 'Generic (Passive)') {
        setRouterAuthStatus('Configured on Collector');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.saveSettings({
        interface: settings.interface,
        gateway: settings.gateway,
        collection_interval: settings.collection_interval,
        router_adapter: routerType,
        router_host: routerHost,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Error saving configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 sm:p-6 shadow-panel">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-[#F5F5F5] uppercase flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-[#D4AF37]" />
            COLLECTOR & NETWORK SETTINGS
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] font-sans">
            Configure local LAN interfaces, collector heartbeat parameters, and authenticated router adapters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
        
        {/* Collector Status Panel */}
        <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 sm:p-6 shadow-panel space-y-4">
          <h3 className="font-bold text-sm text-[#F5F5F5] uppercase flex items-center gap-2 border-b border-[#1C1C1C] pb-3">
            <Radio className="w-4 h-4 text-[#D4AF37]" />
            COLLECTOR AGENT TELEMETRY
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C]">
              <span className="text-[#777777] text-[10px] uppercase block">Agent State</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${settings.collector_online ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span className={`font-bold ${settings.collector_online ? 'text-emerald-400' : 'text-red-400'}`}>
                  {settings.collector_online ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C]">
              <span className="text-[#777777] text-[10px] uppercase block">Collector Host IP</span>
              <span className="text-[#F5F5F5] font-semibold text-sm mt-1 block">
                {settings.collector_ip}
              </span>
            </div>

            <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C]">
              <span className="text-[#777777] text-[10px] uppercase block">Collector Agent Version</span>
              <span className="text-[#D4AF37] font-semibold text-sm mt-1 block">
                v{settings.collector_version}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#070707] rounded-lg border border-[#1A1A1A] flex items-start gap-2.5 text-[#888888] text-[11px]">
            <Terminal className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              To start the local Python agent, execute: <br />
              <code className="text-[#F5F5F5] bg-[#141414] px-2 py-0.5 rounded font-bold">python collector/collector.py</code>
            </div>
          </div>
        </div>

        {/* Network & Polling Configuration */}
        <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 sm:p-6 shadow-panel space-y-4">
          <h3 className="font-bold text-sm text-[#F5F5F5] uppercase flex items-center gap-2 border-b border-[#1C1C1C] pb-3">
            <HardDrive className="w-4 h-4 text-[#D4AF37]" />
            NETWORK INTERFACE CONFIGURATION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#888888] block mb-1.5 font-semibold">NETWORK INTERFACE</label>
              <select
                value={settings.interface}
                onChange={(e) => setSettings({ ...settings, interface: e.target.value })}
                className="w-full bg-[#050505] border border-[#262626] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F5F5F5] focus:outline-none"
              >
                <option value="Auto Detect">Auto Detect Primary Interface</option>
                <option value="Wi-Fi">Wi-Fi (Wireless LAN)</option>
                <option value="Ethernet">Ethernet (Gigabit LAN)</option>
                <option value="Virtual Adapter">Virtual / VPN Interface</option>
              </select>
            </div>

            <div>
              <label className="text-[#888888] block mb-1.5 font-semibold">DEFAULT GATEWAY</label>
              <input
                type="text"
                value={settings.gateway}
                onChange={(e) => setSettings({ ...settings, gateway: e.target.value })}
                placeholder="Auto Detect (e.g. 192.168.1.1)"
                className="w-full bg-[#050505] border border-[#262626] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F5F5F5] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[#888888] block mb-1.5 font-semibold">COLLECTION POLLING INTERVAL</label>
            <select
              value={settings.collection_interval}
              onChange={(e) => setSettings({ ...settings, collection_interval: e.target.value })}
              className="w-full sm:w-64 bg-[#050505] border border-[#262626] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F5F5F5] focus:outline-none"
            >
              <option value="5">5 seconds (Recommended)</option>
              <option value="10">10 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds (Low Resource)</option>
            </select>
          </div>
        </div>

        {/* Router Integration Adapter Panel */}
        <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 sm:p-6 shadow-panel space-y-4">
          <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-3">
            <h3 className="font-bold text-sm text-[#F5F5F5] uppercase flex items-center gap-2">
              <RouterIcon className="w-4 h-4 text-[#D4AF37]" />
              ROUTER INTEGRATION ADAPTER
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#161616] text-[#A69D86] border border-[#262626]">
              {routerAuthStatus}
            </span>
          </div>

          <p className="text-xs text-[#888888] font-sans">
            CYBEROPS HOME supports optional authenticated router APIs (OpenWrt, AsusWRT, UniFi) to collect WAN traffic flows. 
            Credentials are kept private in the local environment and never exposed in browser frontend code.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#888888] block mb-1.5 font-semibold">ADAPTER DRIVER</label>
              <select
                value={routerType}
                onChange={(e) => setRouterType(e.target.value)}
                className="w-full bg-[#050505] border border-[#262626] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F5F5F5] focus:outline-none"
              >
                <option value="Generic (Passive)">Generic Router (Passive ARP Detection)</option>
                <option value="OpenWrt (LuCI RPC)">OpenWrt (ubus / LuCI RPC API)</option>
                <option value="Router REST API">Router REST API (AsusWRT / UniFi / MikroTik)</option>
              </select>
            </div>

            <div>
              <label className="text-[#888888] block mb-1.5 font-semibold">ROUTER HOSTNAME / IP</label>
              <input
                type="text"
                value={routerHost}
                onChange={(e) => setRouterHost(e.target.value)}
                placeholder="192.168.1.1"
                className="w-full bg-[#050505] border border-[#262626] focus:border-[#D4AF37] rounded-lg p-2.5 text-[#F5F5F5] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
              <Check className="w-4 h-4" />
              SETTINGS SAVED
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#F3D77A] text-black font-mono font-bold text-xs shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'SAVING...' : 'SAVE CONFIGURATION'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
