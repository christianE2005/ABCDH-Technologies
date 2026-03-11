import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, Award, Trophy, Medal, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    setEditing(false);
    toast.success('Perfil actualizado exitosamente');
  };

  const achievements = [
    { title: 'Primer Proyecto Completado', icon: <Trophy className="w-4 h-4" />, level: 'gold', date: '15 Ene 2026' },
    { title: '10 Proyectos Gestionados', icon: <Medal className="w-4 h-4" />, level: 'silver', date: '22 Ene 2026' },
    { title: 'Sin Retrasos en el Mes', icon: <Award className="w-4 h-4" />, level: 'bronze', date: '01 Feb 2026' },
  ];

  const history = [
    { action: 'Completó Mobile App', date: '20 Feb 2026', type: 'success' },
    { action: 'Creó UX Redesign', date: '18 Feb 2026', type: 'info' },
    { action: 'Actualizó perfil', date: '15 Feb 2026', type: 'neutral' },
    { action: 'Generó reporte trimestral', date: '10 Feb 2026', type: 'info' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'gold': return 'bg-warning/10 text-warning';
      case 'silver': return 'bg-secondary text-muted-foreground';
      case 'bronze': return 'bg-primary/10 text-primary';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="px-6 pb-6 pt-2 max-w-[1400px]">
      <h1 className="text-xl font-semibold text-foreground mb-1">Mi Perfil</h1>
      <p className="text-sm text-muted-foreground mb-6">Información y preferencias</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Información Personal</h2>
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

            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-lg font-semibold">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{user?.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  <User className="w-3 h-3 inline mr-1" /> Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  <Mail className="w-3 h-3 inline mr-1" /> Correo
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  <Shield className="w-3 h-3 inline mr-1" /> Rol
                </label>
                <div className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-muted-foreground capitalize">
                  {user?.role.replace('_', ' ')}
                </div>
              </div>

              {editing && (
                <button
                  onClick={handleSave}
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground rounded-md py-2 text-sm font-medium transition-colors"
                >
                  Guardar
                </button>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Actividad Reciente</h2>
            <div className="space-y-2">
              {history.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-md">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    item.type === 'success' ? 'bg-success' :
                    item.type === 'info' ? 'bg-info' :
                    'bg-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{item.action}</p>
                    <p className="text-[10px] text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Theme */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Preferencias</h2>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-3 border border-border rounded-md hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Tema</p>
                  <p className="text-[10px] text-muted-foreground">{theme === 'dark' ? 'Oscuro' : 'Claro'}</p>
                </div>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          {/* Achievements */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Logros</h2>
            <div className="space-y-2">
              {achievements.map((a, index) => (
                <div key={index} className={`flex items-center gap-2.5 p-2.5 rounded-md ${getLevelColor(a.level)}`}>
                  {a.icon}
                  <div className="flex-1">
                    <p className="text-xs font-medium">{a.title}</p>
                    <p className="text-[10px] opacity-75">{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
