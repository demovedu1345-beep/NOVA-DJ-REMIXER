import { spawn } from 'node:child_process';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9226;
const profileDir = 'C:\\Users\\itzra\\.gemini\\antigravity\\scratch\\NOVA-DJ-REMIXER\\.tmp_chrome_diag';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runDiagnostics() {
  console.log('=== AUDIFY UI LAYOUT, ELEMENT POSITIONING & COLLISION DIAGNOSIS ===\n');

  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--incognito',
    `--user-data-dir=${profileDir}`,
    'about:blank'
  ]);

  try {
    await sleep(1500);

    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
    const page = listRes.find((p) => p.type === 'page') || listRes[0];
    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('Chrome remote page target not found');
    }

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve) => { ws.onopen = resolve; });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const data = JSON.parse(evt.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Runtime.enable');
    await send('Page.enable');

    // Mock YouTube Iframe API so PlayerEngine initializes instantly without network latency
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.YT = {
          Player: function(id, opts) {
            this.id = id;
            this.opts = opts;
            setTimeout(() => { if (opts && opts.events && opts.events.onReady) opts.events.onReady({ target: this }); }, 50);
          }
        };
        window.YT.Player.prototype.setVolume = function() {};
        window.YT.Player.prototype.getVolume = function() { return 100; };
        window.YT.Player.prototype.isMuted = function() { return false; };
        window.YT.Player.prototype.unMute = function() {};
        window.YT.Player.prototype.mute = function() {};
        window.YT.Player.prototype.playVideo = function() {};
        window.YT.Player.prototype.pauseVideo = function() {};
        window.YT.Player.prototype.getDuration = function() { return 200; };
        window.YT.Player.prototype.getCurrentTime = function() { return 0; };
        setTimeout(() => { if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady(); }, 10);
      `
    });

    // ---------------------------------------------------------
    // TEST 1: Splash Screen Diagnosis (Desktop & Mobile)
    // ---------------------------------------------------------
    console.log('--- TEST 1: Initial Landing / Splash Screen Inspection ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'http://127.0.0.1:4173/' });
    await sleep(1000); // During first 2.5s splash is active

    const splashDiag = await send('Runtime.evaluate', {
      expression: `(() => {
        const langSection = document.getElementById('audify-languages-section');
        const main = document.querySelector('main');
        const h1 = document.querySelector('h1');
        const subtitle = main ? main.querySelector('p:nth-of-type(1)') : null;
        const splashLine = document.querySelector('.splash-line');
        const canvas = document.getElementById('audify-aurora-canvas');

        const mainStyles = main ? window.getComputedStyle(main) : null;
        const h1Styles = h1 ? window.getComputedStyle(h1) : null;

        return {
          langSectionFound: !!langSection,
          mainClasses: main ? main.className : null,
          mainDisplay: mainStyles ? mainStyles.display : null,
          mainMinHeight: mainStyles ? mainStyles.minHeight : null,
          mainChildrenCount: main ? main.children.length : 0,
          h1Text: h1 ? h1.textContent : null,
          h1FontFamily: h1Styles ? h1Styles.fontFamily : null,
          h1Color: h1Styles ? h1Styles.color : null,
          subtitleText: subtitle ? subtitle.textContent : null,
          splashLineFound: !!splashLine,
          canvasPresent: !!canvas,
          canvasZIndex: canvas ? window.getComputedStyle(canvas).zIndex : null,
          canvasPointerEvents: canvas ? window.getComputedStyle(canvas).pointerEvents : null,
        };
      })()`,
      returnByValue: true
    });
    console.log('Splash Screen Status:', JSON.stringify(splashDiag.result.value, null, 2));

    // ---------------------------------------------------------
    // TEST 2: Navigate / Hydrate to Wizard (Step 0 - Language Selection)
    // ---------------------------------------------------------
    console.log('\n--- TEST 2: Wizard Step 0 Layout & Next Button Inspection (Desktop 1440x900) ---');
    // Wait for the 2.5s splash timer to expire and wizard to render
    await sleep(3500);
    const wizardDiagDesktop = await send('Runtime.evaluate', {
      expression: `(() => {
        const langSection = document.getElementById('audify-languages-section');
        const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('NEXT') || b.textContent.includes('Next'));
        const nextStyles = nextBtn ? window.getComputedStyle(nextBtn) : null;
        const main = document.querySelector('main');
        const mainStyles = main ? window.getComputedStyle(main) : null;
        const header = document.querySelector('main > .flex.justify-between, main > div.flex');
        const pills = document.getElementById('audify-control-pills-container');

        // Bounding rect checks
        function getRect(el) {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
        }

        const nextRect = getRect(nextBtn);
        const cards = Array.from(document.querySelectorAll('main button[aria-pressed]'));
        const cardRects = cards.map(c => ({
          text: c.textContent.trim().slice(0, 30),
          rect: getRect(c)
        }));

        let hasCollisionWithNext = false;
        const collisions = [];
        if (nextRect) {
          for (const c of cardRects) {
            const overlap = !(c.rect.right < nextRect.left || 
                              c.rect.left > nextRect.right || 
                              c.rect.bottom < nextRect.top || 
                              c.rect.top > nextRect.bottom);
            if (overlap) {
              hasCollisionWithNext = true;
              collisions.push({ text: c.text, cardRect: c.rect, nextRect });
            }
          }
        }

        return {
          langSectionFound: !!langSection,
          nextBtnFound: !!nextBtn,
          nextBtnText: nextBtn ? nextBtn.textContent.trim() : null,
          nextBtnPosition: nextStyles ? nextStyles.position : null,
          nextBtnZIndex: nextStyles ? nextStyles.zIndex : null,
          nextBtnBottom: nextStyles ? nextStyles.bottom : null,
          nextBtnRight: nextStyles ? nextStyles.right : null,
          nextBtnHeight: nextStyles ? nextStyles.height : null,
          nextBtnBg: nextStyles ? nextStyles.backgroundColor : null,
          mainPaddingBottom: mainStyles ? mainStyles.paddingBottom : null,
          mainPaddingTop: mainStyles ? mainStyles.paddingTop : null,
          mainMaxWidth: mainStyles ? mainStyles.maxWidth : null,
          hasCollisionWithNext,
          collisions,
          cardsCount: cards.length,
          cardRects,
          pillsFound: !!pills,
          headerChildrenCount: header ? header.children.length : 0
        };
      })()`,
      returnByValue: true
    });
    console.log('Wizard Desktop Status:', JSON.stringify(wizardDiagDesktop.result.value, null, 2));

    // ---------------------------------------------------------
    // TEST 2B: Click "Language" Card and Test Expanded Regional Grid
    // ---------------------------------------------------------
    console.log('\n--- TEST 2B: Expanded Regional Language Selection Inspection ---');
    const expandedDiag = await send('Runtime.evaluate', {
      expression: `(() => {
        const langCard = Array.from(document.querySelectorAll('main button[aria-pressed]')).find(c => c.textContent.includes('Language'));
        if (langCard) langCard.click();

        // Scroll to the absolute bottom of the document
        window.scrollTo(0, document.body.scrollHeight);

        const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('NEXT') || b.textContent.includes('Next'));
        function getRect(el) {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
        }
        const nextRect = getRect(nextBtn);
        
        // Find all cards including regional subcategories
        const allCards = Array.from(document.querySelectorAll('main button[aria-pressed]'));
        const regionalHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes('Regional'));

        // Check if the last card or element overlaps the NEXT button when scrolled to bottom
        const main = document.querySelector('main');
        const mainChildren = Array.from(main ? main.children : []);
        const lastChild = mainChildren[mainChildren.length - 1];
        const lastChildRect = getRect(lastChild);

        return {
          langCardClicked: !!langCard,
          totalCardsNow: allCards.length,
          regionalHeadingFound: !!regionalHeading,
          scrollHeight: document.body.scrollHeight,
          nextBtnRect: nextRect,
          lastChildRect,
          mainPaddingBottom: window.getComputedStyle(main).paddingBottom,
          nextBtnZIndex: window.getComputedStyle(nextBtn).zIndex
        };
      })()`,
      returnByValue: true
    });
    console.log('Expanded Regional Language Status:', JSON.stringify(expandedDiag.result.value, null, 2));
    console.log('\n--- TEST 3: Mobile Viewport Layout Inspection (iPhone 14 / 390x844) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await sleep(1000);

    const mobileDiag = await send('Runtime.evaluate', {
      expression: `(() => {
        const langSection = document.getElementById('audify-languages-section');
        const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('NEXT') || b.textContent.includes('Next'));
        const nextStyles = nextBtn ? window.getComputedStyle(nextBtn) : null;
        const main = document.querySelector('main');
        const mainStyles = main ? window.getComputedStyle(main) : null;
        const body = document.body;

        // Check horizontal overflow on mobile
        const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth || body.scrollWidth > window.innerWidth;
        
        // Scroll to the absolute bottom of the document
        window.scrollTo(0, document.body.scrollHeight);
        const nextRect = nextBtn ? nextBtn.getBoundingClientRect() : null;

        // Check last visible element in main
        const mainChildren = Array.from(main ? main.children : []);
        const lastEl = mainChildren[mainChildren.length - 1];
        const lastElRect = lastEl ? lastEl.getBoundingClientRect() : null;

        let lastElementOccluded = false;
        if (nextRect && lastElRect) {
          // If the last non-fixed element extends beneath the floating NEXT button
          if (lastEl !== nextBtn && lastElRect.bottom > nextRect.top && lastElRect.top < nextRect.bottom) {
            lastElementOccluded = true;
          }
        }

        const pills = document.getElementById('audify-control-pills-container');
        const header = document.querySelector('main > .flex.justify-between, main > div.flex');

        return {
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          documentScrollWidth: document.documentElement.scrollWidth,
          hasHorizontalScroll,
          langSectionFound: !!langSection,
          nextBtnFound: !!nextBtn,
          nextBtnPosition: nextStyles ? nextStyles.position : null,
          nextBtnZIndex: nextStyles ? nextStyles.zIndex : null,
          nextBtnWidth: nextStyles ? nextStyles.width : null,
          nextBtnLeft: nextStyles ? nextStyles.left : null,
          nextBtnRight: nextStyles ? nextStyles.right : null,
          nextBtnBottom: nextStyles ? nextStyles.bottom : null,
          mainPaddingBottom: mainStyles ? mainStyles.paddingBottom : null,
          lastElementOccluded,
          headerFound: !!header,
          headerChildrenCount: header ? header.children.length : 0,
          pillsFound: !!pills,
          pillsStyles: pills ? {
            display: window.getComputedStyle(pills).display,
            marginRight: window.getComputedStyle(pills).marginRight
          } : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Wizard Mobile Status:', JSON.stringify(mobileDiag.result.value, null, 2));

    // ---------------------------------------------------------
    // TEST 4: Small Mobile Viewport (360x640)
    // ---------------------------------------------------------
    console.log('\n--- TEST 4: Small Mobile Viewport Layout Inspection (360x640) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(1000);

    const smallMobileDiag = await send('Runtime.evaluate', {
      expression: `(() => {
        const langSection = document.getElementById('audify-languages-section');
        const body = document.body;
        const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth || body.scrollWidth > window.innerWidth;
        const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('NEXT') || b.textContent.includes('Next'));
        
        return {
          viewportWidth: window.innerWidth,
          hasHorizontalScroll,
          langSectionFound: !!langSection,
          nextBtnFound: !!nextBtn,
          nextBtnWidth: nextBtn ? window.getComputedStyle(nextBtn).width : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Small Mobile Status:', JSON.stringify(smallMobileDiag.result.value, null, 2));

    console.log('\n=== DIAGNOSIS COMPLETE ===');
    ws.close();
  } finally {
    chrome.kill();
  }
}

runDiagnostics().catch(console.error);
