import json

CANONICAL_TRACK_VIDEOS = {
    # The Weeknd
    "blinding lights": "4NRXx6U8ABQ",
    "starboy": "34Na4j8AVgA",
    "the hills": "yzTuBuRdAyA",
    "save your tears": "XXYlFuWEuKI",
    "die for you": "QLCpqdqeoII",
    "can't feel my face": "dqt8Z1k0oWQ",
    "i feel it coming": "qFLhGq0060w",
    "earned it": "waU75jdUnYw",
    "call out my name": "M4ZoCHID9GI",
    "heartless": "1DpH-icPpl0",
    "take my breath": "rhTl_OyehF8",
    "popular": "vt0i6nuqNEo",
    "dancing in the flames": "MLlSSJ0z7xM",
    "moth to a flame": "u9n7Cw-4_HQ",
    "creepin'": "61ymOWwOwuk",
    "wicked games": "O1OTWCd40bc",
    "in your eyes": "dqRZDebPIGs",
    "often": "JPIhUaONiLU",
    "timeless": "16jA-6hiSUo",

    # Bruno Mars
    "that's what i like": "PMivT7MJ41M",
    "apt.": "ekr2nIex040",
    "just the way you are": "LjhCEhWiKXk",
    "grenade": "SR6iYWJxHqs",
    "when i was your man": "ekzHIWGv82Q",
    "marry you": "8v_4O44sf4M",
    "locked out of heaven": "e-fA-gBCkj0",
    "leave the door open": "uRVZpar18hE",
    "die with a smile": "kPa7bsKwL-8",
    "it will rain": "W-w3WfgpcGg",
    "versace on the floor": "-FyjEnoIgTM",
    "24k magic": "UqyT8IEBkvY",
    "uptown funk": "OPf0YbXqDm0",
    "treasure": "nPvuNsRccVw",

    # Drake
    "hotline bling": "uxpDa-c-4Mc",
    "god's plan": "xpVfcZ0ZcFM",
    "one dance": "qL7zrWcv6XY",
    "in my feelings": "DRS_PpOrUZ4",
    "laugh now cry later": "JFm7YDVlqnI",
    "hold on, we're going home": "GxgqpCdOKak",
    "passionfruit": "48kX5aEPhx8",
    "nonstop": "7EUP13n3qkE",
    "started from the bottom": "RubBzkZzpUA",
    "best i ever had": "oTau4xsm_oA",

    # Taylor Swift
    "cruel summer": "ic8j13piAhQ",
    "blank space": "e-ORhEE9VVg",
    "shake it off": "nfWlot6h_JM",
    "anti-hero": "b1kbLwvqugk",
    "style": "-CMADIYUrs8",
    "bad blood": "QcIy9NiNbmo",
    "look what you made me do": "3tmd-ClpJxA",
    "you belong with me": "VuNIsY6JdUw",
    "love story": "8xg3vE8Ie_E",
    "lover": "-BjZmE2gtdo",
    "cardigan": "KsZ6tROaVOQ",
    "karma": "XzOvgu3GPwY",
    "fortnight": "q3zqJs7JUCQ",

    # Ed Sheeran
    "shape of you": "JGwWNGJdvx8",
    "perfect": "2Vv-BfVoq4g",
    "thinking out loud": "lp-EO5I60KA",
    "photograph": "nSDgHBxUbVQ",
    "bad habits": "orJSJGHjBLI",
    "shivers": "Il0S8BoucSA",
    "castle on the hill": "K0ibBPhiaG0",
    "galway girl": "87gWaABqGYs",
    "i don't care": "y83x7MgzWOA",
    "happier": "iWZmdoY1aTE",
    "eyes closed": "u6wOyMUs74I",

    # Arijit Singh
    "kesariya": "BddP6PYo2gs",
    "tum hi ho": "Umqb9KENgmk",
    "channa mereya": "bzSTpdcs-EI",
    "ae dil hai mushkil": "6FURuLYrR_Q",
    "apna bana le": "ElZfdU54Cp8",
    "gerua": "AEIVhBS6baE",
    "hawayein": "cYOB941gyXI",
    "agar tum saath ho": "xRb8hxwN5zc",
    "khairiyat": "hoNb6HuNmU0",
    "satranga": "HrnrqYxYrbk",
    "tum kya mile": "87JIOAX3njM",
    "raabta": "z-diRlyLGzo",
    "hamari adhuri kahani": "f3FFOBrUcHg",
    "mast magan": "V8zXLMIjlcw",
    "ilahi": "fdubeMFwuGs"
}

def update_artists_db_file(path):
    print(f"\nProcessing {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    marker = 'export const ARTISTS_DB = '
    idx = text.find(marker)
    if idx == -1:
        print(f"Marker not found in {path}")
        return

    end_marker = '\n};\n\nexport function'
    end_idx = text.find(end_marker, idx)
    raw = text[idx + len(marker):end_idx + 2].strip()
    if raw.endswith(';'):
        raw = raw[:-1].strip()
    artists_db = json.loads(raw)

    updated_count = 0
    for lang, artists in artists_db.items():
        for a_id, a in artists.items():
            for s in a.get('songs', []):
                t_lower = s.get('title', '').strip().lower()
                clean_title = t_lower.split('(')[0].split('-')[0].strip()
                match_vid = CANONICAL_TRACK_VIDEOS.get(t_lower) or CANONICAL_TRACK_VIDEOS.get(clean_title)
                if match_vid:
                    old_vid = s.get('videoId')
                    if old_vid != match_vid:
                        s['videoId'] = match_vid
                        s['youtube_ids'] = [match_vid]
                        updated_count += 1

    new_raw = json.dumps(artists_db, indent=2)
    new_text = text[:idx + len(marker)] + new_raw + text[end_idx + 2:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print(f"Updated {updated_count} tracks in {path}")

def update_curated_songs_file(path):
    print(f"\nProcessing {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()

    marker = 'export const CURATED_CATEGORIES_DB = '
    idx = text.find(marker)
    if idx == -1:
        print(f"Marker not found in {path}")
        return

    # The file ends with "};\n"
    end_idx = text.rfind('};')
    raw = text[idx + len(marker):end_idx + 1].strip()
    if raw.endswith(';'):
        raw = raw[:-1].strip()
    cat_db = json.loads(raw)

    updated_count = 0
    for cat_id, cat in cat_db.items():
        for s in cat.get('songs', []):
            t_lower = s.get('title', '').strip().lower()
            clean_title = t_lower.split('(')[0].split('-')[0].strip()
            match_vid = CANONICAL_TRACK_VIDEOS.get(t_lower) or CANONICAL_TRACK_VIDEOS.get(clean_title)
            if match_vid:
                old_vid = s.get('videoId')
                if old_vid != match_vid:
                    s['videoId'] = match_vid
                    s['youtube_ids'] = [match_vid]
                    updated_count += 1

    new_raw = json.dumps(cat_db, indent=2)
    new_text = text[:idx + len(marker)] + new_raw + ';\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print(f"Updated {updated_count} tracks in {path}")

# Run updates across all 4 files
update_artists_db_file('public/js/engine/artists-db.js')
update_artists_db_file('api/_lib/artists-db.js')
update_curated_songs_file('public/js/engine/curated-songs-db.js')
update_curated_songs_file('api/_lib/curated-songs-db.js')
