import type { ReactNode } from 'react';

/**
 * Record header — eyebrow + h2 + status pill.
 */
export function RecordHeader({
  eyebrow,
  title,
  description,
  status,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  status: {
    state: 'verified' | 'failed' | 'pending';
    label: string;
  };
}) {
  const pillClass =
    status.state === 'verified'
      ? 'll-pill ll-pill-verified'
      : status.state === 'failed'
        ? 'll-pill ll-pill-failed'
        : 'll-pill ll-pill-pending';
  const mark = status.state === 'failed' ? '✕' : '✓';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '64px',
        alignItems: 'start',
      }}
    >
      <div>
        <div
          className="ll-caption"
          style={{
            color:
              status.state === 'verified'
                ? 'var(--ll-verified)'
                : status.state === 'failed'
                  ? 'var(--ll-failed)'
                  : 'var(--ll-pending)',
            marginBottom: '12px',
          }}
        >
          {eyebrow}
        </div>
        <h2 className="ll-h2" style={{ marginBottom: '8px' }}>
          {title}
        </h2>
        {description ? (
          <p
            className="ll-mono-body"
            style={{ color: 'var(--ll-ink-mid)', margin: 0 }}
          >
            {description}
          </p>
        ) : null}
      </div>
      <div style={{ textAlign: 'right' }}>
        <span className={pillClass}>
          <span className="ll-mark-check">{mark}</span> {status.label}
        </span>
      </div>
    </div>
  );
}
