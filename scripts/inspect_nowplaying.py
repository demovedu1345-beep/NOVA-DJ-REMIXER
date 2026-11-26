with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx_func = code.rfind('function', 0, 29868)
print('function start around:', idx_func)
print(code[idx_func-200:idx_func+300])
