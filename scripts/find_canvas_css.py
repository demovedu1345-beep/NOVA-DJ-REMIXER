with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('canvas.style.cssText')
if idx != -1:
    print(c[idx:idx+400])
