/**
 * Task 0.1 — EAS + Base Sepolia attestation pre-spike
 *
 * One-shot script that proves the full chain:
 *   ethers Wallet -> EAS SDK -> Base Sepolia tx -> on-chain attestation
 *
 * Usage:  pnpm spike:eas
 *
 * Reads:  .env.local
 *   LEDGERLINE_ATTESTER_PK  (NEVER logged — only public address printed)
 *   EAS_CONTRACT_ADDRESS    (Base Sepolia EAS predeploy = 0x...0021)
 *   BASE_SEPOLIA_RPC_URL    (https://sepolia.base.org)
 *   EAS_SCHEMA_UID          (already-registered schema for DR-1)
 *
 * Schema fields:
 *   bytes32 merkleRoot, uint64 leafCount, string schemaVersion,
 *   string tenantSlug,  uint64 batchTimestamp
 */

import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'node:path';

// Load env from .env.local at repo root (cwd when invoked via `pnpm spike:eas`).
dotenvConfig({ path: resolve(process.cwd(), '.env.local'), override: true });

import {
  EAS,
  SchemaEncoder,
  SchemaRegistry,
} from '@ethereum-attestation-service/eas-sdk';
import {
  Contract,
  JsonRpcProvider,
  Wallet,
  ZeroAddress,
  formatEther,
} from 'ethers';

// Minimal EAS ABI for raw round-trip read. The EAS SDK's getAttestation has a
// known issue where the attached typechain factory in this version returns a
// decoded result that surfaces as zeros for top-level fields when called via
// .connect(wallet); calling getAttestation directly through ethers.Contract
// with the canonical ABI is reliable.
const EAS_READ_ABI = [
  'function getAttestation(bytes32 uid) view returns (tuple(bytes32 uid, bytes32 schema, uint64 time, uint64 expirationTime, uint64 revocationTime, bytes32 refUID, address recipient, address attester, bool revocable, bytes data))',
];

// Base Sepolia SchemaRegistry predeploy (sibling of EAS at ...0021).
const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020';

const REQUIRED_ENV = [
  'LEDGERLINE_ATTESTER_PK',
  'EAS_CONTRACT_ADDRESS',
  'BASE_SEPOLIA_RPC_URL',
  'EAS_SCHEMA_UID',
] as const;

function requireEnv(): {
  attesterPk: string;
  easAddress: string;
  rpcUrl: string;
  schemaUid: string;
} {
  for (const k of REQUIRED_ENV) {
    if (!process.env[k]) {
      throw new Error(`Missing required env var in .env.local: ${k}`);
    }
  }
  return {
    attesterPk: process.env.LEDGERLINE_ATTESTER_PK!,
    easAddress: process.env.EAS_CONTRACT_ADDRESS!,
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL!,
    schemaUid: process.env.EAS_SCHEMA_UID!,
  };
}

