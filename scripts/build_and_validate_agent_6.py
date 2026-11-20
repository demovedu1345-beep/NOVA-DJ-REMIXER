import json
import os
import urllib.request
import concurrent.futures
import time

# 60 English Pop Songs
POP_SONGS = [
    {"title": "Blinding Lights", "artist": "The Weeknd", "year": "2019", "hookStartSec": 56, "energy": 10, "durationSec": 263, "videoId": "4NRXx6U8ABQ"},
    {"title": "Starboy", "artist": "The Weeknd ft. Daft Punk", "year": "2016", "hookStartSec": 55, "energy": 9, "durationSec": 273, "videoId": "34Na4j8AVgA"},
    {"title": "Cruel Summer", "artist": "Taylor Swift", "year": "2019", "hookStartSec": 45, "energy": 9, "durationSec": 178, "videoId": "ic8j13piAhQ"},
    {"title": "Shake It Off", "artist": "Taylor Swift", "year": "2014", "hookStartSec": 39, "energy": 10, "durationSec": 242, "videoId": "nfWlot6h_JM"},
    {"title": "Blank Space", "artist": "Taylor Swift", "year": "2014", "hookStartSec": 37, "energy": 9, "durationSec": 272, "videoId": "e-ORhEE9VVg"},
    {"title": "Levitating", "artist": "Dua Lipa", "year": "2020", "hookStartSec": 46, "energy": 10, "durationSec": 204, "videoId": "TUVcZfQe-Kw"},
    {"title": "Don't Start Now", "artist": "Dua Lipa", "year": "2019", "hookStartSec": 31, "energy": 9, "durationSec": 182, "videoId": "oygrmJFKYZY"},
    {"title": "24K Magic", "artist": "Bruno Mars", "year": "2016", "hookStartSec": 58, "energy": 10, "durationSec": 226, "videoId": "UqyT8IEBkvY"},
    {"title": "Uptown Funk", "artist": "Mark Ronson ft. Bruno Mars", "year": "2014", "hookStartSec": 50, "energy": 10, "durationSec": 270, "videoId": "OPf0YbXqDm0"},
    {"title": "Shape of You", "artist": "Ed Sheeran", "year": "2017", "hookStartSec": 35, "energy": 9, "durationSec": 263, "videoId": "JGwWNGJdvx8"},
    {"title": "Bad Habits", "artist": "Ed Sheeran", "year": "2021", "hookStartSec": 38, "energy": 9, "durationSec": 239, "videoId": "orJSJGHjBLI"},
    {"title": "7 rings", "artist": "Ariana Grande", "year": "2019", "hookStartSec": 30, "energy": 9, "durationSec": 184, "videoId": "QYh6mYIJG2Y"},
    {"title": "thank u, next", "artist": "Ariana Grande", "year": "2018", "hookStartSec": 45, "energy": 9, "durationSec": 331, "videoId": "gl1aHhXnN1k"},
    {"title": "STAY", "artist": "The Kid LAROI & Justin Bieber", "year": "2021", "hookStartSec": 15, "energy": 10, "durationSec": 158, "videoId": "kTJczUoc26U"},
    {"title": "Peaches", "artist": "Justin Bieber ft. Daniel Caesar & Giveon", "year": "2021", "hookStartSec": 13, "energy": 8, "durationSec": 198, "videoId": "tQ0yjYUFKAE"},
    {"title": "Sorry", "artist": "Justin Bieber", "year": "2015", "hookStartSec": 45, "energy": 9, "durationSec": 206, "videoId": "fRh_vgS2dFE"},
    {"title": "bad guy", "artist": "Billie Eilish", "year": "2019", "hookStartSec": 36, "energy": 9, "durationSec": 206, "videoId": "DyDfgMOUjCI"},
    {"title": "As It Was", "artist": "Harry Styles", "year": "2022", "hookStartSec": 43, "energy": 9, "durationSec": 166, "videoId": "H5v3kku4y6Q"},
    {"title": "Rolling in the Deep", "artist": "Adele", "year": "2010", "hookStartSec": 48, "energy": 9, "durationSec": 234, "videoId": "rYEDA3JcQqw"},
    {"title": "Watermelon Sugar", "artist": "Harry Styles", "year": "2019", "hookStartSec": 40, "energy": 9, "durationSec": 189, "videoId": "E07s5ZYygMg"},
    {"title": "Houdini", "artist": "Dua Lipa", "year": "2023", "hookStartSec": 40, "energy": 9, "durationSec": 186, "videoId": "suAR1PYFNYA"},
    {"title": "Espresso", "artist": "Sabrina Carpenter", "year": "2024", "hookStartSec": 25, "energy": 9, "durationSec": 201, "videoId": "eVli-tstM5E"},
    {"title": "Please Please Please", "artist": "Sabrina Carpenter", "year": "2024", "hookStartSec": 35, "energy": 8, "durationSec": 263, "videoId": "cF1Na4AIecM"},
    {"title": "Dance The Night", "artist": "Dua Lipa", "year": "2023", "hookStartSec": 33, "energy": 9, "durationSec": 177, "videoId": "OiC1rgCPmUQ"},
    {"title": "Can't Stop the Feeling!", "artist": "Justin Timberlake", "year": "2016", "hookStartSec": 40, "energy": 9, "durationSec": 286, "videoId": "ru0K8uYEZWw"},
    {"title": "Flowers", "artist": "Miley Cyrus", "year": "2023", "hookStartSec": 48, "energy": 9, "durationSec": 202, "videoId": "G7KNmW9a75Y"},
    {"title": "Anti-Hero", "artist": "Taylor Swift", "year": "2022", "hookStartSec": 43, "energy": 8, "durationSec": 310, "videoId": "b1kbLwvqugk"},
    {"title": "Cheap Thrills", "artist": "Sia ft. Sean Paul", "year": "2016", "hookStartSec": 48, "energy": 9, "durationSec": 262, "videoId": "nYh-n7EOtMA"},
    {"title": "Havana", "artist": "Camila Cabello ft. Young Thug", "year": "2017", "hookStartSec": 45, "energy": 9, "durationSec": 219, "videoId": "HCjNJDNzw8Y"},
    {"title": "Closer", "artist": "The Chainsmokers ft. Halsey", "year": "2016", "hookStartSec": 41, "energy": 9, "durationSec": 262, "videoId": "PT2_F-1esPk"},
    {"title": "Counting Stars", "artist": "OneRepublic", "year": "2013", "hookStartSec": 45, "energy": 9, "durationSec": 284, "videoId": "hT_nvWreIhg"},
    {"title": "Sugar", "artist": "Maroon 5", "year": "2015", "hookStartSec": 41, "energy": 9, "durationSec": 302, "videoId": "09R8_2nJtjg"},
    {"title": "Moves Like Jagger", "artist": "Maroon 5 ft. Christina Aguilera", "year": "2011", "hookStartSec": 35, "energy": 9, "durationSec": 284, "videoId": "iEPTlhBmwRg"},
    {"title": "Roar", "artist": "Katy Perry", "year": "2013", "hookStartSec": 39, "energy": 9, "durationSec": 271, "videoId": "CevxZvSJLk8"},
    {"title": "Dark Horse", "artist": "Katy Perry ft. Juicy J", "year": "2013", "hookStartSec": 44, "energy": 9, "durationSec": 226, "videoId": "0KSOMA3QBU0"},
    {"title": "Firework", "artist": "Katy Perry", "year": "2010", "hookStartSec": 49, "energy": 9, "durationSec": 234, "videoId": "QGJuMBdaqIw"},
    {"title": "Side to Side", "artist": "Ariana Grande ft. Nicki Minaj", "year": "2016", "hookStartSec": 44, "energy": 9, "durationSec": 238, "videoId": "SXiSVQZLje8"},
    {"title": "Bad Romance", "artist": "Lady Gaga", "year": "2009", "hookStartSec": 56, "energy": 10, "durationSec": 308, "videoId": "qrO4YZeyl0I"},
    {"title": "Poker Face", "artist": "Lady Gaga", "year": "2008", "hookStartSec": 36, "energy": 9, "durationSec": 215, "videoId": "bESGLojNYSo"},
    {"title": "Senorita", "artist": "Shawn Mendes & Camila Cabello", "year": "2019", "hookStartSec": 32, "energy": 9, "durationSec": 206, "videoId": "Pkh8UtuejGw"},
    {"title": "Treat You Better", "artist": "Shawn Mendes", "year": "2016", "hookStartSec": 34, "energy": 9, "durationSec": 257, "videoId": "lY2yjAdbvdQ"},
    {"title": "Attention", "artist": "Charlie Puth", "year": "2017", "hookStartSec": 47, "energy": 9, "durationSec": 212, "videoId": "nfs8NYg7yQM"},
    {"title": "We Don't Talk Anymore", "artist": "Charlie Puth ft. Selena Gomez", "year": "2016", "hookStartSec": 20, "energy": 8, "durationSec": 231, "videoId": "3AtDnEC4zak"},
    {"title": "Calm Down", "artist": "Rema & Selena Gomez", "year": "2022", "hookStartSec": 27, "energy": 9, "durationSec": 239, "videoId": "WcIcVapfqXw"},
    {"title": "vampire", "artist": "Olivia Rodrigo", "year": "2023", "hookStartSec": 50, "energy": 9, "durationSec": 244, "videoId": "RlPNh_PBZb4"},
    {"title": "good 4 u", "artist": "Olivia Rodrigo", "year": "2021", "hookStartSec": 38, "energy": 10, "durationSec": 198, "videoId": "gNi_6U5Pm_o"},
    {"title": "drivers license", "artist": "Olivia Rodrigo", "year": "2021", "hookStartSec": 55, "energy": 8, "durationSec": 248, "videoId": "ZmDBbnmKpqQ"},
    {"title": "Dynamite", "artist": "BTS", "year": "2020", "hookStartSec": 33, "energy": 10, "durationSec": 224, "videoId": "gdZLi9oWNZg"},
    {"title": "Butter", "artist": "BTS", "year": "2021", "hookStartSec": 32, "energy": 9, "durationSec": 183, "videoId": "WMweEpGlu_U"},
    {"title": "Wake Me Up", "artist": "Avicii", "year": "2013", "hookStartSec": 42, "energy": 10, "durationSec": 273, "videoId": "IcrbM1l_BoI"},
    {"title": "Titanium", "artist": "David Guetta ft. Sia", "year": "2011", "hookStartSec": 41, "energy": 10, "durationSec": 246, "videoId": "JRfuAukYTKg"},
    {"title": "Something Just Like This", "artist": "The Chainsmokers & Coldplay", "year": "2017", "hookStartSec": 47, "energy": 9, "durationSec": 241, "videoId": "fZUfdnmtg4Y"},
    {"title": "Chandelier", "artist": "Sia", "year": "2014", "hookStartSec": 42, "energy": 9, "durationSec": 232, "videoId": "2vjPBrBU-TM"},
    {"title": "Locked Out of Heaven", "artist": "Bruno Mars", "year": "2012", "hookStartSec": 37, "energy": 9, "durationSec": 234, "videoId": "e-fA-gBCkj0"},
    {"title": "Treasure", "artist": "Bruno Mars", "year": "2013", "hookStartSec": 40, "energy": 9, "durationSec": 209, "videoId": "nPvuNsRccVw"},
    {"title": "Single Ladies (Put a Ring on It)", "artist": "Beyoncé", "year": "2008", "hookStartSec": 32, "energy": 9, "durationSec": 199, "videoId": "4m1EFMoRFvY"},
    {"title": "Starships", "artist": "Nicki Minaj", "year": "2012", "hookStartSec": 42, "energy": 10, "durationSec": 263, "videoId": "SeIJmciN8mo"},
    {"title": "Super Bass", "artist": "Nicki Minaj", "year": "2011", "hookStartSec": 43, "energy": 9, "durationSec": 255, "videoId": "4JipHEz53sU"},
    {"title": "Sunroof", "artist": "Nicky Youre & dazy", "year": "2021", "hookStartSec": 20, "energy": 9, "durationSec": 163, "videoId": "G5xSLbYMr-I"},
    {"title": "BIRDS OF A FEATHER", "artist": "Billie Eilish", "year": "2024", "hookStartSec": 29, "energy": 9, "durationSec": 194, "videoId": "d5gf9dXbPi0"}
]

