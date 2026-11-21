import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const songsDir = path.join(root, 'public/songs');
const scriptTag = '<link rel="stylesheet" href="/styles/artist-explorer.css" /><script src="/js/ui/aurora-and-mix-engine.js" defer></script><script src="/js/ui/artist-explorer.js" defer></script>';

const dbModule = await import('../api/_lib/curated-songs-db.js?t=' + Date.now());
const db = dbModule.CURATED_CATEGORIES_DB;

console.log(`Loaded ${Object.keys(db).length} categories from curated-songs-db.js`);

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fmtSec(sec) {
  const s = Math.round(Number(sec) || 0);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

// -------------------------------------------------------------
// Helper to build Flight Payload for category pages
// -------------------------------------------------------------
function buildCategoryFlightPayload(slug, cat) {
  const songs = cat.songs || [];
  const count = songs.length;
  const label = cat.label || slug.replace(/-/g, ' ').toUpperCase();
  const lang = cat.lang || 'hindi';
  const setUrl = `/?set=${encodeURIComponent(label).replace(/%20/g, '+')}&lang=${encodeURIComponent(lang)}&kind=${encodeURIComponent(slug)}`;

  const topArtists = [...new Set(songs.map(s => (s.artist || '').split(/[,&]/)[0].trim()).filter(Boolean))].slice(0, 8).join(', ');
  const topSongTitles = songs.slice(0, 4).map(s => s.title).join(', ');

  const pageDescription = `${count} ${label.toLowerCase()} songs (${topSongTitles}…), official versions, each starting at its best part. Play them as a set on Audify.`;
  const hint = cat.hint || `The hottest party hits, official versions, each starting at its best part. Play them as a set on Audify.`;

  // Build the list of React Flight li elements
  const liElements = songs.map((s, idx) => {
    const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]) || '2gcsgfzqN8k';
    const entry = s.entrySec || s.hookStartSec || 30;
    const exit = s.exitSec || s.hookEndSec || (entry + 40);
    const hookStr = `${fmtSec(entry)}–${fmtSec(exit)}`;
    const ytUrl = `https://www.youtube.com/watch?v=${vId}&t=${entry}s`;
    const title = s.title;
    const artist = s.artist;
    const year = s.year || '2024';

    return ["$", "li", String(idx), {
      className: "flex items-baseline gap-3 border-b border-white/10 py-3",
      children: [
        ["$", "span", null, {
          className: "w-8 shrink-0 font-display text-xl text-white/35 tabular-nums",
          children: idx + 1
        }],
        ["$", "div", null, {
          className: "min-w-0 flex-1",
          children: [
            ["$", "div", null, {
              className: "font-display text-xl uppercase leading-tight md:text-2xl",
              children: title
            }],
            ["$", "div", null, {
              className: "text-white/55",
              children: [`${artist} · ${year}`]
            }]
          ]
        }],
        ["$", "a", null, {
          href: ytUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "shrink-0 text-right text-sm text-lime/80 hover:text-lime transition underline",
          title: "Listen on YouTube at hook",
          children: `▶ ${hookStr}`
        }]
      ]
    }];
  });

  const lines = [
    '1:"$Sreact.fragment"',
    '2:I[39756,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"default"]',
    '3:I[37457,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"default"]',
    '4:I[2355,["/naux/static/immutable/chunks/1re2h067bt17h.js"],"Analytics"]',
    '9:I[68027,["/naux/static/immutable/chunks/1re2h067bt17h.js"],"default",1]',
    ':HL["/naux/static/immutable/chunks/2imx6i21-1sy0.css","style"]',
    ':HL["/naux/static/immutable/media/83afe278b6a6bb3c-s.p.45535valc9rzk.woff2","font",{"crossOrigin":"","type":"font/woff2"}]',
    ':HL["/naux/static/immutable/media/9e9f04e3c37952ab-s.p.002ht2t_o636a.woff2","font",{"crossOrigin":"","type":"font/woff2"}]',
    '7:X',
    `0:{"P":null,"c":["","songs","${slug}"],"q":"","i":false,"f":[[["",{"children":["(party)",{"children":["songs",{"children":[["slug","${slug}","d",[]],{"children":["__PAGE__",{},"$undefined","$undefined",4608]},"$undefined","$undefined",4608]},"$undefined","$undefined",4608]},"$undefined","$undefined",4608]},"$undefined","$undefined",4624],[["$","$1","c",{"children":[[["$","script","script-0",{"src":"/naux/static/immutable/chunks/1re2h067bt17h.js","async":true,"nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"children":[["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"{\\"@context\\":\\"https://schema.org\\",\\"@graph\\":[{\\"@type\\":\\"WebApplication\\",\\"name\\":\\"Audify\\",\\"alternateName\\":\\"Audify: the aux, handled\\",\\"url\\":\\"https://www.naux.party/\\",\\"description\\":\\"Tell Audify the room and it plays the set: Hindi and Punjabi party songs that drop straight into the hook and mix into the next.\\",\\"applicationCategory\\":\\"MultimediaApplication\\",\\"operatingSystem\\":\\"Any (web browser)\\",\\"inLanguage\\":\\"en-IN\\",\\"audience\\":{\\"@type\\":\\"Audience\\",\\"audienceType\\":\\"House party hosts, DJs and event organisers in India\\"},\\"featureList\\":[\\"Builds a party set from language, mood, time of night and crowd size\\",\\"Hindi, Punjabi, Bollywood, English, Tamil, Telugu and Gujarati party songs\\",\\"Starts every song at its hook and crossfades into the next\\",\\"Pause, skip, play full, drag to the best part\\",\\"Save sets and play them again\\"]},{\\"@type\\":\\"Organization\\",\\"name\\":\\"Audify\\",\\"url\\":\\"https://www.naux.party/\\",\\"sameAs\\":[\\"https://www.instagram.com/swpnldubey/\\"]}]}"}}],["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\\"Segoe UI\\",Roboto,Helvetica,Arial,sans-serif,\\"Apple Color Emoji\\",\\"Segoe UI Emoji\\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L4",null,{}]]}]}]]}],{"children":[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/naux/static/immutable/chunks/2imx6i21-1sy0.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","div",null,{"className":"anton_3de222df-module__cdpv1W__variable inter_5901b7c6-module__ec5Qua__variable min-h-dvh bg-ink font-sans text-white","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":"$0:f:0:1:0:props:children:1:props:children:props:children:1:props:notFound:0:1:props:style","children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]]}]]}],{"children":["$","$L5",null,{"children":["$","$L6",null,{"children":["$","$1","c",{"children":[["$","main",null,{"className":"mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-10 md:px-10","children":["$La","$Lb","$Lc","$Ld","$Le","$Lf","$L10","$L11"]}],null,"$L12"]}]}]}],null,"$L8"]}]}]],null]}`,
    'b:I[97367,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"OutletBoundary"]',
    'c:"$Sreact.suspense"',
    'e:I[97367,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"ViewportBoundary"]',
    '10:I[97367,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"MetadataBoundary"]',
    '5:["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]',
    '6:["$","$1","c",{"children":["$La",null,["$","$Lb",null,{"children":["$","$c",null,{"name":"Next.MetadataOutlet","children":"$L9"}]}]]}]',
    '8:["$","$1","h",{"children":[null,["$","$Le",null,{"children":"$Lf"}],["$","div",null,{"hidden":true,"children":["$","$L10",null,{"children":"$L11"}]}]]}]',
    '7:C',
    `12:${JSON.stringify(["$", "script", null, {
      type: "application/ld+json",
      dangerouslySetInnerHTML: {
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${label} 2026`,
          url: `https://www.naux.party/songs/${slug}`,
          numberOfItems: count,
          itemListElement: songs.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "MusicRecording",
              name: s.title,
              byArtist: {
                "@type": "MusicGroup",
                name: s.artist
              }
            }
          }))
        })
      }
    }])}`,
    `a:${JSON.stringify(["$", "div", null, {
      className: "flex items-center justify-between font-display text-3xl tracking-wide",
      children: [
        ["$", "a", null, { href: "/", className: "text-lime", children: "Audify" }],
        ["$", "a", null, { href: "/songs", className: "text-2xl text-white/60 hover:text-white", children: "ALL LISTS" }]
      ]
    }])}`,
    `b:${JSON.stringify(["$", "h1", null, {
      className: "mt-[4vh] font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(48px,5.5vw,84px)]",
      children: [`${label} 2026`]
    }])}`,
    `c:${JSON.stringify(["$", "p", null, {
      className: "mt-4 max-w-2xl text-lg text-white/65 md:text-xl",
      children: hint
    }])}`,
    `d:${JSON.stringify(["$", "p", null, {
      className: "mt-3 text-base text-white/45",
      children: [`${count} songs, from ${topArtists} and more. Updated daily.`]
    }])}`,
    `e:${JSON.stringify(["$", "a", null, {
      href: setUrl,
      className: "mt-8 self-start rounded-2xl bg-lime px-8 py-4 font-display text-2xl tracking-wide text-ink",
      children: "PLAY THIS AS A SET →"
    }])}`,
    `f:${JSON.stringify(["$", "ol", null, {
      className: "mt-8 flex flex-col",
      children: liElements
    }])}`,
    `10:${JSON.stringify(["$", "a", null, {
      href: setUrl,
      className: "mt-10 self-start rounded-2xl bg-lime px-8 py-4 font-display text-2xl tracking-wide text-ink",
      children: "PLAY THIS AS A SET →"
    }])}`,
    `11:${JSON.stringify([
      ["$", "title", "0", { children: `${label} 2026: ${count} hits for your house party · Audify` }],
      ["$", "meta", "1", { name: "description", content: pageDescription }],
      ["$", "link", "2", { rel: "canonical", href: `https://www.naux.party/songs/${slug}` }],
      ["$", "meta", "3", { property: "og:title", content: `${label} · Audify` }],
      ["$", "meta", "4", { property: "og:description", content: pageDescription }],
      ["$", "meta", "5", { property: "og:url", content: `https://www.naux.party/songs/${slug}` }]
    ])}`
  ];

  return lines.join('\n');
}

// Convert flight payload string to script tags chunked into <= 65536 bytes
function serializeFlightScriptTags(payload) {
  const CHUNK_SIZE = 65536;
  const chunks = [];
  for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
    chunks.push(payload.slice(i, i + CHUNK_SIZE));
  }

  let tags = '<script>(self.__next_f=self.__next_f||[]).push([0])</script>';
  for (const chunk of chunks) {
    tags += `<script>self.__next_f.push([1,${JSON.stringify(chunk)}])</script>`;
  }
  return tags;
}

// -------------------------------------------------------------
// 1. Rebuild / create every category song list page
// -------------------------------------------------------------
for (const [slug, cat] of Object.entries(db)) {
  const songs = cat.songs || [];
  const count = songs.length;
  const label = cat.label || slug.replace(/-/g, ' ').toUpperCase();
  const lang = cat.lang || 'hindi';
  const setUrl = `/?set=${encodeURIComponent(label).replace(/%20/g, '+')}&amp;lang=${encodeURIComponent(lang)}&amp;kind=${encodeURIComponent(slug)}`;

  const topArtists = [...new Set(songs.map(s => (s.artist || '').split(/[,&]/)[0].trim()).filter(Boolean))].slice(0, 8).join(', ');
  const topSongTitles = songs.slice(0, 4).map(s => s.title).join(', ');

  const pageDescription = `${count} ${label.toLowerCase()} songs (${topSongTitles}…), official versions, each starting at its best part. Play them as a set on Audify.`;
  const hint = cat.hint || `The hottest party hits, official versions, each starting at its best part. Play them as a set on Audify.`;

  // Build the <li> items
  const liItems = songs.map((s, idx) => {
    const vId = s.videoId || (s.youtube_ids && s.youtube_ids[0]) || '2gcsgfzqN8k';
    const entry = s.entrySec || s.hookStartSec || 30;
    const exit = s.exitSec || s.hookEndSec || (entry + 40);
    const hookStr = `${fmtSec(entry)}–${fmtSec(exit)}`;
    const ytUrl = `https://www.youtube.com/watch?v=${vId}&t=${entry}s`;
    const titleEsc = escapeHtml(s.title);
    const artistEsc = escapeHtml(s.artist);
    const year = s.year || '2024';

    return `<li class="flex items-baseline gap-3 border-b border-white/10 py-3"><span class="w-8 shrink-0 font-display text-xl text-white/35 tabular-nums">${idx + 1}</span><div class="min-w-0 flex-1"><div class="font-display text-xl uppercase leading-tight md:text-2xl">${titleEsc}</div><div class="text-white/55">${artistEsc}<!-- --> · ${year}</div></div><a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="shrink-0 text-right text-sm text-lime/80 hover:text-lime transition underline" title="Listen on YouTube at hook">▶ ${hookStr}</a></li>`;
  }).join('');

  // JSON-LD ItemList
  const jsonLdItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${label} 2026`,
    "url": `https://www.naux.party/songs/${slug}`,
    "numberOfItems": count,
    "itemListElement": songs.map((s, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "MusicRecording",
        "name": s.title,
        "byArtist": {
          "@type": "MusicGroup",
          "name": s.artist
        }
      }
    }))
  };

  // Build Flight script tags
  const flightPayload = buildCategoryFlightPayload(slug, cat);
  const flightScripts = serializeFlightScriptTags(flightPayload);

  // Full clean HTML page
  const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="preload" href="/naux/static/immutable/media/83afe278b6a6bb3c-s.p.45535valc9rzk.woff2" as="font" crossorigin="" type="font/woff2"/><link rel="preload" href="/naux/static/immutable/media/9e9f04e3c37952ab-s.p.002ht2t_o636a.woff2" as="font" crossorigin="" type="font/woff2"/><link rel="stylesheet" href="/naux/static/immutable/chunks/2imx6i21-1sy0.css" data-precedence="next"/><link rel="preload" as="script" fetchPriority="low" href="/naux/static/immutable/chunks/25kvgcvbp6c14.js"/><script src="/naux/static/immutable/chunks/2k8n-7ua74o0f.js" async=""></script><script src="/naux/static/immutable/chunks/37t20ad36md5c.js" async=""></script><script src="/naux/static/immutable/chunks/2cdztrbnb-eob.js" async=""></script><script src="/naux/static/immutable/chunks/turbopack-3ti37l80ec3r-.js" async=""></script><script src="/naux/static/immutable/chunks/2corl6wyj4669.js" async=""></script><script src="/naux/static/immutable/chunks/1re2h067bt17h.js" async=""></script><meta name="next-size-adjust" content=""/><title>${escapeHtml(label)} 2026: ${count} hits for your house party · Audify</title><meta name="description" content="${escapeHtml(pageDescription)}"/><link rel="canonical" href="https://www.naux.party/songs/${slug}"/><meta property="og:title" content="${escapeHtml(label)} · Audify"/><meta property="og:description" content="${escapeHtml(pageDescription)}"/><meta property="og:url" content="https://www.naux.party"/><meta property="og:site_name" content="Audify"/><meta property="og:locale" content="en_IN"/><meta property="og:image" content="https://www.naux.party/opengraph-image?fecb943982ab2d95"/><meta property="og:image:type" content="image/png"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta property="og:image:alt" content="Audify: the aux, handled. Party sets that drop straight into the hook."/><meta property="og:type" content="website"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${escapeHtml(label)} · Audify"/><meta name="twitter:description" content="${escapeHtml(pageDescription)}"/><meta name="twitter:image" content="https://www.naux.party/opengraph-image?fecb943982ab2d95"/><meta name="twitter:image:alt" content="Audify: the aux, handled. Party sets that drop straight into the hook."/><meta name="twitter:image:type" content="image/png"/><meta name="twitter:image:width" content="1200"/><meta name="twitter:image:height" content="630"/><link rel="icon" href="/icon?dbb33e0bd88ec9f4" type="image/png" sizes="192x192"/><link rel="apple-touch-icon" href="/apple-icon?a64ab5920b136c6e" type="image/png" sizes="180x180"/><script src="/naux/static/immutable/chunks/0c0hxoamwjsbw.js" noModule=""></script></head><body><div hidden=""><!--$--><!--/$--></div><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebApplication","name":"Audify","alternateName":"Audify: the aux, handled","url":"https://www.naux.party/","description":"Tell Audify the room and it plays the set: Hindi and Punjabi party songs that drop straight into the hook and mix into the next.","applicationCategory":"MultimediaApplication","operatingSystem":"Any (web browser)","inLanguage":"en-IN","audience":{"@type":"Audience","audienceType":"House party hosts, DJs and event organisers in India"},"featureList":["Builds a party set from language, mood, time of night and crowd size","Hindi, Punjabi, Bollywood, English, Tamil, Telugu and Gujarati party songs","Starts every song at its hook and crossfades into the next","Pause, skip, play full, drag to the best part","Save sets and play them again"]},{"@type":"Organization","name":"Audify","url":"https://www.naux.party/","sameAs":["https://www.instagram.com/swpnldubey/"]}]}</script><div class="anton_3de222df-module__cdpv1W__variable inter_5901b7c6-module__ec5Qua__variable min-h-dvh bg-ink font-sans text-white"><main class="mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-10 md:px-10"><script type="application/ld+json">${JSON.stringify(jsonLdItemList)}</script><div class="flex items-center justify-between font-display text-3xl tracking-wide"><a href="/" class="text-lime">Audify</a><a href="/songs" class="text-2xl text-white/60 hover:text-white">ALL LISTS</a></div><h1 class="mt-[4vh] font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(48px,5.5vw,84px)]">${escapeHtml(label)}<!-- --> <!-- -->2026</h1><p class="mt-4 max-w-2xl text-lg text-white/65 md:text-xl">${escapeHtml(hint)}</p><p class="mt-3 text-base text-white/45">${count}<!-- --> songs<!-- -->, from ${escapeHtml(topArtists)} and more<!-- -->. Updated daily.</p><a href="${setUrl}" class="mt-8 self-start rounded-2xl bg-lime px-8 py-4 font-display text-2xl tracking-wide text-ink">PLAY THIS AS A SET →</a><ol class="mt-8 flex flex-col">${liItems}</ol><a href="${setUrl}" class="mt-10 self-start rounded-2xl bg-lime px-8 py-4 font-display text-2xl tracking-wide text-ink">PLAY THIS AS A SET →</a><p class="mt-6 text-sm text-white/40">Songs play through YouTube's official uploads. Audify starts each one at its best part.</p></main><!--$--><!--/$--></div><script src="/naux/static/immutable/chunks/25kvgcvbp6c14.js" id="_R_" async=""></script>${flightScripts}${scriptTag}</body></html>`;

  const targetFiles = [
    path.join(songsDir, `${slug}.html`),
    path.join(songsDir, slug, 'index.html')
  ];

  const slugDir = path.join(songsDir, slug);
  if (!fs.existsSync(slugDir)) {
    fs.mkdirSync(slugDir, { recursive: true });
  }

  for (const filePath of targetFiles) {
    fs.writeFileSync(filePath, fullHtml, 'utf8');
  }

  console.log(`✓ Rebuilt public/songs/${slug} (HTML & Flight: ${count} songs)`);
}

