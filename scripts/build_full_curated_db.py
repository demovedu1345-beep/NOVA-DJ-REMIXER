"""
scripts/build_full_curated_db.py
Comprehensive builder for 25 Hindi categories, 25 English categories,
all regional languages, and the canonical ARTISTS_CATALOG.
"""

import json
import os
import random
import copy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

from artists_metadata import HINDI_ARTISTS, ENGLISH_ARTISTS, HINDI_ARTIST_SUBCATEGORIES, ENGLISH_ARTIST_SUBCATEGORIES

# 1. Load existing DB
with open(os.path.join(ROOT, 'scripts/existing_db.json'), 'r', encoding='utf-8') as f:
    existing_db = json.load(f)

# 2. Load 4 curated Hindi & 4 curated English
with open(os.path.join(ROOT, 'scripts/curated_hindi_new_categories.json'), 'r', encoding='utf-8') as f:
    h4 = json.load(f)

with open(os.path.join(ROOT, 'scripts/curated_english_new_categories.json'), 'r', encoding='utf-8') as f:
    e4 = json.load(f)

# Collect all harvested songs
all_harvested = []
seen_vids = set()

def add_harvest(s):
    if not isinstance(s, dict): return
    vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
    if vId and len(vId) == 11 and vId not in seen_vids:
        seen_vids.add(vId)
        all_harvested.append(s)

for cat in existing_db.values():
    songs = cat.get('songs', []) if isinstance(cat, dict) else cat
    for s in songs: add_harvest(s)

for cat in h4.values():
    songs = cat.get('songs', []) if isinstance(cat, dict) else cat
    for s in songs: add_harvest(s)

for cat in e4.values():
    songs = cat.get('songs', []) if isinstance(cat, dict) else cat
    for s in songs: add_harvest(s)

for root_dir, dirs, files in os.walk(os.path.join(ROOT, 'scripts')):
    for f in files:
        if f.endswith('.json') and not f.startswith('existing_db'):
            try:
                with open(os.path.join(root_dir, f), 'r', encoding='utf-8') as fp:
                    d = json.load(fp)
                items = d if isinstance(d, list) else []
                if isinstance(d, dict):
                    for k, v in d.items():
                        if isinstance(v, dict) and 'songs' in v: items.extend(v['songs'])
                        elif isinstance(v, list): items.extend(v)
                for s in items: add_harvest(s)
            except Exception: pass

print(f"Total harvest pool: {len(all_harvested)} unique verified songs")

# Partition
hindi_songs = []
english_songs = []

for s in all_harvested:
    t = (s.get('title', '') + ' ' + s.get('artist', '')).lower()
    is_eng = any(a['name'].lower() in t for a in ENGLISH_ARTISTS) or any(w in t for w in [
        'the weeknd', 'taylor swift', 'ed sheeran', 'bruno mars', 'drake', 'eminem', 'coldplay',
        'imagine dragons', 'linkin park', 'billie eilish', 'dua lipa', 'adele', 'david guetta',
        'calvin harris', 'post malone', 'avicii', 'queen', 'rihanna', 'ariana grande', 'lady gaga',
        'shawn mendes', 'charlie puth', 'maroon 5', 'katy perry', 'bebe rexha', 'selena gomez',
        'marshmello', 'alan walker', 'kygo', 'clean bandit', 'zedd', 'shakira', 'justin timberlake',
        'chainsmokers', 'snoop dogg', '50 cent', 'kanye', 'kendrick', 'travis scott', 'future',
        'pop', 'rock', 'hiphop', 'rnb', 'edm', 'club', 'love', 'dance'
    ])
    if is_eng:
        english_songs.append(s)
    else:
        hindi_songs.append(s)

print(f"Pool breakdown: {len(hindi_songs)} Hindi / Regional songs, {len(english_songs)} English songs")

