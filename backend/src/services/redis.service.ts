import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

export interface PricePoint {
  price: number;
  timestamp: number;
}

const MAX_PRICE_HISTORY = 200;

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis({
      url: this.configService.get<string>('UPSTASH_REDIS_REST_URL'),
      token: this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN'),
    });
  }

  getClient(): Redis {
    return this.redis;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.redis.get<T>(key);
  }  

  async set<T>(key: string, value: T, options?: { ex?: number }): Promise<string | T> {
    if (options?.ex) {
      return this.redis.set(key, value, { ex: options.ex });
    }
    return this.redis.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  private getPriceHistoryKey(symbol: string): string {
    return `price_history:${symbol}`;
  }

  async addPricePoint(symbol: string, price: number): Promise<void> {
    const key = this.getPriceHistoryKey(symbol);
    const pricePoint: PricePoint = {
      price,
      timestamp: Date.now(),
    };

    // Push to the right (newest at end)
    await this.redis.rpush(key, JSON.stringify(pricePoint));

    // Trim to keep only the last MAX_PRICE_HISTORY entries
    await this.redis.ltrim(key, -MAX_PRICE_HISTORY, -1);
  }

  async getPriceHistory(symbol: string): Promise<PricePoint[]> {
    const key = this.getPriceHistoryKey(symbol);
    const data = await this.redis.lrange(key, 0, -1);

    return data.map((item) => {
      if (typeof item === 'string') {
        return JSON.parse(item) as PricePoint;
      }
      return item as PricePoint;
    });
  }

  async getLatestPrice(symbol: string): Promise<PricePoint | null> {
    const key = this.getPriceHistoryKey(symbol);
    // Get the last element (most recent price)
    const data = await this.redis.lrange(key, -1, -1);
    
    if (data.length === 0) {
      return null;
    }

    const item = data[0];
    if (typeof item === 'string') {
      return JSON.parse(item) as PricePoint;
    }
    return item as PricePoint;
  }
}
