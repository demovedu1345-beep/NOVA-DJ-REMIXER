import { CURATED_CATEGORIES_DB } from '../api/_lib/curated-songs-db.js';
import { ARTISTS_DB } from '../api/_lib/artists-db.js';

const verifiedMap = new Map();

function addSong(s) {
  const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]);
  if (!vId || vId.length !== 11 || vId.includes('K1n0v4')) return;
  const key = s.title.toLowerCase().trim();
  if (!verifiedMap.has(key)) {
    verifiedMap.set(key, { ...s, videoId: vId, youtube_ids: [vId] });
  }
}

for (const cat of Object.values(CURATED_CATEGORIES_DB)) {
  for (const s of (cat.songs || [])) addSong(s);
}

for (const lang of Object.values(ARTISTS_DB)) {
  for (const art of Object.values(lang)) {
    for (const s of (art.songs || [])) addSong(s);
  }
}

const rockKeywords = [
  'sadda haq', 'rock on', 'sinbad', 'pichle saat', 'socha hai', 'tum ho toh', 'bhaag d.k.', 'nadaan parindey',
  'jo bhi main', 'aur ho', 'hawaa hawaa', 'zinda', 'dhan te nan', 'kaminey', 'bulleya', 'subhanallah', 'jee karda',
  'aadat', 'woh lamhe', 'sayonee', 'bheegi bheegi', 'ya ali', 'kya mujhe pyaar hai', 'alvida', 'in dino',
  'o meri jaan', 'baatein kuch', 'jiyein kyun', 'te amo', 'dum maro dum', 'mitwa', 'hairat', 'aarambh hai',
  'duniya', 'dhaakad', 'kar har maidaan', 'ghamand kar', 'chaiyya chaiyya', 'dil se re', 'satrangi re',
  'maa tujhe salaam', 'vande mataram', 'rang de basanti', 'khoon chala', 'rubaroo', 'khalbali', 'luka chuppi',
  'give me some sunshine', 'jaane nahin denge', 'all izz well', 'iktara', 'wake up sid', 'illahi', 'kabira',
  'channa mereya', 'ae dil hai mushkil', 'safarnama', 'matargashti', 'agar tum saath ho', 'phir se udd chala',
  'kun faya kun', 'behti hawa sa', 'robaroo', 'aazaadiyan', 'kinare', 'chaap tilak', 'tu koi aur hai',
  'patakha guddi', 'maahi ve', 'highway', 'rock', 'guitar', 'band', 'parikrama', 'indian ocean', 'euphoria',
  'maeri', 'dhoom pichak dhoom', 'gul', 'baarishein', 'kasoor', 'alag aasmaan'
];

const rockFound = [];
for (const [title, song] of verifiedMap.entries()) {
  if (rockKeywords.some(k => title.includes(k))) {
    rockFound.push(song);
  }
}

console.log(`Found ${rockFound.length} authentic rock/semi-rock tracks in our harvested DB!`);
rockFound.slice(0, 30).forEach(s => console.log(`- ${s.title} (${s.artist}) -> ${s.videoId}`));
