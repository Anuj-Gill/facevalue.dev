import { create } from 'zustand';
import { userApi, UserProfile } from '@/lib/api';

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUser: () => Promise<void>;
  clearUser: () => void;
  updateWalletBalance: (amount: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await userApi.getProfile();
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch user', 
        isLoading: false 
      });
    }
  },

  clearUser: () => {
    set({ user: null, error: null });
  },

  // For optimistic updates after placing orders
  updateWalletBalance: (amount: number) => {
    set((state) => ({
      user: state.user 
        ? { ...state.user, walletBalance: state.user.walletBalance + amount }
        : null
    }));
  },
}));
