import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { DndContext, DragEndEvent, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, AlertCircle, AlertTriangle, LayoutGrid, List, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useApiBoards, useApiTaskAssignments, useApiProjects, useApiTasks, useApiUsers, useApiProjectMembers, useApiRoles, useApiTaskWarnings } from '../hooks/useProjectData';
import { tasksService } from '../../services';
import type { ApiTask, ApiTaskStatus, ApiTaskPriority, ApiTaskAssignment } from '../../services';
import { TaskDetailPanel } from '../components/TaskDetailPanel';
import { useAuth } from '../context/AuthContext';
import { getProjectCapabilities, getProjectRoleIds } from '../utils/projectPermissions';

// ── Helpers ──

function priorityColor(level: number) {
  if (level <= 1) return 'bg-destructive';
  if (level === 2) return 'bg-warning';
  if (level === 3) return 'bg-info';
  return 'bg-success';
}

function getTaskStatusColor(statusName?: string | null) {
  const normalized = (statusName ?? '').trim().toLowerCase();
  if (normalized.includes('backlog')) return '#64748b';
  if (normalized.includes('to do') || normalized.includes('por hacer')) return '#0ea5e9';
  if (normalized.includes('progress') || normalized.includes('progreso')) return '#f59e0b';
  if (normalized.includes('review') || normalized.includes('revision') || normalized.includes('revisión')) return '#8b5cf6';
  if (normalized.includes('done') || normalized.includes('completad') || normalized.includes('finalizad')) return '#22c55e';
  if (normalized.includes('block') || normalized.includes('bloque')) return '#ef4444';
  return '#14b8a6';
}

// ── Task Card (draggable) ──

function summarizeAssignedNames(assignedNames: string[]) {
  if (assignedNames.length === 0) return 'Sin asignar';
  if (assignedNames.length <= 2) return assignedNames.join(', ');
  return `${assignedNames.slice(0, 2).join(', ')} +${assignedNames.length - 2}`;
}

function TaskCard({
  task,
  priorities,
  statusName,
  assignedNames,
  assignedToCurrentUser,
  warningCount = 0,
  projectName,
  onOpen,
}: {
  task: ApiTask;
  statuses?: ApiTaskStatus[];
  priorities: ApiTaskPriority[];
  statusName?: string;
  assignedNames: string[];
  assignedToCurrentUser: boolean;
  warningCount?: number;
  projectName?: string;
  onOpen: (task: ApiTask) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id_task });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const prio = priorities.find((p) => p.id_priority === task.priority);
  const statusColor = getTaskStatusColor(statusName);
  const assignedSummary = summarizeAssignedNames(assignedNames);

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: statusColor }}
      className="relative bg-card border border-border border-l-[3px] rounded-[4px] p-2.5 mb-1.5 hover:border-primary/30 transition-colors cursor-pointer group"
      onClick={() => onOpen(task)}
    >
      {assignedToCurrentUser && (
        <span title="Asignada a ti" className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
          <span className="sr-only">Asignada a ti</span>
        </span>
      )}
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label="Mover tarea"
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
            <h3 className="text-[12px] font-medium text-foreground truncate">{task.title}</h3>
            {warningCount > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning/10 px-1.5 py-0.5 text-[9px] text-warning"
                title={`${warningCount} warning${warningCount === 1 ? '' : 's'} activo${warningCount === 1 ? '' : 's'}`}
              >
                <AlertTriangle className="w-2.5 h-2.5" />
                {warningCount}
              </span>
            )}
          </div>
          {task.description && <p className="text-[11px] text-muted-foreground line-clamp-2 ml-3.5">{task.description}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 ml-3.5">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
          {assignedNames.length > 0 && (
            <span className="max-w-[180px] truncate" title={assignedNames.join(', ')}>
              {assignedSummary}
            </span>
          )}
          {task.due_date && (
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.due_date}</span>
          )}
          {projectName && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary/80 font-medium">
              {projectName}
            </span>
          )}
        </div>
        {prio && <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded font-medium">{prio.name}</span>}
      </div>
    </div>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
}

