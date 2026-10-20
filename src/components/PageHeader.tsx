export default function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 pb-6">
      <div className="mb-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700 ring-1 ring-violet-200">{kicker}</div>
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
      {children && <div className="mt-4 max-w-3xl text-lg text-muted">{children}</div>}
    </div>
  );
}
