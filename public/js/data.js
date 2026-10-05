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



// Enriched Analytics & Datasets for Netlify
const ANALYTICS_DATA = {
  "matrix_tone_cat": {
    "index": [
      "Bold & Promotional",
      "Empathetic & Problem-Solving",
      "Luxury & Premium",
      "Playful & Witty",
      "Professional & Authoritative",
      "Urgent & Scarcity-Driven"
    ],
    "columns": [
      "Car&Motorbike",
      "Computers&Accessories",
      "Electronics",
      "Health&PersonalCare",
      "Home&Kitchen",
      "HomeImprovement",
      "MusicalInstruments",
      "OfficeProducts",
      "Toys&Games"
    ],
    "values": [
      [
        100.0,
        81.0,
        70.4,
        0.0,
        72.7,
        null,
        100.0,
        66.7,
        100.0
      ],
      [
        null,
        61.4,
        62.8,
        100.0,
        59.1,
        100.0,
        60.0,
        50.0,
        null
      ],
      [
        100.0,
        26.1,
        39.3,
        null,
        39.1,
        0.0,
        null,
        27.3,
        0.0
      ],
      [
        50.0,
        64.7,
        73.2,
        null,
        63.5,
        50.0,
        0.0,
        69.2,
        null
      ],
      [
        null,
        50.2,
        49.1,
        100.0,
        44.2,
        0.0,
        50.0,
        56.2,
        0.0
      ],
      [
        0.0,
        67.3,
        66.0,
        100.0,
        65.2,
        50.0,
        null,
        55.0,
        null
      ]
    ]
  },
  "matrix_aud_tone": {
    "index": [
      "Budget Shoppers & Deal Seekers",
      "Busy Working Professionals",
      "College Students & Gen Z",
      "Fitness & Lifestyle Enthusiasts",
      "Home & Family Managers",
      "Tech Enthusiasts & Power Users"
    ],
    "columns": [
      "Bold & Promotional",
      "Empathetic & Problem-Solving",
      "Luxury & Premium",
      "Playful & Witty",
      "Professional & Authoritative",
      "Urgent & Scarcity-Driven"
    ],
    "values": [
      [
        85.5,
        53.4,
        23.5,
        83.8,
        36.0,
        82.7
      ],
      [
        68.3,
        60.2,
        39.9,
        50.8,
        63.0,
        55.5
      ],
      [
        81.0,
        55.4,
        34.4,
        80.7,
        36.3,
        71.7
      ],
      [
        74.3,
        54.7,
        41.3,
        69.4,
        54.0,
        67.9
      ],
      [
        74.7,
        86.7,
        38.4,
        65.4,
        50.8,
        59.3
      ],
      [
        62.9,
        50.6,
        34.7,
        59.4,
        44.8,
        57.9
      ]
    ]
  },
  "tone_agg": [
    {
      "input_tone": "Bold & Promotional",
      "total_count": 1113,
      "approval_pct": 74.4
    },
    {
      "input_tone": "Playful & Witty",
      "total_count": 1061,
      "approval_pct": 67.9
    },
    {
      "input_tone": "Urgent & Scarcity-Driven",
      "total_count": 1061,
      "approval_pct": 65.9
    },
    {
      "input_tone": "Empathetic & Problem-Solving",
      "total_count": 1076,
      "approval_pct": 61.0
    },
    {
      "input_tone": "Professional & Authoritative",
      "total_count": 1066,
      "approval_pct": 48.0
    },
    {
      "input_tone": "Luxury & Premium",
      "total_count": 1123,
      "approval_pct": 35.2
    }
  ],
  "chan_agg": [
    {
      "channel": "Amazon Sponsored Ad",
      "approval_pct": 52.4,
      "simulated_ctr": 3.8
    },
    {
      "channel": "SMS / WhatsApp Alert",
      "approval_pct": 53.5,
      "simulated_ctr": 3.79
    },
    {
      "channel": "Instagram / Facebook Feed Ad",
      "approval_pct": 59.6,
      "simulated_ctr": 3.92
    },
    {
      "channel": "Google Search Ad",
      "approval_pct": 61.1,
      "simulated_ctr": 3.98
    },
    {
      "channel": "Email Newsletter",
      "approval_pct": 66.2,
      "simulated_ctr": 4.06
    }
  ],
  "reasons_pareto": [
    {
      "Reason": "Copy Too Wordy & Cluttered for Channel",
      "Count": 1071,
      "Percentage": 39.8
    },
    {
      "Reason": "Misaligned with Target Audience Intent",
      "Count": 536,
      "Percentage": 19.9
    },
    {
      "Reason": "Poor Readability & Complex Phrasing",
      "Count": 432,
      "Percentage": 16.1
    },
    {
      "Reason": "Mismatched Price & Tone (Overly Pretentious for Commodity)",
      "Count": 259,
      "Percentage": 9.6
    },
    {
      "Reason": "Lacks Product Features / Technical Specifics",
      "Count": 182,
      "Percentage": 6.8
    },
    {
      "Reason": "Missing Clear Discount / Value Offer",
      "Count": 137,
      "Percentage": 5.1
    },
    {
      "Reason": "Weak or Absent Call-to-Action",
      "Count": 45,
      "Percentage": 1.7
    },
    {
      "Reason": "Tone Too Aggressive / Artificial Urgency",
      "Count": 28,
      "Percentage": 1.0
    }
  ],
  "reading_hist": {
    "bins": [
      "20-25",
      "25-30",
      "30-35",
      "35-40",
      "40-45",
      "45-50",
      "50-55",
      "55-60",
      "60-65",
      "65-70",
      "70-75",
      "75-80",
      "80-85",
      "85-90",
      "90-95",
      "95-100"
    ],
    "up": [
      112,
      102,
      119,
      100,
      113,
      142,
      320,
      465,
      623,
      720,
      469,
      175,
      66,
      27,
      7,
      1
    ],
    "down": [
      189,
      210,
      176,
      122,
      79,
      111,
      167,
      260,
      381,
      294,
      189,
      70,
      18,
      14,
      4,
      2
    ]
  },
  "sentiment_summary": {
    "up": {
      "median": 0.71,
      "q1": 0.42,
      "q3": 1.0,
      "min": -0.42,
      "max": 1.0
    },
    "down": {
      "median": 0.71,
      "q1": 0.0,
      "q3": 0.94,
      "min": -0.42,
      "max": 1.0
    }
  },
  "total_campaigns": 6500,
  "approval_rate": 58.6,
  "avg_reading_ease": 52.1,
  "avg_ctr_up": 4.81,
  "avg_ctr_down": 2.65
};

