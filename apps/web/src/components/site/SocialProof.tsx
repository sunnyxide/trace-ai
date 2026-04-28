/**
 * SocialProof — the "why now" strip directly under the hero.
 *
 *   1. The 87% — verbatim from Shoptalk 2026 CEO interviews. This is the
 *      market-pull signal: AI output verification is the #1 bottleneck
 *      cited by 30+ enterprise CEOs. We frame it as a giant editorial
 *      pull-quote with the source visible.
 *
 *   2. Regulatory clocks — two inevitable deadlines that turn AI
 *      audit logs from "nice to have" into "ship before this date."
 *        · Korea AI Basic Act — already in force (Jan 22, 2026).
 *        · EU AI Act, high-risk obligations — Aug 2, 2026.
 *
 * Server-rendered — recomputed on each request, so the day counters
 * stay fresh without any client JS or rehydration churn.
 */
import { Reveal } from '@/components/motion/Reveal';

const KOREA_AI_ACT_LIVE = new Date('2026-01-22T00:00:00+09:00');
const EU_AI_ACT_HIGH_RISK = new Date('2026-08-02T00:00:00Z');

function dayDiff(target: Date): number {
  const ms = target.getTime() - Date.now();
  return Math.round(ms / 86_400_000);
}

export function SocialProof() {
  const koreaDaysLive = -dayDiff(KOREA_AI_ACT_LIVE);
  const euDaysLeft = dayDiff(EU_AI_ACT_HIGH_RISK);

  return (
    <section
      aria-labelledby="social-proof-title"
      style={{
        padding: '96px 0 72px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="ll-shell ll-grid-2 ll-grid-2--lead-left ll-grid-2--gap-lg">
        {/* ====================================================================
         * Left — the editorial pull-quote.
         * ==================================================================*/}
        <Reveal>
          <article
            style={{
              position: 'relative',
              padding: '48px 48px 40px',
              border: '1px solid var(--ll-rule)',
              borderRadius: 24,
              background:
                'linear-gradient(180deg, var(--ll-surface) 0%, var(--ll-bg) 100%)',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            {/* Subtle decorative quote glyph — anchored, not floating. */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 8,
                left: 28,
                fontFamily: 'var(--font-instrument-serif)',
                fontSize: '8rem',
                lineHeight: 1,
                color: 'var(--ll-brand)',
                opacity: 0.08,
                userSelect: 'none',
              }}
            >
              &ldquo;
            </span>

            <div
              className="ll-eyebrow"
              id="social-proof-title"
              style={{ position: 'relative' }}
            >
              The 30-CEO signal
            </div>

            <div
              style={{
                marginTop: 22,
                display: 'flex',
                alignItems: 'baseline',
                gap: 18,
                flexWrap: 'wrap',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-instrument-serif)',
                  fontSize: 'clamp(4.5rem, 9vw, 7rem)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.02em',
                  color: 'var(--ll-ink)',
                  fontWeight: 400,
                }}
              >
                87
                <span style={{ color: 'var(--ll-brand)' }}>%</span>
              </span>
              <span
                className="ll-body-mute"
                style={{
                  fontSize: '0.875rem',
                  maxWidth: 220,
                  lineHeight: 1.45,
                }}
              >
                of enterprise CEOs we interviewed name AI&nbsp;output
                verification as their&nbsp;#1 deployment&nbsp;bottleneck.
              </span>
            </div>

            <p
              className="ll-h3"
              style={{
                marginTop: 28,
                fontSize: '1.0625rem',
                lineHeight: 1.55,
                color: 'var(--ll-ink-2)',
                fontWeight: 400,
                position: 'relative',
              }}
            >
              <em
                style={{
                  fontFamily: 'var(--font-instrument-serif)',
                  fontStyle: 'italic',
                  color: 'var(--ll-ink)',
                  fontSize: '1.25rem',
                }}
              >
                &ldquo;The model is not the bottleneck anymore.
                <br />
                Trusting what it just did is.&rdquo;
              </em>
            </p>

            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px dashed var(--ll-rule)',
                display: 'grid',
                gap: 6,
              }}
            >
              <span className="ll-caption" style={{ letterSpacing: '0.12em' }}>
                Source
              </span>
              <span
                className="ll-mono ll-small"
                style={{ color: 'var(--ll-ink-2)', lineHeight: 1.55 }}
              >
                Shoptalk 2026 · Las Vegas — 30+ on-record CEO interviews.
              </span>
            </div>
          </article>
        </Reveal>

        {/* ====================================================================
         * Right — regulatory timeline cards. Two deadlines, sober & specific.
         * ==================================================================*/}
        <Reveal delayMs={120}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              height: '100%',
            }}
          >
            <div className="ll-eyebrow" style={{ marginBottom: 4 }}>
              Regulatory clock
            </div>

            <RegCard
              tone="ok"
              jurisdiction="Republic of Korea"
              law="AI Basic Act (인공지능 기본법)"
              status={
                koreaDaysLive >= 0
                  ? `In force · day +${koreaDaysLive}`
                  : `Takes effect in ${-koreaDaysLive} days`
              }
              statusVerb={koreaDaysLive >= 0 ? 'LIVE' : 'PENDING'}
              effectiveDate="January 22, 2026"
              note="High-impact AI providers must keep auditable records of training data, decision logic, and user-facing outputs."
            />

            <RegCard
              tone="warn"
              jurisdiction="European Union"
              law="EU AI Act · high-risk obligations"
              status={
                euDaysLeft > 0
                  ? `T-minus ${euDaysLeft} days`
                  : `In force · day +${-euDaysLeft}`
              }
              statusVerb={euDaysLeft > 0 ? 'COUNTDOWN' : 'LIVE'}
              effectiveDate="August 2, 2026"
              note="Article 12 requires automatic event logging across the AI system's lifecycle — traceable, tamper-resistant, retained 6+ months."
            />

            <p
              className="ll-small"
              style={{
                color: 'var(--ll-mute)',
                margin: 0,
                marginTop: 4,
                lineHeight: 1.55,
              }}
            >
              The receipt your auditor will ask for in 18 months is the same
              receipt we cut on day one.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function RegCard({
  tone,
  jurisdiction,
  law,
  status,
  statusVerb,
  effectiveDate,
  note,
}: {
  tone: 'ok' | 'warn';
  jurisdiction: string;
  law: string;
  status: string;
  statusVerb: string;
  effectiveDate: string;
  note: string;
}) {
  const isOk = tone === 'ok';
  const accent = isOk ? 'var(--ll-ok)' : 'var(--ll-accent-deep)';
  const accentSoft = isOk ? 'var(--ll-ok-soft)' : 'var(--ll-accent-soft)';

  return (
    <article
      className="ll-card"
      style={{
        padding: 22,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left-edge accent stripe — single-side border motif. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 3,
          background: accent,
          opacity: 0.85,
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 14,
          marginBottom: 10,
        }}
      >
        <div>
          <div className="ll-caption" style={{ letterSpacing: '0.12em' }}>
            {jurisdiction}
          </div>
          <div
            className="ll-h3"
            style={{
              marginTop: 4,
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--ll-ink)',
            }}
          >
            {law}
          </div>
        </div>
        <span
          style={{
            background: accentSoft,
            color: accent,
            border: `1px solid color-mix(in oklab, ${accent} 28%, transparent)`,
            fontFamily: 'var(--font-geist-mono)',
            fontWeight: 600,
            fontSize: '0.625rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '4px 9px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            flex: '0 0 auto',
          }}
        >
          {statusVerb}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          marginTop: 6,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-instrument-serif)',
            fontSize: '1.5rem',
            color: accent,
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}
        >
          {status}
        </span>
        <span
          className="ll-mono ll-small"
          style={{ color: 'var(--ll-mute)' }}
        >
          · {effectiveDate}
        </span>
      </div>

      <p
        className="ll-body-mute"
        style={{
          margin: 0,
          marginTop: 12,
          fontSize: '0.875rem',
          lineHeight: 1.5,
        }}
      >
        {note}
      </p>
    </article>
  );
}
