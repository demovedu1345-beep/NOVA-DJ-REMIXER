with open('public/naux/static/immutable/chunks/3cq6guoi7hqi2.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find('tick(){')
if idx != -1:
    print("=== tick() ===")
    print(code[idx:idx+1200])
