/**
 * Hard-coded attestation UIDs for the demo `/verify?example=N` tabs.
 *
 * Populated by `scripts/seed/load-examples.ts` against the live demo tenant.
 * Last refreshed: 2026-04-26T06:37:20.506Z
 */

export const GOLDEN_ATTESTATION_UID =
  '0x57bfef5602e47310cb6172b7f2c5f306d86d2805919832fa4e295ebc9bd41f3e';

export const EXAMPLE_UIDS: Record<number, `0x${string}`> = {
  1: '0x57bfef5602e47310cb6172b7f2c5f306d86d2805919832fa4e295ebc9bd41f3e',
  2: '0x57bfef5602e47310cb6172b7f2c5f306d86d2805919832fa4e295ebc9bd41f3e',
  3: '0x57bfef5602e47310cb6172b7f2c5f306d86d2805919832fa4e295ebc9bd41f3e',
  4: '0x57bfef5602e47310cb6172b7f2c5f306d86d2805919832fa4e295ebc9bd41f3e',
  5: '0x57bfef5602e47310cb6172b7f2c5f306d86d2805919832fa4e295ebc9bd41f3e',
  6: '0xc8c2ea6d24553926d6cf8cae3629001287d88031e99e84c1b420d01d027765dd',
  7: '0x9af9128bbd73a7612292e8e11528fd1a62f4c6615870973952b3320c46eb706c',
} as const;

export const EAS_EXPLORER_BASE = 'https://base-sepolia.easscan.org/attestation/view';

export function explorerUrl(uid: `0x${string}`): string {
  return `${EAS_EXPLORER_BASE}/${uid}`;
}
