import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const projects = [
    {
      id: 1,
      name: 'Proyecto Alpha - ERP Modernization',
      description: 'Migración completa del sistema ERP legacy a solución cloud moderna',
      manager: 'María González',
      progress: 78,
      budget: 85,
      budgetTotal: '$450,000',
      status: 'on_track' as const,
      members: 12,
      startDate: '01 Ene 2026',
      deadline: '15 Mar 2026',
      tags: ['Cloud', 'ERP', 'Alta prioridad']
    },
    {
      id: 2,
      name: 'Proyecto Beta - Cloud Migration',
      description: 'Migración de infraestructura on-premise a AWS',
      manager: 'Carlos Ramírez',
      progress: 45,
      budget: 92,
      budgetTotal: '$320,000',
      status: 'at_risk' as const,
      members: 8,
      startDate: '15 Ene 2026',
      deadline: '28 Feb 2026',
      tags: ['Cloud', 'AWS', 'Infraestructura']
    },
    {
      id: 3,
      name: 'Proyecto Gamma - Mobile App',
      description: 'Desarrollo de aplicación móvil para clientes B2C',
      manager: 'Ana Martínez',
      progress: 92,
      budget: 78,
      budgetTotal: '$180,000',
      status: 'on_track' as const,
      members: 6,
      startDate: '10 Dic 2025',
      deadline: '10 Abr 2026',
      tags: ['Mobile', 'React Native', 'B2C']
    },
    {
      id: 4,
      name: 'Proyecto Delta - Security Audit',
      description: 'Auditoría de seguridad y compliance ISO 27001',
      manager: 'Roberto Silva',
      progress: 32,
      budget: 98,
      budgetTotal: '$95,000',
      status: 'delayed' as const,
      members: 5,
      startDate: '20 Ene 2026',
      deadline: '05 Mar 2026',
      tags: ['Seguridad', 'Compliance', 'Urgente']
    },
    {
      id: 5,
      name: 'Proyecto Epsilon - Data Analytics Platform',
      description: 'Implementación de plataforma de análisis de datos',
      manager: 'Laura Torres',
      progress: 65,
      budget: 72,
      budgetTotal: '$280,000',
      status: 'on_track' as const,
      members: 10,
      startDate: '05 Ene 2026',
      deadline: '30 Abr 2026',
      tags: ['Data', 'Analytics', 'BI']
    },
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Proyectos</h1>
          <p className="text-text-secondary">Gestiona y monitorea todos tus proyectos activos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          Crear Proyecto
        </button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-card-border rounded-xl p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background-secondary border border-input-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:text-foreground'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('on_track')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filterStatus === 'on_track'
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:text-foreground'
              }`}
            >
              En tiempo
            </button>
            <button
              onClick={() => setFilterStatus('at_risk')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filterStatus === 'at_risk'
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:text-foreground'
              }`}
            >
              En riesgo
            </button>
            <button
              onClick={() => setFilterStatus('delayed')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filterStatus === 'delayed'
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:text-foreground'
              }`}
            >
              Retrasados
            </button>
          </div>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-card-border rounded-xl p-6 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Link 
                  to={`/projects/${project.id}`}
                  className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-2 block"
                >
                  {project.name}
                </Link>
                <p className="text-sm text-text-secondary line-clamp-2">{project.description}</p>
              </div>
              <StatusBadge status={project.status} size="sm" />
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">Avance del proyecto</span>
                <span className="text-sm font-bold text-foreground">{project.progress}%</span>
              </div>
              <div className="w-full bg-background-secondary rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    project.progress >= 75 ? 'bg-success' : 
                    project.progress >= 50 ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-background-secondary rounded-lg p-3">
                <div className="flex items-center gap-2 text-text-secondary mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Presupuesto</span>
                </div>
                <p className="font-bold text-foreground text-sm">{project.budget}%</p>
              </div>
              <div className="bg-background-secondary rounded-lg p-3">
                <div className="flex items-center gap-2 text-text-secondary mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Equipo</span>
                </div>
                <p className="font-bold text-foreground text-sm">{project.members}</p>
              </div>
            </div>

            {/* Meta info */}
            <div className="space-y-2 pt-4 border-t border-card-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Responsable</span>
                <span className="text-foreground font-medium">{project.manager}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Fecha límite</span>
                <span className="text-foreground font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {project.deadline}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap mt-2">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <Link
              to={`/projects/${project.id}`}
              className="mt-4 w-full block text-center px-4 py-2 bg-background-secondary hover:bg-primary hover:text-white text-text-secondary rounded-lg font-medium transition-all"
            >
              Ver Detalles
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-card-border rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No se encontraron proyectos</h3>
          <p className="text-text-secondary mb-6">
            Intenta ajustar tus filtros de búsqueda
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all"
          >
            Limpiar filtros
          </button>
        </motion.div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-card-border rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Crear Nuevo Proyecto</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Proyecto Omega - CRM Implementation"
                  className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe el objetivo y alcance del proyecto"
                  className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Fecha de Entrega *
                  </label>
                  <input
                    type="date"
                    className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Responsable *
                  </label>
                  <select className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                    <option>Seleccionar...</option>
                    <option>María González</option>
                    <option>Carlos Ramírez</option>
                    <option>Ana Martínez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Presupuesto (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="150000"
                    className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Estado Inicial
                </label>
                <select className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                  <option>Planificación</option>
                  <option>En Progreso</option>
                  <option>En Pausa</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-background-secondary hover:bg-sidebar-hover text-foreground rounded-lg font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
