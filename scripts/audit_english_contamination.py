import json, re

with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const CURATED_CATEGORIES_DB = '
db = json.loads(text[len(prefix):].rstrip().rstrip(';'))

hindi_indicators = [
    'arijit', 'badshah', 'shreya', 'sonu nigam', 'sunidhi', 'pritam', 'honey singh', 'divine',
    'krsna', 'kr$na', 'raftaar', 'vishal', 'darshan raval', 'b praak', 'mohit chauhan', 'atif aslam',
    'jubin nautiyal', 'kk', 'anuv jain', 'prateek kuhad', 'king', 'mc stan', 'lata mangeshkar',
    'kishore kumar', 'rafi', 'mukesh', 'asha bhosle', 'ar rahman', 'shankar mahadevan', 'amit trivedi',
    'lucky ali', 'jagjit singh', 'neha kakkar', 'mika singh', 'alka yagnik', 'udit narayan', 'kumar sanu',
    'seedhe maut', 'ikra', 'dino james', 'yashraj', 'kailash kher', 'papon', 'shaan', 'diljit', 'karan aujla',
    'ap dhillon', 'sidhu moose wala', 'sidhu', 'bhangra', 'punjabi', 'bollywood', 't-series', 'zeemusic',
    'sachet', 'parampara', 'tulsi kumar', 'guru randhawa', 'jass manak', 'maninder buttar', 'harrdy sandhu',
    'millind gaba', 'tony kakkar', 'dhvani bhanushali', 'armaan malik', 'amaal mallik', 'meet bros',
    'kanika kapoor', 'shilpa rao', 'monali thakur', 'richa sharma', 'anuradha paudwal', 'kavita krishnamurthy'
]

english_contaminated = {}

for slug, cat in db.items():
    if cat.get('lang') == 'english' or slug.startswith('english-'):
        contaminated = []
        for s in cat.get('songs', []):
            title = (s.get('title') or '').lower()
            artist = (s.get('artist') or '').lower()
            text = title + ' ' + artist
            for ind in hindi_indicators:
                if re.search(r'\b' + re.escape(ind) + r'\b', text):
                    contaminated.append((s.get('title'), s.get('artist'), s.get('videoId'), ind))
                    break
        if contaminated:
            english_contaminated[slug] = contaminated

total_eng = len([k for k in db if k.startswith('english-')])
print(f'Total English categories checked: {total_eng}')
print(f'Contaminated English categories: {len(english_contaminated)}')
total_bad_songs = 0
for slug, songs in english_contaminated.items():
    total_bad_songs += len(songs)
    print(f'  {slug}: {len(songs)} Hindi/Indian songs found!')
    for t, a, v, ind in songs[:4]:
        print(f'     - "{t}" by {a} (matched "{ind}")')

print(f'\nTOTAL CONTAMINATED SONGS IN ENGLISH CATEGORIES: {total_bad_songs}')