// -------------------------------------------------------------
// 2. Rebuild directory pages: public/songs.html and public/songs/index.html
// -------------------------------------------------------------
const dirPages = [
  path.join(root, 'public/songs.html'),
  path.join(songsDir, 'index.html')
];

// Build static HTML <ul> items for /songs
const catListHtml = Object.entries(db).map(([slug, cat]) => {
  const count = (cat.songs || []).length;
  const label = cat.label || slug.replace(/-/g, ' ').toUpperCase();
  return `<li><a href="/songs/${slug}" class="flex h-full flex-col rounded-2xl border-2 border-white/15 p-5 transition hover:border-lime"><span class="font-display text-2xl uppercase leading-tight">${escapeHtml(label)}</span><span class="mt-1 text-white/55">${count}<!-- --> songs</span></a></li>`;
}).join('');

// Build Flight payload lines for /songs directory
function buildDirectoryFlightPayload() {
  const catItemsFlight = Object.entries(db).map(([slug, cat]) => {
    const count = (cat.songs || []).length;
    const label = cat.label || slug.replace(/-/g, ' ').toUpperCase();
    return ["$", "li", slug, {
      children: ["$", "a", null, {
        href: `/songs/${slug}`,
        className: "flex h-full flex-col rounded-2xl border-2 border-white/15 p-5 transition hover:border-lime",
        children: [
          ["$", "span", null, {
            className: "font-display text-2xl uppercase leading-tight",
            children: label
          }],
          ["$", "span", null, {
            className: "mt-1 text-white/55",
            children: [count, " songs"]
          }]
        ]
      }]
    }];
  });

  const lines = [
    '1:"$Sreact.fragment"',
    '2:I[39756,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"default"]',
    '3:I[37457,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"default"]',
    '4:I[2355,["/naux/static/immutable/chunks/1re2h067bt17h.js"],"Analytics"]',
    '9:I[68027,["/naux/static/immutable/chunks/1re2h067bt17h.js"],"default",1]',
    ':HL["/naux/static/immutable/chunks/2imx6i21-1sy0.css","style"]',
    ':HL["/naux/static/immutable/media/83afe278b6a6bb3c-s.p.45535valc9rzk.woff2","font",{"crossOrigin":"","type":"font/woff2"}]',
    ':HL["/naux/static/immutable/media/9e9f04e3c37952ab-s.p.002ht2t_o636a.woff2","font",{"crossOrigin":"","type":"font/woff2"}]',
    '7:X',
    '0:{"P":null,"c":["","songs"],"q":"","i":false,"f":[[["",{"children":["(party)",{"children":["songs",{"children":["__PAGE__",{},"$undefined","$undefined",4608]},"$undefined","$undefined",4608]},"$undefined","$undefined",4608]},"$undefined","$undefined",4624],[["$","$1","c",{"children":[[["$","script","script-0",{"src":"/naux/static/immutable/chunks/1re2h067bt17h.js","async":true,"nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"children":[["$","script",null,{"type":"application/ld+json","dangerouslySetInnerHTML":{"__html":"{\\"@context\\":\\"https://schema.org\\",\\"@graph\\":[{\\"@type\\":\\"WebApplication\\",\\"name\\":\\"Audify\\",\\"alternateName\\":\\"Audify: the aux, handled\\",\\"url\\":\\"https://www.naux.party/\\",\\"description\\":\\"Tell Audify the room and it plays the set: Hindi and Punjabi party songs that drop straight into the hook and mix into the next.\\",\\"applicationCategory\\":\\"MultimediaApplication\\",\\"operatingSystem\\":\\"Any (web browser)\\",\\"inLanguage\\":\\"en-IN\\",\\"audience\\":{\\"@type\\":\\"Audience\\",\\"audienceType\\":\\"House party hosts, DJs and event organisers in India\\"},\\"featureList\\":[\\"Builds a party set from language, mood, time of night and crowd size\\",\\"Hindi, Punjabi, Bollywood, English, Tamil, Telugu and Gujarati party songs\\",\\"Starts every song at its hook and crossfades into the next\\",\\"Pause, skip, play full, drag to the best part\\",\\"Save sets and play them again\\"]},{\\"@type\\":\\"Organization\\",\\"name\\":\\"Audify\\",\\"url\\":\\"https://www.naux.party/\\",\\"sameAs\\":[\\"https://www.instagram.com/swpnldubey/\\"]}]}"}}],["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\\"Segoe UI\\",Roboto,Helvetica,Arial,sans-serif,\\"Apple Color Emoji\\",\\"Segoe UI Emoji\\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L4",null,{}]]}]}]]}],{"children":[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/naux/static/immutable/chunks/2imx6i21-1sy0.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","div",null,{"className":"anton_3de222df-module__cdpv1W__variable inter_5901b7c6-module__ec5Qua__variable min-h-dvh bg-ink font-sans text-white","children":["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":"$0:f:0:1:0:props:children:1:props:children:props:children:1:props:notFound:0:1:props:style","children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]]}]]}],{"children":["$","$L5",null,{"children":["$","$L6",null,{"children":["$","$1","c",{"children":[["$","main",null,{"className":"mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-10 md:px-10","children":["$La","$Lb","$Lc","$L8","$Ld"]}],null]}]}]}],null,"$L8"]}]}]],null]}',
    'b:I[97367,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"OutletBoundary"]',
    'c:"$Sreact.suspense"',
    'e:I[97367,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"ViewportBoundary"]',
    '10:I[97367,["/naux/static/immutable/chunks/2corl6wyj4669.js"],"MetadataBoundary"]',
    '5:["$","$1","c",{"children":[null,["$","$L2",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]',
    '6:["$","$1","c",{"children":["$La",null,["$","$Lb",null,{"children":["$","$c",null,{"name":"Next.MetadataOutlet","children":"$L9"}]}]]}]',
    '7:C',
    `a:${JSON.stringify(["$", "a", null, { href: "/", className: "font-display text-3xl tracking-wide text-lime", children: "Audify" }])}`,
    `b:${JSON.stringify(["$", "h1", null, { className: "mt-[4vh] font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(48px,5.5vw,84px)]", children: "Party song lists" }])}`,
    `c:${JSON.stringify(["$", "p", null, { className: "mt-4 max-w-2xl text-lg text-white/65 md:text-xl", children: "The songs Audify plays, by language and mood, updated every day. Every song is the official version, and Audify starts each one at its best part. Pick a list and play it as a set." }])}`,
    `8:${JSON.stringify(["$", "ul", null, { className: "mt-8 grid gap-3 sm:grid-cols-2", children: catItemsFlight }])}`,
    `d:${JSON.stringify(["$", "a", null, { href: "/", className: "mt-10 self-start rounded-2xl bg-lime px-8 py-4 font-display text-2xl tracking-wide text-ink", children: "BUILD YOUR SET →" }])}`,
    `f:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]`,
    `11:[["$","title","0",{"children":"Party song lists · Hindi, Punjabi, English & Regional · Audify"}],["$","meta","1",{"name":"description","content":"Every song Audify plays, organized by language and vibe. Official versions, starting at their best part. Pick a list and play it as a set."}],["$","link","2",{"rel":"canonical","href":"https://www.naux.party/songs"}]]`
  ];

  return lines.join('\n');
}

