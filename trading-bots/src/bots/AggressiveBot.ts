import { Bot } from './Bot';
import { OrderRequest } from '../services/OrderService';
import { randomChoice, randomInt } from '../utils/randomizers';

export class AggressiveBot extends Bot {
  getMinDelay(): number {
    return 1000;
  }

  getMaxDelay(): number {
    return 2000;
  }

  generateOrder(symbol: string, currentPrice: number): OrderRequest {
    const side = randomChoice(['buy', 'sell'] as const);
    const isMarketOrder = Math.random() < 0.7; 
    
    if (isMarketOrder) {
      return {
        symbol,
        side,
        type: 'market',
        quantity: randomInt(50, 200)
      };
    } else {
      const price = this.enforcePriceBoundaries(
        this.calculateLimitPrice(currentPrice, side, 0.2)
      );
      
      return {
        symbol,
        side,
        type: 'limit',
        quantity: randomInt(50, 80),
        price
      };
    }
  }
}
