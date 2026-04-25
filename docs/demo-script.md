# Ledgerline — 90-Second Demo Video Shooting Script

**Audience:** Dev A (camera/screen operator) on Day 8 production.
**Output artifacts:** `docs/demo.mp4`, `docs/demo.gif`, `docs/demo-thumb.jpg`, optional `docs/demo.webp`.
**Source attestation (real, on-chain):**
- UID `0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6`
- Tx `0x1ba49e53a087af2813cd42d4932b3c8e34afdb2c73d6ba979c860e154f1766c5`
- Block 40,677,426 — Base Sepolia
- EAS view: <https://base-sepolia.easscan.org/attestation/view/0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6>
- Schema: <https://base-sepolia.easscan.org/schema/view/0xadedddd375ab7f7603e25c0f6dda36e95f5699efda7737e75e9e0cf7a470d7c7>

**Story:** A Korean financial AI use case — fictional loan applicant `신청자 #7F3E`. No real names. No live wallet popup. We replay an already-confirmed attestation; the demo proves that the on-chain record is independently verifiable, not that we sign live.

**Hard cap:** 90 seconds. The landing-page hero `<video>` element will cut at 90s. Fix overshoot in the edit, never in the shoot.

> Reading order before shooting: `docs/decisions.md` D3, D4, D6, D10 → `docs/tech-spec.md` §1, §2, §9 (acceptance criteria). The video must visually back the "evidence, not verdict" thesis (D4) and the dual-evidence narrative (notary + author).

---

## Section 1 — Pre-Shoot Checklist

Confirm every line below before pressing **Record**. If any item fails, fix it; do not "shoot through it."

### 1.1 Server warmth and data
- [ ] Production Vercel URL is live and warm. Issue **one anonymous `GET /verify?example=1`** request from incognito 2 minutes before recording so the Next.js cold-start is gone.
- [ ] Golden attestation UID resolves on `base-sepolia.easscan.org` — manual click test from the production tab.
- [ ] `/verify?example=1` returns the **Ledgerline anchored ✓** and **Customer 0xabc… signed ✓** rows (both green). If either is red, **stop the shoot** and re-run `pnpm demo:loan` to regenerate the fixture.
- [ ] Local Postgres + Supabase mirror has the same record, in case WiFi flakes mid-shoot.

### 1.2 Display configuration
- [ ] Browser zoom = **110 %** in the active tab so 1080p text reads cleanly. Confirm with `⌘ +` twice from default.
- [ ] Screen resolution **1920×1080**. Use `Displays → Scaled → "Larger Text"` or run at native 1920×1080 if the lid panel supports it.
- [ ] macOS dock **auto-hidden** (`System Settings → Desktop & Dock → Automatically hide and show the Dock`). Menu bar may stay visible — that is acceptable.
- [ ] Notifications muted: `Focus → Do Not Disturb` ON.
- [ ] Slack, Mail, Discord, iMessage **quit** (not minimized).
- [ ] Wallpaper plain dark (`#0B1024` or solid black). No personal photos.

### 1.3 Tabs (open in this exact left-to-right order)
1. **Tab 1** — Localhost demo or Vercel landing page (the hero/dashboard live target).
2. **Tab 2** — `https://base-sepolia.easscan.org/attestation/view/0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6` (pre-loaded; **scroll target = the "Decoded Data" panel**).
3. **Tab 3 (optional)** — Terminal window, full-screen left half, tailing the ingest log: `pnpm --filter @ledgerline/web dev | grep --line-buffered '\[ingest\]\|\[anchor\]'`.

### 1.4 Code-editor look
- [ ] VSCode theme: **Default Dark+**. Font: **Cascadia Code 14 pt**. Sidebar collapsed.
- [ ] Open file: `examples/loan-approval.ts` showing the single import line on row 1.
- [ ] Word-wrap ON; line numbers visible.

