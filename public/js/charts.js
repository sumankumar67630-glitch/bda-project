/**
 * CampaignIQ Responsive Canvas Charting Engine
 * High-performance, zero-dependency data visualizations for Netlify.
 */

class ChartEngine {
  constructor() {
    this.primaryColor = '#6366F1';
    this.secondaryColor = '#8B5CF6';
    this.emeraldColor = '#10B981';
    this.amberColor = '#F59E0B';
    this.roseColor = '#F43F5E';
    this.gridColor = 'rgba(255, 255, 255, 0.08)';
    this.textColor = '#94A3B8';
  }

  setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width || 400;
    const height = rect.height || canvas.height || 260;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  }

  renderBenchmarkChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = this.setupCanvas(canvas);

    ctx.clearRect(0, 0, width, height);

    const metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC'];
    const models = [
      { name: 'Logistic Regression', color: '#6366F1', data: [68.2, 69.5, 81.8, 75.1, 71.1] },
      { name: 'Random Forest', color: '#10B981', data: [66.9, 68.4, 80.8, 74.1, 71.6] },
      { name: 'Gradient Boosting', color: '#F59E0B', data: [66.8, 68.8, 79.4, 73.7, 72.1] }
    ];

    const padding = { top: 35, right: 20, bottom: 45, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Horizontal Grid Lines
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = this.textColor;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${100 - i * 20}%`, padding.left - 8, y + 3);
    }

    // Bars
    const groupWidth = chartWidth / metrics.length;
    const barWidth = groupWidth / 4.2;

    metrics.forEach((metric, mIdx) => {
      const groupX = padding.left + mIdx * groupWidth;

      models.forEach((mod, modIdx) => {
        const val = mod.data[mIdx];
        const barHeight = (val / 100) * chartHeight;
        const x = groupX + 10 + modIdx * (barWidth + 4);
        const y = padding.top + chartHeight - barHeight;

        // Gradient Fill
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, mod.color);
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();

        // Value text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${val.toFixed(0)}%`, x + barWidth / 2, y - 4);
      });

      // Metric label
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(metric, groupX + groupWidth / 2, height - 15);
    });

    // Legend
    const legendX = padding.left;
    const legendY = 16;
    let currX = legendX;

    models.forEach((mod) => {
      ctx.fillStyle = mod.color;
      ctx.fillRect(currX, legendY - 8, 10, 10);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(mod.name, currX + 15, legendY);
      currX += ctx.measureText(mod.name).width + 35;
    });
  }

  renderFeatureImportanceChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = this.setupCanvas(canvas);

    ctx.clearRect(0, 0, width, height);

    const items = FEATURE_IMPORTANCES_TOP20.slice(0, 8);
    const padding = { top: 15, right: 40, bottom: 25, left: 160 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const rowHeight = chartHeight / items.length;

    items.forEach((item, idx) => {
      const y = padding.top + idx * rowHeight;
      const barY = y + 6;
      const barH = rowHeight - 12;
      const maxVal = 0.65;
      const barW = Math.max(8, (item.importance / maxVal) * chartWidth);

      // Label
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11.5px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.feature, padding.left - 12, barY + barH / 2 + 4);

      // Track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.roundRect(padding.left, barY, chartWidth, barH, 4);
      ctx.fill();

      // Fill
      const grad = ctx.createLinearGradient(padding.left, 0, padding.left + barW, 0);
      grad.addColorStop(0, '#6366F1');
      grad.addColorStop(1, '#A855F7');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(padding.left, barY, barW, barH, 4);
      ctx.fill();

      // Value
      ctx.fillStyle = '#34D399';
      ctx.font = '10.5px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(item.importance.toFixed(3), padding.left + barW + 8, barY + barH / 2 + 4);
    });
  }

  renderCostCurveChart(canvasId, requests = 100000, hitRate = 0.45, tokenCost = 0.0015) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = this.setupCanvas(canvas);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 25, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Data points from 10k to 500k requests
    const points = [10000, 50000, 100000, 200000, 350000, 500000];
    const maxReq = 500000;
    const maxDailyCost = ((maxReq * 450) / 1000) * tokenCost; // ~$337

    // Grid
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const costVal = Math.round(maxDailyCost * (1 - i / 4));
      ctx.fillStyle = this.textColor;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`$${costVal}`, padding.left - 8, y + 4);
    }

    // X axis ticks
    points.forEach((req) => {
      const x = padding.left + (req / maxReq) * chartWidth;
      ctx.fillStyle = this.textColor;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${req / 1000}k`, x, height - 15);
    });

    const getCoords = (req, cached = false) => {
      const tokens = cached ? req * (1 - hitRate) * 450 : req * 450;
      const cost = (tokens / 1000) * tokenCost;
      const x = padding.left + (req / maxReq) * chartWidth;
      const y = padding.top + chartHeight - (cost / maxDailyCost) * chartHeight;
      return { x, y, cost };
    };

    // Draw Shaded Area (Savings)
    ctx.beginPath();
    points.forEach((req, idx) => {
      const pt = getCoords(req, false);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    for (let i = points.length - 1; i >= 0; i--) {
      const pt = getCoords(points[i], true);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fill();

    // Line 1: Without Cache (Red/Rose)
    ctx.beginPath();
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 2.5;
    points.forEach((req, idx) => {
      const pt = getCoords(req, false);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Line 2: With Semantic Cache (Emerald)
    ctx.beginPath();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2.5;
    points.forEach((req, idx) => {
      const pt = getCoords(req, true);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Highlight current selected request point
    const curUncached = getCoords(requests, false);
    const curCached = getCoords(requests, true);

    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(curUncached.x, curUncached.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(curCached.x, curCached.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Legend
    ctx.fillStyle = '#F43F5E';
    ctx.fillRect(padding.left, 8, 12, 4);
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Without Cache (Raw LLM API)', padding.left + 18, 14);

    ctx.fillStyle = '#10B981';
    ctx.fillRect(padding.left + 220, 8, 12, 4);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(`With Milvus Semantic Cache (${Math.round(hitRate * 100)}% Hit)`, padding.left + 238, 14);
  }

  renderTelemetryLatencyChart(canvasId, latencies = [18, 24, 85, 320, 420, 480, 850]) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { ctx, width, height } = this.setupCanvas(canvas);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 20, bottom: 35, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const buckets = [
      { label: '<25ms (Cache)', count: 45, color: '#10B981' },
      { label: '25-100ms', count: 18, color: '#34D399' },
      { label: '100-300ms', count: 12, color: '#6366F1' },
      { label: '300-600ms', count: 20, color: '#F59E0B' },
      { label: '>600ms (LLM)', count: 5, color: '#F43F5E' }
    ];

    const maxCount = 50;
    const barWidth = chartWidth / buckets.length - 12;

    buckets.forEach((b, idx) => {
      const x = padding.left + idx * (barWidth + 12) + 6;
      const barH = (b.count / maxCount) * chartHeight;
      const y = padding.top + chartHeight - barH;

      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Count
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${b.count}%`, x + barWidth / 2, y - 5);

      // Label
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.fillText(b.label, x + barWidth / 2, height - 12);
    });
  }
}

window.chartEngine = new ChartEngine();
