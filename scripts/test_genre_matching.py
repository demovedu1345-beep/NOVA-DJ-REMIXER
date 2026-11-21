import os, json

with open('scripts/harvest_pool.py', 'r', encoding='utf-8') as f:
    pass

from harvest_pool import all_songs

print(f"Total songs in pool: {len(all_songs)}")

# Let's test finding songs for a few categories:
queries = {
    'workout': ['workout', 'gym', 'sultan', 'dangal', 'zinda', 'power', 'stronger', 'lose yourself', 'eye of the tiger', 'fight', 'brothers', 'apna time', 'malhari'],
    'ghazal': ['ghazal', 'jagjit', 'chithi', 'hothon', 'jhuki', 'daulat', 'kagaz', 'ranjish', 'pankaj udhas', 'ghulam ali', 'mehdi hassan'],
    'devotional': ['namo namo', 'shiv', 'tandav', 'achyutam', 'hanuman', 'krishna', 'bhagwan', 'radhe', 'bhajan', 'aarti', 'deva shree ganesha', 'ganpati'],
    'rock': ['rock', 'numb', 'in the end', 'queen', 'linkin', 'metallica', 'sadda haq', 'rock on', 'bhaag dk bose', 'jiyein kyun', 'sayonee'],
    'jazz': ['jazz', 'blues', 'fly me to the moon', 'feeling good', 'what a wonderful world', 'autumn leaves', 'summertime', 'georgia'],
    'metal': ['metal', 'sandman', 'metallica', 'slipknot', 'system of a down', 'chop suey', 'iron maiden'],
    'lofi_chill': ['chill', 'lofi', 'lo-fi', 'baarishein', 'alag aasmaan', 'kasoor', 'kho gaye', 'iktara', 'sham', 'qaafirana', 'sunroof', 'coffee'],
    'wedding': ['wedding', 'shaadi', 'gallan goodiyaan', 'london thumakda', 'dilliwali girlfriend', 'maahi ve', 'sweetheart', 'cutiepie', 'mehendi'],
    'friendship': ['friend', 'dosti', 'yaaron', 'dil chahta hai', 'tera yaar hoon main', 'atrangi', 'veere', 'count on me', 'see you again']
}

for cat, terms in queries.items():
    matches = []
    for s in all_songs:
        text = (s.get('title', '') + ' ' + s.get('artist', '')).lower()
        if any(t in text for t in terms):
            matches.append(s)
    print(f"Category '{cat}': found {len(matches)} direct matches in pool")
