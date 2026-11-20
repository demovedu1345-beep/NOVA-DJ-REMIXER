import json
import os
import urllib.request
import concurrent.futures

path = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200\agent_6.json"

def verify_all():
    assert os.path.exists(path), f"File {path} does not exist!"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert "gujarati-garba" in data, "'gujarati-garba' key missing!"
    songs = data["gujarati-garba"]
    count = len(songs)
    print(f"Total songs in 'gujarati-garba': {count}")
    assert count >= 130, f"Expected at least 130 songs, found {count}"

    required_keys = ["title", "artist", "year", "durationSec", "hookStartSec", "hookEndSec", "entrySec", "exitSec", "videoId", "energy"]
    video_ids = set()

    for idx, s in enumerate(songs):
        for k in required_keys:
            assert k in s, f"Song {idx} missing key '{k}': {s}"
        assert isinstance(s["title"], str) and len(s["title"].strip()) > 0, f"Invalid title in song {idx}"
        assert isinstance(s["artist"], str) and len(s["artist"].strip()) > 0, f"Invalid artist in song {idx}"
        assert isinstance(s["videoId"], str) and len(s["videoId"]) == 11, f"Invalid videoId in song {idx}: {s['videoId']}"
        assert s["videoId"] not in video_ids, f"Duplicate videoId found in song {idx}: {s['videoId']}"
        video_ids.add(s["videoId"])
        assert isinstance(s["durationSec"], int) and s["durationSec"] > 0, f"Invalid durationSec in song {idx}"
        assert isinstance(s["hookStartSec"], int) and s["hookStartSec"] >= 0, f"Invalid hookStartSec in song {idx}"
        assert isinstance(s["hookEndSec"], int) and s["hookEndSec"] > s["hookStartSec"], f"Invalid hookEndSec in song {idx}"
        assert isinstance(s["entrySec"], int) and s["entrySec"] >= 0, f"Invalid entrySec in song {idx}"
        assert isinstance(s["exitSec"], int) and s["exitSec"] > s["entrySec"], f"Invalid exitSec in song {idx}"
        assert s["energy"] in (9, 10), f"Invalid energy in song {idx}: {s['energy']}"

    print("All schema and local validation checks PASSED successfully!")

    # Verify a batch of oEmbed calls concurrently
    def check_oembed(vid):
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=5) as r:
                return r.status == 200
        except Exception:
            return False

    print("Verifying all 210 videoIds via oEmbed concurrently...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
        results = list(pool.map(check_oembed, list(video_ids)))
        failed = [vid for vid, ok in zip(video_ids, results) if not ok]

    if failed:
        print(f"FAILED oEmbed for {len(failed)} videoIds: {failed}")
    else:
        print(f"ALL {len(video_ids)} videoIds successfully verified with YouTube oEmbed 200 OK!")

if __name__ == "__main__":
    verify_all()
