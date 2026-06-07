import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  useApiProjects,
  useApiTags,
  useApiTasks,
} from '../hooks/useProjectData';
import { tasksService } from '../../services';
import { TagColorPicker } from '../components/TagColorPicker';
import { StatusBadge } from '../components/StatusBadge';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { useReducedMotion } from '../hooks/useReducedMotion';

const DEFAULT_TAG_COLOR = '#56697f';

// Mapea el nombre de prioridad (texto del backend, español) a un tono semántico de StatusBadge.
type PriorityTone = 'danger' | 'warning' | 'info' | 'neutral';
function getPriorityTone(name: string): PriorityTone {
  const n = name.trim().toLowerCase();
  if (n.includes('crit') || n.includes('crít') || n.includes('urgen')) return 'danger';
  if (n.includes('alta') || n.includes('high')) return 'warning';
  if (n.includes('media') || n.includes('medium') || n.includes('normal')) return 'info';
  return 'neutral';
}

const TABLE_GRID = 'grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)_160px]';

export default function Backlog() {
  const reduced = useReducedMotion();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTag, setNewTag] = useState({ color: DEFAULT_TAG_COLOR });

  const { data: projects, loading: loadingProjects } = useApiProjects();
  const { data: tasks, loading: loadingTasks, priorities } = useApiTasks(undefined, selectedProjectId ?? undefined);
  const { data: tags, loading: loadingTags, refetch: refetchTags } = useApiTags(selectedProjectId ?? undefined);

  const loading = loadingProjects || loadingTasks || loadingTags;

  const backlogTasks = useMemo(() => (tasks ?? []).filter((task) => task.sprint == null), [tasks]);
  const filteredTasks = useMemo(() => {
    if (selectedTagIds.length === 0) return backlogTasks;
    return backlogTasks.filter((task) => selectedTagIds.every((tagId) => task.tags.includes(tagId)));
  }, [backlogTasks, selectedTagIds]);

  const priorityById = useMemo(() => {
    const map = new Map<number, string>();
    priorities.forEach((priority) => map.set(priority.id_priority, priority.name));
    return map;
  }, [priorities]);

  const tagById = useMemo(() => {
    const map = new Map<number, { name: string; color: string }>();
    (tags ?? []).forEach((tag) => {
      map.set(tag.id_tag, { name: tag.name, color: tag.color || DEFAULT_TAG_COLOR });
    });
    return map;
  }, [tags]);

  const createTag = async () => {
    if (!selectedProjectId || !newTagName.trim()) {
      toast.error('Selecciona un proyecto y escribe el nombre del tag.');
      return;
    }

    try {
      await tasksService.createTag({ project: selectedProjectId, name: newTagName.trim(), color: newTag.color });
      setNewTagName('');
      setNewTag({ color: DEFAULT_TAG_COLOR });
      refetchTags();
      toast.success('Tag creado.');
    } catch {
      toast.error('No se pudo crear el tag.');
    }
  };

  return (
    <div className="px-4 pb-6 pt-3 max-w-[1600px] min-h-full flex flex-col gap-4">

      {/* ── Header sobre el lienzo (shell unificado, sin caja) ─────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-[-0.01em] text-foreground">Product Backlog</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">Tareas sin sprint asignado.</p>
          </div>

          {/* project selector + new tag form */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedProjectId ?? ''}
              onChange={(e) => {
                setSelectedProjectId(e.target.value ? Number(e.target.value) : null);
                setSelectedTagIds([]);
              }}
              aria-label="Filtrar por proyecto"
              className="h-9 min-w-[180px] rounded-sm border border-border bg-surface-secondary px-2.5 text-[12px] text-foreground transition-[box-shadow,border-color] focus:outline-none focus:ring-2 focus:ring-ring focus:border-brand"
            >
              <option value="">Todos los proyectos</option>
              {(projects ?? []).map((project) => (
                <option key={project.id_project} value={project.id_project}>{project.name}</option>
              ))}
            </select>

            <div className="h-5 w-px bg-border" />

            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void createTag(); }}
              placeholder="Nuevo tag…"
              aria-label="Nombre del nuevo tag"
              className="h-9 w-32 rounded-sm border border-border bg-surface-secondary px-2.5 text-[12px] text-foreground placeholder:text-muted-foreground/60 transition-[box-shadow,border-color] focus:outline-none focus:ring-2 focus:ring-ring focus:border-brand disabled:opacity-50"
              disabled={!selectedProjectId}
            />

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={!selectedProjectId}
                  aria-label="Elegir color del tag"
                  className="h-9 w-9 rounded-sm border border-border shrink-0 transition-transform active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none"
                  style={{ backgroundColor: newTag.color }}
                />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64">
                <TagColorPicker value={newTag.color} onChange={(color) => setNewTag({ color })} />
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => void createTag()}
              disabled={!selectedProjectId || !newTagName.trim()}
              className="h-9 px-3 rounded-sm border border-border bg-card text-[12px] font-medium text-foreground disabled:opacity-40 inline-flex items-center gap-1.5 hover:bg-accent transition-colors active:scale-[0.97]"
            >
              <Plus className="w-3.5 h-3.5" /> Crear tag
            </button>
          </div>
        </div>

        {/* Tag filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
          {(tags ?? []).length === 0 ? (
            <span className="text-[11px] text-muted-foreground italic">Sin tags — selecciona un proyecto para ver sus tags.</span>
          ) : (
            (tags ?? []).map((tag) => {
              const selected = selectedTagIds.includes(tag.id_tag);
              return (
                <button
                  key={tag.id_tag}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedTagIds((current) => selected ? current.filter((id) => id !== tag.id_tag) : [...current, tag.id_tag])}
                  className={selected
                    ? 'inline-flex items-center h-6 px-2.5 rounded-full border text-[11px] font-medium transition-colors'
                    : 'inline-flex items-center h-6 px-2.5 rounded-full border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'}
                  style={selected ? {
                    borderColor: `${tag.color ?? DEFAULT_TAG_COLOR}88`,
                    backgroundColor: `${tag.color ?? DEFAULT_TAG_COLOR}22`,
                    color: tag.color ?? DEFAULT_TAG_COLOR,
                  } : undefined}
                >
                  {tag.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {loading ? (
        /* Skeleton con la silueta de la tabla */
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className={`grid ${TABLE_GRID} gap-4 border-b border-border bg-surface-secondary/50 px-4 py-2.5`}>
            {['Título', 'Prioridad', 'Tags', 'Proyecto'].map((h) => (
              <span key={h} className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-border/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`grid ${TABLE_GRID} gap-4 px-4 py-3 items-center`}>
                <div className="h-3 w-2/3 rounded-sm bg-surface-secondary animate-pulse" />
                <div className="h-4 w-16 rounded-full bg-surface-secondary animate-pulse" />
                <div className="h-4 w-20 rounded-full bg-surface-secondary animate-pulse" />
                <div className="h-3 w-24 rounded-sm bg-surface-secondary animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <p className="text-[12px] text-muted-foreground">No hay tareas en el backlog{selectedTagIds.length > 0 ? ' con esos tags' : ''}.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-auto">
          <table className="w-full min-w-[880px] text-[11px]">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/50">
                <th className="text-left px-4 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Título</th>
                <th className="text-left px-4 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] w-28">Prioridad</th>
                <th className="text-left px-4 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em]">Tags</th>
                <th className="text-left px-4 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.06em] w-40">Proyecto</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, i) => (
                <motion.tr
                  key={task.id_task}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.22, delay: reduced ? 0 : Math.min(i, 12) * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  className={`border-b border-border/60 align-top hover:bg-surface-secondary transition-colors ${i === filteredTasks.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-4 py-3 min-w-[360px]">
                    <p className="text-[12px] font-medium text-foreground">{task.title}</p>
                    {task.description && <p className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const priorityName = priorityById.get(task.priority);
                      if (!priorityName) return <span className="text-[10px] text-muted-foreground/50">—</span>;
                      return <StatusBadge status={getPriorityTone(priorityName)} text={priorityName} variant="pill" size="sm" />;
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {task.tags.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground/50">—</span>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {task.tags.slice(0, 3).map((tagId) => {
                          const tag = tagById.get(tagId);
                          return (
                            <span
                              key={`${task.id_task}-${tagId}`}
                              className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                borderColor: `${tag?.color ?? DEFAULT_TAG_COLOR}55`,
                                backgroundColor: `${tag?.color ?? DEFAULT_TAG_COLOR}1a`,
                                color: tag?.color ?? DEFAULT_TAG_COLOR,
                              }}
                            >
                              {tag?.name ?? `#${tagId}`}
                            </span>
                          );
                        })}
                        {task.tags.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{task.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">
                    {(projects ?? []).find((p) => p.id_project === task.project)?.name ?? `#${task.project}`}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
