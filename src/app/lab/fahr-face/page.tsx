"use client";
import { useMemo, useState } from "react";
import LabShell, { Slider } from "@/components/LabShell";
import FaceAvatar from "@/components/FaceAvatar";
import { LineChart } from "@/components/charts";
import { featuresForAge } from "@/lib/toyModel";
import { cIndex, kaplanMeier, randn, rng } from "@/lib/stats";

const G = 8; // illustrative patch grid
const FACE = featuresForAge(66);

/* ---------- Part A: masked autoencoder ---------- */
function MaePart() {
  const [ratio, setRatio] = useState(75);
  const [progress, setProgress] = useState(10);
  const [seed, setSeed] = useState(3);
  const masked = useMemo(() => {
    const r = rng(seed);
    const idx = Array.from({ length: G * G }, (_, i) => i).sort(() => r() - 0.5);
    return new Set(idx.slice(0, Math.round((ratio / 100) * G * G)));
  }, [ratio, seed]);
  const loss = 0.05 + 0.85 * Math.exp(-progress / 22);
  const blur = 1 + (1 - progress / 100) * 9;
  const veil = Math.max(0, 0.85 - progress / 100);

  const Grid = ({ mode }: { mode: "input" | "encoder" | "decoder" }) => (
    <div className="relative mx-auto w-fit overflow-hidden rounded-2xl">
      <FaceAvatar f={FACE} skin={2} sex="m" size={180} />
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${G},1fr)`, gridTemplateRows: `repeat(${G},1fr)` }}>
        {Array.from({ length: G * G }, (_, i) => {
          const m = masked.has(i);
          if (mode === "input") return <div key={i} className="border border-white/60" />;
          if (mode === "encoder") return <div key={i} className={`border border-white/60 ${m ? "bg-slate-300" : ""}`} />;
          return (
            <div key={i} className="border border-white/40"
              style={m ? { backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, background: `rgba(148,163,184,${veil})`, outline: "1px solid rgba(217,70,239,.35)" } : undefined} />
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="card p-6">
      <h2 className="font-display text-2xl font-bold">Part A · Self-supervised pretraining (masked autoencoder)</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">FAHR-Face learned from 40M+ faces without a single label. It hides most patches, encodes the rest and learns to reconstruct what is missing. Move the sliders to see how this works.</p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Slider label="Mask ratio" value={ratio} min={0} max={95} step={5} onChange={setRatio} fmt={(v) => `${v}%`} hint="FAHR-Face uses 75%" />
          <Slider label="Pretraining progress" value={progress} min={0} max={100} onChange={setProgress} fmt={(v) => `${v}%`} hint="Early: blurry guesses. Late: sharp reconstructions" />
          <button onClick={() => setSeed(seed + 1)} className="w-full rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 py-2 text-sm font-semibold text-white shadow">🎲 New random mask</button>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-indigo-50 p-3"><div className="text-xs text-muted">Patches seen</div><div className="font-display text-xl font-bold">{G * G - masked.size}/{G * G}</div></div>
            <div className="rounded-xl bg-fuchsia-50 p-3"><div className="text-xs text-muted">Reconstruction loss</div><div className="font-display text-xl font-bold">{loss.toFixed(2)}</div></div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {([["input", "1 · Face split into patches"], ["encoder", "2 · Encoder sees only visible patches"], ["decoder", "3 · Decoder reconstructs hidden patches"]] as const).map(([m, t]) => (
            <div key={m} className="text-center">
              <Grid mode={m} />
              <div className="mt-2 text-sm font-semibold">{t}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-950">After pretraining the decoder is discarded. The encoder, now called <strong>FAHR-Face</strong>, is fine-tuned into <strong>FAHR-FaceAge</strong> (743,152 age-labelled photos, two stages) and <strong>FAHR-FaceSurvival</strong> (34,363 photos of patients with cancer plus survival outcomes). The grid size and reconstructions here are illustrative.</p>
    </section>
  );
}

/* ---------- Part B: attention regions ---------- */
const SPOTS = {
  age: { label: "FAHR-FaceAge", color: "236,72,153", pts: [[100, 80, 34], [56, 98, 18], [144, 98, 18], [86, 146, 16], [114, 146, 16]], text: "Nasolabial folds, forehead above the orbits, temples" },
  surv: { label: "FAHR-FaceSurvival", color: "14,165,233", pts: [[78, 117, 18], [122, 117, 18], [100, 110, 16]], text: "Area below the eyes and around the nasal bridge" },
} as const;

function AttentionPart() {
  const [which, setWhich] = useState<"age" | "surv" | "both">("both");
  const show = which === "both" ? (["age", "surv"] as const) : ([which] as const);
  return (
    <section className="card p-6">
      <h2 className="font-display text-2xl font-bold">Part B · One backbone, two heads, different attention</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">The paper&apos;s attention analysis showed that the two fine-tuned models rely on different facial regions. This helps explain why they carry complementary information.</p>
      <div className="mt-5 grid items-center gap-6 md:grid-cols-[auto_1fr]">
        <div className="relative mx-auto w-fit">
          <FaceAvatar f={FACE} skin={1} sex="f" size={220} />
          {show.map((k) => SPOTS[k].pts.map(([x, y, r], i) => (
            <div key={`${k}${i}`} className="pointer-events-none absolute rounded-full" style={{ left: `${(x / 200) * 100}%`, top: `${(y / 220) * 100}%`, width: r * 2.2, height: r * 2.2, transform: "translate(-50%,-50%)", background: `radial-gradient(circle, rgba(${SPOTS[k].color},.75), rgba(${SPOTS[k].color},0) 70%)` }} />
          )))}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {([["age", "FAHR-FaceAge"], ["surv", "FAHR-FaceSurvival"], ["both", "Both"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setWhich(k)} className={`rounded-full px-4 py-2 text-sm font-semibold ${which === k ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"}`}>{l}</button>
            ))}
          </div>
          {(["age", "surv"] as const).map((k) => (
            <div key={k} className="flex gap-3 rounded-xl p-3 ring-1 ring-line">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: `rgb(${SPOTS[k].color})` }} />
              <div><div className="font-semibold">{SPOTS[k].label}</div><div className="text-sm text-muted">{SPOTS[k].text}</div></div>
            </div>
          ))}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-pink-50 p-3 text-sm"><strong>FAHR-FaceAge output:</strong> an age in years. The gap to real age is a biological-ageing biomarker.</div>
            <div className="rounded-xl bg-sky-50 p-3 text-sm"><strong>FAHR-FaceSurvival output:</strong> a risk score trained directly on survival with a ranking loss.</div>
          </div>
          <p className="text-xs text-muted">Highlight positions are approximate illustrations of the regions named in the paper.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Part C: complementary biomarkers ---------- */
