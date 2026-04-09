import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Github, Link2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { LoadingButton } from '../components/LoadingButton';
import { API_ENDPOINTS } from '../../config/api';

interface InstallStartResponse {
  install_url?: string;
}

interface OAuthStartResponse {
  authorize_url?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado';
}

export default function GitHub() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isStartingInstall, setIsStartingInstall] = useState(false);
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  const isReadyForActions = useMemo(() => isAuthenticated && !!user?.id, [isAuthenticated, user?.id]);

  const startInstall = async () => {
    if (!isReadyForActions) {
      toast.error('Primero debes iniciar sesión en la aplicación.');
      return;
    }

    setIsStartingInstall(true);
    try {
      const response = await fetch(API_ENDPOINTS.GITHUB_INSTALL_START, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('No se pudo iniciar la instalación de la GitHub App.');
      }

      const data = (await response.json()) as InstallStartResponse;
      if (!data.install_url) {
        throw new Error('El backend no devolvió install_url.');
      }

      window.location.href = data.install_url;
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsStartingInstall(false);
    }
  };

  const startOAuth = async () => {
    if (!isReadyForActions) {
      toast.error('Primero debes iniciar sesión en la aplicación.');
      return;
    }

    setIsStartingOAuth(true);
    try {
      const response = await fetch(API_ENDPOINTS.GITHUB_OAUTH_START, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('No se pudo iniciar el login con GitHub.');
      }

      const data = (await response.json()) as OAuthStartResponse;
      if (!data.authorize_url) {
        throw new Error('El backend no devolvió authorize_url.');
      }

      window.location.href = data.authorize_url;
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsStartingOAuth(false);
    }
  };

  return (
    <div className="px-6 pb-6 pt-2 max-w-[1000px]">
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Integración GitHub</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura la GitHub App y vincula tu identidad para crear repositorios desde la plataforma.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground">
            Debes iniciar sesión en la aplicación antes de continuar con GitHub.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">1. Instalar GitHub App</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Sólo admin de organización. En GitHub selecciona <strong>All repositories</strong>.
            </p>
            <LoadingButton
              type="button"
              loading={isStartingInstall}
              onClick={startInstall}
              className="w-full px-4 py-2 bg-secondary hover:bg-accent text-foreground rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Instalar GitHub App
            </LoadingButton>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground">
              <Github className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">2. Login con GitHub</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Vincula tu identidad GitHub con tu usuario interno para operar con la app.
            </p>
            <LoadingButton
              type="button"
              loading={isStartingOAuth}
              onClick={startOAuth}
              className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Github className="w-4 h-4" />
              Log in con GitHub
            </LoadingButton>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/github/create-repo')}
            className="px-4 py-2 bg-secondary hover:bg-accent text-foreground rounded-md text-sm font-medium transition-colors"
          >
            Ir a crear repositorio
          </button>
        </div>
      </div>
    </div>
  );
}
