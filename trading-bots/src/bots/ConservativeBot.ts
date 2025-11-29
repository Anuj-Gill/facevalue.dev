import { Bot } from './Bot';
import { OrderRequest } from '../services/OrderService';
import { random, randomInt } from '../utils/randomizers';

export class ConservativeBot extends Bot {
  getMinDelay(): number {
    return 3000; 
  }

  getMaxDelay(): number {
    return 10000;
  }

  generateOrder(symbol: string, currentPrice: number): OrderRequest {
    const isMarketOrder = Math.random() < 0.1; // 10% market orders
    
    if (isMarketOrder) {
      return {
        symbol,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        type: 'market',
        quantity: randomInt(10, 50)
      };
    } else {
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      
      const spread = random(0.5, 1);
      const price = this.enforcePriceBoundaries(
        this.calculateLimitPrice(currentPrice, side, spread)
      );
      
      return {
        symbol,
        side,
        type: 'limit',
        quantity: randomInt(10, 50),
        price
      };
    }
  }
}
