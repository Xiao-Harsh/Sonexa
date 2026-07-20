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

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentTrackIndex: -1,
  isPlaying: false,
  currentTime: 0,
  userSeekTime: null,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  isShuffle: false,
  isRepeat: 'none',
  sleepTimerRemaining: null,

  setQueue: (tracks) => set({ queue: tracks }),
  setSleepTimer: (seconds) => set({ sleepTimerRemaining: seconds }),

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

    let nextIndex = currentTrackIndex;
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

  setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)) }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  toggleRepeat: () => set((state) => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const nextIdx = (modes.indexOf(state.isRepeat) + 1) % modes.length;
    return { isRepeat: modes[nextIdx] };
  }),
}));
