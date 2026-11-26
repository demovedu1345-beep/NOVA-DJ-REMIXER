with open('public/js/ui/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('Made with')
if idx != -1:
    print(c[max(0, idx-50):min(len(c), idx+100)])
