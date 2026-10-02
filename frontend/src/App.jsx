import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Events from './pages/Events';
import Assets from './pages/Assets';
import System from './pages/System';
import Login from './pages/Login';
import api from './services/api';

function AppLayout({ children, systemStatus, onLogout, isAuthenticated }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'THREAT OVERVIEW';
      case '/scanner':
        return 'ASSET SCANNER';
      case '/events':
        return 'SECURITY EVENTS';
      case '/assets':
        return 'ASSET INVENTORY';
      case '/system':
        return 'SYSTEM HEALTH';
      default:
        return 'SECURITY INTELLIGENCE';
    }
  };

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        systemStatus={systemStatus}
        onLogout={onLogout}
        isAuthenticated={isAuthenticated}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 cyber-grid">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Demo mode starts authenticated or checks local storage
  const [systemStatus, setSystemStatus] = useState({ api: true, database: true });

  useEffect(() => {
    const savedAuth = localStorage.getItem('cyberops_auth');
    if (savedAuth) {
      setIsAuthenticated(true);
    }

    const checkSystemHealth = async () => {
      try {
        const res = await api.getHealth();
        setSystemStatus({ api: res.status === 'online', database: true });
      } catch (err) {
        setSystemStatus({ api: false, database: false });
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cyberops_auth');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Main Application Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <AppLayout
                systemStatus={systemStatus}
                onLogout={handleLogout}
                isAuthenticated={isAuthenticated}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/scanner" element={<Scanner />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/system" element={<System />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
