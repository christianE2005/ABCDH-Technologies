import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft, Calendar, Users, Clock, CheckCircle2,
  AlertTriangle, UserPlus, Loader2, RefreshCw, List,
} from 'lucide-react';
import { motion } from 'motion/react';
import { StatusBadge } from '../components/StatusBadge';
import { KPICard } from '../components/KPICard';
import { CommandBar } from '../components/CommandBar';
import { ADOTabs } from '../components/ADOTabs';
import { AvatarGroup } from '../components/AvatarGroup';
import { ProgressBar } from '../components/ProgressBar';
import { AssignResponsibleModal, type AssignCandidate } from '../components/AssignResponsibleModal';
import { AddMemberModal } from '../components/AddMemberModal';
import {
  useApiBoards, useApiProjectMembers, useApiUsers, useApiTasks, useApiRoles,
} from '../hooks/useProjectData';
import { projectsService, usersService } from '../../services';
import type { ApiProject } from '../../services';
import { useAuth } from '../context/AuthContext';
import { GitHubReposView } from '../components/GitHubReposView';
import { CodeReviewPanel } from '../components/CodeReviewPanel';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const projectId = Number(id) || 0;

  // ── Project ──────────────────────────────────────────────────────────────
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoadingProject(true);
    setProjectError(null);
    projectsService.get(projectId)
      .then(setProject)
      .catch(() => setProjectError('No se pudo cargar el proyecto.'))
      .finally(() => setLoadingProject(false));
  }, [projectId]);

  // ── Boards ───────────────────────────────────────────────────────────────
  const { data: boards, loading: loadingBoards } = useApiBoards(projectId);
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (boards && boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id_board);
    }
  }, [boards, selectedBoardId]);

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const { data: tasks, loading: loadingTasks, statuses, refetch: refetchTasks } = useApiTasks(selectedBoardId);

  // ── Members + Users ───────────────────────────────────────────────────────
  const { data: members, loading: loadingMembers, refetch: refetchMembers } = useApiProjectMembers(projectId);
  const { data: users, loading: loadingUsers } = useApiUsers();
  const { data: roles } = useApiRoles();

  const isCreator = !!project && !!user && project.created_by === Number(user.id);

  const candidatesToAdd = useMemo(() => {
    if (!users) return [];
    const memberIds = new Set((members ?? []).map((m) => m.user));
    return users.filter((u) => !memberIds.has(u.id_user));
  }, [users, members]);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const handleAddMember = async (userId: number, roleId: number | null) => {
    try {
      await usersService.addMember(projectId, userId, roleId ?? undefined);
      toast.success('Miembro agregado');
      refetchMembers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo agregar el miembro';
      toast.error(msg);
      throw err;
    }
  };

  const userMap = useMemo(() => {
    const m = new Map<number, string>();
    (users ?? []).forEach((u) => m.set(u.id_user, u.username));
    return m;
  }, [users]);

  const roleMap = useMemo(() => {
    const m = new Map<number, string>();
    (roles ?? []).forEach((r) => m.set(r.id_role, r.name));
    return m;
  }, [roles]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const tList = tasks ?? [];
    const now = new Date();
    const total = tList.length;
    const completed = tList.filter((t) => t.completed_at != null).length;
    const overdue = tList.filter(
      (t) => !t.completed_at && t.due_date && new Date(t.due_date) < now,
    ).length;
    const memberCount = (members ?? []).length;
    return { total, completed, overdue, memberCount };
  }, [tasks, members]);

  // ── Task-status breakdown ─────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    if (!tasks || statuses.length === 0) return [];
    const counts = new Map<number, number>();
    tasks.forEach((t) => {
      const sid = t.status ?? 0;
      counts.set(sid, (counts.get(sid) ?? 0) + 1);
    });
    return statuses.map((s) => ({
      name: s.name,
      count: counts.get(s.id_status) ?? 0,
    }));
  }, [tasks, statuses]);

  // ── Days remaining ───────────────────────────────────────────────────────
  const daysRemaining = useMemo(() => {
    if (!project?.end_date) return null;
    return Math.ceil((new Date(project.end_date).getTime() - Date.now()) / 86_400_000);
  }, [project]);

  const daysLabel = daysRemaining === null
    ? '—'
    : daysRemaining < 0 ? 'Vencido'
    : daysRemaining === 0 ? 'Hoy'
    : `${daysRemaining}d`;

  // ── Assign modal ─────────────────────────────────────────────────────────
  const [showAssignModal, setShowAssignModal] = useState(false);
  const assignCandidates: AssignCandidate[] = useMemo(
    () => (members ?? []).map((m) => ({
      id: m.user,
      name: userMap.get(m.user) ?? `Usuario #${m.user}`,
      email: `user${m.user}@platform`,
      role: '',
    })),
    [members, userMap],
  );
  const handleAssign = (userId: number) => {
    const c = assignCandidates.find((x) => x.id === userId);
    if (c) toast.success(`Responsable asignado: ${c.name}`);
    setShowAssignModal(false);
  };

  // ── Tabs ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'resumen' | 'tareas' | 'code-review' | 'repositorios' | 'equipo'>('resumen');

  const loading = loadingProject || loadingBoards;

  // ── Error state ───────────────────────────────────────────────────────────
  if (projectError) {
    return (
      <div className="px-4 pt-10 text-center">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-[13px] text-destructive">{projectError}</p>
        <button onClick={() => navigate('/projects')} className="mt-3 text-[12px] text-primary hover:underline">
          Volver a Proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 pt-3 space-y-3 max-w-[1400px]">
      <CommandBar
        actions={[
          { label: 'Volver', icon: <ArrowLeft className="w-3.5 h-3.5" />, onClick: () => navigate('/projects') },
          { label: 'Actualizar', icon: <RefreshCw className="w-3.5 h-3.5" />, onClick: refetchTasks },
          { label: 'Asignar', icon: <UserPlus className="w-3.5 h-3.5" />, onClick: () => setShowAssignModal(true) },
        ]}
        rightSlot={project ? <StatusBadge status={(project.status ?? 'neutral') as 'success'|'warning'|'danger'|'info'|'neutral'|'on_track'|'at_risk'|'delayed'} size="sm" /> : null}
      />

      {/* Header */}
      {loading ? (
        <div className="h-14 animate-pulse bg-card rounded-[4px]" />
      ) : project ? (
        <div>
          <h1 className="text-[16px] font-semibold text-foreground">{project.name}</h1>
          {project.description && (
            <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>
          )}
          <div className="flex items-center gap-4 mt-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />Inicio: {project.created_at.slice(0, 10)}
            </span>
            {project.end_date && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />Fin: {project.end_date}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />{kpis.memberCount} miembros
            </span>
          </div>
        </div>
      ) : null}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { title: 'Tareas', value: kpis.total, subtitle: 'en este tablero', icon: <List className="w-4 h-4" />, accentColor: 'info' as const },
          { title: 'Completadas', value: kpis.completed, subtitle: 'finalizadas', icon: <CheckCircle2 className="w-4 h-4" />, accentColor: 'success' as const },
          { title: 'Vencidas', value: kpis.overdue, subtitle: 'requieren atención', icon: <AlertTriangle className="w-4 h-4" />, accentColor: 'destructive' as const },
          {
            title: 'Días Restantes',
            value: daysLabel,
            subtitle: project?.end_date ?? '—',
            icon: <Clock className="w-4 h-4" />,
            accentColor: 'warning' as const,
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: i * 0.05, ease: 'easeOut' }}
          >
            <KPICard title={card.title} value={card.value} subtitle={card.subtitle} icon={card.icon} accentColor={card.accentColor} />
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <ADOTabs
        tabs={[
          { id: 'resumen', label: 'Overview' },
          { id: 'tareas', label: 'Tareas', count: (tasks ?? []).length },
          { id: 'code-review', label: 'Code Review' },
          { id: 'repositorios', label: 'Repositorios' },
          { id: 'equipo', label: 'Equipo', count: (members ?? []).length },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="grid lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              <div className="bg-card border border-border rounded-[4px] p-4">
                <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] mb-2.5">
                  Información General
                </h2>
                {project ? (
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {[
                      { label: 'Estado', value: project.status ?? '—' },
                      { label: 'Creado', value: project.created_at.slice(0, 10) },
                      { label: 'Fecha fin', value: project.end_date ?? '—' },
                      { label: 'Días restantes', value: daysLabel },
                      { label: 'Miembros', value: `${kpis.memberCount} personas` },
                      { label: 'ID', value: `#${project.id_project}` },
                    ].map((item) => (
                      <div key={item.label}>
                        <dt className="text-[10px] text-muted-foreground">{item.label}</dt>
                        <dd className="text-[13px] font-medium text-foreground mt-0.5">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <div className="h-20 animate-pulse bg-secondary rounded" />
                )}
              </div>

              {/* Completion progress bar */}
              {kpis.total > 0 && (
                <div className="bg-card border border-border rounded-[4px] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                      Avance
                    </h2>
                    <span className="text-[12px] font-semibold text-foreground">
                      {Math.round((kpis.completed / kpis.total) * 100)}%
                    </span>
                  </div>
                  <ProgressBar value={Math.round((kpis.completed / kpis.total) * 100)} height={6} />
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {kpis.completed} de {kpis.total} tareas completadas
                  </p>
                </div>
              )}
            </div>

            {/* Task status breakdown */}
            <div className="bg-card border border-border rounded-[4px] p-4 h-fit">
              <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] mb-2.5">
                Tareas por Estado
              </h2>
              {loadingTasks ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-5 animate-pulse bg-secondary rounded" />)}
                </div>
              ) : statusCounts.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">Sin tareas en este tablero.</p>
              ) : (
                <div className="space-y-1.5">
                  {statusCounts.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <span className="text-[12px] text-foreground">{s.name}</span>
                      <span className="text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {s.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAREAS */}
        {activeTab === 'tareas' && (
          <div className="space-y-2">
            {/* Board selector */}
            {boards && boards.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Tablero:</span>
                <div className="flex gap-1">
                  {boards.map((b) => (
                    <button
                      key={b.id_board}
                      onClick={() => setSelectedBoardId(b.id_board)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-[3px] border transition-colors ${
                        selectedBoardId === b.id_board
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-[4px] overflow-hidden">
              {loadingTasks ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : !tasks || tasks.length === 0 ? (
                <div className="py-12 text-center text-[12px] text-muted-foreground">
                  {selectedBoardId ? 'No hay tareas en este tablero.' : 'Selecciona un tablero.'}
                </div>
              ) : (
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-secondary/50">
                      <th className="text-left py-1.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Tarea</th>
                      <th className="text-left py-1.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Estado</th>
                      <th className="text-left py-1.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Asignado</th>
                      <th className="text-left py-1.5 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Vence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const statusName = statuses.find((s) => s.id_status === task.status)?.name ?? '—';
                      const assignedName = task.assigned_to ? (userMap.get(task.assigned_to) ?? `#${task.assigned_to}`) : '—';
                      const isOverdue = !task.completed_at && task.due_date && new Date(task.due_date) < new Date();
                      return (
                        <tr key={task.id_task} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                          <td className="py-1.5 px-4">
                            <p className="text-[13px] font-medium text-foreground truncate max-w-[260px]">{task.title}</p>
                          </td>
                          <td className="py-1.5 px-3">
                            <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                              {task.completed_at ? 'Completada' : statusName}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-[12px] text-muted-foreground">{assignedName}</td>
                          <td className="py-1.5 px-3">
                            <span className={`text-[11px] ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                              {task.due_date ?? '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CODE REVIEW */}
        {activeTab === 'code-review' && (
          <CodeReviewPanel
            projectId={projectId}
            repoFullName={project?.github_repo_full_name ?? null}
          />
        )}

        {/* REPOSITORIOS */}
        {activeTab === 'repositorios' && (
          <GitHubReposView />
        )}

        {/* EQUIPO */}
        {activeTab === 'equipo' && (
          <div className="bg-card border border-border rounded-[4px] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                  Miembros del Proyecto
                </h2>
                {members && members.length > 0 && (
                  <AvatarGroup
                    users={(members ?? []).map((m) => ({
                      name: userMap.get(m.user) ?? `Usuario #${m.user}`,
                    }))}
                    max={5}
                    size={24}
                  />
                )}
              </div>
              {isCreator && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-[3px] transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Agregar Miembro
                </button>
              )}
            </div>

            {(loadingMembers || loadingUsers) ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse bg-secondary rounded" />)}
              </div>
            ) : !members || members.length === 0 ? (
              <p className="text-[12px] text-muted-foreground py-6 text-center">Sin miembros registrados.</p>
            ) : (
              <div className="space-y-0.5">
                {members.map((member) => {
                  const name = userMap.get(member.user) ?? `Usuario #${member.user}`;
                  const roleName = roleMap.get(member.role ?? 0) ?? `Rol #${member.role ?? '—'}`;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between py-2 px-3 rounded-[3px] hover:bg-accent/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-medium">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{name}</p>
                          <p className="text-[11px] text-muted-foreground">{member.role ? roleName : 'Sin rol'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        desde {member.joined_at.slice(0, 10)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>

      <AddMemberModal
        open={showAddMemberModal}
        onOpenChange={setShowAddMemberModal}
        candidates={candidatesToAdd}
        roles={roles ?? []}
        onSubmit={handleAddMember}
      />

      <AssignResponsibleModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        candidates={assignCandidates}
        onAssign={handleAssign}
      />
    </div>
  );
}
