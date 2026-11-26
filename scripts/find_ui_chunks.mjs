import fs from 'fs';
import path from 'path';

const dir = 'public/naux/static/immutable/chunks';
const files = fs.readdirSync(dir);

for (const file of files) {
  if (!file.endsWith('.js')) continue;
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const hasAgent = content.includes('AGENT');
  const hasDeckA = content.includes('DECK A') || content.includes('Deck A');
  const hasSkip = content.includes('SKIP');
  const hasPlayFull = content.includes('PLAY FULL') || content.includes('Play full');
  const hasOnlyBangers = content.includes('ONLY BANGERS') || content.includes('Only bangers');
  
  if (hasAgent || hasDeckA || hasSkip || hasPlayFull || hasOnlyBangers) {
    console.log(`File: ${file}`);
    console.log(`  AGENT: ${hasAgent}, DeckA: ${hasDeckA}, SKIP: ${hasSkip}, PLAY_FULL: ${hasPlayFull}, BANGERS: ${hasOnlyBangers}`);
  }
}
