import { describe, it, expect } from 'vitest';
import { canonicalJson } from '../canonical';
import type { DR1 } from '../dr1';

function base(): DR1 {
  return {
    decision_id: '00000000-0000-4000-8000-000000000000',
    timestamp: '2026-04-24T00:00:00.000Z',
    agent_id: 'a',
    decision_class: 'approve',
    inputs: { evidence_hashes: [`0x${'a'.repeat(64)}`] },
    llm_calls: [{
      provider: 'anthropic',
      model: 'm',
      prompt_hash: `0x${'b'.repeat(64)}`,
      response_hash: `0x${'c'.repeat(64)}`,
    }],
    selected: { output_hash: `0x${'d'.repeat(64)}` },
    rationale: { summary: 'ok', summary_hash: `0x${'e'.repeat(64)}` },
  };
}

describe('canonicalJson', () => {
  it('produces identical output regardless of key order', () => {
    const a = base();
    const b = { ...base(), agent_id: base().agent_id }; // same data
    expect(canonicalJson(a)).toEqual(canonicalJson(b));
  });

  it('excludes operator_signature from canonicalization', () => {
    const withoutSig = base();
    const withSig: DR1 = {
      ...base(),
      operator_signature: {
        scheme: 'ECDSA-secp256k1',
        public_key: '0x',
        signature: '0xFFFF',
        digest_algo: 'keccak256',
      },
    };
    expect(canonicalJson(withoutSig)).toEqual(canonicalJson(withSig));
  });

  it('excludes _meta from canonicalization', () => {
    const withoutMeta = base();
    const withMeta: DR1 = {
      ...base(),
      _meta: {
        schema_version: 'dr-1',
        tenant_id: 'x',
        received_at: '2026-04-24T00:00:00.000Z',
        canonical_hash: `0x${'f'.repeat(64)}`,
      },
    };
    expect(canonicalJson(withoutMeta)).toEqual(canonicalJson(withMeta));
  });
});
