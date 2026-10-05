/**
 * CampaignIQ Data Store & Model Artifacts
 * Authentic Amazon Catalog records, Scikit-Learn weights, benchmarks, and templates.
 */

const TONES = [
  'Urgent & Scarcity-Driven',
  'Playful & Witty',
  'Professional & Authoritative',
  'Luxury & Premium',
  'Empathetic & Problem-Solving',
  'Bold & Promotional'
];

const AUDIENCES = [
  'Budget Shoppers & Deal Seekers',
  'Tech Enthusiasts & Power Users',
  'Busy Working Professionals',
  'College Students & Gen Z',
  'Home & Family Managers',
  'Fitness & Lifestyle Enthusiasts'
];

const CHANNELS = [
  'Email Newsletter',
  'Instagram / Facebook Feed Ad',
  'Amazon Sponsored Ad',
  'Google Search Ad',
  'SMS / WhatsApp Alert'
];

const PRODUCTS = [
  {
    id: "prod-1",
    name: "Wayona Nylon Braided USB-C Cable (Fast Charging 3A, 480Mbps)",
    category: "Computers&Accessories",
    discounted_price: 299,
    actual_price: 599,
    discount_percentage: 50,
    rating: 4.2,
    features: "Durable braided nylon exterior, 3A fast charging, 480Mbps data sync, 20,000 bend lifespan, laser welded connectors."
  },
  {
    id: "prod-2",
    name: "boAt Deuce USB 300 2-in-1 Type-C & Micro USB Cable (1.5m)",
    category: "Computers&Accessories",
    discounted_price: 329,
    actual_price: 699,
    discount_percentage: 53,
    rating: 4.2,
    features: "Dual Type-C and Micro USB plugs, tangle-free exterior, aluminum alloy housing, 3A rapid sync, 2-year warranty."
  },
  {
    id: "prod-3",
    name: "Portronics Konnect L 1.2M 8-Pin Fast Charging Cable",
    category: "Computers&Accessories",
    discounted_price: 154,
    actual_price: 399,
    discount_percentage: 61,
    rating: 4.2,
    features: "TPE + Nylon reinforced cord, high speed data sync, ergonomic connector design, universal Apple device compatibility."
  },
  {
    id: "prod-4",
    name: "pTron Solero TB301 3A Type-C Fast Charging Cable (1.5M)",
    category: "Computers&Accessories",
    discounted_price: 149,
    actual_price: 1000,
    discount_percentage: 85,
    rating: 3.9,
    features: "Rough and tough double-braided nylon, aramid fiber core, 480Mbps sync, reversible Type-C, 5KG load tested."
  },
  {
    id: "prod-5",
    name: "Ambrane Unbreakable 60W / 3A Quick Charge 3.0 Cable",
    category: "Computers&Accessories",
    discounted_price: 199,
    actual_price: 299,
    discount_percentage: 33,
    rating: 4.0,
    features: "60W power delivery output, Quick Charge 3.0 supported, ultra-durable braided build, rugged interior bindings."
  },
  {
    id: "prod-6",
    name: "TP-Link N150 Nano Wireless USB WiFi Adapter",
    category: "Computers&Accessories",
    discounted_price: 499,
    actual_price: 999,
    discount_percentage: 50,
    rating: 4.2,
    features: "Speedy 150Mbps transmission, miniature nano footprint, advanced WPA2 encryption, instant plug-and-play setup."
  },
  {
    id: "prod-7",
    name: "SanDisk Ultra 128GB MicroSDXC UHS-I Memory Card (140MB/s)",
    category: "Electronics",
    discounted_price: 879,
    actual_price: 1800,
    discount_percentage: 51,
    rating: 4.4,
    features: "Up to 140MB/s read speed, A1-rated app performance, Full HD video recording, shockproof and temperature-proof."
  },
  {
    id: "prod-8",
    name: "Portronics My Buddy K Ergonomic Aluminum Laptop Stand",
    category: "OfficeProducts",
    discounted_price: 749,
    actual_price: 1999,
    discount_percentage: 63,
    rating: 4.3,
    features: "Aviation-grade aluminum alloy, 7 adjustable height levels, anti-skid silicone pads, efficient heat dissipation."
  }
];

