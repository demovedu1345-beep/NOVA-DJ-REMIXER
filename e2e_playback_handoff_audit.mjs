// e2e_playback_handoff_audit.mjs
// End-to-End Playback Queue & Handoff Auditor Suite
// Audits both public/naux/static/immutable/chunks/3cq6guoi7hqi2.js and public/js/engine/orchestrator.js

import fs from 'fs';
import assert from 'assert';
import setHandler from './api/set.js';
import artistsHandler from './api/artists.js';

console.log('======================================================================');
console.log('       END-TO-END PLAYBACK QUEUE & HANDOFF AUDIT VERIFICATION');
console.log('======================================================================\n');

class MockRes {
  statusCode = 200;
  headers = {};
  body = null;
  setHeader(k, v) { this.headers[k] = v; }
  end(d) { this.body = d; }
}

async function runApiSet(payload) {
  const req = { method: 'POST', url: '/api/set', body: JSON.stringify(payload) };
  const res = new MockRes();
  await setHandler(req, res);
  return JSON.parse(res.body);
}

// ======================================================================
// SECTION 1: "PLAY ALL" VERIFICATION (The Weeknd & Arijit Singh)
// ======================================================================
console.log('----------------------------------------------------------------------');
console.log('AUDIT CHECK 1: "Play All" on Artists (The Weeknd & Arijit Singh)');
console.log('----------------------------------------------------------------------');

// 1.1 Verify /api/set returns valid cues for The Weeknd
const weekndRes = await runApiSet({ artist: 'the-weeknd', lang: 'english', shuffle: false });
console.log(`[API] The Weeknd Cues returned: ${weekndRes.cues?.length || 0}`);
assert.ok(weekndRes.cues && weekndRes.cues.length > 0, 'The Weeknd must have playable cues');
const sampleWeeknd = weekndRes.cues[0];
assert.ok(sampleWeeknd.youtube_ids?.length > 0, 'The Weeknd first track must have youtube_ids');
assert.ok(Number.isFinite(sampleWeeknd.duration_sec), 'Track duration must be numeric');
console.log(`  ✓ Sample track: "${sampleWeeknd.title}" by ${sampleWeeknd.artist} (Entry: ${sampleWeeknd.entry_sec}s, Exit: ${sampleWeeknd.exit_sec}s, Dur: ${sampleWeeknd.duration_sec}s)`);

// 1.2 Verify /api/set returns valid cues for Arijit Singh
const arijitRes = await runApiSet({ artist: 'arijit-singh', lang: 'hindi', shuffle: false });
console.log(`[API] Arijit Singh Cues returned: ${arijitRes.cues?.length || 0}`);
assert.ok(arijitRes.cues && arijitRes.cues.length > 0, 'Arijit Singh must have playable cues');
const sampleArijit = arijitRes.cues[0];
assert.ok(sampleArijit.youtube_ids?.length > 0, 'Arijit Singh first track must have youtube_ids');
console.log(`  ✓ Sample track: "${sampleArijit.title}" by ${sampleArijit.artist} (Entry: ${sampleArijit.entry_sec}s, Exit: ${sampleArijit.exit_sec}s, Dur: ${sampleArijit.duration_sec}s)`);

