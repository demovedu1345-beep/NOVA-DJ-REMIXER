import urllib.request
import urllib.parse
import re
import json

def search_youtube(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.youtube.com/results?search_query={encoded}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    try:
        with urllib.request.urlopen(req, timeout=8) as res:
            html = res.read().decode('utf-8', errors='ignore')
            # Extract video IDs from ytInitialData
            matches = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
            unique_vids = []
            for v in matches:
                if v not in unique_vids:
                    unique_vids.append(v)
            return unique_vids[:5]
    except Exception as e:
        print(f"Search error for {query}: {e}")
        return []

test_queries = [
    "Bruno Mars That's What I Like official video",
    "Bruno Mars APT official video",
    "Drake Hotline Bling official video",
    "Arijit Singh Kesariya official video"
]

for q in test_queries:
    vids = search_youtube(q)
    print(f"Query: {q} -> vids: {vids}")
    if vids:
        # Check first with oEmbed
        try:
            oe_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vids[0]}&format=json"
            req2 = urllib.request.Request(oe_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req2, timeout=4) as res2:
                d = json.loads(res2.read().decode())
                print(f"  oEmbed Top: {vids[0]} -> '{d.get('title')}' by '{d.get('author_name')}'")
        except Exception as e:
            print(f"  oEmbed error: {e}")
