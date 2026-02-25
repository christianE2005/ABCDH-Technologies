import { motion } from 'motion/react';
import { useParams, Link } from 'react-router';
import { 
  ArrowLeft,
  Edit,
  FileText,
  Settings,
  Brain,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Circle
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { KPICard } from '../components/KPICard';

export default function ProjectDetail() {
  const { id } = useParams();

  // Mock data para el proyecto
  const project = {
    id: 1,
    name: 'Proyecto Alpha - ERP Modernization',
    description: 'Migración completa del sistema ERP legacy a solución cloud moderna con módulos de finanzas, recursos humanos y cadena de suministro.',
    manager: 'María González',
    status: 'on_track' as const,
    progress: 78,
    budget: 85,
    budgetTotal: '$450,000',
    spent: '$382,500',
    startDate: '01 Ene 2026',
    deadline: '15 Mar 2026',
    members: 12,
    tags: ['Cloud', 'ERP', 'Alta prioridad']
  };

  const milestones = [
    { id: 1, name: 'Análisis y Diseño', status: 'completed', date: '15 Ene 2026', progress: 100 },
    { id: 2, name: 'Desarrollo Fase 1', status: 'completed', date: '10 Feb 2026', progress: 100 },
    { id: 3, name: 'Desarrollo Fase 2', status: 'in_progress', date: '01 Mar 2026', progress: 65 },
    { id: 4, name: 'Testing y QA', status: 'pending', date: '10 Mar 2026', progress: 0 },
    { id: 5, name: 'Deploy y Go-Live', status: 'pending', date: '15 Mar 2026', progress: 0 },
  ];

  const resources = [
    { name: 'María González', role: 'Project Manager', allocation: '100%' },
    { name: 'Carlos Tech', role: 'Tech Lead', allocation: '100%' },
    { name: 'Ana Dev', role: 'Senior Developer', allocation: '100%' },
    { name: 'Luis Backend', role: 'Backend Developer', allocation: '80%' },
    { name: 'Sofia Frontend', role: 'Frontend Developer', allocation: '80%' },
    { name: 'Pedro QA', role: 'QA Engineer', allocation: '60%' },
  ];

  const aiAnalysis = {
    riskLevel: 'low',
    delayProbability: 12,
    insights: [
      'El proyecto mantiene buen ritmo. Avance 8% superior al planificado.',
      'Fase actual de desarrollo completando hitos según cronograma.',
      'Presupuesto controlado dentro de márgenes aceptables (85%).'
    ],
    recommendations: [
      'Considerar adelantar testing en paralelo con desarrollo Fase 2',
      'Validar disponibilidad de recursos para la fase de QA',
      'Programar sesiones de capacitación para usuarios finales'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="w-10 h-10 bg-card hover:bg-sidebar-hover border border-card-border rounded-lg flex items-center justify-center transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-text-secondary">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-card hover:bg-sidebar-hover border border-card-border rounded-lg font-medium text-foreground transition-all flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button className="px-4 py-2 bg-card hover:bg-sidebar-hover border border-card-border rounded-lg font-medium text-foreground transition-all flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generar Reporte
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg font-medium text-white transition-all flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Simular Ajuste IA
          </button>
        </div>
      </div>

      {/* KPIs del Proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Avance del Proyecto"
          value={`${project.progress}%`}
          trend="up"
          trendValue="+8%"
          subtitle="vs plan original"
          status="success"
          icon={<TrendingUp className="w-7 h-7" />}
        />
        <KPICard
          title="Presupuesto Utilizado"
          value={project.spent}
          subtitle={`de ${project.budgetTotal} (${project.budget}%)`}
          status="warning"
          icon={<DollarSign className="w-7 h-7" />}
        />
        <KPICard
          title="Días Restantes"
          value="18"
          subtitle={`hasta ${project.deadline}`}
          status="info"
          icon={<Clock className="w-7 h-7" />}
        />
        <KPICard
          title="Equipo Asignado"
          value={project.members}
          subtitle="miembros activos"
          status="neutral"
          icon={<Users className="w-7 h-7" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline de Hitos */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-card-border rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-6">Timeline de Hitos</h2>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative">
                  {index !== milestones.length - 1 && (
                    <div className="absolute left-5 top-12 w-0.5 h-full bg-card-border"></div>
                  )}
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      milestone.status === 'completed' ? 'bg-success/20 text-success' :
                      milestone.status === 'in_progress' ? 'bg-warning/20 text-warning' :
                      'bg-background-secondary text-text-muted'
                    }`}>
                      {milestone.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : milestone.status === 'in_progress' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-foreground">{milestone.name}</h3>
                        <span className="text-sm text-text-secondary flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {milestone.date}
                        </span>
                      </div>
                      {milestone.status !== 'pending' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-text-secondary">Progreso</span>
                            <span className="text-xs font-bold text-foreground">{milestone.progress}%</span>
                          </div>
                          <div className="w-full bg-background-secondary rounded-full h-2">
                            <div
                              className={`h-full rounded-full ${
                                milestone.status === 'completed' ? 'bg-success' : 'bg-warning'
                              }`}
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recursos Asignados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-card-border rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-foreground mb-6">Recursos Asignados</h2>
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-background-secondary rounded-lg hover:bg-sidebar-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {resource.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{resource.name}</p>
                      <p className="text-sm text-text-secondary">{resource.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{resource.allocation}</p>
                    <p className="text-xs text-text-secondary">Asignación</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Panel IA */}
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
                <h2 className="text-lg font-bold text-foreground">Análisis IA</h2>
                <p className="text-xs text-text-secondary">Para este proyecto</p>
              </div>
            </div>

            {/* Risk Level */}
            <div className="bg-card/50 backdrop-blur-sm border border-card-border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Nivel de Riesgo</span>
                <span className={`text-lg font-bold ${
                  aiAnalysis.riskLevel === 'low' ? 'text-success' :
                  aiAnalysis.riskLevel === 'medium' ? 'text-warning' : 'text-danger'
                }`}>
                  {aiAnalysis.riskLevel === 'low' ? 'BAJO' :
                   aiAnalysis.riskLevel === 'medium' ? 'MEDIO' : 'ALTO'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background-secondary rounded-full h-2">
                  <div className="h-full rounded-full bg-success" style={{ width: '85%' }}></div>
                </div>
                <span className="text-xs text-success font-medium">85%</span>
              </div>
            </div>

            {/* Delay Probability */}
            <div className="bg-card/50 backdrop-blur-sm border border-card-border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Prob. Retraso</span>
                <span className="text-lg font-bold text-success">{aiAnalysis.delayProbability}%</span>
              </div>
              <p className="text-xs text-text-secondary">
                Muy baja probabilidad de retraso según tendencias actuales
              </p>
            </div>

            {/* Insights */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-foreground mb-3">Insights Principales</h3>
              <div className="space-y-2">
                {aiAnalysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex gap-2 text-xs text-text-secondary"
                  >
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Recomendaciones</h3>
              <div className="space-y-2">
                {aiAnalysis.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex gap-2 text-xs text-text-secondary bg-card/50 rounded-lg p-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all">
              Ver Análisis Completo
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
