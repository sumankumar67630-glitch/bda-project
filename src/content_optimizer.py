"""
Content Optimization Engine
Provides real-time scoring, predictive diagnostics, optimal tone/audience recommendation,
and automated copy rewriting to maximize user approval ('Thumbs Up' probability).
"""

import os
import time
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple

from src.feature_engineering import extract_nlp_features, compute_channel_fit_penalty
from src.data_pipeline import TONES, AUDIENCES, CHANNELS, HEADLINE_TEMPLATES, COPY_TEMPLATES, CTA_TEMPLATES

# Safe import of metrics collector
try:
    from monitoring.metrics_collector import get_metrics_collector
except ImportError:
    def get_metrics_collector():
        return None

# Safe import of optional Gemini service
try:
    from src.gemini_service import (
        is_gemini_configured,
        generate_gemini_marketing_copy,
        get_gemini_status
    )
except ImportError:
    def is_gemini_configured() -> bool:
        return False
    generate_gemini_marketing_copy = None
    def get_gemini_status() -> str:
        return "Gemini not configured"

MODEL_PATH = "models/campaign_success_model.joblib"


class ContentOptimizer:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model = None
        self.load_model()
        
    def load_model(self):
        """Loads trained predictive pipeline."""
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            self.model = None

    def evaluate_content(
        self,
        product_name: str,
        category: str,
        discounted_price: float,
        actual_price: float,
        discount_percentage: float,
        product_rating: float,
        tone: str,
        audience: str,
        channel: str,
        headline: str,
        copy: str,
        cta: str
    ) -> Dict[str, Any]:
        """
        Evaluates a marketing copy and predicts the probability of receiving a 'Thumbs Up'.
        Returns detailed diagnostic scores and prescriptive recommendations.
        """
        # Extract features
        nlp = extract_nlp_features(copy, headline, cta)
        channel_penalty = compute_channel_fit_penalty(channel, nlp['word_count'])
        
        # Prepare input row for model
        input_data = pd.DataFrame([{
            'category': category,
            'input_tone': tone,
            'input_target_audience': audience,
            'channel': channel,
            'discounted_price': discounted_price,
            'actual_price': actual_price,
            'discount_percentage': discount_percentage,
            'product_rating': product_rating,
            'char_count': nlp['char_count'],
            'word_count': nlp['word_count'],
            'sentence_count': nlp['sentence_count'],
            'reading_ease': nlp['reading_ease'],
            'sentiment_score': nlp['sentiment_score'],
            'has_urgency': nlp['has_urgency'],
            'urgency_intensity': nlp['urgency_intensity'],
            'has_cta': nlp['has_cta'],
            'has_discount_callout': nlp['has_discount_callout'],
            'spec_density': nlp['spec_density'],
            'has_emoji': nlp['has_emoji'],
            'emoji_count': nlp['emoji_count'],
            'exclamation_count': nlp['exclamation_count'],
            'question_count': nlp['question_count'],
            'lexical_diversity': nlp['lexical_diversity'],
            'channel_fit_penalty': channel_penalty
        }])
        
        # Predict probability
        if self.model is not None:
            approval_prob = float(self.model.predict_proba(input_data)[0][1])
        else:
            # Fallback heuristic if model is not loaded
            approval_prob = 0.60
            
        score_100 = round(approval_prob * 100, 1)
        
        # Diagnostic breakdown
        recommendations = []
        strengths = []
        
        # 1. Channel fit check
        if channel_penalty > 0.3:
            recommendations.append(
                f"Copy length ({nlp['word_count']} words) diverges from ideal for '{channel}'. "
                f"Aim for {self._get_ideal_length_str(channel)}."
            )
        else:
            strengths.append(f"Ideal copy length ({nlp['word_count']} words) for {channel}.")
            
        # 2. Call to action check
        if not nlp['has_cta']:
            recommendations.append("Missing explicit Call-to-Action verb (e.g., 'Claim Now', 'Shop Deal', 'Upgrade Today').")
        else:
            strengths.append("Contains a clear, action-oriented Call-to-Action.")
            
        # 3. Discount mention check
        if discount_percentage > 25 and not nlp['has_discount_callout']:
            recommendations.append(f"Significant discount available ({int(discount_percentage)}%), but not highlighted in the copy. Mention savings to boost engagement.")
        elif nlp['has_discount_callout']:
            strengths.append("Effectively spotlights customer savings.")
            
        # 4. Audience alignment
        if audience == 'Tech Enthusiasts & Power Users' and nlp['spec_density'] < 0.08:
            recommendations.append("Tech Enthusiasts respond strongly to concrete specs (speeds, materials, wattage, compatibility).")
        elif audience == 'Tech Enthusiasts & Power Users' and nlp['spec_density'] >= 0.08:
            strengths.append("Good inclusion of technical specifications for tech-savvy audience.")
            
        if audience == 'College Students & Gen Z' and tone == 'Professional & Authoritative':
            recommendations.append("Consider switching tone to 'Playful & Witty' or adding emojis to better resonate with Gen Z.")
            
        if discounted_price < 500 and tone == 'Luxury & Premium':
            recommendations.append("Luxury tone for an entry-level item (<₹500) creates consumer skepticism. Try 'Bold & Promotional' or 'Empathetic'.")
            
        # 5. Readability
        if nlp['reading_ease'] < 50:
            recommendations.append("Sentence structure is complex (Reading Ease < 50). Simplify phrases for higher conversion.")
        elif nlp['reading_ease'] >= 70:
            strengths.append("High readability score makes copy effortless to skim.")

        return {
            'predicted_approval_prob': approval_prob,
            'approval_score': score_100,
            'predicted_rating': 'Thumbs Up' if approval_prob >= 0.50 else 'Thumbs Down',
            'nlp_metrics': nlp,
            'channel_fit_penalty': round(channel_penalty, 3),
            'recommendations': recommendations,
            'strengths': strengths
        }

    def recommend_optimal_parameters(
        self,
        product_name: str,
        category: str,
        discounted_price: float,
        actual_price: float,
        discount_percentage: float,
        product_rating: float,
        channel: str = 'Instagram / Facebook Feed Ad'
    ) -> pd.DataFrame:
        """
        Simulates all Tone x Audience combinations for a given product and ranks them
        by predicted approval probability to prescribe optimal campaign strategy.
        """
        combos = []
        for tone in TONES:
            for aud in AUDIENCES:
                # Sample representative copy
                sample_copy = f"Discover {product_name} at ₹{int(discounted_price)} ({int(discount_percentage)}% off). Great quality and durability. Shop now!"
                eval_res = self.evaluate_content(
                    product_name=product_name,
                    category=category,
                    discounted_price=discounted_price,
                    actual_price=actual_price,
                    discount_percentage=discount_percentage,
                    product_rating=product_rating,
                    tone=tone,
                    audience=aud,
                    channel=channel,
                    headline=f"Special Offer on {product_name}",
                    copy=sample_copy,
                    cta="Shop Now"
                )
                combos.append({
                    'Tone': tone,
                    'Target Audience': aud,
                    'Predicted Approval Score': eval_res['approval_score'],
                    'Predicted Thumbs Up %': round(eval_res['predicted_approval_prob'] * 100, 1),
                    'Channel': channel
                })
                
        df_rank = pd.DataFrame(combos).sort_values(by='Predicted Approval Score', ascending=False)
        return df_rank

    def generate_local_copy(
        self,
        product_name: str,
        category: str,
        discounted_price: float,
        actual_price: float,
        discount_percentage: float,
        features: str,
        tone: str,
        audience: str,
        channel: str
    ) -> Dict[str, str]:
        """Generates baseline copy using local templates without external API dependencies."""
        price = int(discounted_price)
        act_price = int(actual_price)
        disc = int(discount_percentage)
        short_feat = features[:100] if features else "durable build and reliable performance"

        if tone == 'Urgent & Scarcity-Driven':
            headline = f"⚡ Flash Sale: Save {disc}% on {product_name} Today Only!"
            copy = (
                f"Hurry! The high-demand {product_name} is now down to just ₹{price} (was ₹{act_price}). "
                f"Engineered with {short_feat}, it offers unmatched value before stocks deplete."
            )
            cta = f"Claim Your {disc}% Discount Now ⚡"
        elif tone == 'Playful & Witty':
            headline = f"Say goodbye to daily headaches with {product_name} 🎉"
            copy = (
                f"Why overpay when you can treat yourself to {product_name}? 😎 "
                f"Featuring {short_feat}, this powerhouse keeps you ahead for only ₹{price} (that's {disc}% off!)."
            )
            cta = "Upgrade Your Setup Today 🚀"
        elif tone == 'Professional & Authoritative':
            headline = f"Enterprise-Grade Reliability: The {product_name}"
            copy = (
                f"Designed for rigorous performance, {product_name} delivers reliable results with {short_feat}. "
                f"Acquire yours at an advantageous ₹{price} (regularly ₹{act_price}, reflecting a {disc}% saving)."
            )
            cta = "Order Professional Unit"
        elif tone == 'Luxury & Premium':
            headline = f"Unrivaled Craftsmanship: Introducing {product_name}"
            copy = (
                f"Experience refined functionality with {product_name}. Constructed with premium materials and {short_feat}, "
                f"it redefines standard excellence. Exclusively accessible at ₹{price}."
            )
            cta = "Discover The Collection"
        elif tone == 'Empathetic & Problem-Solving':
            headline = f"Make Your Everyday Routine Effortless with {product_name}"
            copy = (
                f"Tired of compromises? {product_name} is specifically built to solve everyday hassles with {short_feat}. "
                f"Enjoy peace of mind, now with an extraordinary {disc}% discount at just ₹{price}."
            )
            cta = "Experience Ease Today"
        else:  # Bold & Promotional
            headline = f"🔥 MEGA DEAL: Up to {disc}% OFF on {product_name}!"
            copy = (
                f"Unbeatable savings alert! Grab the top-rated {product_name} featuring {short_feat}. "
                f"Price slashed from ₹{act_price} to only ₹{price}! Over thousands of happy customers agree."
            )
            cta = f"Get ₹{price} Deal Now 🔥"

        if channel == 'SMS / WhatsApp Alert':
            copy = f"Special Offer: {product_name} at ₹{price} ({disc}% OFF)! Features {short_feat[:30]}... {cta}"
        elif channel == 'Google Search Ad':
            copy = f"Buy {product_name} at ₹{price} - Save {disc}%. Premium Features & Express Delivery. {cta}"

        return {
            'headline': headline,
            'copy': copy,
            'cta': cta
        }

    def generate_optimization_candidates(
        self,
        base_headline: str,
        base_copy: str,
        base_cta: str,
        product_name: str,
        category: str,
        discounted_price: float,
        actual_price: float,
        discount_percentage: float,
        product_rating: float,
        features: str,
        tone: str,
        audience: str,
        channel: str,
        base_eval: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generates targeted candidate variants from the baseline copy.
        Each candidate addresses a specific diagnostic opportunity:
        - Candidate 1: Targeted CTA reinforcement (keeps body intact)
        - Candidate 2: Discount callout injection (promotes active savings)
        - Candidate 3: Channel length harmonization (fits channel boundaries)
        - Candidate 4: Spec density enrichment (adds hardware details for power users)
        """
        price = int(discounted_price)
        act_price = int(actual_price)
        disc = int(discount_percentage)
        short_feat = features[:80].strip() if features else ""
        nlp = base_eval.get('nlp_metrics', {})

        candidates = []

        # Determine improved CTA verb if missing or weak
        improved_cta = base_cta
        if not nlp.get('has_cta', 0) or len(base_cta.strip()) < 3:
            if tone == 'Urgent & Scarcity-Driven':
                improved_cta = f"Claim Your {disc}% Deal Before It Ends ⚡"
            elif tone == 'Professional & Authoritative':
                improved_cta = "Secure Your Unit Today"
            elif tone == 'Luxury & Premium':
                improved_cta = "Reserve Your Selection"
            elif tone == 'Playful & Witty':
                improved_cta = "Get Yours Now 🚀"
            else:
                improved_cta = f"Shop Deal at ₹{price} Today"

        # Candidate 1: CTA reinforcement only (safe, preserves original body flow)
        if improved_cta != base_cta:
            candidates.append({
                'name': 'CTA Reinforcement',
                'headline': base_headline,
                'copy': base_copy,
                'cta': improved_cta,
                'change_desc': f"Replaced passive ending with action CTA ('{improved_cta}')"
            })

        # Candidate 2: Discount callout (if discount >= 20% and not mentioned)
        if disc >= 20 and not nlp.get('has_discount_callout', 0):
            savings_note = f"Save {disc}% (₹{act_price - price} off) today!"
            disc_copy = base_copy.rstrip('.') + f". {savings_note}"
            candidates.append({
                'name': 'Discount Highlighting',
                'headline': base_headline,
                'copy': disc_copy,
                'cta': improved_cta,
                'change_desc': f"Highlighted active discount ({disc}% off, ₹{act_price - price} savings)"
            })

        # Candidate 3: Channel length harmonization
        words = base_copy.split()
        if channel == 'SMS / WhatsApp Alert' and len(words) > 35:
            compressed_copy = f"⚡ Exclusive Alert: Get {product_name[:35]} for just ₹{price} ({disc}% OFF). Limited stock! {improved_cta}"
            candidates.append({
                'name': 'SMS Length Compression',
                'headline': base_headline,
                'copy': compressed_copy,
                'cta': improved_cta,
                'change_desc': f"Compressed copy from {len(words)} to {len(compressed_copy.split())} words for SMS fit"
            })
        elif channel == 'Google Search Ad' and len(words) > 45:
            tight_copy = f"Buy {product_name[:30]} at ₹{price} (Save {disc}%). Verified {product_rating}★ quality with express delivery. {improved_cta}"
            candidates.append({
                'name': 'Search Ad Optimization',
                'headline': f"Buy {product_name[:30]} | {disc}% OFF",
                'copy': tight_copy,
                'cta': improved_cta,
                'change_desc': f"Restructured into high-relevance search ad format ({len(tight_copy.split())} words)"
            })
        elif channel == 'Email Newsletter' and len(words) < 45:
            expanded_copy = (
                f"{base_copy.rstrip('.')}. Backed by manufacturer warranty and rated {product_rating} out of 5 stars by thousands "
                f"of verified buyers. Take advantage of our seasonal pricing before inventory runs out."
            )
            candidates.append({
                'name': 'Newsletter Value Expansion',
                'headline': base_headline,
                'copy': expanded_copy,
                'cta': improved_cta,
                'change_desc': f"Expanded copy from {len(words)} to {len(expanded_copy.split())} words for newsletter depth"
            })

        # Candidate 4: Spec density enrichment (for tech audience)
        if audience == 'Tech Enthusiasts & Power Users' and nlp.get('spec_density', 0) < 0.08 and short_feat:
            spec_copy = f"{base_copy.rstrip('.')}. Engineered with {short_feat} for maximum reliability."
            candidates.append({
                'name': 'Technical Spec Enrichment',
                'headline': base_headline,
                'copy': spec_copy,
                'cta': improved_cta,
                'change_desc': f"Injected technical hardware specifications ({short_feat[:40]}...)"
            })

        return candidates

    def optimize_copy(
        self,
        base_headline: str,
        base_copy: str,
        base_cta: str,
        product_name: str,
        category: str,
        discounted_price: float,
        actual_price: float,
        discount_percentage: float,
        product_rating: float,
        features: str,
        tone: str,
        audience: str,
        channel: str,
        base_eval: Dict[str, Any]
    ) -> Dict[str, str]:
        """Score-aware optimization helper: returns best candidate or original baseline."""
        candidates = self.generate_optimization_candidates(
            base_headline, base_copy, base_cta, product_name, category,
            discounted_price, actual_price, discount_percentage, product_rating,
            features, tone, audience, channel, base_eval
        )
        best_cand = {'headline': base_headline, 'copy': base_copy, 'cta': base_cta}
        best_score = base_eval['approval_score']
        for cand in candidates:
            cand_eval = self.evaluate_content(
                product_name, category, discounted_price, actual_price, discount_percentage,
                product_rating, tone, audience, channel, cand['headline'], cand['copy'], cand['cta']
            )
            if cand_eval['approval_score'] > best_score:
                best_score = cand_eval['approval_score']
                best_cand = cand
        return {
            'headline': best_cand['headline'],
            'copy': best_cand['copy'],
            'cta': best_cand['cta']
        }

    def generate_optimized_copy(
        self,
        product_name: str,
        category: str,
        discounted_price: float,
        actual_price: float,
        discount_percentage: float,
        product_rating: float,
        features: str,
        tone: str,
        audience: str,
        channel: str,
        generator_mode: str = 'local',
        enable_grounding: bool = False
    ) -> Dict[str, Any]:
        """
        Executes the dual-engine generation and score-aware optimization pipeline:
        1. Measures Generation Latency separately from ML Inference Latency.
        2. Generates baseline copy using either Gemini or Local Template Engine.
        3. Evaluates baseline copy using the trained Scikit-Learn model.
        4. Generates focused optimization candidates and evaluates each with the ML model.
        5. Selects candidate ONLY if its verified score strictly exceeds the baseline.
        6. If no candidate improves the score, retains original baseline copy with 0.0% delta.
        """
        t0 = time.time()
        generator_source = 'local_template'
        is_ai_generated = False
        grounding_used = False
        grounding_sources = []
        api_error = None

        # Step 1: Baseline Generation (Track Generation Latency)
        t_gen_start = time.time()
        if generator_mode == 'gemini':
            if is_gemini_configured() and generate_gemini_marketing_copy is not None:
                gemini_res = generate_gemini_marketing_copy(
                    product_name=product_name,
                    category=category,
                    discounted_price=discounted_price,
                    actual_price=actual_price,
                    discount_percentage=discount_percentage,
                    product_features=features,
                    tone=tone,
                    target_audience=audience,
                    channel=channel,
                    enable_grounding=enable_grounding
                )
                if gemini_res.get('success'):
                    base_headline = gemini_res.get('headline', '')
                    base_copy = gemini_res.get('copy', '')
                    base_cta = gemini_res.get('cta', '')
                    grounding_sources = gemini_res.get('grounding_sources', [])
                    generator_source = 'gemini'
                    is_ai_generated = True
                    grounding_used = enable_grounding
                else:
                    api_error = gemini_res.get('error')
                    local_copy = self.generate_local_copy(
                        product_name, category, discounted_price, actual_price,
                        discount_percentage, features, tone, audience, channel
                    )
                    base_headline, base_copy, base_cta = local_copy['headline'], local_copy['copy'], local_copy['cta']
                    generator_source = 'local_fallback'
            else:
                local_copy = self.generate_local_copy(
                    product_name, category, discounted_price, actual_price,
                    discount_percentage, features, tone, audience, channel
                )
                base_headline, base_copy, base_cta = local_copy['headline'], local_copy['copy'], local_copy['cta']
                generator_source = 'local_fallback'
                api_error = "Gemini API key not configured or SDK unavailable. Used local template engine fallback."
        else:
            local_copy = self.generate_local_copy(
                product_name, category, discounted_price, actual_price,
                discount_percentage, features, tone, audience, channel
            )
            base_headline, base_copy, base_cta = local_copy['headline'], local_copy['copy'], local_copy['cta']
            generator_source = 'local_template'
            is_ai_generated = False
            grounding_used = False

        gen_latency_ms = (time.time() - t_gen_start) * 1000

        # Step 2: Evaluate Baseline Copy with ML Model (Track ML Inference Latency)
        t_b_start = time.time()
        base_eval = self.evaluate_content(
            product_name=product_name,
            category=category,
            discounted_price=discounted_price,
            actual_price=actual_price,
            discount_percentage=discount_percentage,
            product_rating=product_rating,
            tone=tone,
            audience=audience,
            channel=channel,
            headline=base_headline,
            copy=base_copy,
            cta=base_cta
        )
        inf_latency_ms = (time.time() - t_b_start) * 1000

        # Step 3: Generate and Evaluate Optimization Candidates
        candidates = self.generate_optimization_candidates(
            base_headline=base_headline,
            base_copy=base_copy,
            base_cta=base_cta,
            product_name=product_name,
            category=category,
            discounted_price=discounted_price,
            actual_price=actual_price,
            discount_percentage=discount_percentage,
            product_rating=product_rating,
            features=features,
            tone=tone,
            audience=audience,
            channel=channel,
            base_eval=base_eval
        )

        best_candidate = None
        best_eval = base_eval
        best_score = base_eval['approval_score']
        best_change_desc = ""

        for cand in candidates:
            t_c_start = time.time()
            cand_eval = self.evaluate_content(
                product_name=product_name,
                category=category,
                discounted_price=discounted_price,
                actual_price=actual_price,
                discount_percentage=discount_percentage,
                product_rating=product_rating,
                tone=tone,
                audience=audience,
                channel=channel,
                headline=cand['headline'],
                copy=cand['copy'],
                cta=cand['cta']
            )
            inf_latency_ms += (time.time() - t_c_start) * 1000

            # Strictly select candidate ONLY if it improves upon the baseline score
            if cand_eval['approval_score'] > best_score:
                best_score = cand_eval['approval_score']
                best_candidate = cand
                best_eval = cand_eval
                best_change_desc = cand['change_desc']

        # Step 4: Final Selection & Honest Score Verification
        diagnostic_improvements = []
        if best_candidate is not None and best_score > base_eval['approval_score']:
            is_improved = True
            opt_headline = best_candidate['headline']
            opt_copy = best_candidate['copy']
            opt_cta = best_candidate['cta']
            opt_eval = best_eval
            delta_score = round(best_score - base_eval['approval_score'], 1)
            delta_prob = round((best_eval['predicted_approval_prob'] - base_eval['predicted_approval_prob']) * 100, 1)
            optimization_status = "✓ Optimized — ML approval improved"

            # Compute genuine diagnostic improvements based on actual calculated values
            base_words = base_eval['nlp_metrics']['word_count']
            opt_words = opt_eval['nlp_metrics']['word_count']
            if opt_words != base_words:
                if opt_words < base_words:
                    diagnostic_improvements.append(f"Reduced word count from {base_words} → {opt_words} words.")
                else:
                    diagnostic_improvements.append(f"Expanded word count from {base_words} → {opt_words} words.")

            base_pen = base_eval['channel_fit_penalty']
            opt_pen = opt_eval['channel_fit_penalty']
            if opt_pen < base_pen:
                diagnostic_improvements.append(f"Improved {channel} fit (penalty reduced from {base_pen:.2f} → {opt_pen:.2f}).")
            elif opt_pen == 0 and base_pen == 0:
                diagnostic_improvements.append(f"Maintained optimal {channel} channel length.")

            if not base_eval['nlp_metrics']['has_cta'] and opt_eval['nlp_metrics']['has_cta']:
                diagnostic_improvements.append(f"Added verified Call-to-Action ('{opt_cta}').")

            if not base_eval['nlp_metrics']['has_discount_callout'] and opt_eval['nlp_metrics']['has_discount_callout']:
                diagnostic_improvements.append("Highlighted active product discount/savings.")

            base_ease = base_eval['nlp_metrics']['reading_ease']
            opt_ease = opt_eval['nlp_metrics']['reading_ease']
            if opt_ease > base_ease + 1.0:
                diagnostic_improvements.append(f"Improved readability ({base_ease:.1f} → {opt_ease:.1f}).")

            diag_text = " ".join(diagnostic_improvements) if diagnostic_improvements else best_change_desc
            optimization_reason = (
                f"{best_change_desc}. {diag_text} "
                f"Final ML approval: {base_eval['approval_score']}% → {best_score}% (+{delta_score}%)."
            )
        else:
            # Baseline is already optimal or no candidate outperformed it
            is_improved = False
            opt_headline = base_headline
            opt_copy = base_copy
            opt_cta = base_cta
            opt_eval = base_eval
            delta_score = 0.0
            delta_prob = 0.0
            optimization_status = "= No improvement required — baseline copy already has highest verified ML score"

            reasons = []
            if base_eval['channel_fit_penalty'] == 0:
                reasons.append(f"Baseline already satisfies the '{channel}' length target ({base_eval['nlp_metrics']['word_count']} words)")
            if base_eval['nlp_metrics']['has_cta']:
                reasons.append("Baseline already contains an action Call-to-Action")
            if base_eval['nlp_metrics']['has_discount_callout']:
                reasons.append("Baseline effectively highlights active savings")
            if base_eval['nlp_metrics']['reading_ease'] >= 60:
                reasons.append(f"Baseline reading ease is optimal ({base_eval['nlp_metrics']['reading_ease']:.1f}/100)")

            if reasons:
                optimization_reason = (
                    f"No improvement required. {'; '.join(reasons)}. "
                    "Additional candidate rewrites did not improve verified ML approval score."
                )
            else:
                optimization_reason = (
                    "No candidate rewrite improved the verified ML approval score. "
                    "Kept original baseline copy to prevent score degradation."
                )

        total_latency_ms = (time.time() - t0) * 1000

        # Record genuine runtime telemetry
        try:
            collector = get_metrics_collector()
            if collector is not None:
                collector.record_request(
                    generator_source=generator_source,
                    total_latency_ms=total_latency_ms,
                    inference_latency_ms=inf_latency_ms,
                    success=(api_error is None or generator_source == 'local_fallback')
                )
        except Exception:
            pass

        return {
            'generator_mode': generator_mode,
            'generator_source': generator_source,
            'is_ai_generated': is_ai_generated,
            'grounding_used': grounding_used,
            'grounding_sources': grounding_sources,
            'api_error': api_error,
            'is_improved': is_improved,
            'optimization_status': optimization_status,
            'optimization_reason': optimization_reason,
            'diagnostic_improvements': diagnostic_improvements,
            'gen_latency_ms': round(gen_latency_ms, 1),
            'inference_latency_ms': round(inf_latency_ms, 1),
            'total_latency_ms': round(total_latency_ms, 1),
            'latency_ms': round(total_latency_ms, 1),
            # Top-level backwards compatibility
            'headline': opt_headline,
            'copy': opt_copy,
            'cta': opt_cta,
            'evaluation': opt_eval,
            # Structured side-by-side data
            'baseline': {
                'headline': base_headline,
                'copy': base_copy,
                'cta': base_cta,
                'evaluation': base_eval
            },
            'optimized': {
                'headline': opt_headline,
                'copy': opt_copy,
                'cta': opt_cta,
                'evaluation': opt_eval
            },
            'delta_score': delta_score,
            'delta_prob': delta_prob,
            'comparison': {
                'baseline_score': base_eval['approval_score'],
                'optimized_score': opt_eval['approval_score'],
                'baseline_prob': round(base_eval['predicted_approval_prob'] * 100, 1),
                'optimized_prob': round(opt_eval['predicted_approval_prob'] * 100, 1),
                'delta_score': delta_score,
                'delta_prob': delta_prob,
                'baseline_reading_ease': base_eval['nlp_metrics']['reading_ease'],
                'optimized_reading_ease': opt_eval['nlp_metrics']['reading_ease'],
                'baseline_words': base_eval['nlp_metrics']['word_count'],
                'optimized_words': opt_eval['nlp_metrics']['word_count'],
                'baseline_has_cta': bool(base_eval['nlp_metrics']['has_cta']),
                'optimized_has_cta': bool(opt_eval['nlp_metrics']['has_cta']),
                'baseline_discount_callout': bool(base_eval['nlp_metrics']['has_discount_callout']),
                'optimized_discount_callout': bool(opt_eval['nlp_metrics']['has_discount_callout'])
            }
        }

    def _get_ideal_length_str(self, channel: str) -> str:
        ranges = {
            'SMS / WhatsApp Alert': "10 to 35 words",
            'Google Search Ad': "15 to 45 words",
            'Instagram / Facebook Feed Ad': "25 to 75 words",
            'Amazon Sponsored Ad': "20 to 60 words",
            'Email Newsletter': "50 to 150 words"
        }
        return ranges.get(channel, "25 to 75 words")
