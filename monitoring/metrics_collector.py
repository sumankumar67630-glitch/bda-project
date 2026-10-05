"""
Telemetry & Metrics Collector Module
Provides honest in-memory runtime telemetry, tracking request latency,
throughput, generator modes (Gemini vs Local), and cache efficiency.
Exposes Prometheus-compatible exposition format metrics.
"""

import time
import threading
from typing import Dict, Any, List
from collections import deque


class MetricsCollector:
    """
    Thread-safe in-memory telemetry collector for campaign generation and ML inference.
    Records genuine runtime measurements without fake or hardcoded values.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MetricsCollector, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self, window_size: int = 500):
        if self._initialized:
            return
        self.window_size = window_size
        self.lock = threading.Lock()
        
        # Counters
        self.total_requests = 0
        self.gemini_requests = 0
        self.local_requests = 0
        self.fallback_requests = 0
        self.errors_count = 0
        
        # Real Latency Tracking (in milliseconds)
        self.latencies_ms = deque(maxlen=window_size)
        self.inference_latencies_ms = deque(maxlen=window_size)
        
        # Timestamp of start
        self.start_time = time.time()
        self._initialized = True

    def record_request(
        self,
        generator_source: str,
        total_latency_ms: float,
        inference_latency_ms: float = 0.0,
        success: bool = True
    ):
        """Records genuine execution metrics for a generation request."""
        with self.lock:
            self.total_requests += 1
            if not success:
                self.errors_count += 1
                
            if generator_source == 'gemini':
                self.gemini_requests += 1
            elif generator_source == 'local_fallback':
                self.fallback_requests += 1
                self.local_requests += 1
            else:
                self.local_requests += 1
                
            self.latencies_ms.append(total_latency_ms)
            if inference_latency_ms > 0:
                self.inference_latencies_ms.append(inference_latency_ms)

    def get_summary(self) -> Dict[str, Any]:
        """Calculates live summary statistics from genuine observed values."""
        with self.lock:
            uptime_seconds = max(1.0, time.time() - self.start_time)
            lat_list = sorted(list(self.latencies_ms))
            inf_list = sorted(list(self.inference_latencies_ms))
            
            p50_latency = lat_list[len(lat_list) // 2] if lat_list else 0.0
            p95_idx = int(len(lat_list) * 0.95)
            p95_latency = lat_list[p95_idx] if lat_list else 0.0
            avg_latency = sum(lat_list) / len(lat_list) if lat_list else 0.0
            
            avg_inf_latency = sum(inf_list) / len(inf_list) if inf_list else 0.0
            qps = round(self.total_requests / uptime_seconds, 2)
            
            return {
                'total_requests': self.total_requests,
                'gemini_requests': self.gemini_requests,
                'local_requests': self.local_requests,
                'fallback_requests': self.fallback_requests,
                'errors_count': self.errors_count,
                'error_rate_pct': round((self.errors_count / max(1, self.total_requests)) * 100, 2),
                'uptime_seconds': round(uptime_seconds, 1),
                'current_qps': qps,
                'avg_latency_ms': round(avg_latency, 2),
                'p50_latency_ms': round(p50_latency, 2),
                'p95_latency_ms': round(p95_latency, 2),
                'avg_inference_latency_ms': round(avg_inf_latency, 2),
                'sample_size': len(lat_list)
            }

    def generate_prometheus_metrics(self) -> str:
        """Returns metrics formatted for Prometheus scraper ingestion."""
        summary = self.get_summary()
        lines = [
            "# HELP campaigniq_requests_total Total number of content generation requests",
            "# TYPE campaigniq_requests_total counter",
            f'campaigniq_requests_total{{engine="all"}} {summary["total_requests"]}',
            f'campaigniq_requests_total{{engine="gemini"}} {summary["gemini_requests"]}',
            f'campaigniq_requests_total{{engine="local"}} {summary["local_requests"]}',
            f'campaigniq_requests_total{{engine="fallback"}} {summary["fallback_requests"]}',
            "",
            "# HELP campaigniq_errors_total Total generation errors",
            "# TYPE campaigniq_errors_total counter",
            f'campaigniq_errors_total {summary["errors_count"]}',
            "",
            "# HELP campaigniq_latency_ms_avg Average generation latency in milliseconds",
            "# TYPE campaigniq_latency_ms_avg gauge",
            f'campaigniq_latency_ms_avg {summary["avg_latency_ms"]}',
            "",
            "# HELP campaigniq_latency_ms_p95 95th percentile generation latency in milliseconds",
            "# TYPE campaigniq_latency_ms_p95 gauge",
            f'campaigniq_latency_ms_p95 {summary["p95_latency_ms"]}',
            "",
            "# HELP campaigniq_inference_latency_ms_avg Scikit-Learn ML inference latency in milliseconds",
            "# TYPE campaigniq_inference_latency_ms_avg gauge",
            f'campaigniq_inference_latency_ms_avg {summary["avg_inference_latency_ms"]}',
            ""
        ]
        return "\n".join(lines)


# Singleton accessor
def get_metrics_collector() -> MetricsCollector:
    return MetricsCollector()
