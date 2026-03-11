import { Link } from 'react-router';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Target,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Briefcase,
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useState } from 'react';
import { motion } from 'motion/react';
import { useDashboard, useProjects } from '../hooks/useProjectData';
import { useAuth } from '../context/AuthContext';

type Period = 'mensual' | 'semestral' | 'anual';

const chartDataByPeriod: Record<Period, { name: string; avance: number; planificado: number }[]> = {
  mensual: [
    { name: 'Sem 1', avance: 58, planificado: 60 },
    { name: 'Sem 2', avance: 62, planificado: 65 },
    { name: 'Sem 3', avance: 68, planificado: 70 },
    { name: 'Sem 4', avance: 72, planificado: 75 },
  ],
  semestral: [
    { name: 'Ene', avance: 65, planificado: 70 },
    { name: 'Feb', avance: 72, planificado: 75 },
    { name: 'Mar', avance: 78, planificado: 80 },
    { name: 'Abr', avance: 85, planificado: 85 },
    { name: 'May', avance: 88, planificado: 90 },
    { name: 'Jun', avance: 90, planificado: 95 },
  ],
  anual: [
    { name: 'Q1', avance: 45, planificado: 50 },
    { name: 'Q2', avance: 62, planificado: 65 },
    { name: 'Q3', avance: 78, planificado: 80 },
    { name: 'Q4', avance: 90, planificado: 95 },
  ],
};

export default function Dashboard() {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [period, setPeriod] = useState<Period>('semestral');
  const { kpis, aiInsights, topProjects } = useDashboard();
  const { allProjects } = useProjects();
  const { user } = useAuth();

  // Portfolio summary stats
  const onTrack = allProjects.filter(p => p.status === 'on_track').length;
  const atRisk = allProjects.filter(p => p.status === 'at_risk').length;
  const delayed = allProjects.filter(p => p.status === 'delayed').length;
  const totalMembers = allProjects.reduce((sum, p) => sum + p.members, 0);

  const kpiIcons = [<TrendingUp className="w-5 h-5" />, <DollarSign className="w-5 h-5" />, <AlertTriangle className="w-5 h-5" />, <Target className="w-5 h-5" />];

  const getProgressColor = (value: number) => {
    if (value >= 75) return 'bg-success';
    if (value >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  const getBudgetColor = (value: number) => {
    if (value >= 90) return 'text-destructive';
    if (value >= 75) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="px-6 pb-6 pt-2 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Vista general de proyectos activos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
          >
            <KPICard
              title={kpi.title}
              value={kpi.value}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              subtitle={kpi.subtitle}
              icon={kpiIcons[i]}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
          className="lg:col-span-2 bg-card border border-border rounded-lg p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Evolución de Proyectos</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {period === 'mensual' ? 'Último mes' : period === 'semestral' ? 'Últimos 6 meses' : 'Último año'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded-md overflow-hidden">
                {(['mensual', 'semestral', 'anual'] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors capitalize border-r border-border last:border-r-0 ${
                      period === p
                        ? 'bg-secondary text-foreground'
                        : 'bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setChartType('area')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    chartType === 'area'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Área
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${
                    chartType === 'bar'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Barra
                </button>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'area' ? (
              <AreaChart data={chartDataByPeriod[period]}>
                <defs>
                  <linearGradient id="avanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="planGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--foreground)',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="avance" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#avanceGrad)" name="Avance Real" />
                <Area type="monotone" dataKey="planificado" stroke="var(--color-chart-2)" strokeWidth={1.5} fill="url(#planGrad)" name="Planificado" strokeDasharray="4 4" />
              </AreaChart>
            ) : (
              <BarChart data={chartDataByPeriod[period]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--foreground)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="avance" fill="var(--color-chart-1)" name="Avance Real" radius={[3, 3, 0, 0]} />
                <Bar dataKey="planificado" fill="var(--color-chart-2)" name="Planificado" radius={[3, 3, 0, 0]} opacity={0.5} />
              </BarChart>
            )}
          </ResponsiveContainer>

          {/* Portfolio Summary Strip */}
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shadow-sm">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{allProjects.length}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">Proyectos activos</p>
                </div>
              </div>
              <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-primary/5" />
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-success/5 to-success/10 p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{onTrack} <span className="text-sm font-normal text-muted-foreground">/ {atRisk + delayed}</span></p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">En tiempo / Riesgo</p>
                </div>
              </div>
              <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-success/5" />
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-info/5 to-info/10 p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/15 flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">{totalMembers}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">{user?.role === 'executive' ? 'Personas en portafolio' : 'Miembros en equipo'}</p>
                </div>
              </div>
              <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-info/5" />
            </div>
            <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-warning/5 to-warning/10 p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center shadow-sm">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">28 Feb</p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">Próximo deadline</p>
                </div>
              </div>
              <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-warning/5" />
            </div>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          className="bg-card border border-border rounded-lg p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Análisis IA</h2>
          </div>

          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className="border border-border rounded-md p-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    insight.type === 'danger' ? 'bg-destructive' :
                    insight.type === 'warning' ? 'bg-warning' :
                    'bg-success'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-foreground">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                    <button className="text-xs text-primary hover:underline font-medium mt-2 inline-flex items-center gap-1">
                      {insight.action}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
            <div className="bg-background rounded-md p-3 text-center">
              <p className="text-lg font-semibold text-success">92%</p>
              <p className="text-[11px] text-muted-foreground">Precisión IA</p>
            </div>
            <div className="bg-background rounded-md p-3 text-center">
              <p className="text-lg font-semibold text-info">7</p>
              <p className="text-[11px] text-muted-foreground">Alertas activas</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Projects Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
        className="bg-card border border-border rounded-lg"
      >
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-sm font-semibold text-foreground">Proyectos Activos</h2>
          <Link
            to="/projects"
            className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Ver todos
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-5 text-xs font-medium text-muted-foreground">Proyecto</th>
                <th className="text-left py-2.5 px-5 text-xs font-medium text-muted-foreground">Responsable</th>
                <th className="text-left py-2.5 px-5 text-xs font-medium text-muted-foreground">Avance</th>
                <th className="text-left py-2.5 px-5 text-xs font-medium text-muted-foreground">Presupuesto</th>
                <th className="text-left py-2.5 px-5 text-xs font-medium text-muted-foreground">Estado</th>
                <th className="text-right py-2.5 px-5 text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {topProjects.map((project) => (
                <tr key={project.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="py-3 px-5">
                    <p className="text-sm font-medium text-foreground">{project.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.members}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.deadline}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-sm text-muted-foreground">{project.manager}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-1.5 max-w-20">
                        <div
                          className={`h-full rounded-full ${getProgressColor(project.progress)}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-8">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`text-xs font-medium ${getBudgetColor(project.budget)}`}>
                      {project.budget}%
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <StatusBadge status={project.status} size="sm" />
                  </td>
                  <td className="py-3 px-5 text-right">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}