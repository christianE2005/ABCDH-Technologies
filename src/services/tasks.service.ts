import { api } from './api';
import type { ApiTask, ApiTaskStatus, ApiTaskPriority, ApiTaskComment, ApiBoard, ApiTaskWarning } from './types';

export interface CreateTaskPayload {
  board: number;
  title: string;
  description?: string;
  status?: number;
  priority?: number;
  created_by?: number;
  assigned_to?: number;
  due_date?: string;   // YYYY-MM-DD
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: number | null;
  priority?: number | null;
  assigned_to?: number | null;
  due_date?: string | null;
  completed_at?: string | null;
}

export interface UpdateTaskCommentPayload {
  content: string;
}

export const tasksService = {
  /** GET /api/tasks/ — optionally filter by board */
  list(boardId?: number): Promise<ApiTask[]> {
    const url = boardId ? `/tasks/?board=${boardId}` : '/tasks/';
    return api.get<ApiTask[]>(url);
  },

  /** GET /api/tasks/:id/ */
  get(id: number): Promise<ApiTask> {
    return api.get<ApiTask>(`/tasks/${id}/`);
  },

  /** POST /api/tasks/ */
  create(payload: CreateTaskPayload): Promise<ApiTask> {
    return api.post<ApiTask>('/tasks/', payload);
  },

  /** PATCH /api/tasks/:id/ */
  update(id: number, payload: UpdateTaskPayload): Promise<ApiTask> {
    return api.patch<ApiTask>(`/tasks/${id}/`, payload);
  },

  /** DELETE /api/tasks/:id/ */
  delete(id: number): Promise<void> {
    return api.delete<void>(`/tasks/${id}/`);
  },

  // ── Lookup tables ──────────────────────────────────────────────
  listStatuses(): Promise<ApiTaskStatus[]> {
    return api.get<ApiTaskStatus[]>('/task-statuses/');
  },

  listPriorities(): Promise<ApiTaskPriority[]> {
    return api.get<ApiTaskPriority[]>('/task-priorities/');
  },

  // ── Comments ───────────────────────────────────────────────────
  listComments(taskId: number): Promise<ApiTaskComment[]> {
    return api.get<ApiTaskComment[]>(`/task-comments/?task=${taskId}`);
  },

  addComment(taskId: number, content: string): Promise<ApiTaskComment> {
    return api.post<ApiTaskComment>('/task-comments/', { task: taskId, content });
  },

  updateComment(commentId: number, payload: UpdateTaskCommentPayload): Promise<ApiTaskComment> {
    return api.patch<ApiTaskComment>(`/task-comments/${commentId}/`, payload);
  },

  deleteComment(commentId: number): Promise<void> {
    return api.delete<void>(`/task-comments/${commentId}/`);
  },

  // ── Boards ─────────────────────────────────────────────────────
  listBoards(projectId?: number): Promise<ApiBoard[]> {
    const url = projectId ? `/boards/?project=${projectId}` : '/boards/';
    return api.get<ApiBoard[]>(url);
  },

  createBoard(projectId: number, name: string, description?: string): Promise<ApiBoard> {
    return api.post<ApiBoard>('/boards/', { project: projectId, name, description });
  },

  // ── Warnings ───────────────────────────────────────────────────
  listWarnings(filters?: { task_id?: number; project_id?: number; status?: 'active' | 'resolved' }): Promise<ApiTaskWarning[]> {
    const params = new URLSearchParams();
    if (filters?.task_id) params.set('task_id', String(filters.task_id));
    if (filters?.project_id) params.set('project_id', String(filters.project_id));
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return api.get<ApiTaskWarning[]>(`/task-warnings/${qs ? `?${qs}` : ''}`);
  },
};
