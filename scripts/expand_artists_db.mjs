import fs from 'fs';
import path from 'path';
import { ARTISTS_DB, HINDI_ARTIST_SUBCATEGORIES, ENGLISH_ARTIST_SUBCATEGORIES } from '../api/_lib/artists-db.js';

const repoRoot = 'C:/Users/itzra/.gemini/antigravity/scratch/NOVA-DJ-REMIXER';
const targetFile = path.join(repoRoot, 'api/_lib/artists-db.js');

// 1. New Top Hindi Artists to add
const newHindiArtists = {
  "atif-aslam": {
    id: "atif-aslam",
    name: "Atif Aslam",
    altNames: ["Atif", "Atif Aslam Live"],
    lang: "hindi",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    country: "India",
    verified: true,
    bio: "The iconic, soulful voice behind Bollywood's most unforgettable romantic, breakup, and sufi anthems.",
    subcategories: ["romantic", "breakup", "sad", "acoustic", "sufi", "pop", "trending", "all"],
    songs: [
      { id: "atif-1", title: "Tera Hone Laga Hoon", artist: "Atif Aslam, Alisha Chinai · Pritam", year: "2009", durationSec: 300, hookStartSec: 45, hookEndSec: 85, entrySec: 45, exitSec: 85, videoId: "rTuxUAuJRyY", youtube_ids: ["rTuxUAuJRyY"], playFull: false, energy: 9 },
      { id: "atif-2", title: "Tu Jaane Na", artist: "Atif Aslam · Pritam", year: "2009", durationSec: 337, hookStartSec: 50, hookEndSec: 90, entrySec: 50, exitSec: 90, videoId: "P8PWN1OmZOA", youtube_ids: ["P8PWN1OmZOA"], playFull: false, energy: 9 },
      { id: "atif-3", title: "Jeena Jeena", artist: "Atif Aslam · Sachin-Jigar", year: "2015", durationSec: 229, hookStartSec: 36, hookEndSec: 76, entrySec: 36, exitSec: 76, videoId: "vK4Vq1d102M", youtube_ids: ["vK4Vq1d102M"], playFull: false, energy: 8 },
      { id: "atif-4", title: "Pehli Nazar Mein", artist: "Atif Aslam · Pritam", year: "2008", durationSec: 312, hookStartSec: 42, hookEndSec: 82, entrySec: 42, exitSec: 82, videoId: "BadBAMnPX0I", youtube_ids: ["BadBAMnPX0I"], playFull: false, energy: 9 },
      { id: "atif-5", title: "Dil Diyan Gallan", artist: "Atif Aslam · Vishal-Shekhar", year: "2017", durationSec: 260, hookStartSec: 48, hookEndSec: 88, entrySec: 48, exitSec: 88, videoId: "SAcpESN_Fk4", youtube_ids: ["SAcpESN_Fk4"], playFull: false, energy: 8 },
      { id: "atif-6", title: "Woh Lamhe Woh Baatein", artist: "Atif Aslam · Mithoon", year: "2005", durationSec: 318, hookStartSec: 50, hookEndSec: 90, entrySec: 50, exitSec: 90, videoId: "M1fT1l00Gz4", youtube_ids: ["M1fT1l00Gz4"], playFull: false, energy: 9 },
      { id: "atif-7", title: "Aadat (Deep Cut)", artist: "Atif Aslam · Goher Mumtaz", year: "2005", durationSec: 268, hookStartSec: 40, hookEndSec: 80, entrySec: 40, exitSec: 80, videoId: "j8i96w-XwL0", youtube_ids: ["j8i96w-XwL0"], playFull: false, energy: 9 },
      { id: "atif-8", title: "Tere Sang Yaara", artist: "Atif Aslam · Arko", year: "2016", durationSec: 290, hookStartSec: 35, hookEndSec: 75, entrySec: 35, exitSec: 75, videoId: "u_v_Lz9r2aY", youtube_ids: ["u_v_Lz9r2aY"], playFull: false, energy: 8 }
    ]
  },
  "diljit-dosanjh": {
    id: "diljit-dosanjh",
    name: "Diljit Dosanjh",
    altNames: ["Diljit", "Dosanjh"],
    lang: "hindi",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    country: "India",
    verified: true,
    bio: "Global Punjabi icon, Coachella headliner, and chart-topping Bollywood hitmaker.",
    subcategories: ["party", "hiphop", "pop", "trending", "all"],
    songs: [
      { id: "diljit-1", title: "Lover", artist: "Diljit Dosanjh · Intense", year: "2021", durationSec: 191, hookStartSec: 30, hookEndSec: 70, entrySec: 30, exitSec: 70, videoId: "mH_LHSS394k", youtube_ids: ["mH_LHSS394k"], playFull: false, energy: 9 },
      { id: "diljit-2", title: "Naina", artist: "Diljit Dosanjh, Badshah", year: "2024", durationSec: 180, hookStartSec: 32, hookEndSec: 72, entrySec: 32, exitSec: 72, videoId: "k5i_fK_Uj_w", youtube_ids: ["k5i_fK_Uj_w"], playFull: false, energy: 9 },
      { id: "diljit-3", title: "G.O.A.T.", artist: "Diljit Dosanjh · G-Funk", year: "2020", durationSec: 223, hookStartSec: 35, hookEndSec: 75, entrySec: 35, exitSec: 75, videoId: "cl0a3i2wFcc", youtube_ids: ["cl0a3i2wFcc"], playFull: false, energy: 10 },
      { id: "diljit-4", title: "Born to Shine", artist: "Diljit Dosanjh", year: "2020", durationSec: 213, hookStartSec: 32, hookEndSec: 72, entrySec: 32, exitSec: 72, videoId: "Z_q1bT0c1rU", youtube_ids: ["Z_q1bT0c1rU"], playFull: false, energy: 10 },
      { id: "diljit-5", title: "Sauda Khara Khara", artist: "Diljit Dosanjh, Sukhbir, Dhvani Bhanushali", year: "2019", durationSec: 220, hookStartSec: 42, hookEndSec: 82, entrySec: 42, exitSec: 82, videoId: "w_i_p7rE1b8", youtube_ids: ["w_i_p7rE1b8"], playFull: false, energy: 10 },
      { id: "diljit-6", title: "Proper Patola", artist: "Diljit Dosanjh, Badshah, Aastha Gill", year: "2018", durationSec: 178, hookStartSec: 25, hookEndSec: 65, entrySec: 25, exitSec: 65, videoId: "r_1_Z8l0-14", youtube_ids: ["r_1_Z8l0-14"], playFull: false, energy: 9 }
    ]
  },
  "karan-aujla": {
    id: "karan-aujla",
    name: "Karan Aujla",
    altNames: ["Geetan Di Machine", "Aujla"],
    lang: "hindi",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    country: "India",
    verified: true,
    bio: "The lyrical powerhouse and Billboard-charting pioneer of modern Punjabi hip-hop.",
    subcategories: ["hiphop", "party", "pop", "trending", "all"],
    songs: [
      { id: "aujla-1", title: "Tauba Tauba", artist: "Karan Aujla · Bad Newz", year: "2024", durationSec: 207, hookStartSec: 35, hookEndSec: 75, entrySec: 35, exitSec: 75, videoId: "LK7-_dgAVQE", youtube_ids: ["LK7-_dgAVQE"], playFull: false, energy: 10 },
      { id: "aujla-2", title: "Softly", artist: "Karan Aujla, Ikky", year: "2023", durationSec: 155, hookStartSec: 25, hookEndSec: 65, entrySec: 25, exitSec: 65, videoId: "cWMxCE2HTag", youtube_ids: ["cWMxCE2HTag"], playFull: false, energy: 9 },
      { id: "aujla-3", title: "Winning Speech", artist: "Karan Aujla, Mxrci", year: "2024", durationSec: 202, hookStartSec: 30, hookEndSec: 70, entrySec: 30, exitSec: 70, videoId: "aM1-J3g_zLg", youtube_ids: ["aM1-J3g_zLg"], playFull: false, energy: 10 },
      { id: "aujla-4", title: "White Brown Black", artist: "Karan Aujla, Avvy Sra", year: "2022", durationSec: 178, hookStartSec: 28, hookEndSec: 68, entrySec: 28, exitSec: 68, videoId: "k_uN1_09A-4", youtube_ids: ["k_uN1_09A-4"], playFull: false, energy: 9 },
      { id: "aujla-5", title: "Admirin' You", artist: "Karan Aujla ft. Preston Pablo", year: "2023", durationSec: 214, hookStartSec: 32, hookEndSec: 72, entrySec: 32, exitSec: 72, videoId: "yW-X7s7zC0w", youtube_ids: ["yW-X7s7zC0w"], playFull: false, energy: 9 }
    ]
  },
  "pritam": {
    id: "pritam",
    name: "Pritam",
    altNames: ["Pritam Chakraborty", "JAM8"],
    lang: "hindi",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    country: "India",
    verified: true,
    bio: "The undisputed king of Bollywood melody, behind 2 decades of iconic party and love hits.",
    subcategories: ["party", "romantic", "rock", "pop", "trending", "all"],
    songs: [
      { id: "pritam-1", title: "Badtameez Dil", artist: "Benny Dayal, Shefali Alvares · Pritam", year: "2013", durationSec: 252, hookStartSec: 42, hookEndSec: 82, entrySec: 42, exitSec: 82, videoId: "II2EO3NwUrQ", youtube_ids: ["II2EO3NwUrQ"], playFull: false, energy: 10 },
      { id: "pritam-2", title: "Balam Pichkari", artist: "Vishal Dadlani, Shalmali Kholgade · Pritam", year: "2013", durationSec: 289, hookStartSec: 48, hookEndSec: 88, entrySec: 48, exitSec: 88, videoId: "0WtRNGubWGA", youtube_ids: ["0WtRNGubWGA"], playFull: false, energy: 10 },
      { id: "pritam-3", title: "Subah Hone Na De", artist: "Mika Singh, Shefali Alvares · Pritam", year: "2011", durationSec: 288, hookStartSec: 45, hookEndSec: 85, entrySec: 45, exitSec: 85, videoId: "d6P_Cj8lW44", youtube_ids: ["d6P_Cj8lW44"], playFull: false, energy: 10 },
      { id: "pritam-4", title: "Kesariya", artist: "Arijit Singh · Pritam", year: "2022", durationSec: 268, hookStartSec: 46, hookEndSec: 86, entrySec: 46, exitSec: 86, videoId: "BddP6PYo2gs", youtube_ids: ["BddP6PYo2gs"], playFull: false, energy: 8 }
    ]
  },
  "mika-singh": {
    id: "mika-singh",
    name: "Mika Singh",
    altNames: ["Mika", "The King of Party"],
    lang: "hindi",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
    country: "India",
    verified: true,
    bio: "Bollywood's explosive powerhouse singer, delivering non-stop club bangers and dance hits.",
    subcategories: ["party", "pop", "retro", "trending", "all"],
    songs: [
      { id: "mika-1", title: "Mauja Hi Mauja", artist: "Mika Singh · Pritam", year: "2007", durationSec: 245, hookStartSec: 40, hookEndSec: 80, entrySec: 40, exitSec: 80, videoId: "ea9m4eE4-Z4", youtube_ids: ["ea9m4eE4-Z4"], playFull: false, energy: 10 },
      { id: "mika-2", title: "Agal Bagal", artist: "Mika Singh · Pritam", year: "2013", durationSec: 260, hookStartSec: 38, hookEndSec: 78, entrySec: 38, exitSec: 78, videoId: "3e3P_5jD6b4", youtube_ids: ["3e3P_5jD6b4"], playFull: false, energy: 9 },
      { id: "mika-3", title: "Jumme Ki Raat", artist: "Mika Singh, Palak Muchhal · Himesh Reshammiya", year: "2014", durationSec: 274, hookStartSec: 42, hookEndSec: 82, entrySec: 42, exitSec: 82, videoId: "bYg2bLd-T08", youtube_ids: ["bYg2bLd-T08"], playFull: false, energy: 10 }
    ]
  }
};