### 1.5 Recording rig
- [ ] **QuickTime → File → New Screen Recording**, area = 1920×1080 around the centered window.
- [ ] **Mic muted.** This video has **no narration** — captions only — so the same MP4 plays for English, Korean, and international juries.
- [ ] **Cursor visible**: enable click ripples via `cursor-pointer.app`, or rely on QuickTime's "Show Mouse Clicks in Recording" option.
- [ ] BGM track downloaded locally before the shoot. Suggested royalty-free options from YouTube Audio Library: `Modus Operandi` or `Far Away` (instrumental, low-key, no drops). Trim to 90 s with a 1.5 s fade-out.

### 1.6 Backups before pressing record
- [ ] **Capture `docs/screenshots/easscan-attestation.png`** — full-page screenshot of the easscan attestation view, in case the live tab fails on take day.
- [ ] **Capture `docs/screenshots/verify-page.png`** — the green ✓✓ verify page.
- [ ] Place both backup PNGs in a Finder window pre-arranged offscreen so they can be dragged into the record area within 2 seconds.

---

## Section 2 — Scene-by-Scene Timing

Every scene below has an exact start/end timestamp, the on-screen action, the captions (English primary, Korean parenthetical), and shoot notes.

| Time | Scene | Action | On-screen text | Notes |
|------|-------|--------|----------------|-------|
| **0:00–0:08** | Hook | Black background fades in. Centered hero text in **Inter Bold 72 pt** appears with a 600 ms ease-out. Subtitle in **Inter Regular 28 pt** below. No motion beyond the text fade. | **"AI just decided. Can you prove it?"** <br> *(AI가 방금 결정했다. 증명할 수 있는가?)* | Static shot. If the title jitters or the kerning looks off, redo. Aspect 16:9. Background `#0B1024`. |
| **0:08–0:25** | Problem | Cut to a stylized agent UI on the left half of frame: a chat bubble showing `"Loan request from 신청자 #7F3E — DENIED."` Right half: a worried-customer pictogram (use the shadcn `Frown` icon at 96 px in `#CADCFC` over a `#1E2761` panel). Hold 5 s, then a captioned card slides up. | **"The decision exists. The evidence does not."** <br> *(결정은 있다. 증거는 없다.)* <br><br> Sub-caption (16 pt, fades in at 0:18): "AI/블록체인 SW중심대학 — Ledgerline" | Do **not** show real model names or real bank brands. Use only `신청자 #7F3E` for the applicant ID. If the chat bubble looks too YouTube-y, switch to a plain monospace transcript. |
| **0:25–0:45** | The hand-off | Cut to VSCode (Default Dark+, Cascadia Code 14pt). Camera focuses on a single line: <br> `import { LedgerlineClient } from '@ledgerline/sdk';` <br> Yellow box highlights the line for 1.5 s. Cut to the terminal showing a streaming **DR-1 record JSON**. Highlight three fields with a soft yellow underline as they print: `decision_id`, `decision_class: "reject"`, `operator_signature.public_key`. | Title card (top-right, 24 pt): **"One import. Every decision recorded."** <br> *(한 줄의 import. 모든 결정이 기록된다.)* <br><br> Lower caption at 0:38: "DR-1 schema — 7 fields, PROV-O aligned" <br> *(DR-1 표준 스키마 — 7개 필드, PROV-O 호환)* | Use the **fixture** payload, not a live LLM response (LLM latency is unpredictable on shoot day). Trim long hashes to `0xab…cd` for legibility. If the terminal text is too small, jump font to 16 pt before the take. |
| **0:45–1:05** | The proof | Cut back to terminal. A new line scrolls in: <br> `Anchored: 0x0ff689ec…19f6` <br> Followed by: <br> `→ https://base-sepolia.easscan.org/attestation/view/0x0ff6…` <br> 1 s later, cut to **Tab 2 (easscan.org)** which is already loaded. Smooth scroll down to the "Decoded Data" panel showing `root`, `leafCount`, `schemaVersion`, `tenantId`. Highlight `Tx 0x1ba4…66c5` and `Block 40,677,426` with a yellow box. | Title card (top, 24 pt): **"Anchored on Base Sepolia. Independently verifiable."** <br> *(Base Sepolia에 앵커링. 누구나 검증 가능.)* <br><br> Stamp (bottom-right corner, 14 pt): `Block 40,677,426 · Tx 0x1ba4…66c5` | This is the **money shot**. If easscan is slow, cut to the pre-captured `docs/screenshots/easscan-attestation.png` — the camera should not catch a spinner. Pre-load the panel before the take so DOM is stable. |
| **1:05–1:25** | Verify | Cut to Vercel `/verify?example=1`. The page shows two evidence rows side-by-side: <br> ① **Ledgerline anchored at block 40,677,426** ✓ <br> ② **Customer `0xabc…` signed at 2026-04-23 14:08 UTC** ✓ <br> Both rows fade their checkmarks in sequentially (300 ms apart). Camera slowly zooms 2 % into the panel over 4 seconds. | Title card (top, 24 pt): **"Notary + Author. Two signatures, one record."** <br> *(노터리 + 작성자. 두 개의 서명, 하나의 기록.)* <br><br> Footer (bottom, 12 pt): "We provide the evidence. We do not provide the verdict." <br> *(우리는 증거를 제공한다. 판단은 제공하지 않는다.)* | The two-row layout maps directly to D4 (hybrid signature) — **do not crop it out**. If only one row is visible, the demo loses its core thesis. Customer address shown is `0xabc…` (truncated) — never reveal the full demo private-key-derived address. |
| **1:25–1:30** | Tagline | Hard cut to black. Logo wordmark fades in (Inter Bold 60 pt, white on `#0B1024`). URL fades in 800 ms after. Hold 1.8 s. Final fade to black over the last 0.4 s. | **"AI's every decision, on the record."** <br> *(AI의 모든 결정을, 기록 위에.)* <br><br> URL: `ledgerline.app` | No emoji. No music swell. The fade-out matches the BGM tail. If the logo SVG is missing, fall back to the wordmark text. |

