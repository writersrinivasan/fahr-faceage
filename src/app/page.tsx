import Link from "next/link";
import { modules } from "@/lib/modules";
import { labs } from "@/lib/labs";

const stats = [
  { v: "58,851", l: "healthy faces trained on", c: "from-violet-500 to-fuchsia-500" },
  { v: "6,196", l: "cancer patients validated", c: "from-rose-500 to-orange-400" },
  { v: "+4.79 y", l: "cancer patients look older", c: "from-sky-500 to-cyan-400" },
  { v: "0.74→0.80", l: "clinician AUC with FaceAge", c: "from-emerald-500 to-lime-400" },
];

const flow = [
  { e: "📷", t: "Photo", d: "Routine face photo" },
  { e: "🔍", t: "Detect", d: "MTCNN finds the face" },
  { e: "🧠", t: "Analyse", d: "CNN → 128-d embedding" },
  { e: "🔢", t: "FaceAge", d: "Biological age estimate" },
  { e: "📉", t: "Prognosis", d: "Age gap → survival risk" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-500" /> AI in oncology · Learn + Practice
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Your face tells a <span className="text-gradient">biological story</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            FaceAge is a deep-learning system that estimates biological age from a single photo. Cancer researchers found
            that patients who <em>look older</em> than their real age tend to have shorter survival. Learn how it works,
            then try it yourself.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/learn" className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:scale-[1.03]">
              📚 Start learning
            </Link>
            <Link href="/lab" className="rounded-full bg-white px-6 py-3 font-semibold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-50">
              🧪 Jump into the lab
            </Link>
          </div>
        </div>
        <HeroVisual />
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className={`rounded-2xl bg-gradient-to-br ${s.c} p-5 text-white shadow-lg`}>
            <div className="font-display text-3xl font-bold">{s.v}</div>
            <div className="text-sm opacity-95">{s.l}</div>
          </div>
        ))}
      </section>

      {/* Flow */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="font-display text-3xl font-bold">How it works in 5 seconds</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {flow.map((f, i) => (
            <div key={f.t} className="card relative p-5 text-center">
              <div className="text-3xl">{f.e}</div>
              <div className="mt-2 font-semibold">{f.t}</div>
              <div className="text-sm text-muted">{f.d}</div>
              {i < flow.length - 1 && <div className="absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 text-2xl text-fuchsia-400 md:block">›</div>}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
          <strong>⚠️ Prognosis, not diagnosis.</strong> FaceAge does <em>not</em> detect cancer. It is used after diagnosis to
          help estimate how a patient is likely to do, so that treatment can be matched to the person.
        </div>
      </section>

      {/* Dual path */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pt-14 md:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white">
            <div className="text-sm font-semibold uppercase tracking-wider opacity-90">Track 1</div>
            <h3 className="font-display text-2xl font-bold">📚 Learning path</h3>
            <p className="opacity-95">{modules.length} modules · about {modules.reduce((a, m) => a + m.minutes, 0)} minutes</p>
          </div>
          <ol className="divide-y divide-line">
            {modules.map((m) => (
              <li key={m.slug}>
                <Link href={`/learn/${m.slug}`} className="flex items-center gap-3 px-6 py-3 hover:bg-violet-50">
                  <span className="text-xl">{m.emoji}</span>
                  <span className="flex-1 font-medium">{m.n}. {m.title}</span>
                  <span className="text-xs text-muted">{m.minutes} min</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-sky-500 p-6 text-white">
            <div className="text-sm font-semibold uppercase tracking-wider opacity-90">Track 2</div>
            <h3 className="font-display text-2xl font-bold">🧪 Hands-on lab</h3>
            <p className="opacity-95">{labs.length} interactive experiments</p>
          </div>
          <ul className="divide-y divide-line">
            {labs.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center gap-3 px-6 py-3 hover:bg-emerald-50">
                  <span className="text-xl">{l.emoji}</span>
                  <span className="flex-1 font-medium">{l.title}</span>
                  <span className="hidden text-xs text-muted sm:inline">{l.concept}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-sm animate-floaty">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-violet-400 via-fuchsia-400 to-amber-300 opacity-40 blur-2xl" />
      <div className="card relative overflow-hidden p-6">
        <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <ellipse cx="100" cy="105" rx="58" ry="72" fill="#f3c9a8" />
            <path d="M42 90 Q50 30 100 30 Q150 30 158 90 Q150 55 100 55 Q50 55 42 90Z" fill="#cfcfd6" />
            <ellipse cx="78" cy="98" rx="7" ry="4" fill="#2b2b3a" />
            <ellipse cx="122" cy="98" rx="7" ry="4" fill="#2b2b3a" />
            <path d="M66 86 Q78 80 90 86 M110 86 Q122 80 134 86" stroke="#8a8a96" strokeWidth="3" fill="none" />
            <path d="M68 108 Q78 112 88 108 M112 108 Q122 112 132 108" stroke="#c9967a" strokeWidth="1.5" fill="none" />
            <path d="M100 100 L95 128 L104 128" stroke="#c9967a" strokeWidth="2" fill="none" />
            <path d="M84 145 Q100 152 116 145" stroke="#a5523f" strokeWidth="3" fill="none" />
            <path d="M74 128 Q70 145 80 156 M126 128 Q130 145 120 156" stroke="#d8a888" strokeWidth="1.5" fill="none" />
            <path d="M70 62 Q100 58 130 62 M74 70 Q100 66 126 70" stroke="#d8a888" strokeWidth="1.2" fill="none" />
          </svg>
          <div className="absolute inset-4 rounded-xl border-2 border-fuchsia-500" />
          <div className="scanline absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-xl bg-violet-50 p-2"><div className="text-xs text-muted">Real age</div><div className="font-display text-xl font-bold">70</div></div>
          <div className="rounded-xl bg-fuchsia-50 p-2"><div className="text-xs text-muted">FaceAge</div><div className="font-display text-xl font-bold text-fuchsia-600">78</div></div>
          <div className="rounded-xl bg-amber-50 p-2"><div className="text-xs text-muted">Gap</div><div className="font-display text-xl font-bold text-amber-600">+8</div></div>
        </div>
      </div>
    </div>
  );
}
