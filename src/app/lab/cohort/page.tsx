"use client";
import { useMemo, useState } from "react";
import LabShell, { Slider } from "@/components/LabShell";
import { LineChart, Scatter } from "@/components/charts";
import { cIndex, clamp, kaplanMeier, kmAt, randn, rng } from "@/lib/stats";

const GROUPS = [
  { name: "FaceAge < 65", lo: -Infinity, hi: 65, color: "var(--series-1)" },
  { name: "65–75", lo: 65, hi: 75, color: "var(--series-2)" },
  { name: "75–85", lo: 75, hi: 85, color: "var(--series-3)" },
  { name: "> 85", lo: 85, hi: Infinity, color: "var(--series-4)" },
];

export default function CohortPage() {
  const [n, setN] = useState(1200);
  const [offset, setOffset] = useState(4.8);
  const [bioEffect, setBioEffect] = useState(1.6);
  const [noise, setNoise] = useState(5);
  const [seed, setSeed] = useState(7);

  const sim = useMemo(() => {
    const r = rng(seed);
    const chrono: number[] = [], face: number[] = [], times: number[] = [], events: number[] = [];
    const hrAge = 1.35; // per decade of chronological age
    for (let i = 0; i < n; i++) {
      const a = clamp(68 + randn(r) * 10, 40, 95);
      const bioGap = offset + randn(r) * 6; // true extra biological ageing
      const h = 0.12 * Math.pow(hrAge, (a - 68) / 10) * Math.pow(bioEffect, bioGap / 10);
      const t = -Math.log(Math.max(r(), 1e-9)) / h;
      const cens = 2 + r() * 6; // follow-up 2–8 years
      chrono.push(a);
      face.push(a + bioGap + randn(r) * noise);
      times.push(Math.min(t, cens));
      events.push(t <= cens ? 1 : 0);
    }
    const kms = GROUPS.map((g) => {
      const idx = face.map((f, i) => (f >= g.lo && f < g.hi ? i : -1)).filter((i) => i >= 0);
      return { ...g, n: idx.length, km: kaplanMeier(idx.map((i) => times[i]), idx.map((i) => events[i])) };
    });
    const ci = {
      chrono: cIndex(chrono, times, events),
      face: cIndex(face, times, events),
      both: cIndex(chrono.map((a, i) => Math.log(hrAge) * a + Math.log(bioEffect) * (face[i] - a)), times, events),
    };
    const meanGap = face.reduce((s, f, i) => s + f - chrono[i], 0) / n;
    return { chrono, face, kms, ci, meanGap };
  }, [n, offset, bioEffect, noise, seed]);

  return (
    <LabShell emoji="👥" title="Cohort simulator" learn={{ href: "/learn/oncology-evidence", label: "FaceAge in oncology" }}
      intro={<>Generate a synthetic cancer cohort where some patients age faster biologically. A noisy &quot;FaceAge&quot; observes that hidden ageing. Then check whether FaceAge separates survival curves and adds information beyond real age, just as the study did.</>}>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="card space-y-5 p-5">
          <Slider label="Patients" value={n} min={200} max={3000} step={100} onChange={setN} />
          <Slider label="Cancer 'looks older' offset" value={offset} min={0} max={10} step={0.1} onChange={setOffset} fmt={(v) => `+${v.toFixed(1)} y`} hint="Study found ≈ +4.79 years" />
          <Slider label="True hazard per decade of biological ageing" value={bioEffect} min={1} max={2.5} step={0.05} onChange={setBioEffect} fmt={(v) => `${v.toFixed(2)}×`} hint="1.0 = biological ageing has no effect" />
          <Slider label="FaceAge measurement noise (SD)" value={noise} min={0} max={15} step={0.5} onChange={setNoise} fmt={(v) => `${v} y`} hint="Higher noise = worse face model" />
          <button onClick={() => setSeed(Math.floor(Math.random() * 1e6))} className="w-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 py-2.5 font-semibold text-white shadow">🎲 Draw a new cohort</button>
          <div className="rounded-xl bg-rose-50 p-3 text-sm">Mean observed gap: <strong>{sim.meanGap >= 0 ? "+" : ""}{sim.meanGap.toFixed(2)} y</strong></div>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">Kaplan–Meier survival by FaceAge group</h2>
            <LineChart step xMax={6} xLabel="Years" yLabel="Proportion alive"
              series={sim.kms.filter((k) => k.n > 5).map((k) => ({ name: `${k.name} (n=${k.n})`, color: k.color, points: k.km.map((p) => [p.t, p.s] as [number, number]) }))} />
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted"><th className="py-1">Group</th><th>Patients</th><th>Alive at 1 y</th><th>Alive at 3 y</th></tr></thead>
                <tbody>{sim.kms.map((k) => (
                  <tr key={k.name} className="border-t border-line"><td className="py-1.5"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: k.color }} />{k.name}</td><td>{k.n}</td><td>{k.n ? `${(kmAt(k.km, 1) * 100).toFixed(0)}%` : "–"}</td><td>{k.n ? `${(kmAt(k.km, 3) * 100).toFixed(0)}%` : "–"}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { k: "Real age only", v: sim.ci.chrono, c: "from-sky-500 to-cyan-400" },
              { k: "FaceAge only", v: sim.ci.face, c: "from-fuchsia-500 to-rose-400" },
              { k: "Real age + FaceAge gap", v: sim.ci.both, c: "from-emerald-500 to-lime-400" },
            ].map((x) => (
              <div key={x.k} className={`rounded-2xl bg-gradient-to-br ${x.c} p-4 text-white shadow`}>
                <div className="text-xs font-semibold uppercase opacity-90">C-index</div>
                <div className="font-display text-3xl font-bold">{x.v.toFixed(3)}</div>
                <div className="text-sm">{x.k}</div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">FaceAge vs real age (first 400 patients)</h2>
            <Scatter points={sim.chrono.slice(0, 400).map((a, i) => ({ x: a, y: sim.face[i] }))} min={35} max={115} xLabel="Chronological age" yLabel="FaceAge" />
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            💡 <strong>Experiments:</strong> (1) Set the hazard to 1.0×: biological ageing no longer matters, and FaceAge loses its edge over real age. (2) Raise noise to 15: the face model gets too noisy to help. (3) Set noise to 0: FaceAge captures hidden biology perfectly. Real FaceAge sits in between.
          </div>
        </div>
      </div>
    </LabShell>
  );
}
