with open('api/set.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function buildSetFromCuratedDb')
print(text[idx:idx+1500])
