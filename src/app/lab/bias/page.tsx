"use client";
import { useState } from "react";
import LabShell, { Slider } from "@/components/LabShell";
import { Bars } from "@/components/charts";

const FACTORS = [
  { k: "harsh", label: "Harsh overhead lighting", d: +3, kind: "artefact", why: "Deep shadows exaggerate wrinkles and hollows." },
  { k: "soft", label: "Soft studio lighting", d: -3, kind: "artefact", why: "Diffuse light hides skin texture, typical of celebrity photos in training data." },
  { k: "makeup", label: "Heavy make-up / filters", d: -4, kind: "artefact", why: "Smooths texture and evens pigmentation." },
  { k: "blur", label: "Low resolution / blur", d: -2, kind: "artefact", why: "Removes fine detail; estimates drift toward the training average." },
  { k: "smile", label: "Broad smile", d: +1.5, kind: "artefact", why: "Expression lines appear temporarily." },
  { k: "steroid", label: "Steroid 'moon face'", d: -3, kind: "treatment", why: "Facial swelling fills wrinkles. Biology is not younger, but the face looks it." },
  { k: "rt", label: "Radiation skin changes", d: +2, kind: "treatment", why: "Local skin damage, redness and pigment changes." },
  { k: "cachexia", label: "Cancer cachexia (weight loss)", d: +6, kind: "biology", why: "Temporal and cheek fat loss: a real sign of frailty and poor prognosis." },
  { k: "smoke", label: "Long-term smoking", d: +4, kind: "biology", why: "Accelerates skin ageing and is linked to worse survival." },
] as const;

const kindStyle = { artefact: "bg-sky-100 text-sky-800", treatment: "bg-amber-100 text-amber-800", biology: "bg-rose-100 text-rose-800" };
const GROUPS = ["Group A", "Group B", "Group C", "Group D"];

export default function BiasPage() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [share, setShare] = useState([70, 15, 10, 5]);
  const real = 68, base = 72;
  const est = base + FACTORS.reduce((a, f) => a + (on[f.k] ? f.d : 0), 0);
  const bio = FACTORS.filter((f) => on[f.k] && f.kind === "biology").reduce((a, f) => a + f.d, 0);
  const noise = FACTORS.filter((f) => on[f.k] && f.kind !== "biology").reduce((a, f) => a + f.d, 0);
  const total = share.reduce((a, b) => a + b, 0) || 1;
  const mae = share.map((s) => 3.8 + 2.2 / Math.sqrt(Math.max(s / total, 0.01) * 4));
  const worstIdx = mae.indexOf(Math.max(...mae));

  return (
    <LabShell emoji="⚖️" title="Bias & confounder explorer" learn={{ href: "/learn/limitations-ethics", label: "Limitations, bias and ethics" }}
      intro={<>A face-age estimate mixes <strong>real biology</strong> with <strong>photo artefacts</strong> and <strong>treatment effects</strong>. Toggle factors to see how each pushes the number, then explore how unbalanced training data creates unequal accuracy. Effect sizes are illustrative.</>}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold">Part 1 · What moves the estimate?</h2>
          <p className="text-sm text-muted">Patient: real age {real}. Baseline FaceAge {base} (gap +{base - real}).</p>
          <div className="mt-4 space-y-2">
            {FACTORS.map((f) => (
              <button key={f.k} onClick={() => setOn({ ...on, [f.k]: !on[f.k] })} className={`flex w-full items-start gap-3 rounded-xl p-3 text-left ring-1 transition ${on[f.k] ? "bg-violet-50 ring-violet-400" : "bg-white ring-line hover:bg-violet-50/50"}`}>
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md text-xs text-white ${on[f.k] ? "bg-violet-600" : "bg-slate-200"}`}>{on[f.k] ? "✓" : ""}</span>
                <span className="flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">{f.label}<span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${kindStyle[f.kind]}`}>{f.kind}</span></span>
                  <span className="text-xs text-muted">{f.why}</span>
                </span>
                <span className="text-sm font-bold tabular-nums">{f.d > 0 ? "+" : ""}{f.d}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-fuchsia-50 p-3"><div className="text-xs text-muted">Estimate</div><div className="font-display text-2xl font-bold">{est.toFixed(1)}</div></div>
            <div className="rounded-xl bg-rose-50 p-3"><div className="text-xs text-muted">From biology</div><div className="font-display text-2xl font-bold">{bio >= 0 ? "+" : ""}{bio}</div></div>
            <div className="rounded-xl bg-sky-50 p-3"><div className="text-xs text-muted">From artefacts & treatment</div><div className="font-display text-2xl font-bold">{noise >= 0 ? "+" : ""}{noise}</div></div>
          </div>
          <p className="mt-3 text-sm">The model sees only pixels. It cannot tell a moon face from youthful skin, so clinicians must interpret FaceAge in context.</p>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-lg font-bold">Part 2 · Training data and fairness</h2>
          <p className="text-sm text-muted">Set each demographic group&apos;s share of the training images. Under-represented groups get larger errors.</p>
          <div className="mt-4 space-y-3">
            {GROUPS.map((g, i) => (
              <Slider key={g} label={`${g} share of training data`} value={share[i]} min={1} max={100} fmt={(v) => `${Math.round((v / total) * 100)}%`} onChange={(v) => setShare(share.map((s, j) => (j === i ? v : s)))} />
            ))}
          </div>
          <h3 className="mt-6 mb-3 text-sm font-semibold">Expected mean absolute error by group (years)</h3>
          <Bars items={GROUPS.map((g, i) => ({ label: g, value: mae[i], highlight: i === worstIdx }))} max={10} unit=" y" />
          <p className="mt-3 text-sm">Highest error: <strong>{GROUPS[worstIdx]}</strong>. A 2–3 year extra error can push a patient across a risk threshold. This is why FaceAge must be validated across ethnicities, sexes and ages before clinical use.</p>
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            ⚠️ <strong>Ethics check:</strong> who should be allowed to compute your FaceAge? A doctor with consent, yes. An insurer or employer, no. The FaceAge authors warned explicitly against such misuse.
          </div>
        </div>
      </div>
    </LabShell>
  );
}
