import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health-status')
  getHealthStatus(): string {
    return this.appService.getHealthStatus();
  }
}
