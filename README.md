# FAHR · FaceAge Learning Lab

A colourful Next.js app that teaches **FAHR-Face** and **FaceAge**, deep-learning systems that read biological age and cancer survival risk from a face photo. **FAHR** stands for *Foundation Artificial intelligence models for Health Recognition*.

Main sources:
- Haugg F, Lee G, He J, et al., Aerts HJWL, Mak RH. *Foundation artificial intelligence models for health recognition by use of face photographs (FAHR-Face): a model development and validation study.* The Lancet Digital Health, 2026. DOI 10.1016/j.landig.2026.101056.
- Bontempi D, et al. *FaceAge, a deep learning system to estimate biological age from face photographs to improve prognostication.* The Lancet Digital Health, 2025. DOI 10.1016/j.landig.2025.03.002.

It combines two tracks in one app:

- **📚 Learn** (`/learn`): 10 detailed modules covering biological age, what FaceAge is, how the pipeline works (MTCNN → Inception-ResNet v1 → regression), the oncology evidence, the FAHR-Face foundation model (ViT masked autoencoder on 40M+ faces), FAHR-FaceAge and FAHR-FaceSurvival results, clinical use cases, the statistics, limitations and ethics, and the road ahead. Progress is saved in the browser.
- **🧪 Lab** (`/lab`): 7 hands-on experiments
  - **FAHR-Face foundation model lab**: masked-autoencoder pretraining, attention regions of the two models, and a complementary-biomarker simulation.
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
