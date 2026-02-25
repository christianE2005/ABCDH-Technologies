import { useState } from 'react';
import { motion } from 'motion/react';
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Calendar, User, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  dueDate: string;
  project: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

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

  const priorityColors = {
    high: 'border-l-danger',
    medium: 'border-l-warning',
    low: 'border-l-info',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-card-border ${priorityColors[task.priority]} border-l-4 rounded-lg p-4 mb-3 hover:border-primary/30 transition-all cursor-move group`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1">{task.title}</h3>
          <p className="text-xs text-text-secondary line-clamp-2">{task.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-card-border">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <User className="w-3 h-3" />
          <span>{task.assignee}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar className="w-3 h-3" />
          <span>{task.dueDate}</span>
        </div>
      </div>

      <div className="mt-2">
        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
          {task.project}
        </span>
      </div>
    </div>
  );
}

export default function Backlog() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'pending',
      title: 'Pendiente',
      tasks: [
        {
          id: '1',
          title: 'Diseñar arquitectura de microservicios',
          description: 'Definir estructura de servicios y comunicación entre componentes',
          priority: 'high',
          assignee: 'Carlos T.',
          dueDate: '28 Feb',
          project: 'Proyecto Alpha'
        },
        {
          id: '2',
          title: 'Configurar pipeline CI/CD',
          description: 'Implementar pipeline automático de deploy en AWS',
          priority: 'medium',
          assignee: 'Ana M.',
          dueDate: '02 Mar',
          project: 'Proyecto Beta'
        },
        {
          id: '3',
          title: 'Auditoría de seguridad',
          description: 'Revisar vulnerabilidades en aplicación legacy',
          priority: 'high',
          assignee: 'Roberto S.',
          dueDate: '01 Mar',
          project: 'Proyecto Delta'
        },
      ]
    },
    {
      id: 'in_progress',
      title: 'En Proceso',
      tasks: [
        {
          id: '4',
          title: 'Desarrollo API REST',
          description: 'Implementar endpoints de autenticación y usuarios',
          priority: 'high',
          assignee: 'Luis B.',
          dueDate: '05 Mar',
          project: 'Proyecto Alpha'
        },
        {
          id: '5',
          title: 'Testing de integración',
          description: 'Pruebas end-to-end de flujos principales',
          priority: 'medium',
          assignee: 'Pedro Q.',
          dueDate: '08 Mar',
          project: 'Proyecto Gamma'
        },
      ]
    },
    {
      id: 'completed',
      title: 'Completada',
      tasks: [
        {
          id: '6',
          title: 'Setup inicial del proyecto',
          description: 'Configuración de repositorio y ambiente de desarrollo',
          priority: 'low',
          assignee: 'María G.',
          dueDate: '15 Feb',
          project: 'Proyecto Alpha'
        },
        {
          id: '7',
          title: 'Documentación técnica',
          description: 'Crear documentación de arquitectura y APIs',
          priority: 'low',
          assignee: 'Sofia F.',
          dueDate: '20 Feb',
          project: 'Proyecto Beta'
        },
        {
          id: '8',
          title: 'Revisión de código',
          description: 'Code review de módulos principales',
          priority: 'medium',
          assignee: 'Carlos T.',
          dueDate: '22 Feb',
          project: 'Proyecto Gamma'
        },
      ]
    },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeColumnIndex = columns.findIndex(col => 
      col.tasks.some(task => task.id === active.id)
    );
    const overColumnId = over.id as string;
    const overColumnIndex = columns.findIndex(col => col.id === overColumnId || col.tasks.some(task => task.id === overColumnId));

    if (activeColumnIndex === -1 || overColumnIndex === -1) return;

    const activeTask = columns[activeColumnIndex].tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    // Remove task from source column
    const newColumns = [...columns];
    newColumns[activeColumnIndex] = {
      ...newColumns[activeColumnIndex],
      tasks: newColumns[activeColumnIndex].tasks.filter(task => task.id !== active.id)
    };

    // Add task to destination column
    const targetColumn = overColumnId.startsWith('droppable-') 
      ? overColumnIndex 
      : overColumnIndex;
    
    newColumns[targetColumn] = {
      ...newColumns[targetColumn],
      tasks: [...newColumns[targetColumn].tasks, activeTask]
    };

    setColumns(newColumns);
  };

  const activeTask = activeId ? columns.flatMap(col => col.tasks).find(task => task.id === activeId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Backlog</h1>
          <p className="text-text-secondary">Gestiona tareas y actividades con vista Kanban</p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          Agregar Actividad
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-secondary rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-foreground">{column.title}</h2>
                  <span className="px-2 py-1 bg-card text-text-secondary text-xs rounded-md font-medium">
                    {column.tasks.length}
                  </span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  column.id === 'pending' ? 'bg-text-secondary' :
                  column.id === 'in_progress' ? 'bg-warning' :
                  'bg-success'
                }`}></div>
              </div>

              <SortableContext
                items={column.tasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
                id={`droppable-${column.id}`}
              >
                <div className="space-y-3 min-h-[400px]">
                  {column.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>

              {column.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mb-3">
                    <AlertCircle className="w-6 h-6 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-secondary">No hay tareas</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="bg-card border border-primary rounded-lg p-4 shadow-xl rotate-3">
              <h3 className="font-medium text-foreground">{activeTask.title}</h3>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-card-border rounded-xl p-8 max-w-lg w-full"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Agregar Nueva Actividad</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Implementar módulo de reportes"
                  className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe la actividad..."
                  className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Prioridad *
                  </label>
                  <select className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Asignar a *
                  </label>
                  <select className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                    <option>Seleccionar...</option>
                    <option>María G.</option>
                    <option>Carlos T.</option>
                    <option>Ana M.</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Proyecto
                  </label>
                  <select className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                    <option>Proyecto Alpha</option>
                    <option>Proyecto Beta</option>
                    <option>Proyecto Gamma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-6 py-3 bg-background-secondary hover:bg-sidebar-hover text-foreground rounded-lg font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all"
                >
                  Crear Actividad
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