const QCOL = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];

function ComplementPart() {
  const [n, setN] = useState(1200);
  const [rho, setRho] = useState(0.15);
  const [seed, setSeed] = useState(11);
  const sim = useMemo(() => {
    const r = rng(seed);
    const gap: number[] = [], surv: number[] = [], times: number[] = [], events: number[] = [];
    for (let i = 0; i < n; i++) {
      const ageing = randn(r);
      const disease = rho * ageing + Math.sqrt(1 - rho * rho) * randn(r);
      const h = 0.18 * Math.exp(0.4 * ageing + 0.6 * disease);
      const t = -Math.log(Math.max(r(), 1e-9)) / h;
      const cens = 1 + r() * 5;
      gap.push(ageing * 6 + randn(r) * 3); // FAHR-FaceAge gap in years
      surv.push(disease + randn(r) * 0.6); // FAHR-FaceSurvival risk score
      times.push(Math.min(t, cens));
      events.push(t <= cens ? 1 : 0);
    }
    const z = (a: number[]) => { const m = a.reduce((s, x) => s + x, 0) / a.length; const sd = Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length); return a.map((x) => (x - m) / sd); };
    const zg = z(gap), zs = z(surv);
    const corr = zg.reduce((s, x, i) => s + x * zs[i], 0) / n;
    const cGap = cIndex(gap, times, events), cSurv = cIndex(surv, times, events);
    let best = { w: 0, c: 0 };
    for (let w = 0.1; w < 0.95; w += 0.1) {
      const c = cIndex(zg.map((g, i) => w * g + (1 - w) * zs[i]), times, events);
      if (c > best.c) best = { w, c };
    }
    const order = surv.map((_, i) => i).sort((a, b) => surv[a] - surv[b]);
    const quart = [0, 1, 2, 3].map((q) => order.slice(Math.floor((q * n) / 4), Math.floor(((q + 1) * n) / 4)));
    const rate = (idx: number[]) => idx.reduce((s, i) => s + events[i], 0) / idx.reduce((s, i) => s + times[i], 0);
    const hr = rate(quart[3]) / rate(quart[0]);
    const kms = quart.map((idx) => kaplanMeier(idx.map((i) => times[i]), idx.map((i) => events[i])));
    return { corr, cGap, cSurv, best, hr, kms };
  }, [n, rho, seed]);

  return (
    <section className="card p-6">
      <h2 className="font-display text-2xl font-bold">Part C · Two complementary biomarkers (simulation)</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">The paper found the two models were weakly correlated, each independently prognostic, and better combined. This synthetic cohort lets you see why. Each patient has hidden biological ageing (seen by FAHR-FaceAge) and hidden disease risk (seen by FAHR-FaceSurvival).</p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Slider label="Patients" value={n} min={400} max={2000} step={100} onChange={setN} />
          <Slider label="Link between ageing and disease risk" value={rho} min={0} max={0.95} step={0.05} onChange={setRho} fmt={(v) => v.toFixed(2)} hint="Low = the two biomarkers measure different things" />
          <button onClick={() => setSeed(seed + 1)} className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 py-2 text-sm font-semibold text-white shadow">🎲 Draw a new cohort</button>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between rounded-xl bg-slate-50 p-2.5"><span>Correlation of the two scores</span><strong>{sim.corr.toFixed(2)}</strong></div>
            <div className="flex justify-between rounded-xl bg-pink-50 p-2.5"><span>C-index, FAHR-FaceAge gap</span><strong>{sim.cGap.toFixed(3)}</strong></div>
            <div className="flex justify-between rounded-xl bg-sky-50 p-2.5"><span>C-index, FAHR-FaceSurvival</span><strong>{sim.cSurv.toFixed(3)}</strong></div>
            <div className="flex justify-between rounded-xl bg-emerald-50 p-2.5"><span>C-index, combined</span><strong>{sim.best.c.toFixed(3)}</strong></div>
            <div className="flex justify-between rounded-xl bg-amber-50 p-2.5"><span>Q4 vs Q1 hazard ratio</span><strong>{sim.hr.toFixed(2)}×</strong></div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Survival by FAHR-FaceSurvival risk quartile (simulated)</h3>
          <LineChart step xMax={5} xLabel="Years" yLabel="Proportion alive"
            series={sim.kms.map((km, q) => ({ name: `Q${q + 1}${q === 0 ? " (lowest risk)" : q === 3 ? " (highest risk)" : ""}`, color: QCOL[q], points: km.map((p) => [p.t, p.s] as [number, number]) }))} />
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
            💡 With a weak link, the combined C-index beats either score alone, mirroring the paper. Push the link toward 0.95 and the two scores become redundant, so combining adds little. The real study reported an adjusted <strong>Q4 vs Q1 HR of 3.23</strong>. This simulation only shows the idea.
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FahrFaceLab() {
  return (
    <LabShell emoji="🏛️" title="FAHR-Face foundation model lab" learn={{ href: "/learn/fahr-face-foundation", label: "FAHR-Face: the foundation model" }}
      intro={<>Explore the 2026 <strong>FAHR-Face</strong> study (Haugg et al., <em>The Lancet Digital Health</em>): how a foundation model learns from 40 million unlabelled faces, how it becomes two clinical biomarkers, and why those biomarkers complement each other.</>}>
      <div className="space-y-6">
        <MaePart />
        <AttentionPart />
        <ComplementPart />
      </div>
    </LabShell>
  );
}
