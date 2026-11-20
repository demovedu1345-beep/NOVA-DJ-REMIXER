import json
import urllib.request
import time

path = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches\agent_5.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

vids_seen = set()
invalid_vids = []

for cat, songs in data.items():
    print(f"\n==================== {cat} ({len(songs)}) ====================")
    for i, s in enumerate(songs, 1):
        vid = s['videoId']
        title = s['title']
        if vid in vids_seen:
            print(f"DUPLICATE DETECTED: {vid} for {title}")
            invalid_vids.append((title, vid, "Duplicate"))
        vids_seen.add(vid)
        
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        try:
            req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=6) as resp:
                meta = json.loads(resp.read().decode('utf-8'))
                yt_title = meta.get('title', '')
                yt_author = meta.get('author_name', '')
                print(f"[{i:02d}] OK {title:24} -> {vid} | {yt_title[:50]} ({yt_author})")
        except Exception as e:
            print(f"[{i:02d}] FAILED {title:20} -> {vid} | {e}")
            invalid_vids.append((title, vid, str(e)))
        time.sleep(0.08)

print("\n================== SUMMARY ==================")
print(f"Total Unique Valid Videos: {len(vids_seen)}")
print(f"Total Invalid/Failed: {len(invalid_vids)}")
if invalid_vids:
    print("Issues:", invalid_vids)
