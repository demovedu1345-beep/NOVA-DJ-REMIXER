with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('uniform float uAberration;')
if idx != -1:
    print(c[idx:idx+800])
