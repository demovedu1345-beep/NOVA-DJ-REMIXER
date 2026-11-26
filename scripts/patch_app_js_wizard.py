import re

path = 'public/js/ui/app.js'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update state object to include selectedSubtypes
if 'selectedSubtypes: [],' not in code:
    code = code.replace('selectedLanguages: [],', 'selectedLanguages: [],\n  selectedSubtypes: [],')
    print("Added selectedSubtypes to state in app.js")

# 2. Add regional entries to VIBE_CATEGORIES_MAP
vibe_map_addition = '''  'marathi': [
    { id: 'marathi-party', label: 'Party & Dhol Tasha', hint: 'Dhol tasha drops, high energy Marathi festival tracks', dbKey: 'marathi-party' },
    { id: 'marathi-dance', label: 'Dance & Lavani', hint: 'Catchy Marathi dance bangers and rhythm', dbKey: 'marathi-dance' },
  ],
  'gujarati': [
    { id: 'gujarati-garba', label: 'Garba & Dandiya', hint: 'Non-stop dholida beats and Navratri anthems', dbKey: 'gujarati-garba' },
    { id: 'gujarati-folk', label: 'Folk & Wedding', hint: 'Traditional and modern Gujarati celebration hits', dbKey: 'gujarati-folk' },
  ],
  'kannada': [
    { id: 'kannada-hits', label: 'Sandalwood Hits', hint: 'KGF, Kantara & chartbuster Kannada anthems', dbKey: 'kannada-hits' },
    { id: 'kannada-mass', label: 'Mass Commercial', hint: 'High-energy theater entry and mass beats', dbKey: 'kannada-mass' },
  ],
  'marwadi': [
    { id: 'marwadi-party', label: 'Rajasthani Party', hint: 'Chaudhary, Ghoomar and energetic Rajasthani folk bangers', dbKey: 'marwadi-party' },
    { id: 'marwadi-folk', label: 'Folk & Festive', hint: 'Traditional Marwadi celebration songs', dbKey: 'marwadi-folk' },
  ],
  'odia': [
    { id: 'odia-hits', label: 'Ollywood Hits', hint: 'Rangabati and energetic Odia dance tracks', dbKey: 'odia-hits' },
    { id: 'odia-dance', label: 'Sambalpuri Dance', hint: 'Fast-paced Sambalpuri folk beats', dbKey: 'odia-dance' },
  ],
  'haryanvi-bhojpuri': [
    { id: 'haryanvi-bhojpuri-party', label: 'Haryanvi & Bhojpuri Bangers', hint: 'Desi bass, Pawan Singh, Khesari Lal & Sapna dance hits', dbKey: 'haryanvi-bhojpuri-party' },
    { id: 'haryanvi-bhojpuri-desi-beats', label: 'Desi Beats & Ragni', hint: 'Punchy 808s and rustic folk anthems', dbKey: 'haryanvi-bhojpuri-desi-beats' },
  ],
  'language': [
    { id: 'punjabi-party', label: 'Punjabi Hits', hint: 'Bhangra, Dhol drops & club hits', dbKey: 'punjabi-party' },
    { id: 'marathi-party', label: 'Marathi Hits', hint: 'Dhol tasha & energetic party hits', dbKey: 'marathi-party' },
    { id: 'gujarati-garba', label: 'Gujarati Garba', hint: 'Navratri garba & dholida beats', dbKey: 'gujarati-garba' },
    { id: 'tamil-telugu-kuthu', label: 'Tamil & Telugu Mass', hint: 'Anirudh kuthu & mass hero themes', dbKey: 'tamil-telugu-kuthu' },
    { id: 'kannada-hits', label: 'Kannada Hits', hint: 'KGF, Kantara & Sandalwood anthems', dbKey: 'kannada-hits' },
    { id: 'marwadi-party', label: 'Marwadi / Rajasthani', hint: 'Chaudhary & Rajasthani folk party', dbKey: 'marwadi-party' },
    { id: 'odia-hits', label: 'Odia Hits', hint: 'Rangabati & Ollywood dance bangers', dbKey: 'odia-hits' },
    { id: 'haryanvi-bhojpuri-party', label: 'Haryanvi & Bhojpuri', hint: 'High-octane Desi party anthems', dbKey: 'haryanvi-bhojpuri-party' },
  ],
};'''

if "'kannada': [" not in code:
    code = code.replace("  'bollywood-remix': [\n    { id: 'hindi-dance', label: 'Bollywood Club Mashups', hint: 'Dhol mix, DJ party mashups & high-tempo club edits', dbKey: 'hindi-dance' },\n    { id: 'english-edm', label: 'Global EDM Remixes', hint: 'Bass-boosted club edits & festival bootlegs', dbKey: 'english-edm' },\n  ],\n};", "  'bollywood-remix': [\n    { id: 'hindi-dance', label: 'Bollywood Club Mashups', hint: 'Dhol mix, DJ party mashups & high-tempo club edits', dbKey: 'hindi-dance' },\n    { id: 'english-edm', label: 'Global EDM Remixes', hint: 'Bass-boosted club edits & festival bootlegs', dbKey: 'english-edm' },\n  ],\n" + vibe_map_addition)
    print("Added regional categories to VIBE_CATEGORIES_MAP in app.js")

