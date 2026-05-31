/**
 * trace.ai — 대출 심사 AI 예시
 *
 * SDK 한 줄 추가만으로 모든 결정이 블록체인에 기록됩니다.
 *
 * 실행:
 *   export ANTHROPIC_API_KEY=sk-...
 *   export VIBINGMINERS_API_KEY=vm-...
 *   npx tsx examples/loan-approval.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { traceClaude, type ReceiptInfo } from '@vibingminers/sdk';

// ─────────────────────────────────────────────────────────────
// Before: const claude = new Anthropic();
// After:  한 줄 추가
// ─────────────────────────────────────────────────────────────
// traceClaude returns the same type it receives, extended with trace support.
// The `as any` cast is needed because Anthropic SDK uses overloaded signatures
// that TypeScript's structural check flags as incompatible with AnthropicLike.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const claude = traceClaude(new Anthropic() as any, {
  agentId: 'loan-approval-v2',
  onReceipt: (info: ReceiptInfo) => {
    if (info.ok) {
      console.log(`\n[trace.ai] 영수증 → ${info.verifierUrl}`);
    }
  },
});

interface LoanApplication {
  applicantId: string;
  income: number;
  creditScore: number;
  requestedAmount: number;
}

interface LoanDecision {
  decision: 'APPROVED' | 'REJECTED';
  reason: string;
}

async function evaluateLoan(app: LoanApplication): Promise<LoanDecision> {
  const dtiRatio = Math.round((app.requestedAmount / app.income) * 100);

  const response = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content:
          `대출 심사 요청\n` +
          `신청자: ${app.applicantId}\n` +
          `연소득: ${app.income.toLocaleString()}원\n` +
          `신용점수: ${app.creditScore} / 1000\n` +
          `신청금액: ${app.requestedAmount.toLocaleString()}원 (소득 대비 ${dtiRatio}%)\n\n` +
          `위 조건을 심사하여 JSON으로 응답하세요: {"decision":"APPROVED"|"REJECTED","reason":"한 줄 사유"}`,
      },
    ],
    // ── trace.ai: 이 줄이 블록체인 영수증을 생성합니다 ──
    trace: {
      decisionClass: 'approve',
      subject: `loan:${app.applicantId}`,
      rationale: `신용점수 ${app.creditScore}, DTI ${dtiRatio}%`,
    },
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '{}';

  return JSON.parse(text) as LoanDecision;
}

// ── 실행 ─────────────────────────────────────────────────────
const result = await evaluateLoan({
  applicantId: 'USR-20491',
  income: 48_000_000,
  creditScore: 742,
  requestedAmount: 15_000_000,
});

console.log('심사 결과:', result.decision);
console.log('사유:     ', result.reason);
