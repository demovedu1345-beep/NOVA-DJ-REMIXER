with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('const AURORA_PATTERNS = [')
end = text.find('  const MOOD_PALETTES = AURORA_PATTERNS;', start)
print(text[start:end])
