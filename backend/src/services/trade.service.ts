import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Order } from './orderBook.service';
import { OrderStatus, Role, Symbols } from '@prisma/client';

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

    const [buyerUser, sellerUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: buyOrder.userId }, select: { role: true } }),
      this.prisma.user.findUnique({ where: { id: sellOrder.userId }, select: { role: true } }),
    ]);

    const isBuyerBot = buyerUser?.role === Role.bot;
    const isSellerBot = sellerUser?.role === Role.bot;

    const transactionOps: any[] = [
      this.prisma.order.update({
        where: { id: buyOrder.id },
        data: {
          remainingQuantity: buyOrder.remainingQuantity,
          status: buyOrder.remainingQuantity > 0 ? OrderStatus.partial : OrderStatus.filled,
        },
      }),
      this.prisma.order.update({
        where: { id: sellOrder.id },
        data: {
          remainingQuantity: sellOrder.remainingQuantity,
          status: sellOrder.remainingQuantity > 0 ? OrderStatus.partial : OrderStatus.filled,
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
        where: { symbol: Symbols[buyOrder.symbol] },
        data: { lastTradePrice: tradePrice },
      }),
    ];

    if (!isBuyerBot) {
      transactionOps.push(
        this.prisma.user.update({
          where: { id: buyOrder.userId },
          data: { walletBalance: { decrement: tradedValue } },
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
      );
    }

    if (!isSellerBot) {
      transactionOps.push(
        this.prisma.user.update({
          where: { id: sellOrder.userId },
          data: { walletBalance: { increment: tradedValue } },
        }),
        this.prisma.$executeRaw`
          UPDATE holdings 
          SET quantity = quantity - ${matchedQty}
          WHERE user_id = ${sellOrder.userId}::uuid 
          AND symbol_id = ${sellOrder.symbolId}::uuid
        `,
      );
    }

    await this.prisma.$transaction(transactionOps);
  }
}
