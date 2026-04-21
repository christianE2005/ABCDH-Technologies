import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  GripVertical,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useApiBoards, useApiTasks } from '../hooks/useProjectData';
import { tasksService } from '../../services';
import type { ApiTask, ApiTaskPriority, ApiTaskStatus } from '../../services';
import { TaskDetailPanel } from './TaskDetailPanel';
import { useAuth } from '../context/AuthContext';

interface ProjectTasksWorkspaceProps {
  projectId: number;
  userMap: Map<number, string>;
  assignableUsers: Array<{ id: number; name: string }>;
  canCreateTasks: boolean;
  canCreateBoards: boolean;
}

interface OrderedColumn {
  name: string;
  status: ApiTaskStatus | null;
  tasks: ApiTask[];
  isMissing: boolean;
}

const STATUS_ORDER = ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'];
const DONE_STATUS_NAMES = new Set(['done', 'completada', 'completado']);

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function priorityColor(level: number) {
  if (level >= 3) return 'bg-destructive';
  if (level === 2) return 'bg-warning';
  return 'bg-info';
}

function priorityBorderColor(level: number) {
  if (level >= 3) return 'border-l-destructive';
  if (level === 2) return 'border-l-warning';
  return 'border-l-info';
}

function TaskCard({
  task,
  priorities,
  userMap,
  onOpen,
}: {
  task: ApiTask;
  priorities: ApiTaskPriority[];
  userMap: Map<number, string>;
  onOpen: (task: ApiTask) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id_task,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const prio = priorities.find((p) => p.id_priority === task.priority);
  const prioLevel = prio?.level ?? 0;
  const assignedName = task.assigned_to ? (userMap.get(task.assigned_to) ?? `#${task.assigned_to}`) : 'Sin asignar';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onOpen(task)}
      className={`bg-card border border-border border-l-[3px] ${priorityBorderColor(prioLevel)} rounded-[4px] p-2.5 mb-1.5 hover:border-primary/30 transition-colors cursor-pointer group`}
    >
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
            <span className={`w-2 h-2 rounded-full shrink-0 ${priorityColor(prioLevel)}`} />
            <h3 className="text-[12px] font-medium text-foreground truncate">{task.title}</h3>
          </div>
          {task.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{task.description}</p>}
          <p className="text-[10px] text-muted-foreground mt-1 truncate">Asignado: {assignedName}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {task.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {task.due_date}
            </span>
          )}
        </div>
        {prio && <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded font-medium">{prio.name}</span>}
      </div>
    </div>
  );
}

function DroppableColumn({ id, disabled, children }: { id: string; disabled: boolean; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id, disabled });
  return <div ref={setNodeRef}>{children}</div>;
}

