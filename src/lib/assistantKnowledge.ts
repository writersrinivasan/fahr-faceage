import { modules, type Block } from "./modules";
import { labs } from "./labs";

const strip = (t: string) => t.replace(/\*\*|\*/g, "");

function blockText(b: Block): string {
  switch (b.type) {
    case "h": return `\n## ${b.text}`;
    case "p": return strip(b.text);
    case "list": return b.items.map((i) => `- ${strip(i)}`).join("\n");
    case "callout": return `[${strip(b.title)}] ${strip(b.text)}`;
    case "stats": return b.items.map((s) => `- ${s.value}: ${s.label}`).join("\n");
    case "steps": return b.items.map((s, i) => `${i + 1}. ${s.title}: ${strip(s.text)}`).join("\n");
    case "table": return [b.head.join(" | "), ...b.rows.map((r) => r.map(strip).join(" | "))].join("\n");
  }
}

const CORE_FACTS = `
KEY RESEARCH FACTS (cite these accurately; do not invent numbers)

Paper 1 — FaceAge (2025): Bontempi D, et al., Aerts HJWL & Mak RH. The Lancet Digital Health, May 2025. DOI 10.1016/j.landig.2025.03.002. Mass General Brigham AI in Medicine (AIM) Program + Maastricht/MAASTRO.
- Pipeline: MTCNN face detection (P-Net, R-Net, O-Net) → crop & normalise → Inception-ResNet v1 (FaceNet) 128-d embedding → regression head → age. Transfer learning: last 281 of 426 layers fine-tuned. MAE loss, SGD momentum, batch 256, lr 0.001.
- Trained on 58,851 presumed-healthy people (56,304 IMDb-WIKI images; UTKFace for checking). MAE ≈ 4.09 y (curated older range), 5.87 y overall.
- Clinical validation: 6,196 cancer patients, photos at start of radiotherapy. Cohorts: MAASTRO pan-cancer n=4,906; Harvard Thoracic n=573; Harvard Palliative n=717; non-cancer reference n=535.
- Cancer patients' FaceAge ≈ 4.79 years higher than non-cancer reference (p<0.0001).
- Adjusted HR per decade of FaceAge: pan-cancer 1.151 (p=0.013), thoracic 1.148 (p=0.011), palliative 1.117 (p=0.021). FaceAge > 85 had notably worse survival.
- 10 clinicians predicted 6-month survival for 100 palliative patients: AUC ≈ 0.74 with photo + clinical data, ≈ 0.80 with FaceAge added (p<0.0001).
- Genomics: FaceAge associated with senescence gene CDK6; chronological age showed no significant gene associations.

Paper 2 — FAHR-Face (2026): Haugg F, Lee G, He J, et al., Aerts HJWL, Mak RH. "Foundation artificial intelligence models for health recognition by use of face photographs (FAHR-Face): a model development and validation study." The Lancet Digital Health, October 2026. DOI 10.1016/j.landig.2026.101056. Preprint arXiv 2506.14909.
- FAHR = Foundation Artificial intelligence models for Health Recognition.
- FAHR-Face: Vision Transformer pretrained as a masked autoencoder (75% of patches masked) on 40M+ faces from WebFace42M, no labels. Input 112×112 aligned crop (RetinaFace).
- FAHR-FaceAge: two-stage fine-tuning on 743,152 photos from 10 public datasets (stage 1: IMDB-WIKI, KANFace, FG-NET, CACD, AFAD, MegaAge, MORPH, LAGENDA; stage 2 age-balanced: UTKFace, AgeDB). L1 loss. MAE 5.1 years on held-out APPA-REAL (6,783 photos), lowest among benchmarks; outperformed original FaceAge for survival prognostication; age gap independently associated with survival.
- FAHR-FaceSurvival: fine-tuned on 34,363 photographs of patients with cancer with a survival ranking loss; evaluated by C-index. Cohorts: Harvard-RT (~38,000 patients) and independent external Maastro-RT (4,892). Highest vs lowest risk quartile adjusted HR 3.23 (p<0.0001) (preprint: 3.22).
- The two models are weakly correlated, both independently prognostic, combining improves accuracy. FAHR-FaceAge attends to nasolabial folds, forehead above orbits, temples; FAHR-FaceSurvival to area below eyes and nasal bridge.
- FAHR-FaceAge robust to pose, lighting, expression, make-up; small shift after rhinoplasty. Generalised across age, sex, race and cancer subgroups.
- Smoking, heavy alcohol and drug use linked to looking older (current > former > never smokers).
- Code Apache 2.0 (github.com/AIM-Harvard/FAHR-Face); FAHR-Face & FAHR-FaceAge weights on Hugging Face (CC BY-NC-SA 4.0, research only); FAHR-FaceSurvival weights not released. Public IRB-approved FaceAge Research Study: faceage.bwh.harvard.edu.
- Survival numbers like the C-index of FAHR-FaceSurvival are not available in this app's sources: say so if asked.

Core message: FaceAge / FAHR tools are PROGNOSTIC (predict outcomes after diagnosis), NOT DIAGNOSTIC (they do not detect cancer). Evidence is retrospective; tools support, never replace, clinicians.
`;

export function buildSystemPrompt(path: string) {
  const outline = modules.map((m) => `Module ${m.n} "${m.title}" (/learn/${m.slug}): ${m.takeaways.join(" ")}`).join("\n");
  const labList = labs.map((l) => `- ${l.title} (${l.href}): ${l.desc}`).join("\n");
  let pageContext = "The user is browsing the app's home or a general page.";
  const mod = modules.find((m) => path === `/learn/${m.slug}`);
  const lab = labs.find((l) => path === l.href);
  if (mod) pageContext = `The user is currently reading Module ${mod.n}: "${mod.title}". Full module text:\n${mod.blocks.map(blockText).join("\n")}`;
  else if (lab) pageContext = `The user is currently using the hands-on lab "${lab.title}": ${lab.desc} Help them understand and experiment with it.`;
  else if (path.startsWith("/quiz")) pageContext = "The user is on the quiz page. Give hints and explain concepts, but do not just reveal answers unless asked.";

  return `You are "FAHR Guide", the friendly AI tutor inside the FAHR · FaceAge Learning Lab, an educational web app about FaceAge (2025) and FAHR-Face (2026), deep-learning tools that estimate biological age and cancer survival risk from face photographs.

How to behave:
- Teach clearly for curious learners, students and clinicians. Use short paragraphs and bullet lists. Use simple analogies, then precise detail.
- Ground answers in the facts below. If something is not covered, say you are not sure and suggest checking the original papers. Never invent statistics, authors or citations.
- Always make clear FaceAge/FAHR are prognostic research tools, not cancer detectors, and not approved for clinical decisions.
- You are not a doctor. Do not give personal medical advice or interpret anyone's own health or photo; suggest they talk to a clinician.
- Point users to relevant modules (/learn/...) and labs (/lab/...) in this app when helpful.
- Refuse requests to use face analysis for discrimination, surveillance, insurance or hiring decisions, and briefly explain why.

${CORE_FACTS}

APP MODULES:
${outline}

APP LABS:
${labList}

CURRENT PAGE CONTEXT (${path}):
${pageContext}`;
}
