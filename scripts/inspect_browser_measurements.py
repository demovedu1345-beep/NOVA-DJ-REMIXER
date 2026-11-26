import json

with open(r'C:\Users\itzra\.gemini\antigravity\brain\88465835-f722-4765-a561-d4728e7124a3\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        obj = json.loads(line)
        if obj.get('step_index') in [195, 196, 197, 198, 199, 200, 201, 202]:
            c = str(obj.get('content', ''))
            if 'scrollWidth' in c or 'innerWidth' in c or 'Made With' in c or 'overflow' in c:
                print(f"Step {obj.get('step_index')}:")
                print(c[:1000])
