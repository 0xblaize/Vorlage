import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mic } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-fuchsia-500/30 overflow-hidden relative bg-slate-900 text-slate-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none opacity-[0.04]" />
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-fuchsia-500/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 md:p-10 rounded-[2rem] border bg-white/[0.02] border-white/10 shadow-2xl shadow-fuchsia-500/5 relative z-10 backdrop-blur-md"
      >
        <div className="flex justify-center mb-8">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white hover:text-indigo-400 transition-colors">
            VORLAGE.
          </Link>
        </div>
        
        <h2 className="text-3xl font-display font-medium text-center text-white mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Sign in to continue to VORLAGE.</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 mt-4 rounded-xl font-medium text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign up for Early Access</Link>
        </div>
      </motion.div>
    </div>
  );
}
