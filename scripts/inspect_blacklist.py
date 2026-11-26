with open('api/set.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find('BLACKLIST_VIDS')
if idx != -1:
    print(code[idx:idx+400])
