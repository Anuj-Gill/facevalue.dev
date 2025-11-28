import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Order } from './broker.service';
import { OrderStatus, Symbols } from '@prisma/client';

@Injectable()
export class TradeService {
  constructor(private readonly prisma: PrismaService) {}

  async TradeSettlement(
    buyOrder: Order,
    sellOrder: Order,
    matchedQty: number,
    tradePrice: number,
  ) {
    Logger.log(
      `Updating orders in DB - Buy: ${buyOrder.id}, Sell: ${sellOrder.id}, Qty: ${matchedQty}, Price: ${tradePrice}`,
    );
    Logger.log(buyOrder, sellOrder);
    const tradedValue = matchedQty * tradePrice;

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: {
          id: buyOrder.id,
        },
        data: {
          remainingQuantity: buyOrder.remainingQuantity,
          status:
            buyOrder.remainingQuantity > 0
              ? OrderStatus.partial
              : OrderStatus.filled,
        },
      }),
      this.prisma.order.update({
        where: {
          id: sellOrder.id,
        },
        data: {
          remainingQuantity: sellOrder.remainingQuantity,
          status:
            sellOrder.remainingQuantity > 0
              ? OrderStatus.partial
              : OrderStatus.filled,
        },
      }),
      this.prisma.trade.create({
        data: {
          symbol: Symbols[buyOrder.symbol],
          buyOrderId: buyOrder.id,
          sellOrderId: sellOrder.id,
          price: tradePrice,
          quantity: matchedQty,
        },
      }),
      this.prisma.symbol.update({
        where: {
          symbol: Symbols[buyOrder.symbol],
        },
        data: {
          lastTradePrice: tradePrice,
        },
      }),
      this.prisma.user.update({
        where: {
          id: buyOrder.userId,
        },
        data: {
          walletBalance: { decrement: tradedValue },
        },
      }),
      this.prisma.user.update({
        where: {
          id: sellOrder.userId,
        },
        data: {
          walletBalance: { increment: tradedValue },
        },
      }),
      this.prisma.holdings.update({
        where: {
          userId_symbolId: {
            userId: sellOrder.userId,
            symbolId: sellOrder.symbolId,
          },
        },
        data: {
          quantity: { decrement: matchedQty },
        },
      }),
      this.prisma.$executeRaw`
        INSERT INTO holdings (id, user_id, symbol_id, quantity, avg_price)
        VALUES (gen_random_uuid(), ${buyOrder.userId}::uuid, ${buyOrder.symbolId}::uuid, ${matchedQty}, ${tradePrice})
        ON CONFLICT (user_id, symbol_id)
        DO UPDATE SET 
          quantity = holdings.quantity + ${matchedQty},
          avg_price = CASE 
            WHEN holdings.quantity = 0 THEN ${tradePrice}
            ELSE (holdings.quantity * holdings.avg_price + ${matchedQty} * ${tradePrice}) / (holdings.quantity + ${matchedQty})
          END
      `,
    ]);
  }
}
