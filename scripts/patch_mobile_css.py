mobile_css = """

/* ==========================================================================
   Audify Mobile Full-Screen & Viewport Fitment Enforcement
   Strict Obsidian (#050507), Lime (#D4FF00), Zero Horizontal Overflow
   ========================================================================== */
html {
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100% !important;
  min-height: -webkit-fill-available !important;
  min-height: 100dvh !important;
  overflow-x: hidden !important;
  -webkit-text-size-adjust: 100% !important;
  touch-action: pan-y pinch-zoom !important;
}

body {
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100% !important;
  min-height: -webkit-fill-available !important;
  min-height: 100dvh !important;
  overflow-x: hidden !important;
  position: relative !important;
  margin: 0 !important;
  padding: 0 !important;
  background-color: #050507 !important;
  overscroll-behavior-y: contain !important;
  -webkit-overflow-scrolling: touch !important;
}

/* Ensure app wrapper fits true edge-to-edge full screen */
#svelte, main, .min-h-dvh {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

/* Aurora Canvas and Viewport Border Edge-to-Edge Fit */
#audify-aurora-canvas,
#audify-rgb-aurora-border {
  position: fixed !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  height: 100dvh !important;
  max-width: 100% !important;
  max-height: 100dvh !important;
  overflow: hidden !important;
  pointer-events: none !important;
}

/* Mobile Responsive Constraints (< 768px) */
@media (max-width: 768px) {
  .audify-artist-sheet {
    width: 100% !important;
    max-width: 100% !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
  }

  /* Prevent Header Horizontal Overflow & Allow Fluid Scroll */
  #audify-control-pills-container {
    max-width: 100% !important;
    gap: 4px !important;
    margin-right: 4px !important;
    margin-left: auto !important;
    overflow-x: auto !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
  }
  #audify-control-pills-container::-webkit-scrollbar {
    display: none !important;
  }
  .audify-pill-btn {
    height: 30px !important;
    padding: 0 8px !important;
    font-size: 11px !important;
    white-space: nowrap !important;
  }
  .audify-pill-tag-aurora,
  .audify-pill-tag-mix {
    display: none !important;
  }
  #audify-mini-spectrum-canvas {
    width: 34px !important;
    height: 12px !important;
    margin-left: 2px !important;
  }

  /* Wizard & Grid Container edge padding */
  .grid {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}
"""

with open('public/styles/artist-explorer.css', 'r', encoding='utf-8') as f:
    content = f.read()

if 'Audify Mobile Full-Screen & Viewport Fitment Enforcement' not in content:
    with open('public/styles/artist-explorer.css', 'a', encoding='utf-8') as f:
        f.write(mobile_css)
    print("Successfully appended mobile full-screen CSS to public/styles/artist-explorer.css")
else:
    print("Mobile full-screen CSS already present")
