import json
import urllib.request
import concurrent.futures

path = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200\agent_2.json"
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

print("Categories present:", list(data.keys()))
for cat in ["punjabi-wedding", "punjabi-sad"]:
    songs = data.get(cat, [])
    print(f"  {cat}: {len(songs)} songs")
    assert len(songs) >= 100, f"{cat} has fewer than 100 songs!"

placeholders = {
    "BddP6PYo2gs", "7PCkvCPvDXk", "vX2cDW8LUWk", "VAdGW7QDJUI",
    "V7LwfY5U5WI", "CZt-rVn2BJs", "Gr8G_ldltDE", "GftlBD-Apu8"
}
all_vids = set()
errors = []

for cat, songs in data.items():
    cat_vids = set()
    for i, s in enumerate(songs):
        for field in ["title", "artist", "year", "durationSec", "hookStartSec", "hookEndSec", "entrySec", "exitSec", "videoId", "energy"]:
            if field not in s:
                errors.append(f"Missing {field} in {cat}[{i}]")
        
        vid = s.get("videoId", "")
        if len(vid) != 11:
            errors.append(f"Invalid videoId length {vid} in {cat}[{i}]")
        if vid in placeholders:
            errors.append(f"Placeholder videoId {vid} in {cat}[{i}]")
        if vid in cat_vids:
            errors.append(f"Duplicate videoId {vid} in {cat}[{i}]")
        cat_vids.add(vid)
        all_vids.add(vid)

        energy = s.get("energy", 0)
        if not (6 <= energy <= 10):
            errors.append(f"Energy out of range {energy} in {cat}[{i}]")
        if s.get("hookStartSec", 0) >= s.get("hookEndSec", 0):
            errors.append(f"hookStartSec >= hookEndSec in {cat}[{i}]")
        if s.get("durationSec", 0) <= s.get("hookStartSec", 0):
            errors.append(f"durationSec <= hookStartSec in {cat}[{i}]")

print(f"Total unique video IDs across categories: {len(all_vids)}")
if errors:
    print(f"Errors found ({len(errors)}):", errors[:10])
else:
    print("All structural, schema, range, and uniqueness assertions PASSED!")

# Sample oEmbed check
def check_oembed(vid):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status == 200
    except Exception:
        return False

print("Verifying all 319 video IDs via YouTube oEmbed...")
failed = []
with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
    futures = {executor.submit(check_oembed, vid): vid for vid in all_vids}
    for future in concurrent.futures.as_completed(futures):
        vid = futures[future]
        if not future.result():
            failed.append(vid)

if failed:
    print(f"WARNING: {len(failed)} video IDs failed oEmbed check: {failed}")
else:
    print("100% of the video IDs passed authentic YouTube oEmbed verification!")
