"use client";
import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

const Q = [
  { q: "What does FaceAge estimate?", o: ["Whether a person has cancer", "Biological age from a face photo", "Tumour size", "Genetic ancestry"], a: 1, e: "FaceAge outputs a biological-age estimate. It is prognostic, not diagnostic." },
  { q: "Which statement about FaceAge and cancer is correct?", o: ["It detects early cancer from selfies", "It replaces biopsies", "It helps predict outcomes after diagnosis", "It identifies the tumour type"], a: 2, e: "It is used after diagnosis to inform prognosis, such as overall survival." },
  { q: "On what kind of people was FaceAge trained?", o: ["Cancer patients", "Presumed healthy individuals", "Only children", "Hospital ICU patients"], a: 1, e: "About 58,851 presumed healthy people, so deviations in patients carry signal." },
  { q: "Which network finds the face first?", o: ["MTCNN", "U-Net", "GPT", "YOLO-Med"], a: 0, e: "MTCNN runs P-Net, R-Net and O-Net to detect the face and five landmarks." },
  { q: "What backbone produces FaceAge's 128-number embedding?", o: ["ResNet-50", "VGG-16", "Inception-ResNet v1 (FaceNet)", "Vision Transformer"], a: 2, e: "A FaceNet Inception-ResNet v1 pre-trained for face recognition, then fine-tuned." },
  { q: "On average, how much older did cancer patients look than the non-cancer reference?", o: ["About 1 year", "About 4.8 years", "About 12 years", "No difference"], a: 1, e: "Mean increase of 4.79 years (p < 0.0001)." },
  { q: "Pan-cancer HR per decade of FaceAge was 1.151. With a +20 year gap the relative hazard is about…", o: ["1.15×", "1.32×", "2.30×", "3.00×"], a: 1, e: "1.151² ≈ 1.32, because the HR compounds per decade." },
  { q: "Adding FaceAge to clinicians' 6-month survival predictions changed AUC from about…", o: ["0.50 → 0.55", "0.74 → 0.80", "0.90 → 0.95", "0.61 → 0.62"], a: 1, e: "In the palliative study, AUC improved from ~0.74 to ~0.80." },
  { q: "Which gene was FaceAge associated with in the genomic analysis?", o: ["BRCA1", "TP53", "CDK6", "EGFR"], a: 2, e: "CDK6, a cell-cycle and senescence-related gene. Chronological age showed no such link." },
  { q: "Which group had notably worse survival in the study?", o: ["FaceAge under 50", "FaceAge over 85", "Women only", "Never-smokers"], a: 1, e: "Patients with FaceAge above 85 had markedly worse survival." },
  { q: "Which is a photo artefact rather than biology?", o: ["Cachexia weight loss", "Long-term smoking", "Soft studio lighting", "Cellular senescence"], a: 2, e: "Lighting changes the pixels without changing biology." },
  { q: "Which use of FaceAge is ethically inappropriate?", o: ["Supporting palliative care planning", "Stratifying trial participants", "Setting life-insurance premiums", "Monitoring decline during treatment"], a: 2, e: "The authors warned against misuse such as insurance decisions." },
  { q: "What does FAHR stand for in FAHR-Face?", o: ["Facial Age Hazard Ratio", "Foundation AI models for Health Recognition", "Face Analysis for Human Risk", "Fast Automated Health Readout"], a: 1, e: "FAHR = Foundation Artificial intelligence models for Health Recognition (Haugg et al., 2026)." },
  { q: "How was FAHR-Face pretrained?", o: ["Supervised on cancer outcomes", "Masked autoencoder on 40M+ unlabelled faces", "On 6,196 radiotherapy photos", "With identity labels from FaceNet"], a: 1, e: "A Vision Transformer learned to reconstruct 75% hidden patches across 40M+ WebFace42M images, with no labels." },
  { q: "What does FAHR-FaceSurvival's HR of 3.23 compare?", o: ["Per decade of FaceAge", "Smokers vs non-smokers", "Highest vs lowest risk quartile", "Men vs women"], a: 2, e: "Patients in the top risk quartile had about 3.2× the adjusted hazard of death of the bottom quartile (p < 0.0001)." },
  { q: "How did FAHR-FaceAge and FAHR-FaceSurvival relate to each other?", o: ["Almost identical predictions", "Weakly correlated and complementary", "FaceSurvival replaced FaceAge", "Only FaceAge predicted survival"], a: 1, e: "They were weakly correlated, both independently prognostic, and combining them improved accuracy." },
  { q: "Which facial regions did FAHR-FaceSurvival rely on most?", o: ["Hairline and ears", "Below the eyes and nasal bridge", "Chin and jaw", "Lips"], a: 1, e: "FaceSurvival: below the eyes and nasal bridge. FaceAge: nasolabial folds, forehead above the orbits and temples." },
];

export default function QuizPage() {
  const [ans, setAns] = useState<Record<number, number>>({});
  const score = Q.filter((q, i) => ans[i] === q.a).length;
  const done = Object.keys(ans).length === Q.length;
  return (
    <div>
      <PageHeader kicker="Check your understanding" title="FaceAge quiz">Seventeen questions covering the whole learning path. Each answer shows an explanation.</PageHeader>
      <div className="mx-auto max-w-3xl space-y-4 px-4">
        <div className="sticky top-16 z-10 card flex items-center justify-between p-4">
          <span className="font-semibold">Score: {score} / {Q.length}</span>
          <span className="text-sm text-muted">{Object.keys(ans).length} answered</span>
          <button onClick={() => setAns({})} className="text-sm font-semibold text-violet-700">Reset</button>
        </div>
        {Q.map((q, i) => (
          <div key={i} className="card p-5">
            <div className="font-semibold"><span className="mr-2 text-fuchsia-500">Q{i + 1}.</span>{q.q}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.o.map((o, j) => {
                const picked = ans[i] === j, answered = ans[i] !== undefined, right = j === q.a;
                return (
                  <button key={j} disabled={answered} onClick={() => setAns({ ...ans, [i]: j })}
                    className={`rounded-xl px-3 py-2 text-left text-sm ring-1 transition ${answered ? (right ? "bg-emerald-100 ring-emerald-400" : picked ? "bg-rose-100 ring-rose-400" : "bg-white ring-line opacity-60") : "bg-white ring-line hover:bg-violet-50"}`}>
                    {answered && right ? "✅ " : answered && picked ? "❌ " : ""}{o}
                  </button>
                );
              })}
            </div>
            {ans[i] !== undefined && <p className="mt-3 rounded-xl bg-violet-50 p-3 text-sm">💡 {q.e}</p>}
          </div>
        ))}
        {done && (
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 p-8 text-center text-white shadow-xl">
            <div className="text-5xl">{score >= 10 ? "🏆" : score >= 7 ? "🎉" : "📚"}</div>
            <div className="mt-2 font-display text-3xl font-bold">{score} / {Q.length}</div>
            <p className="mt-1">{score >= 10 ? "Excellent. You understand FaceAge well." : score >= 7 ? "Good work. Review the modules you missed." : "Revisit the learning path and try again."}</p>
            <Link href="/learn" className="mt-4 inline-block rounded-full bg-white px-5 py-2 font-semibold text-violet-700">Back to modules</Link>
          </div>
        )}
      </div>
    </div>
  );
}
