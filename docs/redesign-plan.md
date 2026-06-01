# redesign-plan.md — Plan de rediseño frontend (Sistema YEMODA)

> **Ley:** [DESIGN.md](../DESIGN.md) (raíz) define el sistema **YEMODA** (SaaS premium moderno, neutros cálidos, TM Red como acento de precisión). Este documento define el **orden de ejecución**. Ningún cambio visual ocurre fuera de la fase activa.

Fecha de inicio: 2026-05-31 · Rama base del rediseño: `redesign/landing-pilot`.

---

## Principios de ejecución (de CLAUDE.md)

1. **Tokens y primitivos primero, páginas después.** Todo cambio visual arranca en `src/styles/theme.css` (tokens) o `src/app/components/ui/` (primitivos), nunca en una página.
2. **Una rama por pantalla** (`redesign/<pantalla>`). Nunca varias pantallas en un PR.
3. **No renombrar** variables/funciones/componentes existentes; los reemplazos siguen este plan, no se deciden en caliente.
4. **MUI sigue funcionando** hasta que todas las pantallas migren. No mezclar primitivos nuevos con MUI en la misma vista.
5. **Datos reales o etiquetados "demo".** Prohibido inventar KPIs/testimonios (regla heredada del audit).

---

## Fase 0 — Fundación · ✅ COMPLETA

- ✅ Auditoría (fase 1): [frontend-audit.md](audit/frontend-audit.md), [routes-inventory.md](audit/routes-inventory.md), capturas.
- ✅ Exploración de dirección y elección: pivote de "Dirección B (consola fría)" a **YEMODA** (premium moderno). Ver [landing-directions.md](audit/landing-directions.md) + panel de diseño.
- ✅ [DESIGN.md](../DESIGN.md) escrito y aprobado (nombre **YEMODA**).
- ✅ Skill de microanimación de Emil Kowalski instalada (`.claude/skills/emil-design-eng/`).

---

## Fase 1 — Tokens (`theme.css`) · 🟡 EN CURSO

**Objetivo:** congelar el sistema de color/radio/sombra/tipografía de YEMODA en `src/styles/theme.css`. Es prerrequisito de todo lo demás.

**Hecho en esta fase:**
- Migración del bloque de color **hex → `hsl()`** con la paleta YEMODA (claro + oscuro) de DESIGN.md §3.
- `--primary` pasa de TM Red a **tinta neutra**; se añade el token **`--brand`** (+ `--brand-hover/-foreground/-wash`) para el TM Red reservado.
- `--destructive` recalibrado a rojo-ladrillo (distinto del brand).
- Neutros cálidos (hueso en claro, grafito azulado cálido en oscuro), no el gris/azul frío anterior.
- `--radius` 4px → **8px** (escala sm6/md8/lg10/xl12).
- Sombras de elevación con tinte cálido: `--elevation-1/2/3` → utilidades `shadow-e1/e2/e3`.
- Tipografía: `--font-family` → **Inter Tight**, `--font-mono` → **JetBrains Mono**; features OpenType + `tabular-nums` en `body`. Fuentes cargadas global en `main.tsx`.

**Decisión de implementación:** los tokens se guardan como **`hsl()` completo** (no triplets bare `H S% L%`). Mismos valores HSL de DESIGN.md, pero así **no se rompen** los usos crudos de `var(--token)` ya existentes (recharts en `Reports.tsx`/`Dashboard.tsx`, scrollbars en `tailwind.css`/`CreateUsers.tsx`, `sonner.tsx`, `ProgressBar.tsx`). La composición con alpha se hace con los modificadores `/opacity` de Tailwind 4 (`bg-brand/30`, `ring-ring/50` → `color-mix`), no requiere triplets.

**⚠ Efecto esperado (re-skin global):** al ser tokens globales, **todas las pantallas cambian de apariencia de inmediato** (neutros cálidos + CTA en tinta + radios 8px + fuente Inter Tight) aunque su layout siga siendo el viejo. Esto es **intencional y solo en la rama de rediseño**. Las pantallas se ven "en transición" hasta que cada una se migre en su fase. No se mergea a `main` hasta validar.

