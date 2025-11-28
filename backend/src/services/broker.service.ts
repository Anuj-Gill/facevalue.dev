import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Side, OrderType, OrderStatus, Symbols } from '@prisma/client';
import { symbols } from 'src/common/symbols.config';
import { PrismaService } from './prisma.service';
import { TradeService } from './trade.service';

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

interface OrderLocation {
  price: number;
  node: ListNode;
}

class ListNode {
  order: Order;
  next: ListNode | null;
  prev: ListNode | null;

  constructor(order: Order) {
    this.order = order;
    this.next = null;
    this.prev = null;
  }
}

class LinkedList {
  head: ListNode | null;
  tail: ListNode | null;
  length: number;

  constructor() {
    ((this.head = null), (this.tail = null), (this.length = 0));
  }

  addNodeToTail(node: ListNode) {
    if (!this.head) {
      this.head = node;
      this.tail = node;
      this.length++;
      return;
    }

    this.tail.next = node;
    node.prev = this.tail;
    this.length++;
  }

  removeHeadNode() {
    if (!this.head) {
      return;
    }

    if (!this.head.next) {
      this.head = null;
      this.tail = null;
      this.length = 0;
      return;
    }

    this.head = this.head.next;
    this.head.prev = null;
    this.length--;
  }
}

class OrderBookSide {
  isBid: boolean;
  priceLevels: number[];
  levelMap: Map<number, LinkedList>;
  orderMap: Map<string, OrderLocation>;

  constructor(isBid: boolean) {
    this.isBid = isBid;
    this.priceLevels = [];
    this.levelMap = new Map();
    this.orderMap = new Map();
  }

  removeOrderMap(id: string) {
    this.orderMap.delete(id);
  }

  findInsertIndex(price: number, isBid: boolean) {
    let low = 0;
    let high = this.priceLevels.length - 1;
    let mid: number;
    const arr = this.priceLevels;
    while (low <= high) {
      mid = Math.floor(low + (high - low) / 2);
      if (isBid) {
        if (price > arr[mid]) high = mid - 1;
        else low = mid + 1;
      } else {
        if (price < arr[mid]) high = mid - 1;
        else low = mid + 1;
      }
    }
    return low;
  }

  addLimitOrder(order: Order) {
    const price = order.price;
    let list = this.levelMap.get(price);
    if (!list) {
      const index = this.findInsertIndex(price, order.side == Side.buy);
      this.priceLevels.splice(index, 0, price);
      list = new LinkedList();
      this.levelMap.set(price, list);
    }
    const node = new ListNode(order);
    list.addNodeToTail(node);
    this.orderMap.set(order.id, { price, node });
  }
}

class OrderBook {
  symbol: string;
  bids: OrderBookSide;
  asks: OrderBookSide;
  lastTradePrice?: number | null;

  constructor(symbol: string) {
    this.symbol = symbol;
    this.bids = new OrderBookSide(true);
    this.asks = new OrderBookSide(false);
    //this is to be fetched from db, and then will be passed from the onModuleInit only from the BrokerService. Hardecoding to 120.00 for now
    this.lastTradePrice = this.lastTradePrice;
  }
}

