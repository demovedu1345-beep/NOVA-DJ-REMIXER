with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find('enforceMobileMaxVolume() {')
print(code[idx+400:idx+1500])