**Criterio de aceptación:** `npm run build` pasa · la app renderiza con la paleta YEMODA en claro y oscuro · ningún token consumido quedó indefinido · QA visual en monitor real (hueso no se ve "sepia"; oscuro no se ve "morado"; sombras se leen como elevación).

**Pendiente de firma (DESIGN.md §11):** recalibración exacta del TM Red (marca lo ve lado a lado) · aceptar "menos rojo" como postura.

---

## Fase 2 — Primitivos (`src/app/components/ui/`)

Actualizar los primitivos shadcn/Radix al lenguaje YEMODA (sin tocar páginas):

- **Botón:** variante `primary` (tinta) por defecto + variante reservada **`primary-brand`** (rojo, máx 1 por vista, documentada en `buttonVariants`/CVA). Hover translateY/sombra (landing) vs solo color (producto). `:active { scale(0.97) }` (skill de Emil).
- **Card:** border 1px + `shadow-e1` (landing) / solo border (producto). Sin gradiente/glass. Barra de acento superior solo en criticidad.
- **Input/Select:** focus = `ring` brand a baja opacidad + borde brand; radius 6px.
- **Badge / StatusBadge:** tokens semánticos (`success/warning/destructive/info`), nunca hex crudo.
- **KPICard** (nuevo primitivo): label mono uppercase 11px + cifra JetBrains `tnum` 28–32px + delta semántico + sparkline recharts `chart-1`.
- **Chart wrapper** (nuevo, sobre `chart.tsx`): sin gridlines verticales, gridline horizontal hairline 40%, tooltip = card elevación 2, `tabular-nums`, paleta fija de 5, `isAnimationActive` solo en mount.
- **Motion:** promover `useReducedMotion.ts` de `landing/` a `src/app/hooks/`. Definir easings/utilidades estándar.

**Criterio:** primitivos cubiertos por sus tests existentes (StatusBadge, ProgressBar…) siguen verdes · demo visual en claro/oscuro.

---

## Fase 3 — Landing (rama `redesign/landing`)

Reconstruir el landing sobre YEMODA reemplazando la estética terminal (Dirección B). Conservar `useReducedMotion`, patrón de motion y disciplina de datos reales (DESIGN.md §10). Hero split asimétrico con **frame de producto real** (DESIGN.md §8).

**Bloqueante:** decisión de **seed data / dataset demo etiquetado** para el hero (DESIGN.md §11.4) — el admin de pruebas tiene 0 proyectos.

---

## Fase 4+ — Migración por pantalla (una rama cada una)

Orden por uso/densidad/visibilidad (de [frontend-audit.md](audit/frontend-audit.md)):

| Orden | Pantalla | Rama | Notas |
|-------|----------|------|-------|
| 1 | **Login** | `redesign/login` | Hereda tokens/estética del landing; alta visibilidad |
| 2 | **Dashboard** | `redesign/dashboard` | La más vista; usa KPICard + chart wrapper |
| 3 | **Projects** | `redesign/projects` | Tabla densa; StatusBadge tokenizado |
| 4 | **ProjectDetail** | `redesign/project-detail` | La más densa (Timeline+Tasks+GitHub); requiere seed data |
| 5 | **Backlog** | `redesign/backlog` | |
| 6 | **Alerts** | `redesign/alerts` | |
| 7 | Users / Profile / Settings | una rama c/u | Menor alcance |
| 8 | NotFound | `redesign/notfound` | Barata; corregir bug de routing (sin AppLayout) |

---

## Bloqueantes transversales (atender antes de las fases que dependan)

- **`/reports` caída** — verificar deps `jspdf`/`jspdf-autotable`/`xlsx` (ya en `package.json`); confirmar que carga antes de migrarla.
- **Mobile roto** — sidebar fijo 220px rompe rutas autenticadas; resolver en la migración de `AppLayout`/`Sidebar`.
- **Sidebar oscuro** — en Fase 1 quedó como riel oscuro cálido en ambos temas; su tratamiento final (claro vs oscuro en tema claro) se decide al migrar `AppLayout`.
- **Convivencia MUI** — validar contraste del hueso cálido junto al gris MUI; definir orden de retiro de MUI.
- **Código muerto** — `Register` no está en el router: decidir borrar o cablear.
