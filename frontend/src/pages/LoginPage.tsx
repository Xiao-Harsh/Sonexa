import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div
      className="min-h-screen bg-[#070707] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-y-auto select-none"
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      {/* Subtle ambient music room lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 25%, rgba(255,255,255,0.03) 0%, transparent 65%)',
        }}
      />

      {/* Subtle noise texture consistent with landing page */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: '256px 256px',
        }}
      />

      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        className="self-start mb-4 sm:absolute sm:top-8 sm:left-8 flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer z-20 py-2 px-3 rounded-full hover:bg-white/[0.05]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Sonexa
      </button>

      {/* Login Card Container */}
      <div className="w-full max-w-[420px] bg-[#121212]/80 backdrop-blur-2xl border border-white/[0.09] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative z-10">
        {/* Sonexa Brand Wordmark Header — clean, authentic, no AI gradient badges */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link
            to="/"
            className="font-black text-2xl tracking-[-0.03em] text-white uppercase hover:opacity-85 transition-opacity mb-4"
          >
            SONEXA
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Sign in to continue your listening session
          </p>
        </div>

        {/* Error Alert Pill */}
        {error && (
          <div className="mb-5 flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-left">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="text-xs text-rose-300 leading-relaxed font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-white/40 focus:bg-white/[0.06] rounded-2xl text-sm text-white placeholder:text-neutral-600 outline-none transition-all"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-white/40 focus:bg-white/[0.06] rounded-2xl text-sm text-white placeholder:text-neutral-600 outline-none transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-white hover:bg-neutral-100 disabled:opacity-50 text-black rounded-full text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,255,255,0.08)] active:scale-[0.98] transition-all cursor-pointer mt-6"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Footer actions */}
        <div className="mt-7 text-center">
          <p className="text-xs text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-white hover:underline font-semibold ml-0.5">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
