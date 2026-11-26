with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find('pause(){')
print("pause() found at:", idx)
print(code[idx:idx+450])

idx_res = code.find('resume(){')
print("resume() found at:", idx_res)
print(code[idx_res:idx_res+450])
