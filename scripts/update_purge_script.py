with open('scripts/purge_and_replace_english.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Add shubh to indian_artist_indicators
c = c.replace("'tanishk bagchi',", "'tanishk bagchi', 'shubh',")
with open('scripts/purge_and_replace_english.py', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated scripts/purge_and_replace_english.py with shubh")
