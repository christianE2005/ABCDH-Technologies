import { useMemo } from 'react';
import { Link } from 'react-router';
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
import { useApiProjects, useApiTasks, useApiTaskWarnings, useApiGithubPushes } from '../hooks/useProjectData';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects, loading: loadingProjects, error: errorProjects, refetch: refetchProjects } = useApiProjects();
  const { data: tasks, loading: loadingTasks, statuses, refetch: refetchTasks } = useApiTasks();
  const { data: warnings } = useApiTaskWarnings({ status: 'active' });
  const { data: pushes } = useApiGithubPushes();

  const loading = loadingProjects || loadingTasks;

  const refetchAll = () => { refetchProjects(); refetchTasks(); };

  // ── Derived KPIs ──
  const kpis = useMemo(() => {
    const pList = projects ?? [];
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
    return tasks.filter((t) => t.assigned_to === Number(user.id) && !t.completed_at);
  }, [tasks, user]);

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

  const PIE_COLORS = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)'];

  // ── Pie data: project status distribution ──
  const projectStatusData = useMemo(() => {
    if (!projects) return [];
    const counts = new Map<string, number>();
    for (const p of projects) {
      const s = p.status ?? 'sin estado';
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [projects]);

  // ── Days remaining helper ──
  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000);
  };
  const getDaysLabel = (days: number | null) => {
    if (days === null) return { label: '—', cls: 'text-muted-foreground' };
    if (days < 0) return { label: 'Vencido', cls: 'text-destructive font-semibold' };
    if (days === 0) return { label: 'Hoy', cls: 'text-destructive font-semibold' };
    if (days <= 7) return { label: `${days}d`, cls: 'text-warning font-semibold' };
    return { label: `${days}d`, cls: 'text-muted-foreground' };
  };

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
    <div className="px-4 pb-6 pt-3 space-y-3 max-w-[1600px]">
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
      <div className="grid xl:grid-cols-[1fr_300px] gap-3 items-start">

        {/* Projects table */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: 'easeOut' }}
          className="bg-card border border-border rounded-[4px]"
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-surface-secondary/50">
                    <th className="text-left py-1.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Proyecto</th>
                    <th className="text-left py-1.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Estado</th>
                    <th className="text-left py-1.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Fecha Fin</th>
                    <th className="text-left py-1.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Días rest.</th>
                    <th className="py-1.5 px-3 w-[60px]" />
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 8).map((project) => {
                    const days = getDaysRemaining(project.end_date);
                    const dl = getDaysLabel(days);
                    return (
                      <tr key={project.id_project} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors group">
                        <td className="py-1.5 px-4">
                          <p className="text-[13px] font-medium text-foreground truncate max-w-[220px]">{project.name}</p>
                          {project.description && (
                            <p className="text-[10px] text-muted-foreground truncate max-w-[220px] mt-0.5">{project.description}</p>
                          )}
                        </td>
                        <td className="py-1.5 px-3">
                          <StatusBadge status={(project.status ?? 'neutral') as 'success'|'warning'|'danger'|'info'|'neutral'|'on_track'|'at_risk'|'delayed'} size="sm" />
                        </td>
                        <td className="py-1.5 px-3 text-[11px] text-muted-foreground whitespace-nowrap">
                          {project.end_date ?? '—'}
                        </td>
                        <td className="py-1.5 px-3">
                          <span className={`text-[11px] ${dl.cls}`}>{dl.label}</span>
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <Link to={`/projects/${project.id_project}`} className="text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium hover:underline">
                            Detalle →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Right column: charts */}
        <div className="flex flex-col gap-3">

          {/* Task distribution by status */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.32, ease: 'easeOut' }}
            className="bg-card border border-border rounded-[4px] p-4"
          >
            <h2 className="text-[13px] font-semibold text-foreground mb-2">Tareas por Estado</h2>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={statusChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="var(--color-chart-1)" name="Tareas" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[11px] text-muted-foreground py-8 text-center">Sin datos de tareas.</p>
            )}
          </motion.div>

          {/* Project status pie */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35, ease: 'easeOut' }}
            className="bg-card border border-border rounded-[4px] p-4"
          >
            <h2 className="text-[13px] font-semibold text-foreground mb-2">Estado de Proyectos</h2>
            {projectStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                      {projectStatusData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-1">
                  {projectStatusData.map((d, i) => (
                    <span key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
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
      <div className="grid xl:grid-cols-2 gap-3">
        {/* My Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4, ease: 'easeOut' }}
          className="bg-card border border-border rounded-[4px]"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <h2 className="text-[13px] font-semibold text-foreground">Mis Tareas Pendientes</h2>
            <Link to="/backlog" className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1">
              Ver Backlog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {myTasks.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-muted-foreground">Sin tareas asignadas pendientes.</div>
          ) : (
            <div className="divide-y divide-border">
              {myTasks.slice(0, 6).map((task) => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date();
                return (
                  <div key={task.id_task} className="px-4 py-2 hover:bg-accent/30 transition-colors flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <p className="text-[12px] font-medium text-foreground truncate flex-1">{task.title}</p>
                    {task.due_date && (
                      <span className={`text-[10px] whitespace-nowrap ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                        {task.due_date}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Push Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45, ease: 'easeOut' }}
          className="bg-card border border-border rounded-[4px]"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <h2 className="text-[13px] font-semibold text-foreground">Actividad Reciente (Git)</h2>
            <Link to="/github" className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1">
              Ver GitHub <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!pushes || pushes.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-muted-foreground">Sin push events recientes.</div>
          ) : (
            <div className="divide-y divide-border">
              {pushes.slice(0, 5).map((push) => {
                const commitCount = Array.isArray(push.commits) ? push.commits.length : 0;
                return (
                  <div key={push.id_push} className="px-4 py-2 hover:bg-accent/30 transition-colors">
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
          )}
        </motion.div>
      </div>
    </div>
  );
}
