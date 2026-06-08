import type { ApiSprint, ApiTask } from '../../services';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface BurndownPoint {
  label: string;
  ideal: number;
  real: number | null;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Parses a story-point value (string|null) into a number, defaulting to 0. */
export function parseStoryPoints(value: string | null | undefined): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Builds an ideal-vs-real remaining-work series for a sprint.
 * `getWeight` decides the unit — task count (default) or story points.
 * The "real" line is plotted only up to today and relies on `completed_at`
 * for the time dimension (the only timestamped completion signal we have).
 */
export function buildBurndownSeries(
  sprint: Pick<ApiSprint, 'start_date' | 'end_date'> | null | undefined,
  tasks: ApiTask[],
  now: Date,
  getWeight: (task: ApiTask) => number = () => 1,
): BurndownPoint[] {
  if (!sprint?.start_date || !sprint?.end_date) return [];
  const start = startOfDay(new Date(sprint.start_date));
  const end = startOfDay(new Date(sprint.end_date));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (end.getTime() < start.getTime()) return [];

  const dayCount = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  if (dayCount <= 1 || dayCount > 200) return [];

  const total = tasks.reduce((sum, t) => sum + getWeight(t), 0);
  const today = startOfDay(now).getTime();
  const series: BurndownPoint[] = [];

  for (let i = 0; i < dayCount; i++) {
    const d = new Date(start.getTime() + i * DAY_MS);
    const ideal = Number((total * (1 - i / (dayCount - 1))).toFixed(1));
    let real: number | null = null;
    if (d.getTime() <= today) {
      const endOfDay = d.getTime() + DAY_MS - 1;
      const completedWeight = tasks
        .filter((t) => t.completed_at && new Date(t.completed_at).getTime() <= endOfDay)
        .reduce((sum, t) => sum + getWeight(t), 0);
      real = Number((total - completedWeight).toFixed(1));
    }
    series.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, ideal, real });
  }
  return series;
}
