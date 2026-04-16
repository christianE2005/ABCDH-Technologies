import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { DndContext, DragEndEvent, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Calendar, AlertCircle, X, LayoutGrid, List, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useApiProjects, useApiBoards, useApiTasks, useApiUsers } from '../hooks/useProjectData';
import { tasksService } from '../../services';
import type { ApiTask, ApiTaskStatus, ApiTaskPriority } from '../../services';
import { TaskDetailPanel } from '../components/TaskDetailPanel';

// ── Helpers ──

function priorityColor(level: number) {
  if (level >= 3) return 'bg-destructive';
  if (level === 2) return 'bg-warning';
  return 'bg-info';
}

function statusDotColor(index: number, total: number) {
  if (index === total - 1) return 'bg-success';
  if (index === 0) return 'bg-muted-foreground';
  return 'bg-warning';
}

// ── Task Card (draggable) ──

function priorityBorderColor(level: number) {
  if (level >= 3) return 'border-l-destructive';
  if (level === 2) return 'border-l-warning';
  return 'border-l-info';
}

function TaskCard({ task, priorities }: { task: ApiTask; statuses?: ApiTaskStatus[]; priorities: ApiTaskPriority[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id_task });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const prio = priorities.find((p) => p.id_priority === task.priority);
  const prioLevel = prio?.level ?? 0;

  return (
    <div ref={setNodeRef} style={style} className={`bg-card border border-border border-l-[3px] ${priorityBorderColor(prioLevel)} rounded-[4px] p-2.5 mb-1.5 hover:border-primary/30 transition-colors cursor-move group`} {...attributes} {...listeners}>
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${priorityColor(prioLevel)}`} />
            <h3 className="text-[12px] font-medium text-foreground truncate">{task.title}</h3>
          </div>
          {task.description && <p className="text-[11px] text-muted-foreground line-clamp-2 ml-3.5">{task.description}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 ml-3.5">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {task.assigned_to && (
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-medium shrink-0">
              #{task.assigned_to}
            </span>
          )}
          {task.due_date && (
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.due_date}</span>
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Project + Board pickers
  const { data: projects, loading: loadingProjects } = useApiProjects();
  const [selectedProject, setSelectedProject] = useState<number | null>(() => {
    const p = searchParams.get('project');
    return p ? Number(p) : null;
  });
  const { data: boards, loading: loadingBoards } = useApiBoards(selectedProject ?? undefined);
  const [selectedBoard, setSelectedBoard] = useState<number | undefined>(undefined);

  // Tasks for the selected board
  const { data: tasks, loading: loadingTasks, statuses, priorities, refetch: refetchTasks } = useApiTasks(selectedBoard);

  // Users for the detail panel
  const { data: users } = useApiUsers();
  const userMap = useMemo(() => {
    const m = new Map<number, string>();
    (users ?? []).forEach((u) => m.set(u.id_user, u.username));
    return m;
  }, [users]);

  const loading = loadingProjects || loadingBoards || loadingTasks;

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<number | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<number | ''>('');
  const [formDue, setFormDue] = useState('');

  // Sync URL param
  useEffect(() => {
    const p = searchParams.get('project');
    if (p !== null) setSelectedProject(Number(p));
  }, [searchParams]);

  // Auto-select first board when boards load
  useEffect(() => {
    if (boards && boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0].id_board);
    }
  }, [boards, selectedBoard]);

  // Reset board when project changes
  useEffect(() => { setSelectedBoard(undefined); }, [selectedProject]);

  const handleProjectFilter = (projectId: number | null) => {
    setSelectedProject(projectId);
    if (projectId) setSearchParams({ project: String(projectId) });
    else setSearchParams({});
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
    return statuses.map((s, idx) => ({
      status: s,
      dotColor: statusDotColor(idx, statuses.length),
      tasks: filteredTasks.filter((t) => t.status === s.id_status),
    }));
  }, [statuses, filteredTasks]);

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

    const activeTask = (tasks ?? []).find((t) => t.id_task === Number(active.id));
    if (!activeTask || activeTask.status === targetStatusId) return;

    const statusName = statuses.find((s) => s.id_status === targetStatusId)?.name ?? '';
    try {
      await tasksService.update(activeTask.id_task, { status: targetStatusId });
      toast.success(`Tarea movida a ${statusName}`);
      refetchTasks();
    } catch {
      toast.error('Error al mover la tarea');
    }
  };

  const activeTask = activeId ? (tasks ?? []).find((t) => t.id_task === activeId) ?? null : null;
  const selectedProjectData = selectedProject && projects ? projects.find((p) => p.id_project === selectedProject) ?? null : null;

  // ── Create task ──
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoard) { toast.error('Selecciona un board primero'); return; }
    setCreating(true);
    try {
      await tasksService.create({
        board: selectedBoard,
        title: formTitle,
        description: formDesc || undefined,
        priority: formPriority !== '' ? formPriority : undefined,
        due_date: formDue || undefined,
      });
      toast.success('Tarea creada exitosamente');
      setShowAddTask(false);
      setFormTitle(''); setFormDesc(''); setFormPriority(''); setFormDue('');
      refetchTasks();
    } catch {
      toast.error('Error al crear la tarea');
    } finally {
      setCreating(false);
    }
  };

  // ── Update task status from slideout ──
  const handleStatusChange = async (task: ApiTask, newStatusId: number) => {
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

  return (
    <div className="px-4 pb-6 pt-3 space-y-3 max-w-[1600px]">
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
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-secondary border border-border rounded-[3px] p-0.5">
            <button onClick={() => setViewMode('kanban')} className={`px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors flex items-center gap-1 ${viewMode === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutGrid className="w-3 h-3" /> Kanban
            </button>
            <button onClick={() => setViewMode('table')} className={`px-2 py-1 rounded-[2px] text-[11px] font-medium transition-colors flex items-center gap-1 ${viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <List className="w-3 h-3" /> Tabla
            </button>
          </div>
          <button onClick={() => setShowAddTask(true)} disabled={!selectedBoard} className="h-7 px-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50">
            <Plus className="w-3.5 h-3.5" /> Nueva tarea
          </button>
        </div>
      </div>

      {/* Project pills + board picker */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button onClick={() => handleProjectFilter(null)} className={`px-2.5 py-1 rounded-[3px] text-[11px] font-medium whitespace-nowrap transition-colors ${selectedProject === null ? 'bg-primary text-primary-foreground' : 'bg-surface-secondary border border-border text-muted-foreground hover:text-foreground'}`}>
            Todos
          </button>
          {(projects ?? []).map((project) => (
            <button key={project.id_project} onClick={() => handleProjectFilter(project.id_project)} className={`px-2.5 py-1 rounded-[3px] text-[11px] font-medium whitespace-nowrap transition-colors ${selectedProject === project.id_project ? 'bg-primary text-primary-foreground' : 'bg-surface-secondary border border-border text-muted-foreground hover:text-foreground'}`}>
              {project.name}
            </button>
          ))}
        </div>

        {/* Board dropdown + priority filter + search */}
        <div className="flex items-center gap-3 flex-wrap">
          {selectedProject && boards && boards.length > 0 && (
            <select value={selectedBoard ?? ''} onChange={(e) => setSelectedBoard(Number(e.target.value))} className="h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20">
              {boards.map((b) => (<option key={b.id_board} value={b.id_board}>{b.name}</option>))}
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

      {/* No board selected */}
      {!loading && !selectedBoard && selectedProject && (
        <div className="py-16 text-center text-[12px] text-muted-foreground">Este proyecto no tiene boards. Crea uno primero.</div>
      )}

      {/* Kanban view */}
      {!loading && selectedBoard && viewMode === 'kanban' && (
        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((col, colIndex) => (
              <DroppableColumn key={col.status.id_status} id={String(col.status.id_status)}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: colIndex * 0.1, ease: 'easeOut' }} className={`bg-surface-secondary/50 border rounded-[4px] p-2.5 ${col.tasks.length >= WIP_LIMIT ? 'border-warning/50' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                      <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">{col.status.name}</h2>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${col.tasks.length >= WIP_LIMIT ? 'bg-warning/20 text-warning' : 'bg-card text-muted-foreground'}`}>
                        {col.tasks.length}{col.tasks.length >= WIP_LIMIT ? ` / ${WIP_LIMIT}` : ''}
                      </span>
                    </div>
                  </div>
                  <SortableContext items={col.tasks.map((t) => t.id_task)} strategy={verticalListSortingStrategy}>
                    <div className="min-h-[200px]">
                      {col.tasks.map((task, taskIndex) => (
                        <motion.div key={task.id_task} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: colIndex * 0.1 + taskIndex * 0.05, ease: 'easeOut' }}>
                          <TaskCard task={task} statuses={statuses} priorities={priorities} />
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
      )}

      {/* Table view */}
      {!loading && selectedBoard && viewMode === 'table' && (
        <div className="bg-card border border-border rounded-[4px] overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_120px_100px_100px] gap-0 border-b border-border bg-surface-secondary/50 px-4 py-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">#</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Título</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Estado</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Prioridad</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] text-right">Fecha</span>
          </div>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => {
              const st = statuses.find((s) => s.id_status === task.status);
              const pr = priorities.find((p) => p.id_priority === task.priority);
              return (
                <motion.div key={task.id_task} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }} className="grid grid-cols-[40px_1fr_120px_100px_100px] gap-0 px-4 py-2 border-b border-border/50 hover:bg-accent/30 transition-colors items-center cursor-pointer" onClick={() => setSelectedTask(task)}>
                  <span className="text-[11px] text-muted-foreground">{index + 1}</span>
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${priorityColor(pr?.level ?? 0)}`} />
                      <span className="text-[12px] font-medium text-foreground truncate">{task.title}</span>
                    </div>
                    {task.description && <span className="text-[11px] text-muted-foreground truncate ml-4 block">{task.description}</span>}
                  </div>
                  <div><span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{st?.name ?? '—'}</span></div>
                  <span className="text-[11px] font-medium text-muted-foreground">{pr?.name ?? '—'}</span>
                  <span className="text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
                    {task.due_date && <><Calendar className="w-3 h-3" />{task.due_date}</>}
                  </span>
                </motion.div>
              );
            })
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

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setShowAddTask(false)}>
          <div className="bg-card border border-border rounded-[4px] p-5 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-foreground">Nueva Tarea</h2>
              <button onClick={() => setShowAddTask(false)} className="p-0.5 rounded-[3px] hover:bg-surface-secondary transition-colors"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
            <form className="space-y-3" onSubmit={handleCreateTask}>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">Título *</label>
                <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Ej: Implementar módulo de reportes" className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">Descripción</label>
                <textarea rows={2} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Describe la actividad..." className="w-full bg-surface-secondary border border-border rounded-[3px] px-2.5 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Prioridad</label>
                  <select value={formPriority} onChange={(e) => setFormPriority(e.target.value ? Number(e.target.value) : '')} className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20">
                    <option value="">Sin prioridad</option>
                    {priorities.map((p) => (<option key={p.id_priority} value={p.id_priority}>{p.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Fecha Límite</label>
                  <input type="date" value={formDue} onChange={(e) => setFormDue(e.target.value)} className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddTask(false)} className="flex-1 h-7 border border-border rounded-[3px] text-[11px] font-medium text-foreground hover:bg-surface-secondary transition-colors">Cancelar</button>
                <button type="submit" disabled={creating} className="flex-1 h-7 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors disabled:opacity-50">{creating ? 'Creando…' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        statuses={statuses}
        priorities={priorities}
        userMap={userMap}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
