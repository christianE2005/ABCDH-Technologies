import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

const HOST = 'pi.abcdhtechnologies.com';
const VERSION = '0.1.0';

function utcClock(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function StatusBar() {
  const reduced = useReducedMotion();
  const [now, setNow] = useState(() => utcClock(new Date()));

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setNow(utcClock(new Date())), 1000);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div
      role="status"
      aria-live="off"
      className="border-b border-[hsl(var(--line))] bg-[hsl(var(--void))] text-[hsl(var(--text-dim))] [font-family:var(--font-mono)] text-[11px] tracking-tight px-4 md:px-8 py-2 flex flex-wrap items-center gap-x-4 gap-y-1"
    >
      <span>
        host: <span className="text-[hsl(var(--text))]">{HOST}</span>
      </span>
      <span className="text-[hsl(var(--line))]" aria-hidden>|</span>
      <span>
        version: <span className="text-[hsl(var(--text))]">{VERSION}</span>
      </span>
      <span className="text-[hsl(var(--line))]" aria-hidden>|</span>
      <span>
        utc: <span className="text-[hsl(var(--text))] tabular-nums">{now}</span>
      </span>
      <span className="text-[hsl(var(--line))]" aria-hidden>|</span>
      <span className="flex items-center gap-2">
        system:
        <span
          aria-hidden
          className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--accent-on))] landing-pulse"
        />
        <span className="text-[hsl(var(--accent-on))]">online</span>
      </span>
    </div>
  );
}
