import yt_dlp
import time
import urllib.request
import json
import concurrent.futures

queries = [
    ('Chetak', 'Sapna Choudhary Raj Mawar'),
    ('Filter Shot', 'Gulzaar Chhaniwala'),
    ('Solid Body', 'Ajay Hooda Sheenam Katholic'),
    ('Kamariya Hila Rahi Hai', 'Pawan Singh Lauren Gottlieb'),
    ('Raate Diya Butake', 'Pawan Singh Amrapali Dubey'),
    ('Gajban', 'Sapna Choudhary Vishvajeet Choudhary'),
    ('Motto', 'Diler Kharkiya Ajay Hooda'),
    ('Badnaam Gabru', 'Masoom Sharma Ruchika Jangid'),
    ('Chatak Matak', 'Renuka Panwar Sapna Choudhary'),
    ('Raja Ji', 'Pawan Singh Shivani Singh')
]

ydl_opts = {'quiet': True, 'skip_download': True, 'extract_flat': True, 'no_warnings': True}

def resolve_one(item):
    title, artist = item
    q = f"{title} {artist} song official video"
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
                with urllib.request.urlopen(req, timeout=4) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode())
                        return title, artist, vid, dur, data.get('title')
    except Exception as exc:
        return title, artist, None, None, str(exc)
    return title, artist, None, None, "Not found"

t0 = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(resolve_one, queries))

print(f"Resolved in {time.time()-t0:.2f}s:")
for t, a, v, d, yt_t in results:
    print(f"  {t} ({a}) -> {v} [{d}s] :: {yt_t}")
