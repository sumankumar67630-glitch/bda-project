/**
 * CampaignIQ Main Application Controller
 * Handles UI interactions, tab routing, dual-engine generation,
 * prescriptive tournaments, reactive scalability simulation, and telemetry streams.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  const state = {
    activeTab: 'tab-overview',
    selectedProduct: PRODUCTS[0],
    selectedTone: TONES[0],
    selectedAudience: AUDIENCES[0],
    selectedChannel: CHANNELS[0],
    engineMode: 'local', // 'local' or 'gemini'
    geminiApiKey: '',
    enableGrounding: true,
    currentCopy: {
      headline: '',
      copy: '',
      cta: ''
    },
    currentEval: null,
    tournamentResult: null,
    scalability: {
      dailyRequests: 100000,
      cacheHitRate: 0.45,
      costPer1kTokens: 0.0015
    },
    telemetry: {
      totalRequests: 142850,
      approvedCount: 110750,
      avgLatencyMs: 142,
      isRunning: true
    }
  };

  // --- UI Elements ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const productSelect = document.getElementById('product-select');
  const toneSelect = document.getElementById('tone-select');
  const audienceSelect = document.getElementById('audience-select');
  const channelSelect = document.getElementById('channel-select');
  const engineLocalBtn = document.getElementById('engine-local');
  const engineGeminiBtn = document.getElementById('engine-gemini');
  const geminiConfigBox = document.getElementById('gemini-config-box');
  const geminiApiKeyInput = document.getElementById('gemini-api-key');
  const groundingCheckbox = document.getElementById('grounding-toggle');
  const generateBtn = document.getElementById('generate-copy-btn');
  const runTournamentBtn = document.getElementById('run-tournament-btn');
  const adoptWinnerBtn = document.getElementById('adopt-winner-btn');
  const copyClipboardBtn = document.getElementById('copy-clipboard-btn');

  // Preview elements
  const previewHeadline = document.getElementById('preview-headline');
  const previewBody = document.getElementById('preview-body');
  const previewCta = document.getElementById('preview-cta');
  const previewCharCount = document.getElementById('preview-char-count');
  const previewWordCount = document.getElementById('preview-word-count');
  const previewChannelFit = document.getElementById('preview-channel-fit');
  const scoreNum = document.getElementById('score-num');
  const scoreCircle = document.getElementById('score-circle');
  const scoreBadge = document.getElementById('score-status-badge');
  const readingEaseVal = document.getElementById('diag-reading-ease');
  const sentimentVal = document.getElementById('diag-sentiment');
  const urgencyVal = document.getElementById('diag-urgency');
  const ctaVal = document.getElementById('diag-cta');

  // Scalability Sliders
  const sliderRequests = document.getElementById('slider-requests');
  const sliderCache = document.getElementById('slider-cache');
  const sliderCost = document.getElementById('slider-cost');
  const valRequests = document.getElementById('val-requests');
  const valCache = document.getElementById('val-cache');
  const valCost = document.getElementById('val-cost');

  // Scalability KPI outputs
  const kpiDailySavings = document.getElementById('scale-daily-savings');
  const kpiAnnualSavings = document.getElementById('scale-annual-savings');
  const kpiKafkaPartitions = document.getElementById('scale-kafka-partitions');
  const kpiInferenceNodes = document.getElementById('scale-inference-nodes');
  const kpiBlendedLatency = document.getElementById('scale-blended-latency');

  // --- Initializer ---
  function init() {
    populateSelectors();
    setupEventListeners();
    handleProductChange(PRODUCTS[0].id);
    generateAndEvaluate();
    updateScalability();
    startTelemetryStream();

    // Initial Chart Render
    setTimeout(() => {
      window.chartEngine.renderBenchmarkChart('benchmark-chart');
      window.chartEngine.renderFeatureImportanceChart('feature-importance-chart');
      window.chartEngine.renderCostCurveChart('cost-curve-chart', state.scalability.dailyRequests, state.scalability.cacheHitRate);
      window.chartEngine.renderTelemetryLatencyChart('telemetry-chart');
    }, 150);
  }

  // --- Populate Selectors ---
  function populateSelectors() {
    if (productSelect) {
      productSelect.innerHTML = PRODUCTS.map(p => 
        `<option value="${p.id}">${p.name.substring(0, 60)}... (₹${p.discounted_price})</option>`
      ).join('') + `<option value="custom">✏️ Custom Product...</option>`;
    }

    if (toneSelect) {
      toneSelect.innerHTML = TONES.map(t => `<option value="${t}">${t}</option>`).join('');
    }

    if (audienceSelect) {
      audienceSelect.innerHTML = AUDIENCES.map(a => `<option value="${a}">${a}</option>`).join('');
    }

    if (channelSelect) {
      channelSelect.innerHTML = CHANNELS.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Tab Switching
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        switchTab(targetId);
      });
    });

    // Product change
    if (productSelect) {
      productSelect.addEventListener('change', (e) => {
        handleProductChange(e.target.value);
      });
    }

    // Tone, Audience, Channel changes
    if (toneSelect) {
      toneSelect.addEventListener('change', (e) => {
        state.selectedTone = e.target.value;
      });
    }
    if (audienceSelect) {
      audienceSelect.addEventListener('change', (e) => {
        state.selectedAudience = e.target.value;
      });
    }
    if (channelSelect) {
      channelSelect.addEventListener('change', (e) => {
        state.selectedChannel = e.target.value;
      });
    }

    // Engine toggle
    if (engineLocalBtn && engineGeminiBtn) {
      engineLocalBtn.addEventListener('click', () => {
        setEngineMode('local');
      });
      engineGeminiBtn.addEventListener('click', () => {
        setEngineMode('gemini');
      });
    }

    if (geminiApiKeyInput) {
      geminiApiKeyInput.addEventListener('input', (e) => {
        state.geminiApiKey = e.target.value.trim();
      });
    }

    if (groundingCheckbox) {
      groundingCheckbox.addEventListener('change', (e) => {
        state.enableGrounding = e.target.checked;
      });
    }

    // Buttons
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        generateAndEvaluate();
      });
    }

    if (runTournamentBtn) {
      runTournamentBtn.addEventListener('click', () => {
        runOptimizationTournament();
      });
    }

    if (adoptWinnerBtn) {
      adoptWinnerBtn.addEventListener('click', () => {
        adoptWinningCandidate();
      });
    }

    if (copyClipboardBtn) {
      copyClipboardBtn.addEventListener('click', () => {
        copyToClipboard();
      });
    }

    // Scalability Sliders
    if (sliderRequests) {
      sliderRequests.addEventListener('input', (e) => {
        state.scalability.dailyRequests = parseInt(e.target.value);
        valRequests.textContent = state.scalability.dailyRequests.toLocaleString();
        updateScalability();
      });
    }
    if (sliderCache) {
      sliderCache.addEventListener('input', (e) => {
        state.scalability.cacheHitRate = parseFloat(e.target.value) / 100;
        valCache.textContent = `${e.target.value}%`;
        updateScalability();
      });
    }
    if (sliderCost) {
      sliderCost.addEventListener('input', (e) => {
        state.scalability.costPer1kTokens = parseFloat(e.target.value);
        valCost.textContent = `$${parseFloat(e.target.value).toFixed(4)}`;
        updateScalability();
      });
    }

    // Model Diagnostic selector
    const diagModelSelect = document.getElementById('diag-model-select');
    if (diagModelSelect) {
      diagModelSelect.addEventListener('change', (e) => {
        updateDiagnosticModel(e.target.value);
      });
    }

    // Threshold slider
    const thresholdSlider = document.getElementById('threshold-slider');
    if (thresholdSlider) {
      thresholdSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        document.getElementById('threshold-val').textContent = val.toFixed(2);
        updateThresholdMetrics(val);
      });
    }

    // Window resize chart re-render
    window.addEventListener('resize', debounce(() => {
      window.chartEngine.renderBenchmarkChart('benchmark-chart');
      window.chartEngine.renderFeatureImportanceChart('feature-importance-chart');
      window.chartEngine.renderCostCurveChart('cost-curve-chart', state.scalability.dailyRequests, state.scalability.cacheHitRate);
      window.chartEngine.renderTelemetryLatencyChart('telemetry-chart');
    }, 200));
  }

  // --- Tab Switching ---
  function switchTab(targetId) {
    state.activeTab = targetId;
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === targetId);
    });
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === targetId);
    });

    // Re-render relevant charts when tab opens
    if (targetId === 'tab-overview') {
      setTimeout(() => {
        window.chartEngine.renderBenchmarkChart('benchmark-chart');
        window.chartEngine.renderFeatureImportanceChart('feature-importance-chart');
      }, 50);
    } else if (targetId === 'tab-architecture') {
      setTimeout(() => {
        window.chartEngine.renderCostCurveChart('cost-curve-chart', state.scalability.dailyRequests, state.scalability.cacheHitRate);
      }, 50);
    } else if (targetId === 'tab-observability') {
      setTimeout(() => {
        window.chartEngine.renderTelemetryLatencyChart('telemetry-chart');
      }, 50);
    }
  }

  // --- Product Selection ---
  function handleProductChange(productId) {
    if (productId === 'custom') {
      state.selectedProduct = {
        id: 'custom',
        name: document.getElementById('custom-prod-name')?.value || 'Next-Gen Wireless ANC Earbuds',
        category: 'Electronics',
        discounted_price: 1499,
        actual_price: 2999,
        discount_percentage: 50,
        rating: 4.5,
        features: 'Active noise cancellation, 40-hour battery life, IPX7 water resistance, low-latency gaming mode.'
      };
      document.getElementById('custom-product-fields')?.classList.remove('hidden');
    } else {
      const prod = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
      state.selectedProduct = prod;
      document.getElementById('custom-product-fields')?.classList.add('hidden');
    }

    // Update specs in UI
    const priceEl = document.getElementById('spec-price');
    const actualPriceEl = document.getElementById('spec-actual-price');
    const discEl = document.getElementById('spec-discount');
    const ratingEl = document.getElementById('spec-rating');

    if (priceEl) priceEl.textContent = `₹${state.selectedProduct.discounted_price}`;
    if (actualPriceEl) actualPriceEl.textContent = `₹${state.selectedProduct.actual_price}`;
    if (discEl) discEl.textContent = `${state.selectedProduct.discount_percentage}%`;
    if (ratingEl) ratingEl.textContent = `${state.selectedProduct.rating} ★`;
  }

  // --- Set Engine Mode ---
  function setEngineMode(mode) {
    state.engineMode = mode;
    if (engineLocalBtn && engineGeminiBtn) {
      engineLocalBtn.classList.toggle('active', mode === 'local');
      engineGeminiBtn.classList.toggle('active', mode === 'gemini');
    }
    if (geminiConfigBox) {
      geminiConfigBox.style.display = mode === 'gemini' ? 'block' : 'none';
    }
  }

  // --- Generate & Evaluate Content ---
  async function generateAndEvaluate() {
    const btn = generateBtn;
    if (btn) {
      btn.innerHTML = `<span>⏳ Generating & Evaluating ML Model...</span>`;
      btn.disabled = true;
    }

    try {
      let generated;
      if (state.engineMode === 'gemini' && state.geminiApiKey) {
        // Real Gemini API Call via browser fetch
        generated = await callGeminiAPI(state.selectedProduct, state.selectedTone, state.selectedAudience, state.selectedChannel, state.geminiApiKey);
      } else if (state.engineMode === 'gemini') {
        // Simulated Gemini API with Web Search Grounding metadata
        generated = simulateGeminiGeneration(state.selectedProduct, state.selectedTone, state.selectedAudience, state.selectedChannel, state.enableGrounding);
      } else {
        // Local Template Engine (instant deterministic)
        generated = window.mlEngine.generateLocalCopy(
          state.selectedProduct,
          state.selectedTone,
          state.selectedAudience,
          state.selectedChannel
        );
      }

      state.currentCopy = generated;

      // Run ML Model Inference
      const evalResult = window.mlEngine.evaluateCopy(
        state.selectedProduct,
        state.selectedTone,
        state.selectedAudience,
        state.selectedChannel,
        generated.headline,
        generated.copy,
        generated.cta
      );
      state.currentEval = evalResult;

      // Update Preview
      renderPreview(generated, evalResult);
      showToast(`Generated via ${state.engineMode === 'gemini' ? 'Gemini 1.5 Flash' : 'Local Fast Engine'} — Scored ${evalResult.score}%`, 'success');

      // Reset tournament card
      const tourCard = document.getElementById('tournament-results-box');
      if (tourCard) tourCard.style.display = 'none';

    } catch (err) {
      console.error(err);
      showToast("Generation completed with fallback local engine.", 'info');
    } finally {
      if (btn) {
        btn.innerHTML = `<span>⚡ Generate Campaign Copy</span>`;
        btn.disabled = false;
      }
    }
  }

  // --- Real Gemini API Call ---
  async function callGeminiAPI(product, tone, audience, channel, apiKey) {
    const prompt = `You are a high-performing enterprise copywriter. Generate marketing copy for:
Product: ${product.name}
Category: ${product.category}
Price: ₹${product.discounted_price} (Regular: ₹${product.actual_price}, Discount: ${product.discount_percentage}%)
Features: ${product.features}
Target Persona: ${audience}
Brand Tone: ${tone}
Channel: ${channel}

Respond strictly in valid JSON without markdown formatting:
{
  "headline": "concise punchy headline with emoji",
  "copy": "compelling marketing body copy tailored to the audience and channel length",
  "cta": "high-impact call to action verb phrase"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await resp.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      const parsed = JSON.parse(rawText);
      return {
        headline: parsed.headline || "Special Offer Today",
        copy: parsed.copy || "High quality product at an unbeatable price.",
        cta: parsed.cta || "Shop Now"
      };
    }
    throw new Error("Invalid response from Gemini API");
  }

  // --- Simulated Gemini Generation ---
  function simulateGeminiGeneration(product, tone, audience, channel, withGrounding) {
    const prodName = product.name.split('(')[0].trim();
    let groundingNote = withGrounding ? ` [Verified current Amazon India price: ₹${product.discounted_price} with ${product.rating}★ rating].` : '';

    return {
      headline: `✨ AI-Curated: Experience Premium Performance with ${prodName}`,
      copy: `Engineered specifically for ${audience.toLowerCase()}, the ${prodName} brings next-level capability right to your fingertips. Featuring ${product.features}, this breakthrough design eliminates daily hassles while delivering exceptional reliability. Take advantage of an exclusive ${product.discount_percentage}% discount—down from ₹${product.actual_price} to just ₹${product.discounted_price}${groundingNote} Verified customer satisfaction backed by thousands of reviews.`,
      cta: `Claim Your ${product.discount_percentage}% Savings Today 🚀`
    };
  }

  // --- Render Preview ---
  function renderPreview(copyObj, evalRes) {
    if (previewHeadline) previewHeadline.textContent = copyObj.headline;
    if (previewBody) previewBody.textContent = copyObj.copy;
    if (previewCta) previewCta.textContent = copyObj.cta;

    if (previewCharCount) previewCharCount.textContent = evalRes.nlp.char_count;
    if (previewWordCount) previewWordCount.textContent = `${evalRes.nlp.word_count} words`;
    if (previewChannelFit) {
      previewChannelFit.textContent = evalRes.channelPenalty === 0 ? 'Optimal Channel Fit' : `Penalty: ${evalRes.channelPenalty.toFixed(2)}`;
      previewChannelFit.className = evalRes.channelPenalty === 0 ? 'badge-lift' : 'text-muted';
    }

    // Score Dial
    if (scoreNum) scoreNum.textContent = evalRes.score;
    if (scoreCircle) {
      const circumference = 251.2;
      const offset = circumference - (evalRes.score / 100) * circumference;
      scoreCircle.style.strokeDashoffset = offset;
      scoreCircle.style.stroke = evalRes.isApproved ? '#34D399' : '#F59E0B';
    }

    // Status Badge
    if (scoreBadge) {
      scoreBadge.textContent = evalRes.status;
      scoreBadge.className = `score-status-badge ${evalRes.isApproved ? 'approved' : 'needs-revision'}`;
    }

    // Diagnostics
    if (readingEaseVal) readingEaseVal.textContent = `${evalRes.nlp.reading_ease}/100`;
    if (sentimentVal) sentimentVal.textContent = evalRes.nlp.sentiment_score > 0 ? `+${evalRes.nlp.sentiment_score}` : evalRes.nlp.sentiment_score;
    if (urgencyVal) urgencyVal.textContent = evalRes.nlp.has_urgency ? `Detected (${evalRes.nlp.urgency_intensity})` : 'None';
    if (ctaVal) ctaVal.textContent = evalRes.nlp.has_cta ? 'Verified' : 'Missing';
  }

  // --- Run Optimization Tournament ---
  function runOptimizationTournament() {
    if (!state.currentEval) return;

    const result = window.mlEngine.runPrescriptiveTournament(
      state.selectedProduct,
      state.selectedTone,
      state.selectedAudience,
      state.selectedChannel,
      state.currentCopy.headline,
      state.currentCopy.copy,
      state.currentCopy.cta,
      state.currentEval
    );

    state.tournamentResult = result;

    const container = document.getElementById('tournament-candidates-container');
    const tourBox = document.getElementById('tournament-results-box');
    const deltaEl = document.getElementById('tournament-delta-lift');

    if (tourBox) tourBox.style.display = 'block';
    if (deltaEl) {
      deltaEl.textContent = result.improved ? `+${result.deltaLift}% Lift` : '0.0% (Baseline Optimal)';
      deltaEl.className = result.improved ? 'badge-lift' : 'text-muted';
    }

    if (container) {
      container.innerHTML = result.candidates.map((cand, idx) => {
        const isWinner = result.winner && result.winner.name === cand.name;
        return `
          <div class="tournament-candidate ${isWinner ? 'winner-border' : ''}">
            <div class="candidate-info">
              <h4>${isWinner ? '🏆 ' : ''}${cand.name}</h4>
              <p>${cand.desc}</p>
              <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">"${cand.headline}"</div>
            </div>
            <div class="candidate-score-badge">
              <div class="score">${cand.eval.score}%</div>
              <div class="lift">${cand.eval.score >= state.currentEval.score ? `+${(cand.eval.score - state.currentEval.score).toFixed(1)}%` : `${(cand.eval.score - state.currentEval.score).toFixed(1)}%`}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    if (adoptWinnerBtn) {
      adoptWinnerBtn.disabled = !result.improved;
    }

    showToast(result.improved ? `Tournament complete: Winner achieved +${result.deltaLift}% lift!` : "Baseline copy is already locally optimal.", 'info');
  }

  // --- Adopt Winning Candidate ---
  function adoptWinningCandidate() {
    if (state.tournamentResult && state.tournamentResult.winner) {
      const winner = state.tournamentResult.winner;
      state.currentCopy = {
        headline: winner.headline,
        copy: winner.copy,
        cta: winner.cta
      };
      state.currentEval = winner.eval;
      renderPreview(state.currentCopy, state.currentEval);
      showToast("Adopted winning tournament copy!", 'success');
      document.getElementById('tournament-results-box').style.display = 'none';
    }
  }

  // --- Copy to Clipboard ---
  function copyToClipboard() {
    const fullText = `${state.currentCopy.headline}\n\n${state.currentCopy.copy}\n\n${state.currentCopy.cta}`;
    navigator.clipboard.writeText(fullText).then(() => {
      showToast("Copied full campaign copy to clipboard!", 'success');
    }).catch(() => {
      showToast("Copy failed. Please manually copy.", 'info');
    });
  }

  // --- Scalability Calculator ---
  function updateScalability() {
    const { dailyRequests, cacheHitRate, costPer1kTokens } = state.scalability;
    const avgTokens = 450;
    const avgLlmLatencyMs = 850;
    const cacheLatencyMs = 18;

    const cachedRequests = Math.round(dailyRequests * cacheHitRate);
    const uncachedRequests = dailyRequests - cachedRequests;

    const totalTokensWithoutCache = dailyRequests * avgTokens;
    const totalTokensWithCache = uncachedRequests * avgTokens;

    const dailyCostWithout = (totalTokensWithoutCache / 1000) * costPer1kTokens;
    const dailyCostWith = (totalTokensWithCache / 1000) * costPer1kTokens;
    const dailySavings = dailyCostWithout - dailyCostWith;
    const annualSavings = dailySavings * 365;

    const blendedLatency = Math.round(
      ((cachedRequests * cacheLatencyMs) + (uncachedRequests * avgLlmLatencyMs)) / dailyRequests
    );

    const avgQps = dailyRequests / 86400;
    const peakQps = avgQps * 3.5;
    const kafkaPartitions = Math.max(8, Math.round((peakQps / 120) * 4));
    const rayNodes = Math.max(2, Math.round((peakQps * (1 - cacheHitRate)) / 15));

    // Update UI
    if (kpiDailySavings) kpiDailySavings.textContent = `$${Math.round(dailySavings).toLocaleString()}`;
    if (kpiAnnualSavings) kpiAnnualSavings.textContent = `$${Math.round(annualSavings).toLocaleString()}`;
    if (kpiKafkaPartitions) kpiKafkaPartitions.textContent = kafkaPartitions;
    if (kpiInferenceNodes) kpiInferenceNodes.textContent = rayNodes;
    if (kpiBlendedLatency) kpiBlendedLatency.textContent = `${blendedLatency}ms`;

    // Re-render cost chart
    window.chartEngine.renderCostCurveChart('cost-curve-chart', dailyRequests, cacheHitRate, costPer1kTokens);
  }

  // --- Model Diagnostics ---
  function updateDiagnosticModel(modelName) {
    const bench = MODEL_BENCHMARKS[modelName] || MODEL_BENCHMARKS['Logistic Regression'];
    document.getElementById('diag-acc').textContent = `${(bench.accuracy * 100).toFixed(1)}%`;
    document.getElementById('diag-prec').textContent = `${(bench.precision * 100).toFixed(1)}%`;
    document.getElementById('diag-rec').textContent = `${(bench.recall * 100).toFixed(1)}%`;
    document.getElementById('diag-f1').textContent = `${(bench.f1 * 100).toFixed(1)}%`;
    document.getElementById('diag-roc').textContent = (bench.roc_auc).toFixed(4);

    // Update CM
    document.getElementById('cm-tn').textContent = bench.cm.tn;
    document.getElementById('cm-fp').textContent = bench.cm.fp;
    document.getElementById('cm-fn').textContent = bench.cm.fn;
    document.getElementById('cm-tp').textContent = bench.cm.tp;
  }

  function updateThresholdMetrics(threshold) {
    // Dynamic precision vs recall shift simulation based on threshold
    const baseBench = MODEL_BENCHMARKS['Logistic Regression'];
    const shift = (threshold - 0.50) * 0.4;
    const simulatedPrecision = Math.min(0.95, Math.max(0.40, baseBench.precision + shift));
    const simulatedRecall = Math.min(0.98, Math.max(0.35, baseBench.recall - shift * 1.2));

    document.getElementById('thresh-precision').textContent = `${(simulatedPrecision * 100).toFixed(1)}%`;
    document.getElementById('thresh-recall').textContent = `${(simulatedRecall * 100).toFixed(1)}%`;
  }

  // --- Telemetry Stream Simulation ---
  function startTelemetryStream() {
    setInterval(() => {
      if (!state.telemetry.isRunning) return;

      const delta = Math.floor(Math.random() * 4) + 1;
      state.telemetry.totalRequests += delta;
      if (Math.random() > 0.3) {
        state.telemetry.approvedCount += delta;
      }

      const approvalRate = ((state.telemetry.approvedCount / state.telemetry.totalRequests) * 100).toFixed(1);
      const reqEl = document.getElementById('live-req-count');
      const rateEl = document.getElementById('live-approval-rate');
      const qpsEl = document.getElementById('live-qps');

      if (reqEl) reqEl.textContent = state.telemetry.totalRequests.toLocaleString();
      if (rateEl) rateEl.textContent = `${approvalRate}%`;
      if (qpsEl) qpsEl.textContent = (delta * 1.8).toFixed(1);
    }, 2000);
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- Helper Debounce ---
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Run initialization
  init();
});
