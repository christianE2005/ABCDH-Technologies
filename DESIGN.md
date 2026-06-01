# DESIGN.md — Sistema de Diseno ABCDH Project Intelligence Platform

> **ESTADO: BORRADOR PARA APROBACION.** Este documento es la direccion estetica ganadora ("YEMODA", base Direccion 1, con injertos aprobados de las Direcciones 2, 3 y 4). Una vez firmado por direccion/marca, pasa a ser **ley** del rediseno segun CLAUDE.md: ningun cambio visual puede contradecirlo. Las secciones marcadas con `⚠ PENDIENTE` (§11) requieren confirmacion humana antes de implementarse.

---

## 1. Posicionamiento y principios

**Nombre del sistema:** YEMODA. (confirmado)

**Una linea:** Se siente como abrir Linear o Vercel en una sala de juntas — silencioso, nitido, caro por contencion — pero con la temperatura calida de un portal de tesoreria corporativa y un unico trazo rojo TM que marca el norte.

**Tesis:** El lujo aqui es **ausencia, no ornamento**. Premium se demuestra con hairlines de 1px, sombras casi imperceptibles, neutros con temperatura y muchisimo aire — nunca con gradientes, glass ni decoracion. El producto real es el heroe; el TM Red es la marca y el color de accion. Claro y oscuro son dos calibraciones del mismo instrumento, ambas impecables.

### Principios

1. **El dato es el heroe, no la decoracion.** Cada pixel que no construye jerarquia se borra. Mostramos el producto con datos reales; no lo ilustramos con mockups inventados.
2. **TM Red = marca + accion.** Por decision de stakeholder (2026-05-31), el TM Red es el color del **CTA primario en todo el producto** (no solo la marca). Sigue siendo disciplina: NO se usa para **estados** (eso es `destructive`/`success`/`warning`), ni para toggles, ni se satura como fondo de seccion; en charts es la serie protagonista (`chart-1`). En la **landing** es ademas protagonista de marca.
3. **Premium por contencion medible.** Jerarquia con tipografia, peso y espacio — casi nunca con color. Hairline de 1px como lenguaje estructural primario; sombra solo donde separa de verdad.
4. **Neutro calido, no clinico frio.** Los neutros llevan una pizca de temperatura (sustrato hueso en claro, grafito tibio azulado en oscuro) que vuelve humano y caro un tablero denso. (injerto Dir 3)
5. **mono = dato medible / sans = prosa.** Invariante dura de todo el sistema: JetBrains Mono solo en cifras, IDs, SHAs, timestamps, rutas; Inter Tight en todo lo que se lee. (injerto Dir 3)
6. **Motion al servicio de la jerarquia.** Solo transform/opacity, <300ms, easing custom sin bounce. El movimiento confirma una accion o revela jerarquia; jamas entretiene. Se respeta `prefers-reduced-motion` siempre.
7. **Dual theme es contrato, no afterthought.** Cada primitivo se valida en claro y oscuro antes de mergear.

---

## 2. Tipografia

**Cero fuentes nuevas.** Ambas familias ya estan en el repo (`@fontsource/inter-tight`, `@fontsource/jetbrains-mono`). Esto preserva feasibility y bundle — fue el criterio decisivo de la votacion.

### Familias

| Rol | Familia | Import |
|-----|---------|--------|
| Display + UI + body | **Inter Tight** | `@fontsource/inter-tight` (pesos 400, 500, 600) |
| Dato / mono | **JetBrains Mono** | `@fontsource/jetbrains-mono` (pesos 400, 500) |

> Una sola familia sans cubre display + body (coherencia y carga minima). El mono se reserva como senal de "esto es dato verificable, no copy de marketing".

### Firma tipografica (el diferenciador anti-slop, gratis)

Activar OpenType features en Inter Tight a nivel `body`. Es CSS de 1 linea y es lo que separa este sistema de la Inter generica de IA:

```css
body {
  font-family: 'Inter Tight', system-ui, sans-serif;
  font-feature-settings: 'cv05', 'cv08', 'ss03', 'cv11';
  font-variant-numeric: tabular-nums; /* cifras de altura/ancho uniforme */
}
```

Donde haya cifras tabulares en mono o en KPI, reforzar con `font-variant-numeric: tabular-nums` para que las columnas no "bailen" al tickear.

### Escala tipografica

