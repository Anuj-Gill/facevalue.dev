import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { Symbols } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        walletBalance: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserHoldings(userId: string) {
    const holdings = await this.prisma.holdings.findMany({
      where: { userId },
      include: {
        symbol: {
          select: {
            symbol: true,
            lastTradePrice: true,
          },
        },
      },
    });

    // Transform to include calculated fields
    return holdings.map((holding) => ({
      id: holding.id,
      symbol: holding.symbol.symbol,
      quantity: holding.quantity,
      avgPrice: holding.avgPrice,
      currentPrice: holding.symbol.lastTradePrice,
      totalValue: holding.quantity * holding.symbol.lastTradePrice,
      totalInvested: holding.quantity * holding.avgPrice,
      profitLoss: holding.quantity * (holding.symbol.lastTradePrice - holding.avgPrice),
      profitLossPercent: ((holding.symbol.lastTradePrice - holding.avgPrice) / holding.avgPrice) * 100,
    }));
  }

  async getUserHoldingBySymbol(userId: string, symbolName: string) {
    // Validate symbol
    if (!Object.values(Symbols).includes(symbolName as Symbols)) {
      return null;
    }

    const holding = await this.prisma.holdings.findFirst({
      where: {
        userId,
        symbol: {
          symbol: symbolName as Symbols,
        },
      },
      include: {
        symbol: {
          select: {
            symbol: true,
            lastTradePrice: true,
          },
        },
      },
    });

    if (!holding) {
      return null;
    }

    return {
      id: holding.id,
      symbol: holding.symbol.symbol,
      quantity: holding.quantity,
      avgPrice: holding.avgPrice,
      currentPrice: holding.symbol.lastTradePrice,
      totalValue: holding.quantity * holding.symbol.lastTradePrice,
      totalInvested: holding.quantity * holding.avgPrice,
      profitLoss: holding.quantity * (holding.symbol.lastTradePrice - holding.avgPrice),
      profitLossPercent: ((holding.symbol.lastTradePrice - holding.avgPrice) / holding.avgPrice) * 100,
    };
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: { userId },
      }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }
}
