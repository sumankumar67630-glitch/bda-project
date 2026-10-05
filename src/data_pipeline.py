"""
Data Pipeline Module for Marketing Campaign Data Processing & Log Synthesis.
Cleans raw Amazon catalog and generates large-scale marketing campaign & feedback logs
modeling realistic consumer feedback behavior, tone alignment, and marketing performance.
"""

import os
import re
import random
import datetime
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List

from src.feature_engineering import extract_nlp_features, compute_channel_fit_penalty

# Seed for reproducibility
random.seed(42)
np.random.seed(42)

# Dimension definitions
TONES = [
    'Urgent & Scarcity-Driven',
    'Playful & Witty',
    'Professional & Authoritative',
    'Luxury & Premium',
    'Empathetic & Problem-Solving',
    'Bold & Promotional'
]

AUDIENCES = [
    'Budget Shoppers & Deal Seekers',
    'Tech Enthusiasts & Power Users',
    'Busy Working Professionals',
    'College Students & Gen Z',
    'Home & Family Managers',
    'Fitness & Lifestyle Enthusiasts'
]

CHANNELS = [
    'Email Newsletter',
    'Instagram / Facebook Feed Ad',
    'Amazon Sponsored Ad',
    'Google Search Ad',
    'SMS / WhatsApp Alert'
]

HEADLINE_TEMPLATES = {
    'Urgent & Scarcity-Driven': [
        "🚨 Flash Deal: Grab {product} Before Stock Runs Out!",
        "⚡ Ending Tonight: Massive Discount on {product}!",
        "Hurry! Exclusive Price Drop on {product} — Only Hours Left",
        "Don't Miss Out: {discount}% Off {product} Today Only!"
    ],
    'Playful & Witty': [
        "Upgrade Your Life Without Emptying Your Wallet: Meet {product} ✨",
        "Tired of cables that give up faster than your New Year resolutions? Try {product} 😉",
        "Say Hello to Your New Favorite Gadget: {product} 🎉",
        "Warning: Owning {product} May Cause Extreme Satisfaction 🚀"
    ],
    'Professional & Authoritative': [
        "Engineered for Peak Performance: The All-New {product}",
        "Reliability Meets Innovation: Advanced Specs of {product}",
        "The Enterprise Standard: High-Durability {product} for Professionals",
        "Precision Crafted: Discover Unmatched Quality with {product}"
    ],
    'Luxury & Premium': [
        "Elegance in Every Detail: The Signature {product}",
        "Indulge in Superior Craftsmanship with {product}",
        "Redefining Luxury and Technology: The Exclusive {product}",
        "The Art of Refinement: Experience Pure Prestige with {product}"
    ],
    'Empathetic & Problem-Solving': [
        "Finally, an Everyday Solution: Why You'll Love {product}",
        "Make Your Busy Days Easier with {product}",
        "No More Daily Hassles: How {product} Solves Your Everyday Frustrations",
        "Designed with Your Comfort in Mind: The Thoughtful {product}"
    ],
    'Bold & Promotional': [
        "🔥 MEGA SALE: Up to {discount}% OFF on {product}!",
        "Unbeatable Price Alert: Get {product} for Just ₹{price}!",
        "Huge Savings Event: Premium {product} at an Incredible Price!",
        "Top Rated & Heavily Discounted: Shop {product} Now!"
    ]
}

