import Link from 'next/link';
import { privateKeyToAccount } from 'viem/accounts';
import { BaseEASAnchorer } from '@ledgerline/attester';
import { canonicalJson, sha256Hex } from '@ledgerline/schema';
import {
  verifyByDecisionId,
  type VerifyResult,
  type VerifierDeps,
} from '@/server/verifier';
import { supabaseAdmin } from '@/lib/supabase';
import { loadConfig } from '@/lib/config';
import { Tabs } from './_components/Tabs';
import { DualCheckSeal } from './_components/DualCheckSeal';
import { HashPlate } from './_components/HashPlate';
import { VerificationChain } from './_components/VerificationChain';
import { RecordHeader } from './_components/RecordHeader';
import { TryItYourself } from './_components/TryItYourself';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Seeded examples — keep in sync with scripts/seed/load-examples.ts
// ---------------------------------------------------------------------------

const EXAMPLE_DECISION_IDS: Record<number, string> = {
  1: '550e8400-e29b-41d4-a716-446655440001',
  2: '550e8400-e29b-41d4-a716-446655440002',
  3: '550e8400-e29b-41d4-a716-446655440003',
  4: '550e8400-e29b-41d4-a716-446655440004',
  5: '550e8400-e29b-41d4-a716-446655440005',
  6: '550e8400-e29b-41d4-a716-446655440006',
  7: '550e8400-e29b-41d4-a716-446655440007',
};

type ExampleSpec = {
  index: number;
  tenant: string;
  title: string;
  tier: 'SMB' | 'ENT';
};

const EXAMPLES: ExampleSpec[] = [
  { index: 1, tenant: 'Bloom Co.', title: 'CS REFUND', tier: 'SMB' },
  { index: 2, tenant: 'Bloom Co.', title: 'AD CLAIM REVIEW', tier: 'SMB' },
  { index: 3, tenant: 'Bloom Co.', title: 'INVOICE CLASSIFY', tier: 'SMB' },
  { index: 4, tenant: 'Bloom Co.', title: 'LABEL COPY', tier: 'SMB' },
  { index: 5, tenant: 'Bloom Co.', title: 'REORDER', tier: 'SMB' },
  { index: 6, tenant: 'KB Bank', title: 'LOAN APPROVE', tier: 'ENT' },
  { index: 7, tenant: 'Shinhan', title: 'FRAUD HOLD', tier: 'ENT' },
];

// ---------------------------------------------------------------------------
// Verifier deps factory (mirrors apps/web/src/app/api/v1/verify/route.ts).
// Cached at module scope; safe across requests in the Node runtime.
// ---------------------------------------------------------------------------

let cachedAnchorer: BaseEASAnchorer | null = null;
let cachedAttester: string | null = null;

