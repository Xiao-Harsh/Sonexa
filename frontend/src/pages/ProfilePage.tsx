import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { formatDuration } from '../utils/formatDuration';
import { LogOut, Mail, FolderHeart, ListMusic, History, User, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AvatarRenderer, avatarsMap } from '../utils/avatars';

export const ProfilePage: React.FC = () => {
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
  }, []);

  const currentAvatar = user?.avatar || 'mascot1';

  return (
    <div className="space-y-8 text-left">
      <div className="relative bg-[#141414] border border-white/5 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shadow-xl shrink-0 select-none">
            <AvatarRenderer avatarKey={currentAvatar} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {user?.username}
            </h1>
            <p className="text-neutral-400 text-sm flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-3.5 h-3.5 text-neutral-500" />
              {user?.email}
            </p>
            <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 text-neutral-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Standard Account
            </span>
          </div>
        </div>
      </div>

      {/* FIXED PROFILE ICON SELECTOR (Netflix-style shiny vector mascots) */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-lg space-y-4">
        <div>
          <h3 className="font-bold text-sm text-white">Choose Profile Mascot</h3>
          <p className="text-xs text-neutral-400 mt-1">Select one of five unique, clean, and shiny musical mascots.</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          {Object.keys(avatarsMap).map((key) => {
            const Component = avatarsMap[key];
            return (
              <button
                key={key}
                onClick={() => updateAvatar(key)}
                className={`w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center border transition-all cursor-pointer p-0.5 ${
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-white/5 border border-white/5 text-white rounded-xl">
            <FolderHeart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Liked Songs</p>
            <p className="text-xl font-bold text-white">{favorites.length}</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-white/5 border border-white/5 text-white rounded-xl">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Custom Playlists</p>
            <p className="text-xl font-bold text-white">{playlists.length}</p>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-white/5 border border-white/5 text-white rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Recently Played</p>
            <p className="text-xl font-bold text-white">{playHistory.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-sm text-neutral-400 uppercase tracking-wider">Your Playlists</h3>
            <Link to="/library" className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors">View All</Link>
          </div>
          <div className="space-y-3">
            {playlists.length > 0 ? (
              playlists.slice(0, 4).map((playlist) => (
                <Link
                  key={playlist.id}
                  to={`/playlist/${playlist.id}`}
                  className="flex items-center justify-between p-3.5 bg-[#141414] hover:bg-neutral-800 border border-white/5 hover:border-white/10 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-900 border border-white/5 rounded-lg text-neutral-400 group-hover:text-white transition-colors">
                      <ListMusic className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-white truncate max-w-[120px]">
                      {playlist.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                    {playlist.tracks?.length || 0} tracks
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-6 text-center">No playlists created yet</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-sm text-neutral-400 uppercase tracking-wider">Listening Activity</h3>
            <span className="text-xs text-neutral-500 font-medium">Recent tracks</span>
          </div>
          <div className="space-y-3">
            {playHistory.length > 0 ? (
              playHistory.slice(0, 4).map((track, idx) => (
                <div
                  key={track.id + '-profile-' + idx}
                  className="flex items-center justify-between p-3.5 bg-[#141414] hover:bg-neutral-800 border border-white/5 hover:border-white/10 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-900 border border-white/5 rounded overflow-hidden flex items-center justify-center shrink-0">
                      {track.artwork?.["150x150"] ? (
                        <img src={track.artwork["150x150"]} alt={track.title} className="object-cover w-full h-full" />
                      ) : (
                        <User className="w-4 h-4 text-neutral-600" />
                      )}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-md">
                        {track.title}
                      </p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5 font-medium">
                        {track.user.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-neutral-500 font-medium">{formatDuration(track.duration)}</span>
                    <button
                      onClick={() => {
                        setQueue(playHistory);
                        playTrack(track);
                      }}
                      className="p-2.5 bg-neutral-900 group-hover:bg-white border border-white/10 group-hover:border-white text-neutral-400 group-hover:text-black rounded-full shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      title="Play Track"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
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