### 2.1 Caption typography (consistent across all scenes)
- Headlines: **Inter Bold**, 32–72 pt, color `#FFFFFF` on dark.
- Korean parenthetical: **Inter Bold** (Inter has full Korean coverage in the variable font; if a glyph drops, fall back to **Pretendard Bold**).
- Code, hashes, addresses, block numbers: **JetBrains Mono Medium**, color `#CADCFC`.
- Highlight boxes: 2 px border `#FFD166`, 6 px corner radius, 30 % alpha fill.
- Captions never overlap a clickable UI element on the captured page.

---

## Section 3 — Cut List and Post-Production

### 3.1 Edit rules
- Crossfades **≤ 0.3 s**. Hard cuts otherwise. No whip-pans, no zoom-blur, no glitch transitions.
- BGM ducks to **−6 dB** under any caption that contains a number or hash, so the eye lands on the data.
- No music drops or beat-matched cuts. This is industrial software, not a startup hype reel (D10 — "Midnight Executive" tone).
- Title cards always use the same anchor position per scene type (problem = center, code = top-right, proof = top, tagline = center).

### 3.2 Master encode (MP4 for hero `<video>` and judges' machines)

```sh
ffmpeg -i raw.mov \
  -c:v libx264 -crf 22 -preset slow \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  docs/demo.mp4
```

- Target file size **≤ 30 MB**. If over, raise `-crf` to 24 first; only then drop bitrate.
- `+faststart` is required so Safari/Chrome can begin playback before the full file downloads.

### 3.3 Hero GIF fallback (browsers blocking autoplay)

```sh
ffmpeg -i docs/demo.mp4 \
  -vf "fps=12,scale=720:-1:flags=lanczos" \
  -loop 0 \
  docs/demo.gif
```

- Target file size **≤ 4 MB**. If over, drop `fps=12` to `fps=10`. If still over, trim the verify scene to 12 s in a separate `demo-short.mp4` and regenerate from that.

