import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Dynamic viewport tracking for completely flexible layout across all devices & landscape mode
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        w: window.innerWidth,
        h: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isLandscape = viewport.w > viewport.h;
  // Short landscape mobile (e.g. phones in landscape orientation, h < 520px)
  const isShortLandscape = isLandscape && viewport.h < 520;
  // Wide screen: desktop, laptop, or tablet in landscape/portrait (w >= 768px and h >= 520px)
  const isWideScreen = viewport.w >= 768 && (!isLandscape || viewport.h >= 520);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email || !username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(email, username, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
      className="min-h-[100dvh] w-full bg-[#070707] text-white flex flex-col items-center justify-center p-3 sm:p-6 relative select-none overflow-y-auto"
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

      {/* Floating Back button */}
      <div
        className={`w-full ${
          isWideScreen ? 'max-w-[780px]' : isShortLandscape ? 'max-w-[700px]' : 'max-w-[420px]'
        } flex justify-start mb-2 sm:mb-2.5 z-20`}
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-full hover:bg-white/[0.05] active:scale-95"
          title="Go Back"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>

      {/* Dynamic, Flexible Auth Container for All Devices */}
      <div
        className={`w-full my-auto ${
          isWideScreen
            ? 'max-w-[780px] grid grid-cols-2 rounded-3xl overflow-hidden'
            : isShortLandscape
            ? 'max-w-[700px] grid grid-cols-2 rounded-2xl p-4 sm:p-5 gap-5 items-center'
            : 'max-w-[420px] flex flex-col rounded-2xl sm:rounded-3xl p-5 sm:p-8'
        } bg-[#121212]/90 backdrop-blur-2xl border border-white/[0.09] shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative z-10 transition-all duration-200`}
      >
        {/* ── DESKTOP & TABLET: LEFT BRAND PANEL (Clean, Authentic, No Extra Marketing Copy) ── */}
        {isWideScreen && (
          <div className="flex flex-col justify-between p-8 lg:p-10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent border-r border-white/[0.07] text-left">
            <div>
              <Link
                to="/"
                className="font-black text-2xl tracking-[-0.03em] text-white uppercase hover:opacity-85 transition-opacity inline-block mb-8"
              >
                SONEXA
              </Link>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                Create account
              </h2>
              <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
                Join Sonexa and curate your personal music collection.
              </p>
            </div>

            <div className="pt-8">
              <p className="text-xs text-neutral-500">
                Already have an account?{' '}
                <Link to="/login" className="text-white hover:underline font-semibold ml-0.5">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ── SHORT LANDSCAPE MOBILE: COMPACT BRAND COLUMN ── */}
        {isShortLandscape && (
          <div className="flex flex-col items-start text-left pr-2">
            <Link
              to="/"
              className="font-black text-xl tracking-[-0.03em] text-white uppercase hover:opacity-85 transition-opacity mb-2"
            >
              SONEXA
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">Create account</h1>
            <p className="text-neutral-400 text-xs mt-1 leading-normal">
              Join Sonexa and curate your personal music collection
            </p>
          </div>
        )}

        {/* ── FORM SECTION (Adapts gracefully to Desktop, Landscape Mobile, and Portrait) ── */}
        <div className={isWideScreen ? 'p-8 lg:p-10 flex flex-col justify-center' : ''}>
          {/* Header for Portrait Mobile */}
          {!isWideScreen && !isShortLandscape && (
            <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
              <Link
                to="/"
                className="font-black text-xl sm:text-2xl tracking-[-0.03em] text-white uppercase hover:opacity-85 transition-opacity mb-2 sm:mb-4"
              >
                SONEXA
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Create account</h1>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Join Sonexa and curate your personal music collection
              </p>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-3 flex items-start gap-2.5 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-left">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-xs text-rose-300 leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-3 flex items-start gap-2.5 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-left">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs text-emerald-300 leading-relaxed font-medium">
                Account created successfully! Redirecting...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={isShortLandscape ? 'space-y-2' : 'space-y-3 sm:space-y-3.5'}>
            {/* Username field */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 text-left">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="audiophile"
                  className={`w-full pl-10 pr-4 ${isShortLandscape ? 'py-1.5 text-xs' : 'py-2 sm:py-2.5 text-sm'} bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-white/40 focus:bg-white/[0.06] rounded-xl sm:rounded-2xl text-white placeholder:text-neutral-600 outline-none transition-all`}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 text-left">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 ${isShortLandscape ? 'py-1.5 text-xs' : 'py-2 sm:py-2.5 text-sm'} bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-white/40 focus:bg-white/[0.06] rounded-xl sm:rounded-2xl text-white placeholder:text-neutral-600 outline-none transition-all`}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 text-left">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className={`w-full pl-10 pr-11 ${isShortLandscape ? 'py-1.5 text-xs' : 'py-2 sm:py-2.5 text-sm'} bg-white/[0.04] border border-white/[0.10] hover:border-white/[0.18] focus:border-white/40 focus:bg-white/[0.06] rounded-xl sm:rounded-2xl text-white placeholder:text-neutral-600 outline-none transition-all`}
                  required
                  autoComplete="new-password"
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

            {/* Sign Up CTA Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className={`w-full ${isShortLandscape ? 'py-2 mt-2' : 'py-2.5 sm:py-3.5 mt-2.5 sm:mt-4'} bg-white hover:bg-neutral-100 disabled:opacity-50 text-black rounded-full text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(255,255,255,0.08)] active:scale-[0.98] transition-all cursor-pointer`}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </button>
          </form>

          {/* Footer actions for Mobile and Landscape */}
          {!isWideScreen && (
            <div className={`mt-3 sm:mt-4 ${isShortLandscape ? 'text-left' : 'text-center'}`}>
              <p className="text-xs text-neutral-400">
                Already have an account?{' '}
                <Link to="/login" className="text-white hover:underline font-semibold ml-0.5">
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
