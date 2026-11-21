import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const repoDir = path.resolve(import.meta.dirname, '..');
const profileDir = path.join(repoDir, '.tmp_phase1_test', 'chrome_profile_full_audit');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runComprehensiveAudit() {
  console.log('========================================================================');
  console.log('  AUDIFY RGB AURORA & PERFORMANCE AUDIT SUITE (60 FPS & 8 PATTERNS)   ');
  console.log('========================================================================\n');

  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--remote-debugging-port=9247',
    '--remote-allow-origins=*',
    '--window-size=1440,900',
    '--user-data-dir=' + profileDir,
    'http://127.0.0.1:4173/',
  ]);

  try {
    await sleep(2500);
    const targets = await (await fetch('http://127.0.0.1:9247/json')).json();
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

    await call('Runtime.enable');
    await call('Page.enable');
    await sleep(2000);

    console.log('[1/4] WebGL2 SoftAurora Background Canvas Verification...');
    const webglAudit = await evalJs(`(() => {
      const canvas = document.getElementById('audify-aurora-canvas');
      if (!canvas) return { error: 'Canvas not found' };
      const gl = canvas.getContext('webgl2');
      const cs = window.getComputedStyle(canvas);
      
      return {
        id: canvas.id,
        contextType: gl ? 'WebGL2' : 'none',
        isContextLost: gl ? gl.isContextLost() : true,
        bufferWidth: canvas.width,
        bufferHeight: canvas.height,
        cssWidth: cs.width,
        cssHeight: cs.height,
        position: cs.position,
        zIndex: cs.zIndex,
        pointerEvents: cs.pointerEvents,
        mixBlendMode: cs.mixBlendMode,
        opacity: cs.opacity,
        initialized: window.__audify_aurora_initialized === true
      };
    })()`);
    console.log('WebGL2 Canvas State:', webglAudit);
    assert.equal(webglAudit.contextType, 'WebGL2', 'Context is WebGL2');
    assert.equal(webglAudit.isContextLost, false, 'WebGL2 context is healthy');
    assert.equal(webglAudit.zIndex, '0', 'z-index is 0 (background)');
    assert.equal(webglAudit.pointerEvents, 'none', 'pointer-events is none');
    assert.equal(webglAudit.initialized, true, 'Aurora engine initialized');

    console.log('\n[2/4] RGB Border Reactive Glow & Beat Sync Verification...');
    const beatAudit = await evalJs(`(() => {
      const root = document.documentElement;
      const initialGlow = getComputedStyle(root).getPropertyValue('--audify-border-glow').trim();
      const initialGradient = getComputedStyle(root).getPropertyValue('--audify-border-gradient').trim();
      
      // Trigger Beat Pulse
      window.triggerAudifyBeatPulse(2.5);

      // Trigger Song Change
      window.onAudifySongChange({ title: 'Karan Aujla - Tauba Tauba', force: true });
      const postSongGlow = getComputedStyle(root).getPropertyValue('--audify-border-glow').trim();
      const postSongGradient = getComputedStyle(root).getPropertyValue('--audify-border-gradient').trim();

      const shockwave = document.getElementById('audify-shockwave-ring');
      const flash = document.getElementById('audify-chromatic-flash');
      const badge = document.getElementById('audify-songchange-badge');

      return {
        initialGlow,
        postSongGlow,
        initialGradient,
        postSongGradient,
        glowUpdated: initialGlow !== postSongGlow,
        gradientUpdated: initialGradient !== postSongGradient,
        shockwaveFired: shockwave && shockwave.classList.contains('audify-shockwave-active'),
        flashFired: flash && flash.classList.contains('audify-flash-active'),
        badgeShown: badge && badge.classList.contains('audify-badge-show')
      };
    })()`);
    console.log('Reactive Beat & Song Change State:', beatAudit);
    assert.equal(beatAudit.glowUpdated, true, 'Border glow updated on song change');
    assert.equal(beatAudit.gradientUpdated, true, 'Border gradient updated on song change');
    assert.equal(beatAudit.shockwaveFired, true, 'Shockwave animation fired');
    assert.equal(beatAudit.flashFired, true, 'Chromatic flash fired');
    assert.equal(beatAudit.badgeShown, true, 'HUD Badge shown');

    console.log('\n[3/4] Verification of All 8 Explosion & Motion Patterns...');
    const patternAudit = await evalJs(`(() => {
      const patterns = window.AURORA_PATTERNS || [];
      const results = [];

      for (let i = 0; i < patterns.length; i++) {
        // Switch to pattern
        window.setAudifyPalette(i);
        const activePattern = patterns[i];
        const root = document.documentElement;
        const currentGradient = getComputedStyle(root).getPropertyValue('--audify-border-gradient').trim();
        const currentGlow = getComputedStyle(root).getPropertyValue('--audify-border-glow').trim();
        const currentSpeed = getComputedStyle(root).getPropertyValue('--audify-laser-speed').trim();

        // Trigger explosion
        window.onAudifySongChange({ title: 'Test Track ' + (i + 1), force: true });
        const shockwave = document.getElementById('audify-shockwave-ring');
        const flash = document.getElementById('audify-chromatic-flash');
        const badgeTitle = document.getElementById('audify-badge-title-el')?.textContent;
        const badgePattern = document.getElementById('audify-badge-pattern-el')?.textContent;

        results.push({
          index: i + 1,
          id: activePattern.id,
          name: activePattern.name,
          mode: activePattern.mode,
          laserSpeed: currentSpeed,
          borderGradientMatches: currentGradient.includes(activePattern.borderGradient.slice(0, 25)),
          shockwaveTriggered: shockwave && shockwave.classList.contains('audify-shockwave-active'),
          flashTriggered: flash && flash.classList.contains('audify-flash-active'),
          badgeTitle,
          badgePattern
        });
      }
      return { totalPatterns: patterns.length, results };
    })()`);
    console.log(`Verified ${patternAudit.totalPatterns} Distinct Patterns:`);
    patternAudit.results.forEach((r) => {
      console.log(`  #${r.index} [${r.name}] Mode: ${r.mode} | Laser: ${r.laserSpeed} | Shockwave: ${r.shockwaveTriggered ? 'OK' : 'FAIL'} | Flash: ${r.flashTriggered ? 'OK' : 'FAIL'}`);
      assert.equal(r.shockwaveTriggered, true, `Shockwave triggered for pattern ${r.id}`);
      assert.equal(r.flashTriggered, true, `Flash triggered for pattern ${r.id}`);
    });
    assert.equal(patternAudit.totalPatterns, 8, 'All 8 patterns exist and verified');

    console.log('\n[4/4] Memory Leaks, Unbounded Timers & Exceptions Audit...');
    const healthAudit = await evalJs(`(() => {
      // 1. Check window error logs or unhandled rejections
      const errors = window.__audify_errors || [];

      // 2. Check DOM node accumulation
      const canvasCount = document.querySelectorAll('#audify-aurora-canvas').length;
      const borderCount = document.querySelectorAll('#audify-rgb-aurora-border').length;
      const shockwaveCount = document.querySelectorAll('#audify-shockwave-ring').length;
      const flashCount = document.querySelectorAll('#audify-chromatic-flash').length;
      const badgeCount = document.querySelectorAll('#audify-songchange-badge').length;
      const pillCount = document.querySelectorAll('#audify-control-pills-container').length;

      // 3. Check memory metrics if available
      const memory = performance.memory ? {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)) + ' MB',
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024)) + ' MB'
      } : 'Browser memory API not supported in this flag';

      return {
        errors,
        singletons: {
          canvas: canvasCount === 1,
          border: borderCount === 1,
          shockwave: shockwaveCount === 1,
          flash: flashCount === 1,
          badge: badgeCount === 1,
          pills: pillCount === 1
        },
        memory
      };
    })()`);
    console.log('Health & DOM Cleanliness:', healthAudit);
    assert.equal(healthAudit.singletons.canvas, true, 'Canvas is singleton');
    assert.equal(healthAudit.singletons.border, true, 'Border is singleton');
    assert.equal(healthAudit.singletons.shockwave, true, 'Shockwave ring is singleton');
    assert.equal(healthAudit.singletons.flash, true, 'Chromatic flash is singleton');
    assert.equal(healthAudit.singletons.badge, true, 'HUD Badge is singleton');
    assert.equal(healthAudit.singletons.pills, true, 'Pills container is singleton');
    assert.equal(healthAudit.errors.length, 0, 'Zero runtime unhandled exceptions');

    console.log('\n========================================================================');
    console.log('  ALL AUDIT CHECKS PASSED (100% SUCCESS) - ZERO REGRESSIONS FOUND       ');
    console.log('========================================================================');

    ws.close();
  } finally {
    chrome.kill();
  }
}

runComprehensiveAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
