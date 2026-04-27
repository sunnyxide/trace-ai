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
import { ScenarioSimulator } from './_components/ScenarioSimulator';
import { StorySection, EXAMPLE_STORIES } from './_components/StorySection';
import { WhatThisProves } from './_components/WhatThisProves';
import { EvidenceDetails } from './_components/EvidenceDetails';
import { OutcomeStrip } from './_components/OutcomeStrip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  domain: 'ecommerce' | 'finance';
};

const EXAMPLES: ExampleSpec[] = [
  { index: 1, tenant: 'Bloom Co.', title: 'CS REFUND',    domain: 'ecommerce' },
  { index: 2, tenant: 'Bloom Co.', title: 'AD CLAIM',     domain: 'ecommerce' },
  { index: 3, tenant: 'Bloom Co.', title: 'INVOICE',      domain: 'ecommerce' },
  { index: 4, tenant: 'Bloom Co.', title: 'LABEL COPY',   domain: 'ecommerce' },
  { index: 5, tenant: 'Bloom Co.', title: 'REORDER',      domain: 'ecommerce' },
  { index: 6, tenant: 'KB Bank',   title: 'LOAN APPROVE', domain: 'finance'   },
  { index: 7, tenant: 'Shinhan',   title: 'FRAUD HOLD',   domain: 'finance'   },
];

const SCHEMA_UID =
  '0xadedddd375ab7f7603e25c0f6dda36e95f5699efda7737e75e9e0cf7a470d7c7';

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

function parseExample(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(7, n));
}

type SearchParams = Promise<{ example?: string; id?: string }>;

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const exampleN = parseExample(sp.example) ?? (sp.id ? null : 1); // default to example 1
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

  let canonicalHash: string | null = null;
  if (result?.record) {
    try {
      canonicalHash = sha256Hex(canonicalJson(result.record));
    } catch {
      canonicalHash = null;
    }
  }

  const story = exampleN ? EXAMPLE_STORIES[exampleN] : null;
  const example = exampleN ? EXAMPLES[exampleN - 1] : null;

  return (
    <>
      {/* ============ HEADER ============ */}
      <section style={{ padding: '64px 0 36px' }}>
        <div className="ll-shell">
          <div className="ll-eyebrow ll-reveal" style={{ marginBottom: 14 }}>
            Public verifier
          </div>
          <h1 className="ll-display ll-reveal ll-reveal-d1" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}>
            See an AI decision{' '}
            <em>prove itself.</em>
          </h1>
          <p
            className="ll-lede ll-reveal ll-reveal-d2"
            style={{ marginTop: 22, maxWidth: 720, color: 'var(--ll-ink-2)' }}
          >
            Pick a real scenario below. Watch what the agent considered, what
            it chose, and what we&apos;d show a regulator or a judge if
            anyone challenged it. Every example is anchored on Base Sepolia
            right now — clickable, checkable, can&apos;t be edited.
          </p>
        </div>
      </section>

      {/* ============ TABS ============ */}
      <section style={{ padding: '8px 0 32px' }}>
        <div className="ll-shell">
          <Tabs examples={EXAMPLES} activeExample={exampleN} />
        </div>
      </section>

      {/* ============ HEADER CARD ============ */}
      {result && example && story ? (
        <>
          <section style={{ padding: '8px 0 32px' }}>
            <div className="ll-shell">
              <div
                className="ll-card-soft"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto',
                  gap: 24,
                  alignItems: 'center',
                  borderRadius: 20,
                }}
              >
                <div>
                  <div className="ll-caption" style={{ marginBottom: 8 }}>
                    {example.tenant} · scenario №{String(example.index).padStart(2, '0')}
                  </div>
                  <h2 className="ll-h2" style={{ marginBottom: 6 }}>
                    {capitalize(example.title.toLowerCase())} — verified live
                  </h2>
                  <p className="ll-small" style={{ color: 'var(--ll-mute)' }}>
                    {result.batch?.anchoredAt
                      ? `Anchored on Base Sepolia · ${new Date(
                          result.batch.anchoredAt,
                        ).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}`
                      : 'Pending anchor'}
                    {result.batch?.txHash
                      ? ` · tx ${result.batch.txHash.slice(0, 10)}…`
                      : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={result.verified ? 'll-pill ll-pill-ok' : 'll-pill ll-pill-fail'}>
                    {result.verified ? '✓ all 6 checks pass' : '✕ verification failed'}
                  </span>
                  {result.batch?.explorerUrl ? (
                    <a
                      href={result.batch.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ll-btn ll-btn-ghost"
                    >
                      Open on easscan ↗
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {/* ============ OUTCOME ============ */}
          <OutcomeStrip exampleN={example.index} tenant={example.tenant} />

          {/* ============ STORY ============ */}
          <StorySection exampleN={example.index} story={story} />

          {/* ============ WHAT THIS PROVES ============ */}
          <WhatThisProves
            attesterAddress={result.attesterAddress}
            operatorAddress={result.operatorAddress}
            anchoredAt={result.batch?.anchoredAt}
            txHash={result.batch?.txHash}
          />

          {/* ============ TECHNICAL EVIDENCE (collapsible) ============ */}
          <EvidenceDetails
            decisionId={result.decisionId}
            canonicalHash={canonicalHash}
            merkleRoot={result.batch?.merkleRoot}
            easUid={result.batch?.easUid}
            txHash={result.batch?.txHash}
            schemaUid={SCHEMA_UID}
            attesterAddress={result.attesterAddress}
            operatorAddress={result.operatorAddress}
            checks={result.checks}
            explorerUrl={result.batch?.explorerUrl}
            basescanUrl={result.batch?.basescanUrl}
          />
        </>
      ) : (
        <PlaceholderBlock serverError={serverError} hadInput={!!decisionId} />
      )}

      {/* ============ SCENARIO SIMULATOR ============ */}
      <ScenarioSimulator />

      {/* ============ NEXT STEP CTA ============ */}
      <section style={{ padding: '64px 0 96px' }}>
        <div className="ll-shell" style={{ maxWidth: 720, textAlign: 'center' }}>
          <div className="ll-eyebrow" style={{ marginBottom: 14 }}>
            Next
          </div>
          <h2 className="ll-h1">
            Want to put your own AI agent{' '}
            <em
              style={{
                fontFamily: 'var(--font-instrument-serif)',
                fontStyle: 'italic',
                color: 'var(--ll-brand)',
              }}
            >
              on the record?
            </em>
          </h2>
          <p className="ll-lede" style={{ marginTop: 14, marginBottom: 28 }}>
            One npm install. One SDK call. Every decision gets a permanent,
            independently verifiable receipt.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/#try" className="ll-btn">
              See the quickstart →
            </Link>
            <Link href="/#how" className="ll-btn ll-btn-ghost">
              How it works
            </Link>
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
    <section style={{ padding: '32px 0 64px' }}>
      <div className="ll-shell">
        <div className="ll-card" style={{ padding: 32, background: 'var(--ll-warn-soft)', borderColor: 'color-mix(in oklab, var(--ll-warn) 30%, transparent)' }}>
          <div
            className="ll-eyebrow"
            style={{ color: 'var(--ll-accent-deep)', marginBottom: 8 }}
          >
            No receipt loaded
          </div>
          <h2 className="ll-h2">
            {hadInput
              ? 'We could not verify that record.'
              : 'Pick a scenario above to see a live decision verified.'}
          </h2>
          {serverError ? (
            <p className="ll-small" style={{ color: 'var(--ll-fail)', marginTop: 12 }}>
              {serverError}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
