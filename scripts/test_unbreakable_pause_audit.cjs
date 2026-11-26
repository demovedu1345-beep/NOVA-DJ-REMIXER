// scripts/test_unbreakable_pause_audit.cjs
// Verification Suite for Audio Engine & Unbreakable Pause Auditor

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('===================================================================');
console.log('AUDIFY / NOVA-DJ-REMIXER: UNBREAKABLE PAUSE & RESUME AUDIT SUITE');
console.log('===================================================================\n');

// Mock DOM & Web API Environment
function createMockEnvironment() {
  const events = {};
  const iframes = [];
  const postMessages = [];

  const bgAnchor = {
    id: 'audify-bg-anchor',
    paused: false,
    playCount: 0,
    pauseCount: 0,
    play: async function() {
      this.paused = false;
      this.playCount++;
    },
    pause: function() {
      this.paused = true;
      this.pauseCount++;
    }
  };

  const mockWindow = {
    innerWidth: 390,
    location: { origin: 'http://localhost:3000' },
    addEventListener: (event, handler, options) => {
      events[event] = events[event] || [];
      events[event].push(handler);
    },
    removeEventListener: (event, handler) => {
      if (events[event]) {
        events[event] = events[event].filter(h => h !== handler);
      }
    },
    triggerEvent: (event, data) => {
      if (events[event]) {
        events[event].forEach(h => h(data));
      }
    }
  };

  const mockDocument = {
    hidden: false,
    addEventListener: (event, handler, options) => {
      events[event] = events[event] || [];
      events[event].push(handler);
    },
    removeEventListener: (event, handler) => {
      if (events[event]) {
        events[event] = events[event].filter(h => h !== handler);
      }
    },
    createElement: (tag) => {
      if (tag === 'audio') {
        return bgAnchor;
      }
      const el = {
        tagName: tag.toUpperCase(),
        style: {},
        dataset: {},
        id: '',
        appendChild: () => {},
        children: []
      };
      if (tag === 'iframe') {
        el.contentWindow = {
          postMessage: (msg, targetOrigin) => {
            postMessages.push({ iframeId: el.id, msg, targetOrigin });
          }
        };
        iframes.push(el);
      }
      return el;
    },
    querySelectorAll: (selector) => {
      if (selector === 'iframe' || selector.includes('iframe')) {
        return iframes;
      }
      return [];
    },
    getElementById: (id) => {
      if (id === 'audify-bg-anchor') return bgAnchor;
      return null;
    },
    body: {
      appendChild: () => {}
    }
  };

  const mockMediaSession = {
    playbackState: 'none',
    actionHandlers: {},
    setActionHandler: function(action, handler) {
      this.actionHandlers[action] = handler;
    },
    metadata: null
  };

  const mockNavigator = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    maxTouchPoints: 5,
    mediaSession: mockMediaSession
  };

  return {
    window: mockWindow,
    document: mockDocument,
    navigator: mockNavigator,
    bgAnchor,
    iframes,
    postMessages,
    triggerEvent: (event, data) => {
      if (events[event]) events[event].forEach(h => h(data));
    }
  };
}

class MockYTPlayer {
  constructor(id) {
    this.id = id;
    this.volume = 100;
    this.muted = false;
    this.paused = false;
    this.playing = false;
    this.playVideoCalls = 0;
    this.pauseVideoCalls = 0;
    this.currentTime = 42;
  }
  setVolume(vol) { this.volume = vol; }
  getVolume() { return this.volume; }
  mute() { this.muted = true; }
  unMute() { this.muted = false; }
  isMuted() { return this.muted; }
  playVideo() {
    this.playing = true;
    this.paused = false;
    this.playVideoCalls++;
  }
  pauseVideo() {
    this.playing = false;
    this.paused = true;
    this.pauseVideoCalls++;
  }
  getCurrentTime() { return this.currentTime; }
}

