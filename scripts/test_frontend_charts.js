/**
 * Verification test for CampaignIQ Netlify Frontend & Chart Engine
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting CampaignIQ Static Frontend & Chart Verification...\n');

// 1. Check all required static assets exist
const requiredAssets = [
  'public/index.html',
  'public/css/style.css',
  'public/js/dataset_bundle.js',
  'public/js/data.js',
  'public/js/ml-engine.js',
  'public/js/charts.js',
  'public/js/app.js',
  'public/data/catalog.json',
  'public/data/campaign_logs_sample.json',
  'public/data/analytics_data.json',
  'public/data/prometheus_export.txt',
  'public/data/model_metadata.json',
  'public/data/client_model_params.json'
];

for (const asset of requiredAssets) {
  const fullPath = path.resolve(__dirname, '..', asset);
  assert(fs.existsSync(fullPath), `Asset missing: ${asset}`);
  const sizeKb = (fs.statSync(fullPath).size / 1024).toFixed(1);
  console.log(`  ✓ Asset verified: ${asset} (${sizeKb} KB)`);
}

// 2. Verify all canvas IDs in public/index.html
const htmlContent = fs.readFileSync(path.resolve(__dirname, '..', 'public/index.html'), 'utf8');
const canvasMatches = [...htmlContent.matchAll(/<canvas\s+id="([^"]+)"/g)].map(m => m[1]);
console.log(`\n  ✓ Found ${canvasMatches.length} canvas elements in index.html:`, canvasMatches);

const expectedCanvases = [
  'tone-chart',
  'channel-chart',
  'heatmap-tone-cat',
  'heatmap-aud-tone',
  'reading-ease-chart',
  'pareto-chart',
  'live-gauge-canvas',
  'persona-heatmap-canvas',
  'benchmark-chart',
  'feature-importance-chart',
  'cost-curve-chart',
  'telemetry-chart'
];

for (const id of expectedCanvases) {
  assert(canvasMatches.includes(id), `Missing canvas in HTML: ${id}`);
}
console.log('  ✓ All 12 expected canvas IDs present in HTML');

// 3. Verify dataset_bundle and data.js exports & aliases
const bundle = require('../public/js/dataset_bundle.js');
const dataStore = require('../public/js/data.js');

assert(bundle.ANALYTICS_DATA, 'dataset_bundle must export ANALYTICS_DATA');
assert(bundle.ANALYTICS_DATA.matrix_tone_cat, 'matrix_tone_cat must exist in ANALYTICS_DATA');
assert(bundle.ANALYTICS_DATA.tone_category_matrix, 'tone_category_matrix alias must exist in ANALYTICS_DATA');
assert(bundle.ANALYTICS_DATA.matrix_aud_tone, 'matrix_aud_tone must exist in ANALYTICS_DATA');
assert(bundle.ANALYTICS_DATA.aud_tone_matrix, 'aud_tone_matrix alias must exist in ANALYTICS_DATA');
assert(Array.isArray(bundle.ANALYTICS_DATA.tone_agg), 'tone_agg must be an array');
assert(Array.isArray(bundle.ANALYTICS_DATA.chan_agg), 'chan_agg must be an array');
assert(Array.isArray(bundle.ANALYTICS_DATA.reasons_pareto), 'reasons_pareto must be an array');
assert(bundle.ANALYTICS_DATA.reading_hist, 'reading_hist must exist');
console.log('\n  ✓ Verified all ANALYTICS_DATA matrices, aggregations, and aliases in dataset_bundle.js');

// 4. Verify ML Engine
const { MLEngine } = require('../public/js/ml-engine.js');
Object.assign(global, dataStore);
const ml = new MLEngine();

const evalTest = ml.evaluateCopy(
  bundle.CATALOG_DATA[0],
  'Bold & Promotional',
  'Budget Shoppers & Deal Seekers',
  'Amazon Sponsored Ad',
  'Special Deal on Fast Charger',
  'Get this fast charging nylon cable at 50% discount today. Heavy duty build.',
  'Shop Now'
);
assert(typeof evalTest.score === 'number', 'evaluateCopy must return numeric score');
assert(typeof evalTest.prob === 'number', 'evaluateCopy must return numeric prob');
console.log(`  ✓ ML Engine copy evaluation verified (Score: ${evalTest.score}%, Prob: ${evalTest.prob})`);

const personaRec = ml.recommendOptimalParameters(bundle.CATALOG_DATA[0], 'Instagram / Facebook Feed Ad');
assert(personaRec.top5 && personaRec.top5.length === 5, 'Must return 5 top recommendations');
assert(personaRec.matrix && personaRec.matrix.tones.length === 6, 'Must return 6 tones');
assert(personaRec.matrix.audiences.length === 6, 'Must return 6 audiences');
assert(personaRec.matrix.values.length === 6, 'Must return 6 rows in matrix');
console.log('  ✓ ML Persona Recommender verified (36-cell matrix + Top 5 generated)');

// 5. Verify ChartEngine with Mock Context
const renderedCanvases = new Set();
global.window = {
  devicePixelRatio: 2,
  innerWidth: 1280,
  ANALYTICS_DATA: bundle.ANALYTICS_DATA,
  MODEL_METADATA: dataStore.MODEL_METADATA,
  FEATURE_IMPORTANCES_TOP20: dataStore.FEATURE_IMPORTANCES_TOP20,
  CATALOG_DATA: bundle.CATALOG_DATA
};

global.document = {
  getElementById: (id) => {
    renderedCanvases.add(id);
    return {
      id,
      getBoundingClientRect: () => ({ width: 620, height: 280 }),
      parentElement: { clientWidth: 620 },
      getAttribute: (attr) => attr === 'height' ? '280' : null,
      getContext: () => ({
        clearRect: () => {},
        setTransform: () => {},
        scale: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        fill: () => {},
        rect: () => {},
        fillRect: () => {},
        fillText: () => {},
        measureText: (txt) => ({ width: (txt || '').length * 6 }),
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        arc: () => {},
        quadraticCurveTo: () => {},
        closePath: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} })
      })
    };
  }
};

const { ChartEngine } = require('../public/js/charts.js');
const charts = new ChartEngine();

// Render all charts
charts.renderToneVolumeAndApproval('tone-chart', window.ANALYTICS_DATA.tone_agg);
charts.renderChannelApproval('channel-chart', window.ANALYTICS_DATA.chan_agg);
charts.renderHeatmap('heatmap-tone-cat', window.ANALYTICS_DATA.tone_category_matrix, 'YlGnBu');
charts.renderHeatmap('heatmap-aud-tone', window.ANALYTICS_DATA.aud_tone_matrix, 'Viridis');
charts.renderReadingEaseHistogram('reading-ease-chart', window.ANALYTICS_DATA.reading_hist);
charts.renderRootCausesPareto('pareto-chart', window.ANALYTICS_DATA.reasons_pareto);
charts.renderLiveGauge('live-gauge-canvas', 84.2);
charts.renderHeatmap('persona-heatmap-canvas', {
  index: personaRec.matrix.tones,
  columns: personaRec.matrix.audiences,
  values: personaRec.matrix.values
}, 'Greens');
charts.renderBenchmarkChart('benchmark-chart');
charts.renderFeatureImportanceChart('feature-importance-chart');
charts.renderCostCurveChart('cost-curve-chart', 250000, 0.45, 0.0015);
charts.renderTelemetryLatencyChart('telemetry-chart');

for (const id of expectedCanvases) {
  assert(renderedCanvases.has(id), `Canvas was not rendered: ${id}`);
}
console.log(`\n  ✓ All ${renderedCanvases.size} dashboard charts successfully rendered without exceptions!`);

console.log('\n🎉 ALL FRONTEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
