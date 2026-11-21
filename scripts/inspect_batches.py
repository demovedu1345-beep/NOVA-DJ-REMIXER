import os, json

p = 'scripts/curated_batches_200'
for f in os.listdir(p):
    if f.endswith('.json'):
        with open(os.path.join(p, f), 'r', encoding='utf-8') as fp:
            data = json.load(fp)
            keys_info = []
            for k, v in data.items():
                count = len(v.get('songs', [])) if isinstance(v, dict) else len(v)
                keys_info.append(f"{k} ({count})")
            print(f"{f}: {', '.join(keys_info)}")
