"""
Gemini Service Module
Provides optional, decoupled Gemini API integration for generative marketing copy
and grounded web search using the official google-genai Python SDK.
Fails gracefully if GEMINI_API_KEY is not configured.
Never exposes, logs, or returns API credentials.
"""

import os
import re
import json
from typing import Dict, Any, Optional

# Load environment variables if python-dotenv is present
try:
    from dotenv import load_dotenv
    # Load from local .env or user home .env if present
    load_dotenv()
    home_env = os.path.expanduser("~/.env")
    if os.path.exists(home_env):
        load_dotenv(home_env)
except ImportError:
    pass

# Try importing official google-genai SDK
try:
    from google import genai
    from google.genai import types
    GENAI_SDK_AVAILABLE = True
except ImportError:
    GENAI_SDK_AVAILABLE = False


def _scrub_credentials(text: str) -> str:
    """Removes any potential API key patterns or credential fragments from error strings."""
    if not text:
        return ""
    # Redact standard Google API Key formats (e.g. AIzaSy...)
    scrubbed = re.sub(r'AIza[0-9A-Za-z-_]{35}', '[REDACTED_API_KEY]', text)
    # Redact any generic key assignments
    scrubbed = re.sub(r'(api[_-]?key[\s:=]+)[\w-]+', r'\1[REDACTED_KEY]', scrubbed, flags=re.IGNORECASE)
    return scrubbed


def is_gemini_configured() -> bool:
    """
    Checks whether the Gemini integration is operational:
    1. The google-genai SDK must be installed.
    2. GEMINI_API_KEY must be present in the environment and non-empty.
    Never returns or logs the secret key.
    """
    if not GENAI_SDK_AVAILABLE:
        return False
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    return len(key) > 5


def get_gemini_status() -> str:
    """
    Returns only a safe status string: 'Gemini configured' or 'Gemini not configured'.
    Strictly avoids displaying credentials or sensitive environment data.
    """
    if is_gemini_configured():
        return "Gemini configured"
    return "Gemini not configured"


def _get_client() -> Optional[Any]:
    """Internal helper to obtain a GenAI Client instance safely."""
    if not is_gemini_configured():
        return None
    try:
        # Client automatically reads GEMINI_API_KEY from environment
        return genai.Client()
    except Exception:
        return None


def generate_gemini_marketing_copy(
    product_name: str,
    category: str,
    discounted_price: float,
    actual_price: float,
    discount_percentage: float,
    product_features: str,
    tone: str,
    target_audience: str,
    channel: str,
    model_name: str = "gemini-2.5-flash",
    enable_grounding: bool = False
) -> Dict[str, Any]:
    """
    Generates tailored marketing copy using Gemini API.
    Fails gracefully if unconfigured or if an API exception occurs.
    
    Returns:
        dict with keys:
            - success: bool
            - headline: str
            - copy: str
            - cta: str
            - error: Optional[str] (scrubbed of any credentials)
            - source: 'gemini' or 'unconfigured'
    """
    if not is_gemini_configured():
        return {
            "success": False,
            "headline": "",
            "copy": "",
            "cta": "",
            "error": "Gemini not configured. Set GEMINI_API_KEY in your environment or .env file.",
            "source": "unconfigured"
        }

    client = _get_client()
    if client is None:
        return {
            "success": False,
            "headline": "",
            "copy": "",
            "cta": "",
            "error": "Failed to initialize Gemini client.",
            "source": "unconfigured"
        }

    prompt = f"""You are an elite marketing copywriter and conversion optimization expert.
Create high-converting, tailored marketing copy for the following e-commerce product:

Product Name: {product_name}
Category: {category}
Current Discounted Price: ₹{int(discounted_price)}
Original MSRP: ₹{int(actual_price)}
Discount: {int(discount_percentage)}% OFF
Key Features: {product_features}

Marketing Strategy Constraints:
- Tone: {tone}
- Target Audience Persona: {target_audience}
- Campaign Channel: {channel}

Output Requirements:
Provide your response strictly in valid JSON format with the following 3 fields:
{{
    "headline": "A punchy, channel-appropriate headline or subject line",
    "copy": "Engaging, conversion-focused body copy strictly tailored to the channel length constraints and audience",
    "cta": "A clear, compelling action-oriented Call-to-Action"
}}
Do NOT include markdown code fences or conversational text outside the JSON.
"""

    try:
        # Configure search grounding if requested
        config_kwargs: Dict[str, Any] = {
            "temperature": 0.7,
        }
        if enable_grounding:
            try:
                config_kwargs["tools"] = [types.Tool(google_search=types.GoogleSearch())]
            except Exception:
                pass  # Fall back to ungrounded if tool is unavailable in tier

        config = types.GenerateContentConfig(**config_kwargs) if config_kwargs else None
        
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config
        )

        raw_text = response.text.strip()
        # Clean json backticks if present
        raw_text = re.sub(r'^```json\s*', '', raw_text)
        raw_text = re.sub(r'^```\s*', '', raw_text)
        raw_text = re.sub(r'\s*```$', '', raw_text)

        parsed = json.loads(raw_text)
        
        # Safely extract genuine grounding sources if present
        grounding_sources = []
        if enable_grounding:
            try:
                candidate = response.candidates[0] if getattr(response, "candidates", None) else None
                if candidate and hasattr(candidate, "grounding_metadata") and candidate.grounding_metadata:
                    gm = candidate.grounding_metadata
                    chunks = getattr(gm, "grounding_chunks", []) or []
                    for c in chunks:
                        web = getattr(c, "web", None)
                        if web:
                            title = getattr(web, "title", "") or ""
                            uri = getattr(web, "uri", "") or ""
                            if uri:
                                grounding_sources.append({"title": title or uri, "url": uri})
            except Exception:
                pass

        return {
            "success": True,
            "headline": parsed.get("headline", f"Special Offer on {product_name}"),
            "copy": parsed.get("copy", ""),
            "cta": parsed.get("cta", "Shop Now"),
            "grounding_sources": grounding_sources,
            "grounding_used": enable_grounding,
            "error": None,
            "source": "gemini"
        }
    except Exception as e:
        safe_error = _scrub_credentials(str(e))
        return {
            "success": False,
            "headline": "",
            "copy": "",
            "cta": "",
            "error": f"Gemini generation error: {safe_error}",
            "source": "gemini"
        }
