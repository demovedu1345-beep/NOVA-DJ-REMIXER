with open('api/_lib/youtube.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('export async function searchYouTubePublic')
if idx == -1: idx = text.find('function searchYouTubePublic')
print(text[idx:idx+1500])
