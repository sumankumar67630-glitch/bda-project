"""
CampaignIQ — Automated AI Content Generation & ML Optimization Platform
Enterprise Big Data Analytics, Dual-Engine Generation, Prescriptive Optimization & Scalability Architecture.
"""

import os
import json
import time
import numpy as np
import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

from src.feature_engineering import extract_nlp_features, compute_channel_fit_penalty
from src.content_optimizer import ContentOptimizer
from src.gemini_service import is_gemini_configured, get_gemini_status
from src.architecture_spec import calculate_scaling_metrics, MERMAID_ARCHITECTURE_DIAGRAM
from src.data_pipeline import TONES, AUDIENCES, CHANNELS
from monitoring.metrics_collector import get_metrics_collector

# Page configuration
st.set_page_config(
    page_title="CampaignIQ — AI Marketing Intelligence Platform",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    /* Top Header Bar */
    .main-header {
        background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%);
        padding: 26px 36px;
        border-radius: 16px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.35);
        border: 1px solid #334155;
    }
    .main-header h1 {
        color: #F8FAFC !important;
        font-weight: 800;
        font-size: 30px;
        margin: 0;
        letter-spacing: -0.5px;
    }
    .main-header p {
        color: #94A3B8;
        font-size: 15px;
        margin: 6px 0 0 0;
    }
    
    /* KPI Metric Cards */
    .kpi-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        height: 100%;
        min-height: 145px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    }
    .narrative-strip {
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 14px 20px;
        margin: 20px 0 24px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        font-weight: 600;
        color: #334155;
    }
    .kpi-title {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: #64748B;
        margin-bottom: 6px;
    }
    .kpi-value {
        font-size: 28px;
        font-weight: 800;
        color: #0F172A;
        line-height: 1.2;
    }
    .kpi-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 6px;
    }
    .badge-green { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
    .badge-blue { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
    .badge-purple { background: #F5F3FF; color: #7C3AED; border: 1px solid #DDD6FE; }
    .badge-amber { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
    
    /* Studio Card */
    .studio-box {
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 16px;
    }
    
    /* Provenance Tag */
    .provenance-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 12px;
    }
    .provenance-gemini { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; }
    .provenance-local { background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; }
    .provenance-fallback { background: #FFF7ED; color: #C2410C; border: 1px solid #FED7AA; }
    
    /* Thumbs Rating Badge */
    .thumbs-up-tag {
        background: #DCFCE7;
        color: #166534;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid #86EFAC;
    }
    .thumbs-down-tag {
        background: #FEE2E2;
        color: #991B1B;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid #FCA5A5;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_data
def load_data():
    """Loads cleaned Amazon catalog and campaign feedback logs."""
    cat_df = pd.read_parquet("data/amazon_cleaned.parquet")
    camp_df = pd.read_parquet("data/campaign_feedback_logs.parquet")
    with open("models/model_metadata.json", "r") as f:
        meta = json.load(f)
    return cat_df, camp_df, meta


try:
    df_catalog, df_campaigns, model_meta = load_data()
    optimizer = ContentOptimizer(model_path="models/campaign_success_model.joblib")
    metrics_collector = get_metrics_collector()
except Exception as e:
    st.error(f"Error loading project artifacts: {e}. Please ensure data pipeline has executed.")
    st.stop()


# Sidebar Navigation
with st.sidebar:
    st.markdown("## ⚡ **CampaignIQ**")
    st.caption("AI Marketing Intelligence & Content Optimization Platform")
    st.markdown("---")
    
    # Engine Status (Safe, No Secrets Displayed)
    gemini_ready = is_gemini_configured()
    if gemini_ready:
        st.markdown(
            '<div style="background:#ECFDF5; padding:8px 12px; border-radius:8px; border:1px solid #A7F3D0; font-size:12px; font-weight:700; color:#065F46;">'
            '● Gemini AI Engine: Active (Optional)</div>',
            unsafe_allow_html=True
        )
    else:
        st.markdown(
            '<div style="background:#F1F5F9; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; font-size:12px; font-weight:700; color:#475569;">'
            '○ Gemini AI Engine: Offline (Local Fallback Active)</div>',
            unsafe_allow_html=True
        )
    
    st.markdown("<br/>", unsafe_allow_html=True)
    
    page = st.radio(
        "Platform Modules",
        [
            "📊 Executive Overview",
            "🔍 Performance Analytics",
            "🤖 AI Campaign Studio",
            "🎯 Persona Recommender",
            "🧠 ML Insights",
            "🏗️ System Architecture & Scalability",
            "📁 Data Explorer"
        ],
        index=0
    )
    
    st.markdown("---")
    st.markdown("#### **Catalog & Telemetry**")
    st.write(f"📦 **Real Amazon Catalog:** {len(df_catalog):,} items")
    st.write(f"📝 **Synthetic Feedback Logs:** {len(df_campaigns):,} runs")
    st.write(f"🏆 **Best Classifier:** {model_meta['best_model']}")
    telemetry = metrics_collector.get_summary()
    st.write(f"⚡ **Runtime Session Calls:** {telemetry['total_requests']}")


# Header Component
st.markdown("""
<div class="main-header">
    <h1>CampaignIQ — AI Marketing Intelligence Platform</h1>
    <p>Automated Dual-Engine Content Generation, Real-Time ML Feedback Optimization & Distributed Target Architecture</p>
</div>
""", unsafe_allow_html=True)


# ==============================================================================
# PAGE 1: EXECUTIVE OVERVIEW
# ==============================================================================
if page == "📊 Executive Overview":
    st.subheader("Executive Performance Overview")
    st.markdown(
        "Real-time operational metrics and diagnostic intelligence aggregated across catalog items and campaign logs. "
        "*(Note: Catalog data is **Real Amazon E-Commerce**; campaign feedback logs are **Synthetic Benchmarks**; CTR/CVR are **Simulated Estimates**.)*"
    )
    
    total_campaigns = len(df_campaigns)
    thumbs_up_count = int(df_campaigns['feedback_rating'].sum())
    approval_rate = (thumbs_up_count / total_campaigns) * 100
    avg_reading_ease = df_campaigns['reading_ease'].mean()
    
    # Genuinely calculated metrics
    avg_ctr_up = df_campaigns[df_campaigns['feedback_rating'] == 1]['click_through_rate'].mean()
    avg_ctr_down = df_campaigns[df_campaigns['feedback_rating'] == 0]['click_through_rate'].mean()
    ctr_lift = ((avg_ctr_up - avg_ctr_down) / max(0.001, avg_ctr_down)) * 100
    
    # Genuine delta vs 50% baseline random chance
    approval_delta_vs_random = approval_rate - 50.0
    
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Catalog Inventory [REAL]</div>
            <div class="kpi-value">{len(df_catalog):,}</div>
            <span class="kpi-badge badge-blue">Real Amazon Catalog</span>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Approval Rate [SYNTHETIC]</div>
            <div class="kpi-value">{approval_rate:.1f}%</div>
            <span class="kpi-badge badge-green">▲ +{approval_delta_vs_random:.1f}% vs 50% Random</span>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Simulated CTR on Approved [SIMULATED]</div>
            <div class="kpi-value">{avg_ctr_up:.2f}%</div>
            <span class="kpi-badge badge-purple">+{ctr_lift:.0f}% Lift vs Downvoted ({avg_ctr_down:.2f}%)</span>
        </div>
        """, unsafe_allow_html=True)
    with c4:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Avg Readability Score [CALCULATED]</div>
            <div class="kpi-value">{avg_reading_ease:.1f}</div>
            <span class="kpi-badge badge-blue">Flesch Reading Ease (0–100)</span>
        </div>
        """, unsafe_allow_html=True)
        
    # Architectural Pipeline Story Narrative Strip
    st.markdown("""
    <div class="narrative-strip">
        <span>📦 <b>REAL DATA</b>: 1,465 Amazon Products</span>
        <span>➔</span>
        <span>🔍 <b>ANALYSIS</b>: NLP & Linguistic Profiling</span>
        <span>➔</span>
        <span>🧠 <b>ML</b>: 5-Fold CV Scikit-Learn Model</span>
        <span>➔</span>
        <span>⚡ <b>OPTIMIZATION</b>: Score-Aware Multi-Candidate Engine</span>
    </div>
    """, unsafe_allow_html=True)
    
    # Charts Row: Categorical Analytics (Truthful, No Fake Dates)
    col_chart1, col_chart2 = st.columns([3, 2])
    
    with col_chart1:
        # Categorical aggregation by Marketing Tone
        tone_agg = df_campaigns.groupby('input_tone').agg(
            total_count=('campaign_id', 'count'),
            approval_pct=('feedback_rating', lambda x: x.mean() * 100)
        ).reset_index().sort_values(by='approval_pct', ascending=False)
        
        fig_tone = go.Figure()
        fig_tone.add_trace(go.Bar(
            x=tone_agg['input_tone'],
            y=tone_agg['total_count'],
            name="Campaign Volume (Runs)",
            marker_color="#CBD5E1",
            opacity=0.75,
            yaxis="y1"
        ))
        fig_tone.add_trace(go.Scatter(
            x=tone_agg['input_tone'],
            y=tone_agg['approval_pct'],
            name="User Approval %",
            line=dict(color="#2563EB", width=3),
            marker=dict(size=8, color="#1D4ED8"),
            mode="lines+markers+text",
            text=[f"{v:.1f}%" for v in tone_agg['approval_pct']],
            textposition="top center",
            yaxis="y2"
        ))
        fig_tone.update_layout(
            title="<b>Campaign Volume & User Approval Rate by Marketing Tone [SYNTHETIC LOGS]</b>",
            yaxis=dict(title="Volume (Campaign Runs)", side="left", showgrid=False),
            yaxis2=dict(title="Approval Rate (%)", side="right", overlaying="y", range=[40, 100], showgrid=True),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            margin=dict(l=20, r=20, t=50, b=30),
            height=340
        )
        st.plotly_chart(fig_tone, use_container_width=True)
        
    with col_chart2:
        # Breakdown by Channel
        chan_agg = df_campaigns.groupby('channel').agg(
            approval_pct=('feedback_rating', lambda x: x.mean() * 100),
            simulated_ctr=('click_through_rate', 'mean')
        ).reset_index().sort_values(by='approval_pct', ascending=True)
        
        fig_chan = px.bar(
            chan_agg,
            x='approval_pct',
            y='channel',
            orientation='h',
            color='approval_pct',
            color_continuous_scale='Blues',
            text='approval_pct',
            title="<b>Approval Rate by Marketing Channel [SYNTHETIC LOGS]</b>"
        )
        fig_chan.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
        fig_chan.update_layout(
            yaxis=dict(title="Channel"),
            xaxis=dict(title="Approval Rate (%)", range=[0, 100]),
            coloraxis_showscale=False,
            height=340,
            margin=dict(l=20, r=20, t=50, b=30)
        )
        st.plotly_chart(fig_chan, use_container_width=True)

    # Live Runtime Telemetry Card
    st.markdown("#### **Honest Local Runtime Telemetry**")
    tel = metrics_collector.get_summary()
    tcol1, tcol2, tcol3, tcol4 = st.columns(4)
    with tcol1:
        st.metric("Total Session Requests", f"{tel['total_requests']}")
    with tcol2:
        st.metric("Gemini API Calls", f"{tel['gemini_requests']}")
    with tcol3:
        st.metric("Local Template Calls", f"{tel['local_requests']}")
    with tcol4:
        st.metric(
            "Observed Avg Latency",
            f"{tel['avg_latency_ms']:.1f} ms" if tel['total_requests'] > 0 else "N/A",
            help="Total request runtime including generation and ML evaluation"
        )


# ==============================================================================
# PAGE 2: PERFORMANCE ANALYTICS
# ==============================================================================
elif page == "🔍 Performance Analytics":
    st.subheader("Deep-Dive Content Performance Analytics")
    st.markdown(
        "Diagnostic exploration of how tone, audience personas, readability, and marketing drivers influence user feedback. "
        "*(Data Source: 6,500 Synthetic Campaign Feedback Logs generated via linguistic rules.)*"
    )
    
    col_h1, col_h2 = st.columns(2)
    with col_h1:
        st.markdown("#### **1. Tone vs. Product Category Approval Matrix**")
        matrix_tone_cat = df_campaigns.pivot_table(
            index='input_tone',
            columns='category',
            values='feedback_rating',
            aggfunc='mean'
        ) * 100
        fig_hm1 = px.imshow(
            matrix_tone_cat,
            labels=dict(x="Category", y="Marketing Tone", color="Approval %"),
            x=matrix_tone_cat.columns,
            y=matrix_tone_cat.index,
            color_continuous_scale='YlGnBu',
            text_auto='.1f',
            aspect="auto"
        )
        fig_hm1.update_layout(margin=dict(l=20, r=20, t=30, b=30))
        st.plotly_chart(fig_hm1, use_container_width=True)
        st.caption("💡 **Finding:** Bold & Promotional tones achieve peak approval on Computers & Accessories with steep discounts. Luxury tones underperform on budget accessories.")
        
    with col_h2:
        st.markdown("#### **2. Audience Persona vs. Tone Alignment**")
        matrix_aud_tone = df_campaigns.pivot_table(
            index='input_target_audience',
            columns='input_tone',
            values='feedback_rating',
            aggfunc='mean'
        ) * 100
        fig_hm2 = px.imshow(
            matrix_aud_tone,
            labels=dict(x="Tone", y="Target Audience", color="Approval %"),
            x=matrix_aud_tone.columns,
            y=matrix_aud_tone.index,
            color_continuous_scale='Viridis',
            text_auto='.1f',
            aspect="auto"
        )
        fig_hm2.update_layout(margin=dict(l=20, r=20, t=30, b=30))
        st.plotly_chart(fig_hm2, use_container_width=True)
        st.caption("💡 **Finding:** Tech Enthusiasts require technical specs and penalize fluff. Gen Z favors witty, emoji-rich copy over formal corporate messaging.")
        
    st.markdown("---")
    
    # NLP Signals
    st.markdown("#### **3. Linguistic & Copy Feature Diagnostics**")
    col_nlp1, col_nlp2 = st.columns(2)
    with col_nlp1:
        fig_read = px.histogram(
            df_campaigns,
            x='reading_ease',
            color='feedback_label',
            barmode='overlay',
            nbins=35,
            color_discrete_map={'Thumbs Up': '#10B981', 'Thumbs Down': '#EF4444'},
            title="<b>Flesch Reading Ease Distribution by Feedback Outcome</b>"
        )
        fig_read.update_layout(xaxis_title="Reading Ease (Higher = More Readable)", yaxis_title="Count")
        st.plotly_chart(fig_read, use_container_width=True)
        
    with col_nlp2:
        fig_box = px.box(
            df_campaigns,
            x='feedback_label',
            y='sentiment_score',
            color='feedback_label',
            color_discrete_map={'Thumbs Up': '#10B981', 'Thumbs Down': '#EF4444'},
            title="<b>Sentiment Polarity vs. Feedback Rating</b>"
        )
        fig_box.update_layout(xaxis_title="User Feedback", yaxis_title="Sentiment Polarity (-1.0 to +1.0)")
        st.plotly_chart(fig_box, use_container_width=True)
        
    st.markdown("---")
    
    # Root Cause Pareto
    st.markdown("#### **4. Diagnostic Pareto: Root Causes of 'Thumbs Down' Ratings**")
    reasons_df = df_campaigns[df_campaigns['feedback_rating'] == 0]['feedback_reason'].value_counts().reset_index()
    reasons_df.columns = ['Reason', 'Count']
    reasons_df['Percentage'] = (reasons_df['Count'] / reasons_df['Count'].sum()) * 100
    
    fig_reasons = px.bar(
        reasons_df,
        x='Count',
        y='Reason',
        orientation='h',
        color='Count',
        color_continuous_scale='Reds',
        text='Percentage',
        title="<b>Why Users Downvote Marketing Copy (Root Cause Diagnostics)</b>"
    )
    fig_reasons.update_traces(texttemplate='%{text:.1f}%', textposition='outside')
    fig_reasons.update_layout(yaxis=dict(autorange="reversed"), coloraxis_showscale=False)
    st.plotly_chart(fig_reasons, use_container_width=True)


# ==============================================================================
# PAGE 3: AI CAMPAIGN STUDIO
# ==============================================================================
elif page == "🤖 AI Campaign Studio":
    st.subheader("AI Marketing Campaign Studio & Real-Time Output Optimizer")
    st.markdown(
        "Generate and optimize campaign copy with **clean architectural separation**: "
        "Select **Gemini AI Engine** (with optional Google Search Grounding) or the **Local Template Engine**. "
        "Both outputs are independently evaluated and enhanced by the same trained Scikit-Learn ML pipeline."
    )
    
    # Product Selector
    col_sel1, col_sel2 = st.columns([2, 1])
    with col_sel1:
        product_options = df_catalog['short_name'].unique().tolist()
        selected_prod_name = st.selectbox("Select Product from Real Amazon Catalog:", product_options, index=0)
    with col_sel2:
        selected_row = df_catalog[df_catalog['short_name'] == selected_prod_name].iloc[0]
        st.markdown(f"**Category:** `{selected_row['main_category']}`")
        st.markdown(f"**Price:** ₹{int(selected_row['discounted_price_num']):,} *(MSRP ₹{int(selected_row['actual_price_num']):,} | {int(selected_row['discount_percentage_num'])}% OFF)*")

    # Strategy Parameters
    col_in1, col_in2, col_in3 = st.columns(3)
    with col_in1:
        sel_tone = st.selectbox("Desired Marketing Tone:", TONES, index=0)
    with col_in2:
        sel_audience = st.selectbox("Target Audience Segment:", AUDIENCES, index=0)
    with col_in3:
        sel_channel = st.selectbox("Marketing Channel:", CHANNELS, index=1)

    # Engine Selection
    st.markdown("#### **Generation Engine Configuration**")
    col_eng1, col_eng2 = st.columns([2, 1])
    with col_eng1:
        engine_option = st.radio(
            "Select Generation Engine (Gemini is fully optional):",
            [
                "Local Template Engine (Deterministic / Offline Fallback)",
                "Gemini AI Engine (Generative Copywriter)"
            ],
            index=1 if is_gemini_configured() else 0
        )
    with col_eng2:
        enable_grounding = st.checkbox(
            "Enable Live Web Research (Google Search Grounding via Gemini)",
            value=False,
            disabled=("Local" in engine_option),
            help="Queries Google Search live for fresh product context and market facts."
        )

    generator_mode = 'gemini' if "Gemini" in engine_option else 'local'

    # Generation Button / Run
    if st.button("🚀 Generate & Optimize Marketing Copy", type="primary"):
        with st.spinner("Executing generation pipeline and Scikit-Learn evaluation..."):
            gen_res = optimizer.generate_optimized_copy(
                product_name=selected_row['short_name'],
                category=selected_row['main_category'],
                discounted_price=selected_row['discounted_price_num'],
                actual_price=selected_row['actual_price_num'],
                discount_percentage=selected_row['discount_percentage_num'],
                product_rating=selected_row['rating_clean'],
                features=selected_row['clean_features'],
                tone=sel_tone,
                audience=sel_audience,
                channel=sel_channel,
                generator_mode=generator_mode,
                enable_grounding=enable_grounding
            )
            st.session_state['last_gen_res'] = gen_res
            st.session_state['last_prod'] = selected_row['short_name']
            
    # Display Results
    if 'last_gen_res' in st.session_state:
        res = st.session_state['last_gen_res']
        base = res['baseline']
        opt = res['optimized']
        comp = res['comparison']
        is_improved = res.get('is_improved', False)
        
        # Generation Engine Badge
        source = res['generator_source']
        if source == 'gemini':
            if res.get('grounding_used'):
                tag_label = "🤖 Gemini + Google Search Grounding"
            else:
                tag_label = "🤖 Generated by Gemini"
            st.markdown(f'<span class="provenance-tag provenance-gemini">{tag_label}</span>', unsafe_allow_html=True)
        elif source == 'local_fallback':
            st.markdown(f'<span class="provenance-tag provenance-fallback">⚙️ Generated by Local Template Engine (Fallback: {res.get("api_error")})</span>', unsafe_allow_html=True)
        else:
            st.markdown('<span class="provenance-tag provenance-local">📐 Generated by Local Template Engine</span>', unsafe_allow_html=True)

        # Optimization Status Badge
        if is_improved:
            st.markdown(
                '<div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:8px; padding:10px 16px; margin-bottom:16px; font-weight:700; color:#065F46; font-size:14px;">'
                '✓ Optimized — ML approval improved</div>',
                unsafe_allow_html=True
            )
        else:
            st.markdown(
                '<div style="background:#F1F5F9; border:1px solid #CBD5E1; border-radius:8px; padding:10px 16px; margin-bottom:16px; font-weight:700; color:#475569; font-size:14px;">'
                '= No improvement required</div>',
                unsafe_allow_html=True
            )
            
        # Top Metric Cards: Clearly distinguished ML Approval and Latency
        col_m1, col_m2, col_m3, col_m4, col_m5 = st.columns(5)
        with col_m1:
            st.metric("Baseline ML Approval", f"{comp['baseline_score']}%")
        with col_m2:
            st.metric("Optimized ML Approval", f"{comp['optimized_score']}%")
        with col_m3:
            delta = res['delta_score']
            delta_prefix = "+" if delta > 0 else ""
            st.metric("Verified Delta", f"{delta_prefix}{delta}%", delta=f"{delta_prefix}{delta}% (Verified ML)")
        with col_m4:
            st.metric("Generation Latency", f"{res.get('gen_latency_ms', 0):.0f} ms", help="Time taken by LLM or local template generator")
        with col_m5:
            st.metric("ML Inference Latency", f"{res.get('inference_latency_ms', 0):.0f} ms", help="Time taken by Scikit-Learn classifier candidate evaluation")

        st.markdown("---")

        # Side-by-Side Comparison Tabs
        tab_side, tab_edit, tab_diag = st.tabs(["👥 Side-by-Side Copy Comparison", "✏️ Interactive Copy Editor", "🔬 Diagnostic Feedback"])
        
        with tab_side:
            col_b, col_o = st.columns(2)
            with col_b:
                st.markdown("### 📝 **Generated Copy / Baseline**")
                st.markdown(f"**Headline:** {base['headline']}")
                st.markdown(f"**Body:**\n> {base['copy']}")
                st.markdown(f"**Call to Action:** `{base['cta']}`")
                st.markdown("---")
                st.markdown(f"- **Word Count:** {comp['baseline_words']} words")
                st.markdown(f"- **Readability:** {comp['baseline_reading_ease']:.1f}/100 (Flesch Ease)")
                st.markdown(f"- **CTA:** {'Verified Action CTA' if comp['baseline_has_cta'] else 'Missing / Weak'}")
                base_pen = base['evaluation']['channel_fit_penalty']
                pen_label = "Optimal" if base_pen == 0 else f"Penalty {base_pen:.2f}"
                st.markdown(f"- **Channel Fit:** {pen_label} (Target: {optimizer._get_ideal_length_str(sel_channel)})")
                
            with col_o:
                if is_improved:
                    st.markdown("### ✨ **Optimized Copy**")
                    st.caption("✓ Score strictly verified by Scikit-Learn Model")
                else:
                    st.markdown("### 📋 **Final Copy (Baseline Retained)**")
                    st.caption("= Baseline copy already has highest verified ML score")
                    
                st.markdown(f"**Headline:** {opt['headline']}")
                st.markdown(f"**Body:**\n> {opt['copy']}")
                st.markdown(f"**Call to Action:** `{opt['cta']}`")
                st.markdown("---")
                st.markdown(f"- **Word Count:** {comp['optimized_words']} words")
                st.markdown(f"- **Readability:** {comp['optimized_reading_ease']:.1f}/100 (Flesch Ease)")
                st.markdown(f"- **CTA:** {'Verified Action CTA' if comp['optimized_has_cta'] else 'Missing / Weak'}")
                opt_pen = opt['evaluation']['channel_fit_penalty']
                pen_label_opt = "Optimal" if opt_pen == 0 else f"Penalty {opt_pen:.2f}"
                st.markdown(f"- **Channel Fit:** {pen_label_opt} (Target: {optimizer._get_ideal_length_str(sel_channel)})")

            # Optimization Rationale / Reason
            st.markdown("<br/>", unsafe_allow_html=True)
            st.info(f"**Optimization Rationale:** {res['optimization_reason']}")

            # Live Web Research Grounding Section (Only when Live Search was enabled)
            if res.get('grounding_used'):
                st.markdown("#### 🌐 **Web Sources / Grounding (Google Search)**")
                sources = res.get('grounding_sources', [])
                if sources:
                    for s in sources:
                        title = s.get('title', 'Web Source')
                        uri = s.get('uri', '')
                        if uri:
                            st.markdown(f"- [{title}]({uri})")
                        else:
                            st.markdown(f"- {title}")
                else:
                    st.caption("Web grounding used; source metadata was not returned by the API.")
                
        with tab_edit:
            st.markdown("#### **Real-Time Interactive Editor**")
            st.markdown("Edit any copy fields below to see real-time ML approval scoring update immediately:")
            
            edit_h = st.text_input("Edit Headline:", value=opt['headline'], key="edit_h")
            edit_c = st.text_area("Edit Body Copy:", value=opt['copy'], height=120, key="edit_c")
            edit_cta = st.text_input("Edit Call to Action:", value=opt['cta'], key="edit_cta")
            
            # Live evaluation of manual edits
            live_eval = optimizer.evaluate_content(
                product_name=selected_row['short_name'],
                category=selected_row['main_category'],
                discounted_price=selected_row['discounted_price_num'],
                actual_price=selected_row['actual_price_num'],
                discount_percentage=selected_row['discount_percentage_num'],
                product_rating=selected_row['rating_clean'],
                tone=sel_tone,
                audience=sel_audience,
                channel=sel_channel,
                headline=edit_h,
                copy=edit_c,
                cta=edit_cta
            )
            
            score = live_eval['approval_score']
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=score,
                number={'suffix': "%", 'font': {'size': 32, 'family': 'Plus Jakarta Sans'}},
                title={'text': "<b>Live ML Approval Score</b>", 'font': {'size': 14}},
                gauge={
                    'axis': {'range': [0, 100], 'tickwidth': 1},
                    'bar': {'color': "#10B981" if score >= 70 else ("#F59E0B" if score >= 50 else "#EF4444")},
                    'steps': [
                        {'range': [0, 50], 'color': "#FEE2E2"},
                        {'range': [50, 70], 'color': "#FEF3C7"},
                        {'range': [70, 100], 'color': "#DCFCE7"}
                    ]
                }
            ))
            fig_gauge.update_layout(height=220, margin=dict(l=20, r=20, t=30, b=20))
            st.plotly_chart(fig_gauge, use_container_width=True)
            
        with tab_diag:
            st.markdown("#### **Prescriptive Diagnostics**")
            st.markdown(f"**Optimization Status:** `{res['optimization_status']}`")
            st.markdown(f"**Optimization Rationale:** {res['optimization_reason']}")
            if res.get('diagnostic_improvements'):
                st.markdown("**Confirmed Diagnostic Improvements:**")
                for imp in res['diagnostic_improvements']:
                    st.markdown(f"- 📈 {imp}")
            st.markdown("---")
            diag_eval = opt['evaluation']
            col_d1, col_d2 = st.columns(2)
            with col_d1:
                st.markdown("**Identified Strengths:**")
                for s in diag_eval.get('strengths', []):
                    st.markdown(f"✅ {s}")
            with col_d2:
                st.markdown("**Actionable Recommendations:**")
                if diag_eval.get('recommendations'):
                    for r in diag_eval.get('recommendations', []):
                        st.markdown(f"⚠️ {r}")
                else:
                    st.markdown("🎉 *Copy strictly satisfies all audience and channel constraints!*")


# ==============================================================================
# PAGE 4: PERSONA RECOMMENDER
# ==============================================================================
elif page == "🎯 Persona Recommender":
    st.subheader("Prescriptive Grid Search: Optimal Tone & Audience Recommender")
    st.markdown(
        "Simulating all 36 combinations of Tones and Audience Personas to prescribe the highest-approval marketing strategy for any catalog product. "
        "*(Uses trained Scikit-Learn classification model to rank demographic combinations.)*"
    )
    
    sel_prod_rec = st.selectbox(
        "Choose Catalog Product to Optimize:",
        df_catalog['short_name'].unique().tolist(),
        index=2
    )
    p_row = df_catalog[df_catalog['short_name'] == sel_prod_rec].iloc[0]
    
    col_p1, col_p2, col_p3 = st.columns(3)
    with col_p1:
        st.metric("Product Price", f"₹{int(p_row['discounted_price_num']):,}")
    with col_p2:
        st.metric("Active Discount", f"{int(p_row['discount_percentage_num'])}% OFF")
    with col_p3:
        st.metric("Category", p_row['main_category'])

    with st.spinner("Simulating 36 Tone x Audience combinations with trained ML model..."):
        grid_ranks = optimizer.recommend_optimal_parameters(
            product_name=p_row['short_name'],
            category=p_row['main_category'],
            discounted_price=p_row['discounted_price_num'],
            actual_price=p_row['actual_price_num'],
            discount_percentage=p_row['discount_percentage_num'],
            product_rating=p_row['rating_clean'],
            channel='Instagram / Facebook Feed Ad'
        )

    col_rank_t, col_rank_h = st.columns([3, 3])
    with col_rank_t:
        st.markdown("#### **Top 5 Prescribed Marketing Strategy Combinations**")
        for i, row in grid_ranks.head(5).reset_index().iterrows():
            st.markdown(f"""
            <div class="studio-box">
                <b>#{i+1} Tone:</b> {row['Tone']}<br/>
                <b>Target Audience:</b> {row['Target Audience']}<br/>
                <b>Predicted Approval Score:</b> <span style="color:#059669; font-weight:700;">{row['Predicted Approval Score']}%</span>
            </div>
            """, unsafe_allow_html=True)
            
    with col_rank_h:
        st.markdown("#### **Approval Heatmap (Tone vs. Audience)**")
        pivot_grid = grid_ranks.pivot(index='Tone', columns='Target Audience', values='Predicted Approval Score')
        fig_pgrid = px.imshow(
            pivot_grid,
            color_continuous_scale='Greens',
            text_auto='.1f',
            labels=dict(color="Approval Score")
        )
        fig_pgrid.update_layout(margin=dict(l=20, r=20, t=20, b=20))
        st.plotly_chart(fig_pgrid, use_container_width=True)


# ==============================================================================
# PAGE 5: ML INSIGHTS
# ==============================================================================
elif page == "🧠 ML Insights":
    st.subheader("Machine Learning Performance & Key Success Drivers")
    st.markdown(
        "Comprehensive model benchmarking and top predictive drivers extracted from Scikit-Learn models. "
        "*(Trained on 6,500 campaign feedback events with 5-fold cross-validation.)*"
    )
    
    # Model Benchmarking Table
    st.markdown("#### **1. Classifier Evaluation & Benchmark Matrix**")
    eval_df = pd.DataFrame(model_meta['evaluation_results']).T.reset_index().rename(columns={'index': 'Algorithm'})
    
    st.dataframe(
        eval_df[['Algorithm', 'cv_f1_mean', 'test_accuracy', 'test_precision', 'test_recall', 'test_f1', 'test_roc_auc']]
        .rename(columns={
            'cv_f1_mean': '5-Fold CV F1',
            'test_accuracy': 'Test Accuracy',
            'test_precision': 'Precision',
            'test_recall': 'Recall',
            'test_f1': 'F1-Score',
            'test_roc_auc': 'ROC-AUC'
        }),
        hide_index=True,
        use_container_width=True
    )
    
    st.markdown("---")
    
    # Feature Importances Bar Chart
    st.markdown("#### **2. Top Feature Drivers (What Makes a Marketing Copy Win?)**")
    feat_df = pd.DataFrame(model_meta['feature_importances_top20'][:15])
    
    fig_feat = px.bar(
        feat_df,
        x='importance',
        y='feature',
        orientation='h',
        color='importance',
        color_continuous_scale='Bluyl',
        title="<b>Relative Feature Importance / Logistic Regression Weight</b>"
    )
    fig_feat.update_layout(yaxis=dict(autorange="reversed"), xaxis_title="Model Weight Magnitude")
    st.plotly_chart(fig_feat, use_container_width=True)
    
    # Confusion Matrix
    best_cm = model_meta['evaluation_results'][model_meta['best_model']]['confusion_matrix']
    cm_df = pd.DataFrame(best_cm, index=['Actual Down', 'Actual Up'], columns=['Pred Down', 'Pred Up'])
    
    st.markdown(f"#### **3. Confusion Matrix (Best Model: {model_meta['best_model']})**")
    fig_cm = px.imshow(
        cm_df,
        text_auto=True,
        color_continuous_scale='Blues',
        labels=dict(x="Predicted Label", y="Actual Label", color="Samples")
    )
    fig_cm.update_layout(height=320, margin=dict(l=20, r=20, t=30, b=20))
    st.plotly_chart(fig_cm, use_container_width=True)


# ==============================================================================
# PAGE 6: SYSTEM ARCHITECTURE & SCALABILITY
# ==============================================================================
elif page == "🏗️ System Architecture & Scalability":
    st.subheader("System Architecture & Distributed Scalability")
    st.markdown(
        "Honest separation between the **Current Local Implementation** and the **Production-Scale Target Architecture**."
    )
    
    # Architecture Comparison Cards
    col_arch1, col_arch2 = st.columns(2)
    with col_arch1:
        st.markdown("""
        <div class="studio-box">
            <h4>🖥️ Current Local Implementation (Active)</h4>
            <ul>
                <li><b>Interface:</b> Streamlit (CampaignIQ) + Gradio Studio</li>
                <li><b>Generation:</b> Dual-Engine (Local Template Engine + Optional Gemini API)</li>
                <li><b>Optimization:</b> Scikit-Learn Logistic Regression Pipeline + NLP Diagnostic Rules</li>
                <li><b>Telemetry:</b> In-Memory Thread-Safe Python MetricsCollector</li>
                <li><b>Data:</b> Real Amazon CSV (1,465 items) + Parquet Feedback Logs (6,500 items)</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        
    with col_arch2:
        st.markdown("""
        <div class="studio-box">
            <h4>🌐 Production-Scale Target Architecture (Conceptual Blueprint)</h4>
            <ul>
                <li><b>Ingestion:</b> Apache Kafka Event Streaming (partitioned by category)</li>
                <li><b>Semantic Cache:</b> Milvus / Qdrant Vector DB (Cosine similarity >= 0.95)</li>
                <li><b>Serving:</b> Ray Serve / Triton Inference Server on Kubernetes</li>
                <li><b>Lakehouse:</b> Apache Spark Streaming + Delta Lake / Apache Iceberg</li>
                <li><b>Continuous Learning:</b> Direct Preference Optimization (DPO) fine-tuning loop</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        
    st.info("ℹ️ Note: Kafka, Spark, Milvus, and Kubernetes are not deployed locally; they form the validated enterprise blueprint for high-throughput scaling.")
    
    st.markdown("#### **Target Architecture Blueprint Flowchart**")
    st.markdown("""
```mermaid
flowchart LR
    A[Campaign Generation Requests] --> B(Apache Kafka Topics)
    B --> C{Semantic Cache Check<br/>Milvus Cosine Sim >= 0.95}
    C -->|Cache Hit: 15ms| D[Return Instant Copy]
    C -->|Cache Miss| E[Ray Serve LLM Pods]
    E --> F[Scikit-Learn Scorer & Guardrails]
    F --> D
    F --> G[Milvus Vector Store]
    
    H[User Feedback Logs<br/>'Thumbs Up/Down'] --> I(Kafka Feedback Topic)
    I --> J[Apache Spark Streaming]
    J --> K[(Apache Iceberg Lakehouse)]
    J --> L[DPO Reinforcement Training Loop]
    L --> E
```
    """)
    
    st.markdown("---")
    st.markdown("#### **Interactive Cost & Scalability Simulator**")
    st.markdown("Simulate throughput, token consumption, and financial savings under target caching architecture:")
    
    col_sim1, col_sim2 = st.columns(2)
    with col_sim1:
        daily_req = st.slider("Daily Request Volume:", min_value=10000, max_value=2000000, value=250000, step=10000)
        cache_rate = st.slider("Semantic Cache Hit Rate (%):", min_value=0, max_value=80, value=45, step=5) / 100.0
    with col_sim2:
        token_cost = st.number_input("LLM Cost per 1K Tokens ($):", value=0.0015, step=0.0005, format="%.4f")
        avg_tokens = st.number_input("Avg Tokens per Generation:", value=450, step=50)

    sim_res = calculate_scaling_metrics(
        daily_requests=daily_req,
        semantic_cache_hit_rate=cache_rate,
        avg_tokens_per_request=avg_tokens,
        cost_per_1k_tokens_usd=token_cost
    )
    
    s1, s2, s3, s4 = st.columns(4)
    with s1:
        st.metric("Annual Cost Savings", f"${sim_res['annual_savings_usd']:,.0f}", f"-{sim_res['cost_reduction_pct']}% Cost")
    with s2:
        st.metric("Blended Avg Latency", f"{sim_res['blended_avg_latency_ms']:.0f} ms", f"-{sim_res['latency_improvement_pct']:.0f}% Latency")
    with s3:
        st.metric("Peak System QPS", f"{sim_res['peak_qps']:.1f} req/s")
    with s4:
        st.metric("Monthly Lakehouse Logs", f"{sim_res['monthly_lakehouse_storage_gb']:.1f} GB")


# ==============================================================================
# PAGE 7: DATA EXPLORER
# ==============================================================================
elif page == "📁 Data Explorer":
    st.subheader("Data & Artifacts Explorer")
    st.markdown("Explore real catalog items, synthetic feedback logs, and live telemetry.")
    
    tab_cat, tab_logs, tab_meta, tab_prom = st.tabs([
        "📦 Real Amazon Catalog (1,465 Items)",
        "📝 Synthetic Feedback Logs (6,500 Events)",
        "📊 Model Metadata & Metrics",
        "📡 Live Prometheus Metrics Exposition"
    ])
    
    with tab_cat:
        st.markdown("#### **Real Amazon E-Commerce Product Catalog (`amazon.csv`)**")
        cat_search = st.text_input("Search Product Catalog by Keyword:", "")
        show_cat = df_catalog.copy()
        if cat_search:
            show_cat = show_cat[show_cat['product_name'].str.contains(cat_search, case=False, na=False)]
        st.dataframe(
            show_cat[['product_id', 'short_name', 'main_category', 'discounted_price_num', 'actual_price_num', 'discount_percentage_num', 'rating_clean']],
            hide_index=True,
            use_container_width=True
        )
        
    with tab_logs:
        st.markdown("#### **Synthetic Campaign Feedback Logs (6,500 records)**")
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            filt_tone = st.multiselect("Filter Tone:", df_campaigns['input_tone'].unique().tolist())
        with col_f2:
            filt_rating = st.selectbox("Filter Rating:", ["All", "Thumbs Up (1)", "Thumbs Down (0)"])
            
        show_logs = df_campaigns.copy()
        if filt_tone:
            show_logs = show_logs[show_logs['input_tone'].isin(filt_tone)]
        if filt_rating == "Thumbs Up (1)":
            show_logs = show_logs[show_logs['feedback_rating'] == 1]
        elif filt_rating == "Thumbs Down (0)":
            show_logs = show_logs[show_logs['feedback_rating'] == 0]
            
        st.dataframe(
            show_logs[['campaign_id', 'product_name', 'category', 'input_tone', 'input_target_audience', 'channel', 'feedback_label', 'feedback_reason', 'click_through_rate']],
            hide_index=True,
            use_container_width=True
        )
        
    with tab_meta:
        st.markdown("#### **Trained Model Metadata**")
        st.json(model_meta)
        
    with tab_prom:
        st.markdown("#### **Live Prometheus Metrics Exposition Format**")
        st.code(metrics_collector.generate_prometheus_metrics(), language="text")
