import PageHeader from "@/components/PageHeader";

const refs = [
  { t: "Bontempi D, Zalay O, Bitterman DS, et al. FaceAge, a deep learning system to estimate biological age from face photographs to improve prognostication: a model development and validation study. Lancet Digit Health 2025.", u: "https://doi.org/10.1016/j.landig.2025.03.002", tag: "Primary paper" },
  { t: "PubMed record of the Lancet Digital Health paper", u: "https://pubmed.ncbi.nlm.nih.gov/40345937/", tag: "Primary paper" },
  { t: "AIM-Harvard/FaceAge: open-source code, documentation and model weights", u: "https://github.com/AIM-Harvard/FaceAge", tag: "Code" },
  { t: "AIM Program project page: FaceAge", u: "https://aim.mgh.harvard.edu/faceage", tag: "Project" },
  { t: "Mass General Brigham press release: AI tool uses face photos to estimate biological age and predict cancer outcomes (May 2025)", u: "https://www.massgeneralbrigham.org/en/about/newsroom/press-releases/ai-face-photos-tool-estimate-age-predict-cancer-outcomes", tag: "News" },
  { t: "Harvard Gazette: New AI tool predicts biological age by looking at a face", u: "https://news.harvard.edu/gazette/story/2025/05/new-ai-tool-predicts-biological-age-by-looking-at-a-face/", tag: "News" },
  { t: "ASCO Post: AI model estimates biological age and predicts survival in patients with cancer", u: "https://ascopost.com/news/may-2025/ai-model-estimates-biological-age-and-predicts-survival-in-patients-with-cancer/", tag: "News" },
  { t: "Zhang K, et al. Joint face detection and alignment using multitask cascaded convolutional networks (MTCNN). IEEE Signal Process Lett 2016.", u: "https://arxiv.org/abs/1604.02878", tag: "Method" },
  { t: "Schroff F, et al. FaceNet: a unified embedding for face recognition and clustering. CVPR 2015.", u: "https://arxiv.org/abs/1503.03832", tag: "Method" },
  { t: "vladmandic/face-api: the open-source browser model used in this app's live scanner (not FaceAge)", u: "https://github.com/vladmandic/face-api", tag: "Tool used here" },
];

const glossary = [
  ["Biological age", "An estimate of how aged the body is, based on biological markers rather than birth date."],
  ["Age gap", "FaceAge minus chronological age. Positive means the face looks older."],
  ["CNN", "Convolutional neural network: a model that learns visual patterns from pixels."],
  ["MTCNN", "Multi-Task Cascaded CNN: three-stage face detector (P-Net, R-Net, O-Net)."],
  ["Embedding", "A compact list of numbers (128 for FaceNet) summarising a face."],
  ["Transfer learning", "Starting from a pre-trained model and fine-tuning it for a new task."],
  ["MAE", "Mean absolute error: the average size of prediction errors."],
  ["Hazard ratio", "Relative instantaneous risk of an event between two groups."],
  ["Kaplan–Meier curve", "A step curve of the proportion surviving over time."],
  ["AUC / C-index", "How well a model ranks higher-risk patients above lower-risk ones (0.5 = chance)."],
  ["Prognostic vs diagnostic", "Prognostic predicts outcome; diagnostic detects disease. FaceAge is prognostic."],
  ["ECOG performance status", "A 0–5 clinician score of how well a patient manages daily activities."],
  ["Senescence", "A state where ageing cells stop dividing; linked to CDK6 and ageing biology."],
];

export default function References() {
  return (
    <div>
      <PageHeader kicker="Sources & glossary" title="References">Every research claim in this app comes from these sources. Hands-on simulations are illustrative.</PageHeader>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="card divide-y divide-line">
          {refs.map((r) => (
            <a key={r.u} href={r.u} target="_blank" rel="noreferrer" className="block p-4 hover:bg-violet-50">
              <span className="mr-2 rounded-full bg-fuchsia-100 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-800">{r.tag}</span>
              <span className="text-sm">{r.t}</span>
              <div className="mt-1 truncate text-xs text-violet-700">{r.u}</div>
            </a>
          ))}
        </div>
        <div className="card p-5">
          <h2 className="font-display text-xl font-bold">📖 Glossary</h2>
          <dl className="mt-3 space-y-3">
            {glossary.map(([k, v]) => (<div key={k}><dt className="font-semibold">{k}</dt><dd className="text-sm text-muted">{v}</dd></div>))}
          </dl>
        </div>
      </div>
    </div>
  );
}
