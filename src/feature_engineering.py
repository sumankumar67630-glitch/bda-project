"""
Feature Engineering Module for Marketing Content Analytics
Extracts linguistic, sentiment, readability, and marketing-specific signals
from raw marketing copy and product metadata.
"""

import re
import math
from typing import Dict, Any, List

# Lexicons for Sentiment and Marketing Drivers
POSITIVE_WORDS = {
    'best', 'great', 'amazing', 'perfect', 'superior', 'premium', 'unbreakable',
    'fast', 'durable', 'unbeatable', 'reliable', 'sturdy', 'powerful', 'love',
    'excellent', 'flawlessly', 'smart', 'superb', 'efficient', 'smooth',
    'effortless', 'top-notch', 'exceptional', 'delight', 'ultimate', 'crystal',
    'sleek', 'portable', 'rapid', 'safe', 'innovative', 'ultra', 'tough',
    'satisfaction', 'guarantee', 'magic', 'ideal', 'boost', 'upgrade', 'save'
}

NEGATIVE_WORDS = {
    'slow', 'cheap', 'fragile', 'poor', 'worst', 'broken', 'issue', 'bad',
    'loose', 'delay', 'difficult', 'struggle', 'cluttered', 'noisy', 'expensive',
    'defect', 'fail', 'boring', 'weak', 'inferior', 'terrible', 'annoying'
}

URGENCY_WORDS = {
    'hurry', 'limited', 'now', 'today', 'instant', 'exclusive', 'fast', 'quick',
    'flash', 'rush', 'last chance', 'clock', 'ending', 'don\'t miss', 'act now',
    'grab', 'while supplies last', 'only', 'final'
}

CTA_VERBS = {
    'get', 'buy', 'shop', 'grab', 'claim', 'order', 'upgrade', 'discover',
    'save', 'check', 'try', 'experience', 'unlock', 'boost', 'start', 'join'
}

SPEC_KEYWORDS = {
    'w', 'watt', 'mbps', 'gb', 'tb', '4k', 'hz', 'mah', 'meter', 'pin', 'usb',
    'c-type', 'type-c', 'bluetooth', 'hdmi', 'oled', 'led', 'android', 'ios',
    'braided', 'nylon', 'aluminum', 'copper', 'shielding', 'pvc', 'cord'
}


def count_syllables(word: str) -> int:
    """Estimates the number of syllables in a word."""
    word = word.lower().strip()
    if not word:
        return 1
    # Remove trailing 'e' except 'le'
    if word.endswith('e') and not word.endswith('le') and len(word) > 2:
        word = word[:-1]
    # Count vowel transitions
    vowels = "aeiouy"
    count = 0
    prev_is_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_is_vowel:
            count += 1
        prev_is_vowel = is_vowel
    return max(1, count)


def extract_nlp_features(text: str, headline: str = "", cta: str = "") -> Dict[str, Any]:
    """
    Extracts comprehensive NLP and linguistic signals from marketing text.
    """
    full_text = f"{headline} {text} {cta}".strip()
    clean_text = re.sub(r'[^a-zA-Z0-9\s]', ' ', full_text).lower()
    words = clean_text.split()
    total_words = len(words)
    
    # Sentence splitting
    sentences = [s.strip() for s in re.split(r'[.!?]+', full_text) if s.strip()]
    total_sentences = max(1, len(sentences))
    
    # Syllables
    total_syllables = sum(count_syllables(w) for w in words) if words else 1
    
    # 1. Readability: Flesch Reading Ease
    if total_words > 0:
        words_per_sentence = total_words / total_sentences
        syllables_per_word = total_syllables / total_words
        flesch_reading_ease = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
        flesch_reading_ease = max(0.0, min(100.0, flesch_reading_ease))
    else:
        flesch_reading_ease = 60.0
        
    # 2. Sentiment Polarity
    pos_count = sum(1 for w in words if w in POSITIVE_WORDS)
    neg_count = sum(1 for w in words if w in NEGATIVE_WORDS)
    sentiment_score = (pos_count - neg_count) / max(1, (pos_count + neg_count + 5))
    sentiment_score = round(max(-1.0, min(1.0, sentiment_score * 2.5)), 3)
    
    # 3. Urgency Intensity
    urgency_hits = sum(1 for w in words if w in URGENCY_WORDS)
    has_urgency = 1 if urgency_hits > 0 else 0
    urgency_intensity = min(1.0, urgency_hits / max(1, total_words * 0.15))
    
    # 4. Call-to-Action Presence
    cta_words = re.sub(r'[^a-zA-Z\s]', ' ', cta).lower().split()
    has_cta = 1 if any(w in CTA_VERBS for w in cta_words) or any(w in CTA_VERBS for w in words) else 0
    
    # 5. Discount Mention
    has_discount_callout = 1 if re.search(r'(\d+%\s*off|save\s*₹?\d+|discount|deal|offer|price drop)', full_text, re.IGNORECASE) else 0
    
    # 6. Technical Specifications Density
    spec_hits = sum(1 for w in words if w in SPEC_KEYWORDS)
    spec_density = min(1.0, spec_hits / max(1, total_words * 0.2))
    
    # 7. Stylistic & Emotional Markers
    emoji_count = len(re.findall(r'[\U00010000-\U0010ffff]', full_text))
    has_emoji = 1 if emoji_count > 0 else 0
    exclamation_count = full_text.count('!')
    question_count = full_text.count('?')
    
    # 8. Lexical Diversity (Type-Token Ratio)
    unique_words = len(set(words))
    lexical_diversity = round(unique_words / max(1, total_words), 3) if total_words > 0 else 1.0

    return {
        'char_count': len(full_text),
        'word_count': total_words,
        'sentence_count': total_sentences,
        'reading_ease': round(flesch_reading_ease, 2),
        'sentiment_score': sentiment_score,
        'has_urgency': has_urgency,
        'urgency_intensity': round(urgency_intensity, 3),
        'has_cta': has_cta,
        'has_discount_callout': has_discount_callout,
        'spec_density': round(spec_density, 3),
        'emoji_count': emoji_count,
        'has_emoji': has_emoji,
        'exclamation_count': exclamation_count,
        'question_count': question_count,
        'lexical_diversity': lexical_diversity
    }


def compute_channel_fit_penalty(channel: str, word_count: int) -> float:
    """
    Computes penalty if copy length diverges significantly from channel optimal range.
    Returns value between 0.0 (perfect fit) and 1.0 (severe mismatch).
    """
    ideal_ranges = {
        'SMS / WhatsApp Alert': (10, 35),
        'Google Search Ad': (15, 45),
        'Instagram / Facebook Feed Ad': (25, 75),
        'Amazon Sponsored Ad': (20, 60),
        'Email Newsletter': (50, 150)
    }
    low, high = ideal_ranges.get(channel, (20, 80))
    if low <= word_count <= high:
        return 0.0
    elif word_count < low:
        return min(1.0, (low - word_count) / low)
    else:
        return min(1.0, (word_count - high) / high)
