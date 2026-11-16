import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'samples');

function deterministicNoise(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return (s / 0x80000000) - 1;
  };
}

function renderSample(durationSec, fn, sampleRate = 44100) {
  const len = Math.floor(durationSec * sampleRate);
  const out = new Float32Array(len);
  let peak = 1e-6;
  for (let i = 0; i < len; i++) {
    const val = fn(i / sampleRate, i, sampleRate);
    out[i] = val;
    if (Math.abs(val) > peak) peak = Math.abs(val);
  }
  const scale = 0.84 / peak;
  for (let i = 0; i < len; i++) out[i] *= scale;
  return out;
}

function writeWavMono(filePath, samples, sampleRate = 44100) {
  const numFrames = samples.length;
  const dataBytes = numFrames * 2;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < numFrames; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buf);
}

export function generateStudioDrumPack() {
  fs.mkdirSync(outDir, { recursive: true });
  const n1 = deterministicNoise(4201);
  const n2 = deterministicNoise(8402);
  const n3 = deterministicNoise(9911);
  const n4 = deterministicNoise(1337);

  const specs = {
    // 1. Punjabi Dhol Dagga (deep bass barrel head + warm second partial)
    dhol_dagga: renderSample(0.38, (t) => {
      const f = 62 + 78 * Math.exp(-t * 28);
      const body = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9.5);
      const overtone = 0.28 * Math.sin(2 * Math.PI * (f * 1.52) * t) * Math.exp(-t * 18);
      const slap = 0.22 * n1() * Math.exp(-t * 95);
      return Math.tanh((body + overtone + slap) * 1.35);
    }),

    // 2. Punjabi Dhol Tilli (crisp cane-stick rim snap)
    dhol_tilli: renderSample(0.16, (t) => {
      const m1 = Math.sin(2 * Math.PI * 425 * t) * Math.exp(-t * 32);
      const m2 = 0.65 * Math.sin(2 * Math.PI * 845 * t) * Math.exp(-t * 42);
      const m3 = 0.35 * Math.sin(2 * Math.PI * 1420 * t) * Math.exp(-t * 58);
      const crack = 0.72 * n2() * Math.exp(-t * 110);
      return Math.tanh((m1 + m2 + m3 + crack) * 1.25);
    }),

    // 3. Tuned Indian Tabla Dayan "Na" (singing harmonic modal ring)
    tabla_na: renderSample(0.34, (t) => {
      const base = 311.1; // D#4 harmonic syahi overtones
      const h1 = 0.45 * Math.sin(2 * Math.PI * base * t) * Math.exp(-t * 11);
      const h2 = 0.72 * Math.sin(2 * Math.PI * base * 2.0 * t) * Math.exp(-t * 13);
      const h3 = 0.38 * Math.sin(2 * Math.PI * base * 2.98 * t) * Math.exp(-t * 20);
      const edge = 0.42 * n1() * Math.exp(-t * 140);
      return Math.tanh((h1 + h2 + h3 + edge) * 1.15);
    }),

    // 4. Tabla Bayan "Ge" (gliding warm low resonance)
    tabla_ge: renderSample(0.36, (t) => {
      const f = 78 + 86 * Math.exp(-t * 14);
      const ring = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 8.2);
      const sub = 0.45 * Math.sin(2 * Math.PI * (f * 0.5) * t) * Math.exp(-t * 12);
      return Math.tanh((ring + sub) * 1.2);
    }),

    // 5. Tabla Bayan Pitch Glide (expressive pitch inflection)
    tabla_bayan_slide: renderSample(0.48, (t) => {
      const pitch = 64 + 58 * Math.sin(Math.min(Math.PI, t * 7.5));
      const sub = Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 5.2);
      const warm = 0.35 * Math.sin(2 * Math.PI * (pitch * 1.48) * t) * Math.exp(-t * 8.5);
      return Math.tanh((sub + warm) * 1.3);
    }),

    // 6. Club House 909 Kick (tight beater click + clean 52Hz punch)
    house_kick: renderSample(0.28, (t) => {
      const click = 0.55 * Math.sin(2 * Math.PI * 1850 * t) * Math.exp(-t * 210);
      const pitch = 49 + 145 * Math.exp(-t * 44);
      const sub = Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 15.5);
      return Math.tanh((sub + click) * 1.45);
    }),

    // 7. Club Layered Stereo-Feel Clap (4 micro-flam bursts + warm tail)
    house_clap: renderSample(0.24, (t) => {
      const burster = (offset) => (t >= offset ? Math.exp(-(t - offset) * 95) : 0);
      const env = burster(0) * 0.75 + burster(0.011) * 0.8 + burster(0.023) * 0.85 + Math.exp(-t * 19) * 0.45;
      const noise = n3() * env;
      const body = 0.25 * Math.sin(2 * Math.PI * 1050 * t) * Math.exp(-t * 65);
      return Math.tanh((noise + body) * 1.3);
    }),

    // 8. Analog Metallic Closed Hat
    house_hat: renderSample(0.075, (t) => {
      const freqs = [2450, 3680, 5120, 6840, 8450];
      let sum = 0;
      for (const f of freqs) sum += Math.sin(2 * Math.PI * f * t);
      const metallic = (sum / freqs.length) * 0.55 + n2() * 0.65;
      return metallic * Math.exp(-t * 78);
    }),

    // 9. Heavy 808 Sub Trap Hit
    trap_808: renderSample(0.55, (t) => {
      const f = 43 + 72 * Math.exp(-t * 36);
      const sub = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 4.8);
      const click = 0.35 * Math.sin(2 * Math.PI * 950 * t) * Math.exp(-t * 180);
      return Math.tanh((sub * 1.6 + click));
    }),

    // 10. EDM Marching Snare (snappy build-up hit)
    snare_roll_hit: renderSample(0.22, (t) => {
      const body = Math.sin(2 * Math.PI * (185 + 120 * Math.exp(-t * 48)) * t) * Math.exp(-t * 22);
      const snap = n4() * (Math.exp(-t * 52) * 0.75 + Math.exp(-t * 16) * 0.25);
      return Math.tanh((body * 0.6 + snap * 0.8) * 1.35);
    }),

    // 11. White-Noise Riser (swept resonance buildup)
    white_noise_riser: renderSample(2.6, (t) => {
      const prog = Math.min(1, t / 2.5);
      const centerF = 200 + 7800 * Math.pow(prog, 2.2);
      const env = Math.pow(prog, 1.6);
      const osc = Math.sin(2 * Math.PI * centerF * t);
      const noise = n1();
      return (noise * 0.6 + osc * 0.4) * env * 0.85;
    }),

    // 12. Downlifter Fall (descending filtered release tail)
    downlifter_fall: renderSample(1.8, (t) => {
      const decay = Math.exp(-t * 2.2);
      const cutoff = 6500 * Math.exp(-t * 2.8) + 80;
      const tone = Math.sin(2 * Math.PI * cutoff * t) * 0.35;
      const wash = n2() * 0.65;
      return (tone + wash) * decay * 0.82;
    }),

    // 13. Sub Drop (club room-shaking pitch drop)
    sub_drop: renderSample(1.5, (t) => {
      const f = 34 + 68 * Math.exp(-t * 3.4);
      const sub = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 1.8);
      const sat = Math.tanh(sub * 1.75);
      return sat * 0.92;
    }),

    // 14. Reverse Cymbal (swell build-up into drop)
    reverse_cymbal: renderSample(1.6, (t) => {
      const swell = Math.pow(Math.min(1, t / 1.55), 2.8);
      const freqs = [3200, 4800, 6400, 8900];
      let chime = 0;
      for (const f of freqs) chime += Math.sin(2 * Math.PI * f * t);
      return ((chime * 0.25) + (n3() * 0.75)) * swell * 0.88;
    }),

    // 15. Club Downbeat Impact (explosive kick + sub tail + reverb wash)
    club_impact: renderSample(1.6, (t) => {
      const click = Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 180) * 0.6;
      const subF = 42 + 130 * Math.exp(-t * 38);
      const sub = Math.sin(2 * Math.PI * subF * t) * Math.exp(-t * 5.5);
      const boom = n4() * Math.exp(-t * 4.2) * 0.45;
      return Math.tanh((click + sub * 1.4 + boom) * 1.3);
    }),

    // 16. Fast Air Whoosh (1-beat quick suction/sweep)
    air_whoosh: renderSample(0.48, (t) => {
      const shape = Math.sin((t / 0.48) * Math.PI);
      const noise = n1() * shape;
      const chirp = Math.sin(2 * Math.PI * (450 + 2800 * (t / 0.48)) * t) * shape * 0.35;
      return (noise + chirp) * 0.85;
    }),

    // 17. Classic Dub Siren (frequency-modulated dancehall riser)
    siren_wail: renderSample(1.3, (t) => {
      const lfo = Math.sin(2 * Math.PI * 4.5 * t);
      const f = 680 + 340 * lfo + 220 * (t / 1.3);
      const tone = Math.sin(2 * Math.PI * f * t);
      const harm = 0.3 * Math.sin(2 * Math.PI * (f * 2) * t);
      const env = Math.min(1, t * 15) * Math.exp(-t * 1.2);
      return Math.tanh((tone + harm) * 1.4) * env * 0.78;
    }),

    // 18. Open Crash Cymbal
    crash_cymbal: renderSample(1.8, (t) => {
      const freqs = [1850, 2900, 4200, 6100, 8300, 10500];
      let metals = 0;
      for (const f of freqs) metals += Math.sin(2 * Math.PI * f * t);
      const wash = n2() * 0.7 + (metals / freqs.length) * 0.3;
      return wash * Math.exp(-t * 2.6) * 0.82;
    }),
  };

  const manifest = [];

  for (const [name, samples] of Object.entries(specs)) {
    writeWavMono(path.join(outDir, `${name}.wav`), samples);
    manifest.push({
      file: `${name}.wav`,
      name,
      durationSec: Math.round((samples.length / 44100) * 100) / 100,
      source: 'Deterministic Audio Synthesis (scripts/generate-drum-pack.mjs)',
      license: 'CC0 / Custom Free Public Domain Code (Zero Royalty)',
      author: 'NOVA Autonomous DJ Engine',
      category: name.includes('riser') || name.includes('downlifter') || name.includes('whoosh') || name.includes('siren')
        ? 'transition_fx'
        : name.includes('impact') || name.includes('sub_drop')
          ? 'drop_fx'
          : name.includes('dhol') || name.includes('tabla')
            ? 'desi_percussion'
            : 'club_drums',
      dateChecked: '2026-11-16',
    });
  }

  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), sampleCount: manifest.length, samples: manifest }, null, 2)
  );

  return Object.keys(specs).map((name) => `public/samples/${name}.wav`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = generateStudioDrumPack();
  console.log(`Generated ${files.length} studio percussion WAV files in public/samples/`);
}
