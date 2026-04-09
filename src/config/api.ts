// Change this to your backend URL
const rawApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_BASE_URL = rawApiBaseUrl.endsWith('/') ? rawApiBaseUrl : `${rawApiBaseUrl}/`;

function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path.replace(/^\/+/, '')}`;
}

export const API_ENDPOINTS = {
  LOGIN: buildApiUrl('auth/login/'),
  REGISTER: buildApiUrl('auth/register/'),
  GITHUB_INSTALL_START: buildApiUrl('github/app/install/start/'),
  GITHUB_OAUTH_START: buildApiUrl('github/app/oauth/start/'),
  GITHUB_INSTALL_LINK: buildApiUrl('github/app/install/link/'),
  GITHUB_CREATE_REPO: buildApiUrl('github/repos/'),
} as const;
