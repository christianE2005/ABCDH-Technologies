import { useParams, Link, useNavigate } from 'react-router';
import { 
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Circle,
  Sparkles
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { KPICard } from '../components/KPICard';
import { useProjects } from '../hooks/useProjectData';
import { motion } from 'motion/react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById } = useProjects();
  const hookProject = getProjectById(Number(id) || 1);

  const project = {
    id: hookProject?.id ?? 1,
    name: hookProject?.name ?? 'ERP Modernization',
    description: hookProject?.description ?? 'Migración completa del sistema ERP legacy a solución cloud moderna con módulos de finanzas, recursos humanos y cadena de suministro.',
    manager: hookProject?.manager ?? 'María González',
    status: hookProject?.status ?? ('on_track' as const),
    progress: hookProject?.progress ?? 78,
    budget: hookProject?.budget ?? 85,
    budgetTotal: hookProject?.totalBudget ?? '$450,000',
    spent: `$${Math.round(((hookProject?.budget ?? 85) / 100) * parseInt((hookProject?.totalBudget ?? '$450,000').replace(/[$,]/g, ''))).toLocaleString()}`,
    startDate: hookProject?.startDate ?? '01 Sep 2025',
    deadline: hookProject?.deadline ?? '15 Mar 2026',
    members: hookProject?.members ?? 12,
    tags: hookProject?.tags ?? ['Cloud', 'ERP'],
  };

  const projectDataMap: Record<number, {
    milestones: { id: number; name: string; status: string; date: string; progress: number }[];
    resources: { name: string; role: string; allocation: string }[];
    aiAnalysis: { riskLevel: string; delayProbability: number; insights: string[]; recommendations: string[] };
  }> = {
    1: {
      milestones: [
        { id: 1, name: 'Análisis y Diseño', status: 'completed', date: '15 Ene 2026', progress: 100 },
        { id: 2, name: 'Desarrollo Fase 1', status: 'completed', date: '10 Feb 2026', progress: 100 },
        { id: 3, name: 'Desarrollo Fase 2', status: 'in_progress', date: '01 Mar 2026', progress: 65 },
        { id: 4, name: 'Testing y QA', status: 'pending', date: '10 Mar 2026', progress: 0 },
        { id: 5, name: 'Deploy y Go-Live', status: 'pending', date: '15 Mar 2026', progress: 0 },
      ],
      resources: [
        { name: 'María González', role: 'Project Manager', allocation: '100%' },
        { name: 'Carlos Ruiz', role: 'Tech Lead', allocation: '100%' },
        { name: 'Ana López', role: 'Senior Developer', allocation: '100%' },
        { name: 'Luis Bermúdez', role: 'Backend Developer', allocation: '80%' },
        { name: 'Sofía Fernández', role: 'Frontend Developer', allocation: '80%' },
        { name: 'Pedro Quiroga', role: 'QA Engineer', allocation: '60%' },
      ],
      aiAnalysis: {
        riskLevel: 'low', delayProbability: 12,
        insights: ['Avance 8% superior al planificado.', 'Hitos completándose según cronograma.', 'Presupuesto controlado (85%).'],
        recommendations: ['Adelantar testing en paralelo con Fase 2', 'Validar disponibilidad de recursos para QA', 'Programar capacitación de usuarios finales'],
      },
    },
    2: {
      milestones: [
        { id: 1, name: 'Evaluación de infraestructura', status: 'completed', date: '15 Nov 2025', progress: 100 },
        { id: 2, name: 'Diseño de arquitectura cloud', status: 'completed', date: '20 Dic 2025', progress: 100 },
        { id: 3, name: 'Migración de BD principal', status: 'in_progress', date: '15 Feb 2026', progress: 60 },
        { id: 4, name: 'Migración de servicios', status: 'in_progress', date: '20 Feb 2026', progress: 25 },
        { id: 5, name: 'Testing y cutover', status: 'pending', date: '28 Feb 2026', progress: 0 },
      ],
      resources: [
        { name: 'Carlos Ramírez', role: 'Project Manager', allocation: '100%' },
        { name: 'Sandra López', role: 'Cloud Architect', allocation: '100%' },
        { name: 'Miguel Torres', role: 'DevOps Engineer', allocation: '100%' },
        { name: 'Diana Gómez', role: 'DBA Senior', allocation: '80%' },
      ],
      aiAnalysis: {
        riskLevel: 'high', delayProbability: 72,
        insights: ['Presupuesto al 92% con solo 45% de avance.', 'Deadline 28 Feb ya vencido — riesgo de SLA.', 'Migración de BD bloqueada por dependencias legacy.'],
        recommendations: ['Solicitar extensión presupuestal inmediata', 'Escalar problema de dependencias a arquitectura', 'Considerar migración parcial como contingencia'],
      },
    },
    3: {
      milestones: [
        { id: 1, name: 'Diseño UX/UI móvil', status: 'completed', date: '15 Dic 2025', progress: 100 },
        { id: 2, name: 'Desarrollo core features', status: 'completed', date: '01 Feb 2026', progress: 100 },
        { id: 3, name: 'Integración APIs backend', status: 'completed', date: '20 Feb 2026', progress: 100 },
        { id: 4, name: 'Testing y beta cerrada', status: 'in_progress', date: '15 Mar 2026', progress: 75 },
        { id: 5, name: 'Publicación App Store/Play', status: 'pending', date: '10 Abr 2026', progress: 0 },
      ],
      resources: [
        { name: 'Ana Martínez', role: 'Project Manager', allocation: '100%' },
        { name: 'Javier Mora', role: 'React Native Lead', allocation: '100%' },
        { name: 'Camila Ríos', role: 'UX Designer', allocation: '80%' },
        { name: 'Tomás Vargas', role: 'Mobile Developer', allocation: '100%' },
      ],
      aiAnalysis: {
        riskLevel: 'low', delayProbability: 8,
        insights: ['Avance del 92% — proyecto casi completo.', 'Beta con 94% de satisfacción en pruebas internas.', 'Presupuesto al 78%, margen saludable para lanzamiento.'],
        recommendations: ['Iniciar preparación de assets para stores', 'Planificar campaña de lanzamiento interno', 'Documentar APIs consumidas para mantenimiento'],
      },
    },
    4: {
      milestones: [
        { id: 1, name: 'Análisis de vulnerabilidades', status: 'completed', date: '01 Dic 2025', progress: 100 },
        { id: 2, name: 'Pentesting infraestructura', status: 'in_progress', date: '15 Feb 2026', progress: 45 },
        { id: 3, name: 'Auditoría de código fuente', status: 'in_progress', date: '25 Feb 2026', progress: 20 },
        { id: 4, name: 'Remediación de hallazgos', status: 'pending', date: '01 Mar 2026', progress: 0 },
        { id: 5, name: 'Certificación SOC 2', status: 'pending', date: '05 Mar 2026', progress: 0 },
      ],
      resources: [
        { name: 'Roberto Silva', role: 'Project Manager', allocation: '100%' },
        { name: 'Elena Vargas', role: 'Security Lead', allocation: '100%' },
        { name: 'Andrés Muñoz', role: 'Pentester Senior', allocation: '80%' },
        { name: 'Patricia León', role: 'Compliance Analyst', allocation: '60%' },
      ],
      aiAnalysis: {
        riskLevel: 'high', delayProbability: 78,
        insights: ['Solo 32% de avance con deadline ya vencido (05 Mar).', 'Presupuesto al 98% — prácticamente agotado.', '15 vulnerabilidades críticas sin remediar.'],
        recommendations: ['Escalar a dirección para extensión de presupuesto', 'Priorizar remediación de vulnerabilidades P1', 'Solicitar recursos adicionales de seguridad'],
      },
    },
    5: {
      milestones: [
        { id: 1, name: 'Diseño del data warehouse', status: 'completed', date: '01 Nov 2025', progress: 100 },
        { id: 2, name: 'ETL pipelines principales', status: 'completed', date: '15 Ene 2026', progress: 100 },
        { id: 3, name: 'Modelos ML de predicción', status: 'in_progress', date: '15 Mar 2026', progress: 55 },
        { id: 4, name: 'Dashboards de BI', status: 'in_progress', date: '15 Abr 2026', progress: 30 },
        { id: 5, name: 'Capacitación y rollout', status: 'pending', date: '20 May 2026', progress: 0 },
      ],
      resources: [
        { name: 'Laura Torres', role: 'Project Manager', allocation: '100%' },
        { name: 'Ricardo Peña', role: 'Data Engineer Lead', allocation: '100%' },
        { name: 'Natalia Cruz', role: 'Data Scientist', allocation: '100%' },
        { name: 'Fernando Díaz', role: 'ML Engineer', allocation: '80%' },
        { name: 'Valentina Soto', role: 'BI Analyst', allocation: '60%' },
      ],
      aiAnalysis: {
        riskLevel: 'medium', delayProbability: 28,
        insights: ['Avance del 67% con plazo holgado (May 2026).', 'Modelos de ML alcanzan 89% de precisión en staging.', 'Presupuesto al 72% — margen disponible.'],
        recommendations: ['Incorporar feedback de stakeholders en dashboards', 'Iniciar documentación de modelos para producción', 'Agendar sesiones de capacitación con usuarios clave'],
      },
    },
    6: {
      milestones: [
        { id: 1, name: 'Diseño de API Gateway', status: 'completed', date: '15 Dic 2025', progress: 100 },
        { id: 2, name: 'Implementación core routing', status: 'completed', date: '15 Ene 2026', progress: 100 },
        { id: 3, name: 'Rate limiting y auth', status: 'completed', date: '10 Feb 2026', progress: 100 },
        { id: 4, name: 'Integración con microservicios', status: 'in_progress', date: '25 Feb 2026', progress: 70 },
        { id: 5, name: 'Monitoreo y go-live', status: 'pending', date: '01 Mar 2026', progress: 0 },
      ],
      resources: [
        { name: 'Diego Mendoza', role: 'Project Manager', allocation: '100%' },
        { name: 'Alejandro Ríos', role: 'Backend Lead', allocation: '100%' },
        { name: 'Isabela Correa', role: 'Platform Engineer', allocation: '80%' },
      ],
      aiAnalysis: {
        riskLevel: 'low', delayProbability: 10,
        insights: ['88% de avance — en excelente ritmo.', 'Solo 65% de presupuesto consumido — ahorro proyectado.', '12 de 14 microservicios ya integrados.'],
        recommendations: ['Preparar runbooks para operación post go-live', 'Configurar alertas de monitoreo APM', 'Documentar contratos de API para equipos consumidores'],
      },
    },
    7: {
      milestones: [
        { id: 1, name: 'Evaluación de herramientas', status: 'completed', date: '01 Dic 2025', progress: 100 },
        { id: 2, name: 'Setup Jenkins + Docker', status: 'completed', date: '20 Ene 2026', progress: 100 },
        { id: 3, name: 'Pipeline CI/CD base', status: 'in_progress', date: '01 Mar 2026', progress: 50 },
        { id: 4, name: 'Orquestación Kubernetes', status: 'in_progress', date: '01 Abr 2026', progress: 15 },
        { id: 5, name: 'Rollout a equipos', status: 'pending', date: '15 Abr 2026', progress: 0 },
      ],
      resources: [
        { name: 'Sandra López', role: 'Project Manager', allocation: '100%' },
        { name: 'Hugo Castillo', role: 'DevOps Lead', allocation: '100%' },
        { name: 'Daniela Vega', role: 'SRE Engineer', allocation: '80%' },
        { name: 'Marcos Ruiz', role: 'DevOps Engineer', allocation: '80%' },
      ],
      aiAnalysis: {
        riskLevel: 'medium', delayProbability: 42,
        insights: ['55% de avance con presupuesto al 80%.', 'Pipeline CI básico funcional, falta K8s.', 'Dependencia de licencias Jenkins Enterprise sin resolver.'],
        recommendations: ['Acelerar definición de manifests Kubernetes', 'Resolver bloqueo de licenciamiento Jenkins', 'Paralelizar configuración de ambientes staging/prod'],
      },
    },
    8: {
      milestones: [
        { id: 1, name: 'Research y benchmarking', status: 'completed', date: '15 Ene 2026', progress: 100 },
        { id: 2, name: 'Wireframes y prototipos', status: 'in_progress', date: '15 Feb 2026', progress: 70 },
        { id: 3, name: 'Design system v2', status: 'in_progress', date: '15 Mar 2026', progress: 30 },
        { id: 4, name: 'Testing de usabilidad', status: 'pending', date: '15 May 2026', progress: 0 },
        { id: 5, name: 'Implementación frontend', status: 'pending', date: '30 Jun 2026', progress: 0 },
      ],
      resources: [
        { name: 'Paula Herrera', role: 'Project Manager', allocation: '100%' },
        { name: 'Gabriel Ortiz', role: 'UX Lead', allocation: '100%' },
        { name: 'Lucía Paredes', role: 'UI Designer', allocation: '80%' },
        { name: 'Martín Acosta', role: 'UX Researcher', allocation: '60%' },
      ],
      aiAnalysis: {
        riskLevel: 'low', delayProbability: 15,
        insights: ['40% de avance coherente con timeline largo (Jun 2026).', 'Presupuesto al 55% — buen control de costos.', 'Prototipos con 87% de aprobación en user testing.'],
        recommendations: ['Alinear design system con equipo de Mobile App', 'Planificar handoff a desarrollo con componentes Storybook', 'Incorporar métricas de accesibilidad WCAG 2.1'],
      },
    },
  };

  const projectId = project.id;
  const data = projectDataMap[projectId] ?? projectDataMap[1];
  const milestones = data.milestones;
  const resources = data.resources;
  const aiAnalysis = data.aiAnalysis;

  // Calculate days remaining dynamically
  const deadlineParts = project.deadline.split(' ');
  const monthMap: Record<string, number> = { Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5, Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11 };
  const deadlineDate = new Date(parseInt(deadlineParts[2]), monthMap[deadlineParts[1]] ?? 0, parseInt(deadlineParts[0]));
  const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  // Dynamic trend based on progress vs budget ratio
  const trendDirection = project.progress > project.budget ? 'up' as const : project.progress < project.budget - 20 ? 'down' as const : 'neutral' as const;
  const trendDiff = project.progress - project.budget;
  const trendLabel = trendDiff >= 0 ? `+${trendDiff}%` : `${trendDiff}%`;

  // Risk display helpers
  const riskDisplayMap: Record<string, { label: string; color: string; barColor: string; healthPct: number }> = {
    low: { label: 'BAJO', color: 'text-success', barColor: 'bg-success', healthPct: 85 },
    medium: { label: 'MEDIO', color: 'text-warning', barColor: 'bg-warning', healthPct: 55 },
    high: { label: 'ALTO', color: 'text-destructive', barColor: 'bg-destructive', healthPct: 25 },
  };
  const riskDisplay = riskDisplayMap[aiAnalysis.riskLevel] ?? riskDisplayMap.low;

  const delayColor = aiAnalysis.delayProbability <= 25 ? 'text-success' : aiAnalysis.delayProbability <= 50 ? 'text-warning' : 'text-destructive';
  const delayLabel = aiAnalysis.delayProbability <= 25 ? 'Baja probabilidad según tendencias actuales' : aiAnalysis.delayProbability <= 50 ? 'Probabilidad moderada — monitorear de cerca' : 'Alta probabilidad — acción inmediata requerida';

  return (
    <div className="px-6 pb-6 pt-2 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          to="/projects"
          className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center hover:bg-accent transition-colors mt-0.5"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
            <StatusBadge status={project.status} size="sm" />
          </div>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          <KPICard
            key="avance"
            title="Avance"
            value={`${project.progress}%`}
            trend={trendDirection}
            trendValue={trendLabel}
            subtitle="vs plan original"
            icon={<TrendingUp className="w-5 h-5" />}
          />,
          <KPICard
            key="presupuesto"
            title="Presupuesto"
            value={project.spent}
            subtitle={`de ${project.budgetTotal} (${project.budget}%)`}
            icon={<DollarSign className="w-5 h-5" />}
          />,
          <KPICard
            key="dias"
            title="Días Restantes"
            value={daysRemaining}
            subtitle={`hasta ${project.deadline}`}
            icon={<Clock className="w-5 h-5" />}
          />,
          <KPICard
            key="equipo"
            title="Equipo"
            value={project.members}
            subtitle="miembros activos"
            icon={<Users className="w-5 h-5" />}
          />,
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
          >
            {card}
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4">Hitos del Proyecto</h2>
            <div className="space-y-0">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 + index * 0.06, ease: 'easeOut' }}
                  className="relative flex gap-3"
                >
                  {/* Vertical line */}
                  {index !== milestones.length - 1 && (
                    <div className="absolute left-[11px] top-7 w-px h-[calc(100%-7px)] bg-border" />
                  )}
                  {/* Icon */}
                  <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    milestone.status === 'completed' ? 'bg-success/15 text-success' :
                    milestone.status === 'in_progress' ? 'bg-warning/15 text-warning' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {milestone.status === 'completed' ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : milestone.status === 'in_progress' ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : (
                      <Circle className="w-3 h-3" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">{milestone.name}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {milestone.date}
                      </span>
                    </div>
                    {milestone.status !== 'pending' && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-1.5 max-w-40">
                          <div
                            className={`h-full rounded-full ${
                              milestone.status === 'completed' ? 'bg-success' : 'bg-warning'
                            }`}
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{milestone.progress}%</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45, ease: 'easeOut' }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Equipo</h2>
              <button
                onClick={() => navigate(`/backlog?project=${project.id}`)}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Ver tareas del proyecto →
              </button>
            </div>
            <div className="space-y-1.5">
              {resources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05, ease: 'easeOut' }}
                  onClick={() => navigate(`/backlog?project=${project.id}`)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group/member"
                  title={`Ver tareas de ${resource.name} en Backlog`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {resource.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover/member:text-primary transition-colors">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">{resource.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{resource.allocation}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
          className="bg-card border border-border rounded-lg p-5 h-fit"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Análisis IA</h2>
          </div>

          {/* Risk */}
          <div className="border border-border rounded-md p-3 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Nivel de Riesgo</span>
              <span className={`text-xs font-semibold uppercase ${riskDisplay.color}`}>{riskDisplay.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary rounded-full h-1.5">
                <div className={`h-full rounded-full ${riskDisplay.barColor}`} style={{ width: `${riskDisplay.healthPct}%` }} />
              </div>
              <span className={`text-[11px] font-medium ${riskDisplay.color}`}>{riskDisplay.healthPct}%</span>
            </div>
          </div>

          {/* Delay */}
          <div className="border border-border rounded-md p-3 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Prob. Retraso</span>
              <span className={`text-xs font-semibold ${delayColor}`}>{aiAnalysis.delayProbability}%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">{delayLabel}</p>
          </div>

          {/* Insights */}
          <div className="mb-4">
            <h3 className="text-xs font-medium text-foreground mb-2">Insights</h3>
            <div className="space-y-1.5">
              {aiAnalysis.insights.map((insight, index) => (
                <div key={index} className="flex gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-xs font-medium text-foreground mb-2">Recomendaciones</h3>
            <div className="space-y-1.5">
              {aiAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="flex gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
