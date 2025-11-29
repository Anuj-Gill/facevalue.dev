import { OrderType, Side } from "@prisma/client";
import { OrderBookSide } from "./orderBookSide.service";

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  symbolId?: string;
  side: Side;
  type: OrderType;
  price?: number;
  originalQuantity: number;
  remainingQuantity: number;
}

export class OrderBook {
  symbol: string;
  bids: OrderBookSide;
  asks: OrderBookSide;
  lastTradePrice?: number | null;

  constructor(symbol: string) {
    this.symbol = symbol;
    this.bids = new OrderBookSide(true);
    this.asks = new OrderBookSide(false);
    this.lastTradePrice = null;
  }
}
