import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Target,
  ExternalLink,
  Brain,
  Calendar,
  Users
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { StatusBadge } from '../components/StatusBadge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useState } from 'react';

export default function Dashboard() {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Mock data
  const chartData = [
    { name: 'Ene', avance: 65, presupuesto: 58, planificado: 70 },
    { name: 'Feb', avance: 72, presupuesto: 68, planificado: 75 },
    { name: 'Mar', avance: 78, presupuesto: 75, planificado: 80 },
    { name: 'Abr', avance: 85, presupuesto: 82, planificado: 85 },
    { name: 'May', avance: 88, presupuesto: 87, planificado: 90 },
    { name: 'Jun', avance: 90, presupuesto: 91, planificado: 95 },
  ];

  const projects = [
    {
      id: 1,
      name: 'Proyecto Alpha - ERP Modernization',
      manager: 'María González',
      progress: 78,
      budget: 85,
      status: 'on_track' as const,
      members: 12,
      deadline: '15 Mar 2026'
    },
    {
      id: 2,
      name: 'Proyecto Beta - Cloud Migration',
      manager: 'Carlos Ramírez',
      progress: 45,
      budget: 92,
      status: 'at_risk' as const,
      members: 8,
      deadline: '28 Feb 2026'
    },
    {
      id: 3,
      name: 'Proyecto Gamma - Mobile App',
      manager: 'Ana Martínez',
      progress: 92,
      budget: 78,
      status: 'on_track' as const,
      members: 6,
      deadline: '10 Abr 2026'
    },
    {
      id: 4,
      name: 'Proyecto Delta - Security Audit',
      manager: 'Roberto Silva',
      progress: 32,
      budget: 98,
      status: 'delayed' as const,
      members: 5,
      deadline: '05 Mar 2026'
    },
  ];

  const aiInsights = [
    {
      type: 'warning',
      title: 'Riesgo Presupuestal Detectado',
      description: 'Proyecto Beta tiene 92% de probabilidad de exceder presupuesto en las próximas 2 semanas',
      action: 'Revisar asignación de recursos'
    },
    {
      type: 'danger',
      title: 'Alto Riesgo de Retraso',
      description: 'Proyecto Delta muestra 78% de probabilidad de retraso mayor a 2 semanas',
      action: 'Escalar a dirección'
    },
    {
      type: 'success',
      title: 'Oportunidad de Optimización',
      description: 'Proyecto Alpha puede completarse 5 días antes con la redistribución actual',
      action: 'Aplicar recomendación'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard General</h1>
        <p className="text-muted-foreground">Vista ejecutiva de todos los proyectos activos</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 pt-0">
        <KPICard
          title="Avance Promedio"
          value="76.5%"
          trend="up"
          trendValue="+8.2%"
          subtitle="vs mes anterior"
          status="success"
          icon={<TrendingUp className="w-8 h-8" />}
        />
        <KPICard
          title="Presupuesto Consumido"
          value="84.2%"
          trend="up"
          trendValue="+5.1%"
          subtitle="de $2.5M asignados"
          status="warning"
          icon={<DollarSign className="w-8 h-8" />}
        />
        <KPICard
          title="Proyectos en Riesgo"
          value="2"
          trend="down"
          trendValue="-1"
          subtitle="de 8 proyectos activos"
          status="danger"
          icon={<AlertTriangle className="w-8 h-8" />}
        />
        <KPICard
          title="Desviación Promedio"
          value="-3.2%"
          trend="neutral"
          trendValue="±1.5%"
          subtitle="respecto a plan original"
          status="info"
          icon={<Target className="w-8 h-8" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Evolución de Proyectos</h2>
                <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    chartType === 'line'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Línea
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    chartType === 'bar'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Barra
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#AAB3C0" />
                  <YAxis stroke="#AAB3C0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C2430',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avance" stroke="#00C853" strokeWidth={2} name="Avance Real" />
                  <Line type="monotone" dataKey="planificado" stroke="#2196F3" strokeWidth={2} name="Planificado" />
                  <Line type="monotone" dataKey="presupuesto" stroke="#FF2E2E" strokeWidth={2} name="Presupuesto" />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#AAB3C0" />
                  <YAxis stroke="#AAB3C0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C2430',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="avance" fill="#00C853" name="Avance Real" />
                  <Bar dataKey="planificado" fill="#2196F3" name="Planificado" />
                  <Bar dataKey="presupuesto" fill="#FF2E2E" name="Presupuesto" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </motion.div>

          {/* Projects Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6 mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Proyectos Activos</h2>
              <Link
                to="/projects"
                className="text-primary hover:text-[#FF4C4C] text-sm font-medium flex items-center gap-1 transition-colors"
              >
                Ver todos
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Proyecto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Responsable</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avance</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Presupuesto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-border hover:bg-accent transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{project.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {project.members}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {project.deadline}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{project.manager}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary rounded-full h-2 max-w-24">
                            <div
                              className={`h-full rounded-full ${
                                project.progress >= 75 ? 'bg-[#00C853]' : 
                                project.progress >= 50 ? 'bg-[#FFC107]' : 'bg-[#FF3D3D]'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-foreground">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm font-medium ${
                          project.budget >= 90 ? 'text-[#FF3D3D]' : 
                          project.budget >= 75 ? 'text-[#FFC107]' : 'text-[#00C853]'
                        }`}>
                          {project.budget}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={project.status} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          to={`/projects/${project.id}`}
                          className="text-primary hover:text-[#FF4C4C] text-sm font-medium transition-colors"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* AI Insights Panel */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-primary/10 to-info/10 border border-primary/30 rounded-xl p-6 sticky top-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Análisis Inteligente</h2>
                <p className="text-xs text-muted-foreground">Powered by IA</p>
              </div>
            </div>

            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      insight.type === 'danger' ? 'bg-[#FF3D3D]/20 text-[#FF3D3D]' :
                      insight.type === 'warning' ? 'bg-[#FFC107]/20 text-[#FFC107]' :
                      'bg-[#00C853]/20 text-[#00C853]'
                    }`}>
                      {insight.type === 'success' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground text-sm mb-1">{insight.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{insight.description}</p>
                      <button className="text-xs text-primary hover:text-[#FF4C4C] font-medium flex items-center gap-1 transition-colors">
                        {insight.action}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-[#00C853]">92%</p>
                  <p className="text-xs text-muted-foreground mt-1">Precisión IA</p>
                </div>
                <div className="bg-card/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-[#2196F3]">15</p>
                  <p className="text-xs text-muted-foreground mt-1">Alertas activas</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}