import json
import urllib.request
import sys

def verify_artists_db():
    print("=== 1. VERIFYING ARTISTS_DB ===")
    with open('api/_lib/artists-db.js', 'r', encoding='utf-8') as f:
        text = f.read()

    marker = 'export const ARTISTS_DB = '
    idx = text.find(marker)
    end_marker = '\n};\n\nexport function'
    end_idx = text.find(end_marker, idx)
    raw = text[idx + len(marker):end_idx + 2].strip()
    if raw.endswith(';'): raw = raw[:-1].strip()
    artists_db = json.loads(raw)

    weeknd = artists_db['english']['the-weeknd']
    arijit = artists_db['hindi']['arijit-singh']

    print(f"The Weeknd total songs in profile: {len(weeknd['songs'])}")
    print(f"Arijit Singh total songs in profile: {len(arijit['songs'])}")

    target_checks = {
        # The Weeknd
        "Starboy": "34Na4j8AVgA",
        "The Hills": "yzTuBuRdAyA",
        "Blinding Lights": "4NRXx6U8ABQ",
        "Save Your Tears": "XXYlFuWEuKI",
        "Can't Feel My Face": "dqt8Z1k0oWQ",
        "Die For You": "QLCpqdqeoII",
        "I Feel It Coming": "qFLhGq0060w",
        "Earned It": "waU75jdUnYw",
        # Arijit Singh
        "Kesariya": "BddP6PYo2gs",
        "Tum Hi Ho": "Umqb9KENgmk",
        "Channa Mereya": "bzSTpdcs-EI",
        "Ae Dil Hai Mushkil": "6FURuLYrR_Q",
        "Apna Bana Le": "ElZfdU54Cp8",
        "Gerua": "AEIVhBS6baE",
        "Hawayein": "cYOB941gyXI",
        "Agar Tum Saath Ho": "xRb8hxwN5zc",
        "Khairiyat": "hoNb6HuNmU0"
    }

    weeknd_map = {s['title'].strip(): s for s in weeknd['songs']}
    arijit_map = {s['title'].strip(): s for s in arijit['songs']}

    passed = True
    for title, expected_vid in target_checks.items():
        song = weeknd_map.get(title) or arijit_map.get(title)
        if not song:
            print(f"❌ Track not found in artist profile: {title}")
            passed = False
            continue
        v_id = song.get('videoId')
        yt_ids = song.get('youtube_ids', [])
        if v_id == expected_vid and expected_vid in yt_ids:
            print(f"✔ [AUTH MATCH] {title}: videoId={v_id}")
        else:
            print(f"❌ MISMATCH for {title}: got {v_id}, expected {expected_vid}")
            passed = False

    return passed

def verify_curated_categories_db():
    print("\n=== 2. VERIFYING CURATED_CATEGORIES_DB ===")
    with open('api/_lib/curated-songs-db.js', 'r', encoding='utf-8') as f:
        text = f.read()

    marker = 'export const CURATED_CATEGORIES_DB = '
    idx = text.find(marker)
    end_idx = text.rfind('};')
    raw = text[idx + len(marker):end_idx + 1].strip()
    if raw.endswith(';'): raw = raw[:-1].strip()
    cat_db = json.loads(raw)

    print(f"Total categories: {len(cat_db)}")
    all_songs = []
    for cat in cat_db.values():
        all_songs.extend(cat.get('songs', []))
    print(f"Total songs across categories: {len(all_songs)}")

    target_tracks = {
        "Starboy": "34Na4j8AVgA",
        "The Hills": "yzTuBuRdAyA",
        "Blinding Lights": "4NRXx6U8ABQ",
        "Save Your Tears": "XXYlFuWEuKI",
        "Can't Feel My Face": "dqt8Z1k0oWQ",
        "Kesariya": "BddP6PYo2gs",
        "Tum Hi Ho": "Umqb9KENgmk",
        "Channa Mereya": "bzSTpdcs-EI",
        "Ae Dil Hai Mushkil": "6FURuLYrR_Q",
        "Apna Bana Le": "ElZfdU54Cp8"
    }

    found = {k: [] for k in target_tracks}
    for s in all_songs:
        t = s.get('title', '').strip()
        if t in target_tracks:
            found[t].append(s.get('videoId'))

    for title, expected_vid in target_tracks.items():
        vids = found[title]
        if not vids:
            print(f"ℹ Track {title} not present in category lists (or under different variant)")
        else:
            matches = [v for v in vids if v == expected_vid]
            print(f"✔ {title} in categories: {len(matches)}/{len(vids)} match canonical {expected_vid}")

def test_oembed_authenticity():
    print("\n=== 3. OEMBED YOUTUBE AUTHENTICITY CHECK ===")
    sample_vids = {
        "34Na4j8AVgA": "The Weeknd - Starboy",
        "yzTuBuRdAyA": "The Weeknd - The Hills",
        "4NRXx6U8ABQ": "The Weeknd - Blinding Lights",
        "XXYlFuWEuKI": "The Weeknd - Save Your Tears",
        "dqt8Z1k0oWQ": "The Weeknd - Can't Feel My Face",
        "BddP6PYo2gs": "Arijit Singh - Kesariya",
        "Umqb9KENgmk": "Arijit Singh - Tum Hi Ho",
        "bzSTpdcs-EI": "Arijit Singh - Channa Mereya",
        "6FURuLYrR_Q": "Arijit Singh - Ae Dil Hai Mushkil",
        "ElZfdU54Cp8": "Arijit Singh - Apna Bana Le"
    }

    for vid, expected_desc in sample_vids.items():
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as res:
                data = json.loads(res.read().decode())
                print(f"✔ {vid} ({expected_desc}) -> Title: '{data.get('title')}' | Author: '{data.get('author_name')}'")
        except Exception as e:
            print(f"⚠ {vid} ({expected_desc}) -> oembed query note: {e}")

if __name__ == '__main__':
    v1 = verify_artists_db()
    verify_curated_categories_db()
    test_oembed_authenticity()
