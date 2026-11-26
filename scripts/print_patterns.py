with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('const PRECOMPUTED_PATTERNS = [')
if idx != -1:
    end = text.find('];', idx)
    print(text[idx:end+2])
