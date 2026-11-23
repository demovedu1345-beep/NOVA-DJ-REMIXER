import os

# 1. Patch 2yak1xb5ht175.js to permanently enforce transform: "translateX(-50%)"
js_path = os.path.join('public', 'naux', 'static', 'immutable', 'chunks', '2yak1xb5ht175.js')
with open(js_path, 'r', encoding='utf-8') as f:
    text = f.read()

target = 'style:{transform:`translateX(calc(-50% - ${C}px))`}'
replacement = 'style:{transform:"translateX(-50%)"}'

assert target in text, 'target not found in 2yak1xb5ht175.js'
text = text.replace(target, replacement, 1)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated 2yak1xb5ht175.js successfully!")

# 2. Patch artist-explorer.css
css_path = os.path.join('public', 'styles', 'artist-explorer.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

header_protection = """

/* =========================================================================
   Responsive Header & Category Button Alignment (< 1024px vs >= 1024px)
   Strictly guarantees zero overlap across mobile, tablet, and desktop
   ========================================================================= */
@media (max-width: 1023px) {
  main div.relative.z-30.flex > button[class*="left-1/2"],
  main button[class*="left-1/2"] {
    display: none !important;
  }
  main > button[class*="md:hidden"],
  #btn-open-vibe-mobile {
    display: flex !important;
  }
}

@media (min-width: 1024px) {
  main div.relative.z-30.flex > button[class*="left-1/2"],
  main button[class*="left-1/2"] {
    display: flex !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    max-width: min(34vw, 360px) !important;
    z-index: 25 !important;
  }
  main > button[class*="md:hidden"],
  #btn-open-vibe-mobile {
    display: none !important;
  }
}

#audify-control-pills-container {
  display: inline-flex !important;
  align-items: center !important;
  flex-shrink: 0 !important;
  margin-right: 8px !important;
  margin-left: 0 !important;
}

#audify-eq-btn {
  height: 38px !important;
  padding: 0 12px !important;
  font-size: 13px !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
}
"""

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css + header_protection)
print("Updated artist-explorer.css successfully!")
