import urllib.request
import json
import concurrent.futures
import time

test_vids = [
    "4NRXx6U8ABQ", "JGwWNGJdvx8", "2Vv-BfVoq4g", "eVli-tstM5E", "G7KNmW9a75Y"
]

def check_oembed(vid):
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            return vid, True, data.get("title", ""), data.get("author_name", "")
    except Exception as e:
        return vid, False, str(e), ""

t0 = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(check_oembed, test_vids))

print(f"Verified {len(results)} videos in {time.time()-t0:.2f}s:")
for vid, ok, title, author in results:
    print(f"  {vid} -> {ok} | {title} by {author}")
