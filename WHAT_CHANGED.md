# What changed while you were away

Delete this file after you review.

## New: GET /api/v1/traces

`apps/web/src/app/api/v1/traces/route.ts` — new GET handler alongside the existing POST.

```
GET /api/v1/traces?limit=20&offset=0
Authorization: Bearer lgl_live_...
```

Returns paginated decision_records for the authenticated tenant, joined with
merkle_batches status. Response shape:
```json
{
  "records": [{ "decision_id", "canonical_hash", "received_at", "batch_status",
                "eas_uid", "verifier_url", ... }],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "tenant": { "id", "slug", "name" }
}
```

19 new tests added to `__tests__/route.test.ts`. All 50 tests pass.

---

## New: /account dashboard

`apps/web/src/app/(public)/account/` — tenant-specific dashboard.

**How it works:**
1. User visits `/account` — sees an API key input form
2. They paste their key (or it was auto-stored from `/signup`) — hits GET /api/v1/traces
3. Dashboard shows: tenant name + stats (total, anchored, pending) + paginated table
4. Table rows: when · decision ID · hash · status pill · verify/easscan link
5. "Sign out" clears localStorage

**Auto-login after signup:** `SignupForm.tsx` now stores the API key in
`localStorage('ll_api_key')` on success, so "Go to dashboard →" drops you
straight into your data without re-entering the key.

---

## New: traceOpenAI wrapper in SDK

`packages/sdk-ts/src/wrap-openai.ts` — mirrors `traceClaude` for OpenAI users.

```ts
import OpenAI from 'openai';
import { traceOpenAI } from '@vibingminers/sdk';

const openai = traceOpenAI(new OpenAI(), { agentId: 'my-agent' });
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  trace: { decisionClass: 'approve', rationale: 'within policy' },
});
```

Exported from `index.ts` as `traceOpenAI` + `TraceOpenAIOptions`.

---

## Nav updated

- "My decisions" → `/account` (secondary, hidden on mobile)
- "Admin" → `/dashboard` (secondary, hidden on mobile, internal use)

---

## Signup route

`dashboardUrl` now points to `/account` instead of `/dashboard`.

---

## Tests & types

- All 50 web tests pass (19 new GET tests)
- All 14 schema tests pass
- tsc --noEmit: zero errors on both web and sdk packages
- SDK build: ESM + CJS + .d.ts compile clean (dist 14.2 KB ESM, 15.8 KB CJS)

---

## What you should review before pushing

1. The `/account` page UX — open it in the browser and try with a real key
2. `GET /api/v1/traces` against a real Supabase instance (tests use mocks)
3. Add the new `account` route to the `(public)/layout.tsx` Nav `active` prop
   if the layout passes `active` down (check current layout)
4. npm publish is still blocked on your token — see PUBLISHING.md, you just
   need `npm config set //registry.npmjs.org/:_authToken="<granular-token>"`
   then the two publish commands.
