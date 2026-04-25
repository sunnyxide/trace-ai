/**
 * Hard-coded attestation UIDs for the demo `/verify?example=N` tabs.
 *
 * Populated by `scripts/seed/load-examples.ts` against the live demo tenant.
 * Until the seed runs, these point at the first spike attestation as a
 * placeholder so /verify is never empty.
 */

export const GOLDEN_ATTESTATION_UID =
  '0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6';

export const EXAMPLE_UIDS: Record<number, `0x${string}`> = {
  1: GOLDEN_ATTESTATION_UID,
  2: GOLDEN_ATTESTATION_UID,
  3: GOLDEN_ATTESTATION_UID,
  4: GOLDEN_ATTESTATION_UID,
  5: GOLDEN_ATTESTATION_UID,
  6: GOLDEN_ATTESTATION_UID,
  7: GOLDEN_ATTESTATION_UID,
} as const;

export const EAS_EXPLORER_BASE = 'https://base-sepolia.easscan.org/attestation/view';

export function explorerUrl(uid: `0x${string}`): string {
  return `${EAS_EXPLORER_BASE}/${uid}`;
}
