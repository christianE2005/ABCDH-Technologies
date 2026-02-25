import { motion } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, Award, Trophy, Medal, Moon, Sun } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    // Mock save
    setEditing(false);
  };

  const achievements = [
    { title: 'Primer Proyecto Completado', icon: <Trophy className="w-6 h-6" />, level: 'gold', date: '15 Ene 2026' },
    { title: '10 Proyectos Gestionados', icon: <Medal className="w-6 h-6" />, level: 'silver', date: '22 Ene 2026' },
    { title: 'Sin Retrasos en el Mes', icon: <Award className="w-6 h-6" />, level: 'bronze', date: '01 Feb 2026' },
  ];

  const history = [
    { action: 'Completó Proyecto Alpha', date: '20 Feb 2026', type: 'success' },
    { action: 'Creó Proyecto Omega', date: '18 Feb 2026', type: 'info' },
    { action: 'Actualizó perfil', date: '15 Feb 2026', type: 'neutral' },
    { action: 'Generó reporte trimestral', date: '10 Feb 2026', type: 'info' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'gold':
        return 'bg-[#FFC107]/20 border-[#FFC107]/50 text-[#FFC107]';
      case 'silver':
        return 'bg-muted/20 border-muted/50 text-muted-foreground';
      case 'bronze':
        return 'bg-[#FF6F00]/20 border-[#FF6F00]/50 text-[#FF6F00]';
      default:
        return 'bg-muted/20 border-muted/50 text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información y preferencias</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Información Personal</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-primary hover:bg-[#FF4C4C] text-white rounded-lg text-sm font-medium transition-colors"
              >
                {editing ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{user?.name}</h3>
                <p className="text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-input-background border border-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="w-full bg-input-background border border-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Rol
                </label>
                <div className="w-full bg-input-background border border-input rounded-lg px-4 py-3 text-foreground capitalize opacity-60">
                  {user?.role.replace('_', ' ')}
                </div>
              </div>

              {editing && (
                <button
                  onClick={handleSave}
                  className="w-full bg-primary hover:bg-[#FF4C4C] text-white rounded-lg py-3 font-medium transition-colors"
                >
                  Guardar Cambios
                </button>
              )}
            </div>
          </motion.div>

          {/* Activity History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-6">Historial de Actividad</h2>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-secondary rounded-lg border border-border"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === 'success' ? 'bg-[#00C853]' :
                    item.type === 'info' ? 'bg-[#2196F3]' :
                    'bg-muted-foreground'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{item.action}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-lg font-bold text-foreground mb-4">Preferencias</h2>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 bg-secondary rounded-lg hover:border-primary/30 border border-border transition-all"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div className="text-left">
                  <p className="font-medium text-foreground">Tema</p>
                  <p className="text-sm text-muted-foreground">{theme === 'dark' ? 'Oscuro' : 'Claro'}</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${theme === 'dark' ? 'ml-6' : 'ml-0.5'}`}></div>
              </div>
            </button>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-lg font-bold text-foreground mb-4">Logros</h2>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getLevelColor(achievement.level)}`}
                >
                  {achievement.icon}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs opacity-75">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
