import json

def get_existing():
    existing = {}
    try:
        with open('scripts/curated_batches/agent_8.json', 'r', encoding='utf-8') as f:
            d = json.load(f)
            if 'gujarati-garba' in d:
                for s in d['gujarati-garba']:
                    existing[s['videoId']] = s['title']
    except Exception as e:
        print("agent_8 err", e)

    try:
        with open('scripts/new_songs_batch/agent_2.json', 'r', encoding='utf-8') as f:
            d = json.load(f)
            if 'gujarati-garba' in d:
                for s in d['gujarati-garba']:
                    existing[s['videoId']] = s['title']
    except Exception as e:
        print("agent_2 err", e)

    print(f"Total existing unique videoIds: {len(existing)}")
    for vid, title in sorted(existing.items(), key=lambda x: x[1]):
        print(f"  {title} : {vid}")

get_existing()
