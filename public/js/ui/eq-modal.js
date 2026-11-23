// =========================================================================
// Audify Master DJ Equalizer & Real-Time Beat FX UI Modal
// Obsidian & Acid Lime Anton Aesthetic with High-Precision DSP Visualizer
// =========================================================================

(function initAudifyEqModal() {
  if (typeof window === 'undefined') return;
  if (window.__audify_eq_modal_initialized) return;
  window.__audify_eq_modal_initialized = true;

  let modalEl = null;
  let spectrumCanvas = null;
  let spectrumCtx = null;
  let animFrameId = null;

  function ensureStyles() {
    if (document.getElementById('audify-eq-styles')) return;
    const s = document.createElement('style');
    s.id = 'audify-eq-styles';
    s.textContent = `
      #audify-eq-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(3, 3, 5, 0.78);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 16px;
      }
      #audify-eq-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      #audify-eq-card {
        box-sizing: border-box;
        width: 100%;
        max-width: 580px;
        max-height: 90vh;
        overflow-y: auto;
        background: #050507;
        background-color: rgba(5, 5, 7, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 28px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 255, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.16);
        color: #f5f5f0;
        padding: 24px 24px 28px;
        transform: scale(0.95) translateY(12px);
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #audify-eq-overlay.open #audify-eq-card {
        transform: scale(1) translateY(0);
      }

      /* Emil Kowalski Tactile Squeeze Physics */
      .squeeze {
        transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease !important;
        will-change: transform;
      }
      .squeeze:active {
        transform: scale(0.95) !important;
      }

      .audify-eq-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .audify-eq-title {
        font-family: var(--font-anton), 'Anton', 'Syne', Impact, sans-serif;
        font-size: 24px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #ffffff;
      }
      .audify-eq-badge {
        font-family: monospace;
        font-size: 11px;
        background: rgba(212, 255, 0, 0.14);
        color: #D4FF00;
        border: 1px solid rgba(212, 255, 0, 0.4);
        border-radius: 9999px;
        padding: 3px 9px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        letter-spacing: 0.04em;
      }
      .audify-eq-pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #D4FF00;
        box-shadow: 0 0 8px #D4FF00;
        animation: audifyPulseDot 1s infinite alternate cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes audifyPulseDot {
        from { opacity: 0.4; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1.3); }
      }
      .audify-eq-close {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #f5f5f0;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .audify-eq-close:hover {
        background: rgba(212, 255, 0, 0.2);
        border-color: #D4FF00;
        color: #D4FF00;
        box-shadow: 0 0 12px rgba(212, 255, 0, 0.35);
      }
      .audify-eq-canvas-wrap {
        background: rgba(0, 0, 0, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 12px 14px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.6);
      }
      .audify-eq-canvas-label {
        font-family: monospace;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.6);
        display: flex;
        justify-content: space-between;
        letter-spacing: 0.06em;
      }
      #audify-spectrum-canvas {
        width: 100%;
        height: 64px;
        display: block;
      }
      .audify-eq-sliders {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 22px;
      }
      .audify-eq-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .audify-eq-row-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: var(--font-anton), 'Anton', 'Syne', Impact, sans-serif;
        letter-spacing: 0.03em;
        font-size: 15px;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.9);
      }
      .audify-eq-val {
        font-family: monospace;
        font-size: 12px;
        color: #D4FF00;
        background: rgba(212, 255, 0, 0.12);
        border: 1px solid rgba(212, 255, 0, 0.3);
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 700;
      }
      .audify-eq-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 4px;
        outline: none;
        cursor: pointer;
        transition: background 0.2s;
      }
      .audify-eq-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #D4FF00;
        box-shadow: 0 0 14px rgba(212, 255, 0, 0.7);
        border: 2px solid #ffffff;
        cursor: pointer;
        transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .audify-eq-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }
      .audify-eq-presets {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(102px, 1fr));
        gap: 8px;
        margin-bottom: 22px;
      }
      .audify-eq-preset-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 9px 6px;
        font-family: var(--font-anton), 'Anton', 'Syne', Impact, sans-serif;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: rgba(255, 255, 255, 0.75);
        cursor: pointer;
        text-align: center;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }
      .audify-eq-preset-btn:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.22);
      }
      .audify-eq-preset-btn.active {
        background: rgba(212, 255, 0, 0.16);
        border-color: #D4FF00;
        color: #D4FF00;
        box-shadow: 0 0 16px rgba(212, 255, 0, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.2);
      }
      .audify-eq-section-title {
        font-family: var(--font-anton), 'Anton', 'Syne', Impact, sans-serif;
        font-size: 13px;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.5);
        margin-bottom: 8px;
        letter-spacing: 0.06em;
      }
      .audify-eq-themes {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .audify-eq-theme-pill {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 9999px;
        padding: 5px 12px;
        font-size: 11px;
        font-family: monospace;
        color: rgba(255, 255, 255, 0.75);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .audify-eq-theme-pill:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.2);
      }
      .audify-eq-theme-pill.active {
        background: #D4FF00;
        color: #050507;
        font-weight: 700;
        border-color: #D4FF00;
        box-shadow: 0 0 14px rgba(212, 255, 0, 0.45);
      }

      @media (max-width: 600px) {
        #audify-eq-overlay {
          padding: 8px !important;
          box-sizing: border-box !important;
        }
        #audify-eq-card {
          box-sizing: border-box !important;
          width: 100% !important;
          max-width: min(calc(100vw - 16px), 520px) !important;
          padding: 16px 14px 20px !important;
          border-radius: 20px !important;
          max-height: 94dvh !important;
        }
        .audify-eq-title {
          font-size: 16px !important;
          gap: 6px !important;
        }
        .audify-eq-badge {
          font-size: 9px !important;
          padding: 2px 6px !important;
        }
        .audify-eq-slider-label {
          font-size: 11px !important;
        }
        .audify-eq-presets {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 6px !important;
        }
        .audify-eq-canvas-wrap {
          margin-bottom: 12px !important;
          padding: 8px 10px !important;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function createModalDOM() {
    if (modalEl) {
      if (!modalEl.isConnected && document.body) {
        document.body.appendChild(modalEl);
      }
      return modalEl;
    }
    ensureStyles();

    modalEl = document.createElement('div');
    modalEl.id = 'audify-eq-overlay';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');

    modalEl.innerHTML = `
      <div id="audify-eq-card" class="squeeze">
        <div class="audify-eq-header">
          <div class="audify-eq-title">
            <span>🎚️ MASTER EQ & BEAT FX</span>
            <span class="audify-eq-badge">
              <span class="audify-eq-pulse-dot"></span>
              <span>BEAT SYNC LIVE</span>
            </span>
          </div>
          <button id="audify-eq-close-btn" class="audify-eq-close squeeze" aria-label="Close Equalizer">✕</button>
        </div>

        <!-- 16-Bar Audio Spectrum Visualizer -->
        <div class="audify-eq-canvas-wrap">
          <div class="audify-eq-canvas-label">
            <span>REAL-TIME BEAT FLUX SPECTRUM</span>
            <span id="audify-eq-bpm-readout">124 BPM · LOCKED</span>
          </div>
          <canvas id="audify-spectrum-canvas" width="520" height="64"></canvas>
        </div>

        <!-- Beat Sync Calibration & Precision Nudge -->
        <div class="audify-eq-section-title">BEAT SYNC & LATENCY CALIBRATION:</div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
          <button id="audify-sync-tap-btn" class="audify-eq-preset-btn squeeze" style="flex:1;min-width:140px;background:rgba(212,255,0,0.14);border-color:#D4FF00;color:#D4FF00;font-weight:700;">🎯 SYNC DOWNBEAT NOW</button>
          <button id="audify-nudge-back-btn" class="audify-eq-preset-btn squeeze" style="flex:0 0 74px;" title="Nudge visual pulse 50ms earlier">⏪ -50ms</button>
          <button id="audify-nudge-fwd-btn" class="audify-eq-preset-btn squeeze" style="flex:0 0 74px;" title="Nudge visual pulse 50ms later">⏩ +50ms</button>
        </div>

        <!-- Quick Presets -->
        <div class="audify-eq-section-title">AUDIO & DYNAMICS PRESETS:</div>
        <div class="audify-eq-presets">
          <button class="audify-eq-preset-btn squeeze" data-preset="club_bass">💥 CLUB BASS MAX</button>
          <button class="audify-eq-preset-btn squeeze" data-preset="festival_punch">⚡ FESTIVAL PUNCH</button>
          <button class="audify-eq-preset-btn squeeze" data-preset="vocal_clarity">🎤 VOCAL CLARITY</button>
          <button class="audify-eq-preset-btn squeeze" data-preset="midnight_chill">🌙 CHILL LO-FI</button>
          <button class="audify-eq-preset-btn squeeze" data-preset="flat_studio">🎛️ FLAT MASTER</button>
        </div>

        <!-- 3-Band Parametric Equalizer Sliders -->
        <div class="audify-eq-section-title">PARAMETRIC TONE & BEAT SENSITIVITY:</div>
        <div class="audify-eq-sliders">
          <!-- Bass Boost -->
          <div class="audify-eq-row">
            <div class="audify-eq-row-top">
              <span>BASS BOOST (32Hz - 250Hz)</span>
              <span id="audify-val-bass" class="audify-eq-val">+4.0 dB</span>
            </div>
            <input type="range" id="audify-slider-bass" class="audify-eq-slider" min="-12" max="12" step="0.5" value="4">
          </div>

          <!-- Mid Vocals -->
          <div class="audify-eq-row">
            <div class="audify-eq-row-top">
              <span>MID PRESENCE (500Hz - 2kHz)</span>
              <span id="audify-val-mid" class="audify-eq-val">0.0 dB</span>
            </div>
            <input type="range" id="audify-slider-mid" class="audify-eq-slider" min="-12" max="12" step="0.5" value="0">
          </div>

          <!-- Treble Air -->
          <div class="audify-eq-row">
            <div class="audify-eq-row-top">
              <span>TREBLE AIR (4kHz - 16kHz)</span>
              <span id="audify-val-treble" class="audify-eq-val">+2.5 dB</span>
            </div>
            <input type="range" id="audify-slider-treble" class="audify-eq-slider" min="-12" max="12" step="0.5" value="2.5">
          </div>

          <!-- Aurora Beat Reactivity -->
          <div class="audify-eq-row">
            <div class="audify-eq-row-top">
              <span>AURORA BEAT SPIKE SENSITIVITY</span>
              <span id="audify-val-reactivity" class="audify-eq-val">1.8x</span>
            </div>
            <input type="range" id="audify-slider-reactivity" class="audify-eq-slider" min="0.5" max="3.0" step="0.1" value="1.8">
          </div>
        </div>

        <!-- Visual FX Themes -->
        <div class="audify-eq-section-title">AURORA SONG-CHANGE THEME:</div>
        <div class="audify-eq-themes">
          <button class="audify-eq-theme-pill squeeze active" data-theme="auto">🔀 DYNAMIC AUTO-SYNC</button>
          <button class="audify-eq-theme-pill squeeze" data-theme="prismatic-rgb">🌈 PRISMATIC RGB</button>
          <button class="audify-eq-theme-pill squeeze" data-theme="cyber-laser">⚡ CYBER LASER</button>
          <button class="audify-eq-theme-pill squeeze" data-theme="solar-flare">🔥 SOLAR PLASMA</button>
          <button class="audify-eq-theme-pill squeeze" data-theme="borealis-matrix">🌲 BOREALIS</button>
          <button class="audify-eq-theme-pill squeeze" data-theme="ultraviolet-hyper">🌌 ULTRAVIOLET</button>
          <button class="audify-eq-theme-pill squeeze" data-theme="acid-velocity">💥 ACID LIME</button>
          <button class="audify-eq-theme-pill squeeze" data-theme="optical-prism">💎 OPTICAL PRISM</button>
          <button class="audify-eq-theme-pill squeeze" data-theme="synthwave-dusk">🌅 SYNTHWAVE</button>
        </div>
      </div>
    `;

    if (document.body) {
      document.body.appendChild(modalEl);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (modalEl && !modalEl.parentNode && document.body) {
          document.body.appendChild(modalEl);
        }
      });
    }

    // Canvas setup
    spectrumCanvas = document.getElementById('audify-spectrum-canvas');
    if (spectrumCanvas) spectrumCtx = spectrumCanvas.getContext('2d');

    // Event Listeners
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeEqModal();
    });

    const closeBtn = document.getElementById('audify-eq-close-btn');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeEqModal();
      };
      closeBtn.addEventListener('touchend', (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        closeEqModal();
      }, { passive: false });
    }

    // Beat Sync Calibration Buttons
    const syncTapBtn = document.getElementById('audify-sync-tap-btn');
    if (syncTapBtn) {
      syncTapBtn.onclick = () => {
        window.__audify_beat_analyzer?.syncDownbeatNow?.();
        syncTapBtn.textContent = '⚡ LOCKED!';
        setTimeout(() => { syncTapBtn.textContent = '🎯 SYNC DOWNBEAT NOW'; }, 1000);
      };
    }

    const nudgeBackBtn = document.getElementById('audify-nudge-back-btn');
    if (nudgeBackBtn) {
      nudgeBackBtn.onclick = () => {
        const tot = window.__audify_beat_analyzer?.nudgeBeatPhase?.(-50) ?? -50;
        const bpmEl = document.getElementById('audify-eq-bpm-readout');
        if (bpmEl) bpmEl.textContent = `NUDGE: ${tot > 0 ? '+' : ''}${tot}ms`;
      };
    }

    const nudgeFwdBtn = document.getElementById('audify-nudge-fwd-btn');
    if (nudgeFwdBtn) {
      nudgeFwdBtn.onclick = () => {
        const tot = window.__audify_beat_analyzer?.nudgeBeatPhase?.(50) ?? 50;
        const bpmEl = document.getElementById('audify-eq-bpm-readout');
        if (bpmEl) bpmEl.textContent = `NUDGE: ${tot > 0 ? '+' : ''}${tot}ms`;
      };
    }

    // Sliders
    const bSlider = document.getElementById('audify-slider-bass');
    const mSlider = document.getElementById('audify-slider-mid');
    const tSlider = document.getElementById('audify-slider-treble');
    const rSlider = document.getElementById('audify-slider-reactivity');

    bSlider.oninput = (e) => {
      const v = parseFloat(e.target.value);
      document.getElementById('audify-val-bass').textContent = (v > 0 ? '+' : '') + v.toFixed(1) + ' dB';
      window.__audify_beat_analyzer?.setBass(v);
      highlightPreset(null);
    };

    mSlider.oninput = (e) => {
      const v = parseFloat(e.target.value);
      document.getElementById('audify-val-mid').textContent = (v > 0 ? '+' : '') + v.toFixed(1) + ' dB';
      window.__audify_beat_analyzer?.setMid(v);
      highlightPreset(null);
    };

    tSlider.oninput = (e) => {
      const v = parseFloat(e.target.value);
      document.getElementById('audify-val-treble').textContent = (v > 0 ? '+' : '') + v.toFixed(1) + ' dB';
      window.__audify_beat_analyzer?.setTreble(v);
      highlightPreset(null);
    };

    rSlider.oninput = (e) => {
      const v = parseFloat(e.target.value);
      document.getElementById('audify-val-reactivity').textContent = v.toFixed(1) + 'x';
      window.__audify_beat_analyzer?.setReactivity(v);
      highlightPreset(null);
    };

    // Preset buttons
    modalEl.querySelectorAll('.audify-eq-preset-btn').forEach(btn => {
      btn.onclick = () => {
        const pKey = btn.dataset.preset;
        window.__audify_beat_analyzer?.applyPreset(pKey);
        syncSlidersFromSettings();
        highlightPreset(pKey);
      };
    });

    // Theme pills
    modalEl.querySelectorAll('.audify-eq-theme-pill').forEach(pill => {
      pill.onclick = () => {
        const tKey = pill.dataset.theme;
        modalEl.querySelectorAll('.audify-eq-theme-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        window.__audify_beat_analyzer?.setTheme(tKey);
        if (typeof window.__audify_set_theme === 'function') {
          window.__audify_set_theme(tKey);
        } else if (typeof window.setAudifyPalette === 'function') {
          if (tKey === 'auto') {
            if (typeof window.setAudifyAuroraMode === 'function') window.setAudifyAuroraMode('auto');
          } else {
            window.setAudifyPalette(tKey);
          }
        }
      };
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalEl?.classList.contains('open')) {
        closeEqModal();
      }
    });

    syncSlidersFromSettings();
    return modalEl;
  }

  function syncSlidersFromSettings() {
    const s = window.__audify_beat_analyzer?.getSettings();
    if (!s || !modalEl) return;

    const bSlider = document.getElementById('audify-slider-bass');
    const mSlider = document.getElementById('audify-slider-mid');
    const tSlider = document.getElementById('audify-slider-treble');
    const rSlider = document.getElementById('audify-slider-reactivity');

    if (bSlider) {
      bSlider.value = s.bass;
      document.getElementById('audify-val-bass').textContent = (s.bass > 0 ? '+' : '') + s.bass.toFixed(1) + ' dB';
    }
    if (mSlider) {
      mSlider.value = s.mid;
      document.getElementById('audify-val-mid').textContent = (s.mid > 0 ? '+' : '') + s.mid.toFixed(1) + ' dB';
    }
    if (tSlider) {
      tSlider.value = s.treble;
      document.getElementById('audify-val-treble').textContent = (s.treble > 0 ? '+' : '') + s.treble.toFixed(1) + ' dB';
    }
    if (rSlider) {
      rSlider.value = s.reactivity;
      document.getElementById('audify-val-reactivity').textContent = s.reactivity.toFixed(1) + 'x';
    }

    highlightPreset(s.preset);

    if (s.theme) {
      modalEl.querySelectorAll('.audify-eq-theme-pill').forEach(p => {
        if (p.dataset.theme === s.theme) p.classList.add('active');
        else p.classList.remove('active');
      });
    }
  }

  function highlightPreset(key) {
    if (!modalEl) return;
    modalEl.querySelectorAll('.audify-eq-preset-btn').forEach(btn => {
      if (key && btn.dataset.preset === key) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  // 16-Bar Spectrum Canvas Render Loop (Zero-GC, No Layout Thrashing)
  let spectrumCanvasTargetW = 0;
  let spectrumCanvasTargetH = 0;

  function updateSpectrumCanvasDimensions() {
    if (!spectrumCanvas || !spectrumCanvas.isConnected) {
      spectrumCanvas = document.getElementById('audify-spectrum-canvas');
    }
    if (!spectrumCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = spectrumCanvas.getBoundingClientRect();
    if (rect.width > 0) {
      spectrumCanvasTargetW = Math.floor(rect.width * dpr);
      spectrumCanvasTargetH = Math.floor(rect.height * dpr);
      if (spectrumCanvas.width !== spectrumCanvasTargetW || spectrumCanvas.height !== spectrumCanvasTargetH) {
        spectrumCanvas.width = spectrumCanvasTargetW;
        spectrumCanvas.height = spectrumCanvasTargetH;
      }
    }
  }
  window.addEventListener('resize', updateSpectrumCanvasDimensions, { passive: true });

  function drawSpectrum() {
    if (!modalEl?.classList.contains('open')) return;
    animFrameId = requestAnimationFrame(drawSpectrum);
    if (!spectrumCtx || !spectrumCanvas) return;

    if (spectrumCanvas.width === 0 || spectrumCanvasTargetW === 0) {
      updateSpectrumCanvasDimensions();
    }

    const w = spectrumCanvas.width || spectrumCanvasTargetW || 300;
    const h = spectrumCanvas.height || spectrumCanvasTargetH || 100;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    spectrumCtx.clearRect(0, 0, w, h);

    // Update real-time BPM readout if available
    const bpmEl = document.getElementById('audify-eq-bpm-readout');
    if (bpmEl) {
      const bpm = window.__audify_beat_analyzer?.getCurrentBpm?.() || (liveDeck?.cue?.bpm >= 60 ? liveDeck.cue.bpm : 124);
      bpmEl.textContent = `${bpm} BPM · LOCKED`;
    }

    const spectrum = window.__audify_beat_analyzer?.getSpectrum() || [];
    const numBars = 16;
    const spacing = Math.max(2, Math.floor(3 * dpr));
    const barWidth = Math.floor((w - (numBars - 1) * spacing) / numBars);

    for (let i = 0; i < numBars; i++) {
      const val = Math.min(1.0, Math.max(0.04, spectrum[i] || 0.04));
      const barH = Math.max(4 * dpr, val * (h - 8 * dpr));
      const x = i * (barWidth + spacing);
      const y = h - barH;

      // Color gradient from Neon Lime to Electric Cyan to Hot Magenta
      const grad = spectrumCtx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, '#D4FF00');
      grad.addColorStop(0.55, '#00F0FF');
      grad.addColorStop(1, '#FF007F');

      spectrumCtx.fillStyle = grad;
      if (typeof spectrumCtx.roundRect === 'function') {
        spectrumCtx.beginPath();
        spectrumCtx.roundRect(x, y, barWidth, barH, [3 * dpr, 3 * dpr, 0, 0]);
        spectrumCtx.fill();
      } else {
        spectrumCtx.fillRect(x, y, barWidth, barH);
      }

      // Peak LED dot in luminous white
      spectrumCtx.fillStyle = '#ffffff';
      spectrumCtx.fillRect(x, Math.max(0, y - 3 * dpr), barWidth, Math.max(2, 2 * dpr));
    }
  }

  let isModalOpen = false;
  let lastToggleTime = 0;
  let lastTouchTime = 0;

  function openEqModal() {
    createModalDOM();
    if (!modalEl) return;
    if (!modalEl.isConnected && document.body) {
      document.body.appendChild(modalEl);
    }
    isModalOpen = true;
    modalEl.classList.add('open');
    modalEl.style.display = 'flex';
    modalEl.style.opacity = '1';
    modalEl.style.pointerEvents = 'auto';
    modalEl.style.visibility = 'visible';
    modalEl.style.zIndex = '999999';

    const btn = document.getElementById('audify-eq-btn');
    if (btn) btn.classList.add('active');

    updateSpectrumCanvasDimensions();
    syncSlidersFromSettings();

    if (!animFrameId) animFrameId = requestAnimationFrame(drawSpectrum);
    window.__audify_beat_analyzer?.initAudio?.();
  }

  function closeEqModal() {
    if (!modalEl) return;
    isModalOpen = false;
    modalEl.classList.remove('open');
    modalEl.style.display = 'none';
    modalEl.style.opacity = '0';
    modalEl.style.pointerEvents = 'none';
    modalEl.style.visibility = 'hidden';

    const btn = document.getElementById('audify-eq-btn');
    if (btn) btn.classList.remove('active');

    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function toggleEqModal() {
    const now = Date.now();
    if (now - lastToggleTime < 300) return;
    lastToggleTime = now;
    if (isModalOpen) {
      closeEqModal();
    } else {
      openEqModal();
    }
  }

  // Master Global Equalizer & FX Modal API
  window.__audify_eq_modal = {
    open: openEqModal,
    close: closeEqModal,
    toggle: toggleEqModal,
    isOpen: () => isModalOpen
  };

  // Backwards compatibility hooks
  window.__audify_open_eq_modal = openEqModal;
  window.__audify_close_eq_modal = closeEqModal;

  // Single unified document-level event delegation (capture phase)
  document.addEventListener('touchend', (e) => {
    const btn = e.target.closest('#audify-eq-btn');
    if (btn) {
      lastTouchTime = Date.now();
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      toggleEqModal();
    }
  }, { passive: false, capture: true });

  document.addEventListener('click', (e) => {
    if (Date.now() - lastTouchTime < 500) {
      // Suppress phantom click following touchend on mobile
      const btn = e.target.closest('#audify-eq-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }
    const btn = e.target.closest('#audify-eq-btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      toggleEqModal();
    }
  }, true);

  // Eagerly inject modal DOM so it is ready immediately
  createModalDOM();
  if (modalEl) {
    modalEl.style.display = 'none';
    modalEl.style.opacity = '0';
    modalEl.style.pointerEvents = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createModalDOM();
    });
  } else {
    createModalDOM();
  }
})();
