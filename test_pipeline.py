"""
Automated Test Suite for CampaignIQ Platform
Tests data preprocessing, NLP feature extraction, model inference,
ContentOptimizer dual-engine generation, score-aware optimization monotonicity,
Gemini availability & graceful degradation, Google search grounding,
categorical Executive Overview analytics, metrics collector, and Gradio studio integration.
"""

import os
import unittest
from unittest.mock import patch, MagicMock
import pandas as pd
import numpy as np

from src.feature_engineering import extract_nlp_features, compute_channel_fit_penalty
from src.content_optimizer import ContentOptimizer
from src.architecture_spec import calculate_scaling_metrics
from monitoring.metrics_collector import MetricsCollector, get_metrics_collector


class TestCampaignIQPipeline(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.optimizer = ContentOptimizer(model_path="models/campaign_success_model.joblib")

    def test_nlp_feature_extraction(self):
        """Verifies NLP signal extraction across readability, sentiment, and marketing drivers."""
        copy = "Grab this fast 60W USB-C charging cable now for just ₹199 (50% off)! Durable nylon braided design."
        headline = "⚡ Flash Sale Today Only!"
        cta = "Buy Now at ₹199"
        
        signals = extract_nlp_features(copy, headline, cta)
        self.assertIn('reading_ease', signals)
        self.assertGreaterEqual(signals['reading_ease'], 0.0)
        self.assertLessEqual(signals['reading_ease'], 100.0)
        self.assertEqual(signals['has_cta'], 1)
        self.assertEqual(signals['has_discount_callout'], 1)
        self.assertEqual(signals['has_urgency'], 1)
        self.assertGreater(signals['spec_density'], 0.0)
        self.assertGreater(signals['sentiment_score'], 0.0)

    def test_channel_penalty(self):
        """Verifies channel length boundaries and penalty calculations."""
        # Short copy for SMS
        sms_good = compute_channel_fit_penalty('SMS / WhatsApp Alert', 20)
        self.assertEqual(sms_good, 0.0)
        
        # Overly long copy for SMS
        sms_long = compute_channel_fit_penalty('SMS / WhatsApp Alert', 90)
        self.assertGreater(sms_long, 0.5)

    def test_content_optimizer_inference(self):
        """Verifies Scikit-Learn model inference returns calibrated probabilities and ratings."""
        res = self.optimizer.evaluate_content(
            product_name="Ambrane Type C Cable",
            category="Computers&Accessories",
            discounted_price=199.0,
            actual_price=349.0,
            discount_percentage=43.0,
            product_rating=4.0,
            tone="Bold & Promotional",
            audience="Budget Shoppers & Deal Seekers",
            channel="Instagram / Facebook Feed Ad",
            headline="Massive Savings on Ambrane Cable!",
            copy="Get this fast charging cable for ₹199 (43% off). Super durable and long-lasting. Shop now!",
            cta="Shop Now"
        )
        self.assertIn('predicted_approval_prob', res)
        self.assertGreaterEqual(res['predicted_approval_prob'], 0.0)
        self.assertLessEqual(res['predicted_approval_prob'], 1.0)
        self.assertIn(res['predicted_rating'], ['Thumbs Up', 'Thumbs Down'])
        self.assertIsInstance(res['recommendations'], list)
        self.assertIsInstance(res['strengths'], list)

    def test_content_optimizer_local_mode(self):
        """Verifies local generation works offline with side-by-side comparison and genuine delta."""
        res = self.optimizer.generate_optimized_copy(
            product_name="Boat Bassheads Earphones",
            category="Electronics",
            discounted_price=399.0,
            actual_price=999.0,
            discount_percentage=60.0,
            product_rating=4.2,
            features="Super extra bass, 10mm dynamic drivers, tangle-free flat cable",
            tone="Bold & Promotional",
            audience="Budget Shoppers & Deal Seekers",
            channel="Instagram / Facebook Feed Ad",
            generator_mode="local"
        )
        self.assertEqual(res['generator_source'], 'local_template')
        self.assertFalse(res['is_ai_generated'])
        self.assertIn('baseline', res)
        self.assertIn('optimized', res)
        self.assertIn('delta_score', res)
        self.assertIn('comparison', res)
        self.assertIn('latency_ms', res)
        self.assertGreaterEqual(res['delta_score'], 0.0)
        self.assertGreaterEqual(res['comparison']['optimized_score'], res['comparison']['baseline_score'])

    def test_optimization_monotonicity_lower_candidate_rejected(self):
        """
        Target Behavior 1:
        Baseline 80% | Candidate 75%
        → Final optimized score must remain 80%
        → Delta = 0.0%
        → Final copy must be baseline copy
        """
        base_eval_mock = {
            'predicted_approval_prob': 0.80,
            'approval_score': 80.0,
            'predicted_rating': 'Thumbs Up',
            'nlp_metrics': {'word_count': 35, 'reading_ease': 65.0, 'has_cta': 1, 'has_discount_callout': 1, 'spec_density': 0.05},
            'channel_fit_penalty': 0.0,
            'recommendations': [],
            'strengths': ['High approval score']
        }
        cand_eval_mock = {
            'predicted_approval_prob': 0.75,
            'approval_score': 75.0,
            'predicted_rating': 'Thumbs Up',
            'nlp_metrics': {'word_count': 35, 'reading_ease': 58.0, 'has_cta': 1, 'has_discount_callout': 1, 'spec_density': 0.05},
            'channel_fit_penalty': 0.0,
            'recommendations': [],
            'strengths': []
        }

        # Mock evaluate_content: first call returns baseline, subsequent candidate calls return lower score
        with patch.object(self.optimizer, 'evaluate_content', side_effect=[base_eval_mock, cand_eval_mock, cand_eval_mock, cand_eval_mock]):
            res = self.optimizer.generate_optimized_copy(
                product_name="Test Item",
                category="Electronics",
                discounted_price=100.0,
                actual_price=200.0,
                discount_percentage=50.0,
                product_rating=4.0,
                features="Test features",
                tone="Bold & Promotional",
                audience="Budget Shoppers & Deal Seekers",
                channel="Instagram / Facebook Feed Ad",
                generator_mode="local"
            )
            # Final optimized score must strictly remain 80%
            self.assertEqual(res['comparison']['optimized_score'], 80.0)
            self.assertEqual(res['delta_score'], 0.0)
            self.assertFalse(res['is_improved'])
            self.assertEqual(res['optimized']['copy'], res['baseline']['copy'])
            self.assertIn("No improvement required", res['optimization_status'])

    def test_optimization_monotonicity_higher_candidate_accepted(self):
        """
        Target Behavior 2:
        Baseline 80% | Candidate 85%
        → Final optimized score = 85%
        → Delta = +5.0%
        → Candidate accepted as optimized copy
        """
        base_eval_mock = {
            'predicted_approval_prob': 0.80,
            'approval_score': 80.0,
            'predicted_rating': 'Thumbs Up',
            'nlp_metrics': {'word_count': 35, 'reading_ease': 65.0, 'has_cta': 0, 'has_discount_callout': 0, 'spec_density': 0.05},
            'channel_fit_penalty': 0.0,
            'recommendations': ['Add a clear CTA'],
            'strengths': []
        }
        cand_eval_mock = {
            'predicted_approval_prob': 0.85,
            'approval_score': 85.0,
            'predicted_rating': 'Thumbs Up',
            'nlp_metrics': {'word_count': 32, 'reading_ease': 68.0, 'has_cta': 1, 'has_discount_callout': 1, 'spec_density': 0.05},
            'channel_fit_penalty': 0.0,
            'recommendations': [],
            'strengths': ['Verified Call-to-Action included']
        }

        with patch.object(self.optimizer, 'evaluate_content', side_effect=[base_eval_mock, cand_eval_mock, cand_eval_mock, cand_eval_mock]):
            res = self.optimizer.generate_optimized_copy(
                product_name="Test Item",
                category="Electronics",
                discounted_price=100.0,
                actual_price=200.0,
                discount_percentage=50.0,
                product_rating=4.0,
                features="Test features",
                tone="Bold & Promotional",
                audience="Budget Shoppers & Deal Seekers",
                channel="Instagram / Facebook Feed Ad",
                generator_mode="local"
            )
            # Final optimized score must be 85% with +5.0% delta
            self.assertEqual(res['comparison']['optimized_score'], 85.0)
            self.assertEqual(res['delta_score'], 5.0)
            self.assertTrue(res['is_improved'])
            self.assertIn("Optimized", res['optimization_status'])

    def test_gemini_baseline_with_no_improving_candidate(self):
        """
        Target Behavior 3:
        Gemini baseline with no improving candidate
        → Baseline must remain the final optimized copy
        """
        gemini_mock_output = {
            'success': True,
            'headline': "Gemini Premium Headline",
            'copy': "Gemini crafted high-converting marketing copy with strong specs.",
            'cta': "Shop Now",
            'grounding_sources': []
        }
        base_eval_mock = {
            'predicted_approval_prob': 0.88,
            'approval_score': 88.0,
            'predicted_rating': 'Thumbs Up',
            'nlp_metrics': {'word_count': 40, 'reading_ease': 70.0, 'has_cta': 1, 'has_discount_callout': 1, 'spec_density': 0.08},
            'channel_fit_penalty': 0.0,
            'recommendations': [],
            'strengths': ['Optimal copy flow']
        }
        cand_eval_mock = {
            'predicted_approval_prob': 0.81,
            'approval_score': 81.0,
            'predicted_rating': 'Thumbs Up',
            'nlp_metrics': {'word_count': 35, 'reading_ease': 65.0, 'has_cta': 1, 'has_discount_callout': 1, 'spec_density': 0.06},
            'channel_fit_penalty': 0.0,
            'recommendations': [],
            'strengths': []
        }

        with patch('src.content_optimizer.generate_gemini_marketing_copy', return_value=gemini_mock_output), \
             patch('src.content_optimizer.is_gemini_configured', return_value=True), \
             patch.object(self.optimizer, 'evaluate_content', side_effect=[base_eval_mock, cand_eval_mock, cand_eval_mock, cand_eval_mock]):
            
            res = self.optimizer.generate_optimized_copy(
                product_name="Gemini Flagship Device",
                category="Computers&Accessories",
                discounted_price=599.0,
                actual_price=999.0,
                discount_percentage=40.0,
                product_rating=4.5,
                features="Flagship processor, lightweight",
                tone="Professional & Authoritative",
                audience="Tech Enthusiasts & Power Users",
                channel="Instagram / Facebook Feed Ad",
                generator_mode="gemini"
            )
            self.assertEqual(res['generator_source'], 'gemini')
            self.assertFalse(res['is_improved'])
            self.assertEqual(res['delta_score'], 0.0)
            self.assertEqual(res['optimized']['copy'], res['baseline']['copy'])

    def test_local_engine_with_improving_candidate(self):
        """
        Target Behavior 4:
        Local engine with improving candidate
        → Improving candidate must be selected
        """
        base_eval_mock = {
            'predicted_approval_prob': 0.60,
            'approval_score': 60.0,
            'predicted_rating': 'Thumbs Up',
            'nlp_metrics': {'word_count': 50, 'reading_ease': 52.0, 'has_cta': 0, 'has_discount_callout': 0, 'spec_density': 0.02},
            'channel_fit_penalty': 0.4,
            'recommendations': ['Shorten copy', 'Add CTA'],
            'strengths': []
        }
        cand_eval_mock = {
            'predicted_approval_prob': 0.72,
            'approval_score': 72.0,
            'predicted_rating': 'Thumbs Up',
            'nlp_metrics': {'word_count': 25, 'reading_ease': 68.0, 'has_cta': 1, 'has_discount_callout': 1, 'spec_density': 0.06},
            'channel_fit_penalty': 0.0,
            'recommendations': [],
            'strengths': ['Optimal channel length']
        }

        with patch.object(self.optimizer, 'evaluate_content', side_effect=[base_eval_mock, cand_eval_mock, cand_eval_mock, cand_eval_mock]):
            res = self.optimizer.generate_optimized_copy(
                product_name="Local Smart Watch",
                category="Electronics",
                discounted_price=1299.0,
                actual_price=2499.0,
                discount_percentage=48.0,
                product_rating=4.1,
                features="AMOLED display, 7-day battery",
                tone="Urgent & Scarcity-Driven",
                audience="Budget Shoppers & Deal Seekers",
                channel="SMS / WhatsApp Alert",
                generator_mode="local"
            )
            self.assertTrue(res['is_improved'])
            self.assertEqual(res['comparison']['optimized_score'], 72.0)
            self.assertEqual(res['delta_score'], 12.0)

    def test_no_fake_dates_in_executive_overview(self):
        """
        Target Behavior 5:
        Verify no hardcoded 2000-2001 dates in Executive Overview and truthful categorical analytics.
        """
        with open("app.py", "r", encoding="utf-8") as f:
            content = f.read()
        exec_start = content.find('page == "📊 Executive Overview"')
        exec_end = content.find('page == "🔍 Performance Analytics"')
        exec_section = content[exec_start:exec_end] if (exec_start != -1 and exec_end != -1) else content

        self.assertNotIn("2000", exec_section, "Misleading historical 2000 date found in Executive Overview")
        self.assertNotIn("2001", exec_section, "Misleading historical 2001 date found in Executive Overview")
        self.assertNotIn("df_ts['date']", exec_section, "Misleading fake date grouping found in Executive Overview")
        self.assertIn("fig_tone", exec_section, "Categorical tone analytics missing from Executive Overview")
        self.assertIn("fig_chan", exec_section, "Categorical channel analytics missing from Executive Overview")

    def test_gemini_unavailable_fallback(self):
        """
        Target Behavior 6:
        Verifies graceful fallback to local template when GEMINI_API_KEY is missing/empty.
        """
        with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
            from src.gemini_service import is_gemini_configured
            self.assertFalse(is_gemini_configured())
            
            res = self.optimizer.generate_optimized_copy(
                product_name="Dummy Fallback Product",
                category="OfficeProducts",
                discounted_price=150.0,
                actual_price=300.0,
                discount_percentage=50.0,
                product_rating=4.0,
                features="Standard durable material",
                tone="Bold & Promotional",
                audience="General",
                channel="SMS / WhatsApp Alert",
                generator_mode="gemini"
            )
            self.assertEqual(res['generator_source'], 'local_fallback')
            self.assertFalse(res['is_ai_generated'])
            self.assertTrue(len(res['baseline']['headline']) > 0)
            self.assertTrue(len(res['optimized']['copy']) > 0)

    def test_google_search_grounding_integration(self):
        """
        Target Behavior 9:
        Verifies that Google Search grounding configuration and safe metadata extraction work.
        """
        res = self.optimizer.generate_optimized_copy(
            product_name="Sandisk 128GB Pendrive",
            category="Computers&Accessories",
            discounted_price=499.0,
            actual_price=999.0,
            discount_percentage=50.0,
            product_rating=4.3,
            features="USB 3.0 ultra high speed transfer",
            tone="Urgent & Scarcity-Driven",
            audience="Tech Enthusiasts & Power Users",
            channel="SMS / WhatsApp Alert",
            generator_mode="gemini",
            enable_grounding=True
        )
        self.assertIn('grounding_used', res)
        self.assertIn('grounding_sources', res)
        self.assertIsInstance(res['grounding_sources'], list)

    def test_metrics_collector(self):
        """Verifies in-memory telemetry collection and Prometheus metrics generation."""
        collector = MetricsCollector()
        collector.record_request(
            generator_source="local_template",
            total_latency_ms=12.5,
            inference_latency_ms=8.0,
            success=True
        )
        summary = collector.get_summary()
        self.assertGreaterEqual(summary['total_requests'], 1)
        self.assertGreaterEqual(summary['local_requests'], 1)
        self.assertGreater(summary['avg_latency_ms'], 0.0)
        
        prom_text = collector.generate_prometheus_metrics()
        self.assertIn("campaigniq_requests_total", prom_text)
        self.assertIn("campaigniq_latency_ms_avg", prom_text)
        self.assertIn("campaigniq_inference_latency_ms_avg", prom_text)

    def test_scaling_simulator(self):
        metrics = calculate_scaling_metrics(
            daily_requests=50000,
            semantic_cache_hit_rate=0.50
        )
        self.assertGreater(metrics['daily_savings_usd'], 0.0)
        self.assertGreater(metrics['annual_savings_usd'], 0.0)
        self.assertGreater(metrics['latency_improvement_pct'], 0.0)
        self.assertGreater(metrics['peak_qps'], 0.0)

    def test_gradio_app_structure(self):
        """
        Target Behavior 10:
        Verifies that the standalone Gradio studio app instantiates correctly.
        """
        import gradio_app
        self.assertIsNotNone(gradio_app.demo)
        self.assertEqual(gradio_app.demo.title, "CampaignIQ — AI Marketing Intelligence")


if __name__ == '__main__':
    unittest.main()