const MODEL_METADATA = {
  "best_model": "Logistic Regression",
  "evaluation_results": {
    "Logistic Regression": {
      "cv_f1_mean": 0.7338,
      "cv_f1_std": 0.0089,
      "test_accuracy": 0.6823,
      "test_precision": 0.6945,
      "test_recall": 0.8176,
      "test_f1": 0.7511,
      "test_roc_auc": 0.7108,
      "confusion_matrix": [
        [
          264,
          274
        ],
        [
          139,
          623
        ]
      ]
    },
    "Random Forest": {
      "cv_f1_mean": 0.7494,
      "cv_f1_std": 0.0073,
      "test_accuracy": 0.6685,
      "test_precision": 0.6837,
      "test_recall": 0.8084,
      "test_f1": 0.7408,
      "test_roc_auc": 0.7163,
      "confusion_matrix": [
        [
          253,
          285
        ],
        [
          146,
          616
        ]
      ]
    },
    "Gradient Boosting": {
      "cv_f1_mean": 0.7428,
      "cv_f1_std": 0.0059,
      "test_accuracy": 0.6677,
      "test_precision": 0.6875,
      "test_recall": 0.794,
      "test_f1": 0.7369,
      "test_roc_auc": 0.7207,
      "confusion_matrix": [
        [
          263,
          275
        ],
        [
          157,
          605
        ]
      ]
    }
  },
  "feature_importances_top20": [
    {
      "feature": "input_tone_Luxury & Premium",
      "importance": 0.62733
    },
    {
      "feature": "char_count",
      "importance": 0.59308
    },
    {
      "feature": "word_count",
      "importance": 0.37777
    },
    {
      "feature": "input_tone_Bold & Promotional",
      "importance": 0.36763
    },
    {
      "feature": "channel_fit_penalty",
      "importance": 0.2968
    },
    {
      "feature": "input_target_audience_Home & Family Managers",
      "importance": 0.28345
    },
    {
      "feature": "input_target_audience_Tech Enthusiasts & Power Users",
      "importance": 0.28261
    },
    {
      "feature": "channel_Email Newsletter",
      "importance": 0.23595
    },
    {
      "feature": "input_tone_Urgent & Scarcity-Driven",
      "importance": 0.21682
    },
    {
      "feature": "has_cta",
      "importance": 0.20722
    },
    {
      "feature": "reading_ease",
      "importance": 0.19703
    },
    {
      "feature": "category_Home&Kitchen",
      "importance": 0.18662
    },
    {
      "feature": "channel_Instagram / Facebook Feed Ad",
      "importance": 0.14525
    },
    {
      "feature": "input_target_audience_Budget Shoppers & Deal Seekers",
      "importance": 0.14423
    },
    {
      "feature": "category_Electronics",
      "importance": 0.13666
    },
    {
      "feature": "category_OfficeProducts",
      "importance": 0.1281
    },
    {
      "feature": "category_Health&PersonalCare",
      "importance": 0.11336
    },
    {
      "feature": "spec_density",
      "importance": 0.11197
    },
    {
      "feature": "has_emoji",
      "importance": 0.10812
    },
    {
      "feature": "input_tone_Empathetic & Problem-Solving",
      "importance": 0.10667
    }
  ],
  "categorical_features": [
    "category",
    "input_tone",
    "input_target_audience",
    "channel"
  ],
  "numerical_features": [
    "discounted_price",
    "actual_price",
    "discount_percentage",
    "product_rating",
    "char_count",
    "word_count",
    "sentence_count",
    "reading_ease",
    "sentiment_score",
    "has_urgency",
    "urgency_intensity",
    "has_cta",
    "has_discount_callout",
    "spec_density",
    "has_emoji",
    "emoji_count",
    "exclamation_count",
    "question_count",
    "lexical_diversity",
    "channel_fit_penalty"
  ],
  "total_training_samples": 5200,
  "total_test_samples": 1300
};

