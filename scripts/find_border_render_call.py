with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('borderEngine.onRenderFrame')
if idx != -1:
    print(c[max(0, idx-200):min(len(c), idx+200)])
