/**
 * Drop-in wrapper for the OpenAI SDK that fires a DR-1 receipt on every
 * chat.completions.create call. Mirror of traceClaude for OpenAI users.
 *
 * Usage:
 *   import OpenAI from 'openai';
 *   import { traceOpenAI } from '@vibingminers/sdk';
 *
 *   const openai = traceOpenAI(new OpenAI(), { agentId: 'my-agent' });
 *   const response = await openai.chat.completions.create({
 *     model: 'gpt-4o',
 *     messages: [{ role: 'user', content: prompt }],
 *     trace: { decisionClass: 'approve', rationale: 'within policy' },
 *   });
 *   // response is the standard OpenAI response.
 */

import { LedgerlineClient } from './client';
import { DecisionRecordBuilder, type DecisionClass } from './builder';
import type { ReceiptInfo, TraceCallOptions } from './wrap';

type OpenAIMessage = { role: string; content: string | null };
type OpenAICompletion = {
  choices: Array<{ message: OpenAIMessage }>;
  model?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};
type OpenAILike = {
  chat: {
    completions: {
      create: (args: unknown) => Promise<OpenAICompletion>;
    };
  };
};

export type TraceOpenAIOptions = {
  agentId: string;
  client?: LedgerlineClient;
  defaultDecisionClass?: DecisionClass;
  defaultRationale?: string;
  onReceipt?: (info: ReceiptInfo) => void;
};

function defaultLogReceipt(info: ReceiptInfo): void {
  if (info.ok) {
    // eslint-disable-next-line no-console
    console.log(`[trace.ai] receipt → ${info.verifierUrl}`);
  } else {
    // eslint-disable-next-line no-console
    console.warn('[trace.ai] receipt failed:', info.error);
  }
}

function pickLastUserContent(messages: unknown): string {
  if (!Array.isArray(messages)) return '';
  const userMsg = [...messages]
    .reverse()
    .find(
      (m): m is OpenAIMessage =>
        typeof m === 'object' && m !== null && (m as OpenAIMessage).role === 'user',
    );
  if (!userMsg) return '';
  return typeof userMsg.content === 'string' ? userMsg.content : '';
}

/**
 * Wrap an OpenAI client so every `chat.completions.create` call also fires a
 * DR-1 receipt. Returns the same client type — existing code keeps working.
 */
export function traceOpenAI<T extends OpenAILike>(
  openai: T,
  opts: TraceOpenAIOptions,
): T {
  const ledger = opts.client ?? new LedgerlineClient();
  const onReceipt = opts.onReceipt ?? defaultLogReceipt;

  const originalCreate = openai.chat.completions.create.bind(
    openai.chat.completions,
  );

  const wrappedCreate = async (rawArgs: unknown): Promise<OpenAICompletion> => {
    const argsObj = (rawArgs ?? {}) as Record<string, unknown> & {
      trace?: TraceCallOptions;
    };
    const { trace: traceOpts, ...openaiArgs } = argsObj;

    const response = await originalCreate(openaiArgs);

    void (async () => {
      try {
        const firstChoice = response.choices?.[0];
        const responseText = firstChoice?.message?.content ?? '';
        const model = String(
          (openaiArgs as { model?: unknown }).model ?? 'unknown',
        );
        const userPrompt = pickLastUserContent(
          (openaiArgs as { messages?: unknown }).messages,
        );
        const usage = response.usage;
        const decisionClass: DecisionClass =
          traceOpts?.decisionClass ?? opts.defaultDecisionClass ?? 'other';

        const builder = new DecisionRecordBuilder({
          agentId: traceOpts?.agentId ?? opts.agentId,
          decisionClass,
          ...(traceOpts?.subject !== undefined && { subject: traceOpts.subject }),
        })
          .setUserPrompt(userPrompt)
          .addLlmCall({
            provider: 'openai',
            model,
            prompt: userPrompt,
            response: responseText,
            ...(usage?.prompt_tokens !== undefined &&
              usage?.completion_tokens !== undefined && {
                tokenUsage: {
                  input: usage.prompt_tokens,
                  output: usage.completion_tokens,
                },
              }),
          })
          .select({ output: responseText })
          .withRationale({
            summary:
              traceOpts?.rationale ??
              opts.defaultRationale ??
              `${decisionClass} via ${model}`,
          });

        const record = builder.build();
        const result = await ledger.submit(record);
        onReceipt({
          ok: true,
          decision_id: result.decision_id,
          verifierUrl: result.verifierUrl,
        });
      } catch (err) {
        onReceipt({ ok: false, error: err });
      }
    })();

    return response;
  };

  const wrappedCompletions = Object.create(
    openai.chat.completions,
  ) as typeof openai.chat.completions;
  Object.assign(wrappedCompletions, { create: wrappedCreate });

  const wrappedChat = Object.create(openai.chat) as typeof openai.chat;
  Object.assign(wrappedChat, { completions: wrappedCompletions });

  const wrapped = Object.create(openai) as T;
  Object.assign(wrapped, { chat: wrappedChat });
  return wrapped;
}
