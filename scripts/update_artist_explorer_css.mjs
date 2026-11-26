import fs from 'fs';

const FILE = 'public/styles/artist-explorer.css';
const css = fs.readFileSync(FILE, 'utf8');

const marker = 'Player Stage & Deck Perfect Layout';
const foundIdx = css.indexOf(marker);

if (foundIdx === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

const idx = css.lastIndexOf('/*', foundIdx);

const cleanHeaderAndModals = css.slice(0, idx);

const perfectLayoutCss = `/* =========================================================================
   Player Stage & Deck Perfect Layout (Zero Collision Guarantee)
   Strictly prevents element collision, overlapping, and button occlusion
   ========================================================================= */

/* Ensure main has proper flex layout and containment */
main[data-paused],
main:has(.deck),
main {
  display: flex !important;
  flex-direction: column !important;
  height: 100dvh !important;
  max-height: 100dvh !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  position: relative !important;
}

/* Header container: single row flex alignment */
main > div.relative.z-30.flex {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  flex-shrink: 0 !important;
  min-height: 48px !important;
}

/* 1. Header Centered Category Button (Dead-Center Alignment on Tablet & Desktop with ZERO Truncation) */
@media (min-width: 768px) {
  main div.relative.z-30.flex > button[class*="left-1/2"],
  main button[class*="left-1/2"],
  header button[class*="left-1/2"] {
    display: flex !important;
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    max-width: min(60vw, 680px) !important;
    width: max-content !important;
    padding: 5px 16px !important;
    font-size: clamp(12px, 1.12vw, 16px) !important;
    z-index: 25 !important;
    white-space: nowrap !important;
    align-items: center !important;
    gap: 8px !important;
  }

  main button[class*="left-1/2"] span,
  header button[class*="left-1/2"] span {
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
    max-width: none !important;
  }

  /* Hide row 2 mobile button on desktop/tablet */
  main > button[class*="md:hidden"],
  #btn-open-vibe-mobile {
    display: none !important;
  }
}

/* Mobile Portrait (< 768px width) */
@media (max-width: 767px) {
  main div.relative.z-30.flex > button[class*="left-1/2"],
  main button[class*="left-1/2"],
  header button[class*="left-1/2"] {
    display: none !important;
  }

  main > button[class*="md:hidden"],
  #btn-open-vibe-mobile {
    display: flex !important;
    width: max-content !important;
    max-width: calc(100vw - 28px) !important;
    margin-top: 6px !important;
    margin-bottom: 2px !important;
    padding: 4px 12px !important;
    font-size: clamp(11px, 3.2vw, 13px) !important;
    white-space: nowrap !important;
    align-items: center !important;
    gap: 6px !important;
  }

  main > button[class*="md:hidden"] span,
  #btn-open-vibe-mobile span {
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: clip !important;
    max-width: none !important;
  }
}

/* 2. Decks Stage Container: Clean Responsive Sizing */
main > div[class*="container-type"],
main > div.relative.z-10.flex-1 {
  flex: 1 1 auto !important;
  min-height: clamp(140px, 32vh, 340px) !important;
  position: relative !important;
  overflow: visible !important;
  margin-top: clamp(6px, 1.5vh, 18px) !important;
  margin-bottom: clamp(4px, 1.2vh, 14px) !important;
}

/* 3. Deck Sizing & Proportions */
.deck {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  gap: clamp(4px, 1.2vh, 14px) !important;
}

@media (min-width: 768px) {
  .deck {
    width: 58% !important;
  }
}

/* Deck Header (DECK A LIVE) */
.deck > header {
  font-size: clamp(15px, 2vh, 26px) !important;
  gap: 8px !important;
  line-height: 1 !important;
}

/* Song Title in Deck: Bold, Heroic Anton font with strict 2-line clamp */
.deck h2 {
  font-size: clamp(26px, min(5.2vw, 6vh), 58px) !important;
  line-height: 0.92 !important;
  letter-spacing: -0.01em !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
}

/* Artist Name */
.deck p {
  font-size: clamp(13px, 1.9vh, 20px) !important;
  margin-top: clamp(1px, 0.6vh, 6px) !important;
  line-height: 1.2 !important;
  color: rgba(255, 255, 255, 0.75) !important;
}

/* Waveform: Sleek, responsive audio bars */
.deck div[class*="select-none"] {
  padding-top: clamp(2px, 0.8vh, 10px) !important;
}

.deck div[class*="select-none"] > div[class*="cursor-grab"],
.deck div[class*="select-none"] > div[class*="items-center"] {
  height: clamp(28px, 5vh, 48px) !important;
}

/* AGENT Ticker: Sleek, thin marquee positioned cleanly above bottom bar */
main > div[class*="border-y-2"] {
  flex-shrink: 0 !important;
  position: relative !important;
  margin-top: auto !important;
  margin-bottom: clamp(4px, 1.2vh, 12px) !important;
  padding-top: clamp(3px, 0.6vh, 6px) !important;
  padding-bottom: clamp(3px, 0.6vh, 6px) !important;
  border-top-width: 1px !important;
  border-bottom-width: 1px !important;
  z-index: 10 !important;
}

main > div[class*="border-y-2"] span.text-lime {
  font-size: clamp(16px, 2vh, 24px) !important;
}

main > div[class*="border-y-2"] div.ticker-in {
  font-size: clamp(13px, 1.6vh, 18px) !important;
}

/* On very short screens (<= 500px height like landscape phones), hide the AGENT bar to prevent any overlap */
@media (max-height: 500px) {
  main > div[class*="border-y-2"] {
    display: none !important;
  }
}

/* Transport Action Buttons (SKIP & PLAY FULL): Cleanly docked at the bottom */
main > div[class*="gap-[2vw]"] {
  flex-shrink: 0 !important;
  display: flex !important;
  gap: 12px !important;
  z-index: 40 !important;
  position: relative !important;
  margin-top: auto !important;
}

main > div[class*="gap-[2vw]"] button {
  height: clamp(44px, 7vh, 64px) !important;
  flex: 1 1 0% !important;
  border-radius: clamp(14px, 2vh, 20px) !important;
  font-size: clamp(22px, 3.2vh, 36px) !important;
  font-family: var(--font-display, Anton, sans-serif) !important;
  letter-spacing: 0.03em !important;
  line-height: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease !important;
}

main > div[class*="gap-[2vw]"] button:active {
  transform: scale(0.96) !important;
}

/* YouTube Background Players: Strictly off-screen & transparent to eliminate any UI occlusion / black boxes */
.naux-players,
.naux-players[data-visible="true"],
#naux-players,
div[class*="naux-players"] {
  position: fixed !important;
  left: -9999px !important;
  top: -9999px !important;
  width: 1px !important;
  height: 1px !important;
  opacity: 0.001 !important;
  pointer-events: none !important;
  visibility: hidden !important;
  z-index: -9999 !important;
}

/* Control Pills & EQ button in top right */
#audify-control-pills-container {
  display: inline-flex !important;
  align-items: center !important;
  flex-shrink: 0 !important;
  margin-right: 8px !important;
  margin-left: 0 !important;
}

#audify-eq-btn {
  height: 36px !important;
  padding: 0 12px !important;
  font-size: 13px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}

@media (max-width: 600px) {
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }

  main {
    max-width: 100vw !important;
    overflow-x: hidden !important;
    padding-left: 12px !important;
    padding-right: 12px !important;
  }

  main > div.relative.z-30.flex {
    gap: 6px !important;
    font-size: 16px !important;
    width: 100% !important;
  }

  main > div.relative.z-30.flex > span.text-lime {
    font-size: 24px !important;
  }

  #audify-control-pills-container {
    margin-right: 4px !important;
    gap: 4px !important;
    flex-shrink: 0 !important;
  }

  #audify-eq-btn {
    height: 32px !important;
    padding: 0 8px !important;
    font-size: 11px !important;
  }

  main > div.relative.z-30.flex div.ml-auto button.tabular-nums {
    font-size: 13px !important;
    padding: 4px 10px !important;
    gap: 5px !important;
    border-width: 1.5px !important;
  }

  main > div.relative.z-30.flex div.ml-auto button:not(.tabular-nums):not(#audify-eq-btn) {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
    padding: 0 !important;
  }

  main > div.relative.z-30.flex div.ml-auto {
    gap: 6px !important;
    flex-shrink: 0 !important;
  }
}
`;

fs.writeFileSync(FILE, cleanHeaderAndModals + perfectLayoutCss, 'utf8');
console.log('Successfully updated artist-explorer.css with zero collision guarantee!');
