with open('public/js/ui/eq-modal.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('audify-eq-close-btn')
if idx != -1:
    print(c[idx:idx+800])
