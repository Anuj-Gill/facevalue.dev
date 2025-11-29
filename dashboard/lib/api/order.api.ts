import api from './axios';

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  price: number | null;
  originalQuantity: number;
  remainingQuantity: number;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedOrdersResponse {
  data: Order[];
  pagination: PaginationInfo;
}

export interface CreateOrderPayload {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  quantity: number;
  price?: number; // Required for limit orders (in cents)
}

export const orderApi = {
  // Create a new order
  create: async (payload: CreateOrderPayload): Promise<{ message: string }> => {
    const response = await api.post('/order', payload);
    return response.data;
  },

  // Get all orders for user with pagination
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedOrdersResponse> => {
    const response = await api.get(`/user/orders?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default orderApi;
