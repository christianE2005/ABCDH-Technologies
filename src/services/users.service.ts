import { api } from './api';
import type { ApiUserAccount, ApiProjectMember, ApiRole, ApiActivityLog } from './types';

export const usersService = {
  /** GET /api/user-accounts/ */
  list(): Promise<ApiUserAccount[]> {
    return api.get<ApiUserAccount[]>('/user-accounts/');
  },

  /** GET /api/user-accounts/:id/ */
  get(id: number): Promise<ApiUserAccount> {
    return api.get<ApiUserAccount>(`/user-accounts/${id}/`);
  },

  /** PATCH /api/user-accounts/:id/ */
  update(id: number, payload: Partial<Pick<ApiUserAccount, 'email' | 'username'>>): Promise<ApiUserAccount> {
    return api.patch<ApiUserAccount>(`/user-accounts/${id}/`, payload);
  },

  // ── Project members ────────────────────────────────────────────
  listMembers(projectId?: number, userId?: number): Promise<ApiProjectMember[]> {
    const params = new URLSearchParams();
    if (projectId) params.set('project', String(projectId));
    if (userId) params.set('user', String(userId));
    const query = params.toString();
    const url = query ? `/project-members/?${query}` : '/project-members/';
    return api.get<ApiProjectMember[]>(url);
  },

  addMember(projectId: number, userId: number, roleId?: number): Promise<ApiProjectMember> {
    return api.post<ApiProjectMember>('/project-members/', {
      project: projectId,
      user: userId,
      role: roleId ?? null,
    });
  },

  removeMember(memberId: number): Promise<void> {
    return api.delete<void>(`/project-members/${memberId}/`);
  },

  // ── Roles ──────────────────────────────────────────────────────
  listRoles(): Promise<ApiRole[]> {
    return api.get<ApiRole[]>('/roles/');
  },

  // ── Activity log ───────────────────────────────────────────────
  listActivity(limit = 50): Promise<ApiActivityLog[]> {
    return api.get<ApiActivityLog[]>(`/activity-logs/?ordering=-created_at&limit=${limit}`);
  },
};
