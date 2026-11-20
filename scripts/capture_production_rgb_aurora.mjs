import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const repoDir = path.resolve(import.meta.dirname, '..');
const profileDir = path.join(repoDir, '.tmp_phase1_test', 'chrome_profile_prod_rgb');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function captureProd() {
  console.log('=== [CAPTURE] Capturing Live Production RGB Aurora Border & Motion ===');

  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--remote-debugging-port=9246',
    '--remote-allow-origins=*',
    '--window-size=1440,900',
    '--user-data-dir=' + profileDir,
    'https://audify-ai-dj.vercel.app/',
  ]);

  try {
    await sleep(3500);
    const targets = await (await fetch('http://127.0.0.1:9246/json')).json();
    const page = targets.find((t) => t.type === 'page');

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
      return res.result.value;
    };

    // Advance to Hindi selection and trigger song change
    await evalJs(`(() => {
      // Click Hindi
      const hindiBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Hindi'));
      if (hindiBtn) hindiBtn.click();
      
      // Trigger song change explosion with Tauba Tauba
      window.onAudifySongChange({ title: 'Tauba Tauba', artist: 'Karan Aujla' });
    })()`);

    await sleep(400);

    const shot = await call('Page.captureScreenshot', { format: 'png' });
    const shotPath = 'C:/Users/itzra/.gemini/antigravity/brain/bc5589aa-8ed9-4a5c-bf5f-6a2e40cd0862/verified_live_production_rgb_aurora.png';
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved production verification screenshot to:', shotPath);

    ws.close();
  } finally {
    chrome.kill('SIGKILL');
  }
}

captureProd().catch(console.error);
