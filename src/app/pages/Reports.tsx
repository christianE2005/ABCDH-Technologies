import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download,
  Calendar,
  Filter,
  FileBarChart
} from 'lucide-react';

export default function Reports() {
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const projects = [
    { id: 'all', name: 'Todos los proyectos' },
    { id: '1', name: 'Proyecto Alpha - ERP Modernization' },
    { id: '2', name: 'Proyecto Beta - Cloud Migration' },
    { id: '3', name: 'Proyecto Gamma - Mobile App' },
    { id: '4', name: 'Proyecto Delta - Security Audit' },
    { id: '5', name: 'Proyecto Epsilon - Data Analytics' },
  ];

  const reportHistory = [
    {
      id: 1,
      name: 'Reporte Ejecutivo Q1 2026',
      project: 'Todos los proyectos',
      format: 'PDF',
      date: '20 Feb 2026',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Análisis de Presupuesto - Proyecto Alpha',
      project: 'Proyecto Alpha',
      format: 'Excel',
      date: '18 Feb 2026',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'Dashboard de KPIs - Todos',
      project: 'Todos los proyectos',
      format: 'PDF',
      date: '15 Feb 2026',
      size: '3.1 MB'
    },
    {
      id: 4,
      name: 'Reporte de Avance - Proyecto Beta',
      project: 'Proyecto Beta',
      format: 'PDF',
      date: '12 Feb 2026',
      size: '1.2 MB'
    },
  ];

  const reportTemplates = [
    {
      id: 1,
      name: 'Reporte Ejecutivo Completo',
      description: 'Vista general de todos los proyectos con KPIs principales, estado y riesgos',
      icon: <FileBarChart className="w-6 h-6" />,
    },
    {
      id: 2,
      name: 'Análisis de Presupuesto',
      description: 'Desglose detallado de gastos, proyecciones y desviaciones presupuestales',
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: 3,
      name: 'Reporte de Avance',
      description: 'Timeline de hitos, progreso actual y proyección de entrega',
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: 4,
      name: 'Dashboard de Riesgos',
      description: 'Identificación y análisis de riesgos activos con nivel de severidad',
      icon: <FileText className="w-6 h-6" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reportes</h1>
        <p className="text-text-secondary">Genera y descarga reportes personalizados de tus proyectos</p>
      </div>

      {/* Generate Report Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-card-border rounded-xl p-8"
      >
        <h2 className="text-xl font-bold text-foreground mb-6">Generar Nuevo Reporte</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Seleccionar Proyecto
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-background-secondary border border-input-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Formato de Exportación
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFormat('pdf')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedFormat === 'pdf'
                    ? 'bg-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:text-foreground'
                }`}
              >
                PDF
              </button>
              <button
                onClick={() => setSelectedFormat('excel')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedFormat === 'excel'
                    ? 'bg-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:text-foreground'
                }`}
              >
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Report Templates */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Plantillas Disponibles</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-background-secondary border border-card-border rounded-lg p-4 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">{template.name}</h4>
                    <p className="text-xs text-text-secondary">{template.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full px-6 py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Generar y Descargar Reporte
        </button>
      </motion.div>

      {/* Report History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-card-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Historial de Reportes</h2>
          <button className="text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1 transition-colors">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Nombre del Reporte</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Proyecto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Formato</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Tamaño</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Acción</th>
              </tr>
            </thead>
            <tbody>
              {reportHistory.map((report) => (
                <tr key={report.id} className="border-b border-card-border hover:bg-sidebar-hover transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-medium text-foreground">{report.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-text-secondary">{report.project}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
                      {report.format}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-secondary">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {report.date}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-text-secondary">{report.size}</td>
                  <td className="py-4 px-4">
                    <button className="text-primary hover:text-primary-hover font-medium transition-colors flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
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
