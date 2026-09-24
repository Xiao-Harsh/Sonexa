import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useToastStore } from '../store/toastStore';

export const useKeyboardControls = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    queue,
    currentTrackIndex,
  } = usePlayerStore();

  const showToast = useToastStore((state) => state.showToast);
  const activeTrack = queue[currentTrackIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard controls if user is typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Preserve browser history navigation shortcuts (Alt+ArrowLeft, Alt+ArrowRight, Cmd+ArrowLeft, Cmd+ArrowRight)
      if (e.altKey || e.metaKey) {
        return;
      }

      // Only allow playback controls if there is a track loaded
      if (!activeTrack) return;

      switch (e.key.toLowerCase()) {
        case ' ': // Spacebar
          e.preventDefault();
          togglePlay();
          showToast(isPlaying ? 'Playback Paused' : 'Playback Resumed', 'info');
          break;

        case 'arrowright': { // Seek forward 10s
          e.preventDefault();
          const newTimeForward = Math.min(duration, currentTime + 10);
          seekTo(newTimeForward);
          showToast('Seek Forward +10s', 'info');
          break;
        }

        case 'arrowleft': { // Seek backward 10s
          e.preventDefault();
          const newTimeBackward = Math.max(0, currentTime - 10);
          seekTo(newTimeBackward);
          showToast('Seek Backward -10s', 'info');
          break;
        }

        case 'arrowup': { // Volume up 5%
          e.preventDefault();
          const newVolUp = Math.min(1, volume + 0.05);
          setVolume(newVolUp);
          showToast(`Volume: ${Math.round(newVolUp * 100)}%`, 'info');
          break;
        }

        case 'arrowdown': { // Volume down 5%
          e.preventDefault();
          const newVolDown = Math.max(0, volume - 0.05);
          setVolume(newVolDown);
          showToast(`Volume: ${Math.round(newVolDown * 100)}%`, 'info');
          break;
        }

        case 'm': // Toggle mute
          e.preventDefault();
          toggleMute();
          showToast(isMuted ? 'Volume Unmuted' : 'Volume Muted', 'info');
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, currentTime, duration, volume, isMuted, activeTrack, togglePlay, seekTo, setVolume, toggleMute, showToast]);
};
