import { useState, useMemo } from 'react';

export interface Project {
  id: number;
  name: string;
  manager: string;
  progress: number;
  budget: number;
  status: 'on_track' | 'at_risk' | 'delayed';
  risk: 'low' | 'medium' | 'high';
  members: number;
  deadline: string;
  description: string;
  startDate: string;
  totalBudget: string;
  tags: string[];
}

const allProjects: Project[] = [
  { id: 1, name: 'ERP Modernization', manager: 'María González', progress: 78, budget: 85, status: 'on_track', risk: 'low', members: 12, deadline: '15 Mar 2026', description: 'Migración del sistema ERP legacy a arquitectura moderna basada en microservicios.', startDate: '01 Sep 2025', totalBudget: '$450,000', tags: ['Cloud', 'ERP'] },
  { id: 2, name: 'Cloud Migration', manager: 'Carlos Ramírez', progress: 45, budget: 92, status: 'at_risk', risk: 'high', members: 8, deadline: '28 Feb 2026', description: 'Migración de infraestructura on-premise a cloud híbrida con AWS y Azure.', startDate: '15 Oct 2025', totalBudget: '$380,000', tags: ['AWS', 'Infra'] },
  { id: 3, name: 'Mobile App', manager: 'Ana Martínez', progress: 92, budget: 78, status: 'on_track', risk: 'low', members: 6, deadline: '10 Abr 2026', description: 'Desarrollo de la app móvil corporativa con React Native para iOS y Android.', startDate: '01 Nov 2025', totalBudget: '$280,000', tags: ['Mobile', 'B2C'] },
  { id: 4, name: 'Security Audit', manager: 'Roberto Silva', progress: 32, budget: 98, status: 'delayed', risk: 'high', members: 5, deadline: '05 Mar 2026', description: 'Auditoría integral de seguridad y compliance SOC 2 / ISO 27001.', startDate: '15 Nov 2025', totalBudget: '$150,000', tags: ['Seguridad', 'Compliance'] },
  { id: 5, name: 'Data Analytics', manager: 'Laura Torres', progress: 67, budget: 72, status: 'on_track', risk: 'medium', members: 7, deadline: '20 May 2026', description: 'Plataforma de analítica avanzada con machine learning para business intelligence.', startDate: '01 Oct 2025', totalBudget: '$520,000', tags: ['Data', 'Analytics'] },
  { id: 6, name: 'API Gateway', manager: 'Diego Mendoza', progress: 88, budget: 65, status: 'on_track', risk: 'low', members: 4, deadline: '01 Mar 2026', description: 'Implementación de API Gateway centralizado para gestión de microservicios.', startDate: '01 Dic 2025', totalBudget: '$180,000', tags: ['API', 'Microservicios'] },
  { id: 7, name: 'DevOps Pipeline', manager: 'Sandra López', progress: 55, budget: 80, status: 'at_risk', risk: 'medium', members: 6, deadline: '15 Abr 2026', description: 'Automatización del pipeline CI/CD con Jenkins, Docker y Kubernetes.', startDate: '15 Nov 2025', totalBudget: '$320,000', tags: ['DevOps', 'CI/CD'] },
  { id: 8, name: 'UX Redesign', manager: 'Paula Herrera', progress: 40, budget: 55, status: 'on_track', risk: 'low', members: 5, deadline: '30 Jun 2026', description: 'Rediseño completo de la experiencia de usuario del portal corporativo.', startDate: '01 Ene 2026', totalBudget: '$200,000', tags: ['UX', 'Diseño'] },
];

export function useProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.manager.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const getProjectById = (id: number) => allProjects.find((p) => p.id === id) ?? null;

  return {
    projects: filteredProjects,
    allProjects,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    getProjectById,
  };
}

export interface DashboardKPI {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  subtitle: string;
}

export interface AIInsight {
  type: 'warning' | 'danger' | 'success';
  title: string;
  description: string;
  action: string;
}

export function useDashboard() {
  const kpis: DashboardKPI[] = [
    { title: 'Avance Promedio', value: '62%', trend: 'up', trendValue: '+4.3%', subtitle: 'vs mes anterior' },
    { title: 'Presupuesto', value: '79%', trend: 'up', trendValue: '+3.8%', subtitle: 'de $2.5M asignados' },
    { title: 'En Riesgo', value: '3', trend: 'up', trendValue: '+1', subtitle: 'de 8 activos' },
    { title: 'Desviación', value: '-3.2%', trend: 'neutral', trendValue: '±1.5%', subtitle: 'del plan original' },
  ];

  const chartData = [
    { name: 'Ene', avance: 65, planificado: 70 },
    { name: 'Feb', avance: 72, planificado: 75 },
    { name: 'Mar', avance: 78, planificado: 80 },
    { name: 'Abr', avance: 85, planificado: 85 },
    { name: 'May', avance: 88, planificado: 90 },
    { name: 'Jun', avance: 90, planificado: 95 },
  ];

  const aiInsights: AIInsight[] = [
    { type: 'warning', title: 'Riesgo Presupuestal', description: 'Cloud Migration tiene 92% de probabilidad de exceder presupuesto en 2 semanas.', action: 'Revisar recursos' },
    { type: 'danger', title: 'Retraso Detectado', description: 'Security Audit muestra 78% de probabilidad de retraso mayor a 2 semanas.', action: 'Escalar' },
    { type: 'success', title: 'Optimización Disponible', description: 'ERP Modernization puede completarse 5 días antes con redistribución actual.', action: 'Aplicar' },
  ];

  const topProjects = allProjects.slice(0, 4);

  return { kpis, chartData, aiInsights, topProjects };
}

export interface ExecutiveAlert {
  project: string;
  issue: string;
  impact: 'Alto' | 'Medio' | 'Bajo';
  date: string;
}

