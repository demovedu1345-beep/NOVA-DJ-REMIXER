with open('public/naux/static/immutable/chunks/2yak1xb5ht175.js', 'r', encoding='utf-8') as f:
    code = f.read()

for pos in [18262, 19761]:
    print(f"=== Chunk 2yak at {pos} ===")
    print(code[max(0, pos-100):min(len(code), pos+250)])
