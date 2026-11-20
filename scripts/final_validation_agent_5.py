import json
import re
import urllib.request
import concurrent.futures

path = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200\agent_5.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== VALIDATION REPORT FOR AGENT_5.JSON ===")
cats = list(data.keys())
print("Categories:", cats)
assert set(cats) == {"haryanvi-bhojpuri-party", "haryanvi-bhojpuri-desi-beats"}

required_keys = [
    'title', 'artist', 'year', 'durationSec', 'hookStartSec', 
    'hookEndSec', 'entrySec', 'exitSec', 'videoId', 'energy'
]

all_vids = []
all_songs = []

for cat in cats:
    songs = data[cat]
    print(f"\n--- {cat} ---")
    print(f"Total songs: {len(songs)}")
    assert len(songs) >= 100, f"Expected at least 100 songs, got {len(songs)}"
    
    for idx, s in enumerate(songs):
        # Check required fields
        for k in required_keys:
            assert k in s, f"Missing key '{k}' in song {idx} of {cat}: {s}"
        
        # Check types
        assert isinstance(s['title'], str) and len(s['title']) > 0
        assert isinstance(s['artist'], str) and len(s['artist']) > 0
        assert isinstance(s['durationSec'], int) and s['durationSec'] > 0
        assert isinstance(s['hookStartSec'], int) and s['hookStartSec'] >= 0
        assert isinstance(s['hookEndSec'], int) and s['hookEndSec'] > s['hookStartSec']
        assert isinstance(s['entrySec'], int) and s['entrySec'] >= 0
        assert isinstance(s['exitSec'], int) and s['exitSec'] > s['entrySec']
        assert isinstance(s['energy'], int) and 9 <= s['energy'] <= 10
        
        vid = s['videoId']
        assert isinstance(vid, str) and len(vid) == 11, f"Invalid videoId length: {vid}"
        assert re.match(r'^[a-zA-Z0-9_-]{11}$', vid), f"Invalid videoId characters: {vid}"
        
        all_vids.append(vid)
        all_songs.append((cat, s))

print(f"\nTotal combined songs: {len(all_vids)}")
print(f"Unique video IDs: {len(set(all_vids))}")
if len(all_vids) != len(set(all_vids)):
    import collections
    counts = collections.Counter(all_vids)
    dups = [v for v, c in counts.items() if c > 1]
    print("WARNING: Duplicate videoIds found:", dups)
else:
    print("All videoIds are 100% UNIQUE across all categories!")

# Check oEmbed for every single video
print("\nVerifying every single videoId with YouTube oEmbed...")
def check_oembed(vid):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode())
                return vid, True, body.get('title')
    except Exception as e:
        return vid, False, str(e)
    return vid, False, "Failed"

with concurrent.futures.ThreadPoolExecutor(max_workers=30) as ex:
    results = list(ex.map(check_oembed, all_vids))

valid_vids = [v for v, ok, _ in results if ok]
failed_vids = [(v, err) for v, ok, err in results if not ok]

print(f"oEmbed Verification Results: {len(valid_vids)} PASSED, {len(failed_vids)} FAILED")
if failed_vids:
    print("FAILED VIDEO IDS:", failed_vids)
    raise AssertionError(f"{len(failed_vids)} videoIds failed oEmbed verification!")
else:
    print("PERFECT! 100% of videoIds verified as authentic, playable YouTube videos!")
