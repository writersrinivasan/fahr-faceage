"use client";
import { useMemo, useState } from "react";
import LabShell from "@/components/LabShell";
import FaceAvatar from "@/components/FaceAvatar";
import { featuresForAge } from "@/lib/toyModel";
import { clamp, randn, rng } from "@/lib/stats";

const SITES = ["Lung", "Breast", "Prostate", "Head & neck", "Colorectal", "Pancreas"];
type Pt = { id: number; age: number; face: number; sex: "f" | "m"; skin: number; site: string; ecog: number; mets: string; pAlive: number; alive: boolean };

function makePatients(seed: number): Pt[] {
  const r = rng(seed);
  return Array.from({ length: 10 }, (_, id) => {
    const age = Math.round(clamp(70 + randn(r) * 9, 48, 92));
    const gap = 4.8 + randn(r) * 7;
    const face = Math.round(age + gap);
    const ecog = Math.min(3, Math.floor(r() * 4));
    const mets = r() < 0.5 ? "Bone metastases" : r() < 0.5 ? "Brain metastases" : "Multiple sites";
    // logistic model: performance status and biological ageing drive 6-month survival
    const z = 1.6 - 0.75 * ecog - 0.09 * (face - 75) - 0.02 * (age - 70) + (mets === "Bone metastases" ? 0.5 : 0);
    const pAlive = 1 / (1 + Math.exp(-z));
    return { id, age, face, sex: r() < 0.5 ? "f" : "m", skin: Math.floor(r() * 5), site: SITES[Math.floor(r() * SITES.length)], ecog, mets, pAlive, alive: r() < pAlive };
  });
}

type Phase = "guess" | "revise" | "reveal";

export default function ChallengePage() {
  const [seed, setSeed] = useState(2025);
  const pts = useMemo(() => makePatients(seed), [seed]);
  const [phase, setPhase] = useState<Phase>("guess");
  const [g1, setG1] = useState<Record<number, boolean>>({});
  const [g2, setG2] = useState<Record<number, boolean>>({});

  const acc = (g: Record<number, boolean>) => pts.filter((p) => g[p.id] === p.alive).length;
  const modelAcc = pts.filter((p) => (p.pAlive >= 0.5) === p.alive).length;
  const ready1 = Object.keys(g1).length === pts.length;

  const reset = () => { setSeed(Math.floor(Math.random() * 1e6)); setPhase("guess"); setG1({}); setG2({}); };

  return (
    <LabShell emoji="🩺" title="Clinician challenge" learn={{ href: "/learn/clinical-use-cases", label: "Practical use cases" }}
      intro={<>Ten synthetic patients are starting palliative radiotherapy. Will each be <strong>alive at 6 months</strong>? First decide from the face and clinical details, then see the FaceAge estimate and decide again. This mirrors the study where FaceAge raised clinicians&apos; AUC from about 0.74 to 0.80.</>}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {(["guess", "revise", "reveal"] as Phase[]).map((p, i) => (
          <div key={p} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${phase === p ? "bg-gradient-to-r from-amber-500 to-lime-500 text-white" : "bg-white text-muted ring-1 ring-line"}`}>
            {i + 1}. {p === "guess" ? "Your clinical judgement" : p === "revise" ? "Revise with FaceAge" : "Outcomes"}
          </div>
        ))}
        <button onClick={reset} className="ml-auto rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-violet-700 ring-1 ring-violet-200">🔄 New patients</button>
      </div>

      {phase === "reveal" && (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            { l: "You, clinical only", v: acc(g1), c: "from-sky-500 to-cyan-400" },
            { l: "You + FaceAge", v: acc(g2), c: "from-fuchsia-500 to-rose-400" },
            { l: "Risk model alone", v: modelAcc, c: "from-emerald-500 to-lime-400" },
          ].map((s) => (
            <div key={s.l} className={`rounded-2xl bg-gradient-to-br ${s.c} p-5 text-white shadow`}>
              <div className="font-display text-4xl font-bold">{s.v}/10</div><div className="text-sm">{s.l}</div>
            </div>
          ))}
          <p className="md:col-span-3 text-sm text-muted">With only 10 patients chance plays a big role, so try several rounds. Outcomes here are simulated from a model where performance status (ECOG) and biological ageing both matter.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {pts.map((p) => {
          const g = phase === "guess" ? g1 : g2;
          const set = phase === "guess" ? setG1 : setG2;
          return (
            <div key={p.id} className="card overflow-hidden">
              <div className="flex justify-center bg-gradient-to-b from-violet-50 to-white pt-3">
                <FaceAvatar f={featuresForAge(p.face, ((p.id * 37) % 10) / 100 - 0.05)} skin={p.skin} sex={p.sex} size={130} />
              </div>
              <div className="space-y-1 p-3 text-xs">
                <div className="flex justify-between"><span className="text-muted">Age / sex</span><strong>{p.age} {p.sex.toUpperCase()}</strong></div>
                <div className="flex justify-between"><span className="text-muted">Cancer</span><strong>{p.site}</strong></div>
                <div className="flex justify-between"><span className="text-muted">ECOG</span><strong>{p.ecog}</strong></div>
                <div className="text-muted">{p.mets}</div>
                {phase !== "guess" && (
                  <div className="mt-1 rounded-lg bg-fuchsia-50 p-2">
                    <div className="flex justify-between"><span>FaceAge</span><strong className="text-fuchsia-700">{p.face} ({p.face - p.age >= 0 ? "+" : ""}{p.face - p.age})</strong></div>
                    <div className="flex justify-between"><span>Model P(alive 6 mo)</span><strong>{Math.round(p.pAlive * 100)}%</strong></div>
                  </div>
                )}
                {phase === "reveal" ? (
                  <div className={`mt-2 rounded-lg p-2 text-center font-semibold ${p.alive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-800"}`}>
                    {p.alive ? "✓ Alive at 6 months" : "✝ Died before 6 months"}
                    <div className="mt-1 text-[11px] font-normal">You: {g1[p.id] === p.alive ? "✅" : "❌"} → {g2[p.id] === p.alive ? "✅" : "❌"}</div>
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    <button onClick={() => set({ ...g, [p.id]: true })} className={`rounded-lg py-1.5 font-semibold ${g[p.id] === true ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-800"}`}>Alive</button>
                    <button onClick={() => set({ ...g, [p.id]: false })} className={`rounded-lg py-1.5 font-semibold ${g[p.id] === false ? "bg-slate-600 text-white" : "bg-slate-100 text-slate-700"}`}>Not alive</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        {phase === "guess" && <button disabled={!ready1} onClick={() => { setG2({ ...g1 }); setPhase("revise"); }} className="rounded-full bg-gradient-to-r from-amber-500 to-lime-500 px-6 py-3 font-semibold text-white shadow disabled:opacity-40">{ready1 ? "Show FaceAge →" : `Predict all 10 (${Object.keys(g1).length}/10)`}</button>}
        {phase === "revise" && <button onClick={() => setPhase("reveal")} className="rounded-full bg-gradient-to-r from-amber-500 to-lime-500 px-6 py-3 font-semibold text-white shadow">Reveal outcomes →</button>}
      </div>
    </LabShell>
  );
}
