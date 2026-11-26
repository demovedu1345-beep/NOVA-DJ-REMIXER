import re

extra_artists = [
    'ravi basrur', 'parthiv gohil', 'bappi lahiri', 'alisha chinai', 'vijay benedict',
    'pawan singh', 'khesari', 'daler mehndi', 'mika singh', 'alka yagnik', 'kumar sanu',
    'udit narayan', 'anuradha paudwal', 'sadhana sargam', 'sujata bhattacharya',
    'shashaa tirupati', 'ajay gogavale', 'ajay-atul', 'meet bros', 'jaz dhami',
    'hanumankind'
]

extra_titles = [
    'salaam rocky bhai', 'dholida garba rock', 'i am a disco dancer', 'dance dance',
    'mahi ve', 'the humma song', 'deva shree ganesha', 'high heels te nachche',
    'aayi nai', 'milegi milegi', 'dholida', 'ainvayi ainvayi'
]

replacement_tracks = [
    {"title": "Bohemian Rhapsody", "artist": "Queen", "year": "1975", "videoId": "fJ9rUzIMcZQ", "hookStartSec": 180, "hookEndSec": 220, "energy": 9},
    {"title": "We Will Rock You", "artist": "Queen", "year": "1977", "videoId": "-tJYN-eG1zk", "hookStartSec": 15, "hookEndSec": 55, "energy": 9},
    {"title": "Back In Black", "artist": "AC/DC", "year": "1980", "videoId": "pAgnJDJN4VA", "hookStartSec": 35, "hookEndSec": 75, "energy": 10},
    {"title": "Highway to Hell", "artist": "AC/DC", "year": "1979", "videoId": "l482T0yNkeo", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
    {"title": "Livin' On A Prayer", "artist": "Bon Jovi", "year": "1986", "videoId": "lDK9QqIzhwk", "hookStartSec": 75, "hookEndSec": 115, "energy": 9},
    {"title": "Sweet Child O' Mine", "artist": "Guns N' Roses", "year": "1987", "videoId": "1w7OgIMMRc4", "hookStartSec": 85, "hookEndSec": 125, "energy": 9},
    {"title": "Smells Like Teen Spirit", "artist": "Nirvana", "year": "1991", "videoId": "hTWKbfoikeg", "hookStartSec": 45, "hookEndSec": 85, "energy": 10},
    {"title": "In The End", "artist": "Linkin Park", "year": "2000", "videoId": "eVTXPUF4Oz4", "hookStartSec": 50, "hookEndSec": 90, "energy": 9},
    {"title": "Numb", "artist": "Linkin Park", "year": "2003", "videoId": "kXYiU_JCYtU", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
    {"title": "Viva La Vida", "artist": "Coldplay", "year": "2008", "videoId": "dvgZkm1xWPE", "hookStartSec": 40, "hookEndSec": 80, "energy": 8},
    {"title": "Believer", "artist": "Imagine Dragons", "year": "2017", "videoId": "7wtfhZwyrcc", "hookStartSec": 35, "hookEndSec": 75, "energy": 9},
    {"title": "Californication", "artist": "Red Hot Chili Peppers", "year": "1999", "videoId": "YlUKcNNmywk", "hookStartSec": 50, "hookEndSec": 90, "energy": 8}
]

def clean_file(filepath):
    print(f"Cleaning {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    english_categories = [
        "english-hiphop", "english-love", "english-breakup", "english-emotional",
        "english-trip", "english-dance", "english-workout", "english-chill",
        "english-indie", "english-pop", "english-rock", "english-rnb",
        "english-edm", "english-motivating", "english-friendship", "english-classicrock",
        "english-retro", "english-country", "english-jazz", "english-gospel",
        "english-classical", "english-metal", "english-club", "english-focus", "english-trending"
    ]

    total_rep = 0
    rep_idx = 0

    for cat in english_categories:
        m = content.find(f'"{cat}":')
        if m == -1:
            continue
        m_next = content.find('\n  "', m + 20)
        if m_next == -1:
            m_next = content.rfind('};')
        
        cat_block = content[m:m_next]

        def repl(match):
            nonlocal total_rep, rep_idx
            s = match.group(0)
            tm = re.search(r'"title":\s*"([^"]+)"', s)
            am = re.search(r'"artist":\s*"([^"]+)"', s)
            if not tm or not am:
                return s
            t = tm.group(1).lower()
            a = am.group(1).lower()

            is_bad = False
            for ea in extra_artists:
                if ea in a:
                    is_bad = True
                    break
            if not is_bad:
                for et in extra_titles:
                    if et in t:
                        is_bad = True
                        break
            
            if is_bad:
                total_rep += 1
                r = replacement_tracks[rep_idx % len(replacement_tracks)]
                rep_idx += 1
                s = re.sub(r'"title":\s*"[^"]+"', f'"title": "{r["title"]}"', s)
                s = re.sub(r'"artist":\s*"[^"]+"', f'"artist": "{r["artist"]}"', s)
                s = re.sub(r'"year":\s*"[^"]+"', f'"year": "{r["year"]}"', s)
                s = re.sub(r'"videoId":\s*"[^"]+"', f'"videoId": "{r["videoId"]}"', s)
                s = re.sub(r'"youtube_ids":\s*\[\s*"[^"]+"\s*\]', f'"youtube_ids": [\n          "{r["videoId"]}"\n        ]', s)
                s = re.sub(r'"hookStartSec":\s*\d+', f'"hookStartSec": {r["hookStartSec"]}', s)
                s = re.sub(r'"hookEndSec":\s*\d+', f'"hookEndSec": {r["hookEndSec"]}', s)
                s = re.sub(r'"entrySec":\s*\d+', f'"entrySec": {r["hookStartSec"]}', s)
                s = re.sub(r'"exitSec":\s*\d+', f'"exitSec": {r["hookEndSec"]}', s)
                s = re.sub(r'"energy":\s*\d+', f'"energy": {r["energy"]}', s)
            return s

        new_cat_block = re.sub(r'\{\s*"id":\s*"[^"]+",.*?\n      \}', repl, cat_block, flags=re.DOTALL)
        content = content[:m] + new_cat_block + content[m_next:]

    print(f"Total extra tracks replaced in {filepath}: {total_rep}")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Saved {filepath}")

clean_file('api/_lib/curated-songs-db.js')
clean_file('public/js/engine/curated-songs-db.js')
