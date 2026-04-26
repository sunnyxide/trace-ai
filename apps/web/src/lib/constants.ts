/**
 * Hard-coded attestation UIDs for the demo `/verify?example=N` tabs.
 *
 * Populated by `scripts/seed/load-examples.ts` against the live demo tenant.
 * Last refreshed: 2026-04-26T03:36:17.489Z
 */

export const GOLDEN_ATTESTATION_UID =
  '0xb5378604dc44a07ac3a816cb964c513020209d0278a2b390c34b603db8292fbc';

export const EXAMPLE_UIDS: Record<number, `0x${string}`> = {
  1: '0xb5378604dc44a07ac3a816cb964c513020209d0278a2b390c34b603db8292fbc',
  2: '0xb5378604dc44a07ac3a816cb964c513020209d0278a2b390c34b603db8292fbc',
  3: '0xb5378604dc44a07ac3a816cb964c513020209d0278a2b390c34b603db8292fbc',
  4: '0xb5378604dc44a07ac3a816cb964c513020209d0278a2b390c34b603db8292fbc',
  5: '0xb5378604dc44a07ac3a816cb964c513020209d0278a2b390c34b603db8292fbc',
  6: '0x9463723ad4e2446676b579895b5815aa53220d1823fd461d9f43229331e8a165',
  7: '0x9e0f4d12f3929dc3c55995cadb5dbf1ff607ebcee9a4fcc8b44e896167e125f5',
} as const;

export const EAS_EXPLORER_BASE = 'https://base-sepolia.easscan.org/attestation/view';

export function explorerUrl(uid: `0x${string}`): string {
  return `${EAS_EXPLORER_BASE}/${uid}`;
}
