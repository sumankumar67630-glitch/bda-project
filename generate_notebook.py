"""
Script to generate the BDA Jupyter Notebook with complete analysis cells.
"""

import json

notebook = {
    'cells': [],
    'metadata': {
        'language_info': {
            'name': 'python',
            'version': '3.12.4'
        },
        'kernelspec': {
            'display_name': 'Python 3',
            'language': 'python',
            'name': 'python3'
        }
    },
    'nbformat': 4,
    'nbformat_minor': 5
}

def add_md(text):
    notebook['cells'].append({
        'cell_type': 'markdown',
        'metadata': {},
        'source': [line + '\n' for line in text.strip().split('\n')]
    })

def add_code(code):
    notebook['cells'].append({
        'cell_type': 'code',
        'execution_count': None,
        'metadata': {},
        'outputs': [],
        'source': [line + '\n' for line in code.strip().split('\n')]
    })

# Section 1: Intro
add_md("""# Big Data Analytics: Automated Content Generation for Marketing Campaigns
### End-to-End Scalability, Performance Analytics, and Output Optimization

**Scenario:** The *"Automated Content Generation for Marketing Campaigns"* project has been a success, but the team now wants to scale the service, analyze its performance, and optimize its outputs.
We have access to a large volume of raw data, including user inputs (product names, tones, audience descriptions), generated marketing copy, and user feedback logs (e.g., 'thumbs up/down' ratings) grounded in real Amazon catalog data (`amazon.csv`).

---
### Three Core Pillars Addressed in this Project:
1. **Pillar 1: Scaling the Service** - Distributed architectural blueprint (Kafka, Lakehouse, Semantic Caching, Ray Serve).
2. **Pillar 2: Performance Analytics** - Descriptive, exploratory, NLP linguistic, and statistical hypothesis analysis.
3. **Pillar 3: Output Optimization** - Machine learning predictive modeling, feature driver analysis, and automated RLHF/DPO-style copy optimization.""")

# Section 2: Imports
add_code("""import os
import sys
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import joblib

# Add root directory to sys.path
sys.path.append(os.path.abspath('..'))

import src.data_pipeline as dp
import src.feature_engineering as fe
import src.model_training as mt
import src.content_optimizer as co
import src.architecture_spec as arch

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.size'] = 11

print("Environment configured successfully!")""")

# Section 3: Data Ingestion & Catalog Preprocessing
add_md("""## 1. Data Ingestion & Catalog Preprocessing
We ingest `amazon.csv` (1,465 products), clean currency strings, handle non-numeric rating entries, extract hierarchical categories, and format product features.""")

add_code("""# Load cleaned Amazon catalog
clean_catalog_path = '../data/amazon_cleaned.csv'
clean_parquet_path = '../data/amazon_cleaned.parquet'

if os.path.exists(clean_catalog_path):
    df_catalog = pd.read_csv(clean_catalog_path)
else:
    df_catalog = dp.clean_amazon_catalog('../amazon.csv', clean_catalog_path, clean_parquet_path)

print(f"Total Products Cleaned: {len(df_catalog)}")
print("Main Category Breakdown:")
print(df_catalog['main_category'].value_counts())
df_catalog[['product_name', 'main_category', 'discounted_price_num', 'actual_price_num', 'discount_percentage_num', 'rating_clean']].head(5)""")

# Section 4: Scaled Campaign & Feedback Dataset
add_md("""## 2. Scaled Marketing Campaign & Feedback Logs
We load the 6,500 campaign records containing user inputs (Product, Tone, Target Audience, Channel), generated copy, NLP signals, and user feedback logs (`Thumbs Up` vs `Thumbs Down`).""")

add_code("""campaign_logs_path = '../data/campaign_feedback_logs.parquet'

if os.path.exists(campaign_logs_path):
    df_campaigns = pd.read_parquet(campaign_logs_path)
else:
    df_campaigns = dp.generate_campaign_feedback_dataset(df_catalog, num_samples=6500)

print(f"Total Campaign Logs: {len(df_campaigns):,}")
print("\\nFeedback Rating Distribution:")
print(df_campaigns['feedback_label'].value_counts(normalize=True).round(4) * 100)
df_campaigns[['campaign_id', 'product_name', 'input_tone', 'input_target_audience', 'channel', 'feedback_label', 'feedback_reason']].head(5)""")

# Section 5: Performance Analytics
add_md("""## 3. Exploratory Big Data Analytics & Performance Analysis
We evaluate what factors drive user approval vs rejection:
- Approval rate by Tone across Product Categories
- Target Audience Persona alignment
- Channel fit and length penalties
- Root causes of negative feedback ('Thumbs Down')""")

add_code("""# 3.1 Heatmap: Approval Rate by Tone across Product Categories
tone_cat_matrix = df_campaigns.pivot_table(
    index='input_tone',
    columns='category',
    values='feedback_rating',
    aggfunc='mean'
) * 100

plt.figure(figsize=(12, 6))
sns.heatmap(tone_cat_matrix, annot=True, fmt='.1f', cmap='YlGnBu', cbar_kws={'label': 'Approval Rate (%)'})
plt.title('Content Approval Rate (%) by Marketing Tone & Product Category', fontsize=14, fontweight='bold', pad=15)
plt.ylabel('Marketing Tone')
plt.xlabel('Category')
plt.xticks(rotation=25, ha='right')
plt.tight_layout()
plt.show()""")

