import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const VALID_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-at-least-twenty-chars',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key-at-least-twenty-chars',
};

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Strip vars that bleed in from .env.local on the host
    for (const k of Object.keys(process.env)) {
      if (
        k.startsWith('LEDGERLINE_') ||
        k.startsWith('NEXT_PUBLIC_SUPABASE') ||
        k === 'SUPABASE_SERVICE_ROLE_KEY' ||
        k === 'DEMO_PII_GUARD' ||
        k === 'CRON_SECRET' ||
        k === 'EAS_SCHEMA_UID' ||
        k === 'EAS_CONTRACT_ADDRESS' ||
        k === 'BASE_SEPOLIA_RPC_URL' ||
        k === 'OPERATOR_PK' ||
        k === 'VERCEL_ENV'
      ) {
        delete process.env[k];
      }
    }
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('parses valid env and returns defaults for optional fields', async () => {
    Object.assign(process.env, VALID_ENV);
    const { loadConfig } = await import('../config');
    const cfg = loadConfig();
    expect(cfg.NEXT_PUBLIC_SUPABASE_URL).toBe(VALID_ENV.NEXT_PUBLIC_SUPABASE_URL);
    expect(cfg.LEDGERLINE_DEMO_MODE).toBe('0');
    expect(cfg.DEMO_PII_GUARD).toBe('strict');
  });

  it('throws when required env is missing', async () => {
    // No vars set
    const { loadConfig } = await import('../config');
    expect(() => loadConfig()).toThrow();
  });

  it('throws when LEDGERLINE_ATTESTER_PK is set in VERCEL_ENV=preview', async () => {
    Object.assign(process.env, VALID_ENV);
    process.env.VERCEL_ENV = 'preview';
    process.env.LEDGERLINE_ATTESTER_PK =
      '0x' + 'a'.repeat(64);
    const { loadConfig } = await import('../config');
    expect(() => loadConfig()).toThrow(/LEDGERLINE_ATTESTER_PK must not be set/);
  });

  it('allows LEDGERLINE_ATTESTER_PK in VERCEL_ENV=production', async () => {
    Object.assign(process.env, VALID_ENV);
    process.env.VERCEL_ENV = 'production';
    process.env.LEDGERLINE_ATTESTER_PK = '0x' + 'a'.repeat(64);
    const { loadConfig } = await import('../config');
    expect(() => loadConfig()).not.toThrow();
  });

  it('isDemoMode reflects LEDGERLINE_DEMO_MODE=1', async () => {
    Object.assign(process.env, VALID_ENV);
    process.env.LEDGERLINE_DEMO_MODE = '1';
    const { isDemoMode } = await import('../config');
    expect(isDemoMode()).toBe(true);
  });

  it('isDemoMode false when LEDGERLINE_DEMO_MODE=0', async () => {
    Object.assign(process.env, VALID_ENV);
    process.env.LEDGERLINE_DEMO_MODE = '0';
    const { isDemoMode } = await import('../config');
    expect(isDemoMode()).toBe(false);
  });
});