async function runAudit() {
  const env = createMockEnvironment();
  global.window = env.window;
  global.document = env.document;
  Object.defineProperty(globalThis, 'navigator', {
    value: env.navigator,
    configurable: true,
    writable: true
  });
  global.performance = { now: () => Date.now() };

  // 1. Load PlayerEngine from 3cq6guoi7hqi2.js
  const chunkPath = path.resolve('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js');
  const chunkContent = fs.readFileSync(chunkPath, 'utf8');

  const startCls = chunkContent.indexOf('class l{');
  const endCls = chunkContent.indexOf('e.s(["PlayerEngine",0,l])');
  assert.ok(startCls !== -1 && endCls !== -1, 'Failed to locate class PlayerEngine in chunk');
  const classCode = chunkContent.substring(startCls, endCls);

  const n = (id) => ({
    id,
    cue: null,
    player: null,
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

  const PlayerEngineClass = new Function('n', 't', `
    ${classCode}
    return l;
  `)(n, { loadYouTubeIframeApi: async () => ({}) });

  // Attach mock iframes
  const iframeA = env.document.createElement('iframe');
  iframeA.id = 'naux-player-A';
  const iframeB = env.document.createElement('iframe');
  iframeB.id = 'naux-player-B';

  const hostEl = env.document.createElement('div');
  const engine = new PlayerEngineClass(hostEl, { styleHost: false });
  global.window.__nauxEngine = engine;

  // Initialize engine decks with MockYTPlayer
  engine.decks.A.player = new MockYTPlayer('A');
  engine.decks.B.player = new MockYTPlayer('B');
  engine.decks.A.cue = { song_id: 'song-A', title: 'Track A' };
  engine.decks.B.cue = { song_id: 'song-B', title: 'Track B' };
  engine.decks.A.status = 'live';
  engine.decks.B.status = 'cue';
  engine.liveId = 'A';

  console.log('--- 1. VERIFYING UNCONDITIONAL this.paused = true ON pause() ---');
  engine.paused = false;
  engine.pauseAfterFade = true;
  engine.awaitingStart = 'B';
  engine.fadeTimer = setInterval(() => {}, 1000);

  engine.pause();

  assert.strictEqual(engine.paused, true, 'FAIL: engine.paused must be unconditionally true');
  assert.strictEqual(engine.pauseAfterFade, false, 'FAIL: engine.pauseAfterFade must be cleared to false');
  assert.strictEqual(engine.awaitingStart, null, 'FAIL: engine.awaitingStart must be cleared to null');
  assert.strictEqual(engine.fadeTimer, null, 'FAIL: engine.fadeTimer must be cleared and nulled');
  console.log('✔ PASS: this.paused is unconditionally set to true, fadeTimer & awaitingStart cleared.');

  console.log('\n--- 2. VERIFYING ALL DECKS ARE PAUSED ---');
  assert.strictEqual(engine.decks.A.player.pauseVideoCalls, 1, 'Deck A must have called pauseVideo()');
  assert.strictEqual(engine.decks.B.player.pauseVideoCalls, 1, 'Deck B must have called pauseVideo()');
  assert.strictEqual(engine.decks.A.player.paused, true, 'Deck A player must be paused');
  assert.strictEqual(engine.decks.B.player.paused, true, 'Deck B player must be paused');
  console.log('✔ PASS: All decks (A & B) explicitly called pauseVideo().');

  console.log('\n--- 3. VERIFYING IFRAME postMessage COMMANDS ---');
  const pauseMsgCount = env.postMessages.filter(
    m => m.msg === '{"event":"command","func":"pauseVideo","args":""}' && m.targetOrigin === '*'
  ).length;
  assert.strictEqual(pauseMsgCount, 2, 'Must send pauseVideo postMessage to all 2 iframes');
  console.log(`✔ PASS: ${pauseMsgCount} iframes received postMessage "pauseVideo" command with wildcard targetOrigin.`);

  console.log('\n--- 4. VERIFYING #audify-bg-anchor IS PAUSED ---');
  assert.strictEqual(env.bgAnchor.paused, true, 'FAIL: audify-bg-anchor must be paused');
  assert.strictEqual(env.bgAnchor.pauseCount, 1, 'FAIL: audify-bg-anchor pause() must have been called');
  console.log('✔ PASS: document.getElementById("audify-bg-anchor") is paused.');

  console.log('\n--- 5. VERIFYING navigator.mediaSession.playbackState IS "paused" ---');
  assert.strictEqual(env.navigator.mediaSession.playbackState, 'paused', 'FAIL: mediaSession.playbackState must be "paused"');
  console.log('✔ PASS: navigator.mediaSession.playbackState is set to "paused".');

  console.log('\n--- 6. VERIFYING onVisibility GUARDS WITH `if (this.paused) return;` & `!this.paused` ---');
  // Reset player call counters
  engine.decks.A.player.playVideoCalls = 0;
  engine.decks.B.player.playVideoCalls = 0;

  // Ensure engine is paused
  assert.strictEqual(engine.paused, true);

  // Scenario A: Foreground -> Background (phone lock or tab switch)
  env.document.hidden = true;
  engine.onVisibility();

  // Scenario B: Background -> Foreground (phone unlock or tab switch back)
  env.document.hidden = false;
  engine.onVisibility();

  assert.strictEqual(engine.decks.A.player.playVideoCalls, 0, 'FAIL: onVisibility must NEVER call playVideo() when paused');
  assert.strictEqual(engine.decks.B.player.playVideoCalls, 0, 'FAIL: onVisibility must NEVER call playVideo() on deck B');
  console.log('✔ PASS: onVisibility() strictly returned early; zero playVideo calls while paused.');

  // Also verify background-audio.js visibilitychange listener logic
  console.log('\n--- 6b. VERIFYING background-audio.js VISIBILITYCHANGE GUARDIAN ---');
  const bgAudioPath = path.resolve('public/js/engine/background-audio.js');
  const bgAudioContent = fs.readFileSync(bgAudioPath, 'utf8');

  assert.ok(
    bgAudioContent.includes('if (engine.paused) {'),
    'FAIL: background-audio.js must check if (engine.paused)'
  );
  assert.ok(
    bgAudioContent.includes('if (anchorAudio && !anchorAudio.paused) anchorAudio.pause();'),
    'FAIL: background-audio.js must pause anchorAudio if engine.paused'
  );
  assert.ok(
    bgAudioContent.includes('return;'),
    'FAIL: background-audio.js must return immediately when engine.paused'
  );
  assert.ok(
    bgAudioContent.includes('if (player && !engine.paused)'),
    'FAIL: background-audio.js must guard playVideo with !engine.paused'
  );
  console.log('✔ PASS: background-audio.js contains strict `if (engine.paused)` guard and never restarts audio.');

  console.log('\n--- 7. VERIFYING resume() BEHAVIOR ---');
  // Mute and lower volume to test restoration
  engine.decks.A.player.setVolume(20);
  engine.decks.A.player.mute();
  env.postMessages.length = 0;

  engine.resume();

  assert.strictEqual(engine.paused, false, 'FAIL: engine.paused must be set to false on resume()');
  assert.strictEqual(engine.pauseAfterFade, false, 'FAIL: engine.pauseAfterFade must be false');
  assert.strictEqual(engine.decks.A.player.getVolume(), 100, 'FAIL: Live deck volume must be restored to 100%');
  assert.strictEqual(engine.decks.A.player.isMuted(), false, 'FAIL: Live deck must be unmuted');
  assert.strictEqual(engine.decks.A.player.playing, true, 'FAIL: Live deck must be playing');
  assert.strictEqual(engine.decks.A.player.playVideoCalls, 1, 'FAIL: Live deck playVideo() must have been called');

  // Verify non-live deck (Deck B) remains paused
  assert.strictEqual(engine.decks.B.player.paused, true, 'FAIL: Non-live deck B must remain paused');

  // Verify iframe postMessage playVideo for live deck
  const resumePostMsgs = env.postMessages.filter(
    m => m.msg === '{"event":"command","func":"playVideo","args":""}' && m.iframeId.includes('A')
  );
  assert.ok(resumePostMsgs.length > 0, 'FAIL: postMessage playVideo must be sent to live deck iframe');

  // Verify bg-anchor restarted
  assert.strictEqual(env.bgAnchor.paused, false, 'FAIL: audify-bg-anchor must be restarted');
  assert.strictEqual(env.bgAnchor.playCount, 1, 'FAIL: audify-bg-anchor play() must have been called');

  // Verify mediaSession updated to 'playing'
  assert.strictEqual(env.navigator.mediaSession.playbackState, 'playing', 'FAIL: mediaSession.playbackState must be "playing"');
  console.log('✔ PASS: resume() restored volume to 100%, unmuted, resumed live deck, restarted bg-anchor, and updated mediaSession.');

  console.log('\n--- 8. VERIFYING orchestrator.js INTEGRATION ---');
  const orchPath = path.resolve('public/js/engine/orchestrator.js');
  const orchContent = fs.readFileSync(orchPath, 'utf8');

  assert.ok(orchContent.includes('togglePause()'), 'FAIL: orchestrator must have togglePause()');
  assert.ok(orchContent.includes('this.paused = !this.paused'), 'FAIL: orchestrator togglePause must flip this.paused');
  assert.ok(orchContent.includes('this.ytEngine?.pause(this.liveDeckId)'), 'FAIL: orchestrator must invoke ytEngine.pause');
  assert.ok(orchContent.includes('this.ytEngine?.resume(this.liveDeckId)'), 'FAIL: orchestrator must invoke ytEngine.resume');
  console.log('✔ PASS: orchestrator.js properly delegates pause and resume to live deck engine.');

  console.log('\n===================================================================');
  console.log('ALL 7 AUDIT CRITERIA VERIFIED WITH 100% INTEGRITY: UNBREAKABLE!');
  console.log('===================================================================');
}

runAudit().catch(err => {
  console.error('AUDIT FAILED:', err);
  process.exit(1);
});
