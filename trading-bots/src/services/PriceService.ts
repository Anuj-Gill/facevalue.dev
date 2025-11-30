import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface PriceData {
  symbol: string;
  lastTradePrice: number;
}

export class PriceService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  async getLastTradePrice(symbol: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('symbols')
      .select('last_trade_price')
      .eq('symbol', symbol)
      .single();

    if (error || !data) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      // Default fallback price (in cents)
      return 12000; // $120.00
    }

    return data.last_trade_price;
  }

  async getAllPrices(): Promise<PriceData[]> {
    const { data, error } = await this.supabase
      .from('symbols')
      .select('symbol, last_trade_price');

    if (error || !data) {
      console.error('Failed to fetch all prices:', error);
      return [
        { symbol: 'SAMA', lastTradePrice: 12000 },
        { symbol: 'MUKS', lastTradePrice: 12000 },
        { symbol: 'HKRT', lastTradePrice: 12000 },
        { symbol: 'PAAJI', lastTradePrice: 12000 },
      ];
    }

    return data.map(row => ({
      symbol: row.symbol,
      lastTradePrice: row.last_trade_price
    }));
  }
}