# 40 English Love Songs
LOVE_SONGS = [
    {"title": "Perfect", "artist": "Ed Sheeran", "year": "2017", "hookStartSec": 63, "energy": 8, "durationSec": 282, "videoId": "2Vv-BfVoq4g"},
    {"title": "Thinking Out Loud", "artist": "Ed Sheeran", "year": "2014", "hookStartSec": 56, "energy": 8, "durationSec": 297, "videoId": "lp-EO5I60KA"},
    {"title": "All of Me", "artist": "John Legend", "year": "2013", "hookStartSec": 60, "energy": 8, "durationSec": 308, "videoId": "450p7goxZqg"},
    {"title": "Someone You Loved", "artist": "Lewis Capaldi", "year": "2018", "hookStartSec": 49, "energy": 8, "durationSec": 182, "videoId": "zABLecsR5UE"},
    {"title": "A Thousand Years", "artist": "Christina Perri", "year": "2011", "hookStartSec": 64, "energy": 8, "durationSec": 288, "videoId": "rtOvBOTyX00"},
    {"title": "Until I Found You", "artist": "Stephen Sanchez", "year": "2021", "hookStartSec": 45, "energy": 8, "durationSec": 176, "videoId": "GxldQ9eX2wo"},
    {"title": "Say You Won't Let Go", "artist": "James Arthur", "year": "2016", "hookStartSec": 53, "energy": 8, "durationSec": 230, "videoId": "0yW7w8F2TVA"},
    {"title": "Stay With Me", "artist": "Sam Smith", "year": "2014", "hookStartSec": 44, "energy": 8, "durationSec": 173, "videoId": "pB-5XG-DbAA"},
    {"title": "Love Me Like You Do", "artist": "Ellie Goulding", "year": "2015", "hookStartSec": 48, "energy": 9, "durationSec": 250, "videoId": "AJtDXIazrMo"},
    {"title": "Golden Hour", "artist": "JVKE", "year": "2022", "hookStartSec": 46, "energy": 9, "durationSec": 210, "videoId": "PEM0Vs8jf1w"},
    {"title": "Yellow", "artist": "Coldplay", "year": "2000", "hookStartSec": 44, "energy": 8, "durationSec": 271, "videoId": "yKNxeF4KMsY"},
    {"title": "Fix You", "artist": "Coldplay", "year": "2005", "hookStartSec": 83, "energy": 8, "durationSec": 296, "videoId": "k4V3Mo61fJM"},
    {"title": "double take", "artist": "dhruv", "year": "2019", "hookStartSec": 38, "energy": 8, "durationSec": 170, "videoId": "R8FHtIhWqNo"},
    {"title": "Die For You", "artist": "The Weeknd", "year": "2016", "hookStartSec": 49, "energy": 9, "durationSec": 280, "videoId": "uPD0QOGTmMI"},
    {"title": "Adore You", "artist": "Harry Styles", "year": "2019", "hookStartSec": 50, "energy": 8, "durationSec": 219, "videoId": "VF-r5TtlT9w"},
    {"title": "Make You Feel My Love", "artist": "Adele", "year": "2008", "hookStartSec": 45, "energy": 8, "durationSec": 212, "videoId": "0put0_a--Ng"},
    {"title": "Easy On Me", "artist": "Adele", "year": "2021", "hookStartSec": 63, "energy": 8, "durationSec": 332, "videoId": "U3ASj1L6_sY"},
    {"title": "Just the Way You Are", "artist": "Bruno Mars", "year": "2010", "hookStartSec": 49, "energy": 9, "durationSec": 237, "videoId": "LjhCEhWiKXk"},
    {"title": "Grenade", "artist": "Bruno Mars", "year": "2010", "hookStartSec": 53, "energy": 9, "durationSec": 221, "videoId": "SR6iYWJxHqs"},
    {"title": "Lover", "artist": "Taylor Swift", "year": "2019", "hookStartSec": 63, "energy": 8, "durationSec": 239, "videoId": "-BjZmE2gtdo"},
    {"title": "Enchanted (Taylor's Version)", "artist": "Taylor Swift", "year": "2023", "hookStartSec": 77, "energy": 8, "durationSec": 357, "videoId": "igIfiqqVHtA"},
    {"title": "Photograph", "artist": "Ed Sheeran", "year": "2014", "hookStartSec": 69, "energy": 8, "durationSec": 275, "videoId": "nSDgHBxUbVQ"},
    {"title": "Shallow", "artist": "Lady Gaga & Bradley Cooper", "year": "2018", "hookStartSec": 88, "energy": 9, "durationSec": 216, "videoId": "bo_efYhYU2A"},
    {"title": "Always Remember Us This Way", "artist": "Lady Gaga", "year": "2018", "hookStartSec": 56, "energy": 8, "durationSec": 242, "videoId": "5vheNbQlsyU"},
    {"title": "Like I'm Gonna Lose You", "artist": "Meghan Trainor ft. John Legend", "year": "2015", "hookStartSec": 51, "energy": 8, "durationSec": 235, "videoId": "2-MBfn8XjIU"},
    {"title": "Before You Go", "artist": "Lewis Capaldi", "year": "2019", "hookStartSec": 53, "energy": 8, "durationSec": 246, "videoId": "Jtauh8GcxBY"},
    {"title": "You Are The Reason", "artist": "Calum Scott", "year": "2017", "hookStartSec": 49, "energy": 8, "durationSec": 205, "videoId": "ShZ978fBl6Y"},
    {"title": "Dancing On My Own", "artist": "Calum Scott", "year": "2016", "hookStartSec": 65, "energy": 8, "durationSec": 264, "videoId": "q31tGyBJhRY"},
    {"title": "I'm Yours", "artist": "Jason Mraz", "year": "2008", "hookStartSec": 53, "energy": 8, "durationSec": 222, "videoId": "EkHTsc9PU2A"},
    {"title": "Lucky", "artist": "Jason Mraz & Colbie Caillat", "year": "2008", "hookStartSec": 55, "energy": 8, "durationSec": 190, "videoId": "acvIVA9-FMQ"},
    {"title": "Bubbly", "artist": "Colbie Caillat", "year": "2007", "hookStartSec": 44, "energy": 8, "durationSec": 196, "videoId": "AWGqoCNbsvM"},
    {"title": "Put Your Records On", "artist": "Corinne Bailey Rae", "year": "2006", "hookStartSec": 41, "energy": 8, "durationSec": 234, "videoId": "rjOhZZyn30k"},
    {"title": "Can't Help Falling in Love", "artist": "Haley Reinhart", "year": "2015", "hookStartSec": 35, "energy": 8, "durationSec": 222, "videoId": "d924LLHxSqk"},
    {"title": "Let Her Go", "artist": "Passenger", "year": "2012", "hookStartSec": 41, "energy": 8, "durationSec": 255, "videoId": "RBumgq5yVrA"},
    {"title": "Dandelions", "artist": "Ruth B.", "year": "2017", "hookStartSec": 51, "energy": 8, "durationSec": 234, "videoId": "W8a4sUabCUo"},
    {"title": "Here With Me", "artist": "d4vd", "year": "2022", "hookStartSec": 45, "energy": 8, "durationSec": 221, "videoId": "Ip6cw8gfHHI"},
    {"title": "Romantic Homicide", "artist": "d4vd", "year": "2022", "hookStartSec": 31, "energy": 8, "durationSec": 151, "videoId": "eKL3TceSxvk"},
    {"title": "Daylight", "artist": "David Kushner", "year": "2023", "hookStartSec": 47, "energy": 8, "durationSec": 213, "videoId": "MoN9ql6Yymw"},
    {"title": "Pointless", "artist": "Lewis Capaldi", "year": "2022", "hookStartSec": 58, "energy": 8, "durationSec": 253, "videoId": "HlNGI4LbAto"},
    {"title": "Lose You To Love Me", "artist": "Selena Gomez", "year": "2019", "hookStartSec": 50, "energy": 8, "durationSec": 207, "videoId": "zlJDTxahav0"}
]

