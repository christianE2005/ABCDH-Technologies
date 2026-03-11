import { useState } from 'react';
import { 
  FileText, 
  Download,
  Calendar,
  Filter,
  FileBarChart
} from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const projects = [
    { id: 'all', name: 'Todos los proyectos' },
    { id: '1', name: 'ERP Modernization' },
    { id: '2', name: 'Cloud Migration' },
    { id: '3', name: 'Mobile App' },
    { id: '4', name: 'Security Audit' },
    { id: '5', name: 'Data Analytics' },
    { id: '6', name: 'API Gateway' },
    { id: '7', name: 'DevOps Pipeline' },
    { id: '8', name: 'UX Redesign' },
  ];

  const reportHistory = [
    { id: 1, name: 'Reporte Ejecutivo Q1 2026', project: 'Todos los proyectos', format: 'PDF', date: '20 Feb 2026', size: '2.4 MB' },
    { id: 2, name: 'Análisis de Presupuesto - ERP', project: 'ERP Modernization', format: 'Excel', date: '18 Feb 2026', size: '1.8 MB' },
    { id: 3, name: 'Dashboard de KPIs - Todos', project: 'Todos los proyectos', format: 'PDF', date: '15 Feb 2026', size: '3.1 MB' },
    { id: 4, name: 'Reporte de Avance - Cloud', project: 'Cloud Migration', format: 'PDF', date: '12 Feb 2026', size: '1.2 MB' },
  ];

  const reportTemplates = [
    { id: 1, name: 'Reporte Ejecutivo', description: 'Vista general con KPIs, estado y riesgos', icon: <FileBarChart className="w-4 h-4" /> },
    { id: 2, name: 'Análisis de Presupuesto', description: 'Gastos, proyecciones y desviaciones', icon: <FileText className="w-4 h-4" /> },
    { id: 3, name: 'Reporte de Avance', description: 'Timeline de hitos y progreso actual', icon: <FileText className="w-4 h-4" /> },
    { id: 4, name: 'Dashboard de Riesgos', description: 'Riesgos activos con severidad', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="px-6 pb-6 pt-2 max-w-[1400px]">
      <h1 className="text-xl font-semibold text-foreground mb-1">Reportes</h1>
      <p className="text-sm text-muted-foreground mb-6">Genera y descarga reportes de tus proyectos</p>

      {/* Generate Report */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Generar Nuevo Reporte</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Proyecto</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Formato</label>
            <div className="flex border border-border rounded-md">
              {['pdf', 'excel'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFormat(f)}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    selectedFormat === f
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates */}
        <p className="text-xs font-medium text-foreground mb-2 uppercase tracking-wide">Plantillas</p>
        <div className="grid md:grid-cols-2 gap-3 mb-5">
          {reportTemplates.map((t) => (
            <div
              key={t.id}
              className="border border-border rounded-md p-3 hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
                  {t.icon}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => toast.success('Reporte generado exitosamente', { description: `Formato: ${selectedFormat.toUpperCase()}` })}
          className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Generar y Descargar
        </button>
      </div>

      {/* Report History */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Historial</h2>
          <button className="text-primary text-xs font-medium flex items-center gap-1 hover:underline">
            <Filter className="w-3 h-3" />
            Filtrar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Reporte</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Proyecto</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Formato</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Fecha</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Tamaño</th>
                <th className="text-left py-2 px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody>
              {reportHistory.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground">{r.project}</td>
                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-medium">{r.format}</span>
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {r.date}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-muted-foreground">{r.size}</td>
                  <td className="py-3 px-3">
                    <button onClick={() => toast.success('Descarga iniciada')} className="text-primary hover:underline text-xs font-medium flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
