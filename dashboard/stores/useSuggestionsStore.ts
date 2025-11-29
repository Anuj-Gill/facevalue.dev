import { create } from 'zustand';
import { suggestionsApi, Suggestion } from '@/lib/api';

interface SuggestionsState {
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
  hasSuggested: boolean;
  isCheckingStatus: boolean;

  // Actions
  fetchSuggestions: () => Promise<void>;
  createSuggestion: (coinName: string, ceoName: string) => Promise<void>;
  vote: (suggestionId: string, voteType: 'UP' | 'DOWN') => Promise<void>;
  checkHasSuggested: () => Promise<void>;
  clearError: () => void;
}

export const useSuggestionsStore = create<SuggestionsState>((set, get) => ({
  suggestions: [],
  isLoading: false,
  error: null,
  hasSuggested: false,
  isCheckingStatus: false,

  fetchSuggestions: async () => {
    set({ isLoading: true, error: null });
    try {
      const suggestions = await suggestionsApi.getAll();
      set({ suggestions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch suggestions',
        isLoading: false,
      });
    }
  },

  createSuggestion: async (coinName: string, ceoName: string) => {
    set({ isLoading: true, error: null });
    try {
      const newSuggestion = await suggestionsApi.create({ coinName, ceoName });
      set((state) => ({
        suggestions: [newSuggestion, ...state.suggestions],
        isLoading: false,
        hasSuggested: true,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to create suggestion',
        isLoading: false,
      });
      throw error;
    }
  },

  vote: async (suggestionId: string, voteType: 'UP' | 'DOWN') => {
    try {
      const updatedSuggestion = await suggestionsApi.vote(suggestionId, { voteType });
      set((state) => ({
        suggestions: state.suggestions
          .map((s) => (s.id === suggestionId ? updatedSuggestion : s))
          .sort((a, b) => b.netVotes - a.netVotes),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to vote',
      });
      throw error;
    }
  },

  checkHasSuggested: async () => {
    set({ isCheckingStatus: true });
    try {
      const hasSuggested = await suggestionsApi.hasSuggested();
      set({ hasSuggested, isCheckingStatus: false });
    } catch (error: any) {
      set({ isCheckingStatus: false });
    }
  },

  clearError: () => set({ error: null }),
}));
