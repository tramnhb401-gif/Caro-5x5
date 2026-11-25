import { create } from 'zustand';
import { MatchHistoryItem } from '@caro/shared';

interface HistoryState {
  matches: MatchHistoryItem[];
  prependMatch: (item: MatchHistoryItem) => void;
  replaceMatch: (temporaryId: string, item: MatchHistoryItem) => void;
  setMatches: (items: MatchHistoryItem[]) => void;
  clearMatches: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  matches: [],

  prependMatch: (item) =>
    set((state) => ({
      matches: [item, ...state.matches],
    })),

  replaceMatch: (temporaryId, item) =>
    set((state) => {
      const index = state.matches.findIndex(
        (match) => match.id === temporaryId,
      );
      if (index === -1) return { matches: [item, ...state.matches] };
      const matches = [...state.matches];
      matches[index] = item;
      return { matches };
    }),

  setMatches: (matches) => set({ matches }),

  clearMatches: () => set({ matches: [] }),
}));
