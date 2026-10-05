# Project Report: CampaignIQ — AI-Powered Marketing Intelligence & Content Optimization Platform
**Big Data Analytics (BDA) Capstone Project**  
**Repository:** `bda-project`  
**Platform Version:** CampaignIQ v2.4  

---

## 1. System Classification & Data Provenance Matrix

To maintain strict scientific and engineering integrity, all components, data streams, and metrics in this platform are classified according to their empirical provenance:

| Component / Layer | Classification | Details & Scope |
| :--- | :---: | :--- |
| **Amazon E-Commerce Catalog** | `REAL` | 1,465 authentic product records from Amazon India (`amazon.csv`) covering prices, categories, ratings, and feature descriptions. |
| **NLP Feature Extraction & Signals** | `DERIVED` | Flesch reading ease, lexicon sentiment polarity, spec density, CTA presence, and channel-fit penalties extracted directly from text. |
| **Trained ML Models & Scoring** | `REAL` | Scikit-Learn Logistic Regression, Random Forest, and Gradient Boosting pipelines trained with 5-fold cross-validation (`models/campaign_success_model.joblib`). |
| **Gemini AI Copywriter & Search** | `REAL (OPTIONAL)` | Real integration with Google Gemini API (`gemini-2.5-flash`) via official `google-genai` SDK with optional Google Search grounding. Fully optional; degrades gracefully to offline local engine. |
| **Local Template Generator** | `REAL` | Deterministic local copy generator used for offline generation and baseline benchmarking without external dependencies. |
| **Runtime Latency & Telemetry** | `REAL` | Genuine in-memory millisecond execution timing and Prometheus metrics collection via `monitoring/metrics_collector.py`. |
| **Campaign Feedback Logs** | `SYNTHETIC` | 6,500 campaign feedback events generated using marketing congruency heuristics, demographic personas, and channel constraints. |
| **CTR & CVR Engagement Lift** | `SIMULATED` | Click-Through Rate (CTR) and Conversion Rate (CVR) values modeled as simulated engagement benchmarks to demonstrate business impact. |
| **Distributed Scaling & Lakehouse** | `CONCEPTUAL TARGET` | Apache Kafka, Apache Spark Streaming, Milvus / Qdrant semantic vector cache, Ray Serve, and DPO reinforcement training designed as production target architecture. |

> [!NOTE]
> **Implementation vs. Target Architecture Notice:**  
> The currently deployed application runs locally using Streamlit and Gradio, Scikit-Learn inference, and local in-memory telemetry. Distributed components (Kafka, Spark, Milvus, Kubernetes) are documented and mathematically modeled as the production scaling blueprint, but are not active cluster processes.

---

## 2. Platform Architecture & Data Flow

CampaignIQ uses a strictly decoupled, dual-engine generation and optimization architecture:

```
[ User Input: Product, Tone, Audience, Channel ]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[ Gemini AI Generator ]     [ Local Template Engine ]
(Optional / Search Grounded)  (Deterministic Fallback)
         │                           │
         └─────────────┬─────────────┘
                       ▼
            [ Baseline Marketing Copy ]
                       │
                       ▼
           [ Scikit-Learn ML Model ] ──► [ Baseline Approval Score ]
                       │
                       ▼
           [ ContentOptimizer Engine ]
           - Channel length tuning
           - Action CTA verification
           - Discount callout injection
           - Technical spec enrichment
                       │
                       ▼
            [ Optimized Marketing Copy ]
                       │
                       ▼
           [ Scikit-Learn ML Model ] ──► [ Optimized Approval Score ]
                       │
                       ▼
       [ Side-by-Side Comparison & Delta ]
       (Genuinely Calculated Deltas & Runtime Latency)
```

### Repository Structure
```
bda-project/
├── amazon.csv                          # Real Amazon catalog (1,465 products)
├── CASE_STUDY_SOLUTION.md              # Complete BDA Case Study Answers
├── PROJECT_REPORT.md                   # Full Technical Platform Report
├── app.py                              # CampaignIQ Streamlit Web Application (7 pages)
├── gradio_app.py                       # Standalone Gradio AI Marketing Studio
├── run_project.py                      # Master pipeline execution script
├── test_pipeline.py                    # Automated test suite (9 passing tests)
├── .env.example                        # Secure environment configuration template
├── monitoring/                         # Local Telemetry & Monitoring
│   ├── metrics_collector.py            # Thread-safe in-memory metrics & Prometheus exporter
│   ├── prometheus.yml                  # Prometheus scrape configuration
│   └── grafana_dashboard.json          # Pre-configured Grafana telemetry dashboard
├── data/
│   ├── amazon_cleaned.csv              # Cleaned Amazon catalog
│   ├── amazon_cleaned.parquet          # High-performance Parquet format
│   ├── campaign_feedback_logs.csv      # 6,500 synthetic feedback logs
│   └── campaign_feedback_logs.parquet  # Parquet feedback logs
├── models/
│   ├── campaign_success_model.joblib   # Trained Scikit-Learn model checkpoint
│   └── model_metadata.json             # Cross-validation metrics and feature weights
├── notebooks/
│   └── BDA_Marketing_Campaign_Analysis.ipynb # Jupyter Analysis Notebook
└── src/
    ├── __init__.py
    ├── data_pipeline.py                # Catalog cleaning & feedback simulation
    ├── feature_engineering.py          # NLP signals, Flesch reading ease, sentiment
    ├── gemini_service.py               # Decoupled Gemini API client & search grounding
    ├── content_optimizer.py            # Dual-engine optimizer & side-by-side evaluator
    ├── model_training.py               # ML training and 5-fold cross validation
    └── architecture_spec.py            # Scalability simulator & architectural specs
```

---

## 3. Core Modules & Technical Innovations

