import Link from "next/link";
import { notFound } from "next/navigation";
import { modules, getModule } from "@/lib/modules";
import { Blocks } from "@/components/Blocks";
import { CompleteButton } from "@/components/LearnProgress";

export function generateStaticParams() {
  return modules.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(props: PageProps<"/learn/[slug]">) {
  const { slug } = await props.params;
  const m = getModule(slug);
  return { title: m ? `${m.title} · FaceAge Learning Lab` : "FaceAge" };
}

export default async function ModulePage(props: PageProps<"/learn/[slug]">) {
  const { slug } = await props.params;
  const m = getModule(slug);
  if (!m) notFound();
  const idx = modules.indexOf(m);
  const prev = modules[idx - 1];
  const next = modules[idx + 1];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 card p-3">
          <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">Modules</div>
          {modules.map((x) => (
            <Link key={x.slug} href={`/learn/${x.slug}`} className={`flex gap-2 rounded-xl px-2 py-2 text-sm ${x.slug === m.slug ? "bg-violet-600 text-white" : "hover:bg-violet-50"}`}>
              <span>{x.emoji}</span><span>{x.n}. {x.title}</span>
            </Link>
          ))}
        </div>
      </aside>
      <article>
        <div className={`rounded-3xl bg-gradient-to-br ${m.gradient} p-8 text-white shadow-xl`}>
          <div className="text-sm font-semibold opacity-90">Module {m.n} of {modules.length} · {m.minutes} min read</div>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{m.emoji} {m.title}</h1>
          <p className="mt-3 text-lg opacity-95">{m.tagline}</p>
        </div>
        <div className="card mt-6 p-6 md:p-10">
          <Blocks blocks={m.blocks} />
          <div className="mt-10 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 ring-1 ring-violet-100">
            <h2 className="font-display text-xl font-bold">✅ Key takeaways</h2>
            <ul className="mt-3 space-y-2">
              {m.takeaways.map((t) => <li key={t} className="flex gap-2"><span className="text-fuchsia-500">◆</span><span>{t}</span></li>)}
            </ul>
          </div>
          {m.lab && (
            <Link href={m.lab.href} className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 p-5 text-white shadow-lg transition hover:scale-[1.01]">
              <div><div className="text-xs font-semibold uppercase tracking-wider opacity-90">Practise it</div><div className="font-display text-lg font-bold">🧪 {m.lab.label}</div></div>
              <span className="text-2xl">→</span>
            </Link>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            {prev ? <Link href={`/learn/${prev.slug}`} className="text-sm font-semibold text-violet-700">← {prev.title}</Link> : <span />}
            <CompleteButton slug={m.slug} />
            {next ? <Link href={`/learn/${next.slug}`} className="text-sm font-semibold text-violet-700">{next.title} →</Link> : <Link href="/quiz" className="text-sm font-semibold text-violet-700">Take the quiz →</Link>}
          </div>
        </div>
      </article>
    </div>
  );
}
