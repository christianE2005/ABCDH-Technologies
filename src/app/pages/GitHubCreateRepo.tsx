import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { Github, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { LoadingButton } from '../components/LoadingButton';
import { API_ENDPOINTS, withAuthHeaders } from '../../config/api';

interface CreateRepoPayload {
  user_id: number;
  owner_type: 'org' | 'user';
  owner: string;
  name: string;
  description: string;
  private: boolean;
  auto_init: boolean;
}

function toNumericUserId(userId: string | undefined): number | null {
  if (!userId) return null;
  const numericValue = Number(userId);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado';
}

async function readApiErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string; message?: string; error?: string };
    return data.detail || data.message || data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export default function GitHubCreateRepo() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [owner, setOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [autoInit, setAutoInit] = useState(true);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  const userId = toNumericUserId(user?.id);

  const handleCreateRepo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated || userId === null) {
      toast.error('Debes estar logueado para crear repositorios.');
      return;
    }

    if (!owner.trim() || !repoName.trim()) {
      toast.error('Completa owner y nombre del repositorio.');
      return;
    }

    setIsCreatingRepo(true);
    try {
      const payload: CreateRepoPayload = {
        user_id: userId,
        owner_type: 'org',
        owner: owner.trim(),
        name: repoName.trim(),
        description: description.trim(),
        private: isPrivate,
        auto_init: autoInit,
      };

      const response = await fetch(API_ENDPOINTS.GITHUB_CREATE_REPO, {
        method: 'POST',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const apiMessage = await readApiErrorMessage(response, 'No se pudo crear el repositorio.');
        throw new Error(apiMessage);
      }

      toast.success('Repositorio creado exitosamente.');
      setRepoName('');
      setDescription('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsCreatingRepo(false);
    }
  };

  return (
    <div className="px-6 pb-6 pt-2 max-w-[1000px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">GitHub - Crear repositorio</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea repositorios de organización. La instalación se resuelve automáticamente en backend.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/github')}
          className="px-4 py-2 bg-secondary hover:bg-accent text-foreground rounded-md text-sm font-medium transition-colors"
        >
          Volver
        </button>
      </div>

      {!isAuthenticated && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground">
          Debes iniciar sesión antes de usar esta sección.
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Github className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">2. Crear repo desde app (org)</h2>
        </div>

        <form className="space-y-4" onSubmit={handleCreateRepo}>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Owner (organización) *</label>
            <input
              type="text"
              required
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="NOMBRE_ORG"
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Nombre del repositorio *</label>
            <input
              type="text"
              required
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="nuevo-repo"
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Descripción</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="repo creada desde app"
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 rounded-md border border-border p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded border-input"
              />
              <span className="text-sm text-foreground">Repositorio privado</span>
            </label>

            <label className="flex items-center gap-2 rounded-md border border-border p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoInit}
                onChange={(e) => setAutoInit(e.target.checked)}
                className="w-4 h-4 rounded border-input"
              />
              <span className="text-sm text-foreground">Inicializar con commit (auto_init)</span>
            </label>
          </div>

          <LoadingButton
            type="submit"
            loading={isCreatingRepo}
            className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear repo
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
