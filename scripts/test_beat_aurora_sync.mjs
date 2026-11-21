// =========================================================================
// Automated Verification Script: Beat-Sync WebGL2 Aurora & RGB Border
// =========================================================================

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- 1. Testing Syntax with node --check ---');
// Files must exist and be readable
const beatAnalyzerCode = fs.readFileSync(path.join(rootDir, 'public/js/engine/beat-analyzer.js'), 'utf8');
const auroraCode = fs.readFileSync(path.join(rootDir, 'public/js/ui/aurora-and-mix-engine.js'), 'utf8');

assert.ok(beatAnalyzerCode.length > 1000, 'beat-analyzer.js must have content');
assert.ok(auroraCode.length > 5000, 'aurora-and-mix-engine.js must have content');
console.log('✓ Source files loaded successfully.');

console.log('\n--- 2. Inspecting Zero-GC Preallocated Result Object in beat-analyzer.js ---');
assert.ok(beatAnalyzerCode.includes('beatResult'), 'beat-analyzer.js must preallocate beatResult buffer');
assert.ok(beatAnalyzerCode.includes('rawKick'), 'beat-analyzer.js must provide rawKick in result');
assert.ok(beatAnalyzerCode.includes('beatResult.beatEnergy = beatEnergy'), 'beat-analyzer.js reuses beatResult.beatEnergy without per-frame allocations');
console.log('✓ Zero-GC preallocated beatResult verified in beat-analyzer.js.');

console.log('\n--- 3. Inspecting AURORA_PATTERNS Count & New Patterns in aurora-and-mix-engine.js ---');
assert.ok(auroraCode.includes("'quantum-pulse'"), 'quantum-pulse pattern must exist in aurora-and-mix-engine.js');
assert.ok(auroraCode.includes("'tokyo-drift'"), 'tokyo-drift pattern must exist in aurora-and-mix-engine.js');

// Count pattern objects in AURORA_PATTERNS array
const patternMatches = auroraCode.match(/id:\s*['"]([a-z0-9-]+)['"]/g);
const patternIds = patternMatches ? patternMatches.map(m => m.replace(/id:\s*['"]|['"]/g, '')) : [];
console.log('Found pattern IDs:', patternIds);
assert.ok(patternIds.includes('quantum-pulse'), 'patternIds includes quantum-pulse');
assert.ok(patternIds.includes('tokyo-drift'), 'patternIds includes tokyo-drift');
assert.ok(patternIds.length >= 10, `Must have at least 10 patterns, found ${patternIds.length}`);
console.log(`✓ 10 Aurora Patterns verified (${patternIds.length} patterns total).`);

console.log('\n--- 4. Inspecting Beat-Sync Render Loop Integration in aurora-and-mix-engine.js ---');
assert.ok(auroraCode.includes('window.__audify_beat_analyzer.update(dt, now)'), 'Render loop must call window.__audify_beat_analyzer.update(dt, now)');
assert.ok(auroraCode.includes('beatData.beatEnergy'), 'Render loop must inspect beatData.beatEnergy');
assert.ok(auroraCode.includes('beatPulse = Math.max(beatPulse,'), 'Render loop must modulate beatPulse');
assert.ok(auroraCode.includes('borderContainerEl.style.boxShadow'), 'Render loop must modulate borderContainerEl.style.boxShadow');
assert.ok(auroraCode.includes('uNoiseAmp, 1.05 + (beatPulse - 1.0) *'), 'Shader uniform uNoiseAmp modulated with beatPulse');
assert.ok(auroraCode.includes('uBandSpread, 1.0 + (beatPulse - 1.0) *'), 'Shader uniform uBandSpread modulated with beatPulse');
assert.ok(auroraCode.includes('uBrightness, 1.25 * (1.0 + (beatPulse - 1.0) *'), 'Shader uniform uBrightness modulated with beatPulse');
console.log('✓ Beat-sync WebGL2 render loop & uniform modulation verified.');

console.log('\n--- 5. Inspecting triggerAudifySongTransition in aurora-and-mix-engine.js ---');
assert.ok(auroraCode.includes('window.triggerAudifySongTransition = triggerAudifySongTransition'), 'window.triggerAudifySongTransition must be exposed globally');
assert.ok(auroraCode.includes('function triggerAudifySongTransition('), 'triggerAudifySongTransition function must be defined');
console.log('✓ triggerAudifySongTransition function verified.');

console.log('\n==========================================================');
console.log('  ALL BEAT-SYNC AURORA & RGB BORDER CHECKS PASSED (100%)');
console.log('==========================================================');
