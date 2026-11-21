import json
import os
import re
import math
import time
import urllib.request
import concurrent.futures
import yt_dlp

BLACKLIST = {
    'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
    'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g', 'dQw4w9WgXcQ'
}

CACHE_FILE = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\agent_3_new_cache.json'
OUTPUT_FILE = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_english_new_categories.json'

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True,
    'default_search': 'ytsearch3',
}

# Load existing cache if any
cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
        print(f"Loaded {len(cache)} cached song queries.")
    except Exception as e:
        print(f"Error loading cache: {e}")

def save_cache():
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, indent=2)
    except Exception as e:
        print(f"Error saving cache: {e}")

def verify_oembed(video_id):
    if not video_id or len(video_id) != 11 or video_id in BLACKLIST:
        return False
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            return resp.status == 200
    except Exception:
        return False

def search_youtube(title, artist):
    cache_key = f"{title.lower()} --- {artist.lower()}"
    if cache_key in cache:
        vid, dur = cache[cache_key]
        if vid and verify_oembed(vid):
            return vid, dur

    queries = [
        f"{title} {artist} official music video",
        f"{title} {artist} official audio",
        f"{title} {artist} lyric video"
    ]
    for q in queries:
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                res = ydl.extract_info(f"ytsearch3:{q}", download=False)
                if res and 'entries' in res and res['entries']:
                    for entry in res['entries']:
                        vid = entry.get('id')
                        if not vid or len(vid) != 11 or vid in BLACKLIST:
                            continue
                        if verify_oembed(vid):
                            dur = int(entry.get('duration') or 210)
                            if dur < 80 or dur > 650:
                                dur = 210
                            cache[cache_key] = [vid, dur]
                            return vid, dur
        except Exception:
            pass

    return None, None

