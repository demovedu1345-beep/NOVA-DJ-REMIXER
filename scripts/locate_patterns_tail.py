with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find("id: 'synthwave-dusk',")
if idx != -1:
    end = code.find("];", idx)
    print("synthwave-dusk snippet:")
    print(code[idx:end+200])