const WIP_LIMIT = 10; // Per-column WIP limit

// ── Main component ──

export default function Backlog() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserId = useMemo(() => {
    const parsed = Number(user?.id ?? 0);
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
  }, [user]);

  // Project picker
  const { data: projects, loading: loadingProjects } = useApiProjects();
  const [selectedProject, setSelectedProject] = useState<number | null>(() => {
    const p = searchParams.get('project');
    return p ? Number(p) : null;
  });
  const { data: boards, loading: loadingBoards } = useApiBoards(selectedProject ?? undefined);
  const [selectedBoard, setSelectedBoard] = useState<number | null>(() => {
    const b = searchParams.get('board');
    return b ? Number(b) : null;
  });

  // Tasks for selected project/board
  const { data: tasks, loading: loadingTasks, statuses, priorities, refetch: refetchTasks } = useApiTasks(selectedBoard ?? undefined, selectedProject ?? undefined);
  const { data: warnings } = useApiTaskWarnings({
    ...(selectedProject != null ? { project_id: selectedProject } : {}),
    status: 'active',
  });
  const taskIds = useMemo(() => (tasks ?? []).map((task) => task.id_task), [tasks]);
  const { data: taskAssignments } = useApiTaskAssignments(taskIds);

  // Users for the detail panel
  const { data: users } = useApiUsers();
  const { data: myMemberships } = useApiProjectMembers(undefined, currentUserId ?? undefined);
  const { data: roles } = useApiRoles();
  const userMap = useMemo(() => {
    const m = new Map<number, string>();
    (users ?? []).forEach((u) => m.set(u.id_user, u.username));
    return m;
  }, [users]);

  const loading = loadingProjects || loadingBoards || loadingTasks;

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<number | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);

  // Sync URL param
  useEffect(() => {
    const p = searchParams.get('project');
    setSelectedProject(p ? Number(p) : null);
    const b = searchParams.get('board');
    setSelectedBoard(b ? Number(b) : null);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedProject) {
      setSelectedBoard(null);
      return;
    }

    if (selectedBoard == null) return;
    const boardExists = (boards ?? []).some((board) => board.id_board === selectedBoard);
    if (!boardExists) {
      setSelectedBoard(null);
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete('board');
        return next;
      });
    }
  }, [boards, selectedBoard, selectedProject, setSearchParams]);

  const handleProjectFilter = (projectId: number | null) => {
    setSelectedProject(projectId);
    setSelectedBoard(null);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (projectId == null) next.delete('project');
      else next.set('project', String(projectId));
      next.delete('board');
      return next;
    });
  };

  const handleBoardFilter = (boardId: number | null) => {
    setSelectedBoard(boardId);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (boardId == null) next.delete('board');
      else next.set('board', String(boardId));
      return next;
    });
  };

  const taskAssignmentsByTask = useMemo(() => {
    const nextMap = new Map<number, ApiTaskAssignment[]>();
    (taskAssignments ?? []).forEach((assignment) => {
      const existing = nextMap.get(assignment.task) ?? [];
      existing.push(assignment);
      nextMap.set(assignment.task, existing);
    });
    return nextMap;
  }, [taskAssignments]);

  const warningCountByTask = useMemo(() => {
    const map = new Map<number, number>();
    (warnings ?? []).forEach((warning) => {
      map.set(warning.task, (map.get(warning.task) ?? 0) + 1);
    });
    return map;
  }, [warnings]);

  const getAssignedNames = (task: ApiTask) => {
    const assignments = taskAssignmentsByTask.get(task.id_task) ?? [];
    if (assignments.length > 0) {
      return assignments.map((assignment) => userMap.get(assignment.assigned_to) ?? `#${assignment.assigned_to}`);
    }
    return task.assigned_to ? [userMap.get(task.assigned_to) ?? `#${task.assigned_to}`] : [];
  };

  const isAssignedToCurrentUser = (task: ApiTask) => {
    if (!currentUserId) return false;
    const assignments = taskAssignmentsByTask.get(task.id_task) ?? [];
    if (assignments.length > 0) {
      return assignments.some((assignment) => assignment.assigned_to === currentUserId);
    }
    return task.assigned_to === currentUserId;
  };

  // Filter tasks by search & priority
  const filteredTasks = useMemo(() => {
    let result = tasks ?? [];
    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(term));
    }
    return result;
  }, [tasks, priorityFilter, searchTerm]);

  // Build kanban columns from real statuses
  const columns = useMemo(() => {
    return statuses.map((s) => ({
      status: s,
      dotColor: getTaskStatusColor(s.name),
      tasks: filteredTasks.filter((t) => t.status === s.id_status),
    }));
  }, [statuses, filteredTasks]);

  // Per-project edit permissions for the current user
  const projectEditPermissions = useMemo(() => {
    const map = new Map<number, boolean>();
    if (!myMemberships || !roles) return map;
    const roleIds = getProjectRoleIds(roles);
    const currentUserAccount = (users ?? []).find((u) => u.id_user === currentUserId) ?? null;
    for (const membership of myMemberships) {
      const caps = getProjectCapabilities(membership, currentUserAccount, roleIds);
      map.set(membership.project, caps.canManageTasks);
    }
    return map;
  }, [myMemberships, roles, users, currentUserId]);

  const canEditTaskInProject = (task: ApiTask): boolean => {
    const board = (boards ?? []).find((b) => b.id_board === task.board);
    if (!board) return false;
    return projectEditPermissions.get(board.project) ?? false;
  };

  // ── Drag handlers ──
  const handleDragStart = (event: { active: { id: string | number } }) => setActiveId(Number(event.active.id));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const overId = String(over.id);
    // Target status: either a column droppable or a task in a column
    let targetStatusId: number | null = null;
    const colMatch = statuses.find((s) => String(s.id_status) === overId);
    if (colMatch) {
      targetStatusId = colMatch.id_status;
    } else {
      const overTask = (tasks ?? []).find((t) => t.id_task === Number(overId));
      if (overTask) targetStatusId = overTask.status;
    }
    if (targetStatusId === null) return;

    const activeTaskNode = (tasks ?? []).find((t) => t.id_task === Number(active.id));
    if (!activeTaskNode || activeTaskNode.status === targetStatusId) return;

    if (!canEditTaskInProject(activeTaskNode)) {
      toast.error('No tienes permisos para modificar esta tarea.');
      return;
    }

    const statusName = statuses.find((s) => s.id_status === targetStatusId)?.name ?? '';
    try {
      await tasksService.update(activeTaskNode.id_task, { status: targetStatusId });
      toast.success(`Tarea movida a ${statusName}`);
      refetchTasks();
    } catch {
      toast.error('Error al mover la tarea');
    }
  };

  const activeTask = activeId ? (tasks ?? []).find((t) => t.id_task === activeId) ?? null : null;
  const selectedProjectData = selectedProject && projects ? projects.find((p) => p.id_project === selectedProject) ?? null : null;
  const canViewBacklog = user?.role === 'admin' || user?.role === 'user' || user?.role === 'project_manager';

  const projectNameById = useMemo(() => {
    const map = new Map<number, string>();
    (projects ?? []).forEach((p) => map.set(p.id_project, p.name));
    return map;
  }, [projects]);

  const getProjectNameForTask = (task: ApiTask): string | undefined => {
    if (selectedProject) return selectedProjectData?.name;
    const boardProject = (boards ?? []).find((b) => b.id_board === task.board)?.project;
    return boardProject ? projectNameById.get(boardProject) : undefined;
  };

  // ── Update task status from slideout ──
  const handleStatusChange = async (task: ApiTask, newStatusId: number) => {
    if (!canEditTaskInProject(task)) {
      toast.error('No tienes permisos para modificar esta tarea.');
      return;
    }
    try {
      await tasksService.update(task.id_task, { status: newStatusId });
      setSelectedTask((prev) => prev ? { ...prev, status: newStatusId } : null);
      refetchTasks();
      const sName = statuses.find((s) => s.id_status === newStatusId)?.name ?? '';
      toast.success(`Estado actualizado a "${sName}"`);
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  if (!canViewBacklog) {
    return (
      <div className="px-4 pb-6 pt-3 min-h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground">Tu rol no tiene acceso al backlog.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 pt-3 max-w-[1600px] min-h-full flex flex-col gap-3">
      {/* Toolbar */}
      {/* (removed toolbar - focus on core data) */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[13px] font-semibold text-foreground">Backlog</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {selectedProjectData
              ? <>Tareas de <span className="text-foreground font-medium">{selectedProjectData.name}</span></>
              : 'Gestiona tareas de todos los proyectos'}
          </p>
        </div>
        <div className="flex items-center bg-surface-secondary border border-border rounded-[3px] p-0.5">
          <button onClick={() => setViewMode('kanban')} className={`px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors flex items-center gap-1 ${viewMode === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <LayoutGrid className="w-3 h-3" /> Kanban
          </button>
          <button onClick={() => setViewMode('table')} className={`px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors flex items-center gap-1 ${viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <List className="w-3 h-3" /> Tabla
          </button>
        </div>
      </div>

      {/* Project picker + priority filter + search */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedProject ?? 'all'}
            onChange={(e) => handleProjectFilter(e.target.value === 'all' ? null : Number(e.target.value))}
            className="h-7 min-w-[220px] bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="all">Todos los proyectos</option>
            {(projects ?? []).map((project) => (
              <option key={project.id_project} value={project.id_project}>{project.name}</option>
            ))}
          </select>

          {selectedProject != null && (boards ?? []).length > 0 && (
            <select
              value={selectedBoard ?? 'all'}
              onChange={(e) => handleBoardFilter(e.target.value === 'all' ? null : Number(e.target.value))}
              className="h-7 min-w-[200px] bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="all">Todos los boards</option>
              {(boards ?? []).map((board) => (
                <option key={board.id_board} value={board.id_board}>{board.name}</option>
              ))}
            </select>
          )}

          {priorities.length > 0 && (
            <div className="flex items-center gap-0 border border-border rounded-[3px] overflow-hidden">
              <button onClick={() => setPriorityFilter('all')} className={`px-2.5 py-1 text-[11px] font-medium border-r border-border transition-colors ${priorityFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                Prioridad
              </button>
              {priorities.map((p) => (
                <button key={p.id_priority} onClick={() => setPriorityFilter(p.id_priority)} className={`px-2.5 py-1 text-[11px] font-medium border-r border-border last:border-r-0 transition-colors ${priorityFilter === p.id_priority ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${priorityColor(p.level)}`} />
                  {p.name}
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar tareas…" className="h-7 bg-surface-secondary border border-border rounded-[3px] pl-7 pr-3 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20 w-48" />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      )}

      {/* Kanban view */}
      {!loading && viewMode === 'kanban' && (
        <div className="flex-1 min-h-[520px] flex flex-col">
        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((col, colIndex) => (
              <DroppableColumn key={col.status.id_status} id={String(col.status.id_status)}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: colIndex * 0.1, ease: 'easeOut' }} className={`bg-surface-secondary/50 border rounded-[4px] p-2.5 ${col.tasks.length >= WIP_LIMIT ? 'border-warning/50' : 'border-border'} h-full min-h-0 flex flex-col`}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dotColor }} />
                      <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">{col.status.name}</h2>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${col.tasks.length >= WIP_LIMIT ? 'bg-warning/20 text-warning' : 'bg-card text-muted-foreground'}`}>
                        {col.tasks.length}{col.tasks.length >= WIP_LIMIT ? ` / ${WIP_LIMIT}` : ''}
                      </span>
                    </div>
                  </div>
                  <SortableContext items={col.tasks.map((t) => t.id_task)} strategy={verticalListSortingStrategy}>
                    <div className="flex-1 min-h-[200px] overflow-y-auto">
                      {col.tasks.map((task, taskIndex) => (
                        <motion.div key={task.id_task} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: colIndex * 0.1 + taskIndex * 0.05, ease: 'easeOut' }}>
                          <TaskCard
                            task={task}
                            statuses={statuses}
                            priorities={priorities}
                            statusName={col.status.name}
                            assignedNames={getAssignedNames(task)}
                            assignedToCurrentUser={isAssignedToCurrentUser(task)}
                            warningCount={warningCountByTask.get(task.id_task) ?? 0}
                            projectName={getProjectNameForTask(task)}
                            onOpen={setSelectedTask}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </SortableContext>
                  {col.tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <AlertCircle className="w-5 h-5 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">Sin tareas</p>
                    </div>
                  )}
                </motion.div>
              </DroppableColumn>
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="bg-card border border-primary rounded-[4px] p-2.5 rotate-2 opacity-90">
                <h3 className="text-[12px] font-medium text-foreground">{activeTask.title}</h3>
              </div>
            )}
          </DragOverlay>
        </DndContext>
        </div>
      )}

      {/* Table view */}
      {!loading && viewMode === 'table' && (
        <div className="bg-card border border-border rounded-[4px] overflow-hidden flex-1 min-h-[520px] flex flex-col">
          <div className="grid grid-cols-[40px_1fr_120px_100px_100px] gap-0 border-b border-border bg-surface-secondary/50 px-4 py-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">#</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Título</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Estado</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Prioridad</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] text-right">Fecha</span>
          </div>
          {filteredTasks.length > 0 ? (
            <div className="flex-1 min-h-0 overflow-y-auto">
            {filteredTasks.map((task, index) => {
              const st = statuses.find((s) => s.id_status === task.status);
              const pr = priorities.find((p) => p.id_priority === task.priority);
              const assignedNames = getAssignedNames(task);
              const assignedSummary = summarizeAssignedNames(assignedNames);
              const assignedToCurrentUser = isAssignedToCurrentUser(task);
              return (
                <motion.div key={task.id_task} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }} className="grid grid-cols-[40px_1fr_120px_100px_100px] gap-0 px-4 py-2 border-b border-border/50 hover:bg-accent/30 transition-colors items-center cursor-pointer" onClick={() => setSelectedTask(task)}>
                  <span className="text-[11px] text-muted-foreground">{index + 1}</span>
                  <div className="relative min-w-0 pr-4">
                    {assignedToCurrentUser && (
                      <span title="Asignada a ti" className="absolute right-0 top-0 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
                        <span className="sr-only">Asignada a ti</span>
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${priorityColor(pr?.level ?? 0)}`} />
                      <span className="text-[12px] font-medium text-foreground truncate">{task.title}</span>
                      {(warningCountByTask.get(task.id_task) ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning/10 px-1.5 py-0.5 text-[9px] text-warning">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {warningCountByTask.get(task.id_task)}
                        </span>
                      )}
                    </div>
                    {getProjectNameForTask(task) && (
                      <p className="text-[10px] text-muted-foreground ml-3.5 mt-0.5">
                        Proyecto: <span className="font-medium text-primary/70">{getProjectNameForTask(task)}</span>
                      </p>
                    )}
                    {task.description && <span className="text-[11px] text-muted-foreground truncate ml-4 block">{task.description}</span>}
                    <span className="text-[10px] text-muted-foreground truncate ml-4 block" title={assignedNames.join(', ')}>{assignedSummary}</span>
                  </div>
                  <div><span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{st?.name ?? '—'}</span></div>
                  <span className="text-[11px] font-medium text-muted-foreground">{pr?.name ?? '—'}</span>
                  <span className="text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
                    {task.due_date && <><Calendar className="w-3 h-3" />{task.due_date}</>}
                  </span>
                </motion.div>
              );
            })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-6 h-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hay tareas para este filtro</p>
            </div>
          )}
          <div className="px-4 py-1.5 bg-surface-secondary/50 border-t border-border">
            <p className="text-[10px] text-muted-foreground">{filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        statuses={statuses}
        priorities={priorities}
        userMap={userMap}
        canEditTask={selectedTask ? canEditTaskInProject(selectedTask) : false}
        canDeleteTask={false}
        canEditAssignment={false}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
