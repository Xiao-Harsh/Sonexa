import React from 'react';
import type { Track } from '../../api/musicApi';
import { Play, Music } from 'lucide-react';

interface TrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, onPlay }) => {
  const artworkUrl = track.artwork?.["480x480"] || track.artwork?.["150x150"] || track.user?.artwork?.["150x150"];

  return (
    <div
      onClick={() => onPlay?.(track)}
      className="group relative bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700/60 rounded-xl p-2.5 sm:p-3.5 md:p-4 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col justify-between h-full cursor-pointer"
    >
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-950 flex items-center justify-center mb-2 sm:mb-3">
        <Music className="w-8 h-8 sm:w-12 sm:h-12 text-neutral-800 absolute inset-0 m-auto" />
        {artworkUrl && (
          <img
            src={artworkUrl}
            alt={track.title || 'Track'}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 relative z-10"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}

        {/* Hover / Active Play Button */}
        <div className="absolute inset-0 z-20 bg-neutral-950/40 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(track);
            }}
            className="p-2.5 sm:p-3.5 bg-white hover:bg-neutral-200 active:scale-95 text-black rounded-full shadow-2xl transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="mb-1.5 sm:mb-2 min-w-0">
        <h3 className="font-semibold text-xs sm:text-sm text-neutral-100 truncate w-full text-left" title={track.title || 'Untitled Track'}>
          {track.title || 'Untitled Track'}
        </h3>
      </div>

      {/* Genre */}
      <div className="flex items-center justify-start pt-1.5 sm:pt-2 border-t border-neutral-800/40 text-[9px] sm:text-[10px] text-neutral-400 font-medium">
        <span className="uppercase tracking-wider px-1.5 sm:px-2 py-0.5 bg-neutral-800/60 rounded-md truncate max-w-full">
          {track.genre || 'Music'}
        </span>
      </div>
    </div>
  );
};
