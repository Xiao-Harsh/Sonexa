import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';

export const AudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<any>(null);
  const lastTrackIdRef = useRef<string | null>(null);

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
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
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
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          onComplete();
        }
      }, 20);
    };

    // Case 1: No track selected
    if (!currentTrack) {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      audio.src = '';
      lastTrackIdRef.current = null;
      return;
    }

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const streamUrl = `${baseURL}/music/track/${currentTrack.id}/stream`;

    // Case 2: Track source changed
    if (lastTrackIdRef.current !== currentTrack.id) {
      const switchSrcAndPlay = () => {
        audio.src = streamUrl;
        audio.load();
        lastTrackIdRef.current = currentTrack.id;

        if (isPlaying) {
          audio.volume = 0;
          audio.play().then(() => {
            fadeIn();
          }).catch((err) => {
            console.warn('Playback interrupted:', err);
            setIsPlaying(false);
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
          setIsPlaying(false);
        });
      } else {
        // If already playing, ensure target volume is faded to
        fadeIn();
      }
    } else {
      if (!audio.paused) {
        fadeOut(() => {
          audio.pause();
        });
      }
    }
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

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      preload="auto"
    />
  );
};
