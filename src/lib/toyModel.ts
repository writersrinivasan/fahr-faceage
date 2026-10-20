/** A transparent "toy" age regressor over hand-made facial features (0..1).
 *  It mimics the idea of FaceAge's regression head so learners can see cause and effect.
 *  It is NOT the real model. */
export type Features = { wrinkles: number; grey: number; sag: number; bags: number; spots: number; hair: number };
export type Photo = { brightness: number; blur: number };

export const featureMeta: { key: keyof Features; label: string; weight: number; hint: string }[] = [
  { key: "wrinkles", label: "Wrinkles & lines", weight: 22, hint: "Collagen loss, sun damage" },
  { key: "grey", label: "Hair greying", weight: 12, hint: "Melanocyte decline" },
  { key: "sag", label: "Skin sagging / jowls", weight: 14, hint: "Elastin + muscle tone loss" },
  { key: "bags", label: "Under-eye hollowing", weight: 10, hint: "Fat pad loss, fatigue, cachexia" },
  { key: "spots", label: "Pigment spots", weight: 7, hint: "Photo-ageing" },
  { key: "hair", label: "Hair volume", weight: -6, hint: "Fuller hair reads younger" },
];

export const BASE_AGE = 30;

/** Photo artefacts: over/under-exposure hides texture; blur pulls toward the training mean. */
export function effectiveFeatures(f: Features, p: Photo): Features {
  const washout = Math.max(0, p.brightness) * 0.6;
  const k = 1 - washout - p.blur * 0.5;
  return { ...f, wrinkles: f.wrinkles * k, spots: f.spots * k, bags: f.bags * (1 - washout * 0.5) };
}

export function predictAge(f: Features, p: Photo = { brightness: 0, blur: 0 }) {
  const e = effectiveFeatures(f, p);
  const raw = BASE_AGE + 6 + featureMeta.reduce((a, m) => a + m.weight * e[m.key], 0);
  const mean = 62; // blur regresses toward the training-set mean
  return raw * (1 - p.blur * 0.4) + mean * p.blur * 0.4;
}

export function contributions(f: Features, p: Photo) {
  const e = effectiveFeatures(f, p);
  return featureMeta.map((m) => ({ label: m.label, value: m.weight * e[m.key] }));
}

/** Deterministic pseudo-embedding: 128 dims mixing the features through fixed random weights. */
export function embedding(f: Features, p: Photo) {
  const e = effectiveFeatures(f, p);
  const v = [e.wrinkles, e.grey, e.sag, e.bags, e.spots, e.hair, p.brightness * 0.3];
  const out: number[] = [];
  for (let d = 0; d < 128; d++) {
    let s = Math.sin(d * 1.7) * 0.3;
    v.forEach((x, j) => (s += Math.sin((d + 1) * (j + 3) * 0.91) * x));
    out.push(Math.tanh(s));
  }
  return out;
}

export function featuresForAge(age: number, jitter = 0): Features {
  const t = Math.min(1, Math.max(0, (age - 30) / 60));
  const j = (x: number) => Math.min(1, Math.max(0, x + jitter));
  return { wrinkles: j(t * 0.95), grey: j(t * 1.1 - 0.05), sag: j(t * 0.9), bags: j(t * 0.8), spots: j(t * 0.7), hair: j(1 - t * 0.6) };
}
