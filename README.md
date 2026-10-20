# FAHR · FaceAge Learning Lab

A colourful Next.js app that teaches **FaceAge**, the deep-learning system that estimates biological age from a face photo and is studied as a prognostic biomarker in oncology (Bontempi et al., *The Lancet Digital Health*, 2025). It combines two tracks in one app:

- **📚 Learn** (`/learn`): 8 detailed modules covering biological age, what FaceAge is, how the pipeline works (MTCNN → Inception-ResNet v1 → regression), the oncology evidence, clinical use cases, the statistics, limitations and ethics, and the road ahead. Progress is saved in the browser.
- **🧪 Lab** (`/lab`): 6 hands-on experiments
  - **Live face age scanner**: webcam or photo upload, runs the open-source face-api.js detector + age network in the browser (not the clinical FaceAge model).
  - **Pipeline explorer**: build a synthetic face with ageing sliders and step through each pipeline stage.
  - **Survival risk calculator**: published per-decade hazard ratios applied to an age gap.
  - **Cohort simulator**: synthetic cohort, Kaplan–Meier curves and C-index for real age vs FaceAge.
  - **Clinician challenge**: predict 6-month survival before and after seeing FaceAge.
  - **Bias & confounder explorer**: photo artefacts, treatment effects and training-data fairness.
- **🎯 Quiz** (`/quiz`) and **🔗 References + glossary** (`/references`).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm start
```

The face scanner downloads its library and model weights (~7 MB) from cdn.jsdelivr.net at runtime, so it needs internet. Images are processed locally and never uploaded.

## Disclaimer

Educational use only. Simulations use synthetic data and illustrative baselines. Nothing here is medical advice.
