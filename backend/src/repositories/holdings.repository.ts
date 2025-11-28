import { Injectable } from '@nestjs/common';
import { Symbols } from '@prisma/client';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class HoldingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async userHoldings(userId: string, symbol: Symbols) {
    return await this.prisma.holdings.findFirst({
      where: {
        userId: userId,
        symbol: {
          symbol: Symbols[symbol],
        },
      },
      include: {
        symbol: true,
      },
    });
  }
}
