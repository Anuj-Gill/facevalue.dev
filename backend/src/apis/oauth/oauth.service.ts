import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from 'src/services/supabase.service';
import { OAuthRegisterDTO } from './oauth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/env.vars';
import { PrismaService } from 'src/services/prisma.service';
import axios from 'axios';

@Injectable()
export class OAuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly prisma: PrismaService,
  ) {}

  async registerUser(payload: OAuthRegisterDTO) {
    const { refreshToken, accessToken } = payload;

    const userMetaData = await this.jwtService.verifyAsync(accessToken, {
      secret: this.configService.get<string>('SUPABASE_JWT_SECRET'),
    });

    if (!userMetaData) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.upsert({
      where: {
        id: userMetaData.sub,
      },
      update: {
        refreshToken,
      },
      create: {
        id: userMetaData.sub,
        email: userMetaData.email,
        name: userMetaData.user_metadata.name,
        refreshToken,
        provider: userMetaData.app_metadata.provider,
        avatarUrl: userMetaData.user_metadata.avatar_url,
      },
    });
  }

  async refreshAccessToken(supabaseUserId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: supabaseUserId },
      select: { refreshToken: true, id: true },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('No refresh token found for user');
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    const response = await axios.post(
      `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
      {
        refresh_token: user.refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          apiKey: this.configService.get<string>('SUPABASE_ANON_KEY'),
        },
      },
    );

    if (response.status != 200) {
      throw new UnauthorizedException(
        'Failed to refresh token. Please login again.',
      );
    }

    if (
      response.data?.refresh_token &&
      response.data?.refresh_token !== user.refreshToken
    ) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: response.data?.refresh_token,
          updatedAt: new Date(),
        },
      });
    }

    return response.data?.access_token;
  }
}
