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

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/app');
    }
  };

  return (
    <div
      className="auth-page-container h-[100dvh] w-full bg-[#070707] text-white flex flex-col items-center justify-center px-4 py-4 sm:px-6 sm:py-6 relative select-none overflow-y-auto"
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      {/* Subtle ambient lighting */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 65%)',
        }}
      />

      {/* Centered responsive content container */}
      <div className="auth-box-wrapper w-full max-w-[420px] my-auto flex flex-col z-10">
        {/* Floating Back button aligned with card */}
        <div className="auth-back-wrapper flex justify-start mb-2.5 sm:mb-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-2.5 sm:py-1.5 sm:px-3 rounded-full hover:bg-white/[0.05] active:scale-95"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

        {/* Auth Card */}
        <div className="auth-card w-full bg-[#121212]/90 backdrop-blur-2xl border border-white/[0.09] shadow-[0_24px_70px_rgba(0,0,0,0.85)] rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all">
          {/* Header Section */}
          <div className="auth-header-section flex flex-col items-center text-center mb-6 sm:mb-8">
            <Link
              to="/"
              className="auth-logo font-black text-2xl tracking-[-0.03em] text-white uppercase hover:opacity-85 transition-opacity mb-2.5 sm:mb-4"
            >
              SONEXA
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Sign In</h1>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              Enter your credentials to access your library
            </p>
          </div>

          {/* Form Side */}
          <div className="auth-form-section flex flex-col">
            {/* Error Alert */}
            {error && (
              <div className="mb-3 flex items-start gap-2.5 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-xs text-rose-300 leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Email field */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-base sm:text-sm bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-white/40 focus:bg-white/[0.06] rounded-xl sm:rounded-2xl text-white placeholder:text-neutral-600 outline-none transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2 sm:py-2.5 text-base sm:text-sm bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-white/40 focus:bg-white/[0.06] rounded-xl sm:rounded-2xl text-white placeholder:text-neutral-600 outline-none transition-all"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 mt-1.5 bg-white hover:bg-neutral-100 disabled:opacity-50 text-black rounded-full text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,255,255,0.08)] active:scale-[0.98] transition-all cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </button>
            </form>

            {/* Footer */}
            <div className="auth-footer-section mt-4 sm:mt-5 text-center">
              <p className="text-xs text-neutral-400">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-white hover:underline font-semibold ml-0.5">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
