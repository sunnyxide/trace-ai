import { describe, expect, it } from 'vitest';
import * as sdk from '../index';

describe('public SDK exports', () => {
  it('exposes the shipped first-party LLM wrappers only', () => {
    expect(typeof sdk.traceClaude).toBe('function');
    expect(typeof sdk.traceOpenAI).toBe('function');
    expect('traceGemini' in sdk).toBe(false);
  });
});
