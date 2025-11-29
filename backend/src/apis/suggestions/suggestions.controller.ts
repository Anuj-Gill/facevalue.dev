import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  SetMetadata,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { JWTGuard } from 'src/auth/auth.guard';
import { apiIdentifiers } from 'src/auth/auth.config';
import { SuggestionsService } from './suggestions.service';
import { CreateSuggestionDto, VoteDto } from './suggestions.dto';
import * as Sentry from '@sentry/nestjs';

@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post()
  @SetMetadata('apiIdentifier', apiIdentifiers.order)
  @UseGuards(JWTGuard)
  async createSuggestion(
    @Body() dto: CreateSuggestionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req['user'].sub;
      Logger.log(`Creating suggestion from user: ${userId}`, JSON.stringify(dto));

      const suggestion = await this.suggestionsService.createSuggestion(dto, userId);

      return res.status(HttpStatus.CREATED).json({
        message: 'Suggestion created successfully!',
        data: suggestion,
      });
    } catch (err) {
      Logger.error(`Error creating suggestion: ${err.message}`, err.stack);
      Sentry.captureException(err);

      const statusCode = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(err.message || 'Failed to create suggestion', statusCode);
    }
  }

  @Get()
  @SetMetadata('apiIdentifier', apiIdentifiers.order)
  @UseGuards(JWTGuard)
  async getAllSuggestions(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req['user'].sub;
      const suggestions = await this.suggestionsService.getAllSuggestions(userId);

      return res.status(HttpStatus.OK).json({
        data: suggestions,
      });
    } catch (err) {
      Logger.error(`Error fetching suggestions: ${err.message}`, err.stack);
      Sentry.captureException(err);

      throw new HttpException('Failed to fetch suggestions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/vote')
  @SetMetadata('apiIdentifier', apiIdentifiers.order)
  @UseGuards(JWTGuard)
  async vote(
    @Param('id') id: string,
    @Body() dto: VoteDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req['user'].sub;
      Logger.log(`User ${userId} voting ${dto.voteType} on suggestion ${id}`);

      const suggestion = await this.suggestionsService.vote(id, userId, dto.voteType);

      return res.status(HttpStatus.OK).json({
        message: 'Vote recorded successfully!',
        data: suggestion,
      });
    } catch (err) {
      Logger.error(`Error voting: ${err.message}`, err.stack);
      Sentry.captureException(err);

      const statusCode = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(err.message || 'Failed to record vote', statusCode);
    }
  }

  @Get('has-suggested')
  @SetMetadata('apiIdentifier', apiIdentifiers.order)
  @UseGuards(JWTGuard)
  async hasUserSuggested(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req['user'].sub;
      const hasSuggested = await this.suggestionsService.hasUserSuggested(userId);

      return res.status(HttpStatus.OK).json({
        hasSuggested,
      });
    } catch (err) {
      Logger.error(`Error checking suggestion status: ${err.message}`, err.stack);
      Sentry.captureException(err);

      throw new HttpException('Failed to check suggestion status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
