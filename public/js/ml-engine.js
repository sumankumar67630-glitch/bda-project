/**
 * CampaignIQ Client-Side ML & NLP Evaluation Engine
 * Faithfully mirrors the Python Scikit-Learn pipeline and Feature Engineering.
 */

class MLEngine {
  constructor() {
    this.modelParams = CLIENT_MODEL_PARAMS;
    this.lexicons = LEXICONS;
  }

  countSyllables(word) {
    word = word.toLowerCase().trim();
    if (!word) return 1;
    if (word.endsWith('e') && !word.endsWith('le') && word.length > 2) {
      word = word.slice(0, -1);
    }
    const vowels = "aeiouy";
    let count = 0;
    let prevIsVowel = false;
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !prevIsVowel) count++;
      prevIsVowel = isVowel;
    }
    return Math.max(1, count);
  }

  computeChannelFitPenalty(channel, wordCount) {
    const limits = {
      'SMS / WhatsApp Alert': { min: 10, max: 40, ideal: 25 },
      'Google Search Ad': { min: 12, max: 35, ideal: 24 },
      'Instagram / Facebook Feed Ad': { min: 20, max: 70, ideal: 45 },
      'Amazon Sponsored Ad': { min: 25, max: 80, ideal: 50 },
      'Email Newsletter': { min: 50, max: 180, ideal: 100 }
    };
    const bound = limits[channel] || { min: 20, max: 80, ideal: 50 };
    if (wordCount >= bound.min && wordCount <= bound.max) {
      return 0.0;
    }
    if (wordCount < bound.min) {
      const deficit = bound.min - wordCount;
      return Math.min(1.0, deficit / bound.min);
    } else {
      const excess = wordCount - bound.max;
      return Math.min(1.0, excess / bound.max);
    }
  }

  extractNLPFeatures(text, headline = "", cta = "") {
    const fullText = `${headline} ${text} ${cta}`.trim();
    const cleanText = fullText.replace(/[^a-zA-Z0-9\s]/g, ' ').toLowerCase();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const totalWords = Math.max(1, words.length);

    // Sentence splitting
    const rawSentences = fullText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const totalSentences = Math.max(1, rawSentences.length);

    // Syllables
    const totalSyllables = words.reduce((acc, w) => acc + this.countSyllables(w), 0);

    // Flesch Reading Ease: 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
    const aslg = totalWords / totalSentences;
    const asw = totalSyllables / totalWords;
    let readingEase = 206.835 - (1.015 * aslg) - (84.6 * asw);
    readingEase = Math.max(0.0, Math.min(100.0, readingEase));

    // Sentiment polarity
    let posCount = 0;
    let negCount = 0;
    words.forEach(w => {
      if (this.lexicons.positive.includes(w)) posCount++;
      if (this.lexicons.negative.includes(w)) negCount++;
    });
    const sentimentScore = (posCount - negCount) / (posCount + negCount + 1);

    // Urgency
    let urgencyCount = 0;
    const lowerFull = fullText.toLowerCase();
    this.lexicons.urgency.forEach(term => {
      if (lowerFull.includes(term)) urgencyCount++;
    });
    const hasUrgency = urgencyCount > 0 ? 1 : 0;
    const urgencyIntensity = Math.min(3.0, urgencyCount);

    // CTA Check
    let hasCta = 0;
    if (cta.trim().length > 0) {
      hasCta = 1;
    } else {
      for (const verb of this.lexicons.cta_verbs) {
        if (words.includes(verb)) {
          hasCta = 1;
          break;
        }
      }
    }

    // Discount callout
    const discountRegex = /(%|off|save|discount|deal|flat|sale|₹|\$)/i;
    const hasDiscountCallout = discountRegex.test(fullText) ? 1 : 0;

    // Technical Spec density
    let specCount = 0;
    words.forEach(w => {
      if (this.lexicons.spec_keywords.includes(w)) specCount++;
    });
    const specDensity = specCount / totalWords;

    // Emojis & Punctuation
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const hasEmoji = emojiRegex.test(fullText) ? 1 : 0;
    const emojiMatches = fullText.match(new RegExp(emojiRegex.source, 'gu'));
    const emojiCount = emojiMatches ? emojiMatches.length : 0;

    const exclamationCount = (fullText.match(/!/g) || []).length;
    const questionCount = (fullText.match(/\?/g) || []).length;

    // Lexical diversity
    const uniqueWords = new Set(words).size;
    const lexicalDiversity = uniqueWords / totalWords;

    return {
      char_count: fullText.length,
      word_count: totalWords,
      sentence_count: totalSentences,
      reading_ease: Math.round(readingEase * 10) / 10,
      sentiment_score: Math.round(sentimentScore * 100) / 100,
      has_urgency: hasUrgency,
      urgency_intensity: urgencyIntensity,
      has_cta: hasCta,
      has_discount_callout: hasDiscountCallout,
      spec_density: Math.round(specDensity * 1000) / 1000,
      has_emoji: hasEmoji,
      emoji_count: emojiCount,
      exclamation_count: exclamationCount,
      question_count: questionCount,
      lexical_diversity: Math.round(lexicalDiversity * 100) / 100
    };
  }

  evaluateCopy(product, tone, audience, channel, headline, copy, cta) {
    const nlp = this.extractNLPFeatures(copy, headline, cta);
    const channelPenalty = this.computeChannelFitPenalty(channel, nlp.word_count);

    // Feature values dictionary
    const featValues = {
      'discounted_price': parseFloat(product.discounted_price || 299),
      'actual_price': parseFloat(product.actual_price || 599),
      'discount_percentage': parseFloat(product.discount_percentage || 50),
      'product_rating': parseFloat(product.rating || 4.2),
      'char_count': nlp.char_count,
      'word_count': nlp.word_count,
      'sentence_count': nlp.sentence_count,
      'reading_ease': nlp.reading_ease,
      'sentiment_score': nlp.sentiment_score,
      'has_urgency': nlp.has_urgency,
      'urgency_intensity': nlp.urgency_intensity,
      'has_cta': nlp.has_cta,
      'has_discount_callout': nlp.has_discount_callout,
      'spec_density': nlp.spec_density,
      'has_emoji': nlp.has_emoji,
      'emoji_count': nlp.emoji_count,
      'exclamation_count': nlp.exclamation_count,
      'question_count': nlp.question_count,
      'lexical_diversity': nlp.lexical_diversity,
      'channel_fit_penalty': channelPenalty
    };

    // Calculate z = intercept + sum(x_scaled * w_i)
    let z = this.modelParams.intercept;

    this.modelParams.feature_names.forEach((name, idx) => {
      const weight = this.modelParams.coefficients[idx];
      if (name.startsWith('cat__')) {
        let isMatch = 0;
        if (name.startsWith('cat__category_')) {
          const cat = name.replace('cat__category_', '');
          if (product.category && product.category.includes(cat)) isMatch = 1;
        } else if (name.startsWith('cat__input_tone_')) {
          const t = name.replace('cat__input_tone_', '');
          if (tone === t) isMatch = 1;
        } else if (name.startsWith('cat__input_target_audience_')) {
          const a = name.replace('cat__input_target_audience_', '');
          if (audience === a) isMatch = 1;
        } else if (name.startsWith('cat__channel_')) {
          const c = name.replace('cat__channel_', '');
          if (channel === c) isMatch = 1;
        }
        z += isMatch * weight;
      } else if (name.startsWith('num__')) {
        const featName = name.replace('num__', '');
        const rawVal = featValues[featName] !== undefined ? featValues[featName] : 0;
        const numIdx = this.modelParams.num_features.indexOf(featName);
        if (numIdx !== -1) {
          const mean = this.modelParams.num_means[numIdx];
          const scale = this.modelParams.num_scales[numIdx];
          const scaledVal = (rawVal - mean) / (scale || 1.0);
          z += scaledVal * weight;
        }
      }
    });

    // Logistic sigmoid
    const prob = 1.0 / (1.0 + Math.exp(-z));
    const scorePct = Math.round(prob * 1000) / 10;
    const isApproved = scorePct >= 65.0;

    // Diagnostic insights
    const insights = [];
    if (channelPenalty > 0.25) {
      insights.push(`Copy length (${nlp.word_count} words) deviates from optimal ${channel} bounds.`);
    } else {
      insights.push(`Perfect length fit (${nlp.word_count} words) for ${channel}.`);
    }

    if (!nlp.has_cta) {
      insights.push("Missing direct Call-To-Action verb.");
    } else {
      insights.push("Actionable Call-To-Action detected.");
    }

    if (nlp.reading_ease < 55) {
      insights.push("Complex phrasing detected (Reading ease < 55). Consider simpler words.");
    } else {
      insights.push(`Excellent readability score (${nlp.reading_ease}/100).`);
    }

    return {
      score: scorePct,
      prob: prob,
      isApproved: isApproved,
      status: isApproved ? 'APPROVED' : 'REVISION NEEDED',
      nlp: nlp,
      channelPenalty: channelPenalty,
      insights: insights
    };
  }

  generateLocalCopy(product, tone, audience, channel) {
    const prodName = product.name.split('(')[0].trim();
    const headlines = HEADLINE_TEMPLATES[tone] || HEADLINE_TEMPLATES['Bold & Promotional'];
    const rawHeadline = headlines[Math.floor(Math.random() * headlines.length)];
    const headline = rawHeadline
      .replace(/{product}/g, prodName)
      .replace(/{discount}/g, product.discount_percentage)
      .replace(/{price}/g, product.discounted_price);

    const rawCopy = COPY_TEMPLATES[tone] || COPY_TEMPLATES['Bold & Promotional'];
    const copy = rawCopy
      .replace(/{product}/g, prodName)
      .replace(/{features}/g, product.features || "premium durable materials")
      .replace(/{discount}/g, product.discount_percentage)
      .replace(/{price}/g, product.discounted_price)
      .replace(/{actual_price}/g, product.actual_price);

    const ctas = CTA_TEMPLATES[tone] || CTA_TEMPLATES['Bold & Promotional'];
    const rawCta = ctas[Math.floor(Math.random() * ctas.length)];
    const cta = rawCta
      .replace(/{discount}/g, product.discount_percentage)
      .replace(/{price}/g, product.discounted_price);

    return { headline, copy, cta };
  }

  runPrescriptiveTournament(product, tone, audience, channel, baseHeadline, baseCopy, baseCta, baseEval) {
    const candidates = [];
    const prodName = product.name.split('(')[0].trim();

    // Candidate 1: High-Impact Urgency & Scarcity Injector
    const c1Headline = `⚡ Ending Soon: Exclusive ${product.discount_percentage}% OFF on ${prodName}!`;
    const c1Copy = `${baseCopy.trim()} Limited stock remaining at this verified price of ₹${product.discounted_price}. Grab yours before the sale expires!`;
    const c1Cta = "Claim Deal Now ⏳";
    const c1Eval = this.evaluateCopy(product, tone, audience, channel, c1Headline, c1Copy, c1Cta);
    candidates.push({
      name: "Urgency & Scarcity Optimizer",
      headline: c1Headline,
      copy: c1Copy,
      cta: c1Cta,
      eval: c1Eval,
      desc: "Injected flash-sale scarcity markers and urgent CTA verb."
    });

    // Candidate 2: Readability & Fluency Polish
    const c2Headline = `Discover the Superior ${prodName} Today`;
    const c2Copy = `Upgrade your daily routine with ${prodName}. Designed for everyday reliability and smooth performance. Now just ₹${product.discounted_price} (${product.discount_percentage}% off MSRP). Experience the difference today.`;
    const c2Cta = "Shop Verified Quality ✨";
    const c2Eval = this.evaluateCopy(product, tone, audience, channel, c2Headline, c2Copy, c2Cta);
    candidates.push({
      name: "Readability & Fluency Polish",
      headline: c2Headline,
      copy: c2Copy,
      cta: c2Cta,
      eval: c2Eval,
      desc: "Simplified syllable structure to maximize Flesch Reading Ease."
    });

    // Candidate 3: Value Proposition & Discount Spotlight
    const c3Headline = `🔥 Save ₹${product.actual_price - product.discounted_price} Today on ${prodName}!`;
    const c3Copy = `Massive price drop! Get ${prodName} for only ₹${product.discounted_price} instead of ₹${product.actual_price}. Rated ${product.rating}★ by thousands of verified shoppers. Don't wait—order today.`;
    const c3Cta = `Get ${product.discount_percentage}% Off Now 🔥`;
    const c3Eval = this.evaluateCopy(product, tone, audience, channel, c3Headline, c3Copy, c3Cta);
    candidates.push({
      name: "Value & Social Proof Highlight",
      headline: c3Headline,
      copy: c3Copy,
      cta: c3Cta,
      eval: c3Eval,
      desc: "Spotlighted rupee savings and authentic customer ratings."
    });

    // Find best candidate
    let best = null;
    let maxScore = baseEval.score;

    candidates.forEach(cand => {
      if (cand.eval.score > maxScore) {
        maxScore = cand.eval.score;
        best = cand;
      }
    });

    const deltaLift = best ? Math.round((best.eval.score - baseEval.score) * 10) / 10 : 0.0;

    return {
      candidates: candidates,
      winner: best,
      deltaLift: deltaLift,
      improved: best !== null
    };
  }
}

// Global Singleton Instance
window.mlEngine = new MLEngine();
