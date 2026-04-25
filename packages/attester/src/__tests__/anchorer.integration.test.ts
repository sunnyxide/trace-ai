/**
 * BaseEASAnchorer integration test — REAL Base Sepolia.
 *
 * Gated on env: only runs when `RUN_INTEGRATION=1`. The default unit-test
 * pass MUST NOT touch the network or spend testnet ETH. Trigger manually:
 *
 *   RUN_INTEGRATION=1 pnpm --filter @ledgerline/attester test
 *
 * Required env in `.env.local` at the repo root:
 *   LEDGERLINE_ATTESTER_PK   (32-byte hex, 0x-prefixed)
 *   EAS_CONTRACT_ADDRESS     (Base Sepolia EAS predeploy: 0x...0021)
 *   BASE_SEPOLIA_RPC_URL
 *   EAS_SCHEMA_UID           (32-byte hex, 0x-prefixed; pre-registered)
 *
 * NOTE: do not log or persist the private key. The anchorer never logs it,
 * and we never reference it in assertions.
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

import { BaseEASAnchorer } from '../base-eas';

// Load env from repo-root .env.local. Resolved from the package working
// directory because vitest cwd is `packages/attester` when invoked via
// `pnpm --filter`.
dotenvConfig({
  path: resolve(process.cwd(), '../..', '.env.local'),
  override: true,
});

const SHOULD_RUN = process.env.RUN_INTEGRATION === '1';

describe.skipIf(!SHOULD_RUN)(
  'BaseEASAnchorer — real Base Sepolia (RUN_INTEGRATION=1)',
  () => {
    it(
      'anchors a fake root and round-trip verifies',
      async () => {
        const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
        const privateKey = process.env.LEDGERLINE_ATTESTER_PK as
          | `0x${string}`
          | undefined;
        const easContractAddress = process.env.EAS_CONTRACT_ADDRESS as
          | `0x${string}`
          | undefined;
        const schemaUid = process.env.EAS_SCHEMA_UID as
          | `0x${string}`
          | undefined;

        if (!rpcUrl || !privateKey || !easContractAddress || !schemaUid) {
          throw new Error(
            'Integration test requires BASE_SEPOLIA_RPC_URL, ' +
              'LEDGERLINE_ATTESTER_PK, EAS_CONTRACT_ADDRESS, EAS_SCHEMA_UID ' +
              'in .env.local at the repo root.',
          );
        }

        const anchorer = new BaseEASAnchorer({
          rpcUrl,
          privateKey,
          easContractAddress,
          schemaUid,
        });

        const fakeRoot = ('0x' + '22'.repeat(32)) as `0x${string}`;
        const receipt = await anchorer.anchor(fakeRoot, {
          leafCount: 1n,
          schemaVersion: 'dr-1',
          tenantSlug: 'integration-test',
          batchTimestamp: BigInt(Math.floor(Date.now() / 1000)),
        });

        expect(receipt.anchorer).toBe('base-sepolia-eas');
        expect(receipt.uid).toMatch(/^0x[a-f0-9]{64}$/i);
        expect(receipt.txHash).toMatch(/^0x[a-f0-9]{64}$/i);
        expect(receipt.explorerUrl).toContain(receipt.uid as string);
        expect(receipt.blockNumber).toBeTypeOf('bigint');

        const ok = await anchorer.verify(receipt, fakeRoot);
        expect(ok).toBe(true);

        const wrong = await anchorer.verify(
          receipt,
          ('0x' + 'aa'.repeat(32)) as `0x${string}`,
        );
        expect(wrong).toBe(false);
      },
      120_000,
    );
  },
);
