import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Download, FileDown, RefreshCw, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, Clock, ListChecks, ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { ReportExportDialog } from '../components/ReportExportDialog';
import {
  useApiProjects, useApiTasks, useApiTaskWarnings, useApiBoards,
} from '../hooks/useProjectData';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { computeProjectProgress, getProjectHealth, type ProjectHealth } from '../utils/projectHealth';

const COMPLETION_TARGET = 80;

type StatusLevel = 'healthy' | 'attention' | 'risk';

interface KpiCardData {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  status: StatusLevel;
  icon: React.ReactNode;
}

function statusFromHealthMix(reds: number, yellows: number): StatusLevel {
  if (reds > 0) return 'risk';
  if (yellows > 0) return 'attention';
  return 'healthy';
}

function statusBadge(level: StatusLevel) {
  if (level === 'risk') {
    return {
      dot: 'bg-destructive',
      bar: 'border-t-destructive',
      pill: 'bg-destructive/10 text-destructive border-destructive/30',
      label: 'EN RIESGO',
    };
  }
  if (level === 'attention') {
    return {
      dot: 'bg-warning',
      bar: 'border-t-warning',
      pill: 'bg-warning/10 text-warning border-warning/30',
      label: 'REQUIERE ATENCIÓN',
    };
  }
  return {
    dot: 'bg-success',
    bar: 'border-t-success',
    pill: 'bg-success/10 text-success border-success/30',
    label: 'SALUDABLE',
  };
}

function statusLabelByLevel(l: StatusLevel) {
  if (l === 'risk') return 'crítico';
  if (l === 'attention') return 'atención';
  return 'saludable';
}

function pctDelta(curr: number, prev: number): string {
  if (prev === 0 && curr === 0) return '0%';
  if (prev === 0) return '+∞';
  const diff = Math.round(((curr - prev) / prev) * 100);
  return `${diff >= 0 ? '+' : ''}${diff}%`;
}

