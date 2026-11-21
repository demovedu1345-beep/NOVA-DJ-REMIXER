import os, json

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scripts_dir = os.path.join(root, 'scripts')

all_songs = []
seen_vids = set()

def harvest_file(fpath):
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        items = []
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            for k, v in data.items():
                if isinstance(v, dict) and 'songs' in v:
                    items.extend(v['songs'])
                elif isinstance(v, list):
                    items.extend(v)
        for s in items:
            if isinstance(s, dict):
                vId = s.get('videoId') or (s.get('youtube_ids') and s['youtube_ids'][0])
                if vId and len(vId) == 11 and vId not in seen_vids:
                    seen_vids.add(vId)
                    all_songs.append(s)
    except Exception as e:
        pass

# Check all json files in scripts and scripts/curated_batches_200
for root_dir, dirs, files in os.walk(scripts_dir):
    for f in files:
        if f.endswith('.json'):
            harvest_file(os.path.join(root_dir, f))

print(f"Total unique harvested songs with valid video IDs: {len(all_songs)}")
