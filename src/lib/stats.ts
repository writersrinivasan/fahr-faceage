/** Small seeded RNG + survival-analysis helpers used by the lab simulations. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function randn(r: () => number) {
  const u = Math.max(r(), 1e-12), v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** Published per-decade hazard ratios (Bontempi et al., Lancet Digit Health 2025). */
export const COHORTS = {
  pan: { label: "Pan-cancer, curative intent (MAASTRO)", hr: 1.151, n: 4906, p: "0.013", medianYears: 6 },
  thoracic: { label: "Thoracic cancers (Harvard)", hr: 1.148, n: 573, p: "0.011", medianYears: 2.5 },
  palliative: { label: "Palliative radiotherapy (Harvard)", hr: 1.117, n: 717, p: "0.021", medianYears: 0.6 },
} as const;
export type CohortKey = keyof typeof COHORTS;

export type KMPoint = { t: number; s: number; atRisk: number };
/** Kaplan–Meier estimator. events: 1 = death, 0 = censored. */
export function kaplanMeier(times: number[], events: number[]): KMPoint[] {
  const idx = times.map((_, i) => i).sort((a, b) => times[a] - times[b]);
  let atRisk = times.length, s = 1;
  const out: KMPoint[] = [{ t: 0, s: 1, atRisk }];
  let i = 0;
  while (i < idx.length) {
    const t = times[idx[i]];
    let d = 0, c = 0;
    while (i < idx.length && times[idx[i]] === t) { if (events[idx[i]]) d++; else c++; i++; }
    if (d > 0) { s *= 1 - d / atRisk; out.push({ t, s, atRisk }); }
    atRisk -= d + c;
  }
  return out;
}
export function kmAt(km: KMPoint[], t: number) {
  let s = 1;
  for (const p of km) { if (p.t <= t) s = p.s; else break; }
  return s;
}
/** Harrell's concordance index: higher risk should die earlier. */
export function cIndex(risk: number[], times: number[], events: number[]) {
  let conc = 0, total = 0;
  for (let i = 0; i < risk.length; i++) {
    if (!events[i]) continue;
    for (let j = 0; j < risk.length; j++) {
      if (times[j] > times[i]) {
        total++;
        if (risk[i] > risk[j]) conc++;
        else if (risk[i] === risk[j]) conc += 0.5;
      }
    }
  }
  return total ? conc / total : 0.5;
}
