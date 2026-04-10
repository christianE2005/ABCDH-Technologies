import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';
import { API_ENDPOINTS, withAuthHeaders } from '../../config/api';

interface CallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

function getMessageFromSearch(search: string): CallbackState {
  const params = new URLSearchParams(search);
  const error = params.get('error');
  const message = params.get('message');

  if (error) {
    return {
      status: 'error',
      message: message || error || 'No fue posible completar la vinculación con GitHub.',
    };
  }

  return {
    status: 'loading',
    message: message || 'Validando respuesta de GitHub...',
  };
}

async function readApiErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string; message?: string; error?: string };
    return data.detail || data.message || data.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export default function GitHubOAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>({
    status: 'loading',
    message: 'Validando respuesta de GitHub...',
  });

  const parsedState = useMemo(() => getMessageFromSearch(location.search), [location.search]);

  useEffect(() => {
    setState(parsedState);
  }, [parsedState]);

  useEffect(() => {
    if (parsedState.status === 'error') return;

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const oauthState = params.get('state');
    if (!code || !oauthState) {
      setState({
        status: 'error',
        message: 'Faltan parámetros code/state en el callback de GitHub.',
      });
      return;
    }

    let cancelled = false;
    let timerId: number | null = null;

    const finalizeOAuth = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.GITHUB_OAUTH_CALLBACK, {
          method: 'POST',
          headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ code, state: oauthState }),
        });

        if (!response.ok) {
          const apiMessage = await readApiErrorMessage(response, 'No fue posible completar la vinculación con GitHub.');
          throw new Error(apiMessage);
        }

        if (cancelled) return;

        setState({
          status: 'success',
          message: 'Cuenta GitHub vinculada correctamente.',
        });

        timerId = window.setTimeout(() => {
          navigate('/github/create-repo');
        }, 1200);
      } catch (error) {
        if (cancelled) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'No fue posible completar la vinculación con GitHub.',
        });
      }
    };

    finalizeOAuth();

    return () => {
      cancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [location.search, navigate, parsedState.status]);

  return (
    <div className="px-6 pb-6 pt-2 max-w-[800px]">
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        {state.status === 'loading' && (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">{state.message}</p>
          </div>
        )}

        {state.status === 'success' && (
          <div className="space-y-3">
            <CheckCircle2 className="w-9 h-9 mx-auto text-success" />
            <h1 className="text-lg font-semibold text-foreground">Vinculación completada</h1>
            <p className="text-sm text-muted-foreground">{state.message}</p>
            <button
              type="button"
              onClick={() => navigate('/github/create-repo')}
              className="mt-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              Continuar a crear repositorio
            </button>
          </div>
        )}

        {state.status === 'error' && (
          <div className="space-y-3">
            <CircleAlert className="w-9 h-9 mx-auto text-destructive" />
            <h1 className="text-lg font-semibold text-foreground">Error de vinculación</h1>
            <p className="text-sm text-muted-foreground">{state.message}</p>
            <button
              type="button"
              onClick={() => navigate('/github')}
              className="mt-2 px-4 py-2 bg-secondary hover:bg-accent text-foreground rounded-md text-sm font-medium transition-colors"
            >
              Volver a GitHub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