function buildDeps(): VerifierDeps {
  const cfg = loadConfig();
  if (!cachedAnchorer) {
    if (
      !cfg.LEDGERLINE_ATTESTER_PK ||
      !cfg.EAS_SCHEMA_UID ||
      !cfg.EAS_CONTRACT_ADDRESS ||
      !cfg.BASE_SEPOLIA_RPC_URL
    ) {
      throw new Error(
        'verifier missing one of LEDGERLINE_ATTESTER_PK / EAS_SCHEMA_UID / EAS_CONTRACT_ADDRESS / BASE_SEPOLIA_RPC_URL',
      );
    }
    cachedAnchorer = new BaseEASAnchorer({
      rpcUrl: cfg.BASE_SEPOLIA_RPC_URL,
      privateKey: cfg.LEDGERLINE_ATTESTER_PK as `0x${string}`,
      easContractAddress: cfg.EAS_CONTRACT_ADDRESS as `0x${string}`,
      schemaUid: cfg.EAS_SCHEMA_UID as `0x${string}`,
    });
    cachedAttester = privateKeyToAccount(
      cfg.LEDGERLINE_ATTESTER_PK as `0x${string}`,
    ).address;
  }
  return {
    supabase: supabaseAdmin(),
    anchorer: cachedAnchorer,
    platformAttester: cachedAttester!,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SCHEMA_UID =
  '0xadedddd375ab7f7603e25c0f6dda36e95f5699efda7737e75e9e0cf7a470d7c7';

function parseExample(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(7, n));
}

function describeRecord(result: VerifyResult): string | null {
  const r = result.record;
  if (!r) return null;
  return `agent ${r.agent_id}, subject ${r.subject}, decision_class ${r.decision_class}, risk ${r.risk_level}.`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type SearchParams = Promise<{ example?: string; id?: string }>;

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const exampleN = parseExample(sp.example);
  const decisionId = exampleN
    ? EXAMPLE_DECISION_IDS[exampleN]
    : sp.id?.toLowerCase() ?? null;

  let result: VerifyResult | null = null;
  let serverError: string | null = null;
  if (decisionId) {
    try {
      result = await verifyByDecisionId(decisionId, buildDeps());
    } catch (e) {
      serverError = (e as Error).message;
      result = null;
    }
  }

  // Re-derive canonical_hash for display (verifier doesn't expose it).
  let canonicalHash: string | null = null;
  if (result?.record) {
    try {
      canonicalHash = sha256Hex(canonicalJson(result.record));
    } catch {
      canonicalHash = null;
    }
  }

  return (
    <>
      {/* Page header */}
      <section style={{ padding: '80px 0 48px' }}>
        <div className="ll-shell">
          <div className="ll-eyebrow">
            VERIFICATION RECEIPT{' '}
            <span className="ll-num">
              № {exampleN ? String(exampleN).padStart(2, '0') : '00'} / 07
            </span>
          </div>
          <h1
            className="ll-h1"
            style={{ marginTop: '16px', maxWidth: '820px' }}
          >
            Independent verification.
            <br />
            <em
              style={{ color: 'var(--ll-ice)', fontStyle: 'italic' }}
            >
              No party trusts a party.
            </em>
          </h1>
          <p
            className="ll-mono-body"
            style={{ marginTop: '20px', maxWidth: '720px' }}
          >
            Paste a Decision ID — or pick one of the seven seeded examples
            below. We re-compute the canonical hash, fetch the on-chain
            attestation from Base Sepolia, and check the operator signature.
            Two independent green checks must pass for the receipt to validate.
          </p>
        </div>
      </section>

      <hr className="ll-rule" />

      {/* Tabs */}
      <section style={{ padding: '32px 0 0' }}>
        <div className="ll-shell">
          <div
            className="ll-caption"
            style={{ marginBottom: '16px' }}
          >
            SEEDED EXAMPLES — CLICK TO LOAD
          </div>
          <Tabs examples={EXAMPLES} activeExample={exampleN} />
        </div>
      </section>

      {/* Loaded example header / placeholder */}
      {result ? (
        <ResultBlock
          result={result}
          example={exampleN ? EXAMPLES[exampleN - 1] : null}
          canonicalHash={canonicalHash}
          schemaUid={SCHEMA_UID}
        />
      ) : (
        <PlaceholderBlock serverError={serverError} hadInput={!!decisionId} />
      )}

      <hr className="ll-rule" />

      {/* Try it yourself */}
      <section style={{ padding: '96px 0' }}>
        <div className="ll-shell" style={{ maxWidth: '880px' }}>
          <div className="ll-eyebrow" style={{ marginBottom: '16px' }}>
            EXHIBIT <span className="ll-num">№ 06 / 07 · TRY-IT-YOURSELF</span>
          </div>
          <h2 className="ll-h1" style={{ marginBottom: '24px' }}>
            Verify a record we&apos;ve never seen.
          </h2>
          <p className="ll-mono-body" style={{ marginBottom: '32px' }}>
            Paste any DR-1 record JSON below — or use a Decision ID from your
            own Ledgerline tenant. The verification runs against our public
            read endpoint; no record content is persisted.
          </p>
          <TryItYourself />
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-blocks
// ---------------------------------------------------------------------------

function ResultBlock({
  result,
  example,
  canonicalHash,
  schemaUid,
}: {
  result: VerifyResult;
  example: ExampleSpec | null;
  canonicalHash: string | null;
  schemaUid: string;
}) {
  const eyebrow = example
    ? `DECISION RECORD · DR-1 · № ${String(example.index).padStart(2, '0')}`
    : 'DECISION RECORD · DR-1';

  const title = example
    ? `${example.tenant} — ${example.title}`
    : result.record?.agent_id ?? 'Decision record';

  const description = describeRecord(result);

  const status: { state: 'verified' | 'failed' | 'pending'; label: string } =
    result.verified
      ? { state: 'verified', label: 'ANCHORED · BASE SEPOLIA' }
      : { state: 'failed', label: result.reason ? 'NOT VERIFIED' : 'FAILED' };

  const merkleRoot = result.batch?.merkleRoot;
  const easUid = result.batch?.easUid;

  return (
    <>
      <section style={{ padding: '48px 0 0' }}>
        <div className="ll-shell">
          <RecordHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            status={status}
          />
        </div>
      </section>

      {/* Dual-check seal */}
      <section style={{ padding: '48px 0' }}>
        <div className="ll-shell">
          <DualCheckSeal
            checks={result.checks}
            attesterAddress={result.attesterAddress}
            operatorAddress={result.operatorAddress}
            batch={
              result.batch
                ? {
                    easUid: result.batch.easUid,
                    txHash: result.batch.txHash,
                    blockNumber: result.batch.blockNumber,
                    anchoredAt: result.batch.anchoredAt,
                  }
                : undefined
            }
            authorTimestamp={result.record?.timestamp}
          />

          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <p
              className="ll-mono-small"
              style={{ color: 'var(--ll-ink-low)', maxWidth: '720px' }}
            >
              Both seals verified independently. The notary uses a different
              key than the author by design — neither party can forge a record
              alone. Mathematically immutable: a tamper would require finding
              a SHA-256 collision <em>and</em> rewriting a confirmed Base block.
            </p>
            {result.batch?.explorerUrl ? (
              <a
                href={result.batch.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ll-btn"
              >
                Open on easscan ↗
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <hr className="ll-rule" />

      {/* Evidence detail panel */}
      <section style={{ padding: '96px 0' }}>
        <div
          className="ll-shell"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px',
          }}
        >
          {/* LEFT: hash plates */}
          <div>
            <div
              className="ll-eyebrow"
              style={{ marginBottom: '16px' }}
            >
              EVIDENCE · HASH PLATES
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {result.decisionId ? (
                <HashPlate
                  label="DECISION ID"
                  value={result.decisionId}
                />
              ) : null}
              {canonicalHash ? (
                <HashPlate
                  label="CANONICAL HASH (SHA-256, RFC 8785)"
                  value={canonicalHash}
                />
              ) : null}
              {merkleRoot ? (
                <HashPlate
                  label="MERKLE ROOT (KECCAK256, OZ STANDARD)"
                  value={merkleRoot}
                />
              ) : null}
              {easUid ? (
                <HashPlate
                  label="EAS ATTESTATION UID"
                  value={easUid}
                />
              ) : null}
              <HashPlate label="SCHEMA UID" value={schemaUid} />
            </div>
          </div>

          {/* RIGHT: chain of checks */}
          <div>
            <div
              className="ll-eyebrow"
              style={{ marginBottom: '16px' }}
            >
              VERIFICATION CHAIN
            </div>
            <VerificationChain checks={result.checks} easUid={easUid} />
            <div
              style={{
                marginTop: '28px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <Link href="/dashboard" className="ll-btn ll-btn-ghost">
                View full DR-1 record
              </Link>
              {result.batch?.basescanUrl ? (
                <a
                  href={result.batch.basescanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ll-btn ll-btn-ghost"
                >
                  Open tx on basescan ↗
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function PlaceholderBlock({
  serverError,
  hadInput,
}: {
  serverError: string | null;
  hadInput: boolean;
}) {
  return (
    <section style={{ padding: '64px 0 96px' }}>
      <div className="ll-shell">
        <div
          className="ll-eyebrow"
          style={{ color: 'var(--ll-pending)', marginBottom: '12px' }}
        >
          NO RECEIPT LOADED
        </div>
        <h2 className="ll-h2" style={{ marginBottom: '12px' }}>
          {hadInput
            ? 'We could not verify that record.'
            : 'Pick a seeded example above, or paste a Decision ID below.'}
        </h2>
        {serverError ? (
          <p
            className="ll-mono-small"
            style={{ color: 'var(--ll-failed)', maxWidth: '720px' }}
          >
            verifier error · {serverError}
          </p>
        ) : (
          <p
            className="ll-mono-small"
            style={{ color: 'var(--ll-ink-mid)', maxWidth: '720px' }}
          >
            The Try-It-Yourself form below accepts any decision_id UUID issued
            by Ledgerline, or a complete DR-1 JSON record paired with its EAS
            attestation UID.
          </p>
        )}
      </div>
    </section>
  );
}
