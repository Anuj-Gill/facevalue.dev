import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis({
      url: this.configService.get<string>('UPSTASH_REDIS_REST_URL'),
      token: this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN'),
    });
  }

  getClient(): Redis {
    return this.redis;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.redis.get<T>(key);
  }  

  async set<T>(key: string, value: T, options?: { ex?: number }): Promise<string | T> {
    if (options?.ex) {
      return this.redis.set(key, value, { ex: options.ex });
    }
    return this.redis.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }
}
