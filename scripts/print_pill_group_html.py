with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('pillGroup.innerHTML = `')
end = text.find('`;', start)
print(text[start:end+2])
