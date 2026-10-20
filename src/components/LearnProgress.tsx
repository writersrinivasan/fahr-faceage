"use client";
import { useEffect, useState } from "react";

const KEY = "faceage-completed";
export function readDone(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function markDone(slug: string) {
  try {
    const d = new Set(readDone()); d.add(slug);
    localStorage.setItem(KEY, JSON.stringify([...d]));
  } catch {}
}

export default function LearnProgress({ total }: { total: string[] }) {
  const [done, setDone] = useState<string[]>([]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDone(readDone()), []);
  const n = total.filter((t) => done.includes(t)).length;
  const pct = Math.round((n / total.length) * 100);
  return (
    <div className="card p-4">
      <div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Your progress</span><span className="text-muted">{n} of {total.length} modules completed</span></div>
      <div className="h-3 overflow-hidden rounded-full bg-violet-100">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CompleteButton({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDone(readDone().includes(slug)), [slug]);
  return (
    <button
      onClick={() => { markDone(slug); setDone(true); }}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${done ? "bg-emerald-100 text-emerald-800" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow hover:scale-[1.03]"}`}
    >
      {done ? "✓ Completed" : "Mark module as complete"}
    </button>
  );
}
