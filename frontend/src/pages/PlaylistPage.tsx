import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibraryStore, mapDbTrackToTrack } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { formatDuration } from '../utils/formatDuration';
import { Loader2, Play, Trash2, ArrowLeft, Clock, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmptyState } from '../components/ui/EmptyState';

export const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPlaylist, isLoading, fetchPlaylistDetails, removeTrackFromPlaylist } = useLibraryStore();
  const { setQueue, playTrack } = usePlayerStore();

  useEffect(() => {
    if (id) {
      fetchPlaylistDetails(Number(id));
    }
  }, [id]);

  if (isLoading && !currentPlaylist) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-neutral-500 gap-3">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <span className="text-sm font-medium tracking-wide">Loading playlist...</span>
      </div>
    );
  }

  if (!currentPlaylist) {
    return (
      <div className="text-center py-24 space-y-4">
        <h2 className="text-xl font-semibold text-neutral-400">Playlist not found</h2>
        <button
          onClick={() => navigate('/library')}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs font-semibold hover:border-white/20 transition-all cursor-pointer text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </button>
      </div>
    );
  }

  const tracks = (currentPlaylist.tracks || []).map(mapDbTrackToTrack);

  const handlePlayPlaylist = () => {
    if (tracks.length === 0) return;
    setQueue(tracks);
    playTrack(tracks[0]);
  };

  const handlePlayTrack = (idx: number) => {
    setQueue(tracks);
    playTrack(tracks[idx]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8 text-left"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pb-6 border-b border-white/5">
        <button
          onClick={() => navigate('/library')}
          className="p-3 bg-[#141414] border border-white/5 hover:border-white/10 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer shrink-0"
          title="Back to Library"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-32 h-32 bg-[#141414] border border-white/10 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
          <Music className="w-10 h-10 text-neutral-400" />
        </div>

        <div className="space-y-2 flex-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
            Playlist
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            {currentPlaylist.name}
          </h1>
          <p className="text-neutral-500 text-xs font-medium">
            {tracks.length} tracks &bull; Created recently
          </p>
        </div>

        {tracks.length > 0 && (
          <button
            onClick={handlePlayPlaylist}
            className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-neutral-200 active:scale-95 text-black rounded-full text-xs font-bold tracking-wide shadow-md transition-all cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            Play Playlist
          </button>
        )}
      </div>

      {tracks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="text-neutral-500 text-xs font-semibold uppercase tracking-wider border-b border-white/5 pb-3">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 hidden md:table-cell">Artist</th>
                <th className="py-3 px-4 w-16 text-center">
                  <Clock className="w-4 h-4 mx-auto" />
                </th>
                <th className="py-3 px-4 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track, idx) => {
                const artworkUrl = track.artwork?.["150x150"];
                return (
                  <tr
                    key={track.id + '-' + idx}
                    className="group hover:bg-[#141414] border-b border-white/5 rounded-lg transition-colors"
                  >
                    <td className="py-3 px-4 text-center text-sm font-semibold text-neutral-500 relative">
                      <span className="group-hover:opacity-0">{idx + 1}</span>
                      <button
                        onClick={() => handlePlayTrack(idx)}
                        className="absolute inset-0 m-auto w-7 h-7 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-white text-black rounded-full transition-all cursor-pointer shadow-md"
                        title="Play Track"
                      >
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-900 border border-white/5 rounded overflow-hidden shrink-0 flex items-center justify-center">
                          {artworkUrl ? (
                            <img src={artworkUrl} alt={track.title} className="object-cover w-full h-full" />
                          ) : (
                            <Music className="w-4 h-4 text-neutral-600" />
                          )}
                        </div>
                        <div className="text-left max-w-[200px] sm:max-w-md overflow-hidden">
                          <p className="font-semibold text-sm text-white truncate group-hover:text-white transition-colors" title={track.title}>
                            {track.title}
                          </p>
                          <p className="text-xs text-neutral-400 truncate mt-0.5 md:hidden">
                            {track.user.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-sm text-neutral-400 hidden md:table-cell">
                      {track.user.name}
                    </td>

                    <td className="py-3 px-4 text-center text-sm text-neutral-500 font-medium">
                      {formatDuration(track.duration)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => removeTrackFromPlaylist(currentPlaylist.id, track.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                        title="Remove Track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Music}
          title="Empty Playlist"
          description="There are no tracks in this playlist yet. Start exploring and add tracks!"
          actionLabel="Find Tracks"
          onAction={() => navigate('/search')}
        />
      )}
    </motion.div>
  );
};
