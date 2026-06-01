import { Link } from 'react-router';

// Datos verificables contra src/services/auth.service.ts, src/services/api.ts y src/app/context/AuthContext.tsx.
// No invento TTLs, rate limits ni MFA — el backend Django los maneja y no estan expuestos al frontend.

const AUTH_FIELDS: Array<{ key: string; value: string; tone: 'text' | 'dim' | 'on' | 'warn' | 'brand' }> = [
  { key: 'endpoint',         value: 'POST /api/auth/login/',                       tone: 'text' },
  { key: 'scheme',           value: 'Bearer JWT (access + refresh)',               tone: 'text' },
  { key: 'token_storage',    value: 'localStorage · pip_access_token, pip_refresh_token', tone: 'text' },
  { key: 'user_cache',       value: 'localStorage · pip_user',                     tone: 'dim' },
  { key: 'session_recovery', value: '401 → POST /auth/refresh/ → retry once',      tone: 'text' },
  { key: 'on_expiry',        value: 'event pip:auth-session-expired · countdown 5s → /', tone: 'warn' },
  { key: 'status',           value: 'awaiting_credentials',                        tone: 'brand' },
  { key: 'session_id',       value: 'null',                                        tone: 'dim' },
];

const RESPONSE_CODES: Array<{ code: string; label: string; tone: 'on' | 'warn' | 'brand' }> = [
  { code: '200', label: 'ok · tokens issued, user persisted', tone: 'on' },
  { code: '401', label: 'invalid_credentials · login required', tone: 'brand' },
  { code: '4xx', label: 'validation_error · field-level response.detail', tone: 'warn' },
];

const TONE_COLOR: Record<'text' | 'dim' | 'on' | 'warn' | 'brand', string> = {
  text: 'text-[hsl(var(--text))]',
  dim: 'text-[hsl(var(--text-dim))]',
  on: 'text-[hsl(var(--accent-on))]',
  warn: 'text-[hsl(var(--accent-warn))]',
  brand: 'text-[hsl(var(--brand))]',
};

export function AuthBlock() {
  return (
    <section
      aria-labelledby="auth-heading"
      className="px-4 md:px-8 py-12 md:py-16 max-w-[1200px] mx-auto"
    >
      <p
        id="auth-heading"
        className="[font-family:var(--font-mono)] text-[hsl(var(--text-dim))] text-[12px] mb-8"
      >
        <span className="text-[hsl(var(--brand))]">{'> '}</span>./auth.login
      </p>
      <div className="border-2 border-[hsl(var(--brand))] bg-[hsl(var(--panel))]">
        <div className="border-b border-[hsl(var(--brand))]/40 px-4 md:px-6 py-2 [font-family:var(--font-mono)] text-[10px] uppercase tracking-tight text-[hsl(var(--text-dim))] flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="flex items-center gap-2">
            <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand))] landing-pulse" />
            session · /auth.login
          </span>
          <span>react-router · /login</span>
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-0">
          <div className="p-5 md:p-8 border-b md:border-b-0 md:border-r border-[hsl(var(--brand))]/40">
            <p className="[font-family:var(--font-mono)] text-[hsl(var(--text))] text-base md:text-lg">
              <span className="text-[hsl(var(--brand))]">{'> '}</span>credentials_required.
            </p>
            <p className="[font-family:var(--font-mono)] text-[hsl(var(--text-dim))] text-base md:text-lg mb-6">
              proceed?
            </p>

            <dl className="[font-family:var(--font-mono)] text-[11px] md:text-[12px] grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 mb-8">
              {AUTH_FIELDS.map((f) => (
                <div key={f.key} className="contents">
                  <dt className="text-[hsl(var(--text-dim))]">{f.key}:</dt>
                  <dd className={`${TONE_COLOR[f.tone]} break-words`}>{f.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="group inline-flex items-center gap-3 [font-family:var(--font-mono)] text-[13px] text-[hsl(var(--text))] bg-[hsl(var(--void))] border-2 border-[hsl(var(--brand))] px-5 py-3 hover:bg-[hsl(var(--brand))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--void))]"
                style={{ transition: 'none' }}
              >
                <span className="text-[hsl(var(--brand))] group-hover:text-[hsl(var(--void))]">[</span>
                <span className="group-hover:text-[hsl(var(--void))]">y · iniciar sesion</span>
                <span className="text-[hsl(var(--brand))] group-hover:text-[hsl(var(--void))]">]</span>
              </Link>
              <span aria-hidden className="[font-family:var(--font-mono)] text-[11px] text-[hsl(var(--text-dim))]">
                navega a <span className="text-[hsl(var(--text))]">/login</span>
              </span>
            </div>
          </div>

          <aside className="p-5 md:p-6">
            <p className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-tight text-[hsl(var(--text-dim))] mb-3">
              expected_responses
            </p>
            <ul className="[font-family:var(--font-mono)] text-[11px] md:text-[12px] divide-y divide-[hsl(var(--line))] border border-[hsl(var(--line))] bg-[hsl(var(--rail))]">
              {RESPONSE_CODES.map((r) => (
                <li key={r.code} className="px-3 py-2 flex items-baseline gap-3">
                  <span className={`${TONE_COLOR[r.tone]} tabular-nums`}>{r.code}</span>
                  <span className="text-[hsl(var(--text-dim))]">{r.label}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 [font-family:var(--font-mono)] text-[10px] uppercase tracking-tight text-[hsl(var(--text-dim))] mb-3">
              flow
            </p>
            <pre
              aria-hidden
              className="[font-family:var(--font-mono)] text-[10px] md:text-[11px] text-[hsl(var(--text-dim))] whitespace-pre overflow-x-auto bg-[hsl(var(--rail))] border border-[hsl(var(--line))] p-3 leading-relaxed"
            >
{`POST /api/auth/login/
  ├─ body: { email, password }
  ├─ resp: { access_token, refresh_token, user }
  └─ tokenStore.set(access, refresh)
       └─ persist user → pip_user
            └─ AppLayout (system_role-aware)`}
            </pre>
          </aside>
        </div>

        <div className="border-t border-[hsl(var(--brand))]/40 px-4 md:px-6 py-2 [font-family:var(--font-mono)] text-[12px] flex items-center gap-2">
          <span className="text-[hsl(var(--brand))]">{'>'}</span>
          <span
            aria-hidden
            className="inline-block w-2 h-[1em] bg-[hsl(var(--brand))] landing-blink align-[-0.05em]"
          />
        </div>
      </div>
    </section>
  );
}
