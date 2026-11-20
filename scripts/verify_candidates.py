import json
import os
import re
import subprocess
import urllib.request
import concurrent.futures
import time

# List of 60 English Pop songs
POP_CANDIDATES = [
    {"title": "Blinding Lights", "artist": "The Weeknd", "year": "2019", "hookStartSec": 56, "energy": 10, "query": "The Weeknd Blinding Lights official music video", "videoId": "4NRXx6U8ABQ"},
    {"title": "Starboy", "artist": "The Weeknd ft. Daft Punk", "year": "2016", "hookStartSec": 55, "energy": 9, "query": "The Weeknd Starboy official music video", "videoId": "dqt8Z1k0oKQ"},
    {"title": "Cruel Summer", "artist": "Taylor Swift", "year": "2019", "hookStartSec": 45, "energy": 9, "query": "Taylor Swift Cruel Summer official audio", "videoId": "ic8j13piAhQ"},
    {"title": "Shake It Off", "artist": "Taylor Swift", "year": "2014", "hookStartSec": 39, "energy": 10, "query": "Taylor Swift Shake It Off official music video", "videoId": "nfWlot6h_JM"},
    {"title": "Blank Space", "artist": "Taylor Swift", "year": "2014", "hookStartSec": 37, "energy": 9, "query": "Taylor Swift Blank Space official music video", "videoId": "e-ORhEE9VVg"},
    {"title": "Levitating", "artist": "Dua Lipa", "year": "2020", "hookStartSec": 46, "energy": 10, "query": "Dua Lipa Levitating official music video", "videoId": "TUVcZfQe-Kw"},
    {"title": "Don't Start Now", "artist": "Dua Lipa", "year": "2019", "hookStartSec": 31, "energy": 9, "query": "Dua Lipa Don't Start Now official music video", "videoId": "oygrmJFKYZY"},
    {"title": "24K Magic", "artist": "Bruno Mars", "year": "2016", "hookStartSec": 58, "energy": 10, "query": "Bruno Mars 24K Magic official music video", "videoId": "UqyT8IEBkvY"},
    {"title": "Uptown Funk", "artist": "Mark Ronson ft. Bruno Mars", "year": "2014", "hookStartSec": 50, "energy": 10, "query": "Mark Ronson Uptown Funk official music video", "videoId": "OPfVPOPR644"},
    {"title": "Shape of You", "artist": "Ed Sheeran", "year": "2017", "hookStartSec": 35, "energy": 9, "query": "Ed Sheeran Shape of You official music video", "videoId": "JGwWNGJdvx8"},
    {"title": "Bad Habits", "artist": "Ed Sheeran", "year": "2021", "hookStartSec": 38, "energy": 9, "query": "Ed Sheeran Bad Habits official music video", "videoId": "orJSJGHjBLI"},
    {"title": "7 rings", "artist": "Ariana Grande", "year": "2019", "hookStartSec": 30, "energy": 9, "query": "Ariana Grande 7 rings official music video", "videoId": "QYh6mYIJG2Y"},
    {"title": "thank u, next", "artist": "Ariana Grande", "year": "2018", "hookStartSec": 45, "energy": 9, "query": "Ariana Grande thank u next official music video", "videoId": "gl1aHhXnN1k"},
    {"title": "STAY", "artist": "The Kid LAROI & Justin Bieber", "year": "2021", "hookStartSec": 15, "energy": 10, "query": "The Kid LAROI Justin Bieber STAY official music video", "videoId": "KTzGBJP4WIA"},
    {"title": "Peaches", "artist": "Justin Bieber ft. Daniel Caesar & Giveon", "year": "2021", "hookStartSec": 13, "energy": 8, "query": "Justin Bieber Peaches official music video", "videoId": "tQ0yjYUFKAE"},
    {"title": "Sorry", "artist": "Justin Bieber", "year": "2015", "hookStartSec": 45, "energy": 9, "query": "Justin Bieber Sorry purpose the movement", "videoId": "fRh_vgS2dFE"},
    {"title": "bad guy", "artist": "Billie Eilish", "year": "2019", "hookStartSec": 36, "energy": 9, "query": "Billie Eilish bad guy official music video", "videoId": "DyDfgMOUjCI"},
    {"title": "As It Was", "artist": "Harry Styles", "year": "2022", "hookStartSec": 43, "energy": 9, "query": "Harry Styles As It Was official music video", "videoId": "H5v3k2nn9pc"},
    {"title": "Rolling in the Deep", "artist": "Adele", "year": "2010", "hookStartSec": 48, "energy": 9, "query": "Adele Rolling in the Deep official music video", "videoId": "rYEDA3JcQqw"},
    {"title": "Watermelon Sugar", "artist": "Harry Styles", "year": "2019", "hookStartSec": 40, "energy": 9, "query": "Harry Styles Watermelon Sugar official music video", "videoId": "E07s5ZYygMg"},
    {"title": "Houdini", "artist": "Dua Lipa", "year": "2023", "hookStartSec": 40, "energy": 9, "query": "Dua Lipa Houdini official music video", "videoId": "suAR1PYFNYA"},
    {"title": "Espresso", "artist": "Sabrina Carpenter", "year": "2024", "hookStartSec": 25, "energy": 9, "query": "Sabrina Carpenter Espresso official music video", "videoId": "eVli-tstM5E"},
    {"title": "Please Please Please", "artist": "Sabrina Carpenter", "year": "2024", "hookStartSec": 35, "energy": 8, "query": "Sabrina Carpenter Please Please Please official music video", "videoId": "cfV90OE8cTg"},
    {"title": "Dance The Night", "artist": "Dua Lipa", "year": "2023", "hookStartSec": 33, "energy": 9, "query": "Dua Lipa Dance The Night official music video", "videoId": "OiC1rgCPmUQ"},
    {"title": "Can't Stop the Feeling!", "artist": "Justin Timberlake", "year": "2016", "hookStartSec": 40, "energy": 9, "query": "Justin Timberlake Can't Stop the Feeling official music video", "videoId": "ru0K8uYEZWw"},
    {"title": "Flowers", "artist": "Miley Cyrus", "year": "2023", "hookStartSec": 48, "energy": 9, "query": "Miley Cyrus Flowers official music video", "videoId": "G7KNmW9a75Y"},
    {"title": "Anti-Hero", "artist": "Taylor Swift", "year": "2022", "hookStartSec": 43, "energy": 8, "query": "Taylor Swift Anti-Hero official music video", "videoId": "b1kbLwvqugk"},
    {"title": "Cheap Thrills", "artist": "Sia ft. Sean Paul", "year": "2016", "hookStartSec": 48, "energy": 9, "query": "Sia Cheap Thrills official music video", "videoId": "nYsNPF4wD4Y"},
    {"title": "Havana", "artist": "Camila Cabello ft. Young Thug", "year": "2017", "hookStartSec": 45, "energy": 9, "query": "Camila Cabello Havana official music video", "videoId": "BQ0mxQXDG3U"},
    {"title": "Closer", "artist": "The Chainsmokers ft. Halsey", "year": "2016", "hookStartSec": 41, "energy": 9, "query": "The Chainsmokers Closer lyric video official", "videoId": "PT2_FZTgtwA"},
    {"title": "Counting Stars", "artist": "OneRepublic", "year": "2013", "hookStartSec": 45, "energy": 9, "query": "OneRepublic Counting Stars official music video", "videoId": "hT_nvWreIhg"},
    {"title": "Sugar", "artist": "Maroon 5", "year": "2015", "hookStartSec": 41, "energy": 9, "query": "Maroon 5 Sugar official music video", "videoId": "09R8_2nJtjg"},
    {"title": "Moves Like Jagger", "artist": "Maroon 5 ft. Christina Aguilera", "year": "2011", "hookStartSec": 35, "energy": 9, "query": "Maroon 5 Moves Like Jagger official music video", "videoId": "iEPTlhBmwRg"},
    {"title": "Roar", "artist": "Katy Perry", "year": "2013", "hookStartSec": 39, "energy": 9, "query": "Katy Perry Roar official music video", "videoId": "CevxZvSJLk8"},
    {"title": "Dark Horse", "artist": "Katy Perry ft. Juicy J", "year": "2013", "hookStartSec": 44, "energy": 9, "query": "Katy Perry Dark Horse official music video", "videoId": "0KSOMA3QBU0"},
    {"title": "Firework", "artist": "Katy Perry", "year": "2010", "hookStartSec": 49, "energy": 9, "query": "Katy Perry Firework official music video", "videoId": "QGJuMBdaqIw"},
    {"title": "Side to Side", "artist": "Ariana Grande ft. Nicki Minaj", "year": "2016", "hookStartSec": 44, "energy": 9, "query": "Ariana Grande Side to Side official music video", "videoId": "SXiSVQZLje8"},
    {"title": "Bad Romance", "artist": "Lady Gaga", "year": "2009", "hookStartSec": 56, "energy": 10, "query": "Lady Gaga Bad Romance official music video", "videoId": "qrO4XYZL35o"},
    {"title": "Poker Face", "artist": "Lady Gaga", "year": "2008", "hookStartSec": 36, "energy": 9, "query": "Lady Gaga Poker Face official music video", "videoId": "bESGLojNYSo"},
    {"title": "Senorita", "artist": "Shawn Mendes & Camila Cabello", "year": "2019", "hookStartSec": 32, "energy": 9, "query": "Shawn Mendes Camila Cabello Senorita official music video", "videoId": "Pkh8UtuejGw"},
    {"title": "Treat You Better", "artist": "Shawn Mendes", "year": "2016", "hookStartSec": 34, "energy": 9, "query": "Shawn Mendes Treat You Better official music video", "videoId": "lY2yjAdbvdQ"},
    {"title": "Attention", "artist": "Charlie Puth", "year": "2017", "hookStartSec": 47, "energy": 9, "query": "Charlie Puth Attention official music video", "videoId": "nfs8NYg7yQM"},
    {"title": "We Don't Talk Anymore", "artist": "Charlie Puth ft. Selena Gomez", "year": "2016", "hookStartSec": 20, "energy": 8, "query": "Charlie Puth We Don't Talk Anymore official music video", "videoId": "3AtDnEC4zak"},
    {"title": "Calm Down", "artist": "Rema & Selena Gomez", "year": "2022", "hookStartSec": 27, "energy": 9, "query": "Rema Selena Gomez Calm Down official music video", "videoId": "WcIcVapfqXw"},
    {"title": "vampire", "artist": "Olivia Rodrigo", "year": "2023", "hookStartSec": 50, "energy": 9, "query": "Olivia Rodrigo vampire official music video", "videoId": "Zl40263y7Qc"},
    {"title": "good 4 u", "artist": "Olivia Rodrigo", "year": "2021", "hookStartSec": 38, "energy": 10, "query": "Olivia Rodrigo good 4 u official music video", "videoId": "gNi_6U5Pm_o"},
    {"title": "drivers license", "artist": "Olivia Rodrigo", "year": "2021", "hookStartSec": 55, "energy": 8, "query": "Olivia Rodrigo drivers license official music video", "videoId": "ZmDBbnmKpqQ"},
    {"title": "Dynamite", "artist": "BTS", "year": "2020", "hookStartSec": 33, "energy": 10, "query": "BTS Dynamite official music video", "videoId": "gdZLi9oWNZg"},
    {"title": "Butter", "artist": "BTS", "year": "2021", "hookStartSec": 32, "energy": 9, "query": "BTS Butter official music video", "videoId": "WMweEpGlu_U"},
    {"title": "Wake Me Up", "artist": "Avicii", "year": "2013", "hookStartSec": 42, "energy": 10, "query": "Avicii Wake Me Up official music video", "videoId": "IcrbM1l_BoI"},
    {"title": "Titanium", "artist": "David Guetta ft. Sia", "year": "2011", "hookStartSec": 41, "energy": 10, "query": "David Guetta Titanium official music video", "videoId": "JRfuAukYTKg"},
    {"title": "Something Just Like This", "artist": "The Chainsmokers & Coldplay", "year": "2017", "hookStartSec": 47, "energy": 9, "query": "The Chainsmokers Coldplay Something Just Like This lyric video", "videoId": "FM7Z-Xq8Drc"},
    {"title": "Chandelier", "artist": "Sia", "year": "2014", "hookStartSec": 42, "energy": 9, "query": "Sia Chandelier official music video", "videoId": "2vjPBrBU-TM"},
    {"title": "Locked Out of Heaven", "artist": "Bruno Mars", "year": "2012", "hookStartSec": 37, "energy": 9, "query": "Bruno Mars Locked Out of Heaven official music video", "videoId": "e-fA-gBCkj0"},
    {"title": "Treasure", "artist": "Bruno Mars", "year": "2013", "hookStartSec": 40, "energy": 9, "query": "Bruno Mars Treasure official music video", "videoId": "nPvuNsRccVw"},
    {"title": "Single Ladies (Put a Ring on It)", "artist": "Beyoncé", "year": "2008", "hookStartSec": 32, "energy": 9, "query": "Beyonce Single Ladies official music video", "videoId": "4m1EFMoRFvY"},
    {"title": "Starships", "artist": "Nicki Minaj", "year": "2012", "hookStartSec": 42, "energy": 10, "query": "Nicki Minaj Starships official music video", "videoId": "SeIJmciN8mo"},
    {"title": "Super Bass", "artist": "Nicki Minaj", "year": "2011", "hookStartSec": 43, "energy": 9, "query": "Nicki Minaj Super Bass official music video", "videoId": "4JipHEz53sU"},
    {"title": "Sunroof", "artist": "Nicky Youre & dazy", "year": "2021", "hookStartSec": 20, "energy": 9, "query": "Nicky Youre dazy Sunroof official music video", "videoId": "G5xSLbYMr-I"},
    {"title": "BIRDS OF A FEATHER", "artist": "Billie Eilish", "year": "2024", "hookStartSec": 29, "energy": 9, "query": "Billie Eilish BIRDS OF A FEATHER official music video", "videoId": "d5gf9dXbPi0"}
]