print(f"Loaded {len(POP_SONGS)} pop songs and {len(LOVE_SONGS)} love songs.")

def check_oembed(item, max_retries=3):
    vid = item["videoId"]
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=8) as response:
                data = json.loads(response.read().decode())
                return item, True, data.get("title", ""), data.get("author_name", "")
        except Exception as e:
            if attempt == max_retries - 1:
                return item, False, str(e), ""
            time.sleep(1)

all_songs = POP_SONGS + LOVE_SONGS

print(f"Verifying all {len(all_songs)} songs via YouTube oEmbed...")
t0 = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    results = list(executor.map(check_oembed, all_songs))

print(f"OEmbed verification finished in {time.time()-t0:.2f}s")

failed = []
vids_seen = {}
duplicates = []

for item, ok, otitle, author in results:
    vid = item["videoId"]
    if vid in vids_seen:
        duplicates.append((item["title"], vid, vids_seen[vid]))
    vids_seen[vid] = item["title"]

    if not ok:
        failed.append((item["title"], vid, otitle))
    else:
        print(f"[VERIFIED] {item['title']} ({item['artist']}) -> {vid} | {otitle} [{author}]")

if duplicates:
    print("\nERROR: DUPLICATES FOUND:")
    for d in duplicates:
        print(" ", d)
    exit(1)

