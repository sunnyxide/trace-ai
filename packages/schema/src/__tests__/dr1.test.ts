import { describe, it, expect } from 'vitest';
import { DR1Schema, DR1 } from '../dr1';

function validRecord(overrides: Partial<DR1> = {}): DR1 {
  return {
    decision_id: '00000000-0000-4000-8000-000000000000',
    timestamp: new Date().toISOString(),
    agent_id: 'loan-agent-v1',
    decision_class: 'approve',
    inputs: { evidence_hashes: [`0x${'a'.repeat(64)}`] },
    llm_calls: [{
      provider: 'anthropic',
      model: 'claude-opus-4-7',
      prompt_hash: `0x${'b'.repeat(64)}`,
      response_hash: `0x${'c'.repeat(64)}`,
    }],
    selected: { output_hash: `0x${'d'.repeat(64)}` },
    rationale: { summary: 'ok', summary_hash: `0x${'e'.repeat(64)}` },
    ...overrides,
  } as DR1;
}

describe('DR1Schema', () => {
  it('accepts a minimal valid record', () => {
    expect(() => DR1Schema.parse(validRecord())).not.toThrow();
  });

  it('accepts audit fields (subject, risk_level, policy_refs, human_in_the_loop)', () => {
    expect(() => DR1Schema.parse(validRecord({
      subject: 'applicant-7f3e',
      risk_level: 'medium',
      policy_refs: ['policy://lending-v3.2'],
      human_in_the_loop: { reviewer_id: 'u42', reviewed_at: new Date().toISOString() },
    }))).not.toThrow();
  });

  it('rejects invalid hex in evidence_hashes', () => {
    const bad = validRecord({
      inputs: { evidence_hashes: [`0xGG${'a'.repeat(62)}`] },
    });
    expect(() => DR1Schema.parse(bad)).toThrow(/evidence_hashes/);
  });

  it('rejects hash that is not 0x-prefixed lowercase 64-hex', () => {
    const bad = validRecord({
      inputs: { evidence_hashes: [`0x${'A'.repeat(64)}`] }, // uppercase
    });
    expect(() => DR1Schema.parse(bad)).toThrow();
  });

  it('rejects empty llm_calls array', () => {
    const bad = validRecord({ llm_calls: [] });
    expect(() => DR1Schema.parse(bad)).toThrow();
  });

  it('rejects invalid decision_class enum', () => {
    const bad = { ...validRecord(), decision_class: 'maybe' };
    expect(() => DR1Schema.parse(bad)).toThrow();
  });

  it('accepts operator_signature with all required fields', () => {
    expect(() => DR1Schema.parse(validRecord({
      operator_signature: {
        scheme: 'ECDSA-secp256k1',
        public_key: '0xabc',
        signature: '0xdef',
        digest_algo: 'keccak256',
      },
    }))).not.toThrow();
  });

  it('rejects operator_signature with wrong scheme literal', () => {
    const bad = validRecord({
      operator_signature: {
        scheme: 'RSA' as any,
        public_key: '0xabc',
        signature: '0xdef',
        digest_algo: 'keccak256' as const,
      },
    });
    expect(() => DR1Schema.parse(bad)).toThrow();
  });
});
