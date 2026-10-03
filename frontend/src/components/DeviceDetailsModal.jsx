import React, { useState, useEffect } from 'react';
import {
  X,
  Laptop,
  Globe,
  Clock,
  HardDrive,
  Activity,
  Edit2,
  Check,
  Trash2,
  Shield,
  Calendar,
  Layers,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import api from '../services/api';
import DeviceTypeIcon from './DeviceTypeIcon';

export default function DeviceDetailsModal({ deviceId, onClose, onDeviceUpdated, onDeviceDeleted }) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [customName, setCustomName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDetails = async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      setError(false);
      const data = await api.getDeviceDetails(deviceId);
      setDevice(data);
      setCustomName(data.custom_name || '');
      setDeviceType(data.device_type || 'Network Client');
      setNotes(data.notes || '');
    } catch (err) {
      console.error('Failed to load device details:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [deviceId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateDevice(deviceId, {
        custom_name: customName,
        device_type: deviceType,
        notes: notes,
      });
      setDevice((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
      if (onDeviceUpdated) onDeviceUpdated(updated);
    } catch (err) {
      console.error('Failed to update device:', err);
      alert('Error saving device details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove device record ${device?.hostname || device?.ip} from inventory?`)) return;
    try {
      await api.deleteDevice(deviceId);
      if (onDeviceDeleted) onDeviceDeleted(deviceId);
      onClose();
    } catch (err) {
      console.error('Failed to delete device:', err);
    }
  };

  const formatBytes = (b) => {
    if (!b || b === 0) return '0 B';
    for (const unit of ['B', 'KB', 'MB', 'GB', 'TB']) {
      if (b < 1024.0) return `${b.toFixed(1)} ${unit}`;
      b /= 1024.0;
    }
    return `${b.toFixed(1)} PB`;
  };

  if (!deviceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0B0B0B] border border-[#262626] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1C1C1C] flex items-center justify-between bg-[#080808]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#2D2D2D] flex items-center justify-center">
              <DeviceTypeIcon
                type={device?.device_type || device?.vendor}
                isGateway={device?.is_gateway}
                className="w-5 h-5"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-base text-[#F5F5F5]">
                  {device?.custom_name || device?.hostname || device?.ip || 'Device Details'}
                </h3>
                {device?.is_gateway && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#D4AF37] border border-[#D4AF37]/30">
                    GATEWAY
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[#888888]">
                {device?.ip} &bull; {device?.mac || 'MAC Unexposed'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888888] hover:text-[#F5F5F5] hover:bg-[#141414] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#888888] animate-pulse">
              LOADING DEVICE TELEMETRY...
            </div>
          ) : error || !device ? (
            <div className="py-12 text-center text-xs font-mono text-red-400">
              Failed to load device details.
            </div>
          ) : (
            <>
              {/* Status & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-[#0E0E0E] border border-[#1C1C1C]">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#888888]">Status:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        device.status === 'ONLINE'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                      {device.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#888888]">Type:</span>
                    <span className="text-[#F5F5F5] font-medium">{device.device_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#181818] hover:bg-[#222222] border border-[#2D2D2D] text-xs font-mono text-[#F5F5F5] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{isEditing ? 'Cancel Edit' : 'Edit Info'}</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    title="Remove record"
                    className="p-1 rounded bg-[#181818] hover:bg-red-950/40 border border-[#2D2D2D] hover:border-red-500/40 text-[#888888] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <form onSubmit={handleSave} className="p-4 rounded-lg bg-[#0E0E0E] border border-[#D4AF37]/30 space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[#888888] block mb-1">CUSTOM NAME / LABEL</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Living Room TV, Work Laptop"
                      className="w-full bg-[#050505] border border-[#262626] focus:border-[#D4AF37] rounded-lg p-2 text-[#F5F5F5] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#888888] block mb-1">DEVICE TYPE</label>
                      <select
                        value={deviceType}
                        onChange={(e) => setDeviceType(e.target.value)}
                        className="w-full bg-[#050505] border border-[#262626] focus:border-[#D4AF37] rounded-lg p-2 text-[#F5F5F5] focus:outline-none"
                      >
                        <option value="Network Client">Network Client</option>
                        <option value="Smartphone">Smartphone</option>
                        <option value="Laptop / PC">Laptop / PC</option>
                        <option value="Smart TV">Smart TV</option>
                        <option value="Tablet">Tablet</option>
                        <option value="IoT Device">IoT Device</option>
                        <option value="Gaming Console">Gaming Console</option>
                        <option value="Printer">Printer</option>
                        <option value="Gateway / Router">Gateway / Router</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#888888] block mb-1">NOTES</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Optional device notes"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-[#D4AF37] rounded-lg p-2 text-[#F5F5F5] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#F3D77A] transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{saving ? 'SAVING...' : 'SAVE CHANGES'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Hardware & Network Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C]">
                  <span className="text-[#777777] text-[10px] uppercase block">IP Address</span>
                  <span className="text-[#F5F5F5] font-semibold text-sm mt-0.5 block">{device.ip}</span>
                </div>

                <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C]">
                  <span className="text-[#777777] text-[10px] uppercase block">MAC Address</span>
                  <span className="text-[#F5F5F5] font-semibold text-xs mt-0.5 block">{device.mac || 'N/A'}</span>
                </div>

                <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C]">
                  <span className="text-[#777777] text-[10px] uppercase block">Hardware Vendor</span>
                  <span className="text-[#D4AF37] font-semibold text-xs mt-0.5 block truncate">{device.vendor}</span>
                </div>

                <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C]">
                  <span className="text-[#777777] text-[10px] uppercase block">First Discovered</span>
                  <span className="text-[#888888] text-[11px] mt-0.5 block">
                    {new Date(device.first_seen).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C]">
                  <span className="text-[#777777] text-[10px] uppercase block">Last Responded</span>
                  <span className="text-[#888888] text-[11px] mt-0.5 block">
                    {new Date(device.last_seen).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C]">
                  <span className="text-[#777777] text-[10px] uppercase block">LAN Interface</span>
                  <span className="text-[#888888] text-xs mt-0.5 block truncate">{device.interface}</span>
                </div>
              </div>

              {/* Traffic / Bandwidth Usage */}
              <div className="p-4 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#F5F5F5] uppercase flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                    BANDWIDTH TELEMETRY
                  </span>
                  <span className="text-[10px] text-[#777777]">
                    (Device-specific per-client metrics require router flow integration)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-2.5 bg-[#080808] rounded border border-[#1C1C1C] flex items-center gap-2.5">
                    <ArrowDownCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[#777777] text-[10px] uppercase block">Download Traffic</span>
                      <span className="text-[#F5F5F5] font-bold">
                        {device.download_bytes > 0 ? formatBytes(device.download_bytes) : 'Traffic data unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#080808] rounded border border-[#1C1C1C] flex items-center gap-2.5">
                    <ArrowUpCircle className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <span className="text-[#777777] text-[10px] uppercase block">Upload Traffic</span>
                      <span className="text-[#F5F5F5] font-bold">
                        {device.upload_bytes > 0 ? formatBytes(device.upload_bytes) : 'Traffic data unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Specific Event History */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-[#888888] uppercase tracking-wider block">
                  DEVICE AUDIT EVENTS
                </span>
                {device.events?.length === 0 ? (
                  <div className="p-3 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C] text-xs font-mono text-[#666666] text-center">
                    No individual alerts recorded for this device.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {device.events.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2.5 bg-[#0E0E0E] rounded-lg border border-[#1C1C1C] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          <span className="font-semibold text-[#F5F5F5]">{ev.event_type}:</span>
                          <span className="text-[#888888] truncate">{ev.details}</span>
                        </div>
                        <span className="text-[10px] text-[#666666] whitespace-nowrap ml-2">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1C1C1C] bg-[#080808] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#2D2D2D] text-xs font-mono text-[#F5F5F5]"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
