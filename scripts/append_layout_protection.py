import os

path = os.path.join('public', 'styles', 'artist-explorer.css')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

layout_rules = """

/* =========================================================================
   Player Layout & Positioning Protection (Desktop, Mobile & Short Viewports)
   Strictly prevents element collision, overlapping, and button occlusion
   ========================================================================= */

/* 1. Header Centered Category Button (Dead-Center Alignment on Desktop) */
main button[class*="left-1/2"],
header button[class*="left-1/2"],
[role="banner"] button[class*="left-1/2"] {
  transform: translateX(-50%) !important;
  max-width: min(44vw, 380px) !important;
  left: 50% !important;
}

/* 2. Center Deck Area Height Protection */
main > div[class*="container-type"],
main > div.relative.z-10.flex-1 {
  min-height: clamp(160px, 28vh, 320px) !important;
  position: relative !important;
}

/* 3. Responsive scaling for Short / Landscape Viewports (< 650px height) */
@media (max-height: 650px) {
  main {
    padding-top: 1.5vh !important;
    padding-bottom: 1.5vh !important;
  }

  /* Compact deck typography */
  .deck h2 {
    font-size: clamp(32px, 8.5vh, 60px) !important;
    line-height: 0.9 !important;
  }

  .deck p {
    font-size: clamp(14px, 3.2vh, 20px) !important;
    margin-top: 4px !important;
  }

  /* Compact waveform */
  .deck div[class*="select-none"] {
    padding-top: 12px !important;
  }

  .deck div[class*="select-none"] > div[class*="cursor-grab"],
  .deck div[class*="select-none"] > div[class*="items-center"] {
    height: clamp(38px, 8vh, 52px) !important;
  }

  /* Compact AGENT bar */
  main > div[class*="border-y-2"] {
    margin-bottom: 1.5vh !important;
    padding-top: 0.8vh !important;
    padding-bottom: 0.8vh !important;
  }

  /* Compact transport buttons */
  main > div[class*="gap-[2vw]"] button {
    height: clamp(48px, 9vh, 60px) !important;
    font-size: clamp(20px, 4vh, 30px) !important;
    border-radius: 18px !important;
  }
}

/* 4. Ultra-Short Viewports (< 480px height, like mobile landscape) */
@media (max-height: 480px) {
  main > div[class*="border-y-2"] {
    display: none !important;
  }

  .deck h2 {
    font-size: clamp(26px, 8vh, 42px) !important;
  }

  .deck div[class*="select-none"] > div[class*="cursor-grab"],
  .deck div[class*="select-none"] > div[class*="items-center"] {
    height: 36px !important;
  }

  main > div[class*="gap-[2vw]"] button {
    height: 44px !important;
    font-size: 18px !important;
  }
}
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(content + layout_rules)

print("Appended layout rules successfully!")