| Token | Tamano | Peso | Line-height | Tracking | Uso |
|-------|--------|------|-------------|----------|-----|
| `display-hero` | 56–64px (`clamp(2.75rem, 5vw, 4rem)`) | 600 | 1.05 | -0.025em | H1 hero landing (solo landing) |
| `h1` | 32px | 600 | 1.15 | -0.02em | Titulo de pagina, H2 de seccion landing |
| `h2` | 28px | 600 | 1.2 | -0.02em | Subtitulo de seccion |
| `h3` | 20px | 500 | 1.3 | -0.01em | Titulo de card/panel |
| `h4` | 16px | 500 | 1.4 | -0.01em | Subtitulo de modulo |
| `body-lg` | 16px | 400 | 1.55 | 0 | Prosa ejecutiva landing (max 68ch) |
| `body` | 14px | 400 | 1.5 | 0 | UI general, parrafos de tablero |
| `body-sm` | 13px | 400 | 1.5 | 0 | Tablas densas, descripciones |
| `label` | 11px | 500 | 1.4 | 0.06em (uppercase) | Labels de KPI, headers de columna |
| `kpi-number` | 28–32px | 500 (JetBrains Mono) | 1.0 | 0 (`tnum`) | Cifra protagonista de KPI |
| `mono-data` | 12–13px | 400 (JetBrains Mono) | 1.4 | 0 (`tnum`) | SHA, ID, timestamp, ruta |

### Reglas de uso

- **Display (56–64px) SOLO en el H1 del hero del landing.** Nunca en celdas de tabla, nunca en producto denso.
- **Maximo 2 pesos tipograficos por pantalla.** Si necesitas un tercer nivel, usa color (`muted-foreground`) o tamano, no un peso mas.
- **mono NUNCA en prosa** (cansa). **sans NUNCA en SHA/ID/timestamp** (rompe la senal de dato).
- **Texto centrado prohibido en bloques de prosa larga.** Alineacion a la izquierda, max 68ch.
- **Injerto editorial controlado (Dir 4):** se permite **una** pizca de gravitas en el numero KPI grande del hero del landing mediante peso 600 + tracking apretado de Inter Tight. **No se introduce Fraunces ni ningun serif** — el coste de bundle/LCP no se paga por un solo numero (rechazo explicito de jueces 2 y 3).

---

## 3. Sistema de color (tokens HSL para Tailwind 4)

> **CAMBIO ESTRUCTURAL CRITICO.** El `theme.css` actual usa **hex** (`#F3F4F6`, `#D4192C`...) y un fondo gris **frio** (`220 ... #F3F4F6`). Este sistema migra todo a formato **HSL "H S% L%"** (sin `hsl()`, listo para `@theme inline`) y a un sustrato **calido**. Es un reemplazo total del bloque de color, no un parche.

**TM Red recalibrado:** `#D4192C ≈ 354 70% 49%`. Se asienta a **`354 70% 47%`** en claro (un punto mas profundo para asentar sobre papel calido) y sube a **`354 78% 58%`** en oscuro (contraste AA sobre fondo profundo). Es ajuste de tono permitido por el brief; **marca debe firmar la recalibracion lado a lado** (§11).

**Decision de sistema (actualizada 2026-05-31):** `primary` (color de la accion CTA) es **TM Red** — por decision de stakeholder, los CTAs primarios del producto son rojos. `brand` (TM Red) coincide en valor con `primary` y se usa para marca/acentos. `destructive` es un **rojo-ladrillo distinto** para que "destructivo ≠ accion". El problema #4 del audit (rojo en 6 roles) se acota igual: rojo = accion primaria + marca + serie `chart-1`, pero NO estados (`success`/`warning`/`info`), ni toggles, ni bordes de input.

### 3.1 Tema CLARO