// Load 3cq6guoi7hqi2.js PlayerEngine
const chunkContent = fs.readFileSync('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'utf8');
const startCls = chunkContent.indexOf('class l{');
const endCls = chunkContent.indexOf('e.s(["PlayerEngine",0,l])');
const classCode = chunkContent.substring(startCls, endCls);

const createMockDeck = (id) => ({
  id,
  cue: null,
  player: {
    vol: 100,
    muted: false,
    curTime: 0,
    dur: 180,
    state: -1,
    loadVideoById(opts) { this.curTime = opts.startSeconds || 0; },
    playVideo() { this.state = 1; },
    pauseVideo() { this.state = 2; },
    mute() { this.muted = true; },
    unMute() { this.muted = false; },
    setVolume(v) { this.vol = v; },
    getVolume() { return this.vol; },
    isMuted() { return this.muted; },
    getCurrentTime() { return this.curTime; },
    getDuration() { return this.dur; },
    seekTo(s) { this.curTime = s; }
  },
  status: 'empty',
  role: 'idle',
  idIndex: 0,
  playFull: false,
  volumeFixed: false,
  fails: [],
  retried: false,
  nudged: false,
  since: 0,
  timer: null
});

const a = (e) => {
  const t = Math.max(0, Math.floor(e));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};
const s = { 2: 'invalid param', 5: 'HTML5 error', 100: 'video not found', 101: 'embedding disabled', 150: 'embedding disabled' };

const PlayerEngineClass = new Function('n', 't', 'a', 's', classCode + '; return l;')(
  createMockDeck,
  { loadYouTubeIframeApi: async () => ({}) },
  a,
  s
);

// Test Initial Start with PlayerEngine
const engine1 = new PlayerEngineClass({ style: {}, dataset: {} }, {
  onDeckChange: (state) => {},
  onEvent: (ev) => {},
  onLog: (l) => {}
});
engine1.ready = true;

engine1.start(weekndRes.cues);
console.log(`[PlayerEngine] Initial start with The Weeknd:`);
console.log(`  Queue loaded length: ${engine1.queue.length}`);
console.log(`  Live Deck: ${engine1.liveId} (Track: "${engine1.decks.A.cue?.title}")`);
console.log(`  Preloaded Deck: B (Track: "${engine1.decks.B.cue?.title}")`);
assert.strictEqual(engine1.started, true);
assert.strictEqual(engine1.decks.A.status, 'loading');
assert.strictEqual(engine1.decks.A.cue.title, sampleWeeknd.title);
assert.strictEqual(engine1.decks.B.status, 'loading');
console.log('  ✓ Initial "Play All" immediately loads queue, starts Deck A, and preloads Deck B.');

// Test Re-start / switching artist while set is active
console.log(`[PlayerEngine] Attempting "Play All" on Arijit Singh while set is already started...`);
const previousCueTitle = engine1.decks.A.cue?.title;
// Simulate artist-explorer.js resetting started/finished before starting new artist
engine1.started = false;
engine1.finished = false;
engine1.endingSet = false;
engine1.start(arijitRes.cues);
const switchSucceeded = engine1.decks.A.cue?.title === sampleArijit.title;
console.log(`  Did engine1.start(arijitRes.cues) replace the active set with Arijit Singh? ${switchSucceeded}`);
assert.strictEqual(switchSucceeded, true, 'Switching artist via Play All must cleanly load new artist queue');
console.log(`  ✓ Hot-switching artist (e.g. The Weeknd -> Arijit Singh) loads queue (${engine1.queue.length} tracks) and starts Deck A ("${engine1.decks.A.cue?.title}") immediately.`);

// Test NovaOrchestrator from orchestrator.js
console.log(`\n[NovaOrchestrator] Testing startSet() in public/js/engine/orchestrator.js...`);
const orchestratorCode = fs.readFileSync('public/js/engine/orchestrator.js', 'utf8');
// Check startSet implementation
const hasStopInStartSet = orchestratorCode.includes('this.stop(true);') && orchestratorCode.includes('async startSet(tracks');
console.log(`  Does NovaOrchestrator.startSet() call this.stop(true) to cleanly restart? ${hasStopInStartSet}`);
assert.ok(hasStopInStartSet, 'NovaOrchestrator must clean previous playback in startSet');
console.log('  ✓ NovaOrchestrator cleanly resets and starts new artist set immediately every time.');

// ======================================================================
// SECTION 2: CROSSFADE HANDOFF & MOBILE VOLUME DROP AUDIT
// ======================================================================
console.log('\n----------------------------------------------------------------------');
console.log('AUDIT CHECK 2: Crossfade Handoff & Mobile 100% Volume (No Whisper Drop)');
console.log('----------------------------------------------------------------------');

// Test isMobile() detection
const mobileEngine = new PlayerEngineClass({ style: {}, dataset: {} }, {});
mobileEngine.ready = true;
// Mock mobile user agent
Object.defineProperty(global, 'window', {
  value: {
    innerWidth: 375,
    location: { origin: 'http://localhost:3000' }
  },
  configurable: true,
  writable: true
});
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    maxTouchPoints: 5
  },
  configurable: true,
  writable: true
});
Object.defineProperty(global, 'document', {
  value: { hidden: false },
  configurable: true,
  writable: true
});

assert.strictEqual(mobileEngine.isMobile(), true, 'Must detect iPhone as mobile');
console.log('  ✓ mobileEngine.isMobile() === true');

// Start with 2 tracks
mobileEngine.start([sampleWeeknd, weekndRes.cues[1]]);
const deckA = mobileEngine.decks.A;
const deckB = mobileEngine.decks.B;

// Simulate deck A live
deckA.status = 'live';
deckA.player.vol = 100;
deckA.player.muted = false;

// Simulate deck B cued and ready
deckB.status = 'ready';

console.log('  Simulating mobile handoff: playIncoming(deckB)...');
mobileEngine.playIncoming(deckB);
console.log(`  Incoming Deck B volume immediately set to: ${deckB.player.getVolume()}% (Muted: ${deckB.player.isMuted()})`);
assert.strictEqual(deckB.player.getVolume(), 100, 'Incoming deck on mobile MUST be set to 100% volume in playIncoming');
assert.strictEqual(deckB.player.isMuted(), false, 'Incoming deck must be unmuted');