if failed:
    print("\nERROR: FAILED OEMBED VERIFICATIONS:")
    for f in failed:
        print(" ", f)
    exit(1)

print("\nAll 100 songs verified successfully with ZERO duplicates!")

# Format each song according to schema
def format_song(s):
    hook_start = s["hookStartSec"]
    hook_end = hook_start + 40
    return {
        "title": s["title"],
        "artist": s["artist"],
        "year": str(s["year"]),
        "videoId": s["videoId"],
        "durationSec": s["durationSec"],
        "hookStartSec": hook_start,
        "hookEndSec": hook_end,
        "entrySec": hook_start,
        "exitSec": hook_end,
        "energy": s["energy"]
    }

final_output = {
    "english-pop": [format_song(s) for s in POP_SONGS],
    "english-love": [format_song(s) for s in LOVE_SONGS]
}

out_dir = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches"
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "agent_6.json")

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(final_output, f, indent=2, ensure_ascii=False)

print(f"\nWrote final JSON to {out_path}")
print(f"english-pop count: {len(final_output['english-pop'])}")
print(f"english-love count: {len(final_output['english-love'])}")
print(f"Total songs: {len(final_output['english-pop']) + len(final_output['english-love'])}")
print(f"Total unique videoIds: {len(vids_seen)}")
