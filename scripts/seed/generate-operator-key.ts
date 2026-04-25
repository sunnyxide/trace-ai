/**
 * One-shot helper: print a fresh secp256k1 keypair for the demo operator.
 *
 * Usage:
 *   pnpm tsx scripts/seed/generate-operator-key.ts
 *
 * The user pipes the printed `OPERATOR_PK=…` line into `.env.local`.
 * Address is printed for cross-checking against
 * `fixtures/golden-operator.address.txt` (committed) once seeded.
 *
 * NEVER commit the printed private key. The script does not write it
 * anywhere — stdout only.
 */

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

function main(): void {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  // We deliberately print to stdout only; never to a file.
  console.log('# Demo operator keypair (NEVER commit private key)');
  console.log(`# address: ${account.address}`);
  console.log(`OPERATOR_PK=${privateKey}`);
  console.log('');
  console.log(
    '# Next steps:\n' +
      '#   1. Append the OPERATOR_PK line to .env.local\n' +
      "#   2. Save the address to fixtures/golden-operator.address.txt and\n" +
      '#      fixtures/golden-operator.pubkey.hex (both are PUBLIC and committed)\n' +
      '#   3. Run scripts/seed/setup-demo-tenant.ts to provision tenants',
  );
}

main();
