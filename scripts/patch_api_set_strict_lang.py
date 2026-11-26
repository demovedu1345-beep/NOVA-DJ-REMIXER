with open('api/set.js', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update slugMatchesSubtype
old_slugMatches = """function slugMatchesSubtype(slug, subtype) {
  const isFull = subtype.includes(':');
  const [lang, bareSub] = isFull ? subtype.split(':') : [null, subtype];
  const s = slug.toLowerCase();
  const b = (bareSub || subtype).toLowerCase();

  if (lang === 'language') {
    if (b === 'punjabi') return s.startsWith('punjabi');
    if (b === 'marathi') return s.startsWith('marathi');
    if (b === 'gujarati') return s.startsWith('gujarati');
    if (b === 'tamil-telugu') return s.startsWith('tamil-telugu');
    if (b === 'kannada') return s.startsWith('kannada');
    if (b === 'marwadi') return s.startsWith('marwadi');
    if (b === 'odia') return s.startsWith('odia');
    if (b === 'haryanvi-bhojpuri' || b === 'bhojpuri-haryanvi') return s.startsWith('haryanvi-bhojpuri');
  }

  // Exact matching for language-prefixed slugs
  if (lang === 'hindi') {
    if (s === `hindi-${b}`) return true;
    if (b === 'diwali' && s === 'diwali-party-songs') return true;
  }
  if (lang === 'english') {
    if (s === `english-${b}`) return true;
  }

  // Bare subtype matches
  if (s === b || s === `hindi-${b}` || s === `english-${b}`) return true;
  if (b === 'diwali' && s === 'diwali-party-songs') return true;
  if (b === 'party' && (s === 'punjabi-party' || s === 'haryanvi-bhojpuri-party' || s === 'marathi-party')) return true;
  if (b === 'wedding' && s === 'punjabi-wedding') return true;
  if (b === 'sad' && s === 'punjabi-sad') return true;
  if (b === 'gym' && s === 'punjabi-gym') return true;
  if (b === 'garba' && s === 'gujarati-garba') return true;
  if (b === 'kuthu' && s === 'tamil-telugu-kuthu') return true;
  if (b === 'mass' && s === 'tamil-telugu-mass') return true;
  if (b === 'desi-beats' && s === 'haryanvi-bhojpuri-desi-beats') return true;

  return s.includes(b);
}"""

new_slugMatches = """function slugMatchesSubtype(slug, subtype, requestedLangs = []) {
  const isFull = subtype.includes(':');
  const [lang, bareSub] = isFull ? subtype.split(':') : [null, subtype];
  const s = slug.toLowerCase();
  const b = (bareSub || subtype).toLowerCase();

  if (lang === 'language') {
    if (b === 'punjabi') return s.startsWith('punjabi');
    if (b === 'marathi') return s.startsWith('marathi');
    if (b === 'gujarati') return s.startsWith('gujarati');
    if (b === 'tamil-telugu') return s.startsWith('tamil-telugu');
    if (b === 'kannada') return s.startsWith('kannada');
    if (b === 'marwadi') return s.startsWith('marwadi');
    if (b === 'odia') return s.startsWith('odia');
    if (b === 'haryanvi-bhojpuri' || b === 'bhojpuri-haryanvi') return s.startsWith('haryanvi-bhojpuri');
    return false;
  }

  // Strict prefix matching when language prefix is explicit
  if (lang === 'hindi') {
    if (s === `hindi-${b}` || (b === 'diwali' && s === 'diwali-party-songs')) return true;
    return false;
  }
  if (lang === 'english') {
    if (s === `english-${b}` || (b === 'rock' && (s === 'english-rock' || s === 'english-classicrock'))) return true;
    return false;
  }

  // If requested languages filter is active, respect it
  if (requestedLangs && requestedLangs.length > 0) {
    const onlyEnglish = requestedLangs.includes('english') && !requestedLangs.includes('hindi');
    const onlyHindi = requestedLangs.includes('hindi') && !requestedLangs.includes('english');
    if (onlyEnglish && !s.startsWith('english')) return false;
    if (onlyHindi && s.startsWith('english')) return false;
  }

  // Bare subtype matches
  if (s === b || s === `hindi-${b}` || s === `english-${b}`) return true;
  if (b === 'diwali' && s === 'diwali-party-songs') return true;
  if (b === 'party' && (s === 'punjabi-party' || s === 'haryanvi-bhojpuri-party' || s === 'marathi-party')) return true;
  if (b === 'wedding' && s === 'punjabi-wedding') return true;
  if (b === 'sad' && s === 'punjabi-sad') return true;
  if (b === 'gym' && s === 'punjabi-gym') return true;
  if (b === 'garba' && s === 'gujarati-garba') return true;
  if (b === 'kuthu' && s === 'tamil-telugu-kuthu') return true;
  if (b === 'mass' && s === 'tamil-telugu-mass') return true;
  if (b === 'desi-beats' && s === 'haryanvi-bhojpuri-desi-beats') return true;

  return s.endsWith(`-${b}`) || s === b;
}"""

if old_slugMatches in c:
    c = c.replace(old_slugMatches, new_slugMatches)
    print("Replaced slugMatchesSubtype with strict language isolation")
else:
    print("old_slugMatches not found directly")

# 2. Update candidatePool loop in buildSetFromCuratedDb
old_candidate_loop = """  // 2. If specific subtypes are requested, pull from those exact categories
  if (requestedSubtypes.length > 0) {
    for (const sub of requestedSubtypes) {
      for (const cat of allCategories) {
        if (slugMatchesSubtype(cat.slug, sub)) {
          const songs = shuffleArray(cat.songs || []);
          for (const s of songs) {
            candidatePool.push({ song: s, cat });
          }
        }
      }
    }
  }"""

new_candidate_loop = """  // 2. If specific subtypes are requested, pull strictly from matching categories
  if (requestedSubtypes.length > 0) {
    for (const sub of requestedSubtypes) {
      for (const cat of allCategories) {
        if (slugMatchesSubtype(cat.slug, sub, requestedLangs)) {
          if (requestedLangs.length > 0 && !catMatchesLang(cat.lang, requestedLangs)) {
            continue;
          }
          const songs = shuffleArray(cat.songs || []);
          for (const s of songs) {
            candidatePool.push({ song: s, cat });
          }
        }
      }
    }
  }"""

if old_candidate_loop in c:
    c = c.replace(old_candidate_loop, new_candidate_loop)
    print("Replaced candidatePool loop with strict language isolation")
else:
    print("old_candidate_loop not found directly")

# 3. Support both answers.language (singular) and answers.languages (plural)
old_raw_langs = """  const requestedLangs = (answers.languages || (body?.lang ? [body.lang] : [])).map(l => String(l).toLowerCase());"""
new_raw_langs = """  const rawLangs = answers.languages || answers.language || (body?.lang ? [body.lang] : []);
  const requestedLangs = (Array.isArray(rawLangs) ? rawLangs : [rawLangs]).map(l => String(l).toLowerCase());"""

if old_raw_langs in c:
    c = c.replace(old_raw_langs, new_raw_langs)
    print("Updated rawLangs to support both answers.language and answers.languages")

with open('api/set.js', 'w', encoding='utf-8') as f:
    f.write(c)

print("Saved api/set.js")
