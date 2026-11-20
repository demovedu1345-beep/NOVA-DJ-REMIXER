import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const repoDir = path.resolve(import.meta.dirname, '..');
const profileDir = path.join(repoDir, '.tmp_phase1_test', 'chrome_profile_rgb_test');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runTest() {
  console.log('=== [AUDIT] Audify RGB Aurora Border & Song Change Motion Test ===');

  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--remote-debugging-port=9245',
    '--remote-allow-origins=*',
    '--window-size=1440,900',
    '--user-data-dir=' + profileDir,
    'http://127.0.0.1:4173/',
  ]);

  try {
    await sleep(2500);
    const targets = await (await fetch('http://127.0.0.1:9245/json')).json();
    const page = targets.find((t) => t.type === 'page');
    assert.ok(page, 'Chrome page target found');

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => { ws.onopen = r; });

    let msgId = 1;
    const call = (method, params = {}) => new Promise((res, rej) => {
      const cur = msgId++;
      const onMsg = (event) => {
        const m = JSON.parse(event.data);
        if (m.id === cur) {
          ws.removeEventListener('message', onMsg);
          if (m.error) rej(m.error);
          else res(m.result);
        }
      };
      ws.addEventListener('message', onMsg);
      ws.send(JSON.stringify({ id: cur, method, params }));
    });

    const evalJs = async (expression) => {
      const res = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (res.exceptionDetails) {
        throw new Error('Eval failed: ' + JSON.stringify(res.exceptionDetails));
      }
      return res.result.value;
    };

    // 1. Verify Perimeter RGB Aurora Border
    console.log('[TEST 1] Verifying #audify-rgb-aurora-border & laser beams...');
    const borderInfo = await evalJs(`(() => {
      const border = document.getElementById('audify-rgb-aurora-border');
      if (!border) return { exists: false };
      const style = window.getComputedStyle(border);
      const lasers = border.querySelectorAll('.audify-laser-beam');
      const corners = border.querySelectorAll('.audify-corner-flare');
      const ambient = border.querySelector('.audify-border-ambient');
      return {
        exists: true,
        zIndex: style.zIndex,
        pointerEvents: style.pointerEvents,
        laserCount: lasers.length,
        cornerCount: corners.length,
        hasAmbient: Boolean(ambient)
      };
    })()`);
    console.log('Border Info:', borderInfo);
    assert.equal(borderInfo.exists, true, 'Border element exists');
    assert.equal(borderInfo.zIndex, '10', 'Border z-index is 10');
    assert.equal(borderInfo.pointerEvents, 'none', 'Border has pointer-events: none');
    assert.equal(borderInfo.laserCount, 4, '4 laser beams found');
    assert.equal(borderInfo.cornerCount, 4, '4 corner flares found');

    // 2. Click Penetration Test
    console.log('[TEST 2] Verifying click penetration (border does not intercept pointer)...');
    const centerClick = await evalJs(`(() => {
      const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      return {
        tag: el.tagName,
        id: el.id,
        isBorderHit: el.id === 'audify-rgb-aurora-border' || el.closest('#audify-rgb-aurora-border') !== null
      };
    })()`);
    console.log('Center Element under point:', centerClick);
    assert.equal(centerClick.isBorderHit, false, 'Pointer clicks penetrate through border cleanly');

    // 3. Test Song Change Explosion & Motion Transition
    console.log('[TEST 3] Triggering window.onAudifySongChange("Tauba Tauba")...');
    const song1Result = await evalJs(`(() => {
      const initialGradient = getComputedStyle(document.documentElement).getPropertyValue('--audify-border-gradient');
      window.onAudifySongChange({ title: 'Tauba Tauba', artist: 'Karan Aujla' });
      const shockwave = document.getElementById('audify-shockwave-ring');
      const flash = document.getElementById('audify-chromatic-flash');
      const badge = document.getElementById('audify-songchange-badge');
      const titleEl = document.getElementById('audify-badge-title-el');
      const patternEl = document.getElementById('audify-badge-pattern-el');

      const newGradient = getComputedStyle(document.documentElement).getPropertyValue('--audify-border-gradient');

      return {
        shockwaveActive: shockwave && shockwave.classList.contains('audify-shockwave-active'),
        flashActive: flash && flash.classList.contains('audify-flash-active'),
        badgeVisible: badge && badge.classList.contains('audify-badge-show'),
        badgeTitle: titleEl ? titleEl.textContent : '',
        badgePattern: patternEl ? patternEl.textContent : '',
        gradientShifted: initialGradient !== newGradient
      };
    })()`);
    console.log('Song 1 Transition Result:', song1Result);
    assert.equal(song1Result.shockwaveActive, true, 'Shockwave active on song change');
    assert.equal(song1Result.flashActive, true, 'Chromatic flash active on song change');
    assert.equal(song1Result.badgeVisible, true, 'HUD badge visible on song change');
    assert.equal(song1Result.badgeTitle, 'Tauba Tauba', 'Badge displays song title');

    // 4. Test Multiple Sequential Song Changes & Pattern Rotation
    console.log('[TEST 4] Testing pattern cycle through 4 consecutive song changes...');
    const patternCycle = await evalJs(`(() => {
      const patterns = [];
      for (let i = 0; i < 4; i++) {
        window.onAudifySongChange({ title: 'Hit #' + (i + 2), artist: 'Audify Artist' });
        const patternEl = document.getElementById('audify-badge-pattern-el');
        const glow = getComputedStyle(document.documentElement).getPropertyValue('--audify-border-glow');
        patterns.push({
          pattern: patternEl ? patternEl.textContent : '',
          glow: glow.trim()
        });
      }
      return patterns;
    })()`);
    console.log('Pattern Cycle Observed:', patternCycle);
    assert.equal(patternCycle.length, 4, '4 pattern cycles tested');
    const distinctPatterns = new Set(patternCycle.map((p) => p.pattern));
    assert.ok(distinctPatterns.size >= 3, 'Multiple distinct patterns cycled through');

    // 5. Take Verification Screenshot
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    const shotPath = 'C:/Users/itzra/.gemini/antigravity/brain/bc5589aa-8ed9-4a5c-bf5f-6a2e40cd0862/verified_rgb_aurora_border_motion.png';
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved verification screenshot to:', shotPath);

    ws.close();
    console.log('=== ALL RGB AURORA BORDER & MOTION CHECKS PASSED (100% SUCCESS) ===');
  } finally {
    chrome.kill('SIGKILL');
  }
}

runTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
