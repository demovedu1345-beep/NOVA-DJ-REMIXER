with open('public/js/ui/eq-modal.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('audify-eq-bpm-readout')
if idx != -1:
    print(c[max(0, idx-200):min(len(c), idx+600)])
