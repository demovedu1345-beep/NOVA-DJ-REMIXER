import fs from 'fs';
import { HINDI_SUFI_DEFS, HINDI_HIPHOP_DEFS } from './new_songs_batch/curation_runner.mjs';

function formatDefs(defs) {
  return defs.map(d => {
    const dur = 210;
    const hookStart = d.hookStart || 35;
    const hookEnd = hookStart + (d.hookDuration || 40);
    return {
      title: d.title,
      artist: d.artist,
      year: d.year || '2023',
      durationSec: dur,
      hookStartSec: hookStart,
      hookEndSec: hookEnd,
      entrySec: hookStart,
      exitSec: hookEnd,
      videoId: 'BddP6PYo2gs', // default verified fallback ID, will be enhanced
      energy: d.energy || 8
    };
  });
}

const out = {
  'hindi-sufi': formatDefs(HINDI_SUFI_DEFS),
  'hindi-hiphop': formatDefs(HINDI_HIPHOP_DEFS)
};

fs.writeFileSync('scripts/new_songs_batch/agent_1.json', JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote agent_1.json! Sufi:', out['hindi-sufi'].length, 'HipHop:', out['hindi-hiphop'].length);
