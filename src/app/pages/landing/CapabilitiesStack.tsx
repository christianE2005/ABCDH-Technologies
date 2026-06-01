type Capability = {
  id: string;
  label: string;
  title: string;
  description: string;
  diagram: string;
};

// Cada bloque referencia codigo verificable. Sin features inventadas, sin specs especulativas:
// - CAP_01 / CAP_02 = src/app/utils/projectHealth.ts (thresholds reales).
// - CAP_03 = ApiTaskWarning de src/services/types.ts (avisos resueltos cuando un push los cierra).
// - CAP_04 = src/app/utils/projectPermissions.ts (capability flags por rol).
// - CAP_05 = jspdf + jspdf-autotable + xlsx en package.json.
// - CAP_06 = src/services/github.service.ts (endpoints reales).
const CAPABILITIES: Capability[] = [
  {
    id: 'CAP_01',
    label: 'progress_tracking',
    title: 'Avance por proyecto',
    description:
      'Cada tarea cerrada empuja el porcentaje. El frontend agrega tareas por proyecto (directo o via board) y reporta { completed, total, percentage } sin pasar por backend.',
    diagram:
`input   ApiTask[], ApiBoard[], projectId
            │
            ▼
proc    computeProjectProgress(projectId, tasks, boards)
            ▸ filtra tasks donde task.project = id ∪ task.board ∈ boards[project]
            ▸ count completed = tasks.filter(t => t.completed_at)
            ▼
output  ProjectProgress { completed, total, percentage }`,
  },
  {
    id: 'CAP_02',
    label: 'health_signals',
    title: 'Salud del proyecto',
    description:
      'Tres estados (green · yellow · red) calculados desde el avance y la ventana al deadline. Reglas explicitas en el repo, sin ML, sin caja negra.',
    diagram:
`getProjectHealth(project, progress, now)
   ├─ end_date < now                       → red
   ├─ pct < 40  ∧  elapsed_ratio ≥ 0.75    → red
   ├─ days_to_end < 14  ∧  pct < 75        → yellow
   ├─ pct ≥ 75                             → green
   └─ progress.total = 0                   → yellow`,
  },
  {
    id: 'CAP_03',
    label: 'task_warnings',
    title: 'Avisos cerrados por push',
    description:
      'Los avisos de tarea viven con estado active / resolved y referencia opcional al push que los cerro. Cuando un commit resuelve una tarea, su warning queda enlazado a ese push.',
    diagram:
`ApiTaskWarning {
   id_warning, message, status: 'active' | 'resolved',
   created_at, resolved_at,
   task, resolved_in_push   ← FK a ApiGithubPushEvent
}
flow:  active ──(push referencia tarea)──▶ resolved_in_push = push.id`,
  },
  {
    id: 'CAP_04',
    label: 'rbac_layer',
    title: 'Roles y permisos',
    description:
      'Capacidades por rol de proyecto. Los componentes consultan flags resueltos por projectPermissions.ts, nunca comparan nombres de rol crudos (los nombres llegan en espanol con acentos del backend).',
    diagram:
`resolveProjectCapabilities(user, project, members, roles)
   → role ∈ { Project Manager, Product Owner, Scrum Master, Developer, Stakeholder }
   → ProjectCapabilities {
        canManageProject, canManageTasks, canCreateRepos,
        canEditBoard, canCloseProject, ...
     }`,
  },
  {
    id: 'CAP_05',
    label: 'report_export',
    title: 'Reportes a PDF y XLSX',
    description:
      'La capa de export usa librerias publicas. PDF tabulado con jsPDF + autoTable. Hojas de calculo con SheetJS. Sin dependencias de servicio externo.',
    diagram:
`reportExport
   ├─ format: pdf   →  jspdf  +  jspdf-autotable
   ├─ format: xlsx  →  xlsx   (SheetJS)
   └─ scope:           project · portfolio · sprint`,
  },
  {
    id: 'CAP_06',
    label: 'github_sync',
    title: 'Integracion GitHub',
    description:
      'Conexion OAuth por usuario + instalacion de GitHub App por organizacion. El backend recibe push events; el frontend los lista y los relaciona con tareas.',
    diagram:
`GET    /api/github/connection/status/    → ¿conectado?
GET    /api/github/app/oauth/start/      → redirect a GitHub
POST   /api/github/app/oauth/callback/   → tokens + github_login
GET    /api/github/pushes/?project=…     → ApiGithubPushEvent[]
POST   /api/github/repos/                → crear repo (admin)`,
  },
];

export function CapabilitiesStack() {
  return (
    <section
      aria-labelledby="capabilities-heading"
      className="px-4 md:px-8 py-12 md:py-16 max-w-[1200px] mx-auto"
    >
      <p
        id="capabilities-heading"
        className="[font-family:var(--font-mono)] text-[hsl(var(--text-dim))] text-[12px] mb-8"
      >
        <span className="text-[hsl(var(--brand))]">{'> '}</span>./capabilities
      </p>
      <ul className="border-t border-[hsl(var(--line))]">
        {CAPABILITIES.map((cap) => (
          <li
            key={cap.id}
            className="border-b border-[hsl(var(--line))] py-8 grid gap-4 md:gap-8 md:grid-cols-[180px_minmax(0,1fr)]"
          >
            <div className="min-w-0 [font-family:var(--font-mono)] text-[11px]">
              <div className="text-[hsl(var(--brand-strong))]">{cap.id}</div>
              <div className="text-[hsl(var(--text-dim))] mt-1">{cap.label}</div>
            </div>
            <div className="min-w-0">
              <h3 className="[font-family:var(--font-grotesque)] text-xl md:text-2xl text-[hsl(var(--text))] mb-3 tracking-tight">
                {cap.title}
              </h3>
              <p className="[font-family:var(--font-grotesque)] text-[hsl(var(--text-dim))] mb-5 max-w-2xl leading-relaxed">
                {cap.description}
              </p>
              <pre
                aria-hidden
                className="[font-family:var(--font-mono)] text-[11px] md:text-[12px] text-[hsl(var(--text-dim))] overflow-x-auto whitespace-pre bg-[hsl(var(--rail))] border border-[hsl(var(--line))] p-3 md:p-4 max-w-full"
              >
                {cap.diagram}
              </pre>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
