with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('function render(now) {')
end = text.find('// 8. Serato-Grade Audio FX', start)
print(text[start:end])
