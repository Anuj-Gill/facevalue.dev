import { OrderService, OrderRequest } from '../services/OrderService';
import { PriceService } from '../services/PriceService';
import { random, randomInt, randomChoice, sleep } from '../utils/randomizers';

export abstract class Bot {
  protected orderService: OrderService;
  protected priceService: PriceService;
  protected userId: string;
  protected name: string;
  protected isRunning: boolean = false;
  protected symbols: string[] = ['SAMA', 'MUKS', 'HKRT', 'PAAJI'];

  constructor(userId: string, name: string) {
    this.userId = userId;
    this.name = name;
    this.orderService = new OrderService();
    this.priceService = new PriceService();
  }

  abstract getMinDelay(): number;
  abstract getMaxDelay(): number;
  abstract generateOrder(symbol: string, currentPrice: number): OrderRequest;

  async start(): Promise<void> {
    this.isRunning = true;
    console.log(`🤖 [${this.name}] Starting bot...`);

    while (this.isRunning) {
      try {
        // Pick random symbol
        const symbol = randomChoice(this.symbols);
        
        // Get current price
        const currentPrice = await this.priceService.getLastTradePrice(symbol);
        
        // Generate order
        const order = this.generateOrder(symbol, currentPrice);
        
        // Place order
        await this.orderService.placeOrder(order, this.userId);
        
        // Wait before next order
        const delay = randomInt(this.getMinDelay(), this.getMaxDelay());
        await sleep(delay);
      } catch (error) {
        console.error(`❌ [${this.name}] Error:`, error);
        await sleep(5000); // Wait 5s on error
      }
    }
  }

  stop(): void {
    this.isRunning = false;
    console.log(`🛑 [${this.name}] Stopping bot...`);
  }

  protected calculateLimitPrice(currentPrice: number, side: 'buy' | 'sell', variancePercent: number): number {
    const variance = currentPrice * (variancePercent / 100);
    const offset = random(0, variance);
    
    return Math.round(side === 'buy' ? currentPrice - offset : currentPrice + offset);
  }

  protected enforcePriceBoundaries(price: number): number {
    const MIN_PRICE = 5000;  // $50
    const MAX_PRICE = 50000; // $500
    return Math.max(MIN_PRICE, Math.min(MAX_PRICE, price));
  }
}