# 3. Update Step 0 in renderWizard()
old_wizard_step0 = '''  const WIZARD_LANGUAGES = [
    { id: 'hindi', label: 'Hindi', count: hindiCount, hint: `${hindiCount} songs ready` },
    { id: 'punjabi', label: 'Punjabi', count: punjabiCount, hint: `${punjabiCount} songs ready` },
    { id: 'english', label: 'English', count: englishCount, hint: `${englishCount} songs ready` },
    { id: 'south', label: 'Tamil / Telugu', count: southCount, hint: `${southCount} songs ready` },
    { id: 'gujarati', label: 'Garba / Gujarati', count: garbaCount, hint: `${garbaCount} songs ready` },
    { id: 'haryanvi-bhojpuri', label: 'Haryanvi / Bhojpuri', count: haryanviCount, hint: `${haryanviCount} songs ready` },
  ];

  let bodyHtml = '';

  if (step === 0) {
    bodyHtml = `
      <section class="mt-[4vh] flex flex-1 flex-col md:mt-[6vh] pb-36">
        <h1 class="font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(56px,8vw,120px)]">What are we playing?</h1>
        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p class="text-xl text-white/60 md:text-2xl">Pick every language the room wants.</p>
          ${renderRequestSongButton()}
        </div>

        <div class="grid gap-4 sm:grid-cols-2 mt-7 md:mt-10">
          ${WIZARD_LANGUAGES.map((l) => {
            const sel = (state.selectedLanguages || []).includes(l.id);
            return `
              <button class="flex flex-col justify-between rounded-3xl border-4 p-5 text-left md:p-6 transition active:scale-[0.98] min-h-28 md:min-h-36 cursor-pointer ${sel ? 'border-lime bg-lime text-ink' : 'border-white/20 hover:border-white/60'}" data-wizard-lang="${l.id}" aria-pressed="${sel}">
                <span class="font-display uppercase leading-none text-4xl md:text-5xl">${esc(l.label)}</span>
                <span class="mt-3 text-lg md:text-xl ${sel ? 'text-ink/70' : 'text-white/55'}">${l.hint}</span>
              </button>
            `;
          }).join('')}
        </div>

        <p class="mt-6 text-lg text-white/45">
          Coming soon: Marathi, Bengali.
        </p>'''

