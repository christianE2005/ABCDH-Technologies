import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, Moon, Sun, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useApiProjectMembers, useApiProjects } from '../hooks/useProjectData';

export default function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const userId = Number(user?.id ?? 0);
  const { data: allMembers, loading: loadingMembers } = useApiProjectMembers();
  const { data: projects, loading: loadingProjects } = useApiProjects();

  const myMemberships = (allMembers ?? []).filter((m) => m.user === userId);
  const projectMap = new Map((projects ?? []).map((p) => [p.id_project, p.name]));

  const handleSave = () => {
    setEditing(false);
    toast.success('Perfil actualizado exitosamente');
  };

  return (
    <div className="px-4 pb-6 pt-3 max-w-[1600px]">
      <h1 className="text-[13px] font-semibold text-foreground mb-0.5">Mi Perfil</h1>
      <p className="text-[11px] text-muted-foreground mb-4">Información y preferencias</p>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">

          {/* Basic Info */}
          <div className="bg-card border border-border rounded-[4px] p-4">
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
              {editing && (
                <button
                  onClick={handleSave}
                  className="w-full h-7 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors"
                >
                  Guardar
                </button>
              )}
            </div>
          </div>

          {/* My project memberships */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card border border-border rounded-[4px] p-4"
          >
            <h2 className="text-[12px] font-semibold text-foreground mb-3">
              Mis Proyectos ({myMemberships.length})
            </h2>
            {(loadingMembers || loadingProjects) ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-8 animate-pulse bg-secondary rounded" />)}
              </div>
            ) : myMemberships.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No tienes proyectos asignados.</p>
            ) : (
              <div className="space-y-1">
                {myMemberships.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-2 px-3 border border-border rounded-[4px] hover:bg-accent/30 transition-colors"
                  >
                    <p className="text-[12px] font-medium text-foreground">
                      {projectMap.get(m.project) ?? `Proyecto #${m.project}`}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      desde {m.joined_at.slice(0, 10)}
                    </span>
                  </div>
                ))}
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
