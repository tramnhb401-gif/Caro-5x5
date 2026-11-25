import { create } from 'zustand';
import { UserProfile } from '@caro/shared';

interface AuthState {
  user: UserProfile | null;
  isAuthReady: boolean;
  setUser: (user: UserProfile) => void;
  setAuthReady: (ready: boolean) => void;
  clearUser: () => void;
  applyMatchOutcome: (outcome: 'WIN' | 'LOSS' | 'DRAW') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthReady: false,

  setUser: (user) => set({ user }),
  setAuthReady: (isAuthReady) => set({ isAuthReady }),

  clearUser: () => set({ user: null }),

  applyMatchOutcome: (outcome) =>
    set((state) => {
      if (!state.user) return state;
      const eloDelta = outcome === 'WIN' ? 25 : outcome === 'LOSS' ? -15 : 5;
      return {
        user: {
          ...state.user,
          elo: Math.max(100, state.user.elo + eloDelta),
          wins: state.user.wins + (outcome === 'WIN' ? 1 : 0),
          losses: state.user.losses + (outcome === 'LOSS' ? 1 : 0),
          draws: state.user.draws + (outcome === 'DRAW' ? 1 : 0),
        },
      };
    }),
}));
