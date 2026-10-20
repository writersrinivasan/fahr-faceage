import Link from "next/link";
import { modules } from "@/lib/modules";
import PageHeader from "@/components/PageHeader";
import LearnProgress from "@/components/LearnProgress";

export default function LearnPage() {
  return (
    <div>
      <PageHeader kicker="Track 1 · Learning path" title="Master FaceAge, one module at a time">
        Eight modules take you from the idea of biological age to the oncology evidence, the statistics and the ethics.
        Each module ends with key takeaways and a link to a matching hands-on experiment.
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4">
        <LearnProgress total={modules.map((m) => m.slug)} />
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.slug} href={`/learn/${m.slug}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
              <div className={`bg-gradient-to-br ${m.gradient} flex items-center justify-between p-5 text-white`}>
                <span className="text-4xl">{m.emoji}</span>
                <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">Module {m.n} · {m.minutes} min</span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-bold group-hover:text-violet-700">{m.title}</h3>
                <p className="mt-1 text-sm text-muted">{m.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
