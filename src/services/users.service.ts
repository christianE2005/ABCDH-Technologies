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

  // ── Project members ────────────────────────────────────────────
  listMembers(projectId?: number): Promise<ApiProjectMember[]> {
    const url = projectId ? `/project-members/?project=${projectId}` : '/project-members/';
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
