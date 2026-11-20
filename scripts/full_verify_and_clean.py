import json
import urllib.request
import concurrent.futures

file_path = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200\agent_3.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

all_items = []
for cat, songs in data.items():
    for s in songs:
        all_items.append((cat, s))

def verify_item(item):
    cat, s = item
    vid = s['videoId']
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                return (item, True)
    except Exception:
        pass
    return (item, False)

with concurrent.futures.ThreadPoolExecutor(max_workers=30) as executor:
    results = list(executor.map(verify_item, all_items))

failed = [item for item, ok in results if not ok]
print(f"Full validation result: {len(results)-len(failed)}/{len(results)} passed!")

if failed:
    print(f"Removing {len(failed)} unverified items:")
    for cat, s in failed:
        print(f"  [{cat}] {s['title']} - {s['artist']} ({s['videoId']})")
    failed_vids = {s['videoId'] for cat, s in failed}
    for cat in data:
        data[cat] = [s for s in data[cat] if s['videoId'] not in failed_vids]
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Cleaned up file!")
else:
    print("ALL songs verified 100% active!")

for cat in data:
    print(f" - {cat}: {len(data[cat])} songs (>= 100: {len(data[cat]) >= 100})")
