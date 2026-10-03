import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  Search,
  Filter,
  RefreshCw,
  Activity,
  AlertTriangle,
  Radio,
  Wifi,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const params = {};
      if (filterType !== 'ALL') params.event_type = filterType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await api.getNetworkEvents(params);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load network events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const eventTypes = [
    'ALL',
    'DEVICE CONNECTED',
    'DEVICE DISCONNECTED',
    'DEVICE DISCOVERED',
    'IP ADDRESS CHANGED',
    'TRAFFIC THRESHOLD',
    'ROUTER STATUS',
  ];

  const getEventBadge = (type, severity) => {
    switch (type) {
      case 'DEVICE CONNECTED':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
      case 'DEVICE DISCONNECTED':
        return 'bg-zinc-900 text-zinc-400 border-zinc-700';
      case 'IP ADDRESS CHANGED':
        return 'bg-amber-950/40 text-amber-400 border-amber-500/30';
      case 'TRAFFIC THRESHOLD':
        return 'bg-purple-950/40 text-purple-400 border-purple-500/30';
      case 'ROUTER STATUS':
        return 'bg-sky-950/40 text-sky-400 border-sky-500/30';
      default:
        return 'bg-[#1C1C1C] text-[#F5F5F5] border-[#2D2D2D]';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-5 sm:p-6 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-[#F5F5F5] uppercase flex items-center gap-2.5">
              <ListOrdered className="w-5 h-5 text-[#D4AF37]" />
              NETWORK EVENTS
            </h1>
            <p className="text-xs sm:text-sm text-[#888888] font-sans">
              Real-time audit log of LAN connections, disconnections, IP moves, and threshold alerts.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#2D2D2D] text-xs font-mono font-medium text-[#F5F5F5] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'POLLING...' : 'REFRESH LOGS'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl p-4 shadow-panel space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {eventTypes.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
                  filterType === tab
                    ? 'bg-[#1C1C1C] text-[#F5F5F5] font-bold border border-[#333333]'
                    : 'bg-[#121212] text-[#888888] hover:text-[#F5F5F5] border border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-72">
              <Search className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event details, device name..."
                className="w-full bg-[#050505] border border-[#222222] focus:border-[#D4AF37] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-[#F5F5F5] placeholder-[#555555] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#2D2D2D] text-xs font-mono text-[#F5F5F5]"
            >
              Search
            </button>
          </form>

        </div>
      </div>

      {/* Events Table (Desktop) */}
      <div className="bg-[#0B0B0B] border border-[#222222] rounded-xl overflow-hidden shadow-panel">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left monitor-table font-mono text-xs">
            <thead>
              <tr>
                <th>TIME</th>
                <th>DEVICE</th>
                <th>EVENT</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-[#888888]">
                    Loading network audit stream...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-[#888888]">
                    No network events recorded for the selected criteria.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#111111] transition-colors">
                    <td className="text-[#888888] whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="font-semibold text-[#F5F5F5] whitespace-nowrap">
                      {ev.device_name || 'Network Core'}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${getEventBadge(
                          ev.event_type,
                          ev.severity
                        )}`}
                      >
                        {ev.event_type}
                      </span>
                    </td>
                    <td className="text-[#A69D86] max-w-md truncate" title={ev.details}>
                      {ev.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Events List */}
        <div className="md:hidden divide-y divide-[#1A1A1A]">
          {loading ? (
            <div className="text-center py-10 text-xs font-mono text-[#888888]">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono text-[#888888]">
              No events found.
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-4 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getEventBadge(
                      ev.event_type,
                      ev.severity
                    )}`}
                  >
                    {ev.event_type}
                  </span>
                  <span className="text-[11px] text-[#666666]">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="font-semibold text-[#F5F5F5]">
                  {ev.device_name || 'Home Network'}
                </div>
                <div className="text-[#888888] text-[11px]">{ev.details}</div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
