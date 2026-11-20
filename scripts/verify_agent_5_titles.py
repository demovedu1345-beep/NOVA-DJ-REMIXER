import json
import urllib.request
import re
import time

path = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches\agent_5.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update Defaulter videoId and artist
for s in data.get('punjabi-gym', []):
    if s['title'] == 'Defaulter':
        s['artist'] = 'R Nait, Gurlez Akhtar'
        s['videoId'] = 'oAqItl1De9s'
        s['durationSec'] = 224

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

headers = {'User-Agent': 'Mozilla/5.0'}

for cat, songs in data.items():
    print(f"\n==================== {cat} ({len(songs)}) ====================")
    for i, s in enumerate(songs, 1):
        vid = s['videoId']
        title = s['title']
        url = f"https://www.youtube.com/watch?v={vid}"
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=8) as resp:
                html = resp.read(20000).decode('utf-8', errors='ignore')
                m = re.search(r'<title>(.*?)</title>', html)
                yt_title = m.group(1).replace(' - YouTube', '') if m else 'NO TITLE'
                print(f"[{i:02d}] {title:25} -> {vid} | {yt_title[:60]}")
        except Exception as e:
            print(f"[{i:02d}] {title:25} -> {vid} | ERROR: {e}")
        time.sleep(0.1)
