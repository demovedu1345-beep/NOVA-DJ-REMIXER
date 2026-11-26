with open('api/set.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('function buildSetFromCuratedDb')
if idx != -1:
    print(c[idx:idx+1500])
