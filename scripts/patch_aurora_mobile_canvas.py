with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update canvas.style.cssText
old_canvas_css = """  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    opacity: 0.94;
    mix-blend-mode: screen;
    transition: opacity 0.4s ease;
  `;"""

new_canvas_css = """  canvas.style.cssText = `
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    height: 100dvh !important;
    max-width: 100% !important;
    max-height: 100dvh !important;
    pointer-events: none !important;
    z-index: 0 !important;
    opacity: 0.94 !important;
    mix-blend-mode: screen !important;
    transition: opacity 0.4s ease !important;
  `;"""

if old_canvas_css in c:
    c = c.replace(old_canvas_css, new_canvas_css)
    print("Replaced old_canvas_css in aurora-and-mix-engine.js")
else:
    print("old_canvas_css not found directly, let's check with regex")

# 2. Update border root in audify-rgb-aurora-border.js
with open('public/js/ui/audify-rgb-aurora-border.js', 'r', encoding='utf-8') as f:
    border_c = f.read()

old_border_css = """      #audify-rgb-aurora-border {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 10 !important;
        overflow: hidden !important;
        contain: strict !important;
        user-select: none !important;
      }"""

new_border_css = """      #audify-rgb-aurora-border {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        height: 100dvh !important;
        max-width: 100% !important;
        max-height: 100dvh !important;
        pointer-events: none !important;
        z-index: 10 !important;
        overflow: hidden !important;
        contain: strict !important;
        user-select: none !important;
      }"""

if old_border_css in border_c:
    border_c = border_c.replace(old_border_css, new_border_css)
    print("Replaced old_border_css in audify-rgb-aurora-border.js")
    with open('public/js/ui/audify-rgb-aurora-border.js', 'w', encoding='utf-8') as f:
        f.write(border_c)
else:
    print("old_border_css not found directly in audify-rgb-aurora-border.js")

with open('public/js/ui/aurora-and-mix-engine.js', 'w', encoding='utf-8') as f:
    f.write(c)
