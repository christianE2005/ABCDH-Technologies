import type { ApiBoard, ApiProject, ApiTask } from '../../services/types';

export type ProjectHealth = 'green' | 'yellow' | 'red';

export interface ProjectProgress {
  completed: number;
  total: number;
  percentage: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const NEAR_DEADLINE_DAYS = 14;
// How far behind the expected (time-based) progress a project may fall before it is flagged.
const AT_RISK_SHORTFALL = 15;   // behind by this many points → "en riesgo"
const CRITICAL_SHORTFALL = 35;  // behind by this many points → "crítico"

export function computeProjectProgress(
  projectId: number,
  tasks: Array<Pick<ApiTask, 'project' | 'board' | 'completed_at'>>,
  boards: Array<Pick<ApiBoard, 'id_board' | 'project'>>,
): ProjectProgress {
  const projectBoardIds = new Set(
    boards.filter((board) => board.project === projectId).map((board) => board.id_board),
  );

  let total = 0;
  let completed = 0;
  for (const task of tasks) {
    const belongs = task.project === projectId
      || (task.board != null && projectBoardIds.has(task.board));
    if (!belongs) continue;
    total += 1;
    if (task.completed_at) completed += 1;
  }

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}

/**
 * Health is judged by comparing how far through the schedule the project is
 * against how much of the work is done. A project that is keeping pace with its
 * timeline is healthy — being early-stage with low completion is NOT "at risk".
 */
export function getProjectHealth(
  project: Pick<ApiProject, 'created_at' | 'end_date' | 'status'>,
  progress: ProjectProgress,
  now: Date = new Date(),
): ProjectHealth {
  const pct = progress.percentage;

  // Work is finished → healthy.
  if (progress.total > 0 && pct >= 100) return 'green';

  const nowTime = now.getTime();
  const endTime = project.end_date ? new Date(project.end_date).getTime() : null;
  const startTime = project.created_at ? new Date(project.created_at).getTime() : null;

  // Past the deadline without finishing → critical.
  if (endTime !== null && endTime < nowTime) return 'red';

  // No usable schedule to judge against → we can't infer timing risk, treat as healthy.
  if (endTime === null || startTime === null || endTime <= startTime) return 'green';

  // Expected progress if the project advanced linearly across its timeline.
  const elapsedRatio = Math.min(1, Math.max(0, (nowTime - startTime) / (endTime - startTime)));
  const expectedPct = elapsedRatio * 100;
  const shortfall = expectedPct - pct; // positive = behind schedule

  if (shortfall >= CRITICAL_SHORTFALL) return 'red';
  if (shortfall >= AT_RISK_SHORTFALL) return 'yellow';

  // Deadline is near and a meaningful chunk of work still remains → at risk.
  const daysRemaining = (endTime - nowTime) / DAY_MS;
  if (daysRemaining < NEAR_DEADLINE_DAYS && pct < 80) return 'yellow';

  return 'green';
}