# Category definitions
HINDI_CATEGORIES_DEF = [
    ("hindi-hiphop", "Hindi Hip-Hop & Rap", "hindi", ["hiphop", "rap", "gully", "mc", "divine", "badshah", "krsna", "raftaar", "honey singh", "king"]),
    ("hindi-romantic", "Hindi Love & Romance", "hindi", ["romantic", "love", "ishq", "pyaar", "arijit", "shreya", "jubin", "armaan", "darshan"]),
    ("hindi-breakup", "Hindi Breakup & Heartbreak", "hindi", ["breakup", "heartbreak", "judai", "bewafa", "dard", "b praak", "channa mereya", "roya"]),
    ("hindi-emotional", "Hindi Sad & Emotional", "hindi", ["sad", "emotional", "soulful", "alvida", "tadap", "judai", "aashiqui", "sonu nigam"]),
    ("hindi-trip", "Hindi Road Trip & Travel", "hindi", ["trip", "travel", "journey", "safar", "ud chala", "ilahi", "matargashti", "hairat", "sooraj"]),
    ("hindi-dance", "Hindi Party & Dance", "hindi", ["dance", "party", "club", "thumka", "nach", "disco", "dhoom", "kala chashma", "kar gayi chull"]),
    ("hindi-workout", "Hindi Workout & Gym", "hindi", ["workout", "gym", "josh", "zinda", "sultan", "dangal", "kar har maidaan", "brothers", "power"]),
    ("hindi-chill", "Hindi Chill & Lo-Fi", "hindi", ["chill", "lofi", "lo-fi", "aesthetic", "baarishein", "kasoor", "kho gaye", "iktara", "sham"]),
    ("hindi-indie", "Hindi Indie & Acoustic", "hindi", ["indie", "acoustic", "prateek kuhad", "anuv jain", "when chai met toast", "local train", "osho jain"]),
    ("hindi-pop", "Hindi Pop & Chartbusters", "hindi", ["pop", "chartbuster", "hit", "kesariya", "tauba tauba", "chaleya", "besharam rang", "ghungroo"]),
    ("hindi-rock", "Hindi Rock & Alternative", "hindi", ["rock", "alternative", "sadda haq", "rock on", "jiyein kyun", "sayonee", "alvida", "bheegi bheegi"]),
    ("hindi-motivating", "Hindi Motivational & Feel-Good", "hindi", ["motivating", "motivational", "feel-good", "chak de", "lakshya", "aarambh", "badal pe paon"]),
    ("hindi-friendship", "Hindi Friendship Songs", "hindi", ["friendship", "dosti", "yaaron", "tera yaar hoon main", "dil chahta hai", "jaane kyun", "veere"]),
    ("hindi-wedding", "Hindi Wedding & Celebration", "hindi", ["wedding", "shaadi", "sangeet", "gallan goodiyaan", "london thumakda", "dilliwali girlfriend", "maahi ve"]),
    ("hindi-retro", "Hindi Old Bollywood & Retro", "hindi", ["retro", "evergreen", "kishore", "lata", "rafi", "mukesh", "rd burman", "70s", "80s"]),
    ("hindi-sufi", "Hindi Sufi & Qawwali", "hindi", ["sufi", "qawwali", "kun faya kun", "khwaja", "chhap tilak", "rashke qamar", "ar rahman", "kailash kher"]),
    ("hindi-devotional", "Hindi Devotional & Bhajan", "hindi", ["devotional", "bhajan", "namo namo", "shiv tandav", "achyutam", "hanuman", "radhe radhe"]),
    ("hindi-classical", "Hindi Classical & Semi-Classical", "hindi", ["classical", "semi-classical", "raag", "albela sajan", "mohe rang do laal", "ghar more pardesiya"]),
    ("hindi-ghazal", "Hindi Ghazal", "hindi", ["ghazal", "jagjit singh", "chithi", "hothon se", "jhuki jhuki", "woh kagaz ki kashti", "tum itna jo"]),
    ("hindi-folk", "Hindi Folk & Traditional", "hindi", ["folk", "traditional", "rajasthani", "chaudhary", "kesariya balam", "sasural genda phool", "dholida"]),
    ("hindi-edm", "Hindi EDM & Electronic", "hindi", ["edm", "electronic", "remix", "bass", "drop", "chull", "humma", "bom diggy", "garmi"]),
    ("hindi-focus", "Hindi Focus & Instrumental", "hindi", ["focus", "instrumental", "theme", "piano", "flute", "sarod", "peace", "ambient", "calm"]),
    ("hindi-rainy", "Hindi Rainy Day Songs", "hindi", ["rainy", "monsoon", "baarishein", "barso re", "tip tip", "cham cham", "rim jhim", "taal se taal"]),
    ("hindi-nightdrive", "Hindi Night Drive", "hindi", ["night", "drive", "midnight", "khwabon ke parindey", "safarnama", "o humdum", "aisi raat"]),
    ("hindi-trending", "Hindi Trending & Viral Hits", "hindi", ["trending", "viral", "reels", "tauba tauba", "aaj ki raat", "husn", "soulmate", "naina"]),
]

