import { sha256 } from '@noble/hashes/sha2.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import type { DR1 } from './dr1';
import { canonicalJson } from './canonical';

/** SHA-256 of UTF-8 string; returns 0x-prefixed lowercase hex. */
export function sha256Hex(input: string): `0x${string}` {
  const bytes = new TextEncoder().encode(input);
  return `0x${bytesToHex(sha256(bytes))}`;
}

/** keccak256 of UTF-8 string; returns 0x-prefixed lowercase hex. */
export function keccak256Hex(input: string): `0x${string}` {
  const bytes = new TextEncoder().encode(input);
  return `0x${bytesToHex(keccak_256(bytes))}`;
}

/** Convenience: SHA-256 canonical hash of a DR-1 record (storage/index). */
export function canonicalHash(record: DR1): `0x${string}` {
  return sha256Hex(canonicalJson(record));
}

/** Convenience: keccak256 signing digest of a DR-1 record (EVM-native). */
export function signingDigest(record: DR1): `0x${string}` {
  return keccak256Hex(canonicalJson(record));
}
