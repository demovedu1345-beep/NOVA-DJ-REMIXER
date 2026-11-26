with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('Plays through YouTube')
print('In 3cq6guoi7hqi2.js:')
print(repr(c[idx-50:idx+200]))

with open('public/js/ui/app.js', 'r', encoding='utf-8') as f:
    c2 = f.read()

idx2 = c2.find('Plays through YouTube')
print('In app.js:')
print(repr(c2[idx2-50:idx2+200]))
