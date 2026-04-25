import { describe, it, expect, vi } from 'vitest';
import {
  BaseEASAnchorer,
  EAS_BASE_SEPOLIA_ADDRESS,
  VERIFY_BACKOFF_MS,
  type BaseEASAnchorerConfig,
  type BaseEASAnchorerDeps,
  type RawAttestation,
} from '../base-eas';
import { OTSAnchorer } from '../ots-stub';
import type { AnchorReceipt, Hex32 } from '../types';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const ATTESTER_ADDRESS = '0x4eC5A6876332EFc3d9991FFC42e06a78952C0Bf2';
const VALID_PK = ('0x' + 'aa'.repeat(32)) as `0x${string}`;
const VALID_SCHEMA_UID = ('0x' + 'cd'.repeat(32)) as `0x${string}`;
const ROOT_A = ('0x' + '11'.repeat(32)) as Hex32;
const ROOT_B = ('0x' + '22'.repeat(32)) as Hex32;
const FAKE_TX_HASH = '0x' + '99'.repeat(32);
const FAKE_UID = '0x' + 'ab'.repeat(32);

const validConfig: BaseEASAnchorerConfig = {
  rpcUrl: 'https://sepolia.base.org',
  privateKey: VALID_PK,
  easContractAddress: EAS_BASE_SEPOLIA_ADDRESS,
  schemaUid: VALID_SCHEMA_UID,
};

