import { api } from './api';
import type { GitHubOAuthStartResponse, GitHubCreateRepoPayload, GitHubCreateRepoResponse } from './types';

const GITHUB_CONNECTED_KEY = 'pip_github_connected';

export const githubService = {
  isConnected(): boolean {
    return localStorage.getItem(GITHUB_CONNECTED_KEY) === 'true';
  },

  markConnected() {
    localStorage.setItem(GITHUB_CONNECTED_KEY, 'true');
  },

  disconnect() {
    localStorage.removeItem(GITHUB_CONNECTED_KEY);
  },

  /**
   * GET /api/github/app/oauth/start/
   * Fetches the GitHub authorize URL and redirects.
   * The backend must redirect back to <frontend>/github?github=connected after OAuth completes.
   */
  async startOAuth(): Promise<void> {
    const data = await api.get<GitHubOAuthStartResponse>('/github/app/oauth/start/');
    window.location.href = data.authorize_url;
  },

  /**
   * POST /api/github/repos/
   * Creates a repository in the given org.
   */
  async createRepo(payload: GitHubCreateRepoPayload): Promise<GitHubCreateRepoResponse> {
    return api.post<GitHubCreateRepoResponse>('/github/repos/', payload);
  },
};
