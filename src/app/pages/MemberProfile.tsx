import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  Calendar,
  Trophy,
  Medal,
  Award,
  Star,
  Lock,
  Briefcase,
  Target,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTeamData, useProjects, currentUserProfile } from '../hooks/useProjectData';
import type { MemberAchievement } from '../hooks/useProjectData';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';

const categoryColors: Record<string, string> = {
  Gestión: 'bg-primary/10 text-primary',
  Velocidad: 'bg-warning/10 text-warning',
  Calidad: 'bg-success/10 text-success',
  Colaboración: 'bg-info/10 text-info',
};

const levelConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  gold: { color: 'bg-warning/10 text-warning border-warning/20', icon: <Trophy className="w-4 h-4" /> },
  silver: { color: 'bg-secondary text-muted-foreground border-border', icon: <Medal className="w-4 h-4" /> },
  bronze: { color: 'bg-primary/10 text-primary border-primary/20', icon: <Award className="w-4 h-4" /> },
};

function AchievementCard({ achievement, animate, delay }: { achievement: MemberAchievement; animate?: boolean; delay?: number }) {
  const config = levelConfig[achievement.level] ?? levelConfig.bronze;
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay ?? 0 }}
      className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${config.color}`}
    >
      {config.icon}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{achievement.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] opacity-75">{achievement.date}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${categoryColors[achievement.category] ?? ''}`}>
            {achievement.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function StatBar({ label, myValue, theirValue, unit = '' }: { label: string; myValue: number; theirValue: number; unit?: string }) {
  const max = Math.max(myValue, theirValue, 1);
  const myPct = (myValue / max) * 100;
  const theirPct = (theirValue / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-primary">{myValue}{unit}</span>
        <span className="text-[11px]">{label}</span>
        <span className="font-medium text-info">{theirValue}{unit}</span>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 bg-secondary rounded-full overflow-hidden flex justify-end">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${myPct}%` }} />
        </div>
        <div className="flex-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-info rounded-full transition-all duration-500" style={{ width: `${theirPct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function MemberProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { getMemberProfile } = useTeamData();
  const { allProjects } = useProjects();
  const { user } = useAuth();

  const profile = getMemberProfile(memberId ?? '');

  if (!profile) {
    return (
      <div className="px-6 pb-6 pt-2 max-w-[1400px]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Miembro no encontrado</h1>
        </div>
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">El perfil solicitado no existe.</p>
          <Link to="/projects" className="text-xs text-primary hover:underline font-medium mt-3 inline-block">Volver a Proyectos</Link>
        </div>
      </div>
    );
  }

  const me = { ...currentUserProfile, name: user?.name ?? currentUserProfile.name, email: user?.email ?? currentUserProfile.email, avatarInitial: (user?.name ?? 'U').charAt(0).toUpperCase() };
  const isOwnProfile = memberId === 'me';
  const memberProjects = allProjects.filter(p => profile.currentProjects.includes(p.id));

  // Group achievements by category
  const achievementsByCategory = profile.achievements.reduce<Record<string, MemberAchievement[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="px-6 pb-6 pt-2 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{isOwnProfile ? 'Mi Perfil' : profile.name}</h1>
          <p className="text-sm text-muted-foreground">{isOwnProfile ? 'Tu información y logros' : 'Perfil del miembro'}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xl font-semibold">{profile.avatarInitial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-foreground">{profile.name}</h2>
                <p className="text-xs text-muted-foreground">{profile.role}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{profile.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(profile.stats.avgRating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
                ))}
                <span className="text-xs font-medium text-muted-foreground ml-1">{profile.stats.avgRating}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{profile.department}</p>
                  <p className="text-[10px] text-muted-foreground">Departamento</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{profile.joinDate}</p>
                  <p className="text-[10px] text-muted-foreground">Fecha de ingreso</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{profile.stats.projectsCompleted}</p>
                  <p className="text-[10px] text-muted-foreground">Proyectos completados</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-info" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{profile.stats.onTimeRate}%</p>
                  <p className="text-[10px] text-muted-foreground">On-time rate</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4">Métricas Individuales</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{profile.stats.tasksCompleted}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Tareas completadas</p>
                <div className="mt-2 bg-secondary rounded-full h-1.5">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((profile.stats.tasksCompleted / profile.stats.totalTasks) * 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">de {profile.stats.totalTasks} asignadas</p>
              </div>
              <div className="border border-border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-success">{profile.stats.onTimeRate}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">On-time rate</p>
                <div className="mt-2 bg-secondary rounded-full h-1.5">
                  <div className="h-full rounded-full bg-success" style={{ width: `${profile.stats.onTimeRate}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">entregas a tiempo</p>
              </div>
              <div className="border border-border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{profile.stats.projectsCompleted}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Proyectos exitosos</p>
                <div className="mt-2 bg-secondary rounded-full h-1.5">
                  <div className="h-full rounded-full bg-warning" style={{ width: `${Math.min(profile.stats.projectsCompleted * 10, 100)}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">completados</p>
              </div>
              <div className="border border-border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-warning">{profile.stats.avgRating}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Rating promedio</p>
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.round(profile.stats.avgRating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">de 5.0</p>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                Logros ({profile.achievements.length})
              </h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="w-3.5 h-3.5 text-warning" />
                <span>{profile.achievements.filter(a => a.level === 'gold').length} oro</span>
                <Medal className="w-3.5 h-3.5 text-muted-foreground ml-2" />
                <span>{profile.achievements.filter(a => a.level === 'silver').length} plata</span>
                <Award className="w-3.5 h-3.5 text-primary ml-2" />
                <span>{profile.achievements.filter(a => a.level === 'bronze').length} bronce</span>
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
                    {achs.map((a, i) => (
                      <AchievementCard key={i} achievement={a} animate delay={0.25 + i * 0.05} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Locked Achievements */}
            {profile.lockedAchievements.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <h3 className="text-xs font-medium text-muted-foreground">Próximos logros</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {profile.lockedAchievements.map((la, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-secondary/30 opacity-60"
                    >
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
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Comparison (only shown for other members) */}
          {!isOwnProfile && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h2 className="text-sm font-semibold text-foreground mb-1">Comparativa</h2>
              <p className="text-[11px] text-muted-foreground mb-4">Tu rendimiento vs {profile.name}</p>

              <div className="flex items-center justify-between mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-[10px] font-semibold">{me.avatarInitial}</span>
                  </div>
                  <span className="font-medium text-primary">Tú</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-info">{profile.name.split(' ')[0]}</span>
                  <div className="w-6 h-6 rounded-full bg-info/10 flex items-center justify-center">
                    <span className="text-info text-[10px] font-semibold">{profile.avatarInitial}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <StatBar label="Logros obtenidos" myValue={me.achievements.length} theirValue={profile.achievements.length} />
                <StatBar label="Tareas completadas" myValue={me.stats.tasksCompleted} theirValue={profile.stats.tasksCompleted} />
                <StatBar label="On-time rate" myValue={me.stats.onTimeRate} theirValue={profile.stats.onTimeRate} unit="%" />
                <StatBar label="Proyectos activos" myValue={me.currentProjects.length} theirValue={profile.currentProjects.length} />
                <StatBar label="Rating" myValue={me.stats.avgRating * 20} theirValue={profile.stats.avgRating * 20} />
              </div>

              <div className="mt-4 pt-3 border-t border-border text-center">
                <p className="text-[11px] text-muted-foreground">
                  {me.stats.onTimeRate > profile.stats.onTimeRate
                    ? '🏆 ¡Llevas ventaja en puntualidad! Sigue así.'
                    : me.stats.tasksCompleted > profile.stats.tasksCompleted
                      ? '🏆 ¡Más tareas completadas! Buen ritmo.'
                      : `💪 ${profile.name.split(' ')[0]} lleva ventaja — ¡alcánzalo!`}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Current Projects */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3">Proyectos Asignados</h2>
            <div className="space-y-2">
              {memberProjects.map(p => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center justify-between p-2.5 rounded-md border border-border hover:border-primary/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-secondary rounded-full h-1 max-w-20">
                        <div className={`h-full rounded-full ${p.progress >= 75 ? 'bg-success' : p.progress >= 50 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{p.progress}%</span>
                      <StatusBadge status={p.status} size="sm" />
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats Ring */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3">Productividad</h2>
            <div className="flex items-center justify-center gap-6 py-2">
              <div className="text-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--secondary)" strokeWidth="3" />
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray={`${Math.round((profile.stats.tasksCompleted / profile.stats.totalTasks) * 100)}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{Math.round((profile.stats.tasksCompleted / profile.stats.totalTasks) * 100)}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Completado</p>
              </div>
              <div className="text-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--secondary)" strokeWidth="3" />
                    <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeDasharray={`${profile.stats.onTimeRate}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{profile.stats.onTimeRate}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">A tiempo</p>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3">Actividad Reciente</h2>
            <div className="space-y-2">
              {profile.recentActivity.map((item, index) => (
                <div key={index} className="flex items-start gap-2.5 p-2.5 border border-border rounded-md">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    item.type === 'success' ? 'bg-success' : item.type === 'info' ? 'bg-info' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{item.action}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.date}</p>
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