### 3.1 Dual-Engine Copy Generation (`src/content_optimizer.py` & `src/gemini_service.py`)
- **Gemini API Integration (`REAL, OPTIONAL`):**  
  Uses the official Google GenAI SDK (`from google import genai`) with model `gemini-2.5-flash`. Supports real copywriting constrained by tone, audience personas, and channel requirements.
- **Live Search Grounding (`REAL, OPTIONAL`):**  
  Optionally enables Google Search tools (`types.Tool(google_search=types.GoogleSearch())`) for real-time market facts.
- **Credential Safety & Scrubbing:**  
  API keys are loaded strictly from the `GEMINI_API_KEY` environment variable. Error messages are sanitized with regex scrubbing (`[REDACTED_API_KEY]`) to prevent credential leakage.
- **Graceful Offline Degradation (`REAL`):**  
  If the Gemini API key is missing or invalid, the platform falls back seamlessly to the deterministic Local Template Engine without throwing exceptions.

### 3.2 Machine Learning Inference & Scorer (`models/campaign_success_model.joblib`)
- Evaluates any marketing copy against 24 tabular and linguistic signals.
- Generates predicted thumbs-up approval probability ($0-100\%$) and classifies outcomes as `Thumbs Up` or `Thumbs Down`.
- Benchmarked algorithms:
  - **Logistic Regression (Best Generalizer):** 5-Fold CV F1: **0.7338**, Test F1: **0.7511**, Test Accuracy: **68.2%**, ROC-AUC: **0.7108**.
  - **Random Forest:** Test F1: 0.7408, Test Accuracy: 66.9%, ROC-AUC: 0.7163.
  - **Gradient Boosting:** Test F1: 0.7369, Test Accuracy: 66.8%, ROC-AUC: 0.7207.

### 3.3 Rule-Engine Content Optimizer (`src/content_optimizer.py`)
- Takes baseline generated copy and applies diagnostic NLP transformations:
  - **Action CTA Enforcement:** Ensures active verbs matching campaign tone.
  - **Discount Callout Injection:** Spotlights price savings when discount $\ge 20\%$.
  - **Channel Length Harmonization:** Compresses copy for SMS ($<35$ words) or enriches body copy for newsletters ($>45$ words).
  - **Spec Density Enrichment:** Weaves in technical specifications for power users.
- Re-evaluates both baseline and optimized copy using the real Scikit-Learn model to compute genuine, calculated deltas without hardcoded assumptions.

### 3.4 In-Memory Runtime Telemetry (`monitoring/metrics_collector.py`)
- Thread-safe singleton collector tracking real execution latency, ML inference latency, throughput (QPS), and engine distribution (`gemini`, `local_template`, `local_fallback`).
- Exposes Prometheus exposition format text at `/metrics` and provides pre-configured Grafana dashboard JSON.

---

## 4. Web Applications & User Interfaces

### 4.1 CampaignIQ Streamlit Dashboard (`app.py`)
The enterprise web dashboard features 7 dedicated modules:
1. **Executive Overview:** Real-time catalog metrics (1,465 products), synthetic log summary (6,500 records), simulated engagement benchmarks, 30-day volume/approval trend, and live local runtime telemetry.
2. **Performance Analytics:** Tone vs Category heatmap, Audience vs Tone matrix, Flesch reading ease distribution, sentiment polarity boxplots, and Pareto root-cause diagnostics for negative ratings.
3. **AI Campaign Studio:** Dual-engine controls (Gemini vs Local), Google Search Grounding toggle, approval probability gauge, side-by-side copy comparison, real-time interactive copy editor, and prescriptive diagnostics.
4. **Persona Recommender:** 36-combination grid search ranking the best tone-audience pairings for any catalog item.
5. **ML Insights:** Model benchmark comparison table, top 15 feature importances, and confusion matrix.
6. **System Architecture & Scalability:** Current local implementation vs production target blueprint, and interactive cost/latency scalability simulator.
7. **Data Explorer:** Dedicated tabs for Real Amazon Catalog, Synthetic Feedback Logs, Model Metadata, and Live Prometheus Metrics text.

### 4.2 Standalone Gradio AI Studio (`gradio_app.py`)
- Interactive web UI running on port 7860 sharing the exact same `ContentOptimizer` and ML backend.
- Provides product picker, tone/audience/channel dropdowns, Local vs Gemini engine toggle, Google Search grounding toggle, side-by-side copy views, and approval score deltas.

---

## 5. Verification & Test Suite Summary

The automated test suite (`test_pipeline.py`) validates all system components:

```
======================================================================
Test Case                                  Target Module               Result
======================================================================
test_nlp_feature_extraction                feature_engineering.py      PASSED
test_channel_penalty                       feature_engineering.py      PASSED
test_content_optimizer_inference           content_optimizer.py        PASSED
test_content_optimizer_local_mode          content_optimizer.py        PASSED
test_content_optimizer_gemini_or_fallback  content_optimizer.py        PASSED
test_gemini_unavailable_fallback          gemini_service.py           PASSED
test_metrics_collector                     metrics_collector.py        PASSED
test_scaling_simulator                     architecture_spec.py        PASSED
test_gradio_app_structure                  gradio_app.py               PASSED
======================================================================
Ran 9 tests in ~18.5s — ALL TESTS PASSED (OK)
```

---

## 6. Execution Instructions

### Run Unit Tests
```bash
python test_pipeline.py
```

### Run Master Pipeline Runner
```bash
python run_project.py --skip-data --skip-train --run-tests
```

### Launch Streamlit Dashboard (CampaignIQ)
```bash
streamlit run app.py
```
*Access at: `http://localhost:8501`*

### Launch Standalone Gradio Studio
```bash
python gradio_app.py
```
*Access at: `http://localhost:7860`*
