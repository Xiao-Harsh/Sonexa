import axiosClient from './axiosClient';

export interface Track {
  id: string;
  title: string;
  description?: string;
  duration: number;
  genre: string;
  mood?: string;
  user: {
    name: string;
    username: string;
    artwork?: {
      "150x150"?: string;
      "480x480"?: string;
      "1000x1000"?: string;
    };
  };
  artwork?: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
}

export const musicApi = {
  searchTracks: async (query: string, limit = 20, offset = 0): Promise<Track[]> => {
    try {
      const response = await axiosClient.get(`/music/search`, {
        params: { q: query, limit, offset },
      });
      if (response.data && response.data.success) {
        return response.data.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to search tracks:', error);
      return [];
    }
  },

  getTrendingTracks: async (genre?: string, limit = 20, offset = 0): Promise<Track[]> => {
    try {
      const response = await axiosClient.get(`/music/trending`, {
        params: { genre, limit, offset },
      });
      if (response.data && response.data.success) {
        return response.data.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to get trending tracks:', error);
      return [];
    }
  },

  getTrackDetails: async (trackId: string): Promise<Track | null> => {
    try {
      const response = await axiosClient.get(`/music/track/${trackId}`);
      if (response.data && response.data.success) {
        return response.data.data.data || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get track details:', error);
      return null;
    }
  },
};
