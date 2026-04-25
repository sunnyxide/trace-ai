import type { Anchorer, AnchorReceipt, BatchMeta, Hex32 } from './types';

/**
 * OpenTimestamps (Bitcoin) anchorer — STUB only for prototype.
 *
 * Phase 2 implementation will integrate `opentimestamps-client` CLI via
 * `child_process` to compute a Bitcoin-anchored timestamp proof and persist
 * the .ots receipt file alongside the merkle root. This stub keeps the
 * Anchorer interface honest so the architecture diagram has actual code
 * to point at, without taking on the integration risk in a 9-day sprint.
 *
 * TODO(phase-2): integrate https://github.com/opentimestamps/opentimestamps-client
 */
export const OTSAnchorer: Anchorer = {
  name: 'bitcoin-ots',

  async anchor(_root: Hex32, _meta: BatchMeta): Promise<AnchorReceipt> {
    return {
      anchorer: 'bitcoin-ots',
      timestamp: new Date().toISOString(),
      stub: true,
    };
  },

  async verify(receipt: AnchorReceipt, _expectedRoot: Hex32): Promise<boolean> {
    // Stub anchorer trivially returns true; production must verify the
    // .ots proof against a Bitcoin block.
    return receipt.stub === true;
  },
};
