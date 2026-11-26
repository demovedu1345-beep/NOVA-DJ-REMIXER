import re, json

with open('scripts/curate_agent_7_batches.py', 'r', encoding='utf-8') as f:
    c7 = f.read()

with open('scripts/generate_agent_8_200.py', 'r', encoding='utf-8') as f:
    g8 = f.read()

# Let's see how many items are in MARATHI_SONGS and MARWADI_SONGS
# And how many are in KANNADA_CANDIDATES and ODIA_CANDIDATES
def extract_dicts(code, var_name):
    idx = code.find(var_name)
    if idx == -1: return []
    sub = code[idx:]
    start = sub.find('[')
    end = sub.find(']\n')
    if end == -1: end = sub.find('];')
    # Use python eval or ast
    import ast
    try:
        data = ast.literal_eval(sub[start:end+1])
        return data
    except Exception as e:
        print(f"Error parsing {var_name}: {e}")
        return []

marathi = extract_dicts(c7, 'MARATHI_SONGS')
marwadi = extract_dicts(c7, 'MARWADI_SONGS')
kannada = extract_dicts(g8, 'KANNADA_CANDIDATES')
odia = extract_dicts(g8, 'ODIA_CANDIDATES')

print(f"MARATHI_SONGS: {len(marathi)}")
print(f"MARWADI_SONGS: {len(marwadi)}")
print(f"KANNADA_CANDIDATES: {len(kannada)}")
print(f"ODIA_CANDIDATES: {len(odia)}")
