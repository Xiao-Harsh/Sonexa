import React, { useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { formatDuration } from '../../utils/formatDuration';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Music,
  Heart,
  ListMusic,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';

export const PlayerBar: React.FC = () => {
  const {
    queue,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    playTrack,
  } = usePlayerStore();

  const { favorites, likeTrack, unlikeTrack } = useLibraryStore();

  const [showQueue, setShowQueue] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentTrack = queue[currentTrackIndex];

  if (!currentTrack) return null;

  const artworkUrl =
    currentTrack.artwork?.['480x480'] ||
    currentTrack.artwork?.['150x150'] ||
    currentTrack.user?.artwork?.['150x150'];
  const isLiked = favorites.some((f) => f.id === currentTrack.id);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      unlikeTrack(currentTrack.id);
    } else {
      likeTrack(currentTrack);
    }
  };

  return (
    <>
      {/* FLOATING PLAYER BAR */}
      <motion.div
        initial={{ y: 96, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="fixed bottom-4 left-4 right-4 h-20 bg-[#141414]/95 border border-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-between px-6 z-50 select-none shadow-2xl"
      >
        {/* LEFT: Artwork + Title + Like */}
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-4 w-1/4 min-w-[220px] cursor-pointer group"
        >
          <div className="w-12 h-12 bg-neutral-900 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            {artworkUrl ? (
              <img
                src={artworkUrl}
                alt={currentTrack.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <Music className="w-5 h-5 text-neutral-600" />
            )}
          </div>

          <div className="text-left overflow-hidden">
            <h4 className="font-bold text-xs text-white truncate w-full group-hover:text-white" title={currentTrack.title}>
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-neutral-400 truncate w-full mt-0.5 font-medium">
              {currentTrack.user?.name || 'Artist'}
            </p>
          </div>

          <button
            onClick={handleHeartClick}
            className={`p-1.5 transition-colors cursor-pointer ${isLiked ? 'text-rose-500' : 'text-neutral-500 hover:text-white'
              }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* CENTER: Playback Controls & Timeline */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 transition-colors cursor-pointer ${isShuffle ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              title="Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={prevTrack}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Previous"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-white hover:scale-105 active:scale-95 text-black rounded-full transition-all shadow-lg cursor-pointer flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              <motion.div
                key={isPlaying ? 'pause' : 'play'}
                initial={{ scale: 0.8, rotate: isPlaying ? 0 : -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </motion.div>
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 relative transition-colors cursor-pointer ${isRepeat !== 'none' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              title={`Repeat: ${isRepeat}`}
            >
              <Repeat className="w-3.5 h-3.5" />
              {isRepeat === 'one' && (
                <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold bg-white text-black rounded-full w-2.5 h-2.5 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Timeline Slider */}
          <div className="flex items-center gap-3 w-full text-[10px] text-neutral-400 font-mono font-medium">
            <span className="w-8 text-right">{formatDuration(currentTime)}</span>
            <div className="relative flex-1 group flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none accent-white group-hover:bg-neutral-700 transition-all"
              />
            </div>
            <span className="w-8 text-left">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* RIGHT: Volume & Action Icons */}
        <div className="flex items-center gap-3 w-1/4 justify-end min-w-[180px]">
          <button
            onClick={toggleMute}
            className="text-neutral-400 hover:text-white p-1.5 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none accent-white hover:bg-neutral-700 transition-all"
          />

          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-1.5 transition-colors cursor-pointer ml-1 ${showQueue ? 'text-white bg-white/10 rounded-lg' : 'text-neutral-400 hover:text-white'
              }`}
            title="Up Next Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-neutral-400 hover:text-white p-1.5 transition-colors cursor-pointer"
            title="Expand Full View"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      {/* QUEUE DRAWER OVERLAY */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-6 w-80 max-h-[420px] bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 flex flex-col text-left backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-2">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <ListMusic className="w-4 h-4" /> Playing Queue ({queue.length})
              </h3>
              <button
                onClick={() => setShowQueue(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-1 pr-1 flex-1">
              {queue.map((track, idx) => {
                const isCurrent = idx === currentTrackIndex;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${isCurrent
                      ? 'bg-white/10 text-white font-bold border border-white/10'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="w-4 text-center text-[10px] text-neutral-500 font-mono">
                        {isCurrent ? '▶' : idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-white/5">
                        {track.artwork?.['150x150'] ? (
                          <img src={track.artwork['150x150']} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-3.5 h-3.5 text-neutral-500" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate font-semibold">{track.title}</p>
                        <p className="text-[10px] text-neutral-500 truncate">{track.user?.name}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN EXPANDED PLAYER VIEW */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-[100] bg-[#090909] flex flex-col justify-between p-8 overflow-hidden"
          >
            {/* Background Blur Artwork */}
            {artworkUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-[100px] opacity-20 scale-125 pointer-events-none"
                style={{ backgroundImage: `url(${artworkUrl})` }}
              />
            )}

            {/* Top Bar */}
            <div className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-3 bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 rounded-full text-white transition-all cursor-pointer shadow-lg"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                NOW PLAYING
              </span>

              <button
                onClick={handleHeartClick}
                className={`p-3 bg-neutral-900/80 border border-white/10 rounded-full transition-all cursor-pointer ${isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Main Center Content: Large Art + Info */}
            <div className="relative z-10 max-w-md mx-auto w-full space-y-8 text-center my-auto">
              <div className="w-72 h-72 md:w-80 md:h-80 mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 flex items-center justify-center">
                {artworkUrl ? (
                  <img
                    src={artworkUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Music className="w-16 h-16 text-neutral-600" />
                )}
              </div>

              <div className="space-y-2 text-left">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-neutral-400 text-sm font-medium">
                  {currentTrack.user?.name}
                </p>
              </div>

              {/* Expanded Timeline */}
              <div className="space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none accent-white hover:bg-neutral-700 transition-all"
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-neutral-400 font-medium">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Expanded Controls */}
              <div className="flex items-center justify-center gap-8 pt-4">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 transition-colors cursor-pointer ${isShuffle ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button onClick={prevTrack} className="p-2 text-white hover:scale-110 transition-transform cursor-pointer">
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  className="p-5 bg-white text-black hover:scale-105 active:scale-95 rounded-full shadow-2xl transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                <button onClick={nextTrack} className="p-2 text-white hover:scale-110 transition-transform cursor-pointer">
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>

                <button
                  onClick={toggleRepeat}
                  className={`p-2 transition-colors cursor-pointer ${isRepeat !== 'none' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Standalone Volume Slider Row (Between Controls & Bottom Bar) */}
            <div className="relative z-10 max-w-xs mx-auto w-full flex items-center justify-center gap-3.5 text-neutral-400 py-6">
              <button onClick={toggleMute} className="hover:text-white transition-colors cursor-pointer shrink-0">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none accent-white hover:bg-neutral-700 transition-all"
              />
              <button onClick={toggleMute} className="hover:text-white transition-colors cursor-pointer shrink-0">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Clean Bottom Bar */}
            <div className="relative z-10 max-w-4xl mx-auto w-full flex justify-between items-center text-xs text-neutral-500 font-medium">
              <span>SONEXA HIGH FIDELITY STREAMING</span>
              <button onClick={() => setIsExpanded(false)} className="text-neutral-400 hover:text-white font-semibold cursor-pointer">
                Close Fullscreen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
