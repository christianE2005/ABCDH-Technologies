import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Briefcase, ArrowRight, RefreshCw, CheckCircle2, Timer, ListChecks,
  AlertTriangle, GitCommit, Calendar, TrendingUp, TrendingDown,
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import {
  useApiBoards, useApiBoardColumns, useApiProjectMembers, useApiProjects, useApiTasks,
  useApiTaskAssignments, useApiTaskWarnings, useApiGithubPushes, useApiSprints,
} from '../hooks/useProjectData';
import { useAuth } from '../context/AuthContext';
import { shouldShowInGenericProjectDisplays, compareProjectsForGenericPriority } from '../utils/projectStatus';
import { formatProjectDate } from '../utils/projectDates';
import { computeProjectProgress } from '../utils/projectHealth';
import { buildBurndownSeries } from '../utils/burndown';
import type { ApiSprint } from '../../services';

const PANEL_PAGE_SIZE = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function relativeDueLabel(dueIso: string, now: Date): { label: string; tone: 'overdue' | 'today' | 'tomorrow' | 'soon' } {
  const due = startOfDay(new Date(dueIso));
  const today = startOfDay(now);
  const diff = Math.round((due.getTime() - today.getTime()) / DAY_MS);
  if (diff < 0) {
    const abs = Math.abs(diff);
    return { label: abs === 1 ? 'vencida ayer' : `vencida hace ${abs}d`, tone: 'overdue' };
  }
  if (diff === 0) return { label: 'HOY', tone: 'today' };
  if (diff === 1) return { label: 'mañana', tone: 'tomorrow' };
  return { label: `en ${diff}d`, tone: 'soon' };
}

function taskStatusColor(name: string) {
  const n = name.trim().toLowerCase();
  if (n.includes('backlog')) return '#64748b';
  if (n.includes('to do') || n.includes('por hacer') || n.includes('todo')) return '#0ea5e9';
  if (n.includes('progress') || n.includes('progreso') || n.includes('curso')) return '#f59e0b';
  if (n.includes('review') || n.includes('revisión') || n.includes('revision')) return '#8b5cf6';
  if (n.includes('done') || n.includes('completad') || n.includes('finalizad') || n.includes('hecho')) return '#22c55e';
  if (n.includes('block') || n.includes('bloque')) return '#ef4444';
  return '#14b8a6';
}

type KpiAccent = 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'ai';

interface KpiDef {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor?: KpiAccent;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = useMemo(() => Number(user?.id ?? 0), [user?.id]);
  const validUserId = !Number.isNaN(currentUserId) && currentUserId > 0 ? currentUserId : null;

  const { data: projects, loading: loadingProjects, error: errorProjects, refetch: refetchProjects } = useApiProjects();
  const { data: tasks, loading: loadingTasks, refetch: refetchTasks } = useApiTasks();
  const { data: boards, loading: loadingBoards } = useApiBoards();
  const { data: columns } = useApiBoardColumns();
  const { data: sprints } = useApiSprints();
  const { data: myProjectMemberships, loading: loadingMemberships } = useApiProjectMembers(undefined, validUserId ?? undefined);
  const taskIds = useMemo(() => (tasks ?? []).map((t) => t.id_task), [tasks]);
  const { data: taskAssignments } = useApiTaskAssignments(taskIds);
  const { data: warnings } = useApiTaskWarnings({ status: 'active' });
  const { data: pushes } = useApiGithubPushes();

  const isStakeholderUser = user?.role === 'stakeholder';
  const isAdminUser = user?.role === 'admin';
  // Admins & project managers see the whole team; everyone else sees only their own tasks.
  const isManagerView = user?.role === 'admin' || user?.role === 'project_manager';

  const loading = loadingProjects || loadingTasks || loadingBoards || (isAdminUser ? false : loadingMemberships);

  const visibleProjectIds = useMemo(() => {
    if (isAdminUser) return new Set<number>((projects ?? []).map((p) => p.id_project));
    return new Set<number>((myProjectMemberships ?? []).map((m) => m.project));
  }, [isAdminUser, projects, myProjectMemberships]);

  const visibleProjects = useMemo(
    () => (projects ?? []).filter((p) => visibleProjectIds.has(p.id_project)),
    [projects, visibleProjectIds],
  );

