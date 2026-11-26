import json, re

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const CURATED_CATEGORIES_DB = '
db = json.loads(text[len(prefix):].rstrip().rstrip(';'))

all_english_songs = []
for slug, cat in db.items():
    if slug.startswith('english-'):
        for s in cat.get('songs', []):
            all_english_songs.append((slug, s))

print(f"Total English song entries: {len(all_english_songs)}")

indian_names = [
    'arijit', 'badshah', 'shreya', 'sonu nigam', 'sunidhi', 'pritam', 'honey singh', 'divine',
    'krsna', 'kr$na', 'raftaar', 'vishal', 'shekhar', 'darshan raval', 'b praak', 'mohit chauhan', 'atif aslam',
    'jubin nautiyal', 'kk', 'anuv jain', 'prateek kuhad', 'mc stan', 'lata mangeshkar',
    'kishore kumar', 'rafi', 'mukesh', 'asha bhosle', 'ar rahman', 'shankar mahadevan', 'amit trivedi',
    'lucky ali', 'jagjit singh', 'neha kakkar', 'mika singh', 'alka yagnik', 'udit narayan', 'kumar sanu',
    'seedhe maut', 'dino james', 'kailash kher', 'papon', 'shaan', 'diljit', 'karan aujla',
    'ap dhillon', 'sidhu moose', 'bhangra', 'punjabi', 'bollywood', 't-series', 'zeemusic',
    'sachet', 'parampara', 'tulsi kumar', 'guru randhawa', 'jass manak', 'harrdy sandhu',
    'armaan malik', 'amaal mallik', 'meet bros', 'kanika kapoor', 'shilpa rao', 'monali thakur',
    'anirudh', 'sid sriram', 'devi sri prasad', 'thaman', 'anand shinde', 'ajay-atul', 'kinjal dave',
    'geeta rabari', 'aditya gadhvi', 'humane sagar', 'khesari', 'pawan singh', 'shilpi raj'
]

flagged = []
for slug, s in all_english_songs:
    title = (s.get('title') or '').lower()
    artist = (s.get('artist') or '').lower()
    full_text = f"{title} {artist}"
    
    has_indic = bool(re.search(r'[\u0900-\u0D7F]', full_text))
    matched_kw = None
    for kw in indian_names:
        if re.search(r'\b' + re.escape(kw) + r'\b', full_text):
            matched_kw = kw
            break
    
    if has_indic or matched_kw:
        flagged.append((slug, s.get('title'), s.get('artist'), s.get('videoId'), matched_kw or "Indic script"))

print(f"Total flagged non-English songs in English categories: {len(flagged)}")
if flagged:
    for slug, t, a, v, reason in flagged[:20]:
        print(f"  [{slug}] '{t}' by '{a}' (reason: {reason})")
