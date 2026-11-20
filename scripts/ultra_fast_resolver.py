import json
import os
import time
import urllib.request
import concurrent.futures
import yt_dlp

BLACKLIST = {
    'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
    'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g'
}

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True,
    'default_search': 'ytsearch3',
}

def search_song(song_item):
    query = song_item.get('query') or f"{song_item['title']} {song_item['artist']} official video"
    hook_start = int(song_item.get('hookStart') or song_item.get('hookStartSec') or 35)
    hook_end = int(song_item.get('hookEnd') or song_item.get('hookEndSec') or (hook_start + 40))
    energy = int(song_item.get('energy') or 9)
    year = str(song_item.get('year') or '2022')
    title = song_item['title']
    artist = song_item['artist']

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch3:{query}", download=False)
            if res and 'entries' in res and res['entries']:
                for entry in res['entries']:
                    vid = entry.get('id')
                    if not vid or len(vid) != 11 or vid in BLACKLIST:
                        continue
                    
                    # Verify via oEmbed
                    try:
                        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
                        req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req, timeout=5) as r:
                            if r.status == 200:
                                dur = int(entry.get('duration') or 210)
                                if dur < 120 or dur > 420:
                                    dur = 210
                                return {
                                    'title': title,
                                    'artist': artist,
                                    'year': year,
                                    'durationSec': dur,
                                    'hookStartSec': hook_start,
                                    'hookEndSec': hook_end,
                                    'entrySec': hook_start,
                                    'exitSec': hook_end,
                                    'videoId': vid,
                                    'energy': energy
                                }
                    except Exception:
                        pass
    except Exception as e:
        print(f"Error on {title}: {e}")
    return None

def process_file(input_file, output_file, max_workers=16):
    print(f"\n==========================================")
    print(f"Processing {input_file} -> {output_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        categories = json.load(f)

    results = {}
    used_vids = set()
    t0 = time.time()

    for cat, songs in categories.items():
        print(f"\n[Category: {cat}] Resolving {len(songs)} songs...")
        results[cat] = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(search_song, s) for s in songs]
            for future in concurrent.futures.as_completed(futures):
                res = future.result()
                if res and res['videoId'] not in used_vids:
                    used_vids.add(res['videoId'])
                    results[cat].append(res)
                    print(f"  OK [{len(results[cat])}/{len(songs)}]: {res['title']} -> {res['videoId']} ({res['durationSec']}s)")
                elif res:
                    print(f"  SKIP DUP: {res['title']} -> {res['videoId']}")

    out_dir = os.path.dirname(output_file)
    os.makedirs(out_dir, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nCompleted {output_file} in {time.time()-t0:.2f}s!")
    print(f"Total unique video IDs: {len(used_vids)}")
    for cat, list_s in results.items():
        print(f" - {cat}: {len(list_s)} songs")

def main():
    # 1. Process Agent 5 (Punjabi categories)
    process_file('scripts/raw_agent_5.json', 'scripts/curated_batches/agent_5.json', max_workers=20)
    # 2. Process Agent 8 (Regional categories)
    process_file('scripts/raw_agent_8.json', 'scripts/curated_batches/agent_8.json', max_workers=20)

if __name__ == '__main__':
    main()
