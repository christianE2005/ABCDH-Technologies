import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

type NodeMetrics = {
  webhookOps: number;
  tasksActive: number;
  analyzerLatency: number;
  reportsQueued: number;
};

type NodeHistory = {
  webhookOps: number[];
  tasksActive: number[];
  analyzerLatency: number[];
  reportsQueued: number[];
};

const INITIAL: NodeMetrics = {
  webhookOps: 12,
  tasksActive: 187,
  analyzerLatency: 78,
  reportsQueued: 4,
};

const HISTORY_LEN = 12;

function seedHistory(value: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < HISTORY_LEN; i++) {
    arr.push(value + (Math.random() - 0.5) * value * 0.1);
  }
  return arr;
}

function tick(value: number, range: [number, number], step: number): number {
  const direction = Math.random() < 0.5 ? -1 : 1;
  const delta = direction * (step * (0.4 + Math.random() * 0.6));
  const next = value + delta;
  const [min, max] = range;
  if (next < min) return min;
  if (next > max) return max;
  return Number(next.toFixed(step < 1 ? 1 : 0));
}

type Sparkline = {
  x: number;
  y: number;
  w: number;
  h: number;
  values: number[];
  color: string;
};

function sparklinePath({ x, y, w, h, values }: Sparkline): string {
  if (values.length === 0) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = w / Math.max(values.length - 1, 1);
  return values
    .map((v, i) => {
      const px = x + i * stepX;
      const py = y + h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(' ');
}

export function ArchitectureDiagram() {
  const reduced = useReducedMotion();
  const [metrics, setMetrics] = useState<NodeMetrics>(INITIAL);
  const [history, setHistory] = useState<NodeHistory>(() => ({
    webhookOps: seedHistory(INITIAL.webhookOps),
    tasksActive: seedHistory(INITIAL.tasksActive),
    analyzerLatency: seedHistory(INITIAL.analyzerLatency),
    reportsQueued: seedHistory(INITIAL.reportsQueued),
  }));

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let pending: number | null = null;

    const schedule = () => {
      pending = window.setTimeout(() => {
        if (cancelled) return;
        setMetrics((prev) => {
          const next: NodeMetrics = {
            webhookOps: tick(prev.webhookOps, [6, 24], 1),
            tasksActive: tick(prev.tasksActive, [170, 210], 1),
            analyzerLatency: tick(prev.analyzerLatency, [55, 110], 1),
            reportsQueued: tick(prev.reportsQueued, [1, 9], 1),
          };
          setHistory((h) => ({
            webhookOps: [...h.webhookOps.slice(1), next.webhookOps],
            tasksActive: [...h.tasksActive.slice(1), next.tasksActive],
            analyzerLatency: [...h.analyzerLatency.slice(1), next.analyzerLatency],
            reportsQueued: [...h.reportsQueued.slice(1), next.reportsQueued],
          }));
          return next;
        });
        schedule();
      }, 2200 + Math.random() * 1800);
    };
    schedule();
    return () => {
      cancelled = true;
      if (pending !== null) window.clearTimeout(pending);
    };
  }, [reduced]);

  // Status by node: thresholds derive a health color
  const reportsStatus = metrics.reportsQueued > 6 ? 'warn' : 'ok';
  const analyzerStatus = metrics.analyzerLatency > 95 ? 'warn' : 'ok';
  const reportsStatusColor =
    reportsStatus === 'warn' ? 'hsl(var(--accent-warn))' : 'hsl(var(--accent-on))';
  const analyzerStatusColor =
    analyzerStatus === 'warn' ? 'hsl(var(--accent-warn))' : 'hsl(var(--accent-on))';

  const totalOps =
    metrics.webhookOps + Math.round(metrics.tasksActive / 20) + metrics.reportsQueued;

  return (
    <section
      aria-labelledby="architecture-heading"
      className="px-4 md:px-8 py-12 md:py-16 max-w-[1200px] mx-auto"
    >
      <p
        id="architecture-heading"
        className="[font-family:var(--font-mono)] text-[hsl(var(--text-dim))] text-[12px] mb-8"
      >
        <span className="text-[hsl(var(--brand))]">{'> '}</span>./architecture
      </p>
      <div className="border border-[hsl(var(--line))] bg-[hsl(var(--panel))] overflow-x-auto">
        {/* header row */}
        <div className="border-b border-[hsl(var(--line))] px-4 py-2 [font-family:var(--font-mono)] text-[10px] uppercase tracking-tight text-[hsl(var(--text-dim))] flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span>data_flow · inferido del codigo · metricas: demo</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-on))]" />
              ok
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-warn))]" />
              warn
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-[hsl(var(--brand))] landing-pulse" />
              core
            </span>
            <span className="tabular-nums">
              flow_sim: <span className="text-[hsl(var(--text))]">~{totalOps} ops/s</span>
            </span>
          </span>
        </div>

        <div className="p-4 md:p-6">
          <svg
            viewBox="0 0 860 360"
            className="w-full min-w-[760px] h-auto"
            role="img"
            aria-label="Flujo de datos vivo: github (source) → webhook (queue) → tasks (core, pulsando) → analyzer (kpis) → reports (export). Cada nodo muestra metricas, estado y sparkline de los ultimos 12 ticks."
          >
            <defs>
              <marker
                id="arrow-dim"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--text-dim))" />
              </marker>
              <marker
                id="arrow-brand"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--brand))" />
              </marker>
              <pattern id="diag-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="hsl(var(--line))"
                  strokeOpacity="0.35"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>

            {/* subtle inner grid */}
            <rect x="0" y="0" width="860" height="360" fill="url(#diag-grid)" />

            <g style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              {/* github */}
              <g>
                <rect x="20" y="110" width="160" height="88" fill="hsl(var(--rail))" stroke="hsl(var(--line))" />
                <circle cx="172" cy="122" r="3.5" fill="hsl(var(--accent-on))" />
                <text x="34" y="132" fill="hsl(var(--text))">github</text>
                <text x="34" y="150" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>source · push events</text>
                <text x="34" y="168" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>oauth · github_app</text>
                <text x="34" y="186" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>service · github.service.ts</text>
              </g>

              {/* webhook */}
              <g>
                <rect x="220" y="110" width="160" height="88" fill="hsl(var(--rail))" stroke="hsl(var(--line))" />
                <circle cx="372" cy="122" r="3.5" fill="hsl(var(--accent-on))" />
                <text x="234" y="132" fill="hsl(var(--text))">push_ingest</text>
                <text x="234" y="150" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>GET /api/github/pushes/</text>
                <text x="234" y="168" fill="hsl(var(--accent-on))" style={{ fontSize: 10 }} className="tabular-nums">
                  flow_sim: ~{metrics.webhookOps} ops/s
                </text>
                <path
                  d={sparklinePath({
                    x: 234,
                    y: 176,
                    w: 132,
                    h: 14,
                    values: history.webhookOps,
                    color: '',
                  })}
                  fill="none"
                  stroke="hsl(var(--accent-on))"
                  strokeWidth="1"
                  opacity="0.75"
                />
              </g>

              {/* tasks (core) */}
              <g>
                <rect
                  x="420"
                  y="110"
                  width="160"
                  height="88"
                  fill="hsl(var(--panel))"
                  stroke="hsl(var(--brand))"
                  strokeWidth="2"
                />
                <circle
                  cx="572"
                  cy="122"
                  r="4"
                  fill="hsl(var(--brand))"
                  className="landing-pulse"
                />
                <text x="434" y="132" fill="hsl(var(--brand))">tasks</text>
                <text x="434" y="150" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>core · tasks.service.ts</text>
                <text x="434" y="168" fill="hsl(var(--brand-strong))" style={{ fontSize: 10 }} className="tabular-nums">
                  active_sim: {metrics.tasksActive}
                </text>
                <path
                  d={sparklinePath({
                    x: 434,
                    y: 176,
                    w: 132,
                    h: 14,
                    values: history.tasksActive,
                    color: '',
                  })}
                  fill="none"
                  stroke="hsl(var(--brand))"
                  strokeWidth="1"
                  opacity="0.85"
                />
              </g>

              {/* analyzer */}
              <g>
                <rect x="620" y="110" width="160" height="88" fill="hsl(var(--rail))" stroke="hsl(var(--line))" />
                <circle cx="772" cy="122" r="3.5" fill={analyzerStatusColor} />
                <text x="634" y="132" fill="hsl(var(--text))">project_health</text>
                <text x="634" y="150" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>utils/projectHealth.ts</text>
                <text x="634" y="168" fill={analyzerStatusColor} style={{ fontSize: 10 }} className="tabular-nums">
                  recompute_sim: {metrics.analyzerLatency}ms
                </text>
                <path
                  d={sparklinePath({
                    x: 634,
                    y: 176,
                    w: 132,
                    h: 14,
                    values: history.analyzerLatency,
                    color: '',
                  })}
                  fill="none"
                  stroke={analyzerStatusColor}
                  strokeWidth="1"
                  opacity="0.75"
                />
              </g>

              {/* reports */}
              <g>
                <rect x="620" y="240" width="160" height="88" fill="hsl(var(--rail))" stroke="hsl(var(--line))" />
                <circle cx="772" cy="252" r="3.5" fill={reportsStatusColor} />
                <text x="634" y="262" fill="hsl(var(--text))">reports</text>
                <text x="634" y="280" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>jspdf + autotable · xlsx</text>
                <text x="634" y="298" fill={reportsStatusColor} style={{ fontSize: 10 }} className="tabular-nums">
                  queued_sim: {metrics.reportsQueued}
                </text>
                <path
                  d={sparklinePath({
                    x: 634,
                    y: 306,
                    w: 132,
                    h: 14,
                    values: history.reportsQueued,
                    color: '',
                  })}
                  fill="none"
                  stroke={reportsStatusColor}
                  strokeWidth="1"
                  opacity="0.75"
                />
              </g>

              {/* arrows */}
              <line x1="180" y1="154" x2="215" y2="154" stroke="hsl(var(--text-dim))" markerEnd="url(#arrow-dim)" />
              <line x1="380" y1="154" x2="415" y2="154" stroke="hsl(var(--brand))" strokeWidth="1.5" markerEnd="url(#arrow-brand)" />
              <line x1="580" y1="154" x2="615" y2="154" stroke="hsl(var(--text-dim))" markerEnd="url(#arrow-dim)" />
              <line x1="700" y1="198" x2="700" y2="235" stroke="hsl(var(--text-dim))" markerEnd="url(#arrow-dim)" />

              {/* arrow labels — verbos conceptuales, sin tasas inventadas */}
              <text x="197" y="148" textAnchor="middle" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>
                push
              </text>
              <text x="397" y="148" textAnchor="middle" fill="hsl(var(--brand))" style={{ fontSize: 10 }}>
                link · resolved_in_push
              </text>
              <text x="597" y="148" textAnchor="middle" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>
                aggregate
              </text>
              <text x="710" y="222" textAnchor="start" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>
                export
              </text>

              {/* axis labels: refs reales a la capa del frontend */}
              <text x="20" y="32" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>
                src/services · external
              </text>
              <text x="420" y="32" fill="hsl(var(--brand))" style={{ fontSize: 10 }}>
                src/services/tasks · core
              </text>
              <text x="620" y="32" fill="hsl(var(--text-dim))" style={{ fontSize: 10 }}>
                src/app/utils + reportExport
              </text>
              <line x1="20" y1="42" x2="840" y2="42" stroke="hsl(var(--line))" strokeWidth="0.5" opacity="0.6" />

              {/* legend bottom */}
              <text x="20" y="350" fill="hsl(var(--text-dim))" style={{ fontSize: 9 }}>
                sparkline = ultimas 12 muestras simuladas · tick ~2.2-4s · sin telemetria real
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