export function useExecutive() {
  const kpis = [
    { title: 'Total Proyectos', value: '8', subtitle: 'Activos en cartera', status: 'info' as const },
    { title: 'Avance Global', value: '64.2%', trend: 'up' as const, trendValue: '+4.5%', subtitle: 'Promedio ponderado', status: 'success' as const },
    { title: 'En Riesgo', value: '3', trend: 'up' as const, subtitle: '37.5% del portafolio', status: 'danger' as const },
    { title: 'Desviación', value: '+$125K', trend: 'down' as const, trendValue: '5%', subtitle: 'Sobre $2.5M presupuestado', status: 'warning' as const },
  ];

  const chartData = [
    { name: 'ERP', avance: 78, presupuesto: 85 },
    { name: 'Cloud', avance: 45, presupuesto: 92 },
    { name: 'Mobile', avance: 92, presupuesto: 78 },
    { name: 'Security', avance: 32, presupuesto: 98 },
    { name: 'Analytics', avance: 67, presupuesto: 72 },
    { name: 'API GW', avance: 88, presupuesto: 65 },
    { name: 'DevOps', avance: 55, presupuesto: 80 },
    { name: 'UX', avance: 40, presupuesto: 55 },
  ];

  const criticalAlerts: ExecutiveAlert[] = [
    { project: 'Security Audit - Roberto Silva', issue: 'Retraso crítico - 2 semanas', impact: 'Alto', date: '25 Feb 2026' },
    { project: 'Cloud Migration - Carlos Ramírez', issue: 'Exceso presupuestal inminente', impact: 'Medio', date: '24 Feb 2026' },
    { project: 'DevOps Pipeline - Sandra López', issue: 'Falta de recursos críticos', impact: 'Alto', date: '23 Feb 2026' },
  ];

  return { kpis, chartData, criticalAlerts };
}

// ── Centralized Team & Member Data ──────────────────────────────

export interface TeamMember {
  memberId: string;
  name: string;
  role: string;
  allocation: string;
  tasksCompleted: number;
  totalTasks: number;
  status: 'active' | 'blocked' | 'idle';
}

export interface MemberAchievement {
  title: string;
  level: 'gold' | 'silver' | 'bronze';
  date: string;
  category: 'Gestión' | 'Velocidad' | 'Calidad' | 'Colaboración';
}

export interface LockedAchievement {
  title: string;
  category: 'Gestión' | 'Velocidad' | 'Calidad' | 'Colaboración';
  progress: number;
}

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarInitial: string;
  joinDate: string;
  achievements: MemberAchievement[];
  lockedAchievements: LockedAchievement[];
  stats: {
    tasksCompleted: number;
    totalTasks: number;
    onTimeRate: number;
    projectsCompleted: number;
    avgRating: number;
  };
  currentProjects: number[];
  recentActivity: { action: string; date: string; type: 'success' | 'info' | 'neutral' }[];
}

export const projectTeams: Record<number, TeamMember[]> = {
  1: [
    { memberId: 'm1', name: 'María González', role: 'Project Manager', allocation: '100%', tasksCompleted: 14, totalTasks: 16, status: 'active' },
    { memberId: 'm2', name: 'Carlos Ruiz', role: 'Tech Lead', allocation: '100%', tasksCompleted: 11, totalTasks: 13, status: 'active' },
    { memberId: 'm3', name: 'Ana López', role: 'Senior Developer', allocation: '100%', tasksCompleted: 9, totalTasks: 12, status: 'active' },
    { memberId: 'm4', name: 'Luis Bermúdez', role: 'Backend Developer', allocation: '80%', tasksCompleted: 7, totalTasks: 10, status: 'active' },
    { memberId: 'm5', name: 'Sofía Fernández', role: 'Frontend Developer', allocation: '80%', tasksCompleted: 6, totalTasks: 9, status: 'active' },
    { memberId: 'm6', name: 'Pedro Quiroga', role: 'QA Engineer', allocation: '60%', tasksCompleted: 2, totalTasks: 8, status: 'idle' },
  ],
  2: [
    { memberId: 'm7', name: 'Carlos Ramírez', role: 'Project Manager', allocation: '100%', tasksCompleted: 8, totalTasks: 15, status: 'active' },
    { memberId: 'm8', name: 'Sandra López', role: 'Cloud Architect', allocation: '100%', tasksCompleted: 6, totalTasks: 12, status: 'blocked' },
    { memberId: 'm9', name: 'Miguel Torres', role: 'DevOps Engineer', allocation: '100%', tasksCompleted: 5, totalTasks: 10, status: 'active' },
    { memberId: 'm10', name: 'Diana Gómez', role: 'DBA Senior', allocation: '80%', tasksCompleted: 3, totalTasks: 8, status: 'blocked' },
  ],
  3: [
    { memberId: 'm11', name: 'Ana Martínez', role: 'Project Manager', allocation: '100%', tasksCompleted: 12, totalTasks: 14, status: 'active' },
    { memberId: 'm12', name: 'Javier Mora', role: 'React Native Lead', allocation: '100%', tasksCompleted: 10, totalTasks: 11, status: 'active' },
    { memberId: 'm13', name: 'Camila Ríos', role: 'UX Designer', allocation: '80%', tasksCompleted: 8, totalTasks: 9, status: 'active' },
    { memberId: 'm14', name: 'Tomás Vargas', role: 'Mobile Developer', allocation: '100%', tasksCompleted: 9, totalTasks: 11, status: 'active' },
  ],
  4: [
    { memberId: 'm15', name: 'Roberto Silva', role: 'Project Manager', allocation: '100%', tasksCompleted: 5, totalTasks: 14, status: 'active' },
    { memberId: 'm16', name: 'Elena Vargas', role: 'Security Lead', allocation: '100%', tasksCompleted: 4, totalTasks: 12, status: 'blocked' },
    { memberId: 'm17', name: 'Andrés Muñoz', role: 'Pentester Senior', allocation: '80%', tasksCompleted: 3, totalTasks: 10, status: 'active' },
    { memberId: 'm18', name: 'Patricia León', role: 'Compliance Analyst', allocation: '60%', tasksCompleted: 1, totalTasks: 6, status: 'idle' },
  ],
  5: [
    { memberId: 'm19', name: 'Laura Torres', role: 'Project Manager', allocation: '100%', tasksCompleted: 10, totalTasks: 15, status: 'active' },
    { memberId: 'm20', name: 'Ricardo Peña', role: 'Data Engineer Lead', allocation: '100%', tasksCompleted: 8, totalTasks: 12, status: 'active' },
    { memberId: 'm21', name: 'Natalia Cruz', role: 'Data Scientist', allocation: '100%', tasksCompleted: 7, totalTasks: 11, status: 'active' },
    { memberId: 'm22', name: 'Fernando Díaz', role: 'ML Engineer', allocation: '80%', tasksCompleted: 5, totalTasks: 9, status: 'active' },
    { memberId: 'm23', name: 'Valentina Soto', role: 'BI Analyst', allocation: '60%', tasksCompleted: 2, totalTasks: 7, status: 'idle' },
  ],
  6: [
    { memberId: 'm24', name: 'Diego Mendoza', role: 'Project Manager', allocation: '100%', tasksCompleted: 10, totalTasks: 11, status: 'active' },
    { memberId: 'm25', name: 'Alejandro Ríos', role: 'Backend Lead', allocation: '100%', tasksCompleted: 9, totalTasks: 10, status: 'active' },
    { memberId: 'm26', name: 'Isabela Correa', role: 'Platform Engineer', allocation: '80%', tasksCompleted: 7, totalTasks: 9, status: 'active' },
  ],
  7: [
    { memberId: 'm8', name: 'Sandra López', role: 'Project Manager', allocation: '100%', tasksCompleted: 7, totalTasks: 13, status: 'active' },
    { memberId: 'm27', name: 'Hugo Castillo', role: 'DevOps Lead', allocation: '100%', tasksCompleted: 6, totalTasks: 11, status: 'active' },
    { memberId: 'm28', name: 'Daniela Vega', role: 'SRE Engineer', allocation: '80%', tasksCompleted: 4, totalTasks: 9, status: 'blocked' },
    { memberId: 'm29', name: 'Marcos Ruiz', role: 'DevOps Engineer', allocation: '80%', tasksCompleted: 3, totalTasks: 8, status: 'active' },
  ],
  8: [
    { memberId: 'm30', name: 'Paula Herrera', role: 'Project Manager', allocation: '100%', tasksCompleted: 6, totalTasks: 12, status: 'active' },
    { memberId: 'm31', name: 'Gabriel Ortiz', role: 'UX Lead', allocation: '100%', tasksCompleted: 5, totalTasks: 10, status: 'active' },
    { memberId: 'm32', name: 'Lucía Paredes', role: 'UI Designer', allocation: '80%', tasksCompleted: 4, totalTasks: 8, status: 'active' },
    { memberId: 'm33', name: 'Martín Acosta', role: 'UX Researcher', allocation: '60%', tasksCompleted: 3, totalTasks: 5, status: 'active' },
  ],
};