### 3.4 Animated WebP (preferred fallback when supported)

```sh
ffmpeg -i docs/demo.mp4 \
  -vcodec libwebp -lossless 0 -q:v 70 \
  -loop 0 -an \
  docs/demo.webp
```

- WebP usually beats GIF by 3–4× at equal visual quality.
- Landing page should prefer `<source type="image/webp">` and fall back to the GIF.

### 3.5 Thumbnail (poster image)

```sh
ffmpeg -ss 50 -i docs/demo.mp4 -vframes 1 -q:v 2 docs/demo-thumb.jpg
```

- Single keyframe at **0:50** — captures the easscan.org "Decoded Data" panel, which is the most credibility-dense frame.

### 3.6 Landing page embed snippet
The landing-page hero embeds the MP4 as the primary motion source, with WebP/GIF as the no-autoplay fallback:

```html
<video
  src="/demo.mp4"
  poster="/demo-thumb.jpg"
  autoplay muted loop playsInline
  preload="metadata"
  aria-label="Ledgerline demo: 90-second walkthrough"
>
  <picture>
    <source srcSet="/demo.webp" type="image/webp" />
    <img src="/demo.gif" alt="Ledgerline demo animation fallback" />
  </picture>
</video>
```

### 3.7 File targets (final artifacts)
| File | Path | Cap | Purpose |
|------|------|-----|---------|
| Master video | `docs/demo.mp4` | 30 MB | Hero `<video>` + judges' offline copy |
| Hero GIF | `docs/demo.gif` | 4 MB | README + autoplay-blocked fallback |
| Animated WebP | `docs/demo.webp` | 3 MB | Preferred fallback for modern browsers |
| Thumbnail | `docs/demo-thumb.jpg` | 200 KB | `<video poster>` and OG image |
| Shooting script | `docs/demo-script.md` | — | This file |

---

## Section 4 — Take-1 Panic List

If any of these happen during a take, **stop the recording**, fix the cause, and start the take from the last clean cut. Do not try to splice over a flaw.

1. **Wallet popup mid-shoot.** Kill the take. We **do not** include any live wallet UI in this video — the demo replays an already-confirmed attestation. If MetaMask appears, the build flag `LEDGERLINE_DEMO_REPLAY_ONLY=1` was missed; set it and restart `pnpm dev`.
2. **easscan.org slow or 5xx.** Cut to the recorded screenshot fallback `docs/screenshots/easscan-attestation.png`. Dev A must capture this fallback **before** the recording session begins, with the same browser zoom and tab chrome.
3. **Network blip / RPC rate limit.** The recording can use the localhost demo or a pre-cached easscan tab — both look identical to the camera. Faking the load with a pre-loaded tab is allowed; do not hide DevTools network logs in shot.
4. **Code editor in the wrong theme/font.** Switch to dark VSCode theme **Default Dark+**, font **Cascadia Code 14 pt**. Reload the editor (`⌘ ⇧ P → Reload Window`) to flush stale tokenization, then retake.
5. **Cursor invisible in the MP4.** macOS occasionally drops the cursor in QuickTime captures. Use `cursor-pointer.app` (open-source, sandboxed) to overlay a magenta ring around the cursor, or enable QuickTime's "Show Mouse Clicks in Recording" before pressing Record.

> **Universal rule:** if a take is more than 5 % over 90 seconds, scrap it. We trim in the edit by tightening transitions, not by speeding up scenes — speed-up artifacts kill the "industrial software" tone (D10).

---

## Section 5 — Day 9 Fallback Strategy (live presentation)

The demo lives in four tiers. Always start at Tier 1; descend only when the higher tier visibly fails.