  const projectById = useMemo(() => {
    const m = new Map<number, string>();
    visibleProjects.forEach((p) => m.set(p.id_project, p.name));
    return m;
  }, [visibleProjects]);

  const boardProjectMap = useMemo(() => {
    const m = new Map<number, number>();
    (boards ?? []).forEach((b) => m.set(b.id_board, b.project));
    return m;
  }, [boards]);

  const columnNameById = useMemo(() => {
    const m = new Map<number, string>();
    (columns ?? []).forEach((c) => m.set(c.id_column, c.name));
    return m;
  }, [columns]);

  // Set of task ids assigned to the current user (assignments table + legacy field).
  const myTaskIdSet = useMemo(() => {
    const ids = new Set<number>();
    if (validUserId == null) return ids;
    (taskAssignments ?? []).forEach((a) => { if (a.assigned_to === validUserId) ids.add(a.task); });
    (tasks ?? []).forEach((t) => { if (t.assigned_to === validUserId) ids.add(t.id_task); });
    return ids;
  }, [taskAssignments, tasks, validUserId]);

  // Tasks within the user's visible projects.
  const scopedTasks = useMemo(() => {
    if (visibleProjectIds.size === 0) return [];
    return (tasks ?? []).filter((t) => {
      if (t.project != null && visibleProjectIds.has(t.project)) return true;
      const pid = boardProjectMap.get(t.board ?? 0);
      return pid != null && visibleProjectIds.has(pid);
    });
  }, [tasks, boardProjectMap, visibleProjectIds]);

  // What the dashboard is "about": everything for managers, only my tasks for regular users.
  const dashboardTasks = useMemo(
    () => (isManagerView ? scopedTasks : scopedTasks.filter((t) => myTaskIdSet.has(t.id_task))),
    [isManagerView, scopedTasks, myTaskIdSet],
  );

  const dashboardTaskIdSet = useMemo(() => new Set(dashboardTasks.map((t) => t.id_task)), [dashboardTasks]);
  const scopedWarnings = useMemo(
    () => (warnings ?? []).filter((w) => dashboardTaskIdSet.has(w.task)),
    [warnings, dashboardTaskIdSet],
  );

  const refetchAll = () => { refetchProjects(); refetchTasks(); };

  // ── KPIs (task-focused) ──
  const kpis = useMemo(() => {
    const tList = dashboardTasks;
    const now = new Date();
    const totalTasks = tList.length;
    const completed = tList.filter((t) => t.completed_at != null).length;
    const overdue = tList.filter((t) => !t.completed_at && t.due_date && new Date(t.due_date) < now).length;
    const open = totalTasks - completed;
    const projectCount = isManagerView
      ? visibleProjects.filter((p) => shouldShowInGenericProjectDisplays(p.status)).length
      : new Set(dashboardTasks.map((t) => t.project)).size;
    return { totalTasks, completed, open, overdue, projectCount };
  }, [dashboardTasks, visibleProjects, isManagerView]);
  const activeWarningsCount = scopedWarnings.length;

