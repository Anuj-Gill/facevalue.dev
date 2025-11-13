import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHealthStatus(): string {
    return `Server is running, ${this.configService.get<string>('SUPABASE_URL')}`;
  }
}
