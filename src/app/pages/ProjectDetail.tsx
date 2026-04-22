import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowLeft, Calendar, Users, Clock, CheckCircle2,
  AlertTriangle, UserPlus, RefreshCw, List, Trash2, Settings2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { StatusBadge } from '../components/StatusBadge';
import { DatePickerField } from '../components/DatePickerField';
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
import { ProjectTasksWorkspace } from '../components/ProjectTasksWorkspace';
import { getProjectStatusApiValue, getProjectStatusBadge, getProjectStatusLabel, normalizeProjectStatus, PROJECT_STATUS_OPTIONS } from '../utils/projectStatus';
import { formatProjectDate, getProjectDaysLabel } from '../utils/projectDates';

export default function ProjectDetail() {
  const PROJECT_MANAGER_ROLE_ID = 1;
  const PRODUCT_OWNER_ROLE_ID = 2;
  const DEVELOPER_ROLE_ID = 4;

  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const projectId = Number(id) || 0;

  // ── Project ──────────────────────────────────────────────────────────────
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [savingProjectConfig, setSavingProjectConfig] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [projectStatus, setProjectStatus] = useState('planning');
  const [projectEndDate, setProjectEndDate] = useState('');

  useEffect(() => {
    if (!projectId) return;
    setLoadingProject(true);
    setProjectError(null);
    projectsService.get(projectId)
      .then(setProject)
      .catch(() => setProjectError('No se pudo cargar el proyecto.'))
      .finally(() => setLoadingProject(false));
  }, [projectId]);

  useEffect(() => {
    setProjectStatus(normalizeProjectStatus(project?.status) ?? 'planning');
    setProjectEndDate(project?.end_date ?? '');
  }, [project?.status, project?.end_date]);

  // ── Boards ───────────────────────────────────────────────────────────────
  const { data: boards, loading: loadingBoards } = useApiBoards(projectId);
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (boards && boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id_board);
    }
  }, [boards, selectedBoardId]);

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const { data: tasks, loading: loadingTasks, statuses, refetch: refetchTasks } = useApiTasks(selectedBoardId, projectId);

  // ── Members + Users ───────────────────────────────────────────────────────
  const { data: members, loading: loadingMembers, refetch: refetchMembers } = useApiProjectMembers(projectId);
  const { data: users, loading: loadingUsers } = useApiUsers();
  const { data: roles } = useApiRoles();

  const currentUserId = Number(user?.id ?? 0);
  const currentUserMember = useMemo(
    () => (members ?? []).find((member) => member.user === currentUserId) ?? null,
    [members, currentUserId],
  );
  const canAccessProject = Boolean(currentUserMember);
  const isProjectManager = currentUserMember?.role === PROJECT_MANAGER_ROLE_ID;
  const canManageProject = isProjectManager;
  const canCreateTaskArtifacts = currentUserMember?.role === PROJECT_MANAGER_ROLE_ID || currentUserMember?.role === PRODUCT_OWNER_ROLE_ID;
  const canDeleteTasks = canCreateTaskArtifacts;

  const candidatesToAdd = useMemo(() => {
    if (!users) return [];
    const memberIds = new Set((members ?? []).map((m) => m.user));
    return users.filter((u) => !memberIds.has(u.id_user));
  }, [users, members]);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const handleAddMember = async (userId: number, roleId: number | null) => {
    if (!canManageProject) {
      throw new Error('Solo el Project Manager puede agregar miembros.');
    }
    if (roleId == null || roleId === PROJECT_MANAGER_ROLE_ID) {
      throw new Error('Debes asignar Product Owner, Scrum Master o Developer.');
    }
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

  const doneStatusIds = useMemo(() => {
    const normalizedDoneNames = new Set(['done', 'completada', 'completado']);
    return new Set(
      statuses
        .filter((s) => normalizedDoneNames.has(s.name.trim().toLowerCase()))
        .map((s) => s.id_status),
    );
  }, [statuses]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const tList = tasks ?? [];
    const now = new Date();
    const total = tList.length;
    const completed = tList.filter((t) => t.completed_at != null || (t.status != null && doneStatusIds.has(t.status))).length;
    const overdue = tList.filter(
      (t) => !t.completed_at && (t.status == null || !doneStatusIds.has(t.status)) && t.due_date && new Date(t.due_date) < now,
    ).length;
    const memberCount = (members ?? []).length;
    return { total, completed, overdue, memberCount };
  }, [tasks, members, doneStatusIds]);

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
  const daysLabel = getProjectDaysLabel(project?.end_date ?? null, project?.status).label;
  const hasProjectConfigChanges = projectStatus !== (normalizeProjectStatus(project?.status) ?? 'planning') || projectEndDate !== (project?.end_date ?? '');

  // ── Assign modal ─────────────────────────────────────────────────────────
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningResponsible, setAssigningResponsible] = useState(false);
  const currentProjectManagerMember = useMemo(
    () => (members ?? []).find((member) => member.role === PROJECT_MANAGER_ROLE_ID) ?? null,
    [members, PROJECT_MANAGER_ROLE_ID],
  );
  const assignCandidates: AssignCandidate[] = useMemo(
    () => (members ?? []).map((m) => ({
      id: m.user,
      name: userMap.get(m.user) ?? `Usuario #${m.user}`,
      email: `user${m.user}@platform`,
      role: roleMap.get(m.role ?? 0) ?? 'Sin rol',
    })),
    [members, userMap, roleMap],
  );
  const handleAssign = async (userId: number) => {
    if (!canManageProject) {
      toast.error('No tienes permisos para reasignar al responsable del proyecto.');
      return;
    }

    const nextResponsibleMember = (members ?? []).find((member) => member.user === userId);
    if (!nextResponsibleMember) {
      toast.error('La persona seleccionada no pertenece al proyecto.');
      return;
    }

    if (currentProjectManagerMember?.user === userId) {
      setShowAssignModal(false);
      return;
    }

    setAssigningResponsible(true);
    try {
      await usersService.updateMember(nextResponsibleMember.id, { role: PROJECT_MANAGER_ROLE_ID });

      if (currentProjectManagerMember) {
        await usersService.updateMember(currentProjectManagerMember.id, {
          role: DEVELOPER_ROLE_ID,
        });
      }

      await refetchMembers();
      const candidate = assignCandidates.find((x) => x.id === userId);
      if (candidate) toast.success(`Responsable asignado: ${candidate.name}`);
      setShowAssignModal(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo reasignar al responsable.';
      toast.error(msg);
    } finally {
      setAssigningResponsible(false);
    }
  };

  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const handleRemoveMember = async (memberId: number) => {
    if (!canManageProject) {
      toast.error('Solo el Project Manager puede eliminar miembros del proyecto.');
      return;
    }

    const member = (members ?? []).find((m) => m.id === memberId);
    if (!member) {
      toast.error('No se encontró el miembro seleccionado.');
      return;
    }

    if (member.role === PROJECT_MANAGER_ROLE_ID) {
      toast.error('Reasigna primero al responsable del proyecto.');
      return;
    }

    if (!confirm('¿Eliminar este miembro del proyecto?')) {
      return;
    }

    setRemovingMemberId(memberId);
    try {
      await usersService.removeMember(memberId);
      await refetchMembers();
      toast.success('Miembro eliminado del proyecto.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar el miembro.';
      toast.error(msg);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleProjectStatusSave = async () => {
    if (!project) return;
    const apiStatus = getProjectStatusApiValue(projectStatus);
    if (!apiStatus) {
      toast.error('Estado de proyecto inválido.');
      return;
    }
    setSavingProjectConfig(true);
    try {
      const updated = await projectsService.update(project.id_project, {
        status: apiStatus,
        end_date: projectEndDate || undefined,
      });
      setProject(updated);
      toast.success('Configuración del proyecto actualizada.');
    } catch {
      toast.error('No se pudo actualizar la configuración del proyecto.');
    } finally {
      setSavingProjectConfig(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!confirm(`¿Eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeletingProject(true);
    try {
      await projectsService.delete(project.id_project);
      toast.success('Proyecto eliminado.');
      navigate('/projects');
    } catch {
      toast.error('No se pudo eliminar el proyecto.');
      setDeletingProject(false);
    }
  };

  // ── Tabs ─────────────────────────────────────────────────────────────────
  const initialQueryTab = searchParams.get('tab');
  const initialQueryTaskId = Number(searchParams.get('task'));
  const normalizedInitialTaskId = Number.isNaN(initialQueryTaskId) || initialQueryTaskId <= 0 ? null : initialQueryTaskId;

  const [activeTab, setActiveTab] = useState<'resumen' | 'tareas' | 'code-review' | 'repositorios' | 'equipo' | 'configuracion'>(() => {
    if (initialQueryTab === 'tareas') return 'tareas';
    if (initialQueryTab === 'configuracion') return 'configuracion';
    return 'resumen';
  });
  const [initialTaskId, setInitialTaskId] = useState<number | null>(initialQueryTab === 'tareas' ? normalizedInitialTaskId : null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const taskId = Number(searchParams.get('task'));
    const normalizedTaskId = Number.isNaN(taskId) || taskId <= 0 ? null : taskId;

    if (tab === 'tareas') {
      setActiveTab('tareas');
      setInitialTaskId(normalizedTaskId);
      return;
    }

    if (tab === 'configuracion') {
      setActiveTab('configuracion');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!canManageProject && activeTab === 'configuracion') {
      setActiveTab('resumen');
    }
  }, [canManageProject, activeTab]);

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

  if (!loadingProject && !loadingMembers && !canAccessProject) {
    return (
      <div className="px-4 pt-10 text-center">
        <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <p className="text-[13px] text-destructive">No tienes acceso a este proyecto.</p>
        <button onClick={() => navigate('/projects')} className="mt-3 text-[12px] text-primary hover:underline">
          Volver a Proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 pt-3 max-w-[1400px] min-h-full flex flex-col gap-3">
      <CommandBar
        actions={[
          { label: 'Volver', icon: <ArrowLeft className="w-3.5 h-3.5" />, onClick: () => navigate('/projects') },
          { label: 'Actualizar', icon: <RefreshCw className="w-3.5 h-3.5" />, onClick: refetchTasks },
          ...(canManageProject ? [{ label: 'Asignar responsable', icon: <UserPlus className="w-3.5 h-3.5" />, onClick: () => setShowAssignModal(true) }] : []),
        ]}
        rightSlot={project ? <StatusBadge status={getProjectStatusBadge(project.status)} text={getProjectStatusLabel(project.status)} size="sm" /> : null}
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
              <Calendar className="w-3 h-3" />Inicio: {formatProjectDate(project.created_at)}
            </span>
            {project.end_date && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />Fin: {formatProjectDate(project.end_date)}
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
          ...(canManageProject ? [{ id: 'configuracion', label: 'Configuración', icon: <Settings2 className="w-3.5 h-3.5" /> }] : []),
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={activeTab === 'tareas' ? 'flex-1 min-h-0 flex flex-col' : undefined}
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
                      { label: 'Estado', value: getProjectStatusLabel(project.status) },
                      { label: 'Creado', value: formatProjectDate(project.created_at) },
                      { label: 'Fecha fin', value: formatProjectDate(project.end_date) },
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
          <div className="flex-1 min-h-0 flex flex-col">
            <ProjectTasksWorkspace
              projectId={projectId}
              userMap={userMap}
              assignableUsers={(members ?? []).map((m) => ({
                id: m.user,
                name: userMap.get(m.user) ?? `Usuario #${m.user}`,
              }))}
              canCreateTasks={canCreateTaskArtifacts}
              canCreateBoards={canCreateTaskArtifacts}
              canEditTasks={canCreateTaskArtifacts}
              canDeleteTasks={canDeleteTasks}
              initialTaskId={initialTaskId}
              onInitialTaskHandled={(taskId) => {
                setInitialTaskId((current) => (current === taskId ? null : current));
                const nextParams = new URLSearchParams(searchParams);
                nextParams.delete('task');
                setSearchParams(nextParams, { replace: true });
              }}
            />
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
          <GitHubReposView projectId={projectId} />
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
              {canManageProject && (
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-muted-foreground">{member.role ? roleName : 'Sin rol'}</p>
                            {member.role === PROJECT_MANAGER_ROLE_ID && (
                              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                PM
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          desde {member.joined_at.slice(0, 10)}
                        </span>
                        {canManageProject && member.role !== PROJECT_MANAGER_ROLE_ID && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removingMemberId === member.id}
                            className="h-7 px-2 text-[10px] font-medium text-destructive border border-destructive/30 rounded-[3px] hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          >
                            {removingMemberId === member.id ? 'Eliminando…' : 'Eliminar'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'configuracion' && (
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-3">
            <div className="bg-card border border-border rounded-[4px] p-4">
              <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] mb-3">
                Configuración del Proyecto
              </h2>

              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Etapa del proyecto</label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value)}
                    disabled={!canManageProject || savingProjectConfig}
                    className="w-full h-8 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                  >
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Fecha de entrega</label>
                  <DatePickerField
                    value={projectEndDate}
                    onChange={setProjectEndDate}
                    disabled={!canManageProject || savingProjectConfig}
                    placeholder="Selecciona una fecha de entrega"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleProjectStatusSave}
                  disabled={!canManageProject || savingProjectConfig || !hasProjectConfigChanges}
                  className="h-8 px-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors disabled:opacity-50"
                >
                  {savingProjectConfig ? 'Guardando…' : 'Guardar cambios'}
                </button>

                {!canManageProject && (
                  <p className="text-[11px] text-muted-foreground">Solo administradores y project managers pueden modificar la configuración.</p>
                )}
              </div>
            </div>

            <div className="bg-card border border-destructive/20 rounded-[4px] p-4 h-fit">
              <h2 className="text-[10px] font-medium text-destructive uppercase tracking-[0.06em] mb-2">
                Zona Peligrosa
              </h2>
              <p className="text-[11px] text-muted-foreground mb-3">
                Eliminar este proyecto también removerá su acceso desde la vista principal.
              </p>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={!canManageProject || deletingProject}
                className="h-8 px-3 bg-destructive hover:bg-destructive/90 text-white rounded-[3px] text-[11px] font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deletingProject ? 'Eliminando…' : 'Eliminar proyecto'}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <AddMemberModal
        open={showAddMemberModal}
        onOpenChange={setShowAddMemberModal}
        candidates={candidatesToAdd}
        roles={(roles ?? []).filter((role) => role.id_role !== PROJECT_MANAGER_ROLE_ID)}
        onSubmit={handleAddMember}
      />

      <AssignResponsibleModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        candidates={assignCandidates}
        currentResponsibleId={currentProjectManagerMember?.user}
        onAssign={handleAssign}
        loading={assigningResponsible}
        title="Asignar responsable"
      />
    </div>
  );
}
