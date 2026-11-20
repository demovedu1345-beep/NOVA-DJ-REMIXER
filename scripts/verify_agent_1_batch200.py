import os
import json
import urllib.request
import concurrent.futures
import time

BATCH_FILE = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200\agent_1.json"

with open(BATCH_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

REQUIRED_KEYS = {"title", "artist", "year", "durationSec", "hookStartSec", "hookEndSec", "entrySec", "exitSec", "videoId", "energy"}
EXPECTED_CATEGORIES = ["hindi-sufi", "hindi-hiphop", "diwali-party-songs"]

print("=== VERIFYING STRUCTURE & COUNTS ===")
all_vids = []
all_songs = []
issues = []

for cat in EXPECTED_CATEGORIES:
    if cat not in data:
        issues.append(f"Missing category: {cat}")
        continue
    songs = data[cat]
    count = len(songs)
    print(f"Category '{cat}': {count} songs")
    if count < 100:
        issues.append(f"Category '{cat}' has fewer than 100 songs: {count}")
    
    for i, s in enumerate(songs):
        for k in REQUIRED_KEYS:
            if k not in s:
                issues.append(f"Song {s.get('title')} in {cat} missing key {k}")
        vid = s.get("videoId", "")
        if not vid or len(vid) != 11:
            issues.append(f"Invalid videoId in {cat} [{i}]: '{vid}' for '{s.get('title')}'")
        all_vids.append((cat, s.get("title"), vid))
        all_songs.append((cat, s))

# Check duplicates within batch
seen_vids = set()
dup_vids = []
for cat, title, vid in all_vids:
    if vid in seen_vids:
        dup_vids.append((cat, title, vid))
    seen_vids.add(vid)

print(f"\nTotal songs across all 3 categories: {len(all_songs)}")
print(f"Total unique video IDs: {len(seen_vids)}")
if dup_vids:
    print(f"ERROR: Found {len(dup_vids)} duplicate video IDs in batch: {dup_vids}")
else:
    print("SUCCESS: Zero duplicate video IDs within batch!")

# Verify oEmbed in parallel
print("\n=== VERIFYING ALL 438 VIDEO IDS VIA OEMBED ===")
failed_vids = []

def verify_oembed(item):
    cat, s = item
    vid = s['videoId']
    title = s['title']
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            if r.status == 200:
                meta = json.loads(r.read().decode('utf-8'))
                return (True, cat, title, vid, meta.get('title'))
    except Exception as e:
        return (False, cat, title, vid, str(e))

t0 = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    futures = [executor.submit(verify_oembed, item) for item in all_songs]
    for f in concurrent.futures.as_completed(futures):
        ok, cat, title, vid, info = f.result()
        if not ok:
            print(f"FAILED oEmbed: [{cat}] {title} -> {vid} ({info})")
            failed_vids.append((cat, title, vid, info))

print(f"\noEmbed verification completed in {time.time()-t0:.2f}s")
if failed_vids:
    print(f"WARNING: {len(failed_vids)} video IDs failed oEmbed check!")
else:
    print(f"PERFECT! All {len(all_songs)} video IDs successfully verified via YouTube oEmbed!")

if issues:
    print("Issues encountered:", issues)
