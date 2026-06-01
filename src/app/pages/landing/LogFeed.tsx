import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

type LogStatus = 'on_track' | 'at_risk' | 'done' | 'ok';

type LogTemplate = {
  action: string;
  ref: string;
  context: string;
  status: LogStatus;
};

type LogEntry = LogTemplate & {
  id: number;
  time: string;
};

// Datos demo. Reemplazar con hook real cuando endpoint exista.
const TEMPLATES: LogTemplate[] = [
  { action: 'moved Backlog →',     ref: 'task#4821', context: 'Sprint 14',                 status: 'on_track' },
  { action: 'push event by',       ref: '@arojas',    context: 'abcdh/repo · main',         status: 'ok' },
  { action: 'milestone close',     ref: 'sprint#14',  context: '5d remaining',              status: 'at_risk' },
  { action: 'merged PR',           ref: '#PR-218',    context: 'abcdh/backend',             status: 'ok' },
  { action: 'review requested',    ref: 'task#4823',  context: 'awaiting @ehernandez',      status: 'on_track' },
  { action: 'build completed',     ref: 'job#9132',   context: 'staging deploy',            status: 'done' },
  { action: 'task assigned',       ref: 'task#4825',  context: 'to @mlopez',                status: 'on_track' },
  { action: 'estimate updated',    ref: 'task#4811',  context: '8h → 13h',                  status: 'at_risk' },
  { action: 'project sync',        ref: 'proj#27',    context: 'github webhook ack',        status: 'ok' },
  { action: 'comment added',       ref: 'task#4822',  context: 'by @ramos',                 status: 'ok' },
  { action: 'status changed',      ref: 'task#4814',  context: 'In Progress → Done',        status: 'done' },
  { action: 'sprint started',      ref: 'sprint#15',  context: 'capacity 124pts',           status: 'on_track' },
  { action: 'risk flag',           ref: 'proj#21',    context: 'budget consumption 92%',    status: 'at_risk' },
  { action: 'KPI recalculated',    ref: 'kpi#avance', context: 'portfolio @ 62.4%',         status: 'ok' },
  { action: 'merge conflict',      ref: '#PR-220',    context: 'awaiting resolve',          status: 'at_risk' },
  { action: 'webhook received',    ref: 'evt#7741',   context: 'push abcdh/frontend',       status: 'ok' },
];

const VISIBLE = 12;
const MAX_BUFFER = 50;
const STATUS_COLOR_VAR: Record<LogStatus, string> = {
  on_track: 'var(--accent-on)',
  done: 'var(--accent-on)',
  ok: 'var(--accent-on)',
  at_risk: 'var(--accent-warn)',
};

function utcStamp(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function buildSeed(): LogEntry[] {
  const seed: LogEntry[] = [];
  const base = Date.now();
  for (let i = 0; i < VISIBLE; i++) {
    const tpl = TEMPLATES[i % TEMPLATES.length];
    const time = utcStamp(new Date(base - (VISIBLE - i) * 2500));
    seed.push({ ...tpl, id: i, time });
  }
  return seed;
}

function nextPushDelay(): number {
  return 2000 + Math.random() * 2000;
}

export function LogFeed() {
  const reduced = useReducedMotion();
  const seed = useMemo(buildSeed, []);
  const [entries, setEntries] = useState<LogEntry[]>(seed);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let pending: number | null = null;
    let counter = seed.length;

    const schedule = () => {
      pending = window.setTimeout(() => {
        if (cancelled) return;
        const tpl = TEMPLATES[counter % TEMPLATES.length];
        const entry: LogEntry = {
          ...tpl,
          id: counter,
          time: utcStamp(new Date()),
        };
        counter += 1;
        setEntries((prev) => {
          const next = prev.concat(entry);
          return next.length > MAX_BUFFER ? next.slice(next.length - MAX_BUFFER) : next;
        });
        schedule();
      }, nextPushDelay());
    };

    schedule();

    return () => {
      cancelled = true;
      if (pending !== null) window.clearTimeout(pending);
    };
  }, [reduced, seed.length]);

  const visible = entries.slice(-VISIBLE);

  return (
    <section
      aria-labelledby="live-heading"
      className="px-4 md:px-8 py-12 md:py-16 max-w-[1200px] mx-auto"
    >
      <p
        id="live-heading"
        className="[font-family:var(--font-mono)] text-[hsl(var(--text-dim))] text-[12px] mb-6"
      >
        <span className="text-[hsl(var(--brand))]">{'> '}</span>./live
      </p>
      <p className="sr-only">
        Log de eventos del sistema. Datos de demostracion: no representan eventos reales
        de tenants en produccion.
      </p>
      <div className="border border-[hsl(var(--line))] bg-[hsl(var(--panel))]">
        <div className="border-b border-[hsl(var(--line))] px-4 py-2 [font-family:var(--font-mono)] text-[10px] uppercase tracking-tight text-[hsl(var(--text-dim))] flex items-center justify-between">
          <span>event_stream · live</span>
          <span aria-hidden className="inline-flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-on))] landing-pulse" />
            <span>{visible.length} / {VISIBLE}</span>
          </span>
        </div>
        <ol className="divide-y divide-[hsl(var(--line))]">
          {visible.map((entry) => (
            <li
              key={entry.id}
              className="[font-family:var(--font-mono)] text-[12px] px-4 py-2 flex flex-wrap items-baseline gap-x-3 gap-y-1"
              style={{ transition: 'none' }}
            >
              <span className="text-[hsl(var(--text-dim))] tabular-nums">
                [{entry.time}]
              </span>
              <span className="text-[hsl(var(--text))]">{entry.action}</span>
              <span className="text-[hsl(var(--brand-strong))]">{entry.ref}</span>
              <span className="text-[hsl(var(--text-dim))]">{entry.context}</span>
              <span
                className="ml-auto"
                style={{ color: `hsl(${STATUS_COLOR_VAR[entry.status]})` }}
              >
                [{entry.status}]
              </span>
            </li>
          ))}
        </ol>
        <div className="border-t border-[hsl(var(--line))] px-4 py-2 [font-family:var(--font-mono)] text-[12px] flex items-center gap-2">
          <span className="text-[hsl(var(--brand))]">{'>'}</span>
          <span
            aria-hidden
            className="inline-block w-2 h-[1em] bg-[hsl(var(--brand))] landing-blink align-[-0.05em]"
          />
        </div>
        <div className="border-t border-[hsl(var(--line))] px-4 py-2 [font-family:var(--font-mono)] text-[10px] text-[hsl(var(--text-dim))] flex flex-wrap items-center gap-x-4 gap-y-1 justify-between">
          <span>
            rate: <span className="text-[hsl(var(--text))]">~0.4 events/s</span>
          </span>
          <span>
            buffer: <span className="text-[hsl(var(--text))] tabular-nums">{Math.min(entries.length, MAX_BUFFER)}</span> / {MAX_BUFFER}
          </span>
          <span>
            visible: <span className="text-[hsl(var(--text))] tabular-nums">{visible.length}</span> / {VISIBLE}
          </span>
          <span>
            source: <span className="text-[hsl(var(--text-dim))]">demo fixture</span>
          </span>
        </div>
      </div>
    </section>
  );
}
