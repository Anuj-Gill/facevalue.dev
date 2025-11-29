import {
  Controller,
  Get,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Query,
} from '@nestjs/common';
import { JWTGuard } from 'src/auth/auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JWTGuard)
  async getProfile(@Req() req: Request) {
    try {
      const userId = req['user'].sub;
      this.logger.log(`Fetching profile for user: ${userId}`);
      
      const profile = await this.userService.getUserProfile(userId);
      return profile;
    } catch (err) {
      this.logger.error(`Error fetching profile: ${err.message}`);
      throw new HttpException(
        'Unable to fetch profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('holdings')
  @UseGuards(JWTGuard)
  async getHoldings(@Req() req: Request) {
    try {
      const userId = req['user'].sub;
      this.logger.log(`Fetching holdings for user: ${userId}`);
      
      const holdings = await this.userService.getUserHoldings(userId);
      return holdings;
    } catch (err) {
      this.logger.error(`Error fetching holdings: ${err.message}`);
      throw new HttpException(
        'Unable to fetch holdings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('holdings/:symbol')
  @UseGuards(JWTGuard)
  async getHoldingBySymbol(@Req() req: Request, @Param('symbol') symbol: string) {
    try {
      const userId = req['user'].sub;
      this.logger.log(`Fetching holding for user: ${userId}, symbol: ${symbol}`);
      
      const holding = await this.userService.getUserHoldingBySymbol(userId, symbol);
      return holding;
    } catch (err) {
      this.logger.error(`Error fetching holding: ${err.message}`);
      throw new HttpException(
        'Unable to fetch holding',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('orders')
  @UseGuards(JWTGuard)
  async getOrders(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const userId = req['user'].sub;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      
      this.logger.log(`Fetching orders for user: ${userId}, page: ${pageNum}, limit: ${limitNum}`);
      
      const result = await this.userService.getUserOrders(userId, pageNum, limitNum);
      return result;
    } catch (err) {
      this.logger.error(`Error fetching orders: ${err.message}`);
      throw new HttpException(
        'Unable to fetch orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