function makeDeps(overrides: Partial<BaseEASAnchorerDeps> = {}): BaseEASAnchorerDeps {
  return {
    makeProvider: vi.fn().mockReturnValue({}),
    makeWallet: vi.fn().mockReturnValue({ address: ATTESTER_ADDRESS }),
    makeEAS: vi.fn().mockReturnValue({
      connect: vi.fn(),
      attest: vi.fn(),
    }),
    makeReadContract: vi.fn().mockReturnValue({
      getAttestation: vi.fn(),
    }),
    makeSchemaEncoder: vi.fn().mockReturnValue({
      encodeData: vi.fn().mockReturnValue('0xENCODED'),
      decodeData: vi.fn().mockReturnValue([
        { name: 'merkleRoot', value: { value: ROOT_A } },
      ]),
    }),
    sleep: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeRawAttestation(over: Partial<RawAttestation> = {}): RawAttestation {
  return {
    uid: FAKE_UID,
    schema: VALID_SCHEMA_UID,
    time: 1n,
    expirationTime: 0n,
    revocationTime: 0n,
    refUID: '0x' + '00'.repeat(32),
    recipient: '0x' + '00'.repeat(20),
    attester: ATTESTER_ADDRESS,
    revocable: false,
    data: '0xRAWDATA',
    ...over,
  };
}

// ---------------------------------------------------------------------------
// OTSAnchorer
// ---------------------------------------------------------------------------

describe('OTSAnchorer', () => {
  it('anchor returns a stub receipt with the expected name', async () => {
    const receipt = await OTSAnchorer.anchor(ROOT_A, {
      leafCount: 1n,
      schemaVersion: 'dr-1',
      tenantSlug: 'unit-test',
      batchTimestamp: 1700000000n,
    });
    expect(receipt.anchorer).toBe('bitcoin-ots');
    expect(receipt.stub).toBe(true);
    expect(receipt.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('verify returns true for a stub receipt', async () => {
    const stubReceipt: AnchorReceipt = {
      anchorer: 'bitcoin-ots',
      timestamp: '2024-01-01T00:00:00.000Z',
      stub: true,
    };
    expect(await OTSAnchorer.verify(stubReceipt, ROOT_A)).toBe(true);
  });

  it('verify returns false for a non-stub receipt', async () => {
    const realReceipt: AnchorReceipt = {
      anchorer: 'bitcoin-ots',
      timestamp: '2024-01-01T00:00:00.000Z',
    };
    expect(await OTSAnchorer.verify(realReceipt, ROOT_A)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// BaseEASAnchorer — constructor validation
// ---------------------------------------------------------------------------

describe('BaseEASAnchorer constructor validation', () => {
  it('throws on missing 0x prefix in private key', () => {
    expect(
      () =>
        new BaseEASAnchorer({
          ...validConfig,
          privateKey: ('a'.repeat(64) as unknown) as `0x${string}`,
        })
    ).toThrow(/privateKey/);
  });

  it('throws on too-short private key', () => {
    expect(
      () =>
        new BaseEASAnchorer({
          ...validConfig,
          privateKey: '0xdeadbeef' as `0x${string}`,
        })
    ).toThrow(/privateKey/);
  });

  it('throws on invalid contract address', () => {
    expect(
      () =>
        new BaseEASAnchorer({
          ...validConfig,
          easContractAddress: '0xnotanaddress' as `0x${string}`,
        })
    ).toThrow(/easContractAddress/);
  });

  it('throws on invalid schema uid', () => {
    expect(
      () =>
        new BaseEASAnchorer({
          ...validConfig,
          schemaUid: '0xshort' as `0x${string}`,
        })
    ).toThrow(/schemaUid/);
  });

  it('throws on missing rpcUrl', () => {
    expect(
      () =>
        new BaseEASAnchorer({
          ...validConfig,
          rpcUrl: '',
        })
    ).toThrow(/rpcUrl/);
  });

  it('accepts a valid config', () => {
    expect(() => new BaseEASAnchorer(validConfig, makeDeps())).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// BaseEASAnchorer.anchor (mocked)
// ---------------------------------------------------------------------------

describe('BaseEASAnchorer.anchor', () => {
  it('returns a well-formed AnchorReceipt with mocked EAS', async () => {
    const fakeTx = {
      wait: vi.fn().mockResolvedValue(FAKE_UID),
      receipt: { hash: FAKE_TX_HASH, blockNumber: 12345 },
    };
    const easMock = {
      connect: vi.fn(),
      attest: vi.fn().mockResolvedValue(fakeTx),
    };
    const deps = makeDeps({
      makeEAS: vi.fn().mockReturnValue(easMock),
    });

    const anchorer = new BaseEASAnchorer(validConfig, deps);
    const receipt = await anchorer.anchor(ROOT_A, {
      leafCount: 3n,
      schemaVersion: 'dr-1',
      tenantSlug: 'demo',
      batchTimestamp: 1700000000n,
    });

    expect(receipt.anchorer).toBe('base-sepolia-eas');
    expect(receipt.uid).toBe(FAKE_UID);
    expect(receipt.txHash).toBe(FAKE_TX_HASH);
    expect(receipt.blockNumber).toBe(12345n);
    expect(receipt.explorerUrl).toBe(
      `https://base-sepolia.easscan.org/attestation/view/${FAKE_UID}`
    );
    expect(receipt.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(easMock.connect).toHaveBeenCalledTimes(1);
    expect(easMock.attest).toHaveBeenCalledTimes(1);

    // Verify the schema/data envelope passed into eas.attest
    const callArg = easMock.attest.mock.calls[0]![0];
    expect(callArg.schema).toBe(VALID_SCHEMA_UID);
    expect(callArg.data.revocable).toBe(false);
    expect(callArg.data.expirationTime).toBe(0n);
    expect(callArg.data.data).toBe('0xENCODED');
  });

  it('throws on invalid root format', async () => {
    const anchorer = new BaseEASAnchorer(validConfig, makeDeps());
    await expect(
      anchorer.anchor('0xnothex' as Hex32, {
        leafCount: 1n,
        schemaVersion: 'dr-1',
        tenantSlug: 't',
        batchTimestamp: 0n,
      })
    ).rejects.toThrow(/root/);
  });

  it('wraps EAS attest errors with attester address and schema uid (no PK)', async () => {
    const easMock = {
      connect: vi.fn(),
      attest: vi.fn().mockRejectedValue(new Error('insufficient funds')),
    };
    const deps = makeDeps({ makeEAS: vi.fn().mockReturnValue(easMock) });
    const anchorer = new BaseEASAnchorer(validConfig, deps);

    await expect(
      anchorer.anchor(ROOT_A, {
        leafCount: 1n,
        schemaVersion: 'dr-1',
        tenantSlug: 't',
        batchTimestamp: 0n,
      })
    ).rejects.toThrow(/attester/);

    try {
      await anchorer.anchor(ROOT_A, {
        leafCount: 1n,
        schemaVersion: 'dr-1',
        tenantSlug: 't',
        batchTimestamp: 0n,
      });
    } catch (e) {
      const msg = (e as Error).message;
      expect(msg).toContain(ATTESTER_ADDRESS);
      expect(msg).toContain(VALID_SCHEMA_UID);
      // NEVER include the private key in the error message
      expect(msg).not.toContain(VALID_PK);
      // Also reject leaks of the un-prefixed PK body
      expect(msg).not.toContain(VALID_PK.slice(2));
    }
  });
});

// ---------------------------------------------------------------------------
// BaseEASAnchorer.verify (mocked)
// ---------------------------------------------------------------------------

describe('BaseEASAnchorer.verify', () => {
  const baseReceipt: AnchorReceipt = {
    anchorer: 'base-sepolia-eas',
    uid: FAKE_UID as Hex32,
    txHash: FAKE_TX_HASH as Hex32,
    blockNumber: 100n,
    timestamp: '2024-01-01T00:00:00.000Z',
    explorerUrl: `https://base-sepolia.easscan.org/attestation/view/${FAKE_UID}`,
  };

  it('returns true for matching attester + schema + merkleRoot', async () => {
    const deps = makeDeps({
      makeReadContract: vi.fn().mockReturnValue({
        getAttestation: vi.fn().mockResolvedValue(makeRawAttestation()),
      }),
    });
    const anchorer = new BaseEASAnchorer(validConfig, deps);
    expect(await anchorer.verify(baseReceipt, ROOT_A)).toBe(true);
  });

  it('returns false when decoded merkleRoot differs from expected', async () => {
    const deps = makeDeps({
      makeReadContract: vi.fn().mockReturnValue({
        getAttestation: vi.fn().mockResolvedValue(makeRawAttestation()),
      }),
      // Decoder returns ROOT_A; we ask to verify against ROOT_B
    });
    const anchorer = new BaseEASAnchorer(validConfig, deps);
    expect(await anchorer.verify(baseReceipt, ROOT_B)).toBe(false);
  });

  it('returns false when attester address differs', async () => {
    const deps = makeDeps({
      makeReadContract: vi.fn().mockReturnValue({
        getAttestation: vi.fn().mockResolvedValue(
          makeRawAttestation({
            attester: '0x' + '11'.repeat(20),
          })
        ),
      }),
    });
    const anchorer = new BaseEASAnchorer(validConfig, deps);
    expect(await anchorer.verify(baseReceipt, ROOT_A)).toBe(false);
  });

  it('returns false when schema differs', async () => {
    const deps = makeDeps({
      makeReadContract: vi.fn().mockReturnValue({
        getAttestation: vi.fn().mockResolvedValue(
          makeRawAttestation({
            schema: '0x' + 'ee'.repeat(32),
          })
        ),
      }),
    });
    const anchorer = new BaseEASAnchorer(validConfig, deps);
    expect(await anchorer.verify(baseReceipt, ROOT_A)).toBe(false);
  });

  it('returns false when uid is missing on the receipt', async () => {
    const anchorer = new BaseEASAnchorer(validConfig, makeDeps());
    const noUid: AnchorReceipt = { ...baseReceipt, uid: undefined };
    expect(await anchorer.verify(noUid, ROOT_A)).toBe(false);
  });

  it('retries past zero-UID and thrown errors then succeeds on the 3rd attempt', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const getAttestation = vi
      .fn()
      // Attempt 1: throws (transient RPC error)
      .mockRejectedValueOnce(new Error('replica lag'))
      // Attempt 2: zero-UID (block not indexed yet)
      .mockResolvedValueOnce(
        makeRawAttestation({ uid: '0x' + '00'.repeat(32) })
      )
      // Attempt 3: success
      .mockResolvedValueOnce(makeRawAttestation());

    const deps = makeDeps({
      makeReadContract: vi.fn().mockReturnValue({ getAttestation }),
      sleep,
    });

    const anchorer = new BaseEASAnchorer(validConfig, deps);
    expect(await anchorer.verify(baseReceipt, ROOT_A)).toBe(true);
    expect(getAttestation).toHaveBeenCalledTimes(3);
    // First two attempts failed → 2 sleeps with the spec backoff schedule
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenNthCalledWith(1, VERIFY_BACKOFF_MS[0]);
    expect(sleep).toHaveBeenNthCalledWith(2, VERIFY_BACKOFF_MS[1]);
  });

  it('returns false after exhausting all backoff attempts', async () => {
    const getAttestation = vi
      .fn()
      .mockResolvedValue(makeRawAttestation({ uid: '0x' + '00'.repeat(32) }));
    const sleep = vi.fn().mockResolvedValue(undefined);

    const deps = makeDeps({
      makeReadContract: vi.fn().mockReturnValue({ getAttestation }),
      sleep,
    });

    const anchorer = new BaseEASAnchorer(validConfig, deps);
    expect(await anchorer.verify(baseReceipt, ROOT_A)).toBe(false);
    expect(getAttestation).toHaveBeenCalledTimes(VERIFY_BACKOFF_MS.length);
    // sleep is called between attempts but not after the final one
    expect(sleep).toHaveBeenCalledTimes(VERIFY_BACKOFF_MS.length - 1);
  });
});