new_wizard_step0 = '''  const regionalSubtypes = [
    { id: 'punjabi', label: 'Punjabi Hits', count: (CURATED_CATEGORIES_DB['punjabi-party']?.songs?.length || 454) + (CURATED_CATEGORIES_DB['punjabi-wedding']?.songs?.length || 207) + (CURATED_CATEGORIES_DB['punjabi-gym']?.songs?.length || 284) },
    { id: 'marathi', label: 'Marathi Hits', count: (CURATED_CATEGORIES_DB['marathi-party']?.songs?.length || 100) + (CURATED_CATEGORIES_DB['marathi-dance']?.songs?.length || 100) },
    { id: 'gujarati', label: 'Gujarati Garba', count: (CURATED_CATEGORIES_DB['gujarati-garba']?.songs?.length || 100) + (CURATED_CATEGORIES_DB['gujarati-folk']?.songs?.length || 121) },
    { id: 'tamil-telugu', label: 'Tamil & Telugu Mass', count: (CURATED_CATEGORIES_DB['tamil-telugu-kuthu']?.songs?.length || 200) + (CURATED_CATEGORIES_DB['tamil-telugu-mass']?.songs?.length || 200) },
    { id: 'kannada', label: 'Kannada Hits', count: (CURATED_CATEGORIES_DB['kannada-hits']?.songs?.length || 100) + (CURATED_CATEGORIES_DB['kannada-mass']?.songs?.length || 100) },
    { id: 'marwadi', label: 'Marwadi / Rajasthani', count: (CURATED_CATEGORIES_DB['marwadi-party']?.songs?.length || 100) + (CURATED_CATEGORIES_DB['marwadi-folk']?.songs?.length || 100) },
    { id: 'odia', label: 'Odia Hits', count: (CURATED_CATEGORIES_DB['odia-hits']?.songs?.length || 100) + (CURATED_CATEGORIES_DB['odia-dance']?.songs?.length || 100) },
    { id: 'haryanvi-bhojpuri', label: 'Haryanvi & Bhojpuri', count: (CURATED_CATEGORIES_DB['haryanvi-bhojpuri-party']?.songs?.length || 200) + (CURATED_CATEGORIES_DB['haryanvi-bhojpuri-desi-beats']?.songs?.length || 200) },
  ];
  const regionalTotalCount = regionalSubtypes.reduce((acc, r) => acc + r.count, 0);

  const WIZARD_LANGUAGES = [
    { id: 'hindi', label: 'Hindi', count: hindiCount, hint: `${hindiCount} songs ready` },
    { id: 'english', label: 'English', count: englishCount, hint: `${englishCount} songs ready` },
    { id: 'language', label: 'Language', count: regionalTotalCount, hint: `${regionalTotalCount} songs ready` },
  ];

  let bodyHtml = '';

  if (step === 0) {
    const isLangExpanded = (state.selectedLanguages || []).includes('language');
    bodyHtml = `
      <section class="mt-[4vh] flex flex-1 flex-col md:mt-[6vh] pb-36">
        <h1 class="font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(56px,8vw,120px)]">What are we playing?</h1>
        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p class="text-xl text-white/60 md:text-2xl">Pick every language the room wants.</p>
          ${renderRequestSongButton()}
        </div>

        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-7 md:mt-10">
          ${WIZARD_LANGUAGES.map((l) => {
            const sel = (state.selectedLanguages || []).includes(l.id);
            return `
              <button class="flex flex-col justify-between rounded-3xl border-4 p-5 text-left md:p-6 transition active:scale-[0.98] min-h-28 md:min-h-36 cursor-pointer ${sel ? 'border-lime bg-lime text-ink' : 'border-white/20 hover:border-white/60'}" data-wizard-lang="${l.id}" aria-pressed="${sel}">
                <span class="font-display uppercase leading-none text-4xl md:text-5xl">${esc(l.label)}</span>
                <span class="mt-3 text-lg md:text-xl ${sel ? 'text-ink/70' : 'text-white/55'}">${l.hint}</span>
              </button>
            `;
          }).join('')}
        </div>

        ${isLangExpanded ? `
          <div class="mt-6 rounded-3xl border-2 border-lime/40 bg-white/5 p-5 md:p-6 transition-all duration-300">
            <h3 class="mb-4 font-display text-2xl uppercase tracking-wide text-lime">Select Regional Languages:</h3>
            <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              ${regionalSubtypes.map((r) => {
                const subKey = `language:${r.id}`;
                const sel = (state.selectedSubtypes || []).includes(subKey);
                return `
                  <button class="flex flex-col justify-between rounded-3xl border-4 p-5 text-left md:p-6 transition active:scale-[0.98] min-h-24 md:min-h-28 cursor-pointer ${sel ? 'border-lime bg-lime text-ink' : 'border-white/20 hover:border-white/60'}" data-wizard-regional="${subKey}" aria-pressed="${sel}">
                    <span class="font-display uppercase leading-none text-2xl md:text-3xl">${esc(r.label)}</span>
                    <span class="mt-3 text-sm md:text-base ${sel ? 'text-ink/70' : 'text-white/55'}">${r.count} songs ready</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <p class="mt-6 text-lg text-white/45">
          Coming soon: Bengali, Malayalam.
        </p>'''

if old_wizard_step0 in code:
    code = code.replace(old_wizard_step0, new_wizard_step0, 1)
    print("Updated Step 0 in renderWizard() in app.js")
else:
    print("WARNING: old_wizard_step0 exact match not found in app.js")

# 4. Wire data-wizard-regional event listener in bindWizardEvents()
old_bind_lang = '''  // Step 0: Language selection
  document.querySelectorAll('[data-wizard-lang]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.wizardLang;
      if (state.selectedLanguages.includes(id)) {
        if (state.selectedLanguages.length > 1) {
          state.selectedLanguages = state.selectedLanguages.filter(l => l !== id);
        }
      } else {
        state.selectedLanguages.push(id);
      }
      state.activeVibeCard = state.selectedLanguages[0] || 'hindi';
      render();
    };
  });'''

new_bind_lang = '''  // Step 0: Language selection (Primary)
  document.querySelectorAll('[data-wizard-lang]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.wizardLang;
      if (state.selectedLanguages.includes(id)) {
        if (state.selectedLanguages.length > 1) {
          state.selectedLanguages = state.selectedLanguages.filter(l => l !== id);
        }
      } else {
        state.selectedLanguages.push(id);
      }
      state.activeVibeCard = state.selectedLanguages[0] || 'hindi';
      render();
    };
  });

  // Step 0: Regional Language Selection (In-Place Expandable Pills)
  document.querySelectorAll('[data-wizard-regional]').forEach((btn) => {
    btn.onclick = () => {
      const subKey = btn.dataset.wizardRegional;
      if (!state.selectedSubtypes) state.selectedSubtypes = [];
      if (state.selectedSubtypes.includes(subKey)) {
        state.selectedSubtypes = state.selectedSubtypes.filter(s => s !== subKey);
      } else {
        state.selectedSubtypes.push(subKey);
      }
      render();
    };
  });'''

if old_bind_lang in code:
    code = code.replace(old_bind_lang, new_bind_lang, 1)
    print("Added data-wizard-regional event listener to bindWizardEvents() in app.js")
else:
    print("WARNING: old_bind_lang not found in app.js")

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)
