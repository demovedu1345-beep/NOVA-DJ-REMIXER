with open('public/js/ui/aurora-and-mix-engine.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('audify-control-pills-container')
while idx != -1:
    print('--- match at', idx, '---')
    print(c[max(0, idx-100):min(len(c), idx+400)])
    idx = c.find('audify-control-pills-container', idx+1)
