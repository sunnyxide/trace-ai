/**
 * TDD tests for the testable seed-script library:
 *
 *   - signRecord: validates input → computes canonical signing digest →
 *     signs with secp256k1 → returns a fully-formed DR1 with operator_signature
 *     attached, and re-validates the result.
 *   - verifyRecordSignature: round-trips by recovering the signer.
 *
 * No network, no Supabase, no fs side effects. Hardcoded test PK ONLY.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  privateKeyToAccount,
  generatePrivateKey,
} from 'viem/accounts';
import { recoverAddress } from 'viem';
import { DR1Schema, signingDigest, type DR1 } from '@ledgerline/schema';

import { signRecord, verifyRecordSignature, addressFromPrivateKey } from '../lib';

// Deterministic test private key — NOT used in production. Generated once
// and frozen here so signatures across runs of this test are stable. The
// corresponding address is exposed below for assertions.
const TEST_PK =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const TEST_ADDRESS = privateKeyToAccount(TEST_PK).address;

const FIXTURES_DIR = resolve(__dirname, '..', '..', '..', 'fixtures');

function loadFixture(n: number): unknown {
  const raw = readFileSync(resolve(FIXTURES_DIR, `example-${n}.json`), 'utf8');
  return JSON.parse(raw);
}

describe('addressFromPrivateKey', () => {
  it('derives the expected address from a known PK', () => {
    expect(addressFromPrivateKey(TEST_PK)).toBe(TEST_ADDRESS);
  });

  it('rejects malformed private keys', () => {
    expect(() => addressFromPrivateKey('0xnope')).toThrow();
  });
});

describe('signRecord', () => {
  it('validates fixture against DR1Schema and produces a verifiable signature', async () => {
    const raw = loadFixture(1);

    // RED-path expectation: input must already be schema-valid.
    expect(() => DR1Schema.parse(raw)).not.toThrow();

    const signed = await signRecord(raw, TEST_PK);

    // Output is still schema-valid (operator_signature now present).
    expect(() => DR1Schema.parse(signed)).not.toThrow();
    expect(signed.operator_signature).toBeDefined();
    expect(signed.operator_signature?.scheme).toBe('ECDSA-secp256k1');
    expect(signed.operator_signature?.digest_algo).toBe('keccak256');
    expect(signed.operator_signature?.public_key.toLowerCase()).toBe(
      TEST_ADDRESS.toLowerCase(),
    );

    // Recover the signer from the digest + signature: must match TEST_ADDRESS.
    const digest = signingDigest(signed);
    const recovered = await recoverAddress({
      hash: digest,
      signature: signed.operator_signature!.signature as `0x${string}`,
    });
    expect(recovered.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
  });

  it('produces a deterministic signature across runs (same record + same key)', async () => {
    const raw = loadFixture(2);
    const a = await signRecord(raw, TEST_PK);
    const b = await signRecord(raw, TEST_PK);
    expect(a.operator_signature?.signature).toBe(b.operator_signature?.signature);
  });

  it('rejects records that fail DR1Schema (input validation guard)', async () => {
    const bad = { ...(loadFixture(1) as DR1), agent_id: '' }; // empty agent_id violates min(1)
    await expect(signRecord(bad, TEST_PK)).rejects.toThrow();
  });

  it('strips any pre-existing operator_signature before signing', async () => {
    const raw = loadFixture(3) as Record<string, unknown>;
    // attach a bogus signature to ensure it does not affect the digest
    const tampered = {
      ...raw,
      operator_signature: {
        scheme: 'ECDSA-secp256k1',
        public_key: '0x0000000000000000000000000000000000000000',
        signature: '0xdeadbeef',
        digest_algo: 'keccak256',
      },
    };
    const signed = await signRecord(tampered, TEST_PK);
    // The signature must still recover to TEST_ADDRESS — proof that the
    // digest was computed without the (bogus) inbound operator_signature.
    const recovered = await recoverAddress({
      hash: signingDigest(signed),
      signature: signed.operator_signature!.signature as `0x${string}`,
    });
    expect(recovered.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
  });
});

describe('verifyRecordSignature', () => {
  it('returns ok=true for a freshly signed record', async () => {
    const signed = await signRecord(loadFixture(4), TEST_PK);
    const result = await verifyRecordSignature(signed);
    expect(result.ok).toBe(true);
    expect(result.recovered?.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
  });

  it('returns ok=false when the signature was made by a different key', async () => {
    const signed = await signRecord(loadFixture(5), TEST_PK);
    // Pretend a different key claimed to sign — by replacing public_key only.
    const otherPk = generatePrivateKey();
    const otherAddr = privateKeyToAccount(otherPk).address;
    const tampered: DR1 = {
      ...signed,
      operator_signature: {
        ...signed.operator_signature!,
        public_key: otherAddr,
      },
    };
    const result = await verifyRecordSignature(tampered);
    expect(result.ok).toBe(false);
  });

  it('returns ok=false when the record body is mutated post-signing', async () => {
    const signed = await signRecord(loadFixture(6), TEST_PK);
    const mutated: DR1 = {
      ...signed,
      rationale: { ...signed.rationale, summary: 'tampered post-signing' },
    };
    const result = await verifyRecordSignature(mutated);
    expect(result.ok).toBe(false);
  });
});

describe('all fixtures parse against DR1Schema', () => {
  for (let n = 1; n <= 7; n++) {
    it(`fixtures/example-${n}.json is schema-valid`, () => {
      const raw = loadFixture(n);
      expect(() => DR1Schema.parse(raw)).not.toThrow();
    });
  }
});
