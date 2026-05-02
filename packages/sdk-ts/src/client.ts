import type { DR1 } from '@vibingminers/schema';
import { signRecord, type PrivateKeyHex } from './sign';

export type ClientOptions = {
  /** API key. Defaults to `process.env.LEDGERLINE_API_KEY`. */
  apiKey?: string;
  /** Base URL of the trace.ai ingest. Defaults to `process.env.LEDGERLINE_BASE_URL` or the public production URL. */
  baseUrl?: string;
  /** Optional operator private key (hex). If supplied (or LEDGERLINE_OPERATOR_PK is set), records are signed before submission. */
  operatorPk?: PrivateKeyHex;
  /** Custom fetch implementation. Defaults to global fetch. */
  fetch?: typeof fetch;
};

export type SubmitResult = {
  decision_id: string;
  /** All accepted decision_ids when batching. */
  accepted: string[];
  /** Verifier URL for the submitted record (deep link to the public verifier UI). */
  verifierUrl: string;
};

export class LedgerlineError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
    this.name = 'LedgerlineError';
  }
}

const DEFAULT_BASE_URL = 'https://trace-ai-inky.vercel.app';

function readEnv(name: string): string | undefined {
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return g.process?.env?.[name];
}

/**
 * Client for the trace.ai ingest + verify endpoints. Submitting a record
 * with a configured operator key will auto-sign it (required when the
 * server runs in demo mode).
 *
 * Usage:
 *   const ledger = new LedgerlineClient();
 *   const { decision_id, verifierUrl } = await ledger.submit(record);
 */
export class LedgerlineClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly operatorPk?: PrivateKeyHex;
  private readonly fetchFn: typeof fetch;

  constructor(opts: ClientOptions = {}) {
    const apiKey = opts.apiKey ?? readEnv('LEDGERLINE_API_KEY');
    if (!apiKey) {
      throw new Error(
        'LedgerlineClient: missing apiKey. Pass it explicitly or set LEDGERLINE_API_KEY in your environment.',
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = (
      opts.baseUrl ??
      readEnv('LEDGERLINE_BASE_URL') ??
      DEFAULT_BASE_URL
    ).replace(/\/+$/, '');
    const pk = opts.operatorPk ?? (readEnv('LEDGERLINE_OPERATOR_PK') as PrivateKeyHex | undefined);
    if (pk) this.operatorPk = pk;
    if (opts.fetch) {
      this.fetchFn = opts.fetch;
    } else if (typeof fetch !== 'undefined') {
      this.fetchFn = fetch.bind(globalThis);
    } else {
      throw new Error(
        'LedgerlineClient: no global fetch available. Pass a fetch implementation via the `fetch` option (Node 18+ has it built in).',
      );
    }
  }

  async submit(record: DR1): Promise<SubmitResult> {
    const toSubmit = this.operatorPk ? await signRecord(record, this.operatorPk) : record;

    const res = await this.fetchFn(`${this.baseUrl}/api/v1/traces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(toSubmit),
    });

    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }

    if (!res.ok) {
      const msg =
        body && typeof body === 'object' && 'error' in body
          ? String((body as { error: unknown }).error)
          : `HTTP ${res.status}`;
      throw new LedgerlineError(res.status, `submit failed: ${msg}`, body);
    }

    const data = (body ?? {}) as {
      decision_ids?: string[];
      decision_id?: string;
      accepted?: string[];
    };
    const accepted: string[] =
      data.decision_ids ??
      data.accepted ??
      (data.decision_id ? [data.decision_id] : [toSubmit.decision_id]);
    const decisionId = accepted[0] ?? toSubmit.decision_id;

    return {
      decision_id: decisionId,
      accepted,
      verifierUrl: `${this.baseUrl}/verify?id=${encodeURIComponent(decisionId)}`,
    };
  }

  /** GET /api/v1/verify?decision_id=... — returns whatever JSON the server emits. */
  async verify(decisionId: string): Promise<unknown> {
    const url = `${this.baseUrl}/api/v1/verify?decision_id=${encodeURIComponent(decisionId)}`;
    const res = await this.fetchFn(url, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    if (!res.ok) {
      throw new LedgerlineError(res.status, `verify failed: HTTP ${res.status}`, body);
    }
    return body;
  }
}
