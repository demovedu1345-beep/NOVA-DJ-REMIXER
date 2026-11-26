with open('public/js/ui/eq-modal.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('function createModalDOM()')
if idx != -1:
    print(c[idx+2000:idx+4500])
