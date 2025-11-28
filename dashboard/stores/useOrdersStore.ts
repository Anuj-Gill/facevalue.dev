import { create } from 'zustand';
import { orderApi, Order } from '@/lib/api';

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchOrders: () => Promise<void>;
  clearOrders: () => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await orderApi.getAll();
      set({ orders, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch orders', 
        isLoading: false 
      });
    }
  },

  clearOrders: () => {
    set({ orders: [], error: null });
  },
}));
