# Changelog

## 0.1.1 — 2026-05-31

### Fixed
- **SDK no longer crashes under CommonJS `require()` on Node 18+/20/22.**
  Root cause: the transitive dependency `canonicalize@3.0.0` ships ESM-only
  (its `package.json` exposes only an `import` export, no `require`), so
  `require('@vibingminers/sdk')` — and any CommonJS consumer — failed at module
  load with `ERR_PACKAGE_PATH_NOT_EXPORTED`. ESM `import` was unaffected.
  Fix: pin `@vibingminers/schema` → `canonicalize@2.0.0` (CommonJS layout,
  works under both `require` and `import`). The canonical JSON output of v2.0.0
  is **byte-identical** to v3.0.0, so existing on-chain anchored records remain
  verifiable (hash continuity preserved).

### Affected packages
- `@vibingminers/schema` 0.1.0 → 0.1.1
- `@vibingminers/sdk` 0.1.0 → 0.1.1
