# Ledgerline · Design System

**Aesthetic:** Forensic Instrument — financial-grade evidence document made for regulators.
**Mood:** sober, precise, architectural. Cold ink on dark vellum. Zero consumer-hype.
**Anti-tells (avoid AI slop):** no soft pastels, no balanced gradients, no decorative emoji, no purple/teal duo, no rounded-3xl cards floating on white, no Inter, no Space Grotesk.

---

## 1. Typography

| Role | Family | Weights | Notes |
|------|--------|---------|-------|
| Display | **Fraunces** (Google Fonts; variable, opsz 144) | 300, 400, 500, 600 | Editorial serif with slab feel at large sizes. Used for hero, section headlines, and document titles. Italic at section-eyebrow scale for subtle authority. |
| Body / UI / Code | **JetBrains Mono** (Google Fonts) | 300, 400, 500, 700 | Monospace primary face. All body copy, table data, hashes, labels, button text. Tabular figures by default. |
| Fallback | system-ui (display), monospace (code) | — | Print fallback |

**Why monospace as body face:** AI evidence is inherently character-level. Hashes, addresses, decision IDs, timestamps — every screen is dominated by string identifiers. Using mono as the body face makes those first-class citizens, not table-cell exceptions. It also signals "instrument," not "marketing site."

**Sizes (rem-based, 16px root):**
- Hero display: 4.5rem / 5rem line — Fraunces 400
- H1 section: 2.25rem / 2.625rem — Fraunces 400
- H2: 1.5rem / 1.875rem — Fraunces 500
- H3 / eyebrow: 0.75rem / 1rem — JetBrains Mono 500, letter-spacing 0.18em, uppercase
- Body: 0.9375rem / 1.5rem — JetBrains Mono 400
- Body small: 0.8125rem / 1.375rem — JetBrains Mono 400
- Caption / label: 0.6875rem / 1rem — JetBrains Mono 500, letter-spacing 0.12em, uppercase
- Hash / data: 0.8125rem — JetBrains Mono 400, never wrapped, ellipsis-truncated when needed

---

## 2. Color tokens

Background ladder is dark navy → near-black, with white as the highest-contrast text. **Two accent colors only**: ice (informational) and verified-green (binary "evidence holds"). Failure red is a maroon, not a stoplight red, to keep the financial register.

```css
:root {
  /* Backgrounds — darkest to lightest */
  --bg-base:    #08091F;  /* page background */
  --bg-surface: #0F1330;  /* cards, panels */
  --bg-elev:    #161B3D;  /* hovered / selected */
  --bg-rule:    #1E2761;  /* the brand navy itself, used for accents */

  /* Borders */
  --rule:       #232A50;  /* primary thin rule, 1px */
  --rule-faint: #14193A;  /* near-invisible separation */

  /* Text */
  --ink:        #F5F7FF;  /* primary white */
  --ink-mid:    #A8B0D9;  /* secondary text */
  --ink-low:    #6F77A0;  /* tertiary, captions */
  --ink-trace:  #4A5180;  /* placeholders, disabled */

  /* Accent */
  --ice:        #CADCFC;  /* informational accent — links, highlights */
  --ice-soft:   #5C6FAE;  /* dimmed link */

  /* Status */
  --verified:   #14B886;  /* dual-check ✓ */
  --pending:    #C8A24A;  /* batch pending — muted gold */
  --failed:     #B33A3A;  /* maroon, NOT bright red */

  /* Print (light theme override; see §8) */
  --print-bg:   #FFFFFF;
  --print-ink:  #0A0A14;
}
```

**Composition rule:** 70% bg-base / 20% bg-surface or bg-elev / 8% rules and dividers / 2% accent. Verified-green appears at most twice per screen (one badge, one status pill). Ice is for headlines + links only.

---

## 3. Layout & grid

- **Page max-width:** 1320px. Wider for dashboard data tables (no max).
- **Gutter:** 24px on small, 48px on lg.
- **Grid:** 12-col, 24px column-gap. We exploit asymmetry — wide left + narrow right rail with metadata.
- **Vertical rhythm:** 8px base, almost everything in multiples of 8.
- **Border-radius:** `0` for cards, `2px` for buttons and pills only. **Never** rounded-2xl; this is not a SaaS dashboard with soft edges.
- **Shadows:** none. We use 1px rules and bg-elev to separate layers, not blur.
- **Section dividers:** thin 1px `var(--rule)` horizontal lines, often spanning full bleed. Sometimes paired with eyebrow + serial-number marker (see §5).

