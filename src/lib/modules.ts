import { fahrModules } from "./fahrModules";

export type Block =
  | { type: "h"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; tone: "info" | "warn" | "tip" | "key"; title: string; text: string }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "table"; head: string[]; rows: string[][] };

export type Module = {
  slug: string;
  n: number;
  emoji: string;
  title: string;
  tagline: string;
  minutes: number;
  gradient: string;
  lab?: { href: string; label: string };
  blocks: Block[];
  takeaways: string[];
};

const baseModules: Module[] = [
  {
    slug: "biological-age",
    n: 1,
    emoji: "⏳",
    title: "Chronological vs biological age",
    tagline: "Why two 70-year-olds can be very different patients.",
    minutes: 8,
    gradient: "from-violet-500 to-fuchsia-500",
    lab: { href: "/lab/pipeline", label: "Build a face and watch the age estimate move" },
    blocks: [
      { type: "p", text: "**Chronological age** is the number of years since you were born. It is exact, easy to record, and it appears in almost every clinical risk score. But it is a blunt tool. Two people born in the same year can differ enormously in how well their heart, lungs, kidneys, immune system and muscles work." },
      { type: "p", text: "**Biological age** is an estimate of how 'old' the body behaves. It tries to capture the accumulated wear of living: DNA damage, cellular senescence, chronic inflammation, smoking, sun exposure, poor nutrition, stress, and disease. A person whose biological age is higher than their chronological age is, on average, more vulnerable to illness and to the side effects of treatment." },
      { type: "h", text: "How scientists measure biological age" },
      { type: "table", head: ["Approach", "What it measures", "Practical drawback"], rows: [
        ["Epigenetic clocks (Horvath, PhenoAge, GrimAge)", "DNA methylation patterns in blood or tissue", "Needs a lab assay; costly; days to results"],
        ["Telomere length", "Length of chromosome end-caps", "Noisy; weak individual-level prediction"],
        ["Frailty indices & geriatric assessment", "Deficits in function, mobility, cognition", "Time-consuming; needs trained staff"],
        ["Blood-biomarker clocks", "Albumin, creatinine, CRP, glucose, etc.", "Needs recent blood work"],
        ["Imaging clocks (brain MRI, chest X-ray, ECG)", "Organ appearance learned by deep learning", "Needs the scan to exist"],
        ["Face photo (FaceAge)", "Appearance of the face", "Affected by lighting, cosmetics, ethnicity, bias"],
      ]},
      { type: "h", text: "Why the face is a window into ageing" },
      { type: "p", text: "Humans have always judged health from faces. Clinicians call it the 'eyeball test'. The face shows many slow biological processes at once:" },
      { type: "list", items: [
        "**Skin**: loss of collagen and elastin, wrinkles, thinning, pigment spots and photo-ageing from UV exposure.",
        "**Fat redistribution**: loss of the cheek and temple fat pads, hollowing around the eyes (also seen in cancer cachexia).",
        "**Bone remodelling**: the eye sockets widen and the jaw recedes with age.",
        "**Muscle tone**: sagging jowls and drooping eyelids.",
        "**Hair**: greying and thinning.",
        "**Illness signals**: pallor, jaundice, fatigue, weight loss, and swelling from steroids.",
      ]},
      { type: "callout", tone: "key", title: "The core idea", text: "If you teach a computer what *healthy* people of each age look like, then a patient who looks much older than their real age may be carrying extra biological 'wear'. That difference, the **age gap**, can be a useful number for doctors." },
      { type: "h", text: "Why oncology cares" },
      { type: "p", text: "Cancer treatment is a trade-off between benefit and harm. Radiotherapy, surgery, chemotherapy and immunotherapy all stress the body. Oncologists constantly ask: *Is this patient fit enough for aggressive treatment? How long are they likely to live? Would a gentler, palliative approach be kinder?* Today this rests largely on chronological age plus a subjective **performance status** score such as ECOG or Karnofsky. Research shows doctors are often over-optimistic when predicting survival. An objective, cheap, instant biological-age signal would be very valuable." },
    ],
    takeaways: [
      "Chronological age counts years. Biological age estimates how worn the body is.",
      "Many biological-age clocks exist, but most need lab tests, scans or long assessments.",
      "The face visibly reflects skin, fat, bone, muscle and illness changes.",
      "Oncologists need better tools to judge fitness and life expectancy.",
    ],
  },
  {
    slug: "what-is-faceage",
    n: 2,
    emoji: "🧑‍⚕️",
    title: "What is FaceAge?",
    tagline: "The research project, the team and the headline result.",
    minutes: 7,
    gradient: "from-fuchsia-500 to-rose-500",
    lab: { href: "/lab/face-scan", label: "Try a live face age estimator" },
    blocks: [
      { type: "p", text: "**FaceAge** is a deep-learning system that estimates a person's biological age from a single, ordinary face photograph. It was developed by the **Artificial Intelligence in Medicine (AIM) Program at Mass General Brigham / Harvard Medical School**, with collaborators at **Maastricht University and the MAASTRO Clinic** in the Netherlands." },
      { type: "p", text: "The main paper is: Bontempi D, Zalay O, Bitterman DS, et al., Aerts HJWL & Mak RH. *FaceAge, a deep learning system to estimate biological age from face photographs to improve prognostication: a model development and validation study.* **The Lancet Digital Health**, May 2025 (DOI 10.1016/j.landig.2025.03.002). The code and trained weights are open source on GitHub (AIM-Harvard/FaceAge)." },
      { type: "stats", items: [
        { value: "58,851", label: "healthy people's photos used to build the model" },
        { value: "6,196", label: "cancer patients used for clinical validation" },
        { value: "+4.79 yrs", label: "average extra 'face age' of cancer patients vs non-cancer reference" },
        { value: "0.74 → 0.80", label: "clinicians' 6-month survival AUC without vs with FaceAge" },
      ]},
      { type: "h", text: "What FaceAge outputs" },
      { type: "p", text: "Give it a photo and it returns one number: the estimated age in years. Researchers then compare it with the patient's real age:" },
      { type: "list", items: [
        "**FaceAge** = model-estimated biological age (e.g. 78 years).",
        "**Chronological age** = real age (e.g. 70 years).",
        "**Age gap / FaceAge deviation** = FaceAge minus chronological age (here, +8 years: 'looks older than they are').",
      ]},
      { type: "callout", tone: "warn", title: "Important: FaceAge does not find or diagnose cancer", text: "FaceAge is a **prognostic** tool, not a **diagnostic** tool. It cannot tell whether someone has cancer. It is used *after* a cancer diagnosis to help estimate how a patient is likely to do, for example their overall survival, so that treatment can be better matched to the person." },
      { type: "h", text: "Why it is exciting" },
      { type: "list", items: [
        "**Cheap and instant**: a phone or webcam photo, no blood draw, no scanner.",
        "**Objective**: the same photo always gives the same number, unlike human impressions.",
        "**Independent information**: it predicted survival even after accounting for chronological age, sex and cancer type.",
        "**Biologically meaningful**: it was linked to a cell-ageing (senescence) gene, while chronological age was not.",
        "**Open science**: code and weights are public, so other groups can test it.",
      ]},
      { type: "callout", tone: "key", title: "Two generations of the same idea", text: "This module covers the original **FaceAge** (2025). In October 2026 the team published its successor, **FAHR-Face** (Foundation AI models for Health Recognition), in the same journal. It adds a more accurate **FAHR-FaceAge** and a new **FAHR-FaceSurvival** model that predicts survival directly. Modules 5 and 6 cover it in depth." },
      { type: "callout", tone: "info", title: "Quote from the team", text: "\"How old someone looks compared to their chronological age really matters.\" (Hugo Aerts, PhD, director of the AIM Program, Mass General Brigham press release, May 2025)." },
    ],
    takeaways: [
      "FaceAge estimates biological age from one face photo.",
      "Built at Mass General Brigham/Harvard with Maastricht; published in The Lancet Digital Health, 2025.",
      "The key derived number is the age gap: FaceAge minus real age.",
      "It is prognostic (predicts outcome), not diagnostic (does not detect cancer).",
    ],
  },
  {
    slug: "how-it-works",
    n: 3,
    emoji: "🧠",
    title: "How FaceAge works, step by step",
    tagline: "From a raw photo to a number: detection, cropping, a CNN and regression.",
    minutes: 12,
    gradient: "from-sky-500 to-indigo-500",
    lab: { href: "/lab/pipeline", label: "Walk through the pipeline interactively" },
    blocks: [
      { type: "p", text: "FaceAge is a **two-stage deep-learning pipeline**: first find the face, then estimate its age. Each stage is a convolutional neural network (CNN), a type of model that learns visual patterns such as edges, textures and shapes directly from pixels." },
      { type: "steps", items: [
        { title: "1 · Input photo", text: "An ordinary RGB photograph. In the clinical studies these were routine photos taken at the start of radiotherapy for patient identification, so no special equipment was needed." },
        { title: "2 · Face detection with MTCNN", text: "A Multi-Task Cascaded CNN runs three small networks in sequence. **P-Net** quickly proposes candidate face boxes. **R-Net** rejects false candidates and refines the boxes. **O-Net** outputs the final box plus five facial landmarks (eyes, nose, mouth corners)." },
        { title: "3 · Crop and normalise", text: "The detected box is cropped, resized to the network's input size, and pixel values are standardised across the red, green and blue channels. This removes background and reduces differences in brightness between photos." },
        { title: "4 · Feature extraction with Inception-ResNet v1", text: "The backbone is the well-known FaceNet architecture (Inception-ResNet v1), pre-trained on millions of faces for face recognition. It compresses the face into a compact **128-number embedding** that describes facial structure and texture." },
        { title: "5 · Regression head", text: "The original classification layer was removed and replaced with dense layers ending in a **single linear output**: a continuous age in years." },
        { title: "6 · FaceAge output", text: "The predicted age is compared with the real age to compute the **age gap**, which is then used in survival statistics." },
      ]},
      { type: "h", text: "Training: transfer learning on healthy faces" },
      { type: "p", text: "Instead of training from scratch, the team used **transfer learning**. They started with a network that already understood faces, then re-trained (fine-tuned) the last 281 of its 426 layers to predict age. Key details from the open-source repository:" },
      { type: "table", head: ["Setting", "Value"], rows: [
        ["Training data", "56,304 age-labelled images from IMDb-WIKI (58,851 healthy individuals in total including UTKFace)"],
        ["Independent check", "UTKFace dataset"],
        ["Age range emphasis", "Photos of people 60+ were manually quality-checked; cancer patients are mostly older adults"],
        ["Loss function", "Mean Absolute Error (MAE), the average size of the age error in years"],
        ["Optimiser", "Stochastic gradient descent with momentum, learning rate 0.001, reduced on plateau"],
        ["Batch size", "256"],
        ["Regularisation", "Batch normalisation and dropout, plus data augmentation and rebalancing"],
        ["Split", "90% training / 10% testing"],
        ["Error (curated older range)", "MAE ≈ 4.09 years"],
        ["Error (overall)", "MAE ≈ 5.87 years"],
        ["Framework", "Keras / TensorFlow"],
      ]},
      { type: "callout", tone: "key", title: "Why train on *healthy* people?", text: "The model learns the normal relationship between appearance and age. When it is applied to a patient with cancer, any systematic 'extra' age it sees reflects something the healthy population did not have, such as disease burden, frailty or accelerated ageing. That deviation is the signal." },
      { type: "h", text: "What does the network actually look at?" },
      { type: "p", text: "Researchers can use saliency (attention) maps to see which pixels most influence a CNN. For face-age models these typically highlight areas a human would expect: around the eyes, forehead, nasolabial folds, mouth and skin texture. For FaceAge specifically, the authors acknowledge that the exact cues it relies on are not fully understood. Like most deep networks, FaceAge is partly a **black box**, which is one reason prospective validation matters." },
      { type: "callout", tone: "info", title: "What changed in 2026", text: "This is the **original FaceAge** pipeline. The 2026 **FAHR-Face** family replaces MTCNN with RetinaFace, the CNN with a **Vision Transformer**, and supervised pretraining with a **masked autoencoder** trained on 40M+ unlabelled faces. See the module on FAHR-Face." },
      { type: "callout", tone: "tip", title: "Good practice for any face-age model", text: "Check robustness: run several photos of the same person, vary lighting and pose, and confirm the estimate stays stable. Large swings point to photo artefacts rather than biology. You can try this yourself in the Lab's face scanner." },
    ],
    takeaways: [
      "Stage 1: MTCNN finds and crops the face (P-Net → R-Net → O-Net).",
      "Stage 2: an Inception-ResNet v1 (FaceNet) backbone creates a 128-d embedding.",
      "A regression head converts the embedding to one age number.",
      "Trained by transfer learning on ~58,851 healthy faces, optimising mean absolute error.",
    ],
  },
  {
    slug: "oncology-evidence",
    n: 4,
    emoji: "🎗️",
    title: "FaceAge in oncology: the evidence",
    tagline: "What researchers found in 6,196 cancer patients.",
    minutes: 14,
    gradient: "from-rose-500 to-orange-500",
    lab: { href: "/lab/cohort", label: "Simulate a cancer cohort and its survival curves" },
    blocks: [
      { type: "p", text: "After training on healthy faces, the team asked a clinical question: **does FaceAge tell us anything about how cancer patients will do?** They used photographs routinely taken at the start of radiotherapy from cohorts in the Netherlands and the United States." },
      { type: "table", head: ["Cohort", "Patients (analysed)", "Description"], rows: [
        ["MAASTRO (Netherlands), pan-cancer", "4,906", "Patients treated with curative-intent radiotherapy across many cancer types"],
        ["Harvard Thoracic", "573", "Lung and other thoracic cancers"],
        ["Harvard Palliative", "717", "Incurable cancers receiving palliative radiotherapy"],
        ["Non-cancer reference", "535", "People without cancer, for comparison"],
      ]},
      { type: "h", text: "Finding 1 · Cancer patients look older" },
      { type: "p", text: "On average, patients with cancer had a FaceAge about **4.79 years higher** than the non-cancer reference group (p < 0.0001). Disease, treatment, smoking and stress may all add 'visible years'." },
      { type: "h", text: "Finding 2 · Looking older predicts shorter survival" },
      { type: "p", text: "Using Cox proportional-hazards models adjusted for chronological age, sex and cancer type, higher FaceAge was linked to worse overall survival:" },
      { type: "table", head: ["Cohort", "Hazard ratio per decade of FaceAge", "p-value"], rows: [
        ["Pan-cancer (n = 4,906)", "1.151", "0.013"],
        ["Thoracic (n = 573)", "1.148", "0.011"],
        ["Palliative (n = 717)", "1.117", "0.021"],
      ]},
      { type: "p", text: "A hazard ratio of 1.151 per decade means that, for two otherwise similar patients, the one whose face looks 10 years older has roughly **15% higher risk of death at any given time**. Patients whose FaceAge was **over 85** had notably worse survival than others." },
      { type: "h", text: "Finding 3 · FaceAge helps clinicians" },
      { type: "p", text: "Ten clinicians and researchers were asked to predict whether 100 palliative patients would be alive at 6 months. With only the photo their predictions were barely better than a coin flip. With photos plus clinical data they reached an AUC of about **0.74**. When FaceAge risk information was added, accuracy rose to an AUC of about **0.80** (p < 0.0001). FaceAge on its own also outperformed the clinicians' predictions." },
      { type: "h", text: "Finding 4 · A link to cell biology" },
      { type: "p", text: "In a genomic sub-analysis of lung cancer patients, FaceAge was significantly associated with **CDK6**, a gene that controls the cell cycle and cellular senescence (the state in which ageing cells stop dividing). Chronological age showed no such significant gene associations after multiple-testing correction. This suggests FaceAge reflects real biological ageing, not just appearance." },
      { type: "h", text: "Later work" },
      { type: "p", text: "Follow-up analyses from the same group in much larger radiotherapy populations (reported around 24,000+ patients aged 60+) found that a FaceAge at least 10 years above chronological age was associated with higher mortality, reinforcing the original findings. Treat these as early, still-maturing results." },
      { type: "callout", tone: "warn", title: "Reminder", text: "All of these studies are **retrospective** (looking back at existing data). Before FaceAge can guide real treatment decisions, it needs **prospective trials**, testing in diverse populations, and regulatory review." },
    ],
    takeaways: [
      "Cancer patients' faces looked ~4.8 years older than a non-cancer reference.",
      "Each extra decade of FaceAge: ~12–15% higher hazard of death, independent of real age.",
      "FaceAge > 85 flagged notably poor survival.",
      "Adding FaceAge raised clinicians' 6-month survival AUC from ~0.74 to ~0.80.",
      "FaceAge was linked to the senescence gene CDK6; real age was not.",
    ],
  },
  {
    slug: "clinical-use-cases",
    n: 5,
    emoji: "🏥",
    title: "Practical use cases in cancer care",
    tagline: "Where a face-based biomarker could actually change decisions.",
    minutes: 9,
    gradient: "from-amber-500 to-lime-500",
    lab: { href: "/lab/challenge", label: "Play the clinician challenge" },
    blocks: [
      { type: "p", text: "Researchers see FaceAge as a **decision-support biomarker**: one more objective input alongside the history, examination, imaging, pathology and labs. Here are the leading scenarios being discussed." },
      { type: "steps", items: [
        { title: "🎯 Treatment intensity", text: "A 75-year-old who looks 65 may tolerate concurrent chemo-radiation well. A 65-year-old who looks 80 may do better with a gentler regimen. FaceAge could help personalise intensity instead of using age cut-offs." },
        { title: "🕊️ Palliative and end-of-life planning", text: "Doctors tend to overestimate remaining life. Better short-term survival estimates help choose shorter radiotherapy courses, start hospice discussions earlier and avoid burdensome treatment near the end of life." },
        { title: "📊 Clinical trial stratification", text: "Trials could use FaceAge to balance 'biologically older' and 'younger' patients across arms, or to select fit older patients who are often excluded." },
        { title: "📈 Monitoring over time", text: "Serial photos could track whether a patient's biological age is accelerating during treatment, signalling toxicity, cachexia or decline earlier." },
        { title: "💻 Telehealth & low-resource settings", text: "A phone camera is everywhere. FaceAge-style tools could support triage where geriatric assessments or blood tests are hard to obtain." },
        { title: "🧬 Research biomarker", text: "Because it is linked to senescence biology, FaceAge can be used to study ageing, frailty and how treatments affect biological age." },
      ]},
      { type: "h", text: "How it might fit a clinic workflow" },
      { type: "list", items: [
        "Patient photo is captured at registration (many radiotherapy centres already do this for identification).",
        "FaceAge runs automatically in the background.",
        "The oncologist sees FaceAge, chronological age, the age gap and a risk band beside performance status.",
        "The number prompts a conversation; it never decides alone.",
      ]},
      { type: "callout", tone: "info", title: "Beyond cancer", text: "Ageing underlies cardiovascular, metabolic, neurological and many other chronic diseases. The team has noted interest in testing FaceAge-like tools across other conditions and in healthy-ageing research." },
    ],
    takeaways: [
      "FaceAge is designed as decision support, not an automated decision maker.",
      "Main uses: treatment intensity, palliative planning, trial stratification and monitoring.",
      "Low cost and phone-camera input make it attractive for telehealth.",
    ],
  },
  {
    slug: "reading-the-numbers",
    n: 6,
    emoji: "📐",
    title: "Reading the numbers",
    tagline: "Age gap, hazard ratios, Kaplan–Meier curves, AUC and MAE explained simply.",
    minutes: 10,
    gradient: "from-emerald-500 to-teal-500",
    lab: { href: "/lab/survival", label: "Open the survival risk calculator" },
    blocks: [
      { type: "p", text: "Research papers on FaceAge use a few statistical tools. You can understand all of them with simple intuition." },
      { type: "h", text: "Mean Absolute Error (MAE)" },
      { type: "p", text: "The average size of the age error. An MAE of 4 years means the prediction is, on average, 4 years away from the true age. For FaceAge this is measured on **healthy** people, where looking older is not expected." },
      { type: "h", text: "Age gap (FaceAge deviation)" },
      { type: "p", text: "**Gap = FaceAge − chronological age.** Positive means 'looks older'. Because of model error, small gaps (±4 years) are within noise. Large, consistent gaps are more meaningful." },
      { type: "h", text: "Hazard ratio (HR)" },
      { type: "p", text: "The hazard is the instantaneous risk of the event (here, death) at any moment. An HR compares two groups. HR = 1 means equal risk. HR = 1.15 means 15% higher risk. FaceAge HRs are reported **per decade**, so for a gap of g years the relative hazard is roughly **HR^(g/10)**. With HR 1.151, a 20-year gap gives 1.151² ≈ 1.32, about 32% higher risk." },
      { type: "h", text: "Quartile hazard ratio" },
      { type: "p", text: "FAHR-FaceSurvival results are reported by **quartile**: patients are ranked by risk score and split into four equal groups. HR 3.23 for the top versus bottom quartile means the highest-risk quarter had about 3.2 times the instantaneous risk of death of the lowest-risk quarter, after adjustment. This is not a per-unit or per-decade figure." },
      { type: "h", text: "Kaplan–Meier (KM) curves" },
      { type: "p", text: "A KM curve shows the fraction of patients still alive over time. Each drop is a death; patients lost to follow-up are 'censored'. When the FaceAge > 85 curve sits below the others, those patients die sooner on average." },
      { type: "h", text: "AUC (area under the ROC curve)" },
      { type: "p", text: "For a yes/no prediction such as 'alive at 6 months', AUC is the chance that the model ranks a random patient who died as higher-risk than a random survivor. 0.5 is a coin flip, 1.0 is perfect. Moving from 0.74 to 0.80 is a meaningful gain in clinical prediction." },
      { type: "h", text: "Concordance index (C-index)" },
      { type: "p", text: "The survival-analysis version of AUC: the share of patient pairs where the one predicted to be at higher risk actually died first." },
      { type: "callout", tone: "tip", title: "Independent vs correlated", text: "FaceAge correlates strongly with real age. What matters is that it predicts survival **even after adjusting** for real age. That is what 'independent prognostic value' means." },
    ],
    takeaways: [
      "MAE = average error in years; gap = FaceAge − real age.",
      "HR per decade compounds: relative risk ≈ HR^(gap/10).",
      "KM curves show survival over time; AUC and C-index measure ranking accuracy.",
    ],
  },
  {
    slug: "limitations-ethics",
    n: 7,
    emoji: "⚖️",
    title: "Limitations, bias and ethics",
    tagline: "What can go wrong, and how to use face AI responsibly.",
    minutes: 10,
    gradient: "from-slate-600 to-violet-600",
    lab: { href: "/lab/bias", label: "Explore confounders and bias" },
    blocks: [
      { type: "h", text: "Technical limitations" },
      { type: "list", items: [
        "**Training data bias**: IMDb-WIKI is mostly celebrities, who often use make-up, professional lighting and cosmetic procedures, and is skewed toward lighter-skinned, Western faces.",
        "**Label noise**: ages in web datasets are inferred from dates and can be wrong.",
        "**Photo conditions**: extreme lighting, blur, angles, glasses, hats or facial hair may shift estimates. The 2026 FAHR-FaceAge was reported to be robust to pose, lighting, expression and make-up, but very poor photos remain a risk.",
        "**Disease-specific appearance**: steroid-related facial swelling, radiation skin changes or cachexia can push FaceAge up or down for reasons unrelated to general ageing.",
        "**Explainability**: the exact visual cues are not fully known.",
        "**Retrospective evidence**: results come from historical data at a few centres, not prospective trials.",
        "**Partly closed models**: FAHR-FaceSurvival weights are not public, so other groups cannot yet verify it independently.",
        "**Plastic surgery**: FAHR-FaceAge showed a small shift after rhinoplasty, so some procedures can still change the estimate.",
      ]},
      { type: "h", text: "Ethical risks" },
      { type: "list", items: [
        "**Discrimination**: insurers or employers could misuse face-based health predictions. The authors explicitly warned about this.",
        "**Consent and privacy**: faces are biometric data. Patients must know how photos are used and stored.",
        "**Self-fulfilling prophecy**: a 'looks old' label could lead to under-treatment.",
        "**Fairness**: unequal accuracy across skin tones, sexes or ethnic groups could widen health disparities.",
        "**Psychological harm**: telling someone their face looks 'old and high risk' needs care.",
      ]},
      { type: "callout", tone: "key", title: "Responsible use principles", text: "Use FaceAge only as supportive information inside a clinician's judgement. Validate it locally and across subgroups. Get informed consent, protect images and never use it for non-medical decisions such as insurance or hiring." },
    ],
    takeaways: [
      "Training data skews toward celebrities and certain demographics.",
      "Photo conditions and treatment effects can confound estimates.",
      "Ethical issues: consent, privacy, discrimination and fairness.",
      "Prospective, diverse validation is required before routine clinical use.",
    ],
  },
  {
    slug: "future",
    n: 8,
    emoji: "🚀",
    title: "The road ahead",
    tagline: "From research prototype to clinical tool.",
    minutes: 6,
    gradient: "from-indigo-500 to-cyan-500",
    lab: { href: "/quiz", label: "Test yourself in the quiz" },
    blocks: [
      { type: "steps", items: [
        { title: "Prospective trials", text: "Test FaceAge in real time at the point of care and measure whether it improves decisions and patient outcomes." },
        { title: "Diverse validation", text: "Evaluate across ethnicities, countries, age groups, devices and photo conditions." },
        { title: "Multimodal models", text: "Combine FaceAge with labs, imaging, genomics and performance status for stronger prediction." },
        { title: "Next-generation facial health AI (now published)", text: "The 2026 FAHR-Face foundation model delivered this step: FAHR-FaceSurvival estimates risk directly rather than age. The same backbone can be fine-tuned for new facial health biomarkers." },
        { title: "Public research participation", text: "The IRB-approved FaceAge Research Study (faceage.bwh.harvard.edu) lets anyone contribute a photo, which helps validate the tools in broader populations." },
        { title: "Regulation and deployment", text: "Clinical use would require regulatory clearance, monitoring for drift and clear governance on image data." },
      ]},
      { type: "callout", tone: "info", title: "The big picture", text: "FaceAge shows that a routine, almost-free photograph contains medically useful biological information. Whether it becomes a standard oncology tool depends on rigorous, fair and ethical validation over the coming years." },
    ],
    takeaways: [
      "Next steps: prospective trials, diverse validation and multimodal models.",
      "Clinical use requires regulation and strong data governance.",
    ],
  },
];

// Insert the FAHR-Face (2026) modules right after the 2025 oncology evidence, then number everything in order.
const evidenceIdx = baseModules.findIndex((m) => m.slug === "oncology-evidence");
export const modules: Module[] = [
  ...baseModules.slice(0, evidenceIdx + 1),
  ...fahrModules,
  ...baseModules.slice(evidenceIdx + 1),
].map((m, i) => ({ ...m, n: i + 1 }));

export const getModule = (slug: string) => modules.find((m) => m.slug === slug);
