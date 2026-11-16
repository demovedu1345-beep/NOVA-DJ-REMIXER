const SAMPLE_NAMES = [
  'dhol_dagga',
  'dhol_tilli',
  'tabla_na',
  'tabla_ge',
  'tabla_bayan_slide',
  'house_kick',
  'house_clap',
  'house_hat',
  'trap_808',
  'snare_roll_hit',
  'white_noise_riser',
  'downlifter_fall',
  'sub_drop',
  'reverse_cymbal',
  'club_impact',
  'air_whoosh',
  'siren_wail',
  'crash_cymbal',
];

const cachedRawFiles = new Map(); // name -> ArrayBuffer
const decodedPerCtx = new WeakMap(); // BaseAudioContext -> { [name]: AudioBuffer }

function createFallbackDrumBuffer(ctx, name) {
  const sr = ctx.sampleRate;
  const dur = name.includes('riser') ? 2.5
    : (name.includes('downlifter') || name.includes('crash') || name.includes('reverse') || name.includes('impact')) ? 1.6
    : name.includes('sub_drop') ? 1.4
    : name.includes('siren') ? 1.2
    : name.includes('808') ? 0.55
    : name.includes('hat') ? 0.075
    : 0.28;
  const len = Math.floor(sr * dur);
  const buf = ctx.createBuffer(1, len, sr);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    if (name === 'house_hat') {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-t * 75);
    } else if (name === 'white_noise_riser') {
      const prog = Math.min(1, t / dur);
      const f = 200 + 7800 * Math.pow(prog, 2.2);
      ch[i] = ((Math.random() * 2 - 1) * 0.6 + Math.sin(2 * Math.PI * f * t) * 0.4) * Math.pow(prog, 1.6) * 0.85;
    } else if (name === 'downlifter_fall') {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-t * 2.2) * 0.8;
    } else if (name === 'sub_drop') {
      const f = 34 + 68 * Math.exp(-t * 3.4);
      ch[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 1.8) * 0.9;
    } else if (name === 'reverse_cymbal') {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(Math.min(1, t / dur), 2.8) * 0.85;
    } else if (name === 'club_impact') {
      const f = 42 + 130 * Math.exp(-t * 38);
      ch[i] = Math.tanh(Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 5.5) * 1.4);
    } else if (name === 'air_whoosh') {
      ch[i] = (Math.random() * 2 - 1) * Math.sin((t / dur) * Math.PI) * 0.85;
    } else if (name === 'siren_wail') {
      const f = 680 + 340 * Math.sin(2 * Math.PI * 4.5 * t);
      ch[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 1.2) * 0.75;
    } else if (name === 'house_clap' || name === 'dhol_tilli' || name === 'tabla_na' || name === 'snare_roll_hit') {
      ch[i] = (Math.sin(2 * Math.PI * 440 * t) * 0.5 + (Math.random() * 2 - 1) * 0.5) * Math.exp(-t * 28);
    } else {
      const f = 52 + 80 * Math.exp(-t * 30);
      ch[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 14);
    }
  }
  return buf;
}

/**
 * Loads the royalty-free WAV samples from /samples/*.wav and decodes them into AudioBuffers
 * for the given AudioContext or OfflineAudioContext.
 */
export async function loadDrumSamplesForContext(ctx) {
  if (!ctx) return null;
  if (decodedPerCtx.has(ctx)) return decodedPerCtx.get(ctx);

  const out = {};
  await Promise.all(
    SAMPLE_NAMES.map(async (name) => {
      try {
        let ab = cachedRawFiles.get(name);
        if (!ab) {
          const res = await fetch(`/samples/${name}.wav`);
          if (res.ok) {
            ab = await res.arrayBuffer();
            cachedRawFiles.set(name, ab);
          }
        }
        if (ab) {
          out[name] = await ctx.decodeAudioData(ab.slice(0));
        } else {
          out[name] = createFallbackDrumBuffer(ctx, name);
        }
      } catch {
        out[name] = createFallbackDrumBuffer(ctx, name);
      }
    })
  );
  decodedPerCtx.set(ctx, out);
  return out;
}

/**
 * Schedules a quantized genre-matched royalty-free drum loop bridge on any AudioContext or OfflineAudioContext.
 */
