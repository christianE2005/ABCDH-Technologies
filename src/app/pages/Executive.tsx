import { motion } from 'motion/react';
import { KPICard } from '../components/KPICard';
import { TrendingUp, DollarSign, AlertTriangle, FolderKanban, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Executive() {
  const chartData = [
    { name: 'Proyecto Alpha', avance: 78, presupuesto: 85 },
    { name: 'Proyecto Beta', avance: 45, presupuesto: 92 },
    { name: 'Proyecto Gamma', avance: 92, presupuesto: 78 },
    { name: 'Proyecto Delta', avance: 32, presupuesto: 98 },
    { name: 'Proyecto Epsilon', avance: 67, presupuesto: 82 },
  ];

  const criticalAlerts = [
    {
      project: 'Proyecto Delta - Security Audit',
      issue: 'Retraso crítico - 2 semanas',
      impact: 'Alto',
      date: '25 Feb 2026'
    },
    {
      project: 'Proyecto Beta - Cloud Migration',
      issue: 'Exceso presupuestal inminente',
      impact: 'Medio',
      date: '24 Feb 2026'
    },
    {
      project: 'Proyecto Zeta - API Integration',
      issue: 'Falta de recursos críticos',
      impact: 'Alto',
      date: '23 Feb 2026'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel Ejecutivo</h1>
        <p className="text-muted-foreground">Vista estratégica simplificada para dirección</p>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Proyectos"
          value="8"
          subtitle="Activos en cartera"
          status="info"
          icon={<FolderKanban className="w-8 h-8" />}
        />
        <KPICard
          title="Avance Global"
          value="68.3%"
          trend="up"
          trendValue="+4.5%"
          subtitle="Promedio ponderado"
          status="success"
          icon={<TrendingUp className="w-8 h-8" />}
        />
        <KPICard
          title="Proyectos en Riesgo"
          value="2"
          trend="neutral"
          subtitle="25% del portafolio"
          status="danger"
          icon={<AlertTriangle className="w-8 h-8" />}
        />
        <KPICard
          title="Desviación Global"
          value="+$125K"
          trend="down"
          trendValue="5%"
          subtitle="Sobre $2.5M presupuestado"
          status="warning"
          icon={<DollarSign className="w-8 h-8" />}
        />
      </div>

      {/* Comparative Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-1">Comparativo Avance vs Presupuesto</h2>
          <p className="text-sm text-muted-foreground">Por proyecto activo</p>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#AAB3C0" angle={-15} textAnchor="end" height={80} />
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
            <Bar dataKey="avance" fill="#00C853" name="% Avance" />
            <Bar dataKey="presupuesto" fill="#FF2E2E" name="% Presupuesto Usado" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Critical Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Alertas Críticas</h2>
          <span className="px-3 py-1 bg-[#FF3D3D]/10 text-[#FF3D3D] rounded-full text-sm font-medium">
            {criticalAlerts.length} activas
          </span>
        </div>

        <div className="space-y-3">
          {criticalAlerts.map((alert, index) => (
            <div
              key={index}
              className="bg-secondary border border-border rounded-lg p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">{alert.project}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{alert.issue}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      alert.impact === 'Alto' ? 'bg-[#FF3D3D]/10 text-[#FF3D3D]' : 'bg-[#FFC107]/10 text-[#FFC107]'
                    }`}>
                      Impacto: {alert.impact}
                    </span>
                    <span className="text-muted-foreground">{alert.date}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary hover:bg-[#FF4C4C] text-white rounded-lg text-sm font-medium transition-colors">
                  Revisar
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-6 text-left transition-all hover:border-primary/50"
        >
          <Target className="w-10 h-10 text-primary mb-3" />
          <h3 className="font-bold text-foreground mb-1">Generar Reporte Ejecutivo</h3>
          <p className="text-sm text-muted-foreground">Resumen completo del portafolio</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-[#2196F3]/20 to-[#2196F3]/5 border border-[#2196F3]/30 rounded-xl p-6 text-left transition-all hover:border-[#2196F3]/50"
        >
          <TrendingUp className="w-10 h-10 text-[#2196F3] mb-3" />
          <h3 className="font-bold text-foreground mb-1">Análisis de Tendencias</h3>
          <p className="text-sm text-muted-foreground">Proyecciones a 3 meses</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-[#00C853]/20 to-[#00C853]/5 border border-[#00C853]/30 rounded-xl p-6 text-left transition-all hover:border-[#00C853]/50"
        >
          <AlertTriangle className="w-10 h-10 text-[#00C853] mb-3" />
          <h3 className="font-bold text-foreground mb-1">Dashboard de Riesgos</h3>
          <p className="text-sm text-muted-foreground">Vista consolidada de alertas</p>
        </motion.button>
      </div>
    </div>
  );
}