```
WiFi works?
├── YES → Tier 1: Live Vercel URL
│         (Open production /verify?example=1 in the room)
│         If a pause feels awkward (>3 s spinner), bridge to Tier 2 mid-flow.
│
└── NO  → Tier 2: Local MP4 from ~/presenter/demo.mp4
          - QuickTime pre-positioned, fullscreen, frame at 0:00
          - Single Space-bar press plays
          - 90 s, no buffering, no DNS
          │
          MP4 fails to play?
          └── Tier 3: GIF backup at ~/presenter/demo.gif
                      - Opens in Preview.app (always works on macOS)
                      - Loops automatically
                      - No audio (acceptable; the spec is silent video)
                      │
                      Both fail?
                      └── Tier 4: Hand-walked verbal demo
                                  - Use the printed easscan.org screenshot
                                    in the Q&A binder (page 3)
                                  - Walk: "Here's the on-chain attestation,
                                    UID 0x0ff6…, block 40,677,426, anyone
                                    can paste this UID into easscan."
                                  - Pull up the QR code (page 4) so judges
                                    can scan with their phones
```

### 5.1 Pre-position before the talk starts
- `~/presenter/demo.mp4` open in QuickTime, fullscreen-ready (`⌘ F` once tested).
- `~/presenter/demo.gif` open in Preview, on the next workspace (`⌃ →`).
- Q&A binder physically on the lectern, tabbed to pages 3 and 4.
- Phone in airplane mode but with the Vercel URL bookmarked, as a 5th-tier emergency.

### 5.2 Decision triggers (at-the-podium)
- **Trigger T2:** any DNS error, any spinner > 3 s, any 5xx visible to the room.
- **Trigger T3:** QuickTime fails to maximize within 1 attempt.
- **Trigger T4:** Preview crashes or shows "file corrupted."
- Never narrate the fallback transition. Just keep talking and switch the source. Judges remember whether the demo *worked*, not which tier produced it.

---

## Section 6 — Voice and Tone

This is a **silent video** (no narration). All communication is visual. Specifically:

- **No voiceover.** A muted MP4 plays to international juries (sponsors include MEXC Ventures and Naver Labs), so the same file works in English, Korean, and Mandarin contexts.
- **No emoji** anywhere on screen. The demo aspires to look financial, not consumer.
- **Captions:** English headline first, Korean parenthetical underneath in slightly smaller weight. Both lines fade in together — **never** stagger them, or the video reads as a translation, not a single voice.
- **Typography:**
  - Headlines: **Inter Bold** (with Pretendard Bold fallback for Korean glyphs).
  - Code, hashes, addresses, block numbers: **JetBrains Mono Medium**.
- **Color palette** (matches landing page — D10 "Midnight Executive"):
  - Primary navy `#1E2761`
  - Ice blue `#CADCFC`
  - Pure white `#FFFFFF`
  - Accent yellow (highlight boxes only) `#FFD166`
  - Background `#0B1024` for caption cards
- **Motion:** soft 200–600 ms ease-out fades only. No bounce, no spring, no parallax. No music drops, no beat-matched cuts.
- **Pacing:** every scene holds long enough that a Korean reader can finish the parenthetical caption (≈ 0.6 s per Hangul syllable).

---

## Section 7 — Recording-Day Shot List (single page, print this)

Print this page and place it on the desk next to the recording machine. Twelve principal shots; allow two to three reshoots planned into the schedule.

