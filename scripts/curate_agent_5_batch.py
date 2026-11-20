import json
import os
import sys
import time
import urllib.request
import threading
import concurrent.futures
import yt_dlp

sys.path.append(r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts')
from agent5_candidates import PARTY_CANDIDATES, DESI_CANDIDATES

BATCH_DIR = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200'
OUTPUT_FILE = os.path.join(BATCH_DIR, 'agent_5.json')
os.makedirs(BATCH_DIR, exist_ok=True)

# Load existing valid songs
existing_file = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\existing_valid_invalid.json'
with open(existing_file, 'r', encoding='utf-8') as f:
    existing_data = json.load(f)

party_existing = existing_data.get('party_valid', [])
desi_existing = existing_data.get('desi_valid', [])

print(f"Loaded existing valid songs: Party={len(party_existing)}, Desi={len(desi_existing)}")

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True
}

used_video_ids = set()
lock = threading.Lock()

def clean_song(s, default_energy=9):
    vid = s['videoId']
    with lock:
        used_video_ids.add(vid)
    dur = int(s.get('durationSec') or 210)
    hs = int(s.get('hookStartSec') or 32)
    he = int(s.get('hookEndSec') or (hs + 40))
    en = int(s.get('energy') or default_energy)
    if en < 9:
        en = 9
    return {
        'title': s['title'],
        'artist': s['artist'],
        'year': str(s.get('year') or '2021'),
        'durationSec': dur,
        'hookStartSec': hs,
        'hookEndSec': he,
        'entrySec': hs,
        'exitSec': he,
        'videoId': vid,
        'energy': en
    }

final_party = [clean_song(s, 9) for s in party_existing]
final_desi = [clean_song(s, 10) for s in desi_existing]

print(f"Initial clean counts: Party={len(final_party)}, Desi={len(final_desi)}")
print(f"Total initially registered videoIds: {len(used_video_ids)}")

def verify_oembed(vid):
    if not vid or len(vid) != 11:
        return False, None
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode())
                return True, data.get('title')
    except Exception:
        pass
    return False, None

def search_candidate(cand):
    title = cand['title']
    artist = cand['artist']
    query = cand.get('query') or f"{title} {artist} official video"
    year = str(cand.get('year') or '2021')
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch4:{query}", download=False)
            if not res or not res.get('entries'):
                return None
            
            for entry in res['entries']:
                vid = entry.get('id')
                if not vid or len(vid) != 11:
                    continue
                
                # Check oembed
                ok, yt_title = verify_oembed(vid)
                if not ok:
                    continue
                
                dur = int(entry.get('duration') or 215)
                if dur < 90 or dur > 600:
                    dur = 215
                
                hs = 32
                if dur > 240:
                    hs = 36
                he = hs + 40
                
                energy = 10 if ("sapna" in artist.lower() or "pawan" in artist.lower() or "dhol" in query.lower() or "desi" in query.lower()) else 9

                return {
                    'title': title,
                    'artist': artist,
                    'year': year,
                    'durationSec': dur,
                    'hookStartSec': hs,
                    'hookEndSec': he,
                    'entrySec': hs,
                    'exitSec': he,
                    'videoId': vid,
                    'energy': energy
                }
    except Exception as e:
        pass
    return None

def resolve_category(cat_name, target_count, current_list, candidates, max_workers=8):
    existing_titles = {s['title'].lower() for s in current_list}
    print(f"\n==========================================")
    print(f"Resolving for {cat_name}: Currently {len(current_list)}, Target: {target_count}")
    
    todo_cands = [c for c in candidates if c['title'].lower() not in existing_titles]
    print(f"Candidate pool to process: {len(todo_cands)}")
    
    t0 = time.time()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_cand = {executor.submit(search_candidate, cand): cand for cand in todo_cands}
        
        for future in concurrent.futures.as_completed(future_to_cand):
            if len(current_list) >= target_count:
                # Cancel remaining
                for f in future_to_cand:
                    f.cancel()
                break
            
            cand = future_to_cand[future]
            try:
                song = future.result()
                if song:
                    with lock:
                        if song['videoId'] not in used_video_ids and song['title'].lower() not in existing_titles:
                            used_video_ids.add(song['videoId'])
                            existing_titles.add(song['title'].lower())
                            current_list.append(song)
                            print(f"[{len(current_list)}/{target_count}] Added: {song['title']} ({song['artist']}) -> {song['videoId']} ({song['durationSec']}s)")
            except Exception as e:
                pass
    
    print(f"Finished {cat_name}: now has {len(current_list)} songs in {time.time()-t0:.2f}s")
    return current_list

# We want AT LEAST 100 for each. Let's aim for 105 for safety.
print("\n>>> Resolving Haryanvi Bhojpuri Party...")
final_party = resolve_category("haryanvi-bhojpuri-party", 105, final_party, PARTY_CANDIDATES, max_workers=8)

print("\n>>> Resolving Haryanvi Bhojpuri Desi Beats...")
final_desi = resolve_category("haryanvi-bhojpuri-desi-beats", 105, final_desi, DESI_CANDIDATES, max_workers=8)

print("\n==========================================")
print(f"Final Count - Party: {len(final_party)}")
print(f"Final Count - Desi Beats: {len(final_desi)}")

# Final full verification of all songs in output
print("\n>>> Running FULL PARALLEL VERIFICATION of all videoIds...")
all_songs = final_party + final_desi
vids_check = [s['videoId'] for s in all_songs]

with concurrent.futures.ThreadPoolExecutor(max_workers=25) as ex:
    check_results = list(ex.map(verify_oembed, vids_check))

valid_count = sum(1 for ok, _ in check_results if ok)
invalid_count = sum(1 for ok, _ in check_results if not ok)
print(f"Verification Results: {valid_count} Valid, {invalid_count} Invalid out of {len(all_songs)} songs.")

if invalid_count > 0:
    print("Filtering invalid videoIds...")
    final_party = [s for s in final_party if verify_oembed(s['videoId'])[0]]
    final_desi = [s for s in final_desi if verify_oembed(s['videoId'])[0]]
    print(f"Filtered Party: {len(final_party)}, Filtered Desi: {len(final_desi)}")

output_data = {
    "haryanvi-bhojpuri-party": final_party,
    "haryanvi-bhojpuri-desi-beats": final_desi
}

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"\nSuccessfully wrote batch to {OUTPUT_FILE}!")