---

## 4. Visual motifs

These five motifs appear across all screens. They give the product a recognizable signature.

### 4.1 Serial marker
Small evidence-style sequence label in the top-left of major sections. Pattern:
```
EXHIBIT  №  03 / 07
```
Renders as: `<eyebrow>EXHIBIT</eyebrow><spacer><tabular>№ 03 / 07</tabular>`. Ties the document metaphor together.

### 4.2 Hash plates
Hashes are NEVER plain text in body copy. They're framed in a one-pixel rule box with a label header:
```
┌─ ATTESTATION UID ─────────────────────────────────┐
│ 0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a │
│ 6f33c7ad2207419f6                                 │
└──────────────────────────────────────────────────┘
```
Labels are caption-size uppercase. Box border: `1px solid var(--rule)`. On hover/copy, the rule pulses to ice for 200ms.

### 4.3 Dual-check seal (the verify killer moment)
Two side-by-side panels, each with its own ✓ icon, label, and detail. Shows visually that **two independent parties** signed. Used on /verify and the print view.

```
┌──────── NOTARY ────────┐ ┌──────── AUTHOR ────────┐
│ ✓ Ledgerline anchored  │ │ ✓ Customer signed at   │
│   at block 40,677,426  │ │   2026-04-25 14:23:11Z │
│   tx 0x1ba49e53…       │ │   key 0x4eC5…0Bf2      │
└────────────────────────┘ └────────────────────────┘
```

### 4.4 Architectural blueprint background (hero only)
Subtle dotted grid (8px × 8px, 1px dot at 4% white opacity) layered behind hero copy. Conveys "structured engineering," not decoration.

### 4.5 Tabular monospaced data
All tables use `font-variant-numeric: tabular-nums`. Numbers right-align. Hashes truncate-middle at column boundaries. Hover row highlights with `bg-elev`, no animation on the row itself.

---

## 5. Components

### 5.1 Eyebrow

```
┌────────────┐
│ EXHIBIT    │  ← caption, uppercase, letter-spacing 0.18em
└────────────┘
```

CSS:
```css
.eyebrow {
  font: 500 0.6875rem/1 'JetBrains Mono', monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-low);
}
```

### 5.2 Button

Primary: white text, ice border, transparent fill. Hover: invert (ice fill, base text).
Secondary: ink-mid text, rule border. Hover: rule becomes ink-mid.
**No solid filled buttons by default.** Outlined only.

```css
.btn-primary {
  font: 500 0.875rem 'JetBrains Mono';
  letter-spacing: 0.05em;
  padding: 14px 28px;
  border: 1px solid var(--ice);
  color: var(--ice);
  background: transparent;
  text-transform: uppercase;
  transition: background 120ms, color 120ms;
}
.btn-primary:hover {
  background: var(--ice);
  color: var(--bg-base);
}
```

### 5.3 Pill / badge

```css
.pill {
  display: inline-flex; align-items: center;
  gap: 6px; padding: 4px 10px;
  border: 1px solid currentColor;
  font: 500 0.6875rem 'JetBrains Mono';
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.pill--verified { color: var(--verified); }
.pill--pending  { color: var(--pending);  }
.pill--failed   { color: var(--failed);   }
```

Preceded by a small unicode mark (✓, ◆, ✕) — never an emoji.

### 5.4 Table row

```css
.table {
  width: 100%;
  border-collapse: collapse;
  font: 400 0.8125rem 'JetBrains Mono';
}
.table thead th {
  border-bottom: 1px solid var(--rule);
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.6875rem;
  color: var(--ink-low);
}
.table tbody td {
  border-bottom: 1px solid var(--rule-faint);
  padding: 16px;
}
.table tbody tr:hover { background: var(--bg-elev); }
```

### 5.5 Hash plate

```css
.hash {
  border: 1px solid var(--rule);
  padding: 12px 16px;
  display: block;
}
.hash > .label {
  font: 500 0.625rem 'JetBrains Mono';
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-low);
  margin-bottom: 6px;
}
.hash > .value {
  font: 400 0.8125rem 'JetBrains Mono';
  color: var(--ink);
  word-break: break-all;
}
```