add_code("""# 3.2 Audience Persona Resonance: Tone vs. Audience
aud_tone = df_campaigns.pivot_table(
    index='input_target_audience',
    columns='input_tone',
    values='feedback_rating',
    aggfunc='mean'
) * 100

plt.figure(figsize=(12, 6))
sns.heatmap(aud_tone, annot=True, fmt='.1f', cmap='viridis', cbar_kws={'label': 'Thumbs Up (%)'})
plt.title('Audience Persona Resonance: Tone vs. Audience Segment', fontsize=14, fontweight='bold', pad=15)
plt.ylabel('Target Audience')
plt.xlabel('Tone')
plt.xticks(rotation=30, ha='right')
plt.tight_layout()
plt.show()""")

add_code("""# 3.3 Root Causes of Negative Feedback
negative_reasons = df_campaigns[df_campaigns['feedback_rating'] == 0]['feedback_reason'].value_counts()

plt.figure(figsize=(10, 5))
sns.barplot(x=negative_reasons.values, y=negative_reasons.index, palette='rocket')
plt.title('Root Causes of "Thumbs Down" User Ratings', fontsize=14, fontweight='bold')
plt.xlabel('Count of Negative Feedback Occurrences')
plt.ylabel('Diagnostic Reason Code')
plt.tight_layout()
plt.show()""")

# Section 6: Statistical Testing
add_md("""## 4. Statistical Hypothesis Testing
We perform statistical verification:
1. **Chi-Square Test**: Independence of Marketing Tone and Thumbs Up approval.
2. **Two-Sample Welch's t-test**: Difference in Flesch Reading Ease for approved vs rejected copy.""")

add_code("""# Chi-Square Test for Tone vs Approval
contingency_table = pd.crosstab(df_campaigns['input_tone'], df_campaigns['feedback_rating'])
chi2, p_val, dof, expected = stats.chi2_contingency(contingency_table)
print("--- Chi-Square Test of Independence (Tone vs. Approval) ---")
print(f"Chi2 Statistic: {chi2:.4f}, p-value: {p_val:.4e}, Degrees of Freedom: {dof}")
if p_val < 0.05:
    print("Conclusion: Reject null hypothesis (p < 0.05). Tone has a statistically significant effect on user approval.")

# Two-sample t-test for Readability
up_reading = df_campaigns[df_campaigns['feedback_rating'] == 1]['reading_ease']
down_reading = df_campaigns[df_campaigns['feedback_rating'] == 0]['reading_ease']
t_stat, p_val_t = stats.ttest_ind(up_reading, down_reading, equal_var=False)
print("\\n--- Welch's t-test for Flesch Reading Ease ---")
print(f"Thumbs Up Mean Reading Ease: {up_reading.mean():.2f}")
print(f"Thumbs Down Mean Reading Ease: {down_reading.mean():.2f}")
print(f"t-statistic: {t_stat:.4f}, p-value: {p_val_t:.4e}")""")

# Section 7: Machine Learning
add_md("""## 5. Machine Learning Predictive Pipeline & Driver Analysis
We benchmark classification models (Logistic Regression, Random Forest, Gradient Boosting) to predict `feedback_rating` and analyze top feature drivers.""")

add_code("""metadata_path = '../models/model_metadata.json'
with open(metadata_path, 'r') as f:
    model_metadata = json.load(f)

print("Best Trained Model:", model_metadata['best_model'])
df_eval = pd.DataFrame(model_metadata['evaluation_results']).T
df_eval[['test_accuracy', 'test_precision', 'test_recall', 'test_f1', 'test_roc_auc']]""")

add_code("""# Visualize Top 15 Feature Importances
top_feats = pd.DataFrame(model_metadata['feature_importances_top20'][:15])

plt.figure(figsize=(10, 6))
sns.barplot(data=top_feats, x='importance', y='feature', palette='mako')
plt.title('Top 15 Predictive Drivers of Content Approval', fontsize=14, fontweight='bold')
plt.xlabel('Model Relative Importance / Magnitude')
plt.ylabel('Feature Name')
plt.tight_layout()
plt.show()""")

# Section 8: Prescriptive Optimizer
add_md("""## 6. Content Optimization & Real-Time Prescriptive Engine
We demonstrate the `ContentOptimizer` running grid search to prescribe the optimal Tone and Target Audience for any product in `amazon.csv`.""")

add_code("""optimizer = co.ContentOptimizer(model_path='../models/campaign_success_model.joblib')

# Prescribe optimal marketing parameters for an Amazon product
sample_prod = df_catalog.iloc[0]
print(f"Selected Product: {sample_prod['short_name']}")
print(f"Price: INR {sample_prod['discounted_price_num']} (Discount: {sample_prod['discount_percentage_num']}%)")

recommendations_df = optimizer.recommend_optimal_parameters(
    product_name=sample_prod['short_name'],
    category=sample_prod['main_category'],
    discounted_price=sample_prod['discounted_price_num'],
    actual_price=sample_prod['actual_price_num'],
    discount_percentage=sample_prod['discount_percentage_num'],
    product_rating=sample_prod['rating_clean'],
    channel='Instagram / Facebook Feed Ad'
)

print("\\nTop 5 Prescribed Tone x Audience Combinations:")
recommendations_df.head(5)""")

# Section 9: Scaling Simulation
add_md("""## 7. Scaling the Service: Big Data Architecture & Cost Modeling
We simulate the economic and performance impact of deploying Semantic Caching and Kafka-driven distributed inference at scale (100,000 requests/day).""")

add_code("""scale_metrics = arch.calculate_scaling_metrics(
    daily_requests=100000,
    semantic_cache_hit_rate=0.45,
    avg_tokens_per_request=450,
    cost_per_1k_tokens_usd=0.0015
)

print("--- Distributed Architecture Scaling Simulation (100k requests/day) ---")
for k, v in scale_metrics.items():
    print(f"{k:35s}: {v}")""")

with open('notebooks/BDA_Marketing_Campaign_Analysis.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=2)

print("BDA_Marketing_Campaign_Analysis.ipynb generated successfully!")