const HEADLINE_TEMPLATES = {
  'Urgent & Scarcity-Driven': [
    "🚨 Flash Deal: Grab {product} Before Stock Runs Out!",
    "⚡ Ending Tonight: Massive Discount on {product}!",
    "Hurry! Exclusive Price Drop on {product} — Only Hours Left",
    "Don't Miss Out: {discount}% Off {product} Today Only!"
  ],
  'Playful & Witty': [
    "Upgrade Your Life Without Emptying Your Wallet: Meet {product} ✨",
    "Tired of gear that gives up faster than your New Year resolutions? Try {product} 😉",
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
};

const COPY_TEMPLATES = {
  'Urgent & Scarcity-Driven': 
    "Time is ticking on our biggest discount yet! The {product} is flying off the shelves. With top-tier features like {features}, you get unmatched reliability at an insane price. Normally priced at ₹{actual_price}, you can lock in your order right now for just ₹{price} ({discount}% OFF). Hurry, inventory is strictly limited!",

  'Playful & Witty': 
    "Why settle for mediocre when you can level up your day with {product}? 😎 Packed with awesome perks like {features}, this little gem is ready to make your routine 10x cooler. Grab yours today for ₹{price} (that's a juicy {discount}% off regular price)! Your future self will definitely thank you.",

  'Professional & Authoritative': 
    "Built for demanding workflows and certified durability, {product} delivers seamless reliability. Key engineering specifications include {features}. Available today at ₹{price} (MSRP ₹{actual_price}, reflecting a {discount}% corporate advantage). Designed to ensure uninterrupted productivity and long-term durability.",

  'Luxury & Premium': 
    "Immerse yourself in superior design and refined engineering with {product}. Artfully constructed with premium materials and showcasing {features}, this piece complements a sophisticated lifestyle. Exclusively curated at ₹{price} (complimentary value against standard ₹{actual_price}). Elevate your everyday standard.",

  'Empathetic & Problem-Solving': 
    "We know how frustrating it is when products wear out or let you down when you need them most. That's why {product} was designed with hassle-free {features}. Enjoy total peace of mind every single day, now available for only ₹{price} with {discount}% savings. Experience convenience you can count on.",

  'Bold & Promotional': 
    "MASSIVE SAVINGS ALERT! Upgrade today with the highest value deal on {product}. Enjoy premium benefits: {features}. Save big with an extraordinary {discount}% discount—down from ₹{actual_price} to just ₹{price}! Unrivaled value backed by thousands of verified reviews. Don't wait!"
};

const CTA_TEMPLATES = {
  'Urgent & Scarcity-Driven': ["Claim Deal Before It Ends ⚡", "Lock In Discount Now", "Shop Flash Sale ⏳"],
  'Playful & Witty': ["Treat Yourself Today 🎉", "Grab Yours Now 🚀", "See Why Everyone Loves It ✨"],
  'Professional & Authoritative': ["Explore Technical Specs", "Order Professional Unit", "Upgrade Your Setup Today"],
  'Luxury & Premium': ["Discover the Collection", "Acquire Yours Now", "Experience Distinction"],
  'Empathetic & Problem-Solving': ["Make Life Easier Today", "Get Yours with Confidence", "Try It Risk-Free Today"],
  'Bold & Promotional': ["Get {discount}% Off Now 🔥", "Shop Big Deals Today", "Buy Now at ₹{price}"]
};

const MODEL_BENCHMARKS = {
  "Logistic Regression": {
    accuracy: 0.6823,
    precision: 0.6945,
    recall: 0.8176,
    f1: 0.7511,
    roc_auc: 0.7108,
    cv_f1_mean: 0.7338,
    cv_f1_std: 0.0089,
    cm: { tn: 264, fp: 274, fn: 139, tp: 623 }
  },
  "Random Forest": {
    accuracy: 0.6685,
    precision: 0.6837,
    recall: 0.8084,
    f1: 0.7408,
    roc_auc: 0.7163,
    cv_f1_mean: 0.7494,
    cv_f1_std: 0.0073,
    cm: { tn: 253, fp: 285, fn: 146, tp: 616 }
  },
  "Gradient Boosting": {
    accuracy: 0.6677,
    precision: 0.6875,
    recall: 0.7940,
    f1: 0.7369,
    roc_auc: 0.7207,
    cv_f1_mean: 0.7428,
    cv_f1_std: 0.0059,
    cm: { tn: 263, fp: 275, fn: 157, tp: 605 }
  }
};

const FEATURE_IMPORTANCES_TOP20 = [
  { feature: "Luxury & Premium Tone", importance: 0.6273, type: "Categorical" },
  { feature: "Character Count", importance: 0.5931, type: "Numerical" },
  { feature: "Word Count", importance: 0.3778, type: "Numerical" },
  { feature: "Bold & Promotional Tone", importance: 0.3676, type: "Categorical" },
  { feature: "Channel Fit Penalty", importance: 0.2968, type: "Numerical" },
  { feature: "Audience: Home & Family", importance: 0.2834, type: "Categorical" },
  { feature: "Audience: Tech Enthusiasts", importance: 0.2826, type: "Categorical" },
  { feature: "Channel: Email Newsletter", importance: 0.2360, type: "Categorical" },
  { feature: "Urgent & Scarcity Tone", importance: 0.2168, type: "Categorical" },
  { feature: "Call-to-Action Presence", importance: 0.2072, type: "Numerical" },
  { feature: "Flesch Reading Ease", importance: 0.1970, type: "Numerical" },
  { feature: "Category: Home & Kitchen", importance: 0.1866, type: "Categorical" },
  { feature: "Channel: Social Feed Ad", importance: 0.1453, type: "Categorical" },
  { feature: "Audience: Budget Shoppers", importance: 0.1442, type: "Categorical" },
  { feature: "Category: Electronics", importance: 0.1367, type: "Categorical" },
  { feature: "Category: Office Products", importance: 0.1281, type: "Categorical" },
  { feature: "Category: Health & Personal", importance: 0.1134, type: "Categorical" },
  { feature: "Technical Spec Density", importance: 0.1120, type: "Numerical" },
  { feature: "Emoji Presence", importance: 0.1081, type: "Numerical" },
  { feature: "Empathetic Tone", importance: 0.1067, type: "Categorical" }
];

const LEXICONS = {
  positive: [
    'best', 'great', 'amazing', 'perfect', 'superior', 'premium', 'unbreakable',
    'fast', 'durable', 'unbeatable', 'reliable', 'sturdy', 'powerful', 'love',
    'excellent', 'flawlessly', 'smart', 'superb', 'efficient', 'smooth',
    'effortless', 'top-notch', 'exceptional', 'delight', 'ultimate', 'crystal',
    'sleek', 'portable', 'rapid', 'safe', 'innovative', 'ultra', 'tough',
    'satisfaction', 'guarantee', 'magic', 'ideal', 'boost', 'upgrade', 'save'
  ],
  negative: [
    'slow', 'cheap', 'fragile', 'poor', 'worst', 'broken', 'issue', 'bad',
    'loose', 'delay', 'difficult', 'struggle', 'cluttered', 'noisy', 'expensive',
    'defect', 'fail', 'boring', 'weak', 'inferior', 'terrible', 'annoying'
  ],
  urgency: [
    'hurry', 'limited', 'now', 'today', 'instant', 'exclusive', 'fast', 'quick',
    'flash', 'rush', 'last chance', 'clock', 'ending', "don't miss", 'act now',
    'grab', 'while supplies last', 'only', 'final'
  ],
  cta_verbs: [
    'get', 'buy', 'shop', 'grab', 'claim', 'order', 'upgrade', 'discover',
    'save', 'check', 'try', 'experience', 'unlock', 'boost', 'start', 'join'
  ],
  spec_keywords: [
    'w', 'watt', 'mbps', 'gb', 'tb', '4k', 'hz', 'mah', 'meter', 'pin', 'usb',
    'c-type', 'type-c', 'bluetooth', 'hdmi', 'oled', 'led', 'android', 'ios',
    'braided', 'nylon', 'aluminum', 'copper', 'shielding', 'pvc', 'cord'
  ]
};

// Trained Logistic Regression Model Parameters (Exact Export from campaign_success_model.joblib)
const CLIENT_MODEL_PARAMS = {
  intercept: 0.2037726706631478,
  coefficients: [
    0.006709888141781618, -0.03039208769433302, 0.13665950975603405, 0.11335811108350648,
    0.18661913033644748, -0.1040407683205128, 0.009728147799786485, -0.12810430568235168,
    -0.02588022178069136, 0.36762769574586335, 0.10667428800366274, -0.6273346934692677,
    0.01109764603209059, 0.08977531175644522, 0.21681715557087733, 0.14422685344879962,
    -0.07724762602856261, 0.037217928032637834, 0.05962696007339435, 0.28344766590231,
    -0.282614377889111, -0.0379594355857888, 0.2359503240309224, -0.09661525432122949,
    0.14525428294112555, -0.08197251342535902, 0.0241468951767909, 0.0015380703779167802,
    0.09537090255152075, 0.04507426198934801, -0.5930804048421605, 0.37777401944457295,
    -0.002032608402934813, 0.19703169203675766, 0.0873362589247749, -0.02674671377968585,
    -0.0282152884613446, 0.20722045445392215, -0.023211166594145148, 0.11197405270365353,
    0.10811908823760849, -0.007353420170874673, 0.03660419365615812, 0.075044584478659,
    0.005748825914642613, -0.29679911645548623
  ],
  feature_names: [
    "cat__category_Car&Motorbike", "cat__category_Computers&Accessories", "cat__category_Electronics",
    "cat__category_Health&PersonalCare", "cat__category_Home&Kitchen", "cat__category_HomeImprovement",
    "cat__category_MusicalInstruments", "cat__category_OfficeProducts", "cat__category_Toys&Games",
    "cat__input_tone_Bold & Promotional", "cat__input_tone_Empathetic & Problem-Solving",
    "cat__input_tone_Luxury & Premium", "cat__input_tone_Playful & Witty", "cat__input_tone_Professional & Authoritative",
    "cat__input_tone_Urgent & Scarcity-Driven", "cat__input_target_audience_Budget Shoppers & Deal Seekers",
    "cat__input_target_audience_Busy Working Professionals", "cat__input_target_audience_College Students & Gen Z",
    "cat__input_target_audience_Fitness & Lifestyle Enthusiasts", "cat__input_target_audience_Home & Family Managers",
    "cat__input_target_audience_Tech Enthusiasts & Power Users", "cat__channel_Amazon Sponsored Ad",
    "cat__channel_Email Newsletter", "cat__channel_Google Search Ad", "cat__channel_Instagram / Facebook Feed Ad",
    "cat__channel_SMS / WhatsApp Alert", "num__discounted_price", "num__actual_price",
    "num__discount_percentage", "num__product_rating", "num__char_count", "num__word_count",
    "num__sentence_count", "num__reading_ease", "num__sentiment_score", "num__has_urgency",
    "num__urgency_intensity", "num__has_cta", "num__has_discount_callout", "num__spec_density",
    "num__has_emoji", "num__emoji_count", "num__exclamation_count", "num__question_count",
    "num__lexical_diversity", "num__channel_fit_penalty"
  ],
  num_features: [
    'discounted_price', 'actual_price', 'discount_percentage', 'product_rating',
    'char_count', 'word_count', 'sentence_count', 'reading_ease', 'sentiment_score',
    'has_urgency', 'urgency_intensity', 'has_cta', 'has_discount_callout',
    'spec_density', 'has_emoji', 'emoji_count', 'exclamation_count',
    'question_count', 'lexical_diversity', 'channel_fit_penalty'
  ],
  num_means: [
    644.22, 1420.55, 48.72, 4.12, 342.15, 54.32, 3.82, 68.45, 0.45,
    0.62, 1.48, 0.82, 0.74, 0.052, 0.48, 1.25, 1.85, 0.32, 0.78, 0.15
  ],
  num_scales: [
    850.12, 1920.44, 21.35, 0.42, 140.22, 22.15, 1.42, 16.25, 0.35,
    0.48, 1.15, 0.38, 0.43, 0.045, 0.50, 1.82, 1.62, 0.65, 0.12, 0.28
  ]
};

// Global Browser & Environment Exports
if (typeof window !== 'undefined') {
  window.TONES = TONES;
  window.AUDIENCES = AUDIENCES;
  window.CHANNELS = CHANNELS;
  window.PRODUCTS = PRODUCTS;
  window.HEADLINE_TEMPLATES = HEADLINE_TEMPLATES;
  window.COPY_TEMPLATES = COPY_TEMPLATES;
  window.CTA_TEMPLATES = CTA_TEMPLATES;
  window.MODEL_BENCHMARKS = MODEL_BENCHMARKS;
  window.FEATURE_IMPORTANCES_TOP20 = FEATURE_IMPORTANCES_TOP20;
  window.LEXICONS = LEXICONS;
  window.CLIENT_MODEL_PARAMS = CLIENT_MODEL_PARAMS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TONES, AUDIENCES, CHANNELS, PRODUCTS,
    HEADLINE_TEMPLATES, COPY_TEMPLATES, CTA_TEMPLATES,
    MODEL_BENCHMARKS, FEATURE_IMPORTANCES_TOP20, LEXICONS, CLIENT_MODEL_PARAMS
  };
}

