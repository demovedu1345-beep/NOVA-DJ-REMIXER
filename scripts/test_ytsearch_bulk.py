import yt_dlp
import urllib.request
import json
import time

queries = [
    ('marathi', 'Marathi party dance DJ songs official video'),
    ('kannada', 'Kannada mass dance songs official video'),
    ('gujarati', 'Gujarati garba dandiya dance songs official video'),
    ('odia', 'Odia party dance sambalpuri songs official video'),
    ('marwadi', 'Rajasthani marwadi DJ dance songs official video')
]

ydl_opts = {'quiet': True, 'skip_download': True, 'extract_flat': True, 'no_warnings': True}

for lang, q in queries:
    t0 = time.time()
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch20:{q}", download=False)
            entries = res.get('entries', []) if res else []
            valid = []
            for e in entries:
                vid = e.get('id')
                title = e.get('title')
                dur = e.get('duration') or 0
                if vid and len(vid) == 11 and 60 <= dur <= 600:
                    valid.append((vid, title, dur))
            print(f"{lang:10} -> found {len(valid)} entries in {time.time()-t0:.2f}s")
            if valid:
                print(f"  sample: {valid[0]}")
    except Exception as exc:
        print(f"{lang}: {exc}")
