with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('Plays through YouTube')
if idx != -1:
    print(c[max(0, idx-150):min(len(c), idx+250)])
