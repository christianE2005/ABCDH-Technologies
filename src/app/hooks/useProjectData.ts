import { useState, useEffect, useCallback } from 'react';
import { projectsService, tasksService, usersService, ApiRequestError } from '../../services';
import type {
  ApiProject, ApiTask, ApiUserAccount, ApiTaskStatus, ApiTaskPriority,
  ApiBoard, ApiProjectMember, ApiActivityLog, ApiRole,
} from '../../services';

// â”€â”€â”€ Real API hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches the real project list from Django backend.
 * Falls back to null on network / auth errors so the UI can degrade gracefully.
 */
export function useApiProjects(): UseApiState<ApiProject[]> {
  const [data, setData]       = useState<ApiProject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    projectsService.list()
      .then((projects) => { if (!cancelled) setData(projects); })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiRequestError) {
          setError(err.message);
        } else {
          setError('No se pudo conectar al servidor.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}

export interface UseApiTasksState extends UseApiState<ApiTask[]> {
  statuses: ApiTaskStatus[];
  priorities: ApiTaskPriority[];
}

/**
 * Fetches tasks for a given boardId along with status/priority lookup tables.
 */
export function useApiTasks(boardId?: number): UseApiTasksState {
  const [data, setData]           = useState<ApiTask[] | null>(null);
  const [statuses, setStatuses]   = useState<ApiTaskStatus[]>([]);
  const [priorities, setPriorities] = useState<ApiTaskPriority[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [tick, setTick]           = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      tasksService.list(boardId),
      tasksService.listStatuses(),
      tasksService.listPriorities(),
    ])
      .then(([tasks, sts, prios]) => {
        if (cancelled) return;
        setData(tasks);
        setStatuses(sts);
        setPriorities(prios);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiRequestError ? err.message : 'Error cargando tareas.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [boardId, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch, statuses, priorities };
}

export interface UseApiUsersState extends UseApiState<ApiUserAccount[]> {}

/** Fetches all user accounts (admin/manager use). */
export function useApiUsers(): UseApiUsersState {
  const [data, setData]       = useState<ApiUserAccount[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    usersService.list()
      .then((users) => { if (!cancelled) setData(users); })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiRequestError ? err.message : 'Error cargando usuarios.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}

// â”€â”€â”€ Additional API hooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Fetches boards, optionally filtered by project. */
export function useApiBoards(projectId?: number): UseApiState<ApiBoard[]> {
  const [data, setData]       = useState<ApiBoard[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    tasksService.listBoards(projectId)
      .then((boards) => { if (!cancelled) setData(boards); })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiRequestError ? err.message : 'Error cargando boards.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [projectId, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}

/** Fetches project members, optionally filtered by project. */
export function useApiProjectMembers(projectId?: number): UseApiState<ApiProjectMember[]> {
  const [data, setData]       = useState<ApiProjectMember[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    usersService.listMembers(projectId)
      .then((members) => { if (!cancelled) setData(members); })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiRequestError ? err.message : 'Error cargando miembros.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [projectId, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}

/** Fetches activity logs. */
export function useApiActivityLogs(limit = 50): UseApiState<ApiActivityLog[]> {
  const [data, setData]       = useState<ApiActivityLog[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    usersService.listActivity(limit)
      .then((logs) => { if (!cancelled) setData(logs); })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiRequestError ? err.message : 'Error cargando logs.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [limit, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}

/** Fetches all roles. */
export function useApiRoles(): UseApiState<ApiRole[]> {
  const [data, setData]       = useState<ApiRole[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    usersService.listRoles()
      .then((roles) => { if (!cancelled) setData(roles); })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiRequestError ? err.message : 'Error cargando roles.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}
