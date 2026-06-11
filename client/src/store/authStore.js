import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken) => {
        set({ user, accessToken, isAuthenticated: true });
        if (accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshAuth: async () => {
        try {
          const res = await api.post('/auth/refresh');
          const { accessToken, user } = res.data;
          set({ accessToken, isAuthenticated: true });
          if (user) set({ user });
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          return accessToken;
        } catch {
          get().logout();
          return null;
        }
      },

      fetchMe: async () => {
        try {
          set({ isLoading: true });
          const res = await api.get('/auth/me');
          set({ user: res.data.data, isAuthenticated: true });
        } catch {
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'zbritje-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
          // Silently validate token; clear state if expired/invalid
          api.get('/auth/me').catch(() => {
            delete api.defaults.headers.common['Authorization'];
            useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
          });
        }
      },
    }
  )
);
