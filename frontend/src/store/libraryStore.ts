import { create } from 'zustand';
import axiosClient from '../api/axiosClient';
import type { Track } from '../api/musicApi';
import { useToastStore } from './toastStore';

export interface PlaylistTrack {
  id: number;
  audiusTrackId: string;
  title: string;
  artistName: string;
  durationSeconds: number;
  coverArtUrl?: string;
  position: number;
}

export interface Playlist {
  id: number;
  name: string;
  tracks: PlaylistTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface DbTrackPayload {
  audiusTrackId: string;
  title: string;
  artistName?: string;
  durationSeconds?: number;
  coverArtUrl?: string;
}

export const mapDbTrackToTrack = (dbTrack: DbTrackPayload): Track => {
  return {
    id: dbTrack.audiusTrackId,
    title: dbTrack.title,
    duration: dbTrack.durationSeconds || 0,
    genre: '',
    user: {
      name: dbTrack.artistName || 'Unknown Artist',
      username: '',
      artwork: {
        "150x150": dbTrack.coverArtUrl || '',
      }
    },
    artwork: {
      "150x150": dbTrack.coverArtUrl,
      "480x480": dbTrack.coverArtUrl,
    }
  };
};

interface LibraryState {
  favorites: Track[];
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  history: Track[];
  isLoading: boolean;
  
  fetchFavorites: () => Promise<void>;
  likeTrack: (track: Track) => Promise<void>;
  unlikeTrack: (trackId: string) => Promise<void>;
  
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  fetchPlaylistDetails: (id: number) => Promise<Playlist | null>;
  deletePlaylist: (id: number) => Promise<void>;
  
  addTrackToPlaylist: (playlistId: number, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: number, trackId: string) => Promise<void>;
  
  fetchHistory: () => Promise<void>;
  logHistory: (track: Track) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  favorites: [],
  playlists: [],
  currentPlaylist: null,
  history: [],
  isLoading: false,

  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosClient.get('/library/favorites');
      if (response.data && response.data.success) {
        const mapped = (response.data.data || []).map(mapDbTrackToTrack);
        set({ favorites: mapped });
      }
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('Failed to load favorites', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  likeTrack: async (track) => {
    try {
      const response = await axiosClient.post('/library/favorites', {
        audiusTrackId: track.id,
        title: track.title,
        artistName: track.user.name,
        durationSeconds: track.duration,
        coverArtUrl: track.artwork?.["150x150"] || track.user.artwork?.["150x150"],
      });
      if (response.data && response.data.success) {
        set({ favorites: [track, ...get().favorites] });
      }
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('Failed to like track', 'error');
    }
  },

  unlikeTrack: async (trackId) => {
    try {
      const response = await axiosClient.delete(`/library/favorites/${trackId}`);
      if (response.data && response.data.success) {
        set({ favorites: get().favorites.filter((t) => t.id !== trackId) });
      }
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('Failed to unlike track', 'error');
    }
  },

  fetchPlaylists: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosClient.get('/library/playlists');
      if (response.data && response.data.success) {
        set({ playlists: response.data.data || [] });
      }
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('Failed to load playlists', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  createPlaylist: async (name) => {
    try {
      const response = await axiosClient.post('/library/playlists', { name });
      if (response.data && response.data.success) {
        set({ playlists: [response.data.data, ...get().playlists] });
        useToastStore.getState().showToast('Playlist created successfully', 'success');
      }
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('Failed to create playlist', 'error');
    }
  },

  fetchPlaylistDetails: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axiosClient.get(`/library/playlists/${id}`);
      if (response.data && response.data.success) {
        const playlist = response.data.data;
        set({ currentPlaylist: playlist });
        return playlist;
      }
      return null;
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('Failed to load playlist details', 'error');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deletePlaylist: async (id) => {
    try {
      const response = await axiosClient.delete(`/library/playlists/${id}`);
      if (response.data && response.data.success) {
        set({ playlists: get().playlists.filter((p) => p.id !== id) });
        if (get().currentPlaylist?.id === id) {
          set({ currentPlaylist: null });
        }
        useToastStore.getState().showToast('Playlist deleted', 'info');
      }
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('Failed to delete playlist', 'error');
    }
  },

  addTrackToPlaylist: async (playlistId, track) => {
    try {
      const response = await axiosClient.post(`/library/playlists/${playlistId}/tracks`, {
        audiusTrackId: track.id,
        title: track.title,
        artistName: track.user.name,
        durationSeconds: track.duration,
        coverArtUrl: track.artwork?.["150x150"] || track.user.artwork?.["150x150"],
      });
      if (response.data && response.data.success) {
        const updatedPlaylist = response.data.data;
        set({
          playlists: get().playlists.map((p) => (p.id === playlistId ? updatedPlaylist : p)),
        });
        if (get().currentPlaylist?.id === playlistId) {
          set({ currentPlaylist: updatedPlaylist });
        }
      }
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('Failed to add track to playlist', 'error');
    }
  },

  removeTrackFromPlaylist: async (playlistId, trackId) => {
    try {
      const response = await axiosClient.delete(`/library/playlists/${playlistId}/tracks/${trackId}`);
      if (response.data && response.data.success) {
        await get().fetchPlaylistDetails(playlistId);
        useToastStore.getState().showToast('Track removed from playlist', 'info');
      }
    } catch (e) {
      console.error(e);
      useToastStore.getState().showToast('Failed to remove track from playlist', 'error');
    }
  },

  fetchHistory: async () => {
    try {
      const response = await axiosClient.get('/library/history');
      if (response.data && response.data.success) {
        const mapped = (response.data.data || []).map(mapDbTrackToTrack);
        set({ history: mapped });
      }
    } catch (e) {
      console.error(e);
    }
  },

  logHistory: async (track) => {
    try {
      const response = await axiosClient.post('/library/history', {
        audiusTrackId: track.id,
        title: track.title,
        artistName: track.user.name,
        durationSeconds: track.duration,
        coverArtUrl: track.artwork?.["150x150"] || track.user.artwork?.["150x150"],
      });
      if (response.data && response.data.success) {
        // Optimistically insert to top of history, keeping max 10
        const currentHistory = get().history.filter((t) => t.id !== track.id);
        set({ history: [track, ...currentHistory].slice(0, 10) });
      }
    } catch (e) {
      console.error(e);
    }
  },
}));
