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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" />
            MONITORED ASSET INVENTORY
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Manage authorized infrastructure endpoints, IP subnets, and web application targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAssets}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            REFRESH
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs shadow-glow-green transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            + ADD ASSET
          </button>
        </div>
      </div>

      {error && <ConnectionBanner onRetry={fetchAssets} />}

      {/* Asset Cards Grid or Table */}
      <div className="bg-[#0e1626]/90 backdrop-blur-md rounded-xl border border-[#1f2e4d] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#090e1a]/80 text-slate-400 uppercase text-[11px] border-b border-[#1f2e4d]">
              <tr>
                <th className="px-4 py-3">Asset ID</th>
                <th className="px-4 py-3">Asset Name</th>
                <th className="px-4 py-3">Target Address / FQDN</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Registered Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500 font-mono">
                    <span className="animate-pulse text-cyan-400">LOADING MONITORED ASSETS...</span>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500 font-mono">
                    No assets registered in inventory. Click [+ ADD ASSET] to register one.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-cyan-400 font-bold">
                      #{asset.id.toString().padStart(3, '0')}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{asset.name}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      {asset.target}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          asset.status === 'ONLINE'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-glow-green'
                            : asset.status === 'WARNING'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                            : 'bg-red-950/60 text-red-400 border-red-500/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            asset.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                          }`}
                        ></span>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(asset.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        title="Remove Asset"
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1626] border border-[#1f2e4d] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#1f2e4d] flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                REGISTER NEW ASSET
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="p-4 space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">ASSET NAME</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="e.g. Core API Cluster"
                  required
                  className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">TARGET (DOMAIN / IP)</label>
                <input
                  type="text"
                  value={newAsset.target}
                  onChange={(e) => setNewAsset({ ...newAsset, target: e.target.value })}
                  placeholder="e.g. api.cyberops.net or 192.168.1.10"
                  required
                  className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">TYPE</label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                    className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="Domain">Domain</option>
                    <option value="IP">IP Address</option>
                    <option value="Server">Server Instance</option>
                    <option value="API">API Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">INITIAL STATUS</label>
                  <select
                    value={newAsset.status}
                    onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                    className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="WARNING">WARNING</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-green"
                >
                  {isSubmitting ? 'REGISTERING...' : 'ADD ASSET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
