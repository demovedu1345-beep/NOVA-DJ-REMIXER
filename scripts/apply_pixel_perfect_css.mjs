import fs from 'fs';

const FILE = 'public/styles/artist-explorer.css';
let css = fs.readFileSync(FILE, 'utf8');

const marker = 'Player Stage & Deck Perfect Layout';
const foundIdx = css.indexOf(marker);

if (foundIdx === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

const idx = css.lastIndexOf('/*', foundIdx);
const baseCss = css.slice(0, idx);

const pixelPerfectNauxCss = `/* =========================================================================
   Player Stage & Deck Exact 1:1 Pixel-Perfect Layout
   Matches reference image media_1795517298699_8074d744.jpg bit-for-bit
   ========================================================================= */

/* Hide any injected control pills that crowd the header */
#audify-control-pills-container,
#audify-rgb-border-canvas,
#audify-rgb-border-container,
.audify-laser-beam {
  display: none !important;
}

/* Soft atmospheric ambient background */
#aurora-canvas,
canvas#aurora-canvas {
  opacity: 0.18 !important;
  filter: blur(24px) !important;
  pointer-events: none !important;
  z-index: 0 !important;
}

/* Main Container: Full viewport height, deep obsidian, flex column */
main[data-paused],
main:has(.deck),
main {
  display: flex !important;
  flex-direction: column !important;
  height: 100dvh !important;
  max-height: 100dvh !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  background: #050507 !important;
  position: relative !important;
  padding-left: clamp(16px, 3.5vw, 48px) !important;
  padding-right: clamp(16px, 3.5vw, 48px) !important;
  padding-top: clamp(12px, 2.5vh, 28px) !important;
  padding-bottom: clamp(12px, 2.5vh, 28px) !important;
}

/* 1. Header (Single Row, Dead-Centered Category Pill, Zero Clutter) */
main > div.relative.z-30.flex {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  height: 52px !important;
  min-height: 52px !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
}

/* Logo on Left */
main > div.relative.z-30.flex > span.text-lime {
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(26px, 2.5vw, 36px) !important;
  letter-spacing: 0.02em !important;
  line-height: 1 !important;
  color: #D4FF00 !important;
  flex-shrink: 0 !important;
}

/* Category Pill Dead-Centered */
main button[class*="left-1/2"],
header button[class*="left-1/2"],
main div.relative.z-30.flex > button[class*="left-1/2"] {
  display: flex !important;
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 5px 18px !important;
  border: 2px solid rgba(255, 255, 255, 0.22) !important;
  border-radius: 9999px !important;
  background: rgba(10, 10, 14, 0.35) !important;
  backdrop-filter: blur(8px) !important;
  max-width: min(65vw, 700px) !important;
  width: max-content !important;
  z-index: 25 !important;
  white-space: nowrap !important;
  box-sizing: border-box !important;
}

main button[class*="left-1/2"] span:first-child,
header button[class*="left-1/2"] span:first-child {
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(12px, 1.15vw, 16px) !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase !important;
  color: rgba(255, 255, 255, 0.75) !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
}

main button[class*="left-1/2"] span.text-lime,
header button[class*="left-1/2"] span.text-lime {
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(12px, 1.15vw, 16px) !important;
  letter-spacing: 0.06em !important;
  font-weight: 700 !important;
  color: #D4FF00 !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}

/* Hide Row 2 category button on desktop & landscape */
@media (min-width: 768px) {
  main > button[class*="md:hidden"],
  #btn-open-vibe-mobile {
    display: none !important;
  }
}

/* Right Side Controls Cluster */
main > div.relative.z-30.flex div.ml-auto {
  margin-left: auto !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  flex-shrink: 0 !important;
}

/* Timer Button */
main > div.relative.z-30.flex div.ml-auto button.tabular-nums {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 5px 16px !important;
  border: 2px solid rgba(255, 255, 255, 0.22) !important;
  border-radius: 9999px !important;
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(14px, 1.2vw, 18px) !important;
  color: rgba(255, 255, 255, 0.7) !important;
  letter-spacing: 0.04em !important;
  background: transparent !important;
}

/* Exit Button */
main > div.relative.z-30.flex div.ml-auto button:not(.tabular-nums) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 40px !important;
  height: 40px !important;
  border: 2px solid rgba(255, 255, 255, 0.22) !important;
  border-radius: 9999px !important;
  color: rgba(255, 255, 255, 0.75) !important;
  background: transparent !important;
}

/* 2. Decks Stage Container */
main > div[class*="container-type"],
main > div.relative.z-10.flex-1 {
  position: relative !important;
  flex: 1 1 auto !important;
  min-height: clamp(160px, 35vh, 360px) !important;
  width: 100% !important;
  overflow: visible !important;
  margin-top: clamp(8px, 1.8vh, 22px) !important;
  margin-bottom: clamp(6px, 1.4vh, 18px) !important;
}

/* Deck A (Live): Left column taking 58% width */
.deck[data-slot="live"] {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  width: 58% !important;
  opacity: 1 !important;
  filter: none !important;
  transform: translate(0) scale(1) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: clamp(4px, 1.2vh, 14px) !important;
  z-index: 10 !important;
}

/* Deck B (Cueing): Top right quadrant scaled and translated right */
.deck[data-slot="cue"] {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  width: 58% !important;
  opacity: 0.38 !important;
  filter: grayscale(80%) !important;
  transform: translate(114%) scale(0.56) !important;
  transform-origin: 0 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: clamp(4px, 1.2vh, 14px) !important;
  z-index: 5 !important;
  pointer-events: none !important;
}

@media (max-width: 767px) {
  .deck[data-slot="live"] {
    width: 100% !important;
  }
  .deck[data-slot="cue"] {
    display: none !important;
  }
}

/* Deck Headers (DECK A ● LIVE) */
.deck > header {
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(16px, 2.2vh, 26px) !important;
  letter-spacing: 0.05em !important;
  line-height: 1 !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

/* Song Title in Deck */
.deck h2 {
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(32px, min(6.5vw, 7.5vh), 72px) !important;
  font-weight: 700 !important;
  line-height: 0.86 !important;
  letter-spacing: -0.01em !important;
  color: #FFFFFF !important;
  text-transform: uppercase !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
}

/* Artist Name */
.deck p {
  font-size: clamp(14px, 2vh, 22px) !important;
  color: rgba(255, 255, 255, 0.72) !important;
  margin-top: clamp(2px, 0.8vh, 8px) !important;
  line-height: 1.2 !important;
}

/* Hint Badge Above Waveform */
.deck div[class*="border-lime"] {
  border: 1px solid #D4FF00 !important;
  border-radius: 9999px !important;
  padding: 3px 12px !important;
  font-size: 12px !important;
  color: #FFFFFF !important;
  background: transparent !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  width: max-content !important;
}

/* Waveform Bars */
.deck div[class*="select-none"] > div[class*="cursor-grab"],
.deck div[class*="select-none"] > div[class*="items-center"] {
  height: clamp(30px, 5.2vh, 52px) !important;
}

/* 3. AGENT Status Bar (Ticker) */
main > div[class*="border-y-2"] {
  position: relative !important;
  flex-shrink: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
  padding: 10px 0 !important;
  margin-top: auto !important;
  margin-bottom: clamp(10px, 1.8vh, 18px) !important;
  z-index: 20 !important;
}

main > div[class*="border-y-2"] span.text-lime {
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(18px, 2.2vh, 28px) !important;
  letter-spacing: 0.04em !important;
  color: #D4FF00 !important;
  line-height: 1 !important;
}

main > div[class*="border-y-2"] div.ticker-in,
main > div[class*="border-y-2"] span:not(.text-lime) {
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(14px, 1.8vh, 22px) !important;
  color: rgba(255, 255, 255, 0.88) !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase !important;
}

/* ✕ REMOVE NEXT & ＋ PLAY NEXT */
main > div[class*="border-y-2"] button {
  border-radius: 9999px !important;
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(12px, 1.4vh, 16px) !important;
  letter-spacing: 0.04em !important;
  padding: 5px 14px !important;
  line-height: 1 !important;
}

/* 4. Action Buttons (SKIP & PLAY FULL) */
main > div[class*="gap-[2vw]"] {
  flex-shrink: 0 !important;
  display: flex !important;
  gap: 16px !important;
  width: 100% !important;
  z-index: 30 !important;
  position: relative !important;
}

main > div[class*="gap-[2vw]"] button {
  height: clamp(52px, 8.5vh, 68px) !important;
  flex: 1 1 0% !important;
  border-radius: clamp(16px, 2.4vh, 22px) !important;
  font-family: var(--font-display, Anton, sans-serif) !important;
  font-size: clamp(26px, 3.8vh, 42px) !important;
  letter-spacing: 0.03em !important;
  text-transform: uppercase !important;
  line-height: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease !important;
}

/* Solid Lime SKIP Button */
main > div[class*="gap-[2vw]"] button:first-child {
  background-color: #D4FF00 !important;
  color: #000000 !important;
  border: none !important;
}

/* Outline White PLAY FULL Button */
main > div[class*="gap-[2vw]"] button:last-child {
  background-color: transparent !important;
  color: #FFFFFF !important;
  border: 2px solid #FFFFFF !important;
}

main > div[class*="gap-[2vw]"] button:active {
  transform: scale(0.96) !important;
}

/* YouTube background players hidden offscreen */
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
`;

fs.writeFileSync(FILE, baseCss + pixelPerfectNauxCss, 'utf8');
console.log('Successfully updated artist-explorer.css to match user reference image bit-for-bit!');
