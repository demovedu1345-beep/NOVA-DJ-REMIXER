import glob, json, os

ROOT = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER"

pools_by_lang = {}

def add_song(lang, s):
    if not isinstance(s, dict): return
    vid = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
    title = (s.get('title') or '').strip()
    if not vid or len(vid) != 11 or not title: return
    if vid in ['BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk']: return
    
    if lang not in pools_by_lang:
        pools_by_lang[lang] = {}
    
    t_key = title.lower()
    if t_key not in pools_by_lang[lang] and vid not in [x.get('videoId') for x in pools_by_lang[lang].values()]:
        pools_by_lang[lang][t_key] = {
            'title': title,
            'artist': s.get('artist') or 'Unknown Artist',
            'year': str(s.get('year') or '2023'),
            'durationSec': int(s.get('durationSec') or 220),
            'hookStartSec': int(s.get('hookStartSec') or 45),
            'hookEndSec': int(s.get('hookEndSec') or 85),
            'entrySec': int(s.get('entrySec') or s.get('hookStartSec') or 45),
            'exitSec': int(s.get('exitSec') or s.get('hookEndSec') or 85),
            'videoId': vid,
            'youtube_ids': [vid],
            'playFull': False,
            'energy': s.get('energy') or 9
        }

# 1. From curated DB
with open(os.path.join(ROOT, 'api/_lib/curated-songs-db.js'), 'r', encoding='utf-8') as f:
    text = f.read()
prefix = 'export const CURATED_CATEGORIES_DB = '
db = json.loads(text[len(prefix):].rstrip().rstrip(';'))

for slug, cat in db.items():
    lang = cat.get('lang', 'hindi')
    for s in cat.get('songs', []):
        add_song(lang, s)

# 2. From all JSONs in scripts/
for root, _, files in os.walk(os.path.join(ROOT, 'scripts')):
    for f in files:
        if f.endswith('.json'):
            p = os.path.join(root, f)
            try:
                with open(p, 'r', encoding='utf-8') as fp:
                    d = json.load(fp)
                if isinstance(d, dict):
                    for k, val in d.items():
                        l = 'hindi'
                        if 'english' in k: l = 'english'
                        elif 'punjabi' in k: l = 'punjabi'
                        elif 'marathi' in k: l = 'marathi'
                        elif 'kannada' in k: l = 'kannada'
                        elif 'odia' in k: l = 'odia'
                        elif 'marwadi' in k: l = 'marwadi'
                        elif 'gujarati' in k: l = 'gujarati'
                        elif 'tamil' in k or 'telugu' in k or 'south' in k: l = 'south'
                        elif 'haryanvi' in k or 'bhojpuri' in k: l = 'haryanvi-bhojpuri'
                        
                        items = val.get('songs', []) if isinstance(val, dict) else val
                        for s in items:
                            add_song(l, s)
            except:
                pass

print("=== TOTAL UNIQUE SONGS IN HARVESTED POOLS ===")
for l, songs in sorted(pools_by_lang.items()):
    print(f"  {l:20}: {len(songs)} unique songs")
