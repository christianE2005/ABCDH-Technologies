import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Calendar,
  Users,
  DollarSign,
  X,
  TrendingUp,
  Clock
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/hover-card';
import { useProjects } from '../hooks/useProjectData';

export default function Projects() {
  const { projects: filteredProjects, searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getProgressColor = (v: number) => v >= 75 ? 'bg-success' : v >= 50 ? 'bg-warning' : 'bg-destructive';

  const statusFilters = [
    { key: 'all', label: 'Todos' },
    { key: 'on_track', label: 'En tiempo' },
    { key: 'at_risk', label: 'En riesgo' },
    { key: 'delayed', label: 'Retrasados' },
  ];

  return (
    <div className="px-6 pb-6 pt-2 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Proyectos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona y monitorea tus proyectos activos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-input rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
        </div>
        <div className="flex border border-border rounded-md overflow-hidden">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors border-r border-border last:border-r-0 ${
                statusFilter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: 'easeOut' }}
          >
          <HoverCard openDelay={300} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Link
                to={`/projects/${project.id}`}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground leading-snug">{project.name}</h3>
                  <StatusBadge status={project.status} size="sm" />
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-muted-foreground">Avance</span>
                    <span className="text-xs font-semibold text-foreground">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div
                      className={`h-full rounded-full ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {project.budget}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.members}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.deadline}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{project.manager}</span>
                  <div className="flex items-center gap-1">
                    {project.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-secondary text-muted-foreground text-[10px] rounded font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" className="w-72 p-0">
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{project.name}</h4>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{project.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>Avance: <span className="font-medium text-foreground">{project.progress}%</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    <span>Presupuesto: <span className="font-medium text-foreground">{project.budget}%</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{project.members} miembros</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{project.deadline}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">PM: {project.manager}</span>
                  <span className="text-[11px] text-muted-foreground">Inicio: {project.startDate}</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Sin resultados</h3>
          <p className="text-xs text-muted-foreground mb-4">Ajusta tus filtros de búsqueda</p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-xs font-medium transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-foreground">Nuevo Proyecto</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-accent transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowCreateModal(false); toast.success('Proyecto creado exitosamente'); }}>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CRM Implementation"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Descripción</label>
                <textarea
                  rows={3}
                  placeholder="Objetivo y alcance del proyecto"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Inicio *</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Entrega *</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Responsable *</label>
                  <select required defaultValue="" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                    <option value="" disabled>Seleccionar...</option>
                    <option>María González</option>
                    <option>Carlos Ramírez</option>
                    <option>Ana Martínez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Presupuesto (USD)</label>
                  <input
                    type="number"
                    placeholder="150000"
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
