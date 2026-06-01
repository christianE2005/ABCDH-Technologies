// Brand: TM Red como rojo phosphor, sign-off recibido. Amber migrado a rol de warning.
// Landing es dark-only por diseno. ThemeContext NO se consulta aqui — es decision deliberada de la fase de rediseno.
// Datos demo. Reemplazar con hook real cuando endpoint exista.

import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/inter-tight/400.css';
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/700.css';

import type { CSSProperties } from 'react';
import { StatusBar } from './landing/StatusBar';
import { HeroBlock } from './landing/HeroBlock';
import { LogFeed } from './landing/LogFeed';
import { CapabilitiesStack } from './landing/CapabilitiesStack';
import { ArchitectureDiagram } from './landing/ArchitectureDiagram';
import { AuthBlock } from './landing/AuthBlock';
import { LandingFooter } from './landing/LandingFooter';
import { SectionDivider } from './landing/SectionDivider';
import { useReducedMotion } from './landing/useReducedMotion';

const LANDING_TOKENS = {
  '--brand': '354 85% 56%',
  '--brand-strong': '354 85% 62%',
  '--accent-on': '135 70% 50%',
  '--accent-warn': '38 100% 56%',
  '--void': '220 30% 4%',
  '--panel': '220 22% 8%',
  '--rail': '220 16% 12%',
  '--line': '220 10% 22%',
  '--text': '210 15% 95%',
  '--text-dim': '220 8% 58%',
  '--font-mono':
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  '--font-grotesque':
    "'Inter Tight', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  backgroundColor: 'hsl(220 30% 4%)',
  color: 'hsl(210 15% 95%)',
  backgroundImage:
    'linear-gradient(hsl(220 10% 22% / 0.18) 1px, transparent 1px), linear-gradient(90deg, hsl(220 10% 22% / 0.18) 1px, transparent 1px)',
  backgroundSize: '80px 80px',
  backgroundPosition: '-1px -1px',
} as CSSProperties;

const KEYFRAMES = `
  @keyframes landing-blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes landing-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.45; transform: scale(0.6); }
  }
  .landing-blink { animation: landing-blink 1s steps(2) infinite; }
  .landing-pulse { animation: landing-pulse 1.8s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .landing-blink, .landing-pulse { animation: none !important; }
  }
  [data-reduce-motion="true"] .landing-blink,
  [data-reduce-motion="true"] .landing-pulse {
    animation: none !important;
  }
`;

export default function Landing() {
  const reduced = useReducedMotion();
  return (
    <div
      style={LANDING_TOKENS}
      data-reduce-motion={reduced ? 'true' : 'false'}
      className="min-h-screen [font-family:var(--font-grotesque)] selection:bg-[hsl(var(--brand))] selection:text-[hsl(var(--void))]"
    >
      <style>{KEYFRAMES}</style>
      <a
        href="#status"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[hsl(var(--brand))] focus:text-[hsl(var(--void))] focus:px-3 focus:py-2 [font-family:var(--font-mono)] text-[12px]"
      >
        Saltar al contenido
      </a>
      <StatusBar />
      <main>
        <HeroBlock />
        <SectionDivider tag="end ./status · begin ./live" />
        <LogFeed />
        <SectionDivider tag="end ./live · begin ./capabilities" />
        <CapabilitiesStack />
        <SectionDivider tag="end ./capabilities · begin ./architecture" />
        <ArchitectureDiagram />
        <SectionDivider tag="end ./architecture · begin ./auth.login" />
        <AuthBlock />
      </main>
      <LandingFooter />
    </div>
  );
}
