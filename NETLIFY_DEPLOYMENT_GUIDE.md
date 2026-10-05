# CampaignIQ — Netlify Deployment Guide

This repository is configured for **1-click continuous deployment on [Netlify](https://www.netlify.com/)**.

---

## 🚀 1-Minute Netlify Deployment

### Method A: Git Integration (Recommended)
1. **Push this repository** to your GitHub, GitLab, or Bitbucket account.
2. Go to [app.netlify.com](https://app.netlify.com/) and click **"Add new site"** &rarr; **"Import an existing project"**.
3. Select your repository. Netlify will automatically detect [`netlify.toml`](file:///c:/Users/Suman/OneDrive/Desktop/bda-project/netlify.toml):
   - **Build command:** `npm run build`
   - **Publish directory:** `public`
4. Click **"Deploy CampaignIQ"**. Your site will be live on a global high-speed CDN in seconds!

### Method B: Netlify CLI (Direct Terminal Deploy)
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Authenticate
netlify login

# 3. Deploy to production
netlify deploy --prod --dir=public
```

---

## ⚙️ Architecture & Technical Highlights

| Component | Implementation | Deployment Target |
| :--- | :--- | :--- |
| **Web Presentation** | HTML5, Vanilla CSS3 (Glassmorphism), ES6 Modules | Netlify CDN (`public/`) |
| **ML Inference Engine** | Logistic Regression with standardized weights (`models/client_model_params.json`) | Client-side Wasm/JS Engine |
| **Feature Extraction** | Readability (Flesch Ease), Sentiment, Urgency, Spec Density | `public/js/ml-engine.js` |
| **Prescriptive Optimizer**| Score-aware 3-candidate optimization tournament | Dynamic In-Browser Tournament |
| **Scalability Simulator**| Kafka Partitions, Milvus Semantic Cache, Cost Curve Modeling | Interactive Canvas Visualizer |
| **Observability** | Live Prometheus-style telemetry stream simulator | `public/js/app.js` |
| **Python Backend** | Streamlit (`app.py`), Gradio (`gradio_app.py`), Scikit-Learn | Local / Streamlit Cloud / Render |

---

## 🔑 Environment Variables (Optional)

If you wish to use live Google Gemini API generation:
- Marketers can toggle to **"Gemini 1.5 Flash AI"** in the Studio tab and paste their API key directly into the UI.
- Alternatively, leave it blank to use the **Local Deterministic Template Engine** or the **Grounding Simulator**, which require zero API keys and zero cost.

---

## 🧪 Local Testing

To preview the Netlify web application locally:
```bash
# Option 1: Via npm (starts local server on port 8080)
npm run dev

# Option 2: Via Python built-in server
python -m http.server 8080 --directory public

# Option 3: Run the Python Streamlit app
streamlit run app.py

# Option 4: Run the Python Gradio studio
python gradio_app.py

# Option 5: Run the test suite (14 passing tests)
python -m unittest test_pipeline.py
```

---

## 🛡️ Netlify Configuration Specifications

The [`netlify.toml`](file:///c:/Users/Suman/OneDrive/Desktop/bda-project/netlify.toml) includes:
- **Single Page Application (SPA) Routing:** `/* -> /index.html` with HTTP 200 fallback.
- **Enterprise Security Headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Immutable Static Asset Caching:** 1-year cache headers for `/css/*` and `/js/*` bundles.
