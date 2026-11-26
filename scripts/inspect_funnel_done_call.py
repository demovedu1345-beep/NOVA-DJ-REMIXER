with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('function u({counts:')
if idx != -1:
    print(c[idx:idx+2500])
