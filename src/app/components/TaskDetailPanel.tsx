import { useState, useEffect } from 'react';
import {
  X, Calendar, User, MessageSquare, AlertTriangle,
  GitCommit, Send, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { tasksService } from '../../services';
import type { ApiTask, ApiTaskStatus, ApiTaskPriority, ApiTaskComment, ApiTaskWarning } from '../../services';
import { WarningBadge } from './WarningBadge';

interface TaskDetailPanelProps {
  task: ApiTask | null;
  statuses: ApiTaskStatus[];
  priorities: ApiTaskPriority[];
  userMap: Map<number, string>;
  onClose: () => void;
  onStatusChange: (task: ApiTask, newStatusId: number) => void;
}

export function TaskDetailPanel({ task, statuses, priorities, userMap, onClose, onStatusChange }: TaskDetailPanelProps) {
  const [comments, setComments] = useState<ApiTaskComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [warnings, setWarnings] = useState<ApiTaskWarning[]>([]);
  const [loadingWarnings, setLoadingWarnings] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    if (!task) return;
    setLoadingComments(true);
    setLoadingWarnings(true);

    tasksService.listComments(task.id_task)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));

    tasksService.listWarnings({ task_id: task.id_task, status: 'active' })
      .then(setWarnings)
      .catch(() => setWarnings([]))
      .finally(() => setLoadingWarnings(false));
  }, [task]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;
    setSendingComment(true);
    try {
      const created = await tasksService.addComment(task.id_task, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment('');
      toast.success('Comentario agregado');
    } catch {
      toast.error('Error al agregar comentario');
    } finally {
      setSendingComment(false);
    }
  };

  const st = task ? statuses.find((s) => s.id_status === task.status) : null;
  const pr = task ? priorities.find((p) => p.id_priority === task.priority) : null;
  const assignedName = task?.assigned_to ? (userMap.get(task.assigned_to) ?? `#${task.assigned_to}`) : null;
  const isOverdue = task && !task.completed_at && task.due_date && new Date(task.due_date) < new Date();
  const activeWarnings = warnings.filter((w) => w.status === 'active');

  return (
    <>
      <AnimatePresence>
        {task && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 bg-black/20"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-card border-l border-border z-40 transition-transform duration-300 ease-in-out flex flex-col ${
          task ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {task && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-secondary/50 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                {pr && (
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                    {pr.name}
                  </span>
                )}
                {activeWarnings.length > 0 && <WarningBadge count={activeWarnings.length} />}
              </div>
              <button onClick={onClose} className="p-1 rounded-[3px] hover:bg-surface-secondary transition-colors">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Title & Description */}
              <div>
                <h2 className="text-[14px] font-semibold text-foreground leading-snug">{task.title}</h2>
                {task.description && (
                  <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{task.description}</p>
                )}
              </div>

              {/* Metadata */}
              <div className="bg-surface-secondary/50 rounded-[4px] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Estado</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {task.completed_at ? 'Completada' : st?.name ?? '—'}
                  </span>
                </div>
                {assignedName && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Asignado</span>
                    <span className="text-[11px] text-foreground flex items-center gap-1">
                      <User className="w-3 h-3" />{assignedName}
                    </span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Fecha límite</span>
                    <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : 'text-foreground'}`}>
                      <Calendar className="w-3 h-3" />{task.due_date}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-[0.06em]">Creada</span>
                  <span className="text-[11px] text-muted-foreground">{task.created_at.slice(0, 10)}</span>
                </div>
              </div>

              {/* Status changer */}
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] mb-2">
                  Cambiar estado
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((s) => (
                    <button
                      key={s.id_status}
                      onClick={() => onStatusChange(task, s.id_status)}
                      className={`px-2.5 py-1 text-[10px] font-medium rounded-[3px] border transition-colors ${
                        task.status === s.id_status
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-surface-secondary'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {loadingWarnings ? (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" /> Cargando warnings…
                </div>
              ) : activeWarnings.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-warning" /> Warnings ({activeWarnings.length})
                  </p>
                  <div className="space-y-1.5">
                    {activeWarnings.map((w) => (
                      <div key={w.id_warning} className="p-2.5 bg-warning/5 border border-warning/20 rounded-[4px]">
                        <p className="text-[11px] text-foreground leading-relaxed">{w.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{w.created_at.slice(0, 10)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" /> Comentarios ({comments.length})
                </p>
                {loadingComments ? (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" /> Cargando…
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">Sin comentarios aún.</p>
                ) : (
                  <div className="space-y-2">
                    {comments.map((c) => (
                      <div key={c.id_comment} className="p-2.5 bg-surface-secondary/50 rounded-[4px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-medium text-foreground">
                            {c.user ? (userMap.get(c.user) ?? `User #${c.user}`) : 'Sistema'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{c.created_at.slice(0, 10)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment form */}
                <form onSubmit={handleAddComment} className="mt-2 flex gap-1.5">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Agregar comentario…"
                    className="flex-1 h-7 bg-surface-secondary border border-border rounded-[3px] px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    disabled={sendingComment || !newComment.trim()}
                    className="h-7 px-2.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[3px] text-[11px] font-medium transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border shrink-0">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GitCommit className="w-3 h-3" /> ID: {task.id_task}
                </span>
                <button
                  onClick={onClose}
                  className="px-3 py-1 bg-surface-secondary hover:bg-accent text-foreground text-[11px] font-medium rounded-[3px] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
