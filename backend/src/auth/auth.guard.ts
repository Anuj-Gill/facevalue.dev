import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { OAuthService } from 'src/apis/oauth/oauth.service';
import { EnvironmentVariables } from 'src/common/env.vars';

@Injectable()
export class JWTGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly oauthService: OAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('SUPABASE_JWT_SECRET'),
      });

      request['user'] = payload;
    } catch (error) {
      if (error.name === 'TokenExpireError') {
        try {
          const decoded = this.jwtService.decode(token) as any;

          if (!decoded || !decoded.sub) {
            throw new UnauthorizedException('Invalid token format');
          }

          // Get new access token using refresh token from database
          const newAccessToken = await this.oauthService.refreshAccessToken(
            decoded.sub,
          );

          // Set new cookie in response
          response.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: this.configService.get('ENVIRONMENT') === 'production',
            sameSite: 'strict',
            maxAge: 3600000, // 1 hour
            path: '/',
          });

          // Verify the new token and attach to request
          const newPayload = await this.jwtService.verifyAsync(newAccessToken, {
            secret: this.configService.get<string>('SUPABASE_JWT_SECRET'),
          });

          request['user'] = newPayload;

          console.log('Token refreshed successfully');
          return true;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new UnauthorizedException(
            'Session expired. Please login again.',
          );
        }
      }

      throw new UnauthorizedException('Invalid auth token');
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.access_token;
  }
}