| Token | H S% L% | Rol |
|-------|---------|-----|
| `--background` | `36 24% 97%` | Lienzo hueso calido (NO blanco puro, NO gris frio) |
| `--foreground` | `222 22% 14%` | Tinta grafito tibio (NO negro puro) |
| `--card` | `40 30% 99%` | Superficie de card, gana elevacion sobre el hueso |
| `--card-foreground` | `222 22% 14%` | |
| `--popover` | `40 30% 99%` | |
| `--popover-foreground` | `222 22% 14%` | |
| `--surface-secondary` | `38 20% 95%` | Hover de fila, zebra sutil |
| `--surface-tertiary` | `36 16% 92%` | Fondo terciario |
| `--muted` | `38 20% 95%` | |
| `--muted-foreground` | `220 9% 42%` | Texto secundario, labels |
| `--border` | `38 16% 86%` | Hairline estructural primario |
| `--border-subtle` | `36 14% 91%` | Divisores internos de tabla |
| `--input` | `38 16% 86%` | Borde de input en reposo |
| `--input-background` | `40 30% 99%` | |
| `--ring` | `354 70% 47% / 0.32` | Focus ring (rojo a baja opacidad) |
| `--primary` (CTA = TM Red) | `354 70% 47%` | **Accion principal = TM Red** (decision stakeholder) |
| `--primary-foreground` | `40 30% 99%` | |
| `--secondary` | `38 20% 95%` | Boton secundario |
| `--secondary-foreground` | `222 22% 14%` | |
| `--accent` | `38 20% 95%` | Hover ghost |
| `--accent-foreground` | `222 22% 14%` | |
| `--brand` (TM Red) | `354 70% 47%` | **Acento de precision reservado** |
| `--brand-hover` | `354 72% 41%` | |
| `--brand-foreground` | `0 0% 100%` | |
| `--brand-wash` | `354 60% 96%` | Fondo de chip/badge de marca, pulso de criticidad |
| `--destructive` | `8 62% 48%` | **Rojo-ladrillo, distinto del brand** |
| `--destructive-foreground` | `0 0% 100%` | |
| `--success` | `152 48% 36%` | |
| `--success-foreground` | `0 0% 100%` | |
| `--warning` | `38 84% 42%` | |
| `--warning-foreground` | `0 0% 100%` | |
| `--info` | `214 78% 48%` | |
| `--info-foreground` | `0 0% 100%` | |
| `--ai-accent` | `256 52% 56%` | Lila desaturado, features AI |
| `--ai-accent-foreground` | `0 0% 100%` | |

**Charts (paleta fija de 5, injerto Dir 3):**

| Token | H S% L% | Rol |
|-------|---------|-----|
| `--chart-1` | `354 70% 47%` | **Serie protagonista = brand red** (la marca aparece dentro del dato) |
| `--chart-2` | `28 78% 52%` | Ambar calido |
| `--chart-3` | `168 52% 38%` | Teal apagado |
| `--chart-4` | `214 48% 48%` | Azul acero |
| `--chart-5` | `268 32% 56%` | Lila desaturado |

### 3.2 Tema OSCURO

> El dark NO es el `#0D1117` azul-frio terminal actual. Sube luminancia base y mete temperatura para que se sienta sala de control premium, no consola. En oscuro la elevacion la da el **border + surface mas claro**, no la sombra (que casi desaparece).