---

## 6. Motion (Framer fade-only, per D10)

- All entrance: `opacity 0 → 1` over 320ms with `cubic-bezier(0.2, 0, 0.1, 1)`.
- Stagger: 60ms between sibling elements on the hero (display 0ms, sub 60ms, eyebrow 120ms, CTA 180ms). One stagger-set per page.
- No scroll-trigger reveal animations. No parallax. No typing effect (a subtle exception: hero hash counter that ticks once after 800ms, single character cycle).
- Hover on links: 120ms underline animation from left (text-decoration-thickness with offset).
- **No bouncing, no spring, no scaled-up modal entrance.** This is a forensic instrument.

---

## 7. Iconography

Use [Lucide](https://lucide.dev) icons, stroke 1.25, size 16-20. No filled icons. No icons-as-decoration — every icon must denote a real action or state. No Material Symbols.

Allowed in v1:
- `check` — verification ✓
- `x` — failed
- `external-link` — easscan / explorer links
- `printer` — print to PDF
- `clipboard` — copy hash
- `arrow-down-right` — section transitions in the architecture diagram only
- `scan-line` — verify input area

**Banned:** any "AI/sparkle/wand," any heart, any star, any rounded-square frame, any 3D-rendered glyph.

---

## 8. Print mode (@media print)

When the user prints, the page transforms into a **light theme A4 forensic document**:

- Background → white. All text → `var(--print-ink)` (#0A0A14).
- Font sizes drop one step down.
- Hide: nav, sidebars, buttons, footer.
- Show: only the trace detail's evidence card, a stamped Ledgerline mark in the top-right corner, and a QR code at bottom-right linking to the public verify URL.
- Page break: avoid mid-card. One trace = one page.

CSS scaffold:

```css
@media print {
  :root { color-scheme: light; }
  body { background: var(--print-bg); color: var(--print-ink); }
  nav, aside, button, footer.global { display: none; }
  .print-stamp { display: block; position: fixed; top: 24px; right: 24px; }
  .print-qr    { display: block; position: fixed; bottom: 24px; right: 24px; }
}
```

---

## 9. Accessibility floor

- Contrast: ink (#F5F7FF) on bg-base (#08091F) ≈ 18.4:1, well over WCAG AAA.
- Focus rings: `outline: 2px solid var(--ice); outline-offset: 2px;` — never `outline: none` without replacement.
- Tab order follows reading order. Skip-to-content link in the layout.
- `prefers-reduced-motion`: disable the fade animations.

---

## 10. Korean text consideration

Pretendard is the de facto standard for Korean tech UIs. We use it as a fallback **only for Korean text**:

```css
:root {
  --font-display: 'Fraunces', 'Pretendard', system-ui;
  --font-body:    'JetBrains Mono', 'Pretendard', monospace;
}
```

For Korean text rendered in mono context (terminal / hash plate) — we accept that Pretendard isn't monospace. The Korean characters will be slightly wider, but legibility wins over strict monospacing for a small fraction of text.

---

## 11. File layout in repo

```
docs/design/
  DESIGN.md            ← this file (source of truth)
  landing.html         ← marketing landing
  verify.html          ← /verify public dual-check page
  dashboard.html       ← authenticated trace list + detail
  print-view.html      ← @media print preview (open and ⌘P)
  shared.css           ← tokens + components used by all 4 mockups
  shared.js            ← minimal JS for tab toggles in dashboard
```

All four HTML mockups load `shared.css` + `shared.js` from the same directory, plus Google Fonts CDN. **No build step.** Open any file directly in a browser to view.

---

## 12. What this design is not

- It is **not** a finalized design system to be built against verbatim. It's a clear aesthetic commitment with concrete tokens that future implementers (Task 2.1, 2.2, 3.1) can translate into shadcn/ui + Tailwind classes.
- It is **not** a brand identity. Logo, marketing photography, illustration — out of scope for the prototype.
- It is **not** going to win design awards. It's going to make a Korean financial-regulatory judge feel that this is a serious instrument, and a solo SMB CEO feel that this is a tool the auditor will recognize.
