import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen font-sans selection:bg-fuchsia-500/30 overflow-hidden relative bg-slate-900 text-slate-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none opacity-[0.04]" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 md:p-10 rounded-[2rem] border bg-white/[0.02] border-white/10 shadow-2xl shadow-indigo-500/5 relative z-10 backdrop-blur-md"
      >
        <div className="flex justify-center mb-8">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white hover:text-indigo-400 transition-colors">
            VORLAGE.
          </Link>
        </div>
        
        <h2 className="text-3xl font-display font-medium text-center text-white mb-2">Early Access</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Join the waitlist for VORLAGE.</p>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="Ada Lovelace"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 mt-4 rounded-xl font-medium text-slate-900 bg-white hover:bg-slate-100 shadow-lg shadow-white/10 transition-all"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
