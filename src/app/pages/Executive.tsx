import { useState } from 'react';
import { motion } from 'motion/react';
import { KPICard } from '../components/KPICard';
import { TrendingUp, DollarSign, AlertTriangle, FolderKanban, Target, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useExecutive } from '../hooks/useProjectData';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

const periods = [
  { key: 'month', label: 'Este mes' },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'year', label: 'Anual' },
];

const execChartByPeriod: Record<string, { name: string; avance: number; presupuesto: number }[]> = {
  month: [
    { name: 'ERP', avance: 78, presupuesto: 85 },
    { name: 'Cloud', avance: 45, presupuesto: 92 },
    { name: 'Security', avance: 32, presupuesto: 98 },
    { name: 'DevOps', avance: 55, presupuesto: 80 },
  ],
  quarter: [
    { name: 'ERP', avance: 78, presupuesto: 85 },
    { name: 'Cloud', avance: 45, presupuesto: 92 },
    { name: 'Mobile', avance: 92, presupuesto: 78 },
    { name: 'Security', avance: 32, presupuesto: 98 },
    { name: 'Analytics', avance: 67, presupuesto: 72 },
    { name: 'API GW', avance: 88, presupuesto: 65 },
    { name: 'DevOps', avance: 55, presupuesto: 80 },
    { name: 'UX', avance: 40, presupuesto: 55 },
  ],
  year: [
    { name: 'Q1', avance: 42, presupuesto: 38 },
    { name: 'Q2', avance: 58, presupuesto: 55 },
    { name: 'Q3', avance: 72, presupuesto: 70 },
    { name: 'Q4', avance: 64, presupuesto: 79 },
  ],
};

export default function Executive() {
  const { kpis, criticalAlerts } = useExecutive();
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const navigate = useNavigate();

  const kpiIcons = [<FolderKanban className="w-5 h-5" />, <TrendingUp className="w-5 h-5" />, <AlertTriangle className="w-5 h-5" />, <DollarSign className="w-5 h-5" />];

  const handleQuickAction = (action: string) => {
    toast.info(`${action} — funcionalidad próximamente`);
  };

  const handleReviewAlert = (project: string) => {
    toast.info(`Revisando: ${project}`);
    navigate('/alerts');
  };

  return (
    <div className="px-6 pb-6 pt-2 max-w-[1400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground mb-1">Panel Ejecutivo</h1>
          <p className="text-sm text-muted-foreground">Vista estratégica del portafolio</p>
        </div>
        <div className="flex items-center gap-1 border border-border rounded-md overflow-hidden">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPeriod(p.key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedPeriod === p.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
          >
            <KPICard title={kpi.title} value={kpi.value} trend={kpi.trend} trendValue={kpi.trendValue} subtitle={kpi.subtitle} status={kpi.status} icon={kpiIcons[i]} />
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        className="bg-card border border-border rounded-lg p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">Avance vs Presupuesto</h2>
            <p className="text-xs text-muted-foreground">Por proyecto activo</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {periods.find(p => p.key === selectedPeriod)?.label}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={execChartByPeriod[selectedPeriod]}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-foreground)',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="avance" fill="var(--color-chart-1)" name="% Avance" radius={[3, 3, 0, 0]} />
            <Bar dataKey="presupuesto" fill="var(--color-chart-2)" name="% Presupuesto" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Critical Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
        className="bg-card border border-border rounded-lg p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Alertas Críticas</h2>
          <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-md text-xs font-medium">
            {criticalAlerts.length} activas
          </span>
        </div>

        <div className="space-y-2">
          {criticalAlerts.map((alert, index) => (
            <div key={index} className="border border-border rounded-md p-3 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground mb-0.5">{alert.project}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{alert.issue}</p>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded ${
                      alert.impact === 'Alto' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                    }`}>
                      Impacto: {alert.impact}
                    </span>
                    <span className="text-muted-foreground">{alert.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleReviewAlert(alert.project)}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-xs font-medium transition-colors"
                >
                  Revisar
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: <Target className="w-5 h-5 text-primary" />, title: 'Generar Reporte Ejecutivo', desc: 'Resumen completo del portafolio' },
          { icon: <TrendingUp className="w-5 h-5 text-info" />, title: 'Análisis de Tendencias', desc: 'Proyecciones a 3 meses' },
          { icon: <AlertTriangle className="w-5 h-5 text-success" />, title: 'Dashboard de Riesgos', desc: 'Vista consolidada de alertas' },
        ].map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
            onClick={() => handleQuickAction(action.title)}
            className="bg-card border border-border rounded-lg p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <div className="mb-2">{action.icon}</div>
            <h3 className="text-sm font-medium text-foreground mb-0.5">{action.title}</h3>
            <p className="text-xs text-muted-foreground">{action.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
