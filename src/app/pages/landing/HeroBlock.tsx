import { Link } from 'react-router';
import { MetricStrip } from './MetricStrip';

export function HeroBlock() {
  return (
    <section
      id="status"
      aria-labelledby="status-heading"
      className="px-4 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20 max-w-[1200px] mx-auto"
    >
      <p className="[font-family:var(--font-mono)] text-[hsl(var(--text-dim))] text-[12px] mb-6">
        <span className="text-[hsl(var(--brand))]">{'> '}</span>./status
      </p>

      <MetricStrip />

      <h1
        id="status-heading"
        className="mt-12 [font-family:var(--font-mono)] text-[hsl(var(--text))] text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05]"
      >
        Plataforma de operacion
        <br />
        de portafolio.
        <span
          aria-hidden
          className="inline-block w-3 md:w-4 h-[0.8em] bg-[hsl(var(--brand))] ml-2 landing-blink align-[-0.05em]"
        />
      </h1>

      <p className="mt-6 max-w-2xl [font-family:var(--font-grotesque)] text-[hsl(var(--text-dim))] text-base md:text-lg leading-relaxed">
        Consola de operacion para portafolios corporativos. Metricas en vivo, eventos
        del producto en stream, integracion con GitHub. Sin pitch, sin dashboards de demo:
        lo que ve aqui es lo que opera ABCDH.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <Link
          to="/login"
          className="group inline-flex items-center justify-center gap-3 [font-family:var(--font-mono)] text-[13px] text-[hsl(var(--text))] border-2 border-[hsl(var(--brand))] bg-[hsl(var(--void))] px-5 py-3 hover:bg-[hsl(var(--brand))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--void))]"
          style={{ transition: 'none' }}
        >
          <span className="text-[hsl(var(--brand))] group-hover:text-[hsl(var(--void))]">
            [
          </span>
          <span className="group-hover:text-[hsl(var(--void))]">Acceder</span>
          <span className="text-[hsl(var(--brand))] group-hover:text-[hsl(var(--void))]">
            → ]
          </span>
        </Link>
      </div>
    </section>
  );
}
