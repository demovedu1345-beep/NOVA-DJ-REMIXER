import json
import re
import urllib.request
import concurrent.futures

content = open(r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\curated-songs-db.js', encoding='utf-8').read()

def extract_cat(cat_name):
    idx = content.find(f'"{cat_name}"')
    if idx == -1:
        idx = content.find(f"'{cat_name}'")
    songs_idx = content.find('songs:', idx)
    bracket_start = content.find('[', songs_idx)
    depth = 0
    bracket_end = -1
    for i in range(bracket_start, len(content)):
        if content[i] == '[':
            depth += 1
        elif content[i] == ']':
            depth -= 1
            if depth == 0:
                bracket_end = i
                break
    block = content[bracket_start:bracket_end+1]
    
    # We can split by { ... } or regex
    # Match each object { ... }
    # To be safe, find indices of { and matching }
    songs = []
    i = 0
    while i < len(block):
        if block[i] == '{':
            j = i
            d = 0
            while j < len(block):
                if block[j] == '{':
                    d += 1
                elif block[j] == '}':
                    d -= 1
                    if d == 0:
                        break
                j += 1
            obj_str = block[i:j+1]
            i = j + 1
            
            t_m = re.search(r'title:\s*[\'"]([^\'"]+)[\'"]', obj_str)
            a_m = re.search(r'artist:\s*[\'"]([^\'"]+)[\'"]', obj_str)
            v_m = re.search(r'videoId:\s*[\'"]([^\'"]+)[\'"]', obj_str)
            y_m = re.search(r'year:\s*[\'"]?([0-9]{4})[\'"]?', obj_str)
            d_m = re.search(r'durationSec:\s*([0-9]+)', obj_str)
            hs_m = re.search(r'hookStartSec:\s*([0-9]+)', obj_str)
            he_m = re.search(r'hookEndSec:\s*([0-9]+)', obj_str)
            en_m = re.search(r'energy:\s*([0-9]+)', obj_str)
            
            if t_m and v_m:
                songs.append({
                    'title': t_m.group(1),
                    'artist': a_m.group(1) if a_m else 'Unknown',
                    'videoId': v_m.group(1),
                    'year': y_m.group(1) if y_m else '2022',
                    'durationSec': int(d_m.group(1)) if d_m else 210,
                    'hookStartSec': int(hs_m.group(1)) if hs_m else 30,
                    'hookEndSec': int(he_m.group(1)) if he_m else 70,
                    'entrySec': int(hs_m.group(1)) if hs_m else 30,
                    'exitSec': int(he_m.group(1)) if he_m else 70,
                    'energy': int(en_m.group(1)) if en_m else 9
                })
        else:
            i += 1
    return songs

party_songs = extract_cat('haryanvi-bhojpuri-party')
desi_songs = extract_cat('haryanvi-bhojpuri-desi-beats')
print(f"Extracted party songs: {len(party_songs)}")
print(f"Extracted desi songs: {len(desi_songs)}")

def check_oembed(song):
    vid = song['videoId']
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode())
                return song, True, data.get('title', '')
    except Exception as e:
        pass
    return song, False, ''

print("Checking party songs via oEmbed...")
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as ex:
    p_results = list(ex.map(check_oembed, party_songs))

valid_party = [s for s, ok, _ in p_results if ok]
invalid_party = [s for s, ok, _ in p_results if not ok]
print(f"Party: Valid={len(valid_party)}, Invalid={len(invalid_party)}")

print("Checking desi songs via oEmbed...")
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as ex:
    d_results = list(ex.map(check_oembed, desi_songs))

valid_desi = [s for s, ok, _ in d_results if ok]
invalid_desi = [s for s, ok, _ in d_results if not ok]
print(f"Desi: Valid={len(valid_desi)}, Invalid={len(invalid_desi)}")