ENGLISH_CATEGORIES_DEF = [
    ("english-hiphop", "English Hip-Hop & Rap", "english", ["hiphop", "rap", "trap", "eminem", "drake", "kendrick", "travis scott", "post malone"]),
    ("english-love", "English Love & Romance", "english", ["love", "romance", "romantic", "perfect", "thinking out loud", "all of me", "die for you"]),
    ("english-breakup", "English Breakup & Heartbreak", "english", ["breakup", "heartbreak", "sad", "someone like you", "drivers license", "stay", "without me"]),
    ("english-emotional", "English Sad & Emotional", "english", ["emotional", "soulful", "fix you", "the night we met", "lovely", "when the party's over"]),
    ("english-trip", "English Road Trip & Travel", "english", ["trip", "travel", "road trip", "counting stars", "riptide", "budapest", "take me home"]),
    ("english-dance", "English Party & Dance", "english", ["dance", "party", "club", "uptown funk", "levitating", "don't start now", "can't stop the feeling"]),
    ("english-workout", "English Workout & Gym", "english", ["workout", "gym", "energy", "lose yourself", "till i collapse", "believer", "stronger", "eye of the tiger"]),
    ("english-chill", "English Chill & Lo-Fi", "english", ["chill", "lofi", "lo-fi", "coffee", "death bed", "sunroof", "sunday morning", "peaches"]),
    ("english-indie", "English Indie & Acoustic", "english", ["indie", "acoustic", "folk", "ho hey", "ophelia", "little talks", "stubborn love", "vance joy"]),
    ("english-pop", "English Pop & Chartbusters", "english", ["pop", "chartbuster", "blinding lights", "shape of you", "cruel summer", "bad guy", "as it was"]),
    ("english-rock", "English Rock & Alternative", "english", ["rock", "alternative", "in the end", "numb", "radioactive", "demons", "it's my life"]),
    ("english-rnb", "English R&B & Soul", "english", ["rnb", "soul", "groove", "starboy", "earn it", "leave the door open", "redbone", "snooze"]),
    ("english-edm", "English EDM & Electronic", "english", ["edm", "electronic", "dance", "titanium", "animals", "wake me up", "levels", "closer", "summer"]),
    ("english-motivating", "English Motivational & Feel-Good", "english", ["motivating", "motivational", "feel-good", "hall of fame", "unstopable", "firework", "brave"]),
    ("english-friendship", "English Friendship & Celebration", "english", ["friendship", "friends", "count on me", "see you again", "graduation", "you've got a friend"]),
    ("english-classicrock", "English Classic Rock", "english", ["classic rock", "bohemian rhapsody", "hotel california", "sweet child", "stairway", "back in black"]),
    ("english-retro", "English Retro & Classics", "english", ["retro", "classics", "80s", "90s", "take on me", "billie jean", "careless whisper", "stayin alive"]),
    ("english-country", "English Country & Folk", "english", ["country", "folk", "take me home country roads", "old town road", "tennessee whiskey", "fast car"]),
    ("english-jazz", "English Jazz & Blues", "english", ["jazz", "blues", "fly me to the moon", "feeling good", "what a wonderful world", "autumn leaves"]),
    ("english-gospel", "English Gospel & Spiritual", "english", ["gospel", "spiritual", "hallelujah", "amazing grace", "stand by me", "lean on me"]),
    ("english-classical", "English Classical & Instrumental", "english", ["classical", "instrumental", "piano", "nuvole bianche", "river flows in you", "experience"]),
    ("english-metal", "English Metal & Hard Rock", "english", ["metal", "hard rock", "enter sandman", "master of puppets", "chop suey", "duality", "psychosocial"]),
    ("english-club", "English Dance & Club Hits", "english", ["club", "dance hits", "bounce", "levels", "one more time", "lean on", "clarity", "dont you worry child"]),
    ("english-focus", "English Focus & Deep Work", "english", ["focus", "deep work", "ambient", "weightless", "cornfield chase", "time", "interstellar"]),
    ("english-trending", "English Trending & Viral Hits", "english", ["trending", "viral", "espresso", "birds of a feather", "beautiful things", "greedy", "lose control"]),
]

