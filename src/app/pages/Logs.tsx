import { useState, useMemo, useEffect } from 'react';
import { Search, Download, RefreshCw, Loader2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { CommandBar } from '../components/CommandBar';
import { motion } from 'motion/react';
import { useApiActivityLogs, useApiUsers } from '../hooks/useProjectData';

const actionColorMap: Record<string, string> = {
  create: 'bg-success/10 text-success',
  created: 'bg-success/10 text-success',
  update: 'bg-warning/10 text-warning',
  updated: 'bg-warning/10 text-warning',
  delete: 'bg-destructive/10 text-destructive',
  deleted: 'bg-destructive/10 text-destructive',
  login: 'bg-info/10 text-info',
  assign: 'bg-primary/10 text-primary',
};

function actionColor(action: string | null) {
  if (!action) return 'bg-secondary text-muted-foreground';
  const key = action.toLowerCase();
  return actionColorMap[key] ?? 'bg-secondary text-muted-foreground';
}

export default function Logs() {
  const { data: logs, loading, error, refetch } = useApiActivityLogs(200);
  const { data: users } = useApiUsers();

  const userMap = useMemo(() => {
    const m = new Map<number, string>();
    (users ?? []).forEach((u) => m.set(u.id_user, u.username));
    return m;
  }, [users]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  // Unique actions from real data
  const uniqueActions = useMemo(() => {
    if (!logs) return [];
    const s = new Set<string>();
    logs.forEach((l) => { if (l.action) s.add(l.action); });
    return Array.from(s).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    const list = logs ?? [];
    return list.filter((log) => {
      const userName = userMap.get(log.user ?? 0) ?? '';
      const matchSearch =
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.action ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.entity_type ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchAction = filterAction === 'all' || log.action === filterAction;
      const logDate = log.created_at.slice(0, 10);
      const matchDateFrom = !dateFrom || logDate >= dateFrom;
      const matchDateTo = !dateTo || logDate <= dateTo;
      return matchSearch && matchAction && matchDateFrom && matchDateTo;
    });
  }, [logs, searchTerm, filterAction, userMap, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedLogs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [searchTerm, filterAction, dateFrom, dateTo]);

  return (
    <div className="px-4 pb-6 pt-3 space-y-3 max-w-[1600px]">
      <CommandBar
        actions={[
          { label: 'Actualizar', icon: <RefreshCw className="w-3.5 h-3.5" />, onClick: refetch },
          {
            label: 'Exportar CSV',
            icon: <Download className="w-3.5 h-3.5" />,
            onClick: () => {
              const header = 'ID,Usuario,Accion,Entidad,ID Entidad,Fecha\n';
              const rows = (logs ?? []).map((l) =>
                `${l.id_activity},${userMap.get(l.user ?? 0) ?? ''},${l.action ?? ''},${l.entity_type ?? ''},${l.entity_id ?? ''},${l.created_at}`
              ).join('\n');
              const blob = new Blob([header + rows], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'activity-logs.csv'; a.click();
              URL.revokeObjectURL(url);
            },
          },
        ]}
        filters={[
          { label: 'Todos', value: 'all', active: filterAction === 'all', onClick: () => setFilterAction('all') },
          ...uniqueActions.map((a) => ({
            label: a,
            value: a,
            active: filterAction === a,
            onClick: () => setFilterAction(a),
          })),
        ]}
        rightSlot={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-7 bg-surface-secondary border border-border rounded-[3px] px-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 w-[120px]"
              />
              <span className="text-[10px] text-muted-foreground">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-7 bg-surface-secondary border border-border rounded-[3px] px-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 w-[120px]"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 bg-surface-secondary border border-border rounded-[3px] pl-7 pr-3 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20 w-36"
              />
            </div>
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-card border border-border rounded-[4px] overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-surface-secondary/50">
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span> de{' '}
            <span className="font-medium text-foreground">{(logs ?? []).length}</span> registros
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-10 text-center text-[12px] text-destructive">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Usuario</th>
                  <th className="text-left py-1.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Acción</th>
                  <th className="text-left py-1.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Entidad</th>
                  <th className="text-left py-1.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">ID</th>
                  <th className="text-left py-1.5 px-4 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[12px] text-muted-foreground">
                      No se encontraron registros.
                    </td>
                  </tr>
                ) : paginatedLogs.map((log) => {
                  const userName = log.user ? (userMap.get(log.user) ?? `#${log.user}`) : '—';
                  return (
                    <tr key={log.id_activity} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="py-1.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary shrink-0">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-[12px] font-medium text-foreground">{userName}</p>
                        </div>
                      </td>
                      <td className="py-1.5 px-4">
                        <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${actionColor(log.action)}`}>
                          {log.action ?? '—'}
                        </span>
                      </td>
                      <td className="py-1.5 px-4 text-[12px] text-muted-foreground">{log.entity_type ?? '—'}</td>
                      <td className="py-1.5 px-4 text-[11px] text-muted-foreground">{log.entity_id ?? '—'}</td>
                      <td className="py-1.5 px-4 text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface-secondary/50">
            <span className="text-[11px] text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
