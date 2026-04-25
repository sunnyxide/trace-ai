/**
 * Sign one fixture with OPERATOR_PK and emit the resulting DR-1 record.
 *
 * Usage:
 *   pnpm tsx scripts/seed/sign-fixture.ts fixtures/example-1.json
 *   pnpm tsx scripts/seed/sign-fixture.ts fixtures/example-1.json --write
 *
 * Default: pretty-printed signed JSON to stdout.
 * `--write`: overwrites the input file in place. NOT used by the demo
 * seed flow (load-examples.ts signs in-memory) — provided as a debugging
 * aid for ad-hoc inspection of canonical hashes etc.
 */

import { config as dotenvConfig } from 'dotenv';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

dotenvConfig({ path: resolve(process.cwd(), '.env.local'), override: true });

import { signRecord } from './lib.js';

function loadOperatorPk(): string {
  const pk = process.env.OPERATOR_PK;
  if (!pk) {
    throw new Error(
      'OPERATOR_PK missing. Run scripts/seed/generate-operator-key.ts first ' +
        'and add the printed line to .env.local.',
    );
  }
  if (!/^0x[a-fA-F0-9]{64}$/.test(pk)) {
    throw new Error('OPERATOR_PK must be 0x-prefixed 32-byte hex');
  }
  return pk;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    throw new Error(
      'usage: tsx scripts/seed/sign-fixture.ts <fixture.json> [--write]',
    );
  }
  const [fixturePath, ...flags] = args;
  const write = flags.includes('--write');
  const pk = loadOperatorPk();

  const absPath = resolve(process.cwd(), fixturePath);
  const raw = JSON.parse(readFileSync(absPath, 'utf8'));
  const signed = await signRecord(raw, pk);
  const out = JSON.stringify(signed, null, 2);

  if (write) {
    writeFileSync(absPath, `${out}\n`);
    console.error(`wrote signed record to ${absPath}`);
  } else {
    console.log(out);
  }
}

main().catch((err: unknown) => {
  console.error('sign-fixture FAILED:', err instanceof Error ? err.message : err);
  process.exit(1);
});
