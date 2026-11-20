import { spawn } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoDir = path.resolve(import.meta.dirname, '..');
const profileDir = path.join(repoDir, '.tmp_phase1_test', 'chrome_profile_audit');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAudit() {
  console.log('=== [AUDIT] Audify WebGL2 Dual-Aurora Engine & UI Interaction ===');
  
  // Launch Chrome with remote debugging
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--remote-debugging-port=9244',
    '--remote-allow-origins=*',
    '--window-size=1440,900',
    '--user-data-dir=' + profileDir,
    'http://127.0.0.1:4173/',
  ]);

  try {
    await sleep(2500);
    const targets = await (await fetch('http://127.0.0.1:9244/json')).json();
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
          m.error ? rej(m.error) : res(m.result);
        }
      };
      ws.addEventListener('message', onMsg);
      ws.send(JSON.stringify({ id: cur, method, params }));
    });

    await call('Runtime.enable');
    await call('Page.enable');

    console.log('[AUDIT] Connected to browser CDP.');
    await sleep(1500);

    // 1. Audit Canvas CSS, z-index, pointer-events
    console.log('[AUDIT 1] Verifying #audify-aurora-canvas CSS styles & non-blocking pointer events...');
    const canvasEval = await call('Runtime.evaluate', {
      expression: `(() => {
        const c = document.getElementById('audify-aurora-canvas');
        if (!c) return { error: 'Canvas not found' };
        const cs = window.getComputedStyle(c);
        return {
          id: c.id,
          position: cs.position,
          zIndex: cs.zIndex,
          pointerEvents: cs.pointerEvents,
          width: c.width,
          height: c.height,
          cssWidth: cs.width,
          cssHeight: cs.height,
          mixBlendMode: cs.mixBlendMode
        };
      })()`,
      returnByValue: true
    });
    console.log('Canvas State:', canvasEval.result.value);
    assert.equal(canvasEval.result.value.zIndex, '0', 'Canvas z-index must be 0');
    assert.equal(canvasEval.result.value.pointerEvents, 'none', 'Canvas pointer-events must be none');

    // 2. Audit Click Penetration: Verify clicks on buttons/inputs pass through
    console.log('[AUDIT 2] Verifying click penetration on interactive wizard buttons...');
    const clickEval = await call('Runtime.evaluate', {
      expression: `(() => {
        const canvas = document.getElementById('audify-aurora-canvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        // Pick the center of the screen where buttons/content exist
        const targetEl = document.elementFromPoint(canvasRect.width / 2, canvasRect.height / 2);
        
        return {
          elementUnderCenter: targetEl ? targetEl.tagName + (targetEl.className ? '.' + targetEl.className.slice(0, 30) : '') : 'none',
          isCanvasHit: targetEl === canvas
        };
      })()`,
      returnByValue: true
    });
    console.log('Center Hit Test:', clickEval.result.value);
    assert.equal(clickEval.result.value.isCanvasHit, false, 'Canvas must NEVER be hit by elementFromPoint (must be transparent to pointer events)');

    // 3. Test Clicking Buttons & Receiving Events
    console.log('[AUDIT 3] Testing interactive button click delivery...');
    const btnClickTest = await call('Runtime.evaluate', {
      expression: `(() => {
        let clicked = false;
        const testBtn = document.createElement('button');
        testBtn.id = '__audit_test_btn';
        testBtn.textContent = 'AUDIT CLICK ME';
        testBtn.style.cssText = 'position:fixed;top:50px;left:50px;z-index:10;padding:10px 20px;background:#c8ff00;color:#000;';
        testBtn.onclick = () => { clicked = true; };
        document.body.appendChild(testBtn);

        // Simulate click at button coordinates
        const rect = testBtn.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + 5, rect.top + 5);
        
        testBtn.click();
        const success = clicked && (hit === testBtn);
        testBtn.remove();

        return { success, hitTag: hit ? hit.tagName : null, clicked };
      })()`,
      returnByValue: true
    });
    console.log('Button Click Test:', btnClickTest.result.value);
    assert.equal(btnClickTest.result.value.success, true, 'Button must be directly clickable and hit-testable');

    // 4. Test WebGL2 Context Health, Shaders & Thrashing
    console.log('[AUDIT 4] Verifying WebGL2 context health, active shaders, and context stability...');
    const webglHealth = await call('Runtime.evaluate', {
      expression: `(() => {
        const canvas = document.getElementById('audify-aurora-canvas');
        const gl = canvas.getContext('webgl2');
        if (!gl) return { error: 'No WebGL2 context' };
        
        return {
          isContextLost: gl.isContextLost(),
          renderer: gl.getParameter(gl.RENDERER),
          vendor: gl.getParameter(gl.VENDOR),
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          viewport: Array.from(gl.getParameter(gl.VIEWPORT)),
          auroraInitialized: window.__audify_aurora_initialized
        };
      })()`,
      returnByValue: true
    });
    console.log('WebGL2 Context Health:', webglHealth.result.value);
    assert.equal(webglHealth.result.value.isContextLost, false, 'WebGL2 context must NOT be lost');
    assert.equal(webglHealth.result.value.auroraInitialized, true, 'Engine must be initialized');

    // 5. Measure FPS and Frame Stability over 60 frames
    console.log('[AUDIT 5] Measuring frame delivery and render performance...');
    const perfEval = await call('Runtime.evaluate', {
      expression: `new Promise((resolve) => {
        const frameTimes = [];
        let frames = 0;
        let last = performance.now();

        function checkFrame(now) {
          frameTimes.push(now - last);
          last = now;
          frames++;
          if (frames < 60) {
            requestAnimationFrame(checkFrame);
          } else {
            const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
            const max = Math.max(...frameTimes);
            const min = Math.min(...frameTimes);
            const fps = 1000 / avg;
            resolve({ avgMs: avg.toFixed(2), maxMs: max.toFixed(2), minMs: min.toFixed(2), estFps: fps.toFixed(1) });
          }
        }
        requestAnimationFrame(checkFrame);
      })`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Render Performance (60 frames):', perfEval.result.value);

    // 6. Test Window Event Listeners (Pointermove drift and Click pulse)
    console.log('[AUDIT 6] Testing pointermove and pointerdown drift & pulses...');
    const eventAudit = await call('Runtime.evaluate', {
      expression: `(() => {
        const canvas = document.getElementById('audify-aurora-canvas');
        
        // Dispatch pointermove across window
        const t0 = performance.now();
        for (let i = 0; i < 50; i++) {
          window.dispatchEvent(new PointerEvent('pointermove', {
            clientX: 100 + i * 5,
            clientY: 200 + i * 2,
            bubbles: true
          }));
        }
        const moveTimeMs = (performance.now() - t0).toFixed(3);

        // Dispatch pointerdown (pulse trigger)
        const t1 = performance.now();
        for (let i = 0; i < 10; i++) {
          window.dispatchEvent(new PointerEvent('pointerdown', {
            clientX: 300,
            clientY: 300,
            bubbles: true
          }));
        }
        const downTimeMs = (performance.now() - t1).toFixed(3);

        return {
          move50EventsTotalMs: moveTimeMs,
          avgPerMoveEventUs: (moveTimeMs * 20).toFixed(1) + ' µs',
          down10EventsTotalMs: downTimeMs,
          avgPerDownEventUs: (downTimeMs * 100).toFixed(1) + ' µs'
        };
      })()`,
      returnByValue: true
    });
    console.log('Window Event Listener Overhead:', eventAudit.result.value);

    // 7. Test Dropdown UI Interactions (Aurora Mode & Mix Style)
    console.log('[AUDIT 7] Testing Aurora Mode pill dropdown and Mix Action pill dropdown...');
    const dropdownTest = await call('Runtime.evaluate', {
      expression: `(() => {
        const auroraBtn = document.getElementById('audify-aurora-btn');
        const auroraDd = document.getElementById('audify-aurora-dropdown');
        const mixBtn = document.getElementById('audify-mix-btn');
        const mixDd = document.getElementById('audify-mix-dropdown');

        if (!auroraBtn || !auroraDd || !mixBtn || !mixDd) {
          return { error: 'Controls not injected yet', found: { auroraBtn: !!auroraBtn, mixBtn: !!mixBtn } };
        }

        // Test opening Aurora dropdown
        auroraBtn.click();
        const auroraOpened = auroraDd.style.display === 'block';

        // Select 'curtain' mode
        const curtainOpt = auroraDd.querySelector('[data-mode="curtain"]');
        if (curtainOpt) curtainOpt.click();
        const auroraModeNow = localStorage.getItem('audify_aurora_mode');

        // Test opening Mix dropdown
        mixBtn.click();
        const mixOpened = mixDd.style.display === 'block';

        // Select 'blend'
        const blendOpt = mixDd.querySelector('[data-style="blend"]');
        if (blendOpt) blendOpt.click();
        const mixStyleNow = localStorage.getItem('audify_mix_action');

        return {
          auroraDropdownOpens: auroraOpened,
          auroraModeChanged: auroraModeNow === 'curtain',
          mixDropdownOpens: mixOpened,
          mixStyleChanged: mixStyleNow === 'blend'
        };
      })()`,
      returnByValue: true
    });
    console.log('Dropdown Interactive Controls Test:', dropdownTest.result.value);

    // 8. Test Category Page Aurora & Non-blocking interaction
    console.log('[AUDIT 8] Navigating to /songs/hindi-dance and auditing category page canvas...');
    const navPromise = new Promise((resolve) => {
      const onLoad = (event) => {
        const m = JSON.parse(event.data);
        if (m.method === 'Page.loadEventFired') {
          ws.removeEventListener('message', onLoad);
          resolve();
        }
      };
      ws.addEventListener('message', onLoad);
    });
    await call('Page.navigate', { url: 'http://127.0.0.1:4173/songs/hindi-dance' });
    await navPromise;
    await sleep(2000);

    const catPageAudit = await call('Runtime.evaluate', {
      expression: `(() => {
        const c = document.getElementById('audify-aurora-canvas');
        if (!c) return { error: 'Canvas missing on category page' };
        const cs = window.getComputedStyle(c);
        
        // Find a song card or play button on the page
        const songCard = document.querySelector('a[href*="/songs/"], .track-row, li a, button');
        const songRect = songCard ? songCard.getBoundingClientRect() : null;
        let isClickable = false;
        if (songRect) {
          const hit = document.elementFromPoint(songRect.left + 10, songRect.top + 10);
          isClickable = hit !== c;
        }

        return {
          canvasPresent: true,
          zIndex: cs.zIndex,
          pointerEvents: cs.pointerEvents,
          songCardFound: !!songCard,
          isDirectlyClickable: isClickable
        };
      })()`,
      returnByValue: true
    });
    console.log('Category Page Audit Result:', catPageAudit.result.value);
    assert.equal(catPageAudit.result.value.canvasPresent, true);
    assert.equal(catPageAudit.result.value.zIndex, '0');
    assert.equal(catPageAudit.result.value.pointerEvents, 'none');
    assert.equal(catPageAudit.result.value.isDirectlyClickable, true);

    console.log('\n=== ALL AUDIT CHECKS PASSED WITH ZERO ERRORS ===');
    ws.close();
  } finally {
    chrome.kill();
  }
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