| Token | H S% L% | Rol |
|-------|---------|-----|
| `--background` | `224 28% 8%` | Azul-grafito profundo calido (NO negro #0D1117) |
| `--foreground` | `40 18% 92%` | Hueso tibio (NO blanco clinico) |
| `--card` | `222 22% 12%` | |
| `--card-foreground` | `40 18% 92%` | |
| `--popover` | `222 22% 14%` | |
| `--popover-foreground` | `40 18% 92%` | |
| `--surface-secondary` | `222 20% 14%` | |
| `--surface-tertiary` | `220 18% 18%` | |
| `--muted` | `222 20% 14%` | |
| `--muted-foreground` | `220 12% 62%` | |
| `--border` | `220 14% 22%` | Separador primario en oscuro |
| `--border-subtle` | `222 16% 16%` | |
| `--input` | `220 14% 22%` | |
| `--input-background` | `224 28% 8%` | |
| `--ring` | `354 78% 58% / 0.40` | |
| `--primary` (CTA = TM Red) | `354 78% 58%` | **Accion principal = TM Red** (mas luminoso en oscuro) |
| `--primary-foreground` | `224 28% 8%` | |
| `--secondary` | `222 20% 14%` | |
| `--secondary-foreground` | `40 18% 92%` | |
| `--accent` | `222 20% 14%` | |
| `--accent-foreground` | `40 18% 92%` | |
| `--brand` (TM Red) | `354 78% 58%` | Sube ~11 pts de luz para AA sobre fondo profundo |
| `--brand-hover` | `354 80% 64%` | |
| `--brand-foreground` | `0 0% 100%` | |
| `--brand-wash` | `354 40% 18%` | |
| `--destructive` | `6 68% 58%` | Rojo-ladrillo claro |
| `--destructive-foreground` | `0 0% 100%` | |
| `--success` | `150 50% 50%` | |
| `--success-foreground` | `0 0% 100%` | |
| `--warning` | `38 84% 58%` | |
| `--warning-foreground` | `224 28% 8%` | |
| `--info` | `214 84% 64%` | |
| `--info-foreground` | `0 0% 100%` | |
| `--ai-accent` | `256 70% 70%` | |
| `--ai-accent-foreground` | `0 0% 100%` | |

**Charts oscuro:**

| Token | H S% L% |
|-------|---------|
| `--chart-1` | `354 78% 60%` |
| `--chart-2` | `30 82% 60%` |
| `--chart-3` | `168 48% 50%` |
| `--chart-4` | `214 60% 62%` |
| `--chart-5` | `268 40% 66%` |

### 3.3 Rol exacto del TM Red (gobierno del rojo)

**Donde el rojo SI aparece (y en ningun otro lado):**
1. La **marca/wordmark** y el estado **activo del item de sidebar** (barra izquierda de 2px + texto, NO fondo solido).
2. El **kicker/regla de 2px** sobre titulos de seccion clave (injerto editorial Dir 4 — convierte el trazo-unico del hero en un sistema de acento repetible).
3. La **serie protagonista** en charts (`chart-1`) y el sparkline "hero" de cada KPI.
4. El **dato critico unico** de una vista: KPI en riesgo, badge "vencida", `brand-wash` de fondo en pulso de criticidad. **Maximo un acento rojo dominante por pantalla.**

**Donde el rojo NUNCA aparece:**
- **NO** es el color de **estados** (vencido/error/exito = `destructive`/`success`/`warning`), ni de toggles on, ni del chip "Tu"/you-are-here. (El CTA primario SÍ es rojo desde 2026-05-31 — ver §1, principio 2.)
- **NO** es color de estados (vencido/error/exito usan `destructive`/`success`/`warning`).
- **NO** es toggle on, **NO** es chip "Tu" / you-are-here, **NO** es borde permanente de input activo (eso es `ring` rojo a 32% de opacidad, sutil).

---

## 4. Elevacion, radios, bordes, espaciado

### Radios

> Subir del `--radius: 4px` actual (ADO duro) a **8px base** para sentir SaaS moderno premium sin redondear como app de consumo (>12px se ve "consumer", no operativo).

```css
--radius: 8px; /* base */
```

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | 6px | Inputs, badges, chips |
| `--radius-md` | 8px | Cards, botones |
| `--radius-lg` | 10px | KPI cards, paneles |
| `--radius-xl` | 12px | Modales, command palette, frame de producto del hero |
| (full) | 9999px | Pills, avatares |

### Elevacion (3 niveles, hairline, tinte calido)

Sombras de baja opacidad con tinte de tinta calida (NO negro puro `rgba(0,0,0,...)`). Encapsular en tokens/utilidades — **si un dev mete `box-shadow` negro generico, el sistema se ve barato al instante.**

| Nivel | Claro | Uso |
|-------|-------|-----|
| `shadow-xs` | `0 1px 2px hsl(222 24% 14% / 0.05)` | Card en reposo (landing) |
| `shadow-sm` | `0 2px 8px -2px hsl(222 24% 14% / 0.08), 0 1px 2px hsl(222 24% 14% / 0.05)` | Hover de card, popover |
| `shadow-md` | `0 8px 24px -6px hsl(222 24% 14% / 0.12)` | Modal, dropdown, frame de producto del hero |

> **Regla de oro de elevacion (injerto Dir 1):** las sombras viven en **landing, modales y popovers**. **Dentro de las pantallas operativas la elevacion se apaga y manda el border.** En oscuro las sombras casi desaparecen — la jerarquia la da `border-subtle` + surface mas claro (elevacion por luz, no por sombra). Esto evita que 8 zonas con sombra se vean "sucias".

### Bordes

- **Hairline 1px en TODO card/input/divisor.** El border es el lenguaje estructural primario; la sombra solo separa del fondo.
- **Prohibido borde de 2px+** excepto: indicador activo de sidebar y kicker rojo editorial.

### Espaciado (dual: landing respira, producto trabaja)

Se conserva la escala ADO densa existente (`--space-1: 2px` ... `--space-12: 64px`) para producto, y se anaden escalones altos para landing:

| Token | Valor | Densidad |
|-------|-------|----------|
| `--space-1`–`--space-8` | 2px–24px | **Operativa** (Dashboard/Projects/ProjectDetail) — se conserva tal cual |
| `--space-section` | 96–128px | **Comoda** (padding vertical de seccion de landing) |

Row-height de tabla: **36–40px**. Padding de celda: **8–12px**. Padding de card de landing: **20–24px**.

---

## 5. Motion (estilo Emil Kowalski)

### Principios

- **Solo `transform` y `opacity`.** Jamas animar layout/width/height ni color-hue (solo opacidad de tinte).
- **Duracion 120–240ms** (excepcion unica: count-up de cifras ≤600ms, una vez al montar).
- **Easing custom, sin bounce/spring/elastic.**
- El motion **confirma una accion o revela jerarquia**, nunca decora.

### Easings

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* entradas (out-expo refinado) */
--ease-in:  cubic-bezier(0.4, 0, 0.2, 1);    /* salidas */
```

### Tabla de animaciones

| Elemento | Que se anima | Como | Duracion |
|----------|--------------|------|----------|
| Hero product shot | opacity 0→1 + translateY 12px→0 + scale 0.985→1 | `--ease-out`, una vez al cargar | 240ms |
| Kicker/trazo rojo TM | scaleX 0→1 (origin left) | `--ease-out`, delay 120ms | 200ms |
| Cards/filas de seccion | opacity + translateY 8px→0 | stagger 40ms, IntersectionObserver `once:true` | 160ms c/u |
| KPI mount | opacity + translateY 6px→0 | stagger 24ms | <200ms total |
| KPI count-up | interpolacion 0→valor real | `--ease-out`, solo en mount; refetch hace cross-fade del numero | 280–600ms |
| Hover boton/card | translateY -1px + sombra sube un escalon | `--ease-out` | 120ms |
| Focus-visible | ring rojo 32% aparece | | 100ms |
| Popover/dropdown | scale 0.98→1 + opacity desde origen del trigger | `--ease-out` / `--ease-in` | 160ms / 120ms |
| Panel lateral (TaskDetail) | translateX 8px→0 + opacity | `--ease-out` | 160ms |
| Fila de tabla hover | solo `background-tint` | | 120ms |
| Tab activo | indicador se desliza (`layoutId`) | `--ease-out` | 180ms |
| Charts (recharts) | `isAnimationActive` solo en mount, desactivado en updates | ease-out | 320ms |

### Regla `prefers-reduced-motion`

Con `prefers-reduced-motion: reduce` **TODO colapsa al estado final instantaneo** (sin translate, sin scale, sin trazo). Los count-up muestran el valor final directo; el stagger pasa a 0; el hover de card solo cambia sombra sin translateY; los charts pintan sin animacion de entrada.

**Se reutiliza el hook ya existente** `src/app/pages/landing/useReducedMotion.ts` (ya implementado, limpio, con listener de `matchMedia`). Promoverlo a `src/app/hooks/` para uso global del producto.

> **Anti-fatiga (injerto Dir 3):** el reveal-on-scroll narrativo queda **PROHIBIDO en pantallas de producto** (si el usuario abre Dashboard 30 veces/dia, el motion no puede cansar). Solo se permite, muy sobrio, en el landing.

---

## 6. Componentes

### Botones

- **`primary`** (defecto): fondo `primary` ink solido (tinta grafito claro / casi-blanco oscuro), texto contraste, sin sombra fuerte. Altura 36px, radius 8px.
- **`primary-brand`** (variante **reservada**, injerto Dir 2/3): fondo `brand` rojo. **Maximo UNA por vista** (ej. "Nuevo Proyecto"). Se declara explicitamente en `buttonVariants` (CVA) para documentar la regla en codigo, no en prosa.
- **`secondary`**: borde 1px + fondo `secondary`/transparente.
- **`ghost`**: solo texto, hover = `accent` tint.
- Hover: translateY -1px + sombra un escalon (en landing) / solo oscurece a `brand-hover`/`primary-hover` (en producto, sin escalar).

### Cards

- Fondo `card`, **border 1px**, `shadow-xs` en reposo (landing) / **sin sombra, solo border** (producto). Sin gradiente ni glass jamas.
- Header de 1 linea: label uppercase 11px tracking-wide `muted-foreground` + valor.
- Barra de acento superior de 2px **solo cuando comunica criticidad** (rojo) — resuelve el "border-top sin significado" del audit. Nunca decorativa.

### Inputs

- Fondo `input-background`, border 1px `input`, radius 6px, altura 36px.
- Focus: `ring` rojo a 32% (2px) + borde `brand`. **NO borde rojo permanente.**

### Tablas densas

- Densidad operativa: row-height 36–40px, padding celda 8–12px.
- Separador: **hairline `border-subtle` entre filas** (no zebra pesada; zebra opcional via `surface-secondary` al 50%).
- Hover de fila: `surface-secondary` (NO scale, NO sombra).
- Header sticky. `StatusBadge` usa tokens semanticos (`success`/`warning`/`destructive`/`info`), **nunca hex crudo** (corrige el `red-500`/`emerald-500` del audit).
- mono solo en columnas de fecha/progreso/tiempo-restante/SHA; sans en titulos.

### Charts (recharts) — wrapper unico (injerto Dir 3)

Un wrapper compartido que aplica de forma invariante:
- **Sin gridlines verticales.** Gridline horizontal hairline al 40% de opacidad.
- **Tooltip = card de elevacion nivel 2** (`shadow-md`, radius 12px).
- `tabular-nums` en todos los ejes y tooltips.
- **Paleta fija de 5** (`chart-1..5`); `chart-1` = brand red = serie protagonista. Maximo 5 series; prohibido pie de 8 slices arcoiris.
- Fill de area: solido a baja opacidad o degradado sutil de `chart-color` a transparente (unico gradiente permitido en el sistema).
- `isAnimationActive` solo en mount.

> Existe un `chart.tsx` shadcn que ya extiende recharts — el wrapper se construye sobre el, no desde cero.

### Badges / estados

- `success`/`warning`/`destructive`/`info`/`ai-accent` segun semantica, nunca `brand` para estado.
- Badge "vencida" / criticidad: el unico punto donde brand red toca un estado, y es por su rol de "atencion ejecutiva", no de error tecnico.
- Pills radius full. Sin emojis.

---

## 7. Anti-slop (PROHIBICIONES)

PROHIBIDO, sin excepciones:

1. **Gradientes purpura-azul** o cualquier gradiente multicolor/mesh/aurora de fondo. Unico gradiente permitido: fill sutil bajo un area-chart.
2. **Glassmorphism** (`backdrop-blur` sobre superficies translucidas). Unica excepcion: blur del sticky-header al hacer scroll.
3. **Hero centrado con blob/orbe/glow radial** detras.
4. **Inter regular como display.** El display es Inter Tight 600 con features tipograficas activadas. (Y **no** se introduce Fraunces/Geist/ningun serif.)
5. **Sombras negras genericas** `rgba(0,0,0,.1)`, glow neon, text-shadow brillante, drop-shadow-2xl. Toda sombra lleva tinte calido tokenizado.
6. **Rojo como fondo de seccion/card**, como CTA primario por defecto, como toggle on, o en mas de ~3 puntos por pantalla.
7. **Bounce/spring/elastic/overshoot** en cualquier transicion. Cualquier animacion >300ms fuera del count-up.
8. **Bordes de 2px+** excepto indicador activo de sidebar y kicker editorial.
9. **Mas de 2 pesos tipograficos por pantalla.** Texto centrado en prosa larga.
10. **Emojis en UI**, ilustraciones 3D/isometricas/stock, "blob people", iconos decorativos grandes flotando junto a cada feature (look plantilla SaaS).
11. **Estetica terminal/consola:** cursor parpadeante, prompts `>`, sintaxis `[Acceder →]`, mono como fuente dominante. (Esto fue la Direccion B rechazada — ver §10.)
12. **Datos/metricas/testimonios inventados.** "Join 10,000 teams", uptime falso, "Maria Gonzalez 99.9%". Regla heredada del audit: **dato real atribuible o se borra/etiqueta "demo" la seccion.**
13. **Mockups inventados que no son el producto real** en el hero.
14. **Mezclar primitivos nuevos con MUI en la misma vista.**
15. **Border-radius >12px en producto** (se ve consumer, no operativo).

---

## 8. Estructura del landing nuevo

Comprador: VP de Operaciones / jefe de PMO. Perfil ejecutivo, no developer. El landing vende **mostrando el producto calibrado**, no con pitch.

1. **Sticky header** — wordmark TM (acento rojo), nav minima, theme toggle, CTA "Acceder" (ink). Unico lugar con `backdrop-blur` permitido, al scrollear.

2. **Hero (split asimetrico, NO centrado):**
   - **Columna izquierda (~45%):** kicker rojo de 2px → H1 display 56–64px Inter Tight tight (palabra clave con subrayado/trazo rojo animado) → subtitulo `body-lg` → CTA dual: "Acceder" (`primary` ink) + "Ver demo" (ghost/link secundario). Copy en espanol, sin estetica terminal.
   - **Columna derecha (~55%):** **screenshot/composicion REAL del Dashboard** (KPI strip + mini-tabla de proyectos + chart de salud recharts) en un frame con border + `shadow-md` + radius 12px, con leve recorte que sugiere que el producto continua (se asoma, no se centra con blob).
   - ⚠ Requiere **seed data real o estado curado claramente etiquetado "demo"** — el admin de pruebas hoy tiene 0 proyectos (riesgo del audit). Sin esto, el hero miente igual que el mockup actual.

3. **Fila de bloques de confianza** — metricas reales atribuibles (proyectos activos, push events procesados, integraciones) o se omite la fila. Logos/sellos institucionales en grayscale calido si los hay. **Nada inventado.**

4. **Capacidades** — 3–4 bloques (GitHub integration, sprints/backlog, reportes ejecutivos PDF/XLSX, alertas/warnings) cada uno abierto por kicker rojo de 2px + titulo Inter Tight + regla horizontal (ritmo editorial Dir 4). Cada bloque con un frame de producto real, no spot-illustration.

5. **Reportes ejecutivos** — destacar export PDF/XLSX (lo que un VP firma), con preview real.

6. **CTA de cierre** + **footer** (reusar `LandingFooter.tsx` re-pieleado).

---

## 9. Trasplante a pantallas densas

El sistema comparte tokens entre landing y producto; **solo cambia la densidad de espaciado** (landing usa `--space-section` alto; producto el ADO bajo de 2–16px).

### Dashboard (6+ KPIs)
- Cada KPI = `KPICard` (primitivo unico): label mono uppercase 11px arriba, cifra JetBrains Mono 28–32px `tnum`, delta con flecha + **color semantico** (no brand red), **sparkline recharts 40px al pie con trazo `chart-1`** (la marca aparece dentro del dato).
- Grid responsive 3×2 → 2×3 → 1col, todos con border hairline, **elevacion apagada** (border manda).
- Pie "Salud Portafolio": paleta de chart fija, **riesgo usa `warning`/`destructive` semantico, NO `chart-1` rojo**.
- Entran con stagger de 24–40ms (mismo motion que el landing).

### Projects (tabla densa)
- Densidad operativa, filas 38px, hairline `border-subtle` entre filas, header sticky.
- `StatusBadge` tokenizado. Una sola accion primaria roja (`primary-brand`: "Nuevo Proyecto").
- Hover = `surface-secondary` (no scale). Rojo solo en el dot de "vencida".
- Display (56px) **nunca** en celdas — solo el H1 de pagina (32px).

### ProjectDetail (la mas densa: Timeline + Tasks + GitHub)
- **El border es el unico separador** entre las 3 zonas (no sombras acumuladas — unifica los "4 estilos visuales distintos" del audit).
- Ritmo de **bandas editoriales (injerto Dir 4):** cada subseccion abre con kicker rojo 2px + titulo Inter Tight semibold + regla horizontal. Da ritmo de revista a una pantalla saturada.
- **JetBrains Mono** marca SHAs/IDs/branches/timestamps del feed GitHub; **Inter Tight** los mensajes de commit y titulos de tarea. Jerarquia mono=dato / sans=prosa sin caer en terminal.
- `ADOTabs` re-pieleado: token de border + underline rojo 2px para el tab activo (rojo como seleccion = permitido).
- `KPICard` del header identico al de Dashboard.

**Invariantes que mantienen coherencia entre las 3 pantallas sin auditoria manual:** (1) mono=dato / sans=prosa, (2) paleta de chart fija de 5 con rojo solo en serie protagonista, (3) elevacion por border en producto.

---

## 10. Reconciliacion con lo ya hecho (Direccion B → YEMODA)

El landing actual (`src/app/pages/landing/`) se construyo en una "Direccion B" terminal/consola oscura, mono-dominante, deliberadamente fria — **rechazada**. Se pivota a SaaS premium calido ejecutivo.

### Se CONSERVA
- **`useReducedMotion.ts`** — hook limpio y correcto. Se reutiliza tal cual; promoverlo a `src/app/hooks/`.
- **El patron de motion bien hecho** (IntersectionObserver `once:true`, stagger, solo transform/opacity, respeto a reduced-motion).
- **La disciplina de datos reales no inventados** — el `MetricStrip` / feed se reusa conceptualmente, pero con datos reales atribuibles o etiquetados demo.
- La **estructura de archivos por bloque** (`HeroBlock`, `MetricStrip`, footer...) como esqueleto a re-pielar.

### Se REEMPLAZA
- **Toda la estetica terminal:** `--font-mono` como display en H1, cursor parpadeante (`landing-blink`), `> ./status`, sintaxis `[Acceder → ]`, `--font-grotesque`/`--void`/`--brand` como variables locales del landing.
- El H1 mono pasa a **Inter Tight display 56–64px**.
- El CTA `[Acceder →]` con border-2 rojo pasa a **boton `primary` ink** (rojo se reserva).
- El hero "consola" pasa a **split asimetrico con frame de producto real**.

### Nota de arquitectura de tokens (LEY)
- **Los tokens viven en `src/styles/theme.css`, NO inline en la pagina.** El landing actual define `--void`, `--brand`, `--text-dim`, etc. inline/locales — eso se elimina. Todo color/radio/sombra sale de `theme.css` via `@theme inline`.
- **Cambios visuales arrancan SIEMPRE por `src/app/components/ui/` (primitivos) o `theme.css` (tokens), nunca por la pagina** (regla de `redesign-plan.md`).
- Migracion de `theme.css` de **hex → HSL "H S% L%"** es el primer entregable (fase tokens) y es prerrequisito de todo lo demas.

---

## 11. Decisiones pendientes (requieren confirmacion humana)

1. **✓ Naming del sistema: YEMODA** (confirmado por el equipo). Evaluar al publicar si debe alinear con el branding TM Red / TM Mahindra.
2. **⚠ Recalibracion del TM Red.** `#D4192C` → `354 70% 47%` (claro) / `354 78% 58%` (oscuro). Es ajuste de tono permitido por el brief, pero **marca debe firmarlo viendo el original y el recalibrado lado a lado**, en ambos temas, sobre fondo papel calido.
3. **⚠ "Menos rojo" como argumento de marca.** Mover el CTA primario a tinta y reservar el rojo a ~3 roles puede leerse politicamente como "menos presencia corporativa". Direccion debe firmar que **la contencion ES el premium** (la memoria ya marca TM Red como activo corporativo confirmado; aqui se honra como sello, no como relleno).
4. **⚠ Seed data / estado demo para el hero.** El hero exige un Dashboard real con datos creibles; el admin de pruebas tiene 0 proyectos. Decidir: ¿seed data real curado, o dataset demo claramente etiquetado? Sin esto no se fotografia el hero.
5. **⚠ Licencias de fuente.** Inter Tight y JetBrains Mono ya estan en el repo via `@fontsource` (OFL, libres) — **no hay coste ni fuente nueva**. Confirmar que no se introduce Fraunces/Geist (recomendacion firme: no introducir, por bundle/LCP/QA).
6. **⚠ Convivencia con MUI legacy.** El blanco/hueso calido junto al gris GitHub de MUI puede leerse "sucio" hasta que MUI migre. Validar contraste de convivencia en monitor real, y confirmar el orden de migracion de MUI.
7. **⚠ Calibracion en monitores reales.** Validar: (a) el hueso `36 24% 97%` no se vuelve "sepia/viejo" (mantener saturacion ≤24%); (b) el dark `224 28% 8%` no se va a "morado/lavanda" (clavar hue ≤230); (c) las sombras tinte-calido se leen como elevacion, no como suciedad. QA obligatorio en ambos temas para cada primitivo.

---

**Archivos relevantes para la implementacion (todos absolutos):**
- `c:\Users\operaciones3\Documents\Web\project-intelligence-platform\src\styles\theme.css` — migrar hex→HSL, sustituir bloque de color, `--radius` 4→8px, sombras tinte-calido. Primer entregable.
- `c:\Users\operaciones3\Documents\Web\project-intelligence-platform\src\app\pages\landing\useReducedMotion.ts` — conservar, promover a hook global.
- `c:\Users\operaciones3\Documents\Web\project-intelligence-platform\src\app\pages\landing\` — esqueleto a re-pielar (eliminar estetica terminal).
- `c:\Users\operaciones3\Documents\Web\project-intelligence-platform\src\app\components\ui\` — primitivos donde aterriza todo cambio visual (botones con variante `primary-brand`, KPICard, wrapper de chart).
