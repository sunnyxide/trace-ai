'use client';

import { useState } from 'react';

const CMD = 'pnpm add @vibingminers/sdk @anthropic-ai/sdk';

export function InstallStep() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        background: 'var(--ll-surface)',
        border: '1px solid var(--ll-rule-2)',
        borderRadius: 12,
      }}
    >
      <code
        className="ll-mono"
        style={{
          flex: 1,
          fontSize: '0.875rem',
          color: 'var(--ll-ink)',
          letterSpacing: '0.02em',
        }}
      >
        {CMD}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy install command"
        style={{
          flexShrink: 0,
          padding: '6px 14px',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-geist-mono)',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          background: copied ? 'var(--ll-ok-soft)' : 'var(--ll-bg)',
          color: copied ? 'var(--ll-ok)' : 'var(--ll-mute)',
          border: '1px solid var(--ll-rule-2)',
          borderRadius: 999,
          cursor: 'pointer',
          transition: 'color 0.15s, background 0.15s',
        }}
      >
        {copied ? '✓ copied' : 'copy'}
      </button>
    </div>
  );
}
