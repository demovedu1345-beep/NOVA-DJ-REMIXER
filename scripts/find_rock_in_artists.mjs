import { ARTISTS_DB } from '../api/_lib/artists-db.js';

const rockTitles = [
  'sadda haq', 'rock on', 'sinbad the sailor', 'pichle saat dinon mein', 'socha hai', 'tum ho toh',
  'bhaag d.k. bose', 'nadaan parindey', 'jo bhi main', 'aur ho', 'zinda', 'dhan te nan',
  'bulleya', 'emotional atyachar', 'jee karda', 'aadat', 'woh lamhe', 'sayonee', 'bheegi bheegi',
  'ya ali', 'kya mujhe pyaar hai', 'alvida', 'in dino', 'o meri jaan', 'baatein kuch ankahee si',
  'jiyein kyun', 'dum maro dum', 'mitwa', 'hairat', 'tai tai phiss', 'aarambh hai prachand',
  'dhaakad', 'kar har maidaan fateh', 'ghamand kar', 'chaiyya chaiyya', 'dil se re', 'satrangi re',
  'khoon chala', 'rubaroo', 'khalbali', 'give me some sunshine', 'jaane nahin denge tujhe',
  'iktara', 'wake up sid', 'illahi', 'channa mereya', 'ae dil hai mushkil', 'matargashti'
];

const found = [];
for (const [id, art] of Object.entries(ARTISTS_DB)) {
  for (const s of (art.songs || [])) {
    const t = (s.title || '').toLowerCase();
    for (const r of rockTitles) {
      if (t.includes(r)) {
        found.push({
          title: s.title,
          artist: s.artist || art.name,
          videoId: s.videoId || s.youtube_ids?.[0],
          durationSec: s.durationSec || 240,
          entrySec: s.entrySec || s.hookStartSec || 40,
          exitSec: s.exitSec || s.hookEndSec || 80
        });
        break;
      }
    }
  }
}

console.log(`Found ${found.length} rock songs in artists-db:`);
found.slice(0, 25).forEach(s => console.log(`- ${s.title} (${s.artist}) -> ${s.videoId}`));
