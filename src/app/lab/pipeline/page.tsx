"use client";
import { useMemo, useState } from "react";
import LabShell, { Slider } from "@/components/LabShell";
import FaceAvatar from "@/components/FaceAvatar";
import { contributions, embedding, featureMeta, featuresForAge, predictAge, type Features } from "@/lib/toyModel";

const steps = [
  { t: "Input", e: "📷" },
  { t: "MTCNN detect", e: "🔍" },
  { t: "Crop & normalise", e: "✂️" },
  { t: "CNN embedding", e: "🧠" },
  { t: "Regression", e: "🔢" },
  { t: "FaceAge & gap", e: "📉" },
];

export default function PipelinePage() {
  const [f, setF] = useState<Features>(featuresForAge(60));
  const [skin, setSkin] = useState(1);
  const [sex, setSex] = useState<"f" | "m">("f");
  const [brightness, setBrightness] = useState(0);
  const [blur, setBlur] = useState(0);
  const [realAge, setRealAge] = useState(62);
  const [step, setStep] = useState(0);
  const [mtcnn, setMtcnn] = useState(0);
  const photo = { brightness, blur };
  const age = predictAge(f, photo);
  const emb = useMemo(() => embedding(f, photo), [f, brightness, blur]); // eslint-disable-line react-hooks/exhaustive-deps
  const contrib = contributions(f, photo);
  const gap = age - realAge;

  return (
    <LabShell emoji="🧠" title="Pipeline explorer" learn={{ href: "/learn/how-it-works", label: "How FaceAge works" }}
      intro={<>Shape a synthetic face with the ageing sliders, then step through each stage of a FaceAge-style pipeline. The age regressor here is a transparent <strong>toy model</strong> so you can see exactly why the number moves.</>}>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Controls */}
        <div className="card space-y-4 p-5">
          <h2 className="font-display text-lg font-bold">🎛️ Face features</h2>
          <div className="flex gap-2">
            {[30, 45, 60, 75, 90].map((a) => (
              <button key={a} onClick={() => setF(featuresForAge(a))} className="flex-1 rounded-lg bg-violet-50 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100">{a}y</button>
            ))}
          </div>
          {featureMeta.map((m) => (
            <Slider key={m.key} label={m.label} hint={m.hint} value={Math.round(f[m.key] * 100)} min={0} max={100} fmt={(v) => `${v}%`}
              onChange={(v) => setF({ ...f, [m.key]: v / 100 })} />
          ))}
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((s) => (
              <button key={s} onClick={() => setSkin(s)} aria-label={`Skin tone ${s + 1}`} className={`h-7 flex-1 rounded-lg ring-2 ${skin === s ? "ring-violet-600" : "ring-transparent"}`} style={{ background: ["#f6d5bd", "#e9b994", "#c98d64", "#9b6545", "#6b4430"][s] }} />
            ))}
          </div>
          <div className="flex gap-2 text-sm">
            {(["f", "m"] as const).map((s) => <button key={s} onClick={() => setSex(s)} className={`flex-1 rounded-lg py-1.5 font-semibold ${sex === s ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700"}`}>{s === "f" ? "Female" : "Male"}</button>)}
          </div>
          <h2 className="pt-2 font-display text-lg font-bold">📸 Photo conditions</h2>
          <Slider label="Exposure" value={brightness} min={-0.6} max={0.8} step={0.05} onChange={setBrightness} fmt={(v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))} hint="Over-exposure washes out wrinkles" />
          <Slider label="Blur / low resolution" value={blur} min={0} max={1} step={0.05} onChange={setBlur} fmt={(v) => `${Math.round(v * 100)}%`} hint="Blur pulls estimates toward the average" />
          <Slider label="Real (chronological) age" value={realAge} min={30} max={95} onChange={setRealAge} fmt={(v) => `${v} y`} />
        </div>

        {/* Stage viewer */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {steps.map((s, i) => (
              <button key={s.t} onClick={() => setStep(i)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${step === i ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow" : "bg-white text-muted ring-1 ring-line hover:text-indigo-700"}`}>
                {s.e} {i + 1}. {s.t}
              </button>
            ))}
          </div>
          <div className="card grid gap-6 p-6 md:grid-cols-[auto_1fr]">
            <div className="relative mx-auto">
              <div className="relative rounded-2xl bg-[repeating-linear-gradient(45deg,#e0f2fe,#e0f2fe_10px,#fae8ff_10px,#fae8ff_20px)] p-3">
                <FaceAvatar f={f} skin={skin} sex={sex} brightness={brightness} blur={blur} size={220} showBox={step === 1 && mtcnn === 2} landmarks={step === 1 && mtcnn === 2} bg={step >= 2} />
                {step === 1 && mtcnn === 0 && [[10, 20, 70], [60, 40, 110], [30, 50, 150], [90, 10, 90], [20, 90, 80], [110, 120, 70], [5, 140, 60]].map(([x, y, s], i) => (
                  <div key={i} className="absolute border-2 border-amber-400/80" style={{ left: x, top: y, width: s, height: s }} />
                ))}
                {step === 1 && mtcnn === 1 && [[40, 45, 150], [50, 55, 135], [35, 40, 160]].map(([x, y, s], i) => (
                  <div key={i} className="absolute border-2 border-sky-500/80" style={{ left: x, top: y, width: s, height: s * 1.15 }} />
                ))}
              </div>
            </div>
            <div>
              {step === 0 && <Explain title="1 · The raw photo" text="A normal photo arrives: background, clothing, lighting and all. Nothing has been processed yet. In FaceAge's clinical studies these were routine identification photos taken before radiotherapy." />}
              {step === 1 && (
                <div>
                  <Explain title="2 · MTCNN face detection" text="Three cascaded CNNs find the face. Tap through each stage:" />
                  <div className="mt-3 flex gap-2">
                    {["P-Net: propose", "R-Net: refine", "O-Net: final + landmarks"].map((s, i) => (
                      <button key={s} onClick={() => setMtcnn(i)} className={`flex-1 rounded-xl px-2 py-2 text-xs font-semibold ${mtcnn === i ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700"}`}>{s}</button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted">
                    {mtcnn === 0 && "P-Net slides over the image at many scales and proposes lots of rough candidate boxes, many of them wrong."}
                    {mtcnn === 1 && "R-Net filters out false candidates and regresses the remaining boxes closer to the face."}
                    {mtcnn === 2 && "O-Net outputs one tight bounding box and five landmarks: two eyes, the nose tip and two mouth corners."}
                  </p>
                </div>
              )}
              {step === 2 && (
                <div>
                  <Explain title="3 · Crop and normalise" text="The face box is cropped, resized to a fixed input size and each colour channel is standardised (mean 0, standard deviation 1). This removes the background and reduces brightness differences between photos." />
                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                    <Hist label="Before: raw pixel intensities" shift={brightness} spread={1 - blur * 0.5} />
                    <Hist label="After: standardised" shift={0} spread={1} />
                  </div>
                  <p className="mt-2 text-xs text-muted">Normalisation recentres brightness, but it cannot recover wrinkle detail that over-exposure or blur already destroyed.</p>
                </div>
              )}
              {step === 3 && (
                <div>
                  <Explain title="4 · Inception-ResNet v1 → 128-d embedding" text="The FaceNet backbone turns the face into 128 numbers. Each cell below is one dimension (purple = negative, amber = positive). Move a slider and watch the pattern change." />
                  <div className="mt-4 grid grid-cols-16 gap-0.5" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
                    {emb.map((v, i) => (
                      <div key={i} title={`dim ${i}: ${v.toFixed(2)}`} className="aspect-square rounded-sm transition-colors" style={{ background: v >= 0 ? `rgba(245,158,11,${0.15 + v * 0.85})` : `rgba(124,58,237,${0.15 - v * 0.85})` }} />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted">Illustrative embedding generated from the slider values. Fine-tuning re-trained the last 281 of 426 layers so these numbers encode age-related features.</p>
                </div>
              )}
              {step === 4 && (
                <div>
                  <Explain title="5 · Regression head" text="Dense layers map the embedding to one number. In this toy model you can see each feature's contribution in years on top of a baseline:" />
                  <div className="mt-4 space-y-2">
                    {contrib.map((c) => (
                      <div key={c.label} className="grid grid-cols-[150px_1fr_56px] items-center gap-2 text-sm">
                        <span>{c.label}</span>
                        <div className="relative h-4 rounded bg-[var(--grid)]">
                          <div className="absolute top-0 h-full rounded" style={{ left: c.value >= 0 ? "30%" : `${30 + (c.value / 25) * 70}%`, width: `${(Math.abs(c.value) / 25) * 70}%`, background: c.value >= 0 ? "var(--series-2)" : "var(--series-1)" }} />
                          <div className="absolute top-0 left-[30%] h-full w-px bg-foreground/40" />
                        </div>
                        <span className="text-right tabular-nums font-semibold">{c.value >= 0 ? "+" : ""}{c.value.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted">Training minimised mean absolute error (MAE) using SGD with momentum, batch size 256, learning rate 0.001.</p>
                </div>
              )}
              {step === 5 && (
                <div>
                  <Explain title="6 · FaceAge and the age gap" text="Compare the estimate with the real age you set on the left." />
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <Tile label="Real age" value={`${realAge}`} c="bg-violet-50" />
                    <Tile label="FaceAge (toy)" value={age.toFixed(1)} c="bg-fuchsia-50 text-fuchsia-700" />
                    <Tile label="Gap" value={`${gap >= 0 ? "+" : ""}${gap.toFixed(1)}`} c={gap > 4 ? "bg-amber-50 text-amber-700" : gap < -4 ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"} />
                  </div>
                  <p className="mt-3 text-sm">
                    {Math.abs(gap) <= 4 ? "Within typical model error (MAE ≈ 4–6 years): looks their age." : gap > 0 ? `Looks ${gap.toFixed(0)} years older. With the pan-cancer HR of 1.151 per decade, relative hazard ≈ ${Math.pow(1.151, gap / 10).toFixed(2)}×.` : `Looks ${(-gap).toFixed(0)} years younger: relative hazard ≈ ${Math.pow(1.151, gap / 10).toFixed(2)}×.`}
                  </p>
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <button disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-full px-4 py-2 text-sm font-semibold text-indigo-700 disabled:opacity-30">← Back</button>
                <div className="rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400 px-4 py-2 text-sm font-bold text-white">FaceAge: {age.toFixed(1)} y</div>
                <button disabled={step === 5} onClick={() => setStep(step + 1)} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-30">Next →</button>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            💡 <strong>Try this:</strong> set every feature for a 75-year-old, then raise exposure to the maximum. The face &quot;gets younger&quot; even though nothing biological changed. This is why photo quality control matters.
          </div>
        </div>
      </div>
    </LabShell>
  );
}

function Explain({ title, text }: { title: string; text: string }) {
  return (<><h3 className="font-display text-xl font-bold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-[#3a3456]">{text}</p></>);
}
function Tile({ label, value, c }: { label: string; value: string; c: string }) {
  return <div className={`rounded-xl p-3 ${c}`}><div className="text-xs text-muted">{label}</div><div className="font-display text-2xl font-bold">{value}</div></div>;
}
function Hist({ label, shift, spread }: { label: string; shift: number; spread: number }) {
  const bins = Array.from({ length: 20 }, (_, i) => {
    const x = (i - 9.5) / 4 - shift * 2.2;
    return Math.exp(-(x * x) / (2 * spread * spread));
  });
  return (
    <div>
      <div className="flex h-20 items-end gap-0.5 rounded-lg bg-[var(--grid)] p-1">
        {bins.map((b, i) => <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${b * 100}%`, background: "var(--series-1)" }} />)}
      </div>
      <div className="mt-1 text-muted">{label}</div>
    </div>
  );
}