# List of 40 English Love songs
LOVE_CANDIDATES = [
    {"title": "Perfect", "artist": "Ed Sheeran", "year": "2017", "hookStartSec": 63, "energy": 8, "query": "Ed Sheeran Perfect official music video", "videoId": "2Vv-BfVoq4g"},
    {"title": "Thinking Out Loud", "artist": "Ed Sheeran", "year": "2014", "hookStartSec": 56, "energy": 8, "query": "Ed Sheeran Thinking Out Loud official music video", "videoId": "lp-EO5I60KA"},
    {"title": "All of Me", "artist": "John Legend", "year": "2013", "hookStartSec": 60, "energy": 8, "query": "John Legend All of Me official music video", "videoId": "450p7goxZqg"},
    {"title": "Someone You Loved", "artist": "Lewis Capaldi", "year": "2018", "hookStartSec": 49, "energy": 8, "query": "Lewis Capaldi Someone You Loved official music video", "videoId": "zABLecsR5UE"},
    {"title": "A Thousand Years", "artist": "Christina Perri", "year": "2011", "hookStartSec": 64, "energy": 8, "query": "Christina Perri A Thousand Years official music video", "videoId": "rtOvBOTyX00"},
    {"title": "Until I Found You", "artist": "Stephen Sanchez", "year": "2021", "hookStartSec": 45, "energy": 8, "query": "Stephen Sanchez Until I Found You official music video", "videoId": "GxldQ9GyX4U"},
    {"title": "Say You Won't Let Go", "artist": "James Arthur", "year": "2016", "hookStartSec": 53, "energy": 8, "query": "James Arthur Say You Won't Let Go official music video", "videoId": "0yW7w8F2TVA"},
    {"title": "Stay With Me", "artist": "Sam Smith", "year": "2014", "hookStartSec": 44, "energy": 8, "query": "Sam Smith Stay With Me official music video", "videoId": "pB-5XG-DbAA"},
    {"title": "Love Me Like You Do", "artist": "Ellie Goulding", "year": "2015", "hookStartSec": 48, "energy": 9, "query": "Ellie Goulding Love Me Like You Do official music video", "videoId": "AJtDXIazrMo"},
    {"title": "Golden Hour", "artist": "JVKE", "year": "2022", "hookStartSec": 46, "energy": 9, "query": "JVKE golden hour official music video", "videoId": "PEM0Vs8jf1w"},
    {"title": "Yellow", "artist": "Coldplay", "year": "2000", "hookStartSec": 44, "energy": 8, "query": "Coldplay Yellow official music video", "videoId": "yKNxeF4KMsY"},
    {"title": "Fix You", "artist": "Coldplay", "year": "2005", "hookStartSec": 83, "energy": 8, "query": "Coldplay Fix You official music video", "videoId": "k4V3Mo61fJM"},
    {"title": "double take", "artist": "dhruv", "year": "2019", "hookStartSec": 38, "energy": 8, "query": "dhruv double take official music video", "videoId": "u2V0vOFgk1k"},
    {"title": "Die For You", "artist": "The Weeknd", "year": "2016", "hookStartSec": 49, "energy": 9, "query": "The Weeknd Die For You official music video", "videoId": "ULiTZB0kY7A"},
    {"title": "Adore You", "artist": "Harry Styles", "year": "2019", "hookStartSec": 50, "energy": 8, "query": "Harry Styles Adore You official music video", "videoId": "VF-FGf_ZZiI"},
    {"title": "Make You Feel My Love", "artist": "Adele", "year": "2008", "hookStartSec": 45, "energy": 8, "query": "Adele Make You Feel My Love official music video", "videoId": "0put0_a--Ng"},
    {"title": "Easy On Me", "artist": "Adele", "year": "2021", "hookStartSec": 63, "energy": 8, "query": "Adele Easy On Me official music video", "videoId": "U3ASj1L6_sY"},
    {"title": "Just the Way You Are", "artist": "Bruno Mars", "year": "2010", "hookStartSec": 49, "energy": 9, "query": "Bruno Mars Just The Way You Are official music video", "videoId": "LjhCEhWiKXk"},
    {"title": "Grenade", "artist": "Bruno Mars", "year": "2010", "hookStartSec": 53, "energy": 9, "query": "Bruno Mars Grenade official music video", "videoId": "SR6iYWJxHqs"},
    {"title": "Lover", "artist": "Taylor Swift", "year": "2019", "hookStartSec": 63, "energy": 8, "query": "Taylor Swift Lover official music video", "videoId": "-BjZmE2gtdo"},
    {"title": "Enchanted (Taylor's Version)", "artist": "Taylor Swift", "year": "2023", "hookStartSec": 77, "energy": 8, "query": "Taylor Swift Enchanted Taylor's Version lyric video", "videoId": "lX44CAz-Cb4"},
    {"title": "Photograph", "artist": "Ed Sheeran", "year": "2014", "hookStartSec": 69, "energy": 8, "query": "Ed Sheeran Photograph official music video", "videoId": "nSDgHBxUbVQ"},
    {"title": "Shallow", "artist": "Lady Gaga & Bradley Cooper", "year": "2018", "hookStartSec": 88, "energy": 9, "query": "Lady Gaga Bradley Cooper Shallow official music video", "videoId": "bo_efYhAK2A"},
    {"title": "Always Remember Us This Way", "artist": "Lady Gaga", "year": "2018", "hookStartSec": 56, "energy": 8, "query": "Lady Gaga Always Remember Us This Way official music video", "videoId": "5vheNbQlsyU"},
    {"title": "Like I'm Gonna Lose You", "artist": "Meghan Trainor ft. John Legend", "year": "2015", "hookStartSec": 51, "energy": 8, "query": "Meghan Trainor John Legend Like I'm Gonna Lose You official video", "videoId": "2-MBfn8XjIU"},
    {"title": "Before You Go", "artist": "Lewis Capaldi", "year": "2019", "hookStartSec": 53, "energy": 8, "query": "Lewis Capaldi Before You Go official music video", "videoId": "bCuhuePlP8o"},
    {"title": "You Are The Reason", "artist": "Calum Scott", "year": "2017", "hookStartSec": 49, "energy": 8, "query": "Calum Scott You Are The Reason official music video", "videoId": "ShZ978fBl6U"},
    {"title": "Dancing On My Own", "artist": "Calum Scott", "year": "2016", "hookStartSec": 65, "energy": 8, "query": "Calum Scott Dancing On My Own official music video", "videoId": "q31tGyBJhRY"},
    {"title": "I'm Yours", "artist": "Jason Mraz", "year": "2008", "hookStartSec": 53, "energy": 8, "query": "Jason Mraz I'm Yours official music video", "videoId": "EkHTsc9PU2Q"},
    {"title": "Lucky", "artist": "Jason Mraz & Colbie Caillat", "year": "2008", "hookStartSec": 55, "energy": 8, "query": "Jason Mraz Colbie Caillat Lucky official music video", "videoId": "acvIVA9-FMQ"},
    {"title": "Bubbly", "artist": "Colbie Caillat", "year": "2007", "hookStartSec": 44, "energy": 8, "query": "Colbie Caillat Bubbly official music video", "videoId": "AWGqoCNbsvM"},
    {"title": "Put Your Records On", "artist": "Corinne Bailey Rae", "year": "2006", "hookStartSec": 41, "energy": 8, "query": "Corinne Bailey Rae Put Your Records On official music video", "videoId": "wkMBORhoA8I"},
    {"title": "Can't Help Falling in Love", "artist": "Haley Reinhart", "year": "2015", "hookStartSec": 35, "energy": 8, "query": "Haley Reinhart Can't Help Falling in Love official music video", "videoId": "5SC_wBcubyU"},
    {"title": "Let Her Go", "artist": "Passenger", "year": "2012", "hookStartSec": 41, "energy": 8, "query": "Passenger Let Her Go official music video", "videoId": "RBumgq5yVrA"},
    {"title": "Dandelions", "artist": "Ruth B.", "year": "2017", "hookStartSec": 51, "energy": 8, "query": "Ruth B Dandelions audio official", "videoId": "W8a4sUabCUo"},
    {"title": "Here With Me", "artist": "d4vd", "year": "2022", "hookStartSec": 45, "energy": 8, "query": "d4vd Here With Me official music video", "videoId": "BepA6oD3j2k"},
    {"title": "Romantic Homicide", "artist": "d4vd", "year": "2022", "hookStartSec": 31, "energy": 8, "query": "d4vd Romantic Homicide official music video", "videoId": "3hVj9g1d_2E"},
    {"title": "Daylight", "artist": "David Kushner", "year": "2023", "hookStartSec": 47, "energy": 8, "query": "David Kushner Daylight official music video", "videoId": "MoN9ql6Yymw"},
    {"title": "Pointless", "artist": "Lewis Capaldi", "year": "2022", "hookStartSec": 58, "energy": 8, "query": "Lewis Capaldi Pointless official music video", "videoId": "pM1mS_i9l04"},
    {"title": "Lose You To Love Me", "artist": "Selena Gomez", "year": "2019", "hookStartSec": 50, "energy": 8, "query": "Selena Gomez Lose You To Love Me official music video", "videoId": "zlJDTxahav0"}
]

