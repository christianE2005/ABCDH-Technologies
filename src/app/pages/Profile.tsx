import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, Award, Trophy, Medal, Moon, Sun, Lock, Target, Briefcase, Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { currentUserProfile } from '../hooks/useProjectData';
import type { MemberAchievement } from '../hooks/useProjectData';

const categoryColors: Record<string, string> = {
  Gestión: 'bg-primary/10 text-primary',
  Velocidad: 'bg-warning/10 text-warning',
  Calidad: 'bg-success/10 text-success',
  Colaboración: 'bg-info/10 text-info',
};

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

  const myProfile = {
    ...currentUserProfile,
    name: user?.name ?? currentUserProfile.name,
    email: user?.email ?? currentUserProfile.email,
    avatarInitial: (user?.name ?? 'U').charAt(0).toUpperCase(),
  };

  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'gold': return { color: 'bg-warning/10 text-warning border-warning/20', icon: <Trophy className="w-4 h-4" /> };
      case 'silver': return { color: 'bg-secondary text-muted-foreground border-border', icon: <Medal className="w-4 h-4" /> };
      case 'bronze': return { color: 'bg-primary/10 text-primary border-primary/20', icon: <Award className="w-4 h-4" /> };
      default: return { color: 'bg-secondary text-muted-foreground border-border', icon: <Award className="w-4 h-4" /> };
    }
  };

  // Group achievements by category
  const achievementsByCategory = myProfile.achievements.reduce<Record<string, MemberAchievement[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="px-6 pb-6 pt-2 max-w-[1400px]">
      <h1 className="text-xl font-semibold text-foreground mb-1">Mi Perfil</h1>
      <p className="text-sm text-muted-foreground mb-6">Información, logros y preferencias</p>

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
                  {myProfile.avatarInitial}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">{user?.name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(myProfile.stats.avgRating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
                ))}
                <span className="text-xs font-medium text-muted-foreground ml-1">{myProfile.stats.avgRating}</span>
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

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4">Mis Métricas</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="border border-border rounded-lg p-3 text-center">
                <Target className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{myProfile.stats.tasksCompleted}</p>
                <p className="text-[10px] text-muted-foreground">de {myProfile.stats.totalTasks} tareas</p>
              </div>
              <div className="border border-border rounded-lg p-3 text-center">
                <Briefcase className="w-4 h-4 text-success mx-auto mb-1" />
                <p className="text-xl font-bold text-success">{myProfile.stats.onTimeRate}%</p>
                <p className="text-[10px] text-muted-foreground">On-time rate</p>
              </div>
              <div className="border border-border rounded-lg p-3 text-center">
                <Trophy className="w-4 h-4 text-warning mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{myProfile.stats.projectsCompleted}</p>
                <p className="text-[10px] text-muted-foreground">Proyectos exitosos</p>
              </div>
              <div className="border border-border rounded-lg p-3 text-center">
                <Star className="w-4 h-4 text-warning mx-auto mb-1" />
                <p className="text-xl font-bold text-warning">{myProfile.stats.avgRating}</p>
                <p className="text-[10px] text-muted-foreground">Rating promedio</p>
              </div>
            </div>
          </motion.div>

          {/* Achievements expanded */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Logros ({myProfile.achievements.length})</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="w-3.5 h-3.5 text-warning" />
                <span>{myProfile.achievements.filter(a => a.level === 'gold').length}</span>
                <Medal className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
                <span>{myProfile.achievements.filter(a => a.level === 'silver').length}</span>
                <Award className="w-3.5 h-3.5 text-primary ml-1.5" />
                <span>{myProfile.achievements.filter(a => a.level === 'bronze').length}</span>
              </div>
            </div>

            {/* By category */}
            <div className="space-y-4">
              {Object.entries(achievementsByCategory).map(([category, achs]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[category] ?? ''}`}>{category}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {achs.map((a, i) => {
                      const config = getLevelConfig(a.level);
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.25 + i * 0.05 }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${config.color}`}
                        >
                          {config.icon}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{a.title}</p>
                            <p className="text-[10px] opacity-75">{a.date}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Locked Achievements */}
            {myProfile.lockedAchievements.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <h3 className="text-xs font-medium text-muted-foreground">Próximos logros</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {myProfile.lockedAchievements.map((la, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-secondary/30 opacity-60">
                      <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground truncate">{la.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-secondary rounded-full h-1.5">
                            <div className="h-full rounded-full bg-primary/50" style={{ width: `${la.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{la.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Actividad Reciente</h2>
            <div className="space-y-2">
              {myProfile.recentActivity.map((item, index) => (
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

          {/* Productivity rings */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Productividad</h2>
            <div className="flex items-center justify-center gap-6 py-2">
              <div className="text-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--secondary)" strokeWidth="3" />
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray={`${Math.round((myProfile.stats.tasksCompleted / myProfile.stats.totalTasks) * 100)}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{Math.round((myProfile.stats.tasksCompleted / myProfile.stats.totalTasks) * 100)}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Completado</p>
              </div>
              <div className="text-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--secondary)" strokeWidth="3" />
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeDasharray={`${myProfile.stats.onTimeRate}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{myProfile.stats.onTimeRate}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">A tiempo</p>
              </div>
            </div>
          </div>

          {/* My profile link */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Perfil Público</h2>
            <Link
              to="/profile/me"
              className="w-full flex items-center justify-center gap-2 p-2.5 border border-primary/30 rounded-md text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Ver mi perfil público
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
