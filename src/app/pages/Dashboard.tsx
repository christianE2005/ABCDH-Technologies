import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Briefcase, ArrowRight, RefreshCw,
  CheckCircle2, Timer, ListChecks, AlertTriangle, Loader2,
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import { CommandBar } from '../components/CommandBar';
import { useApiProjects, useApiTasks, useApiTaskAssignments, useApiTaskWarnings, useApiGithubPushes } from '../hooks/useProjectData';
import { useAuth } from '../context/AuthContext';
import { compareProjectsForGenericPriority, getProjectStatusBadge, getProjectStatusChartColor, getProjectStatusLabel, normalizeProjectStatus, shouldShowInGenericProjectDisplays } from '../utils/projectStatus';
import { formatProjectDate, getProjectDaysLabel } from '../utils/projectDates';

const DASHBOARD_PANEL_BATCH_SIZE = 10;
const DASHBOARD_PROJECT_SLOTS = 8;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: projects, loading: loadingProjects, error: errorProjects, refetch: refetchProjects } = useApiProjects();
  const { data: tasks, loading: loadingTasks, statuses, refetch: refetchTasks } = useApiTasks();
  const taskIds = useMemo(() => (tasks ?? []).map((task) => task.id_task), [tasks]);
  const { data: taskAssignments } = useApiTaskAssignments(taskIds);
  const { data: warnings } = useApiTaskWarnings({ status: 'active' });
  const { data: pushes } = useApiGithubPushes();

  const loading = loadingProjects || loadingTasks;

  const refetchAll = () => { refetchProjects(); refetchTasks(); };

  // ── Derived KPIs ──
  const kpis = useMemo(() => {
    const pList = (projects ?? []).filter((project) => shouldShowInGenericProjectDisplays(project.status));
    const tList = tasks ?? [];
    const now = new Date();

    const totalProjects = pList.length;
    const totalTasks = tList.length;
    const completedTasks = tList.filter((t) => t.completed_at != null).length;
    const overdueTasks = tList.filter((t) => {
      if (t.completed_at) return false;
      if (!t.due_date) return false;
      return new Date(t.due_date) < now;
    }).length;
    const openTasks = totalTasks - completedTasks;

    return { totalProjects, totalTasks, completedTasks, openTasks, overdueTasks };
  }, [projects, tasks]);

  const activeWarningsCount = (warnings ?? []).length;
  const myTasks = useMemo(() => {
    if (!tasks || !user) return [];
    const currentUserId = Number(user.id);
    const assignmentMap = new Map<number, Set<number>>();

    (taskAssignments ?? []).forEach((assignment) => {
      const existing = assignmentMap.get(assignment.task) ?? new Set<number>();
      existing.add(assignment.assigned_to);
      assignmentMap.set(assignment.task, existing);
    });

    return tasks.filter((task) => {
      if (task.completed_at) return false;
      const assignedUsers = assignmentMap.get(task.id_task);
      if (assignedUsers && assignedUsers.size > 0) {
        return assignedUsers.has(currentUserId);
      }
      return task.assigned_to === currentUserId;
    });
  }, [tasks, taskAssignments, user]);
  const [myTasksPage, setMyTasksPage] = useState(0);
  const [pushesPage, setPushesPage] = useState(0);

  const paginatedMyTasks = useMemo(() => {
    const start = myTasksPage * DASHBOARD_PANEL_BATCH_SIZE;
    return myTasks.slice(start, start + DASHBOARD_PANEL_BATCH_SIZE);
  }, [myTasks, myTasksPage]);

  const paginatedPushes = useMemo(() => {
    const start = pushesPage * DASHBOARD_PANEL_BATCH_SIZE;
    return (pushes ?? []).slice(start, start + DASHBOARD_PANEL_BATCH_SIZE);
  }, [pushes, pushesPage]);

  const myTasksTotalPages = Math.max(1, Math.ceil(myTasks.length / DASHBOARD_PANEL_BATCH_SIZE));
  const pushesTotalPages = Math.max(1, Math.ceil((pushes ?? []).length / DASHBOARD_PANEL_BATCH_SIZE));

  // ── Task distribution by status for chart ──
  const statusChartData = useMemo(() => {
    if (!tasks || statuses.length === 0) return [];
    const counts = new Map<number, number>();
    for (const t of tasks) {
      const sid = t.status ?? 0;
      counts.set(sid, (counts.get(sid) ?? 0) + 1);
    }
    return statuses.map((s) => ({
      name: s.name,
      count: counts.get(s.id_status) ?? 0,
    }));
  }, [tasks, statuses]);

  const upcomingProjects = useMemo(() => {
    if (!projects) return [];

    return [...projects]
      .filter((project) => shouldShowInGenericProjectDisplays(project.status))
      .sort(compareProjectsForGenericPriority);
  }, [projects]);

  // ── Pie data: project status distribution ──
  const projectStatusData = useMemo(() => {
    if (!projects) return [];
    const trackedStatuses = ['planning', 'in_progress', 'review', 'completed'] as const;
    const isTrackedStatus = (status: string): status is (typeof trackedStatuses)[number] => trackedStatuses.includes(status as (typeof trackedStatuses)[number]);
    const counts = new Map<string, number>();

    for (const project of projects) {
      const normalized = normalizeProjectStatus(project.status);
      if (!normalized || !isTrackedStatus(normalized)) continue;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }

    return trackedStatuses
      .filter((status) => (counts.get(status) ?? 0) > 0)
      .map((status) => ({
        key: status,
        name: getProjectStatusLabel(status),
        value: counts.get(status) ?? 0,
        color: getProjectStatusChartColor(status),
      }));
  }, [projects]);

  if (errorProjects) {
    return (
      <div className="px-4 pt-10 text-center">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-[13px] text-destructive">{errorProjects}</p>
        <button onClick={refetchAll} className="mt-3 text-[12px] text-primary hover:underline">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 pt-3 max-w-[1600px] min-h-full flex flex-col gap-3">
      <CommandBar
        actions={[
          { label: 'Actualizar', icon: <RefreshCw className="w-3.5 h-3.5" />, onClick: refetchAll },
        ]}
        rightSlot={
          <span className="text-xs text-muted-foreground">
            Hola, <span className="font-medium text-foreground">{user?.name?.split(' ')[0]}</span>
          </span>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-[4px] h-[80px] animate-pulse" />
          ))
        ) : (
          [
            { title: 'Proyectos', value: kpis.totalProjects, subtitle: 'total activos', icon: <Briefcase className="w-4 h-4" />, accentColor: 'primary' as const },
            { title: 'Tareas', value: kpis.totalTasks, subtitle: 'en todos los proyectos', icon: <ListChecks className="w-4 h-4" />, accentColor: 'info' as const },
            { title: 'Completadas', value: kpis.completedTasks, subtitle: 'tareas terminadas', icon: <CheckCircle2 className="w-4 h-4" />, accentColor: 'success' as const },
            { title: 'Pendientes', value: kpis.openTasks, subtitle: 'tareas abiertas', icon: <Timer className="w-4 h-4" />, accentColor: 'warning' as const },
            { title: 'Vencidas', value: kpis.overdueTasks, subtitle: 'requieren atención', icon: <AlertTriangle className="w-4 h-4" />, accentColor: 'destructive' as const },
            { title: 'Warnings', value: activeWarningsCount, subtitle: 'alertas activas', icon: <AlertTriangle className="w-4 h-4 text-warning" />, accentColor: 'warning' as const },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: 'easeOut' }}
            >
              <KPICard
                title={kpi.title}
                value={kpi.value}
                subtitle={kpi.subtitle}
                icon={kpi.icon}
                accentColor={kpi.accentColor}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Main grid: projects table (left) + charts (right) */}
      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-3 items-stretch min-h-[430px]">

        {/* Projects table */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
          className="bg-card border border-border rounded-[4px] h-full min-h-0 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <h2 className="text-[13px] font-semibold text-foreground">Proyectos</h2>
            <Link
              to="/projects"
              className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !projects || projects.length === 0 ? (
            <div className="py-12 text-center text-[12px] text-muted-foreground">No hay proyectos registrados.</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="grid grid-cols-[minmax(0,2.1fr)_minmax(112px,0.95fr)_minmax(120px,0.9fr)_minmax(84px,0.65fr)] gap-3 border-b border-border bg-surface-secondary/50 px-4 py-1.5">
                <span className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Proyecto</span>
                <span className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Estado</span>
                <span className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Fecha Fin</span>
                <span className="text-left text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Días rest.</span>
              </div>

              <div className="grid grid-rows-8 flex-1 min-h-0">
                {upcomingProjects.slice(0, DASHBOARD_PROJECT_SLOTS).map((project) => {
                  const dl = getProjectDaysLabel(project.end_date, project.status);
                  return (
                    <button
                      key={project.id_project}
                      type="button"
                      className="grid grid-cols-[minmax(0,2.1fr)_minmax(112px,0.95fr)_minmax(120px,0.9fr)_minmax(84px,0.65fr)] items-center gap-3 px-4 py-1.5 border-b border-border last:border-b-0 hover:bg-accent/30 transition-colors text-left min-h-0"
                      onClick={() => navigate(`/projects/${project.id_project}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{project.name}</p>
                      </div>
                      <div className="min-w-0">
                        <StatusBadge status={getProjectStatusBadge(project.status)} text={getProjectStatusLabel(project.status)} size="sm" />
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatProjectDate(project.end_date)}</span>
                      <span className={`text-[11px] ${dl.cls}`}>{dl.label}</span>
                    </button>
                  );
                })}

                {Array.from({ length: Math.max(0, DASHBOARD_PROJECT_SLOTS - upcomingProjects.slice(0, DASHBOARD_PROJECT_SLOTS).length) }).map((_, index) => (
                  <div
                    key={`dashboard-project-slot-${index}`}
                    className="border-b border-border last:border-b-0 bg-background/20"
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right column: charts */}
        <div className="grid grid-rows-2 gap-3 h-full min-h-0">

          {/* Task distribution by status */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.32, ease: 'easeOut' }}
            className="bg-card border border-border rounded-[4px] p-4 h-full min-h-0 flex flex-col"
          >
            <h2 className="text-[13px] font-semibold text-foreground mb-2">Tareas por Estado</h2>
            <div className="flex-1 min-h-0">
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)', fontSize: '11px' }}
                      labelStyle={{ color: 'var(--foreground)' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Bar dataKey="count" fill="var(--color-chart-1)" name="Tareas" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[11px] text-muted-foreground py-8 text-center">Sin datos de tareas.</p>
              )}
            </div>
          </motion.div>

          {/* Project status pie */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35, ease: 'easeOut' }}
            className="bg-card border border-border rounded-[4px] p-4 h-full min-h-0 flex flex-col"
          >
            <h2 className="text-[13px] font-semibold text-foreground mb-2">Estado de Proyectos</h2>
            {projectStatusData.length > 0 ? (
              <>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                        {projectStatusData.map((item) => (
                          <Cell key={item.key} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)', fontSize: '11px' }}
                        labelStyle={{ color: 'var(--foreground)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-1">
                  {projectStatusData.map((d) => (
                    <span key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground py-8 text-center">Sin proyectos.</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom row: My Tasks + Recent Activity */}
      <div className="grid xl:grid-cols-2 gap-3 flex-1 min-h-0">
          {/* My Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4, ease: 'easeOut' }}
            className="bg-card border border-border rounded-[4px] h-full min-h-0 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <h2 className="text-[13px] font-semibold text-foreground">Mis Tareas Pendientes</h2>
              <Link to="/backlog" className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1">
                Ver Backlog <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loadingTasks ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-6 animate-pulse bg-secondary rounded" />)}
              </div>
            ) : myTasks.length === 0 ? (
              <div className="py-8 text-center text-[12px] text-muted-foreground">Sin tareas pendientes.</div>
            ) : (
              <>
                <div className="flex-1 min-h-0 overflow-auto divide-y divide-border">
                  {paginatedMyTasks.map((task) => {
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                    return (
                      <div key={task.id_task} className="px-4 py-2 hover:bg-accent/30 transition-colors flex items-center gap-3 min-h-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <p className="text-[12px] font-medium text-foreground truncate flex-1">{task.title}</p>
                        {task.due_date && (
                          <span className={`text-[10px] whitespace-nowrap ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                            {formatProjectDate(task.due_date)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {myTasksTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-2 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">Página {myTasksPage + 1} de {myTasksTotalPages}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMyTasksPage((page) => Math.max(0, page - 1))}
                        disabled={myTasksPage === 0}
                        className="h-6 px-2 border border-border rounded-[3px] text-[10px] font-medium text-foreground hover:bg-surface-secondary transition-colors disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() => setMyTasksPage((page) => Math.min(myTasksTotalPages - 1, page + 1))}
                        disabled={myTasksPage >= myTasksTotalPages - 1}
                        className="h-6 px-2 border border-border rounded-[3px] text-[10px] font-medium text-foreground hover:bg-surface-secondary transition-colors disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Recent Push Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45, ease: 'easeOut' }}
          className="bg-card border border-border rounded-[4px] h-full min-h-0 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <h2 className="text-[13px] font-semibold text-foreground">Actividad Reciente (Git)</h2>
          </div>
          {!pushes || pushes.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-muted-foreground">Sin push events recientes.</div>
          ) : (
            <>
              <div className="flex-1 min-h-0 overflow-auto divide-y divide-border">
                {paginatedPushes.map((push) => {
                  const commitCount = Array.isArray(push.commits) ? push.commits.length : 0;
                  return (
                    <div key={push.id_push} className="px-4 py-2 hover:bg-accent/30 transition-colors min-h-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-foreground">{push.pusher ?? 'unknown'}</span>
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded-[2px]">
                          {push.ref?.replace('refs/heads/', '') ?? 'main'}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {commitCount} commit{commitCount !== 1 ? 's' : ''} · {new Date(push.received_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  );
                })}
              </div>

              {pushesTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground">Página {pushesPage + 1} de {pushesTotalPages}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPushesPage((page) => Math.max(0, page - 1))}
                      disabled={pushesPage === 0}
                      className="h-6 px-2 border border-border rounded-[3px] text-[10px] font-medium text-foreground hover:bg-surface-secondary transition-colors disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setPushesPage((page) => Math.min(pushesTotalPages - 1, page + 1))}
                      disabled={pushesPage >= pushesTotalPages - 1}
                      className="h-6 px-2 border border-border rounded-[3px] text-[10px] font-medium text-foreground hover:bg-surface-secondary transition-colors disabled:opacity-50"
                    >
                      Siguiente
                    </button>
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