@Injectable()
export class BrokerService implements OnModuleInit {
  private readonly logger = new Logger(BrokerService.name);
  private orderBooks: Map<string, OrderBook> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly tradeService: TradeService,
  ) {}

  async onModuleInit() {
    this.logger.log(
      'Initializing order books for symbols: ' + symbols.join(', '),
    );
    symbols.forEach((symbol) => {
      this.orderBooks.set(symbol, new OrderBook(symbol));
    });
    const pendingOrders = await this.prisma.order.findMany({
      where: {
        AND: [
          {
            type: {
              equals: OrderType.limit,
            },
          },
          {
            status: {
              in: [OrderStatus.open, OrderStatus.partial],
            },
          },
        ],
      },
    });
    pendingOrders.forEach((order) => {
      this.handleLimitOrder(order);
    });
    this.logger.log('Order books initialized successfully');
  }

  private logOrderBookState(symbol: string, label: string) {
    const orderBook = this.orderBooks.get(symbol);
    if (!orderBook) return;

    const bidsSnapshot = {
      priceLevels: orderBook.bids.priceLevels,
      levelMap: Array.from(orderBook.bids.levelMap.entries()).map(
        ([price, list]) => ({
          price,
          queueLength: list.length,
          orders: this.getOrdersFromList(list),
        }),
      ),
      orderMap: Array.from(orderBook.bids.orderMap.entries()).map(
        ([id, loc]) => ({
          orderId: id.slice(0, 8),
          price: loc.price,
          qty: loc.node.order.remainingQuantity,
        }),
      ),
    };

    const asksSnapshot = {
      priceLevels: orderBook.asks.priceLevels,
      levelMap: Array.from(orderBook.asks.levelMap.entries()).map(
        ([price, list]) => ({
          price,
          queueLength: list.length,
          orders: this.getOrdersFromList(list),
        }),
      ),
      orderMap: Array.from(orderBook.asks.orderMap.entries()).map(
        ([id, loc]) => ({
          orderId: id.slice(0, 8),
          price: loc.price,
          qty: loc.node.order.remainingQuantity,
        }),
      ),
    };

    this.logger.log(
      `\n========== ORDER BOOK STATE (${label}) - ${symbol} ==========`,
    );
    this.logger.log(`Last Trade Price: ${orderBook.lastTradePrice}`);
    this.logger.log(`BIDS: ${JSON.stringify(bidsSnapshot, null, 2)}`);
    this.logger.log(`ASKS: ${JSON.stringify(asksSnapshot, null, 2)}`);
    this.logger.log(`========================================\n`);
  }

  private getOrdersFromList(list: LinkedList): any[] {
    const orders = [];
    let current = list.head;
    while (current) {
      orders.push({
        orderId: current.order.id.slice(0, 8),
        qty: current.order.remainingQuantity,
      });
      current = current.next;
    }
    return orders;
  }

  async handleLimitOrderMatching(order: Order) {
    this.logger.log(
      `Starting matching for order: ${order.id}, Symbol: ${order.symbol}, Side: ${order.side}, Type: ${order.type}, Price: ${order.price}, Qty: ${order.remainingQuantity}`,
    );

    this.logOrderBookState(order.symbol, 'BEFORE MATCHING');

    const orderBook = this.orderBooks.get(order.symbol);
    const targetSide = order.side == Side.buy ? orderBook.asks : orderBook.bids;

    while (order.remainingQuantity > 0 && targetSide.priceLevels.length > 0) {
      const priceToCompare = targetSide.priceLevels[0];

      const canMatch =
        order.side === Side.buy
          ? order.price >= priceToCompare
          : order.price <= priceToCompare;

      if (!canMatch) break;

      const headNode = targetSide.levelMap.get(priceToCompare)?.head;

      if (!headNode) break;

      const restingOrder = headNode.order;
      const matchedQty = Math.min(
        order.remainingQuantity,
        restingOrder.remainingQuantity,
      );

      this.logger.log(
        `Match found! Price: ${priceToCompare}, Qty: ${matchedQty}, Incoming: ${order.id}, Resting: ${restingOrder.id}`,
      );

      const updatedIncomingOrder = {
        ...order,
        remainingQuantity: order.remainingQuantity - matchedQty,
      };
      const updatedRestingOrder = {
        ...restingOrder,
        remainingQuantity: restingOrder.remainingQuantity - matchedQty,
        symbolId: order.symbolId,
      };

      const [buyOrder, sellOrder] =
        order.side == Side.buy
          ? [updatedIncomingOrder, updatedRestingOrder]
          : [updatedRestingOrder, updatedIncomingOrder];

      await this.tradeService.TradeSettlement(
        buyOrder,
        sellOrder,
        matchedQty,
        priceToCompare,
      );

      orderBook.lastTradePrice = priceToCompare;

      this.logger.log(
        `Updated last trade price for ${order.symbol}: ${priceToCompare}`,
      );

      // Emit SSE event for price update
      const eventPayload = {
        symbol: order.symbol,
        price: priceToCompare,
        quantity: matchedQty,
        timestamp: Date.now(),
      };
      this.logger.log(
        `🚀 Emitting price.update event: ${JSON.stringify(eventPayload)}`,
      );
      this.eventEmitter.emit('price.update', eventPayload);

      order.remainingQuantity -= matchedQty;
      restingOrder.remainingQuantity -= matchedQty;

      if (restingOrder.remainingQuantity === 0) {
        targetSide.removeOrderMap(restingOrder.id);
        targetSide.levelMap.get(priceToCompare).removeHeadNode();
        this.logger.log('Removed ordermap and headnode');

        if (!targetSide.levelMap.get(priceToCompare)?.head) {
          targetSide.levelMap.delete(priceToCompare);
          targetSide.priceLevels.shift();
          this.logger.log('Removed levelmap and priceLevel for that price');
        }
      }
      this.logOrderBookState(order.symbol, 'AFTER MATCHING');
    }

    await this.AddOrRemoveOrder(order);

    this.logger.log(`Finished matching for order ${order.id}`);
  }

  handleLimitOrder(order: Order) {
    const orderBook = this.orderBooks.get(order.symbol);
    if (!orderBook) {
      throw new Error('Order placed for Invalid Symbol');
    }
    const bookSide = order.side == Side.buy ? orderBook.bids : orderBook.asks;
    bookSide.addLimitOrder(order);
  }

  async AddOrRemoveOrder(order: Order) {
    if (order.remainingQuantity > 0 && order.type === OrderType.limit) {
      this.logger.log(
        `Adding remaining qty ${order.remainingQuantity} to order book for order ${order.id}`,
      );
      this.handleLimitOrder(order);
    } else if (order.remainingQuantity > 0 && order.type === OrderType.market) {
      this.logger.log(
        `Cancelling remaining qty ${order.remainingQuantity} for IOC order ${order.id}`,
      );
      if (order.remainingQuantity < order.originalQuantity) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.partial,
            remainingQuantity: order.remainingQuantity,
          },
        });
      } else {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.cancelled,
            remainingQuantity: 0,
          },
        });
      }
    }
  }

  async handleMarketOrderMatching(order: Order) {
    this.logger.log(
      `Starting matching for market order: ${order.id}, Symbol: ${order.symbol}, Side: ${order.side}, Type: ${order.type}, Price: ${order.price}, Qty: ${order.remainingQuantity}`,
    );

    this.logOrderBookState(order.symbol, 'BEFORE MATCHING');

    const orderBook = this.orderBooks.get(order.symbol);
    const targetSide = order.side == Side.buy ? orderBook.asks : orderBook.bids;

    while (order.remainingQuantity > 0 && targetSide.priceLevels.length > 0) {
      const targetPrice = targetSide.priceLevels[0];

      const headNode = targetSide.levelMap.get(targetPrice)?.head;

      if (!headNode) break;

      const restingOrder = headNode.order;
      const matchedQty = Math.min(
        order.remainingQuantity,
        restingOrder.remainingQuantity,
      );

      this.logger.log(
        `Match found! Price: ${targetPrice}, Qty: ${matchedQty}, Incoming: ${order.id}, Resting: ${restingOrder.id}`,
      );

      const updatedIncomingOrder = {
        ...order,
        remainingQuantity: order.remainingQuantity - matchedQty,
      };
      const updatedRestingOrder = {
        ...restingOrder,
        remainingQuantity: restingOrder.remainingQuantity - matchedQty,
      };

      const [buyOrder, sellOrder] =
        order.side == Side.buy
          ? [updatedIncomingOrder, updatedRestingOrder]
          : [updatedRestingOrder, updatedIncomingOrder];

      await this.tradeService.TradeSettlement(
        buyOrder,
        sellOrder,
        matchedQty,
        targetPrice,
      );

      orderBook.lastTradePrice = targetPrice;
      await this.prisma.symbol.update({
        where: {
          symbol: Symbol[order.symbol],
        },
        data: {
          lastTradePrice: targetPrice,
        },
      });

      this.logger.log(
        `Updated last trade price for ${order.symbol}: ${targetPrice}`,
      );

      // Emit SSE event for price update
      const eventPayload = {
        symbol: order.symbol,
        price: targetPrice,
        quantity: matchedQty,
        timestamp: Date.now(),
      };
      this.logger.log(
        `🚀 Emitting price.update event: ${JSON.stringify(eventPayload)}`,
      );
      this.eventEmitter.emit('price.update', eventPayload);

      order.remainingQuantity -= matchedQty;
      restingOrder.remainingQuantity -= matchedQty;

      if (restingOrder.remainingQuantity === 0) {
        targetSide.removeOrderMap(restingOrder.id);
        targetSide.levelMap.get(targetPrice).removeHeadNode();
        this.logger.log('Removed ordermap and headnode');

        if (!targetSide.levelMap.get(targetPrice)?.head) {
          targetSide.levelMap.delete(targetPrice);
          targetSide.priceLevels.shift();
          this.logger.log('Removed levelmap and priceLevel for that price');
        }
      }
      this.logOrderBookState(order.symbol, 'AFTER MATCHING');
    }

    await this.AddOrRemoveOrder(order);

    this.logger.log(`Finished matching for order ${order.id}`);
  }
}
