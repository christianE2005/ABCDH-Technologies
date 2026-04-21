import { useState, useMemo, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Search, User, Loader2, UserPlus } from 'lucide-react';
import type { ApiUserAccount, ApiRole } from '../../services';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: ApiUserAccount[];
  roles: ApiRole[];
  onSubmit: (userId: number, roleId: number | null) => Promise<void>;
}

export function AddMemberModal({
  open,
  onOpenChange,
  candidates,
  roles,
  onSubmit,
}: AddMemberModalProps) {
  const [query, setQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
    if (open) {
      setQuery('');
      setSelectedUserId(null);
      setSelectedRoleId(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedUserId) return;
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

        <div className="max-h-[240px] overflow-y-auto px-1 pb-2">
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
              return (
                <button
                  key={u.id_user}
                  type="button"
                  onClick={() => setSelectedUserId(u.id_user)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-[3px] transition-colors ${
                    isSelected ? 'bg-primary/10 ring-1 ring-primary/40' : 'hover:bg-accent/40'
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
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-border px-4 py-3 space-y-2">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.06em] block mb-1">
              Rol en el proyecto
            </label>
            <select
              value={selectedRoleId ?? ''}
              onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : null)}
              className="w-full h-8 px-2 text-[12px] bg-surface-secondary border border-border rounded-[3px] outline-none focus:border-primary/50"
            >
              <option value="">Sin rol</option>
              {roles.map((r) => (
                <option key={r.id_role} value={r.id_role}>{r.name}</option>
              ))}
            </select>
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
              disabled={!selectedUserId || submitting}
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
