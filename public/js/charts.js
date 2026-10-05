/**
 * CampaignIQ Responsive Canvas Charting Engine
 * High-performance, zero-dependency data visualizations for Netlify.
 * Bulletproof rendering with cross-browser rounded rects, safe dimension handling,
 * and isolated try/catch error boundaries.
 */

class ChartEngine {
  constructor() {
    this.primaryColor = '#6366F1';
    this.secondaryColor = '#8B5CF6';
    this.emeraldColor = '#10B981';
    this.amberColor = '#F59E0B';
    this.roseColor = '#EF4444';
    this.gridColor = 'rgba(255, 255, 255, 0.08)';
    this.textColor = '#94A3B8';
  }

  /**
   * Safely calculates canvas display dimensions and scales bitmap for High-DPI screens.
   * Prevents infinite DPR multiplier loops and handles hidden/zero-width elements gracefully.
   */
  setupCanvas(canvas) {
    if (!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Determine natural layout width
    let width = rect.width;
    if (!width || width < 50) {
      width = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
    }
    if (!width || width < 50) {
      const fallbackWidth = (typeof window !== 'undefined' && window.innerWidth) 
        ? Math.max(340, Math.min(800, window.innerWidth - 300)) 
        : 600;
      width = parseInt(canvas.getAttribute('width')) || fallbackWidth;
    }

    // Determine natural layout height
    let height = rect.height;
    if (!height || height < 50) {
      height = parseInt(canvas.getAttribute('height')) || 260;
    }

    // Allocate internal high-resolution bitmap buffer
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Reset transform matrix and apply DPR scale cleanly
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    return { ctx, width, height };
  }

  /**
   * Cross-browser safe rounded rectangle implementation.
   * Completely immune to negative dimension crashes and missing ctx.roundRect support.
   */
  drawRoundRect(ctx, x, y, width, height, radius = 4) {
    if (!ctx || width <= 0 || height <= 0) return;
    const r = Math.min(
      Array.isArray(radius) ? Math.min(...radius) : radius,
      width / 2,
      height / 2
    );
    if (r <= 0) {
      ctx.rect(x, y, width, height);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // --- 1. Executive Overview: Dual Axis Tone Volume & Approval Chart ---
  renderToneVolumeAndApproval(canvasId, toneData) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const data = toneData || (window.ANALYTICS_DATA ? window.ANALYTICS_DATA.tone_agg : [
        { input_tone: 'Bold & Promotional', total_count: 1113, approval_pct: 74.4 },
        { input_tone: 'Playful & Witty', total_count: 1061, approval_pct: 67.9 },
        { input_tone: 'Urgent & Scarcity', total_count: 1061, approval_pct: 65.9 },
        { input_tone: 'Empathetic', total_count: 1076, approval_pct: 61.0 },
        { input_tone: 'Professional', total_count: 1066, approval_pct: 48.0 },
        { input_tone: 'Luxury & Premium', total_count: 1123, approval_pct: 35.2 }
      ]);

      const padding = { top: 35, right: 55, bottom: 50, left: 55 };
      const chartWidth = Math.max(100, width - padding.left - padding.right);
      const chartHeight = Math.max(80, height - padding.top - padding.bottom);

      const maxVolume = 1400;
      const minApproval = 30;
      const maxApproval = 100;

      // Horizontal grid lines
      ctx.strokeStyle = this.gridColor;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Left axis: Volume
        const vol = Math.round(maxVolume * (1 - i / 5));
        ctx.fillStyle = this.textColor;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${vol}`, padding.left - 8, y + 3);

        // Right axis: Approval %
        const app = Math.round(maxApproval - (i / 5) * (maxApproval - minApproval));
        ctx.textAlign = 'left';
        ctx.fillText(`${app}%`, width - padding.right + 8, y + 3);
      }

      const barWidth = Math.max(10, chartWidth / data.length - 16);
      const points = [];

      // Draw Bars (Volume)
      data.forEach((item, idx) => {
        const x = padding.left + idx * (barWidth + 16) + 8;
        const barH = (item.total_count / maxVolume) * chartHeight;
        const y = padding.top + chartHeight - barH;

        ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
        this.drawRoundRect(ctx, x, y, barWidth, barH, 4);
        ctx.fill();

        // Volume Label
        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${item.total_count}`, x + barWidth / 2, y - 4);

        // X Axis Label
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '10.5px Plus Jakarta Sans, sans-serif';
        const shortTone = (item.input_tone || '').split('&')[0].trim();
        ctx.fillText(shortTone, x + barWidth / 2, height - 15);

        // Line point (Approval %)
        const appNorm = (item.approval_pct - minApproval) / (maxApproval - minApproval);
        const ptY = padding.top + chartHeight - appNorm * chartHeight;
        points.push({ x: x + barWidth / 2, y: ptY, val: item.approval_pct });
      });

