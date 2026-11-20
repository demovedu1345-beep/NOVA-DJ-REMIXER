// =========================================================================
// Audify Aurora Borealis Engine & Professional Mix Action FX Controller
// High-Luminosity Audio-Reactive Dynamic WebGL/Canvas Aurora + Serato FX
// =========================================================================

(function initAudifyAuroraAndMixEngine() {
  if (window.__audify_aurora_initialized) return;
  window.__audify_aurora_initialized = true;

  // -----------------------------------------------------------------------
  // 1. High-Luminosity Beat-Reactive Aurora Canvas Background
  // -----------------------------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.id = 'audify-aurora-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    opacity: 0.85;
    mix-blend-mode: screen;
    filter: blur(28px);
    transition: opacity 0.5s ease;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Aurora Color Palettes that rotate on beats
  const PALETTES = [
    { name: 'Neon Cyber', c1: [0, 245, 255], c2: [157, 0, 255], c3: [200, 255, 0], c4: [255, 0, 128] },
    { name: 'Solar Lime', c1: [200, 255, 0], c2: [0, 255, 170], c3: [255, 170, 0], c4: [120, 0, 255] },
    { name: 'Ultra Violet', c1: [140, 0, 255], c2: [255, 0, 160], c3: [0, 210, 255], c4: [255, 220, 0] },
    { name: 'Electric Flame', c1: [255, 30, 80], c2: [255, 150, 0], c3: [200, 255, 0], c4: [0, 230, 255] },
  ];

  let currentPaletteIdx = 0;
  let targetPaletteIdx = 0;
  let paletteTransition = 1;
  let beatPulse = 1.0;
  let bpm = 126;
  let isPlaying = false;
  let time = 0;

  // Trigger beat pulse when music kicks
  window.triggerAudifyBeatPulse = function (intensity = 1.6) {
    beatPulse = Math.max(beatPulse, intensity);
    if (Math.random() > 0.4) {
      targetPaletteIdx = (currentPaletteIdx + 1) % PALETTES.length;
      paletteTransition = 0;
    }
  };

  // Simplex-inspired smooth wave curtain
  function drawAuroraCurtain(time, layer, curPalette, nextPalette, pMix, pulse) {
    const pal = curPalette;
    const nPal = nextPalette;
    
    // Interpolate colors
    function mixColor(c1, c2, m) {
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * m),
        Math.round(c1[1] + (c2[1] - c1[1]) * m),
        Math.round(c1[2] + (c2[2] - c1[2]) * m),
      ];
    }

    const col1 = mixColor(pal.c1, nPal.c1, pMix);
    const col2 = mixColor(pal.c2, nPal.c2, pMix);
    const col3 = mixColor(pal.c3, nPal.c3, pMix);

    const speed = (isPlaying ? 1.4 : 0.4) * (1 + (pulse - 1) * 0.8);
    const t = time * speed + layer * 1.5;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, height);

    const points = 32;
    const slice = width / points;

    for (let i = 0; i <= points; i++) {
      const x = i * slice;
      const wave1 = Math.sin(t * 0.8 + i * 0.22) * (height * 0.18 * pulse);
      const wave2 = Math.cos(t * 1.3 - i * 0.15) * (height * 0.14 * pulse);
      const wave3 = Math.sin(t * 0.4 + i * 0.08) * (height * 0.1 * pulse);
      const baseH = height * (0.35 + layer * 0.15);
      const y = baseH + wave1 + wave2 + wave3;

      if (i === 0) ctx.lineTo(x, y);
      else {
        const prevX = (i - 1) * slice;
        ctx.bezierCurveTo(prevX + slice / 2, y, x - slice / 2, y, x, y);
      }
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    // High brightness luminous gradient
    const grad = ctx.createLinearGradient(0, height * 0.1, width, height * 0.85);
    const alpha = (0.28 + (pulse - 1) * 0.25) * (isPlaying ? 1.0 : 0.45);
    grad.addColorStop(0, `rgba(${col1[0]}, ${col1[1]}, ${col1[2]}, ${alpha * 1.3})`);
    grad.addColorStop(0.5, `rgba(${col2[0]}, ${col2[1]}, ${col2[2]}, ${alpha * 1.1})`);
    grad.addColorStop(1, `rgba(${col3[0]}, ${col3[1]}, ${col3[2]}, 0)`);

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  // Animation Loop
  let lastFrameTime = performance.now();
  function renderAurora() {
    requestAnimationFrame(renderAurora);
    const now = performance.now();
    const dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    time += dt;

    // Decay beat pulse smoothly
    beatPulse += (1.0 - beatPulse) * Math.min(1, dt * 4.5);
    if (paletteTransition < 1) {
      paletteTransition = Math.min(1, paletteTransition + dt * 1.8);
      if (paletteTransition >= 1) currentPaletteIdx = targetPaletteIdx;
    }

    ctx.clearRect(0, 0, width, height);

    const curP = PALETTES[currentPaletteIdx];
    const nxtP = PALETTES[targetPaletteIdx];

    // Multi-layered depth
    drawAuroraCurtain(time, 0, curP, nxtP, paletteTransition, beatPulse);
    drawAuroraCurtain(time, 1, curP, nxtP, paletteTransition, beatPulse);
    drawAuroraCurtain(time, 2, curP, nxtP, paletteTransition, beatPulse);
  }
  requestAnimationFrame(renderAurora);

  // -----------------------------------------------------------------------
  // 2. Web Audio FX Synthesizer (Drum Roll, Riser, Echo, Sub Drop)
  // -----------------------------------------------------------------------
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const SOUND_FX = {
    drum_roll() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const count = 18;
      const step = 0.07;
      for (let i = 0; i < count; i++) {
        const t = now + i * step;
        const progress = i / count;
        // Snare / Rim hit
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + 260 * progress, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.05);

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.35 + 0.5 * progress, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

        // White noise layer
        const bSize = ctx.sampleRate * 0.05;
        const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
        const data = b.getChannelData(0);
        for (let j = 0; j < bSize; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bSize * 0.3));
        const noise = ctx.createBufferSource();
        noise.buffer = b;
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.1 + 0.4 * progress, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);
        noise.connect(nGain);
        nGain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.06);
        noise.start(t);
        noise.stop(t + 0.05);
      }

      // Final crash drop impact
      setTimeout(() => SOUND_FX.sub_drop(), 1250);
    },

    filter_sweep() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const dur = 1.4;
      const bSize = ctx.sampleRate * dur;
      const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
      const data = b.getChannelData(0);
      for (let j = 0; j < bSize; j++) {
        const p = j / bSize;
        data[j] = (Math.random() * 2 - 1) * Math.pow(p, 1.8);
      }
      const src = ctx.createBufferSource();
      src.buffer = b;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 4.0;
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(8000, now + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.7, now + dur - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(now);
      src.stop(now + dur);
    },

    echo_drop() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);

      const delay = ctx.createDelay();
      delay.delayTime.value = 0.18;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.65;

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(ctx.destination);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    },

    sub_drop() {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.65);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  };

  // Current selected mix mode
  let activeMixStyle = localStorage.getItem('audify_mix_action') || 'drum_roll';

  window.setAudifyMixStyle = function (style) {
    activeMixStyle = style;
    localStorage.setItem('audify_mix_action', style);
    const label = document.getElementById('audify-mix-label');
    if (label) label.textContent = getMixStyleLabel(style);
  };

  function getMixStyleLabel(style) {
    if (style === 'drum_roll') return '🥁 DRUM ROLL';
    if (style === 'blend') return '🎚 CLUB BLEND';
    if (style === 'filter_sweep') return '🌊 FILTER SWEEP';
    if (style === 'echo_drop') return '🔊 ECHO DROP';
    if (style === 'sub_drop') return '💥 SUB IMPACT';
    return '🥁 DRUM ROLL';
  }

  // Hook into Skip clicks
  document.addEventListener('click', (e) => {
    getAudioCtx();
    const btn = e.target.closest('button, [role="button"]');
    if (!btn) return;
    const text = (btn.textContent || '').trim().toUpperCase();
    if (text.includes('SKIP') || text.includes('NEXT')) {
      window.triggerAudifyBeatPulse(2.4);
      if (SOUND_FX[activeMixStyle]) {
        SOUND_FX[activeMixStyle]();
      }
    }
  }, true);

  // Periodic check for music playing state to drive aurora energy
  setInterval(() => {
    const playBtn = document.querySelector('button[aria-label*="Pause"], button[aria-label*="pause"]');
    const hasPause = Boolean(playBtn) || document.body.innerText.includes('PAUSE');
    isPlaying = hasPause;
    if (isPlaying) {
      window.triggerAudifyBeatPulse(1.15);
    }
  }, 500);

  // -----------------------------------------------------------------------
  // 3. Inject Ultra-Sleek "MIX ACTION" Pill & "BROWSE BY LANGUAGE" Section
  // -----------------------------------------------------------------------
  function injectPlayerControls() {
    if (document.getElementById('audify-mix-pill-container')) return;

    // 1. Inject Mix Action Pill in navigation / header
    const navHeader = document.querySelector('header, nav, .flex.justify-between');
    if (navHeader) {
      const pill = document.createElement('div');
      pill.id = 'audify-mix-pill-container';
      pill.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-left: 12px;
        position: relative;
        z-index: 40;
      `;
      pill.innerHTML = `
        <div style="position:relative">
          <button id="audify-mix-btn" class="squeeze" style="
            display:flex;
            align-items:center;
            gap:6px;
            background:rgba(200,255,0,0.12);
            border:1.5px solid #c8ff00;
            color:#c8ff00;
            padding:7px 14px;
            border-radius:9999px;
            font-family:var(--font-anton), 'Anton', sans-serif;
            font-size:13px;
            letter-spacing:0.04em;
            cursor:pointer;
            transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 0 16px rgba(200,255,0,0.2);
          ">
            <span style="font-size:14px">MIX:</span>
            <span id="audify-mix-label">${getMixStyleLabel(activeMixStyle)}</span>
            <span style="font-size:10px;opacity:0.8">▼</span>
          </button>
          <div id="audify-mix-dropdown" style="
            display:none;
            position:absolute;
            top:115%;
            left:0;
            min-width:180px;
            background:#0a0a0c;
            border:1.5px solid rgba(255,255,255,0.15);
            border-radius:14px;
            padding:6px;
            box-shadow:0 18px 48px rgba(0,0,0,0.85);
            backdrop-filter:blur(20px);
            z-index:999;
          ">
            <div class="audify-mix-opt" data-style="drum_roll" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🥁 DRUM ROLL BUILD</div>
            <div class="audify-mix-opt" data-style="blend" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🎚 CLUB S-BLEND</div>
            <div class="audify-mix-opt" data-style="filter_sweep" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🌊 FILTER SWEEP</div>
            <div class="audify-mix-opt" data-style="echo_drop" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">🔊 ECHO OUT DROP</div>
            <div class="audify-mix-opt" data-style="sub_drop" style="padding:8px 12px;border-radius:8px;font-family:var(--font-anton), 'Anton', sans-serif;font-size:13px;color:#fff;cursor:pointer;transition:background 0.15s">💥 808 SUB IMPACT</div>
          </div>
        </div>
      `;
      navHeader.appendChild(pill);

      const btn = document.getElementById('audify-mix-btn');
      const dd = document.getElementById('audify-mix-dropdown');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
      });

      document.addEventListener('click', () => {
        if (dd) dd.style.display = 'none';
      });

      pill.querySelectorAll('.audify-mix-opt').forEach((opt) => {
        opt.addEventListener('mouseenter', () => (opt.style.background = 'rgba(200,255,0,0.15)'));
        opt.addEventListener('mouseleave', () => (opt.style.background = 'transparent'));
        opt.addEventListener('click', () => {
          window.setAudifyMixStyle(opt.dataset.style);
          dd.style.display = 'none';
          SOUND_FX[opt.dataset.style]?.();
        });
      });
    }

    // 2. Inject Language Section into wizard / main panel
    if (!document.getElementById('audify-languages-section')) {
      const mainContainer = document.querySelector('main') || document.body;
      const langSection = document.createElement('section');
      langSection.id = 'audify-languages-section';
      langSection.style.cssText = `
        margin: 40px auto;
        max-width: 1040px;
        padding: 24px;
        border-radius: 24px;
        border: 1.5px solid rgba(255,255,255,0.1);
        background: rgba(10,10,12,0.85);
        backdrop-filter: blur(24px);
        position: relative;
        z-index: 20;
        box-shadow: 0 24px 64px rgba(0,0,0,0.6);
      `;

      const ALL_LANGUAGES = [
        { id: 'hindi', label: 'Hindi', count: '1000+ Songs', tag: 'Bollywood · Dance · Retro · Hip-Hop' },
        { id: 'punjabi', label: 'Punjabi', count: '900+ Songs', tag: 'Bhangra · Wedding · Gym · Bass' },
        { id: 'english', label: 'Hollywood', count: '500+ Songs', tag: 'Global Pop · EDM · Rap · Love' },
        { id: 'marathi', label: 'Marathi', count: '100 Top Songs', tag: 'Zingaat · Dhol Tasha · Sairat · Lavani' },
        { id: 'gujarati', label: 'Gujarati', count: '100 Top Songs', tag: 'Garba · Dandiya · Folk · Dholida' },
        { id: 'tamil', label: 'Tamil', count: '100 Top Songs', tag: 'Anirudh · Kuthu · Mass · Whistle' },
        { id: 'telugu', label: 'Telugu', count: '100 Top Songs', tag: 'DSP · Thaman · Theater Mass · RRR' },
        { id: 'kannada', label: 'Kannada', count: '100 Top Songs', tag: 'KGF · Salaar · Kantara · Sandalwood' },
        { id: 'marwadi', label: 'Marwadi', count: '100 Top Songs', tag: 'Chaudhary · Ghoomar · Folk Party' },
        { id: 'odia', label: 'Odia', count: '100 Top Songs', tag: 'Rangabati · Sambalpuri · Ollywood' },
        { id: 'bhojpuri', label: 'Bhojpuri', count: '100 Top Songs', tag: 'Pawan Singh · Khesari Lal · Party' },
        { id: 'haryanvi', label: 'Haryanvi', count: '100 Top Songs', tag: '52 Gaj · Balam Thanedar · Ragni' },
      ];

      langSection.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <div style="font-family:var(--font-mono), monospace;font-size:11px;font-weight:800;letter-spacing:0.1em;color:#c8ff00;text-transform:uppercase">
              EXPLORE ALL REGIONS · TOP 100 GREATEST HITS
            </div>
            <h2 style="font-family:var(--font-anton), 'Anton', sans-serif;font-size:clamp(26px, 3.4vw, 38px);color:#fff;margin:4px 0 0 0;text-transform:uppercase;letter-spacing:0.02em">
              BROWSE BY LANGUAGE
            </h2>
          </div>
          <span style="font-family:var(--font-mono), monospace;font-size:12px;color:rgba(255,255,255,0.5);border:1px solid rgba(255,255,255,0.15);padding:6px 12px;border-radius:9999px">
            12 LANGUAGES AVAILABLE
          </span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(210px, 1fr));gap:14px">
          ${ALL_LANGUAGES.map((l) => `
            <div class="audify-lang-card squeeze" data-lang="${l.id}" style="
              background:rgba(255,255,255,0.03);
              border:1px solid rgba(255,255,255,0.08);
              border-radius:16px;
              padding:16px 18px;
              cursor:pointer;
              transition:all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            ">
              <div style="display:flex;justify-content:space-between;align-items:baseline">
                <span style="font-family:var(--font-anton), 'Anton', sans-serif;font-size:22px;color:#fff;letter-spacing:0.03em">${l.label.toUpperCase()}</span>
                <span style="font-family:var(--font-mono), monospace;font-size:10px;color:#c8ff00;font-weight:700">${l.count}</span>
              </div>
              <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:6px 0 10px 0;line-height:1.3">${l.tag}</p>
              <button class="squeeze" style="
                width:100%;
                background:transparent;
                border:1px solid rgba(200,255,0,0.5);
                color:#c8ff00;
                font-family:var(--font-anton), 'Anton', sans-serif;
                font-size:12px;
                padding:6px 0;
                border-radius:8px;
                letter-spacing:0.04em;
                cursor:pointer;
                transition:all 0.15s;
              ">PLAY SET →</button>
            </div>
          `).join('')}
        </div>
      `;

      mainContainer.appendChild(langSection);

      langSection.querySelectorAll('.audify-lang-card').forEach((card) => {
        card.addEventListener('mouseenter', () => {
          card.style.borderColor = '#c8ff00';
          card.style.background = 'rgba(200,255,0,0.06)';
          card.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.borderColor = 'rgba(255,255,255,0.08)';
          card.style.background = 'rgba(255,255,255,0.03)';
          card.style.transform = 'translateY(0)';
        });
        card.addEventListener('click', async () => {
          const lang = card.dataset.lang;
          window.triggerAudifyBeatPulse(2.0);
          // Fetch set from backend for this language
          try {
            const res = await fetch('/api/set', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ answers: { languages: [lang], energy: 'peak' } })
            });
            const data = await res.json();
            if (data.cues && data.cues.length) {
              // Feed to player engine if present
              if (window.__audify_player_engine) {
                window.__audify_player_engine.start(data.cues);
              }
              const approveBtn = document.querySelector('button[aria-label*="Approve"], button[aria-label*="play"]');
              if (approveBtn) approveBtn.click();
            }
          } catch (e) {
            console.warn('Set fetch error:', e);
          }
        });
      });
    }
  }

  // Run DOM insertion periodically as page hydrates
  setInterval(injectPlayerControls, 1000);
})();
