with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find('togglePause(){')
print(code[idx-350:idx+350])
