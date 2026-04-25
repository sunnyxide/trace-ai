/**
 * BaseEASAnchorer — production EAS anchorer for Base Sepolia.
 *
 * Design notes (carried over from the Task 0.1 spike, commit 13f2d38):
 *
 *  - Writes go through the EAS SDK (`EAS.attest`).
 *  - Reads bypass `eas.getAttestation()` because EAS SDK v2.9 has a known
 *    decoding bug after `eas.connect(wallet)` where top-level scalar fields
 *    return zero. We use a raw `ethers.Contract` with the canonical ABI.
 *  - The transaction hash is exposed on `tx.receipt.hash` (not `tx.tx.hash`)
 *    after `tx.wait()` resolves.
 *  - Public Base Sepolia RPCs are load-balanced; an immediate post-confirm
 *    read can hit a replica that has not yet indexed the block. We retry
 *    with a fixed exponential schedule (max 6 attempts).
 *
 * The class accepts factory functions for `provider`, `wallet`, `eas`,
 * `readContract`, and `schemaEncoder` so unit tests can inject mocks
 * without hooking `vi.mock` of ethers/EAS (which is fragile under ESM).
 */

import {
  EAS as RealEAS,
  SchemaEncoder as RealSchemaEncoder,
} from '@ethereum-attestation-service/eas-sdk';
import {
  Contract as RealContract,
  JsonRpcProvider as RealJsonRpcProvider,
  Wallet as RealWallet,
  ZeroAddress,
} from 'ethers';

import type { Anchorer, AnchorReceipt, BatchMeta, Hex32 } from './types';

/** Base Sepolia EAS predeploy. */
export const EAS_BASE_SEPOLIA_ADDRESS =
  '0x4200000000000000000000000000000000000021' as const;

/** DR-1 schema string registered on Base Sepolia (Task 0.1). */
export const EAS_SCHEMA_DEFINITION =
  'bytes32 merkleRoot,uint64 leafCount,string schemaVersion,string tenantSlug,uint64 batchTimestamp';

/** Minimal ABI fragment for the canonical read path (avoids SDK v2.9 bug). */
export const EAS_READ_ABI = [
  'function getAttestation(bytes32 uid) view returns ((bytes32 uid, bytes32 schema, uint64 time, uint64 expirationTime, uint64 revocationTime, bytes32 refUID, address recipient, address attester, bool revocable, bytes data))',
];

/** Verify-loop backoff schedule in ms — 6 attempts, never exceeding 3s. */
export const VERIFY_BACKOFF_MS: readonly number[] = [
  500, 1000, 2000, 3000, 3000, 3000,
] as const;

const ZERO_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const HEX_ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
const HEX32_RE = /^0x[a-fA-F0-9]{64}$/;
const PRIVATE_KEY_RE = /^0x[a-fA-F0-9]{64}$/;

export type BaseEASAnchorerConfig = {
  rpcUrl: string;
  privateKey: `0x${string}`;
  easContractAddress: `0x${string}`;
  schemaUid: `0x${string}`;
};

/**
 * Minimal structural types for what we use from ethers / EAS SDK. These
 * mirror the runtime objects exactly so injected test doubles compile.
 */
export type ProviderLike = unknown;
export type WalletLike = { address: string };
export type EASLike = {
  connect: (signer: WalletLike) => unknown;
  attest: (args: {
    schema: string;
    data: {
      recipient: string;
      expirationTime: bigint;
      revocable: boolean;
      data: string;
    };
  }) => Promise<TransactionLike>;
};
export type TransactionLike = {
  wait(): Promise<string>;
  receipt?: { hash?: string; blockNumber?: number | bigint } | null;
};
export type ReadContractLike = {
  getAttestation(uid: string): Promise<RawAttestation>;
};
export type RawAttestation = {
  uid: string;
  schema: string;
  time: bigint;
  expirationTime: bigint;
  revocationTime: bigint;
  refUID: string;
  recipient: string;
  attester: string;
  revocable: boolean;
  data: string;
};
export type SchemaEncoderLike = {
  encodeData(
    items: { name: string; type: string; value: unknown }[]
  ): string;
  decodeData(data: string): { name: string; value: { value: unknown } }[];
};

