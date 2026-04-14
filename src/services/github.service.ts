import { api } from './api';
import type {
  GitHubAppInstallStartResponse,
  GitHubAppLinkPayload,
  GitHubOAuthStartResponse,
  GitHubCreateRepoPayload,
  GitHubCreateRepoResponse,
  GitHubRepo,
} from './types';

// Per-user localStorage key helpers
const k = {
  appLinked:      (uid: number | string) => `pip_gh_app_${uid}`,
  oauthConnected: (uid: number | string) => `pip_gh_oauth_${uid}`,
  githubLogin:    (uid: number | string) => `pip_gh_login_${uid}`,
  repos:          (uid: number | string) => `pip_gh_repos_${uid}`,
};

export const githubService = {
  // ─── App Installation ──────────────────────────────────────────────────────

  isAppLinked(userId: number | string): boolean {
    return localStorage.getItem(k.appLinked(userId)) === '1';
  },

  markAppLinked(userId: number | string): void {
    localStorage.setItem(k.appLinked(userId), '1');
  },

  /** GET /api/github/app/install/start/ → redirect to GitHub App installation page */
  async startAppInstall(): Promise<void> {
    const data = await api.get<GitHubAppInstallStartResponse>('/github/app/install/start/');
    window.location.href = data.install_url;
  },

  /** POST /api/github/app/install/link/ → saves installation_id linked to user in DB */
  async linkInstallation(payload: GitHubAppLinkPayload): Promise<void> {
    await api.post('/github/app/install/link/', payload);
  },

  // ─── OAuth Connection ──────────────────────────────────────────────────────

  isOAuthConnected(userId: number | string): boolean {
    return localStorage.getItem(k.oauthConnected(userId)) === '1';
  },

  markOAuthConnected(userId: number | string, githubLogin?: string): void {
    localStorage.setItem(k.oauthConnected(userId), '1');
    if (githubLogin) {
      localStorage.setItem(k.githubLogin(userId), githubLogin);
    }
    window.dispatchEvent(new CustomEvent('githubConnectionChanged', { detail: true }));
  },

  /** Clears the OAuth session for this user (app installation is kept). */
  disconnect(userId: number | string): void {
    localStorage.removeItem(k.oauthConnected(userId));
    window.dispatchEvent(new CustomEvent('githubConnectionChanged', { detail: false }));
  },

  getGithubLogin(userId: number | string): string | null {
    return localStorage.getItem(k.githubLogin(userId));
  },

  /** GET /api/github/app/oauth/start/ → redirect to GitHub OAuth authorization page */
  async startOAuth(): Promise<void> {
    const data = await api.get<GitHubOAuthStartResponse>('/github/app/oauth/start/');
    window.location.href = data.authorize_url;
  },

  // ─── Repos (persisted per user) ───────────────────────────────────────────

  getRepos(userId: number | string): GitHubRepo[] {
    try {
      const raw = localStorage.getItem(k.repos(userId));
      return raw ? (JSON.parse(raw) as GitHubRepo[]) : [];
    } catch {
      return [];
    }
  },

  persistRepos(userId: number | string, repos: GitHubRepo[]): void {
    localStorage.setItem(k.repos(userId), JSON.stringify(repos));
  },

  // ─── Create Repo ───────────────────────────────────────────────────────────

  /** POST /api/github/repos/ → creates repository in the given org */
  async createRepo(payload: GitHubCreateRepoPayload): Promise<GitHubCreateRepoResponse> {
    return api.post<GitHubCreateRepoResponse>('/github/repos/', payload);
  },
};
