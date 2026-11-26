import yt_dlp
import urllib.request
import json
import time
import concurrent.futures

test_queries = [
    ("Taambdi Chaambdi", "Kratex Shreyas Marathi official song"),
    ("Apsara Aali", "Bela Shende Ajay Atul Natarang official"),
    ("Chandra", "Shreya Ghoshal Ajay Atul Chandramukhi official"),
    ("Dhaga Dhala", "Riteish Deshmukh Marathi party song official"),
    ("Dolby Walya", "Nagesh Morwekar Marathi DJ song official")
]

ydl_opts = {'quiet': True, 'skip_download': True, 'extract_flat': True, 'no_warnings': True}

def resolve_item(item):
    title, q = item
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch1:{q}", download=False)
            if res and res.get('entries'):
                e = res['entries'][0]
                vid = e.get('id')
                dur = e.get('duration') or 210
                # check oembed
                url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=3) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode())
                        return title, vid, dur, data.get('title')
    except Exception as exc:
        return title, None, None, str(exc)
    return title, None, None, "Not found"

t0 = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(resolve_item, test_queries))

print(f"Done in {time.time()-t0:.2f}s:")
for t, v, d, yt_title in results:
    print(f"  {t} -> vid={v} dur={d}s ({yt_title})")
