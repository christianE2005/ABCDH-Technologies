import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import {
  Plus, Search, Calendar, X, LayoutGrid, List, Loader2,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { CommandBar } from '../components/CommandBar';
import { useApiProjects } from '../hooks/useProjectData';
import { projectsService } from '../../services';

function getDaysRemaining(endDate: string | null) {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000);
}
function getDaysLabel(days: number | null) {
  if (days === null) return { label: '—', cls: 'text-muted-foreground' };
  if (days < 0) return { label: 'Vencido', cls: 'text-destructive font-semibold' };
  if (days === 0) return { label: 'Hoy', cls: 'text-destructive font-semibold' };
  if (days <= 7) return { label: `${days}d`, cls: 'text-warning font-semibold' };
  return { label: `${days}d`, cls: 'text-muted-foreground' };
}

export default function Projects() {
  const { data: projects, loading, refetch } = useApiProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creating, setCreating] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEnd, setFormEnd] = useState('');

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || (p.status ?? '').toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Unique status values for filter buttons
  const statusValues = useMemo(() => {
    if (!projects) return [];
    const set = new Set(projects.map((p) => (p.status ?? 'sin estado').toLowerCase()));
    return Array.from(set);
  }, [projects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await projectsService.create({ name: formName, description: formDesc || null, end_date: formEnd || null });
      toast.success('Proyecto creado exitosamente');
      setShowCreateModal(false);
      setFormName(''); setFormDesc(''); setFormEnd('');
      refetch();
    } catch {
      toast.error('Error al crear el proyecto');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-4 pb-6 pt-3 space-y-4 max-w-[1600px]">
      <CommandBar
        actions={[
          { label: 'Nuevo Proyecto', icon: <Plus className="w-3.5 h-3.5" />, variant: 'primary', onClick: () => setShowCreateModal(true) },
        ]}
        filters={[
          { label: 'Todos', value: 'all', active: statusFilter === 'all', onClick: () => setStatusFilter('all') },
          ...statusValues.map((s) => ({
            label: s.charAt(0).toUpperCase() + s.slice(1),
            value: s,
            active: statusFilter === s,
            onClick: () => setStatusFilter(s),
          })),
        ]}
        viewMode={viewMode}
        viewOptions={[
          { value: 'grid', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
          { value: 'list', icon: <List className="w-3.5 h-3.5" /> },
        ]}
        onViewChange={(v) => setViewMode(v as 'grid' | 'list')}
        rightSlot={
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar proyectos…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-7 bg-surface-secondary border border-border rounded-[3px] pl-7 pr-3 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20 w-44"
            />
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === 'list' ? (
        /* Table view */
        <div className="bg-card border border-border rounded-[4px] overflow-hidden">
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
                {filteredProjects.map((project, i) => {
                  const days = getDaysRemaining(project.end_date);
                  const dl = getDaysLabel(days);
                  return (
                    <motion.tr
                      key={project.id_project}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04, ease: 'easeOut' }}
                      className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors group"
                    >
                      <td className="py-1.5 px-4">
                        <p className="text-[12px] font-medium text-foreground truncate max-w-[220px]">{project.name}</p>
                        {project.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>
                        )}
                      </td>
                      <td className="py-1.5 px-3"><StatusBadge status={project.status ?? 'sin estado'} size="sm" /></td>
                      <td className="py-1.5 px-3 text-[11px] text-muted-foreground whitespace-nowrap">{project.end_date ?? '—'}</td>
                      <td className="py-1.5 px-3">
                        <span className={`text-[12px] ${dl.cls}`}>{dl.label}</span>
                      </td>
                      <td className="py-1.5 px-3 text-right">
                        <Link to={`/projects/${project.id_project}`} className="text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium hover:underline whitespace-nowrap">
                          Ver →
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredProjects.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">Sin proyectos que coincidan</p>
            </div>
          )}
        </div>
      ) : (
        /* Grid view */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, i) => {
            const days = getDaysRemaining(project.end_date);
            const dl = getDaysLabel(days);
            return (
              <motion.div
                key={project.id_project}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: 'easeOut' }}
              >
                <Link
                  to={`/projects/${project.id_project}`}
                  className="bg-card border border-border hover:border-primary/40 transition-colors block rounded-[4px] p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[13px] font-semibold text-foreground leading-snug">{project.name}</h3>
                    <StatusBadge status={project.status ?? 'sin estado'} size="sm" />
                  </div>

                  {project.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                    {project.end_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.end_date}
                      </span>
                    )}
                    <span className={`${dl.cls}`}>{dl.label}</span>
                  </div>

                  <div className="pt-2.5 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">Creado: {project.created_at?.slice(0, 10)}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State (grid view only) */}
      {!loading && viewMode === 'grid' && filteredProjects.length === 0 && (
        <div className="bg-card border border-border rounded-[4px] p-12 text-center">
          <div className="w-10 h-10 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>
          <h3 className="text-[13px] font-semibold text-foreground mb-1">Sin resultados</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Ajusta tus filtros de búsqueda</p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="h-7 px-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card border border-border rounded-[4px] p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-foreground">Nuevo Proyecto</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-0.5 rounded-[3px] hover:bg-surface-secondary transition-colors">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleCreate}>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: CRM Implementation"
                  className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Objetivo y alcance del proyecto"
                  className="w-full bg-surface-secondary border border-border rounded-[3px] px-2.5 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">Fecha de entrega</label>
                <input
                  type="date"
                  value={formEnd}
                  onChange={(e) => setFormEnd(e.target.value)}
                  className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 h-7 border border-border rounded-[3px] text-[11px] font-medium text-foreground hover:bg-surface-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 h-7 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creando…' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
