/**
 * INDIA GREEN GRID — SERVER ENVIRONMENT VALIDATION
 * 
 * Strict Zod validation for server-side environment variables.
 * Never expose sensitive credentials to the browser or client-side bundles.
 */

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Supabase persistence (optional - if omitted, memory/fallback engine runs safely)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // External Official API Keys
  DATA_GOV_IN_API_KEY: z.string().min(1).optional(),
  NCS_API_KEY: z.string().min(1).optional(),
  NCS_API_URL: z.string().url().optional(),
  // Cache and Freshness Settings
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(3600), // 1 hour default
  STALE_GRACE_PERIOD_SECONDS: z.coerce.number().int().positive().default(86400), // 24 hours
  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000), // 1 minute
});

export type ServerEnv = z.infer<typeof envSchema>;

let parsedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (parsedEnv) {
    return parsedEnv;
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = (result.error.issues || []).map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error(`[ServerEnv] Environment validation failed: ${errorDetails}`);
    // Return sensible defaults for resilience instead of crashing the server outright
    parsedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV || 'development',
    });
    return parsedEnv;
  }

  parsedEnv = result.data;
  return parsedEnv;
}
