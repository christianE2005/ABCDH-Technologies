// Version sincronizada manualmente con package.json. Bumpea aqui cuando subas version.
const PROJECT_VERSION = '0.1.0';

export function LandingFooter() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-[hsl(var(--line))]"
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 [font-family:var(--font-mono)] text-[hsl(var(--text-dim))] text-[11px]">
        <p className="flex flex-wrap gap-x-3 gap-y-1 items-center">
          <span>abcdh-tech</span>
          <span className="text-[hsl(var(--line))]" aria-hidden>/</span>
          <span>project-intelligence-platform</span>
          <span className="text-[hsl(var(--line))]" aria-hidden>/</span>
          <span>v{PROJECT_VERSION}</span>
          <span className="text-[hsl(var(--line))]" aria-hidden>/</span>
          <span>© 2026</span>
        </p>
      </div>
    </footer>
  );
}
