import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';

export const AudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
  } = usePlayerStore();

  const currentTrack = queue[currentTrackIndex];

  // Initialize or change active track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack) {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const streamUrl = `${baseURL}/music/track/${currentTrack.id}/stream`;
      
      if (audio.src !== streamUrl) {
        audio.src = streamUrl;
        audio.load();
        if (isPlaying) {
          audio.play().catch((err) => {
            console.warn('Auto-playback interrupted:', err);
            setIsPlaying(false);
          });
        }
      }
      
      // Log to Listening History
      useLibraryStore.getState().logHistory(currentTrack);
    } else {
      audio.src = '';
      setIsPlaying(false);
    }
  }, [currentTrackIndex]);

  // Handle Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn('Playback play failed:', err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Handle Volume & Mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  // Handle Explicit User Seeking ONLY (prevents playback stuttering feedback loop)
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
    // Update store currentTime continuously without triggering an audio seek loop
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