CANDIDATES = {
    "english-breakup": [
        {"title": "Someone Like You", "artist": "Adele", "year": "2011", "hookStart": 70, "hookEnd": 110, "energy": 6},
        {"title": "Rolling in the Deep", "artist": "Adele", "year": "2010", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Set Fire to the Rain", "artist": "Adele", "year": "2011", "hookStart": 55, "hookEnd": 95, "energy": 8},
        {"title": "Hello", "artist": "Adele", "year": "2015", "hookStart": 70, "hookEnd": 110, "energy": 7},
        {"title": "Easy On Me", "artist": "Adele", "year": "2021", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "When We Were Young", "artist": "Adele", "year": "2015", "hookStart": 75, "hookEnd": 115, "energy": 7},
        {"title": "All I Ask", "artist": "Adele", "year": "2015", "hookStart": 65, "hookEnd": 105, "energy": 6},
        {"title": "Send My Love (To Your New Lover)", "artist": "Adele", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Chasing Pavements", "artist": "Adele", "year": "2008", "hookStart": 48, "hookEnd": 88, "energy": 7},
        {"title": "Love In The Dark", "artist": "Adele", "year": "2015", "hookStart": 70, "hookEnd": 110, "energy": 6},
        {"title": "drivers license", "artist": "Olivia Rodrigo", "year": "2021", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "traitor", "artist": "Olivia Rodrigo", "year": "2021", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "happier", "artist": "Olivia Rodrigo", "year": "2021", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "deja vu", "artist": "Olivia Rodrigo", "year": "2021", "hookStart": 48, "hookEnd": 88, "energy": 7},
        {"title": "vampire", "artist": "Olivia Rodrigo", "year": "2023", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "good 4 u", "artist": "Olivia Rodrigo", "year": "2021", "hookStart": 42, "hookEnd": 82, "energy": 9},
        {"title": "bad idea right?", "artist": "Olivia Rodrigo", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "get him back!", "artist": "Olivia Rodrigo", "year": "2023", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Someone You Loved", "artist": "Lewis Capaldi", "year": "2018", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Before You Go", "artist": "Lewis Capaldi", "year": "2019", "hookStart": 48, "hookEnd": 88, "energy": 7},
        {"title": "Forget Me", "artist": "Lewis Capaldi", "year": "2022", "hookStart": 38, "hookEnd": 78, "energy": 8},
        {"title": "Bruises", "artist": "Lewis Capaldi", "year": "2017", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Hold Me While You Wait", "artist": "Lewis Capaldi", "year": "2019", "hookStart": 52, "hookEnd": 92, "energy": 7},
        {"title": "Wish You The Best", "artist": "Lewis Capaldi", "year": "2023", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Happier Than Ever", "artist": "Billie Eilish", "year": "2021", "hookStart": 180, "hookEnd": 220, "energy": 9},
        {"title": "when the party's over", "artist": "Billie Eilish", "year": "2018", "hookStart": 45, "hookEnd": 85, "energy": 5},
        {"title": "ocean eyes", "artist": "Billie Eilish", "year": "2016", "hookStart": 40, "hookEnd": 80, "energy": 5},
        {"title": "i love you", "artist": "Billie Eilish", "year": "2019", "hookStart": 60, "hookEnd": 100, "energy": 5},
        {"title": "idontwannabeyouanymore", "artist": "Billie Eilish", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "listen before i go", "artist": "Billie Eilish", "year": "2019", "hookStart": 50, "hookEnd": 90, "energy": 5},
        {"title": "everything i wanted", "artist": "Billie Eilish", "year": "2019", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Stay With Me", "artist": "Sam Smith", "year": "2014", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Too Good At Goodbyes", "artist": "Sam Smith", "year": "2017", "hookStart": 48, "hookEnd": 88, "energy": 7},
        {"title": "I'm Not The Only One", "artist": "Sam Smith", "year": "2014", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Lay Me Down", "artist": "Sam Smith", "year": "2014", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Treat You Better", "artist": "Shawn Mendes", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Mercy", "artist": "Shawn Mendes", "year": "2016", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Stitches", "artist": "Shawn Mendes", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "It'll Be Okay", "artist": "Shawn Mendes", "year": "2021", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "When You're Gone", "artist": "Shawn Mendes", "year": "2022", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Stay", "artist": "The Kid LAROI & Justin Bieber", "year": "2021", "hookStart": 25, "hookEnd": 65, "energy": 9},
        {"title": "Without You", "artist": "The Kid LAROI", "year": "2020", "hookStart": 25, "hookEnd": 65, "energy": 8},
        {"title": "All Too Well", "artist": "Taylor Swift", "year": "2012", "hookStart": 70, "hookEnd": 110, "energy": 7},
        {"title": "Back To December", "artist": "Taylor Swift", "year": "2010", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "We Are Never Ever Getting Back Together", "artist": "Taylor Swift", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "I Knew You Were Trouble", "artist": "Taylor Swift", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Teardrops On My Guitar", "artist": "Taylor Swift", "year": "2006", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Cardigan", "artist": "Taylor Swift", "year": "2020", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "The 1", "artist": "Taylor Swift", "year": "2020", "hookStart": 40, "hookEnd": 80, "energy": 6},
        {"title": "exile", "artist": "Taylor Swift ft. Bon Iver", "year": "2020", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "When I Was Your Man", "artist": "Bruno Mars", "year": "2012", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Grenade", "artist": "Bruno Mars", "year": "2010", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "We Don't Talk Anymore", "artist": "Charlie Puth ft. Selena Gomez", "year": "2016", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "Lose You To Love Me", "artist": "Selena Gomez", "year": "2019", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Without Me", "artist": "Halsey", "year": "2018", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Happier", "artist": "Ed Sheeran", "year": "2017", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Give Me Love", "artist": "Ed Sheeran", "year": "2011", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "Don't", "artist": "Ed Sheeran", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Happier", "artist": "Marshmello ft. Bastille", "year": "2018", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "The Night We Met", "artist": "Lord Huron", "year": "2015", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Breakeven", "artist": "The Script", "year": "2008", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "The Man Who Can't Be Moved", "artist": "The Script", "year": "2008", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Apocalypse", "artist": "Cigarettes After Sex", "year": "2017", "hookStart": 60, "hookEnd": 100, "energy": 5},
        {"title": "Glimpse of Us", "artist": "Joji", "year": "2022", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Slow Dancing in the Dark", "artist": "Joji", "year": "2018", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Call Out My Name", "artist": "The Weeknd", "year": "2018", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Save Your Tears", "artist": "The Weeknd", "year": "2020", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Die For You", "artist": "The Weeknd", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Heartless", "artist": "The Weeknd", "year": "2019", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Jar of Hearts", "artist": "Christina Perri", "year": "2010", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Dancing On My Own", "artist": "Calum Scott", "year": "2016", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "You Are The Reason", "artist": "Calum Scott", "year": "2017", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Apologize", "artist": "Timbaland ft. OneRepublic", "year": "2007", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Love Yourself", "artist": "Justin Bieber", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Ghost", "artist": "Justin Bieber", "year": "2021", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Total Eclipse of the Heart", "artist": "Bonnie Tyler", "year": "1983", "hookStart": 70, "hookEnd": 110, "energy": 8},
        {"title": "Un-Break My Heart", "artist": "Toni Braxton", "year": "1996", "hookStart": 65, "hookEnd": 105, "energy": 7},
        {"title": "It Must Have Been Love", "artist": "Roxette", "year": "1990", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Careless Whisper", "artist": "George Michael", "year": "1984", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "Against All Odds", "artist": "Phil Collins", "year": "1984", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Don't Speak", "artist": "No Doubt", "year": "1995", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Torn", "artist": "Natalie Imbruglia", "year": "1997", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Since U Been Gone", "artist": "Kelly Clarkson", "year": "2004", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Because of You", "artist": "Kelly Clarkson", "year": "2004", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Already Gone", "artist": "Kelly Clarkson", "year": "2009", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Bleeding Love", "artist": "Leona Lewis", "year": "2007", "hookStart": 55, "hookEnd": 95, "energy": 8},
        {"title": "Better in Time", "artist": "Leona Lewis", "year": "2007", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Big Girls Don't Cry", "artist": "Fergie", "year": "2006", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Irreplaceable", "artist": "Beyonce", "year": "2006", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "If I Were A Boy", "artist": "Beyonce", "year": "2008", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Take A Bow", "artist": "Rihanna", "year": "2008", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Stay", "artist": "Rihanna ft. Mikky Ekko", "year": "2012", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Need You Now", "artist": "Lady A", "year": "2009", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Cry Me A River", "artist": "Justin Timberlake", "year": "2002", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "What Goes Around... Comes Around", "artist": "Justin Timberlake", "year": "2006", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "Somebody That I Used To Know", "artist": "Gotye ft. Kimbra", "year": "2011", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "Say You Won't Let Go", "artist": "James Arthur", "year": "2016", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Impossible", "artist": "James Arthur", "year": "2012", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Naked", "artist": "James Arthur", "year": "2017", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Train Wreck", "artist": "James Arthur", "year": "2016", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "7 Years", "artist": "Lukas Graham", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "you broke me first", "artist": "Tate McRae", "year": "2020", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "Heather", "artist": "Conan Gray", "year": "2020", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Memories", "artist": "Conan Gray", "year": "2022", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Falling", "artist": "Harry Styles", "year": "2019", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Sign of the Times", "artist": "Harry Styles", "year": "2017", "hookStart": 65, "hookEnd": 105, "energy": 7},
        {"title": "Another Love", "artist": "Tom Odell", "year": "2012", "hookStart": 65, "hookEnd": 105, "energy": 7},
        {"title": "abcdefu", "artist": "GAYLE", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Wrecking Ball", "artist": "Miley Cyrus", "year": "2013", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Flowers", "artist": "Miley Cyrus", "year": "2023", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Angels Like You", "artist": "Miley Cyrus", "year": "2020", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "thank u, next", "artist": "Ariana Grande", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "we can't be friends (wait for your love)", "artist": "Ariana Grande", "year": "2024", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "New Rules", "artist": "Dua Lipa", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Don't Start Now", "artist": "Dua Lipa", "year": "2019", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Kill Bill", "artist": "SZA", "year": "2022", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "Nobody Gets Me", "artist": "SZA", "year": "2022", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Let Her Go", "artist": "Passenger", "year": "2012", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Say Something", "artist": "A Great Big World ft. Christina Aguilera", "year": "2013", "hookStart": 55, "hookEnd": 95, "energy": 5},
        {"title": "Be Alright", "artist": "Dean Lewis", "year": "2018", "hookStart": 45, "hookEnd": 85, "energy": 6}
    ],

    "english-trip": [
        {"title": "Fast Car", "artist": "Luke Combs", "year": "2023", "hookStart": 60, "hookEnd": 100, "energy": 8},
        {"title": "Fast Car", "artist": "Tracy Chapman", "year": "1988", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "A Sky Full of Stars", "artist": "Coldplay", "year": "2014", "hookStart": 55, "hookEnd": 95, "energy": 9},
        {"title": "Paradise", "artist": "Coldplay", "year": "2011", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Adventure of a Lifetime", "artist": "Coldplay", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Viva La Vida", "artist": "Coldplay", "year": "2008", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Yellow", "artist": "Coldplay", "year": "2000", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Clocks", "artist": "Coldplay", "year": "2002", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Riptide", "artist": "Vance Joy", "year": "2013", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Georgia", "artist": "Vance Joy", "year": "2014", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Mess Is Mine", "artist": "Vance Joy", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "Clarity", "artist": "Vance Joy", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Budapest", "artist": "George Ezra", "year": "2014", "hookStart": 35, "hookEnd": 75, "energy": 7},
        {"title": "Shotgun", "artist": "George Ezra", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Green Green Grass", "artist": "George Ezra", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Blame It on Me", "artist": "George Ezra", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Hold My Girl", "artist": "George Ezra", "year": "2018", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "On The Road Again", "artist": "Willie Nelson", "year": "1980", "hookStart": 25, "hookEnd": 65, "energy": 8},
        {"title": "Midnight City", "artist": "M83", "year": "2011", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "Counting Stars", "artist": "OneRepublic", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Good Life", "artist": "OneRepublic", "year": "2009", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "I Lived", "artist": "OneRepublic", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Stop and Stare", "artist": "OneRepublic", "year": "2007", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Secrets", "artist": "OneRepublic", "year": "2009", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Wherever I Go", "artist": "OneRepublic", "year": "2016", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Run", "artist": "OneRepublic", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Sunshine", "artist": "OneRepublic", "year": "2021", "hookStart": 30, "hookEnd": 70, "energy": 8},
        {"title": "Shut Up and Dance", "artist": "WALK THE MOON", "year": "2014", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "One Foot", "artist": "WALK THE MOON", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Send Me on My Way", "artist": "Rusted Root", "year": "1994", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Take Me Home, Country Roads", "artist": "John Denver", "year": "1971", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Pompeii", "artist": "Bastille", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Things We Lost In The Fire", "artist": "Bastille", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Safe and Sound", "artist": "Capital Cities", "year": "2011", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Life is a Highway", "artist": "Rascal Flatts", "year": "2006", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "Sweet Home Alabama", "artist": "Lynyrd Skynyrd", "year": "1974", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Hotel California", "artist": "Eagles", "year": "1976", "hookStart": 70, "hookEnd": 110, "energy": 8},
        {"title": "Take It Easy", "artist": "Eagles", "year": "1972", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Free Fallin'", "artist": "Tom Petty", "year": "1989", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Learning to Fly", "artist": "Tom Petty", "year": "1991", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "I Won't Back Down", "artist": "Tom Petty", "year": "1989", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Runnin' Down a Dream", "artist": "Tom Petty", "year": "1989", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Go Your Own Way", "artist": "Fleetwood Mac", "year": "1977", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Dreams", "artist": "Fleetwood Mac", "year": "1977", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "The Chain", "artist": "Fleetwood Mac", "year": "1977", "hookStart": 60, "hookEnd": 100, "energy": 8},
        {"title": "Don't Stop", "artist": "Fleetwood Mac", "year": "1977", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Africa", "artist": "Toto", "year": "1982", "hookStart": 60, "hookEnd": 100, "energy": 8},
        {"title": "Hold the Line", "artist": "Toto", "year": "1978", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Don't Stop Believin'", "artist": "Journey", "year": "1981", "hookStart": 60, "hookEnd": 100, "energy": 9},
        {"title": "Wheel in the Sky", "artist": "Journey", "year": "1978", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Born to Run", "artist": "Bruce Springsteen", "year": "1975", "hookStart": 55, "hookEnd": 95, "energy": 9},
        {"title": "Dancing in the Dark", "artist": "Bruce Springsteen", "year": "1984", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Born to Be Wild", "artist": "Steppenwolf", "year": "1968", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Fortunate Son", "artist": "Creedence Clearwater Revival", "year": "1969", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "Have You Ever Seen The Rain", "artist": "Creedence Clearwater Revival", "year": "1970", "hookStart": 35, "hookEnd": 75, "energy": 7},
        {"title": "Bad Moon Rising", "artist": "Creedence Clearwater Revival", "year": "1969", "hookStart": 30, "hookEnd": 70, "energy": 8},
        {"title": "Proud Mary", "artist": "Creedence Clearwater Revival", "year": "1969", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Island In The Sun", "artist": "Weezer", "year": "2001", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "Beverly Hills", "artist": "Weezer", "year": "2005", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Ho Hey", "artist": "The Lumineers", "year": "2012", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Ophelia", "artist": "The Lumineers", "year": "2016", "hookStart": 30, "hookEnd": 70, "energy": 8},
        {"title": "Stubborn Love", "artist": "The Lumineers", "year": "2012", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Home", "artist": "Edward Sharpe & The Magnetic Zeros", "year": "2009", "hookStart": 60, "hookEnd": 100, "energy": 8},
        {"title": "Little Talks", "artist": "Of Monsters and Men", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Mountain Sound", "artist": "Of Monsters and Men", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Dirty Paws", "artist": "Of Monsters and Men", "year": "2011", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Castle on the Hill", "artist": "Ed Sheeran", "year": "2017", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "Galway Girl", "artist": "Ed Sheeran", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Barcelona", "artist": "Ed Sheeran", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "I'm Gonna Be (500 Miles)", "artist": "The Proclaimers", "year": "1988", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Wake Me Up", "artist": "Avicii", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Hey Brother", "artist": "Avicii", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "The Nights", "artist": "Avicii", "year": "2014", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Waiting For Love", "artist": "Avicii", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Best Day Of My Life", "artist": "American Authors", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Tongue Tied", "artist": "Grouplove", "year": "2011", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Kids", "artist": "MGMT", "year": "2007", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "Electric Feel", "artist": "MGMT", "year": "2007", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Time to Pretend", "artist": "MGMT", "year": "2007", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "1901", "artist": "Phoenix", "year": "2009", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Dog Days Are Over", "artist": "Florence + The Machine", "year": "2008", "hookStart": 60, "hookEnd": 100, "energy": 9},
        {"title": "You've Got the Love", "artist": "Florence + The Machine", "year": "2009", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Home", "artist": "Phillip Phillips", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Gone, Gone, Gone", "artist": "Phillip Phillips", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Stolen Dance", "artist": "Milky Chance", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Colorado", "artist": "Milky Chance", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Down Under", "artist": "Men at Work", "year": "1981", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Mr. Brightside", "artist": "The Killers", "year": "2004", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Somebody Told Me", "artist": "The Killers", "year": "2004", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "When You Were Young", "artist": "The Killers", "year": "2006", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "The Less I Know The Better", "artist": "Tame Impala", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Borderline", "artist": "Tame Impala", "year": "2019", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Drive", "artist": "Incubus", "year": "1999", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Santeria", "artist": "Sublime", "year": "1996", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Californication", "artist": "Red Hot Chili Peppers", "year": "1999", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Scar Tissue", "artist": "Red Hot Chili Peppers", "year": "1999", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "Under The Bridge", "artist": "Red Hot Chili Peppers", "year": "1991", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "Dani California", "artist": "Red Hot Chili Peppers", "year": "2006", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Snow (Hey Oh)", "artist": "Red Hot Chili Peppers", "year": "2006", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Can't Stop", "artist": "Red Hot Chili Peppers", "year": "2002", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Road Trippin'", "artist": "Red Hot Chili Peppers", "year": "1999", "hookStart": 40, "hookEnd": 80, "energy": 6},
        {"title": "Wagon Wheel", "artist": "Darius Rucker", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Chicken Fried", "artist": "Zac Brown Band", "year": "2008", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Escape (The Pina Colada Song)", "artist": "Rupert Holmes", "year": "1979", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Surfin' U.S.A.", "artist": "The Beach Boys", "year": "1963", "hookStart": 30, "hookEnd": 70, "energy": 8},
        {"title": "Good Vibrations", "artist": "The Beach Boys", "year": "1966", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Kokomo", "artist": "The Beach Boys", "year": "1988", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "A Horse with No Name", "artist": "America", "year": "1971", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "Ventura Highway", "artist": "America", "year": "1972", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "California Dreamin'", "artist": "The Mamas & The Papas", "year": "1965", "hookStart": 35, "hookEnd": 75, "energy": 7},
        {"title": "(Sittin' On) The Dock of the Bay", "artist": "Otis Redding", "year": "1968", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "Soak Up The Sun", "artist": "Sheryl Crow", "year": "2002", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "All I Wanna Do", "artist": "Sheryl Crow", "year": "1993", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Everyday Is a Winding Road", "artist": "Sheryl Crow", "year": "1996", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Ends of the Earth", "artist": "Lord Huron", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Walking On A Dream", "artist": "Empire of the Sun", "year": "2008", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Alive", "artist": "Empire of the Sun", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Pumped Up Kicks", "artist": "Foster The People", "year": "2010", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Feel It Still", "artist": "Portugal. The Man", "year": "2017", "hookStart": 30, "hookEnd": 70, "energy": 8},
        {"title": "What You Know", "artist": "Two Door Cinema Club", "year": "2010", "hookStart": 35, "hookEnd": 75, "energy": 9}
    ],

    "english-emotional": [
        {"title": "Fix You", "artist": "Coldplay", "year": "2005", "hookStart": 80, "hookEnd": 120, "energy": 7},
        {"title": "The Scientist", "artist": "Coldplay", "year": "2002", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Sparks", "artist": "Coldplay", "year": "2000", "hookStart": 45, "hookEnd": 85, "energy": 5},
        {"title": "Trouble", "artist": "Coldplay", "year": "2000", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "All of Me", "artist": "John Legend", "year": "2013", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Ordinary People", "artist": "John Legend", "year": "2004", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Stay With You", "artist": "John Legend", "year": "2004", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "The Night We Met", "artist": "Lord Huron", "year": "2015", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Let Her Go", "artist": "Passenger", "year": "2012", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Holes", "artist": "Passenger", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Say You Won't Let Go", "artist": "James Arthur", "year": "2016", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Train Wreck", "artist": "James Arthur", "year": "2016", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Can I Be Him", "artist": "James Arthur", "year": "2016", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Falling like the Stars", "artist": "James Arthur", "year": "2019", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Car's Outside", "artist": "James Arthur", "year": "2021", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Skinny Love", "artist": "Bon Iver", "year": "2007", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Holocene", "artist": "Bon Iver", "year": "2011", "hookStart": 60, "hookEnd": 100, "energy": 5},
        {"title": "Re: Stacks", "artist": "Bon Iver", "year": "2007", "hookStart": 60, "hookEnd": 100, "energy": 5},
        {"title": "Photograph", "artist": "Ed Sheeran", "year": "2014", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Thinking Out Loud", "artist": "Ed Sheeran", "year": "2014", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Perfect", "artist": "Ed Sheeran", "year": "2017", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Supermarket Flowers", "artist": "Ed Sheeran", "year": "2017", "hookStart": 55, "hookEnd": 95, "energy": 5},
        {"title": "Tenerife Sea", "artist": "Ed Sheeran", "year": "2014", "hookStart": 55, "hookEnd": 95, "energy": 5},
        {"title": "The A Team", "artist": "Ed Sheeran", "year": "2011", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Shallow", "artist": "Lady Gaga & Bradley Cooper", "year": "2018", "hookStart": 60, "hookEnd": 100, "energy": 8},
        {"title": "Always Remember Us This Way", "artist": "Lady Gaga", "year": "2018", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "I'll Never Love Again", "artist": "Lady Gaga", "year": "2018", "hookStart": 70, "hookEnd": 110, "energy": 7},
        {"title": "Million Reasons", "artist": "Lady Gaga", "year": "2016", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Arcade", "artist": "Duncan Laurence", "year": "2019", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "In The End", "artist": "Linkin Park", "year": "2000", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "One More Light", "artist": "Linkin Park", "year": "2017", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Leave Out All The Rest", "artist": "Linkin Park", "year": "2007", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Shadow of the Day", "artist": "Linkin Park", "year": "2007", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Castle of Glass", "artist": "Linkin Park", "year": "2012", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Gravity", "artist": "Sara Bareilles", "year": "2007", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Breathe Me", "artist": "Sia", "year": "2004", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Snowman", "artist": "Sia", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Make You Feel My Love", "artist": "Adele", "year": "2008", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Remedy", "artist": "Adele", "year": "2015", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Million Years Ago", "artist": "Adele", "year": "2015", "hookStart": 50, "hookEnd": 90, "energy": 5},
        {"title": "All I Want", "artist": "Kodaline", "year": "2013", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "High Hopes", "artist": "Kodaline", "year": "2013", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "Brother", "artist": "Kodaline", "year": "2017", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "The One", "artist": "Kodaline", "year": "2015", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Wherever You Will Go", "artist": "The Calling", "year": "2001", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Iris", "artist": "Goo Goo Dolls", "year": "1998", "hookStart": 55, "hookEnd": 95, "energy": 8},
        {"title": "Chasing Cars", "artist": "Snow Patrol", "year": "2006", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "Run", "artist": "Snow Patrol", "year": "2003", "hookStart": 65, "hookEnd": 105, "energy": 7},
        {"title": "How to Save a Life", "artist": "The Fray", "year": "2005", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "You Found Me", "artist": "The Fray", "year": "2008", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Over My Head (Cable Car)", "artist": "The Fray", "year": "2005", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Look After You", "artist": "The Fray", "year": "2005", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Never Say Never", "artist": "The Fray", "year": "2008", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Creep", "artist": "Radiohead", "year": "1992", "hookStart": 55, "hookEnd": 95, "energy": 8},
        {"title": "Karma Police", "artist": "Radiohead", "year": "1997", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "No Surprises", "artist": "Radiohead", "year": "1997", "hookStart": 50, "hookEnd": 90, "energy": 5},
        {"title": "Fake Plastic Trees", "artist": "Radiohead", "year": "1995", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "High and Dry", "artist": "Radiohead", "year": "1995", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "The Sound of Silence", "artist": "Disturbed", "year": "2015", "hookStart": 65, "hookEnd": 105, "energy": 8},
        {"title": "The Sound of Silence", "artist": "Simon & Garfunkel", "year": "1964", "hookStart": 40, "hookEnd": 80, "energy": 5},
        {"title": "Bridge Over Troubled Water", "artist": "Simon & Garfunkel", "year": "1970", "hookStart": 65, "hookEnd": 105, "energy": 6},
        {"title": "Hallelujah", "artist": "Jeff Buckley", "year": "1994", "hookStart": 70, "hookEnd": 110, "energy": 6},
        {"title": "Mad World", "artist": "Gary Jules", "year": "2001", "hookStart": 45, "hookEnd": 85, "energy": 5},
        {"title": "My Immortal", "artist": "Evanescence", "year": "2003", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "Wake Me Up When September Ends", "artist": "Green Day", "year": "2004", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Boulevard of Broken Dreams", "artist": "Green Day", "year": "2004", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "21 Guns", "artist": "Green Day", "year": "2009", "hookStart": 55, "hookEnd": 95, "energy": 7},
        {"title": "Hurt", "artist": "Johnny Cash", "year": "2002", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Tears in Heaven", "artist": "Eric Clapton", "year": "1992", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Wonderful Tonight", "artist": "Eric Clapton", "year": "1977", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "I Will Always Love You", "artist": "Whitney Houston", "year": "1992", "hookStart": 70, "hookEnd": 110, "energy": 8},
        {"title": "I Have Nothing", "artist": "Whitney Houston", "year": "1992", "hookStart": 65, "hookEnd": 105, "energy": 7},
        {"title": "Take Me To Church", "artist": "Hozier", "year": "2013", "hookStart": 50, "hookEnd": 90, "energy": 8},
        {"title": "Cherry Wine", "artist": "Hozier", "year": "2014", "hookStart": 50, "hookEnd": 90, "energy": 5},
        {"title": "Work Song", "artist": "Hozier", "year": "2014", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Like Real People Do", "artist": "Hozier", "year": "2014", "hookStart": 45, "hookEnd": 85, "energy": 5},
        {"title": "Too Sweet", "artist": "Hozier", "year": "2024", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Writing's on the Wall", "artist": "Sam Smith", "year": "2015", "hookStart": 65, "hookEnd": 105, "energy": 7},
        {"title": "Where's My Love", "artist": "SYML", "year": "2017", "hookStart": 50, "hookEnd": 90, "energy": 5},
        {"title": "Lost Boy", "artist": "Ruth B.", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 5},
        {"title": "Dandelions", "artist": "Ruth B.", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Slow Dancing in a Burning Room", "artist": "John Mayer", "year": "2006", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Gravity", "artist": "John Mayer", "year": "2006", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Stop This Train", "artist": "John Mayer", "year": "2006", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Let It Go", "artist": "James Bay", "year": "2014", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Hold Back The River", "artist": "James Bay", "year": "2014", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Us", "artist": "James Bay", "year": "2018", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Heal", "artist": "Tom Odell", "year": "2013", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Let Me Down Slowly", "artist": "Alec Benjamin", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 6},
        {"title": "Water Fountain", "artist": "Alec Benjamin", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 6},
        {"title": "Someone To You", "artist": "Banners", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Waves", "artist": "Dean Lewis", "year": "2016", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "How Do I Say Goodbye", "artist": "Dean Lewis", "year": "2022", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Jealous", "artist": "Labrinth", "year": "2014", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Until I Found You", "artist": "Stephen Sanchez", "year": "2021", "hookStart": 40, "hookEnd": 80, "energy": 7},
        {"title": "Beautiful Things", "artist": "Benson Boone", "year": "2024", "hookStart": 60, "hookEnd": 100, "energy": 8},
        {"title": "In The Stars", "artist": "Benson Boone", "year": "2022", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Ghost Town", "artist": "Benson Boone", "year": "2021", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Here With Me", "artist": "d4vd", "year": "2022", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Romantic Homicide", "artist": "d4vd", "year": "2022", "hookStart": 40, "hookEnd": 80, "energy": 6},
        {"title": "golden hour", "artist": "JVKE", "year": "2022", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Daylight", "artist": "David Kushner", "year": "2023", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "Stick Season", "artist": "Noah Kahan", "year": "2022", "hookStart": 45, "hookEnd": 85, "energy": 7},
        {"title": "Dial Drunk", "artist": "Noah Kahan", "year": "2023", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "Something in the Orange", "artist": "Zach Bryan", "year": "2022", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "I Remember Everything", "artist": "Zach Bryan ft. Kacey Musgraves", "year": "2023", "hookStart": 45, "hookEnd": 85, "energy": 6},
        {"title": "Champagne Problems", "artist": "Taylor Swift", "year": "2020", "hookStart": 60, "hookEnd": 100, "energy": 6},
        {"title": "Skinny Love", "artist": "Birdy", "year": "2011", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Wings", "artist": "Birdy", "year": "2013", "hookStart": 50, "hookEnd": 90, "energy": 7},
        {"title": "People Help The People", "artist": "Birdy", "year": "2011", "hookStart": 55, "hookEnd": 95, "energy": 6},
        {"title": "Hurt", "artist": "Christina Aguilera", "year": "2006", "hookStart": 60, "hookEnd": 100, "energy": 7},
        {"title": "Youth", "artist": "Daughter", "year": "2013", "hookStart": 50, "hookEnd": 90, "energy": 6},
        {"title": "Medicine", "artist": "Daughter", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 5},
        {"title": "Anchor", "artist": "Novo Amor", "year": "2015", "hookStart": 55, "hookEnd": 95, "energy": 5},
        {"title": "Carry You", "artist": "Novo Amor", "year": "2017", "hookStart": 50, "hookEnd": 90, "energy": 5},
        {"title": "State Lines", "artist": "Novo Amor", "year": "2018", "hookStart": 45, "hookEnd": 85, "energy": 5},
        {"title": "Wait", "artist": "M83", "year": "2011", "hookStart": 65, "hookEnd": 105, "energy": 6},
        {"title": "Saturn", "artist": "Sleeping At Last", "year": "2014", "hookStart": 75, "hookEnd": 115, "energy": 6},
        {"title": "Turning Page", "artist": "Sleeping At Last", "year": "2011", "hookStart": 60, "hookEnd": 100, "energy": 5},
        {"title": "Already Gone", "artist": "Sleeping At Last", "year": "2014", "hookStart": 50, "hookEnd": 90, "energy": 5}
    ],

    "english-motivating": [
        {"title": "Eye of the Tiger", "artist": "Survivor", "year": "1982", "hookStart": 50, "hookEnd": 90, "energy": 10},
        {"title": "Burning Heart", "artist": "Survivor", "year": "1985", "hookStart": 55, "hookEnd": 95, "energy": 9},
        {"title": "Lose Yourself", "artist": "Eminem", "year": "2002", "hookStart": 50, "hookEnd": 90, "energy": 10},
        {"title": "'Till I Collapse", "artist": "Eminem ft. Nate Dogg", "year": "2002", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Not Afraid", "artist": "Eminem", "year": "2010", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Survival", "artist": "Eminem", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Phenomenal", "artist": "Eminem", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Cinderella Man", "artist": "Eminem", "year": "2010", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "The Monster", "artist": "Eminem ft. Rihanna", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Without Me", "artist": "Eminem", "year": "2002", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Can't Hold Us", "artist": "Macklemore & Ryan Lewis ft. Ray Dalton", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Hall of Fame", "artist": "The Script ft. will.i.am", "year": "2012", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Stronger", "artist": "Kanye West", "year": "2007", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Power", "artist": "Kanye West", "year": "2010", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Black Skinhead", "artist": "Kanye West", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "All of the Lights", "artist": "Kanye West", "year": "2010", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "Touch The Sky", "artist": "Kanye West", "year": "2005", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Champion", "artist": "Kanye West", "year": "2007", "hookStart": 35, "hookEnd": 75, "energy": 8},
        {"title": "Believer", "artist": "Imagine Dragons", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Whatever It Takes", "artist": "Imagine Dragons", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Thunder", "artist": "Imagine Dragons", "year": "2017", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Radioactive", "artist": "Imagine Dragons", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Natural", "artist": "Imagine Dragons", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Bones", "artist": "Imagine Dragons", "year": "2022", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Warriors", "artist": "Imagine Dragons", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "On Top of the World", "artist": "Imagine Dragons", "year": "2012", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Enemy", "artist": "Imagine Dragons & JID", "year": "2021", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Sharks", "artist": "Imagine Dragons", "year": "2022", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Demons", "artist": "Imagine Dragons", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Remember the Name", "artist": "Fort Minor", "year": "2005", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Unstoppable", "artist": "Sia", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "The Greatest", "artist": "Sia ft. Kendrick Lamar", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Alive", "artist": "Sia", "year": "2015", "hookStart": 55, "hookEnd": 95, "energy": 9},
        {"title": "Centuries", "artist": "Fall Out Boy", "year": "2014", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "The Phoenix", "artist": "Fall Out Boy", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "My Songs Know What You Did In The Dark (Light Em Up)", "artist": "Fall Out Boy", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Immortals", "artist": "Fall Out Boy", "year": "2014", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Champion", "artist": "Fall Out Boy", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Thnks fr th Mmrs", "artist": "Fall Out Boy", "year": "2007", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Born for This", "artist": "The Score", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Legend", "artist": "The Score", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Unstoppable", "artist": "The Score", "year": "2016", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Stronger", "artist": "The Score", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Glory", "artist": "The Score", "year": "2019", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Revolution", "artist": "The Score", "year": "2017", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Higher", "artist": "The Score", "year": "2017", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Monster", "artist": "Skillet", "year": "2009", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Hero", "artist": "Skillet", "year": "2009", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Feel Invincible", "artist": "Skillet", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "The Resistance", "artist": "Skillet", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Awake and Alive", "artist": "Skillet", "year": "2009", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Legendary", "artist": "Skillet", "year": "2019", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Welcome To The Jungle", "artist": "Guns N' Roses", "year": "1987", "hookStart": 50, "hookEnd": 90, "energy": 10},
        {"title": "Thunderstruck", "artist": "AC/DC", "year": "1990", "hookStart": 50, "hookEnd": 90, "energy": 10},
        {"title": "Back In Black", "artist": "AC/DC", "year": "1980", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Highway to Hell", "artist": "AC/DC", "year": "1979", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "T.N.T.", "artist": "AC/DC", "year": "1975", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Shoot to Thrill", "artist": "AC/DC", "year": "1980", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "Seven Nation Army", "artist": "The White Stripes", "year": "2003", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Song 2", "artist": "Blur", "year": "1997", "hookStart": 25, "hookEnd": 65, "energy": 10},
        {"title": "Jump", "artist": "Van Halen", "year": "1984", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Panama", "artist": "Van Halen", "year": "1984", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Kickstart My Heart", "artist": "Motley Crue", "year": "1989", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Down with the Sickness", "artist": "Disturbed", "year": "2000", "hookStart": 50, "hookEnd": 90, "energy": 10},
        {"title": "Indestructible", "artist": "Disturbed", "year": "2008", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Ten Thousand Fists", "artist": "Disturbed", "year": "2005", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Numb", "artist": "Linkin Park", "year": "2003", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Faint", "artist": "Linkin Park", "year": "2003", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "Bleed It Out", "artist": "Linkin Park", "year": "2007", "hookStart": 35, "hookEnd": 75, "energy": 10},
        {"title": "What I've Done", "artist": "Linkin Park", "year": "2007", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Burn It Down", "artist": "Linkin Park", "year": "2012", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "One Step Closer", "artist": "Linkin Park", "year": "2000", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "New Divide", "artist": "Linkin Park", "year": "2009", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Run Boy Run", "artist": "Woodkid", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Iron", "artist": "Woodkid", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Don't Stop Me Now", "artist": "Queen", "year": "1978", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "We Will Rock You", "artist": "Queen", "year": "1977", "hookStart": 25, "hookEnd": 65, "energy": 9},
        {"title": "We Are The Champions", "artist": "Queen", "year": "1977", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Another One Bites the Dust", "artist": "Queen", "year": "1980", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "Under Pressure", "artist": "Queen & David Bowie", "year": "1981", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Gonna Fly Now", "artist": "Bill Conti", "year": "1976", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Danger Zone", "artist": "Kenny Loggins", "year": "1986", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Footloose", "artist": "Kenny Loggins", "year": "1984", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "The Final Countdown", "artist": "Europe", "year": "1986", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "You're the Best", "artist": "Joe Esposito", "year": "1984", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Titanium", "artist": "David Guetta ft. Sia", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Work Bitch", "artist": "Britney Spears", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 10},
        {"title": "Stronger (What Doesn't Kill You)", "artist": "Kelly Clarkson", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Roar", "artist": "Katy Perry", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Fight Song", "artist": "Rachel Platten", "year": "2015", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "High Hopes", "artist": "Panic! At The Disco", "year": "2018", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Hey Look Ma, I Made It", "artist": "Panic! At The Disco", "year": "2018", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Victorious", "artist": "Panic! At The Disco", "year": "2015", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Level Up", "artist": "Ciara", "year": "2018", "hookStart": 30, "hookEnd": 70, "energy": 9},
        {"title": "All I Do Is Win", "artist": "DJ Khaled", "year": "2010", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "Turn Down for What", "artist": "DJ Snake, Lil Jon", "year": "2013", "hookStart": 25, "hookEnd": 65, "energy": 10},
        {"title": "Let's Go", "artist": "Calvin Harris ft. Ne-Yo", "year": "2012", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Under Control", "artist": "Calvin Harris & Alesso ft. Hurts", "year": "2013", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Summer", "artist": "Calvin Harris", "year": "2014", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Blinding Lights", "artist": "The Weeknd", "year": "2019", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Starboy", "artist": "The Weeknd ft. Daft Punk", "year": "2016", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Can't Stop The Feeling!", "artist": "Justin Timberlake", "year": "2016", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Uptown Funk", "artist": "Mark Ronson ft. Bruno Mars", "year": "2014", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "24K Magic", "artist": "Bruno Mars", "year": "2016", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Happy", "artist": "Pharrell Williams", "year": "2013", "hookStart": 40, "hookEnd": 80, "energy": 8},
        {"title": "High on You", "artist": "Survivor", "year": "1984", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "I Can't Hold Back", "artist": "Survivor", "year": "1984", "hookStart": 45, "hookEnd": 85, "energy": 8},
        {"title": "St. Elmo's Fire (Man in Motion)", "artist": "John Parr", "year": "1985", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "The Touch", "artist": "Stan Bush", "year": "1986", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "Livin' On A Prayer", "artist": "Bon Jovi", "year": "1986", "hookStart": 55, "hookEnd": 95, "energy": 9},
        {"title": "It's My Life", "artist": "Bon Jovi", "year": "2000", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "You Give Love A Bad Name", "artist": "Bon Jovi", "year": "1986", "hookStart": 35, "hookEnd": 75, "energy": 9},
        {"title": "The Pretender", "artist": "Foo Fighters", "year": "2007", "hookStart": 50, "hookEnd": 90, "energy": 10},
        {"title": "Everlong", "artist": "Foo Fighters", "year": "1997", "hookStart": 45, "hookEnd": 85, "energy": 9},
        {"title": "All My Life", "artist": "Foo Fighters", "year": "2002", "hookStart": 40, "hookEnd": 80, "energy": 9},
        {"title": "Savior", "artist": "Rise Against", "year": "2008", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Prayer of the Refugee", "artist": "Rise Against", "year": "2006", "hookStart": 45, "hookEnd": 85, "energy": 10},
        {"title": "Closer to the Edge", "artist": "30 Seconds to Mars", "year": "2009", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "This Is War", "artist": "30 Seconds to Mars", "year": "2009", "hookStart": 50, "hookEnd": 90, "energy": 9},
        {"title": "Levels", "artist": "Avicii", "year": "2011", "hookStart": 45, "hookEnd": 85, "energy": 10}
    ]
}

def resolve_song(candidate):
    title = candidate['title']
    artist = candidate['artist']
    vid, dur = search_youtube(title, artist)
    return candidate, vid, dur

def generate_heat_curve(length=15):
    # Generates 15 numbers oscillating smoothly between 0.2 and 0.95
    return [round(0.55 + 0.38 * math.sin(i / 1.5), 3) for i in range(length)]

def main():
    final_output = {}
    total_curated = 0

    print("=== STARTING PARALLEL RESOLUTION OF 4 ENGLISH CATEGORIES ===")
    
    for slug, song_list in CANDIDATES.items():
        print(f"\nProcessing category '{slug}' with {len(song_list)} candidates...")
        resolved_songs = []
        seen_titles = set()
        seen_vids = set()

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            future_to_song = {executor.submit(resolve_song, s): s for s in song_list}
            for future in concurrent.futures.as_completed(future_to_song):
                cand, vid, dur = future.result()
                if not vid:
                    print(f"  [MISS] Could not resolve: {cand['title']} - {cand['artist']}")
                    continue
                
                norm_title = cand['title'].lower().strip()
                if norm_title in seen_titles:
                    print(f"  [DUP-TITLE] {cand['title']}")
                    continue
                if vid in seen_vids:
                    print(f"  [DUP-VID] {vid} for {cand['title']}")
                    continue

                seen_titles.add(norm_title)
                seen_vids.add(vid)

                duration = dur or 210
                hook_start = cand.get('hookStart', 45)
                hook_end = cand.get('hookEnd', hook_start + 40)
                if hook_end > duration - 10:
                    hook_end = max(duration - 5, hook_start + 20)

                resolved_songs.append({
                    "raw_cand": cand,
                    "videoId": vid,
                    "durationSec": duration,
                    "hookStartSec": hook_start,
                    "hookEndSec": hook_end,
                })

        # Save cache periodically
        save_cache()

        print(f"Resolved {len(resolved_songs)} valid unique songs for '{slug}'.")
        
        # Check requirement: >= 100
        if len(resolved_songs) < 100:
            print(f"WARNING: '{slug}' has {len(resolved_songs)} < 100 songs! Needs fallback.")
        
        # Format track objects according to specification
        formatted_tracks = []
        for idx, item in enumerate(resolved_songs):
            c = item["raw_cand"]
            track_id = f"{slug}-{idx + 1}"
            track = {
                "id": track_id,
                "title": c["title"],
                "artist": c["artist"],
                "year": str(c.get("year", "2024")),
                "durationSec": item["durationSec"],
                "hookStartSec": item["hookStartSec"],
                "hookEndSec": item["hookEndSec"],
                "entrySec": item["hookStartSec"],
                "exitSec": item["hookEndSec"],
                "videoId": item["videoId"],
                "youtube_ids": [item["videoId"]],
                "playFull": False,
                "energy": c.get("energy", 8),
                "heat": generate_heat_curve(15)
            }
            formatted_tracks.append(track)

        final_output[slug] = formatted_tracks
        total_curated += len(formatted_tracks)
        print(f"Formatted {len(formatted_tracks)} tracks for '{slug}'.")

    # Save to final output file
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, indent=2, ensure_ascii=False)

    print(f"\nSuccessfully wrote {total_curated} tracks across 4 categories to:")
    print(OUTPUT_FILE)

if __name__ == '__main__':
    main()