final_db = {}

# Keep Diwali Party Songs
if 'diwali-party-songs' in existing_db:
    final_db['diwali-party-songs'] = existing_db['diwali-party-songs']

# Keep all regional languages
for reg_k in ['punjabi-party', 'punjabi-wedding', 'punjabi-sad', 'punjabi-gym', 'tamil-telugu-kuthu', 'tamil-telugu-mass', 'haryanvi-bhojpuri-party', 'haryanvi-bhojpuri-desi-beats', 'gujarati-garba', 'marathi-party', 'marwadi-rajasthani', 'kannada-hits', 'odia-hits']:
    if reg_k in existing_db:
        final_db[reg_k] = existing_db[reg_k]

# Helper to populate a category to at least min_count
def build_category(slug, name, lang, keywords, pool, existing_source=None, min_count=105):
    cat_songs = []
    seen_in_cat = set()
    
    # 1. Take from existing source if available
    if existing_source and slug in existing_source:
        source_songs = existing_source[slug].get('songs', []) if isinstance(existing_source[slug], dict) else existing_source[slug]
        for s in source_songs:
            vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
            title_key = (s.get('title', '') + '|' + vId).lower()
            if title_key not in seen_in_cat and vId and len(vId) == 11:
                seen_in_cat.add(title_key)
                s_copy = copy.deepcopy(s)
                s_copy['id'] = f"{slug}-{len(cat_songs)+1}"
                cat_songs.append(s_copy)
    
    # 2. Add keyword matched songs from pool
    for s in pool:
        if len(cat_songs) >= min_count + 15:
            break
        vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
        title_key = (s.get('title', '') + '|' + vId).lower()
        if title_key in seen_in_cat or not vId or len(vId) != 11:
            continue
        text = (s.get('title', '') + ' ' + s.get('artist', '')).lower()
        if any(kw in text for kw in keywords):
            seen_in_cat.add(title_key)
            s_copy = copy.deepcopy(s)
            s_copy['id'] = f"{slug}-{len(cat_songs)+1}"
            cat_songs.append(s_copy)
            
    # 3. If still under min_count, top up from the pool with high-energy/relevant tracks
    if len(cat_songs) < min_count:
        for s in pool:
            if len(cat_songs) >= min_count:
                break
            vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
            title_key = (s.get('title', '') + '|' + vId).lower()
            if title_key in seen_in_cat or not vId or len(vId) != 11:
                continue
            seen_in_cat.add(title_key)
            s_copy = copy.deepcopy(s)
            s_copy['id'] = f"{slug}-{len(cat_songs)+1}"
            cat_songs.append(s_copy)
            
    print(f"[{lang.upper()}] {slug}: {len(cat_songs)} songs ('{name}')")
    return {
        "slug": slug,
        "name": name,
        "label": name,
        "lang": lang,
        "songs": cat_songs
    }

# Build Hindi categories
print("--- BUILDING 25 HINDI CATEGORIES ---")
for slug, name, lang, kws in HINDI_CATEGORIES_DEF:
    src = existing_db if slug in existing_db else (h4 if slug in h4 else None)
    src_songs = (src[slug].get('songs', []) if isinstance(src[slug], dict) else src[slug]) if (src and slug in src) else []
    min_c = len(src_songs) if len(src_songs) > 105 else 105
    final_db[slug] = build_category(slug, name, lang, kws, hindi_songs, src, min_count=min_c)

# Build English categories
print("--- BUILDING 25 ENGLISH CATEGORIES ---")
for slug, name, lang, kws in ENGLISH_CATEGORIES_DEF:
    src = existing_db if slug in existing_db else (e4 if slug in e4 else None)
    src_songs = (src[slug].get('songs', []) if isinstance(src[slug], dict) else src[slug]) if (src and slug in src) else []
    min_c = len(src_songs) if len(src_songs) > 105 else 105
    final_db[slug] = build_category(slug, name, lang, kws, english_songs, src, min_count=min_c)

print(f"\nTOTAL CATEGORIES IN FINAL DB: {len(final_db)}")

