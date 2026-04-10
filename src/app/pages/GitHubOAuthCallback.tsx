import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';
import { API_ENDPOINTS, withAuthHeaders } from '../../config/api';

interface CallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

interface CallbackQuery {
  code: string | null;
  oauthState: string | null;
  status: string | null;
  linked: string | null;
}

interface OAuthFinalizeResult {
  status: 'success' | 'error';
  message: string;
}

const oauthFinalizeRequests = new Map<string, Promise<OAuthFinalizeResult>>();
const OAUTH_COMPLETED_PREFIX = 'github_oauth_completed_';

function getMessageFromSearch(search: string): CallbackState {
  const params = new URLSearchParams(search);
  const error = params.get('error');
  const status = params.get('status');
  const linked = params.get('linked');
  const message = params.get('message');

  if (error) {
    return {
      status: 'error',
      message: message || error || 'No fue posible completar la vinculación con GitHub.',
    };
  }

  if (status === 'success' || linked === 'true') {
    return {
      status: 'success',
      message: message || 'Cuenta GitHub vinculada correctamente.',
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

function finalizeOAuthOnce(code: string, oauthState: string): Promise<OAuthFinalizeResult> {
  const requestKey = `${code}:${oauthState}`;
  const completionKey = `${OAUTH_COMPLETED_PREFIX}${requestKey}`;
  if (sessionStorage.getItem(completionKey) === '1') {
    return Promise.resolve({
      status: 'success',
      message: 'Cuenta GitHub vinculada correctamente.',
    });
  }

  const existing = oauthFinalizeRequests.get(requestKey);
  if (existing) return existing;

  const requestPromise = (async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GITHUB_OAUTH_CALLBACK, {
        method: 'POST',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ code, state: oauthState }),
      });

      if (!response.ok) {
        const apiMessage = await readApiErrorMessage(response, 'No fue posible completar la vinculación con GitHub.');
        return {
          status: 'error',
          message: apiMessage,
        };
      }

      return {
        status: 'success',
        message: 'Cuenta GitHub vinculada correctamente.',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'No fue posible completar la vinculación con GitHub.',
      };
    }
  })();

  requestPromise.then((result) => {
    if (result.status === 'success') {
      sessionStorage.setItem(completionKey, '1');
    }
  });

  oauthFinalizeRequests.set(requestKey, requestPromise);
  return requestPromise;
}

export default function GitHubOAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>({
    status: 'loading',
    message: 'Validando respuesta de GitHub...',
  });

  const parsedState = useMemo(() => getMessageFromSearch(location.search), [location.search]);
  const parsedQuery = useMemo<CallbackQuery>(() => {
    const params = new URLSearchParams(location.search);
    return {
      code: params.get('code'),
      oauthState: params.get('state'),
      status: params.get('status'),
      linked: params.get('linked'),
    };
  }, [location.search]);

  useEffect(() => {
    setState(parsedState);
  }, [parsedState]);

  useEffect(() => {
    if (parsedState.status === 'error') {
      return;
    }

    // Backend ya pudo cerrar OAuth y redirigir con status/link sin reenviar code/state al front.
    if ((parsedQuery.status === 'success' || parsedQuery.linked === 'true') && (!parsedQuery.code || !parsedQuery.oauthState)) {
      setState({
        status: 'success',
        message: parsedState.message,
      });
      return;
    }

    if (!parsedQuery.code || !parsedQuery.oauthState) {
      setState({
        status: 'error',
        message: 'OAuth failed: code/state missing',
      });
      return;
    }

    let cancelled = false;

    const finalizeOAuth = async () => {
      const result = await finalizeOAuthOnce(parsedQuery.code!, parsedQuery.oauthState!);
      if (cancelled) return;

      setState({
        status: result.status,
        message: result.message,
      });

    };

    finalizeOAuth();

    return () => {
      cancelled = true;
    };
  }, [parsedQuery.code, parsedQuery.linked, parsedQuery.oauthState, parsedQuery.status, parsedState.message, parsedState.status]);

  useEffect(() => {
    if (state.status !== 'success') return;
    const timerId = window.setTimeout(() => {
      navigate('/github/create-repo');
    }, 1200);
    return () => window.clearTimeout(timerId);
  }, [navigate, state.status]);

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
