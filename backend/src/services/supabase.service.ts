import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { EnvironmentVariables } from "src/common/env.vars";


@Injectable()
export class SupabaseService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>
  ){}

  private createAdminClient(options?: Parameters<typeof createClient>[2]) {
    return createClient(
    this.configService.get<string>('SUPABASE_URL'),
    this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'),
    options
    )
  }

  private createUserClient(
    userJWT: string,
    options?: Parameters<typeof createClient>[2]
  ) {
    return createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY'),
      {
        ...options,
        global: {
          ...options?.global,
          headers: {
            ...options?.global?.headers,
            Authorization: `Bearer ${userJWT}`,
          },
        },
      }
    )
  }
}