export function ProjectTasksWorkspace({
  projectId,
  userMap,
  assignableUsers,
  canCreateTasks,
  canCreateBoards,
}: ProjectTasksWorkspaceProps) {
  const { user } = useAuth();
  const currentUserId = useMemo(() => {
    const parsed = Number(user?.id ?? 0);
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
  }, [user]);

  const { data: boards, loading: loadingBoards, refetch: refetchBoards } = useApiBoards(projectId);
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>(undefined);

  const { data: tasks, loading: loadingTasks, statuses, priorities, refetch: refetchTasks } = useApiTasks(selectedBoardId, projectId);

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<number | 'all'>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<number | ''>('');
  const [formPriority, setFormPriority] = useState<number | ''>('');
  const [formAssignedTo, setFormAssignedTo] = useState<number | ''>('');
  const [formDueDate, setFormDueDate] = useState('');

  const [showBoardModal, setShowBoardModal] = useState(false);
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');

  useEffect(() => {
    if (boards && boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id_board);
    }
  }, [boards, selectedBoardId]);

  const loading = loadingBoards || loadingTasks;

  const filteredTasks = useMemo(() => {
    let list = tasks ?? [];

    if (priorityFilter !== 'all') {
      list = list.filter((t) => t.priority === priorityFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(term));
    }

    return list;
  }, [tasks, priorityFilter, searchTerm]);

  const statusByName = useMemo(() => {
    const map = new Map<string, ApiTaskStatus>();
    statuses.forEach((s) => map.set(normalizeName(s.name), s));
    return map;
  }, [statuses]);

  const doneStatusIds = useMemo(
    () => new Set(statuses.filter((s) => DONE_STATUS_NAMES.has(normalizeName(s.name))).map((s) => s.id_status)),
    [statuses],
  );

  const columns = useMemo<OrderedColumn[]>(() => {
    return STATUS_ORDER.map((name) => {
      const status = statusByName.get(normalizeName(name)) ?? null;
      return {
        name,
        status,
        tasks: status ? filteredTasks.filter((t) => t.status === status.id_status) : [],
        isMissing: status == null,
      };
    });
  }, [statusByName, filteredTasks]);

  const handleDragStart = (event: { active: { id: string | number } }) => {
    setActiveDragId(Number(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const overId = String(over.id);
    let targetStatus: ApiTaskStatus | null = null;

    const column = columns.find((col) => `status-${col.name}` === overId);
    if (column?.status) {
      targetStatus = column.status;
    } else {
      const overTask = (tasks ?? []).find((t) => String(t.id_task) === overId);
      if (overTask) {
        targetStatus = statuses.find((s) => s.id_status === overTask.status) ?? null;
      }
    }

    if (!targetStatus) return;

    const draggedTask = (tasks ?? []).find((t) => t.id_task === Number(active.id));
    if (!draggedTask || draggedTask.status === targetStatus.id_status) return;

    try {
      const enteringDone = doneStatusIds.has(targetStatus.id_status);
      await tasksService.update(draggedTask.id_task, {
        status: targetStatus.id_status,
        completed_at: enteringDone ? (draggedTask.completed_at ?? new Date().toISOString()) : null,
      });
      toast.success(`Tarea movida a ${targetStatus.name}`);
      refetchTasks();
    } catch {
      toast.error('No se pudo mover la tarea.');
    }
  };

  const activeTask = activeDragId ? (tasks ?? []).find((t) => t.id_task === activeDragId) ?? null : null;

  const handleQuickUpdate = async (
    task: ApiTask,
    patch: { status?: number | null; priority?: number | null; completed_at?: string | null },
  ) => {
    setUpdatingTaskId(task.id_task);
    try {
      const nextPatch = { ...patch };
      if (typeof patch.status !== 'undefined') {
        const enteringDone = patch.status != null && doneStatusIds.has(patch.status);
        nextPatch.completed_at = enteringDone ? (task.completed_at ?? new Date().toISOString()) : null;
      }
      await tasksService.update(task.id_task, nextPatch);
      refetchTasks();
      if (selectedTask?.id_task === task.id_task) {
        const refreshed = await tasksService.get(task.id_task);
        setSelectedTask(refreshed);
      }
    } catch {
      toast.error('No se pudo actualizar la tarea.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoardId) {
      toast.error('Selecciona un board primero.');
      return;
    }
    if (!canCreateTasks) {
      toast.error('Tu rol no puede crear historias.');
      return;
    }

    setCreatingTask(true);
    try {
      await tasksService.create({
        board: selectedBoardId,
        title: formTitle.trim(),
        description: formDesc.trim() || undefined,
        status: formStatus !== '' ? formStatus : statusByName.get(normalizeName('Backlog'))?.id_status,
        priority: formPriority !== '' ? formPriority : undefined,
        created_by: currentUserId ?? undefined,
        assigned_to: formAssignedTo !== '' ? formAssignedTo : undefined,
        due_date: formDueDate || undefined,
      });

      setFormTitle('');
      setFormDesc('');
      setFormStatus('');
      setFormPriority('');
      setFormAssignedTo('');
      setFormDueDate('');
      setShowTaskModal(false);
      toast.success('Historia creada.');
      refetchTasks();
    } catch {
      toast.error('No se pudo crear la historia.');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateBoards) {
      toast.error('Tu rol no puede crear boards.');
      return;
    }

    if (!boardName.trim()) {
      toast.error('El nombre del board es obligatorio.');
      return;
    }

    setCreatingBoard(true);
    try {
      const created = await tasksService.createBoard(projectId, boardName.trim(), boardDescription.trim() || undefined);
      setBoardName('');
      setBoardDescription('');
      setShowBoardModal(false);
      toast.success('Board creado.');
      await refetchBoards();
      setSelectedBoardId(created.id_board);
    } catch {
      toast.error('No se pudo crear el board.');
    } finally {
      setCreatingBoard(false);
    }
  };

  const handleStatusChangeFromPanel = async (task: ApiTask, newStatusId: number) => {
    try {
      const enteringDone = doneStatusIds.has(newStatusId);
      await tasksService.update(task.id_task, {
        status: newStatusId,
        completed_at: enteringDone ? (task.completed_at ?? new Date().toISOString()) : null,
      });
      const refreshed = await tasksService.get(task.id_task);
      setSelectedTask(refreshed);
      refetchTasks();
      const name = statuses.find((s) => s.id_status === newStatusId)?.name ?? 'nuevo estado';
      toast.success(`Estado actualizado a ${name}`);
    } catch {
      toast.error('No se pudo cambiar el estado.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground">Board</span>
          <select
            value={selectedBoardId ?? ''}
            onChange={(e) => setSelectedBoardId(Number(e.target.value))}
            className="h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px]"
            disabled={!boards || boards.length === 0}
          >
            {!boards || boards.length === 0 ? (
              <option value="">Sin boards</option>
            ) : (
              boards.map((b) => (
                <option key={b.id_board} value={b.id_board}>{b.name}</option>
              ))
            )}
          </select>

          <button
            onClick={() => setShowBoardModal(true)}
            disabled={!canCreateBoards}
            className="h-7 px-2.5 bg-card border border-border rounded-[3px] text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Nuevo board</span>
          </button>

          <button
            onClick={() => refetchTasks()}
            className="h-7 px-2.5 bg-card border border-border rounded-[3px] text-[11px] text-muted-foreground hover:text-foreground"
          >
            <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Actualizar</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-secondary border border-border rounded-[3px] p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3 h-3" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3 h-3" /> Lista
            </button>
          </div>

          <button
            onClick={() => setShowTaskModal(true)}
            disabled={!selectedBoardId || !canCreateTasks}
            className="h-7 px-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Nueva historia
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {priorities.length > 0 && (
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px]"
          >
            <option value="all">Todas las prioridades</option>
            {priorities.map((p) => (
              <option key={p.id_priority} value={p.id_priority}>{p.name}</option>
            ))}
          </select>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar historias..."
            className="h-7 bg-surface-secondary border border-border rounded-[3px] pl-7 pr-3 text-[11px] w-52"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && !selectedBoardId && (
        <div className="py-16 text-center text-[12px] text-muted-foreground">Este proyecto no tiene boards.</div>
      )}

      {!loading && selectedBoardId && viewMode === 'kanban' && (
        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {columns.map((column, colIndex) => (
              <DroppableColumn
                key={column.name}
                id={`status-${column.name}`}
                disabled={column.isMissing}
              >
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: colIndex * 0.04, ease: 'easeOut' }}
                  className={`rounded-[4px] p-2.5 border ${column.isMissing ? 'border-dashed border-border/60 bg-surface-secondary/30' : 'border-border bg-surface-secondary/50'}`}
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">{column.name}</h2>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-card text-muted-foreground">
                      {column.tasks.length}
                    </span>
                  </div>

                  {!column.isMissing ? (
                    <SortableContext
                      items={column.tasks.map((t) => t.id_task)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="min-h-[320px]">
                        {column.tasks.map((task) => (
                          <TaskCard
                            key={task.id_task}
                            task={task}
                            priorities={priorities}
                            userMap={userMap}
                            onOpen={setSelectedTask}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  ) : (
                    <div className="min-h-[320px] flex items-center justify-center text-[11px] text-muted-foreground text-center px-2">
                      Estado no disponible en backend
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
      )}

      {!loading && selectedBoardId && viewMode === 'table' && (
        <div className="bg-card border border-border rounded-[4px] overflow-auto">
          <table className="w-full min-w-[940px] table-fixed">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50">
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Titulo</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Estado</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Prioridad</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Asignado</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Creador</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Vence</th>
                <th className="text-right py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {
                filteredTasks.map((task) => (
                  <tr key={task.id_task} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                    <td className="py-2 px-3">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="text-left"
                      >
                        <p className="text-[12px] font-medium text-foreground truncate max-w-[280px]">{task.title}</p>
                        {task.description && <p className="text-[11px] text-muted-foreground truncate max-w-[280px]">{task.description}</p>}
                      </button>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={task.status ?? ''}
                        disabled={updatingTaskId === task.id_task}
                        onChange={(e) => handleQuickUpdate(task, { status: e.target.value ? Number(e.target.value) : null })}
                        className="h-7 bg-surface-secondary border border-border rounded-[3px] px-2 text-[11px]"
                      >
                        <option value="">Sin estado</option>
                        {statuses.map((s) => (
                          <option key={s.id_status} value={s.id_status}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={task.priority ?? ''}
                        disabled={updatingTaskId === task.id_task}
                        onChange={(e) => handleQuickUpdate(task, { priority: e.target.value ? Number(e.target.value) : null })}
                        className="h-7 bg-surface-secondary border border-border rounded-[3px] px-2 text-[11px]"
                      >
                        <option value="">Sin prioridad</option>
                        {priorities.map((p) => (
                          <option key={p.id_priority} value={p.id_priority}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3 text-[11px] text-muted-foreground">
                      {task.assigned_to ? (userMap.get(task.assigned_to) ?? `#${task.assigned_to}`) : 'Sin asignar'}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-muted-foreground">
                      {task.created_by ? (userMap.get(task.created_by) ?? `#${task.created_by}`) : '—'}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-muted-foreground">{task.due_date ?? '—'}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="inline-flex items-center gap-1 h-7 px-2.5 border border-border rounded-[3px] text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-3 h-3" /> Editar
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setShowTaskModal(false)}>
          <div className="bg-card border border-border rounded-[4px] p-5 max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-foreground">Nueva historia de usuario</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-[11px] text-muted-foreground">Cerrar</button>
            </div>

            <form className="space-y-3" onSubmit={handleCreateTask}>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">Titulo *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">Descripcion</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-surface-secondary border border-border rounded-[3px] px-2.5 py-1.5 text-[11px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Estado</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px]"
                  >
                    <option value="">Backlog por defecto</option>
                    {statuses.map((s) => (
                      <option key={s.id_status} value={s.id_status}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Prioridad</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px]"
                  >
                    <option value="">Sin prioridad</option>
                    {priorities.map((p) => (
                      <option key={p.id_priority} value={p.id_priority}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Asignar a</label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px]"
                  >
                    <option value="">Sin asignar</option>
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Fecha limite</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 h-7 border border-border rounded-[3px] text-[11px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="flex-1 h-7 bg-primary text-primary-foreground rounded-[3px] text-[11px] disabled:opacity-50"
                >
                  {creatingTask ? 'Creando...' : 'Crear historia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBoardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setShowBoardModal(false)}>
          <div className="bg-card border border-border rounded-[4px] p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-foreground">Nuevo board</h2>
              <button onClick={() => setShowBoardModal(false)} className="text-[11px] text-muted-foreground">Cerrar</button>
            </div>

            <form className="space-y-3" onSubmit={handleCreateBoard}>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">Descripcion</label>
                <textarea
                  rows={2}
                  value={boardDescription}
                  onChange={(e) => setBoardDescription(e.target.value)}
                  className="w-full bg-surface-secondary border border-border rounded-[3px] px-2.5 py-1.5 text-[11px] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBoardModal(false)}
                  className="flex-1 h-7 border border-border rounded-[3px] text-[11px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingBoard}
                  className="flex-1 h-7 bg-primary text-primary-foreground rounded-[3px] text-[11px] disabled:opacity-50"
                >
                  {creatingBoard ? 'Creando...' : 'Crear board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TaskDetailPanel
        task={selectedTask}
        statuses={statuses}
        priorities={priorities}
        userMap={userMap}
        assignableUsers={assignableUsers}
        canEditAssignment={canCreateTasks}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChangeFromPanel}
        onTaskUpdated={(updated) => {
          setSelectedTask(updated);
          refetchTasks();
        }}
      />
    </div>
  );
}
