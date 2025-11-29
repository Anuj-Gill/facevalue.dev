import { create } from 'zustand';
import { suggestionsApi, Suggestion, PaginationInfo } from '@/lib/api';

interface SuggestionsState {
  suggestions: Suggestion[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  hasSuggested: boolean;
  isCheckingStatus: boolean;

  // Actions
  fetchSuggestions: (page?: number, limit?: number) => Promise<void>;
  createSuggestion: (coinName: string, ceoName: string) => Promise<void>;
  vote: (suggestionId: string, voteType: 'UP' | 'DOWN') => Promise<void>;
  checkHasSuggested: () => Promise<void>;
  clearError: () => void;
}

export const useSuggestionsStore = create<SuggestionsState>((set, get) => ({
  suggestions: [],
  pagination: null,
  isLoading: false,
  error: null,
  hasSuggested: false,
  isCheckingStatus: false,

  fetchSuggestions: async (page: number = 1, limit: number = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await suggestionsApi.getAll(page, limit);
      set({ 
        suggestions: response.data, 
        pagination: response.pagination,
        isLoading: false 
      });
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
      // Refetch to get updated list with proper sorting
      const { pagination } = get();
      await get().fetchSuggestions(1, pagination?.limit || 10);
      set({ hasSuggested: true, isLoading: false });
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
