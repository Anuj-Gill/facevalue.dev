import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/services/redis.service';
import { PrismaService } from 'src/services/prisma.service';
import { symbols } from 'src/common/symbols.config';
import { Symbols } from '@prisma/client';

export interface LatestPrices {
  prices: Record<string, { price: number; timestamp: number }>;
}

export interface PlatformStats {
  totalOrders: number;
  totalVolume: number;
  matchingEngineLatency: number;
}

@Injectable()
export class MarketDataService {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async getLatestPrices(): Promise<LatestPrices> {
    const prices: Record<string, { price: number; timestamp: number }> = {};

    // Try to get prices from Redis first
    await Promise.all(
      symbols.map(async (symbol) => {
        const latestPrice = await this.redisService.getLatestPrice(symbol);
        if (latestPrice) {
          prices[symbol] = {
            price: latestPrice.price,
            timestamp: latestPrice.timestamp,
          };
        }
      }),
    );

    // For symbols without Redis data, fallback to DB (symbols table)
    const missingSymbols = symbols.filter((symbol) => !prices[symbol]);

    if (missingSymbols.length > 0) {
      const symbolData = await this.prisma.symbol.findMany({
        where: {
          symbol: {
            in: missingSymbols as Symbols[],
          },
        },
        select: {
          symbol: true,
          lastTradePrice: true,
          updatedAt: true,
        },
      });

      symbolData.forEach((s) => {
        prices[s.symbol] = {
          price: s.lastTradePrice,
          timestamp: s.updatedAt.getTime(),
        };
      });
    }

    return { prices };
  }

  async getPlatformStats(): Promise<PlatformStats> {
    // Try to get from cache first
    const cachedStats = await this.redisService.getStats();
    
    if (cachedStats) {
      return {
        ...cachedStats,
        matchingEngineLatency: 300, // Hardcoded ~400ms
      };
    }

    // Cache miss - fetch from database
    const [totalOrders, volumeResult] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.trade.aggregate({
        _sum: {
          quantity: true,
        },
      }),
    ]);

    const totalVolume = volumeResult._sum.quantity || 0;

    // Cache the results
    await this.redisService.setStats({ totalOrders, totalVolume });

    return {
      totalOrders,
      totalVolume,
      matchingEngineLatency: 300, // Hardcoded ~400ms
    };
  }
}
