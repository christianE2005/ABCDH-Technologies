import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info,
  CheckCircle,
  Filter,
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

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
      id: 1,
      type: 'critical',
      title: 'Alerta Crítica: Retraso Mayor Detectado',
      description: 'El Proyecto Delta muestra un retraso de 12 días respecto al cronograma planificado. El hito "Testing y QA" está atrasado y podría impactar la fecha de entrega final. Se recomienda reasignación inmediata de recursos.',
      project: 'Proyecto Delta - Security Audit',
      projectId: 4,
      date: '25 Feb 2026',
      time: '14:30',
      isRead: false
    },
    {
      id: 2,
      type: 'critical',
      title: 'Presupuesto al 98% de Consumo',
      description: 'El Proyecto Delta ha consumido el 98% del presupuesto asignado con solo 32% de avance completado. Existe riesgo alto de sobrecosto. Se requiere aprobación ejecutiva para extensión presupuestal.',
      project: 'Proyecto Delta - Security Audit',
      projectId: 4,
      date: '25 Feb 2026',
      time: '10:15',
      isRead: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Desviación Presupuestal Detectada',
      description: 'El Proyecto Beta muestra consumo de 92% del presupuesto con 45% de avance. La proyección indica posible sobrecosto del 15% si la tendencia continúa. Se recomienda revisión de asignaciones.',
      project: 'Proyecto Beta - Cloud Migration',
      projectId: 2,
      date: '24 Feb 2026',
      time: '16:45',
      isRead: false
    },
    {
      id: 4,
      type: 'warning',
      title: 'Recurso en Sobrecarga',
      description: 'Carlos Tech Lead está asignado al 140% de capacidad en múltiples proyectos. Esto podría generar cuellos de botella y afectar la calidad de entregables.',
      project: 'Múltiples Proyectos',
      projectId: 0,
      date: '24 Feb 2026',
      time: '09:20',
      isRead: true
    },
    {
      id: 5,
      type: 'info',
      title: 'Actualización de Cronograma',
      description: 'El Proyecto Gamma ha completado el hito "Desarrollo Fase 2" con 3 días de anticipación. El cronograma ha sido ajustado automáticamente.',
      project: 'Proyecto Gamma - Mobile App',
      projectId: 3,
      date: '23 Feb 2026',
      time: '11:00',
      isRead: true
    },
    {
      id: 6,
      type: 'info',
      title: 'Nuevo Miembro Asignado',
      description: 'Laura Analytics ha sido agregada al equipo del Proyecto Epsilon con rol de Data Scientist. Asignación efectiva a partir del 26 de febrero.',
      project: 'Proyecto Epsilon - Data Analytics',
      projectId: 5,
      date: '23 Feb 2026',
      time: '08:30',
      isRead: true
    },
    {
      id: 7,
      type: 'warning',
      title: 'Riesgo de Dependencia',
      description: 'El Proyecto Alpha tiene dependencia crítica con entregables del Proyecto Beta. El retraso del proyecto dependiente podría impactar cronograma.',
      project: 'Proyecto Alpha - ERP Modernization',
      projectId: 1,
      date: '22 Feb 2026',
      time: '15:10',
      isRead: true
    },
  ];

  const filteredAlerts = filterType === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filterType);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-6 h-6" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-danger/10',
          border: 'border-danger/30',
          text: 'text-danger',
          icon: 'bg-danger/20'
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          text: 'text-warning',
          icon: 'bg-warning/20'
        };
      default:
        return {
          bg: 'bg-info/10',
          border: 'border-info/30',
          text: 'text-info',
          icon: 'bg-info/20'
        };
    }
  };

  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;
  const infoCount = alerts.filter(a => a.type === 'info').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Alertas del Sistema</h1>
        <p className="text-text-secondary">Monitoreo de eventos y notificaciones importantes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-danger/20 to-danger/5 border border-danger/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-danger/20 rounded-lg flex items-center justify-center text-danger">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{criticalCount}</p>
              <p className="text-sm text-text-secondary">Alertas Críticas</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center text-warning">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{warningCount}</p>
              <p className="text-sm text-text-secondary">Advertencias</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-info/20 to-info/5 border border-info/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center text-info">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{infoCount}</p>
              <p className="text-sm text-text-secondary">Informativas</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-card-border rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:text-foreground'
              }`}
            >
              Todas ({alerts.length})
            </button>
            <button
              onClick={() => setFilterType('critical')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'critical'
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:text-foreground'
              }`}
            >
              Críticas ({criticalCount})
            </button>
            <button
              onClick={() => setFilterType('warning')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'warning'
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:text-foreground'
              }`}
            >
              Advertencias ({warningCount})
            </button>
            <button
              onClick={() => setFilterType('info')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'info'
                  ? 'bg-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:text-foreground'
              }`}
            >
              Info ({infoCount})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert, index) => {
          const colors = getAlertColor(alert.type);
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-card border ${colors.border} rounded-xl p-6 hover:border-primary/30 transition-all cursor-pointer ${
                !alert.isRead ? 'border-l-4' : ''
              }`}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.icon} ${colors.text}`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground">{alert.title}</h3>
                        {!alert.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">{alert.description}</p>
                    </div>
                    <button className="text-primary hover:text-primary-hover ml-4 flex-shrink-0">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {alert.date} • {alert.time}
                    </span>
                    {alert.projectId > 0 && (
                      <Link
                        to={`/projects/${alert.projectId}`}
                        className="text-primary hover:text-primary-hover font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {alert.project}
                      </Link>
                    )}
                    {alert.projectId === 0 && (
                      <span className="text-foreground font-medium">{alert.project}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-card-border rounded-xl p-8 max-w-2xl w-full"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${getAlertColor(selectedAlert.type).icon} ${getAlertColor(selectedAlert.type).text}`}>
                  {getAlertIcon(selectedAlert.type)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{selectedAlert.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedAlert.date} • {selectedAlert.time}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-text-secondary hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-foreground mb-2">Descripción Detallada</h3>
              <p className="text-text-secondary leading-relaxed">{selectedAlert.description}</p>
            </div>

            <div className="mb-6 p-4 bg-background-secondary rounded-lg">
              <h3 className="text-sm font-bold text-foreground mb-2">Proyecto Relacionado</h3>
              <p className="text-foreground font-medium">{selectedAlert.project}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedAlert(null)}
                className="flex-1 px-6 py-3 bg-background-secondary hover:bg-sidebar-hover text-foreground rounded-lg font-medium transition-all"
              >
                Cerrar
              </button>
              {selectedAlert.projectId > 0 && (
                <Link
                  to={`/projects/${selectedAlert.projectId}`}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all text-center"
                >
                  Ver Proyecto
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
