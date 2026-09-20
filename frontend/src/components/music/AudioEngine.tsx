import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';

export const AudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTrackIdRef = useRef<string | null>(null);
  const fallbackIndexRef = useRef<number>(0);
  const errorRetryCountRef = useRef<number>(0);

  const {
    queue,
    currentTrackIndex,
    isPlaying,
    currentTime,
    userSeekTime,
    volume,
    isMuted,
    setIsPlaying,
    nextTrack,
    setDuration,
    sleepTimerRemaining,
    setSleepTimer,
  } = usePlayerStore();

  const currentTrack = queue[currentTrackIndex];

  // Helper to build list of candidate stream URLs for the current track
  const getStreamCandidates = (track: typeof currentTrack): string[] => {
    if (!track) return [];
    const candidates: string[] = [];
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

    // 1. Backend stream route (with fallback to healthy node)
    candidates.push(`${baseURL}/music/track/${track.id}/stream`);

    // 2. Direct Audius official stream redirect
    candidates.push(`https://api.audius.co/v1/tracks/${track.id}/stream?app_name=MyWebMusicPlayer`);

    // 3. Direct track stream url if present in track metadata
    if (track.stream?.url) {
      candidates.push(track.stream.url);
    }

    // 4. Any direct mirror stream URLs if available
    if (track.stream?.mirrors && Array.isArray(track.stream.mirrors)) {
      track.stream.mirrors.forEach((mirror) => {
        if (mirror && track.stream?.url) {
          try {
            const originalUrl = new URL(track.stream.url);
            const mirrorUrl = new URL(mirror);
            originalUrl.protocol = mirrorUrl.protocol;
            originalUrl.host = mirrorUrl.host;
            candidates.push(originalUrl.toString());
          } catch {
            // Ignore malformed mirror URLs
          }
        }
      });
    }

    return candidates;
  };

  // Cleanup fade interval on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  // Handle Sleep Timer Countdown
  useEffect(() => {
    if (sleepTimerRemaining === null) return;

    if (sleepTimerRemaining <= 0) {
      setIsPlaying(false);
      setSleepTimer(null);
      return;
    }

    const timer = setTimeout(() => {
      setSleepTimer(sleepTimerRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [sleepTimerRemaining, setSleepTimer, setIsPlaying]);

  // Handle Volume & Mute changes directly when not fading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (!fadeIntervalRef.current) {
      audio.volume = isMuted ? 0 : volume;
    }
    audio.muted = isMuted;
  }, [volume, isMuted]);

  // Unified playback & track change handler with smooth fading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const fadeIn = () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      
      const targetVolume = isMuted ? 0 : volume;
      let currentVol = audio.volume;
      const step = 0.05;

      fadeIntervalRef.current = setInterval(() => {
        currentVol = Math.min(targetVolume, currentVol + step);
        audio.volume = currentVol;
        if (currentVol >= targetVolume) {
          audio.volume = targetVolume;
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
        }
      }, 20);
    };

    const fadeOut = (onComplete: () => void) => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      let currentVol = audio.volume;
      const step = 0.05;

      fadeIntervalRef.current = setInterval(() => {
        currentVol = Math.max(0, currentVol - step);
        audio.volume = currentVol;
        if (currentVol <= 0) {
          audio.volume = 0;
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          onComplete();
        }
      }, 20);
    };

    // Case 1: No track selected
    if (!currentTrack) {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      audio.src = '';
      lastTrackIdRef.current = null;
      fallbackIndexRef.current = 0;
      errorRetryCountRef.current = 0;
      return;
    }

    // Case 2: Track source changed
    if (lastTrackIdRef.current !== currentTrack.id) {
      fallbackIndexRef.current = 0;
      errorRetryCountRef.current = 0;
      const candidates = getStreamCandidates(currentTrack);
      const initialSrc = candidates[0] || '';

      const switchSrcAndPlay = () => {
        audio.src = initialSrc;
        audio.load();
        lastTrackIdRef.current = currentTrack.id;

        if (isPlaying) {
          audio.volume = 0;
          audio.play().then(() => {
            fadeIn();
          }).catch((err) => {
            console.warn('Playback interrupted:', err);
            // Don't disable isPlaying on browser autoplay restrictions, keep ready
          });
        } else {
          audio.volume = isMuted ? 0 : volume;
        }
      };

      // Fade out previous track if currently playing
      if (audio.src && !audio.paused) {
        fadeOut(() => {
          switchSrcAndPlay();
        });
      } else {
        switchSrcAndPlay();
      }

      // Log to history
      useLibraryStore.getState().logHistory(currentTrack);
      return;
    }

    // Case 3: Play/Pause state toggled (same track)
    if (isPlaying) {
      if (audio.paused) {
        audio.volume = 0;
        audio.play().then(() => {
          fadeIn();
        }).catch((err) => {
          console.warn('Play request failed:', err);
        });
      } else {
        fadeIn();
      }
    } else {
      if (!audio.paused) {
        fadeOut(() => {
          audio.pause();
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, isPlaying]);

  // Handle Explicit User Seeking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (userSeekTime !== null) {
      audio.currentTime = userSeekTime;
      usePlayerStore.setState({ userSeekTime: null });
    }
  }, [userSeekTime, currentTime]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    usePlayerStore.setState({ currentTime: audio.currentTime });
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  };

  const handleEnded = () => {
    nextTrack();
  };

  // Robust Error Handler: Automatic stream failover to fallback mirror, or skip to next track
  const handleError = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const candidates = getStreamCandidates(currentTrack);
    fallbackIndexRef.current += 1;

    if (fallbackIndexRef.current < candidates.length) {
      const nextCandidate = candidates[fallbackIndexRef.current];
      console.warn(
        `Stream error on track "${currentTrack.title}". Trying fallback stream (${fallbackIndexRef.current + 1}/${candidates.length}): ${nextCandidate}`
      );
      audio.src = nextCandidate;
      audio.load();
      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn('Fallback stream play attempt failed:', err);
        });
      }
    } else {
      // All fallback stream candidate URLs failed for this track
      errorRetryCountRef.current += 1;
      console.error(
        `Unable to play track "${currentTrack.title}". All stream mirrors exhausted. Auto-skipping to next song.`
      );
      
      // Auto skip to next track so music never stops
      setTimeout(() => {
        nextTrack();
      }, 500);
    }
  };

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      onError={handleError}
      preload="auto"
    />
  );
};
