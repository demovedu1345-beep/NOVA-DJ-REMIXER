import fs from 'node:fs';
import assert from 'node:assert/strict';

const code = fs.readFileSync('public/js/ui/aurora-and-mix-engine.js', 'utf8');

// 1. Check patterns
const patternMatches = [...code.matchAll(/id:\s*['"]([a-z0-9-]+)['"]/g)].map(m => m[1]);
console.log('Total patterns found:', patternMatches.length);
assert.equal(patternMatches.length, 16, 'Expected exactly 16 patterns');

const expected6 = [
  'supernova-gold',
  'interstellar-void',
  'hyper-pop-bubblegum',
  'volcanic-magma',
  'glitch-cyberpunk',
  'radioactive-isotope'
];

expected6.forEach(id => {
  assert.ok(patternMatches.includes(id), 'Missing pattern: ' + id);
  console.log('Pattern confirmed:', id);
});

// 2. Check shader code contains chromatic aberration and visual modes
assert.ok(code.includes('uAberration'), 'uAberration uniform missing');
assert.ok(code.includes('uVisualMode'), 'uVisualMode uniform missing');
assert.ok(code.includes('uBeatPulse'), 'uBeatPulse uniform missing');
assert.ok(code.includes('evalAurora(field - offset'), 'evalAurora pos - offset missing');
assert.ok(code.includes('evalAurora(field + offset'), 'evalAurora pos + offset missing');

// 3. Check setAudifyAuroraMode
assert.ok(code.includes("'auto', 'soft', 'curtain', 'fusion', 'vortex', 'chromatic-wave'"), 'setAudifyAuroraMode validModes missing');

// 4. Check zero allocations in render
const renderStart = code.indexOf('function render(now) {');
const renderEnd = code.indexOf('requestAnimationFrame(render);', renderStart);
const renderBody = code.slice(renderStart, renderEnd);
assert.ok(!renderBody.includes('new Float32Array'), 'No Float32Array allocations in render');
assert.ok(!renderBody.includes('new Array'), 'No Array allocations in render');
assert.ok(!renderBody.includes('.map('), 'No .map in render');
assert.ok(!renderBody.includes('.filter('), 'No .filter in render');

console.log('ALL SHADER ARCHITECT & WEBGL2 MASTER AUDITS PASSED 100%!');