| # | Scene | Duration | What's on screen | Special note |
|---|-------|----------|------------------|--------------|
| 1 | Hook — title card | 0:00–0:08 (8 s) | Black bg, "AI just decided. Can you prove it?" | Static. No motion beyond fade-in. |
| 2 | Problem — denial UI | 0:08–0:18 (10 s) | Agent chat bubble: `신청자 #7F3E — DENIED` | Use `Frown` icon at 96 px right-side. |
| 3 | Problem — sub caption | 0:18–0:25 (7 s) | "The decision exists. The evidence does not." | Sub-line: AI/블록체인 SW중심대학 — Ledgerline. |
| 4 | Hand-off — import line | 0:25–0:32 (7 s) | VSCode, single line `import { LedgerlineClient }` | Yellow box highlights the line at 0:27. |
| 5 | Hand-off — DR-1 JSON streams | 0:32–0:45 (13 s) | Terminal, fixture payload, soft yellow underline three fields | Trim long hashes to `0xab…cd`. |
| 6 | Proof — "Anchored:" line | 0:45–0:52 (7 s) | Terminal: `Anchored: 0x0ff689ec…19f6 → easscan link` | The link must be clickable in source frame, but we do not click it on camera. |
| 7 | Proof — easscan tab cut | 0:52–1:05 (13 s) | easscan.org "Decoded Data" panel | Highlight `Tx 0x1ba4…66c5` and `Block 40,677,426`. |
| 8 | Verify — page hero | 1:05–1:11 (6 s) | `/verify?example=1` page header | Confirm both ✓ rows are present before recording. |
| 9 | Verify — Ledgerline row | 1:11–1:16 (5 s) | ① Ledgerline anchored at block 40,677,426 ✓ | Checkmark fades in 300 ms in. |
| 10 | Verify — Customer row | 1:16–1:21 (5 s) | ② Customer `0xabc…` signed at 2026-04-23 14:08 UTC ✓ | Camera zooms 2 % into panel over scene. |
| 11 | Verify — thesis footer | 1:21–1:25 (4 s) | "We provide the evidence. We do not provide the verdict." | 12 pt footer text. |
| 12 | Tagline — close | 1:25–1:30 (5 s) | Logo + URL `ledgerline.app` | Final fade-to-black on last 0.4 s. |

**Reshoot reserve:** Shots 5, 7, and 10 are the most fragile (live data, network, sequenced animation). Plan for a second take of each. If take 2 also fails, fall back to the screenshot from `docs/screenshots/`.

---

## Appendix A — Caption master list (copy/paste safe)

```
0:00  AI just decided. Can you prove it?
      (AI가 방금 결정했다. 증명할 수 있는가?)

0:08  The decision exists. The evidence does not.
      (결정은 있다. 증거는 없다.)

0:18  AI/블록체인 SW중심대학 — Ledgerline

0:25  One import. Every decision recorded.
      (한 줄의 import. 모든 결정이 기록된다.)

0:38  DR-1 schema — 7 fields, PROV-O aligned
      (DR-1 표준 스키마 — 7개 필드, PROV-O 호환)

0:45  Anchored on Base Sepolia. Independently verifiable.
      (Base Sepolia에 앵커링. 누구나 검증 가능.)

      Block 40,677,426 · Tx 0x1ba4…66c5

1:05  Notary + Author. Two signatures, one record.
      (노터리 + 작성자. 두 개의 서명, 하나의 기록.)

1:21  We provide the evidence. We do not provide the verdict.
      (우리는 증거를 제공한다. 판단은 제공하지 않는다.)

1:25  AI's every decision, on the record.
      (AI의 모든 결정을, 기록 위에.)
      ledgerline.app
```

## Appendix B — Final QA checklist before commit

- [ ] `docs/demo.mp4` exists, ≤ 30 MB, plays in Safari + Chrome + Firefox.
- [ ] `docs/demo.gif` exists, ≤ 4 MB, loops without artifacts.
- [ ] `docs/demo.webp` exists, ≤ 3 MB (optional but preferred).
- [ ] `docs/demo-thumb.jpg` exists, sourced from 0:50.
- [ ] All on-screen captions match Appendix A exactly. No typos in Hangul.
- [ ] No real names, no real bank brands, no real wallet popup visible.
- [ ] Golden attestation UID `0x0ff689ec…19f6` is visible at least once on camera.
- [ ] Block number `40,677,426` is visible at least once on camera.
- [ ] `/verify?example=1` shows two ✓ rows (notary + author) — not just one.
- [ ] Total runtime ≥ 88 s and ≤ 90 s.
- [ ] Landing-page embed renders both the `<video>` source and the `<picture>` fallback.
