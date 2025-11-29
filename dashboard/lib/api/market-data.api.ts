import { api } from './axios';

export interface PricePoint {
  price: number;
  timestamp: number;
}

export interface PriceHistoryResponse {
  symbol: string;
  history: PricePoint[];
}

export interface LatestPricesResponse {
  prices: Record<string, { price: number; timestamp: number }>;
}

export const marketDataApi = {
  getPriceHistory: async (symbol: string): Promise<PriceHistoryResponse> => {
    const response = await api.get<PriceHistoryResponse>(`/market-data/${symbol}/price-history`);
    return response.data;
  },

  getLatestPrices: async (): Promise<LatestPricesResponse> => {
    const response = await api.get<LatestPricesResponse>('/market-data/prices/latest');
    return response.data;
  },
};
