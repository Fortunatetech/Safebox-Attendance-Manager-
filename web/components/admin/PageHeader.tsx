export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-graphite-700 px-6 py-6 sm:px-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-100">{title}</h1>
      {description && <p className="mt-1 text-sm text-ink-400">{description}</p>}
    </div>
  );
}
