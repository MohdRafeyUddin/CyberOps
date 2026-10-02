import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Plus,
  Filter,
  RefreshCw,
  Search,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import SeverityBadge from '../components/SeverityBadge';
import ConnectionBanner from '../components/ConnectionBanner';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    event_type: 'Brute Force Attack',
    source: '185.220.101.5',
    severity: 'HIGH',
    status: 'DETECTED',
    message: 'Multiple automated SSH login failures detected from suspicious ASN.',
  });

  const fetchEvents = async () => {
    try {
      setError(false);
      setLoading(true);
      const params = {};
      if (filterSeverity !== 'ALL') {
        params.severity = filterSeverity;
      }
      const data = await api.getEvents(params);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterSeverity]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createEvent(newEvent);
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Error creating security event. Ensure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCreateTest = async () => {
    const testPayloads = [
      {
        event_type: 'DDoS Amplification Vector',
        source: '45.146.164.110',
        severity: 'CRITICAL',
        status: 'BLOCKED',
        message: 'High volume UDP flood targeting edge DNS server. Rate-limiting engaged.',
      },
      {
        event_type: 'Credential Stuffing Attempt',
        source: '194.38.20.91',
        severity: 'HIGH',
        status: 'INVESTIGATING',
        message: 'Leaked combo list tested against /api/login endpoint.',
      },
      {
        event_type: 'Path Traversal Probe',
        source: '89.248.165.77',
        severity: 'MEDIUM',
        status: 'MITIGATED',
        message: 'Request containing ../../../etc/passwd detected and sanitized.',
      },
      {
        event_type: 'SSL/TLS Certificate Expiry Warning',
        source: 'stage.cyberops.net',
        severity: 'LOW',
        status: 'RESOLVED',
        message: 'Certificate expiring in 14 days. Auto-renewal scheduled.',
      },
    ];

    const randomPayload = testPayloads[Math.floor(Math.random() * testPayloads.length)];

    try {
      await api.createEvent(randomPayload);
      fetchEvents();
    } catch (err) {
      console.error('Failed to generate test event:', err);
      alert('Failed to generate event. Please verify backend connectivity.');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm(`Delete event #${id}?`)) return;
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const filterTabs = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const filteredEvents = events.filter((ev) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ev.event_type?.toLowerCase().includes(query) ||
      ev.source?.toLowerCase().includes(query) ||
      ev.message?.toLowerCase().includes(query) ||
      ev.status?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-mono font-extrabold text-white tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-400" />
            SECURITY EVENTS LOGS
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time audit log of security incidents, alerts, and countermeasures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickCreateTest}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            QUICK TEST EVENT
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs shadow-glow-green transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            + CREATE TEST EVENT
          </button>
        </div>
      </div>

      {error && <ConnectionBanner onRetry={fetchEvents} />}

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0e1626]/90 backdrop-blur-md p-4 rounded-xl border border-[#1f2e4d]">
        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterSeverity(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                filterSeverity === tab
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-glow-green'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event, source IP, or message..."
            className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#0e1626]/90 backdrop-blur-md rounded-xl border border-[#1f2e4d] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#090e1a]/80 text-slate-400 uppercase text-[11px] border-b border-[#1f2e4d]">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Message / Payload</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-500 font-mono">
                    <span className="animate-pulse text-cyan-400">FETCHING SECURITY EVENTS...</span>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-500 font-mono">
                    No security events match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-cyan-400 font-bold">
                      #{ev.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                      {ev.event_type}
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={ev.severity} />
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono whitespace-nowrap">
                      {ev.source}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={ev.message}>
                      {ev.message || 'No additional telemetry'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(ev.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        title="Delete Event"
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

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1626] border border-[#1f2e4d] rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#1f2e4d] flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-emerald-400" />
                CREATE CUSTOM SECURITY EVENT
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-4 space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">EVENT TYPE</label>
                <input
                  type="text"
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                  placeholder="e.g. Ransomware Payload Beacon"
                  required
                  className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">SOURCE IP / DOMAIN</label>
                <input
                  type="text"
                  value={newEvent.source}
                  onChange={(e) => setNewEvent({ ...newEvent, source: e.target.value })}
                  placeholder="e.g. 192.168.1.150"
                  required
                  className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">SEVERITY</label>
                  <select
                    value={newEvent.severity}
                    onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value })}
                    className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">INITIAL STATUS</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                    className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg p-2.5 text-white focus:outline-none"
                  >
                    <option value="DETECTED">DETECTED</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="BLOCKED">BLOCKED</option>
                    <option value="MITIGATED">MITIGATED</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">INCIDENT DETAILS / LOGS</label>
                <textarea
                  value={newEvent.message}
                  onChange={(e) => setNewEvent({ ...newEvent, message: e.target.value })}
                  rows={3}
                  placeholder="Describe detected telemetry, payload, or signatures..."
                  className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg p-2.5 text-white focus:outline-none"
                />
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
                  {isSubmitting ? 'CREATING...' : 'SUBMIT EVENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
