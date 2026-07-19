import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

interface User {
  id: number;
  email: string;
  username: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  updateAvatar: (avatar: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { accessToken, user } = response.data.data;
        const localAvatar = localStorage.getItem(`sonexa:avatar:${user.username}`) || 'mascot1';
        const userWithAvatar = { ...user, avatar: localAvatar };
        set({
          accessToken,
          user: userWithAvatar,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.data.error?.message || 'Login failed');
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.error?.message || error.message || 'Login failed');
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true });
    try {
      const response = await axiosClient.post('/auth/register', { email, username, password });
      set({ isLoading: false });
      if (!response.data || !response.data.success) {
        throw new Error(response.data.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.error?.message || error.message || 'Registration failed');
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  refreshSession: async () => {
    try {
      const response = await axiosClient.post('/auth/refresh');
      if (response.data && response.data.success) {
        const { accessToken, user } = response.data.data;
        const decodedUser = user || decodeUserFromToken(accessToken);
        if (decodedUser) {
          const localAvatar = localStorage.getItem(`sonexa:avatar:${decodedUser.username}`) || 'mascot1';
          decodedUser.avatar = localAvatar;
        }
        set({
          accessToken,
          user: decodedUser,
          isAuthenticated: true,
        });
        return true;
      }
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
      return false;
    } catch (error) {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
      return false;
    }
  },

  setAccessToken: (token) => {
    const decodedUser = token ? decodeUserFromToken(token) : null;
    if (decodedUser) {
      const localAvatar = localStorage.getItem(`sonexa:avatar:${decodedUser.username}`) || 'mascot1';
      decodedUser.avatar = localAvatar;
    }
    set({
      accessToken: token,
      ...(decodedUser ? { user: decodedUser, isAuthenticated: true } : {}),
    });
  },

  setUser: (user) => {
    if (user) {
      const localAvatar = localStorage.getItem(`sonexa:avatar:${user.username}`) || 'mascot1';
      user.avatar = localAvatar;
    }
    set({ user, isAuthenticated: user !== null });
  },

  updateAvatar: (avatar) => {
    const { user } = get();
    if (user) {
      localStorage.setItem(`sonexa:avatar:${user.username}`, avatar);
      set({ user: { ...user, avatar } });
    }
  }
}));

const decodeUserFromToken = (token: string): User | null => {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return {
        id: payload.userId,
        email: payload.sub,
        username: payload.username,
      };
    }
  } catch (e) {
    console.error('Failed to decode JWT token:', e);
  }
  return null;
};
