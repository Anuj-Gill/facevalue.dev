import api from './axios';

export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
}

export const holdingsApi = {
  // Get all holdings for user
  getAll: async (): Promise<Holding[]> => {
    const response = await api.get('/user/holdings');
    return response.data;
  },

  // Get holding for a specific symbol
  getBySymbol: async (symbol: string): Promise<Holding | null> => {
    const response = await api.get(`/user/holdings/${symbol}`);
    return response.data;
  },
};

export default holdingsApi;
