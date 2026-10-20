"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import LabShell, { Slider } from "@/components/LabShell";

const LIB = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/dist/face-api.js";
const MODELS = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model/";

type Result = { age: number; gender: string; gp: number; score: number; box: { x: number; y: number; width: number; height: number } };

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if ((window as any).faceapi) return res();
    const s = document.createElement("script");
    s.src = src; s.async = true; s.onload = () => res(); s.onerror = () => rej(new Error("Could not load face-api"));
    document.head.appendChild(s);
  });
}

export default function FaceScanPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [res, setRes] = useState<Result | null>(null);
  const [samples, setSamples] = useState<number[]>([]);
  const [chrono, setChrono] = useState(40);
  const [busy, setBusy] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const crop = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setStatus("loading"); setMsg("Loading the face-detection and age models (about 7 MB)…");
        await loadScript(LIB);
        const fa = (window as any).faceapi;
        await fa.tf?.ready?.();
        await Promise.all([fa.nets.ssdMobilenetv1.loadFromUri(MODELS), fa.nets.faceLandmark68Net.loadFromUri(MODELS), fa.nets.ageGenderNet.loadFromUri(MODELS)]);
        if (alive) { setStatus("ready"); setMsg(""); }
      } catch (e) {
        if (alive) { setStatus("error"); setMsg(String(e)); }
      }
    })();
    return () => { alive = false; stream.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  async function analyse(src: HTMLImageElement | HTMLVideoElement) {
    const fa = (window as any).faceapi;
    const c = canvas.current!;
    const w = src instanceof HTMLVideoElement ? src.videoWidth : src.naturalWidth;
    const h = src instanceof HTMLVideoElement ? src.videoHeight : src.naturalHeight;
    const scale = Math.min(1, 720 / w);
    c.width = w * scale; c.height = h * scale;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(src, 0, 0, c.width, c.height);
    const det = await fa.detectSingleFace(c, new fa.SsdMobilenetv1Options({ minConfidence: 0.5 })).withFaceLandmarks().withAgeAndGender();
    if (!det) { setRes(null); setMsg("No face found. Try a clear, front-facing photo with good light."); return null; }
    setMsg("");
    const b = det.detection.box;
    ctx.lineWidth = 3; ctx.strokeStyle = "#d946ef"; ctx.strokeRect(b.x, b.y, b.width, b.height);
    ctx.fillStyle = "#22d3ee";
    for (const p of det.landmarks.positions) { ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#d946ef"; ctx.fillRect(b.x, b.y - 26, 150, 26);
    ctx.fillStyle = "#fff"; ctx.font = "bold 16px sans-serif"; ctx.fillText(`Apparent age ${det.age.toFixed(1)}`, b.x + 6, b.y - 8);
    const cc = crop.current!; const cx = cc.getContext("2d")!;
    cc.width = 160; cc.height = 160; cx.drawImage(c, b.x, b.y, b.width, b.height, 0, 0, 160, 160);
    const r: Result = { age: det.age, gender: det.gender, gp: det.genderProbability, score: det.detection.score, box: b };
    setRes(r);
    return r;
  }

  function onFile(file?: File) {
    if (!file) return;
    const img = new Image();
    img.onload = async () => { setBusy(true); setSamples([]); await analyse(img); setBusy(false); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(file);
  }

  async function startCam() {
    setMode("camera");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      video.current!.srcObject = stream.current; await video.current!.play();
    } catch { setMsg("Camera permission was denied or no camera is available. Use photo upload instead."); }
  }
  function stopCam() { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setMode("upload"); }

  async function burst() {
    if (!video.current) return;
    setBusy(true); const ages: number[] = [];
    for (let i = 0; i < 5; i++) {
      const r = await analyse(video.current);
      if (r) ages.push(r.age);
      setSamples([...ages]);
      await new Promise((ok) => setTimeout(ok, 350));
    }
    setBusy(false);
  }

  const est = samples.length ? samples.reduce((a, b) => a + b, 0) / samples.length : res?.age;
  const sd = samples.length > 1 ? Math.sqrt(samples.reduce((a, b) => a + (b - est!) ** 2, 0) / (samples.length - 1)) : null;
  const gap = est !== undefined ? est - chrono : null;

  return (
    <LabShell emoji="📸" title="Live face age scanner" learn={{ href: "/learn/what-is-faceage", label: "What is FaceAge?" }}
      intro={<>Run a real face-detection and age-estimation network in your browser. It follows the same idea as FaceAge: detect the face, crop it, run a CNN, output an age, then compute the age gap.</>}>
      <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        ⚠️ <strong>This is not the clinical FaceAge model.</strong> It uses the open-source face-api.js age network, trained on general web photos to estimate <em>apparent</em> age. Results are for learning only and say nothing about your health. 🔒 Your image never leaves your device.
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            <label className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ${status !== "ready" ? "pointer-events-none opacity-40" : ""} bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white shadow`}>
              🖼️ Upload a photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { stopCam(); onFile(e.target.files?.[0]); }} />
            </label>
            {mode === "upload" ? (
              <button disabled={status !== "ready"} onClick={startCam} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-fuchsia-700 ring-1 ring-fuchsia-200 disabled:opacity-40">🎥 Use webcam</button>
            ) : (
              <>
                <button disabled={busy} onClick={burst} className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Scanning…" : "📸 Scan 5 frames"}</button>
                <button onClick={stopCam} className="rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-line">Stop camera</button>
              </>
            )}
          </div>
          {status === "loading" && <div className="mb-3 flex items-center gap-2 text-sm text-muted"><span className="h-3 w-3 animate-spin rounded-full border-2 border-fuchsia-500 border-t-transparent" />{msg}</div>}
          {status === "error" && <div className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-900">Models could not be loaded. Check your internet connection and reload. ({msg})</div>}
          {status === "ready" && msg && <div className="mb-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">{msg}</div>}
          <video ref={video} className={mode === "camera" ? "mb-3 w-full rounded-xl" : "hidden"} playsInline muted />
          <div className="overflow-hidden rounded-xl bg-[repeating-linear-gradient(45deg,#faf5ff,#faf5ff_12px,#fdf2f8_12px,#fdf2f8_24px)]">
            <canvas ref={canvas} className="w-full" />
            {!res && <div className="grid h-64 place-items-center text-center text-sm text-muted">{status === "ready" ? "Upload a photo or start the webcam to begin." : "Preparing models…"}</div>}
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">Pipeline output</h2>
            <div className="mt-3 flex gap-4">
              <div>
                <canvas ref={crop} className="h-28 w-28 rounded-xl bg-violet-50" />
                <div className="mt-1 text-center text-[11px] text-muted">Cropped face</div>
              </div>
              <div className="flex-1 space-y-1.5 text-sm">
                <Row k="Detection confidence" v={res ? `${(res.score * 100).toFixed(1)}%` : "–"} />
                <Row k="68 landmarks" v={res ? "found ✓" : "–"} />
                <Row k="Apparent age" v={est !== undefined ? `${est.toFixed(1)} y` : "–"} />
                {sd !== null && <Row k={`Spread over ${samples.length} frames`} v={`± ${sd.toFixed(1)} y`} />}
              </div>
            </div>
          </div>
          <div className="card space-y-3 p-5">
            <h2 className="font-display text-lg font-bold">Age gap</h2>
            <Slider label="Your real (chronological) age" value={chrono} min={18} max={95} onChange={setChrono} fmt={(v) => `${v} y`} />
            {gap !== null ? (
              <>
                <div className={`rounded-xl p-4 text-center ${gap > 4 ? "bg-amber-50" : gap < -4 ? "bg-emerald-50" : "bg-sky-50"}`}>
                  <div className="text-xs text-muted">Apparent age − real age</div>
                  <div className="font-display text-4xl font-bold">{gap > 0 ? "+" : ""}{gap.toFixed(1)} y</div>
                  <div className="text-sm">{Math.abs(gap) <= 4 ? "Within normal model error" : gap > 0 ? "Looks older than real age" : "Looks younger than real age"}</div>
                </div>
                <p className="text-xs text-muted">If this were FaceAge in a cancer cohort, the pan-cancer HR of 1.151 per decade would translate this gap into a relative hazard of {Math.pow(1.151, gap / 10).toFixed(2)}×. That calculation only makes sense for patients in the studied populations.</p>
              </>
            ) : <p className="text-sm text-muted">Analyse a face to see the gap.</p>}
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            💡 <strong>Experiments:</strong> try the same face with bright vs dim light, a smile vs neutral, glasses on vs off. Use &quot;Scan 5 frames&quot; to measure how stable the estimate is. Big swings show why clinical studies use standardised photos.
          </div>
        </div>
      </div>
    </LabShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-2"><span className="text-muted">{k}</span><strong>{v}</strong></div>;
}
