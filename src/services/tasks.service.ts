import { api } from './api';
import type { ApiTask, ApiTaskStatus, ApiTaskPriority, ApiTaskComment, ApiBoard } from './types';

export interface CreateTaskPayload {
  board: number;
  title: string;
  description?: string;
  status?: number;
  priority?: number;
  assigned_to?: number;
  due_date?: string;   // YYYY-MM-DD
}

export interface UpdateTaskPayload extends Partial<Omit<CreateTaskPayload, 'board'>> {
  completed_at?: string | null;
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

  // ── Boards ─────────────────────────────────────────────────────
  listBoards(projectId?: number): Promise<ApiBoard[]> {
    const url = projectId ? `/boards/?project=${projectId}` : '/boards/';
    return api.get<ApiBoard[]>(url);
  },

  createBoard(projectId: number, name: string, description?: string): Promise<ApiBoard> {
    return api.post<ApiBoard>('/boards/', { project: projectId, name, description });
  },
};
