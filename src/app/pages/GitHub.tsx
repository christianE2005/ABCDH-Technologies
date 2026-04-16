import { useState, useEffect } from 'react';
import { Github, Plus, ExternalLink, Lock, Unlock, X, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { CommandBar } from '../components/CommandBar';
import { githubService } from '../../services/github.service';
import { ApiRequestError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import type { GitHubRepo } from '../../services/types';

const ORG_OWNER = 'ABCDH-Technologies';

type GitHubPageState = 'not_connected' | 'connected';

interface CreateRepoForm {
  name: string;
  description: string;
  private: boolean;
  auto_init: boolean;
}

export default function GitHub() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [pageState, setPageState] = useState<GitHubPageState>('not_connected');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [isAdmin] = useState(() => githubService.isAdmin());

  // Repos (cached per user in localStorage)
  const [repos, setRepos] = useState<GitHubRepo[]>(
    () => (userId ? githubService.getRepos(userId) : []),
  );

  const persistRepos = (list: GitHubRepo[]) => {
    if (!userId) return;
    githubService.persistRepos(userId, list);
    setRepos(list);
  };

  // On mount: handle OAuth callback OR check connection status
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    // Flow 1 step 4: GitHub redirected back with ?github=connected&code=...&state=...
    if (params.get('github') === 'connected' && code && state) {
      window.history.replaceState({}, '', window.location.pathname);
      setBusy(true);

      githubService.completeOAuth({ code, state })
        .then((res) => {
          setGithubLogin(res.github_login);
          setPageState('connected');
          toast.success('Cuenta de GitHub conectada', {
            description: `Conectado como ${res.github_login} en ${ORG_OWNER}`,
          });
        })
        .catch((err) => {
          const detail = err instanceof Error ? err.message : 'Error desconocido';
          toast.error('Error al completar la conexion con GitHub', { description: detail });
          setPageState('not_connected');
        })
        .finally(() => { setBusy(false); setLoading(false); });
      return;
    }

    // Fallback: callback without code
    if (params.get('github') === 'connected') {
      window.history.replaceState({}, '', window.location.pathname);
      toast.error('Falto el codigo de autorizacion. Intenta de nuevo.');
    }

    // Flow 3: verify connection status with backend
    githubService.checkConnectionStatus()
      .then((status) => {
        if (status.connected) {
          setPageState('connected');
          setGithubLogin(status.github_login);
        } else if (status.reason === 'token_expired') {
          toast.info('Tu conexion con GitHub expiro. Vuelve a conectar.');
        }
      })
      .catch(() => {
        // Endpoint may not exist yet (404) — silently stay on not_connected
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Flow 1: start OAuth connection (all users)
  const handleConnect = async () => {
    setBusy(true);
    try {
      await githubService.startOAuth();
    } catch {
      toast.error('No se pudo iniciar la conexion con GitHub');
      setBusy(false);
    }
  };

  // Flow 2: install GitHub App on org (admin only)
  const handleInstallApp = async () => {
    setBusy(true);
    try {
      await githubService.startAppInstall();
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Error desconocido';
      toast.error('No se pudo iniciar la instalacion', { description: detail });
      setBusy(false);
    }
  };

  const handleDisconnect = () => {
    if (!userId) return;
    githubService.clearRepos(userId);
    setRepos([]);
    setGithubLogin(null);
    setPageState('not_connected');
    toast.info('Sesion de GitHub desconectada');
  };

  // Create repo modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateRepoForm>({
    name: '',
    description: '',
    private: true,
    auto_init: true,
  });
  const [creating, setCreating] = useState(false);

  const resetForm = () =>
    setForm({ name: '', description: '', private: true, auto_init: true });

  const handleCreateRepo = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre del repositorio es obligatorio');
      return;
    }
    if (!userId) {
      toast.error('No hay sesion activa');
      return;
    }

    setCreating(true);
    try {
      const result = await githubService.createRepo({
        user_id: Number(userId),
        owner_type: 'org',
        owner: ORG_OWNER,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        private: form.private,
        auto_init: form.auto_init,
      });

      const newRepo = result.repository;
      persistRepos([newRepo, ...repos]);

      toast.success('Repositorio creado', {
        description: (
          <a
            href={newRepo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {newRepo.full_name}
          </a>
        ),
      });
      setShowModal(false);
      resetForm();
    } catch (err) {
      // Only treat 401 as expired connection; other errors are repo-level problems
      if (err instanceof ApiRequestError && err.status === 401) {
        handleDisconnect();
        toast.error('Tu conexion de GitHub expiro', {
          description: 'Vuelve a conectar tu cuenta para continuar',
        });
      } else {
        let detail = 'Error desconocido';
        if (err instanceof ApiRequestError) {
          const body = err.body as Record<string, unknown>;
          detail = body.detail
            ? String(body.detail)
            : Object.entries(body)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                .join(' | ') || `HTTP ${err.status}`;
        } else if (err instanceof Error) {
          detail = err.message;
        }
        toast.error('Error al crear el repositorio', { description: detail });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveFromList = (repoId: number) => {
    persistRepos(repos.filter((r) => r.id_repo !== repoId));
  };

  // --- Loading: verifying connection status ---
  if (loading) {
    return (
      <div className="px-4 pb-6 pt-3 max-w-[1600px]">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] text-muted-foreground">Verificando conexion con GitHub...</p>
        </div>
      </div>
    );
  }

  // --- Not connected ---
  if (pageState === 'not_connected') {
    return (
      <div className="px-4 pb-6 pt-3 max-w-[1600px]">
        <CommandBar actions={[]} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-16 h-16 bg-card border border-border rounded-full flex items-center justify-center">
            <Github className="w-8 h-8 text-muted-foreground" />
          </div>

          <div className="text-center">
            <h2 className="text-[15px] font-semibold text-foreground mb-1">
              Conecta tu cuenta de GitHub
            </h2>
            <p className="text-[12px] text-muted-foreground max-w-sm">
              Vincula tu cuenta de GitHub para crear repositorios, gestionar
              webhooks y conectar proyectos con tu codigo en{' '}
              <span className="font-mono text-foreground">{ORG_OWNER}</span>.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleConnect}
              disabled={busy}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#24292e] hover:bg-[#1b1f23] text-white rounded-[4px] text-[13px] font-medium transition-colors disabled:opacity-60"
            >
              <Github className="w-4 h-4" />
              {busy ? 'Redirigiendo a GitHub...' : 'Conectar con GitHub'}
            </button>

            {isAdmin && (
              <button
                onClick={handleInstallApp}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-accent/30 text-foreground rounded-[4px] text-[12px] font-medium transition-colors disabled:opacity-60"
              >
                <Shield className="w-3.5 h-3.5" />
                Instalar App en organizacion
              </button>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground">
            Organizacion: <span className="font-mono text-foreground">{ORG_OWNER}</span>
          </p>
        </div>
      </div>
    );
  }

  // --- Connected ---
  return (
    <div className="px-4 pb-6 pt-3 space-y-3 max-w-[1600px]">
      <CommandBar
        actions={[
          {
            label: 'Nuevo repositorio',
            variant: 'primary',
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => setShowModal(true),
          },
        ]}
      />

      {/* Header card */}
      <div className="bg-card border border-border rounded-[4px] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#24292e] rounded-full flex items-center justify-center">
            <Github className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">GitHub conectado</p>
            <p className="text-[11px] text-muted-foreground">
              {'Organizacion: '}
              <span className="font-mono text-foreground">{ORG_OWNER}</span>
              {githubLogin && (
                <>
                  {' · '}
                  <span className="font-mono text-foreground">{githubLogin}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
        >
          Desconectar
        </button>
      </div>

      {/* Repos section */}
      <div className="bg-card border border-border rounded-[4px] p-4">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border">
          <h2 className="text-[12px] font-semibold text-foreground">Repositorios creados</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            Crear repo
          </button>
        </div>

        {repos.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2 text-center">
            <Github className="w-6 h-6 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground">No has creado repositorios aun.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-[11px] text-primary hover:underline mt-1"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {repos.map((repo) => (
              <div
                key={repo.id_repo}
                className="flex items-center justify-between py-2 px-3 border border-border rounded-[4px] hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {repo.private ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-[12px] font-medium text-foreground truncate">
                    {repo.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate hidden sm:block">
                    {repo.full_name}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Abrir en GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleRemoveFromList(repo.id_repo)}
                    className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    title="Quitar de la lista"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="bg-card border border-border rounded-[4px] p-4">
        <h2 className="text-[12px] font-semibold text-foreground mb-2">Como funciona</h2>
        <ul className="space-y-1.5 text-[11px] text-muted-foreground">
          <li className="flex gap-2">
            <span className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
              1
            </span>
            Crea un repositorio aqui y queda vinculado a la organizacion{' '}
            <span className="font-mono text-foreground">{ORG_OWNER}</span>.
          </li>
          <li className="flex gap-2">
            <span className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
              2
            </span>
            El backend configura automaticamente un{' '}
            <span className="text-foreground font-medium">webhook de push</span>.
          </li>
          <li className="flex gap-2">
            <span className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
              3
            </span>
            Cada push actualiza el avance de las historias de usuario en tus proyectos
            automaticamente.
          </li>
          <li className="flex gap-2">
            <span className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
              4
            </span>
            Conecta tus proyectos a repositorios desde la pantalla de{' '}
            <span className="text-foreground font-medium">Proyectos</span>.
          </li>
        </ul>
      </div>

      {/* Create Repo Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div className="bg-card border border-border rounded-[6px] p-5 w-full max-w-sm shadow-xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-foreground" />
                <h3 className="text-[13px] font-semibold text-foreground">Nuevo repositorio</h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Owner (fixed) */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                  Organizacion
                </label>
                <div className="mt-1 w-full h-7 bg-muted/30 border border-border rounded-[3px] px-2.5 flex items-center">
                  <span className="text-[11px] text-muted-foreground font-mono">{ORG_OWNER}</span>
                </div>
              </div>

              {/* Repo name */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                  Nombre <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="mi-repositorio"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateRepo()}
                  autoFocus
                  className="mt-1 w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                  Descripcion{' '}
                  <span className="normal-case text-muted-foreground/60">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Descripcion del repositorio"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.private}
                    onChange={(e) => setForm((f) => ({ ...f, private: e.target.checked }))}
                    className="w-3.5 h-3.5 accent-primary"
                  />
                  <span className="text-[11px] text-foreground">Privado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.auto_init}
                    onChange={(e) => setForm((f) => ({ ...f, auto_init: e.target.checked }))}
                    className="w-3.5 h-3.5 accent-primary"
                  />
                  <span className="text-[11px] text-foreground">Inicializar con README</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                disabled={creating}
                className="px-3 py-1.5 border border-border rounded-[3px] text-[11px] text-foreground hover:bg-accent/30 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateRepo}
                disabled={creating || !form.name.trim()}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors disabled:opacity-60"
              >
                {creating ? 'Creando...' : 'Crear repositorio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
