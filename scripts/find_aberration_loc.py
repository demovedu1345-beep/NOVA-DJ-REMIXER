with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('uAberration')
while idx != -1:
    print('--- match at', idx, '---')
    print(c[max(0, idx-50):min(len(c), idx+150)])
    idx = c.find('uAberration', idx+1)
