import json
import os
import time
import urllib.request
import concurrent.futures
import yt_dlp
import ast

ROOT = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER"

# 1. Load curated DB
with open(os.path.join(ROOT, 'api/_lib/curated-songs-db.js'), 'r', encoding='utf-8') as f:
    text = f.read()
prefix = 'export const CURATED_CATEGORIES_DB = '
db = json.loads(text[len(prefix):].rstrip().rstrip(';'))

# 2. Extract candidate lists
def extract_candidates(fname, varname):
    with open(os.path.join(ROOT, fname), 'r', encoding='utf-8') as f:
        code = f.read()
    idx = code.find(varname)
    if idx == -1: return []
    sub = code[idx:]
    start = sub.find('[')
    end = sub.find(']\n')
    if end == -1: end = sub.find('];')
    return ast.literal_eval(sub[start:end+1])

marathi_cand = extract_candidates('scripts/curate_agent_7_batches.py', 'MARATHI_SONGS')
marwadi_cand = extract_candidates('scripts/curate_agent_7_batches.py', 'MARWADI_SONGS')
kannada_cand = extract_candidates('scripts/generate_agent_8_200.py', 'KANNADA_CANDIDATES')
odia_cand = extract_candidates('scripts/generate_agent_8_200.py', 'ODIA_CANDIDATES')
gujarati_cand = extract_candidates('scripts/curate_agent_6_garba.py', 'CANDIDATES')

print(f"Candidates: Marathi={len(marathi_cand)}, Marwadi={len(marwadi_cand)}, Kannada={len(kannada_cand)}, Odia={len(odia_cand)}, Gujarati={len(gujarati_cand)}")

ydl_opts = {'quiet': True, 'skip_download': True, 'extract_flat': True, 'no_warnings': True}

def resolve_candidate(item):
    title = item.get('title')
    artist = item.get('artist')
    query = item.get('query') or f"{title} {artist} official song"
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch1:{query}", download=False)
            if res and res.get('entries'):
                e = res['entries'][0]
                vid = e.get('id')
                dur = e.get('duration') or 210
                if vid and len(vid) == 11 and vid not in ['BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk']:
                    # check oembed
                    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
                    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=3.5) as resp:
                        if resp.status == 200:
                            data = json.loads(resp.read().decode())
                            return {
                                'title': title,
                                'artist': artist,
                                'year': str(item.get('year') or '2023'),
                                'durationSec': int(dur),
                                'hookStartSec': int(item.get('hookStartSec') or 45),
                                'hookEndSec': int(item.get('hookStartSec') or 45) + 40,
                                'entrySec': int(item.get('hookStartSec') or 45),
                                'exitSec': int(item.get('hookStartSec') or 45) + 40,
                                'videoId': vid,
                                'youtube_ids': [vid],
                                'playFull': False,
                                'energy': item.get('energy') or 9,
                                'yt_title': data.get('title')
                            }
    except Exception as exc:
        pass
    return None

def process_category(slug, candidates, target_count=100):
    existing = db.get(slug, {}).get('songs', [])
    seen_titles = set((s.get('title') or '').strip().lower() for s in existing)
    seen_vids = set(s.get('videoId') for s in existing)
    
    # Filter candidates not seen
    unseen = []
    for c in candidates:
        t_key = (c.get('title') or '').strip().lower()
        if t_key not in seen_titles:
            unseen.append(c)
    
    print(f"\nProcessing {slug}: existing={len(existing)}, unseen candidates={len(unseen)}")
    
    resolved = []
    t0 = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        futures = {ex.submit(resolve_candidate, c): c for c in unseen}
        for fut in concurrent.futures.as_completed(futures):
            res = fut.result()
            if res:
                v = res['videoId']
                t = res['title'].strip().lower()
                if v not in seen_vids and t not in seen_titles:
                    seen_vids.add(v)
                    seen_titles.add(t)
                    resolved.append(res)
                    if len(resolved) >= target_count:
                        break
    print(f"Resolved {len(resolved)} for {slug} in {time.time()-t0:.2f}s")
    return resolved

# Run for the 5 categories
results = {}
results['marathi-party'] = process_category('marathi-party', marathi_cand, 100)
results['kannada-hits'] = process_category('kannada-hits', kannada_cand, 100)
results['odia-hits'] = process_category('odia-hits', odia_cand, 100)
results['marwadi-rajasthani'] = process_category('marwadi-rajasthani', marwadi_cand, 100)
results['gujarati-garba'] = process_category('gujarati-garba', gujarati_cand, 100)

with open(os.path.join(ROOT, 'scripts/resolved_5_regionals.json'), 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print("\nSaved all 5 regional categories to scripts/resolved_5_regionals.json!")
