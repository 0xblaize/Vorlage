import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { authClient } from '../lib/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: authError } = await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/login`,
      });
      // For privacy Better Auth doesn't leak whether the email exists — we
      // always show the same confirmation message.
      if (authError) {
        setError(authError.message ?? 'Could not send reset email');
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-fuchsia-500/30 overflow-hidden relative bg-slate-900 text-slate-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none opacity-[0.04]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-96 bg-rose-500/20 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 md:p-10 rounded-[2rem] border bg-white/[0.02] border-white/10 shadow-2xl shadow-rose-500/5 relative z-10 backdrop-blur-md"
      >
        <div className="flex justify-center mb-8">
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter text-white hover:text-indigo-400 transition-colors"
          >
            VORLAGE.
          </Link>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <h2 className="text-3xl font-display font-medium text-white mb-2">
          Reset Password
        </h2>
        <p className="text-slate-400 mb-8 text-sm">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6"
          >
            If an account exists for {email}, a password reset link has been
            sent.
          </motion.div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 mt-2 rounded-xl font-medium text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? 'Sending…' : 'Send Reset Link'}</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
