with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find('function enforceMobileMaxVolume()')
print(code[idx:idx+1200])
