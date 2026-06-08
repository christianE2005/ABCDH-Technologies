import { api } from './api';
import type {
  ApiBadge,
  ApiUserBadge,
  ApiGamificationProfile,
  ApiLeaderboardEntry,
} from './types';

function unwrap<T>(res: T[] | { results?: T[] } | null | undefined): T[] {
  if (Array.isArray(res)) return res;
  return res?.results ?? [];
}

export const gamificationService = {
  /** GET /api/gamification/profile/ — current user by default, or a specific user. */
  getProfile(userId?: number): Promise<ApiGamificationProfile> {
    const qs = userId ? `?user_id=${userId}` : '';
    return api.get<ApiGamificationProfile>(`/gamification/profile/${qs}`);
  },

  /** GET /api/gamification/badges/ — full badge catalog. */
  listBadges(): Promise<ApiBadge[]> {
    return api.get<ApiBadge[] | { results: ApiBadge[] }>('/gamification/badges/').then(unwrap);
  },

  /** GET /api/gamification/user-badges/ — unlocked badges (optionally for a given user). */
  listUserBadges(userId?: number): Promise<ApiUserBadge[]> {
    const qs = userId ? `?user=${userId}` : '';
    return api.get<ApiUserBadge[] | { results: ApiUserBadge[] }>(`/gamification/user-badges/${qs}`).then(unwrap);
  },

  /** GET /api/gamification/leaderboard/ — ranked members, optionally scoped. */
  getLeaderboard(filters?: { project?: number; sprint?: number; scope?: 'individual' | 'team' }): Promise<ApiLeaderboardEntry[]> {
    const params = new URLSearchParams();
    if (filters?.project) params.set('project', String(filters.project));
    if (filters?.sprint) params.set('sprint', String(filters.sprint));
    if (filters?.scope) params.set('scope', filters.scope);
    const qs = params.toString();
    return api.get<ApiLeaderboardEntry[] | { results: ApiLeaderboardEntry[] }>(`/gamification/leaderboard/${qs ? `?${qs}` : ''}`).then(unwrap);
  },

  /** POST /api/gamification/recompute/ — admin/cron: recompute stats + award badges. */
  recompute(): Promise<unknown> {
    return api.post<unknown>('/gamification/recompute/', {});
  },
};
