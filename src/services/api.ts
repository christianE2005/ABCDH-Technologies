import type { ApiError } from './types';

// ─── Base URL — proxied through Vite dev server to avoid CORS ───────────────
const BASE_URL = '/api';

// ─── Token storage keys ──────────────────────────────────────────────────────
const STORAGE_ACCESS  = 'pip_access_token';
const STORAGE_REFRESH = 'pip_refresh_token';

export const tokenStore = {
  getAccess:  () => localStorage.getItem(STORAGE_ACCESS),
  getRefresh: () => localStorage.getItem(STORAGE_REFRESH),
  set: (access: string, refresh: string) => {
    localStorage.setItem(STORAGE_ACCESS,  access);
    localStorage.setItem(STORAGE_REFRESH, refresh);
  },
  setAccess: (access: string) => localStorage.setItem(STORAGE_ACCESS, access),
  clear: () => {
    localStorage.removeItem(STORAGE_ACCESS);
    localStorage.removeItem(STORAGE_REFRESH);
  },
};

// ─── API error class ─────────────────────────────────────────────────────────
export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public body: ApiError,
  ) {
    const message = body.detail ?? `HTTP ${status}`;
    super(message);
    this.name = 'ApiRequestError';
  }
}

// ─── Internal fetch helper ───────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = tokenStore.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 401 → try refresh once, then re-attempt
  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStore.getAccess()}`;
      const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      return handleResponse<T>(retry);
    }
    // Refresh failed — clear tokens and bubble up
    tokenStore.clear();
  }

  return handleResponse<T>(res);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiRequestError(res.status, data as ApiError);
  return data as T;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStore.setAccess(data.access_token);
    return true;
  } catch {
    return false;
  }
}

// ─── Public API client ───────────────────────────────────────────────────────
export const api = {
  get:    <T>(path: string, auth = true) =>
    request<T>(path, { method: 'GET' }, auth),

  post:   <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, auth),

  put:    <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, auth),

  patch:  <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, auth),

  delete: <T>(path: string, auth = true) =>
    request<T>(path, { method: 'DELETE' }, auth),
};
