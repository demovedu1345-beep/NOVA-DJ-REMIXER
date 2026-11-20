// Mock browser environment
let customEvents = [];
global.window = {
  triggerAudifyBeatPulse: (intensity) => {
    // console.log('Mock beatPulse triggered with intensity:', intensity);
  },
  dispatchEvent: (ev) => {
    customEvents.push(ev);
  }
};
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

console.log('--- Simulating Song-Change & Pattern Cycling Logic ---');

const AURORA_PATTERNS = [
  { id: 'rgb-spectrum', name: 'PRISMATIC RGB SPECTRUM' },
  { id: 'cyber-neon', name: 'CYBER NEON LASER' },
  { id: 'emerald-aurora', name: 'EMERALD BOREALIS' },
  { id: 'solar-flare', name: '808 SOLAR PLASMA' }
];
let activePatternIdx = 0;
let trackCounter = 0;
let lastSongChangeTimestamp = 0;
let lastSongChangeTitle = '';

function updateBorderCssVariables(p) {}
function triggerSongChangeExplosion(p, t) {}

function onAudifySongChange(songInfo = {}) {
  const rawTitle = typeof songInfo === 'string' ? songInfo : (songInfo?.title || '');
  const cleanTitle = (rawTitle || '').trim();
  const now = performance.now();

  const isRecent = (now - lastSongChangeTimestamp) < 1500;
  if (isRecent) {
    if (cleanTitle && cleanTitle !== 'Next Song' && cleanTitle !== 'Starting Set' && cleanTitle !== 'Preview Next Pattern' && cleanTitle !== lastSongChangeTitle) {
      lastSongChangeTitle = cleanTitle;
      console.log('  [Deduplication: Title updated on HUD badge without duplicate cycle]', cleanTitle);
    }
    return;
  }

  lastSongChangeTimestamp = now;
  if (cleanTitle && cleanTitle !== 'Next Song' && cleanTitle !== 'Starting Set' && cleanTitle !== 'Preview Next Pattern') {
    lastSongChangeTitle = cleanTitle;
  }

  trackCounter++;
  activePatternIdx = (activePatternIdx + 1) % AURORA_PATTERNS.length;
  const pattern = AURORA_PATTERNS[activePatternIdx];
  console.log(`  [New Song Transition Triggered] Track #${trackCounter}: "${cleanTitle || 'Next Song'}" -> Pattern: ${pattern.name}`);
  return pattern;
}

// Test 1: User clicks "SKIP"
console.log('\nScenario 1: User clicks SKIP');
onAudifySongChange({ title: 'Next Song', trigger: 'ui-click' });
const pAfterClick = activePatternIdx;

// Test 2: 40ms later, PlayerEngine fires startFade
console.log('\nScenario 2: 40ms later PlayerEngine fires startFade with cue "Tauba Tauba"');
onAudifySongChange({ title: 'Tauba Tauba' });
const pAfterFade = activePatternIdx;

// Test 3: 80ms later, MutationObserver fires with DOM title "Tauba Tauba"
console.log('\nScenario 3: 80ms later MutationObserver observes DOM title "Tauba Tauba"');
onAudifySongChange({ title: 'Tauba Tauba', source: 'mutation-observer' });
const pAfterObserver = activePatternIdx;

console.log('\nPattern index comparison (should all be equal):');
console.log('After Click:', pAfterClick, '| After Fade:', pAfterFade, '| After Observer:', pAfterObserver);
if (pAfterClick === pAfterFade && pAfterFade === pAfterObserver) {
  console.log('SUCCESS: Seamless single-transition choreography with zero double-triggering!');
} else {
  console.error('FAIL: Pattern cycled multiple times!');
  process.exit(1);
}
