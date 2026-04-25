/**
 * One-shot: provision the three demo tenants and print fresh API keys.
 *
 *   - bloom-co        (ICP B — SMB DTC)
 *   - kb-bank         (ICP A — Financial Enterprise, Loan AI)
 *   - shinhan         (ICP A — Financial Enterprise, Fraud AI)
 *
 * Idempotent: existing tenants get a NEW api_key_hash (rotates the key).
 * The OPERATOR_PK address is recorded in `operator_public_key` for all
 * three tenants so the same demo key can sign for any of them.
 *
 * Output (stdout, copy into .env.local):
 *   LEDGERLINE_BLOOM_API_KEY=lgl_...
 *   LEDGERLINE_KB_API_KEY=lgl_...
 *   LEDGERLINE_SHINHAN_API_KEY=lgl_...
 *
 * Reads:
 *   .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *               OPERATOR_PK (used only to derive the public address).
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

dotenvConfig({ path: resolve(process.cwd(), '.env.local'), override: true });

import { addressFromPrivateKey } from './lib.js';

type TenantSpec = {
  slug: string;
  name: string;
  envKey: string; // e.g. LEDGERLINE_BLOOM_API_KEY
};

const TENANTS: TenantSpec[] = [
  {
    slug: 'bloom-co',
    name: 'Bloom Co. (ICP B — Solo SMB DTC)',
    envKey: 'LEDGERLINE_BLOOM_API_KEY',
  },
  {
    slug: 'kb-bank',
    name: 'KB Bank (ICP A — Loan AI demo)',
    envKey: 'LEDGERLINE_KB_API_KEY',
  },
  {
    slug: 'shinhan',
    name: 'Shinhan (ICP A — Fraud AI demo)',
    envKey: 'LEDGERLINE_SHINHAN_API_KEY',
  },
];

const KEY_PREFIX = 'lgl_live_';

function generateApiKey(): string {
  // 32 bytes of CSPRNG entropy → base64url (~43 chars), prefixed.
  const raw = randomBytes(32).toString('base64url');
  return `${KEY_PREFIX}${raw}`;
}

function loadEnv(): {
  supabaseUrl: string;
  serviceRoleKey: string;
  operatorAddress: string;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const operatorPk = process.env.OPERATOR_PK;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
    );
  }
  if (!operatorPk || !/^0x[a-fA-F0-9]{64}$/.test(operatorPk)) {
    throw new Error(
      'OPERATOR_PK missing or malformed. Run scripts/seed/generate-operator-key.ts.',
    );
  }
  return {
    supabaseUrl,
    serviceRoleKey,
    operatorAddress: addressFromPrivateKey(operatorPk),
  };
}

async function upsertTenant(
  client: SupabaseClient,
  spec: TenantSpec,
  apiKeyHash: string,
  operatorAddress: string,
): Promise<{ created: boolean }> {
  const existing = await client
    .from('tenants')
    .select('id')
    .eq('slug', spec.slug)
    .maybeSingle();

  if (existing.error) {
    throw new Error(
      `tenant lookup failed for ${spec.slug}: ${existing.error.message}`,
    );
  }

  if (existing.data) {
    const upd = await client
      .from('tenants')
      .update({
        api_key_hash: apiKeyHash,
        operator_public_key: operatorAddress,
        name: spec.name,
      })
      .eq('slug', spec.slug);
    if (upd.error) {
      throw new Error(`tenant update failed for ${spec.slug}: ${upd.error.message}`);
    }
    return { created: false };
  }

  const ins = await client.from('tenants').insert({
    slug: spec.slug,
    name: spec.name,
    api_key_hash: apiKeyHash,
    operator_public_key: operatorAddress,
  });
  if (ins.error) {
    throw new Error(`tenant insert failed for ${spec.slug}: ${ins.error.message}`);
  }
  return { created: true };
}

async function main(): Promise<void> {
  const env = loadEnv();
  const client: SupabaseClient = createClient(
    env.supabaseUrl,
    env.serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  console.error(`Operator address (committed): ${env.operatorAddress}`);
  console.error('');

  const results: Array<{ envKey: string; key: string; status: string }> = [];

  for (const spec of TENANTS) {
    const apiKey = generateApiKey();
    const apiKeyHash = await bcrypt.hash(apiKey, 10);
    const { created } = await upsertTenant(client, spec, apiKeyHash, env.operatorAddress);
    results.push({
      envKey: spec.envKey,
      key: apiKey,
      status: created ? 'created' : 'rotated existing key',
    });
    console.error(`  ${spec.slug.padEnd(12)} ${created ? 'created' : 'rotated existing key'}`);
  }

  console.error('');
  console.error('Copy these lines into .env.local:');
  console.error('---');
  for (const r of results) {
    console.log(`${r.envKey}=${r.key}`);
  }
  console.error('---');
}

main().catch((err: unknown) => {
  console.error(
    'setup-demo-tenant FAILED:',
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