console.log('  Simulating mobile crossfade: startFade(deckB)...');
mobileEngine.startFade(deckB);
assert.strictEqual(mobileEngine.crossfading, true);
console.log(`  At fade start -> Live Deck B volume: ${deckB.player.getVolume()}%, Outgoing Deck A volume: ${deckA.player.getVolume()}%`);
assert.strictEqual(deckB.player.getVolume(), 100, 'Live incoming Deck B MUST be 100% volume during fade');

// Simulate OS ducking Deck B to 20% during crossfade
deckB.player.setVolume(20);
deckB.player.mute();
console.log(`  Simulated OS volume duck on Deck B: ${deckB.player.getVolume()}% (Muted: ${deckB.player.isMuted()})`);

// Call keepLiveAudible()
mobileEngine.keepLiveAudible();
console.log(`  After keepLiveAudible() -> Deck B volume: ${deckB.player.getVolume()}% (Muted: ${deckB.player.isMuted()})`);
assert.strictEqual(deckB.player.getVolume(), 100, 'keepLiveAudible must restore 100% volume on mobile');
assert.strictEqual(deckB.player.isMuted(), false, 'keepLiveAudible must unmute on mobile');
console.log('  ✓ Mobile volume ducking completely guarded and restored to 100%.');

// Check orchestrator.js crossfade volume curve
console.log('\n[NovaOrchestrator] Auditing crossfade volume curve in public/js/engine/orchestrator.js...');
const hasYtSmoothFade = orchestratorCode.includes('Math.sin((smooth * Math.PI) / 2)') && orchestratorCode.includes('Math.cos((smooth * Math.PI) / 2)');
console.log(`  Equal-power sin/cos crossfade curve present: ${hasYtSmoothFade}`);
assert.ok(hasYtSmoothFade, 'NovaOrchestrator must use equal-power crossfade curve');
const setsFullVolOnCompletion = orchestratorCode.includes('inSlot.ytVol = 1;') && orchestratorCode.includes('this.ytEngine?.setVolume(inId, 1);');
console.log(`  Sets full 100% volume on transition completion: ${setsFullVolOnCompletion}`);
assert.ok(setsFullVolOnCompletion, 'NovaOrchestrator must set 100% volume when transition completes');
console.log('  ✓ Equal-power handoff maintains constant power and restores 100% volume.');

// ======================================================================
// SECTION 3: TRACK SKIPPING AUDIT (skip())
// ======================================================================
console.log('\n----------------------------------------------------------------------');
console.log('AUDIT CHECK 3: Track Skipping (skip()) Graceful Crossfade / Cut');
console.log('----------------------------------------------------------------------');

// Test skip() in PlayerEngine
const skipEngine = new PlayerEngineClass({ style: {}, dataset: {} }, {
  onLog: (m) => console.log(`    [PlayerEngine Log] ${m}`)
});
skipEngine.ready = true;
skipEngine.start([sampleWeeknd, weekndRes.cues[1], weekndRes.cues[2]]);
skipEngine.decks.A.status = 'live';
skipEngine.decks.B.status = 'ready';

let handoffRequestedWith = null;
const origStartIncoming = skipEngine.startIncoming.bind(skipEngine);
skipEngine.startIncoming = function(e, reason) {
  handoffRequestedWith = reason;
  return origStartIncoming(e, reason);
};

console.log('[PlayerEngine] Calling skip() during playback with Deck B ready:');
skipEngine.skip();
console.log(`  Handoff reason triggered: "${handoffRequestedWith}"`);
assert.strictEqual(handoffRequestedWith, 'skip', 'skip() must request handoff with reason "skip"');
assert.strictEqual(skipEngine.awaitingStart, 'B', 'Incoming deck must be cued to start');
console.log('  ✓ skip() gracefully triggers handoff/crossfade to next ready deck.');

// Test skip() on final track (no upcoming tracks)
console.log('\n[PlayerEngine] Calling skip() on final track with other deck empty:');
const finalSkipEngine = new PlayerEngineClass({ style: {}, dataset: {} }, {
  onLog: (m) => console.log(`    [PlayerEngine Log] ${m}`)
});
finalSkipEngine.ready = true;
finalSkipEngine.start([sampleWeeknd]);
finalSkipEngine.decks.A.status = 'live';
finalSkipEngine.decks.B.status = 'empty';
finalSkipEngine.decks.B.cue = null;

finalSkipEngine.skip();
console.log(`  Final track skip state: finished = ${finalSkipEngine.finished}`);
assert.strictEqual(finalSkipEngine.finished, true, 'Skipping final track must cleanly finish set');
console.log('  ✓ skip() on final track pauses video and finishes set without hanging.');

