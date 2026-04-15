import { useState, useEffect } from 'react';
import { Github, Plus, ExternalLink, Lock, Unlock, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { githubService } from '../../services/github.service';
import { ApiRequestError } from '../../services/api';
import { useAuth } from '../context/AuthContext';
import type { GitHubRepo } from '../../services/types';

const ORG_OWNER = 'ABCDH-Technologies';

interface CreateRepoForm {
  name: string;
  description: string;
  private: boolean;
  auto_init: boolean;
}

/**
 * Reusable view that displays the user's GitHub repos list and a "create repo" modal.
 * Requires the user to be already connected to GitHub.
 */
export function GitHubReposView() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [githubLogin, setGithubLogin] = useState<string | null>(null);

  const [repos, setRepos] = useState<GitHubRepo[]>(
    () => (userId ? githubService.getRepos(Number(userId)) : []),
  );

  const persistRepos = (list: GitHubRepo[]) => {
    if (!userId) return;
    githubService.persistRepos(Number(userId), list);
    setRepos(list);
  };

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    githubService.checkConnectionStatus()
      .then((status) => {
        if (status.connected) {
          setConnected(true);
          setGithubLogin(status.github_login);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDisconnect = () => {
    if (!userId) return;
    githubService.clearRepos(Number(userId));
    setRepos([]);
    setGithubLogin(null);
    setConnected(false);
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
    persistRepos(repos.filter((r) => r.id !== repoId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] text-muted-foreground">Verificando conexion...</span>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center">
          <Github className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium text-foreground">GitHub no conectado</p>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
            Conecta tu cuenta de GitHub desde tu{' '}
            <span className="text-foreground font-medium">Perfil</span>{' '}
            para ver y gestionar repositorios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-card border border-border rounded-[4px] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#24292e] rounded-full flex items-center justify-center">
            <Github className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-foreground">GitHub conectado</p>
            <p className="text-[10px] text-muted-foreground">
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
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors"
        >
          <Plus className="w-3 h-3" />
          Nuevo repo
        </button>
      </div>

      {/* Repos list */}
      <div className="bg-card border border-border rounded-[4px] p-4 mt-2">
        <h2 className="text-[12px] font-semibold text-foreground mb-3 pb-2.5 border-b border-border">
          Repositorios creados
        </h2>

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
                key={repo.id}
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
                    onClick={() => handleRemoveFromList(repo.id)}
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
                onClick={() => { setShowModal(false); resetForm(); }}
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
                onClick={() => { setShowModal(false); resetForm(); }}
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
    </>
  );
}
