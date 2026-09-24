import { create } from 'zustand';
import type { Track } from '../api/musicApi';

interface PlayerState {
  queue: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  userSeekTime: number | null;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: 'none' | 'all' | 'one';
  sleepTimerRemaining: number | null;
  setSleepTimer: (seconds: number | null) => void;
  stopAndClose: () => void;
  
  setQueue: (tracks: Track[]) => void;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setCurrentTime: (time: number) => void;
  seekTo: (time: number) => void;
  setDuration: (dur: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const getInitialVolume = (): number => {
  try {
    const saved = localStorage.getItem('sonexa_player_volume');
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }
  } catch {
    // localStorage unavailable
  }
  // Realistic music platform default: 35% (comfortable, non-ear-blasting)
  return 0.35;
};

const getInitialMuted = (): boolean => {
  try {
    return localStorage.getItem('sonexa_player_muted') === 'true';
  } catch {
    return false;
  }
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentTrackIndex: -1,
  isPlaying: false,
  currentTime: 0,
  userSeekTime: null,
  duration: 0,
  volume: getInitialVolume(),
  isMuted: getInitialMuted(),
  isShuffle: false,
  isRepeat: 'none',
  sleepTimerRemaining: null,

  setQueue: (tracks) => set({ queue: tracks }),
  setSleepTimer: (seconds) => set({ sleepTimerRemaining: seconds }),
  stopAndClose: () => set({ isPlaying: false, currentTrackIndex: -1, currentTime: 0, userSeekTime: null }),

  playTrack: (track) => {
    const { queue } = get();
    const index = queue.findIndex((t) => t.id === track.id);
    if (index === -1) {
      const newQueue = [...queue, track];
      set({ queue: newQueue, currentTrackIndex: newQueue.length - 1, isPlaying: true, currentTime: 0, userSeekTime: null });
    } else {
      set({ currentTrackIndex: index, isPlaying: true, currentTime: 0, userSeekTime: null });
    }
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  nextTrack: () => {
    const { queue, currentTrackIndex, isShuffle, isRepeat } = get();
    if (queue.length === 0) return;

    if (isRepeat === 'one') {
      set({ currentTime: 0, userSeekTime: 0 });
      return;
    }

    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentTrackIndex + 1;
      if (nextIndex >= queue.length) {
        nextIndex = isRepeat === 'all' ? 0 : -1;
      }
    }

    if (nextIndex !== -1) {
      set({ currentTrackIndex: nextIndex, isPlaying: true, currentTime: 0, userSeekTime: null });
    } else {
      set({ isPlaying: false, currentTime: 0, userSeekTime: null });
    }
  },

  prevTrack: () => {
    const { queue, currentTrackIndex, isRepeat, currentTime } = get();
    if (queue.length === 0) return;

    if (currentTime > 3) {
      set({ currentTime: 0, userSeekTime: 0 });
      return;
    }

    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = isRepeat === 'all' ? queue.length - 1 : 0;
    }

    set({ currentTrackIndex: prevIndex, isPlaying: true, currentTime: 0, userSeekTime: null });
  },

  setCurrentTime: (time) => set({ currentTime: time }),

  seekTo: (time) => set({ currentTime: time, userSeekTime: time }),

  setDuration: (dur) => set({ duration: dur }),

  setVolume: (vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('sonexa_player_volume', String(clamped));
      if (clamped > 0) {
        localStorage.setItem('sonexa_player_muted', 'false');
      }
    } catch {
      // Ignore localStorage availability errors
    }
    set({
      volume: clamped,
      ...(clamped > 0 ? { isMuted: false } : {}),
    });
  },

  toggleMute: () => set((state) => {
    const nextMuted = !state.isMuted;
    try {
      localStorage.setItem('sonexa_player_muted', String(nextMuted));
    } catch {
      // Ignore localStorage availability errors
    }
    if (!nextMuted && state.volume === 0) {
      try {
        localStorage.setItem('sonexa_player_volume', '0.35');
      } catch {
        // Ignore localStorage availability errors
      }
      return { isMuted: false, volume: 0.35 };
    }
    return { isMuted: nextMuted };
  }),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  toggleRepeat: () => set((state) => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const nextIdx = (modes.indexOf(state.isRepeat) + 1) % modes.length;
    return { isRepeat: modes[nextIdx] };
  }),
}));
