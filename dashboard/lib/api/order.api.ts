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

  // Get all orders for user
  getAll: async (): Promise<Order[]> => {
    const response = await api.get('/user/orders');
    return response.data;
  },
};

export default orderApi;
