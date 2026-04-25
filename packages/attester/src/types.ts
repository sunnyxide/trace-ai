/**
 * Anchorer interface and shared types.
 *
 * An Anchorer publishes a Merkle root + batch metadata to an external
 * trust source (e.g. Base Sepolia EAS, Bitcoin via OpenTimestamps) and
 * can later independently verify a previously produced receipt.
 */

export type Hex32 = `0x${string}`;
export type HexAddr = `0x${string}`;

export type BatchMeta = {
  /** Number of leaves in the Merkle tree (uint64). */
  leafCount: bigint;
  /** DR-1 version string. Currently 'dr-1'. */
  schemaVersion: string;
  /** Tenant slug at the time of anchoring. */
  tenantSlug: string;
  /** Unix seconds (uint64) at batch creation. */
  batchTimestamp: bigint;
};

export type AnchorReceipt = {
  /** Anchorer name, e.g. 'base-sepolia-eas' or 'bitcoin-ots'. */
  anchorer: string;
  /** Tx hash for chains that have one (Base, Bitcoin). Optional for stubs. */
  txHash?: Hex32;
  /** Attestation UID for EAS-style anchorers. */
  uid?: Hex32;
  /** Block height/number, anchorer-specific. */
  blockNumber?: bigint;
  /** ISO 8601 timestamp the receipt was finalized in our system. */
  timestamp: string;
  /** Public explorer URL for human verification. */
  explorerUrl?: string;
  /** True if this is a non-functional stub (e.g. OTS in prototype). */
  stub?: true;
  /** Free-form attempt count, useful for retry observability. */
  attemptCount?: number;
};

export interface Anchorer {
  readonly name: string;
  /**
   * Anchor a Merkle root with batch metadata to the underlying chain.
   * MUST be idempotent across retries when caller provides the same input
   * AND the previous attempt's tx is still in mempool/confirmed —
   * implementations are responsible for receipt re-fetch logic if they
   * support it.
   */
  anchor(root: Hex32, meta: BatchMeta): Promise<AnchorReceipt>;

  /**
   * Independently verify a previously produced receipt. For EAS, this means
   * fetching the attestation by UID and matching attester + schema +
   * merkleRoot.
   */
  verify(receipt: AnchorReceipt, expectedRoot: Hex32): Promise<boolean>;
}
