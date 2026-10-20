import Link from "next/link";

export default function LabShell({ emoji, title, intro, learn, children }: { emoji: string; title: string; intro: React.ReactNode; learn?: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <Link href="/lab" className="text-sm font-semibold text-violet-700">← All labs</Link>
      <h1 className="mt-2 font-display text-4xl font-bold">{emoji} {title}</h1>
      <div className="mt-2 max-w-3xl text-muted">{intro}</div>
      {learn && <Link href={learn.href} className="mt-3 inline-flex rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700 ring-1 ring-violet-200">📚 Theory: {learn.label}</Link>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, fmt, hint }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; fmt?: (v: number) => string; hint?: string }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span className="font-semibold tabular-nums text-violet-700">{fmt ? fmt(value) : value}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </label>
  );
}