export default function Reports() {
  const reduced = useReducedMotion();
  const { data: projects, loading: loadingProjects, refetch: refetchProjects } = useApiProjects();
  const { data: tasks, loading: loadingTasks, statuses, priorities, refetch: refetchTasks } = useApiTasks();
  const { data: warnings, refetch: refetchWarnings } = useApiTaskWarnings();
  const { data: boards } = useApiBoards();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const loading = loadingProjects || loadingTasks;
  const refetchAll = () => { refetchProjects(); refetchTasks(); refetchWarnings(); };

  const projectList = projects ?? [];
  const taskList = tasks ?? [];
  const boardList = boards ?? [];
  const warningList = warnings ?? [];

  // Build board→project map for task filtering
  const boardProjectMap = useMemo(() => {
    const m = new Map<number, number>();
    boardList.forEach((b) => m.set(b.id_board, b.project));
    return m;
  }, [boardList]);

  // Filter context (single project selection from header chips)
  const inScopeProjects = useMemo(
    () => (selectedProject ? projectList.filter((p) => p.id_project === selectedProject) : projectList),
    [projectList, selectedProject],
  );

  const filteredTasks = useMemo(() => {
    if (!selectedProject) return taskList;
    return taskList.filter((t) => {
      if (t.project === selectedProject) return true;
      return boardProjectMap.get(t.board ?? 0) === selectedProject;
    });
  }, [taskList, selectedProject, boardProjectMap]);

  const filteredWarnings = useMemo(() => {
    if (!selectedProject) return warningList;
    const ids = new Set(filteredTasks.map((t) => t.id_task));
    return warningList.filter((w) => ids.has(w.task));
  }, [warningList, selectedProject, filteredTasks]);

  // ── Per-project health (for hero + ranking) ──
  const projectHealthList = useMemo(() => {
    return inScopeProjects.map((p) => {
      const progress = computeProjectProgress(p.id_project, taskList, boardList);
      const health = getProjectHealth(p, progress);
      const overdue = taskList.filter((t) => {
        const belongs = t.project === p.id_project
          || boardProjectMap.get(t.board ?? 0) === p.id_project;
        if (!belongs) return false;
        return !t.completed_at && t.due_date && new Date(t.due_date) < new Date();
      }).length;
      return { project: p, progress, health, overdue };
    });
  }, [inScopeProjects, taskList, boardList, boardProjectMap]);

  // ── Aggregate KPIs ──
  const kpis = useMemo(() => {
    const now = new Date();
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.completed_at != null).length;
    const overdue = filteredTasks.filter((t) => !t.completed_at && t.due_date && new Date(t.due_date) < now).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const completedWithDates = filteredTasks.filter((t) => t.completed_at && t.created_at);
    const avgDays = completedWithDates.length > 0
      ? Math.round(
          completedWithDates.reduce((sum, t) => {
            const c = new Date(t.created_at).getTime();
            const d = new Date(t.completed_at!).getTime();
            return sum + (d - c) / (1000 * 60 * 60 * 24);
          }, 0) / completedWithDates.length,
        )
      : 0;

    const activeWarnings = filteredWarnings.filter((w) => w.status === 'active').length;

    // Distinct active assignees
    const assigneeSet = new Set<number>();
    for (const t of filteredTasks) {
      if (t.completed_at) continue;
      (t.assigned_users ?? []).forEach((u) => assigneeSet.add(u.id_user));
      if (t.assigned_to != null) assigneeSet.add(t.assigned_to);
    }

    return {
      total,
      completed,
      overdue,
      completionRate,
      avgDays,
      activeWarnings,
      activeAssignees: assigneeSet.size,
    };
  }, [filteredTasks, filteredWarnings]);

  // ── Trend: completions per week (from project start) ──
  const MAX_TREND_WEEKS = 26;
  const trendData = useMemo(() => {
    const now = new Date();
    // Earliest start across in-scope projects
    const earliestStart = inScopeProjects.reduce<number | null>((min, p) => {
      if (!p.created_at) return min;
      const t = new Date(p.created_at).getTime();
      return min == null ? t : Math.min(min, t);
    }, null);

    // Anchor to the Monday of the start week (or 8 weeks ago if no project start)
    const startDate = earliestStart != null ? new Date(earliestStart) : new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
    const dow = startDate.getDay();
    startDate.setDate(startDate.getDate() - dow);

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const totalWeeks = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / msPerWeek) + 1);
    // Cap to keep chart readable: drop oldest weeks if exceeds max
    const skip = Math.max(0, totalWeeks - MAX_TREND_WEEKS);
    const weeksToShow = totalWeeks - skip;

    const weeks: { label: string; count: number; sortIndex: number }[] = [];
    for (let i = 0; i < weeksToShow; i++) {
      const wStart = new Date(startDate.getTime() + (skip + i) * msPerWeek);
      const wEnd = new Date(wStart.getTime() + msPerWeek);
      const count = filteredTasks.filter((t) => {
        if (!t.completed_at) return false;
        const d = new Date(t.completed_at);
        return d >= wStart && d < wEnd;
      }).length;
      const label = wStart.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      weeks.push({ label, count, sortIndex: i });
    }
    return weeks;
  }, [filteredTasks, inScopeProjects]);

  // ── Period comparison: second half vs first half of trend range ──
  const periodComparison = useMemo(() => {
    const n = trendData.length;
    if (n === 0) return { recent: 0, prior: 0, delta: '0%' };
    const half = Math.max(1, Math.floor(n / 2));
    const recent = trendData.slice(n - half).reduce((s, w) => s + w.count, 0);
    const prior = trendData.slice(0, n - half).reduce((s, w) => s + w.count, 0);
    return { recent, prior, delta: pctDelta(recent, prior) };
  }, [trendData]);

  // ── Portfolio aggregate stats ──
  const portfolioStats = useMemo(() => {
    const reds = projectHealthList.filter((p) => p.health === 'red').length;
    const yellows = projectHealthList.filter((p) => p.health === 'yellow').length;
    const greens = projectHealthList.filter((p) => p.health === 'green').length;
    const totalProgress = projectHealthList.reduce((sum, p) => sum + p.progress.percentage, 0);
    const healthScore = projectHealthList.length > 0
      ? Math.round(totalProgress / projectHealthList.length)
      : 0;
    const overallStatus: StatusLevel = statusFromHealthMix(reds, yellows);
    return { reds, yellows, greens, healthScore, overallStatus, count: projectHealthList.length };
  }, [projectHealthList]);

  // ── Insights ──
  const insights = useMemo(() => {
    const out: { tone: 'good' | 'warn' | 'bad'; text: string }[] = [];

    // Velocity insight
    if (periodComparison.prior > 0 || periodComparison.recent > 0) {
      const diffNum = periodComparison.recent - periodComparison.prior;
      if (diffNum > 0) {
        out.push({
          tone: 'good',
          text: `Velocidad ${periodComparison.delta} vs el periodo anterior (${periodComparison.recent} completadas en la segunda mitad del periodo).`,
        });
      } else if (diffNum < 0) {
        out.push({
          tone: 'warn',
          text: `Velocidad ${periodComparison.delta} vs el periodo anterior — se completaron ${Math.abs(diffNum)} tareas menos.`,
        });
      }
    }

    // Completion rate vs target
    if (kpis.total > 0) {
      if (kpis.completionRate >= COMPLETION_TARGET) {
        out.push({
          tone: 'good',
          text: `Tasa de completado ${kpis.completionRate}% por encima de la meta (${COMPLETION_TARGET}%).`,
        });
      } else {
        out.push({
          tone: 'warn',
          text: `Tasa de completado ${kpis.completionRate}% bajo la meta de ${COMPLETION_TARGET}%.`,
        });
      }
    }

    // At-risk projects
    const worst = [...projectHealthList]
      .filter((p) => p.overdue > 0 || p.health === 'red')
      .sort((a, b) => b.overdue - a.overdue)[0];
    if (worst) {
      out.push({
        tone: 'bad',
        text: `"${worst.project.name}" requiere atención: ${worst.overdue} ${worst.overdue === 1 ? 'tarea vencida' : 'tareas vencidas'}.`,
      });
    } else if (kpis.activeWarnings > 0) {
      out.push({
        tone: 'warn',
        text: `Hay ${kpis.activeWarnings} ${kpis.activeWarnings === 1 ? 'warning activo' : 'warnings activos'} sin resolver.`,
      });
    } else if (projectHealthList.length > 0) {
      out.push({
        tone: 'good',
        text: 'Todos los proyectos están dentro de plazos y sin warnings críticos.',
      });
    }

    return out.slice(0, 3);
  }, [periodComparison, kpis, projectHealthList]);

  // ── KPI cards ──
  const kpiCards: KpiCardData[] = useMemo(() => {
    const pending = Math.max(0, kpis.total - kpis.completed);
    const completedStatus: StatusLevel =
      kpis.total === 0 ? 'attention'
      : kpis.completionRate >= COMPLETION_TARGET ? 'healthy'
      : kpis.completionRate >= 50 ? 'attention'
      : 'risk';
    const pendingStatus: StatusLevel =
      pending === 0 ? 'healthy' : pending <= 10 ? 'attention' : 'risk';
    const overdueStatus: StatusLevel =
      kpis.overdue === 0 ? 'healthy' : kpis.overdue <= 3 ? 'attention' : 'risk';

    return [
      {
        label: 'TOTAL TAREAS',
        value: String(kpis.total),
        delta: kpis.total === 1 ? 'tarea registrada' : 'tareas registradas',
        status: 'healthy',
        icon: <ListChecks className="w-4 h-4" />,
      },
      {
        label: 'COMPLETADAS',
        value: String(kpis.completed),
        delta: kpis.total > 0 ? `${kpis.completionRate}% del total` : 'sin tareas',
        status: completedStatus,
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      {
        label: 'PENDIENTES',
        value: String(pending),
        delta: pending === 1 ? 'tarea por completar' : 'tareas por completar',
        status: pendingStatus,
        icon: <Clock className="w-4 h-4" />,
      },
      {
        label: 'VENCIDAS',
        value: String(kpis.overdue),
        delta: kpis.overdue === 1 ? 'pasó su fecha límite' : 'pasaron su fecha límite',
        status: overdueStatus,
        icon: <AlertTriangle className="w-4 h-4" />,
      },
    ];
  }, [kpis]);

  // ── Ranking de proyectos por salud (worst first) ──
  const projectRanking = useMemo(() => {
    const healthOrder: Record<ProjectHealth, number> = { red: 0, yellow: 1, green: 2 };
    return [...projectHealthList]
      .sort((a, b) => {
        const h = healthOrder[a.health] - healthOrder[b.health];
        if (h !== 0) return h;
        return a.progress.percentage - b.progress.percentage;
      })
      .slice(0, 5);
  }, [projectHealthList]);

  // ── Project filter pills ──
  const projectFilters = useMemo(() => {
    return [
      {
        label: 'Todos',
        active: selectedProject === null,
        count: projectList.length,
        onClick: () => setSelectedProject(null),
      },
      ...projectList.map((p) => ({
        label: p.name,
        active: selectedProject === p.id_project,
        onClick: () => setSelectedProject(p.id_project),
      })),
    ];
  }, [projectList, selectedProject]);

  // ── Export CSV (kept as quick action) ──
  const exportCSV = () => {
    const rows = filteredTasks.map((t) => ({
      id: t.id_task,
      title: t.title,
      assigned_to: t.assigned_to ?? '',
      due_date: t.due_date ?? '',
      completed_at: t.completed_at ?? '',
      created_at: t.created_at,
    }));
    const headers = Object.keys(rows[0] ?? {});
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${String(r[h as keyof typeof r]).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-tareas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="px-4 pb-6 pt-3 max-w-[1600px] min-h-full flex flex-col gap-4">
        <div className="h-7 w-40 rounded-sm bg-surface-secondary animate-pulse" />
        <div className="h-28 rounded-lg border border-border bg-card animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 h-64 rounded-lg border border-border bg-card animate-pulse" />
          <div className="h-64 rounded-lg border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  const hero = statusBadge(portfolioStats.overallStatus);

  return (
    <div className="px-4 pb-6 pt-3 max-w-[1600px] min-h-full flex flex-col gap-4">
      <ReportExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        projects={projectList}
        tasks={taskList}
        statuses={statuses}
        priorities={priorities}
        boards={boardList}
        warnings={warningList}
      />

      {/* Header sobre el lienzo (shell unificado) */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-[-0.01em] text-foreground">Reportes</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">Salud del portafolio, tendencia de completado y atención prioritaria.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 h-9 text-[12px] font-medium text-foreground transition-all [transition-timing-function:var(--ease-out)] hover:bg-accent active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
            <button
              type="button"
              onClick={refetchAll}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 h-9 text-[12px] font-medium text-foreground transition-all [transition-timing-function:var(--ease-out)] hover:bg-accent active:scale-[0.98]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refrescar
            </button>
            <Button type="button" variant="primary-brand" onClick={() => setExportDialogOpen(true)} className="shrink-0">
              <FileDown className="w-4 h-4" /> Descargar reporte
            </Button>
          </div>
        </div>

        {/* Project filter chips */}
        <div className="flex flex-wrap gap-2">
          {projectFilters.map((f) => {
            const count = 'count' in f ? f.count : undefined;
            return (
              <button
                key={f.label}
                type="button"
                aria-pressed={f.active}
                onClick={f.onClick}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${f.active ? 'bg-secondary text-foreground border border-border' : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-accent'}`}
              >
                {f.label}
                {count != null && (
                  <span className={`tabular-nums text-[10px] ${f.active ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* HERO STATUS CARD */}
        <div className={`relative bg-card border border-border border-t-2 ${hero.bar} rounded-lg p-6`}>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-[260px]">
              <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-medium tracking-[0.06em] ${hero.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${hero.dot}`} />
                {hero.label}
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <div className="text-[44px] leading-none font-semibold text-foreground tabular-nums">
                  {portfolioStats.healthScore}%
                </div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Salud del portafolio
                </div>
              </div>

              {/* Insights */}
              <div className="mt-4 space-y-1.5">
                {insights.length === 0 ? (
                  <div className="text-[12px] text-muted-foreground">Sin insights disponibles.</div>
                ) : (
                  insights.map((ins, i) => {
                    const toneColor =
                      ins.tone === 'bad'
                        ? 'text-destructive'
                        : ins.tone === 'warn'
                        ? 'text-warning'
                        : 'text-success';
                    const Icon =
                      ins.tone === 'bad' ? AlertTriangle : ins.tone === 'warn' ? TrendingDown : TrendingUp;
                    return (
                      <div key={i} className="flex items-start gap-2 text-[12px]">
                        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${toneColor}`} />
                        <span className="text-foreground">{ins.text}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right side stats */}
            <div className="flex flex-col items-end gap-3 text-right min-w-[180px]">
              <div>
                <div className="text-[28px] leading-none font-semibold text-foreground tabular-nums">
                  {portfolioStats.count}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {portfolioStats.count === 1 ? 'proyecto' : 'proyectos'}
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-muted-foreground">{portfolioStats.greens} ok</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-muted-foreground">{portfolioStats.yellows} atención</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">{portfolioStats.reds} riesgo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI CATEGORY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpiCards.map((c, i) => {
            const s = statusBadge(c.status);
            return (
              <motion.div
                key={c.label}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.22, delay: reduced ? 0 : i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                    {c.icon}
                    {c.label}
                  </div>
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} title={statusLabelByLevel(c.status)} />
                </div>
                <div className="text-[26px] font-semibold text-foreground leading-tight tabular-nums">{c.value}</div>
                {c.delta && (
                  <div className="text-[11px] text-muted-foreground mt-1">{c.delta}</div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* TREND CHART + PROJECT RANKING */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] font-medium tracking-[0.06em] text-muted-foreground">
                  TENDENCIA · {trendData.length} {trendData.length === 1 ? 'SEMANA' : 'SEMANAS'}
                </div>
                <div className="text-[14px] font-semibold text-foreground mt-0.5">
                  Tareas completadas por semana
                </div>
              </div>
              <div className="text-right">
                <div className="text-[20px] font-semibold text-foreground leading-none tabular-nums">
                  {periodComparison.recent}
                </div>
                <div className={`text-[11px] font-medium ${
                  periodComparison.recent >= periodComparison.prior ? 'text-success' : 'text-destructive'
                }`}>
                  {periodComparison.delta} vs anterior
                </div>
              </div>
            </div>
            {trendData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: 'var(--elevation-2)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Completadas"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#trendFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-[12px] text-muted-foreground">
                Sin tareas completadas en este periodo
              </div>
            )}
          </div>

          {/* Project ranking */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-[10px] font-medium tracking-[0.06em] text-muted-foreground mb-3">
              ATENCIÓN PRIORITARIA
            </div>
            {projectRanking.length === 0 ? (
              <div className="text-[12px] text-muted-foreground py-4 text-center">
                Sin proyectos.
              </div>
            ) : (
              <div className="space-y-2">
                {projectRanking.map(({ project, progress, health, overdue }) => {
                  const dotColor =
                    health === 'red' ? 'bg-destructive' : health === 'yellow' ? 'bg-warning' : 'bg-success';
                  return (
                    <div
                      key={project.id_project}
                      className="flex items-center gap-2.5 py-1.5 border-b border-border last:border-b-0"
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-foreground truncate">
                          {project.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {progress.percentage}% · {overdue} {overdue === 1 ? 'vencida' : 'vencidas'}
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
