import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';

interface CallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

function getMessageFromSearch(search: string): CallbackState {
  const params = new URLSearchParams(search);
  const error = params.get('error');
  const status = params.get('status');
  const message = params.get('message');
  const linked = params.get('linked');
  const code = params.get('code');
  const state = params.get('state');

  if (error || status === 'error') {
    return {
      status: 'error',
      message: message || error || 'No fue posible completar la vinculación con GitHub.',
    };
  }

  const hasSuccessSignals = status === 'success' || linked === 'true' || !!code || !!state || !!message;
  if (!hasSuccessSignals) {
    return {
      status: 'error',
      message: 'No se recibió una respuesta válida del callback de GitHub.',
    };
  }

  return {
    status: 'success',
    message: message || 'Cuenta GitHub vinculada correctamente.',
  };
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
    if (state.status !== 'success') return;
    const timerId = window.setTimeout(() => {
      navigate('/github/create-repo');
    }, 1200);
    return () => window.clearTimeout(timerId);
  }, [state.status, navigate]);

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
