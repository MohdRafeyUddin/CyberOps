import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, User, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('cyberops');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Demo authentication check
      if (username.trim() === 'admin' && password === 'cyberops') {
        localStorage.setItem('cyberops_auth', JSON.stringify({ user: 'admin', token: 'demo-soc-session-token' }));
        if (onLoginSuccess) onLoginSuccess();
        navigate('/');
      } else {
        setError('ACCESS DENIED: Invalid SOC operator credentials');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#060910] cyber-grid relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20"></div>

      <div className="relative w-full max-w-md bg-[#0e1626]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Top Tech Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500"></div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-glow-green">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-mono font-extrabold text-2xl tracking-wider text-white">
            CYBER<span className="text-emerald-400">OPS</span>
          </h1>
          <p className="text-xs font-mono tracking-widest text-slate-400 uppercase mt-1">
            Security Intelligence Gateway
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-xs flex items-center gap-2 shadow-glow-red">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Operator ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-semibold text-slate-300 uppercase block mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Access Key / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="cyberops"
              required
              className="w-full bg-[#060910] border border-[#1f2e4d] focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>

          {/* Demo Hint Banner */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-start gap-2">
            <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              Demo Credentials: <span className="text-emerald-400 font-semibold">admin</span> /{' '}
              <span className="text-cyan-400 font-semibold">cyberops</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider shadow-glow-green transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                AUTHENTICATING OPERATOR...
              </>
            ) : (
              'ESTABLISH SECURE SESSION'
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            AUTHORIZATION LEVEL: SOC TIER 1 &bull; DEFCON NORMAL
          </p>
        </div>
      </div>
    </div>
  );
}
