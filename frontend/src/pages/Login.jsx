import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, User, Lock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

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
        setError('ACCESS DENIED: Invalid operator authorization credentials');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#000000] relative overflow-hidden font-sans">
      {/* Background Orbital Geometric Circles & Ambient Gold Glow (Aurum-inspired) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Central ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial-gold opacity-60 blur-3xl pointer-events-none" />

        {/* Large concentric orbital rings */}
        <div className="orbital-ring w-[900px] h-[900px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        <div className="orbital-ring-dashed w-[650px] h-[650px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25" />
        <div className="orbital-ring w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />

        {/* Gold micro-grid */}
        <div className="absolute inset-0 gold-micro-grid opacity-50" />
      </div>

      {/* Center Luxury Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#080808]/95 backdrop-blur-2xl border border-[#D4AF37]/35 rounded-2xl shadow-[0_0_50px_-10px_rgba(212,175,55,0.25)] overflow-hidden p-8 sm:p-10">
        
        {/* Top Metallic Gold Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F3D77A] to-transparent"></div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0D0D0D] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-4 shadow-glow-gold">
            <Shield className="w-7 h-7 text-[#D4AF37]" />
          </div>

          <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-[0.2em] text-[#F5F1E8]">
            CYBER<span className="text-gold-gradient">OPS</span>
          </h1>
          <p className="text-[10px] font-mono tracking-[0.3em] text-[#A69D86] uppercase mt-1.5">
            SECURITY INTELLIGENCE PLATFORM
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#1A0808] border border-[#FF3333]/50 text-[#FF8080] font-mono text-xs flex items-center gap-2.5 shadow-[0_0_15px_rgba(255,51,51,0.2)]">
            <AlertCircle className="w-4 h-4 text-[#FF4D4D] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 font-mono text-xs">
          <div>
            <label className="text-[#F3D77A] font-bold uppercase tracking-wider block mb-2 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              OPERATOR ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              className="w-full bg-[#020202] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-[#F5F1E8] placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="text-[#F3D77A] font-bold uppercase tracking-wider block mb-2 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              ACCESS KEY / PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="cyberops"
              required
              className="w-full bg-[#020202] border border-[#D4AF37]/30 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-sm text-[#F5F1E8] placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-inner"
            />
          </div>

          {/* Demo Hint Banner */}
          <div className="p-3 rounded-xl bg-[#0D0D0D] border border-[#D4AF37]/20 text-[11px] text-[#A69D86] flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              Default Operator Token: <strong className="text-[#F3D77A]">admin</strong> /{' '}
              <strong className="text-[#F3D77A]">cyberops</strong>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F3D77A] via-[#D4AF37] to-[#8F6F1B] hover:from-[#FFF0B8] hover:via-[#F3D77A] hover:to-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest shadow-glow-gold transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>VERIFYING CREDENTIALS...</span>
              </>
            ) : (
              'ESTABLISH SECURE SESSION'
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-[#D4AF37]/15 text-center">
          <p className="text-[10px] font-mono text-[#8F6F1B] uppercase tracking-widest">
            AUTHENTICATION PROTOCOL: SOC-2 COMPLIANT &bull; RSA-4096
          </p>
        </div>
      </div>
    </div>
  );
}