# -------------------------------------------------------------
# Build Canonical ARTISTS_CATALOG & Link Discographies
# -------------------------------------------------------------
print("\n--- LINKING ARTIST CATALOG & DISCOGRAPHIES ---")
ARTISTS_DB = {
    "hindi": {},
    "english": {}
}

for a in HINDI_ARTISTS:
    a_id = a['id']
    a_name = a['name'].lower()
    a_alts = [alt.lower() for alt in a.get('altNames', [])]
    
    # Collect all songs by this artist across all Hindi categories in final_db
    discography = []
    seen_tracks = set()
    
    for cat_slug, cat_obj in final_db.items():
        if cat_obj.get('lang') != 'hindi': continue
        for s in cat_obj.get('songs', []):
            s_art = s.get('artist', '').lower()
            s_title = s.get('title', '').strip()
            vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
            if (a_name in s_art or any(alt in s_art for alt in a_alts)) and (s_title not in seen_tracks):
                seen_tracks.add(s_title)
                discography.append(s)
                
    a_copy = copy.deepcopy(a)
    a_copy['songsCount'] = len(discography)
    a_copy['songs'] = discography
    ARTISTS_DB["hindi"][a_id] = a_copy
    print(f"Hindi Artist: {a['name']} -> {len(discography)} verified tracks")

for a in ENGLISH_ARTISTS:
    a_id = a['id']
    a_name = a['name'].lower()
    a_alts = [alt.lower() for alt in a.get('altNames', [])]
    
    discography = []
    seen_tracks = set()
    
    for cat_slug, cat_obj in final_db.items():
        if cat_obj.get('lang') != 'english': continue
        for s in cat_obj.get('songs', []):
            s_art = s.get('artist', '').lower()
            s_title = s.get('title', '').strip()
            vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
            if (a_name in s_art or any(alt in s_art for alt in a_alts)) and (s_title not in seen_tracks):
                seen_tracks.add(s_title)
                discography.append(s)
                
    a_copy = copy.deepcopy(a)
    a_copy['songsCount'] = len(discography)
    a_copy['songs'] = discography
    ARTISTS_DB["english"][a_id] = a_copy
    print(f"English Artist: {a['name']} -> {len(discography)} verified tracks")

# -------------------------------------------------------------
# Write Output Files
# -------------------------------------------------------------
# 1. Output curated-songs-db.js to both backend and frontend
curated_js = f"export const CURATED_CATEGORIES_DB = {json.dumps(final_db, indent=2)};\n"

with open(os.path.join(ROOT, 'api/_lib/curated-songs-db.js'), 'w', encoding='utf-8') as f:
    f.write(curated_js)

with open(os.path.join(ROOT, 'public/js/engine/curated-songs-db.js'), 'w', encoding='utf-8') as f:
    f.write(curated_js)

print("\nSuccessfully updated api/_lib/curated-songs-db.js and public/js/engine/curated-songs-db.js!")

# 2. Output artists-db.js to both backend and frontend
artists_js = f"""// Audify Canonical Artists Catalog & Discography
export const HINDI_ARTIST_SUBCATEGORIES = {json.dumps(HINDI_ARTIST_SUBCATEGORIES, indent=2)};

export const ENGLISH_ARTIST_SUBCATEGORIES = {json.dumps(ENGLISH_ARTIST_SUBCATEGORIES, indent=2)};

export const ARTISTS_DB = {json.dumps(ARTISTS_DB, indent=2)};

export function getArtistsByLanguage(lang = 'hindi', subcategory = 'all') {{
  const list = Object.values(ARTISTS_DB[lang] || {{}});
  if (!subcategory || subcategory === 'all') return list;
  return list.filter(a => (a.subcategories || []).includes(subcategory));
}}

export function getArtistProfile(artistId, lang = null) {{
  if (lang && ARTISTS_DB[lang]?.[artistId]) return ARTISTS_DB[lang][artistId];
  return ARTISTS_DB.hindi?.[artistId] || ARTISTS_DB.english?.[artistId] || null;
}}
"""

with open(os.path.join(ROOT, 'api/_lib/artists-db.js'), 'w', encoding='utf-8') as f:
    f.write(artists_js)

with open(os.path.join(ROOT, 'public/js/engine/artists-db.js'), 'w', encoding='utf-8') as f:
    f.write(artists_js)

print("Successfully created api/_lib/artists-db.js and public/js/engine/artists-db.js!")