export const memberProfiles: Record<string, MemberProfile> = {
  m1: {
    id: 'm1', name: 'María González', email: 'maria.gonzalez@techmahindra.com', role: 'Project Manager', department: 'Gestión de Proyectos', avatarInitial: 'M', joinDate: '15 Mar 2023',
    achievements: [
      { title: 'Primer Proyecto Completado', level: 'gold', date: '10 Jun 2023', category: 'Gestión' },
      { title: '5 Proyectos Gestionados', level: 'silver', date: '20 Nov 2024', category: 'Gestión' },
      { title: 'Sin Retrasos en el Mes', level: 'bronze', date: '01 Feb 2026', category: 'Velocidad' },
      { title: 'Mentor del Equipo', level: 'silver', date: '15 Ago 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: '10 Proyectos Gestionados', category: 'Gestión', progress: 60 },
      { title: 'Planificación Perfecta', category: 'Gestión', progress: 80 },
    ],
    stats: { tasksCompleted: 142, totalTasks: 158, onTimeRate: 94, projectsCompleted: 6, avgRating: 4.8 },
    currentProjects: [1],
    recentActivity: [
      { action: 'Completó hito "Desarrollo Fase 1" en ERP Modernization', date: '10 Feb 2026', type: 'success' },
      { action: 'Actualizó plan de proyecto ERP', date: '08 Feb 2026', type: 'info' },
      { action: 'Revisó asignación de recursos', date: '05 Feb 2026', type: 'neutral' },
    ],
  },
  m2: {
    id: 'm2', name: 'Carlos Ruiz', email: 'carlos.ruiz@techmahindra.com', role: 'Tech Lead', department: 'Ingeniería', avatarInitial: 'C', joinDate: '01 Jun 2023',
    achievements: [
      { title: 'Arquitecto Limpio', level: 'gold', date: '15 Sep 2024', category: 'Calidad' },
      { title: 'Code Review Master', level: 'silver', date: '20 Dic 2025', category: 'Calidad' },
      { title: 'Sprint Champion', level: 'silver', date: '10 Ene 2026', category: 'Velocidad' },
    ],
    lockedAchievements: [
      { title: 'Cero Defectos', category: 'Calidad', progress: 75 },
      { title: 'Integrador', category: 'Colaboración', progress: 40 },
    ],
    stats: { tasksCompleted: 128, totalTasks: 140, onTimeRate: 91, projectsCompleted: 5, avgRating: 4.7 },
    currentProjects: [1],
    recentActivity: [
      { action: 'Aprobó PR de migración de módulo financiero', date: '09 Feb 2026', type: 'success' },
      { action: 'Realizó code review de Ana López', date: '07 Feb 2026', type: 'info' },
      { action: 'Documentó arquitectura de microservicios', date: '04 Feb 2026', type: 'neutral' },
    ],
  },
  m3: {
    id: 'm3', name: 'Ana López', email: 'ana.lopez@techmahindra.com', role: 'Senior Developer', department: 'Ingeniería', avatarInitial: 'A', joinDate: '15 Ago 2023',
    achievements: [
      { title: 'Sprint Champion', level: 'silver', date: '05 Nov 2025', category: 'Velocidad' },
      { title: 'Primer Proyecto Completado', level: 'gold', date: '20 Mar 2024', category: 'Gestión' },
    ],
    lockedAchievements: [
      { title: 'Code Review Master', category: 'Calidad', progress: 65 },
      { title: 'Mentor del Equipo', category: 'Colaboración', progress: 50 },
    ],
    stats: { tasksCompleted: 98, totalTasks: 110, onTimeRate: 89, projectsCompleted: 3, avgRating: 4.5 },
    currentProjects: [1],
    recentActivity: [
      { action: 'Completó módulo de RRHH en ERP', date: '06 Feb 2026', type: 'success' },
      { action: 'Inició desarrollo de módulo de inventario', date: '03 Feb 2026', type: 'info' },
    ],
  },
  m4: {
    id: 'm4', name: 'Luis Bermúdez', email: 'luis.bermudez@techmahindra.com', role: 'Backend Developer', department: 'Ingeniería', avatarInitial: 'L', joinDate: '01 Feb 2024',
    achievements: [
      { title: 'Entrega Récord', level: 'silver', date: '15 Dic 2025', category: 'Velocidad' },
      { title: 'Feedback Champion', level: 'bronze', date: '10 Ene 2026', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Sprint Champion', category: 'Velocidad', progress: 70 },
    ],
    stats: { tasksCompleted: 67, totalTasks: 78, onTimeRate: 86, projectsCompleted: 2, avgRating: 4.3 },
    currentProjects: [1],
    recentActivity: [
      { action: 'Implementó endpoint de reportes en ERP', date: '08 Feb 2026', type: 'success' },
      { action: 'Optimizó queries de base de datos', date: '05 Feb 2026', type: 'info' },
    ],
  },
  m5: {
    id: 'm5', name: 'Sofía Fernández', email: 'sofia.fernandez@techmahindra.com', role: 'Frontend Developer', department: 'Ingeniería', avatarInitial: 'S', joinDate: '15 Abr 2024',
    achievements: [
      { title: 'Primer Proyecto Completado', level: 'gold', date: '20 Oct 2025', category: 'Gestión' },
      { title: 'Cross-Team Player', level: 'bronze', date: '05 Dic 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Velocista', category: 'Velocidad', progress: 45 },
    ],
    stats: { tasksCompleted: 52, totalTasks: 61, onTimeRate: 85, projectsCompleted: 1, avgRating: 4.4 },
    currentProjects: [1],
    recentActivity: [
      { action: 'Completó UI de dashboard ERP', date: '07 Feb 2026', type: 'success' },
      { action: 'Integró componentes de gráficas', date: '04 Feb 2026', type: 'info' },
    ],
  },
  m6: {
    id: 'm6', name: 'Pedro Quiroga', email: 'pedro.quiroga@techmahindra.com', role: 'QA Engineer', department: 'Calidad', avatarInitial: 'P', joinDate: '01 Jul 2024',
    achievements: [
      { title: 'QA Perfecto', level: 'gold', date: '10 Sep 2025', category: 'Calidad' },
    ],
    lockedAchievements: [
      { title: 'Cero Defectos', category: 'Calidad', progress: 30 },
      { title: 'Maratonista', category: 'Velocidad', progress: 20 },
    ],
    stats: { tasksCompleted: 38, totalTasks: 50, onTimeRate: 76, projectsCompleted: 1, avgRating: 4.1 },
    currentProjects: [1],
    recentActivity: [
      { action: 'Creó plan de testing para ERP Fase 2', date: '06 Feb 2026', type: 'info' },
      { action: 'Reportó 3 bugs en módulo financiero', date: '02 Feb 2026', type: 'neutral' },
    ],
  },
  m7: {
    id: 'm7', name: 'Carlos Ramírez', email: 'carlos.ramirez@techmahindra.com', role: 'Project Manager', department: 'Gestión de Proyectos', avatarInitial: 'C', joinDate: '01 May 2023',
    achievements: [
      { title: 'Primer Proyecto Completado', level: 'gold', date: '15 Ago 2023', category: 'Gestión' },
      { title: '5 Proyectos Gestionados', level: 'silver', date: '10 Jul 2025', category: 'Gestión' },
      { title: 'Integrador', level: 'gold', date: '20 Sep 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Sin Retrasos en el Mes', category: 'Velocidad', progress: 15 },
    ],
    stats: { tasksCompleted: 115, totalTasks: 148, onTimeRate: 78, projectsCompleted: 5, avgRating: 4.2 },
    currentProjects: [2],
    recentActivity: [
      { action: 'Escaló problema de presupuesto en Cloud Migration', date: '09 Feb 2026', type: 'neutral' },
      { action: 'Reunión con stakeholders sobre timeline', date: '07 Feb 2026', type: 'info' },
      { action: 'Actualizó reporte de riesgos', date: '05 Feb 2026', type: 'info' },
    ],
  },
  m8: {
    id: 'm8', name: 'Sandra López', email: 'sandra.lopez@techmahindra.com', role: 'Cloud Architect / PM', department: 'DevOps & Cloud', avatarInitial: 'S', joinDate: '20 Ene 2023',
    achievements: [
      { title: 'Líder Nato', level: 'silver', date: '10 May 2025', category: 'Gestión' },
      { title: 'Arquitecto Limpio', level: 'gold', date: '15 Mar 2024', category: 'Calidad' },
      { title: 'Cross-Team Player', level: 'bronze', date: '01 Oct 2025', category: 'Colaboración' },
      { title: 'Primer Proyecto Completado', level: 'gold', date: '05 Jun 2023', category: 'Gestión' },
    ],
    lockedAchievements: [
      { title: '10 Proyectos Gestionados', category: 'Gestión', progress: 70 },
    ],
    stats: { tasksCompleted: 156, totalTasks: 180, onTimeRate: 87, projectsCompleted: 7, avgRating: 4.6 },
    currentProjects: [2, 7],
    recentActivity: [
      { action: 'Diseñó arquitectura de migración híbrida', date: '08 Feb 2026', type: 'success' },
      { action: 'Revisó pipeline CI/CD en DevOps Pipeline', date: '06 Feb 2026', type: 'info' },
      { action: 'Bloqueada por dependencias legacy', date: '04 Feb 2026', type: 'neutral' },
    ],
  },
  m9: {
    id: 'm9', name: 'Miguel Torres', email: 'miguel.torres@techmahindra.com', role: 'DevOps Engineer', department: 'DevOps & Cloud', avatarInitial: 'M', joinDate: '15 Sep 2024',
    achievements: [
      { title: 'Entrega Récord', level: 'silver', date: '20 Ene 2026', category: 'Velocidad' },
      { title: 'Feedback Champion', level: 'bronze', date: '15 Dic 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Integrador', category: 'Colaboración', progress: 55 },
    ],
    stats: { tasksCompleted: 45, totalTasks: 55, onTimeRate: 82, projectsCompleted: 1, avgRating: 4.3 },
    currentProjects: [2],
    recentActivity: [
      { action: 'Configuró ambiente staging en AWS', date: '09 Feb 2026', type: 'success' },
      { action: 'Migró servicio de autenticación', date: '06 Feb 2026', type: 'info' },
    ],
  },
  m10: {
    id: 'm10', name: 'Diana Gómez', email: 'diana.gomez@techmahindra.com', role: 'DBA Senior', department: 'Ingeniería', avatarInitial: 'D', joinDate: '01 Mar 2024',
    achievements: [
      { title: 'Arquitecto Limpio', level: 'gold', date: '10 Nov 2025', category: 'Calidad' },
    ],
    lockedAchievements: [
      { title: 'Sprint Champion', category: 'Velocidad', progress: 25 },
      { title: 'Cero Defectos', category: 'Calidad', progress: 60 },
    ],
    stats: { tasksCompleted: 35, totalTasks: 48, onTimeRate: 73, projectsCompleted: 1, avgRating: 4.0 },
    currentProjects: [2],
    recentActivity: [
      { action: 'Bloqueada — dependencias legacy en BD principal', date: '08 Feb 2026', type: 'neutral' },
      { action: 'Completó backup de BD staging', date: '03 Feb 2026', type: 'success' },
    ],
  },
  m11: {
    id: 'm11', name: 'Ana Martínez', email: 'ana.martinez@techmahindra.com', role: 'Project Manager', department: 'Gestión de Proyectos', avatarInitial: 'A', joinDate: '10 Abr 2023',
    achievements: [
      { title: 'Planificación Perfecta', level: 'gold', date: '15 Ene 2026', category: 'Gestión' },
      { title: 'Sin Retrasos en el Mes', level: 'bronze', date: '01 Feb 2026', category: 'Velocidad' },
      { title: 'Primer Proyecto Completado', level: 'gold', date: '30 Jul 2023', category: 'Gestión' },
      { title: 'Mentor del Equipo', level: 'silver', date: '01 Nov 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Velocista', category: 'Velocidad', progress: 90 },
    ],
    stats: { tasksCompleted: 138, totalTasks: 149, onTimeRate: 96, projectsCompleted: 7, avgRating: 4.9 },
    currentProjects: [3],
    recentActivity: [
      { action: 'Lanzó beta cerrada de Mobile App', date: '10 Feb 2026', type: 'success' },
      { action: 'Revisó resultados de testing de usabilidad', date: '08 Feb 2026', type: 'info' },
      { action: 'Coordinó con equipo de marketing de lanzamiento', date: '05 Feb 2026', type: 'info' },
    ],
  },
  m12: {
    id: 'm12', name: 'Javier Mora', email: 'javier.mora@techmahindra.com', role: 'React Native Lead', department: 'Ingeniería', avatarInitial: 'J', joinDate: '01 Jul 2023',
    achievements: [
      { title: 'Sprint Champion', level: 'silver', date: '20 Dic 2025', category: 'Velocidad' },
      { title: 'Code Review Master', level: 'silver', date: '15 Ene 2026', category: 'Calidad' },
      { title: 'Velocista', level: 'gold', date: '01 Feb 2026', category: 'Velocidad' },
    ],
    lockedAchievements: [
      { title: 'Cero Defectos', category: 'Calidad', progress: 85 },
    ],
    stats: { tasksCompleted: 105, totalTasks: 112, onTimeRate: 94, projectsCompleted: 4, avgRating: 4.8 },
    currentProjects: [3],
    recentActivity: [
      { action: 'Optimizó rendimiento de la app — 40% más rápida', date: '09 Feb 2026', type: 'success' },
      { action: 'Implementó push notifications', date: '06 Feb 2026', type: 'success' },
    ],
  },
  m13: {
    id: 'm13', name: 'Camila Ríos', email: 'camila.rios@techmahindra.com', role: 'UX Designer', department: 'Diseño', avatarInitial: 'C', joinDate: '15 Oct 2024',
    achievements: [
      { title: 'Primer Proyecto Completado', level: 'gold', date: '10 Ago 2025', category: 'Gestión' },
      { title: 'Feedback Champion', level: 'bronze', date: '01 Dic 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Cross-Team Player', category: 'Colaboración', progress: 60 },
    ],
    stats: { tasksCompleted: 55, totalTasks: 62, onTimeRate: 89, projectsCompleted: 2, avgRating: 4.5 },
    currentProjects: [3],
    recentActivity: [
      { action: 'Finalizó diseño de onboarding flow', date: '08 Feb 2026', type: 'success' },
      { action: 'Realizó 5 sesiones de user testing', date: '04 Feb 2026', type: 'info' },
    ],
  },
  m14: {
    id: 'm14', name: 'Tomás Vargas', email: 'tomas.vargas@techmahindra.com', role: 'Mobile Developer', department: 'Ingeniería', avatarInitial: 'T', joinDate: '01 Dic 2024',
    achievements: [
      { title: 'Entrega Récord', level: 'silver', date: '15 Ene 2026', category: 'Velocidad' },
    ],
    lockedAchievements: [
      { title: 'Sprint Champion', category: 'Velocidad', progress: 55 },
      { title: 'Primer Proyecto Completado', category: 'Gestión', progress: 90 },
    ],
    stats: { tasksCompleted: 42, totalTasks: 48, onTimeRate: 88, projectsCompleted: 0, avgRating: 4.4 },
    currentProjects: [3],
    recentActivity: [
      { action: 'Implementó módulo de pagos en app', date: '09 Feb 2026', type: 'success' },
      { action: 'Corrigió bug de navegación iOS', date: '07 Feb 2026', type: 'info' },
    ],
  },
  m15: {
    id: 'm15', name: 'Roberto Silva', email: 'roberto.silva@techmahindra.com', role: 'Project Manager', department: 'Seguridad', avatarInitial: 'R', joinDate: '01 Jun 2023',
    achievements: [
      { title: 'Primer Proyecto Completado', level: 'gold', date: '20 Oct 2023', category: 'Gestión' },
      { title: '5 Proyectos Gestionados', level: 'silver', date: '15 Sep 2025', category: 'Gestión' },
    ],
    lockedAchievements: [
      { title: 'Sin Retrasos en el Mes', category: 'Velocidad', progress: 10 },
      { title: 'Planificación Perfecta', category: 'Gestión', progress: 25 },
    ],
    stats: { tasksCompleted: 88, totalTasks: 120, onTimeRate: 73, projectsCompleted: 4, avgRating: 3.9 },
    currentProjects: [4],
    recentActivity: [
      { action: 'Escaló alertas de seguridad a dirección', date: '09 Feb 2026', type: 'neutral' },
      { action: 'Reunión con auditor externo SOC 2', date: '06 Feb 2026', type: 'info' },
    ],
  },
  m16: {
    id: 'm16', name: 'Elena Vargas', email: 'elena.vargas@techmahindra.com', role: 'Security Lead', department: 'Seguridad', avatarInitial: 'E', joinDate: '15 Mar 2024',
    achievements: [
      { title: 'Cero Defectos', level: 'gold', date: '10 Ago 2025', category: 'Calidad' },
      { title: 'Primer Proyecto Completado', level: 'gold', date: '25 Jun 2025', category: 'Gestión' },
    ],
    lockedAchievements: [
      { title: 'Arquitecto Limpio', category: 'Calidad', progress: 70 },
    ],
    stats: { tasksCompleted: 48, totalTasks: 68, onTimeRate: 71, projectsCompleted: 2, avgRating: 4.2 },
    currentProjects: [4],
    recentActivity: [
      { action: 'Bloqueada – esperando acceso a servidor de producción', date: '08 Feb 2026', type: 'neutral' },
      { action: 'Completó análisis de vulnerabilidades P2', date: '03 Feb 2026', type: 'success' },
    ],
  },
  m17: {
    id: 'm17', name: 'Andrés Muñoz', email: 'andres.munoz@techmahindra.com', role: 'Pentester Senior', department: 'Seguridad', avatarInitial: 'A', joinDate: '01 May 2024',
    achievements: [
      { title: 'Entrega Récord', level: 'silver', date: '20 Nov 2025', category: 'Velocidad' },
    ],
    lockedAchievements: [
      { title: 'QA Perfecto', category: 'Calidad', progress: 40 },
    ],
    stats: { tasksCompleted: 32, totalTasks: 45, onTimeRate: 71, projectsCompleted: 1, avgRating: 4.1 },
    currentProjects: [4],
    recentActivity: [
      { action: 'Ejecutó pentesting en módulo de pagos', date: '07 Feb 2026', type: 'success' },
      { action: 'Documentó 3 vulnerabilidades P1', date: '04 Feb 2026', type: 'info' },
    ],
  },
  m18: {
    id: 'm18', name: 'Patricia León', email: 'patricia.leon@techmahindra.com', role: 'Compliance Analyst', department: 'Seguridad', avatarInitial: 'P', joinDate: '15 Ago 2024',
    achievements: [
      { title: 'Feedback Champion', level: 'bronze', date: '01 Nov 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Primer Proyecto Completado', category: 'Gestión', progress: 30 },
    ],
    stats: { tasksCompleted: 15, totalTasks: 25, onTimeRate: 60, projectsCompleted: 0, avgRating: 3.8 },
    currentProjects: [4],
    recentActivity: [
      { action: 'Revisó documentación de compliance SOC 2', date: '06 Feb 2026', type: 'info' },
    ],
  },
  m19: {
    id: 'm19', name: 'Laura Torres', email: 'laura.torres@techmahindra.com', role: 'Project Manager', department: 'Data & Analytics', avatarInitial: 'L', joinDate: '20 Feb 2023',
    achievements: [
      { title: 'Primer Proyecto Completado', level: 'gold', date: '10 Jul 2023', category: 'Gestión' },
      { title: '5 Proyectos Gestionados', level: 'silver', date: '05 Ago 2025', category: 'Gestión' },
      { title: 'Sin Retrasos en el Mes', level: 'bronze', date: '01 Ene 2026', category: 'Velocidad' },
    ],
    lockedAchievements: [
      { title: 'Planificación Perfecta', category: 'Gestión', progress: 70 },
    ],
    stats: { tasksCompleted: 130, totalTasks: 150, onTimeRate: 87, projectsCompleted: 5, avgRating: 4.5 },
    currentProjects: [5],
    recentActivity: [
      { action: 'Revisó modelos ML en staging', date: '09 Feb 2026', type: 'info' },
      { action: 'Coordinación con equipo de BI', date: '06 Feb 2026', type: 'neutral' },
    ],
  },
  m20: {
    id: 'm20', name: 'Ricardo Peña', email: 'ricardo.pena@techmahindra.com', role: 'Data Engineer Lead', department: 'Data & Analytics', avatarInitial: 'R', joinDate: '01 Sep 2023',
    achievements: [
      { title: 'Arquitecto Limpio', level: 'gold', date: '15 Jun 2025', category: 'Calidad' },
      { title: 'Sprint Champion', level: 'silver', date: '10 Dic 2025', category: 'Velocidad' },
      { title: 'Integrador', level: 'gold', date: '01 Ene 2026', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Mentor del Equipo', category: 'Colaboración', progress: 80 },
    ],
    stats: { tasksCompleted: 95, totalTasks: 108, onTimeRate: 88, projectsCompleted: 4, avgRating: 4.6 },
    currentProjects: [5],
    recentActivity: [
      { action: 'Optimizó ETL pipeline — 3x más rápido', date: '08 Feb 2026', type: 'success' },
      { action: 'Configuró data warehouse partitioning', date: '05 Feb 2026', type: 'info' },
    ],
  },
  m21: {
    id: 'm21', name: 'Natalia Cruz', email: 'natalia.cruz@techmahindra.com', role: 'Data Scientist', department: 'Data & Analytics', avatarInitial: 'N', joinDate: '01 Ene 2024',
    achievements: [
      { title: 'Velocista', level: 'gold', date: '20 Nov 2025', category: 'Velocidad' },
      { title: 'Primer Proyecto Completado', level: 'gold', date: '15 Ago 2025', category: 'Gestión' },
    ],
    lockedAchievements: [
      { title: 'Cero Defectos', category: 'Calidad', progress: 55 },
    ],
    stats: { tasksCompleted: 68, totalTasks: 78, onTimeRate: 87, projectsCompleted: 2, avgRating: 4.5 },
    currentProjects: [5],
    recentActivity: [
      { action: 'Modelo de predicción alcanzó 89% de precisión', date: '07 Feb 2026', type: 'success' },
      { action: 'Inició feature engineering para modelo v2', date: '04 Feb 2026', type: 'info' },
    ],
  },
  m22: {
    id: 'm22', name: 'Fernando Díaz', email: 'fernando.diaz@techmahindra.com', role: 'ML Engineer', department: 'Data & Analytics', avatarInitial: 'F', joinDate: '15 Mar 2024',
    achievements: [
      { title: 'Entrega Récord', level: 'silver', date: '05 Ene 2026', category: 'Velocidad' },
      { title: 'Cross-Team Player', level: 'bronze', date: '20 Dic 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Arquitecto Limpio', category: 'Calidad', progress: 50 },
    ],
    stats: { tasksCompleted: 52, totalTasks: 62, onTimeRate: 84, projectsCompleted: 1, avgRating: 4.3 },
    currentProjects: [5],
    recentActivity: [
      { action: 'Desplegó modelo en staging con MLflow', date: '08 Feb 2026', type: 'success' },
      { action: 'Realizó A/B testing de modelos', date: '05 Feb 2026', type: 'info' },
    ],
  },
  m23: {
    id: 'm23', name: 'Valentina Soto', email: 'valentina.soto@techmahindra.com', role: 'BI Analyst', department: 'Data & Analytics', avatarInitial: 'V', joinDate: '01 Jul 2024',
    achievements: [
      { title: 'Feedback Champion', level: 'bronze', date: '10 Nov 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Primer Proyecto Completado', category: 'Gestión', progress: 60 },
      { title: 'Sprint Champion', category: 'Velocidad', progress: 20 },
    ],
    stats: { tasksCompleted: 22, totalTasks: 35, onTimeRate: 63, projectsCompleted: 0, avgRating: 3.9 },
    currentProjects: [5],
    recentActivity: [
      { action: 'Creó dashboard de métricas de ventas', date: '07 Feb 2026', type: 'success' },
      { action: 'Presentó prototipo de BI a stakeholders', date: '03 Feb 2026', type: 'info' },
    ],
  },
  m24: {
    id: 'm24', name: 'Diego Mendoza', email: 'diego.mendoza@techmahindra.com', role: 'Project Manager', department: 'Ingeniería', avatarInitial: 'D', joinDate: '01 Abr 2023',
    achievements: [
      { title: 'Planificación Perfecta', level: 'gold', date: '15 Feb 2026', category: 'Gestión' },
      { title: 'Primer Proyecto Completado', level: 'gold', date: '20 Jul 2023', category: 'Gestión' },
      { title: '5 Proyectos Gestionados', level: 'silver', date: '01 Nov 2025', category: 'Gestión' },
      { title: 'Velocista', level: 'gold', date: '10 Feb 2026', category: 'Velocidad' },
    ],
    lockedAchievements: [
      { title: '10 Proyectos Gestionados', category: 'Gestión', progress: 65 },
    ],
    stats: { tasksCompleted: 145, totalTasks: 155, onTimeRate: 95, projectsCompleted: 6, avgRating: 4.9 },
    currentProjects: [6],
    recentActivity: [
      { action: 'Integró 12 de 14 microservicios en API Gateway', date: '09 Feb 2026', type: 'success' },
      { action: 'Preparó runbooks de operación', date: '07 Feb 2026', type: 'info' },
    ],
  },
  m25: {
    id: 'm25', name: 'Alejandro Ríos', email: 'alejandro.rios@techmahindra.com', role: 'Backend Lead', department: 'Ingeniería', avatarInitial: 'A', joinDate: '15 Ago 2023',
    achievements: [
      { title: 'Code Review Master', level: 'silver', date: '01 Oct 2025', category: 'Calidad' },
      { title: 'Sprint Champion', level: 'silver', date: '15 Ene 2026', category: 'Velocidad' },
      { title: 'Integrador', level: 'gold', date: '05 Feb 2026', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Cero Defectos', category: 'Calidad', progress: 80 },
    ],
    stats: { tasksCompleted: 92, totalTasks: 100, onTimeRate: 92, projectsCompleted: 4, avgRating: 4.7 },
    currentProjects: [6],
    recentActivity: [
      { action: 'Implementó rate limiting en API Gateway', date: '08 Feb 2026', type: 'success' },
      { action: 'Optimizó latencia de routing — 50ms menos', date: '05 Feb 2026', type: 'success' },
    ],
  },
  m26: {
    id: 'm26', name: 'Isabela Correa', email: 'isabela.correa@techmahindra.com', role: 'Platform Engineer', department: 'DevOps & Cloud', avatarInitial: 'I', joinDate: '01 Nov 2024',
    achievements: [
      { title: 'Entrega Récord', level: 'silver', date: '10 Ene 2026', category: 'Velocidad' },
      { title: 'Feedback Champion', level: 'bronze', date: '20 Dic 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Primer Proyecto Completado', category: 'Gestión', progress: 85 },
    ],
    stats: { tasksCompleted: 40, totalTasks: 46, onTimeRate: 87, projectsCompleted: 0, avgRating: 4.4 },
    currentProjects: [6],
    recentActivity: [
      { action: 'Configuró monitoreo APM para API Gateway', date: '09 Feb 2026', type: 'success' },
      { action: 'Automatizó despliegue con Terraform', date: '06 Feb 2026', type: 'info' },
    ],
  },
  m27: {
    id: 'm27', name: 'Hugo Castillo', email: 'hugo.castillo@techmahindra.com', role: 'DevOps Lead', department: 'DevOps & Cloud', avatarInitial: 'H', joinDate: '01 Jun 2024',
    achievements: [
      { title: 'Arquitecto Limpio', level: 'gold', date: '15 Nov 2025', category: 'Calidad' },
      { title: 'Sprint Champion', level: 'silver', date: '20 Dic 2025', category: 'Velocidad' },
    ],
    lockedAchievements: [
      { title: 'Integrador', category: 'Colaboración', progress: 65 },
      { title: 'Mentor del Equipo', category: 'Colaboración', progress: 40 },
    ],
    stats: { tasksCompleted: 58, totalTasks: 72, onTimeRate: 81, projectsCompleted: 2, avgRating: 4.3 },
    currentProjects: [7],
    recentActivity: [
      { action: 'Configuró Jenkins pipeline base', date: '08 Feb 2026', type: 'success' },
      { action: 'Investigando opciones de licenciamiento', date: '05 Feb 2026', type: 'neutral' },
    ],
  },
  m28: {
    id: 'm28', name: 'Daniela Vega', email: 'daniela.vega@techmahindra.com', role: 'SRE Engineer', department: 'DevOps & Cloud', avatarInitial: 'D', joinDate: '15 Sep 2024',
    achievements: [
      { title: 'Feedback Champion', level: 'bronze', date: '10 Ene 2026', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Sprint Champion', category: 'Velocidad', progress: 30 },
      { title: 'Primer Proyecto Completado', category: 'Gestión', progress: 45 },
    ],
    stats: { tasksCompleted: 28, totalTasks: 42, onTimeRate: 67, projectsCompleted: 0, avgRating: 4.0 },
    currentProjects: [7],
    recentActivity: [
      { action: 'Bloqueada — esperando manifests de Kubernetes', date: '07 Feb 2026', type: 'neutral' },
      { action: 'Completó configuración de alertas de staging', date: '03 Feb 2026', type: 'success' },
    ],
  },
  m29: {
    id: 'm29', name: 'Marcos Ruiz', email: 'marcos.ruiz@techmahindra.com', role: 'DevOps Engineer', department: 'DevOps & Cloud', avatarInitial: 'M', joinDate: '01 Oct 2024',
    achievements: [
      { title: 'Entrega Récord', level: 'silver', date: '15 Dic 2025', category: 'Velocidad' },
    ],
    lockedAchievements: [
      { title: 'Primer Proyecto Completado', category: 'Gestión', progress: 50 },
      { title: 'Cross-Team Player', category: 'Colaboración', progress: 35 },
    ],
    stats: { tasksCompleted: 30, totalTasks: 40, onTimeRate: 75, projectsCompleted: 0, avgRating: 4.1 },
    currentProjects: [7],
    recentActivity: [
      { action: 'Configuró Docker registry privado', date: '08 Feb 2026', type: 'success' },
      { action: 'Escribió Dockerfile para 3 servicios', date: '05 Feb 2026', type: 'info' },
    ],
  },
  m30: {
    id: 'm30', name: 'Paula Herrera', email: 'paula.herrera@techmahindra.com', role: 'Project Manager', department: 'Diseño', avatarInitial: 'P', joinDate: '01 Jul 2023',
    achievements: [
      { title: 'Primer Proyecto Completado', level: 'gold', date: '15 Nov 2023', category: 'Gestión' },
      { title: '5 Proyectos Gestionados', level: 'silver', date: '10 Oct 2025', category: 'Gestión' },
      { title: 'Mentor del Equipo', level: 'silver', date: '20 Dic 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Planificación Perfecta', category: 'Gestión', progress: 55 },
    ],
    stats: { tasksCompleted: 110, totalTasks: 128, onTimeRate: 86, projectsCompleted: 5, avgRating: 4.5 },
    currentProjects: [8],
    recentActivity: [
      { action: 'Revisó prototipos de wireframes v2', date: '09 Feb 2026', type: 'info' },
      { action: 'Coordinó sesión de user testing', date: '06 Feb 2026', type: 'info' },
    ],
  },
  m31: {
    id: 'm31', name: 'Gabriel Ortiz', email: 'gabriel.ortiz@techmahindra.com', role: 'UX Lead', department: 'Diseño', avatarInitial: 'G', joinDate: '15 May 2023',
    achievements: [
      { title: 'Primer Proyecto Completado', level: 'gold', date: '10 Oct 2023', category: 'Gestión' },
      { title: 'Cross-Team Player', level: 'bronze', date: '15 Nov 2025', category: 'Colaboración' },
      { title: 'Code Review Master', level: 'silver', date: '01 Ene 2026', category: 'Calidad' },
    ],
    lockedAchievements: [
      { title: 'Arquitecto Limpio', category: 'Calidad', progress: 60 },
    ],
    stats: { tasksCompleted: 82, totalTasks: 95, onTimeRate: 86, projectsCompleted: 4, avgRating: 4.5 },
    currentProjects: [8],
    recentActivity: [
      { action: 'Finalizó design system v2 tokens', date: '08 Feb 2026', type: 'success' },
      { action: 'Sesión de alineación con equipo Mobile App', date: '05 Feb 2026', type: 'info' },
    ],
  },
  m32: {
    id: 'm32', name: 'Lucía Paredes', email: 'lucia.paredes@techmahindra.com', role: 'UI Designer', department: 'Diseño', avatarInitial: 'L', joinDate: '01 Sep 2024',
    achievements: [
      { title: 'Velocista', level: 'gold', date: '20 Ene 2026', category: 'Velocidad' },
      { title: 'Feedback Champion', level: 'bronze', date: '10 Dic 2025', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Primer Proyecto Completado', category: 'Gestión', progress: 75 },
    ],
    stats: { tasksCompleted: 42, totalTasks: 50, onTimeRate: 84, projectsCompleted: 1, avgRating: 4.4 },
    currentProjects: [8],
    recentActivity: [
      { action: 'Diseñó 15 componentes del design system', date: '09 Feb 2026', type: 'success' },
      { action: 'Creó paleta de colores para modo oscuro', date: '06 Feb 2026', type: 'info' },
    ],
  },
  m33: {
    id: 'm33', name: 'Martín Acosta', email: 'martin.acosta@techmahindra.com', role: 'UX Researcher', department: 'Diseño', avatarInitial: 'M', joinDate: '15 Nov 2024',
    achievements: [
      { title: 'Feedback Champion', level: 'bronze', date: '05 Feb 2026', category: 'Colaboración' },
    ],
    lockedAchievements: [
      { title: 'Primer Proyecto Completado', category: 'Gestión', progress: 40 },
      { title: 'Mentor del Equipo', category: 'Colaboración', progress: 25 },
    ],
    stats: { tasksCompleted: 25, totalTasks: 30, onTimeRate: 83, projectsCompleted: 0, avgRating: 4.2 },
    currentProjects: [8],
    recentActivity: [
      { action: 'Completó 8 entrevistas de usuario', date: '08 Feb 2026', type: 'success' },
      { action: 'Presentó informe de benchmarking UX', date: '04 Feb 2026', type: 'info' },
    ],
  },
};

// Logged-in user mock profile (maps to auth user)
export const currentUserProfile: MemberProfile = {
  id: 'me', name: 'Usuario Actual', email: 'usuario@techmahindra.com', role: 'Project Manager', department: 'Gestión de Proyectos', avatarInitial: 'U', joinDate: '01 Ene 2023',
  achievements: [
    { title: 'Primer Proyecto Completado', level: 'gold', date: '15 Ene 2026', category: 'Gestión' },
    { title: '10 Proyectos Gestionados', level: 'gold', date: '22 Ene 2026', category: 'Gestión' },
    { title: 'Sin Retrasos en el Mes', level: 'bronze', date: '01 Feb 2026', category: 'Velocidad' },
    { title: 'Mentor del Equipo', level: 'silver', date: '10 Dic 2025', category: 'Colaboración' },
    { title: 'Sprint Champion', level: 'silver', date: '15 Nov 2025', category: 'Velocidad' },
  ],
  lockedAchievements: [
    { title: 'Planificación Perfecta', category: 'Gestión', progress: 85 },
    { title: 'Velocista', category: 'Velocidad', progress: 60 },
    { title: 'Cero Defectos', category: 'Calidad', progress: 40 },
  ],
  stats: { tasksCompleted: 164, totalTasks: 178, onTimeRate: 92, projectsCompleted: 10, avgRating: 4.7 },
  currentProjects: [1, 3, 5],
  recentActivity: [
    { action: 'Completó revisión de Mobile App', date: '20 Feb 2026', type: 'success' },
    { action: 'Creó UX Redesign', date: '18 Feb 2026', type: 'info' },
    { action: 'Actualizó perfil', date: '15 Feb 2026', type: 'neutral' },
    { action: 'Generó reporte trimestral', date: '10 Feb 2026', type: 'info' },
  ],
};

export function useTeamData() {
  const getMemberProfile = (id: string): MemberProfile | null =>
    id === 'me' ? currentUserProfile : memberProfiles[id] ?? null;

  const getProjectTeam = (projectId: number): TeamMember[] =>
    projectTeams[projectId] ?? [];

  return { projectTeams, memberProfiles, currentUserProfile, getMemberProfile, getProjectTeam };
}