/** Factory hooks for unit-test injection. */
export type BaseEASAnchorerDeps = {
  makeProvider: (rpcUrl: string) => ProviderLike;
  makeWallet: (privateKey: string, provider: ProviderLike) => WalletLike;
  makeEAS: (address: string) => EASLike;
  makeReadContract: (
    address: string,
    abi: readonly string[],
    provider: ProviderLike
  ) => ReadContractLike;
  makeSchemaEncoder: (schema: string) => SchemaEncoderLike;
  /** Async sleep used by the verify retry loop. Override to skip waits in tests. */
  sleep: (ms: number) => Promise<void>;
};

const defaultDeps: BaseEASAnchorerDeps = {
  makeProvider: (rpcUrl) => new RealJsonRpcProvider(rpcUrl),
  makeWallet: (privateKey, provider) =>
    new RealWallet(privateKey, provider as ConstructorParameters<typeof RealWallet>[1]),
  makeEAS: (address) => new RealEAS(address) as unknown as EASLike,
  makeReadContract: (address, abi, provider) =>
    new RealContract(
      address,
      abi as string[],
      provider as ConstructorParameters<typeof RealContract>[2]
    ) as unknown as ReadContractLike,
  makeSchemaEncoder: (schema) =>
    new RealSchemaEncoder(schema) as unknown as SchemaEncoderLike,
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
};

function validateConfig(config: BaseEASAnchorerConfig): void {
  if (!config.rpcUrl || typeof config.rpcUrl !== 'string') {
    throw new Error('BaseEASAnchorer: rpcUrl is required');
  }
  if (!PRIVATE_KEY_RE.test(config.privateKey)) {
    throw new Error(
      'BaseEASAnchorer: privateKey must be a 0x-prefixed 32-byte hex string'
    );
  }
  if (!HEX_ADDR_RE.test(config.easContractAddress)) {
    throw new Error(
      'BaseEASAnchorer: easContractAddress must be a 0x-prefixed 20-byte hex address'
    );
  }
  if (!HEX32_RE.test(config.schemaUid)) {
    throw new Error(
      'BaseEASAnchorer: schemaUid must be a 0x-prefixed 32-byte hex string'
    );
  }
}

export class BaseEASAnchorer implements Anchorer {
  public readonly name = 'base-sepolia-eas';

  private readonly config: BaseEASAnchorerConfig;
  private readonly deps: BaseEASAnchorerDeps;

  // Lazy-initialized state.
  private _provider?: ProviderLike;
  private _wallet?: WalletLike;
  private _eas?: EASLike;
  private _readContract?: ReadContractLike;

  constructor(
    config: BaseEASAnchorerConfig,
    deps: Partial<BaseEASAnchorerDeps> = {}
  ) {
    validateConfig(config);
    this.config = config;
    this.deps = { ...defaultDeps, ...deps };
  }

  /** Lazily build provider on first access. */
  private get provider(): ProviderLike {
    if (!this._provider) {
      this._provider = this.deps.makeProvider(this.config.rpcUrl);
    }
    return this._provider;
  }

  /** Lazily build wallet on first access. */
  private get wallet(): WalletLike {
    if (!this._wallet) {
      this._wallet = this.deps.makeWallet(
        this.config.privateKey,
        this.provider
      );
    }
    return this._wallet;
  }

  /** Lazily build connected EAS client on first access. */
  private get eas(): EASLike {
    if (!this._eas) {
      const eas = this.deps.makeEAS(this.config.easContractAddress);
      eas.connect(this.wallet);
      this._eas = eas;
    }
    return this._eas;
  }

  /** Lazily build raw read contract on first access. */
  private get readContract(): ReadContractLike {
    if (!this._readContract) {
      this._readContract = this.deps.makeReadContract(
        this.config.easContractAddress,
        EAS_READ_ABI,
        this.provider
      );
    }
    return this._readContract;
  }

  /** Public attester address (no private-key access). */
  public get attesterAddress(): string {
    return this.wallet.address;
  }

