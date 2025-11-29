import { create } from 'zustand';
import { orderApi, Order } from '@/lib/api';
import type { PaginationInfo } from '@/lib/api';

interface OrdersState {
  orders: Order[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchOrders: (page?: number, limit?: number) => Promise<void>;
  clearOrders: () => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetchOrders: async (page: number = 1, limit: number = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderApi.getAll(page, limit);
      set({ 
        orders: response.data, 
        pagination: response.pagination,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch orders', 
        isLoading: false 
      });
    }
  },

  clearOrders: () => {
    set({ orders: [], pagination: null, error: null });
  },
}));
