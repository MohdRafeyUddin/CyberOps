import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Traffic from './pages/Traffic';
import Events from './pages/Events';
import Settings from './pages/Settings';
import api from './services/api';

function AppLayout({ children, networkStatus, wsConnected }) {
  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans flex flex-col selection:bg-[#D4AF37]/20 selection:text-[#F3D77A]">
      {/* Top Navbar */}
      <Navbar networkStatus={networkStatus} wsConnected={wsConnected} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Clean Monitoring Footer */}
      <footer className="border-t border-[#1C1C1C] bg-[#070707] py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#666666]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F5F5F5]">CYBEROPS HOME</span>
            <span>&bull;</span>
            <span>Home Network Monitoring Dashboard</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Gateway: {networkStatus?.gateway || '192.168.1.1'}</span>
            <span>&bull;</span>
            <span className={networkStatus?.collector_online ? 'text-emerald-400' : 'text-zinc-500'}>
              Collector: {networkStatus?.collector_online ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [networkStatus, setNetworkStatus] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const data = await api.getNetworkStatus();
      setNetworkStatus(data);
    } catch (err) {
      console.error('Network status fetch error:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    // Setup live WebSocket stream
    const setupWebSocket = () => {
      try {
        const wsUrl = api.getWebSocketUrl();
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'COLLECTOR_STATUS' || msg.type === 'DEVICES_UPDATED') {
              fetchStatus();
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Try reconnecting after 5 seconds
          setTimeout(setupWebSocket, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
          ws.close();
        };
      } catch (e) {
        setWsConnected(false);
      }
    };

    setupWebSocket();

    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <Router>
      <AppLayout networkStatus={networkStatus} wsConnected={wsConnected}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/traffic" element={<Traffic />} />
          <Route path="/events" element={<Events />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
