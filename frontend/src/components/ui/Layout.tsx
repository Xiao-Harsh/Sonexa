import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Home,
  Compass,
  Library,
  Shuffle,
  Plus,
  Search,
  Play,
  LogOut,
  Heart
} from 'lucide-react';
import { AudioEngine } from '../music/AudioEngine';
import { PlayerBar } from '../music/PlayerBar';
import { ErrorBoundary } from './ErrorBoundary';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { ToastContainer } from './ToastContainer';
import { SearchModal } from './SearchModal';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { musicApi } from '../../api/musicApi';
import type { Track } from '../../api/musicApi';
import { useToastStore } from '../../store/toastStore';
import { AvatarRenderer } from '../../utils/avatars';

export const Layout: React.FC = () => {
  useKeyboardControls();
  const { logout, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { playlists, history, fetchPlaylists, fetchHistory } = useLibraryStore();
  const { playTrack } = usePlayerStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sidebarTrending, setSidebarTrending] = useState<Track[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
      fetchHistory();
    }
    musicApi.getTrendingTracks('')
      .then((data) => setSidebarTrending(data.slice(0, 5)))
      .catch((err) => console.error('Failed to load sidebar trending', err));
  }, [isAuthenticated, fetchPlaylists, fetchHistory]);

  // Keyboard shortcut listener for ⌘ K / Ctrl K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRandomPlay = async () => {
    try {
      const data = await musicApi.getTrendingTracks('');
      if (data && data.length > 0) {
        usePlayerStore.getState().setQueue(data);
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomTrack = data[randomIndex];
        playTrack(randomTrack);
        useToastStore.getState().showToast(`🎲 Playing Random: ${randomTrack.title}`, 'info');
      } else {
        useToastStore.getState().showToast('Fetching random tracks...', 'info');
      }
    } catch (err) {
      console.error('Random play error:', err);
    }
  };

  return (
    <div className="flex h-screen bg-[#090909] text-white overflow-hidden select-none relative font-sans">
      {/* LEFT SIDEBAR */}
      <aside className="hidden md:flex w-64 shrink-0 bg-[#0e0e0e] border-r border-white/5 p-6 flex-col justify-between relative z-20">
        <div className="space-y-7 overflow-y-auto no-scrollbar">
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-1.5">
            <span className="font-black text-3xl tracking-tighter text-white uppercase">
              sonexa
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <NavLink
              to="/app"
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive
                  ? 'bg-neutral-800/80 border border-white/10 text-white shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-850 hover:text-white border border-transparent'
                }`
              }
            >
              <Home className="w-4 h-4" />
              Home
            </NavLink>

            <NavLink
              to="/search"
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive
                  ? 'bg-neutral-800/80 border border-white/10 text-white shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-850 hover:text-white border border-transparent'
                }`
              }
            >
              <Compass className="w-4 h-4" />
              Explore
            </NavLink>

            <NavLink
              to="/library"
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive
                  ? 'bg-neutral-800/80 border border-white/10 text-white shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-850 hover:text-white border border-transparent'
                }`
              }
            >
              <Library className="w-4 h-4" />
              Library
            </NavLink>

            <div
              onClick={handleRandomPlay}
              className="flex items-center gap-3.5 px-3.5 py-2.5 text-neutral-400 hover:bg-neutral-850 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all border border-transparent group"
            >
              <Shuffle className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              Random Songs
            </div>

            <NavLink
              to="/library"
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive
                  ? 'bg-neutral-800/80 border border-white/10 text-white shadow-sm'
                  : 'text-neutral-400 hover:bg-neutral-850 hover:text-white border border-transparent'
                }`
              }
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              Favorites
            </NavLink>
          </nav>

          {/* PLAYLISTS SECTION */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-3">
              Playlists
            </p>
            <div className="space-y-1">
              {isAuthenticated ? (
                <>
                  {playlists.length > 0 ? (
                    playlists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => navigate(`/playlist/${pl.id}`)}
                        className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-850 rounded-lg transition-all cursor-pointer"
                      >
                        <div className="w-5 h-5 bg-neutral-800 rounded flex items-center justify-center shrink-0 text-[10px] font-bold text-neutral-400">
                          🎵
                        </div>
                        <span className="truncate">{pl.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-neutral-500 font-medium">
                      No playlists created
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/library')}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer w-full text-left"
                  >
                    <Plus className="w-4 h-4 text-neutral-400" />
                    New Playlist
                  </button>
                </>
              ) : (
                <div
                  onClick={() => navigate('/login')}
                  className="px-3 py-2 text-xs text-neutral-400 hover:text-white font-medium cursor-pointer transition-colors"
                >
                  Sign in to create playlists &rarr;
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER & RIGHT CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* TOP HEADER - Mobile Floating Pill (Matching Image 2 / Landing Page) & Desktop Header */}
        <header className="shrink-0 z-30 transition-all">
          {/* MOBILE VIEW (< md): Floating Pill Navbar matching Landing Page / Image 2 */}
          <div className="md:hidden px-4 pt-3 pb-1">
            <div className="flex items-center justify-between gap-3 bg-[#121212]/85 backdrop-blur-2xl border border-white/[0.09] rounded-full px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
              {/* Left Brand Wordmark */}
              <button
                onClick={() => navigate('/app')}
                className="font-black text-[18px] tracking-[-0.03em] text-white uppercase cursor-pointer shrink-0 hover:opacity-85 transition-opacity"
              >
                SONEXA
              </button>

              {/* Right Side Actions: Search Icon (on left side of sign in) + Sign In / User */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Search Icon with authentic hover effect */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer"
                  title="Search (Ctrl+K)"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Sign In / Profile Button */}
                {isAuthenticated ? (
                  <div
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-1.5 p-0.5 hover:bg-white/10 rounded-full cursor-pointer transition-all active:scale-95"
                    title="View Profile"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden shadow-md select-none">
                      <AvatarRenderer avatarKey={user?.avatar || 'mascot1'} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-full transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DESKTOP VIEW (>= md): Full-width glass header with search trigger */}
          <div className="hidden md:flex h-16 border-b border-white/5 px-8 items-center justify-between bg-[#090909]/80 backdrop-blur-md">
            {/* Search bar trigger */}
            <div
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-4 py-2 bg-[#141414] border border-white/5 hover:border-white/10 rounded-full w-full max-w-md cursor-pointer transition-all text-neutral-400 text-xs font-medium"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">Search songs, artists...</span>
              <span className="ml-auto px-2 py-0.5 bg-neutral-800 text-[10px] font-bold text-neutral-400 rounded-md border border-white/5">
                Ctrl K
              </span>
            </div>

            {/* Right Header Actions: User Profile or Sign In CTA */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-neutral-850 rounded-full cursor-pointer transition-all border border-transparent hover:border-white/5"
                    title="View Profile"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shadow-md select-none">
                      <AvatarRenderer avatarKey={user?.avatar || 'mascot1'} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-neutral-850 rounded-full transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-full transition-all cursor-pointer shadow-md"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 py-2 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY (Center Canvas + Right Sidebar) */}
        <div className="flex-1 flex overflow-hidden">
          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-36 md:pb-32">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>

          {/* RIGHT SIDEBAR PANEL */}
          <aside className="hidden lg:block w-80 shrink-0 bg-[#090909] border-l border-white/5 p-6 overflow-y-auto space-y-7 no-scrollbar pb-32">
            {/* Recently Played / User History */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white tracking-tight">Recently Played</h3>
                {isAuthenticated && (
                  <span onClick={() => navigate('/library')} className="text-xs font-medium text-neutral-500 hover:text-white cursor-pointer transition-colors">
                    View all
                  </span>
                )}
              </div>

              {isAuthenticated ? (
                <div className="space-y-2">
                  {history.length > 0 ? (
                    history.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 hover:bg-[#141414] rounded-xl transition-all cursor-pointer group"
                        onClick={() => playTrack(item)}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-neutral-850 rounded-lg overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                            {item.artwork?.['150x150'] ? (
                              <img src={item.artwork['150x150']} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm">🎵</span>
                            )}
                          </div>
                          <div className="overflow-hidden text-left">
                            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                            <p className="text-[10px] text-neutral-400 truncate">{item.user?.name || 'Artist'}</p>
                          </div>
                        </div>
                        <button className="p-1.5 text-neutral-500 group-hover:text-white transition-colors cursor-pointer">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-[#141414] border border-white/5 rounded-2xl text-center text-xs text-neutral-500 font-medium">
                      No recently played tracks yet
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[#141414] border border-white/5 rounded-2xl space-y-3 text-left">
                  <h4 className="font-bold text-xs text-white">Save your music</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Sign in to track your recently played songs, favorite tracks, and playlists across sessions.
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-full transition-all cursor-pointer shadow-md"
                  >
                    Sign In / Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Trending Now */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white tracking-tight">Trending Now</h3>
                <span onClick={() => navigate('/search')} className="text-xs font-medium text-neutral-500 hover:text-white cursor-pointer transition-colors">
                  View all
                </span>
              </div>
              <div className="space-y-2">
                {sidebarTrending.length > 0 ? (
                  sidebarTrending.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 hover:bg-[#141414] rounded-xl transition-all cursor-pointer group"
                      onClick={() => {
                        usePlayerStore.getState().setQueue(sidebarTrending);
                        playTrack(item);
                      }}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-xs font-mono text-neutral-500 shrink-0 w-5 text-center font-bold">
                          {`0${idx + 1}`}
                        </span>
                        <div className="w-9 h-9 bg-neutral-850 rounded-lg overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                          {item.artwork?.['150x150'] ? (
                            <img src={item.artwork['150x150']} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">🔥</span>
                          )}
                        </div>
                        <div className="overflow-hidden text-left">
                          <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                          <p className="text-[10px] text-neutral-400 truncate">{item.user?.name || 'Artist'}</p>
                        </div>
                      </div>
                      <button className="p-1.5 text-neutral-500 group-hover:text-white transition-colors cursor-pointer">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-[#141414] border border-white/5 rounded-2xl text-center text-xs text-neutral-500 font-medium">
                    Loading trending tracks...
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* OVERLAY & AUDIO COMPONENTS */}
      <AudioEngine />
      <PlayerBar />
      <ToastContainer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0e0e0e]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around z-45 px-6">
        <NavLink
          to="/app"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-white font-bold' : 'text-neutral-400'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-white font-bold' : 'text-neutral-400'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Explore</span>
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-white font-bold' : 'text-neutral-400'
            }`
          }
        >
          <Library className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Library</span>
        </NavLink>
      </nav>
    </div>
  );
};
