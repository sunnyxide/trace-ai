import canonicalize from 'canonicalize';
import type { DR1 } from './dr1';

/**
 * Produces RFC 8785 canonical JSON of a DR-1 record, with two fields
 * EXCLUDED from canonicalization: operator_signature (the signature
 * cannot cover itself) and _meta (server-enriched, not authored).
 */
export function canonicalJson(record: DR1): string {
  const { operator_signature: _sig, _meta: _m, ...signable } = record;
  const out = canonicalize(signable);
  if (out === undefined) throw new Error('canonicalize returned undefined');
  return out;
}
