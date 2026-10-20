"use client";
import { useRef, useState } from "react";

export type Series = { name: string; color: string; points: [number, number][]; dashed?: boolean };

const W = 640, H = 340, M = { l: 52, r: 16, t: 14, b: 44 };

function niceTicks(max: number) {
  const step = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20].find((st) => max / st <= 7) ?? max / 5;
  return Array.from({ length: Math.floor(max / step + 1e-9) + 1 }, (_, i) => i * step);
}

function ticks(min: number, max: number, n = 5) {
  const step = (max - min) / n;
  return Array.from({ length: n + 1 }, (_, i) => min + i * step);
}

/** Line / step chart with crosshair tooltip and legend. */
export function LineChart({
  series, xMax, yMax = 1, xLabel, yLabel, step = false, yFmt = (v: number) => `${Math.round(v * 100)}%`, xFmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, "")),
}: {
  series: Series[]; xMax: number; yMax?: number; xLabel: string; yLabel: string; step?: boolean;
  yFmt?: (v: number) => string; xFmt?: (v: number) => string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [hx, setHx] = useState<number | null>(null);
  const sx = (x: number) => M.l + (x / xMax) * (W - M.l - M.r);
  const sy = (y: number) => M.t + (1 - y / yMax) * (H - M.t - M.b);
  const path = (pts: [number, number][]) => {
    let d = "";
    pts.forEach(([x, y], i) => {
      if (x > xMax) return;
      if (i === 0) d += `M${sx(x)},${sy(y)}`;
      else if (step) d += `H${sx(x)}V${sy(y)}`;
      else d += `L${sx(x)},${sy(y)}`;
    });
    if (step && pts.length) d += `H${sx(xMax)}`;
    return d;
  };
  const valueAt = (pts: [number, number][], x: number) => {
    if (step) { let v = pts[0]?.[1] ?? 0; for (const p of pts) { if (p[0] <= x) v = p[1]; else break; } return v; }
    for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
    return pts[pts.length - 1]?.[1] ?? 0;
  };
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const x = ((px - M.l) / (W - M.l - M.r)) * xMax;
    setHx(x >= 0 && x <= xMax ? x : null);
  };
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-4 text-sm">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-2 text-foreground">
            <span className="inline-block h-0.5 w-5" style={{ background: s.color, borderTop: s.dashed ? `2px dashed ${s.color}` : undefined }} />{s.name}
          </span>
        ))}
      </div>
      <div className="relative">
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none" onPointerMove={onMove} onPointerLeave={() => setHx(null)} role="img" aria-label={`${yLabel} by ${xLabel}`}>
          {ticks(0, yMax).map((v) => (
            <g key={v}>
              <line x1={M.l} x2={W - M.r} y1={sy(v)} y2={sy(v)} stroke="var(--grid)" />
              <text x={M.l - 8} y={sy(v) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{yFmt(v)}</text>
            </g>
          ))}
          {niceTicks(xMax).map((v) => (
            <text key={v} x={sx(v)} y={H - M.b + 18} textAnchor="middle" fontSize="11" fill="var(--muted)">{xFmt(v)}</text>
          ))}
          <text x={(W + M.l) / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--muted)">{xLabel}</text>
          <text transform={`translate(13 ${(H - M.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fill="var(--muted)">{yLabel}</text>
          {series.map((s) => (
            <path key={s.name} d={path(s.points)} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dashed ? "6 4" : undefined} strokeLinejoin="round" />
          ))}
          {hx !== null && (
            <g>
              <line x1={sx(hx)} x2={sx(hx)} y1={M.t} y2={H - M.b} stroke="var(--muted)" strokeDasharray="3 3" />
              {series.map((s) => <circle key={s.name} cx={sx(hx)} cy={sy(valueAt(s.points, hx))} r="4.5" fill={s.color} stroke="#fff" strokeWidth="2" />)}
            </g>
          )}
        </svg>
        {hx !== null && (
          <div className="pointer-events-none absolute top-2 rounded-xl border border-line bg-white/95 px-3 py-2 text-xs shadow-lg" style={{ left: `${Math.min(70, (sx(hx) / W) * 100 + 2)}%` }}>
            <div className="mb-1 font-semibold">{xLabel}: {xFmt(hx)}</div>
            {series.map((s) => (
              <div key={s.name} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}: <strong>{yFmt(valueAt(s.points, hx))}</strong></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Scatter plot with optional identity line and hover tooltip. */
export function Scatter({ points, min, max, xLabel, yLabel, color = "var(--series-1)" }: {
  points: { x: number; y: number }[]; min: number; max: number; xLabel: string; yLabel: string; color?: string;
}) {
  const [hi, setHi] = useState<number | null>(null);
  const sx = (x: number) => M.l + ((x - min) / (max - min)) * (W - M.l - M.r);
  const sy = (y: number) => M.t + (1 - (y - min) / (max - min)) * (H - M.t - M.b);
  const tk = ticks(min, max);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${yLabel} versus ${xLabel}`}>
        {tk.map((v) => (
          <g key={v}>
            <line x1={M.l} x2={W - M.r} y1={sy(v)} y2={sy(v)} stroke="var(--grid)" />
            <text x={M.l - 8} y={sy(v) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{Math.round(v)}</text>
            <text x={sx(v)} y={H - M.b + 18} textAnchor="middle" fontSize="11" fill="var(--muted)">{Math.round(v)}</text>
          </g>
        ))}
        <line x1={sx(min)} y1={sy(min)} x2={sx(max)} y2={sy(max)} stroke="var(--muted)" strokeDasharray="5 4" />
        <text x={sx(max) - 4} y={sy(max) + 14} textAnchor="end" fontSize="11" fill="var(--muted)">FaceAge = real age</text>
        <text x={(W + M.l) / 2} y={H - 6} textAnchor="middle" fontSize="12" fill="var(--muted)">{xLabel}</text>
        <text transform={`translate(13 ${(H - M.b) / 2}) rotate(-90)`} textAnchor="middle" fontSize="12" fill="var(--muted)">{yLabel}</text>
        {points.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={hi === i ? 6 : 3.5} fill={color} fillOpacity={hi === i ? 1 : 0.45} stroke={hi === i ? "#fff" : "none"} strokeWidth="2"
            onPointerEnter={() => setHi(i)} onPointerLeave={() => setHi(null)} />
        ))}
      </svg>
      {hi !== null && (
        <div className="pointer-events-none absolute top-2 right-2 rounded-xl border border-line bg-white/95 px-3 py-2 text-xs shadow-lg">
          {xLabel}: <strong>{points[hi].x.toFixed(1)}</strong><br />{yLabel}: <strong>{points[hi].y.toFixed(1)}</strong><br />Gap: <strong>{(points[hi].y - points[hi].x).toFixed(1)} y</strong>
        </div>
      )}
    </div>
  );
}

/** Horizontal bar list with hover values. */
export function Bars({ items, max, unit = "", color = "var(--series-1)" }: { items: { label: string; value: number; highlight?: boolean }[]; max: number; unit?: string; color?: string }) {
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.label} className="grid grid-cols-[120px_1fr_56px] items-center gap-3 text-sm" title={`${it.label}: ${it.value.toFixed(1)}${unit}`}>
          <span className="truncate text-foreground">{it.label}</span>
          <div className="h-5 rounded-r bg-[var(--grid)]">
            <div className="h-full rounded-r transition-all" style={{ width: `${Math.min(100, (it.value / max) * 100)}%`, background: it.highlight ? "var(--series-2)" : color }} />
          </div>
          <span className="text-right font-semibold tabular-nums">{it.value.toFixed(1)}{unit}</span>
        </div>
      ))}
    </div>
  );
}
