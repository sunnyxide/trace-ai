/**
 * trace.ai 데모 브라우저 자동 내비게이션
 *
 * 실행:
 *   cd scripts/demo
 *   npx playwright install chromium   (최초 1회)
 *   node browser-nav.js
 *
 * QuickTime 화면녹화를 먼저 시작한 뒤 이 스크립트를 실행하세요.
 */

import { chromium } from 'playwright';

const BASE = 'https://trace-ai-inky.vercel.app';
// const BASE = 'http://localhost:3000';  // 로컬 테스트용

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: '../../docs/',
      size: { width: 1440, height: 900 },
    },
  });

  const page = await ctx.newPage();

  // ── 0:00–0:07  랜딩 히어로 ──────────────────────────────────
  console.log('[0:00] 랜딩 페이지 오픈...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(7000);

  // ── 0:07–0:20  How it works 스크롤 ──────────────────────────
  console.log('[0:07] 스크롤다운...');
  await page.evaluate(() => {
    const el = document.querySelector('#how, #ll-how, [id*="how"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else window.scrollBy({ top: 480, behavior: 'smooth' });
  });
  await sleep(13000);

  // ── 0:20–0:22  /signup 이동 ──────────────────────────────────
  console.log('[0:20] /signup 이동...');
  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(2000);

  // ── 0:22–0:26  3-step 전체 뷰 ───────────────────────────────
  console.log('[0:22] 3-step 전체 보기...');
  await sleep(4000);

  // ── 0:26–0:31  Step 1 copy 버튼 클릭 ────────────────────────
  console.log('[0:26] copy 버튼 클릭...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.toLowerCase().includes('copy')
    );
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await sleep(800);
  try {
    await page.click('button:has-text("copy")', { timeout: 3000 });
    console.log('  ✓ copy 클릭됨');
  } catch {
    console.log('  ! copy 버튼 못 찾음 — 계속 진행');
  }
  await sleep(4200);

  // ── 0:31–0:35  Step 3 코드 프리뷰 ───────────────────────────
  console.log('[0:31] Step 3 코드 프리뷰...');
  await page.evaluate(() => {
    const pres = document.querySelectorAll('pre');
    if (pres.length > 0) pres[pres.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await sleep(4000);

  // ── 0:35–0:50  VSCode 구간 (수동 전환) ──────────────────────
  console.log('[0:35] VSCode 구간 — 별도 창으로 전환하세요 (15초)');
  await sleep(15000);

  // ── 0:50–1:07  easscan.org ───────────────────────────────────
  console.log('[0:50] easscan.org 이동...');
  await page.goto(
    'https://base-sepolia.easscan.org/attestation/view/0x0ff689ec5ae98910d80477f48a61e739d835c369b14012a6f33c7ad2207419f6',
    { waitUntil: 'domcontentloaded', timeout: 15000 }
  );
  await sleep(2000);
  await page.evaluate(() => {
    const target = Array.from(document.querySelectorAll('h2,h3,strong,[class*="decoded"]'))
      .find((el) => el.textContent?.toLowerCase().includes('decoded'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else window.scrollBy({ top: 600, behavior: 'smooth' });
  });
  await sleep(15000);

  // ── 1:07–1:23  /verify?example=1 ────────────────────────────
  console.log('[1:07] verify 페이지...');
  await page.goto(`${BASE}/verify?example=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(2000);
  await page.evaluate(() => {
    const rows = document.querySelectorAll('[class*="check"], [class*="row"], [class*="evidence"]');
    if (rows.length) rows[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await sleep(14000);

  // ── 1:23–1:30  클로징 ────────────────────────────────────────
  console.log('[1:23] 클로징 — 랜딩 히어로...');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(7000);

  console.log('\n✅ 자동 내비게이션 완료. QuickTime 녹화를 중지하세요.');

  await ctx.close();
  await browser.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