      // Draw Line & Points (Approval %)
      ctx.beginPath();
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 3;
      points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      points.forEach(pt => {
        ctx.fillStyle = '#1D4ED8';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#60A5FA';
        ctx.font = 'bold 9.5px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${pt.val}%`, pt.x, pt.y - 8);
      });

      // Legend
      ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
      ctx.fillRect(padding.left, 12, 12, 10);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Campaign Runs (Left Axis)', padding.left + 18, 20);

      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(padding.left + 190, 17);
      ctx.lineTo(padding.left + 205, 17);
      ctx.stroke();
      ctx.fillText('User Approval % (Right Axis)', padding.left + 212, 20);
    } catch (err) {
      console.error('Error in renderToneVolumeAndApproval:', err);
    }
  }

  // --- 2. Executive Overview: Horizontal Channel Approval Bar Chart ---
  renderChannelApproval(canvasId, chanData) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const data = chanData || (window.ANALYTICS_DATA ? window.ANALYTICS_DATA.chan_agg : [
        { channel: 'Amazon Sponsored Ad', approval_pct: 52.4 },
        { channel: 'SMS / WhatsApp Alert', approval_pct: 53.5 },
        { channel: 'Instagram / Facebook Feed Ad', approval_pct: 59.6 },
        { channel: 'Google Search Ad', approval_pct: 61.1 },
        { channel: 'Email Newsletter', approval_pct: 66.2 }
      ]);

      const padding = { top: 25, right: 55, bottom: 25, left: 140 };
      const chartWidth = Math.max(80, width - padding.left - padding.right);
      const chartHeight = Math.max(80, height - padding.top - padding.bottom);
      const barHeight = Math.max(12, chartHeight / data.length - 12);

      data.forEach((item, idx) => {
        const y = padding.top + idx * (barHeight + 12);
        const barW = Math.max(4, (item.approval_pct / 100) * chartWidth);

        // Label
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'right';
        const chName = (item.channel || '').replace(' / Facebook Feed Ad', '').replace(' / WhatsApp Alert', '');
        ctx.fillText(chName, padding.left - 10, y + barHeight / 2 + 4);

        // Track
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        this.drawRoundRect(ctx, padding.left, y, chartWidth, barHeight, 4);
        ctx.fill();

        // Fill with blue gradient
        const grad = ctx.createLinearGradient(padding.left, 0, padding.left + barW, 0);
        grad.addColorStop(0, '#1E40AF');
        grad.addColorStop(1, '#3B82F6');
        ctx.fillStyle = grad;
        this.drawRoundRect(ctx, padding.left, y, barW, barHeight, 4);
        ctx.fill();

        // Percentage text outside
        ctx.fillStyle = '#93C5FD';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.approval_pct}%`, padding.left + barW + 8, y + barHeight / 2 + 4);
      });
    } catch (err) {
      console.error('Error in renderChannelApproval:', err);
    }
  }

  // --- 3. Heatmap Matrix Renderer (Tone vs Category, Persona vs Tone, Persona Recommender) ---
  renderHeatmap(canvasId, matrixData, colorTheme = 'YlGnBu') {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      // Robust fallback resolution
      let matrix = matrixData;
      if (!matrix && window.ANALYTICS_DATA) {
        if (canvasId.includes('cat')) {
          matrix = window.ANALYTICS_DATA.matrix_tone_cat || window.ANALYTICS_DATA.tone_category_matrix;
        } else if (canvasId.includes('aud')) {
          matrix = window.ANALYTICS_DATA.matrix_aud_tone || window.ANALYTICS_DATA.aud_tone_matrix;
        }
      }
      if (!matrix) return;

      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const rowLabels = matrix.index || matrix.tones || [];
      const colLabels = matrix.columns || matrix.audiences || [];
      const values = matrix.values || [];

      if (!rowLabels.length || !colLabels.length || !values.length) return;

      const padding = { top: 52, right: 20, bottom: 20, left: 140 };
      const chartWidth = Math.max(100, width - padding.left - padding.right);
      const chartHeight = Math.max(80, height - padding.top - padding.bottom);

      const cellWidth = chartWidth / colLabels.length;
      const cellHeight = chartHeight / rowLabels.length;

      // Draw Column Headers (Rotated for clarity)
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      colLabels.forEach((col, cIdx) => {
        const cx = padding.left + cIdx * cellWidth + cellWidth / 2;
        ctx.save();
        ctx.translate(cx, padding.top - 8);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'left';
        const shortCol = (col || '').split('&')[0].substring(0, 13);
        ctx.fillText(shortCol, 0, 0);
        ctx.restore();
      });

      // Draw Rows and Cells
      rowLabels.forEach((row, rIdx) => {
        const cy = padding.top + rIdx * cellHeight;

        // Row Label
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'right';
        const shortRow = (row || '').split('&')[0].trim();
        ctx.fillText(shortRow, padding.left - 10, cy + cellHeight / 2 + 4);

        // Cells
        colLabels.forEach((col, cIdx) => {
          const cx = padding.left + cIdx * cellWidth;
          const val = values[rIdx] ? values[rIdx][cIdx] : null;

          if (val !== null && val !== undefined && !isNaN(val)) {
            // Color Interpolation
            const norm = Math.max(0, Math.min(1, (val - 25) / 65));
            if (colorTheme === 'Greens') {
              ctx.fillStyle = `rgba(16, 185, 129, ${0.15 + norm * 0.8})`;
            } else if (colorTheme === 'Viridis') {
              ctx.fillStyle = `rgba(99, 102, 241, ${0.15 + norm * 0.8})`;
            } else {
              // YlGnBu
              ctx.fillStyle = `rgba(14, 165, 233, ${0.15 + norm * 0.8})`;
            }
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          }

          ctx.fillRect(cx + 1, cy + 1, Math.max(1, cellWidth - 2), Math.max(1, cellHeight - 2));

          // Value text inside cell
          ctx.fillStyle = (val !== null && val >= 55) ? '#FFFFFF' : '#94A3B8';
          ctx.font = '9.5px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          const txt = (val !== null && val !== undefined && !isNaN(val)) ? `${Math.round(val)}%` : '-';
          ctx.fillText(txt, cx + cellWidth / 2, cy + cellHeight / 2 + 3.5);
        });
      });
    } catch (err) {
      console.error('Error in renderHeatmap:', err);
    }
  }

  // --- 4. Flesch Reading Ease Histogram ---
  renderReadingEaseHistogram(canvasId, histData) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const data = histData || (window.ANALYTICS_DATA ? window.ANALYTICS_DATA.reading_hist : {
        bins: ['20-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80', '80-85', '85-90', '90-95', '95-100'],
        up: [10, 15, 30, 45, 90, 160, 240, 390, 520, 680, 540, 410, 290, 180, 110, 60],
        down: [40, 60, 95, 140, 220, 290, 310, 340, 320, 250, 190, 120, 80, 50, 30, 15]
      });

      if (!data || !data.bins) return;

      const padding = { top: 30, right: 20, bottom: 40, left: 45 };
      const chartWidth = Math.max(80, width - padding.left - padding.right);
      const chartHeight = Math.max(60, height - padding.top - padding.bottom);

      const maxCount = 750;

      // Grid lines
      ctx.strokeStyle = this.gridColor;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = this.textColor;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(maxCount * (1 - i / 4))}`, padding.left - 6, y + 3);
      }

      const barW = Math.max(2, chartWidth / data.bins.length - 3);

      // Draw bars
      data.bins.forEach((b, idx) => {
        const x = padding.left + idx * (barW + 3);
        const upVal = data.up[idx] || 0;
        const downVal = data.down[idx] || 0;

        const upH = (upVal / maxCount) * chartHeight;
        const downH = (downVal / maxCount) * chartHeight;

        // Downvoted bar (Red translucent)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.fillRect(x, padding.top + chartHeight - downH, barW, downH);

        // Upvoted bar (Green translucent overlay)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.65)';
        ctx.fillRect(x, padding.top + chartHeight - upH, barW, upH);

        // X Axis Ticks
        if (idx % 2 === 0) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText((b || '').split('-')[0], x + barW / 2, height - 12);
        }
      });

      // Legend
      ctx.fillStyle = '#10B981';
      ctx.fillRect(padding.left, 10, 10, 10);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Thumbs Up (Approved)', padding.left + 16, 19);

      ctx.fillStyle = '#EF4444';
      ctx.fillRect(padding.left + 160, 10, 10, 10);
      ctx.fillText('Thumbs Down (Rejected)', padding.left + 176, 19);
    } catch (err) {
      console.error('Error in renderReadingEaseHistogram:', err);
    }
  }

  // --- 5. Root Causes Pareto Chart ---
  renderRootCausesPareto(canvasId, reasonsData) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const data = reasonsData || (window.ANALYTICS_DATA ? window.ANALYTICS_DATA.reasons_pareto : [
        { Reason: 'Copy Too Wordy & Cluttered for Channel', Count: 1071, Percentage: 39.8 },
        { Reason: 'Misaligned with Target Audience Intent', Count: 536, Percentage: 19.9 },
        { Reason: 'Poor Readability & Complex Phrasing', Count: 432, Percentage: 16.1 },
        { Reason: 'Mismatched Price & Tone', Count: 259, Percentage: 9.6 },
        { Reason: 'Lacks Product Features / Technical Specifics', Count: 182, Percentage: 6.8 },
        { Reason: 'Missing Clear Discount / Value Offer', Count: 137, Percentage: 5.1 },
        { Reason: 'Weak or Absent Call-to-Action', Count: 45, Percentage: 1.7 },
        { Reason: 'Tone Too Aggressive / Artificial Urgency', Count: 28, Percentage: 1.0 }
      ]);

      const isNarrow = width < 560;
      const padding = { top: 20, right: isNarrow ? 40 : 65, bottom: 20, left: isNarrow ? 140 : 240 };
      const chartWidth = Math.max(80, width - padding.left - padding.right);
      const chartHeight = Math.max(60, height - padding.top - padding.bottom);
      const barHeight = Math.max(8, chartHeight / data.length - 8);

      data.forEach((item, idx) => {
        const y = padding.top + idx * (barHeight + 8);
        const barW = Math.max(4, (item.Percentage / 45) * chartWidth);

        // Label
        ctx.fillStyle = '#CBD5E1';
        ctx.font = isNarrow ? '9.5px Plus Jakarta Sans, sans-serif' : '10.5px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'right';
        const maxLen = isNarrow ? 17 : 38;
        const labelText = item.Reason.length > maxLen ? item.Reason.substring(0, maxLen - 1) + '…' : item.Reason;
        ctx.fillText(labelText, padding.left - 10, y + barHeight / 2 + 3.5);

        // Track
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        this.drawRoundRect(ctx, padding.left, y, chartWidth, barHeight, 3);
        ctx.fill();

        // Fill with Red/Amber gradient
        const grad = ctx.createLinearGradient(padding.left, 0, padding.left + barW, 0);
        grad.addColorStop(0, '#B91C1C');
        grad.addColorStop(1, '#EF4444');
        ctx.fillStyle = grad;
        this.drawRoundRect(ctx, padding.left, y, Math.max(4, barW), barHeight, 3);
        ctx.fill();

        // Percentage and count label
        ctx.fillStyle = '#FCA5A5';
        ctx.font = 'bold 9.5px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.Percentage}% (${item.Count})`, padding.left + barW + 8, y + barHeight / 2 + 3.5);
      });
    } catch (err) {
      console.error('Error in renderRootCausesPareto:', err);
    }
  }

  // --- 6. Live Reactive ML Approval Score Gauge ---
  renderLiveGauge(canvasId, score = 70) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.72;
      const radius = Math.max(15, Math.min(centerX - 25, centerY - 20));

      const startAngle = Math.PI * 0.8;
      const endAngle = Math.PI * 2.2;
      const totalAngle = endAngle - startAngle;

      // Background track (Gray)
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.stroke();

      // Colored Active Arc
      const scoreAngle = startAngle + (Math.max(0, Math.min(100, score)) / 100) * totalAngle;
      const color = score >= 70 ? '#10B981' : (score >= 50 ? '#F59E0B' : '#EF4444');
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, scoreAngle);
      ctx.stroke();

      // Score Text in center
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 28px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${score.toFixed(1)}%`, centerX, centerY - 8);

      ctx.fillStyle = color;
      ctx.font = '700 11px JetBrains Mono, monospace';
      ctx.fillText(score >= 65 ? '✓ APPROVED' : '⚠ NEEDS REVISION', centerX, centerY + 14);
    } catch (err) {
      console.error('Error in renderLiveGauge:', err);
    }
  }

  // --- 7. Scalability Cost Curve Chart ---
  renderCostCurveChart(canvasId, requests = 250000, hitRate = 0.45, tokenCost = 0.0015) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const padding = { top: 30, right: 30, bottom: 40, left: 60 };
      const chartWidth = Math.max(80, width - padding.left - padding.right);
      const chartHeight = Math.max(60, height - padding.top - padding.bottom);

      const points = [10000, 50000, 100000, 200000, 350000, 500000];
      const maxReq = 500000;
      const maxDailyCost = ((maxReq * 450) / 1000) * tokenCost;

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

      points.forEach(req => {
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

      // Shaded Area
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

      // Line 1: Without Cache
      ctx.beginPath();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      points.forEach((req, idx) => {
        const pt = getCoords(req, false);
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Line 2: With Semantic Cache
      ctx.beginPath();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      points.forEach((req, idx) => {
        const pt = getCoords(req, true);
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Current pointer
      const curUncached = getCoords(requests, false);
      const curCached = getCoords(requests, true);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(curUncached.x, curUncached.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(curCached.x, curCached.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Legend
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(padding.left, 8, 12, 4);
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Without Cache (Raw LLM API)', padding.left + 18, 13);

      ctx.fillStyle = '#10B981';
      ctx.fillRect(padding.left + 220, 8, 12, 4);
      ctx.fillText(`With Milvus Semantic Cache (${Math.round(hitRate * 100)}% Hit)`, padding.left + 238, 13);
    } catch (err) {
      console.error('Error in renderCostCurveChart:', err);
    }
  }

  // --- 8. ML Benchmark Comparison Bars ---
  renderBenchmarkChart(canvasId) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC'];
      const models = [
        { name: 'Logistic Regression', color: '#6366F1', data: [68.2, 69.5, 81.8, 75.1, 71.1] },
        { name: 'Random Forest', color: '#10B981', data: [66.9, 68.4, 80.8, 74.1, 71.6] },
        { name: 'Gradient Boosting', color: '#F59E0B', data: [66.8, 68.8, 79.4, 73.7, 72.1] }
      ];

      const padding = { top: 35, right: 20, bottom: 45, left: 45 };
      const chartWidth = Math.max(80, width - padding.left - padding.right);
      const chartHeight = Math.max(60, height - padding.top - padding.bottom);

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

      const groupWidth = chartWidth / metrics.length;
      const barWidth = Math.max(4, groupWidth / 4.2);

      metrics.forEach((metric, mIdx) => {
        const groupX = padding.left + mIdx * groupWidth;

        models.forEach((mod, modIdx) => {
          const val = mod.data[mIdx];
          const barHeight = Math.max(2, (val / 100) * chartHeight);
          const x = groupX + 10 + modIdx * (barWidth + 4);
          const y = padding.top + chartHeight - barHeight;

          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, mod.color);
          grad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');

          ctx.fillStyle = grad;
          this.drawRoundRect(ctx, x, y, barWidth, barHeight, 3);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${val.toFixed(0)}%`, x + barWidth / 2, y - 4);
        });

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(metric, groupX + groupWidth / 2, height - 15);
      });

      const legendX = padding.left;
      const legendY = 16;
      let currX = legendX;

      models.forEach(mod => {
        ctx.fillStyle = mod.color;
        ctx.fillRect(currX, legendY - 8, 10, 10);
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(mod.name, currX + 15, legendY);
        currX += ctx.measureText(mod.name).width + 35;
      });
    } catch (err) {
      console.error('Error in renderBenchmarkChart:', err);
    }
  }

  // --- 9. Feature Importance Horizontal Bars ---
  renderFeatureImportanceChart(canvasId, count = 10) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const items = (typeof FEATURE_IMPORTANCES_TOP20 !== 'undefined' ? FEATURE_IMPORTANCES_TOP20 : (window.FEATURE_IMPORTANCES_TOP20 || [])).slice(0, count);
      const padding = { top: 15, right: 40, bottom: 25, left: 165 };
      const chartWidth = Math.max(80, width - padding.left - padding.right);
      const chartHeight = Math.max(60, height - padding.top - padding.bottom);
      const rowHeight = chartHeight / items.length;

      items.forEach((item, idx) => {
        const y = padding.top + idx * rowHeight;
        const barY = y + 4;
        const barH = Math.max(4, rowHeight - 8);
        const maxVal = 0.65;
        const barW = Math.max(8, (item.importance / maxVal) * chartWidth);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(item.feature, padding.left - 12, barY + barH / 2 + 4);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        this.drawRoundRect(ctx, padding.left, barY, chartWidth, barH, 4);
        ctx.fill();

        const grad = ctx.createLinearGradient(padding.left, 0, padding.left + barW, 0);
        grad.addColorStop(0, '#6366F1');
        grad.addColorStop(1, '#A855F7');
        ctx.fillStyle = grad;
        this.drawRoundRect(ctx, padding.left, barY, barW, barH, 4);
        ctx.fill();

        ctx.fillStyle = '#34D399';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(item.importance.toFixed(3), padding.left + barW + 8, barY + barH / 2 + 4);
      });
    } catch (err) {
      console.error('Error in renderFeatureImportanceChart:', err);
    }
  }

  // --- 10. Prometheus Telemetry Latency Distribution ---
  renderTelemetryLatencyChart(canvasId) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const setup = this.setupCanvas(canvas);
      if (!setup) return;
      const { ctx, width, height } = setup;

      ctx.clearRect(0, 0, width, height);

      const padding = { top: 20, right: 20, bottom: 35, left: 45 };
      const chartWidth = Math.max(80, width - padding.left - padding.right);
      const chartHeight = Math.max(60, height - padding.top - padding.bottom);

      const buckets = [
        { label: '<25ms (Cache)', count: 48, color: '#10B981' },
        { label: '25-100ms', count: 20, color: '#34D399' },
        { label: '100-300ms', count: 14, color: '#6366F1' },
        { label: '300-600ms', count: 13, color: '#F59E0B' },
        { label: '>600ms (LLM)', count: 5, color: '#EF4444' }
      ];

      const maxCount = 55;
      const barWidth = Math.max(8, chartWidth / buckets.length - 14);

      buckets.forEach((b, idx) => {
        const x = padding.left + idx * (barWidth + 14) + 6;
        const barH = (b.count / maxCount) * chartHeight;
        const y = padding.top + chartHeight - barH;

        ctx.fillStyle = b.color;
        this.drawRoundRect(ctx, x, y, barWidth, barH, 4);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${b.count}%`, x + barWidth / 2, y - 5);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px Plus Jakarta Sans, sans-serif';
        ctx.fillText(b.label, x + barWidth / 2, height - 12);
      });
    } catch (err) {
      console.error('Error in renderTelemetryLatencyChart:', err);
    }
  }
}

if (typeof window !== 'undefined') {
  window.chartEngine = new ChartEngine();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChartEngine };
}
