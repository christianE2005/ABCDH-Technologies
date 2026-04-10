// Change this to your backend URL
const rawApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_BASE_URL = rawApiBaseUrl.endsWith('/') ? rawApiBaseUrl : `${rawApiBaseUrl}/`;
export const AUTH_TOKEN_KEY = 'auth_token';

function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path.replace(/^\/+/, '')}`;
}

export function withAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

export const API_ENDPOINTS = {
  LOGIN: buildApiUrl('auth/login/'),
  REGISTER: buildApiUrl('auth/register/'),
  GITHUB_OAUTH_START: buildApiUrl('github/app/oauth/start/'),
  GITHUB_OAUTH_CALLBACK: buildApiUrl('github/app/oauth/callback/'),
  GITHUB_CREATE_REPO: buildApiUrl('github/repos/'),
} as const;
