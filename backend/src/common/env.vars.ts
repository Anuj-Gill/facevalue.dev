export interface EnvironmentVariables {
  ENVIRONMENT: string;
  DATABASE_URL: string;
  DATABASE_DIRECT_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_JWT_SECRET: string;
  CLIENT_URL: string;
  SENTRY_DSN: string;
  BACKEND_URL: string;
  BOT_API_KEY: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string
}