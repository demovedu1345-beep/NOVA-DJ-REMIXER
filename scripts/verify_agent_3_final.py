import json
import os
import urllib.request
import concurrent.futures

FILE_PATH = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200\agent_3.json'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

expected_keys = ["english-pop", "english-edm", "english-hiphop", "english-love"]
assert list(data.keys()) == expected_keys, f"Keys do not match expected: {list(data.keys())}"

all_vids = set()
total_songs = 0

print("=== VERIFYING JSON STRUCTURE AND COUNTS ===")
for cat in expected_keys:
    songs = data[cat]
    count = len(songs)
    print(f"{cat}: {count} songs")
    assert count >= 100, f"Category {cat} has only {count} songs (< 100)!"
    total_songs += count

    cat_vids = set()
    cat_titles = set()
    for idx, s in enumerate(songs):
        title = s.get('title')
        artist = s.get('artist')
        year = s.get('year')
        dur = s.get('durationSec')
        h_start = s.get('hookStartSec')
        h_end = s.get('hookEndSec')
        entry = s.get('entrySec')
        exit_sec = s.get('exitSec')
        vid = s.get('videoId')
        energy = s.get('energy')

        assert title, f"Missing title in {cat}[{idx}]"
        assert artist, f"Missing artist in {cat}[{idx}]"
        assert year, f"Missing year in {cat}[{idx}]"
        assert isinstance(dur, (int, float)) and dur > 0, f"Invalid duration in {cat}[{idx}]"
        assert isinstance(h_start, (int, float)), f"Invalid hookStartSec in {cat}[{idx}]"
        assert isinstance(h_end, (int, float)), f"Invalid hookEndSec in {cat}[{idx}]"
        assert isinstance(entry, (int, float)), f"Invalid entrySec in {cat}[{idx}]"
        assert isinstance(exit_sec, (int, float)), f"Invalid exitSec in {cat}[{idx}]"
        assert isinstance(vid, str) and len(vid) == 11, f"Invalid videoId '{vid}' in {cat}[{idx}]"
        assert isinstance(energy, int) and 8 <= energy <= 10, f"Invalid energy '{energy}' in {cat}[{idx}]"

        assert vid not in cat_vids, f"Duplicate videoId '{vid}' in {cat}[{idx}]"
        assert vid not in all_vids, f"Globally duplicate videoId '{vid}' across categories"
        cat_vids.add(vid)
        all_vids.add(vid)

print(f"\nAll structural checks passed! Total unique songs: {total_songs}, Total unique video IDs: {len(all_vids)}")

# Test a sample of 25 random videoIds via oEmbed to confirm network validity
print("\n=== SAMPLE OEMBED SPOT CHECK ===")
sample_vids = list(all_vids)[:30]
def check_oembed(v):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={v}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            return v, resp.status == 200
    except Exception:
        return v, False

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(check_oembed, sample_vids))

passed = sum(1 for v, ok in results if ok)
print(f"Sample oEmbed check: {passed}/{len(sample_vids)} valid HTTP 200")
assert passed == len(sample_vids), "Some video IDs failed oEmbed check!"

print("\n>>> ALL VALIDATION CHECKS PASSED PERFECTLY! <<<")
