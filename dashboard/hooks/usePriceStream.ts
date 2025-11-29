'use client';

import { useEffect, useState } from 'react';
import { marketDataApi } from '@/lib/api';

interface PriceUpdate {
  symbol: string;
  price: number;
  quantity: number;
  timestamp: number;
}

interface UsePriceStreamOptions {
  symbol?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

export function usePriceStream(options?: UsePriceStreamOptions) {
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<PriceUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial prices on mount
  useEffect(() => {
    const fetchInitialPrices = async () => {
      try {
        const response = await marketDataApi.getLatestPrices();
        const initialPrices = new Map<string, number>();
        Object.entries(response.prices).forEach(([symbol, data]) => {
          initialPrices.set(symbol, data.price);
        });
        setPrices(initialPrices);
      } catch (error) {
        console.error('Failed to fetch initial prices:', error);
      }
    };
    fetchInitialPrices();
  }, []);

  useEffect(() => {
    console.log('SSE API URL:', apiUrl);
    const endpoint = options?.symbol
      ? `${apiUrl}/market-data/stream/${options.symbol}`
      : `${apiUrl}/market-data/stream`;

    console.log('Connecting to SSE endpoint:', endpoint);
    const eventSource = new EventSource(endpoint, { withCredentials: true });

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('SSE connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const update: PriceUpdate = JSON.parse(event.data);
        setPrices((prev) => new Map(prev).set(update.symbol, update.price));
        setLastUpdate(update);
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [options?.symbol]);

  return { prices, lastUpdate, isConnected };
}
