import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { Github, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { LoadingButton } from '../components/LoadingButton';

const API_BASE = '/api';

interface LinkInstallPayload {
  user_id: number;
  installation_id: number;
}

interface CreateRepoPayload {
  user_id: number;
  owner_type: 'org';
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

function parseInstallationId(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado';
}

export default function GitHubCreateRepo() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [installationId, setInstallationId] = useState('');
  const [owner, setOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [autoInit, setAutoInit] = useState(true);
  const [isLinkingInstall, setIsLinkingInstall] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);

  const userId = toNumericUserId(user?.id);

  const handleLinkInstall = async () => {
    if (!isAuthenticated || userId === null) {
      toast.error('Debes estar logueado para vincular una instalación.');
      return;
    }

    const parsedInstallationId = parseInstallationId(installationId);
    if (parsedInstallationId === null) {
      toast.error('installation_id inválido.');
      return;
    }

    setIsLinkingInstall(true);
    try {
      const payload: LinkInstallPayload = {
        user_id: userId,
        installation_id: parsedInstallationId,
      };

      const response = await fetch(`${API_BASE}/github/app/install/link/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('No se pudo vincular la instalación con el usuario.');
      }

      toast.success('Instalación vinculada correctamente.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLinkingInstall(false);
    }
  };

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

      const response = await fetch(`${API_BASE}/github/repos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('No se pudo crear el repositorio.');
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
            Vincula la instalación y crea repositorios de organización desde la GitHub App.
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

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">3. Vincular instalación con usuario</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Pega el <strong>installation_id</strong> recibido en el regreso de instalación de la GitHub App.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={installationId}
            onChange={(e) => setInstallationId(e.target.value)}
            placeholder="installation_id"
            className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
          <LoadingButton
            type="button"
            loading={isLinkingInstall}
            onClick={handleLinkInstall}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            Vincular instalación
          </LoadingButton>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">4. Crear repo desde app (org)</h2>
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
