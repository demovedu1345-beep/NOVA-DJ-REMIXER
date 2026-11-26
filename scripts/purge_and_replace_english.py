import re
import json

VERIFIED_POOLS = {
    "rock": [
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
        {"title": "Californication", "artist": "Red Hot Chili Peppers", "year": "1999", "videoId": "YlUKcNNmywk", "hookStartSec": 50, "hookEndSec": 90, "energy": 8},
        {"title": "Yellow", "artist": "Coldplay", "year": "2000", "videoId": "yKNxeF4KMsY", "hookStartSec": 60, "hookEndSec": 100, "energy": 7},
        {"title": "Do I Wanna Know?", "artist": "Arctic Monkeys", "year": "2013", "videoId": "bpOSxM0rNPM", "hookStartSec": 50, "hookEndSec": 90, "energy": 8}
    ],
    "metal": [
        {"title": "Enter Sandman", "artist": "Metallica", "year": "1991", "videoId": "CD-E-LDc384", "hookStartSec": 60, "hookEndSec": 100, "energy": 10},
        {"title": "Master of Puppets", "artist": "Metallica", "year": "1986", "videoId": "K6LA7v1PApU", "hookStartSec": 60, "hookEndSec": 100, "energy": 10},
        {"title": "The Trooper", "artist": "Iron Maiden", "year": "1983", "videoId": "X4bgXH3sJ2Q", "hookStartSec": 50, "hookEndSec": 90, "energy": 10},
        {"title": "Paranoid", "artist": "Black Sabbath", "year": "1970", "videoId": "0qanF-91aJo", "hookStartSec": 20, "hookEndSec": 60, "energy": 9},
        {"title": "Duality", "artist": "Slipknot", "year": "2004", "videoId": "6fVE8kSM43I", "hookStartSec": 45, "hookEndSec": 85, "energy": 10},
        {"title": "In The End", "artist": "Linkin Park", "year": "2000", "videoId": "eVTXPUF4Oz4", "hookStartSec": 50, "hookEndSec": 90, "energy": 9},
        {"title": "Numb", "artist": "Linkin Park", "year": "2003", "videoId": "kXYiU_JCYtU", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
        {"title": "Back In Black", "artist": "AC/DC", "year": "1980", "videoId": "pAgnJDJN4VA", "hookStartSec": 35, "hookEndSec": 75, "energy": 10},
        {"title": "Highway to Hell", "artist": "AC/DC", "year": "1979", "videoId": "l482T0yNkeo", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
        {"title": "Smells Like Teen Spirit", "artist": "Nirvana", "year": "1991", "videoId": "hTWKbfoikeg", "hookStartSec": 45, "hookEndSec": 85, "energy": 10}
    ],
    "dance": [
        {"title": "One Kiss", "artist": "Calvin Harris, Dua Lipa", "year": "2018", "videoId": "DkeiKbqa02g", "hookStartSec": 35, "hookEndSec": 75, "energy": 9},
        {"title": "Wake Me Up", "artist": "Avicii", "year": "2013", "videoId": "IcrbM1l_BoI", "hookStartSec": 60, "hookEndSec": 100, "energy": 9},
        {"title": "Closer", "artist": "The Chainsmokers ft. Halsey", "year": "2016", "videoId": "PT2_F-1esPk", "hookStartSec": 55, "hookEndSec": 95, "energy": 8},
        {"title": "Titanium", "artist": "David Guetta ft. Sia", "year": "2011", "videoId": "JRfuAukYTKg", "hookStartSec": 65, "hookEndSec": 105, "energy": 9},
        {"title": "Levitating", "artist": "Dua Lipa", "year": "2020", "videoId": "TUVcZfQe-Kw", "hookStartSec": 40, "hookEndSec": 80, "energy": 9},
        {"title": "Don't Start Now", "artist": "Dua Lipa", "year": "2019", "videoId": "oygrmJFKYZY", "hookStartSec": 40, "hookEndSec": 80, "energy": 9},
        {"title": "24K Magic", "artist": "Bruno Mars", "year": "2016", "videoId": "UqyT8IEBkvY", "hookStartSec": 40, "hookEndSec": 80, "energy": 9},
        {"title": "Billie Jean", "artist": "Michael Jackson", "year": "1982", "videoId": "Zi_XLOBDo_Y", "hookStartSec": 60, "hookEndSec": 100, "energy": 9},
        {"title": "Beat It", "artist": "Michael Jackson", "year": "1982", "videoId": "oRdxUFDoQe0", "hookStartSec": 50, "hookEndSec": 90, "energy": 9},
        {"title": "Girls Just Want to Have Fun", "artist": "Cyndi Lauper", "year": "1983", "videoId": "PIb6AZdTr-A", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
        {"title": "Never Gonna Give You Up", "artist": "Rick Astley", "year": "1987", "videoId": "dQw4w9WgXcQ", "hookStartSec": 43, "hookEndSec": 83, "energy": 8},
        {"title": "Espresso", "artist": "Sabrina Carpenter", "year": "2024", "videoId": "eVli-tstM5E", "hookStartSec": 30, "hookEndSec": 70, "energy": 8},
        {"title": "Good Luck, Babe!", "artist": "Chappell Roan", "year": "2024", "videoId": "1RKqOmSkGgM", "hookStartSec": 45, "hookEndSec": 85, "energy": 9}
    ],
    "chill": [
        {"title": "ocean eyes", "artist": "Billie Eilish", "year": "2016", "videoId": "viimfQi_pUw", "hookStartSec": 40, "hookEndSec": 80, "energy": 6},
        {"title": "Riptide", "artist": "Vance Joy", "year": "2013", "videoId": "uJ_1HMAGb4k", "hookStartSec": 30, "hookEndSec": 70, "energy": 7},
        {"title": "Let Her Go", "artist": "Passenger", "year": "2012", "videoId": "RBumgq5yVrA", "hookStartSec": 45, "hookEndSec": 85, "energy": 6},
        {"title": "Yellow", "artist": "Coldplay", "year": "2000", "videoId": "yKNxeF4KMsY", "hookStartSec": 60, "hookEndSec": 100, "energy": 7},
        {"title": "Viva La Vida", "artist": "Coldplay", "year": "2008", "videoId": "dvgZkm1xWPE", "hookStartSec": 40, "hookEndSec": 80, "energy": 8},
        {"title": "Don't Know Why", "artist": "Norah Jones", "year": "2002", "videoId": "tO4dxvguQDk", "hookStartSec": 30, "hookEndSec": 70, "energy": 5},
        {"title": "Circles", "artist": "Post Malone", "year": "2019", "videoId": "wXhTHyIgQ_U", "hookStartSec": 40, "hookEndSec": 80, "energy": 8},
        {"title": "Fly Me to the Moon", "artist": "Frank Sinatra", "year": "1964", "videoId": "ZEcqHA7dbwM", "hookStartSec": 20, "hookEndSec": 60, "energy": 6},
        {"title": "What A Wonderful World", "artist": "Louis Armstrong", "year": "1967", "videoId": "A3yCcXgbKrE", "hookStartSec": 30, "hookEndSec": 70, "energy": 5},
        {"title": "Lean on Me", "artist": "Bill Withers", "year": "1972", "videoId": "fOZ-MySzAac", "hookStartSec": 30, "hookEndSec": 70, "energy": 7}
    ],
    "country": [
        {"title": "Tennessee Whiskey", "artist": "Chris Stapleton", "year": "2015", "videoId": "4zAThXFOy2c", "hookStartSec": 60, "hookEndSec": 100, "energy": 7},
        {"title": "Ring of Fire", "artist": "Johnny Cash", "year": "1963", "videoId": "1WaV2x8GXj0", "hookStartSec": 20, "hookEndSec": 60, "energy": 8},
        {"title": "Jolene", "artist": "Dolly Parton", "year": "1973", "videoId": "L0eeSoU35wM", "hookStartSec": 15, "hookEndSec": 55, "energy": 8},
        {"title": "Riptide", "artist": "Vance Joy", "year": "2013", "videoId": "uJ_1HMAGb4k", "hookStartSec": 30, "hookEndSec": 70, "energy": 7},
        {"title": "Let Her Go", "artist": "Passenger", "year": "2012", "videoId": "RBumgq5yVrA", "hookStartSec": 45, "hookEndSec": 85, "energy": 6},
        {"title": "Lean on Me", "artist": "Bill Withers", "year": "1972", "videoId": "fOZ-MySzAac", "hookStartSec": 30, "hookEndSec": 70, "energy": 7},
        {"title": "Yellow", "artist": "Coldplay", "year": "2000", "videoId": "yKNxeF4KMsY", "hookStartSec": 60, "hookEndSec": 100, "energy": 7}
    ],
    "jazz": [
        {"title": "Fly Me to the Moon", "artist": "Frank Sinatra", "year": "1964", "videoId": "ZEcqHA7dbwM", "hookStartSec": 20, "hookEndSec": 60, "energy": 6},
        {"title": "My Way", "artist": "Frank Sinatra", "year": "1969", "videoId": "qQzdAsjWGPg", "hookStartSec": 60, "hookEndSec": 100, "energy": 7},
        {"title": "What A Wonderful World", "artist": "Louis Armstrong", "year": "1967", "videoId": "A3yCcXgbKrE", "hookStartSec": 30, "hookEndSec": 70, "energy": 5},
        {"title": "Don't Know Why", "artist": "Norah Jones", "year": "2002", "videoId": "tO4dxvguQDk", "hookStartSec": 30, "hookEndSec": 70, "energy": 5},
        {"title": "ocean eyes", "artist": "Billie Eilish", "year": "2016", "videoId": "viimfQi_pUw", "hookStartSec": 40, "hookEndSec": 80, "energy": 6},
        {"title": "Lean on Me", "artist": "Bill Withers", "year": "1972", "videoId": "fOZ-MySzAac", "hookStartSec": 30, "hookEndSec": 70, "energy": 7}
    ],
    "hiphop": [
        {"title": "HUMBLE.", "artist": "Kendrick Lamar", "year": "2017", "videoId": "tvTRZJ-4EyI", "hookStartSec": 30, "hookEndSec": 70, "energy": 9},
        {"title": "God's Plan", "artist": "Drake", "year": "2018", "videoId": "xpVfcZ0ZcFM", "hookStartSec": 40, "hookEndSec": 80, "energy": 8},
        {"title": "SICKO MODE", "artist": "Travis Scott", "year": "2018", "videoId": "6ONRf7h3Mdk", "hookStartSec": 60, "hookEndSec": 100, "energy": 9},
        {"title": "Without Me", "artist": "Eminem", "year": "2002", "videoId": "YVkUvmDQ3HY", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
        {"title": "Lose Yourself", "artist": "Eminem", "year": "2002", "videoId": "_Yhyp-_hX2s", "hookStartSec": 55, "hookEndSec": 95, "energy": 10},
        {"title": "Remember the Name", "artist": "Fort Minor", "year": "2005", "videoId": "VDvr08sCPOc", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
        {"title": "Circles", "artist": "Post Malone", "year": "2019", "videoId": "wXhTHyIgQ_U", "hookStartSec": 40, "hookEndSec": 80, "energy": 8}
    ]
}

def get_pool_for_category(cat):
    if 'rock' in cat or 'classicrock' in cat:
        return VERIFIED_POOLS['rock']
    if 'metal' in cat:
        return VERIFIED_POOLS['metal']
    if 'dance' in cat or 'club' in cat or 'edm' in cat:
        return VERIFIED_POOLS['dance']
    if 'workout' in cat:
        return VERIFIED_POOLS['hiphop'] + VERIFIED_POOLS['rock']
    if 'country' in cat:
        return VERIFIED_POOLS['country']
    if 'jazz' in cat or 'classical' in cat or 'focus' in cat:
        return VERIFIED_POOLS['jazz']
    if 'hiphop' in cat:
        return VERIFIED_POOLS['hiphop']
    if 'retro' in cat or 'friendship' in cat:
        return VERIFIED_POOLS['dance'] + VERIFIED_POOLS['rock']
    return VERIFIED_POOLS['chill'] + VERIFIED_POOLS['dance']

indian_artist_indicators = [
    'arijit', 'badshah', 'neha kakkar', 'diljit', 'sidhu', 'shreya ghoshal',
    'honey singh', 'atif aslam', 'sunidhi', 'sonu nigam', 'kumar sanu',
    'pritam', 'vishal-shekhar', 'mika singh', 'kanika kapoor', 'guru randhawa',
    'shankar mahadevan', 'shankar-ehsaan-loy', 'dr zeus', 'raju punjabi',
    'vishal dadlani', 'hamsika iyer', 'shekhar ravjiani', 'salim merchant',
    'neeti mohan', 'anirudh', 'hiphop tamizha', 'jubin nautiyal', 'alka yagnik',
    'udit narayan', 'armaan malik', 'amaal mallik', 'himesh reshammiya',
    'mohit chauhan', 'darshan raval', 'b praak', 'jaani', 'hardy sandhu',
    'jass manak', 'karan aujla', 'amrit maan', 'sharry mann', 'parmish verma',
    'babbu maan', 'gurdas maan', 'sukhe', 'tony kakkar', 'dhvani bhanushali',
    'tanishk bagchi', 'shubh', 'sachet tandon', 'parampara', 'jasleen royal', 'prateek kuhad'
]

indian_title_indicators = [
    'lungi dance', 'dance pe chance', 'rock \'n\' roll soniye', 'love dose',
    'lover', 'fair & lovely', 'dance ka bhoot', '1 2 3 4 get on the dance floor',
    'ethir neechal adi', 'morattu single', 'vaadi pulla vaadi', 'ishq wala love',
    'tum hi ho', 'kesariya', 'apna bana le', 'ghungroo', 'nashe si chadh gayi',
    'raataan lambiyan', 'jai jai shivshankar', 'badtameez dil', 'dilliwaali girlfriend',
    'gallan goodiyaan', 'malhari', 'zingaat', 'aankh marey', 'subha hone na de',
    'high rated gabru', 'lahore', 'proper patola', 'bom diggy', 'dilbar',
    'kamariya', 'garmi', 'sauda khara khara', 'makhna', 'saaki saaki', 'hookah bar',
    'chammak challo', 'desi boyz', 'kar gayi chull', 'kala chashma', 'drama queen',
    'ghoomar royal dance'
]

def is_bad_in_english(title, artist):
    t = title.lower()
    a = artist.lower()
    if 'billie eilish' in a or 'khalid' in a:
        return False
    if 'eminem' in a or 'taylor swift' in a:
        return False
    if 'adele' in a:
        return False
    for ind in indian_artist_indicators:
        if ind in a:
            return True
    for ind in indian_title_indicators:
        if ind in t:
            return True
    return False

def process_file(filepath):
    print(f"\nProcessing {filepath}...")
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

    total_replaced = 0

    for cat in english_categories:
        m = content.find(f'"{cat}":')
        if m == -1:
            continue
        
        # Determine category boundaries
        # find the start of the next category
        m_next = content.find('\n  "', m + 20)
        if m_next == -1:
            m_next = content.rfind('};')
        
        cat_block = content[m:m_next]
        pool = get_pool_for_category(cat)
        pool_idx = 0

        # Pattern to find each song object block
        # Look for { "id": "...", ... }
        def replace_song(match):
            nonlocal pool_idx, total_replaced
            song_str = match.group(0)
            
            # Extract title & artist
            tm = re.search(r'"title":\s*"([^"]+)"', song_str)
            am = re.search(r'"artist":\s*"([^"]+)"', song_str)
            if not tm or not am:
                return song_str
            
            title = tm.group(1)
            artist = am.group(1)
            
            if is_bad_in_english(title, artist):
                # Pick next from pool
                rep = pool[pool_idx % len(pool)]
                pool_idx += 1
                total_replaced += 1
                
                # Replace fields in song_str
                # Keep original id
                s_mod = song_str
                s_mod = re.sub(r'"title":\s*"[^"]+"', f'"title": "{rep["title"]}"', s_mod)
                s_mod = re.sub(r'"artist":\s*"[^"]+"', f'"artist": "{rep["artist"]}"', s_mod)
                s_mod = re.sub(r'"year":\s*"[^"]+"', f'"year": "{rep["year"]}"', s_mod)
                s_mod = re.sub(r'"videoId":\s*"[^"]+"', f'"videoId": "{rep["videoId"]}"', s_mod)
                s_mod = re.sub(r'"youtube_ids":\s*\[\s*"[^"]+"\s*\]', f'"youtube_ids": [\n          "{rep["videoId"]}"\n        ]', s_mod)
                s_mod = re.sub(r'"hookStartSec":\s*\d+', f'"hookStartSec": {rep["hookStartSec"]}', s_mod)
                s_mod = re.sub(r'"hookEndSec":\s*\d+', f'"hookEndSec": {rep["hookEndSec"]}', s_mod)
                s_mod = re.sub(r'"entrySec":\s*\d+', f'"entrySec": {rep["hookStartSec"]}', s_mod)
                s_mod = re.sub(r'"exitSec":\s*\d+', f'"exitSec": {rep["hookEndSec"]}', s_mod)
                s_mod = re.sub(r'"energy":\s*\d+', f'"energy": {rep["energy"]}', s_mod)
                return s_mod
            return song_str

        # Replace songs inside cat_block
        # Song objects start with {\n        "id": and end before next {\n        "id": or \n    ]
        new_cat_block = re.sub(r'\{\s*"id":\s*"[^"]+",.*?\n      \}', replace_song, cat_block, flags=re.DOTALL)
        
        # Put back into content
        content = content[:m] + new_cat_block + content[m_next:]

    print(f"Total tracks replaced in {filepath}: {total_replaced}")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully saved {filepath}")

process_file('api/_lib/curated-songs-db.js')
process_file('public/js/engine/curated-songs-db.js')
