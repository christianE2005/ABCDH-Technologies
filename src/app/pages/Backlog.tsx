import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { DndContext, DragEndEvent, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Calendar, User, AlertCircle, X, LayoutGrid, List, Search } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useProjects } from '../hooks/useProjectData';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  dueDate: string;
  project: string;
  projectId: number;
  status: 'pending' | 'in_progress' | 'completed';
}

const initialTasks: Task[] = [
  // ERP Modernization (id: 1)
  { id: '1', title: 'Diseñar arquitectura de microservicios', description: 'Definir estructura de servicios y comunicación entre componentes', priority: 'high', assignee: 'Carlos R.', dueDate: '28 Feb', project: 'ERP Modernization', projectId: 1, status: 'pending' },
  { id: '4', title: 'Desarrollo API REST', description: 'Implementar endpoints de autenticación y usuarios', priority: 'high', assignee: 'Luis B.', dueDate: '05 Mar', project: 'ERP Modernization', projectId: 1, status: 'in_progress' },
  { id: '6', title: 'Setup inicial del proyecto', description: 'Configuración de repositorio y ambiente de desarrollo', priority: 'low', assignee: 'María G.', dueDate: '15 Feb', project: 'ERP Modernization', projectId: 1, status: 'completed' },
  // Cloud Migration (id: 2)
  { id: '2', title: 'Configurar pipeline CI/CD', description: 'Implementar pipeline automático de deploy en AWS', priority: 'medium', assignee: 'Sandra L.', dueDate: '02 Mar', project: 'Cloud Migration', projectId: 2, status: 'pending' },
  { id: '7', title: 'Documentación técnica', description: 'Crear documentación de arquitectura y APIs', priority: 'low', assignee: 'Sofia F.', dueDate: '20 Feb', project: 'Cloud Migration', projectId: 2, status: 'completed' },
  { id: '9', title: 'Migración de base de datos', description: 'Migrar BD principal a AWS RDS con réplicas', priority: 'high', assignee: 'Carlos R.', dueDate: '10 Mar', project: 'Cloud Migration', projectId: 2, status: 'in_progress' },
  // Mobile App (id: 3)
  { id: '5', title: 'Testing de integración', description: 'Pruebas end-to-end de flujos principales', priority: 'medium', assignee: 'Pedro Q.', dueDate: '08 Mar', project: 'Mobile App', projectId: 3, status: 'in_progress' },
  { id: '8', title: 'Revisión de código', description: 'Code review de módulos principales', priority: 'medium', assignee: 'Carlos R.', dueDate: '22 Feb', project: 'Mobile App', projectId: 3, status: 'completed' },
  { id: '10', title: 'Implementar push notifications', description: 'Sistema de notificaciones para iOS y Android', priority: 'medium', assignee: 'Ana M.', dueDate: '15 Mar', project: 'Mobile App', projectId: 3, status: 'pending' },
  // Security Audit (id: 4)
  { id: '3', title: 'Auditoría de seguridad', description: 'Revisar vulnerabilidades en aplicación legacy', priority: 'high', assignee: 'Roberto S.', dueDate: '01 Mar', project: 'Security Audit', projectId: 4, status: 'pending' },
  { id: '11', title: 'Penetration testing', description: 'Ejecutar tests de penetración en entornos de staging', priority: 'high', assignee: 'Roberto S.', dueDate: '12 Mar', project: 'Security Audit', projectId: 4, status: 'pending' },
  { id: '12', title: 'Reporte de compliance SOC 2', description: 'Documentar hallazgos y plan de remediación', priority: 'high', assignee: 'Roberto S.', dueDate: '20 Mar', project: 'Security Audit', projectId: 4, status: 'pending' },
  // Data Analytics (id: 5)
  { id: '13', title: 'Diseño de data warehouse', description: 'Modelado dimensional para reportes de BI', priority: 'medium', assignee: 'Laura T.', dueDate: '15 Mar', project: 'Data Analytics', projectId: 5, status: 'in_progress' },
  { id: '14', title: 'ETL pipelines', description: 'Construir pipelines de extracción y transformación', priority: 'medium', assignee: 'Laura T.', dueDate: '01 Abr', project: 'Data Analytics', projectId: 5, status: 'pending' },
  // API Gateway (id: 6)
  { id: '15', title: 'Configurar rate limiting', description: 'Implementar throttling y rate limiting por API key', priority: 'low', assignee: 'Diego M.', dueDate: '25 Feb', project: 'API Gateway', projectId: 6, status: 'completed' },
  { id: '16', title: 'Documentación OpenAPI', description: 'Generar specs Swagger para todos los endpoints', priority: 'low', assignee: 'Diego M.', dueDate: '28 Feb', project: 'API Gateway', projectId: 6, status: 'completed' },
  // DevOps Pipeline (id: 7)
  { id: '17', title: 'Configurar Kubernetes cluster', description: 'Setup de cluster K8s para staging y producción', priority: 'high', assignee: 'Sandra L.', dueDate: '10 Mar', project: 'DevOps Pipeline', projectId: 7, status: 'in_progress' },
  { id: '18', title: 'Monitoreo con Grafana', description: 'Dashboard de monitoreo y alertas con Prometheus/Grafana', priority: 'medium', assignee: 'Sandra L.', dueDate: '20 Mar', project: 'DevOps Pipeline', projectId: 7, status: 'pending' },
  // UX Redesign (id: 8)
  { id: '19', title: 'Research de usuarios', description: 'Entrevistas y encuestas con usuarios clave del portal', priority: 'medium', assignee: 'Paula H.', dueDate: '01 Mar', project: 'UX Redesign', projectId: 8, status: 'completed' },
  { id: '20', title: 'Wireframes de navegación', description: 'Diseño de nueva arquitectura de información', priority: 'medium', assignee: 'Paula H.', dueDate: '15 Mar', project: 'UX Redesign', projectId: 8, status: 'in_progress' },
];