const dirFlightScripts = serializeFlightScriptTags(buildDirectoryFlightPayload());

const directoryHtml = `<!DOCTYPE html><html lang="en"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="preload" href="/naux/static/immutable/media/83afe278b6a6bb3c-s.p.45535valc9rzk.woff2" as="font" crossorigin="" type="font/woff2"/><link rel="preload" href="/naux/static/immutable/media/9e9f04e3c37952ab-s.p.002ht2t_o636a.woff2" as="font" crossorigin="" type="font/woff2"/><link rel="stylesheet" href="/naux/static/immutable/chunks/2imx6i21-1sy0.css" data-precedence="next"/><link rel="preload" as="script" fetchPriority="low" href="/naux/static/immutable/chunks/25kvgcvbp6c14.js"/><script src="/naux/static/immutable/chunks/2k8n-7ua74o0f.js" async=""></script><script src="/naux/static/immutable/chunks/37t20ad36md5c.js" async=""></script><script src="/naux/static/immutable/chunks/2cdztrbnb-eob.js" async=""></script><script src="/naux/static/immutable/chunks/turbopack-3ti37l80ec3r-.js" async=""></script><script src="/naux/static/immutable/chunks/2corl6wyj4669.js" async=""></script><script src="/naux/static/immutable/chunks/1re2h067bt17h.js" async=""></script><meta name="next-size-adjust" content=""/><title>Party song lists · Hindi, Punjabi, English &amp; Regional · Audify</title><meta name="description" content="Every song Audify plays, organized by language and vibe. Official versions, starting at their best part. Pick a list and play it as a set."/><link rel="canonical" href="https://www.naux.party/songs"/><meta property="og:title" content="Audify · The aux, handled"/><meta property="og:description" content="Tell Audify the room and it plays the set: Hindi and Punjabi party songs that drop straight into the hook and mix into the next."/><meta property="og:url" content="https://www.naux.party"/><meta property="og:site_name" content="Audify"/><meta property="og:locale" content="en_IN"/><meta property="og:image" content="https://www.naux.party/opengraph-image?fecb943982ab2d95"/><meta property="og:image:type" content="image/png"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta property="og:image:alt" content="Audify: the aux, handled. Party sets that drop straight into the hook."/><meta property="og:type" content="website"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="Audify · The aux, handled"/><meta name="twitter:description" content="Tell Audify the room and it plays the set: Hindi and Punjabi party songs that drop straight into the hook and mix into the next."/><meta name="twitter:image" content="https://www.naux.party/opengraph-image?fecb943982ab2d95"/><meta name="twitter:image:alt" content="Audify: the aux, handled. Party sets that drop straight into the hook."/><meta name="twitter:image:type" content="image/png"/><meta name="twitter:image:width" content="1200"/><meta name="twitter:image:height" content="630"/><link rel="icon" href="/icon?dbb33e0bd88ec9f4" type="image/png" sizes="192x192"/><link rel="apple-touch-icon" href="/apple-icon?a64ab5920b136c6e" type="image/png" sizes="180x180"/><script src="/naux/static/immutable/chunks/0c0hxoamwjsbw.js" noModule=""></script></head><body><div hidden=""><!--$--><!--/$--></div><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebApplication","name":"Audify","alternateName":"Audify: the aux, handled","url":"https://www.naux.party/","description":"Tell Audify the room and it plays the set: Hindi and Punjabi party songs that drop straight into the hook and mix into the next.","applicationCategory":"MultimediaApplication","operatingSystem":"Any (web browser)","inLanguage":"en-IN","audience":{"@type":"Audience","audienceType":"House party hosts, DJs and event organisers in India"},"featureList":["Builds a party set from language, mood, time of night and crowd size","Hindi, Punjabi, Bollywood, English, Tamil, Telugu and Gujarati party songs","Starts every song at its hook and crossfades into the next","Pause, skip, play full, drag to the best part","Save sets and play them again"]},{"@type":"Organization","name":"Audify","url":"https://www.naux.party/","sameAs":["https://www.instagram.com/swpnldubey/"]}]}</script><div class="anton_3de222df-module__cdpv1W__variable inter_5901b7c6-module__ec5Qua__variable min-h-dvh bg-ink font-sans text-white"><main class="mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-10 md:px-10"><a href="/" class="font-display text-3xl tracking-wide text-lime">Audify</a><h1 class="mt-[4vh] font-display text-[44px] uppercase leading-[0.9] md:text-[clamp(48px,5.5vw,84px)]">Party song lists</h1><p class="mt-4 max-w-2xl text-lg text-white/65 md:text-xl">The songs Audify plays, by language and mood, updated every day. Every song is the official version, and Audify starts each one at its best part. Pick a list and play it as a set.</p><ul class="mt-8 grid gap-3 sm:grid-cols-2">${catListHtml}</ul><a href="/" class="mt-10 self-start rounded-2xl bg-lime px-8 py-4 font-display text-2xl tracking-wide text-ink">BUILD YOUR SET →</a></main><!--$--><!--/$--></div><script src="/naux/static/immutable/chunks/25kvgcvbp6c14.js" id="_R_" async=""></script>${dirFlightScripts}${scriptTag}</body></html>`;

for (const dirFile of dirPages) {
  fs.writeFileSync(dirFile, directoryHtml, 'utf8');
  console.log(`✓ Updated directory page: ${path.relative(root, dirFile)}`);
}

console.log('\nAll 23 category pages and directory pages rebuilt with 100% consistency!');
