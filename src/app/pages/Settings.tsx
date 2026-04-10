import { useState, useEffect } from 'react';
import { Bell, Lock, Database, Globe, Mail, Send, Github, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { CommandBar } from '../components/CommandBar';
import { githubService } from '../../services/github.service';
import { useAuth } from '../context/AuthContext';

interface ToggleItem {
  label: string;
  description?: string;
  enabled: boolean;
}

function ToggleRow({ item, onChange }: { item: ToggleItem; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div>
        <p className="text-[12px] text-foreground">{item.label}</p>
        {item.description && <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>}
      </div>
      <button
        onClick={() => onChange(!item.enabled)}
        role="switch"
        aria-checked={item.enabled}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${item.enabled ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-border">
      <div className="w-6 h-6 bg-primary/10 rounded-[3px] flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-[12px] font-semibold text-foreground">{title}</h2>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [notifToggles, setNotifToggles] = useState<ToggleItem[]>(() => {
    try {
      const saved = localStorage.getItem('pip_settings');
      if (saved) return JSON.parse(saved).notifToggles;
    } catch { /* ignore */ }
    return [
      { label: 'Alertas de proyectos en riesgo', description: 'Notificacion cuando un proyecto cambia a estado de riesgo', enabled: true },
      { label: 'Resumen diario por email', description: 'Reporte diario a las 8:00 AM', enabled: true },
      { label: 'Notificaciones de comentarios', description: 'Cuando alguien comenta en tus proyectos', enabled: false },
      { label: 'Recordatorios de plazos', description: '3 dias antes del deadline', enabled: true },
    ];
  });

  const [emailToggles, setEmailToggles] = useState<ToggleItem[]>(() => {
    try {
      const saved = localStorage.getItem('pip_settings');
      if (saved) return JSON.parse(saved).emailToggles;
    } catch { /* ignore */ }
    return [
      { label: 'Boletines y actualizaciones', enabled: true },
      { label: 'Tips y mejores practicas', enabled: false },
      { label: 'Invitaciones a webinars', enabled: false },
    ];
  });

  const [testEmail, setTestEmail] = useState('');
  const [saved, setSaved] = useState(false);

  // ─── GitHub state ─────────────────────────────────────────────────────────
  const [githubConnected, setGithubConnected] = useState(() =>
    localStorage.getItem('pip_github_connected') === 'true',
  );
  const [githubLoading, setGithubLoading] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [repoForm, setRepoForm] = useState({
    owner: '',
    name: '',
    description: '',
    private: true,
    auto_init: true,
  });
  const [repoLoading, setRepoLoading] = useState(false);

  // Detect redirect back from GitHub OAuth callback (?github=connected)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('github') === 'connected') {
      localStorage.setItem('pip_github_connected', 'true');
      setGithubConnected(true);
      toast.success('GitHub conectado correctamente');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleConnectGitHub = async () => {
    setGithubLoading(true);
    try {
      await githubService.startOAuth();
    } catch {
      toast.error('No se pudo iniciar la conexión con GitHub');
      setGithubLoading(false);
    }
  };

  const handleCreateRepo = async () => {
    if (!repoForm.owner.trim() || !repoForm.name.trim()) {
      toast.error('El owner y el nombre del repositorio son obligatorios');
      return;
    }
    if (!user) { toast.error('No hay sesión activa'); return; }
    setRepoLoading(true);
    try {
      const repo = await githubService.createRepo({
        user_id: Number(user.id),
        owner_type: 'org',
        owner: repoForm.owner.trim(),
        name: repoForm.name.trim(),
        description: repoForm.description.trim() || undefined,
        private: repoForm.private,
        auto_init: repoForm.auto_init,
      });
      toast.success('Repositorio creado', { description: repo.repository.full_name });
      setShowRepoModal(false);
      setRepoForm({ owner: '', name: '', description: '', private: true, auto_init: true });
    } catch {
      toast.error('Error al crear el repositorio');
    } finally {
      setRepoLoading(false);
    }
  };


  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const updateNotif = (i: number, v: boolean) =>
    setNotifToggles(prev => prev.map((t, idx) => idx === i ? { ...t, enabled: v } : t));

  const updateEmail = (i: number, v: boolean) =>
    setEmailToggles(prev => prev.map((t, idx) => idx === i ? { ...t, enabled: v } : t));

  const handleSendTest = () => {
    if (!testEmail) { toast.error('Ingresa un correo electronico'); return; }
    toast.success('Correo de prueba enviado', { description: `Email enviado a ${testEmail}` });
  };

  return (
    <div className="px-4 pb-6 pt-3 space-y-3 max-w-[1600px]">
      <CommandBar
        actions={[
          {
            label: saved ? 'Guardado ✓' : 'Guardar cambios',
            variant: 'primary',
            onClick: () => {
              localStorage.setItem('pip_settings', JSON.stringify({ notifToggles, emailToggles }));
              setSaved(true);
              toast.success('Configuración guardada');
            },
          },
        ]}
      />

      <div className="grid gap-3">
        {/* Notifications (HU-14) */}
        <div className="bg-card border border-border rounded-[4px] p-4">
          <SectionHeader
            icon={<Bell className="w-3.5 h-3.5" />}
            title="Notificaciones"
            description="Configura como recibir alertas del sistema"
          />
          {notifToggles.map((item, i) => (
            <ToggleRow key={i} item={item} onChange={(v) => updateNotif(i, v)} />
          ))}
        </div>

        {/* Email notifications with test (HU-14) */}
        <div className="bg-card border border-border rounded-[4px] p-4">
          <SectionHeader
            icon={<Mail className="w-3.5 h-3.5" />}
            title="Notificaciones por Email"
            description="Comunicaciones por correo electronico"
          />
          {emailToggles.map((item, i) => (
            <ToggleRow key={i} item={item} onChange={(v) => updateEmail(i, v)} />
          ))}

          <div className="mt-3 pt-2.5 border-t border-border">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] mb-2">Enviar correo de prueba</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="tu@correo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <button
                onClick={handleSendTest}
                className="h-7 px-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3 h-3" />
                Enviar prueba
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Endpoint: <code className="text-muted-foreground font-mono">POST /api/notifications/test-email</code>
            </p>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-[4px] p-4">
          <SectionHeader
            icon={<Lock className="w-3.5 h-3.5" />}
            title="Seguridad"
            description="Contrasenas y autenticacion"
          />
          <div className="space-y-1">
            {[
              { title: 'Cambiar contrasena', desc: 'Ultima actualizacion: hace 45 dias' },
              { title: 'Autenticacion de dos factores', desc: 'No configurada' },
              { title: 'Sesiones activas', desc: 'Ver y gestionar dispositivos' },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => toast.info(item.title)}
                className="w-full text-left py-2 px-3 border border-border rounded-[4px] hover:border-primary/40 hover:bg-accent/30 transition-colors"
              >
                <p className="text-[12px] font-medium text-foreground">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {/* Integrations */}
          <div className="bg-card border border-border rounded-[4px] p-4">
            <SectionHeader
              icon={<Globe className="w-3.5 h-3.5" />}
              title="Integraciones"
              description="Conecta servicios externos"
            />
            <div className="space-y-1">
              {['Slack', 'Microsoft Teams', 'Jira'].map((service, index) => (
                <div key={index} className="flex items-center justify-between py-1.5 px-3 border border-border rounded-[4px]">
                  <span className="text-[12px] text-foreground">{service}</span>
                  <button
                    onClick={() => toast.info(`Conectando con ${service}...`)}
                    className="px-2.5 py-0.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors"
                  >
                    Conectar
                  </button>
                </div>
              ))}

              {/* GitHub */}
              <div className="flex items-center justify-between py-1.5 px-3 border border-border rounded-[4px]">
                <div className="flex items-center gap-2">
                  <Github className="w-3.5 h-3.5 text-foreground" />
                  <span className="text-[12px] text-foreground">GitHub</span>
                  {githubConnected && (
                    <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Conectado
                    </span>
                  )}
                </div>
                {githubConnected ? (
                  <button
                    onClick={() => {
                      githubService.disconnect();
                      setGithubConnected(false);
                      toast.success('GitHub desconectado');
                    }}
                    className="px-2.5 py-0.5 border border-destructive/60 text-destructive hover:bg-destructive/10 rounded-[3px] text-[11px] font-medium transition-colors"
                  >
                    Desconectar
                  </button>
                ) : (
                  <button
                    onClick={handleConnectGitHub}
                    disabled={githubLoading}
                    className="px-2.5 py-0.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors disabled:opacity-60"
                  >
                    {githubLoading ? 'Redirigiendo...' : 'Conectar'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Create Repo Modal */}
          {showRepoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card border border-border rounded-[6px] p-5 w-full max-w-sm shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-foreground" />
                    <h3 className="text-[13px] font-semibold text-foreground">Crear repositorio en GitHub</h3>
                  </div>
                  <button onClick={() => setShowRepoModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Organización (owner) *</label>
                    <input
                      type="text"
                      placeholder="nombre-org"
                      value={repoForm.owner}
                      onChange={(e) => setRepoForm(f => ({ ...f, owner: e.target.value }))}
                      className="mt-1 w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Nombre del repositorio *</label>
                    <input
                      type="text"
                      placeholder="mi-repo"
                      value={repoForm.name}
                      onChange={(e) => setRepoForm(f => ({ ...f, name: e.target.value }))}
                      className="mt-1 w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Descripción</label>
                    <input
                      type="text"
                      placeholder="Descripción opcional"
                      value={repoForm.description}
                      onChange={(e) => setRepoForm(f => ({ ...f, description: e.target.value }))}
                      className="mt-1 w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={repoForm.private}
                        onChange={(e) => setRepoForm(f => ({ ...f, private: e.target.checked }))}
                        className="w-3.5 h-3.5 accent-primary"
                      />
                      <span className="text-[11px] text-foreground">Privado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={repoForm.auto_init}
                        onChange={(e) => setRepoForm(f => ({ ...f, auto_init: e.target.checked }))}
                        className="w-3.5 h-3.5 accent-primary"
                      />
                      <span className="text-[11px] text-foreground">Auto-init (README)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowRepoModal(false)}
                    className="px-3 py-1.5 border border-border rounded-[3px] text-[11px] text-foreground hover:bg-accent/30 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateRepo}
                    disabled={repoLoading}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors disabled:opacity-60"
                  >
                    {repoLoading ? 'Creando...' : 'Crear repositorio'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data */}
          <div className="bg-card border border-border rounded-[4px] p-4">
            <SectionHeader
              icon={<Database className="w-3.5 h-3.5" />}
              title="Datos"
              description="Exportar e importar informacion"
            />
            <div className="space-y-1">
              <button
                onClick={() => toast.success('Exportacion iniciada', { description: 'Descargando datos en JSON' })}
                className="w-full text-left py-2 px-3 border border-border rounded-[4px] hover:border-primary/40 transition-colors"
              >
                <p className="text-[12px] font-medium text-foreground">Exportar datos</p>
                <p className="text-[10px] text-muted-foreground">Descarga completa en JSON</p>
              </button>
              <button
                onClick={() => toast.info('Selecciona un archivo CSV o Excel')}
                className="w-full text-left py-2 px-3 border border-border rounded-[4px] hover:border-primary/40 transition-colors"
              >
                <p className="text-[12px] font-medium text-foreground">Importar proyectos</p>
                <p className="text-[10px] text-muted-foreground">Desde CSV o Excel</p>
              </button>
              <button
                onClick={() => toast.error('Accion no disponible en modo demo')}
                className="w-full text-left py-2 px-3 bg-destructive/5 border border-destructive/20 rounded-[4px] hover:bg-destructive/10 transition-colors"
              >
                <p className="text-[12px] font-medium text-destructive">Eliminar todos los datos</p>
                <p className="text-[10px] text-destructive/70">Accion irreversible</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
