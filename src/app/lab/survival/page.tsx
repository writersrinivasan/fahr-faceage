"use client";
import { useState } from "react";
import LabShell, { Slider } from "@/components/LabShell";
import { LineChart } from "@/components/charts";
import { COHORTS, type CohortKey } from "@/lib/stats";

export default function SurvivalPage() {
  const [chrono, setChrono] = useState(68);
  const [face, setFace] = useState(78);
  const [cohort, setCohort] = useState<CohortKey>("pan");
  const c = COHORTS[cohort];
  const gap = face - chrono;
  const rel = Math.pow(c.hr, gap / 10);
  const lambda = Math.LN2 / c.medianYears; // exponential baseline
  const horizon = Math.max(1, Math.ceil(c.medianYears * 2.2));
  const xs = Array.from({ length: 81 }, (_, i) => (i / 80) * horizon);
  const base = xs.map((t) => [t, Math.exp(-lambda * t)] as [number, number]);
  const pt = xs.map((t) => [t, Math.exp(-lambda * rel * t)] as [number, number]);
  const marks = cohort === "palliative" ? [0.25, 0.5, 1] : [1, 2, 5];
  const medianPatient = c.medianYears / rel;
  const flag85 = face > 85;

  return (
    <LabShell emoji="📉" title="Survival risk calculator" learn={{ href: "/learn/reading-the-numbers", label: "Reading the numbers" }}
      intro={<>Combine a real age and a FaceAge with the <strong>published per-decade hazard ratios</strong> to see how much the survival curve shifts. Baseline curves are illustrative, so focus on the <em>relative</em> difference.</>}>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="card space-y-5 p-5">
          <div>
            <div className="mb-2 text-sm font-medium">Patient cohort</div>
            <div className="space-y-2">
              {(Object.keys(COHORTS) as CohortKey[]).map((k) => (
                <button key={k} onClick={() => setCohort(k)} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${cohort === k ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow" : "bg-emerald-50 text-emerald-900"}`}>
                  <div className="font-semibold">{COHORTS[k].label}</div>
                  <div className="text-xs opacity-90">HR {COHORTS[k].hr} per decade · n = {COHORTS[k].n.toLocaleString()} · p = {COHORTS[k].p}</div>
                </button>
              ))}
            </div>
          </div>
          <Slider label="Chronological age" value={chrono} min={40} max={95} onChange={setChrono} fmt={(v) => `${v} y`} />
          <Slider label="FaceAge" value={face} min={35} max={100} onChange={setFace} fmt={(v) => `${v} y`} />
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className={`rounded-xl p-3 ${gap > 0 ? "bg-amber-50" : "bg-emerald-50"}`}><div className="text-xs text-muted">Age gap</div><div className="font-display text-2xl font-bold">{gap > 0 ? "+" : ""}{gap} y</div></div>
            <div className={`rounded-xl p-3 ${rel > 1 ? "bg-rose-50" : "bg-emerald-50"}`}><div className="text-xs text-muted">Relative hazard</div><div className="font-display text-2xl font-bold">{rel.toFixed(2)}×</div></div>
          </div>
          {flag85 && <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">🚩 <strong>FaceAge over 85.</strong> In the study, this group had notably worse survival.</div>}
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">Overall survival: patient vs same-age peer who looks their age</h2>
            <LineChart xMax={horizon} xLabel="Years after start of radiotherapy" yLabel="Proportion alive"
              series={[
                { name: "Looks their age (gap 0)", color: "var(--series-1)", points: base, dashed: true },
                { name: `This patient (gap ${gap > 0 ? "+" : ""}${gap})`, color: "var(--series-2)", points: pt },
              ]} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted"><th className="py-1">Time</th><th>Looks their age</th><th>This patient</th><th>Difference</th></tr></thead>
                <tbody>
                  {marks.map((t) => {
                    const a = Math.exp(-lambda * t), b = Math.exp(-lambda * rel * t);
                    return <tr key={t} className="border-t border-line"><td className="py-1.5">{t < 1 ? `${Math.round(t * 12)} months` : `${t} year${t > 1 ? "s" : ""}`}</td><td>{(a * 100).toFixed(1)}%</td><td>{(b * 100).toFixed(1)}%</td><td className={b < a ? "text-rose-600" : "text-emerald-600"}>{((b - a) * 100).toFixed(1)} pts</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">🧮 The maths behind it</h2>
            <ol className="mt-2 space-y-2 text-sm leading-relaxed">
              <li><strong>1.</strong> Age gap = FaceAge − real age = {face} − {chrono} = <strong>{gap} years</strong>.</li>
              <li><strong>2.</strong> The Cox model HR is per 10 years of FaceAge, adjusted for real age, so relative hazard = HR<sup>gap/10</sup> = {c.hr}<sup>{(gap / 10).toFixed(1)}</sup> = <strong>{rel.toFixed(3)}</strong>.</li>
              <li><strong>3.</strong> Under proportional hazards, S<sub>patient</sub>(t) = S<sub>baseline</sub>(t)<sup>{rel.toFixed(2)}</sup>.</li>
              <li><strong>4.</strong> With an illustrative baseline median of {c.medianYears} years, this patient&apos;s median is about <strong>{medianPatient.toFixed(1)} years</strong>.</li>
            </ol>
            <p className="mt-3 text-xs text-muted">Teaching tool only. Hazard ratios are from Bontempi et al. 2025; baseline survival curves are invented for illustration and must not be used for any real patient.</p>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
