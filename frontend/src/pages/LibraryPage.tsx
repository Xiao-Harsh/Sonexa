import React, { useState } from 'react';
import { useLibraryStore } from '../store/libraryStore';
import { TrackCard } from '../components/music/TrackCard';
import { Link } from 'react-router-dom';
import { Loader2, Heart, ListMusic, Plus, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmptyState } from '../components/ui/EmptyState';

export const LibraryPage: React.FC = () => {
  const {
    favorites,
    playlists,
    isLoading,
    createPlaylist,
    deletePlaylist,
  } = useLibraryStore();

  const [activeTab, setActiveTab] = useState<'likes' | 'playlists'>('likes');
  const [showModal, setShowModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) return;
    await createPlaylist(playlistName.trim());
    setPlaylistName('');
    setShowModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8 text-left relative"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Your Library</h1>
        <p className="text-neutral-400 text-sm mt-1">Manage your saved collections and playlists</p>
      </div>

      <div className="flex items-center justify-between border-b border-white/5 pb-4 overflow-x-auto gap-4">
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('likes')}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all border cursor-pointer ${
              activeTab === 'likes'
                ? 'bg-white border-white text-black shadow-md'
                : 'bg-neutral-900 border-white/5 text-neutral-400 hover:border-white/10 hover:text-white'
            }`}
          >
            Liked Songs
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all border cursor-pointer ${
              activeTab === 'playlists'
                ? 'bg-white border-white text-black shadow-md'
                : 'bg-neutral-900 border-white/5 text-neutral-400 hover:border-white/10 hover:text-white'
            }`}
          >
            Playlists
          </button>
        </div>

        {activeTab === 'playlists' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-200 active:scale-95 text-black rounded-full text-xs font-bold tracking-wide shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Playlist
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-3">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <span className="text-sm font-medium tracking-wide">Loading library...</span>
        </div>
      ) : activeTab === 'likes' ? (
        favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {favorites.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="No Liked Songs"
            description="Songs you favorite will appear here for easy access."
          />
        )
      ) : (
        playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="group relative bg-[#141414] border border-white/5 hover:border-white/15 rounded-2xl p-5 transition-all hover:-translate-y-1 shadow-md flex flex-col justify-between"
              >
                <Link to={`/playlist/${playlist.id}`} className="space-y-4 flex-1">
                  <div className="w-full aspect-square bg-neutral-900 border border-white/5 rounded-xl flex items-center justify-center text-neutral-500 group-hover:text-white transition-colors">
                    <ListMusic className="w-10 h-10" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-base truncate">{playlist.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      {playlist.tracks?.length || 0} tracks
                    </p>
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deletePlaylist(playlist.id);
                  }}
                  className="absolute top-7 right-7 p-2 bg-neutral-900/80 border border-white/10 rounded-full text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ListMusic}
            title="No Playlists"
            description="Create custom collections of your favorite tracks to listen later."
            actionLabel="Create Playlist"
            onAction={() => setShowModal(true)}
          />
        )
      )}

      {/* CREATE PLAYLIST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-6 shadow-2xl text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">New Playlist</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="e.g. Chill Beats"
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
