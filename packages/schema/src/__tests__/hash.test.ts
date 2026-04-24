import { describe, it, expect } from 'vitest';
import { sha256Hex, keccak256Hex, canonicalHash, signingDigest } from '../hash';
import type { DR1 } from '../dr1';

describe('hash utilities', () => {
  it('sha256Hex produces known vector for "abc"', () => {
    // SHA-256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
    expect(sha256Hex('abc')).toEqual('0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('keccak256Hex produces known vector for empty string', () => {
    // keccak256("") = c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470
    expect(keccak256Hex('')).toEqual('0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470');
  });

  it('canonicalHash and signingDigest are deterministic and differ', () => {
    const rec: DR1 = {
      decision_id: '00000000-0000-4000-8000-000000000000',
      timestamp: '2026-04-24T00:00:00.000Z',
      agent_id: 'a',
      decision_class: 'approve',
      inputs: { evidence_hashes: [`0x${'a'.repeat(64)}`] },
      llm_calls: [{
        provider: 'anthropic', model: 'm',
        prompt_hash: `0x${'b'.repeat(64)}`,
        response_hash: `0x${'c'.repeat(64)}`,
      }],
      selected: { output_hash: `0x${'d'.repeat(64)}` },
      rationale: { summary: 'ok', summary_hash: `0x${'e'.repeat(64)}` },
    };
    const h1 = canonicalHash(rec);
    const h2 = canonicalHash(rec);
    expect(h1).toEqual(h2);
    expect(h1).not.toEqual(signingDigest(rec));
  });
});