print(f"Pop candidates count: {len(POP_CANDIDATES)}")
print(f"Love candidates count: {len(LOVE_CANDIDATES)}")

def check_oembed(item):
    vid = item.get("videoId")
    if not vid or len(vid) != 11:
        return item, False, "invalid_id_length", ""
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return item, True, data.get("title", ""), data.get("author_name", "")
    except Exception as e:
        return item, False, str(e), ""

def verify_all(items):
    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        return list(executor.map(check_oembed, items))

# Let's run verify_all on all candidates!
all_items = POP_CANDIDATES + LOVE_CANDIDATES
print(f"Total to verify: {len(all_items)}")
t0 = time.time()
results = verify_all(all_items)
print(f"OEmbed verification took {time.time()-t0:.2f}s")

failed = []
all_vids = set()
duplicates = []

for item, ok, otitle, author in results:
    vid = item["videoId"]
    if vid in all_vids:
        duplicates.append((item["title"], vid))
    all_vids.add(vid)
    if not ok:
        failed.append((item["title"], item["artist"], vid, otitle))
    else:
        print(f"[OK] {item['title']} -> {vid} ({otitle} | {author})")

print(f"\n--- SUMMARY ---")
print(f"Total: {len(all_items)}")
print(f"Passed: {len(all_items) - len(failed)}")
print(f"Failed: {len(failed)}")
print(f"Duplicates: {len(duplicates)}")

if failed:
    print("\nFAILED ITEMS:")
    for f in failed:
        print(" ", f)

if duplicates:
    print("\nDUPLICATE IDS:")
    for d in duplicates:
        print(" ", d)