const statusLabels: Record<Task['status'], string> = {
  pending: 'Pendiente',
  in_progress: 'En Proceso',
  completed: 'Completada',
};

const statusDot: Record<string, string> = {
  pending: 'bg-muted-foreground',
  in_progress: 'bg-warning',
  completed: 'bg-success',
};

const priorityDot: Record<Task['priority'], string> = {
  high: 'bg-destructive',
  medium: 'bg-warning',
  low: 'bg-info',
};

function TaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-md p-3 mb-2 hover:border-primary/30 transition-colors cursor-move group"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />
            <h3 className="text-sm font-medium text-foreground truncate">{task.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 ml-3.5">{task.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5 ml-3.5">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.assignee}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {task.dueDate}
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded font-medium">
          {task.project}
        </span>
      </div>
    </div>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
}

export default function Backlog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { allProjects } = useProjects();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedProject, setSelectedProject] = useState<number | null>(() => {
    const p = searchParams.get('project');
    return p ? Number(p) : null;
  });
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const p = searchParams.get('project');
    if (p !== null) setSelectedProject(Number(p));
  }, [searchParams]);

  const handleProjectFilter = (projectId: number | null) => {
    setSelectedProject(projectId);
    if (projectId) {
      setSearchParams({ project: String(projectId) });
    } else {
      setSearchParams({});
    }
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (selectedProject !== null) {
      result = result.filter(t => t.projectId === selectedProject);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(term) ||
        t.assignee.toLowerCase().includes(term) ||
        t.project.toLowerCase().includes(term)
      );
    }
    return result;
  }, [tasks, selectedProject, searchTerm]);

  const columns = useMemo(() => [
    { id: 'pending' as const, title: 'Pendiente', tasks: filteredTasks.filter(t => t.status === 'pending') },
    { id: 'in_progress' as const, title: 'En Proceso', tasks: filteredTasks.filter(t => t.status === 'in_progress') },
    { id: 'completed' as const, title: 'Completada', tasks: filteredTasks.filter(t => t.status === 'completed') },
  ], [filteredTasks]);

  const handleDragStart = (event: { active: { id: string | number } }) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const overId = String(over.id);
    let targetStatus: Task['status'] | null = null;

    if (['pending', 'in_progress', 'completed'].includes(overId)) {
      targetStatus = overId as Task['status'];
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (!targetStatus) return;

    const activeTask = tasks.find(t => t.id === String(active.id));
    if (!activeTask || activeTask.status === targetStatus) return;

    setTasks(prev => prev.map(t =>
      t.id === String(active.id) ? { ...t, status: targetStatus! } : t
    ));
    toast.success(`Tarea movida a ${statusLabels[targetStatus]}`);
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;
  const selectedProjectData = selectedProject ? allProjects.find(p => p.id === selectedProject) : null;

  return (
    <div className="px-6 pb-6 pt-2 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Backlog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedProjectData
              ? <>Tareas de <span className="text-foreground font-medium">{selectedProjectData.name}</span></>
              : 'Gestiona tareas de todos los proyectos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-secondary rounded-md p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tabla
            </button>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva tarea
          </button>
        </div>
      </div>

      {/* Project Filter & Search */}
      <div className="space-y-3">
        {/* Project Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => handleProjectFilter(null)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              selectedProject === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            Todos
          </button>
          {allProjects.map((project) => {
            const taskCount = tasks.filter(t => t.projectId === project.id).length;
            return (
              <button
                key={project.id}
                onClick={() => handleProjectFilter(project.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedProject === project.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {project.name}
                <span className={`text-[10px] px-1.5 rounded-full ${
                  selectedProject === project.id
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-background text-muted-foreground'
                }`}>
                  {taskCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, persona o proyecto..."
            className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>
      </div>

      {/* Views */}
      {viewMode === 'kanban' ? (
        /* Kanban Board */
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((column, colIndex) => (
              <DroppableColumn key={column.id} id={column.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: colIndex * 0.1, ease: 'easeOut' }}
                  className="bg-secondary/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusDot[column.id]}`} />
                      <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">{column.title}</h2>
                      <span className="text-[11px] text-muted-foreground font-medium">{column.tasks.length}</span>
                    </div>
                  </div>

                  <SortableContext
                    items={column.tasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="min-h-[200px]">
                      {column.tasks.map((task, taskIndex) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: colIndex * 0.1 + taskIndex * 0.05, ease: 'easeOut' }}
                        >
                          <TaskCard task={task} />
                        </motion.div>
                      ))}
                    </div>
                  </SortableContext>

                  {column.tasks.length === 0 && (
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
              <div className="bg-card border border-primary rounded-md p-3 rotate-2 opacity-90">
                <h3 className="text-sm font-medium text-foreground">{activeTask.title}</h3>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        /* Table View (GitHub Projects style) */
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_140px_120px_100px_100px] gap-0 border-b border-border bg-secondary/30 px-4 py-2.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">#</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Título</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Asignado</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Estado</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Prioridad</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide text-right">Fecha</span>
          </div>

          {/* Table Rows */}
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04, ease: 'easeOut' }}
                className="grid grid-cols-[40px_1fr_140px_120px_100px_100px] gap-0 px-4 py-3 border-b border-border/50 hover:bg-accent/30 transition-colors items-center"
              >
                <span className="text-xs text-muted-foreground">{index + 1}</span>

                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />
                    <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 ml-4">
                    <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded font-medium">
                      {task.project}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{task.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium shrink-0">
                    {task.assignee.charAt(0)}
                  </div>
                  <span className="text-xs text-foreground truncate">{task.assignee}</span>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    task.status === 'completed' ? 'bg-success/10 text-success' :
                    task.status === 'in_progress' ? 'bg-warning/10 text-warning' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot[task.status]}`} />
                    {statusLabels[task.status]}
                  </span>
                </div>

                <div>
                  <span className={`text-[11px] font-medium ${
                    task.priority === 'high' ? 'text-destructive' :
                    task.priority === 'medium' ? 'text-warning' :
                    'text-muted-foreground'
                  }`}>
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                </div>

                <span className="text-xs text-muted-foreground text-right flex items-center justify-end gap-1">
                  <Calendar className="w-3 h-3" />
                  {task.dueDate}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="w-6 h-6 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hay tareas para este filtro</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 bg-secondary/20 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground">
              {filteredTasks.length} tarea{filteredTasks.length !== 1 ? 's' : ''}
              {selectedProjectData ? ` en ${selectedProjectData.name}` : ' en total'}
            </p>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-foreground">Nueva Tarea</h2>
              <button onClick={() => setShowAddTask(false)} className="p-1 rounded hover:bg-accent transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setShowAddTask(false); toast.success('Tarea creada exitosamente'); }}>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Título *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Implementar módulo de reportes"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Describe la actividad..."
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Prioridad *</label>
                  <select className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Asignar a *</label>
                  <select required defaultValue="" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                    <option value="" disabled>Seleccionar...</option>
                    <option>María G.</option>
                    <option>Carlos R.</option>
                    <option>Ana M.</option>
                    <option>Roberto S.</option>
                    <option>Laura T.</option>
                    <option>Diego M.</option>
                    <option>Sandra L.</option>
                    <option>Paula H.</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Proyecto *</label>
                  <select
                    required
                    defaultValue={selectedProject ? String(selectedProject) : ''}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  >
                    <option value="" disabled>Seleccionar proyecto...</option>
                    {allProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Fecha Límite</label>
                  <input
                    type="date"
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-accent text-foreground rounded-md text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-medium transition-colors"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
