import {
  Controller,
  Get,
  Post,
  HttpStatus,
  SetMetadata,
  Header,
  HttpCode,
  HttpException,
  Query,
  Res,
  Req,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { apiIdentifiers } from 'src/auth/auth.config';
import { OAuthService } from './oauth.service';
import * as Sentry from '@sentry/nestjs';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/env.vars';
import { OAuthRegisterDTO } from './oauth.dto';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Post('register')
  @Header('Content-Type', 'application/json')
  @SetMetadata('apiIdentifier', apiIdentifiers.oauth_register)
  async registerUser(
    @Body() requestPayload: OAuthRegisterDTO,
    @Res() res: Response,
  ) {
    try {
      await this.oauthService.registerUser(requestPayload);

      res.cookie('access_token', requestPayload.accessToken);

      return res.status(HttpStatus.OK).json({
        message: 'Session setup successful',
      });
    } catch (err) {
      Sentry.captureException(err);

      throw new HttpException(
        'There was a problem processing your request. Please try again after some time.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
