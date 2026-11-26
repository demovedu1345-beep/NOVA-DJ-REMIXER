with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find('window.__nauxEngine')
print('window.__nauxEngine at:', idx)
print(code[idx-50:idx+150])
