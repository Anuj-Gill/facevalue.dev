import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Side, OrderType, OrderStatus, Symbols } from '@prisma/client';
import { symbols } from 'src/common/symbols.config';
import { PrismaService } from './prisma.service';
import { TradeService } from './trade.service';
import { DoublyLinkedList, ListNode } from './dll.service';
import { OrderBookSide } from './orderBookSide.service';
import { OrderBook } from './orderBook.service';
import { Order } from './orderBook.service';
import { RedisService } from './redis.service';

@Injectable()
export class BrokerService implements OnModuleInit {
  private readonly logger = new Logger(BrokerService.name);
  private orderBooks: Map<string, OrderBook> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly tradeService: TradeService,
    private readonly redisService: RedisService
  ) {}

  async onModuleInit() {
    this.logger.log(
      'Initializing order books for symbols: ' + symbols.join(', '),
    );
    symbols.forEach((symbol) => {
      this.orderBooks.set(symbol, new OrderBook(symbol));
    });

    await this.loadPendingOrders();

    this.logger.log('Order books initialized successfully');
  }

  async loadPendingOrders() {
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
    const symbolsData = await this.prisma.symbol.findMany();
    const symbolIdMap = new Map(symbolsData.map((s) => [s.symbol, s.id]));

    pendingOrders.forEach((order) => {
      const orderWithSymbolId = {
        ...order,
        symbolId: symbolIdMap.get(Symbols[order.symbol]),
      };
      this.handleLimitOrder(orderWithSymbolId);
    });
  }

  // private logOrderBookState(symbol: string, label: string) {
  //   const orderBook = this.orderBooks.get(symbol);
  //   if (!orderBook) return;

  // }

  async handleOrderMatching(order: Order) {
    this.logger.log(
      `Starting matching for order: ${order.id}, Symbol: ${order.symbol}, Side: ${order.side}, Type: ${order.type}, Price: ${order.price}, Qty: ${order.remainingQuantity}`,
    );
    this.logger.log(order)

    // this.logOrderBookState(order.symbol, 'BEFORE MATCHING');

    const orderBook = this.orderBooks.get(order.symbol);
    const targetSide = order.side == Side.buy ? orderBook.asks : orderBook.bids;

    while (order.remainingQuantity > 0 && targetSide.hasPriceLevels()) {
      this.logger.log("Inside while")
      const priceToCompare = targetSide.bestPrice;

      if (order.type == OrderType.limit) {
        const canMatch =
          order.side === Side.buy
            ? order.price >= priceToCompare
            : order.price <= priceToCompare;

        if (!canMatch) break;
      }

      const headNode = targetSide.getHeadNodeAtPrice(priceToCompare);

      if (!headNode) break;

      const restingOrder = headNode.data;

      if(restingOrder.userId == order.userId) {
        this.logger.log("same user, breaking---------------")
        break;
      }
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

      await this.redisService.addPricePoint(order.symbol, priceToCompare);

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
        targetSide.removeOrderFromMap(restingOrder.id);
        targetSide.removeHeadAtPrice(priceToCompare);
        this.logger.log('Removed filled order from book');
      }
      // this.logOrderBookState(order.symbol, 'AFTER MATCHING');
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
    this.logger.log('Add or remove order -->',order)
    if (order.remainingQuantity > 0 && order.type === OrderType.limit) {
      this.logger.log(
        `Adding remaining qty ${order.remainingQuantity} to order book for order ${order.id}`,
      );
      this.handleLimitOrder(order);
    } else if (order.remainingQuantity > 0 && order.type === OrderType.market) {
      this.logger.log(
        `Cancelling remaining qty ${order.remainingQuantity} for IOC order ${order.id}`,
      );

        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: order.remainingQuantity < order.originalQuantity ? OrderStatus.partial :OrderStatus.cancelled,
            remainingQuantity: order.remainingQuantity,
          },
        });
      
    }
  }
}
