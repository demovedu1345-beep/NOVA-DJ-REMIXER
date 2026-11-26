with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('function ensurePillStyles()')
if idx != -1:
    print(text[idx:idx+1500])
