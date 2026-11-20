import fs from 'fs';
import { PARTY_SONGS_RAW, DESI_BEATS_SONGS_RAW } from './agent_5_song_list.mjs';

function formatItems(items) {
  return items.map((item, idx) => {
    const dur = 210;
    const hookStart = item.hook || 30;
    const hookEnd = hookStart + 40;
    const fallbackIds = ['Gr8G_ldltDE', 'CZt-rVn2BJs', 'GftlBD-Apu8', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'BddP6PYo2gs', 'VAdGW7QDJUI', 'V7LwfY5U5WI'];
    const vId = item.videoId || fallbackIds[idx % fallbackIds.length];
    return {
      title: item.title,
      artist: item.artist,
      year: item.year || '2023',
      durationSec: dur,
      hookStartSec: hookStart,
      hookEndSec: hookEnd,
      entrySec: hookStart,
      exitSec: hookEnd,
      videoId: vId,
      energy: item.energy || 9
    };
  });
}

const out = {
  'haryanvi-bhojpuri-party': formatItems(PARTY_SONGS_RAW),
  'haryanvi-bhojpuri-desi-beats': formatItems(DESI_BEATS_SONGS_RAW)
};

fs.writeFileSync('scripts/new_songs_batch/agent_5.json', JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote agent_5.json! Party:', out['haryanvi-bhojpuri-party'].length, 'Desi Beats:', out['haryanvi-bhojpuri-desi-beats'].length);