  async anchor(root: Hex32, meta: BatchMeta): Promise<AnchorReceipt> {
    if (!HEX32_RE.test(root)) {
      throw new Error(
        `BaseEASAnchorer.anchor: root must be a 0x-prefixed 32-byte hex string`
      );
    }

    const encoder = this.deps.makeSchemaEncoder(EAS_SCHEMA_DEFINITION);
    const data = encoder.encodeData([
      { name: 'merkleRoot', type: 'bytes32', value: root },
      { name: 'leafCount', type: 'uint64', value: meta.leafCount },
      { name: 'schemaVersion', type: 'string', value: meta.schemaVersion },
      { name: 'tenantSlug', type: 'string', value: meta.tenantSlug },
      { name: 'batchTimestamp', type: 'uint64', value: meta.batchTimestamp },
    ]);

    let tx: TransactionLike;
    let uid: string;
    try {
      tx = await this.eas.attest({
        schema: this.config.schemaUid,
        data: {
          recipient: ZeroAddress,
          expirationTime: 0n,
          revocable: false,
          data,
        },
      });
      uid = await tx.wait();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // NOTE: do NOT attach the original error as `cause` — its serialized
      // form might include request bodies that contain signed-tx data. The
      // wallet address (public) and schema UID are safe to surface.
      throw new Error(
        `BaseEASAnchorer.anchor failed for attester ${this.wallet.address} ` +
          `schema ${this.config.schemaUid}: ${msg}`
      );
    }

    const txHash =
      typeof tx.receipt?.hash === 'string'
        ? (tx.receipt.hash as Hex32)
        : undefined;
    const blockNumber =
      typeof tx.receipt?.blockNumber === 'bigint'
        ? tx.receipt.blockNumber
        : typeof tx.receipt?.blockNumber === 'number'
        ? BigInt(tx.receipt.blockNumber)
        : undefined;

    return {
      anchorer: this.name,
      txHash,
      uid: uid as Hex32,
      blockNumber,
      timestamp: new Date().toISOString(),
      explorerUrl: `https://base-sepolia.easscan.org/attestation/view/${uid}`,
    };
  }

  async verify(receipt: AnchorReceipt, expectedRoot: Hex32): Promise<boolean> {
    if (!receipt.uid) return false;
    if (!HEX32_RE.test(expectedRoot)) return false;

    const expectedAttester = this.wallet.address.toLowerCase();
    const expectedSchema = this.config.schemaUid.toLowerCase();

    let attestation: RawAttestation | null = null;

    for (let attempt = 0; attempt < VERIFY_BACKOFF_MS.length; attempt++) {
      try {
        const candidate = await this.readContract.getAttestation(receipt.uid);
        if (
          candidate &&
          typeof candidate.uid === 'string' &&
          candidate.uid.toLowerCase() !== ZERO_BYTES32
        ) {
          attestation = candidate;
          break;
        }
      } catch {
        // Treat thrown errors identically to zero-UID — replica lag often
        // surfaces as a transient revert/timeout from the public RPC.
      }

      // If we didn't break, wait per the schedule (skip wait after last attempt).
      if (attempt < VERIFY_BACKOFF_MS.length - 1) {
        await this.deps.sleep(VERIFY_BACKOFF_MS[attempt]);
      }
    }

    if (!attestation) return false;

    if (attestation.attester.toLowerCase() !== expectedAttester) return false;
    if (attestation.schema.toLowerCase() !== expectedSchema) return false;

    let decoded: { name: string; value: { value: unknown } }[];
    try {
      const encoder = this.deps.makeSchemaEncoder(EAS_SCHEMA_DEFINITION);
      decoded = encoder.decodeData(attestation.data);
    } catch {
      return false;
    }

    const merkleRootField = decoded.find((d) => d.name === 'merkleRoot');
    if (!merkleRootField) return false;
    const inner = merkleRootField.value?.value;
    const decodedRoot =
      typeof inner === 'string' ? inner.toLowerCase() : undefined;
    if (!decodedRoot) return false;

    return decodedRoot === expectedRoot.toLowerCase();
  }
}