COPY_TEMPLATES = {
    'Urgent & Scarcity-Driven': (
        "Time is ticking on our biggest discount yet! The {product} is flying off the shelves. "
        "With top-tier features like {features}, you get unmatched reliability at an insane price. "
        "Normally priced at ₹{actual_price}, you can lock in your order right now for just ₹{price} ({discount}% OFF). "
        "Hurry, inventory is strictly limited!"
    ),
    'Playful & Witty': (
        "Why settle for mediocre when you can level up your day with {product}? 😎 "
        "Packed with awesome perks like {features}, this little gem is ready to make your routine 10x cooler. "
        "Grab yours today for ₹{price} (that's a juicy {discount}% off regular price)! "
        "Your future self will definitely thank you."
    ),
    'Professional & Authoritative': (
        "Built for demanding workflows and certified durability, {product} delivers seamless reliability. "
        "Key engineering specifications include {features}. "
        "Available today at ₹{price} (MSRP ₹{actual_price}, reflecting a {discount}% corporate advantage). "
        "Designed to ensure uninterrupted productivity and long-term durability."
    ),
    'Luxury & Premium': (
        "Immerse yourself in superior design and refined engineering with {product}. "
        "Artfully constructed with premium materials and showcasing {features}, this piece complements a sophisticated lifestyle. "
        "Exclusively curated at ₹{price} (complimentary value against standard ₹{actual_price}). "
        "Elevate your everyday standard."
    ),
    'Empathetic & Problem-Solving': (
        "We know how frustrating it is when products wear out or let you down when you need them most. "
        "That's why {product} was designed with hassle-free {features}. "
        "Enjoy total peace of mind every single day, now available for only ₹{price} with {discount}% savings. "
        "Experience convenience you can count on."
    ),
    'Bold & Promotional': (
        "MASSIVE SAVINGS ALERT! Upgrade today with the highest value deal on {product}. "
        "Enjoy premium benefits: {features}. Save big with an extraordinary {discount}% discount—down from ₹{actual_price} to just ₹{price}! "
        "Unrivaled value backed by thousands of verified reviews. Don't wait!"
    )
}

CTA_TEMPLATES = {
    'Urgent & Scarcity-Driven': ["Claim Deal Before It Ends ⚡", "Lock In Discount Now", "Shop Flash Sale ⏳"],
    'Playful & Witty': ["Treat Yourself Today 🎉", "Grab Yours Now 🚀", "See Why Everyone Loves It ✨"],
    'Professional & Authoritative': ["Explore Technical Specs", "Order Professional Unit", "Upgrade Your Setup Today"],
    'Luxury & Premium': ["Discover the Collection", "Acquire Yours Now", "Experience Distinction"],
    'Empathetic & Problem-Solving': ["Make Life Easier Today", "Get Yours with Confidence", "Try It Risk-Free Today"],
    'Bold & Promotional': ["Get {discount}% Off Now 🔥", "Shop Big Deals Today", "Buy Now at ₹{price}"]
}


