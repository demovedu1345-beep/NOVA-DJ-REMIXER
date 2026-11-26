import yt_dlp
import urllib.request
import json
import time
import os
import concurrent.futures

ROOT = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER"

with open(os.path.join(ROOT, 'api/_lib/curated-songs-db.js'), 'r', encoding='utf-8') as f:
    text = f.read()
prefix = 'export const CURATED_CATEGORIES_DB = '
db = json.loads(text[len(prefix):].rstrip().rstrip(';'))

ydl_opts = {'quiet': True, 'skip_download': True, 'extract_flat': True, 'no_warnings': True}

REGIONAL_SEARCHES = {
    'marathi-party': [
        "Marathi party songs DJ remix official video",
        "latest Marathi dance hits 2024 official",
        "Marathi DJ banger songs Ajay Atul",
        "Marathi dhol tasha DJ songs official",
        "Marathi movie hit dance songs 2023 2024",
        "superhit Marathi dance party songs video"
    ],
    'kannada-hits': [
        "Kannada mass songs official video",
        "Kannada dance party hits 2024 video",
        "KGF Kantara Kannada mass hits video",
        "Kannada hero intro mass songs video",
        "latest Kannada superhit dance songs 2023 2024",
        "Kannada DJ mass songs video"
    ],
    'gujarati-garba': [
        "Gujarati garba songs non stop video",
        "latest Gujarati dandiya dance songs 2024",
        "Kinjal Dave Geeta Rabari garba hits video",
        "Aditya Gadhvi garba songs video",
        "Navratri garba DJ remix video",
        "Gujarati party dance songs official video"
    ],
    'odia-hits': [
        "Odia hit songs official video 2024",
        "Sambalpuri dance songs official video",
        "Odia party DJ songs official video",
        "Humane Sagar Odia hit songs video",
        "Odia movie dance banger songs video",
        "latest Sambalpuri hit songs video"
    ],
    'marwadi-rajasthani': [
        "Rajasthani DJ remix songs official video",
        "Marwadi folk dance party songs video",
        "Twinkal Vaishnav Rajasthani songs video",
        "Rani Rangili Rajasthani DJ songs video",
        "latest Marwadi dance songs 2024 video",
        "Rajasthani superhit party songs video"
    ]
}

def clean_title_artist(raw_title, default_artist="Audify Regional"):
    t = raw_title.replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'")
    for tag in ['Official Video', 'Full Video', 'Official Music Video', 'Video Song', 'Lyrical', 'Remix', '4K', 'HD', 'New']:
        t = t.replace(f"[{tag}]", "").replace(f"({tag})", "").replace(tag, "")
    t = t.strip(" -|:\t\n\r")
    parts = t.split(" - ")
    if len(parts) >= 2:
        return parts[1].strip(), parts[0].strip()
    parts = t.split(" | ")
    if len(parts) >= 2:
        return parts[0].strip(), parts[1].strip()
    return t, default_artist

def check_oembed(vid):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode())
                return data.get('title')
    except:
        pass
    return None

def harvest_category(slug, queries, needed=100):
    existing = db.get(slug, {}).get('songs', [])
    seen_titles = set((s.get('title') or '').strip().lower() for s in existing)
    seen_vids = set(s.get('videoId') for s in existing)
    
    harvested = []
    print(f"\n--- Harvesting for {slug} (current: {len(existing)}) ---")
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for q in queries:
            if len(harvested) >= needed: break
            try:
                res = ydl.extract_info(f"ytsearch35:{q}", download=False)
                entries = res.get('entries', []) if res else []
                for e in entries:
                    if len(harvested) >= needed: break
                    vid = e.get('id')
                    raw_title = e.get('title') or ''
                    dur = int(e.get('duration') or 210)
                    if not vid or len(vid) != 11 or vid in seen_vids: continue
                    if dur < 60 or dur > 660: continue
                    if 'shorts' in raw_title.lower() or '#shorts' in raw_title.lower(): continue
                    
                    # Verify oEmbed
                    yt_title = check_oembed(vid)
                    if not yt_title: continue
                    
                    title, artist = clean_title_artist(raw_title)
                    t_key = title.lower()
                    if t_key in seen_titles: continue
                    
                    seen_vids.add(vid)
                    seen_titles.add(t_key)
                    
                    hook_start = min(50, max(30, int(dur * 0.22)))
                    song_obj = {
                        'title': title[:70],
                        'artist': artist[:70],
                        'year': '2023',
                        'durationSec': dur,
                        'hookStartSec': hook_start,
                        'hookEndSec': hook_start + 40,
                        'entrySec': hook_start,
                        'exitSec': hook_start + 40,
                        'videoId': vid,
                        'youtube_ids': [vid],
                        'playFull': False,
                        'energy': 9
                    }
                    harvested.append(song_obj)
            except Exception as exc:
                print(f"Error querying '{q}': {exc}")
    
    print(f"Successfully harvested {len(harvested)} new bangers for {slug}")
    return harvested

regional_new = {}
for slug, q_list in REGIONAL_SEARCHES.items():
    regional_new[slug] = harvest_category(slug, q_list, 100)

with open(os.path.join(ROOT, 'scripts/harvested_100_regionals.json'), 'w', encoding='utf-8') as f:
    json.dump(regional_new, f, indent=2)

print("\nDone! Saved to scripts/harvested_100_regionals.json")
