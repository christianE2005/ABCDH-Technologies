import { motion } from 'motion/react';
import { Bell, Lock, Database, Globe, Shield, Mail } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">Administra las preferencias de la plataforma</p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Notificaciones</h2>
              <p className="text-sm text-muted-foreground">Configura cómo quieres recibir alertas</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Alertas de proyectos en riesgo', enabled: true },
              { label: 'Resumen diario por email', enabled: true },
              { label: 'Notificaciones de nuevos comentarios', enabled: false },
              { label: 'Recordatorios de plazos', enabled: true },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <span className="text-foreground">{item.label}</span>
                <button className={`w-12 h-6 rounded-full transition-colors ${item.enabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${item.enabled ? 'ml-6' : 'ml-0.5'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Seguridad</h2>
              <p className="text-sm text-muted-foreground">Gestiona contraseñas y autenticación</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-secondary rounded-lg hover:border-primary/30 border border-border transition-all">
              <p className="font-medium text-foreground">Cambiar contraseña</p>
              <p className="text-sm text-muted-foreground">Última actualización: hace 45 días</p>
            </button>
            <button className="w-full text-left p-4 bg-secondary rounded-lg hover:border-primary/30 border border-border transition-all">
              <p className="font-medium text-foreground">Autenticación de dos factores</p>
              <p className="text-sm text-muted-foreground">No configurada</p>
            </button>
            <button className="w-full text-left p-4 bg-secondary rounded-lg hover:border-primary/30 border border-border transition-all">
              <p className="font-medium text-foreground">Sesiones activas</p>
              <p className="text-sm text-muted-foreground">Ver y gestionar dispositivos</p>
            </button>
          </div>
        </motion.div>

        {/* Integration & Data */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Integraciones</h2>
                <p className="text-sm text-muted-foreground">Conecta servicios externos</p>
              </div>
            </div>

            <div className="space-y-3">
              {['Slack', 'Microsoft Teams', 'Jira', 'GitHub'].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-foreground">{service}</span>
                  <button className="px-3 py-1 bg-primary hover:bg-[#FF4C4C] text-white rounded text-sm transition-colors">
                    Conectar
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Datos</h2>
                <p className="text-sm text-muted-foreground">Exportar e importar</p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-secondary rounded-lg hover:border-primary/30 border border-border transition-all">
                <p className="font-medium text-foreground">Exportar datos</p>
                <p className="text-xs text-muted-foreground">Descarga completa en JSON</p>
              </button>
              <button className="w-full text-left p-3 bg-secondary rounded-lg hover:border-primary/30 border border-border transition-all">
                <p className="font-medium text-foreground">Importar proyectos</p>
                <p className="text-xs text-muted-foreground">Desde CSV o Excel</p>
              </button>
              <button className="w-full text-left p-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 border border-destructive/30 transition-all">
                <p className="font-medium">Eliminar todos los datos</p>
                <p className="text-xs opacity-75">Acción irreversible</p>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Email Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Preferencias de Email</h2>
              <p className="text-sm text-muted-foreground">Gestiona comunicaciones por correo</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Boletines y actualizaciones', enabled: true },
              { label: 'Tips y mejores prácticas', enabled: false },
              { label: 'Invitaciones a webinars', enabled: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <span className="text-foreground">{item.label}</span>
                <button className={`w-12 h-6 rounded-full transition-colors ${item.enabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${item.enabled ? 'ml-6' : 'ml-0.5'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
