with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('gl.uniform1f(u.uAberration')
if idx != -1:
    print(c[max(0, idx-1500):idx])