  // ── Task status distribution (donut) ──
  const taskStatusData = useMemo(() => {
    const counts = new Map<string, number>();
    dashboardTasks.forEach((t) => {
      const name = columnNameById.get(t.board_column) ?? 'Sin estado';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value, color: taskStatusColor(name) }))
      .sort((a, b) => b.value - a.value);
  }, [dashboardTasks, columnNameById]);
  const taskStatusTotal = useMemo(() => taskStatusData.reduce((s, d) => s + d.value, 0), [taskStatusData]);

  // ── Burndown ──
  const sprintOptions = useMemo(() => {
    const list = (sprints ?? []).filter((s) => visibleProjectIds.has(s.project));
    const rank = (s: ApiSprint) => (s.status === 'active' ? 0 : s.status === 'planned' ? 1 : 2);
    return [...list].sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return (b.start_date ?? '').localeCompare(a.start_date ?? '');
    });
  }, [sprints, visibleProjectIds]);

  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const activeSprintId = selectedSprintId ?? sprintOptions[0]?.id_sprint ?? null;
  const activeSprint = useMemo(
    () => sprintOptions.find((s) => s.id_sprint === activeSprintId) ?? null,
    [sprintOptions, activeSprintId],
  );
  const burndownData = useMemo(() => {
    if (!activeSprint) return [];
    const sprintTasks = dashboardTasks.filter((t) => t.sprint === activeSprint.id_sprint);
    return buildBurndownSeries(activeSprint, sprintTasks, new Date());
  }, [activeSprint, dashboardTasks]);

  // ── My tasks panel (always personal, pending only) ──
  const myTasks = useMemo(() => {
    if (validUserId == null) return [];
    return scopedTasks
      .filter((t) => !t.completed_at && myTaskIdSet.has(t.id_task))
      .sort((a, b) => {
        const ad = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
        const bd = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
        return ad - bd;
      });
  }, [scopedTasks, myTaskIdSet, validUserId]);

  const [myTasksPage, setMyTasksPage] = useState(0);
  const [pushesPage, setPushesPage] = useState(0);

  const paginatedMyTasks = useMemo(() => myTasks.slice(myTasksPage * PANEL_PAGE_SIZE, myTasksPage * PANEL_PAGE_SIZE + PANEL_PAGE_SIZE), [myTasks, myTasksPage]);
  const paginatedPushes = useMemo(() => (pushes ?? []).slice(pushesPage * PANEL_PAGE_SIZE, pushesPage * PANEL_PAGE_SIZE + PANEL_PAGE_SIZE), [pushes, pushesPage]);
  const myTasksTotalPages = Math.max(1, Math.ceil(myTasks.length / PANEL_PAGE_SIZE));
  const pushesTotalPages = Math.max(1, Math.ceil((pushes ?? []).length / PANEL_PAGE_SIZE));

  // ── Upcoming tasks (next 7 days + recent overdue) ──
  const upcomingDueTasks = useMemo(() => {
    const today = startOfDay(new Date());
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 8);
    return dashboardTasks
      .filter((t) => !t.completed_at && t.due_date && new Date(t.due_date).getTime() < cutoff.getTime())
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
  }, [dashboardTasks]);

  // ── Project cards (navigation + task progress only — no project-status/risk on the dashboard) ──
  const projectCards = useMemo(() => {
    const taskList = tasks ?? [];
    const boardList = boards ?? [];
    const relevantIds = isManagerView ? null : new Set(dashboardTasks.map((t) => t.project));
    return [...visibleProjects]
      .filter((p) => shouldShowInGenericProjectDisplays(p.status))
      .filter((p) => relevantIds == null || relevantIds.has(p.id_project))
      .sort(compareProjectsForGenericPriority)
      .map((p) => {
        const progress = computeProjectProgress(p.id_project, taskList, boardList);
        const now = new Date();
        const overdue = taskList.filter((t) => {
          const belongs = t.project === p.id_project || boardProjectMap.get(t.board ?? 0) === p.id_project;
          return belongs && !t.completed_at && t.due_date && new Date(t.due_date) < now;
        }).length;
        return { project: p, progress, overdue };
      });
  }, [visibleProjects, tasks, boards, boardProjectMap, isManagerView, dashboardTasks]);

  const isAuthExpiredError = useMemo(() => {
    if (!errorProjects) return false;
    const n = errorProjects.toLowerCase();
    return n.includes('token') || n.includes('sesion') || n.includes('sesión') || n.includes('expir') || n.includes('venc');
  }, [errorProjects]);

  if (errorProjects) {
    return (
      <div className="px-4 pt-10 text-center">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-[13px] text-destructive">
          {isAuthExpiredError ? 'Tu sesión venció. Vuelve a iniciar sesión.' : errorProjects}
        </p>
        <button
          onClick={() => { if (isAuthExpiredError) { window.location.href = '/'; return; } refetchAll(); }}
          className="mt-3 text-[12px] text-primary hover:underline"
        >
          {isAuthExpiredError ? 'Ir al inicio' : 'Reintentar'}
        </button>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] ?? '';

  const kpiList: KpiDef[] = [
    { title: 'Proyectos', value: kpis.projectCount, subtitle: isManagerView ? 'activos' : 'con tareas tuyas', icon: <Briefcase className="w-4 h-4" /> },
    { title: 'Tareas', value: kpis.totalTasks, subtitle: isManagerView ? 'en tus proyectos' : 'asignadas a ti', icon: <ListChecks className="w-4 h-4" /> },
    { title: 'Completadas', value: kpis.completed, subtitle: 'tareas terminadas', icon: <CheckCircle2 className="w-4 h-4" /> },
    { title: 'Pendientes', value: kpis.open, subtitle: 'tareas abiertas', icon: <Timer className="w-4 h-4" /> },
    { title: 'Vencidas', value: kpis.overdue, subtitle: 'requieren atención', icon: <AlertTriangle className="w-4 h-4" /> },
    { title: 'Warnings', value: activeWarningsCount, subtitle: 'alertas activas', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="px-4 pb-6 pt-3 max-w-[1600px] min-h-full flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold tracking-[-0.01em] text-foreground">Hola, {firstName}</h1>
        <button
          type="button"
          onClick={() => refetchAll()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground transition-all [transition-timing-function:var(--ease-out)] hover:bg-accent active:scale-[0.98]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>

      {/* ───────── KPI Row ───────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-card border border-border rounded-lg h-[90px] animate-pulse" />)
          : kpiList.map((kpi, i) => (
              <motion.div key={kpi.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: i * 0.04, ease: 'easeOut' }}>
                <KPICard title={kpi.title} value={kpi.value} subtitle={kpi.subtitle} icon={kpi.icon} accentColor={kpi.accentColor} />
              </motion.div>
            ))}
      </div>

      {/* ───────── Charts row: Task status donut + Burndown ───────── */}
      <div className="grid lg:grid-cols-2 gap-3 items-stretch">
        {/* Estado de Tareas (donut) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
          className="bg-card border border-border rounded-lg p-4 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-foreground">Estado de Tareas</h2>
            <span className="text-[10px] text-muted-foreground">{taskStatusTotal} total</span>
          </div>
          {taskStatusData.length > 0 ? (
            <div className="flex items-center gap-6 flex-1">
              <div className="relative w-[180px] h-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} dataKey="value" paddingAngle={3} stroke="var(--card)" strokeWidth={2}>
                      {taskStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const p = payload[0].payload as { name: string; value: number; color: string };
                        const pct = taskStatusTotal > 0 ? Math.round((p.value / taskStatusTotal) * 100) : 0;
                        return (
                          <div className="rounded-md border border-border bg-card px-2.5 py-1.5 shadow-md">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                              <span className="text-[11px] font-medium text-foreground">{p.name}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{p.value} tarea{p.value === 1 ? '' : 's'} · {pct}%</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[24px] font-bold text-foreground leading-none tabular-nums">{taskStatusTotal}</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">tareas</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {taskStatusData.map((d) => {
                  const pct = taskStatusTotal > 0 ? Math.round((d.value / taskStatusTotal) * 100) : 0;
                  return (
                    <div key={d.name}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-foreground">{d.name}</span>
                        </span>
                        <span className="text-muted-foreground tabular-nums">{d.value} <span className="text-muted-foreground/60">· {pct}%</span></span>
                      </div>
                      <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground py-8 text-center">Sin tareas para mostrar.</p>
          )}
        </motion.div>

        {/* Burndown */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.15, ease: 'easeOut' }}
          className="bg-card border border-border rounded-lg p-4 flex flex-col"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <h2 className="text-[13px] font-semibold text-foreground">Burndown</h2>
            </div>
            {sprintOptions.length > 0 && (
              <select
                value={activeSprintId ?? ''}
                onChange={(e) => setSelectedSprintId(e.target.value ? Number(e.target.value) : null)}
                className="h-7 max-w-[200px] rounded-sm border border-border bg-surface-secondary px-2 text-[11px] text-foreground"
              >
                {sprintOptions.map((s) => (
                  <option key={s.id_sprint} value={s.id_sprint}>
                    {s.name}{projectById.get(s.project) ? ` · ${projectById.get(s.project)}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
          {burndownData.length > 0 ? (
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={burndownData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} interval="preserveStartEnd" minTickGap={16} />
                  <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                  <Tooltip
                    cursor={{ stroke: 'var(--border)' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const ideal = payload.find((p) => p.dataKey === 'ideal')?.value;
                      const real = payload.find((p) => p.dataKey === 'real')?.value;
                      return (
                        <div className="rounded-md border border-border bg-card px-2.5 py-1.5 shadow-md">
                          <p className="text-[10px] font-medium text-foreground">Día {label}</p>
                          {real != null && <p className="text-[10px] text-primary mt-0.5">Restante: {real}</p>}
                          {ideal != null && <p className="text-[10px] text-muted-foreground">Ideal: {ideal}</p>}
                        </div>
                      );
                    }}
                  />
                  <Line type="monotone" dataKey="ideal" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Ideal" />
                  <Line type="monotone" dataKey="real" stroke="var(--primary)" strokeWidth={2} dot={false} connectNulls name="Real" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-8 text-center">
              <p className="text-[12px] text-muted-foreground">
                {sprintOptions.length === 0 ? 'No hay sprints con fechas para graficar.' : 'Este sprint no tiene tareas o fechas válidas.'}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ───────── Próximas a Vencer ───────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.2, ease: 'easeOut' }}
        className="bg-card border border-border rounded-lg flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-[13px] font-semibold text-foreground">Próximas a Vencer</h2>
          </div>
          <span className="text-[10px] text-muted-foreground">{upcomingDueTasks.length} en 7 días</span>
        </div>
        {upcomingDueTasks.length === 0 ? (
          <div className="py-8 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-[12px] text-muted-foreground">Sin tareas próximas a vencer.</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">Estás al día.</p>
            </div>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto scrollbar-app divide-y divide-border">
            {upcomingDueTasks.slice(0, 12).map((task) => {
              const rel = relativeDueLabel(task.due_date!, new Date());
              const projectId = task.project ?? boardProjectMap.get(task.board ?? 0);
              const projectName = projectId ? (projectById.get(projectId) ?? `Proyecto #${projectId}`) : 'Sin proyecto';
              const dotColor = rel.tone === 'overdue' ? 'bg-destructive' : rel.tone === 'today' ? 'bg-warning' : rel.tone === 'tomorrow' ? 'bg-info' : 'bg-success';
              const pillCls =
                rel.tone === 'overdue' ? 'text-destructive bg-destructive/10 border-destructive/30'
                : rel.tone === 'today' ? 'text-warning bg-warning/10 border-warning/30'
                : rel.tone === 'tomorrow' ? 'text-info bg-info/10 border-info/30'
                : 'text-success bg-success/10 border-success/30';
              return (
                <button
                  key={task.id_task}
                  type="button"
                  onClick={() => projectId && navigate(`/projects/${projectId}?task=${task.id_task}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30 transition-colors text-left"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-foreground truncate">{task.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{projectName}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${pillCls}`}>{rel.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ───────── Project cards (navigation + progress) ───────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.25, ease: 'easeOut' }}
        className="bg-card border border-border rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-foreground">Mis Proyectos</h2>
          <Link to="/projects" className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="bg-secondary/40 border border-border rounded-md h-[110px] animate-pulse" />)}
          </div>
        ) : projectCards.length === 0 ? (
          <div className="py-10 text-center text-[12px] text-muted-foreground">No tienes proyectos asignados.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projectCards.slice(0, 6).map(({ project, progress, overdue }) => (
              <button
                key={project.id_project}
                type="button"
                onClick={() => navigate(`/projects/${project.id_project}`)}
                className="bg-card border border-border rounded-md p-3.5 hover:bg-accent/20 hover:border-primary/40 transition-colors text-left"
              >
                <h3 className="text-[13px] font-semibold text-foreground truncate mb-2">{project.name}</h3>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progress.percentage}%` }} />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground tabular-nums">{progress.percentage}%</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{progress.completed} de {progress.total} tareas</span>
                  {overdue > 0 ? (
                    <span className="text-destructive font-medium inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{overdue} {overdue === 1 ? 'vencida' : 'vencidas'}</span>
                  ) : (
                    <span className="text-success">Al día</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* ───────── Bottom: My Tasks + Git Activity ───────── */}
      <div className="grid xl:grid-cols-2 gap-3 items-start">
        {!isStakeholderUser && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.3, ease: 'easeOut' }}
            className="bg-card border border-border rounded-lg flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <h2 className="text-[13px] font-semibold text-foreground">Mis Tareas Pendientes</h2>
                {myTasks.length > 0 && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{myTasks.length}</span>}
              </div>
              <Link to="/backlog" className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1">Ver Backlog <ArrowRight className="w-3 h-3" /></Link>
            </div>
            {loadingTasks ? (
              <div className="p-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-6 animate-pulse bg-secondary rounded" />)}</div>
            ) : myTasks.length === 0 ? (
              <div className="py-8 text-center text-[12px] text-muted-foreground">Sin tareas pendientes.</div>
            ) : (
              <>
                <div className="max-h-[360px] overflow-y-auto scrollbar-app divide-y divide-border">
                  {paginatedMyTasks.map((task) => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                    const projectId = task.project ?? boardProjectMap.get(task.board ?? 0);
                    const projectName = projectId ? (projectById.get(projectId) ?? `Proyecto #${projectId}`) : 'Sin proyecto';
                    const statusLabel = columnNameById.get(task.board_column) ?? 'Sin estado';
                    const statusCol = taskStatusColor(statusLabel);
                    return (
                      <button
                        key={task.id_task}
                        type="button"
                        onClick={() => projectId && navigate(`/projects/${projectId}?task=${task.id_task}`)}
                        className="w-full px-4 py-2.5 hover:bg-accent/30 transition-colors flex items-center gap-3 text-left"
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusCol }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-foreground truncate">{task.title}</div>
                          <div className="flex items-center gap-2 mt-0.5 min-w-0">
                            <span className="text-[10px] text-muted-foreground truncate">{projectName}</span>
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${statusCol}1a`, color: statusCol }}>{statusLabel}</span>
                          </div>
                        </div>
                        {task.due_date && <span className={`text-[10px] whitespace-nowrap ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{formatProjectDate(task.due_date)}</span>}
                      </button>
                    );
                  })}
                </div>
                {myTasksTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-1.5 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">Página {myTasksPage + 1} de {myTasksTotalPages}</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setMyTasksPage((p) => Math.max(0, p - 1))} disabled={myTasksPage === 0} className="h-6 px-2 border border-border rounded-sm text-[10px] hover:bg-accent disabled:opacity-50">‹ Ant.</button>
                      <button type="button" onClick={() => setMyTasksPage((p) => Math.min(myTasksTotalPages - 1, p + 1))} disabled={myTasksPage >= myTasksTotalPages - 1} className="h-6 px-2 border border-border rounded-sm text-[10px] hover:bg-accent disabled:opacity-50">Sig. ›</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Git Activity */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.35, ease: 'easeOut' }}
          className="bg-card border border-border rounded-lg flex flex-col"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <GitCommit className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-[13px] font-semibold text-foreground">Actividad Reciente (Git)</h2>
          </div>
          {!pushes || pushes.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-muted-foreground">Sin push events recientes.</div>
          ) : (
            <>
              <div className="max-h-[360px] overflow-y-auto scrollbar-app divide-y divide-border">
                {paginatedPushes.map((push) => {
                  const commitCount = Array.isArray(push.commits) ? push.commits.length : 0;
                  return (
                    <div key={push.id_push} className="px-4 py-2.5 hover:bg-accent/30 transition-colors flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">{(push.pusher ?? '?').charAt(0).toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-medium text-foreground truncate">{push.pusher ?? 'unknown'}</span>
                          <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm shrink-0">{push.ref?.replace('refs/heads/', '') ?? 'main'}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{commitCount} commit{commitCount !== 1 ? 's' : ''} · {new Date(push.received_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {pushesTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-1.5 border-t border-border">
                  <span className="text-[10px] text-muted-foreground">Página {pushesPage + 1} de {pushesTotalPages}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setPushesPage((p) => Math.max(0, p - 1))} disabled={pushesPage === 0} className="h-6 px-2 border border-border rounded-sm text-[10px] hover:bg-accent disabled:opacity-50">‹ Ant.</button>
                    <button type="button" onClick={() => setPushesPage((p) => Math.min(pushesTotalPages - 1, p + 1))} disabled={pushesPage >= pushesTotalPages - 1} className="h-6 px-2 border border-border rounded-sm text-[10px] hover:bg-accent disabled:opacity-50">Sig. ›</button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