export function scheduleStudioDrumBridge(ctx, destination, {
  when,
  bpm = 122,
  bars = 4,
  style = 'house',
  peakGain = 0.24,
  samples = null,
}) {
  if (!ctx || !destination || !samples) return;
  const beat = 60 / Math.max(55, bpm);
  const totalBeats = Math.ceil(bars * 4);

  const hit = (bufName, at, gainVal, hpFreq = 0) => {
    const buf = samples[bufName];
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    let node = src;
    if (hpFreq > 0) {
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = hpFreq;
      src.connect(f);
      node = f;
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(gainVal, at + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, at + buf.duration * 0.94);
    node.connect(g);
    g.connect(destination);
    src.start(at);
    src.stop(at + buf.duration + 0.02);
  };

  for (let k = 0; k < totalBeats; k++) {
    const at = when + k * beat;
    if (style === 'dhol') {
      // Punjabi Bhangra chaal (Dhol Dagga + Tilli + crisp Tabla accent)
      hit('dhol_dagga', at, k % 4 === 0 ? peakGain : peakGain * 0.72);
      hit('dhol_tilli', at + beat * 0.33, peakGain * 0.56);
      hit('dhol_tilli', at + beat * 0.66, peakGain * 0.64);
      if (k % 2 === 1) hit('dhol_dagga', at + beat * 0.75, peakGain * 0.62);
      if (k % 4 === 2) hit('tabla_na', at + beat * 0.5, peakGain * 0.42);
    } else if (style === 'tabla') {
      hit('tabla_ge', at, k % 2 === 0 ? peakGain * 0.9 : peakGain * 0.68);
      hit('tabla_na', at + beat * 0.25, peakGain * 0.58);
      hit('tabla_na', at + beat * 0.75, peakGain * 0.66);
      hit('house_hat', at + beat * 0.5, peakGain * 0.22, 6500);
    } else if (style === 'trap') {
      if (k % 4 === 0) hit('trap_808', at, peakGain);
      if (k % 4 === 1) hit('house_kick', at + beat * 0.5, peakGain * 0.85);
      if (k % 4 === 2) hit('house_clap', at, peakGain * 0.75, 180);
      const subdiv = k % 4 === 3 ? 6 : 4;
      for (let s = 0; s < subdiv; s++) {
        hit('house_hat', at + (s * beat) / subdiv, peakGain * 0.28, 6200);
      }
    } else {
      // Club House four-on-the-floor + clap on 2 & 4 + offbeat hat
      hit('house_kick', at, k % 4 === 0 ? peakGain : peakGain * 0.82);
      if (k % 2 === 1) hit('house_clap', at, peakGain * 0.55, 220);
      hit('house_hat', at + beat * 0.5, peakGain * 0.28, 6200);
    }
  }
}

/**
 * Schedules a single one-shot audio buffer from the royalty-free studio pack with ADSR gain envelope.
 */
export function scheduleStudioOneShot(ctx, destination, {
  sampleName,
  when,
  peakGain = 0.25,
  hpFreq = 0,
  lpFreq = 20000,
  pitchRate = 1.0,
  samples = null,
}) {
  if (!ctx || !destination || !samples) return null;
  const buf = samples[sampleName];
  if (!buf) return null;

  const src = ctx.createBufferSource();
  src.buffer = buf;
  if (Number.isFinite(pitchRate) && pitchRate > 0) {
    src.playbackRate.value = pitchRate;
  }

  let node = src;
  if (hpFreq > 20) {
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = hpFreq;
    node.connect(hp);
    node = hp;
  }
  if (lpFreq < 20000) {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = lpFreq;
    node.connect(lp);
    node = lp;
  }

  const dur = buf.duration / Math.max(0.2, pitchRate);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(peakGain, when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur * 0.96);

  node.connect(g);
  g.connect(destination);

  src.start(when);
  src.stop(when + dur + 0.04);
  return { src, gain: g, durationSec: dur };
}

/**
 * 4-bar or 2-bar white noise riser sweep leading into drop downbeat.
 */
export function scheduleStudioRiserSweep(ctx, destination, {
  when,
  durationSec = 4.0,
  peakGain = 0.22,
  samples = null,
}) {
  const buf = samples?.['white_noise_riser'];
  const pitchRate = buf ? Math.max(0.4, buf.duration / Math.max(0.5, durationSec)) : 1.0;
  return scheduleStudioOneShot(ctx, destination, {
    sampleName: 'white_noise_riser',
    when,
    peakGain,
    pitchRate,
    samples,
  });
}

/**
 * Downlifter fall after drop or transition downbeat.
 */
export function scheduleStudioDownlifter(ctx, destination, {
  when,
  peakGain = 0.25,
  samples = null,
}) {
  return scheduleStudioOneShot(ctx, destination, {
    sampleName: 'downlifter_fall',
    when,
    peakGain,
    samples,
  });
}

/**
 * High-impact club drop slam.
 */
export function scheduleStudioImpact(ctx, destination, {
  when,
  peakGain = 0.32,
  samples = null,
}) {
  return scheduleStudioOneShot(ctx, destination, {
    sampleName: 'club_impact',
    when,
    peakGain,
    samples,
  });
}

/**
 * Sub bass boom drop.
 */
export function scheduleStudioSubDrop(ctx, destination, {
  when,
  peakGain = 0.35,
  samples = null,
}) {
  return scheduleStudioOneShot(ctx, destination, {
    sampleName: 'sub_drop',
    when,
    peakGain,
    samples,
  });
}

/**
 * Air whoosh sweep for clean energy shifts.
 */
export function scheduleStudioAirWhoosh(ctx, destination, {
  when,
  peakGain = 0.20,
  samples = null,
}) {
  return scheduleStudioOneShot(ctx, destination, {
    sampleName: 'air_whoosh',
    when,
    peakGain,
    samples,
  });
}

/**
 * Club siren wail hype element.
 */
export function scheduleStudioSirenWail(ctx, destination, {
  when,
  peakGain = 0.18,
  samples = null,
}) {
  return scheduleStudioOneShot(ctx, destination, {
    sampleName: 'siren_wail',
    when,
    peakGain,
    samples,
  });
}

/**
 * Reverse cymbal swell into phrase downbeat.
 */
export function scheduleStudioReverseCymbal(ctx, destination, {
  when,
  peakGain = 0.25,
  samples = null,
}) {
  return scheduleStudioOneShot(ctx, destination, {
    sampleName: 'reverse_cymbal',
    when,
    peakGain,
    samples,
  });
}

/**
 * Crash cymbal explosion on downbeat.
 */
export function scheduleStudioCrashCymbal(ctx, destination, {
  when,
  peakGain = 0.26,
  samples = null,
}) {
  return scheduleStudioOneShot(ctx, destination, {
    sampleName: 'crash_cymbal',
    when,
    peakGain,
    samples,
  });
}

/**
 * Deep pitch-bent Indian Tabla Bayan bass slide accent.
 */
export function scheduleStudioTablaSlide(ctx, destination, {
  when,
  peakGain = 0.28,
  samples = null,
}) {
  return scheduleStudioOneShot(ctx, destination, {
    sampleName: 'tabla_bayan_slide',
    when,
    peakGain,
    samples,
  });
}

/**
 * Escalating quantized snare roll tension build (1/4 -> 1/8 -> 1/16 -> 1/32) over 1-2 bars.
 */
export function scheduleStudioSnareRoll(ctx, destination, {
  when,
  bpm = 122,
  bars = 2,
  peakGain = 0.24,
  samples = null,
}) {
  if (!ctx || !destination || !samples) return;
  const beatSec = 60 / Math.max(55, bpm);
  const totalBeats = bars * 4;

  for (let b = 0; b < totalBeats; b++) {
    const isLastBar = b >= totalBeats - 4;
    const isLastBeat = b === totalBeats - 1;
    const subdiv = isLastBeat ? 8 : isLastBar ? 4 : 2;
    const stepSec = beatSec / subdiv;

    for (let s = 0; s < subdiv; s++) {
      const at = when + b * beatSec + s * stepSec;
      const progress = (b * subdiv + s) / (totalBeats * subdiv);
      const gain = peakGain * (0.35 + 0.65 * progress);
      const hp = 80 + progress * 240;
      scheduleStudioOneShot(ctx, destination, {
        sampleName: 'snare_roll_hit',
        when: at,
        peakGain: gain,
        hpFreq: hp,
        samples,
      });
    }
  }
}