def clean_amazon_catalog(raw_csv_path: str, output_csv_path: str, output_parquet_path: str) -> pd.DataFrame:
    """
    Cleans raw Amazon dataset and structures product information.
    """
    df = pd.read_csv(raw_csv_path)
    
    # 1. Clean Prices
    df['discounted_price_num'] = (
        df['discounted_price']
        .astype(str)
        .str.replace('₹', '', regex=False)
        .str.replace(',', '', regex=False)
        .str.strip()
    )
    df['discounted_price_num'] = pd.to_numeric(df['discounted_price_num'], errors='coerce')
    
    df['actual_price_num'] = (
        df['actual_price']
        .astype(str)
        .str.replace('₹', '', regex=False)
        .str.replace(',', '', regex=False)
        .str.strip()
    )
    df['actual_price_num'] = pd.to_numeric(df['actual_price_num'], errors='coerce')
    
    # 2. Clean Discount Percentage
    df['discount_percentage_num'] = (
        df['discount_percentage']
        .astype(str)
        .str.replace('%', '', regex=False)
        .str.strip()
    )
    df['discount_percentage_num'] = pd.to_numeric(df['discount_percentage_num'], errors='coerce')
    
    # Fill missing discount if prices exist
    mask_calc_disc = df['discount_percentage_num'].isna() & (df['actual_price_num'] > 0)
    df.loc[mask_calc_disc, 'discount_percentage_num'] = (
        (df.loc[mask_calc_disc, 'actual_price_num'] - df.loc[mask_calc_disc, 'discounted_price_num']) 
        / df.loc[mask_calc_disc, 'actual_price_num'] * 100
    ).round(0)
    
    # 3. Clean Rating
    df['rating_clean'] = pd.to_numeric(df['rating'].replace('|', None), errors='coerce')
    rating_median = df['rating_clean'].median()
    df['rating_clean'] = df['rating_clean'].fillna(rating_median)
    
    # 4. Clean Rating Count
    df['rating_count_clean'] = (
        df['rating_count']
        .astype(str)
        .str.replace(',', '', regex=False)
        .str.strip()
    )
    df['rating_count_clean'] = pd.to_numeric(df['rating_count_clean'], errors='coerce')
    count_median = df['rating_count_clean'].median()
    df['rating_count_clean'] = df['rating_count_clean'].fillna(count_median).astype(int)
    
    # 5. Extract Category Hierarchy
    df['main_category'] = df['category'].apply(
        lambda x: str(x).split('|')[0].strip() if pd.notnull(x) and '|' in str(x) else str(x)
    )
    df['sub_category'] = df['category'].apply(
        lambda x: str(x).split('|')[1].strip() if pd.notnull(x) and len(str(x).split('|')) > 1 else 'General'
    )
    
    # 6. Extract clean product features from about_product
    def clean_features(about: str) -> str:
        if pd.isna(about):
            return "high quality, durable design, verified performance"
        bullets = [b.strip() for b in str(about).split('|') if len(b.strip()) > 10]
        if bullets:
            return ", ".join(bullets[:2])[:120]
        return str(about)[:100]
        
    df['clean_features'] = df['about_product'].apply(clean_features)
    
    # Short readable product title
    def clean_name(title: str) -> str:
        title = re.sub(r'\s*\([^)]*\)', '', str(title))
        parts = title.split(',')
        return parts[0].strip()[:65]
        
    df['short_name'] = df['product_name'].apply(clean_name)
    
    # Drop rows without valid price
    df = df.dropna(subset=['discounted_price_num', 'actual_price_num']).copy()
    
    # Save cleaned catalog
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    df.to_csv(output_csv_path, index=False)
    df.to_parquet(output_parquet_path, index=False)
    
    return df


