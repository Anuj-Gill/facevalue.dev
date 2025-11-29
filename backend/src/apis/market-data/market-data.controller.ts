import { Controller, Sse, MessageEvent, Param, Logger, Get } from '@nestjs/common';
import { Observable, fromEvent, map, filter, tap } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from 'src/services/redis.service';
import { MarketDataService } from './market-data.service';

interface PriceUpdate {
  symbol: string;
  price: number;
  quantity: number;
  timestamp: number;
}

@Controller('market-data')
export class MarketDataController {
  private readonly logger = new Logger(MarketDataController.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
    private readonly marketDataService: MarketDataService,
  ) {}

  @Sse('stream')
  streamPriceUpdates(): Observable<MessageEvent> {
    this.logger.log('📡 SSE stream started for all symbols');
    return fromEvent<PriceUpdate>(this.eventEmitter, 'price.update').pipe(
      tap((data) =>
        this.logger.log(`📤 Sending price update: ${JSON.stringify(data)}`),
      ),
      map((data) => ({
        data: JSON.stringify(data),
      })),
    );
  }

  @Sse('stream/:symbol')
  streamSymbolPriceUpdates(
    @Param('symbol') symbol: string,
  ): Observable<MessageEvent> {
    this.logger.log(`📡 SSE stream started for symbol: ${symbol}`);
    return fromEvent<PriceUpdate>(this.eventEmitter, 'price.update').pipe(
      filter((data) => data.symbol === symbol),
      tap((data) =>
        this.logger.log(
          `📤 Sending price update for ${symbol}: ${JSON.stringify(data)}`,
        ),
      ),
      map((data) => ({
        data: JSON.stringify(data),
      })),
    );
  }

  @Get('prices/latest')
  async getLatestPrices() {
    return this.marketDataService.getLatestPrices();
  }

  @Get(':symbol/price-history')
  async getPriceHistory(@Param('symbol') symbol: string) {
    const history = await this.redisService.getPriceHistory(symbol);
    return { symbol, history };
  }
}