const PROMETHEUS_RAW_TEXT = "# HELP campaigniq_requests_total Total number of content generation requests\n# TYPE campaigniq_requests_total counter\ncampaigniq_requests_total{engine=\"all\"} 0\ncampaigniq_requests_total{engine=\"gemini\"} 0\ncampaigniq_requests_total{engine=\"local\"} 0\ncampaigniq_requests_total{engine=\"fallback\"} 0\n\n# HELP campaigniq_errors_total Total generation errors\n# TYPE campaigniq_errors_total counter\ncampaigniq_errors_total 0\n\n# HELP campaigniq_latency_ms_avg Average generation latency in milliseconds\n# TYPE campaigniq_latency_ms_avg gauge\ncampaigniq_latency_ms_avg 0.0\n\n# HELP campaigniq_latency_ms_p95 95th percentile generation latency in milliseconds\n# TYPE campaigniq_latency_ms_p95 gauge\ncampaigniq_latency_ms_p95 0.0\n\n# HELP campaigniq_inference_latency_ms_avg Scikit-Learn ML inference latency in milliseconds\n# TYPE campaigniq_inference_latency_ms_avg gauge\ncampaigniq_inference_latency_ms_avg 0.0\n";

const INITIAL_CATALOG = [
  {
    "id": "B07JW9H4J1",
    "name": "Wayona Nylon Braided USB to Lightning Fast Charging and Data Sync",
    "full_name": "Wayona Nylon Braided USB to Lightning Fast Charging and Data Sync Cable Compatible for iPhone 13, 12,11, X, 8, 7, 6, 5, iPad Air, Pro, Mini ",
    "category": "Computers&Accessories",
    "price": 399.0,
    "actual_price": 1099.0,
    "discount": 64.0,
    "rating": 4.2,
    "features": "High Compatibility : Compatible With iPhone 12, 11, X/XsMax/Xr ,iPhone 8/8 Plus,iPhone 7/7 Plus,iPhone 6s/6s Plus,iPhone"
  },
  {
    "id": "B098NS6PVG",
    "name": "Ambrane Unbreakable 60W / 3A Fast Charging 1.5m Braided Type C Ca",
    "full_name": "Ambrane Unbreakable 60W / 3A Fast Charging 1.5m Braided Type C Cable for Smartphones, Tablets, Laptops & other Type C devices, PD Technology",
    "category": "Computers&Accessories",
    "price": 199.0,
    "actual_price": 349.0,
    "discount": 43.0,
    "rating": 4.0,
    "features": "Compatible with all Type C enabled devices, be it an android smartphone (Mi, Samsung, Oppo, Vivo, Realme, OnePlus, etc),"
  },
  {
    "id": "B096MSW6CT",
    "name": "Sounce Fast Phone Charging Cable & Data Sync USB Cable Compatible",
    "full_name": "Sounce Fast Phone Charging Cable & Data Sync USB Cable Compatible for iPhone 13, 12,11, X, 8, 7, 6, 5, iPad Air, Pro, Mini & iOS Devices",
    "category": "Computers&Accessories",
    "price": 199.0,
    "actual_price": 1899.0,
    "discount": 90.0,
    "rating": 3.9,
    "features": "\u3010 Fast Charger& Data Sync\u3011-With built-in safety proctections and four-core copper wires promote maximum signal quality a"
  },
  {
    "id": "B08HDJ86NZ",
    "name": "boAt Deuce USB 300 2 in 1 Type-C & Micro USB Stress Resistant",
    "full_name": "boAt Deuce USB 300 2 in 1 Type-C & Micro USB Stress Resistant, Tangle-Free, Sturdy Cable with 3A Fast Charging & 480mbps Data Transmission, ",
    "category": "Computers&Accessories",
    "price": 329.0,
    "actual_price": 699.0,
    "discount": 53.0,
    "rating": 4.2,
    "features": "The boAt Deuce USB 300 2 in 1 cable is compatible with smartphones, tablets, PC peripherals, Bluetooth speakers, power b"
  },
  {
    "id": "B08CF3B7N1",
    "name": "Portronics Konnect L 1.2M Fast Charging 3A 8 Pin USB Cable with C",
    "full_name": "Portronics Konnect L 1.2M Fast Charging 3A 8 Pin USB Cable with Charge & Sync Function for iPhone, iPad (Grey)",
    "category": "Computers&Accessories",
    "price": 154.0,
    "actual_price": 399.0,
    "discount": 61.0,
    "rating": 4.2,
    "features": "[CHARGE & SYNC FUNCTION]- This cable comes with charging & Data sync function, [HIGH QUALITY MATERIAL]- TPE + Nylon Mate"
  },
  {
    "id": "B08Y1TFSP6",
    "name": "pTron Solero TB301 3A Type-C Data and Fast Charging Cable",
    "full_name": "pTron Solero TB301 3A Type-C Data and Fast Charging Cable, Made in India, 480Mbps Data Sync, Strong and Durable 1.5-Meter Nylon Braided USB ",
    "category": "Computers&Accessories",
    "price": 149.0,
    "actual_price": 1000.0,
    "discount": 85.0,
    "rating": 3.9,
    "features": "Fast Charging & Data Sync: Solero TB301 Type-C cable supports fast charge up to 5V/3A for devices and data syncing speed"
  },
  {
    "id": "B08WRWPM22",
    "name": "boAt Micro USB 55 Tangle-free",
    "full_name": "boAt Micro USB 55 Tangle-free, Sturdy Micro USB Cable with 3A Fast Charging & 480mbps Data Transmission (Black)",
    "category": "Computers&Accessories",
    "price": 176.63,
    "actual_price": 499.0,
    "discount": 65.0,
    "rating": 4.1,
    "features": "It Ensures High Speed Transmission And Charging By Offering 3A Fast Charging And Data Transmissions With Rapid Sync At 4"
  },
  {
    "id": "B08DDRGWTJ",
    "name": "MI Usb Type-C Cable Smartphone",
    "full_name": "MI Usb Type-C Cable Smartphone (Black)",
    "category": "Computers&Accessories",
    "price": 229.0,
    "actual_price": 299.0,
    "discount": 23.0,
    "rating": 4.3,
    "features": "1m long Type-C USB Cable, Sturdy and Durable. With USB cable you can transfer data with speeds of upto 480 Mbps"
  },
  {
    "id": "B008IFXQFU",
    "name": "TP-Link USB WiFi Adapter for PC",
    "full_name": "TP-Link USB WiFi Adapter for PC(TL-WN725N), N150 Wireless Network Adapter for Desktop - Nano Size WiFi Dongle Compatible with Windows 11/10/",
    "category": "Computers&Accessories",
    "price": 499.0,
    "actual_price": 999.0,
    "discount": 50.0,
    "rating": 4.2,
    "features": "USB WiFi Adapter \u2014\u2014 Speedy wireless transmission at up to 150Mbps ideal for video streaming or internet calls, Mini Desi"
  },
  {
    "id": "B082LZGK39",
    "name": "Ambrane Unbreakable 60W / 3A Fast Charging 1.5m Braided Micro USB",
    "full_name": "Ambrane Unbreakable 60W / 3A Fast Charging 1.5m Braided Micro USB Cable for Smartphones, Tablets, Laptops & Other Micro USB Devices, 480Mbps",
    "category": "Computers&Accessories",
    "price": 199.0,
    "actual_price": 299.0,
    "discount": 33.0,
    "rating": 4.0,
    "features": "Universal Compatibility \u2013 It is compatible with all Micro USB enabled devices, be it an android smartphone, tablet, PC p"
  },
  {
    "id": "B08CF3D7QR",
    "name": "Portronics Konnect L POR-1081 Fast Charging 3A Type-C Cable 1.2Me",
    "full_name": "Portronics Konnect L POR-1081 Fast Charging 3A Type-C Cable 1.2Meter with Charge & Sync Function for All Type-C Devices (Grey)",
    "category": "Computers&Accessories",
    "price": 154.0,
    "actual_price": 339.0,
    "discount": 55.0,
    "rating": 4.3,
    "features": "[CHARGE & SYNC FUNCTION]- This cable comes with charging & Data sync function for smartphones, [HIGH QUALITY MATERIAL]- "
  },
  {
    "id": "B0789LZTCJ",
    "name": "boAt Rugged v3 Extra Tough Unbreakable Braided Micro USB Cable 1.",
    "full_name": "boAt Rugged v3 Extra Tough Unbreakable Braided Micro USB Cable 1.5 Meter (Black)",
    "category": "Computers&Accessories",
    "price": 299.0,
    "actual_price": 799.0,
    "discount": 63.0,
    "rating": 4.2,
    "features": "The boAt rugged cable features our special toughest polyethylene braided jacket and this unique jacket provides greater "
  },
  {
    "id": "B07KSMBL2H",
    "name": "AmazonBasics Flexible Premium HDMI Cable",
    "full_name": "AmazonBasics Flexible Premium HDMI Cable (Black, 4K@60Hz, 18Gbps), 3-Foot",
    "category": "Electronics",
    "price": 219.0,
    "actual_price": 700.0,
    "discount": 69.0,
    "rating": 4.4,
    "features": "Flexible, lightweight HDMI cable for connecting media devices to playback display such as HDTVs, projectors, and more, C"
  },
  {
    "id": "B085DTN6R2",
    "name": "Portronics Konnect CL 20W POR-1067 Type-C to 8 Pin USB 1.2M Cable",
    "full_name": "Portronics Konnect CL 20W POR-1067 Type-C to 8 Pin USB 1.2M Cable with Power Delivery & 3A Quick Charge Support, Nylon Braided for All Type-",
    "category": "Computers&Accessories",
    "price": 350.0,
    "actual_price": 899.0,
    "discount": 61.0,
    "rating": 4.2,
    "features": "[20W PD FAST CHARGING]-It\u2019s supports 20W PD quick charge protocol, charge up to 50% in around 30 minutes. It is ideal fo"
  },
  {
    "id": "B09KLVMZ3B",
    "name": "Portronics Konnect L 1.2M POR-1401 Fast Charging 3A 8 Pin USB Cab",
    "full_name": "Portronics Konnect L 1.2M POR-1401 Fast Charging 3A 8 Pin USB Cable with Charge & Sync Function (White)",
    "category": "Computers&Accessories",
    "price": 159.0,
    "actual_price": 399.0,
    "discount": 60.0,
    "rating": 4.1,
    "features": "[CHARGE & SYNC FUNCTION]- This cable comes with charging & Data sync function, [HIGH QUALITY MATERIAL]- TPE + Nylon Mate"
  },
  {
    "id": "B083342NKJ",
    "name": "MI Braided USB Type-C Cable for Charging Adapter",
    "full_name": "MI Braided USB Type-C Cable for Charging Adapter (Red)",
    "category": "Computers&Accessories",
    "price": 349.0,
    "actual_price": 399.0,
    "discount": 13.0,
    "rating": 4.4,
    "features": "1M Long Cable. Usb 2.0 (Type A), Toughened Joints"
  },
  {
    "id": "B0B6F7LX4C",
    "name": "MI 80 cm 5A Series HD Ready Smart Android LED TV L32M7-5AIN",
    "full_name": "MI 80 cm (32 inches) 5A Series HD Ready Smart Android LED TV L32M7-5AIN (Black)",
    "category": "Electronics",
    "price": 13999.0,
    "actual_price": 24999.0,
    "discount": 44.0,
    "rating": 4.2,
    "features": "Note : The brands, Mi and Xiaomi, are part of the same multinational conglomerate, Resolution : HD Ready (1366 x 768) Re"
  },
  {
    "id": "B082LSVT4B",
    "name": "Ambrane Unbreakable 60W / 3A Fast Charging 1.5m Braided Type C to",
    "full_name": "Ambrane Unbreakable 60W / 3A Fast Charging 1.5m Braided Type C to Type C Cable for Smartphones, Tablets, Laptops & Other Type C Devices, PD ",
    "category": "Computers&Accessories",
    "price": 249.0,
    "actual_price": 399.0,
    "discount": 38.0,
    "rating": 4.0,
    "features": "Compatible with all Type C enabled devices, be it an android smartphone (Mi, Samsung, Oppo, Vivo, Realme, OnePlus, etc),"
  },
  {
    "id": "B08WRBG3XW",
    "name": "boAt Type C A325 Tangle-free",
    "full_name": "boAt Type C A325 Tangle-free, Sturdy Type C Cable with 3A Rapid Charging & 480mbps Data Transmission(Black)",
    "category": "Computers&Accessories",
    "price": 199.0,
    "actual_price": 499.0,
    "discount": 60.0,
    "rating": 4.1,
    "features": "Type C A 325 Cable Is Designed With A Perfect 1.5 Meters In Length For Hassle Free Usage, It Dons Premium Braided Skin T"
  },
  {
    "id": "B08DPLCM6T",
    "name": "LG 80 cm HD Ready Smart LED TV 32LM563BPTC",
    "full_name": "LG 80 cm (32 inches) HD Ready Smart LED TV 32LM563BPTC (Dark Iron Gray)",
    "category": "Electronics",
    "price": 13490.0,
    "actual_price": 21990.0,
    "discount": 39.0,
    "rating": 4.3,
    "features": "Resolution: HD Ready (1366x768), Refresh Rate: 50 hertz"
  },
  {
    "id": "B09C6HXFC1",
    "name": "Duracell USB Lightning Apple Certified Braided Sync & Charge Cabl",
    "full_name": "Duracell USB Lightning Apple Certified (Mfi) Braided Sync & Charge Cable For Iphone, Ipad And Ipod. Fast Charging Lightning Cable, 3.9 Feet ",
    "category": "Computers&Accessories",
    "price": 970.0,
    "actual_price": 1799.0,
    "discount": 46.0,
    "rating": 4.5,
    "features": "Supports Ios Devices With Max Output Up To 2.4A, Up To 10, 000+ Bend And 10, 000+ Plugging And Unplugging Test Ensure Th"
  },
  {
    "id": "B085194JFL",
    "name": "tizum HDMI to VGA Adapter Cable 1080P for Projector",
    "full_name": "tizum HDMI to VGA Adapter Cable 1080P for Projector, Computer, Laptop, TV, Projectors & TV",
    "category": "Electronics",
    "price": 279.0,
    "actual_price": 499.0,
    "discount": 44.0,
    "rating": 3.7,
    "features": "Superior Stability: Built-in advanced Certified AG6200 IC chip converts HDMI digital signal to VGA analog signal. It is "
  },
  {
    "id": "B09F6S8BT6",
    "name": "Samsung 80 cm Wondertainment Series HD Ready LED Smart TV UA32T43",
    "full_name": "Samsung 80 cm (32 Inches) Wondertainment Series HD Ready LED Smart TV UA32T4340BKXXL (Glossy Black)",
    "category": "Electronics",
    "price": 13490.0,
    "actual_price": 22900.0,
    "discount": 41.0,
    "rating": 4.3,
    "features": "Resolution: HD Ready (1366x768), Refresh Rate: 60 hertz"
  },
  {
    "id": "B09NHVCHS9",
    "name": "Flix Micro Usb Cable For Smartphone",
    "full_name": "Flix Micro Usb Cable For Smartphone (Black)",
    "category": "Computers&Accessories",
    "price": 59.0,
    "actual_price": 199.0,
    "discount": 70.0,
    "rating": 4.0,
    "features": "Micro usb cable is 1 meter in length, optimized for easy use for your comfort at home or office, helps you to overcome d"
  },
  {
    "id": "B0B1YVCJ2Y",
    "name": "Acer 80 cm I Series HD Ready Android Smart LED TV AR32AR2841HDFL",
    "full_name": "Acer 80 cm (32 inches) I Series HD Ready Android Smart LED TV AR32AR2841HDFL (Black)",
    "category": "Electronics",
    "price": 11499.0,
    "actual_price": 19990.0,
    "discount": 42.0,
    "rating": 4.3,
    "features": "Resolution : HD Ready (1366x768), Refresh Rate : 60 Hertz"
  },
  {
    "id": "B01M4GGIVU",
    "name": "Tizum High Speed HDMI Cable with Ethernet | Supports 3D 4K | for ",
    "full_name": "Tizum High Speed HDMI Cable with Ethernet | Supports 3D 4K | for All HDMI Devices Laptop Computer Gaming Console TV Set Top Box (1.5 Meter/ ",
    "category": "Electronics",
    "price": 199.0,
    "actual_price": 699.0,
    "discount": 72.0,
    "rating": 4.2,
    "features": "Latest Standard HDMI A Male to A Male Cable: Supports Ethernet, 3D, 4K video and Audio Return Channel (ARC), Connects Bl"
  },
  {
    "id": "B08B42LWKN",
    "name": "OnePlus 80 cm Y Series HD Ready LED Smart Android TV 32Y1",
    "full_name": "OnePlus 80 cm (32 inches) Y Series HD Ready LED Smart Android TV 32Y1 (Black)",
    "category": "Electronics",
    "price": 14999.0,
    "actual_price": 19999.0,
    "discount": 25.0,
    "rating": 4.2,
    "features": "Resolution: HD Ready (1366x768), Refresh Rate: 60 hertz"
  },
  {
    "id": "B094JNXNPV",
    "name": "Ambrane Unbreakable 3 in 1 Fast Charging Braided Multipurpose Cab",
    "full_name": "Ambrane Unbreakable 3 in 1 Fast Charging Braided Multipurpose Cable for Speaker with 2.1 A Speed - 1.25 meter, Black",
    "category": "Computers&Accessories",
    "price": 299.0,
    "actual_price": 399.0,
    "discount": 25.0,
    "rating": 4.0,
    "features": "Blazing Charging - All combined 3 in 1 cable supports fast charging with the speed 2.1A to all your gadgets including mo"
  },
  {
    "id": "B09W5XR9RT",
    "name": "Duracell USB C To Lightning Apple Certified Braided Sync & Charge",
    "full_name": "Duracell USB C To Lightning Apple Certified (Mfi) Braided Sync & Charge Cable For Iphone, Ipad And Ipod. Fast Charging Lightning Cable, 3.9 ",
    "category": "Computers&Accessories",
    "price": 970.0,
    "actual_price": 1999.0,
    "discount": 51.0,
    "rating": 4.4,
    "features": "1.2M Tangle Free durable tough braiding sync & charge cable, Supports iOS devices with max output up to 2.4A"
  },
  {
    "id": "B077Z65HSD",
    "name": "boAt A400 USB Type-C to USB-A 2.0 Male Data Cable",
    "full_name": "boAt A400 USB Type-C to USB-A 2.0 Male Data Cable, 2 Meter (Black)",
    "category": "Computers&Accessories",
    "price": 299.0,
    "actual_price": 999.0,
    "discount": 70.0,
    "rating": 4.3,
    "features": "2 meter special reversible Type-C to USB A male user-friendly design helps you insert the connector in a right way all t"
  }
];

