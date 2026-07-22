export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-brass-500/50 bg-brass-500/15 text-brass-300"
          : "border-graphite-600 bg-graphite-900/40 text-ink-400 hover:border-graphite-500 hover:text-ink-100"
      }`}
    >
      {children}
    </button>
  );
}
