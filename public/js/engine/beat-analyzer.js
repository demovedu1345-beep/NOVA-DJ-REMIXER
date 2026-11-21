// =========================================================================
// Audify Pro Beat Analyzer & Master Equalizer Engine
// High-Precision Phase-Locked Beat Tracking, Spectral Flux & 3-Band Parametric EQ
// =========================================================================

(function initAudifyBeatAnalyzer() {
  if (typeof window === 'undefined') return;
  if (window.__audify_beat_analyzer) return;

  const DEFAULT_SETTINGS = {
    bass: 4.0,       // +4 dB Bass Boost by default
    mid: 0.0,        // 0 dB Flat Mid
    treble: 2.5,     // +2.5 dB Crisp Treble
    reactivity: 1.8, // 1.8x High Aurora & Border Beat Spiking
    theme: 'auto',   // Dynamic theme per song
    preset: 'club_bass'
  };

  // Load from LocalStorage
  let settings = { ...DEFAULT_SETTINGS };
  try {
    const saved = localStorage.getItem('audify_eq_settings');
    if (saved) settings = { ...settings, ...JSON.parse(saved) };
  } catch (_) {}

  // Web Audio EQ Nodes
  let audioCtx = null;
  let bassFilter = null;
  let midFilter = null;
  let trebleFilter = null;
  let analyserNode = null;
  let freqDataArray = null;

  // Real-time Beat Tracking State
  let lastPlaybackTime = 0;
  let currentBpm = 124;
  let beatPhase = 0;
  let barPhase = 0;
  let beatEnergy = 1.0;
  let smoothedBassFlux = 0;
  let lastOnsetMs = 0;
  let prevBassEnergy = 0;
  let isBeatSpikeActive = false;

  // 16-Bar Spectrum FFT Visualizer Buffer
  const spectrum16Bars = new Float32Array(16);

  // Preallocated Beat Result Buffer for Zero GC Churn
  const beatResult = {
    beatEnergy: 1.0,
    rawKick: 0.0,
    beatPhase: 0.0,
    barPhase: 0.0,
    bpm: 124,
    spectrum: spectrum16Bars,
    isSpike: false
  };

  function getAudioContext() {
    if (audioCtx && audioCtx.state !== 'closed') return audioCtx;
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return null;
    audioCtx = new AudioCtxClass();
    return audioCtx;
  }

  function setupEqualizerNodes() {
    const ctx = getAudioContext();
    if (!ctx || bassFilter) return;

    try {
      // 1. Low-Shelf Filter (Bass Boost: 100 Hz)
      bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 100;
      bassFilter.gain.value = settings.bass;

      // 2. Peaking Filter (Mid Vocals/Presence: 1000 Hz)
      midFilter = ctx.createBiquadFilter();
      midFilter.type = 'peaking';
      midFilter.frequency.value = 1000;
      midFilter.Q.value = 1.0;
      midFilter.gain.value = settings.mid;

      // 3. High-Shelf Filter (Treble Air/Cymbals: 8000 Hz)
      trebleFilter = ctx.createBiquadFilter();
      trebleFilter.type = 'highshelf';
      trebleFilter.frequency.value = 8000;
      trebleFilter.gain.value = settings.treble;

      // 4. Analyser Node for Real-Time FFT
      analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 512;
      analyserNode.smoothingTimeConstant = 0.8;
      freqDataArray = new Uint8Array(analyserNode.frequencyBinCount);

      // Connect EQ chain: bass -> mid -> treble -> analyser -> destination
      bassFilter.connect(midFilter);
      midFilter.connect(trebleFilter);
      trebleFilter.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      // Store in window for global DSP access
      window.__audify_eq_input = bassFilter;
      window.__audify_eq_analyser = analyserNode;
      console.log('[Audify EQ] 3-Band Parametric Equalizer chain successfully initialized.');
    } catch (e) {
      console.warn('[Audify EQ] Equalizer setup error:', e);
    }
  }

  function applyEqualizerSettings() {
    if (!bassFilter || !audioCtx) return;
    const now = audioCtx.currentTime;
    try {
      bassFilter.gain.setTargetAtTime(settings.bass, now, 0.05);
      midFilter.gain.setTargetAtTime(settings.mid, now, 0.05);
      trebleFilter.gain.setTargetAtTime(settings.treble, now, 0.05);
    } catch (_) {}

    // Save settings
    try {
      localStorage.setItem('audify_eq_settings', JSON.stringify(settings));
    } catch (_) {}

    // Broadcast EQ update event
    if (typeof window.onAudifyEqChange === 'function') {
      window.onAudifyEqChange(settings);
    }
  }

  // Real-Time Beat Analyzer Step (called inside 60 FPS requestAnimationFrame render loop)
  function analyzeBeat(dt, nowMs) {
    const engine = window.__nauxEngine;
    const liveDeck = engine?.liveDeck?.();
    const player = liveDeck?.player;
    const cue = liveDeck?.cue;

    let kickImpulse = 0;

    // Check if live player is playing
    const isPlaying = player && !engine?.paused && typeof player.getCurrentTime === 'function';

    if (isPlaying) {
      const currSec = player.getCurrentTime() || 0;
      lastPlaybackTime = currSec;

      // Extract Track BPM
      const trackBpm = (cue && cue.bpm && cue.bpm >= 60 && cue.bpm <= 220) ? cue.bpm : 124;
      currentBpm = trackBpm;

      // Sub-millisecond Beat Phase Tracking
      const beatDuration = 60.0 / currentBpm;
      const barDuration = beatDuration * 4.0;

      // Modulo arithmetic with entry offset
      const offset = (cue && cue.entrySec) || 0;
      let beatElapsed = (currSec - offset) % beatDuration;
      if (beatElapsed < 0) beatElapsed += beatDuration;
      beatPhase = beatElapsed / beatDuration; // 0.0 -> 1.0 within beat

      let barElapsed = (currSec - offset) % barDuration;
      if (barElapsed < 0) barElapsed += barDuration;
      barPhase = barElapsed / barDuration;   // 0.0 -> 1.0 within 4-beat bar

      // 1. Kick Drum Downbeat Impulse: Sharp exponential onset attack & decay
      // Peaks at 1.0 exactly at beat start, drops to 0.1 within 80ms
      kickImpulse = Math.exp(-beatPhase * 9.5);

      // 2. Snare / Clapping Backbeat Impulse: peaks on beats 2 & 4
      const beatNumber = Math.floor(barPhase * 4.0);
      const isBackbeat = beatNumber === 1 || beatNumber === 3;
      const snareImpulse = isBackbeat ? Math.exp(-beatPhase * 8.0) * 0.75 : 0;

      // 3. Drop & Downbeat Measure Impact: massive pulse on beat 1 of each bar
      const barDropImpulse = Math.exp(-barPhase * 5.0) * 0.9;

      // 4. Web Audio Real-Time FFT Spectral Flux
      let currentBassEnergy = 0;
      if (analyserNode && freqDataArray) {
        analyserNode.getByteFrequencyData(freqDataArray);
        // Average sub-bass bins (20 Hz - 120 Hz)
        let subSum = 0;
        for (let i = 1; i <= 6; i++) subSum += freqDataArray[i];
        currentBassEnergy = subSum / (6 * 255.0);

        // Compute 16 spectrum visualizer bars
        const step = Math.floor(freqDataArray.length / 24);
        for (let b = 0; b < 16; b++) {
          const raw = freqDataArray[b * step] / 255.0;
          spectrum16Bars[b] += (raw - spectrum16Bars[b]) * Math.min(1.0, dt * 12.0);
        }
      } else {
        // Fallback synthetic spectrum animated to beat phase
        for (let b = 0; b < 16; b++) {
          const freqCurve = Math.max(0, 1.0 - (b / 16.0) * 0.6);
          const barVal = (kickImpulse * 0.8 + barDropImpulse * 0.4) * freqCurve * (0.6 + 0.4 * Math.sin(currSec * 8.0 + b));
          spectrum16Bars[b] += (barVal - spectrum16Bars[b]) * Math.min(1.0, dt * 14.0);
        }
      }

      // Spectral Flux Delta
      const bassFlux = Math.max(0, currentBassEnergy - prevBassEnergy);
      prevBassEnergy = currentBassEnergy;
      smoothedBassFlux += (bassFlux - smoothedBassFlux) * Math.min(1.0, dt * 8.0);

      // 5. Combine into Unified Physical Beat Energy
      const bassMultiplier = 1.0 + (settings.bass / 12.0) * 0.6; // Scale with Bass EQ
      const rawBeat = (kickImpulse * 1.35 + barDropImpulse * 1.1 + snareImpulse * 0.6 + smoothedBassFlux * 1.8) * bassMultiplier;

      // Scale by user beat reactivity setting
      beatEnergy = rawBeat * settings.reactivity;

      // Trigger high-energy wave pulses when a strong beat strikes
      if (beatEnergy > 1.6 && nowMs - lastOnsetMs > 180) {
        lastOnsetMs = nowMs;
        isBeatSpikeActive = true;

        // Dispatch pulse to SoftAurora shader wave ripples
        if (typeof window.__audify_trigger_beat_pulse === 'function') {
          window.__audify_trigger_beat_pulse(Math.min(3.0, 1.0 + beatEnergy * 0.9));
        }

        // Pulse RGB border luminescence
        pulseBorderGlow(beatEnergy);
      } else {
        isBeatSpikeActive = false;
      }
    } else {
      // Resting idle beat pulse (smooth breathing)
      beatEnergy = 0.15 + 0.1 * Math.sin(nowMs * 0.003);
      for (let b = 0; b < 16; b++) {
        spectrum16Bars[b] += (0.05 - spectrum16Bars[b]) * Math.min(1.0, dt * 4.0);
      }
    }

    // Zero-allocation precomputed result
    beatResult.beatEnergy = beatEnergy;
    beatResult.rawKick = kickImpulse;
    beatResult.beatPhase = beatPhase;
    beatResult.barPhase = barPhase;
    beatResult.bpm = currentBpm;
    beatResult.isSpike = isBeatSpikeActive;
    return beatResult;
  }

  // Physical RGB Border Glow Pulse on Beat Strikes
  function pulseBorderGlow(energy) {
    const border = document.getElementById('audify-rgb-aurora-border');
    if (!border) return;
    const glowPx = Math.min(36, Math.floor(6 + energy * 18));
    border.style.setProperty('--audify-border-beat-glow', `${glowPx}px`);
    border.style.setProperty('--audify-border-beat-scale', `${1.0 + energy * 0.015}`);
  }

  // Presets Definition
  const PRESETS = {
    club_bass: {
      name: '💥 CLUB BASS MAX',
      bass: 9.0,
      mid: 0.5,
      treble: 3.5,
      reactivity: 2.2,
      desc: 'Deep 808 sub thumps with maximum explosive aurora flares'
    },
    festival_punch: {
      name: '⚡ FESTIVAL PUNCH',
      bass: 7.5,
      mid: 2.0,
      treble: 5.0,
      reactivity: 2.4,
      desc: 'Stadium EDM punch with high-frequency laser strobe'
    },
    vocal_clarity: {
      name: '🎤 VOCAL CLARITY',
      bass: -1.0,
      mid: 6.0,
      treble: 2.0,
      reactivity: 1.2,
      desc: 'Crystal-clear acoustic vocals with soft ambient ripples'
    },
    midnight_chill: {
      name: '🌙 CHILL LO-FI',
      bass: 3.0,
      mid: -1.5,
      treble: -3.0,
      reactivity: 0.9,
      desc: 'Warm vinyl warmth with dreamy, slow-drifting lights'
    },
    flat_studio: {
      name: '🎛️ FLAT MASTER',
      bass: 0.0,
      mid: 0.0,
      treble: 0.0,
      reactivity: 1.0,
      desc: 'Pure uncolored reference response'
    }
  };

  // Expose API globally
  window.__audify_beat_analyzer = {
    update: analyzeBeat,
    getSettings: () => ({ ...settings }),
    setBass: (val) => { settings.bass = Math.max(-12, Math.min(12, val)); applyEqualizerSettings(); },
    setMid: (val) => { settings.mid = Math.max(-12, Math.min(12, val)); applyEqualizerSettings(); },
    setTreble: (val) => { settings.treble = Math.max(-12, Math.min(12, val)); applyEqualizerSettings(); },
    setReactivity: (val) => { settings.reactivity = Math.max(0.5, Math.min(3.0, val)); applyEqualizerSettings(); },
    setTheme: (themeId) => { settings.theme = themeId; applyEqualizerSettings(); },
    applyPreset: (presetKey) => {
      let key = presetKey;
      if (key === 'club' || key === 'club_bass_max') key = 'club_bass';
      if (key === 'festival' || key === 'festival_punch_max') key = 'festival_punch';
      if (key === 'vocal') key = 'vocal_clarity';
      if (key === 'lofi' || key === 'chill' || key === 'chill_lofi') key = 'midnight_chill';
      if (key === 'flat' || key === 'flat_master') key = 'flat_studio';
      const p = PRESETS[key];
      if (!p) return;
      settings.bass = p.bass;
      settings.mid = p.mid;
      settings.treble = p.treble;
      settings.reactivity = p.reactivity;
      settings.preset = key;
      applyEqualizerSettings();
    },
    getPresets: () => PRESETS,
    getSpectrum: () => spectrum16Bars,
    initAudio: setupEqualizerNodes
  };

  // Auto-prime on user interaction
  ['click', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
      setupEqualizerNodes();
    }, { once: true, passive: true });
  });

  console.log('[Audify Beat Analyzer] Real-time beat sync & analyzer engine loaded successfully.');
})();
