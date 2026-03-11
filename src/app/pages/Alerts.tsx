import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  project: string;
  projectId: number;
  date: string;
  time: string;
  isRead: boolean;
}

export default function Alerts() {
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const alerts: Alert[] = [
    {
      id: 1, type: 'critical',
      title: 'Retraso Mayor Detectado',
      description: 'Security Audit muestra un retraso de 12 días respecto al cronograma planificado. El hito "Testing y QA" está atrasado y podría impactar la fecha de entrega final. Se recomienda reasignación inmediata de recursos.',
      project: 'Security Audit - Roberto Silva', projectId: 4, date: '25 Feb 2026', time: '14:30', isRead: false
    },
    {
      id: 2, type: 'critical',
      title: 'Presupuesto al 98% de Consumo',
      description: 'Security Audit ha consumido el 98% del presupuesto asignado con solo 32% de avance completado. Existe riesgo alto de sobrecosto. Se requiere aprobación ejecutiva para extensión presupuestal.',
      project: 'Security Audit - Roberto Silva', projectId: 4, date: '25 Feb 2026', time: '10:15', isRead: false
    },
    {
      id: 3, type: 'warning',
      title: 'Desviación Presupuestal Detectada',
      description: 'Cloud Migration muestra consumo de 92% del presupuesto con 45% de avance. La proyección indica posible sobrecosto del 15% si la tendencia continúa.',
      project: 'Cloud Migration - Carlos Ramírez', projectId: 2, date: '24 Feb 2026', time: '16:45', isRead: false
    },
    {
      id: 4, type: 'warning',
      title: 'Recurso en Sobrecarga',
      description: 'Carlos Ramírez está asignado al 140% de capacidad en múltiples proyectos. Esto podría generar cuellos de botella y afectar la calidad de entregables.',
      project: 'Múltiples Proyectos', projectId: 0, date: '24 Feb 2026', time: '09:20', isRead: true
    },
    {
      id: 5, type: 'info',
      title: 'Actualización de Cronograma',
      description: 'Mobile App ha completado el hito "Desarrollo Fase 2" con 3 días de anticipación. El cronograma ha sido ajustado automáticamente.',
      project: 'Mobile App - Ana Martínez', projectId: 3, date: '23 Feb 2026', time: '11:00', isRead: true
    },
    {
      id: 6, type: 'info',
      title: 'Nuevo Miembro Asignado',
      description: 'Laura Torres ha sido agregada al equipo de Data Analytics con rol de Data Scientist. Asignación efectiva a partir del 26 de febrero.',
      project: 'Data Analytics - Laura Torres', projectId: 5, date: '23 Feb 2026', time: '08:30', isRead: true
    },
    {
      id: 7, type: 'warning',
      title: 'Riesgo de Dependencia',
      description: 'ERP Modernization tiene dependencia crítica con entregables de Cloud Migration. El retraso del proyecto dependiente podría impactar cronograma.',
      project: 'ERP Modernization - María González', projectId: 1, date: '22 Feb 2026', time: '15:10', isRead: true
    },
  ];

  const filteredAlerts = filterType === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filterType);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getAlertClasses = (type: string) => {
    switch (type) {
      case 'critical': return { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' };
      case 'warning': return { dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning/10' };
      default: return { dot: 'bg-info', text: 'text-info', bg: 'bg-info/10' };
    }
  };

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const infoCount = alerts.filter(a => a.type === 'info').length;

  const filters = [
    { key: 'all', label: 'Todas', count: alerts.length },
    { key: 'critical', label: 'Críticas', count: criticalCount },
    { key: 'warning', label: 'Advertencias', count: warningCount },
    { key: 'info', label: 'Info', count: infoCount },
  ];

  return (
    <div className="px-6 pb-6 pt-2 max-w-[1400px]">
      <h1 className="text-xl font-semibold text-foreground mb-1">Alertas</h1>
      <p className="text-sm text-muted-foreground mb-6">Monitoreo de eventos y notificaciones</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Críticas', count: criticalCount, cls: 'text-destructive' },
          { label: 'Advertencias', count: warningCount, cls: 'text-warning' },
          { label: 'Informativas', count: infoCount, cls: 'text-info' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08, ease: 'easeOut' }}
            className="bg-card border border-border rounded-lg p-4"
          >
            <p className={`text-2xl font-semibold ${s.cls}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center border border-border rounded-md w-fit mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-border last:border-r-0 ${
              filterType === f.key
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-2">
        {filteredAlerts.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Sin alertas"
            description="No hay alertas que coincidan con el filtro seleccionado"
            action={{ label: 'Ver todas', onClick: () => setFilterType('all') }}
          />
        ) : filteredAlerts.map((alert, i) => {
          const cls = getAlertClasses(alert.type);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: 'easeOut' }}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${cls.bg} ${cls.text}`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground truncate">{alert.title}</h3>
                    {!alert.isRead && <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{alert.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {alert.date} · {alert.time}
                    </span>
                    {alert.projectId > 0 && (
                      <Link
                        to={`/projects/${alert.projectId}`}
                        className="text-primary hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {alert.project}
                      </Link>
                    )}
                    {alert.projectId === 0 && (
                      <span className="font-medium text-foreground">{alert.project}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${getAlertClasses(selectedAlert.type).bg} ${getAlertClasses(selectedAlert.type).text}`}>
                  {getAlertIcon(selectedAlert.type)}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-1">{selectedAlert.title}</h2>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedAlert.date} · {selectedAlert.time}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-foreground mb-1">Descripción</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedAlert.description}</p>
            </div>

            <div className="mb-5 p-3 bg-secondary rounded-md">
              <p className="text-xs font-medium text-foreground mb-0.5">Proyecto</p>
              <p className="text-sm text-muted-foreground">{selectedAlert.project}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cerrar
              </button>
              {selectedAlert.projectId > 0 && (
                <Link
                  to={`/projects/${selectedAlert.projectId}`}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-medium transition-colors text-center"
                >
                  Ver Proyecto
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
