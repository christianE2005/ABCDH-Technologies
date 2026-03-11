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
