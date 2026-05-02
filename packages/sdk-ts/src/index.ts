export {
  DecisionRecordBuilder,
  type BuilderInit,
  type DecisionClass,
  type RiskLevel,
  type LlmProvider,
  type LlmCallInput,
  type SelectInput,
  type RationaleInput,
  type ToolCallInput,
} from './builder';

export {
  LedgerlineClient,
  LedgerlineError,
  type ClientOptions,
  type SubmitResult,
} from './client';

export {
  signRecord,
  addressFromPrivateKey,
  type PrivateKeyHex,
  type AddressHex,
} from './sign';

export {
  traceClaude,
  generateOperatorKey,
  type TraceClaudeOptions,
  type TraceCallOptions,
  type ReceiptInfo,
} from './wrap';

export { traceOpenAI, type TraceOpenAIOptions } from './wrap-openai';

export type { DR1 } from '@vibingminers/schema';
