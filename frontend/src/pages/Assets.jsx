import React, { useState, useEffect } from 'react';
import {
  Server,
  Plus,
  Trash2,
  X,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import ConnectionBanner from '../components/ConnectionBanner';

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Asset Form
  const [newAsset, setNewAsset] = useState({
    name: 'Production Auth Server',
    target: 'auth.cyberops.net',
    type: 'Domain',
    status: 'ONLINE',
  });

  const fetchAssets = async () => {
    try {
      setError(false);
      setLoading(true);
      const data = await api.getAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.addAsset(newAsset);
      setShowModal(false);
      fetchAssets();
    } catch (err) {
      console.error('Failed to add asset:', err);
      alert('Failed to register asset. Please verify backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm(`Remove monitored asset #${id}?`)) return;
    try {
      await api.deleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#080808] border border-[#D4AF37]/25 p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0D0D] border border-[#D4AF37]/30 text-[11px] font-mono text-[#F3D77A]">
              <Server className="w-3 h-3 text-[#D4AF37]" />
              <span>INFRASTRUCTURE REGISTRY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight text-[#F5F1E8]">
              ASSET <span className="text-gold-gradient">INVENTORY</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A69D86] font-light">
              Manage authorized infrastructure endpoints, IP subnets, and web application targets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchAssets}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#141414] text-xs font-mono text-[#F5F1E8] transition-all duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>REFRESH</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F3D77A] via-[#D4AF37] to-[#8F6F1B] hover:from-[#FFF0B8] hover:via-[#F3D77A] hover:to-[#D4AF37] text-black font-mono font-bold text-xs shadow-glow-gold transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>ADD ASSET</span>
            </button>
          </div>
        </div>
      </div>

      {error && <ConnectionBanner onRetry={fetchAssets} />}

      {/* Asset Table */}
      <div className="bg-[#080808] rounded-xl border border-[#D4AF37]/25 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#040404] text-[#A69D86] uppercase text-[11px] border-b border-[#D4AF37]/15">
              <tr>
                <th className="px-5 py-3.5">Asset ID</th>
                <th className="px-5 py-3.5">Asset Name</th>
                <th className="px-5 py-3.5">Target Address / FQDN</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Seen / Registered</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-[#A69D86] font-mono">
                    <span className="animate-pulse text-[#F3D77A]">RETRIEVING MONITORED ASSETS...</span>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-[#A69D86] font-mono">
                    No assets registered in inventory. Click [+ ADD ASSET] to register one.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#0D0D0D]/60 transition-colors">
                    <td className="px-5 py-4 text-[#D4AF37] font-bold">
                      #{asset.id.toString().padStart(3, '0')}
                    </td>
                    <td className="px-5 py-4 text-[#F5F1E8] font-medium">{asset.name}</td>
                    <td className="px-5 py-4 text-[#A69D86] font-mono">
                      <div className="inline-flex items-center gap-1.5 text-[#F5F1E8]">
                        <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{asset.target}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#0D0D0D] text-[#F3D77A] border border-[#D4AF37]/25">
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {asset.status === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#0E1A0A] text-[#93E993] border border-[#4ADE80]/40 shadow-[0_0_10px_-2px_rgba(74,222,128,0.3)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"></span>
                          ONLINE ●
                        </span>
                      ) : asset.status === 'WARNING' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#1C1605] text-[#F3D77A] border border-[#D4AF37]/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                          WARNING ▲
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-[#140A0A] text-[#A69D86] border border-[#555555]/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#666666]"></span>
                          OFFLINE ○
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#A69D86] whitespace-nowrap">
                      {new Date(asset.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        title="Remove Asset"
                        className="p-1.5 rounded-lg text-[#A69D86] hover:text-[#FF6B6B] hover:bg-[#1A0A0A] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#080808] border border-[#D4AF37]/40 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_-10px_rgba(212,175,55,0.3)] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#0D0D0D]">
              <h3 className="text-sm font-serif font-bold text-[#F5F1E8] tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-[#D4AF37]" />
                REGISTER NEW ASSET
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#A69D86] hover:text-[#F5F1E8] p-1 rounded-lg hover:bg-[#1A1A1A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="p-5 space-y-4 font-mono text-xs">
              <div>
                <label className="text-[#A69D86] font-semibold block mb-1.5 uppercase">ASSET NAME</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="e.g. Core API Cluster"
                  required
                  className="w-full bg-[#020202] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl p-3 text-[#F5F1E8] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#A69D86] font-semibold block mb-1.5 uppercase">TARGET (DOMAIN / IP)</label>
                <input
                  type="text"
                  value={newAsset.target}
                  onChange={(e) => setNewAsset({ ...newAsset, target: e.target.value })}
                  placeholder="e.g. api.cyberops.net or 192.168.1.10"
                  required
                  className="w-full bg-[#020202] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl p-3 text-[#F5F1E8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A69D86] font-semibold block mb-1.5 uppercase">TYPE</label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                    className="w-full bg-[#020202] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl p-3 text-[#F5F1E8] focus:outline-none"
                  >
                    <option value="Domain" className="bg-black text-[#F5F1E8]">Domain</option>
                    <option value="IP" className="bg-black text-[#F5F1E8]">IP Address</option>
                    <option value="Server" className="bg-black text-[#F5F1E8]">Server Instance</option>
                    <option value="API" className="bg-black text-[#F5F1E8]">API Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#A69D86] font-semibold block mb-1.5 uppercase">INITIAL STATUS</label>
                  <select
                    value={newAsset.status}
                    onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                    className="w-full bg-[#020202] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl p-3 text-[#F5F1E8] focus:outline-none"
                  >
                    <option value="ONLINE" className="bg-black text-[#F5F1E8]">ONLINE</option>
                    <option value="WARNING" className="bg-black text-[#F5F1E8]">WARNING</option>
                    <option value="OFFLINE" className="bg-black text-[#F5F1E8]">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D4AF37]/15">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#D4AF37]/25 text-[#A69D86] hover:text-[#F5F1E8] hover:bg-[#141414] text-xs font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F3D77A] via-[#D4AF37] to-[#8F6F1B] text-black font-bold text-xs font-mono shadow-glow-gold hover:scale-[1.02] transition-all"
                >
                  {isSubmitting ? 'REGISTERING...' : 'REGISTER ASSET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
