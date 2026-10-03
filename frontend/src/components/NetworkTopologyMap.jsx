import React from 'react';
import { Globe, Router as RouterIcon, Wifi, Activity, Laptop, Smartphone, Tv, Cpu, Radio } from 'lucide-react';
import DeviceTypeIcon from './DeviceTypeIcon';

export default function NetworkTopologyMap({ topology, onSelectDevice }) {
  if (!topology || !topology.nodes || topology.nodes.length === 0) {
    return (
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <Wifi className="w-8 h-8 text-[#555555] mb-2" />
        <span className="text-xs font-mono text-[#888888] uppercase">
          Topology data unavailable &bull; Awaiting collector discovery
        </span>
      </div>
    );
  }

  const internetNode = topology.nodes.find((n) => n.type === 'internet');
  const routerNode = topology.nodes.find((n) => n.type === 'router' || n.is_gateway);
  const clientNodes = topology.nodes.filter((n) => n.type === 'device' && !n.is_gateway);

  return (
    <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 sm:p-6 shadow-panel">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1C1C1C]">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-mono font-bold text-sm text-[#F5F5F5] uppercase tracking-wider">
            HOME NETWORK TOPOLOGY
          </h3>
        </div>
        <span className="text-xs font-mono text-[#888888]">
          {clientNodes.length} Client{clientNodes.length === 1 ? '' : 's'} Connected via Gateway
        </span>
      </div>

      {/* Visual Hierarchy Diagram */}
      <div className="flex flex-col items-center space-y-6 max-w-4xl mx-auto py-2">
        
        {/* 1. Internet Node */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141414] border border-[#2D2D2D] text-xs font-mono text-[#F5F5F5] shadow-sm">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="font-bold">WAN / INTERNET</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>

          {/* Connection Line */}
          <div className="w-px h-6 bg-[#333333]" />
        </div>

        {/* 2. Router / Gateway Node */}
        <div className="flex flex-col items-center w-full max-w-xs">
          <div
            onClick={() => onSelectDevice && routerNode && onSelectDevice(routerNode)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#121212] border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1C1C1C] border border-[#333333] flex items-center justify-center text-[#D4AF37]">
                <RouterIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-mono font-bold text-xs text-[#F5F5F5] group-hover:text-[#F3D77A] transition-colors">
                  {routerNode?.label || 'Default Gateway'}
                </div>
                <div className="text-[11px] font-mono text-[#888888]">
                  {routerNode?.ip || '192.168.1.1'} &bull; Router
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              GATEWAY
            </span>
          </div>

          {/* Branching Trunk Line */}
          {clientNodes.length > 0 && (
            <div className="w-px h-6 bg-[#333333]" />
          )}
        </div>

        {/* 3. Client Devices Grid */}
        {clientNodes.length > 0 ? (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {clientNodes.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => onSelectDevice && onSelectDevice(dev)}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0E0E0E] border border-[#222222] hover:border-[#3A3A3A] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded bg-[#161616] border border-[#262626] flex items-center justify-center shrink-0">
                      <DeviceTypeIcon type={dev.vendor} isGateway={false} className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-mono font-semibold text-xs text-[#F5F5F5] truncate group-hover:text-[#F3D77A] transition-colors">
                        {dev.label}
                      </p>
                      <p className="text-[11px] font-mono text-[#888888] truncate">
                        {dev.ip} &bull; <span className="text-[#666666]">{dev.vendor || 'LAN Device'}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 ml-2 w-2 h-2 rounded-full ${
                      dev.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-zinc-600'
                    }`}
                    title={dev.status}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs font-mono text-[#777777] text-center pt-2">
            No client devices discovered on LAN yet. Start the collector agent to scan network.
          </div>
        )}

      </div>
    </div>
  );
}
