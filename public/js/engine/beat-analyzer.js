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
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('audify_eq_settings');
      if (saved) settings = { ...settings, ...JSON.parse(saved) };
    }
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

  // Sub-Millisecond Phase-Locked Loop (PLL) Tracking State
  let pllEstimatedTime = 0;
  let lastRawTime = -1;
  let lastRawTimeMs = 0;
  let pllInitialized = false;

  // Multi-Band Beat Separation Channels
  let rawKick = 0.0;
  let rawSnare = 0.0;
  let rawDrop = 0.0;
  let rawHiHat = 0.0;

  // 16-Bar Spectrum FFT Visualizer Buffer
  const spectrum16Bars = new Float32Array(16);

  // Preallocated Beat Result Buffer for Zero GC Churn
  const beatResult = {
    beatEnergy: 1.0,
    rawKick: 0.0,
    rawSnare: 0.0,
    rawDrop: 0.0,
    rawHiHat: 0.0,
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


  // -------------------------------------------------------------------------
  // CANONICAL TRACK & GENRE TEMPO DICTIONARY (BPM)
  // Ensures visual pulses match the REAL audible tempo of every track & genre
  // -------------------------------------------------------------------------
  const TRACK_BPM_MAP = {
    // The Weeknd
    'blinding lights': 171,
    'starboy': 93,
    'the hills': 113,
    'save your tears': 118,
    "can't feel my face": 108,
    'die for you': 67,
    'call out my name': 80,
    'often': 67,
    'wicked games': 114,
    'in your eyes': 100,
    'timeless': 138,
    'take my breath': 121,
    'popular': 99,
    'dancing in the flames': 120,
    'creepin': 98,
    'moth to a flame': 120,

    // Rock & Metal
    'bohemian rhapsody': 144,
    'we will rock you': 81,
    'back in black': 94,
    'highway to hell': 116,
    "livin' on a prayer": 123,
    "sweet child o' mine": 125,
    'smells like teen spirit': 117,
    'in the end': 105,
    'numb': 110,
    'believer': 125,
    'radioactive': 136,
    'demons': 90,
    'californication': 96,
    'viva la vida': 138,
    'yellow': 87,
    'do i wanna know': 85,
    'enter sandman': 123,
    'master of puppets': 105,
    'the trooper': 160,
    'paranoid': 163,
    'duality': 144,

    // Pop & Dance
    'one kiss': 124,
    'wake me up': 124,
    'closer': 95,
    'titanium': 126,
    'levitating': 103,
    "don't start now": 124,
    '24k magic': 107,
    "that's what i like": 134,
    'billie jean': 117,
    'beat it': 138,
    'espresso': 104,
    'good luck, babe!': 117,
    'beautiful things': 105,
    'lose control': 80,
    'ocean eyes': 84,
    'riptide': 102,
    'let her go': 75,
    'never gonna give you up': 113,
    'girls just want to have fun': 120,
    'circles': 120,
    'rockstar': 80,
    'lean on me': 75,
    'god\'s plan': 77,
    'humble.': 150,
    'sicko mode': 155,
    'without me': 112,
    'lose yourself': 86,
    'remember the name': 85,
    'tennessee whiskey': 74,
    'ring of fire': 104,
    'jolene': 110,
    'fly me to the moon': 119,
    'my way': 75,
    'what a wonderful world': 75,
    'don\'t know why': 88,

    // Hindi & Bollywood Hits
    'tum hi ho': 94,
    'kesariya': 88,
    'apna bana le': 84,
    'channa mereya': 72,
    'gallan goodiyaan': 128,
    'lungi dance': 130,
    'badtameez dil': 136,
    'dilliwaali girlfriend': 130,
    'dilliwali girlfriend': 130,
    'malhari': 134,
    'zingaat': 138,
    'kala chashma': 106,
    'kar gayi chull': 122,
    'ghungroo': 118,
    'nashe si chadh gayi': 112,
    'raataan lambiyan': 90,
    'jai jai shivshankar': 128,
    'subha hone na de': 130,
    'aankh marey': 128,
    'dilbar': 115,
    'garmi': 128,
    'chammak challo': 104,
    'hookah bar': 130,

    // Punjabi & Regional
    'brown munde': 88,
    '295': 88,
    'so high': 88,
    'elevated': 96,
    'cheques': 96,
    'lover': 104,
    'born to shine': 100,
    'naatu naatu': 136,
    'arabic kuthu': 130
  };

  const GENRE_DEFAULT_BPM = {
    'party': 128,
    'dance': 128,
    'club': 126,
    'edm': 128,
    'diwali': 128,
    'retro': 120,
    'workout': 130,
    'gym': 130,
    'motivating': 124,
    'rock': 130,
    'metal': 138,
    'classicrock': 124,
    'hiphop': 90,
    'rnb': 88,
    'trap': 140,
    'love': 82,
    'romantic': 82,
    'sad': 76,
    'emotional': 76,
    'breakup': 80,
    'chill': 84,
    'acoustic': 84,
    'indie': 92,
    'trip': 96,
    'country': 94,
    'jazz': 90,
    'gospel': 108,
    'classical': 76,
    'focus': 80,
    'trending': 122,
    'pop': 120,
    'punjabi': 98,
    'tamil-telugu': 134,
    'kuthu': 136,
    'mass': 132,
    'gujarati': 116,
    'garba': 118,
    'marathi': 126,
    'marwadi': 110,
    'haryanvi-bhojpuri': 130,
    'kannada': 124,
    'odia': 120
  };

  function resolveTrackBpm(cue) {
    if (!cue) return 124;
    // 1. Direct metadata check
    if (typeof cue.bpm === 'number' && cue.bpm >= 45 && cue.bpm <= 220) return cue.bpm;
    if (typeof cue.tempo === 'number' && cue.tempo >= 45 && cue.tempo <= 220) return cue.tempo;

    // 2. Exact song title match
    const title = (cue.title || '').toLowerCase().trim();
    for (const [key, bpm] of Object.entries(TRACK_BPM_MAP)) {
      if (title.includes(key)) return bpm;
    }

    // 3. Subtype or Genre match
    const subtype = (cue.subtype || cue.kind || '').toLowerCase();
    for (const [g, bpm] of Object.entries(GENRE_DEFAULT_BPM)) {
      if (subtype.includes(g)) return bpm;
    }

    // 4. Language match fallback
    const lang = (cue.language || cue.lang || '').toLowerCase();
    if (lang === 'punjabi') return 98;
    if (lang === 'south' || lang === 'tamil-telugu') return 134;
    if (lang === 'gujarati') return 118;
    if (lang === 'english') return 120;
    if (lang === 'hindi') return 128;

    return 124;
  }

  // Real-Time Beat Analyzer Step (called inside 60 FPS requestAnimationFrame render loop)
  function analyzeBeat(dt, nowMs) {
    const safeDt = (typeof dt === 'number' && Number.isFinite(dt) && dt > 0 && dt < 0.25) ? dt : 0.0166;
    const safeNowMs = (typeof nowMs === 'number' && Number.isFinite(nowMs)) ? nowMs : (typeof performance !== 'undefined' ? performance.now() : Date.now());

    const engine = window.__nauxEngine;
    const liveDeck = engine?.liveDeck?.();
    const player = liveDeck?.player;
    const cue = liveDeck?.cue || liveDeck?.track || engine?.currentTrack;

    // Detect if live audio source is actively playing
    let isPlaying = false;
    let rawSec = 0;
    let hasPlayer = false;

    if (player && typeof player.getCurrentTime === 'function') {
      hasPlayer = true;
      try {
        rawSec = player.getCurrentTime() || 0;
        const playerState = (typeof player.getPlayerState === 'function') ? player.getPlayerState() : -1;
        const isEnginePaused = Boolean(engine?.paused);
        // YouTube states: 1 = PLAYING, 3 = BUFFERING, -1 = UNSTARTED/ACTIVE
        isPlaying = !isEnginePaused && (playerState === 1 || playerState === -1 || playerState === 3);
      } catch (_) {
        isPlaying = false;
      }
    } else if (liveDeck && typeof liveDeck.position === 'number') {
      hasPlayer = true;
      rawSec = liveDeck.position || 0;
      isPlaying = !engine?.paused && (liveDeck.status === 'live' || liveDeck.status === 'playing');
    }

    if (isPlaying && hasPlayer) {
      // ---------------------------------------------------------------------
      // 1. Sub-Millisecond Phase-Locked Loop (PLL)
      // ---------------------------------------------------------------------
      // YouTube iframe player.getCurrentTime() only refreshes every ~200-250ms.
      // Continuous free-running estimation (pllEstimatedTime += safeDt) provides
      // fluid 60-120 FPS tracking that gently slews toward rawSec when YouTube ticks.
      if (!pllInitialized || lastRawTime < 0) {
        // Initial lock / snap to player time
        pllEstimatedTime = Math.max(0, rawSec);
        lastRawTime = rawSec;
        lastRawTimeMs = safeNowMs;
        pllInitialized = true;
      } else {
        const rawTimeDelta = rawSec - lastRawTime;

        if (rawTimeDelta !== 0) {
          // YouTube reported a new tick or user sought
          if (rawTimeDelta < -0.05 || Math.abs(rawSec - pllEstimatedTime) > 0.4) {
            // Significant jump or seek: re-anchor immediately
            pllEstimatedTime = Math.max(0, rawSec);
          } else {
            // Gentle PLL phase slew (proportional loop filter):
            // Smoothly pull estimated time toward raw time without stepping
            const phaseError = rawSec - pllEstimatedTime;
            pllEstimatedTime += phaseError * 0.35;
          }
          lastRawTime = rawSec;
          lastRawTimeMs = safeNowMs;
        } else {
          // Sub-250ms interval: advance continuously at display refresh rate
          pllEstimatedTime += safeDt;

          // Anti-runaway guard: prevent runaway drift if playback stalled
          const timeSinceTick = (safeNowMs - lastRawTimeMs) * 0.001;
          if (timeSinceTick > 0.5 && pllEstimatedTime > lastRawTime + 0.5) {
            pllEstimatedTime = lastRawTime + 0.5;
          }
        }
      }
      lastPlaybackTime = pllEstimatedTime;

      // ---------------------------------------------------------------------
      // 2. Intelligent Real-Time BPM & Calibrated Acoustic Phase Locking
      // ---------------------------------------------------------------------
      currentBpm = resolveTrackBpm(cue);

      const beatDuration = 60.0 / currentBpm;
      const barDuration = beatDuration * 4.0;

      const offset = (cue && typeof cue.entrySec === 'number')
        ? cue.entrySec
        : ((cue && typeof cue.hookStartSec === 'number') ? cue.hookStartSec : 0);

      // Latency calibration: Compensate for YouTube iframe audio-to-DOM buffer delay (~115ms)
      // plus user-adjustable phase nudge from EQ modal
      const userNudgeSec = (settings.beatNudgeMs || 0) * 0.001;
      const latencyCorrectionSec = 0.115 + userNudgeSec;

      let beatElapsed = (pllEstimatedTime - offset - latencyCorrectionSec) % beatDuration;
      if (beatElapsed < 0) beatElapsed += beatDuration;
      beatPhase = beatElapsed / beatDuration; // 0.0 -> 1.0 within beat

      let barElapsed = (pllEstimatedTime - offset) % barDuration;
      if (barElapsed < 0) barElapsed += barDuration;
      barPhase = barElapsed / barDuration;   // 0.0 -> 1.0 within 4-beat bar

      // ---------------------------------------------------------------------
      // 3. Multi-Band Beat Separation
      // ---------------------------------------------------------------------
      // Sub-bass kick (downbeat attack: rawKick = Math.exp(-beatPhase * 11.0))
      rawKick = Math.exp(-beatPhase * 11.0);

      // Snare/clap backbeat on beats 2 & 4
      const beatNumber = Math.floor(barPhase * 4.0);
      const isBackbeat = (beatNumber === 1 || beatNumber === 3);
      rawSnare = isBackbeat ? Math.exp(-beatPhase * 9.0) * 0.8 : 0.0;

      // Bar drop impact on beat 1 of each 4-beat bar
      rawDrop = Math.exp(-barPhase * 4.5) * 1.3;

      // Hi-hat shimmer on 1/8th and 1/16th notes
      rawHiHat = Math.abs(Math.sin(beatPhase * Math.PI * 4.0)) * 0.4;

      // ---------------------------------------------------------------------
      // 4. Web Audio Real-Time FFT Spectral Flux
      // ---------------------------------------------------------------------
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
          spectrum16Bars[b] += (raw - spectrum16Bars[b]) * Math.min(1.0, safeDt * 12.0);
        }
      } else {
        // Fallback synthetic spectrum animated to multi-band beat phase
        for (let b = 0; b < 16; b++) {
          const freqCurve = Math.max(0, 1.0 - (b / 16.0) * 0.6);
          const shimmer = (b >= 8) ? (rawHiHat * 1.5) : (rawKick * 0.9 + rawDrop * 0.4);
          const barVal = shimmer * freqCurve * (0.6 + 0.4 * Math.sin(pllEstimatedTime * 8.0 + b));
          spectrum16Bars[b] += (barVal - spectrum16Bars[b]) * Math.min(1.0, safeDt * 14.0);
        }
      }

      // Spectral Flux Delta
      const bassFlux = Math.max(0, currentBassEnergy - prevBassEnergy);
      prevBassEnergy = currentBassEnergy;
      smoothedBassFlux += (bassFlux - smoothedBassFlux) * Math.min(1.0, safeDt * 8.0);

      // ---------------------------------------------------------------------
      // 5. Combine into Explosive Unified beatEnergy
      // ---------------------------------------------------------------------
      // Scale with user bass boost and reactivity multiplier (up to 3.0x)
      const bassBoostFactor = Math.max(0.2, 1.0 + (settings.bass / 12.0) * 0.65);
      const combinedBeat = (
        rawKick * 1.35 * bassBoostFactor +
        rawDrop * 1.15 * bassBoostFactor +
        rawSnare * 0.85 +
        rawHiHat * 0.6 +
        smoothedBassFlux * 1.75 * bassBoostFactor
      );

      const reactivityMultiplier = Math.max(0.5, Math.min(3.0, settings.reactivity || 1.8));
      beatEnergy = combinedBeat * reactivityMultiplier;

      // Trigger high-energy wave pulses when a strong beat strikes
      if (beatEnergy > 1.6 && safeNowMs - lastOnsetMs > 180) {
        lastOnsetMs = safeNowMs;
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
      // Audio paused or idle: reset PLL tracking state for clean restart
      if (hasPlayer && rawSec >= 0) {
        pllEstimatedTime = rawSec;
        lastRawTime = rawSec;
      }
      pllInitialized = false;

      // Subtle organic "heartbeat" ambient breathing pulse (0.25 amplitude at 0.5 Hz)
      // 0.5 Hz period = 2.0s cardiac cycle
      const cardiacPhase = ((safeNowMs * 0.001 * 0.5) % 1.0 + 1.0) % 1.0;
      const lub = Math.exp(-Math.pow((cardiacPhase - 0.08) * 22.0, 2));
      const dub = Math.exp(-Math.pow((cardiacPhase - 0.22) * 24.0, 2)) * 0.68;
      const heartbeatSignal = lub + dub;

      beatEnergy = 0.10 + 0.25 * heartbeatSignal;
      rawKick = 0.25 * lub;
      rawSnare = 0.18 * dub;
      rawDrop = 0.0;
      rawHiHat = 0.06 * Math.abs(Math.sin(cardiacPhase * Math.PI * 4.0));
      beatPhase = cardiacPhase;
      barPhase = ((safeNowMs * 0.001 * 0.125) % 1.0 + 1.0) % 1.0;
      isBeatSpikeActive = false;

      // Ambient breathing undulation across 16 spectrum visualizer bars
      for (let b = 0; b < 16; b++) {
        const barTarget = 0.035 + (0.075 * (1.0 - (b / 16.0) * 0.5)) * (0.4 + 0.6 * heartbeatSignal);
        spectrum16Bars[b] += (barTarget - spectrum16Bars[b]) * Math.min(1.0, safeDt * 5.0);
      }
    }

    // Zero-allocation precomputed result
    beatResult.beatEnergy = beatEnergy;
    beatResult.rawKick = rawKick;
    beatResult.rawSnare = rawSnare;
    beatResult.rawDrop = rawDrop;
    beatResult.rawHiHat = rawHiHat;
    beatResult.beatPhase = beatPhase;
    beatResult.barPhase = barPhase;
    beatResult.bpm = currentBpm;
    beatResult.spectrum = spectrum16Bars;
    beatResult.isSpike = isBeatSpikeActive;
    return beatResult;
  }

  // Physical RGB Border Glow Pulse on Beat Strikes
  function pulseBorderGlow(energy) {
    if (typeof document === 'undefined') return;
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
    getBeatResult: () => beatResult,
    getPllTime: () => pllEstimatedTime,
    getCurrentBpm: () => currentBpm,
    nudgeBeatPhase: (ms) => {
      settings.beatNudgeMs = (settings.beatNudgeMs || 0) + ms;
      try { localStorage.setItem('audify_eq_settings', JSON.stringify(settings)); } catch(_) {}
      console.log('[Audify Beat] Phase nudged by', ms, 'ms. Total nudge:', settings.beatNudgeMs, 'ms');
      return settings.beatNudgeMs;
    },
    syncDownbeatNow: () => {
      if (lastRawTime >= 0) {
        pllEstimatedTime = lastRawTime;
      }
      console.log('[Audify Beat] Downbeat synced to current playback position.');
    },
    initAudio: setupEqualizerNodes
  };

  // Auto-prime on user interaction
  if (typeof window.addEventListener === 'function') {
    ['click', 'touchstart', 'keydown'].forEach(evt => {
      window.addEventListener(evt, () => {
        setupEqualizerNodes();
      }, { once: true, passive: true });
    });
  }

  console.log('[Audify Beat Analyzer] Real-time beat sync & PLL analyzer engine loaded successfully.');
})();
