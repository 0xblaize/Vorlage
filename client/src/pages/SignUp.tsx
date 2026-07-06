import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authClient } from '../lib/auth';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data, error: authError } = await authClient.signUp.email({
        email,
        password,
        name: name.trim() || email,
      });
      if (authError) {
        setError(authError.message ?? 'Could not create account');
        return;
      }
      // Better Auth auto-signs-in when email verification is off; when it's
      // on, `data` still comes back but there's no active session yet — show
      // the verification prompt so the user knows to check their inbox.
      const session = await authClient.getSession();
      if (!session.data && data) {
        setVerificationSent(true);
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setOauthLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/dashboard`,
      });
    } catch (err) {
      setOauthLoading(false);
      setError(err instanceof Error ? err.message : String(err));
    }
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
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter text-white hover:text-indigo-400 transition-colors"
          >
            VORLAGE.
          </Link>
        </div>

        <h2 className="text-3xl font-display font-medium text-center text-white mb-2">
          Early Access
        </h2>
        <p className="text-slate-400 text-center mb-8 text-sm">
          Create your VORLAGE account.
        </p>

        {verificationSent ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm">
            Check <span className="font-medium">{email}</span> for a
            verification link. Once verified, sign in to continue.
            <div className="mt-4">
              <Link
                to="/login"
                className="text-emerald-300 hover:text-emerald-200 underline"
              >
                Go to sign in →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={oauthLoading || submitting}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GoogleGlyph />
              )}
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs uppercase tracking-wider text-slate-500">
                or
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="Ada Lovelace"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || oauthLoading}
                className="w-full py-3.5 mt-2 rounded-xl font-medium text-slate-900 bg-white hover:bg-slate-100 shadow-lg shadow-white/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Creating…' : 'Create Account'}</span>
              </button>
            </form>
          </>
        )}

        <div className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
