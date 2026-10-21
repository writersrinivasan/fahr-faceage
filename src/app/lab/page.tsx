import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { labs } from "@/lib/labs";

export default function LabHub() {
  return (
    <div>
      <PageHeader kicker="Track 2 · Hands-on lab" title="Learn by doing">
        Seven interactive experiments turn the theory into something you can touch. Each one maps to a learning module, so
        you can switch between reading and practising at any time.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
          🔒 Everything runs in your browser. Photos are never uploaded. Patient data in the simulations is synthetic.
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {labs.map((l, i) => (
            <Link key={l.href} href={l.href} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
              <div className={`bg-gradient-to-br ${l.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between"><span className="text-4xl">{l.emoji}</span><span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">Lab {i + 1}</span></div>
                <h3 className="mt-3 font-display text-xl font-bold">{l.title}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted">{l.desc}</p>
                <div className="mt-3 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Concept: {l.concept}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
