/**
 * trace.ai 데모 — 자동 녹화 + TTS 합치기
 *
 * 실행 전 준비:
 *   python3 scripts/demo/tts-openai.py   → docs/demo-tts.mp3 생성
 *
 * 실행:
 *   cd scripts/demo
 *   npx playwright install chromium   ← 최초 1회만
 *   node browser-nav.js
 *
 * 결과:
 *   docs/demo.mp4   — 영상 + TTS 합본 (YouTube 업로드용)
 *
 * TTS 구간 타이밍:
 *   s01  7.2s  → 랜딩 히어로
 *   s02 18.3s  → How it works 스크롤
 *   s03  2.0s  → /signup 이동
 *   s04 14.8s  → 3-step 페이지 (copy 클릭 + Step 3 코드 프리뷰)
 *   s05 15.0s  → Step 3 코드 프리뷰 유지 (traceClaude 래핑 설명)
 *   s06 16.5s  → easscan Decoded Data
 *   s07 15.3s  → /verify 두 ✓ 행
 *   s08  7.0s  → 클로징 (랜딩 복귀)
 */

import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import { readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = resolve(__dirname, '../../docs');
const BASE = 'https://trace-ai-inky.vercel.app';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: DOCS, size: { width: 1440, height: 900 } },
  });

  const page = await ctx.newPage();

  // ── s01  0:00–0:07  랜딩 히어로 (7.2s) ─────────────────────────
  console.log('▶ [0:00] 랜딩 히어로');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(7200);

  // ── s02  0:07–0:25  How it works 스크롤 (18.3s) ─────────────────
  console.log('▶ [0:07] How it works 스크롤');
  await page.evaluate(() => {
    const el = document.querySelector('#how, #ll-how, [id*="how"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else window.scrollBy({ top: 500, behavior: 'smooth' });
  });
  await sleep(18300);

  // ── s03  0:25–0:27  /signup 이동 (2.0s) ─────────────────────────
  console.log('▶ [0:25] /signup 이동');
  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(2000);

  // ── s04  0:27–0:42  3-step 페이지 (14.8s) ───────────────────────
  console.log('▶ [0:27] 3-step 전체 뷰');
  await sleep(4500);

  console.log('  → copy 버튼 클릭');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find((b) => b.textContent?.toLowerCase().includes('copy'));
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await sleep(800);
  try {
    await page.click('button:has-text("copy")', { timeout: 3000 });
    console.log('  ✓ copy 클릭됨');
  } catch {
    console.log('  ! copy 버튼 미발견 — 계속');
  }
  await sleep(4000);

  console.log('  → Step 3 코드 프리뷰 스크롤');
  await page.evaluate(() => {
    const pres = document.querySelectorAll('pre');
    if (pres.length) pres[pres.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await sleep(5500);

  // ── s05  0:42–0:57  Step 3 코드 프리뷰 유지 (15.0s) ─────────────
  // traceClaude() 래핑 설명 구간 — VS Code 전환 없이 코드 계속 노출
  console.log('▶ [0:42] traceClaude 코드 프리뷰 유지 (15초)');
  await sleep(15000);

  // ── s06  0:57–1:13  easscan Decoded Data (16.5s) ─────────────────
  console.log('▶ [0:57] easscan.org 이동');
  await page.goto(
    'https://base-sepolia.easscan.org/attestation/view/' +
    '0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6',
    { waitUntil: 'domcontentloaded', timeout: 15000 },
  );
  await sleep(2000);
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('h2,h3,strong,[class*="decoded"]'))
      .find((e) => e.textContent?.toLowerCase().includes('decoded'));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else window.scrollBy({ top: 600, behavior: 'smooth' });
  });
  await sleep(14500);

  // ── s07  1:13–1:28  /verify?example=1 (15.3s) ───────────────────
  console.log('▶ [1:13] verify 페이지');
  await page.goto(`${BASE}/verify?example=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(2000);
  await page.evaluate(() => {
    const el = document.querySelector('[class*="check"],[class*="row"],[class*="evidence"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await sleep(13300);

  // ── s08  1:28–1:35  클로징 — 랜딩 복귀 (7.0s) ───────────────────
  console.log('▶ [1:28] 클로징 — 랜딩 복귀');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(7000);

  // ── 녹화 종료 ────────────────────────────────────────────────────
  console.log('\n⏹  녹화 종료 중...');
  await ctx.close();
  await browser.close();

  // ── webm 파일 찾기 ───────────────────────────────────────────────
  const webmFiles = readdirSync(DOCS)
    .filter((f) => f.endsWith('.webm'))
    .sort();

  if (!webmFiles.length) {
    console.error('❌ webm 파일을 찾을 수 없습니다. Playwright 녹화 실패.');
    process.exit(1);
  }

  const webm = resolve(DOCS, webmFiles[webmFiles.length - 1]);
  const mp3  = resolve(DOCS, 'demo-tts.mp3');
  const out  = resolve(DOCS, 'demo.mp4');

  console.log(`\n▶ ffmpeg 합치는 중...`);
  console.log(`  영상: ${webm}`);
  console.log(`  오디오: ${mp3}`);

  execFileSync('ffmpeg', [
    '-y',
    '-i', webm,
    '-i', mp3,
    '-c:v', 'libx264', '-crf', '22', '-preset', 'fast',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    out,
  ], { stdio: 'inherit' });

  console.log(`\n✅ 완성: docs/demo.mp4`);
  console.log('   YouTube에 업로드하세요!');
}

run().catch((e) => { console.error(e); process.exit(1); });
