import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
  ],
  controllers: [AppController, OAuthController, OrderController],
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
    BrokerService
  ],
})
export class AppModule {}
