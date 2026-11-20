import json
import os
import re
import time
import urllib.request
import concurrent.futures
import yt_dlp

BLACKLIST = {
    'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
    'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g', 'dQw4w9WgXcQ'
}

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True,
    'default_search': 'ytsearch3',
}

def verify_oembed(video_id):
    if not video_id or len(video_id) != 11 or video_id in BLACKLIST:
        return False
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            return resp.status == 200
    except Exception:
        return False

def search_youtube(title, artist, query=None):
    search_q = query or f"{title} {artist} official music video"
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch3:{search_q}", download=False)
            if res and 'entries' in res and res['entries']:
                for entry in res['entries']:
                    vid = entry.get('id')
                    if not vid or len(vid) != 11 or vid in BLACKLIST:
                        continue
                    if verify_oembed(vid):
                        dur = int(entry.get('duration') or 210)
                        if dur < 80 or dur > 550:
                            dur = 210
                        return vid, dur
    except Exception:
        pass
    return None, None

CANDIDATES = {
    "english-pop": [
        {"title": "Espresso", "artist": "Sabrina Carpenter", "year": "2024", "hookStart": 28, "hookEnd": 68, "energy": 9},
        {"title": "Please Please Please", "artist": "Sabrina Carpenter", "year": "2024", "hookStart": 30, "hookEnd": 70, "energy": 8},
        {"title": "Taste", "artist": "Sabrina Carpenter", "year": "2024", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Feather", "artist": "Sabrina Carpenter", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Nonsense", "artist": "Sabrina Carpenter", "year": "2022", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Bed Chem", "artist": "Sabrina Carpenter", "year": "2024", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Houdini", "artist": "Dua Lipa", "year": "2023", "hookStart": 36, "hookEnd": 76, "energy": 10},
        {"title": "Training Season", "artist": "Dua Lipa", "year": "2024", "hookStart": 34, "hookEnd": 74, "energy": 9},
        {"title": "Dance The Night", "artist": "Dua Lipa", "year": "2023", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Physical", "artist": "Dua Lipa", "year": "2020", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "Break My Heart", "artist": "Dua Lipa", "year": "2020", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Love Again", "artist": "Dua Lipa", "year": "2021", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Hallucinate", "artist": "Dua Lipa", "year": "2020", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "New Rules", "artist": "Dua Lipa", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "IDGAF", "artist": "Dua Lipa", "year": "2018", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Illusion", "artist": "Dua Lipa", "year": "2024", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "BIRDS OF A FEATHER", "artist": "Billie Eilish", "year": "2024", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "LUNCH", "artist": "Billie Eilish", "year": "2024", "hookStart": 25, "hookEnd": 65, "energy": 9},
        {"title": "CHIHIRO", "artist": "Billie Eilish", "year": "2024", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Therefore I Am", "artist": "Billie Eilish", "year": "2020", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "bury a friend", "artist": "Billie Eilish", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "What Was I Made For?", "artist": "Billie Eilish", "year": "2023", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Anti-Hero", "artist": "Taylor Swift", "year": "2022", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "I Can Do It With A Broken Heart", "artist": "Taylor Swift", "year": "2024", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Karma", "artist": "Taylor Swift", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Fortnight", "artist": "Taylor Swift ft. Post Malone", "year": "2024", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Style", "artist": "Taylor Swift", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Bad Blood", "artist": "Taylor Swift ft. Kendrick Lamar", "year": "2015", "hookStart": 33, "hookEnd": 73, "energy": 9},
        {"title": "Look What You Made Me Do", "artist": "Taylor Swift", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "ME!", "artist": "Taylor Swift ft. Brendon Urie", "year": "2019", "hookStart": 36, "hookEnd": 76, "energy": 9},
        {"title": "You Need To Calm Down", "artist": "Taylor Swift", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Lavender Haze", "artist": "Taylor Swift", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "yes, and?", "artist": "Ariana Grande", "year": "2024", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "we can't be friends", "artist": "Ariana Grande", "year": "2024", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "positions", "artist": "Ariana Grande", "year": "2020", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Side to Side", "artist": "Ariana Grande ft. Nicki Minaj", "year": "2016", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Problem", "artist": "Ariana Grande ft. Iggy Azalea", "year": "2014", "hookStart": 33, "hookEnd": 73, "energy": 10},
        {"title": "Into You", "artist": "Ariana Grande", "year": "2016", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "Dangerous Woman", "artist": "Ariana Grande", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Break Free", "artist": "Ariana Grande ft. Zedd", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "34+35", "artist": "Ariana Grande", "year": "2020", "hookStart": 28, "hookEnd": 68, "energy": 8},
        {"title": "One Last Time", "artist": "Ariana Grande", "year": "2014", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Save Your Tears", "artist": "The Weeknd", "year": "2020", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Can't Feel My Face", "artist": "The Weeknd", "year": "2015", "hookStart": 33, "hookEnd": 73, "energy": 10},
        {"title": "The Hills", "artist": "The Weeknd", "year": "2015", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "In Your Eyes", "artist": "The Weeknd", "year": "2020", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Take My Breath", "artist": "The Weeknd", "year": "2021", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "I Feel It Coming", "artist": "The Weeknd ft. Daft Punk", "year": "2016", "hookStart": 36, "hookEnd": 76, "energy": 9},
        {"title": "Often", "artist": "The Weeknd", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Dancing In The Flames", "artist": "The Weeknd", "year": "2024", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Popular", "artist": "The Weeknd, Playboi Carti, Madonna", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Die With A Smile", "artist": "Lady Gaga & Bruno Mars", "year": "2024", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "Locked Out of Heaven", "artist": "Bruno Mars", "year": "2012", "hookStart": 33, "hookEnd": 73, "energy": 10},
        {"title": "Treasure", "artist": "Bruno Mars", "year": "2013", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "That's What I Like", "artist": "Bruno Mars", "year": "2016", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Marry You", "artist": "Bruno Mars", "year": "2010", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Leave The Door Open", "artist": "Bruno Mars, Anderson .Paak, Silk Sonic", "year": "2021", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Roar", "artist": "Katy Perry", "year": "2013", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Firework", "artist": "Katy Perry", "year": "2010", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Dark Horse", "artist": "Katy Perry ft. Juicy J", "year": "2013", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Teenage Dream", "artist": "Katy Perry", "year": "2010", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "California Gurls", "artist": "Katy Perry ft. Snoop Dogg", "year": "2010", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Last Friday Night (T.G.I.F.)", "artist": "Katy Perry", "year": "2011", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Hot N Cold", "artist": "Katy Perry", "year": "2008", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Wide Awake", "artist": "Katy Perry", "year": "2012", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Umbrella", "artist": "Rihanna ft. Jay-Z", "year": "2007", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Diamonds", "artist": "Rihanna", "year": "2012", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "We Found Love", "artist": "Rihanna ft. Calvin Harris", "year": "2011", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Only Girl (In The World)", "artist": "Rihanna", "year": "2010", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Don't Stop The Music", "artist": "Rihanna", "year": "2007", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Disturbia", "artist": "Rihanna", "year": "2008", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Work", "artist": "Rihanna ft. Drake", "year": "2016", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Where Have You Been", "artist": "Rihanna", "year": "2011", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "S&M", "artist": "Rihanna", "year": "2010", "hookStart": 36, "hookEnd": 76, "energy": 10},
        {"title": "Bad Romance", "artist": "Lady Gaga", "year": "2009", "hookStart": 50, "hookEnd": 90, "energy": 10},
        {"title": "Poker Face", "artist": "Lady Gaga", "year": "2008", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Just Dance", "artist": "Lady Gaga ft. Colby O'Donis", "year": "2008", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Born This Way", "artist": "Lady Gaga", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Applause", "artist": "Lady Gaga", "year": "2013", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Telephone", "artist": "Lady Gaga ft. Beyonce", "year": "2009", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Rain On Me", "artist": "Lady Gaga & Ariana Grande", "year": "2020", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Paparazzi", "artist": "Lady Gaga", "year": "2009", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "Alejandro", "artist": "Lady Gaga", "year": "2010", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Late Night Talking", "artist": "Harry Styles", "year": "2022", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Music for a Sushi Restaurant", "artist": "Harry Styles", "year": "2022", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Golden", "artist": "Harry Styles", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "What Do You Mean?", "artist": "Justin Bieber", "year": "2015", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Ghost", "artist": "Justin Bieber", "year": "2021", "hookStart": 33, "hookEnd": 73, "energy": 9},
        {"title": "Intentions", "artist": "Justin Bieber ft. Quavo", "year": "2020", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Boyfriend", "artist": "Justin Bieber", "year": "2012", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Baby", "artist": "Justin Bieber ft. Ludacris", "year": "2010", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Hold On", "artist": "Justin Bieber", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Stitches", "artist": "Shawn Mendes", "year": "2015", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "There's Nothing Holdin' Me Back", "artist": "Shawn Mendes", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Señorita", "artist": "Shawn Mendes & Camila Cabello", "year": "2019", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "If I Can't Have You", "artist": "Shawn Mendes", "year": "2019", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "In My Blood", "artist": "Shawn Mendes", "year": "2018", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Shivers", "artist": "Ed Sheeran", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Castle on the Hill", "artist": "Ed Sheeran", "year": "2017", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "Galway Girl", "artist": "Ed Sheeran", "year": "2017", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Overpass Graffiti", "artist": "Ed Sheeran", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Eyes Closed", "artist": "Ed Sheeran", "year": "2023", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Flowers", "artist": "Miley Cyrus", "year": "2023", "hookStart": 34, "hookEnd": 74, "energy": 9},
        {"title": "Party In The U.S.A.", "artist": "Miley Cyrus", "year": "2009", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Midnight Sky", "artist": "Miley Cyrus", "year": "2020", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "good 4 u", "artist": "Olivia Rodrigo", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "bad idea right?", "artist": "Olivia Rodrigo", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "greedy", "artist": "Tate McRae", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "exes", "artist": "Tate McRae", "year": "2023", "hookStart": 28, "hookEnd": 68, "energy": 9},
        {"title": "Good Luck, Babe!", "artist": "Chappell Roan", "year": "2024", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "HOT TO GO!", "artist": "Chappell Roan", "year": "2023", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Red Wine Supernova", "artist": "Chappell Roan", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "360", "artist": "Charli xcx", "year": "2024", "hookStart": 25, "hookEnd": 65, "energy": 9},
        {"title": "Apple", "artist": "Charli xcx", "year": "2024", "hookStart": 28, "hookEnd": 68, "energy": 9},
        {"title": "Havana", "artist": "Camila Cabello ft. Young Thug", "year": "2017", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Sweet but Psycho", "artist": "Ava Max", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Kings & Queens", "artist": "Ava Max", "year": "2020", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Without Me", "artist": "Halsey", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Symphony", "artist": "Clean Bandit ft. Zara Larsson", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Lush Life", "artist": "Zara Larsson", "year": "2015", "hookStart": 32, "hookEnd": 72, "energy": 9}
    ],

    "english-edm": [
        {"title": "Miracle", "artist": "Calvin Harris & Ellie Goulding", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Desire", "artist": "Calvin Harris & Sam Smith", "year": "2023", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Feels", "artist": "Calvin Harris ft. Pharrell Williams, Katy Perry, Big Sean", "year": "2017", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Slide", "artist": "Calvin Harris ft. Frank Ocean, Migos", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "I Need Your Love", "artist": "Calvin Harris ft. Ellie Goulding", "year": "2013", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "Sweet Nothing", "artist": "Calvin Harris ft. Florence Welch", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Outside", "artist": "Calvin Harris ft. Ellie Goulding", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Blame", "artist": "Calvin Harris ft. John Newman", "year": "2014", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "My Way", "artist": "Calvin Harris", "year": "2016", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Giant", "artist": "Calvin Harris, Rag'n'Bone Man", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Promises", "artist": "Calvin Harris, Sam Smith", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "I'm Good (Blue)", "artist": "David Guetta & Bebe Rexha", "year": "2022", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Baby Don't Hurt Me", "artist": "David Guetta, Anne-Marie, Coi Leray", "year": "2023", "hookStart": 28, "hookEnd": 68, "energy": 10},
        {"title": "Play Hard", "artist": "David Guetta ft. Ne-Yo, Akon", "year": "2013", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Hey Mama", "artist": "David Guetta ft. Nicki Minaj, Bebe Rexha, Afrojack", "year": "2015", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Without You", "artist": "David Guetta ft. Usher", "year": "2011", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "Flames", "artist": "David Guetta & Sia", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Memories", "artist": "David Guetta ft. Kid Cudi", "year": "2010", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Sexy Bitch", "artist": "David Guetta ft. Akon", "year": "2009", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "When Love Takes Over", "artist": "David Guetta ft. Kelly Rowland", "year": "2009", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Dangerous", "artist": "David Guetta ft. Sam Martin", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Lovers on the Sun", "artist": "David Guetta ft. Sam Martin", "year": "2014", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "2U", "artist": "David Guetta ft. Justin Bieber", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "I Could Be The One", "artist": "Avicii vs Nicky Romero", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Silhouettes", "artist": "Avicii", "year": "2012", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "SOS", "artist": "Avicii ft. Aloe Blacc", "year": "2019", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Without You", "artist": "Avicii ft. Sandro Cavazza", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Lonely Together", "artist": "Avicii ft. Rita Ora", "year": "2017", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "You Make Me", "artist": "Avicii", "year": "2013", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Addicted to You", "artist": "Avicii", "year": "2013", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Broken Arrows", "artist": "Avicii", "year": "2015", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "The Days", "artist": "Avicii", "year": "2014", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "There for You", "artist": "Martin Garrix & Troye Sivan", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "No Sleep", "artist": "Martin Garrix ft. Bonn", "year": "2019", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Drown", "artist": "Martin Garrix ft. Clinton Kane", "year": "2020", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Used To Love", "artist": "Martin Garrix & Dean Lewis", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Byte", "artist": "Martin Garrix & Brooks", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Wizard", "artist": "Martin Garrix & Jay Hardway", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Pizza", "artist": "Martin Garrix", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Closer", "artist": "The Chainsmokers ft. Halsey", "year": "2016", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Don't Let Me Down", "artist": "The Chainsmokers ft. Daya", "year": "2016", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Roses", "artist": "The Chainsmokers ft. ROZES", "year": "2015", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Something Just Like This", "artist": "The Chainsmokers & Coldplay", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Paris", "artist": "The Chainsmokers", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Takeaway", "artist": "The Chainsmokers & ILLENIUM ft. Lennon Stella", "year": "2019", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Side Effects", "artist": "The Chainsmokers ft. Emily Warren", "year": "2018", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Call You Mine", "artist": "The Chainsmokers ft. Bebe Rexha", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "The Business", "artist": "Tiësto", "year": "2020", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "The Motto", "artist": "Tiësto & Ava Max", "year": "2021", "hookStart": 28, "hookEnd": 68, "energy": 10},
        {"title": "10:35", "artist": "Tiësto ft. Tate McRae", "year": "2022", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Don't Be Shy", "artist": "Tiësto & Karol G", "year": "2021", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Red Lights", "artist": "Tiësto", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Wasted", "artist": "Tiësto ft. Matthew Koma", "year": "2014", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Jackie Chan", "artist": "Tiësto & Dzeko ft. Preme, Post Malone", "year": "2018", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "God is a Dancer", "artist": "Tiësto & Mabel", "year": "2019", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Secrets", "artist": "Tiësto & KSHMR ft. Vassy", "year": "2015", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "Lay Low", "artist": "Tiësto", "year": "2023", "hookStart": 28, "hookEnd": 68, "energy": 10},
        {"title": "Heroes (we could be)", "artist": "Alesso ft. Tove Lo", "year": "2014", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "Calling (Lose My Mind)", "artist": "Sebastian Ingrosso & Alesso ft. Ryan Tedder", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Remedy", "artist": "Alesso", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Words", "artist": "Alesso ft. Zara Larsson", "year": "2022", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "If I Lose Myself", "artist": "Alesso vs OneRepublic", "year": "2013", "hookStart": 48, "hookEnd": 88, "energy": 10},
        {"title": "One (Your Name)", "artist": "Swedish House Mafia ft. Pharrell", "year": "2010", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Greyhound", "artist": "Swedish House Mafia", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Antidote", "artist": "Swedish House Mafia vs. Knife Party", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Redlight", "artist": "Swedish House Mafia & Sting", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Ray of Solar", "artist": "Swedish House Mafia", "year": "2023", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Heaven Takes You Home", "artist": "Swedish House Mafia & Connie Constance", "year": "2022", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Happier", "artist": "Marshmello ft. Bastille", "year": "2018", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Silence", "artist": "Marshmello ft. Khalid", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Wolves", "artist": "Selena Gomez & Marshmello", "year": "2017", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Alone", "artist": "Marshmello", "year": "2016", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Friends", "artist": "Marshmello & Anne-Marie", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Here With Me", "artist": "Marshmello ft. CHVRCHES", "year": "2019", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Be Kind", "artist": "Marshmello & Halsey", "year": "2020", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Firestone", "artist": "Kygo ft. Conrad Sewell", "year": "2014", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Stole the Show", "artist": "Kygo ft. Parson James", "year": "2015", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "It Ain't Me", "artist": "Kygo & Selena Gomez", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Higher Love", "artist": "Kygo & Whitney Houston", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Remind Me to Forget", "artist": "Kygo ft. Miguel", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Whatever", "artist": "Kygo & Ava Max", "year": "2024", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Clarity", "artist": "Zedd ft. Foxes", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Stay", "artist": "Zedd & Alessia Cara", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "The Middle", "artist": "Zedd, Maren Morris, Grey", "year": "2018", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Beautiful Now", "artist": "Zedd ft. Jon Bellion", "year": "2015", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "I Want You to Know", "artist": "Zedd ft. Selena Gomez", "year": "2015", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Spectrum", "artist": "Zedd ft. Matthew Koma", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Stay The Night", "artist": "Zedd ft. Hayley Williams", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Bangarang", "artist": "Skrillex ft. Sirah", "year": "2012", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Scary Monsters and Nice Sprites", "artist": "Skrillex", "year": "2010", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Where Are Ü Now", "artist": "Jack Ü, Skrillex, Diplo ft. Justin Bieber", "year": "2015", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Rumble", "artist": "Skrillex, Fred again.. & Flowdan", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Leave Me Like This", "artist": "Skrillex & Bobby Raps", "year": "2023", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Losing It", "artist": "Fisher", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "You Little Beauty", "artist": "Fisher", "year": "2019", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Take It Off", "artist": "Fisher & Aatig", "year": "2023", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Yeah The Girls", "artist": "Fisher ft. MERYLL", "year": "2022", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "adore u", "artist": "Fred again.. & Obongjayar", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "leavemealone", "artist": "Fred again.. & Baby Keem", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Danielle (smile on my face)", "artist": "Fred again..", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "(It Goes Like) Nanana", "artist": "Peggy Gou", "year": "2023", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Where You Are", "artist": "John Summit & Hayla", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Shiver", "artist": "John Summit & Hayla", "year": "2024", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Go Back", "artist": "John Summit, Sub Focus & Julia Church", "year": "2024", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Rhyme Dust", "artist": "MK & Dom Dolla", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Saving Up", "artist": "Dom Dolla", "year": "2023", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Piece of Your Heart", "artist": "Meduza ft. Goodboys", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Lose Control", "artist": "Meduza, Becky Hill, Goodboys", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Do It To It", "artist": "ACRAZE ft. Cherish", "year": "2021", "hookStart": 25, "hookEnd": 65, "energy": 10},
        {"title": "Blah Blah Blah", "artist": "Armin van Buuren", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "This Is What It Feels Like", "artist": "Armin van Buuren ft. Trevor Guthrie", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Runaway (U & I)", "artist": "Galantis", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "No Money", "artist": "Galantis", "year": "2016", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Lean On", "artist": "Major Lazer & DJ Snake ft. MØ", "year": "2015", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Cold Water", "artist": "Major Lazer ft. Justin Bieber & MØ", "year": "2016", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Let Me Love You", "artist": "DJ Snake ft. Justin Bieber", "year": "2016", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Faded", "artist": "Alan Walker", "year": "2015", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Head & Heart", "artist": "Joel Corry ft. MNEK", "year": "2020", "hookStart": 32, "hookEnd": 72, "energy": 10}
    ],

    "english-hiphop": [
        {"title": "Jimmy Cooks", "artist": "Drake ft. 21 Savage", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Rich Flex", "artist": "Drake & 21 Savage", "year": "2022", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "First Person Shooter", "artist": "Drake ft. J. Cole", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Nice For What", "artist": "Drake", "year": "2018", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Nonstop", "artist": "Drake", "year": "2018", "hookStart": 28, "hookEnd": 68, "energy": 9},
        {"title": "Passionfruit", "artist": "Drake", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Search & Rescue", "artist": "Drake", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Sticky", "artist": "Drake", "year": "2022", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Started From The Bottom", "artist": "Drake", "year": "2013", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Energy", "artist": "Drake", "year": "2015", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Antidote", "artist": "Travis Scott", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "CAN'T SAY", "artist": "Travis Scott ft. Don Toliver", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "MY EYES", "artist": "Travis Scott", "year": "2023", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "I KNOW ?", "artist": "Travis Scott", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "TOPIA TWINS", "artist": "Travis Scott ft. Rob49, 21 Savage", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "MELTDOWN", "artist": "Travis Scott ft. Drake", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "STARGAZING", "artist": "Travis Scott", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "YOSEMITE", "artist": "Travis Scott ft. Gunna", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "King Kunta", "artist": "Kendrick Lamar", "year": "2015", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "LOVE.", "artist": "Kendrick Lamar ft. Zacari", "year": "2017", "hookStart": 30, "hookEnd": 70, "energy": 8},
        {"title": "LOYALTY.", "artist": "Kendrick Lamar ft. Rihanna", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Bitch, Don't Kill My Vibe", "artist": "Kendrick Lamar", "year": "2012", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "euphoria", "artist": "Kendrick Lamar", "year": "2024", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Money Trees", "artist": "Kendrick Lamar ft. Jay Rock", "year": "2012", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Poetic Justice", "artist": "Kendrick Lamar ft. Drake", "year": "2012", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "N95", "artist": "Kendrick Lamar", "year": "2022", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Not Afraid", "artist": "Eminem", "year": "2010", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "'Till I Collapse", "artist": "Eminem ft. Nate Dogg", "year": "2002", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Love The Way You Lie", "artist": "Eminem ft. Rihanna", "year": "2010", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Godzilla", "artist": "Eminem ft. Juice WRLD", "year": "2020", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Mockingbird", "artist": "Eminem", "year": "2004", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Rap God", "artist": "Eminem", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Houdini", "artist": "Eminem", "year": "2024", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Stan", "artist": "Eminem ft. Dido", "year": "2000", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Venom", "artist": "Eminem", "year": "2018", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Rockstar", "artist": "Post Malone ft. 21 Savage", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Congratulations", "artist": "Post Malone ft. Quavo", "year": "2016", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "White Iverson", "artist": "Post Malone", "year": "2015", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Better Now", "artist": "Post Malone", "year": "2018", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Wow.", "artist": "Post Malone", "year": "2018", "hookStart": 28, "hookEnd": 68, "energy": 9},
        {"title": "Psycho", "artist": "Post Malone ft. Ty Dolla $ign", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "I Fall Apart", "artist": "Post Malone", "year": "2016", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Chemical", "artist": "Post Malone", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Bodak Yellow", "artist": "Cardi B", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "I Like It", "artist": "Cardi B, Bad Bunny & J Balvin", "year": "2018", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "WAP", "artist": "Cardi B ft. Megan Thee Stallion", "year": "2020", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Up", "artist": "Cardi B", "year": "2021", "hookStart": 28, "hookEnd": 68, "energy": 10},
        {"title": "Money", "artist": "Cardi B", "year": "2018", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Super Bass", "artist": "Nicki Minaj", "year": "2010", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Starships", "artist": "Nicki Minaj", "year": "2012", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Anaconda", "artist": "Nicki Minaj", "year": "2014", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Chun-Li", "artist": "Nicki Minaj", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Super Freaky Girl", "artist": "Nicki Minaj", "year": "2022", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "FTCU", "artist": "Nicki Minaj", "year": "2023", "hookStart": 28, "hookEnd": 68, "energy": 10},
        {"title": "Bang Bang", "artist": "Jessie J, Ariana Grande, Nicki Minaj", "year": "2014", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "First Class", "artist": "Jack Harlow", "year": "2022", "hookStart": 28, "hookEnd": 68, "energy": 9},
        {"title": "Industry Baby", "artist": "Lil Nas X & Jack Harlow", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "What's Poppin", "artist": "Jack Harlow", "year": "2020", "hookStart": 25, "hookEnd": 65, "energy": 9},
        {"title": "Lovin On Me", "artist": "Jack Harlow", "year": "2023", "hookStart": 28, "hookEnd": 68, "energy": 9},
        {"title": "Nail Tech", "artist": "Jack Harlow", "year": "2022", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Old Town Road", "artist": "Lil Nas X ft. Billy Ray Cyrus", "year": "2019", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "MONTERO (Call Me By Your Name)", "artist": "Lil Nas X", "year": "2021", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "That's What I Want", "artist": "Lil Nas X", "year": "2021", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Panini", "artist": "Lil Nas X", "year": "2019", "hookStart": 25, "hookEnd": 65, "energy": 9},
        {"title": "In Da Club", "artist": "50 Cent", "year": "2003", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "Candy Shop", "artist": "50 Cent ft. Olivia", "year": "2005", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "21 Questions", "artist": "50 Cent ft. Nate Dogg", "year": "2003", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "P.I.M.P.", "artist": "50 Cent", "year": "2003", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Many Men (Wish Death)", "artist": "50 Cent", "year": "2003", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Just A Lil Bit", "artist": "50 Cent", "year": "2005", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Drop It Like It's Hot", "artist": "Snoop Dogg ft. Pharrell", "year": "2004", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Gin and Juice", "artist": "Snoop Dogg", "year": "1993", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Still D.R.E.", "artist": "Dr. Dre ft. Snoop Dogg", "year": "1999", "hookStart": 38, "hookEnd": 78, "energy": 10},
        {"title": "The Next Episode", "artist": "Dr. Dre ft. Snoop Dogg", "year": "1999", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Stronger", "artist": "Kanye West", "year": "2007", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Gold Digger", "artist": "Kanye West ft. Jamie Foxx", "year": "2005", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Heartless", "artist": "Kanye West", "year": "2008", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Can't Tell Me Nothing", "artist": "Kanye West", "year": "2007", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "POWER", "artist": "Kanye West", "year": "2010", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "All of the Lights", "artist": "Kanye West ft. Rihanna, Kid Cudi", "year": "2010", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Flashing Lights", "artist": "Kanye West ft. Dwele", "year": "2007", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "CARNIVAL", "artist": "Kanye West & Ty Dolla $ign (¥$)", "year": "2024", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Father Stretch My Hands Pt. 1", "artist": "Kanye West", "year": "2016", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Ni**as in Paris", "artist": "Jay-Z & Kanye West", "year": "2011", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Praise God", "artist": "Kanye West", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Mask Off", "artist": "Future", "year": "2017", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Life Is Good", "artist": "Future ft. Drake", "year": "2020", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "WAIT FOR U", "artist": "Future ft. Drake, Tems", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Like That", "artist": "Future, Metro Boomin, Kendrick Lamar", "year": "2024", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Superhero (Heroes & Villains)", "artist": "Metro Boomin, Future, Chris Brown", "year": "2022", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Creepin'", "artist": "Metro Boomin, The Weeknd, 21 Savage", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Too Many Nights", "artist": "Metro Boomin ft. Don Toliver, Future", "year": "2022", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Type Shit", "artist": "Future, Metro Boomin, Travis Scott, Playboi Carti", "year": "2024", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Bank Account", "artist": "21 Savage", "year": "2017", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "a lot", "artist": "21 Savage ft. J. Cole", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "redrum", "artist": "21 Savage", "year": "2024", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "No Role Modelz", "artist": "J. Cole", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "MIDDLE CHILD", "artist": "J. Cole", "year": "2019", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Wet Dreamz", "artist": "J. Cole", "year": "2014", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Dior", "artist": "Pop Smoke", "year": "2019", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "For The Night", "artist": "Pop Smoke ft. Lil Baby, DaBaby", "year": "2020", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Lucid Dreams", "artist": "Juice WRLD", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "All Girls Are The Same", "artist": "Juice WRLD", "year": "2018", "hookStart": 32, "hookEnd": 72, "energy": 8},
        {"title": "Robbery", "artist": "Juice WRLD", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "The Box", "artist": "Roddy Ricch", "year": "2019", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "fukumean", "artist": "Gunna", "year": "2023", "hookStart": 25, "hookEnd": 65, "energy": 10},
        {"title": "Drip Too Hard", "artist": "Lil Baby & Gunna", "year": "2018", "hookStart": 28, "hookEnd": 68, "energy": 9},
        {"title": "XO Tour Llif3", "artist": "Lil Uzi Vert", "year": "2017", "hookStart": 32, "hookEnd": 72, "energy": 10},
        {"title": "Paint The Town Red", "artist": "Doja Cat", "year": "2023", "hookStart": 30, "hookEnd": 70, "energy": 10},
        {"title": "Woman", "artist": "Doja Cat", "year": "2021", "hookStart": 32, "hookEnd": 72, "energy": 9}
    ],

    "english-love": [
        {"title": "Someone Like You", "artist": "Adele", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Hello", "artist": "Adele", "year": "2015", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "When We Were Young", "artist": "Adele", "year": "2015", "hookStart": 48, "hookEnd": 88, "energy": 8},
        {"title": "Set Fire to the Rain", "artist": "Adele", "year": "2011", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "All I Ask", "artist": "Adele", "year": "2015", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Send My Love (To Your New Lover)", "artist": "Adele", "year": "2015", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "One and Only", "artist": "Adele", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Photograph", "artist": "Ed Sheeran", "year": "2014", "hookStart": 42, "hookEnd": 82, "energy": 8},
        {"title": "Give Me Love", "artist": "Ed Sheeran", "year": "2011", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Dive", "artist": "Ed Sheeran", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "The A Team", "artist": "Ed Sheeran", "year": "2011", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Kiss Me", "artist": "Ed Sheeran", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Afterglow", "artist": "Ed Sheeran", "year": "2020", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Before You Go", "artist": "Lewis Capaldi", "year": "2019", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Forget Me", "artist": "Lewis Capaldi", "year": "2022", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Wish You The Best", "artist": "Lewis Capaldi", "year": "2023", "hookStart": 42, "hookEnd": 82, "energy": 8},
        {"title": "Pointless", "artist": "Lewis Capaldi", "year": "2022", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Hold Me While You Wait", "artist": "Lewis Capaldi", "year": "2019", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Bruises", "artist": "Lewis Capaldi", "year": "2019", "hookStart": 42, "hookEnd": 82, "energy": 8},
        {"title": "Ordinary People", "artist": "John Legend", "year": "2004", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Love Me Now", "artist": "John Legend", "year": "2016", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Conversations in the Dark", "artist": "John Legend", "year": "2020", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Stay With You", "artist": "John Legend", "year": "2004", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "I'm Not The Only One", "artist": "Sam Smith", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Too Good At Goodbyes", "artist": "Sam Smith", "year": "2017", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "Lay Me Down", "artist": "Sam Smith", "year": "2014", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Like I Can", "artist": "Sam Smith", "year": "2014", "hookStart": 32, "hookEnd": 72, "energy": 9},
        {"title": "Fire on Fire", "artist": "Sam Smith", "year": "2018", "hookStart": 42, "hookEnd": 82, "energy": 8},
        {"title": "Can I Be Him", "artist": "James Arthur", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Impossible", "artist": "James Arthur", "year": "2012", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "Naked", "artist": "James Arthur", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Falling like the Stars", "artist": "James Arthur", "year": "2019", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Rewrite The Stars", "artist": "James Arthur & Anne-Marie", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "drivers license", "artist": "Olivia Rodrigo", "year": "2021", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "traitor", "artist": "Olivia Rodrigo", "year": "2021", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "happier", "artist": "Olivia Rodrigo", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "logical", "artist": "Olivia Rodrigo", "year": "2023", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "vampire", "artist": "Olivia Rodrigo", "year": "2023", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "ocean eyes", "artist": "Billie Eilish", "year": "2016", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "lovely", "artist": "Billie Eilish & Khalid", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "i love you", "artist": "Billie Eilish", "year": "2019", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "when the party's over", "artist": "Billie Eilish", "year": "2018", "hookStart": 42, "hookEnd": 82, "energy": 8},
        {"title": "everything i wanted", "artist": "Billie Eilish", "year": "2019", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "The Scientist", "artist": "Coldplay", "year": "2002", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Sparks", "artist": "Coldplay", "year": "2000", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "A Sky Full of Stars", "artist": "Coldplay", "year": "2014", "hookStart": 42, "hookEnd": 82, "energy": 10},
        {"title": "Everglow", "artist": "Coldplay", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Magic", "artist": "Coldplay", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "My Universe", "artist": "Coldplay X BTS", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Clocks", "artist": "Coldplay", "year": "2002", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "When I Was Your Man", "artist": "Bruno Mars", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "It Will Rain", "artist": "Bruno Mars", "year": "2011", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "Versace on the Floor", "artist": "Bruno Mars", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Cardigan", "artist": "Taylor Swift", "year": "2020", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Enchanted", "artist": "Taylor Swift", "year": "2010", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "All Too Well", "artist": "Taylor Swift", "year": "2012", "hookStart": 55, "hookEnd": 95, "energy": 9},
        {"title": "Willow", "artist": "Taylor Swift", "year": "2020", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Daylight", "artist": "Taylor Swift", "year": "2019", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Sweet Nothing", "artist": "Taylor Swift", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Shallow", "artist": "Lady Gaga & Bradley Cooper", "year": "2018", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Always Remember Us This Way", "artist": "Lady Gaga", "year": "2018", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "Million Reasons", "artist": "Lady Gaga", "year": "2016", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Beautiful Things", "artist": "Benson Boone", "year": "2024", "hookStart": 38, "hookEnd": 78, "energy": 9},
        {"title": "In The Stars", "artist": "Benson Boone", "year": "2022", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Ghost Town", "artist": "Benson Boone", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "You Are The Reason", "artist": "Calum Scott", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Dancing On My Own", "artist": "Calum Scott", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "I'm Yours", "artist": "Jason Mraz", "year": "2008", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "I Won't Give Up", "artist": "Jason Mraz", "year": "2012", "hookStart": 42, "hookEnd": 82, "energy": 8},
        {"title": "Lucky", "artist": "Jason Mraz & Colbie Caillat", "year": "2008", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Be Alright", "artist": "Dean Lewis", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "How Do I Say Goodbye", "artist": "Dean Lewis", "year": "2022", "hookStart": 42, "hookEnd": 82, "energy": 8},
        {"title": "Riptide", "artist": "Vance Joy", "year": "2013", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "I Like Me Better", "artist": "Lauv", "year": "2017", "hookStart": 30, "hookEnd": 70, "energy": 8},
        {"title": "Paris in the Rain", "artist": "Lauv", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Falling", "artist": "Harry Styles", "year": "2019", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Sweet Creature", "artist": "Harry Styles", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Tequila", "artist": "Dan + Shay", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Speechless", "artist": "Dan + Shay", "year": "2018", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "10,000 Hours", "artist": "Dan + Shay, Justin Bieber", "year": "2019", "hookStart": 30, "hookEnd": 70, "energy": 8},
        {"title": "The Night We Met", "artist": "Lord Huron", "year": "2015", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "All I Want", "artist": "Kodaline", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Let Her Go", "artist": "Passenger", "year": "2012", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Another Love", "artist": "Tom Odell", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Dandelions", "artist": "Ruth B.", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 8}
    ]
}

def main():
    root = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER'
    output_path = os.path.join(root, 'scripts', 'curated_batches_200', 'agent_3.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    final_result = {}
    global_seen_vids = set()
    global_seen_titles = set()

    for cat in ['english-pop', 'english-edm', 'english-hiphop', 'english-love']:
        print(f"\n==========================================")
        print(f"Processing category: {cat}")
        existing_file = os.path.join(root, 'scripts', f'existing_{cat}.json')
        existing_songs = []
        if os.path.exists(existing_file):
            with open(existing_file, 'r', encoding='utf-8') as f:
                existing_songs = json.load(f)

        curated_list = []
        seen_titles = set()
        seen_vids = set()

        # Step 1: Filter existing valid songs that pass oEmbed
        print(f"Validating {len(existing_songs)} existing songs via oEmbed...")
        def check_existing(s):
            vid = s.get('videoId')
            if vid and len(vid) == 11 and vid not in BLACKLIST:
                if verify_oembed(vid):
                    return s
            return None

        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
            existing_valid = [s for s in executor.map(check_existing, existing_songs) if s]

        for s in existing_valid:
            vid = s['videoId']
            title_key = s['title'].lower().strip()
            if vid not in global_seen_vids and vid not in seen_vids and title_key not in seen_titles:
                seen_vids.add(vid)
                global_seen_vids.add(vid)
                seen_titles.add(title_key)
                global_seen_titles.add(title_key)
                curated_list.append({
                    'title': s['title'],
                    'artist': s['artist'],
                    'year': str(s.get('year') or '2022'),
                    'durationSec': int(s.get('durationSec') or 210),
                    'hookStartSec': int(s.get('hookStartSec') or 35),
                    'hookEndSec': int(s.get('hookEndSec') or 75),
                    'entrySec': int(s.get('entrySec') or s.get('hookStartSec') or 35),
                    'exitSec': int(s.get('exitSec') or s.get('hookEndSec') or 75),
                    'videoId': vid,
                    'energy': int(s.get('energy') or 9)
                })

        print(f"Retained {len(curated_list)} verified existing songs for {cat}.")

        # Step 2: Search candidates to reach at least 102 songs
        candidates = CANDIDATES.get(cat, [])
        needed = max(0, 102 - len(curated_list))
        print(f"Need ~{needed} more songs. Searching {len(candidates)} candidates...")

        def process_cand(cand):
            t_key = cand['title'].lower().strip()
            if t_key in seen_titles or t_key in global_seen_titles:
                return None
            vid, dur = search_youtube(cand['title'], cand['artist'])
            if vid and vid not in seen_vids and vid not in global_seen_vids:
                h_start = cand.get('hookStart', 35)
                h_end = cand.get('hookEnd', h_start + 40)
                return {
                    'title': cand['title'],
                    'artist': cand['artist'],
                    'year': str(cand.get('year', '2023')),
                    'durationSec': dur or 210,
                    'hookStartSec': h_start,
                    'hookEndSec': h_end,
                    'entrySec': h_start,
                    'exitSec': h_end,
                    'videoId': vid,
                    'energy': cand.get('energy', 9)
                }
            return None

        with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
            future_to_cand = [executor.submit(process_cand, c) for c in candidates]
            for future in concurrent.futures.as_completed(future_to_cand):
                res = future.result()
                if res:
                    vid = res['videoId']
                    t_key = res['title'].lower().strip()
                    if vid not in seen_vids and vid not in global_seen_vids and t_key not in seen_titles:
                        seen_vids.add(vid)
                        global_seen_vids.add(vid)
                        seen_titles.add(t_key)
                        global_seen_titles.add(t_key)
                        curated_list.append(res)
                        print(f"  + Added [{len(curated_list)}]: {res['title']} - {res['artist']} ({vid})")

        print(f"Finished {cat}: Total = {len(curated_list)} songs (target >= 100).")
        final_result[cat] = curated_list

    # Save to JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_result, f, indent=2, ensure_ascii=False)

    print(f"\n==========================================")
    print(f"Successfully saved to {output_path}!")
    for cat, songs in final_result.items():
        print(f" - {cat}: {len(songs)} songs")

if __name__ == '__main__':
    main()
