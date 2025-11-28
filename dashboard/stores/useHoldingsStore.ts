import { create } from 'zustand';
import { holdingsApi, Holding } from '@/lib/api';

interface HoldingsState {
  holdings: Holding[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchHoldings: () => Promise<void>;
  getHoldingBySymbol: (symbol: string) => Holding | undefined;
  clearHoldings: () => void;
}

export const useHoldingsStore = create<HoldingsState>((set, get) => ({
  holdings: [],
  isLoading: false,
  error: null,

  fetchHoldings: async () => {
    set({ isLoading: true, error: null });
    try {
      const holdings = await holdingsApi.getAll();
      set({ holdings, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch holdings', 
        isLoading: false 
      });
    }
  },

  getHoldingBySymbol: (symbol: string) => {
    return get().holdings.find(h => h.symbol === symbol);
  },

  clearHoldings: () => {
    set({ holdings: [], error: null });
  },
}));