def generate_campaign_feedback_dataset(
    cleaned_df: pd.DataFrame, 
    num_samples: int = 6000,
    output_csv_path: str = "data/campaign_feedback_logs.csv",
    output_parquet_path: str = "data/campaign_feedback_logs.parquet"
) -> pd.DataFrame:
    """
    Generates large-scale marketing campaign logs and authentic human feedback signals
    simulating the Big Data Marketing Campaign system.
    """
    records = []
    products = cleaned_df.to_dict('records')
    num_products = len(products)
    
    # Start date 90 days ago for realistic time series
    base_time = datetime.datetime.now() - datetime.timedelta(days=90)
    
    for i in range(num_samples):
        prod = products[i % num_products] if i < num_products else random.choice(products)
        
        tone = random.choice(TONES)
        audience = random.choice(AUDIENCES)
        channel = random.choice(CHANNELS)
        
        p_name = prod['short_name']
        price = int(prod['discounted_price_num'])
        actual_price = int(prod['actual_price_num'])
        discount = int(prod['discount_percentage_num'])
        features = prod['clean_features']
        category = prod['main_category']
        
        # 1. Generate Content
        headline_tmpl = random.choice(HEADLINE_TEMPLATES[tone])
        headline = headline_tmpl.format(
            product=p_name,
            discount=discount,
            price=price,
            actual_price=actual_price
        )
        
        copy_tmpl = COPY_TEMPLATES[tone]
        copy = copy_tmpl.format(
            product=p_name,
            features=features,
            price=price,
            actual_price=actual_price,
            discount=discount
        )
        
        cta_tmpl = random.choice(CTA_TEMPLATES[tone])
        cta = cta_tmpl.format(discount=discount, price=price)
        
        # Truncate or tailor for channel constraints in 20% cases to simulate variation
        if channel == 'SMS / WhatsApp Alert' and random.random() < 0.6:
            copy = f"{p_name}: ₹{price} ({discount}% OFF). {features[:40]}... {cta}"
        elif channel == 'Google Search Ad' and random.random() < 0.6:
            copy = f"Buy {p_name} Online - Save {discount}%. Reliable Quality & Fast Delivery. Order Now!"
            
        # 2. Extract NLP Metrics
        nlp_signals = extract_nlp_features(copy, headline, cta)
        channel_penalty = compute_channel_fit_penalty(channel, nlp_signals['word_count'])
        
        # 3. Probabilistic Marketing Alignment Engine (Calculating Approval Probability)
        # Base approval rate ~ 68%
        prob = 0.68
        
        # (A) Price & Tone Congruency
        if price < 500 and tone == 'Luxury & Premium':
            prob -= 0.35  # Luxury tone on ultra-cheap commodity is jarring
        elif price > 5000 and tone == 'Urgent & Scarcity-Driven' and discount < 15:
            prob -= 0.25  # High ticket with false urgency and low discount feels scammy
        elif price < 1000 and discount >= 50 and tone in ['Urgent & Scarcity-Driven', 'Bold & Promotional']:
            prob += 0.15  # Budget deals with promotional urgency perform very well
            
        # (B) Audience Congruency
        if audience == 'Budget Shoppers & Deal Seekers':
            if nlp_signals['has_discount_callout']:
                prob += 0.14
            else:
                prob -= 0.20
            if tone == 'Luxury & Premium':
                prob -= 0.22
                
        elif audience == 'Tech Enthusiasts & Power Users':
            if nlp_signals['spec_density'] > 0.15:
                prob += 0.16
            else:
                prob -= 0.18
            if tone == 'Playful & Witty' and category == 'Computers&Accessories':
                prob -= 0.12  # Prefers technical precision over humor
                
        elif audience == 'College Students & Gen Z':
            if tone == 'Playful & Witty' or nlp_signals['has_emoji']:
                prob += 0.16
            if tone == 'Professional & Authoritative':
                prob -= 0.15  # Too stiff
                
        elif audience == 'Busy Working Professionals':
            if tone == 'Professional & Authoritative' or tone == 'Empathetic & Problem-Solving':
                prob += 0.14
            if nlp_signals['word_count'] > 90:
                prob -= 0.15  # No time to read long paragraphs
                
        elif audience == 'Home & Family Managers':
            if tone == 'Empathetic & Problem-Solving':
                prob += 0.18
            if tone == 'Urgent & Scarcity-Driven':
                prob -= 0.12
                
        # (C) Channel Fit
        prob -= (channel_penalty * 0.28)
        
        # (D) Linguistic Polish
        if nlp_signals['reading_ease'] >= 65:
            prob += 0.08
        elif nlp_signals['reading_ease'] < 40:
            prob -= 0.15
            
        if not nlp_signals['has_cta']:
            prob -= 0.20
            
        if nlp_signals['sentiment_score'] > 0.2:
            prob += 0.06
        elif nlp_signals['sentiment_score'] < 0.0:
            prob -= 0.20
            
        # Clip probability
        approval_prob = max(0.05, min(0.95, prob))
        
        # 4. Generate Feedback Rating (Thumbs Up / Down)
        is_thumbs_up = 1 if random.random() < approval_prob else 0
        
        # 5. Deterministic Reason Code Assignment
        if is_thumbs_up == 1:
            if nlp_signals['has_discount_callout'] and discount > 40:
                reason = "Strong Value Proposition & High Savings Callout"
            elif audience == 'Tech Enthusiasts & Power Users' and nlp_signals['spec_density'] > 0.15:
                reason = "Clear Technical Specs & Value Accuracy"
            elif tone in ['Playful & Witty', 'Empathetic & Problem-Solving']:
                reason = "Engaging Emotional Hook & Tone Alignment"
            elif channel_penalty == 0 and nlp_signals['reading_ease'] > 60:
                reason = "Punchy, Clear & Ideal Channel Length"
            else:
                reason = "High Engagement & Clear Call-to-Action"
        else:
            # Diagnose specific failure cause
            if channel_penalty > 0.4:
                reason = "Copy Too Wordy & Cluttered for Channel"
            elif price < 500 and tone == 'Luxury & Premium':
                reason = "Mismatched Price & Tone (Overly Pretentious for Commodity)"
            elif audience == 'Tech Enthusiasts & Power Users' and nlp_signals['spec_density'] <= 0.05:
                reason = "Lacks Product Features / Technical Specifics"
            elif audience == 'Budget Shoppers & Deal Seekers' and not nlp_signals['has_discount_callout']:
                reason = "Missing Clear Discount / Value Offer"
            elif tone == 'Urgent & Scarcity-Driven' and discount < 20:
                reason = "Tone Too Aggressive / Artificial Urgency"
            elif nlp_signals['reading_ease'] < 45:
                reason = "Poor Readability & Complex Phrasing"
            elif not nlp_signals['has_cta']:
                reason = "Weak or Absent Call-to-Action"
            else:
                reason = "Misaligned with Target Audience Intent"
                
        # 6. Secondary Engagement Metrics (CTR, CVR, Latency)
        base_ctr = 3.2 if is_thumbs_up else 1.1
        ctr = round(max(0.2, np.random.normal(base_ctr + (discount / 30.0), 0.8)), 2)
        cvr = round(max(0.1, ctr * (0.35 if is_thumbs_up else 0.12)), 2)
        latency_ms = int(np.random.normal(850, 180))
        timestamp = base_time + datetime.timedelta(
            minutes=int((i / num_samples) * 90 * 24 * 60) + random.randint(0, 30)
        )
        
        record = {
            'campaign_id': f"CMP-{100000 + i}",
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'product_id': prod['product_id'],
            'product_name': p_name,
            'category': category,
            'sub_category': prod['sub_category'],
            'discounted_price': price,
            'actual_price': actual_price,
            'discount_percentage': discount,
            'product_rating': prod['rating_clean'],
            'rating_count': prod['rating_count_clean'],
            'input_tone': tone,
            'input_target_audience': audience,
            'channel': channel,
            'generated_headline': headline,
            'generated_copy': copy,
            'generated_cta': cta,
            'feedback_rating': is_thumbs_up,
            'feedback_label': 'Thumbs Up' if is_thumbs_up else 'Thumbs Down',
            'feedback_reason': reason,
            'click_through_rate': ctr,
            'conversion_rate': cvr,
            'latency_ms': latency_ms,
            'channel_fit_penalty': round(channel_penalty, 3),
            **nlp_signals
        }
        records.append(record)
        
    df_campaigns = pd.DataFrame(records)
    
    # Save dataset
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    df_campaigns.to_csv(output_csv_path, index=False)
    df_campaigns.to_parquet(output_parquet_path, index=False)
    
    return df_campaigns


if __name__ == '__main__':
    raw_path = "amazon.csv"
    clean_csv = "data/amazon_cleaned.csv"
    clean_parquet = "data/amazon_cleaned.parquet"
    
    campaign_csv = "data/campaign_feedback_logs.csv"
    campaign_parquet = "data/campaign_feedback_logs.parquet"
    
    print("Processing and cleaning raw Amazon catalog...")
    cleaned_df = clean_amazon_catalog(raw_path, clean_csv, clean_parquet)
    print(f"Cleaned catalog ready: {len(cleaned_df)} products.")
    
    print("Generating large-scale marketing campaign & feedback logs...")
    campaign_df = generate_campaign_feedback_dataset(
        cleaned_df, 
        num_samples=6500,
        output_csv_path=campaign_csv,
        output_parquet_path=campaign_parquet
    )
    print(f"Generated {len(campaign_df)} campaign logs.")
    print("Feedback Distribution:\n", campaign_df['feedback_label'].value_counts(normalize=True))
