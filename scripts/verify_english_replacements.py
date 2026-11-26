import urllib.request
import json
import time

# Curated authentic English songs with canonical YouTube video IDs
REPLACEMENTS = {
    # Rock / Classic Rock
    "queen_bohemian": {"title": "Bohemian Rhapsody", "artist": "Queen", "year": "1975", "videoId": "fJ9rUzIMcZQ", "hookStartSec": 180, "hookEndSec": 220, "energy": 9},
    "queen_rock_you": {"title": "We Will Rock You", "artist": "Queen", "year": "1977", "videoId": "-tJYN-eG1zk", "hookStartSec": 15, "hookEndSec": 55, "energy": 9},
    "acdc_back_in_black": {"title": "Back In Black", "artist": "AC/DC", "year": "1980", "videoId": "pAgnJDJN4VA", "hookStartSec": 35, "hookEndSec": 75, "energy": 10},
    "acdc_highway": {"title": "Highway to Hell", "artist": "AC/DC", "year": "1979", "videoId": "l482T0yNkeo", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
    "bon_jovi_prayer": {"title": "Livin' On A Prayer", "artist": "Bon Jovi", "year": "1986", "videoId": "lDK9QqIzhwk", "hookStartSec": 75, "hookEndSec": 115, "energy": 9},
    "gnr_sweet_child": {"title": "Sweet Child O' Mine", "artist": "Guns N' Roses", "year": "1987", "videoId": "1w7OgIMMRc4", "hookStartSec": 85, "hookEndSec": 125, "energy": 9},
    "nirvana_teen_spirit": {"title": "Smells Like Teen Spirit", "artist": "Nirvana", "year": "1991", "videoId": "hTWKbfoikeg", "hookStartSec": 45, "hookEndSec": 85, "energy": 10},
    "linkin_in_the_end": {"title": "In The End", "artist": "Linkin Park", "year": "2000", "videoId": "eVTXPUF4Oz4", "hookStartSec": 50, "hookEndSec": 90, "energy": 9},
    "linkin_numb": {"title": "Numb", "artist": "Linkin Park", "year": "2003", "videoId": "kXYiU_JCYtU", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
    "coldplay_viva": {"title": "Viva La Vida", "artist": "Coldplay", "year": "2008", "videoId": "dvgZkm1xWPE", "hookStartSec": 40, "hookEndSec": 80, "energy": 8},
    "imagine_believer": {"title": "Believer", "artist": "Imagine Dragons", "year": "2017", "videoId": "7wtfhZwyrcc", "hookStartSec": 35, "hookEndSec": 75, "energy": 9},
    "rhcp_californication": {"title": "Californication", "artist": "Red Hot Chili Peppers", "year": "1999", "videoId": "YlUKcNNmywk", "hookStartSec": 50, "hookEndSec": 90, "energy": 8},
    
    # Metal
    "metallica_sandman": {"title": "Enter Sandman", "artist": "Metallica", "year": "1991", "videoId": "CD-E-LDc384", "hookStartSec": 60, "hookEndSec": 100, "energy": 10},
    "metallica_puppets": {"title": "Master of Puppets", "artist": "Metallica", "year": "1986", "videoId": "K6LA7v1PApU", "hookStartSec": 60, "hookEndSec": 100, "energy": 10},
    "iron_maiden_trooper": {"title": "The Trooper", "artist": "Iron Maiden", "year": "1983", "videoId": "X4bgXH3sJ2Q", "hookStartSec": 50, "hookEndSec": 90, "energy": 10},
    "black_sabbath_paranoid": {"title": "Paranoid", "artist": "Black Sabbath", "year": "1970", "videoId": "0qanF-91aJo", "hookStartSec": 20, "hookEndSec": 60, "energy": 9},
    "slipknot_duality": {"title": "Duality", "artist": "Slipknot", "year": "2004", "videoId": "6fVE8kSM43I", "hookStartSec": 45, "hookEndSec": 85, "energy": 10},

    # Dance / Club
    "calvin_one_kiss": {"title": "One Kiss", "artist": "Calvin Harris, Dua Lipa", "year": "2018", "videoId": "DkeiKbqa02g", "hookStartSec": 35, "hookEndSec": 75, "energy": 9},
    "avicii_wake_me_up": {"title": "Wake Me Up", "artist": "Avicii", "year": "2013", "videoId": "IcrbM1l_BoI", "hookStartSec": 60, "hookEndSec": 100, "energy": 9},
    "chainsmokers_closer": {"title": "Closer", "artist": "The Chainsmokers ft. Halsey", "year": "2016", "videoId": "PT2_F-1esPk", "hookStartSec": 55, "hookEndSec": 95, "energy": 8},
    "guetta_titanium": {"title": "Titanium", "artist": "David Guetta ft. Sia", "year": "2011", "videoId": "JRfuAukYTKg", "hookStartSec": 65, "hookEndSec": 105, "energy": 9},
    "dua_levitating": {"title": "Levitating", "artist": "Dua Lipa", "year": "2020", "videoId": "TUVcZfQe-Kw", "hookStartSec": 40, "hookEndSec": 80, "energy": 9},
    "dua_dont_start": {"title": "Don't Start Now", "artist": "Dua Lipa", "year": "2019", "videoId": "oygrmJFKYZY", "hookStartSec": 40, "hookEndSec": 80, "energy": 9},

    # Workout
    "eminem_lose_yourself": {"title": "Lose Yourself", "artist": "Eminem", "year": "2002", "videoId": "_Yhyp-_hX2s", "hookStartSec": 55, "hookEndSec": 95, "energy": 10},
    "survivor_eye_tiger": {"title": "Eye of the Tiger", "artist": "Survivor", "year": "1982", "videoId": "btPJPFnesV4", "hookStartSec": 40, "hookEndSec": 80, "energy": 9},
    "kanye_stronger": {"title": "Stronger", "artist": "Kanye West", "year": "2007", "videoId": "PsO6Zn4VBUA", "hookStartSec": 50, "hookEndSec": 90, "energy": 9},
    "fort_minor_remember": {"title": "Remember the Name", "artist": "Fort Minor", "year": "2005", "videoId": "VDvr08sCPOc", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},

    # Country
    "luke_fast_car": {"title": "Fast Car", "artist": "Luke Combs", "year": "2023", "videoId": "4xG9rP9g0l8", "hookStartSec": 50, "hookEndSec": 90, "energy": 7},
    "morgan_last_night": {"title": "Last Night", "artist": "Morgan Wallen", "year": "2023", "videoId": "b1_RKu-ESCY", "hookStartSec": 40, "hookEndSec": 80, "energy": 7},
    "chris_tennessee": {"title": "Tennessee Whiskey", "artist": "Chris Stapleton", "year": "2015", "videoId": "4zAThXFOy2c", "hookStartSec": 60, "hookEndSec": 100, "energy": 7},
    "dolly_jolene": {"title": "Jolene", "artist": "Dolly Parton", "year": "1973", "videoId": "Ixrje2r45W4", "hookStartSec": 15, "hookEndSec": 55, "energy": 8},
    "johnny_ring_fire": {"title": "Ring of Fire", "artist": "Johnny Cash", "year": "1963", "videoId": "1WaV2x8GXj0", "hookStartSec": 20, "hookEndSec": 60, "energy": 8},

    # Jazz
    "sinatra_fly_me": {"title": "Fly Me to the Moon", "artist": "Frank Sinatra", "year": "1964", "videoId": "ZEcqHA7dbwM", "hookStartSec": 20, "hookEndSec": 60, "energy": 6},
    "sinatra_my_way": {"title": "My Way", "artist": "Frank Sinatra", "year": "1969", "videoId": "qQzdAsjWGPg", "hookStartSec": 60, "hookEndSec": 100, "energy": 7},
    "armstrong_wonderful": {"title": "What a Wonderful World", "artist": "Louis Armstrong", "year": "1967", "videoId": "rBrd_3V73JU", "hookStartSec": 30, "hookEndSec": 70, "energy": 5},
    "simone_feeling_good": {"title": "Feeling Good", "artist": "Nina Simone", "year": "1965", "videoId": "D5Y11SGWG44", "hookStartSec": 35, "hookEndSec": 75, "energy": 7},
    "norah_dont_know": {"title": "Don't Know Why", "artist": "Norah Jones", "year": "2002", "videoId": "tO4dxvguQDk", "hookStartSec": 30, "hookEndSec": 70, "energy": 5},

    # Chill / Indie
    "billie_ocean_eyes": {"title": "ocean eyes", "artist": "Billie Eilish", "year": "2016", "videoId": "viimfQi_pUw", "hookStartSec": 40, "hookEndSec": 80, "energy": 6},
    "vance_joy_riptide": {"title": "Riptide", "artist": "Vance Joy", "year": "2013", "videoId": "uJ_1HMAGb4k", "hookStartSec": 30, "hookEndSec": 70, "energy": 7},
    "passenger_let_her_go": {"title": "Let Her Go", "artist": "Passenger", "year": "2012", "videoId": "RBumgq5yVrA", "hookStartSec": 45, "hookEndSec": 85, "energy": 6},
    "coldplay_yellow": {"title": "Yellow", "artist": "Coldplay", "year": "2000", "videoId": "yKNxeF4KMsY", "hookStartSec": 60, "hookEndSec": 100, "energy": 7},
    "arctic_monkeys_wanna_know": {"title": "Do I Wanna Know?", "artist": "Arctic Monkeys", "year": "2013", "videoId": "bpOSxM0rNPM", "hookStartSec": 50, "hookEndSec": 90, "energy": 8},

    # RnB
    "bruno_thats_what": {"title": "That's What I Like", "artist": "Bruno Mars", "year": "2016", "videoId": "PMivT7MJ41M", "hookStartSec": 45, "hookEndSec": 85, "energy": 8},
    "bruno_24k_magic": {"title": "24K Magic", "artist": "Bruno Mars", "year": "2016", "videoId": "UqyT8IEBkvY", "hookStartSec": 40, "hookEndSec": 80, "energy": 9},
    "sza_kill_bill": {"title": "Kill Bill", "artist": "SZA", "year": "2022", "videoId": "SQnc1Q3638U", "hookStartSec": 35, "hookEndSec": 75, "energy": 7},
    "sza_snooze": {"title": "Snooze", "artist": "SZA", "year": "2022", "videoId": "LDY_XReUjc8", "hookStartSec": 40, "hookEndSec": 80, "energy": 7},

    # Retro
    "mj_billie_jean": {"title": "Billie Jean", "artist": "Michael Jackson", "year": "1982", "videoId": "Zi_XLOBDo_Y", "hookStartSec": 60, "hookEndSec": 100, "energy": 9},
    "mj_beat_it": {"title": "Beat It", "artist": "Michael Jackson", "year": "1982", "videoId": "oRdxUFDoQe0", "hookStartSec": 50, "hookEndSec": 90, "energy": 9},
    "abba_dancing_queen": {"title": "Dancing Queen", "artist": "ABBA", "year": "1976", "videoId": "xFljpJd89Kw", "hookStartSec": 40, "hookEndSec": 80, "energy": 8},
    "cyndi_girls_wanna_have_fun": {"title": "Girls Just Want to Have Fun", "artist": "Cyndi Lauper", "year": "1983", "videoId": "PIb6AZdTr-A", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
    "rick_never_gonna": {"title": "Never Gonna Give You Up", "artist": "Rick Astley", "year": "1987", "videoId": "dQw4w9WgXcQ", "hookStartSec": 43, "hookEndSec": 83, "energy": 8},

    # Friendship
    "bill_withers_lean_on_me": {"title": "Lean on Me", "artist": "Bill Withers", "year": "1972", "videoId": "fOZ-MySzAac", "hookStartSec": 30, "hookEndSec": 70, "energy": 7},
    "bruno_count_on_me": {"title": "Count on Me", "artist": "Bruno Mars", "year": "2010", "videoId": "Msl2fl3h59I", "hookStartSec": 40, "hookEndSec": 80, "energy": 7},
    "queen_best_friend": {"title": "You're My Best Friend", "artist": "Queen", "year": "1975", "videoId": "HaZpZQG2zVo", "hookStartSec": 30, "hookEndSec": 70, "energy": 8},

    # Trending / Pop
    "sabrina_espresso": {"title": "Espresso", "artist": "Sabrina Carpenter", "year": "2024", "videoId": "eVli-tstM5E", "hookStartSec": 30, "hookEndSec": 70, "energy": 8},
    "chappell_good_luck": {"title": "Good Luck, Babe!", "artist": "Chappell Roan", "year": "2024", "videoId": "1RKqOmSkGgM", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
    "benson_beautiful_things": {"title": "Beautiful Things", "artist": "Benson Boone", "year": "2024", "videoId": "Oa_RSwwpPaA", "hookStartSec": 50, "hookEndSec": 90, "energy": 8},
    "teddy_swims_lose_control": {"title": "Lose Control", "artist": "Teddy Swims", "year": "2023", "videoId": "GZ3zL7kT6_c", "hookStartSec": 40, "hookEndSec": 80, "energy": 8},

    # Hip Hop
    "kendrick_humble": {"title": "HUMBLE.", "artist": "Kendrick Lamar", "year": "2017", "videoId": "tvTRZJ-4EyI", "hookStartSec": 30, "hookEndSec": 70, "energy": 9},
    "drake_gods_plan": {"title": "God's Plan", "artist": "Drake", "year": "2018", "videoId": "xpVfcZ0ZcFM", "hookStartSec": 40, "hookEndSec": 80, "energy": 8},
    "travis_sicko_mode": {"title": "SICKO MODE", "artist": "Travis Scott", "year": "2018", "videoId": "6ONRf7h3Mdk", "hookStartSec": 60, "hookEndSec": 100, "energy": 9},
    "eminem_without_me": {"title": "Without Me", "artist": "Eminem", "year": "2002", "videoId": "YVkUvmDQ3HY", "hookStartSec": 45, "hookEndSec": 85, "energy": 9},
    "post_circles": {"title": "Circles", "artist": "Post Malone", "year": "2019", "videoId": "4GFAZBKShd4", "hookStartSec": 40, "hookEndSec": 80, "energy": 8}
}

print(f"Testing {len(REPLACEMENTS)} replacement songs via YouTube oEmbed...")
valid = 0
failed = 0
for key, s in REPLACEMENTS.items():
    vid = s['videoId']
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as res:
            d = json.loads(res.read().decode('utf-8'))
            valid += 1
            print(f"OK: {s['title']} -> {d.get('title')} [{vid}]")
    except Exception as e:
        failed += 1
        print(f"FAILED: {s['title']} ({vid}) -> {e}")
    time.sleep(0.05)

print(f"\nResult: {valid} VALID, {failed} FAILED")
