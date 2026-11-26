import json
import sys

def load_artists_db(path):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    marker = 'export const ARTISTS_DB = '
    idx = text.find(marker)
    end_marker = '\n};\n\nexport function'
    end_idx = text.find(end_marker, idx)
    raw = text[idx + len(marker):end_idx + 2].strip()
    if raw.endswith(';'): raw = raw[:-1].strip()
    return json.loads(raw)

def load_curated_db(path):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    marker = 'export const CURATED_CATEGORIES_DB = '
    idx = text.find(marker)
    end_idx = text.rfind('};')
    raw = text[idx + len(marker):end_idx + 1].strip()
    if raw.endswith(';'): raw = raw[:-1].strip()
    return json.loads(raw)

def main():
    print("======================================================================")
    print("AUDIT: NOVA-DJ-REMIXER YOUTUBE METADATA & CANONICAL CATALOG")
    print("======================================================================\n")

    artists_paths = [
        'public/js/engine/artists-db.js',
        'api/_lib/artists-db.js'
    ]
    curated_paths = [
        'public/js/engine/curated-songs-db.js',
        'api/_lib/curated-songs-db.js'
    ]

    # --- 1. The Weeknd Check ---
    print(">>> POINT 1: The Weeknd's Tracks Verification")
    weeknd_expected = {
        "Starboy": "34Na4j8AVgA",
        "The Hills": "yzTuBuRdAyA",
        "Blinding Lights": "4NRXx6U8ABQ",
        "Save Your Tears": "XXYlFuWEuKI",
        "Die For You": "QLCpqdqeoII",
        "Can't Feel My Face": "dqt8Z1k0oWQ",
        "Often": "JPIhUaONiLU"
    }

    for p in artists_paths:
        db = load_artists_db(p)
        weeknd = db.get('english', {}).get('the-weeknd')
        print(f"\n[{p}] The Weeknd total tracks: {len(weeknd.get('songs', []))}")
        songs = weeknd.get('songs', [])
        
        # Check total tracks
        print(f"  All tracks present ({len(songs)}):")
        for s in songs:
            t = s.get('title')
            vid = s.get('videoId')
            yt_ids = s.get('youtube_ids', [])
            print(f"    - {t}: videoId={vid}, youtube_ids={yt_ids}")

        print(f"  Checking the 7 specifically highlighted tracks:")
        for title, exp_vid in weeknd_expected.items():
            match = next((s for s in songs if s.get('title', '').strip().lower() == title.lower()), None)
            if not match:
                print(f"    [FAIL] Track '{title}' NOT FOUND")
            else:
                act_vid = match.get('videoId')
                ok = (act_vid == exp_vid and match.get('youtube_ids') == [exp_vid])
                status = "PASS" if ok else "FAIL"
                print(f"    [{status}] '{title}' -> actual: {act_vid}, expected: {exp_vid}")

    # Check curated-songs-db for The Weeknd canonical tracks
    for p in curated_paths:
        cat_db = load_curated_db(p)
        print(f"\n[{p}] Curated DB Weeknd canonical tracks check:")
        for title, exp_vid in weeknd_expected.items():
            found_instances = []
            for cat_id, cat in cat_db.items():
                for s in cat.get('songs', []):
                    if s.get('title', '').strip().lower() == title.lower() and ('weeknd' in (s.get('artist') or '').lower()):
                        found_instances.append((cat_id, s.get('videoId'), s.get('youtube_ids')))
            print(f"  Track '{title}' found in {len(found_instances)} curated categories:")
            for cat_id, vid, yt_ids in found_instances[:3]:
                match = (vid == exp_vid)
                print(f"    cat: {cat_id} -> videoId={vid} (match={match})")

    # --- 2. Bruno Mars Check ---
    print("\n\n>>> POINT 2: Bruno Mars Tracks Verification")
    bruno_expected = {
        "That's What I Like": "PMivT7MJ41M",
        "APT.": "ekr2nIex040"
    }
    for p in artists_paths:
        db = load_artists_db(p)
        bruno = db.get('english', {}).get('bruno-mars')
        songs = bruno.get('songs', [])
        print(f"\n[{p}] Bruno Mars total tracks: {len(songs)}")
        for title, exp_vid in bruno_expected.items():
            match = next((s for s in songs if s.get('title', '').strip().lower() == title.lower() or s.get('title', '').strip().lower() == title.lower().replace('.', '')), None)
            if not match:
                print(f"    [FAIL] Track '{title}' NOT FOUND in Bruno Mars songs")
            else:
                act_vid = match.get('videoId')
                ok = (act_vid == exp_vid and match.get('youtube_ids') == [exp_vid])
                status = "PASS" if ok else "FAIL"
                print(f"    [{status}] '{match.get('title')}' -> actual: {act_vid}, expected: {exp_vid}")

    for p in curated_paths:
        cat_db = load_curated_db(p)
        print(f"\n[{p}] Curated DB Bruno Mars canonical check:")
        for title, exp_vid in bruno_expected.items():
            found_instances = []
            for cat_id, cat in cat_db.items():
                for s in cat.get('songs', []):
                    t_clean = s.get('title', '').strip().lower().replace('.', '')
                    if t_clean == title.lower().replace('.', '') and ('bruno' in (s.get('artist') or '').lower() or 'rosé' in (s.get('artist') or '').lower() or 'rose' in (s.get('artist') or '').lower()):
                        found_instances.append((cat_id, s.get('title'), s.get('videoId')))
            print(f"  Track '{title}' found in {len(found_instances)} curated categories:")
            for cat_id, t, vid in found_instances[:3]:
                match = (vid == exp_vid)
                print(f"    cat: {cat_id} -> '{t}' videoId={vid} (match={match})")

    # --- 3. Drake Check ---
    print("\n\n>>> POINT 3: Drake Tracks Verification")
    drake_expected = {
        "Hotline Bling": "uxpDa-c-4Mc",
        "God's Plan": "xpVfcZ0ZcFM"
    }
    for p in artists_paths:
        db = load_artists_db(p)
        drake = db.get('english', {}).get('drake')
        songs = drake.get('songs', [])
        print(f"\n[{p}] Drake total tracks: {len(songs)}")
        for title, exp_vid in drake_expected.items():
            match = next((s for s in songs if s.get('title', '').strip().lower() == title.lower()), None)
            if not match:
                print(f"    [FAIL] Track '{title}' NOT FOUND in Drake songs")
            else:
                act_vid = match.get('videoId')
                ok = (act_vid == exp_vid and match.get('youtube_ids') == [exp_vid])
                status = "PASS" if ok else "FAIL"
                print(f"    [{status}] '{match.get('title')}' -> actual: {act_vid}, expected: {exp_vid}")

    for p in curated_paths:
        cat_db = load_curated_db(p)
        print(f"\n[{p}] Curated DB Drake canonical check:")
        for title, exp_vid in drake_expected.items():
            found_instances = []
            for cat_id, cat in cat_db.items():
                for s in cat.get('songs', []):
                    if s.get('title', '').strip().lower() == title.lower() and ('drake' in (s.get('artist') or '').lower()):
                        found_instances.append((cat_id, s.get('title'), s.get('videoId')))
            print(f"  Track '{title}' found in {len(found_instances)} curated categories:")
            for cat_id, t, vid in found_instances[:3]:
                match = (vid == exp_vid)
                print(f"    cat: {cat_id} -> '{t}' videoId={vid} (match={match})")

    # --- 4. Arijit Singh Check ---
    print("\n\n>>> POINT 4: Arijit Singh Canonical Tracks Verification")
    arijit_expected = {
        "Tum Hi Ho": "Umqb9KENgmk",
        "Kesariya": "BddP6PYo2gs"
    }
    for p in artists_paths:
        db = load_artists_db(p)
        arijit = db.get('hindi', {}).get('arijit-singh')
        songs = arijit.get('songs', [])
        print(f"\n[{p}] Arijit Singh total tracks: {len(songs)}")
        for title, exp_vid in arijit_expected.items():
            matches = [s for s in songs if s.get('title', '').strip().lower() == title.lower()]
            if not matches:
                print(f"    [FAIL] Track '{title}' NOT FOUND in Arijit Singh songs")
            else:
                for match in matches:
                    act_vid = match.get('videoId')
                    ok = (act_vid == exp_vid and match.get('youtube_ids') == [exp_vid])
                    status = "PASS" if ok else "FAIL"
                    print(f"    [{status}] '{match.get('title')}' ({match.get('artist')}) -> actual: {act_vid}, expected: {exp_vid}")

    for p in curated_paths:
        cat_db = load_curated_db(p)
        print(f"\n[{p}] Curated DB Arijit Singh canonical check:")
        for title, exp_vid in arijit_expected.items():
            found_instances = []
            for cat_id, cat in cat_db.items():
                for s in cat.get('songs', []):
                    if s.get('title', '').strip().lower() == title.lower():
                        found_instances.append((cat_id, s.get('title'), s.get('artist'), s.get('videoId')))
            print(f"  Track '{title}' found in {len(found_instances)} curated categories:")
            for cat_id, t, a, vid in found_instances[:5]:
                match = (vid == exp_vid)
                print(f"    cat: {cat_id} -> '{t}' by '{a}' -> videoId={vid} (match={match})")

    # --- 5. api/set.js Deduplication Check ---
    print("\n\n>>> POINT 5: api/set.js Deduplication & Video ID Uniqueness Verification")
    with open('api/set.js', 'r', encoding='utf-8') as f:
        set_code = f.read()

    has_seen_videos_artist = 'seenVideos' in set_code and 'seenVideos.has(vId)' in set_code
    has_seen_videos_curated = set_code.count('seenVideos.has(vId)') >= 2
    has_seen_titles = 'seenTitles.has(titleKey)' in set_code
    has_blacklist = 'BLACKLIST_VIDS' in set_code

    print(f"  api/set.js checks:")
    print(f"    seenVideos Set utilized in artist path: {has_seen_videos_artist}")
    print(f"    seenVideos Set utilized in curated path: {has_seen_videos_curated}")
    print(f"    seenTitles Set utilized: {has_seen_titles}")
    print(f"    BLACKLIST_VIDS check: {has_blacklist}")
    
    # Check if BLACKLIST_VIDS contains BddP6PYo2gs
    if "'BddP6PYo2gs'" in set_code or '"BddP6PYo2gs"' in set_code:
        print("    [WARNING/NOTE] 'BddP6PYo2gs' (Kesariya) is present in BLACKLIST_VIDS in api/set.js!")

if __name__ == '__main__':
    main()
