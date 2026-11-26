with open(r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\api\_lib\artists-db.js", "r", encoding="utf-8") as f:
    text = f.read()

print("getArtistsByLanguage in artists-db.js:", "getArtistsByLanguage" in text)
print("getArtistProfile in artists-db.js:", "getArtistProfile" in text)