// 2. New Top English Artists to add
const newEnglishArtists = {
  "ariana-grande": {
    id: "ariana-grande",
    name: "Ariana Grande",
    altNames: ["Ariana", "Ari"],
    lang: "english",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    country: "United States",
    verified: true,
    bio: "Multi-platinum pop icon with four-octave vocal range and record-breaking Billboard #1 hits.",
    subcategories: ["pop", "rnb", "romantic", "party", "trending", "all"],
    songs: [
      { id: "ari-1", title: "7 rings", artist: "Ariana Grande", year: "2019", durationSec: 178, hookStartSec: 28, hookEndSec: 68, entrySec: 28, exitSec: 68, videoId: "QYh6mYIJG2Y", youtube_ids: ["QYh6mYIJG2Y"], playFull: false, energy: 9 },
      { id: "ari-2", title: "thank u, next", artist: "Ariana Grande", year: "2018", durationSec: 207, hookStartSec: 35, hookEndSec: 75, entrySec: 35, exitSec: 75, videoId: "gl1aHhXnN1k", youtube_ids: ["gl1aHhXnN1k"], playFull: false, energy: 8 },
      { id: "ari-3", title: "Side to Side", artist: "Ariana Grande ft. Nicki Minaj", year: "2016", durationSec: 237, hookStartSec: 36, hookEndSec: 76, entrySec: 36, exitSec: 76, videoId: "SXiSVQZLje8", youtube_ids: ["SXiSVQZLje8"], playFull: false, energy: 9 },
      { id: "ari-4", title: "Into You", artist: "Ariana Grande", year: "2016", durationSec: 244, hookStartSec: 45, hookEndSec: 85, entrySec: 45, exitSec: 85, videoId: "1ekZEVeXwek", youtube_ids: ["1ekZEVeXwek"], playFull: false, energy: 9 },
      { id: "ari-5", title: "we can't be friends (wait for your love)", artist: "Ariana Grande", year: "2024", durationSec: 228, hookStartSec: 40, hookEndSec: 80, entrySec: 40, exitSec: 80, videoId: "KNtJGQkC-WI", youtube_ids: ["KNtJGQkC-WI"], playFull: false, energy: 8 }
    ]
  },
  "justin-bieber": {
    id: "justin-bieber",
    name: "Justin Bieber",
    altNames: ["Bieber", "JB"],
    lang: "english",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
    country: "Canada",
    verified: true,
    bio: "Global pop phenomenon, Grammy winner, and creator of generation-defining dance and love tracks.",
    subcategories: ["pop", "rnb", "party", "romantic", "trending", "all"],
    songs: [
      { id: "jb-1", title: "Sorry", artist: "Justin Bieber", year: "2015", durationSec: 200, hookStartSec: 34, hookEndSec: 74, entrySec: 34, exitSec: 74, videoId: "fRh_vgS2dFE", youtube_ids: ["fRh_vgS2dFE"], playFull: false, energy: 9 },
      { id: "jb-2", title: "Peaches", artist: "Justin Bieber ft. Daniel Caesar, Giveon", year: "2021", durationSec: 198, hookStartSec: 32, hookEndSec: 72, entrySec: 32, exitSec: 72, videoId: "tQ0yjYUFKAE", youtube_ids: ["tQ0yjYUFKAE"], playFull: false, energy: 8 },
      { id: "jb-3", title: "Stay", artist: "The Kid LAROI, Justin Bieber", year: "2021", durationSec: 141, hookStartSec: 24, hookEndSec: 64, entrySec: 24, exitSec: 64, videoId: "kTJczUoc268", youtube_ids: ["kTJczUoc268"], playFull: false, energy: 9 },
      { id: "jb-4", title: "Ghost", artist: "Justin Bieber", year: "2021", durationSec: 153, hookStartSec: 30, hookEndSec: 70, entrySec: 30, exitSec: 70, videoId: "Fp8msa5uYsc", youtube_ids: ["Fp8msa5uYsc"], playFull: false, energy: 9 },
      { id: "jb-5", title: "What Do You Mean?", artist: "Justin Bieber", year: "2015", durationSec: 205, hookStartSec: 38, hookEndSec: 78, entrySec: 38, exitSec: 78, videoId: "DK_0jXPuIr0", youtube_ids: ["DK_0jXPuIr0"], playFull: false, energy: 9 }
    ]
  },
  "rihanna": {
    id: "rihanna",
    name: "Rihanna",
    altNames: ["Riri", "Robyn Fenty"],
    lang: "english",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop&q=80",
    country: "Barbados",
    verified: true,
    bio: "The best-selling female digital artist of all time, redefining pop, dance, and R&B.",
    subcategories: ["pop", "rnb", "party", "edm", "trending", "all"],
    songs: [
      { id: "riri-1", title: "Diamonds", artist: "Rihanna", year: "2012", durationSec: 225, hookStartSec: 42, hookEndSec: 82, entrySec: 42, exitSec: 82, videoId: "lWA2pjMjpBs", youtube_ids: ["lWA2pjMjpBs"], playFull: false, energy: 9 },
      { id: "riri-2", title: "We Found Love", artist: "Rihanna ft. Calvin Harris", year: "2011", durationSec: 215, hookStartSec: 45, hookEndSec: 85, entrySec: 45, exitSec: 85, videoId: "tg00YEETFzg", youtube_ids: ["tg00YEETFzg"], playFull: false, energy: 10 },
      { id: "riri-3", title: "This Is What You Came For", artist: "Calvin Harris ft. Rihanna", year: "2016", durationSec: 232, hookStartSec: 38, hookEndSec: 78, entrySec: 38, exitSec: 78, videoId: "kOkQ4T5WO9E", youtube_ids: ["kOkQ4T5WO9E"], playFull: false, energy: 9 },
      { id: "riri-4", title: "Umbrella", artist: "Rihanna ft. JAY-Z", year: "2007", durationSec: 275, hookStartSec: 40, hookEndSec: 80, entrySec: 40, exitSec: 80, videoId: "CvBfHwUxHIk", youtube_ids: ["CvBfHwUxHIk"], playFull: false, energy: 9 }
    ]
  },
  "kendrick-lamar": {
    id: "kendrick-lamar",
    name: "Kendrick Lamar",
    altNames: ["K-Dot", "Kung Fu Kenny"],
    lang: "english",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    country: "United States",
    verified: true,
    bio: "Pulitzer Prize and multiple Grammy-winning hip-hop mastermind.",
    subcategories: ["hiphop", "trending", "rock", "all"],
    songs: [
      { id: "kdot-1", title: "HUMBLE.", artist: "Kendrick Lamar", year: "2017", durationSec: 177, hookStartSec: 30, hookEndSec: 70, entrySec: 30, exitSec: 70, videoId: "tvTRZJ-4EyI", youtube_ids: ["tvTRZJ-4EyI"], playFull: false, energy: 10 },
      { id: "kdot-2", title: "Not Like Us", artist: "Kendrick Lamar", year: "2024", durationSec: 274, hookStartSec: 45, hookEndSec: 85, entrySec: 45, exitSec: 85, videoId: "H58vbez_m4E", youtube_ids: ["H58vbez_m4E"], playFull: false, energy: 10 },
      { id: "kdot-3", title: "All the Stars", artist: "Kendrick Lamar, SZA", year: "2018", durationSec: 232, hookStartSec: 38, hookEndSec: 78, entrySec: 38, exitSec: 78, videoId: "GfCqMv--ncA", youtube_ids: ["GfCqMv--ncA"], playFull: false, energy: 9 },
      { id: "kdot-4", title: "DNA.", artist: "Kendrick Lamar", year: "2017", durationSec: 185, hookStartSec: 35, hookEndSec: 75, entrySec: 35, exitSec: 75, videoId: "NLZRYQMLDW4", youtube_ids: ["NLZRYQMLDW4"], playFull: false, energy: 10 }
    ]
  },
  "travis-scott": {
    id: "travis-scott",
    name: "Travis Scott",
    altNames: ["La Flame", "Cactus Jack"],
    lang: "english",
    image: "https://images.unsplash.com/photo-1520523839898-50712743e9d7?w=600&auto=format&fit=crop&q=80",
    country: "United States",
    verified: true,
    bio: "The high-octane visionary of psychedelic trap and arena-shaking hip-hop.",
    subcategories: ["hiphop", "party", "trending", "all"],
    songs: [
      { id: "trav-1", title: "SICKO MODE", artist: "Travis Scott ft. Drake", year: "2018", durationSec: 312, hookStartSec: 60, hookEndSec: 100, entrySec: 60, exitSec: 100, videoId: "6ONRf7h3sdk", youtube_ids: ["6ONRf7h3sdk"], playFull: false, energy: 10 },
      { id: "trav-2", title: "Goosebumps", artist: "Travis Scott ft. Kendrick Lamar", year: "2016", durationSec: 243, hookStartSec: 42, hookEndSec: 82, entrySec: 42, exitSec: 82, videoId: "Dst9gZkq1a8", youtube_ids: ["Dst9gZkq1a8"], playFull: false, energy: 9 },
      { id: "trav-3", title: "FE!N", artist: "Travis Scott ft. Playboi Carti", year: "2023", durationSec: 191, hookStartSec: 32, hookEndSec: 72, entrySec: 32, exitSec: 72, videoId: "B9synWjqBn8", youtube_ids: ["B9synWjqBn8"], playFull: false, energy: 10 },
      { id: "trav-4", title: "HIGHEST IN THE ROOM", artist: "Travis Scott", year: "2019", durationSec: 175, hookStartSec: 30, hookEndSec: 70, entrySec: 30, exitSec: 70, videoId: "tfSS1e3kYeo", youtube_ids: ["tfSS1e3kYeo"], playFull: false, energy: 9 }
    ]
  },
  "queen": {
    id: "queen",
    name: "Queen",
    altNames: ["Freddie Mercury", "Brian May"],
    lang: "english",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    country: "United Kingdom",
    verified: true,
    bio: "Legendary British rock royalty with timeless anthems that define stadium rock.",
    subcategories: ["rock", "classic", "party", "all"],
    songs: [
      { id: "queen-1", title: "Bohemian Rhapsody", artist: "Queen", year: "1975", durationSec: 354, hookStartSec: 55, hookEndSec: 95, entrySec: 55, exitSec: 95, videoId: "fJ9rUzIMcZQ", youtube_ids: ["fJ9rUzIMcZQ"], playFull: false, energy: 9 },
      { id: "queen-2", title: "Don't Stop Me Now", artist: "Queen", year: "1978", durationSec: 210, hookStartSec: 40, hookEndSec: 80, entrySec: 40, exitSec: 80, videoId: "HgzGwKwLmgM", youtube_ids: ["HgzGwKwLmgM"], playFull: false, energy: 10 },
      { id: "queen-3", title: "We Will Rock You", artist: "Queen", year: "1977", durationSec: 122, hookStartSec: 15, hookEndSec: 55, entrySec: 15, exitSec: 55, videoId: "-tJYN-eG1zk", youtube_ids: ["-tJYN-eG1zk"], playFull: false, energy: 10 },
      { id: "queen-4", title: "Another One Bites the Dust", artist: "Queen", year: "1980", durationSec: 215, hookStartSec: 35, hookEndSec: 75, entrySec: 35, exitSec: 75, videoId: "rY0WElgETLk", youtube_ids: ["rY0WElgETLk"], playFull: false, energy: 9 }
    ]
  },
  "avicii": {
    id: "avicii",
    name: "Avicii",
    altNames: ["Tim Bergling"],
    lang: "english",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
    country: "Sweden",
    verified: true,
    bio: "Pioneering Swedish EDM titan whose melodic anthems revolutionized electronic dance music.",
    subcategories: ["edm", "party", "pop", "trending", "all"],
    songs: [
      { id: "avicii-1", title: "Levels", artist: "Avicii", year: "2011", durationSec: 198, hookStartSec: 45, hookEndSec: 85, entrySec: 45, exitSec: 85, videoId: "_ovdm2yX4MA", youtube_ids: ["_ovdm2yX4MA"], playFull: false, energy: 10 },
      { id: "avicii-2", title: "Wake Me Up", artist: "Avicii", year: "2013", durationSec: 247, hookStartSec: 45, hookEndSec: 85, entrySec: 45, exitSec: 85, videoId: "IcrbM1l_BoI", youtube_ids: ["IcrbM1l_BoI"], playFull: false, energy: 9 },
      { id: "avicii-3", title: "The Nights", artist: "Avicii", year: "2014", durationSec: 176, hookStartSec: 38, hookEndSec: 78, entrySec: 38, exitSec: 78, videoId: "UtF6Jej8yb4", youtube_ids: ["UtF6Jej8yb4"], playFull: false, energy: 10 },
      { id: "avicii-4", title: "Waiting For Love", artist: "Avicii", year: "2015", durationSec: 230, hookStartSec: 40, hookEndSec: 80, entrySec: 40, exitSec: 80, videoId: "cHHLHGNpCSA", youtube_ids: ["cHHLHGNpCSA"], playFull: false, energy: 9 }
    ]
  }
};

// Merge into ARTISTS_DB
const fullDb = JSON.parse(JSON.stringify(ARTISTS_DB));

Object.assign(fullDb.hindi, newHindiArtists);
Object.assign(fullDb.english, newEnglishArtists);

console.log(`Updated Hindi artists: ${Object.keys(fullDb.hindi).length}`);
console.log(`Updated English artists: ${Object.keys(fullDb.english).length}`);

const fileOutput = `// Audify Canonical Artists Catalog & Discography
export const HINDI_ARTIST_SUBCATEGORIES = ${JSON.stringify(HINDI_ARTIST_SUBCATEGORIES, null, 2)};

export const ENGLISH_ARTIST_SUBCATEGORIES = ${JSON.stringify(ENGLISH_ARTIST_SUBCATEGORIES, null, 2)};

export const ARTISTS_DB = ${JSON.stringify(fullDb, null, 2)};
`;

fs.writeFileSync(targetFile, fileOutput, 'utf-8');
console.log(`Successfully written expanded artists catalog to ${targetFile}!`);