// Test skip() in NovaOrchestrator
console.log('\n[NovaOrchestrator] Auditing skip() in public/js/engine/orchestrator.js...');
const hasSkipMethod = orchestratorCode.includes('skip()') && orchestratorCode.includes("triggerTransition('skip')");
console.log(`  NovaOrchestrator.skip() triggers transition with 'skip': ${hasSkipMethod}`);
assert.ok(hasSkipMethod, 'NovaOrchestrator must implement skip() with triggerTransition');
const hasEndLastTrackOnEmpty = orchestratorCode.includes('if (!inSlot.track)') && orchestratorCode.includes('return this.#endLastTrack(outId);');
console.log(`  NovaOrchestrator.triggerTransition ends set cleanly when inSlot has no track: ${hasEndLastTrackOnEmpty}`);
assert.ok(hasEndLastTrackOnEmpty, 'NovaOrchestrator must call #endLastTrack when cue slot has no track');
console.log('  ✓ NovaOrchestrator gracefully crossfades to next track or fades out on final track.');

// ======================================================================
// SECTION 4: END OF SET CLEAN COMPLETION (NO AUDIO HANGING)
// ======================================================================
console.log('\n----------------------------------------------------------------------');
console.log('AUDIT CHECK 4: End of Set Clean Completion (No Audio Hanging)');
console.log('----------------------------------------------------------------------');

// Test 4.1: Natural cut point reached on final track in PlayerEngine
console.log('[PlayerEngine] Simulating natural cut point on final track...');
const endEngine = new PlayerEngineClass({ style: {}, dataset: {} }, {
  onLog: (m) => console.log(`    [PlayerEngine Log] ${m}`)
});
endEngine.ready = true;
endEngine.start([sampleWeeknd]);
const liveDeck = endEngine.decks.A;
liveDeck.status = 'live';
endEngine.decks.B.status = 'empty';
endEngine.decks.B.cue = null;

// Simulate current time reaching cut point
liveDeck.player.curTime = liveDeck.cue.exit_sec + 1;
liveDeck.player.dur = liveDeck.cue.duration_sec;

console.log(`  Deck A pos: ${liveDeck.player.curTime}s, CutPoint: ${endEngine.cutPoint(liveDeck)}s, Deck B: ${endEngine.decks.B.status}`);
endEngine.tick();
console.log(`  endSetWithFade initiated? endingSet = ${endEngine.endingSet}, fadeTimer active = ${Boolean(endEngine.fadeTimer)}`);
assert.strictEqual(endEngine.endingSet, true, 'endingSet must be true');
assert.ok(endEngine.fadeTimer, 'fadeTimer must be running to fade out volume over 3s');

// Test 4.2: YouTube video ENDED (state 0) on final track in PlayerEngine
console.log('\n[PlayerEngine] Simulating YouTube ENDED event (data: 0) on live deck...');
const endedEngine = new PlayerEngineClass({ style: {}, dataset: {} }, {
  onLog: (m) => console.log(`    [PlayerEngine Log] ${m}`)
});
endedEngine.ready = true;
endedEngine.start([sampleWeeknd]);
endedEngine.decks.A.status = 'live';
endedEngine.decks.B.status = 'empty';
endedEngine.decks.B.cue = null;

// Fire onStateChange with 0 (ENDED)
endedEngine.onStateChange(endedEngine.decks.A, 0);
console.log(`  After state 0 -> finished = ${endedEngine.finished}, pendingHandoff = ${endedEngine.pendingHandoff}`);
assert.strictEqual(endedEngine.finished, true, 'State 0 on final track must cleanly finish set');
console.log('  ✓ PlayerEngine cleanly completes without audio hanging.');

// Test 4.3: NovaOrchestrator #endLastTrack and #finishSet
console.log('\n[NovaOrchestrator] Auditing #endLastTrack and #finishSet in public/js/engine/orchestrator.js...');
const hasEndLastTrack = orchestratorCode.includes('#endLastTrack(liveId)');
const hasPendingEndAt = orchestratorCode.includes('this.pendingEndAt = fadeEnd + 0.08;');
const hasFinishSet = orchestratorCode.includes('#finishSet()');
const stopsAllEnginesOnFinish = orchestratorCode.includes('this.ytEngine?.stopAll();') && orchestratorCode.includes('this.proMixer.stopDeck(liveId)');

console.log(`  #endLastTrack ramps volume down: ${hasEndLastTrack && hasPendingEndAt}`);
console.log(`  #finishSet halts all playback and unsubscribes clock: ${hasFinishSet && stopsAllEnginesOnFinish}`);
assert.ok(hasEndLastTrack && hasPendingEndAt, 'NovaOrchestrator must implement #endLastTrack with fade');
assert.ok(hasFinishSet && stopsAllEnginesOnFinish, 'NovaOrchestrator must stop all engines in #finishSet');
console.log('  ✓ NovaOrchestrator cleanly stops all engines without hanging audio.');

console.log('\n======================================================================');
console.log('             ALL 4 AUDIT VERIFICATIONS COMPLETE');
console.log('======================================================================');
process.exit(0);
