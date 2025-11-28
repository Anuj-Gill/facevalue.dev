import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { OrderDto } from './order.dto';
import { BrokerService } from 'src/services/broker.service';
import { symbols } from 'src/common/symbols.config';
import { OrderType, Side, Symbols } from '@prisma/client';
import { HoldingsRepository } from 'src/repositories/Holdings.repository';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly brokerService: BrokerService,
    private readonly holdingsRepository: HoldingsRepository
  ) {}

  async createOrder(requestPayload: OrderDto, userId: string) {
    this.logger.log(
      `Creating order for user ${userId}: ${JSON.stringify(requestPayload)}`,
    );
    const { symbol, price, type, side, quantity } = requestPayload;

    if (!Object.values(symbols).includes(symbol)) {
      throw new Error('Order placed for invalid Symbol!');
    }

    await this.validateOrder(requestPayload, userId);

    const symbolData = await this.prisma.symbol.findFirst({
      where: {
        symbol: Symbols[symbol]
      }
    });

    const order = await this.prisma.order.create({
      data: {
        userId,
        symbol,
        side,
        type,
        price,
        originalQuantity: quantity,
        remainingQuantity: quantity,
      },
    });


    this.logger.log(`Order created in DB with ID: ${order.id}`);

    const orderDetails = {
      ...requestPayload,
      userId: order.userId,
      id: order.id,
      remainingQuantity: order.remainingQuantity,
      originalQuantity: quantity,
      symbolId: symbolData.id
    };

    this.logger.log(`Sending order to matching engine: ${order.id}`);
    if (type == OrderType.limit) {
      await this.brokerService.handleLimitOrderMatching(orderDetails);
    } else {
      await this.brokerService.handleMarketOrderMatching(orderDetails);
    }
    this.logger.log(`Order processing completed: ${order.id}`);
  }

  async validateOrder(order: OrderDto, userId: string) {
    if (order.side == Side.buy) {
      const orderValue = order.quantity * order.price;
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (user.walletBalance < orderValue) {
        throw new Error('Insufficient funds in users wallet');
      }
    } else {
      const userHoldings = await this.holdingsRepository.userHoldings(userId, Symbols[order.symbol]) 

      if (!userHoldings || userHoldings.quantity < order.quantity) {
        throw new Error('Insufficient quantity of symbol to sell');
      }
    }
  }
}