async function main(): Promise<void> {
  const env = requireEnv();

  const provider = new JsonRpcProvider(env.rpcUrl);
  const wallet = new Wallet(env.attesterPk, provider);

  // Sanity: confirm we are on Base Sepolia (chainId 84532).
  const network = await provider.getNetwork();
  console.log('Network:', { name: network.name, chainId: network.chainId.toString() });
  if (network.chainId !== 84532n) {
    throw new Error(
      `Expected Base Sepolia (chainId 84532), got ${network.chainId.toString()}`,
    );
  }

  console.log('Attester address:', wallet.address);

  // Step 1: balance check.
  const balance = await provider.getBalance(wallet.address);
  const balanceEth = formatEther(balance);
  console.log('Balance:', `${balanceEth} ETH`, `(${balance.toString()} wei)`);
  if (balance === 0n) {
    throw new Error(
      `Wallet ${wallet.address} has 0 balance on Base Sepolia.\n` +
        'Get testnet ETH from one of:\n' +
        '  - https://portal.cdp.coinbase.com/products/faucet\n' +
        '  - https://www.alchemy.com/faucets/base-sepolia\n',
    );
  }

  // Step 2: verify schema exists on chain.
  const registry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  registry.connect(provider);
  const schemaRecord = await registry.getSchema({ uid: env.schemaUid });
  if (!schemaRecord || schemaRecord.uid.toLowerCase() !== env.schemaUid.toLowerCase()) {
    throw new Error(
      `Schema UID ${env.schemaUid} not found in SchemaRegistry at ${SCHEMA_REGISTRY_ADDRESS}.`,
    );
  }
  console.log('Schema verified:');
  console.log('  uid:       ', schemaRecord.uid);
  console.log('  schema:    ', schemaRecord.schema);
  console.log('  resolver:  ', schemaRecord.resolver);
  console.log('  revocable: ', schemaRecord.revocable);

  // Step 3: encode payload per registered schema.
  const encoder = new SchemaEncoder(
    'bytes32 merkleRoot,uint64 leafCount,string schemaVersion,string tenantSlug,uint64 batchTimestamp',
  );
  const fakeMerkleRoot = `0x${'11'.repeat(32)}`;
  const batchTimestamp = BigInt(Math.floor(Date.now() / 1000));
  const encoded = encoder.encodeData([
    { name: 'merkleRoot', value: fakeMerkleRoot, type: 'bytes32' },
    { name: 'leafCount', value: 1n, type: 'uint64' },
    { name: 'schemaVersion', value: 'dr-1', type: 'string' },
    { name: 'tenantSlug', value: 'spike-demo', type: 'string' },
    { name: 'batchTimestamp', value: batchTimestamp, type: 'uint64' },
  ]);
  console.log('Encoded payload:');
  console.log('  merkleRoot:    ', fakeMerkleRoot);
  console.log('  leafCount:     ', '1');
  console.log('  schemaVersion: ', 'dr-1');
  console.log('  tenantSlug:    ', 'spike-demo');
  console.log('  batchTimestamp:', batchTimestamp.toString());

  // Step 4: submit attestation.
  const eas = new EAS(env.easAddress);
  eas.connect(wallet);

  console.log('\nSubmitting attestation transaction...');
  const tx = await eas.attest({
    schema: env.schemaUid,
    data: {
      recipient: ZeroAddress,
      expirationTime: 0n,
      revocable: false,
      data: encoded,
    },
  });

  // Step 5: wait for confirmation + extract attestation UID.
  // Note: EAS SDK Transaction<T> only sends inside .wait() — the receipt
  // (and tx hash) become available afterwards on tx.receipt.
  const uid = await tx.wait();
  const txHash = tx.receipt?.hash ?? '(unknown)';
  const blockNumber = tx.receipt?.blockNumber ?? -1;
  const gasUsed = tx.receipt?.gasUsed?.toString() ?? '(unknown)';

  console.log('\n--- Attestation confirmed ---');
  console.log('Tx hash:        ', txHash);
  console.log('Block:          ', blockNumber);
  console.log('Gas used:       ', gasUsed);
  console.log('Attestation UID:', uid);
  console.log('EAS explorer:   ', `https://base-sepolia.easscan.org/attestation/view/${uid}`);
  console.log('Basescan tx:    ', `https://sepolia.basescan.org/tx/${txHash}`);

  // Step 6: round-trip read against the EAS contract via raw ethers.Contract.
  // We bypass the SDK's getAttestation here because eas-sdk@2.9's
  // typechain-decoded result surfaces top-level scalar fields as zeros when
  // invoked through .connect(wallet); the canonical ABI call is exact.
  //
  // We also retry with backoff: the public Base Sepolia RPC is load-balanced,
  // and an immediate-after-confirm read can hit a replica that has not yet
  // indexed the block. Production code in the attester package will use a
  // dedicated RPC + similar retry semantics.
  const easRead = new Contract(env.easAddress, EAS_READ_ABI, provider);
  const ZERO_BYTES32 =
    '0x0000000000000000000000000000000000000000000000000000000000000000';

  let fetched: {
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
  } | null = null;
  const MAX_ATTEMPTS = 6;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const candidate = await easRead.getAttestation(uid);
    if (candidate.uid.toLowerCase() !== ZERO_BYTES32) {
      fetched = candidate;
      console.log(`Round-trip: read on attempt ${attempt}/${MAX_ATTEMPTS}.`);
      break;
    }
    const delayMs = 500 * attempt;
    console.log(
      `Round-trip: replica lag (attempt ${attempt}/${MAX_ATTEMPTS}); waiting ${delayMs}ms...`,
    );
    await new Promise((r) => setTimeout(r, delayMs));
  }
  if (!fetched) {
    throw new Error(
      `Round-trip read returned zero UID after ${MAX_ATTEMPTS} attempts. ` +
        `Tx confirmed at block ${blockNumber}, UID ${uid}, but RPC has not indexed yet.`,
    );
  }

  console.log('\nRound-trip fetch (raw provider):');
  console.log('  uid:       ', fetched.uid);
  console.log('  schema:    ', fetched.schema);
  console.log('  attester:  ', fetched.attester);
  console.log('  recipient: ', fetched.recipient);
  console.log('  revocable: ', fetched.revocable);
  console.log('  time:      ', fetched.time.toString());

  if (fetched.uid.toLowerCase() !== uid.toLowerCase()) {
    throw new Error(`UID mismatch: expected ${uid}, got ${fetched.uid}`);
  }
  if (fetched.attester.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(
      `Attester mismatch: expected ${wallet.address}, got ${fetched.attester}`,
    );
  }
  if (fetched.schema.toLowerCase() !== env.schemaUid.toLowerCase()) {
    throw new Error(
      `Schema mismatch: expected ${env.schemaUid}, got ${fetched.schema}`,
    );
  }

  console.log('\nSPIKE OK — full chain verified end-to-end.');
}

main().catch((err: unknown) => {
  // Print error without leaking the private key, even if it leaked into a stack.
  const msg = err instanceof Error ? err.message : String(err);
  console.error('SPIKE FAILED:', msg);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});
