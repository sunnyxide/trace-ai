import { z } from 'zod';

const ConfigSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  LEDGERLINE_DEMO_MODE: z.enum(['0', '1']).optional().default('0'),
  DEMO_PII_GUARD: z.enum(['off', 'strict']).optional().default('strict'),
  CRON_SECRET: z.string().min(16).optional(),
  // Production-only secrets — must NOT be present in preview.
  LEDGERLINE_ATTESTER_PK: z
    .string()
    .regex(/^0x[a-f0-9]{64}$/)
    .optional(),
  EAS_SCHEMA_UID: z
    .string()
    .regex(/^0x[a-f0-9]{64}$/)
    .optional(),
  EAS_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  BASE_SEPOLIA_RPC_URL: z.string().url().optional(),
  OPERATOR_PK: z
    .string()
    .regex(/^0x[a-f0-9]{64}$/)
    .optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

let cached: Config | null = null;

/**
 * Resets the cached config. Test-only helper: production code should
 * never need to clear the cache.
 */
export function __resetConfigForTests(): void {
  cached = null;
}

export function loadConfig(): Config {
  if (cached) return cached;
  const parsed = ConfigSchema.parse(process.env);

  // Production-only PK guard (per security reviewer R8).
  // VERCEL_ENV is one of 'production' | 'preview' | 'development' on Vercel,
  // and undefined locally. Allow production + local dev (where it may be
  // intentionally configured); reject the var in preview or any other env
  // to prevent leakage of the production attester key.
  const env = process.env.VERCEL_ENV ?? 'development';
  if (
    env !== 'production' &&
    env !== 'development' &&
    parsed.LEDGERLINE_ATTESTER_PK
  ) {
    throw new Error(
      `LEDGERLINE_ATTESTER_PK must not be set in VERCEL_ENV=${env}. ` +
        `Scope this var to Production only in Vercel dashboard.`,
    );
  }
  cached = parsed;
  return parsed;
}

export function isDemoMode(): boolean {
  return loadConfig().LEDGERLINE_DEMO_MODE === '1';
}
