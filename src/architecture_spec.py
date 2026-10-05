"""
System Architecture & Scalability Specification
Provides technical blueprints, distributed data pipeline designs, and mathematical
cost & throughput modeling for scaling Automated Content Generation to enterprise scale.
"""

from typing import Dict, Any

MERMAID_ARCHITECTURE_DIAGRAM = """
flowchart TB
    subgraph ClientLayer ["1. Client & Ingestion Layer"]
        UserUI["Web Dashboard / Campaign Studio"]
        PartnerAPI["Enterprise Partner APIs"]
        EventStream["E-commerce Catalog Sync (Amazon.csv)"]
    end

    subgraph MessagingLayer ["2. High-Throughput Distributed Messaging (Kafka)"]
        K1["Topic: campaign.generation.requests<br/>(Partitions: 32)"]
        K2["Topic: campaign.feedback.events<br/>('Thumbs Up/Down' Logs)"]
        K3["Dead Letter Queue (DLQ) & Telemetry"]
    end

    subgraph ComputeLayer ["3. Distributed Inference & Semantic Caching"]
        CacheRouter{"Semantic Cache Check<br/>(Cosine Sim >= 0.95)"}
        VectorDB[("Milvus / Qdrant<br/>Embedding Cache")]
        RayCluster["Ray Serve / Kubernetes Pods<br/>LLM Inference & Generation"]
        Scorer["Real-time Feature Extractor<br/>& Quality Scorer (Scikit-Learn)"]
    end

    subgraph LakehouseLayer ["4. Big Data Lakehouse & Stream Processing"]
        SparkStream["Apache Spark Structured Streaming<br/>/ Apache Flink Engine"]
        DeltaLake[("Apache Iceberg / Delta Lake<br/>S3 / GCS Data Lake")]
        FeatureStore[("Feast Feature Store<br/>(Product & Persona Signals)")]
    end

    subgraph OptimizationLayer ["5. Feedback Loop & Continuous Optimization"]
        FeedbackAgg["Feedback Aggregator & KPI Tracker"]
        DPOTrainer["Direct Preference Optimization (DPO)<br/>& Prompt Evolution Engine"]
        ModelRegistry[("MLflow Model Registry<br/>& Prompt Catalog")]
    end

    UserUI -->|Request| K1
    PartnerAPI -->|Request| K1
    EventStream -->|Catalog Sync| FeatureStore

    K1 --> CacheRouter
    CacheRouter -->|Cache Hit (15ms)| UserUI
    CacheRouter -->|Cache Miss| RayCluster
    RayCluster --> Scorer
    Scorer --> UserUI
    Scorer -->|Store Valid Copy| VectorDB

    UserUI -->|Feedback Log| K2
    K2 --> SparkStream
    SparkStream --> DeltaLake
    SparkStream --> FeatureStore
    SparkStream --> FeedbackAgg

    FeedbackAgg --> DPOTrainer
    DPOTrainer --> ModelRegistry
    ModelRegistry -->|Updated Prompts & Models| RayCluster
"""


def calculate_scaling_metrics(
    daily_requests: int = 100000,
    semantic_cache_hit_rate: float = 0.45,
    avg_tokens_per_request: int = 450,
    cost_per_1k_tokens_usd: float = 0.0015,
    avg_llm_latency_ms: int = 850,
    cache_latency_ms: int = 18
) -> Dict[str, Any]:
    """
    Computes mathematical scaling parameters for distributed deployment.
    """
    # Cache traffic split
    cached_requests = int(daily_requests * semantic_cache_hit_rate)
    uncached_requests = daily_requests - cached_requests
    
    # Token calculation
    total_tokens_without_cache = daily_requests * avg_tokens_per_request
    total_tokens_with_cache = uncached_requests * avg_tokens_per_request
    
    # Financial cost calculation
    daily_cost_without_cache = (total_tokens_without_cache / 1000) * cost_per_1k_tokens_usd
    daily_cost_with_cache = (total_tokens_with_cache / 1000) * cost_per_1k_tokens_usd
    daily_savings_usd = daily_cost_without_cache - daily_cost_with_cache
    annual_savings_usd = daily_savings_usd * 365
    
    # Latency calculation (P50 and blended average)
    blended_avg_latency_ms = (
        (cached_requests * cache_latency_ms) + (uncached_requests * avg_llm_latency_ms)
    ) / daily_requests
    
    # Kafka and Big Data storage throughput
    # Avg log size ~ 1.2 KB per campaign record + feedback
    daily_data_volume_mb = (daily_requests * 1.4) / 1024
    monthly_lakehouse_storage_gb = (daily_data_volume_mb * 30) / 1024
    
    # Peak traffic sizing (assume peak is 3.5x average QPS)
    avg_qps = daily_requests / (24 * 3600)
    peak_qps = avg_qps * 3.5
    recommended_kafka_partitions = max(8, int(peak_qps / 120) * 4)
    recommended_ray_nodes = max(2, int((peak_qps * (1 - semantic_cache_hit_rate)) / 15))

    return {
        'daily_requests': daily_requests,
        'cache_hit_rate_pct': round(semantic_cache_hit_rate * 100, 1),
        'daily_cost_without_cache_usd': round(daily_cost_without_cache, 2),
        'daily_cost_with_cache_usd': round(daily_cost_with_cache, 2),
        'daily_savings_usd': round(daily_savings_usd, 2),
        'annual_savings_usd': round(annual_savings_usd, 2),
        'cost_reduction_pct': round((1 - (daily_cost_with_cache / max(0.01, daily_cost_without_cache))) * 100, 1),
        'blended_avg_latency_ms': round(blended_avg_latency_ms, 1),
        'latency_improvement_pct': round(((avg_llm_latency_ms - blended_avg_latency_ms) / avg_llm_latency_ms) * 100, 1),
        'daily_data_volume_mb': round(daily_data_volume_mb, 2),
        'monthly_lakehouse_storage_gb': round(monthly_lakehouse_storage_gb, 2),
        'avg_qps': round(avg_qps, 2),
        'peak_qps': round(peak_qps, 2),
        'recommended_kafka_partitions': recommended_kafka_partitions,
        'recommended_inference_nodes': recommended_ray_nodes
    }
