import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

type Metric = {
  key: string;
  label: string;
  value: number;
  suffix: string;
  precision: number;
};

// Cada metrica corresponde a un concepto que ya existe en el modelo del frontend:
// - avance_portafolio:  promedio de ProjectProgress.percentage (utils/projectHealth.ts).
// - proyectos_activos:  count(ApiProject) con status activo.
// - tareas_en_curso:    count(ApiTask) sin completed_at.
// - avisos_activos:     count(ApiTaskWarning) status = 'active'.
// Los valores son fixtures demo: sin login no hay endpoint enchufado. Cuando exista,
// reemplazar por hooks tipo useApiProjects/useApiTasks de useProjectData.ts.
const INITIAL: Metric[] = [
  { key: 'avance',     label: 'avance_portafolio', value: 62.4, suffix: '%', precision: 1 },
  { key: 'proyectos',  label: 'proyectos_activos', value: 14,   suffix: '',  precision: 0 },
  { key: 'tareas',     label: 'tareas_en_curso',   value: 187,  suffix: '',  precision: 0 },
  { key: 'avisos',     label: 'avisos_activos',    value: 5,    suffix: '',  precision: 0 },
];

function tick(metric: Metric): number {
  const direction = Math.random() < 0.5 ? -1 : 1;
  if (metric.precision === 0) {
    // Conteos discretos: tick ±1 ocasional, mayoria de las veces nada.
    return Math.max(0, metric.value + (Math.random() < 0.55 ? direction : 0));
  }
  const delta = direction * (0.1 + Math.random() * 0.4);
  return Number((metric.value + delta).toFixed(metric.precision));
}

function nextDelay(): number {
  return 3000 + Math.random() * 3000;
}

export function MetricStrip() {
  const reduced = useReducedMotion();
  const [metrics, setMetrics] = useState<Metric[]>(INITIAL);
  const [flashKey, setFlashKey] = useState<string | null>(null);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let pendingTick: number | null = null;
    let pendingFlash: number | null = null;

    const schedule = () => {
      pendingTick = window.setTimeout(() => {
        if (cancelled) return;
        const idx = Math.floor(Math.random() * INITIAL.length);
        setMetrics((prev) =>
          prev.map((m, i) => (i === idx ? { ...m, value: tick(m) } : m)),
        );
        const flashedKey = INITIAL[idx].key;
        setFlashKey(flashedKey);
        pendingFlash = window.setTimeout(() => {
          if (!cancelled) setFlashKey(null);
        }, 80);
        schedule();
      }, nextDelay());
    };

    schedule();

    return () => {
      cancelled = true;
      if (pendingTick !== null) window.clearTimeout(pendingTick);
      if (pendingFlash !== null) window.clearTimeout(pendingFlash);
    };
  }, [reduced]);

  return (
    <div
      role="group"
      aria-label="Metricas del portafolio (fixtures demo, sin endpoint conectado)"
      className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[hsl(var(--line))] border border-[hsl(var(--line))]"
    >
      {metrics.map((m) => {
        const flashing = flashKey === m.key;
        return (
          <div
            key={m.key}
            className="bg-[hsl(var(--panel))] px-4 py-5 [font-family:var(--font-mono)]"
          >
            <p className="text-[10px] uppercase tracking-tight text-[hsl(var(--text-dim))] mb-2">
              {m.label}
            </p>
            <p
              className={
                'text-2xl md:text-3xl tabular-nums leading-none ' +
                (flashing
                  ? 'text-[hsl(var(--brand))]'
                  : 'text-[hsl(var(--text))]')
              }
            >
              {m.value.toFixed(m.precision)}
              {m.suffix}
            </p>
          </div>
        );
      })}
    </div>
  );
}
