import { Bell, Lock, Database, Globe, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  return (
    <div className="px-6 pb-6 pt-2 max-w-[1400px]">
      <h1 className="text-xl font-semibold text-foreground mb-1">Configuración</h1>
      <p className="text-sm text-muted-foreground mb-6">Preferencias de la plataforma</p>

      <div className="grid gap-6">
        {/* Notifications */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Notificaciones</h2>
              <p className="text-xs text-muted-foreground">Configura cómo recibir alertas</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Alertas de proyectos en riesgo', enabled: true },
              { label: 'Resumen diario por email', enabled: true },
              { label: 'Notificaciones de comentarios', enabled: false },
              { label: 'Recordatorios de plazos', enabled: true },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-md">
                <span className="text-sm text-foreground">{item.label}</span>
                <button className={`w-9 h-5 rounded-full transition-colors ${item.enabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${item.enabled ? 'ml-4.5' : 'ml-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Seguridad</h2>
              <p className="text-xs text-muted-foreground">Contraseñas y autenticación</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { title: 'Cambiar contraseña', desc: 'Última actualización: hace 45 días' },
              { title: 'Autenticación de dos factores', desc: 'No configurada' },
              { title: 'Sesiones activas', desc: 'Ver y gestionar dispositivos' },
            ].map((item, index) => (
              <button key={index} className="w-full text-left p-3 border border-border rounded-md hover:border-primary/30 transition-colors">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Integration & Data */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Integraciones</h2>
                <p className="text-xs text-muted-foreground">Conecta servicios</p>
              </div>
            </div>

            <div className="space-y-2">
              {['Slack', 'Microsoft Teams', 'Jira', 'GitHub'].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 border border-border rounded-md">
                  <span className="text-sm text-foreground">{service}</span>
                  <button
                    onClick={() => toast.info(`Conectando con ${service}...`, { description: 'Serás redirigido al servicio' })}
                    className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-xs font-medium transition-colors"
                  >
                    Conectar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Datos</h2>
                <p className="text-xs text-muted-foreground">Exportar e importar</p>
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={() => toast.success('Exportación iniciada', { description: 'Descargando datos en formato JSON' })} className="w-full text-left p-2.5 border border-border rounded-md hover:border-primary/30 transition-colors">
                <p className="text-sm font-medium text-foreground">Exportar datos</p>
                <p className="text-xs text-muted-foreground">Descarga completa en JSON</p>
              </button>
              <button onClick={() => toast.info('Selecciona un archivo CSV o Excel')} className="w-full text-left p-2.5 border border-border rounded-md hover:border-primary/30 transition-colors">
                <p className="text-sm font-medium text-foreground">Importar proyectos</p>
                <p className="text-xs text-muted-foreground">Desde CSV o Excel</p>
              </button>
              <button onClick={() => toast.error('Acción no disponible en modo demo')} className="w-full text-left p-2.5 bg-destructive/5 border border-destructive/20 rounded-md hover:bg-destructive/10 transition-colors">
                <p className="text-sm font-medium text-destructive">Eliminar todos los datos</p>
                <p className="text-xs text-destructive/70">Acción irreversible</p>
              </button>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Email</h2>
              <p className="text-xs text-muted-foreground">Comunicaciones por correo</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Boletines y actualizaciones', enabled: true },
              { label: 'Tips y mejores prácticas', enabled: false },
              { label: 'Invitaciones a webinars', enabled: false },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-md">
                <span className="text-sm text-foreground">{item.label}</span>
                <button className={`w-9 h-5 rounded-full transition-colors ${item.enabled ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${item.enabled ? 'ml-4.5' : 'ml-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
