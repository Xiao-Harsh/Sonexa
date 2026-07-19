import React, { useState, useEffect, useRef } from 'react';
import type { Track } from '../../api/musicApi';
import { formatDuration } from '../../utils/formatDuration';
import { useLibraryStore } from '../../store/libraryStore';
import { useToastStore } from '../../store/toastStore';
import { Play, Music, Heart, FolderPlus, Check } from 'lucide-react';

interface TrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, onPlay }) => {
  const artworkUrl = track.artwork?.["480x480"] || track.artwork?.["150x150"] || track.user.artwork?.["150x150"];
  const { favorites, playlists, likeTrack, unlikeTrack, fetchPlaylists, addTrackToPlaylist } = useLibraryStore();
  const showToast = useToastStore((state) => state.showToast);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const isLiked = favorites.some((f) => f.id === track.id);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showDropdown]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      unlikeTrack(track.id);
      showToast(`Removed from Liked Songs`, 'info');
    } else {
      likeTrack(track);
      showToast(`Added to Liked Songs`, 'success');
    }
  };

  const handlePlaylistIconClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDropdown) {
      await fetchPlaylists();
    }
    setShowDropdown(!showDropdown);
  };

  const handleAddToPlaylist = async (e: React.MouseEvent, playlistId: number) => {
    e.stopPropagation();
    await addTrackToPlaylist(playlistId, track);
    const playlist = playlists.find((p) => p.id === playlistId);
    showToast(`Added to ${playlist?.name || 'playlist'}`, 'success');
    setShowDropdown(false);
  };

  return (
    <div className="group relative bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700/60 rounded-xl p-4 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col justify-between h-full">
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-950 flex items-center justify-center mb-4">
        {artworkUrl ? (
          <img
            src={artworkUrl}
            alt={track.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <Music className="w-12 h-12 text-neutral-800" />
        )}

        <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onPlay?.(track)}
            className="p-3.5 bg-white hover:bg-neutral-200 active:scale-95 text-black rounded-full shadow-2xl transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        </div>

        <div className="absolute top-2 right-2 flex gap-1.5 z-20">
          <button
            onClick={handleHeartClick}
            className={`p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-950 border border-neutral-800/60 backdrop-blur-sm shadow-md transition-all cursor-pointer ${isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100'
              }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handlePlaylistIconClick}
              className="p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-950 border border-neutral-800/60 backdrop-blur-sm shadow-md text-neutral-400 hover:text-white transition-all cursor-pointer opacity-0 group-hover:opacity-100"
              title="Add to Playlist"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-3 py-2 border-b border-neutral-800/60">
                  Add to Playlist
                </p>
                <div className="max-h-36 overflow-y-auto mt-1 space-y-0.5">
                  {playlists.length > 0 ? (
                    playlists.map((playlist) => {
                      const alreadyInPlaylist = playlist.tracks?.some(
                        (t) => t.audiusTrackId === track.id
                      );
                      return (
                        <button
                          key={playlist.id}
                          disabled={alreadyInPlaylist}
                          onClick={(e) => handleAddToPlaylist(e, playlist.id)}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800/60 hover:text-white rounded-lg transition-colors flex items-center justify-between disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <span className="truncate">{playlist.name}</span>
                          {alreadyInPlaylist && <Check className="w-3 h-3 text-indigo-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-neutral-500 py-3 text-center">
                      No playlists found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-neutral-100 truncate w-full text-left" title={track.title}>
          {track.title}
        </h3>
        <p className="text-xs text-neutral-400 truncate w-full text-left mt-1">
          {track.user.name}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800/40 text-[10px] text-neutral-500 font-medium">
        <span className="uppercase tracking-wider px-2 py-0.5 bg-neutral-800/50 rounded-md">
          {track.genre || 'unknown'}
        </span>
        <span>{formatDuration(track.duration)}</span>
      </div>
    </div>
  );
};
