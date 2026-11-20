import json
import urllib.request
import concurrent.futures
import time

with open(r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\existing_hb_songs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

party = data.get('haryanvi-bhojpuri-party', [])
desi = data.get('haryanvi-bhojpuri-desi-beats', [])

def verify_oembed(song):
    vid = song.get('videoId')
    if not vid or len(vid) != 11:
        return song, False, "Invalid length"
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode())
                yt_title = body.get('title', '')
                yt_author = body.get('author_name', '')
                return song, True, f"{yt_title} | {yt_author}"
    except Exception as e:
        return song, False, str(e)
    return song, False, "Unknown"

print("Verifying party songs...")
t0 = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as ex:
    p_res = list(ex.map(verify_oembed, party))
p_valid = [s for s, ok, info in p_res if ok]
p_invalid = [(s, info) for s, ok, info in p_res if not ok]
print(f"Party: Total {len(party)}, Valid {len(p_valid)}, Invalid {len(p_invalid)} in {time.time()-t0:.2f}s")

print("Verifying desi songs...")
t0 = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as ex:
    d_res = list(ex.map(verify_oembed, desi))
d_valid = [s for s, ok, info in d_res if ok]
d_invalid = [(s, info) for s, ok, info in d_res if not ok]
print(f"Desi: Total {len(desi)}, Valid {len(d_valid)}, Invalid {len(d_invalid)} in {time.time()-t0:.2f}s")

# Let's save the valid songs and invalid song titles
with open(r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\existing_valid_invalid.json', 'w', encoding='utf-8') as f:
    json.dump({
        'party_valid': p_valid,
        'party_invalid': [s['title'] for s, _ in p_invalid],
        'desi_valid': d_valid,
        'desi_invalid': [s['title'] for s, _ in d_invalid]
    }, f, indent=2)

print("Saved existing_valid_invalid.json")
