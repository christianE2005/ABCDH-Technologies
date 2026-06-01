type Props = {
  tag?: string;
};

export function SectionDivider({ tag }: Props) {
  return (
    <div
      aria-hidden
      className="max-w-[1200px] mx-auto px-4 md:px-8 [font-family:var(--font-mono)] text-[10px] text-[hsl(var(--line))] flex items-center gap-3 select-none"
    >
      <span className="text-[hsl(var(--text-dim))]">═══</span>
      {tag ? (
        <span className="text-[hsl(var(--text-dim))]">{tag}</span>
      ) : null}
      <span className="flex-1 border-t border-dashed border-[hsl(var(--line))]" />
    </div>
  );
}
