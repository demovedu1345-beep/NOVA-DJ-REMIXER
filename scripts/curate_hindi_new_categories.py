import os
import re
import json
import time
import urllib.request
import concurrent.futures
import yt_dlp

SCRIPT_DIR = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts"
OUT_FILE = os.path.join(SCRIPT_DIR, "curated_hindi_new_categories.json")
DB_FILE = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\public\js\engine\curated-songs-db.js"
LOCAL_CACHE_FILE = os.path.join(SCRIPT_DIR, "hindi_new_categories_cache.json")

BLACKLIST = {
    'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
    'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g'
}

# 1. Load existing DB songs
DB_CACHE = {}
if os.path.exists(DB_FILE):
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            text = f.read()
        db_data = json.loads(text[text.find('{'):text.rfind('}')+1])
        for cat in db_data.values():
            for s in cat.get('songs', []):
                t = s.get('title', '').strip().lower()
                v = s.get('videoId', '').strip()
                if t and v and len(v) == 11 and v not in BLACKLIST:
                    if t not in DB_CACHE:
                        DB_CACHE[t] = s
    except Exception as e:
        print("Warning loading DB_FILE:", e)

# 2. Load local cache
LOCAL_CACHE = {}
if os.path.exists(LOCAL_CACHE_FILE):
    try:
        with open(LOCAL_CACHE_FILE, 'r', encoding='utf-8') as f:
            LOCAL_CACHE = json.load(f)
    except Exception as e:
        print("Warning loading LOCAL_CACHE_FILE:", e)

def save_local_cache():
    try:
        with open(LOCAL_CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(LOCAL_CACHE, f, indent=2)
    except Exception as e:
        print("Error saving local cache:", e)

def clean_title(title):
    return re.sub(r'[\(\[\{].*?[\)\]\}]', '', title).strip().lower()

def check_oembed(vid):
    if not vid or len(vid) != 11 or vid in BLACKLIST:
        return None
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode())
                return data.get('title')
    except Exception:
        pass
    return None

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True,
    'default_search': 'ytsearch1'
}

def resolve_song(cand):
    title = cand['title'].strip()
    artist = cand['artist'].strip()
    query = cand.get('query') or f"{title} {artist} official video"
    norm_title = clean_title(title)

    # 1. Check local cache
    if query in LOCAL_CACHE:
        c_entry = LOCAL_CACHE[query]
        vid = c_entry.get('videoId')
        if vid and len(vid) == 11 and vid not in BLACKLIST:
            dur = c_entry.get('durationSec', 210)
            return vid, dur

    # 2. Check DB Cache
    if norm_title in DB_CACHE:
        s = DB_CACHE[norm_title]
        vid = s.get('videoId')
        if vid and len(vid) == 11 and vid not in BLACKLIST:
            dur = s.get('durationSec', 210)
            LOCAL_CACHE[query] = {'videoId': vid, 'durationSec': dur}
            return vid, dur

    # 3. Search via yt-dlp
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch1:{query}", download=False)
            if res and res.get('entries'):
                entry = res['entries'][0]
                vid = entry.get('id')
                if vid and len(vid) == 11 and vid not in BLACKLIST:
                    oembed_title = check_oembed(vid)
                    if oembed_title:
                        dur = int(entry.get('duration') or 210)
                        if dur < 100 or dur > 500:
                            dur = 220
                        LOCAL_CACHE[query] = {'videoId': vid, 'durationSec': dur}
                        return vid, dur
    except Exception:
        pass

    # 4. Fallback search with simplified query
    try:
        simple_q = f"{title} song"
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch1:{simple_q}", download=False)
            if res and res.get('entries'):
                entry = res['entries'][0]
                vid = entry.get('id')
                if vid and len(vid) == 11 and vid not in BLACKLIST:
                    if check_oembed(vid):
                        dur = int(entry.get('duration') or 210)
                        if dur < 100 or dur > 500:
                            dur = 220
                        LOCAL_CACHE[query] = {'videoId': vid, 'durationSec': dur}
                        return vid, dur
    except Exception:
        pass

    return None, None

def generate_heat(hook_start, hook_end, duration, energy):
    heat = []
    base = max(0.25, min(0.9, energy / 10.0))
    for i in range(15):
        pos = (i + 0.5) / 15.0
        t = pos * duration
        if hook_start <= t <= hook_end:
            val = min(1.0, base + 0.28)
        elif abs(t - hook_start) < 25 or abs(t - hook_end) < 25:
            val = min(0.92, base + 0.15)
        elif t < hook_start:
            val = base * (0.65 + 0.35 * (t / max(1, hook_start)))
        else:
            val = max(0.2, base * 0.72)
        heat.append(round(float(val), 3))
    return heat
