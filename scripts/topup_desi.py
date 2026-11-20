import json
import os
import sys
import time
import urllib.request
import yt_dlp

BATCH_DIR = r'C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200'
OUTPUT_FILE = os.path.join(BATCH_DIR, 'agent_5.json')

with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

party = data['haryanvi-bhojpuri-party']
desi = data['haryanvi-bhojpuri-desi-beats']

used_vids = {s['videoId'] for s in party} | {s['videoId'] for s in desi}
existing_desi_titles = {s['title'].lower() for s in desi}

ADDITIONAL_DESI = [
    {"title": "Dunge Choti", "artist": "Ruchika Jangid, Masoom Sharma", "year": "2021", "query": "Dunge Choti Ruchika Jangid Masoom Sharma official video"},
    {"title": "Panghat", "artist": "Ruchika Jangid", "year": "2021", "query": "Panghat Ruchika Jangid official video"},
    {"title": "Left Right Dholak", "artist": "Ajay Hooda, Sandeep Surila", "year": "2021", "query": "Left Right Ajay Hooda Sandeep Surila Neha Sharma official video"},
    {"title": "Kasoote", "artist": "Gulzaar Chhaniwala", "year": "2019", "query": "Kasoote Gulzaar Chhaniwala official video"},
    {"title": "English Medium", "artist": "Sapna Choudhary, Masoom Sharma", "year": "2016", "query": "English Medium Sapna Choudhary official video"},
    {"title": "Faad Faad", "artist": "Gulzaar Chhaniwala", "year": "2018", "query": "Faad Faad Gulzaar Chhaniwala official video"},
    {"title": "Tora", "artist": "Sumit Goswami", "year": "2020", "query": "Tora Sumit Goswami official video"},
    {"title": "Gangwar", "artist": "Sumit Goswami", "year": "2020", "query": "Gangwar Sumit Goswami official video"},
    {"title": "Laal Ghaghra", "artist": "Pawan Singh, Shilpi Raj", "year": "2022", "query": "Laal Ghaghra Pawan Singh Shilpi Raj official video"},
    {"title": "Saree Se Tadi", "artist": "Pawan Singh, Shilpi Raj", "year": "2022", "query": "Saree Se Tadi Pawan Singh Shilpi Raj official video"},
    {"title": "Red Hothlali", "artist": "Shilpi Raj", "year": "2022", "query": "Red Hothlali Shilpi Raj official video"},
    {"title": "Kamariya Dole", "artist": "Shilpi Raj", "year": "2021", "query": "Kamariya Dole Shilpi Raj official video"},
    {"title": "Tawa Pa Roti", "artist": "Shilpi Raj", "year": "2022", "query": "Tawa Pa Roti Shilpi Raj official video"},
    {"title": "Dhodi Pa Pasina", "artist": "Shilpi Raj", "year": "2022", "query": "Dhodi Pa Pasina Shilpi Raj official video"},
    {"title": "Relwaniya", "artist": "Shilpi Raj", "year": "2022", "query": "Relwaniya Shilpi Raj official video"},
    {"title": "Bhatar Aiehe Holi Ke Baad", "artist": "Khesari Lal Yadav", "year": "2018", "query": "Bhatar Aiehe Holi Ke Baad Khesari Lal Yadav official video"},
    {"title": "Le Le Aayi Coca Cola", "artist": "Khesari Lal Yadav, Shilpi Raj", "year": "2022", "query": "Le Le Aayi Coca Cola Khesari Lal Yadav Shilpi Raj official video"},
    {"title": "Chashma Lagake", "artist": "Arvind Akela Kallu, Shilpi Raj", "year": "2022", "query": "Chashma Lagake Arvind Akela Kallu Shilpi Raj official video"},
    {"title": "Muana Rahari Me Khele Kabbadi", "artist": "Arvind Akela Kallu", "year": "2021", "query": "Muana Rahari Me Khele Kabbadi Arvind Akela Kallu official video"},
    {"title": "Saiyan Dharawele Tharesar", "artist": "Samar Singh, Kavita Yadav", "year": "2020", "query": "Saiyan Dharawele Tharesar Samar Singh official video"}
]

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True
}

def verify_oembed(vid):
    if not vid or len(vid) != 11:
        return False
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            return resp.status == 200
    except Exception:
        return False

print(f"Current Desi count: {len(desi)}")

for cand in ADDITIONAL_DESI:
    if len(desi) >= 106:
        break
    if cand['title'].lower() in existing_desi_titles:
        continue
    
    query = cand['query']
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch4:{query}", download=False)
            if not res or not res.get('entries'):
                continue
            for e in res['entries']:
                vid = e.get('id')
                if not vid or len(vid) != 11 or vid in used_vids:
                    continue
                if not verify_oembed(vid):
                    continue
                
                dur = int(e.get('duration') or 215)
                if dur < 90 or dur > 600:
                    dur = 215
                hs = 32 if dur <= 240 else 36
                he = hs + 40
                
                song = {
                    'title': cand['title'],
                    'artist': cand['artist'],
                    'year': str(cand.get('year') or '2021'),
                    'durationSec': dur,
                    'hookStartSec': hs,
                    'hookEndSec': he,
                    'entrySec': hs,
                    'exitSec': he,
                    'videoId': vid,
                    'energy': 10
                }
                desi.append(song)
                used_vids.add(vid)
                existing_desi_titles.add(cand['title'].lower())
                print(f"Added [{len(desi)}]: {song['title']} -> {vid} ({dur}s)")
                break
    except Exception as exc:
        print(f"Error {cand['title']}: {exc}")

print(f"Final Desi count: {len(desi)}")
print(f"Final Party count: {len(party)}")

# Save updated json
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump({
        "haryanvi-bhojpuri-party": party,
        "haryanvi-bhojpuri-desi-beats": desi
    }, f, indent=2, ensure_ascii=False)

print("Saved updated agent_5.json successfully!")
