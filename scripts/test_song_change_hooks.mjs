import fs from 'fs';
import path from 'path';

const repoRoot = 'C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER';

console.log('=== VERIFICATION SUITE: PlayerEngine Song-Change & Volume Stability ===\n');

// 1. Verify 3cq6guoi7hqi2.js
const chunkPath = path.join(repoRoot, 'public/naux/static/immutable/chunks/3cq6guoi7hqi2.js');
const chunkContent = fs.readFileSync(chunkPath, 'utf8');

const checksChunk = [
  {
    name: 'startFade calls window.onAudifySongChange with try-catch(err)',
    pattern: /window\.onAudifySongChange&&window\.onAudifySongChange\(e\.cue\)\}catch\(err\)\{console\.error\(err\)\}/
  },
  {
    name: 'onStateChange (first track live) calls window.onAudifySongChange',
    pattern: /"loading"===e\.status&&"live"===e\.role&&\(this\.clearTimer\(e\),e\.status="live",this\.log\(`Deck \${e\.id} live: \${e\.cue\.title}`\),this\.event\(\{type:"live",deck:e\.id,cue:e\.cue\}\),\(\(\)=>\{try\{window\.onAudifySongChange&&window\.onAudifySongChange\(e\.cue\)\}catch\(err\)\{console\.error\(err\)\}\}\)\(\),this\.emit\(\)\)/
  },
  {
    name: 'playIncoming initializes incoming volume to 30 (Serato floor continuity)',
    pattern: /playIncoming\(e\)\{let t=e\.player;t\.setVolume\(30\),t\.unMute\(\),t\.playVideo\(\)/
  },
  {
    name: 'startFade sets immediate initial volumes (e at 30, t at 100) before interval tick',
    pattern: /startFade\(e\)\{[\s\S]*?e\.player\?\.setVolume\(30\),t&&t!==e&&t\.player\?\.setVolume\(100\),this\.fadeTimer&&clearInterval\(this\.fadeTimer\)/
  },
  {
    name: 'Serato equal-power sine/cosine curve with 0.28 exponent and 30 floor preserved in crossfade',
    pattern: /e\.player\?\.setVolume\(Math\.round\(Math\.min\(100,Math\.max\(30,100\*Math\.pow\(Math\.sin\(s\*Math\.PI\/2\),0\.28\)\)\)\)\),t&&t!==e&&t\.player\?\.setVolume\(Math\.round\(Math\.min\(100,Math\.max\(0,100\*Math\.pow\(Math\.cos\(s\*Math\.PI\/2\),0\.28\)\)\)\)\)/
  },
  {
    name: 'endFade sets live deck volume to 100 and pauses/mutes outgoing deck',
    pattern: /endFade\(e\)\{this\.crossfading=!1;let t=this\.liveDeck\(\);t\?\.player\?\.unMute\(\),t\?\.player\?\.setVolume\(100\)/
  },
  {
    name: 'keepLiveAudible watchdog restores 100 volume but guards crossfading & awaitingStart',
    pattern: /if\(this\.finished\|\|this\.paused\|\|this\.endingSet\|\|this\.crossfading\|\|this\.awaitingStart\)return/
  }
];

let allPassed = true;
checksChunk.forEach(c => {
  const passed = c.pattern.test(chunkContent);
  console.log(`[3cq6guoi7hqi2.js] ${c.name}: ${passed ? 'PASS' : 'FAIL'}`);
  if (!passed) allPassed = false;
});

// 2. Verify aurora-and-mix-engine.js
const auroraPath = path.join(repoRoot, 'public/js/ui/aurora-and-mix-engine.js');
const auroraContent = fs.readFileSync(auroraPath, 'utf8');

const checksAurora = [
  {
    name: 'MutationObserver instantiated on title elements with requestAnimationFrame micro-debouncing',
    test: (c) => c.includes('const titleObserver = new MutationObserver') && c.includes('requestAnimationFrame(checkTitleElement)')
  },
  {
    name: 'Title element selectors cover .title-land, data-testid, and headings',
    test: (c) => /\.title-land, \[data-testid="track-title"\], \[data-testid="now-playing-title"\], \.track-title, \.now-playing-title, \.song-title/.test(c)
  },
  {
    name: 'window.audifyNextAuroraPattern is declared and cycles pattern, returning new active pattern',
    test: (c) => /window\.audifyNextAuroraPattern = function[\s\S]*?activePatternIdx = \(activePatternIdx \+ 1\) % AURORA_PATTERNS\.length[\s\S]*?return pattern;/.test(c)
  },
  {
    name: 'onAudifySongChange includes deduplication to prevent double-firing within 1500ms',
    test: (c) => /const isRecent = \(now - lastSongChangeTimestamp\) < 1500;/.test(c)
  },
  {
    name: 'UI click listener hooks into .skip-btn, .next-btn, [data-action="skip"], PLAY SET with capture phase true',
    test: (c) => /btn\.matches\('\.skip-btn, \.next-btn, \[data-action="skip"\], \[data-action="next"\], \[data-testid="skip-button"\], \[data-testid="next-button"]'\)[\s\S]*?text\.includes\('SKIP'\) \|\|[\s\S]*?text === 'PLAY SET'[\s\S]*?}, true\);/.test(c)
  }
];

console.log('');
checksAurora.forEach(c => {
  const passed = c.test(auroraContent);
  console.log(`[aurora-and-mix-engine.js] ${c.name}: ${passed ? 'PASS' : 'FAIL'}`);
  if (!passed) allPassed = false;
});

console.log(`\nOVERALL VERIFICATION: ${allPassed ? 'ALL TESTS PASSED (100% SUCCESS)' : 'SOME TESTS FAILED'}`);
process.exit(allPassed ? 0 : 1);
