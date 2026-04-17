import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, Moon, Sun, Lock, Github, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useApiProjects } from '../hooks/useProjectData';
import { GitHubConnectSection } from '../components/GitHubConnectSection';
import { StatusBadge } from '../components/StatusBadge';
import { usersService } from '../../services';

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

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const userId = Number(user?.id ?? 0);
  const { data: projects, loading: loadingProjects } = useApiProjects();
  const myProjects = projects ?? [];

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await usersService.update(userId, {
        username: formData.name,
        email: formData.email,
      });
      setEditing(false);
      toast.success('Perfil actualizado exitosamente');
    } catch {
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pb-6 pt-3 max-w-[1600px]">
      <h1 className="text-[13px] font-semibold text-foreground mb-0.5">Mi Perfil</h1>
      <p className="text-[11px] text-muted-foreground mb-4">Información y preferencias</p>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">

          {/* Basic Info */}
          <div className="bg-card border border-border border-l-[3px] border-l-primary rounded-[4px] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[12px] font-semibold text-foreground">Información Personal</h2>
              <button
                onClick={() => setEditing(!editing)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  editing
                    ? 'bg-secondary hover:bg-accent text-foreground'
                    : 'bg-primary hover:bg-primary-hover text-primary-foreground'
                }`}
              >
                {editing ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-base font-semibold">
                  {(user?.name ?? 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-foreground">{user?.name}</h3>
                <p className="text-[10px] text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  <User className="w-3 h-3 inline mr-1" /> Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                  className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  <Mail className="w-3 h-3 inline mr-1" /> Correo
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  <Shield className="w-3 h-3 inline mr-1" /> Rol
                </label>
                <div className="w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-muted-foreground capitalize flex items-center">
                  {user?.role.replace('_', ' ')}
                </div>
              </div>

              {/* GitHub connection */}
              <div>
                <label className="block text-[11px] font-medium text-foreground mb-1">
                  <Github className="w-3 h-3 inline mr-1" /> GitHub
                </label>
                <GitHubConnectSection />
              </div>

              {editing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-7 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              )}
            </div>
          </div>

          {/* My project memberships */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card border border-border rounded-[4px] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-[12px] font-semibold text-foreground">
                Mis Proyectos ({myProjects.length})
              </h2>
            </div>
            {loadingProjects ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-8 animate-pulse bg-secondary rounded" />)}
              </div>
            ) : myProjects.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[11px] text-muted-foreground">No tienes proyectos asignados.</p>
              </div>
            ) : (
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
                    {myProjects.map((project, i) => {
                      const days = getDaysRemaining(project.end_date);
                      const dl = getDaysLabel(days);
                      return (
                        <motion.tr
                          key={project.id_project}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.04, ease: 'easeOut' }}
                          className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors group cursor-pointer"
                          onClick={() => navigate(`/projects/${project.id_project}`)}
                        >
                          <td className="py-1.5 px-4">
                            <p className="text-[12px] font-medium text-foreground truncate max-w-[220px]">{project.name}</p>
                            {project.description && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>
                            )}
                          </td>
                          <td className="py-1.5 px-3">
                            <StatusBadge status={(project.status ?? 'neutral') as 'success'|'warning'|'danger'|'info'|'neutral'|'on_track'|'at_risk'|'delayed'} size="sm" />
                          </td>
                          <td className="py-1.5 px-3 text-[11px] text-muted-foreground whitespace-nowrap">{project.end_date ?? '—'}</td>
                          <td className="py-1.5 px-3">
                            <span className={`text-[12px] ${dl.cls}`}>{dl.label}</span>
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <span className="text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium whitespace-nowrap">
                              →
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-[4px] p-4">
            <h2 className="text-[12px] font-semibold text-foreground mb-2">Preferencias</h2>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-2.5 border border-border rounded-[4px] hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <div className="text-left">
                  <p className="text-[12px] font-medium text-foreground">Tema</p>
                  <p className="text-[10px] text-muted-foreground">{theme === 'dark' ? 'Oscuro' : 'Claro'}</p>
                </div>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          <div className="bg-card border border-border rounded-[4px] p-4">
            <h2 className="text-[12px] font-semibold text-foreground mb-2">Seguridad</h2>
            <div className="space-y-1">
              {[
                { title: 'Cambiar contraseña', desc: 'Actualizar credenciales' },
                { title: 'Sesiones activas', desc: 'Ver dispositivos conectados' },
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={() => toast.info(item.title)}
                  className="w-full text-left py-2 px-3 border border-border rounded-[4px] hover:border-primary/40 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    <div>
                      <p className="text-[12px] font-medium text-foreground">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
