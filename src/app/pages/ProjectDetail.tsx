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
  Sparkles,
  Send,
  Bot,
  ChevronRight
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { KPICard } from '../components/KPICard';
import { useProjects, useTeamData } from '../hooks/useProjectData';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProjectById } = useProjects();
  const { getProjectTeam } = useTeamData();
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
    resources: { name: string; role: string; allocation: string; tasksCompleted: number; totalTasks: number; status: 'active' | 'blocked' | 'idle' }[];
    aiAnalysis: { riskLevel: string; delayProbability: number; healthScore: number; riskFactors: string[]; insights: string[]; recommendations: string[] };
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
        { name: 'María González', role: 'Project Manager', allocation: '100%', tasksCompleted: 14, totalTasks: 16, status: 'active' },
        { name: 'Carlos Ruiz', role: 'Tech Lead', allocation: '100%', tasksCompleted: 11, totalTasks: 13, status: 'active' },
        { name: 'Ana López', role: 'Senior Developer', allocation: '100%', tasksCompleted: 9, totalTasks: 12, status: 'active' },
        { name: 'Luis Bermúdez', role: 'Backend Developer', allocation: '80%', tasksCompleted: 7, totalTasks: 10, status: 'active' },
        { name: 'Sofía Fernández', role: 'Frontend Developer', allocation: '80%', tasksCompleted: 6, totalTasks: 9, status: 'active' },
        { name: 'Pedro Quiroga', role: 'QA Engineer', allocation: '60%', tasksCompleted: 2, totalTasks: 8, status: 'idle' },
      ],
      aiAnalysis: {
        riskLevel: 'low', delayProbability: 12, healthScore: 88,
        riskFactors: ['Dependencia de API externa (bajo impacto)', 'QA aún no iniciado formalmente'],
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
        { name: 'Carlos Ramírez', role: 'Project Manager', allocation: '100%', tasksCompleted: 8, totalTasks: 15, status: 'active' },
        { name: 'Sandra López', role: 'Cloud Architect', allocation: '100%', tasksCompleted: 6, totalTasks: 12, status: 'blocked' },
        { name: 'Miguel Torres', role: 'DevOps Engineer', allocation: '100%', tasksCompleted: 5, totalTasks: 10, status: 'active' },
        { name: 'Diana Gómez', role: 'DBA Senior', allocation: '80%', tasksCompleted: 3, totalTasks: 8, status: 'blocked' },
      ],
      aiAnalysis: {
        riskLevel: 'high', delayProbability: 72, healthScore: 28,
        riskFactors: ['Presupuesto al 92% con solo 45% avance', 'Deadline 28 Feb vencido', 'Dependencias legacy sin resolver'],
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
        { name: 'Ana Martínez', role: 'Project Manager', allocation: '100%', tasksCompleted: 12, totalTasks: 14, status: 'active' },
        { name: 'Javier Mora', role: 'React Native Lead', allocation: '100%', tasksCompleted: 10, totalTasks: 11, status: 'active' },
        { name: 'Camila Ríos', role: 'UX Designer', allocation: '80%', tasksCompleted: 8, totalTasks: 9, status: 'active' },
        { name: 'Tomás Vargas', role: 'Mobile Developer', allocation: '100%', tasksCompleted: 9, totalTasks: 11, status: 'active' },
      ],
      aiAnalysis: {
        riskLevel: 'low', delayProbability: 8, healthScore: 94,
        riskFactors: ['Aprobación de App Store podría demorar (impacto bajo)'],
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
        { name: 'Roberto Silva', role: 'Project Manager', allocation: '100%', tasksCompleted: 5, totalTasks: 14, status: 'active' },
        { name: 'Elena Vargas', role: 'Security Lead', allocation: '100%', tasksCompleted: 4, totalTasks: 12, status: 'blocked' },
        { name: 'Andrés Muñoz', role: 'Pentester Senior', allocation: '80%', tasksCompleted: 3, totalTasks: 10, status: 'active' },
        { name: 'Patricia León', role: 'Compliance Analyst', allocation: '60%', tasksCompleted: 1, totalTasks: 6, status: 'idle' },
      ],
      aiAnalysis: {
        riskLevel: 'high', delayProbability: 78, healthScore: 18,
        riskFactors: ['Presupuesto al 98% — prácticamente agotado', '15 vulnerabilidades críticas sin remediar', 'Deadline vencido'],
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
        { name: 'Laura Torres', role: 'Project Manager', allocation: '100%', tasksCompleted: 10, totalTasks: 15, status: 'active' },
        { name: 'Ricardo Peña', role: 'Data Engineer Lead', allocation: '100%', tasksCompleted: 8, totalTasks: 12, status: 'active' },
        { name: 'Natalia Cruz', role: 'Data Scientist', allocation: '100%', tasksCompleted: 7, totalTasks: 11, status: 'active' },
        { name: 'Fernando Díaz', role: 'ML Engineer', allocation: '80%', tasksCompleted: 5, totalTasks: 9, status: 'active' },
        { name: 'Valentina Soto', role: 'BI Analyst', allocation: '60%', tasksCompleted: 2, totalTasks: 7, status: 'idle' },
      ],
      aiAnalysis: {
        riskLevel: 'medium', delayProbability: 28, healthScore: 68,
        riskFactors: ['Dashboards de BI con baja prioridad por stakeholders', 'Capacitación aún sin calendario definido'],
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
        { name: 'Diego Mendoza', role: 'Project Manager', allocation: '100%', tasksCompleted: 10, totalTasks: 11, status: 'active' },
        { name: 'Alejandro Ríos', role: 'Backend Lead', allocation: '100%', tasksCompleted: 9, totalTasks: 10, status: 'active' },
        { name: 'Isabela Correa', role: 'Platform Engineer', allocation: '80%', tasksCompleted: 7, totalTasks: 9, status: 'active' },
      ],
      aiAnalysis: {
        riskLevel: 'low', delayProbability: 10, healthScore: 91,
        riskFactors: ['2 microservicios pendientes de integración (bajo impacto)'],
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
        { name: 'Sandra López', role: 'Project Manager', allocation: '100%', tasksCompleted: 7, totalTasks: 13, status: 'active' },
        { name: 'Hugo Castillo', role: 'DevOps Lead', allocation: '100%', tasksCompleted: 6, totalTasks: 11, status: 'active' },
        { name: 'Daniela Vega', role: 'SRE Engineer', allocation: '80%', tasksCompleted: 4, totalTasks: 9, status: 'blocked' },
        { name: 'Marcos Ruiz', role: 'DevOps Engineer', allocation: '80%', tasksCompleted: 3, totalTasks: 8, status: 'active' },
      ],
      aiAnalysis: {
        riskLevel: 'medium', delayProbability: 42, healthScore: 52,
        riskFactors: ['Licencias Jenkins Enterprise sin resolver', 'K8s con solo 15% de avance', 'Presupuesto al 80%'],
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
        { name: 'Paula Herrera', role: 'Project Manager', allocation: '100%', tasksCompleted: 6, totalTasks: 12, status: 'active' },
        { name: 'Gabriel Ortiz', role: 'UX Lead', allocation: '100%', tasksCompleted: 5, totalTasks: 10, status: 'active' },
        { name: 'Lucía Paredes', role: 'UI Designer', allocation: '80%', tasksCompleted: 4, totalTasks: 8, status: 'active' },
        { name: 'Martín Acosta', role: 'UX Researcher', allocation: '60%', tasksCompleted: 3, totalTasks: 5, status: 'active' },
      ],
      aiAnalysis: {
        riskLevel: 'low', delayProbability: 15, healthScore: 82,
        riskFactors: ['Design system depende de alineación con Mobile App'],
        insights: ['40% de avance coherente con timeline largo (Jun 2026).', 'Presupuesto al 55% — buen control de costos.', 'Prototipos con 87% de aprobación en user testing.'],
        recommendations: ['Alinear design system con equipo de Mobile App', 'Planificar handoff a desarrollo con componentes Storybook', 'Incorporar métricas de accesibilidad WCAG 2.1'],
      },
    },
  };

  const projectId = project.id;
  const data = projectDataMap[projectId] ?? projectDataMap[1];
  const milestones = data.milestones;
  const resources = getProjectTeam(projectId);
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

  // Risk / health display helpers
  const riskLabelMap: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: 'BAJO', color: 'text-success', bg: 'bg-success/10' },
    medium: { label: 'MEDIO', color: 'text-warning', bg: 'bg-warning/10' },
    high: { label: 'ALTO', color: 'text-destructive', bg: 'bg-destructive/10' },
  };
  const riskLabel = riskLabelMap[aiAnalysis.riskLevel] ?? riskLabelMap.low;

  const healthColor = aiAnalysis.healthScore >= 70 ? 'text-success' : aiAnalysis.healthScore >= 40 ? 'text-warning' : 'text-destructive';
  const healthBarColor = aiAnalysis.healthScore >= 70 ? 'bg-success' : aiAnalysis.healthScore >= 40 ? 'bg-warning' : 'bg-destructive';

  const delayColor = aiAnalysis.delayProbability <= 25 ? 'text-success' : aiAnalysis.delayProbability <= 50 ? 'text-warning' : 'text-destructive';
  const delayLabel = aiAnalysis.delayProbability <= 25 ? 'Baja probabilidad según tendencias actuales' : aiAnalysis.delayProbability <= 50 ? 'Probabilidad moderada — monitorear de cerca' : 'Alta probabilidad — acción inmediata requerida';

  // AI Chat mock
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [extraMessages, setExtraMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const projectChatMap: Record<number, { role: 'ai' | 'user'; text: string }[]> = {
    1: [
      { role: 'ai', text: `He analizado ${project.name}. El proyecto avanza un 8% por encima del plan con presupuesto controlado al 85%. ¿En qué puedo ayudarte?` },
      { role: 'user', text: '¿Cuál es el mayor riesgo actualmente?' },
      { role: 'ai', text: 'El riesgo principal es la fase de QA: Pedro Quiroga tiene 6 de 8 tareas pendientes y el testing no ha iniciado formalmente. Recomiendo iniciar en paralelo con la Fase 2 para evitar cuellos de botella.' },
    ],
    2: [
      { role: 'ai', text: `${project.name} presenta alertas críticas. Presupuesto al 92% con 45% de avance y deadline vencido. ¿Qué necesitas saber?` },
      { role: 'user', text: '¿Qué opciones tenemos para reconducir?' },
      { role: 'ai', text: 'Tres opciones: (1) Solicitar extensión presupuestal de $45K y renegociar deadline a +30 días, (2) Migración parcial: subir los 3 servicios críticos y postergar el resto, (3) Escalar dependencias legacy a arquitectura para desbloquear a Sandra y Diana.' },
    ],
    3: [
      { role: 'ai', text: `${project.name} está casi completo (92%). Beta con 94% de satisfacción. ¿En qué puedo ayudarte?` },
      { role: 'user', text: '¿Estamos listos para publicar?' },
      { role: 'ai', text: 'Casi. Quedan 2 bugs P2 en la beta. Los assets para App Store y Play Store aún no están preparados. Recomiendo iniciar el proceso de validación de stores ahora — suele tomar 5-7 días.' },
    ],
    4: [
      { role: 'ai', text: `Alerta crítica en ${project.name}. 15 vulnerabilidades sin remediar, presupuesto al 98% y deadline vencido. ¿Cómo procedo?` },
      { role: 'user', text: '¿Cuáles son las vulnerabilidades P1?' },
      { role: 'ai', text: 'Hay 4 vulnerabilidades P1: SQL Injection en módulo de pagos, XSS en portal de clientes, certificados TLS expirados en 2 servidores, y escalamiento de privilegios en API admin. Estas deben remediarse antes de cualquier auditoría SOC 2.' },
    ],
    5: [
      { role: 'ai', text: `${project.name} avanza al 67% con timeline holgado hasta Mayo. Modelos ML con 89% de precisión. ¿En qué te ayudo?` },
      { role: 'user', text: '¿Cómo están los dashboards de BI?' },
      { role: 'ai', text: 'Los dashboards están al 30% — es el área con menor avance. Valentina Soto está al 60% de dedicación y solo ha completado 2 de 7 tareas. Recomiendo incorporar feedback de stakeholders esta semana para evitar retrabajo.' },
    ],
    6: [
      { role: 'ai', text: `${project.name} en excelente ritmo: 88% de avance con 65% de presupuesto. 12 de 14 microservicios integrados. ¿Necesitas algo?` },
      { role: 'user', text: '¿Qué falta para el go-live?' },
      { role: 'ai', text: 'Faltan 2 microservicios por integrar (billing y notifications), configurar alertas APM, y preparar runbooks de operación. Estimación: 5-7 días para completar todo. El ahorro proyectado es de ~$12K del presupuesto.' },
    ],
    7: [
      { role: 'ai', text: `${project.name} tiene riesgo moderado. Presupuesto al 80% con 55% de avance. Bloqueo en licencias Jenkins. ¿Cómo te ayudo?` },
      { role: 'user', text: '¿Qué pasa con Kubernetes?' },
      { role: 'ai', text: 'K8s está al 15% — muy retrasado respecto al plan. Daniela Vega está bloqueada. El problema principal es que los manifests no están definidos y dependen de la resolución del licenciamiento Jenkins Enterprise. Recomiendo paralelizar: que Marcos avance con manifests mientras Hugo resuelve las licencias.' },
    ],
    8: [
      { role: 'ai', text: `${project.name} avanza al 40% — coherente con el timeline largo hasta Junio 2026. Prototipos con 87% de aprobación. ¿En qué te ayudo?` },
      { role: 'user', text: '¿Hay dependencias con otros proyectos?' },
      { role: 'ai', text: 'Sí, el design system v2 tiene dependencia directa con el proyecto Mobile App (#3). Necesitan alinear componentes y tokens de diseño. Recomiendo una sesión conjunta esta semana entre Gabriel Ortiz y Javier Mora para definir la especificación compartida.' },
    ],
  };
  const chatMessages = projectChatMap[project.id] ?? projectChatMap[1];

  const quickResponseMap: Record<string, string> = {
    '¿Quién está bloqueado?': resources.filter(r => r.status === 'blocked').length > 0
      ? `Actualmente ${resources.filter(r => r.status === 'blocked').map(r => r.name).join(' y ')} ${resources.filter(r => r.status === 'blocked').length === 1 ? 'está' : 'están'} bloqueado${resources.filter(r => r.status === 'blocked').length > 1 ? 's' : ''}. Recomiendo escalar las dependencias que los bloquean.`
      : 'No hay miembros bloqueados actualmente. El equipo puede continuar sin impedimentos.',
    '¿Llegamos a tiempo?': aiAnalysis.delayProbability <= 25
      ? `Sí, la probabilidad de retraso es solo del ${aiAnalysis.delayProbability}%. El proyecto mantiene buen ritmo.`
      : `Hay un ${aiAnalysis.delayProbability}% de probabilidad de retraso. ${aiAnalysis.recommendations[0] ?? 'Recomiendo tomar acciones preventivas.'}`,
    'Resumen ejecutivo': `${project.name}: ${project.progress}% de avance, presupuesto al ${project.budget}%. Salud: ${aiAnalysis.healthScore}%. ${aiAnalysis.insights[0] ?? ''} Próximo hito: ${milestones.find(m => m.status === 'in_progress')?.name ?? 'N/A'}.`,
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setExtraMessages(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response = quickResponseMap[text] ?? `He analizado tu pregunta sobre "${text}". Basado en los datos actuales de ${project.name}, el proyecto avanza al ${project.progress}% con una salud del ${aiAnalysis.healthScore}%. ¿Necesitas más detalles sobre algún aspecto específico?`;
      setExtraMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 1500);
  };

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
                        <div className="flex-1 bg-secondary rounded-full h-1.5">
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
                  onClick={() => navigate(`/profile/${resource.memberId}`)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group/member"
                  title={`Ver perfil de ${resource.name}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                        {resource.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                        resource.status === 'active' ? 'bg-success' : resource.status === 'blocked' ? 'bg-destructive' : 'bg-muted-foreground/40'
                      }`} title={resource.status === 'active' ? 'Activo' : resource.status === 'blocked' ? 'Bloqueado' : 'Inactivo'} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover/member:text-primary transition-colors">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">{resource.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-secondary rounded-full h-1.5">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((resource.tasksCompleted / resource.totalTasks) * 100)}%` }} />
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">{resource.tasksCompleted}/{resource.totalTasks}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-9 text-right">{resource.allocation}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/member:opacity-100 transition-opacity" />
                  </div>
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

          {/* Health Score */}
          <div className="border border-border rounded-md p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Salud del Proyecto</span>
              <span className={`text-xs font-semibold ${healthColor}`}>{aiAnalysis.healthScore}%</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-secondary rounded-full h-1.5">
                <div className={`h-full rounded-full ${healthBarColor}`} style={{ width: `${aiAnalysis.healthScore}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Nivel de Riesgo</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${riskLabel.bg} ${riskLabel.color}`}>{riskLabel.label}</span>
            </div>
          </div>

          {/* Risk Factors */}
          {aiAnalysis.riskFactors.length > 0 && (
            <div className="border border-border rounded-md p-3 mb-3">
              <span className="text-xs font-medium text-foreground">Factores de Riesgo</span>
              <div className="mt-1.5 space-y-1">
                {aiAnalysis.riskFactors.map((factor, i) => (
                  <div key={i} className="flex gap-1.5 text-[11px] text-muted-foreground">
                    <AlertTriangle className="w-3 h-3 text-warning shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* AI Chat Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55, ease: 'easeOut' }}
        className="bg-card border border-border rounded-lg p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Asistente IA del Proyecto</h2>
            <p className="text-[11px] text-muted-foreground">Pregunta cualquier cosa sobre {project.name}</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-3 mb-4 max-h-[320px] overflow-y-auto" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
          {[...chatMessages, ...extraMessages].map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i < chatMessages.length ? 0.6 + i * 0.1 : 0 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium ${
                msg.role === 'ai' ? 'bg-primary/10 text-primary' : 'bg-accent text-muted-foreground'
              }`}>
                {msg.role === 'ai' ? <Sparkles className="w-3.5 h-3.5" /> : 'Tú'}
              </div>
              <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                msg.role === 'ai'
                  ? 'bg-secondary/60 text-foreground'
                  : 'bg-primary/10 text-foreground'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="rounded-lg px-3 py-2 bg-secondary/60">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Ej: ¿Cuál es el mayor riesgo? ¿Quién está bloqueado?"
            className="flex-1 bg-secondary/50 border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(chatInput); }}
          />
          <button
            onClick={() => handleSendMessage(chatInput)}
            disabled={isTyping}
            className="w-8 h-8 bg-primary rounded-md flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          {['¿Quién está bloqueado?', '¿Llegamos a tiempo?', 'Resumen ejecutivo'].map(q => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              disabled={isTyping}
              className="text-[10px] text-muted-foreground bg-secondary/50 hover:bg-secondary px-2 py-1 rounded-md transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
