with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = """      #audify-control-pills-container {
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
        margin-left: auto !important;
        margin-right: 14px !important;
        position: relative !important;
        z-index: 50 !important;
        flex-shrink: 0 !important;
      }"""

replacement = """      #audify-control-pills-container {
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
        margin-left: auto !important;
        margin-right: 14px !important;
        position: relative !important;
        z-index: 50 !important;
        flex-shrink: 1 !important;
        max-width: 100% !important;
      }"""

if target in c:
    c = c.replace(target, replacement)
    print("Successfully replaced flex-shrink: 0 with flex-shrink: 1 and max-width: 100%")
    with open('public/js/ui/aurora-and-mix-engine.js', 'w', encoding='utf-8') as f:
        f.write(c)
else:
    print("Target not found directly, checking variations")
