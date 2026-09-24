import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { formatDuration } from '../../utils/formatDuration';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Music,
  Heart,
  ListMusic,
  ChevronUp,
  ChevronDown,
  X,
  Timer,
} from 'lucide-react';

export const PlayerBar: React.FC = () => {
  const navigate = useNavigate();
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
    sleepTimerRemaining,
    setSleepTimer,
    stopAndClose,
  } = usePlayerStore();

  const { favorites, likeTrack, unlikeTrack } = useLibraryStore();

  const [showQueue, setShowQueue] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [showExpandedVolume, setShowExpandedVolume] = useState(false);
  const timerMenuRef = React.useRef<HTMLDivElement | null>(null);
  const expandedVolumeRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (timerMenuRef.current && !timerMenuRef.current.contains(e.target as Node)) {
        setShowTimerMenu(false);
      }
      if (expandedVolumeRef.current && !expandedVolumeRef.current.contains(e.target as Node)) {
        setShowExpandedVolume(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const touchStartY = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (deltaY > 40) {
        handleClosePlayer();
      }
      touchStartY.current = null;
    }
  };

  const handleClosePlayer = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsExpanded(false);
    setShowQueue(false);
    setShowTimerMenu(false);
    setShowExpandedVolume(false);
    stopAndClose();
    useToastStore.getState().showToast('Playback stopped', 'info');
  };

  const currentTrack = queue[currentTrackIndex];

  const artworkUrl = currentTrack
    ? currentTrack.artwork?.['480x480'] ||
      currentTrack.artwork?.['150x150'] ||
      currentTrack.user?.artwork?.['150x150']
    : undefined;
  const isLiked = currentTrack ? favorites.some((f) => f.id === currentTrack.id) : false;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const renderVolumeIcon = (className = 'w-4 h-4') => {
    if (isMuted || volume === 0) {
      return <VolumeX className={className} />;
    }
    if (volume < 0.5) {
      return <Volume1 className={className} />;
    }
    return <Volume2 className={className} />;
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      useToastStore.getState().showToast('Please sign in to add songs to your favorites', 'info');
      navigate('/login');
      return;
    }
    if (isLiked) {
      unlikeTrack(currentTrack.id);
    } else {
      likeTrack(currentTrack);
    }
  };

  const handleCyclePlaybackMode = () => {
    if (!isShuffle && isRepeat === 'none') {
      usePlayerStore.setState({ isShuffle: true, isRepeat: 'none' });
    } else if (isShuffle) {
      usePlayerStore.setState({ isShuffle: false, isRepeat: 'all' });
    } else if (isRepeat === 'all') {
      usePlayerStore.setState({ isShuffle: false, isRepeat: 'one' });
    } else {
      usePlayerStore.setState({ isShuffle: false, isRepeat: 'none' });
    }
  };

  return (
    <>
      {/* FLOATING PLAYER BAR */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            key="floating-player-bar"
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed bottom-20 md:bottom-4 left-2 right-2 sm:left-4 sm:right-4 h-20 apple-glass-pill rounded-2xl flex items-center justify-between px-3 sm:px-5 md:px-6 z-50 select-none cursor-grab active:cursor-grabbing md:cursor-default"
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.8 }}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 40 || info.velocity.y > 200) {
                handleClosePlayer();
              }
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Mobile Drag Down Visual Indicator Pill */}
            <div className="md:hidden absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/25 rounded-full pointer-events-none" />
        {/* LEFT: Artwork + Title + Like */}
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 sm:gap-4 flex-1 md:flex-initial md:w-1/4 md:min-w-[220px] min-w-0 cursor-pointer group overflow-hidden pr-2"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-900 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform relative">
            <Music className="w-5 h-5 text-neutral-600 absolute inset-0 m-auto" />
            {artworkUrl && (
              <img
                src={artworkUrl}
                alt={currentTrack.title}
                className="object-cover w-full h-full relative z-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>

          <div className="text-left overflow-hidden min-w-0 flex-1">
            <h4 className="font-bold text-xs text-white truncate w-full group-hover:text-white" title={currentTrack.title}>
              {currentTrack.title}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate w-full mt-0.5 font-medium">
              {currentTrack.user?.name || 'Artist'}
            </p>
          </div>

          <button
            onClick={handleHeartClick}
            className={`hidden md:block p-1.5 transition-colors cursor-pointer shrink-0 ${isLiked ? 'text-rose-500' : 'text-neutral-500 hover:text-white'
              }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* CENTER: Playback Controls & Timeline (hidden on mobile) */}
        <div className="hidden md:flex flex-col items-center gap-1.5 flex-1 max-w-xl">
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

        {/* RIGHT: Volume & Action Icons (simplified on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 md:w-1/4 justify-end min-w-0 md:min-w-[180px] shrink-0">
          {/* Mobile Heart Button */}
          <button
            onClick={handleHeartClick}
            className={`md:hidden p-1 sm:p-1.5 transition-colors cursor-pointer shrink-0 ${isLiked ? 'text-rose-500' : 'text-neutral-500'}`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Mobile Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="md:hidden p-2 sm:p-2.5 bg-white text-black rounded-full shadow-lg cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
          
          {/* Mobile Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="md:hidden p-1 sm:p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Next"
          >
            <SkipForward className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={handleClosePlayer}
            className="md:hidden p-1 sm:p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all cursor-pointer shrink-0"
            title="Stop & Close Player"
            aria-label="Stop & Close Player"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-3 w-full justify-end">
            <button
              onClick={toggleMute}
              className="text-neutral-400 hover:text-white p-1.5 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {renderVolumeIcon('w-4 h-4')}
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

            <div className="relative" ref={timerMenuRef}>
              <button
                onClick={() => setShowTimerMenu(!showTimerMenu)}
                className={`p-1.5 transition-colors cursor-pointer flex items-center gap-1 ${
                  sleepTimerRemaining !== null ? 'text-indigo-400 bg-white/10 rounded-lg px-2' : 'text-neutral-400 hover:text-white'
                }`}
                title="Sleep Timer"
              >
                <Timer className="w-4 h-4" />
                {sleepTimerRemaining !== null && (
                  <span className="text-[10px] font-bold font-mono">
                    {formatTimer(sleepTimerRemaining)}
                  </span>
                )}
              </button>

              {showTimerMenu && (
                <div className="absolute bottom-10 right-0 mb-2 w-32 bg-[#141414] border border-white/10 rounded-xl shadow-2xl p-1 z-50 text-xs text-left">
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-2.5 py-1.5 border-b border-white/5">
                    Sleep Timer
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {[
                      { label: 'Off', val: null },
                      { label: '5 Min', val: 300 },
                      { label: '15 Min', val: 900 },
                      { label: '30 Min', val: 1800 },
                      { label: '45 Min', val: 2700 },
                      { label: '60 Min', val: 3600 },
                    ].map((opt) => {
                      const isActive = opt.val === null 
                        ? sleepTimerRemaining === null 
                        : sleepTimerRemaining !== null && Math.abs(sleepTimerRemaining - opt.val) < 10;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setSleepTimer(opt.val);
                            setShowTimerMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors font-medium cursor-pointer ${
                            isActive 
                              ? 'bg-white/10 text-white font-semibold' 
                              : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

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

            {/* Desktop Close Button */}
            <button
              onClick={handleClosePlayer}
              className="text-neutral-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all cursor-pointer ml-1"
              title="Stop & Close Player"
              aria-label="Stop & Close Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>

      {/* QUEUE DRAWER OVERLAY */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 sm:bottom-28 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-80 max-w-sm max-h-[min(420px,calc(100vh-120px))] bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 flex flex-col text-left backdrop-blur-xl"
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
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-white/5 relative flex items-center justify-center">
                        <Music className="w-3.5 h-3.5 text-neutral-500 absolute inset-0 m-auto" />
                        {track.artwork?.['150x150'] && (
                          <img
                            src={track.artwork['150x150']}
                            alt={track.title}
                            className="w-full h-full object-cover relative z-10"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
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
            className="fixed inset-0 z-[100] bg-[#090909] flex flex-col justify-between p-4 sm:p-8 overflow-y-auto overflow-x-hidden"
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
                className="p-2.5 sm:p-3 bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 rounded-full text-white transition-all cursor-pointer shadow-lg"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">
                NOW PLAYING
              </span>

              <button
                onClick={handleHeartClick}
                className={`p-2.5 sm:p-3 bg-neutral-900/80 border border-white/10 rounded-full transition-all cursor-pointer ${isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Main Center Content: Large Art + Info */}
            <div className="relative z-10 max-w-md mx-auto w-full space-y-3 sm:space-y-6 text-center my-auto py-2">
              <div className="w-44 h-44 min-[360px]:w-52 min-[360px]:h-52 min-[410px]:w-64 min-[410px]:h-64 sm:w-80 sm:h-80 max-h-[38vh] max-w-[38vh] aspect-square mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 flex items-center justify-center relative">
                <Music className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-600 absolute inset-0 m-auto" />
                {artworkUrl && (
                  <img
                    src={artworkUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>

              <div className="space-y-1 sm:space-y-2 text-left px-2">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-neutral-400 text-xs sm:text-sm font-medium">
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
                <div className="flex justify-between text-[10px] sm:text-xs font-mono text-neutral-400 font-medium">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Expanded Controls: Centered 5 buttons (Shuffle/Repeat, Prev, Play, Next, Volume) */}
              <div className="flex items-center justify-center gap-3 min-[360px]:gap-5 sm:gap-8 pt-1 sm:pt-4">
                {/* 1. Shuffle & Repeat Mode Button */}
                <button
                  onClick={handleCyclePlaybackMode}
                  className={`p-2 transition-colors cursor-pointer relative hover:scale-105 active:scale-95 ${
                    isShuffle || isRepeat !== 'none' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title={
                    isShuffle
                      ? 'Mode: Shuffle (click for Repeat All)'
                      : isRepeat === 'all'
                      ? 'Mode: Repeat All (click for Repeat One)'
                      : isRepeat === 'one'
                      ? 'Mode: Repeat One (click for Normal)'
                      : 'Mode: Normal (click for Shuffle)'
                  }
                >
                  {isRepeat === 'all' ? (
                    <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : isRepeat === 'one' ? (
                    <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  {/* Subtle active indicator dot */}
                  {(isShuffle || isRepeat !== 'none') && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                </button>

                {/* 2. Previous */}
                <button onClick={prevTrack} className="p-2 text-white hover:scale-110 transition-transform cursor-pointer" title="Previous">
                  <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </button>

                {/* 3. Play / Pause (Centered) */}
                <button
                  onClick={togglePlay}
                  className="p-4 sm:p-5 bg-white text-black hover:scale-105 active:scale-95 rounded-full shadow-2xl transition-all cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />}
                </button>

                {/* 4. Next */}
                <button onClick={nextTrack} className="p-2 text-white hover:scale-110 transition-transform cursor-pointer" title="Next">
                  <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                </button>

                {/* 5. Volume */}
                <div className="relative" ref={expandedVolumeRef}>
                  <button
                    onClick={() => setShowExpandedVolume(!showExpandedVolume)}
                    className={`p-2 transition-colors cursor-pointer hover:scale-105 active:scale-95 ${
                      showExpandedVolume ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                    title={isMuted ? 'Muted' : `Volume: ${Math.round(volume * 100)}%`}
                  >
                    {renderVolumeIcon('w-4 h-4 sm:w-5 sm:h-5')}
                  </button>

                  {/* Flexible Slider pops up when clicked in the proper place below the volume button */}
                  <AnimatePresence>
                    {showExpandedVolume && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-3 bg-[#181818]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl flex items-center gap-2.5 z-50 w-48"
                      >
                        {/* Upward pointer arrow anchored to volume icon */}
                        <div className="absolute -top-1.5 right-3.5 w-3 h-3 bg-[#181818] border-t border-l border-white/10 rotate-45" />

                        <button
                          onClick={toggleMute}
                          className="relative z-10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {renderVolumeIcon('w-3.5 h-3.5')}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="relative z-10 w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer outline-none accent-white hover:bg-neutral-700 transition-all"
                        />
                        <span className="relative z-10 text-[10px] font-mono text-neutral-400 font-semibold w-7 text-right">
                          {isMuted || volume === 0 ? '0%' : `${Math.round(volume * 100)}%`}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
