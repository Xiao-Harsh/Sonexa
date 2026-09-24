import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { formatDuration } from '../utils/formatDuration';
import { LogOut, Mail, FolderHeart, ListMusic, History, User, Play, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AvatarRenderer, avatarsMap } from '../utils/avatars';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateAvatar } = useAuthStore();
  const {
    playlists,
    favorites,
    history: playHistory,
    fetchPlaylists,
    fetchFavorites,
    fetchHistory,
  } = useLibraryStore();
  const { setQueue, playTrack } = usePlayerStore();

  useEffect(() => {
    fetchPlaylists();
    fetchFavorites();
    fetchHistory();
  }, [fetchPlaylists, fetchFavorites, fetchHistory]);

  const currentAvatar = user?.avatar || 'mascot1';

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left">
      {/* Directory Back Navigation & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 sm:p-2.5 bg-[#141414] hover:bg-neutral-800 border border-white/5 hover:border-white/10 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm"
          title="Go Back"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400">
          <button onClick={() => navigate('/app')} className="hover:text-white transition-colors cursor-pointer">
            Home
          </button>
          <span className="text-neutral-600">/</span>
          <span className="text-white">Account Profile</span>
        </div>
      </div>

      <div className="relative bg-[#121212] border border-white/5 rounded-2xl p-5 sm:p-8 overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center shadow-xl shrink-0 select-none">
            <AvatarRenderer avatarKey={currentAvatar} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1 sm:space-y-1.5 text-center sm:text-left min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
              {user?.username}
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </p>
            <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-white/5 border border-white/10 text-neutral-300 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
              Standard Account
            </span>
          </div>
        </div>
      </div>

      {/* FIXED PROFILE ICON SELECTOR (Netflix-style shiny vector mascots) */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 sm:p-6 shadow-lg space-y-3 sm:space-y-4">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-white">Choose Profile Mascot</h3>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 sm:mt-1">Select one of five unique musical mascots.</p>
        </div>
        <div className="flex gap-2.5 sm:gap-4 flex-wrap">
          {Object.keys(avatarsMap).map((key) => {
            const Component = avatarsMap[key];
            return (
              <button
                key={key}
                onClick={() => updateAvatar(key)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex items-center justify-center border transition-all cursor-pointer p-0.5 ${
                  currentAvatar === key
                    ? 'bg-neutral-800/60 border-white shadow-md scale-105'
                    : 'bg-neutral-900/40 border-white/5 hover:bg-neutral-900/80 hover:border-white/10'
                }`}
                title={`Mascot ${key.replace('mascot', '')}`}
              >
                <Component className="w-full h-full object-cover rounded-lg" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-[#141414] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-4">
          <div className="p-2.5 sm:p-3 bg-white/5 border border-white/5 text-white rounded-xl shrink-0">
            <FolderHeart className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-neutral-500">Liked Songs</p>
            <p className="text-lg sm:text-xl font-bold text-white">{favorites.length}</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-4">
          <div className="p-2.5 sm:p-3 bg-white/5 border border-white/5 text-white rounded-xl shrink-0">
            <ListMusic className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-neutral-500">Custom Playlists</p>
            <p className="text-lg sm:text-xl font-bold text-white">{playlists.length}</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex items-center gap-4">
          <div className="p-2.5 sm:p-3 bg-white/5 border border-white/5 text-white rounded-xl shrink-0">
            <History className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-neutral-500">Recently Played</p>
            <p className="text-lg sm:text-xl font-bold text-white">{playHistory.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-xs sm:text-sm text-neutral-400 uppercase tracking-wider">Your Playlists</h3>
            <Link to="/library" className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors">View All</Link>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {playlists.length > 0 ? (
              playlists.slice(0, 4).map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="flex items-center justify-between p-3 sm:p-3.5 bg-[#141414] hover:bg-neutral-800 border border-white/5 hover:border-white/10 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="p-2 bg-neutral-900 border border-white/5 rounded-lg text-neutral-400 group-hover:text-white transition-colors shrink-0">
                      <ListMusic className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[120px] min-[380px]:max-w-[160px]">
                      {playlist.name}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-neutral-500 font-semibold uppercase tracking-wider shrink-0 ml-2">
                    {playlist.tracks?.length || 0} tracks
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-6 text-center">No playlists created yet</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-xs sm:text-sm text-neutral-400 uppercase tracking-wider">Listening Activity</h3>
            <span className="text-xs text-neutral-500 font-medium">Recent tracks</span>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            {playHistory.length > 0 ? (
              playHistory.slice(0, 4).map((track, idx) => (
                <div
                  key={track.id + '-profile-' + idx}
                  className="flex items-center justify-between p-3 sm:p-3.5 bg-[#141414] hover:bg-neutral-800 border border-white/5 hover:border-white/10 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-900 border border-white/5 rounded-lg overflow-hidden flex items-center justify-center shrink-0 relative">
                      <User className="w-4 h-4 text-neutral-600 absolute inset-0 m-auto" />
                      {track.artwork?.["150x150"] && (
                        <img
                          src={track.artwork["150x150"]}
                          alt={track.title}
                          className="object-cover w-full h-full relative z-10"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div className="text-left overflow-hidden min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate" title={track.title || 'Untitled Track'}>
                        {track.title || 'Untitled Track'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-neutral-400 truncate mt-0.5 font-medium">
                        {track.user?.name || 'Artist'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                    <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">{formatDuration(track.duration)}</span>
                    <button
                      onClick={() => {
                        setQueue(playHistory);
                        playTrack(track);
                      }}
                      className="p-2 sm:p-2.5 bg-neutral-900 group-hover:bg-white border border-white/10 group-hover:border-white text-neutral-400 group-hover:text-black rounded-full shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      title="Play Track"
                    >
                      <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-12 text-center">No listening history logged yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 flex justify-end">
        <button
          onClick={logout}
          className="py-3 px-6 bg-[#141414] hover:bg-rose-950/20 hover:text-rose-400 border border-white/5 hover:border-rose-900/40 text-neutral-300 rounded-full text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};
