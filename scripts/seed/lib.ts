/**
 * Testable signing/canonicalization helpers for seed scripts.
 *
 * Pure functions ONLY — no fs, no network, no env reads. Validates inputs
 * with DR1Schema at every boundary and re-validates outputs so that any
 * fixture or runtime drift surfaces as a Zod error rather than a malformed
 * POST body.
 */

import { privateKeyToAccount } from 'viem/accounts';
import { recoverAddress, type Hex } from 'viem';
import {
  DR1Schema,
  signingDigest,
  type DR1,
} from '@vibingminers/schema';

export type PrivateKeyHex = `0x${string}`;
export type AddressHex = `0x${string}`;

/**
 * Returns the EVM address derived from a 32-byte secp256k1 private key.
 * Throws on malformed input (delegates to viem's validation).
 */
export function addressFromPrivateKey(privateKey: string): AddressHex {
  return privateKeyToAccount(privateKey as PrivateKeyHex).address;
}

/**
 * Signs a DR-1 record with the supplied private key. Returns a NEW record
 * (does not mutate input) with an `operator_signature` block attached.
 *
 * Steps:
 *   1. DR1Schema.parse(input)            — fail fast on malformed records
 *   2. Strip any pre-existing operator_signature / _meta — these are not
 *      part of the canonical body and the caller's intent is to (re)sign.
 *   3. canonicalJson + keccak256          — via @vibingminers/schema.signingDigest
 *   4. account.sign({ hash })            — secp256k1 sign via viem
 *   5. Attach operator_signature
 *   6. DR1Schema.parse(output)            — defence in depth
 */
export async function signRecord(
  input: unknown,
  privateKey: string,
): Promise<DR1> {
  const parsed = DR1Schema.parse(input);

  // Step 2: strip auth/meta fields before deriving the digest so the signing
  // covers only the authored body. canonicalJson already excludes these but
  // doing it explicitly here makes the intent obvious.
  const { operator_signature: _sig, _meta: _m, ...body } = parsed;
  const toSign: DR1 = body as DR1;

  const account = privateKeyToAccount(privateKey as PrivateKeyHex);
  const digest = signingDigest(toSign);
  const signature = await account.sign({ hash: digest as Hex });

  const signed: DR1 = {
    ...toSign,
    operator_signature: {
      scheme: 'ECDSA-secp256k1' as const,
      public_key: account.address,
      signature,
      digest_algo: 'keccak256' as const,
    },
  };

  // Defence in depth: confirm the resulting record still validates.
  return DR1Schema.parse(signed);
}

export type VerifyResult =
  | { ok: true; recovered: AddressHex }
  | { ok: false; reason: string; recovered?: AddressHex };

/**
 * Recovers the signer from a record's operator_signature and compares it
 * to the declared public_key. Mirrors the demo-mode check the ingest API
 * route performs at /api/v1/traces.
 */
export async function verifyRecordSignature(record: DR1): Promise<VerifyResult> {
  if (!record.operator_signature) {
    return { ok: false, reason: 'no operator_signature' };
  }
  try {
    const digest = signingDigest(record);
    const recovered = (await recoverAddress({
      hash: digest as Hex,
      signature: record.operator_signature.signature as Hex,
    })) as AddressHex;
    const declared = record.operator_signature.public_key.toLowerCase();
    if (recovered.toLowerCase() !== declared) {
      return {
        ok: false,
        reason: `recovered ${recovered} != declared ${declared}`,
        recovered,
      };
    }
    return { ok: true, recovered };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