const INITIAL_LOGS = [
  {
    "campaign_id": "CMP-103106",
    "product_name": "SanDisk Ultra 128 GB USB 3.0 Pen Drive",
    "category": "Computers&Accessories",
    "input_tone": "Playful & Witty",
    "input_target_audience": "Home & Family Managers",
    "channel": "Google Search Ad",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Misaligned with Target Audience Intent",
    "click_through_rate": 2.85
  },
  {
    "campaign_id": "CMP-106161",
    "product_name": "Ambrane 27000mAh Power Bank",
    "category": "Electronics",
    "input_tone": "Professional & Authoritative",
    "input_target_audience": "Home & Family Managers",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Poor Readability & Complex Phrasing",
    "click_through_rate": 0.2
  },
  {
    "campaign_id": "CMP-101867",
    "product_name": "Robustrion [Anti-Scratch] & [Smudge Proof] [Bubble",
    "category": "Computers&Accessories",
    "input_tone": "Bold & Promotional",
    "input_target_audience": "College Students & Gen Z",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Strong Value Proposition & High Savings Callout",
    "click_through_rate": 6.27
  },
  {
    "campaign_id": "CMP-103238",
    "product_name": "HP Deskjet 2331 Colour Printer",
    "category": "Computers&Accessories",
    "input_tone": "Urgent & Scarcity-Driven",
    "input_target_audience": "Home & Family Managers",
    "channel": "SMS / WhatsApp Alert",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Tone Too Aggressive / Artificial Urgency",
    "click_through_rate": 2.2
  },
  {
    "campaign_id": "CMP-105509",
    "product_name": "Tizum High Speed HDMI Cable with Ethernet | Suppor",
    "category": "Electronics",
    "input_tone": "Professional & Authoritative",
    "input_target_audience": "Fitness & Lifestyle Enthusiasts",
    "channel": "Google Search Ad",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Copy Too Wordy & Cluttered for Channel",
    "click_through_rate": 2.43
  },
  {
    "campaign_id": "CMP-106167",
    "product_name": "KENT 16025 Sandwich Grill 700W | Non-Toxic Ceramic",
    "category": "Home&Kitchen",
    "input_tone": "Bold & Promotional",
    "input_target_audience": "Fitness & Lifestyle Enthusiasts",
    "channel": "Instagram / Facebook Feed Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "High Engagement & Clear Call-to-Action",
    "click_through_rate": 1.78
  },
  {
    "campaign_id": "CMP-102142",
    "product_name": "Brayden Chopro",
    "category": "Home&Kitchen",
    "input_tone": "Bold & Promotional",
    "input_target_audience": "Tech Enthusiasts & Power Users",
    "channel": "Google Search Ad",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Copy Too Wordy & Cluttered for Channel",
    "click_through_rate": 1.14
  },
  {
    "campaign_id": "CMP-102457",
    "product_name": "Noise Agile 2 Buzz Bluetooth Calling Smart Watch w",
    "category": "Electronics",
    "input_tone": "Urgent & Scarcity-Driven",
    "input_target_audience": "College Students & Gen Z",
    "channel": "Email Newsletter",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Misaligned with Target Audience Intent",
    "click_through_rate": 2.02
  },
  {
    "campaign_id": "CMP-106047",
    "product_name": "Macmillan Aquafresh 5 Micron PS-05 10\" in PP Spun ",
    "category": "Home&Kitchen",
    "input_tone": "Playful & Witty",
    "input_target_audience": "College Students & Gen Z",
    "channel": "Instagram / Facebook Feed Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Strong Value Proposition & High Savings Callout",
    "click_through_rate": 6.6
  },
  {
    "campaign_id": "CMP-103244",
    "product_name": "Croma 3A Fast charge 1m Type-C to All Type-C Phone",
    "category": "Computers&Accessories",
    "input_tone": "Luxury & Premium",
    "input_target_audience": "Home & Family Managers",
    "channel": "Email Newsletter",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Mismatched Price & Tone (Overly Pretentious for Commodity)",
    "click_through_rate": 4.32
  },
  {
    "campaign_id": "CMP-102103",
    "product_name": "Panasonic SR-WA22H Automatic Rice Cooker",
    "category": "Home&Kitchen",
    "input_tone": "Luxury & Premium",
    "input_target_audience": "Home & Family Managers",
    "channel": "Google Search Ad",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Copy Too Wordy & Cluttered for Channel",
    "click_through_rate": 2.33
  },
  {
    "campaign_id": "CMP-102952",
    "product_name": "KENT 16026 Electric Kettle Stainless Steel 1.8 L |",
    "category": "Home&Kitchen",
    "input_tone": "Luxury & Premium",
    "input_target_audience": "Tech Enthusiasts & Power Users",
    "channel": "Email Newsletter",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Lacks Product Features / Technical Specifics",
    "click_through_rate": 1.69
  },
  {
    "campaign_id": "CMP-106341",
    "product_name": "Lava A1 Josh 21 -Dual Sim",
    "category": "Electronics",
    "input_tone": "Bold & Promotional",
    "input_target_audience": "Tech Enthusiasts & Power Users",
    "channel": "Email Newsletter",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Lacks Product Features / Technical Specifics",
    "click_through_rate": 2.18
  },
  {
    "campaign_id": "CMP-100217",
    "product_name": "Posh 1.5 Meter High Speed Gold Plated HDMI Male to",
    "category": "Electronics",
    "input_tone": "Empathetic & Problem-Solving",
    "input_target_audience": "Busy Working Professionals",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Engaging Emotional Hook & Tone Alignment",
    "click_through_rate": 7.17
  },
  {
    "campaign_id": "CMP-100230",
    "product_name": "AmazonBasics 6 Feet DisplayPort to DisplayPort Cab",
    "category": "Computers&Accessories",
    "input_tone": "Bold & Promotional",
    "input_target_audience": "Fitness & Lifestyle Enthusiasts",
    "channel": "SMS / WhatsApp Alert",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Strong Value Proposition & High Savings Callout",
    "click_through_rate": 6.61
  },
  {
    "campaign_id": "CMP-102287",
    "product_name": "Newly Launched Boult Dive+ with 1.85\" HD Display",
    "category": "Electronics",
    "input_tone": "Urgent & Scarcity-Driven",
    "input_target_audience": "Home & Family Managers",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Strong Value Proposition & High Savings Callout",
    "click_through_rate": 5.13
  },
  {
    "campaign_id": "CMP-101405",
    "product_name": "Shakti Technology S3 High Pressure Car Washer Mach",
    "category": "Home&Kitchen",
    "input_tone": "Luxury & Premium",
    "input_target_audience": "College Students & Gen Z",
    "channel": "SMS / WhatsApp Alert",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Copy Too Wordy & Cluttered for Channel",
    "click_through_rate": 2.54
  },
  {
    "campaign_id": "CMP-100681",
    "product_name": "Quantum QHM-7406 Full-Sized Keyboard with Rupee Sy",
    "category": "Computers&Accessories",
    "input_tone": "Bold & Promotional",
    "input_target_audience": "Home & Family Managers",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Strong Value Proposition & High Savings Callout",
    "click_through_rate": 4.96
  },
  {
    "campaign_id": "CMP-101832",
    "product_name": "Portronics Konnect L POR-1081 Fast Charging 3A Typ",
    "category": "Computers&Accessories",
    "input_tone": "Playful & Witty",
    "input_target_audience": "Budget Shoppers & Deal Seekers",
    "channel": "Instagram / Facebook Feed Ad",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Copy Too Wordy & Cluttered for Channel",
    "click_through_rate": 3.89
  },
  {
    "campaign_id": "CMP-100932",
    "product_name": "Wings Phantom Pro Earphones Gaming Earbuds with LE",
    "category": "Computers&Accessories",
    "input_tone": "Professional & Authoritative",
    "input_target_audience": "Busy Working Professionals",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "High Engagement & Clear Call-to-Action",
    "click_through_rate": 6.84
  },
  {
    "campaign_id": "CMP-105316",
    "product_name": "Shakti Technology S5 High Pressure Car Washer Mach",
    "category": "Home&Kitchen",
    "input_tone": "Playful & Witty",
    "input_target_audience": "Tech Enthusiasts & Power Users",
    "channel": "Instagram / Facebook Feed Ad",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Copy Too Wordy & Cluttered for Channel",
    "click_through_rate": 2.17
  },
  {
    "campaign_id": "CMP-102291",
    "product_name": "POPIO Type C Dash Charging USB Data Cable for OneP",
    "category": "Computers&Accessories",
    "input_tone": "Professional & Authoritative",
    "input_target_audience": "Tech Enthusiasts & Power Users",
    "channel": "SMS / WhatsApp Alert",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Strong Value Proposition & High Savings Callout",
    "click_through_rate": 4.6
  },
  {
    "campaign_id": "CMP-103006",
    "product_name": "pTron Solero T351 3.5Amps Fast Charging Type-C to ",
    "category": "Computers&Accessories",
    "input_tone": "Playful & Witty",
    "input_target_audience": "Home & Family Managers",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Strong Value Proposition & High Savings Callout",
    "click_through_rate": 6.03
  },
  {
    "campaign_id": "CMP-101773",
    "product_name": "Morphy Richards OFR Room Heater",
    "category": "Home&Kitchen",
    "input_tone": "Luxury & Premium",
    "input_target_audience": "Busy Working Professionals",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Down",
    "feedback_reason": "Poor Readability & Complex Phrasing",
    "click_through_rate": 3.42
  },
  {
    "campaign_id": "CMP-101652",
    "product_name": "Amazon Basics 2000/1000 Watt Room Heater with Adju",
    "category": "Home&Kitchen",
    "input_tone": "Urgent & Scarcity-Driven",
    "input_target_audience": "Busy Working Professionals",
    "channel": "Instagram / Facebook Feed Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "High Engagement & Clear Call-to-Action",
    "click_through_rate": 5.35
  },
  {
    "campaign_id": "CMP-104472",
    "product_name": "OnePlus 126 cm Y Series 4K Ultra HD Smart Android ",
    "category": "Electronics",
    "input_tone": "Luxury & Premium",
    "input_target_audience": "Budget Shoppers & Deal Seekers",
    "channel": "Google Search Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "High Engagement & Clear Call-to-Action",
    "click_through_rate": 3.34
  },
  {
    "campaign_id": "CMP-101056",
    "product_name": "Philips GC1905 1440-Watt Steam Iron with Spray",
    "category": "Home&Kitchen",
    "input_tone": "Playful & Witty",
    "input_target_audience": "Budget Shoppers & Deal Seekers",
    "channel": "Google Search Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Engaging Emotional Hook & Tone Alignment",
    "click_through_rate": 3.5
  },
  {
    "campaign_id": "CMP-102313",
    "product_name": "MI 33W SonicCharge 2.0 USB Charger for Cellular Ph",
    "category": "Electronics",
    "input_tone": "Urgent & Scarcity-Driven",
    "input_target_audience": "Budget Shoppers & Deal Seekers",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Strong Value Proposition & High Savings Callout",
    "click_through_rate": 4.33
  },
  {
    "campaign_id": "CMP-104189",
    "product_name": "Fire-Boltt India's No 1 Smartwatch Brand Talk 2 Bl",
    "category": "Electronics",
    "input_tone": "Bold & Promotional",
    "input_target_audience": "Home & Family Managers",
    "channel": "SMS / WhatsApp Alert",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Strong Value Proposition & High Savings Callout",
    "click_through_rate": 6.45
  },
  {
    "campaign_id": "CMP-103414",
    "product_name": "Redmi Note 11 | 90Hz FHD+ AMOLED Display | Qualcom",
    "category": "Electronics",
    "input_tone": "Empathetic & Problem-Solving",
    "input_target_audience": "Busy Working Professionals",
    "channel": "Amazon Sponsored Ad",
    "feedback_label": "Thumbs Up",
    "feedback_reason": "Engaging Emotional Hook & Tone Alignment",
    "click_through_rate": 4.13
  }
];

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
  if (!window.ANALYTICS_DATA) window.ANALYTICS_DATA = ANALYTICS_DATA;
  if (!window.MODEL_METADATA) window.MODEL_METADATA = MODEL_METADATA;
  if (!window.PROMETHEUS_METRICS) window.PROMETHEUS_METRICS = PROMETHEUS_RAW_TEXT;
  if (!window.CATALOG_DATA || window.CATALOG_DATA.length === 0) window.CATALOG_DATA = INITIAL_CATALOG;
  if (!window.CAMPAIGN_LOGS_SAMPLE || window.CAMPAIGN_LOGS_SAMPLE.length === 0) window.CAMPAIGN_LOGS_SAMPLE = INITIAL_LOGS;
  window.INITIAL_CATALOG = INITIAL_CATALOG;
  window.INITIAL_LOGS = INITIAL_LOGS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TONES, AUDIENCES, CHANNELS, PRODUCTS,
    HEADLINE_TEMPLATES, COPY_TEMPLATES, CTA_TEMPLATES,
    MODEL_BENCHMARKS, FEATURE_IMPORTANCES_TOP20, LEXICONS, CLIENT_MODEL_PARAMS,
    ANALYTICS_DATA, MODEL_METADATA, PROMETHEUS_RAW_TEXT, INITIAL_CATALOG, INITIAL_LOGS,
    CATALOG_DATA: typeof window !== 'undefined' ? window.CATALOG_DATA : INITIAL_CATALOG,
    CAMPAIGN_LOGS_SAMPLE: typeof window !== 'undefined' ? window.CAMPAIGN_LOGS_SAMPLE : INITIAL_LOGS
  };
}
