import os

# 1. Update aurora-and-mix-engine.js
aurora_path = os.path.join('public', 'js', 'ui', 'aurora-and-mix-engine.js')
with open(aurora_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace injectPlayerControls implementation
old_inject = text[text.find('function injectPlayerControls()'):text.find('function startMiniSpectrum()')]

new_inject = '''function injectPlayerControls() {
    ensurePillStyles();
    ensureBorderAttached();

    const targetHeader = document.querySelector('main > div.relative.z-30.flex, div.relative.z-30.flex');
    if (!targetHeader) return;
    const targetRightCluster = targetHeader.querySelector('.ml-auto');
    if (!targetRightCluster) return;

    let pillGroup = document.getElementById('audify-control-pills-container');
    if (!pillGroup) {
      pillGroup = document.createElement('div');
      pillGroup.id = 'audify-control-pills-container';
      pillGroup.innerHTML = `
        <button id="audify-eq-btn" class="audify-pill-btn squeeze" title="Master DJ Equalizer & FX">
          <span>🎚️ FX / EQ</span>
          <canvas id="audify-mini-spectrum-canvas" width="48" height="20" class="audify-mini-spectrum" aria-hidden="true"></canvas>
        </button>
      `;
    }

    pillGroup.style.display = 'inline-flex';
    pillGroup.style.alignItems = 'center';
    pillGroup.style.flexShrink = '0';
    pillGroup.style.marginRight = '8px';
    pillGroup.style.marginLeft = '0';

    if (!targetRightCluster.contains(pillGroup)) {
      targetRightCluster.prepend(pillGroup);
    }
  }

  // -----------------------------------------------------------------------
  // Live Miniature 16-Bar Audio Spectrum Visualizer Loop
  // HiDPI Retina Precision, Zero-GC Layout Thrashing & Gravity Falloff
  // -----------------------------------------------------------------------
  const miniPeakVals = new Float32Array(16);
  const miniPeakSpeeds = new Float32Array(16);
  const miniPeakHolds = new Int16Array(16);
  const miniSmoothed = new Float32Array(16);
  let miniSpectrumRunning = false;
  let miniLastW = 0;
  let miniLastH = 0;
  let miniCanvasEl = null;

  function updateMiniCanvasDimensions() {
    if (!miniCanvasEl || !miniCanvasEl.isConnected) {
      miniCanvasEl = document.getElementById('audify-mini-spectrum-canvas');
    }
    if (!miniCanvasEl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = miniCanvasEl.getBoundingClientRect();
    const targetW = Math.floor((rect.width > 0 ? rect.width : 44) * dpr);
    const targetH = Math.floor((rect.height > 0 ? rect.height : 16) * dpr);
    if (miniCanvasEl.width !== targetW || miniCanvasEl.height !== targetH) {
      miniCanvasEl.width = targetW;
      miniCanvasEl.height = targetH;
      miniLastW = targetW;
      miniLastH = targetH;
    }
  }
  window.addEventListener('resize', updateMiniCanvasDimensions, { passive: true });

  function renderMiniSpectrum() {
    requestAnimationFrame(renderMiniSpectrum);
    if (!miniCanvasEl || !miniCanvasEl.isConnected) {
      miniCanvasEl = document.getElementById('audify-mini-spectrum-canvas');
      if (miniCanvasEl) updateMiniCanvasDimensions();
    }
    if (!miniCanvasEl) return;
    const ctx = miniCanvasEl.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = miniCanvasEl.width || miniLastW || 44;
    const h = miniCanvasEl.height || miniLastH || 16;
    ctx.clearRect(0, 0, w, h);

    const spectrum = (window.__audify_beat_analyzer && typeof window.__audify_beat_analyzer.getSpectrum === 'function')
      ? window.__audify_beat_analyzer.getSpectrum()
      : null;

    const now = performance.now() * 0.003;
    const numBars = 16;
    const spacing = Math.max(1, Math.floor(1.2 * dpr));
    const barWidth = Math.max(1, Math.floor((w - (numBars - 1) * spacing) / numBars));

    // Gradient: Neon Acid Lime -> Electric Cyan -> Hot Magenta
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0.0, '#D4FF00');
    grad.addColorStop(0.55, '#00F0FF');
    grad.addColorStop(1.0, '#FF007F');

    for (let i = 0; i < numBars; i++) {
      let raw = (spectrum && spectrum[i] !== undefined) ? spectrum[i] : 0;
      if (!raw || raw < 0.04) {
        raw = 0.08 + 0.06 * Math.sin(now * 2.5 + i * 0.45);
      }
      const targetVal = Math.min(1.0, Math.max(0.04, raw));

      if (targetVal > miniSmoothed[i]) {
        miniSmoothed[i] += (targetVal - miniSmoothed[i]) * 0.75;
      } else {
        miniSmoothed[i] += (targetVal - miniSmoothed[i]) * 0.2;
      }
      const val = miniSmoothed[i];

      if (val >= miniPeakVals[i]) {
        miniPeakVals[i] = val;
        miniPeakSpeeds[i] = 0;
        miniPeakHolds[i] = 12;
      } else {
        if (miniPeakHolds[i] > 0) {
          miniPeakHolds[i]--;
        } else {
          miniPeakSpeeds[i] += 0.0035 * dpr;
          miniPeakVals[i] = Math.max(val, miniPeakVals[i] - miniPeakSpeeds[i]);
        }
      }

      const barH = Math.max(2 * dpr, val * (h - 3 * dpr));
      const x = i * (barWidth + spacing);
      const y = h - barH;

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);

      const peakY = h - Math.max(2 * dpr, miniPeakVals[i] * (h - 3 * dpr)) - 2 * dpr;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, Math.max(0, peakY), barWidth, Math.max(1, 1.5 * dpr));
    }
  }

  '''

text = text[:text.find('function injectPlayerControls()')] + new_inject + text[text.find('function startMiniSpectrum()'):]

# Replace ensurePillsAttached
old_ensure = text[text.find('function ensurePillsAttached()'):text.find('injectPlayerControls();\n  if (document.readyState')]
new_ensure = '''function ensurePillsAttached() {
    const pill = document.getElementById('audify-control-pills-container');
    const eqBtn = document.getElementById('audify-eq-btn');
    const topBar = document.querySelector('main > div.relative.z-30.flex, div.relative.z-30.flex');
    const rightCluster = topBar ? topBar.querySelector('.ml-auto') : null;

    if (!pill || !pill.isConnected || !eqBtn) {
      injectPlayerControls();
    } else if (rightCluster && !rightCluster.contains(pill)) {
      rightCluster.prepend(pill);
    }
  }

  '''

text = text[:text.find('function ensurePillsAttached()')] + new_ensure + text[text.find('injectPlayerControls();\n  if (document.readyState'):]

with open(aurora_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated aurora-and-mix-engine.js successfully!")

# 2. Update artist-explorer.js to not inject into the live player topBar
explorer_path = os.path.join('public', 'js', 'ui', 'artist-explorer.js')
with open(explorer_path, 'r', encoding='utf-8') as f:
    exp_text = f.read()

# Only attach navPill if on landing / wizard page, not on playing stage
exp_text = exp_text.replace(
    "function injectArtistHeaderNav() {",
    "function injectArtistHeaderNav() {\n    // Preserve clean player header without extra clutter\n    if (document.querySelector('main[data-paused]') || document.querySelector('.deck')) return;"
)

with open(explorer_path, 'w', encoding='utf-8') as f:
    f.write(exp_text)
print("Updated artist-explorer.js successfully!")
