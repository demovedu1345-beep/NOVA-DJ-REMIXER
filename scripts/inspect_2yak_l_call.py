with open('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('async function l(e)')
if idx != -1:
    print(c[idx:idx+1200])
