import os

# 1. Patch aurora-and-mix-engine.js
aurora_path = os.path.join('public', 'js', 'ui', 'aurora-and-mix-engine.js')
with open(aurora_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace insertion in injectPlayerControls
old_insert = """    if (targetRightCluster) {
      if (!targetRightCluster.contains(pillGroup)) {
        targetRightCluster.prepend(pillGroup);
      }
    } else if (targetHeader && !targetHeader.contains(pillGroup)) {
      targetHeader.appendChild(pillGroup);
    }"""

new_insert = """    const brand = targetHeader ? (targetHeader.querySelector('.text-lime') || targetHeader.firstElementChild) : null;
    if (brand && targetHeader) {
      if (brand.nextElementSibling !== pillGroup) {
        brand.after(pillGroup);
      }
    } else if (targetRightCluster && !targetRightCluster.contains(pillGroup)) {
      targetRightCluster.prepend(pillGroup);
    } else if (targetHeader && !targetHeader.contains(pillGroup)) {
      targetHeader.appendChild(pillGroup);
    }"""

assert old_insert in text, 'old_insert not found'
text = text.replace(old_insert, new_insert, 1)

# Replace ensurePillsAttached
old_ensure = """  function ensurePillsAttached() {
    const pill = document.getElementById('audify-control-pills-container');
    const eqBtn = document.getElementById('audify-eq-btn');
    if (!pill || !pill.isConnected || !eqBtn) {
      injectPlayerControls();
    } else {
      const artistPill = document.getElementById('audify-artist-header-pill');
      if (artistPill && artistPill.parentElement !== pill) {
        pill.prepend(artistPill);
      }
      const parentH = pill.parentElement;
      if (parentH) {
        parentH.style.width = 'auto';
        parentH.style.maxWidth = 'none';
      }
    }
  }"""

new_ensure = """  function ensurePillsAttached() {
    const pill = document.getElementById('audify-control-pills-container');
    const eqBtn = document.getElementById('audify-eq-btn');
    if (!pill || !pill.isConnected || !eqBtn) {
      injectPlayerControls();
    } else {
      const artistPill = document.getElementById('audify-artist-header-pill');
      if (artistPill && artistPill.parentElement !== pill) {
        pill.prepend(artistPill);
      }
      const headers = document.querySelectorAll('header, nav, main > .flex.justify-between, main > .relative.z-30.flex, main > div.flex');
      for (const h of headers) {
        if (h.closest('#audify-languages-section')) continue;
        const brand = h.querySelector('.text-lime');
        if (brand && pill.previousElementSibling !== brand) {
          brand.after(pill);
          break;
        }
      }
    }
  }"""

assert old_ensure in text, 'old_ensure not found'
text = text.replace(old_ensure, new_ensure, 1)

# Adjust pill style margin in ensurePillStyles
old_style_margin = "margin-right: 8px !important;"
new_style_margin = "margin-left: 8px !important; margin-right: auto !important; max-width: 42vw !important;"
text = text.replace(old_style_margin, new_style_margin, 1)

with open(aurora_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated aurora-and-mix-engine.js successfully!")

# 2. Patch artist-explorer.css
css_path = os.path.join('public', 'styles', 'artist-explorer.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace mobile margin-left: auto with margin-left: 6px
css = css.replace("margin-left: auto !important;", "margin-left: 6px !important;")

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated artist-explorer.css successfully!")
