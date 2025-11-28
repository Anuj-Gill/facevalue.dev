import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SentryModule } from '@sentry/nestjs/setup';
import { OAuthController } from './apis/oauth/oauth.controller';
import { OAuthService } from './apis/oauth/oauth.service';
import { SupabaseService } from './services/supabase.service';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './services/prisma.service';
import { OrderController } from './apis/order/order.controller';
import { OrderService } from './apis/order/order.service';
import { BrokerService } from './services/broker.service';
import { MarketDataController } from './apis/market-data/market-data.controller';
import { BotOrderController } from './apis/bot-order/bot-order.controller';
import { TradeService } from './services/trade.service';
import { HoldingsRepository } from './repositories/Holdings.repository';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController, OAuthController, OrderController, MarketDataController, BotOrderController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    AppService,
    SupabaseService,
    OAuthService,
    JwtService,
    PrismaService,
    OrderService,
    BrokerService,
    TradeService,
    HoldingsRepository
  ],
})
export class AppModule {}
