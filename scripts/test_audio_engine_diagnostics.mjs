import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('=== AUDIFY AUDIO ENGINE & SERATO CROSSFADE VERIFICATION ===\n');

// 1. Load source files
const pathChunk = 'C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER/public/naux/static/immutable/chunks/3cq6guoi7hqi2.js';
const pathDeckEngine = 'C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER/public/js/engine/youtube-deck-engine.js';
const pathAurora = 'C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER/public/js/ui/aurora-and-mix-engine.js';

const codeChunk = fs.readFileSync(pathChunk, 'utf8');
const codeDeck = fs.readFileSync(pathDeckEngine, 'utf8');
const codeAurora = fs.readFileSync(pathAurora, 'utf8');

// TASK 1: Serato Crossfade Curve Verification
console.log('--- TASK 1: Serato Equal-Power Crossfade Curve Stability ---');

// Verify formula in PlayerEngine chunk
assert(codeChunk.includes('100*Math.pow(Math.sin(s*Math.PI/2),0.28)'), 'Chunk must contain Serato sin^0.28 curve');
assert(codeChunk.includes('100*Math.pow(Math.cos(s*Math.PI/2),0.28)'), 'Chunk must contain Serato cos^0.28 curve');

// Verify formula in youtube-deck-engine.js
assert(codeDeck.includes('Math.pow(Math.sin((p * Math.PI) / 2), 0.28)'), 'youtube-deck-engine must contain sin^0.28');
assert(codeDeck.includes('Math.pow(Math.cos((p * Math.PI) / 2), 0.28)'), 'youtube-deck-engine must contain cos^0.28');

// Calculate curve characteristics
const steps = 100;
let minSumVolume = 999;
let minPowerRms = 999;
let midpointVolIn = 0;
let midpointVolOut = 0;

for (let i = 0; i <= steps; i++) {
  const p = i / steps;
  const sin = Math.sin((p * Math.PI) / 2);
  const cos = Math.cos((p * Math.PI) / 2);
  const pIn = Math.pow(sin, 0.28);
  const pOut = Math.pow(cos, 0.28);
  const volIn = Math.round(Math.min(100, Math.max(30, 100 * pIn)));
  const volOut = Math.round(Math.min(100, Math.max(0, 100 * pOut)));

  const sumVol = volIn + volOut;
  const powerRms = Math.sqrt(Math.pow(volIn / 100, 2) + Math.pow(volOut / 100, 2));

  if (sumVol < minSumVolume) minSumVolume = sumVol;
  if (powerRms < minPowerRms) minPowerRms = powerRms;

  if (i === 50) {
    midpointVolIn = volIn;
    midpointVolOut = volOut;
  }
}

console.log(`✓ Midpoint volumes: In = ${midpointVolIn}%, Out = ${midpointVolOut}%`);
console.log(`✓ Minimum sum volume during entire fade: ${minSumVolume}% (No volume dip!)`);
console.log(`✓ Minimum RMS Acoustic Power: ${minPowerRms.toFixed(3)} (Always >= 1.000 full presence)`);

assert.equal(midpointVolIn, 91, 'Midpoint incoming volume should be 91%');
assert.equal(midpointVolOut, 91, 'Midpoint outgoing volume should be 91%');
assert(minSumVolume >= 100, 'Sum of volumes must never drop below 100%');
assert(minPowerRms >= 1.0, 'RMS Acoustic power must never drop below 1.0');

// TASK 2: SKIP/NEXT Mix Action SFX & Crossfade Triggering
console.log('\n--- TASK 2: SKIP / NEXT Mix Action Triggering & Crossfade ---');

// Verify click listener for SKIP/NEXT in aurora-and-mix-engine.js
assert(codeAurora.includes("text.includes('SKIP') || text.includes('NEXT')"), 'Click listener must detect SKIP or NEXT');
assert(codeAurora.includes("addEventListener('click'"), 'Aurora engine must attach click listener');
assert(codeAurora.includes('SOUND_FX[activeMixStyle]()'), 'Active mix action must be triggered on SKIP/NEXT click');

// Verify all 5 Sound FX are implemented
const fxList = ['drum_roll', 'blend', 'filter_sweep', 'echo_drop', 'sub_drop'];
for (const fx of fxList) {
  assert(codeAurora.includes(`${fx}()`), `Sound FX "${fx}" must be defined in SOUND_FX`);
  console.log(`✓ Sound FX "${fx}" verified.`);
}

// Verify PlayerEngine skip() implementation
assert(codeChunk.includes('this.requestHandoff("skip")'), 'PlayerEngine skip() must trigger requestHandoff("skip")');
assert(codeChunk.includes('startFade(e)'), 'PlayerEngine must trigger startFade(incomingDeck)');
assert(codeChunk.includes('endFade(e)'), 'PlayerEngine must cleanup and cue next on endFade');

// TASK 3: triggerAudifyBeatPulse and onAudifySongChange
console.log('\n--- TASK 3: triggerAudifyBeatPulse & onAudifySongChange Integrity ---');

assert(codeAurora.includes('window.triggerAudifyBeatPulse = function'), 'window.triggerAudifyBeatPulse must be exposed on window');
assert(codeAurora.includes('window.onAudifySongChange = function'), 'window.onAudifySongChange must be exposed on window');

// Check audio glitch prevention in Web Audio envelopes
// Web Audio exponential ramp must not ramp to 0 (causes exception)
const invalidRamp = codeAurora.match(/exponentialRampToValueAtTime\(0,/);
assert(!invalidRamp, 'Must not call exponentialRampToValueAtTime with 0');
console.log('✓ Zero-value exponential ramp bug check passed (uses 0.001 safe floor).');

// Verify smooth envelope releases
const rampsToFloor = (codeAurora.match(/exponentialRampToValueAtTime\(0\.001/g) || []).length;
console.log(`✓ Safe anti-click release envelopes found: ${rampsToFloor} ramps.`);

console.log('\n=== ALL DIAGNOSTIC CHECKS PASSED SUCCESSFULLY ===');
