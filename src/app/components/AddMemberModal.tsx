import { useState, useMemo, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Search, User, Loader2, UserPlus } from 'lucide-react';
import { usersService } from '../../services';
import type { ApiUserAccount, ApiRole } from '../../services';
import type { ProjectRoleIds } from '../utils/projectPermissions';
import { getAllowedProjectRoleIdsForUser, getUserGithubConnectionState, isStakeholderSystemUser } from '../utils/projectPermissions';
import { getSystemRoleLabel } from '../utils/roles';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: ApiUserAccount[];
  roles: ApiRole[];
  roleIds: ProjectRoleIds;
  bypassGithubCheck?: boolean;
  onSubmit: (userId: number, roleId: number | null) => Promise<void>;
}

export function AddMemberModal({
  open,
  onOpenChange,
  candidates,
  roles,
  roleIds,
  bypassGithubCheck = false,
  onSubmit,
}: AddMemberModalProps) {
  const [query, setQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Reliable GitHub status per candidate, fetched fresh on open (list payloads can omit github fields).
  const [connectedMap, setConnectedMap] = useState<Map<number, boolean>>(new Map());
  const [loadingConnections, setLoadingConnections] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return candidates;
    const q = query.toLowerCase();
    return candidates.filter(
      (c) =>
        c.username.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [candidates, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelectedUserId(null);
    setSelectedRoleId(null);
    setTimeout(() => inputRef.current?.focus(), 50);

    let cancelled = false;
    setLoadingConnections(true);
    Promise.allSettled(candidates.map((c) => usersService.get(c.id_user)))
      .then((results) => {
        if (cancelled) return;
        const map = new Map<number, boolean>();
        results.forEach((res, i) => {
          const candidate = candidates[i];
          const detail = res.status === 'fulfilled' ? res.value : candidate;
          map.set(candidate.id_user, getUserGithubConnectionState(detail).connected === true);
        });
        setConnectedMap(map);
      })
      .finally(() => { if (!cancelled) setLoadingConnections(false); });

    return () => { cancelled = true; };
  }, [open, candidates]);

  // Connection per candidate: prefer freshly-fetched data, fall back to whatever the list carried.
  const isCandidateConnected = (candidate: ApiUserAccount) => {
    const fromMap = connectedMap.get(candidate.id_user);
    if (fromMap !== undefined) return fromMap;
    return getUserGithubConnectionState(candidate).connected === true;
  };
  const candidateNeedsGithub = (candidate: ApiUserAccount) => !isStakeholderSystemUser(candidate);
  // Blocked = GitHub required, not connected, and the bypass flag is off.
  const isCandidateBlocked = (candidate: ApiUserAccount) =>
    !bypassGithubCheck && candidateNeedsGithub(candidate) && !isCandidateConnected(candidate);

  const selectedUser = useMemo(
    () => candidates.find((candidate) => candidate.id_user === selectedUserId) ?? null,
    [candidates, selectedUserId],
  );
  const allowedRoleIds = useMemo(
    () => getAllowedProjectRoleIdsForUser(selectedUser, roleIds),
    [roleIds, selectedUser],
  );
  const allowedRoles = useMemo(
    () => roles.filter((role) => allowedRoleIds.includes(role.id_role)),
    [allowedRoleIds, roles],
  );
  const selectedConnected = selectedUser ? isCandidateConnected(selectedUser) : false;
  const githubRequired = selectedUser ? !isStakeholderSystemUser(selectedUser) : false;
  const githubIsUnavailable = !bypassGithubCheck && githubRequired && !selectedConnected;

  useEffect(() => {
    if (!selectedUser) return;

    if (isStakeholderSystemUser(selectedUser)) {
      setSelectedRoleId(roleIds.stakeholderId ?? null);
      return;
    }

    setSelectedRoleId((current) => (current != null && allowedRoleIds.includes(current) ? current : null));
  }, [allowedRoleIds, roleIds.stakeholderId, selectedUser]);

  const handleSubmit = async () => {
    if (!selectedUserId) return;
    if (selectedRoleId == null) return;
    if (githubIsUnavailable) return;
    setSubmitting(true);
    try {
      await onSubmit(selectedUserId, selectedRoleId);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 rounded-[4px] overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Agregar miembro al proyecto
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o email…"
              className="w-full h-8 pl-8 pr-3 text-[13px] bg-surface-secondary border border-border rounded-[3px] outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Status banner: shows whether GitHub is required or the bypass is active */}
        <div className="px-4 pb-2">
          {bypassGithubCheck ? (
            <p className="text-[10px] rounded-[3px] border border-warning/40 bg-warning/10 text-warning px-2.5 py-1.5">
              Verificación de GitHub desactivada — puedes agregar personas aunque no tengan GitHub conectado.
            </p>
          ) : (
            <p className="text-[10px] rounded-[3px] border border-border bg-surface-secondary/40 text-muted-foreground px-2.5 py-1.5">
              Solo puedes agregar personas con GitHub conectado. Las demás aparecen en gris.
            </p>
          )}
        </div>

        <div className="max-h-[240px] overflow-y-auto scrollbar-app px-1 pb-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground">
              <User className="w-5 h-5 mb-1 opacity-40" />
              <span className="text-[12px]">
                {candidates.length === 0 ? 'Todos los usuarios ya son miembros.' : 'Sin resultados'}
              </span>
            </div>
          ) : (
            filtered.map((u) => {
              const isSelected = u.id_user === selectedUserId;
              const blocked = isCandidateBlocked(u);
              const connected = isCandidateConnected(u);
              const isStakeholder = isStakeholderSystemUser(u);
              return (
                <button
                  key={u.id_user}
                  type="button"
                  disabled={blocked}
                  onClick={() => setSelectedUserId(u.id_user)}
                  title={blocked ? 'Sin GitHub conectado — activa la excepción en Configuración para agregarlo' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-[3px] transition-colors ${
                    blocked ? 'opacity-50 cursor-not-allowed' : isSelected ? 'bg-primary/10 ring-1 ring-primary/40' : 'hover:bg-accent/40'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {u.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{u.username}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {getSystemRoleLabel(u.system_role, u.system_role_name)}
                    </p>
                  </div>
                  {!isStakeholder && (
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium ${
                        connected
                          ? 'bg-success/15 text-success'
                          : bypassGithubCheck
                            ? 'bg-warning/15 text-warning'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {loadingConnections && connectedMap.get(u.id_user) === undefined
                        ? '…'
                        : connected ? 'GitHub' : 'Sin GitHub'}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-border px-4 py-3 space-y-2">
          {selectedUser && (
            <div className="rounded-[4px] border border-border bg-surface-secondary/40 px-3 py-2 text-[11px] text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">Rol del sistema:</span>{' '}
                {getSystemRoleLabel(selectedUser.system_role, selectedUser.system_role_name)}
              </p>
              {isStakeholderSystemUser(selectedUser) ? (
                <p>El rol del proyecto queda fijado en Stakeholder para este usuario.</p>
              ) : loadingConnections ? (
                <p>Verificando conexión de GitHub…</p>
              ) : selectedConnected ? (
                <p className="text-success">GitHub conectado.</p>
              ) : bypassGithubCheck ? (
                <p className="text-warning">Sin GitHub, pero la verificación está desactivada — puedes agregarlo.</p>
              ) : (
                <p className="text-destructive">
                  No puedes agregarlo porque no tiene GitHub conectado. Actívalo en Configuración para permitir excepciones.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.06em] block mb-1">
              Rol en el proyecto
            </label>
            <select
              value={selectedRoleId ?? ''}
              onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedUser || isStakeholderSystemUser(selectedUser) || allowedRoles.length === 0}
              className="w-full h-8 px-2 text-[12px] bg-surface-secondary border border-border rounded-[3px] outline-none focus:border-primary/50"
            >
              <option value="">Selecciona un rol</option>
              {allowedRoles.map((r) => (
                <option key={r.id_role} value={r.id_role}>{r.name}</option>
              ))}
            </select>
            {selectedUser && selectedRoleId == null && (
              <p className="mt-1 text-[11px] text-destructive">Debes seleccionar un rol antes de agregar a la persona.</p>
            )}
            {selectedUser && isStakeholderSystemUser(selectedUser) && roleIds.stakeholderId == null && (
              <p className="mt-1 text-[11px] text-destructive">No existe un rol de proyecto Stakeholder configurado.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-8 px-3 text-[12px] rounded-[3px] border border-border hover:bg-accent/40 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedUserId || !selectedRoleId || submitting || githubIsUnavailable}
              className="h-8 px-3 text-[12px] font-medium rounded-[3px] bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
              Agregar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
