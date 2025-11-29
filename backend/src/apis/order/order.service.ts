import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { OrderDto } from './order.dto';
import { BrokerService } from 'src/services/broker.service';
import { symbols } from 'src/common/symbols.config';
import { OrderType, Role, Side, Symbols } from '@prisma/client';
import { HoldingsRepository } from 'src/repositories/Holdings.repository';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly brokerService: BrokerService,
    private readonly holdingsRepository: HoldingsRepository,
  ) {}

  async createOrder(requestPayload: OrderDto, userId: string) {
    this.logger.log(
      `Creating order for user ${userId}: ${JSON.stringify(requestPayload)}`,
    );
    const { symbol, price, type, side, quantity } = requestPayload;

    this.validateSymbol(symbol);
    const isorderByBot = await this.validateBotOrder(userId);

    if (!isorderByBot) {
      await this.validateOrder(requestPayload, userId);
    }

    const symbolData = await this.prisma.symbol.findFirst({
      where: { symbol: Symbols[symbol] },
    });

    if (!symbolData) {
      throw new BadRequestException(`Symbol ${symbol} not found in database`);
    }

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
      symbolId: symbolData.id,
    };

    this.logger.log(`Sending order to matching engine: ${order.id}`);

    await this.brokerService.handleOrderMatching(orderDetails);
    

    this.logger.log(`Order processing completed: ${order.id}`);
  }

  private validateSymbol(symbol: string): void {
    if (!Object.values(symbols).includes(symbol)) {
      throw new BadRequestException('Order placed for invalid Symbol!');
    }
  }

  private async validateOrder(order: OrderDto, userId: string): Promise<void> {
    if (order.side === Side.buy) {
      await this.validateBuyOrder(order, userId);
    } else {
      await this.validateSellOrder(order, userId);
    }
  }

  private async validateBuyOrder(order: OrderDto, userId: string): Promise<void> {
    const orderValue = order.quantity * order.price;

    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.walletBalance < orderValue) {
      throw new BadRequestException(
        `Insufficient funds. Required: ${orderValue}, Available: ${user.walletBalance}`,
      );
    }
  }

  private async validateSellOrder(order: OrderDto, userId: string): Promise<void> {
    const userHoldings = await this.holdingsRepository.userHoldings(
      userId,
      Symbols[order.symbol],
    );

    if (!userHoldings) {
      throw new BadRequestException(`You don't own any ${order.symbol} to sell`);
    }

    if (userHoldings.quantity < order.quantity) {
      throw new BadRequestException(
        `Insufficient holdings. Required: ${order.quantity}, Available: ${userHoldings.quantity}`,
      );
    }
  }

  private async validateBotOrder(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (user.role == Role.bot) {
      return true;
    }
  }
}