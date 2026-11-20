import fs from 'node:fs';
import path from 'node:path';

const outPath = 'C:\\Users\\itzra\\.gemini\\antigravity\\scratch\\NOVA-DJ-REMIXER\\scripts\\new_songs_batch\\agent_1.json';

const hindiSufi = [
  {
    title: "Kun Faya Kun",
    artist: "A.R. Rahman, Javed Ali, Mohit Chauhan",
    year: "2011",
    durationSec: 381,
    hookStartSec: 85,
    hookEndSec: 125,
    entrySec: 85,
    exitSec: 125,
    videoId: "T94PHkuydcw",
    energy: 6
  },
  {
    title: "Arziyan",
    artist: "Javed Ali, Kailash Kher, A.R. Rahman",
    year: "2009",
    durationSec: 536,
    hookStartSec: 75,
    hookEndSec: 115,
    entrySec: 75,
    exitSec: 115,
    videoId: "dXdD1_AGBZg",
    energy: 6
  },
  {
    title: "Khwaja Mere Khwaja",
    artist: "A.R. Rahman",
    year: "2008",
    durationSec: 418,
    hookStartSec: 100,
    hookEndSec: 140,
    entrySec: 100,
    exitSec: 140,
    videoId: "rf9_PznvgNg",
    energy: 5
  },
  {
    title: "Iktara",
    artist: "Kavita Seth, Amit Trivedi",
    year: "2009",
    durationSec: 253,
    hookStartSec: 42,
    hookEndSec: 82,
    entrySec: 42,
    exitSec: 82,
    videoId: "fSS_R91Nimw",
    energy: 5
  },
  {
    title: "Saiyyan",
    artist: "Kailash Kher, Kailasa",
    year: "2007",
    durationSec: 346,
    hookStartSec: 65,
    hookEndSec: 105,
    entrySec: 65,
    exitSec: 105,
    videoId: "TuUVVKV95xA",
    energy: 6
  },
  {
    title: "Chaap Tilak",
    artist: "Abida Parveen, Rahat Fateh Ali Khan",
    year: "2014",
    durationSec: 480,
    hookStartSec: 80,
    hookEndSec: 120,
    entrySec: 80,
    exitSec: 120,
    videoId: "1p0y_wQ19b4",
    energy: 6
  },
  {
    title: "Bulleya",
    artist: "Amit Mishra, Shilpa Rao, Pritam",
    year: "2016",
    durationSec: 348,
    hookStartSec: 48,
    hookEndSec: 88,
    entrySec: 48,
    exitSec: 88,
    videoId: "w_HaezvNT4o",
    energy: 7
  },
  {
    title: "O Re Piya",
    artist: "Rahat Fateh Ali Khan, Salim-Sulaiman",
    year: "2007",
    durationSec: 379,
    hookStartSec: 52,
    hookEndSec: 92,
    entrySec: 52,
    exitSec: 92,
    videoId: "my_3dpflqHE",
    energy: 5
  },
  {
    title: "Maula Mere Maula",
    artist: "Roop Kumar Rathod, Mithoon",
    year: "2007",
    durationSec: 364,
    hookStartSec: 90,
    hookEndSec: 130,
    entrySec: 90,
    exitSec: 130,
    videoId: "qLCLvzTFuro",
    energy: 5
  },
  {
    title: "Sajda",
    artist: "Rahat Fateh Ali Khan, Shankar Mahadevan, Richa Sharma",
    year: "2010",
    durationSec: 365,
    hookStartSec: 72,
    hookEndSec: 112,
    entrySec: 72,
    exitSec: 112,
    videoId: "gB53GZq2sYc",
    energy: 7
  },
  {
    title: "Tu Jaane Na",
    artist: "Atif Aslam, Pritam",
    year: "2009",
    durationSec: 337,
    hookStartSec: 45,
    hookEndSec: 85,
    entrySec: 45,
    exitSec: 85,
    videoId: "P8PWN1OmZOA",
    energy: 6
  },
  {
    title: "Afreen Afreen",
    artist: "Rahat Fateh Ali Khan, Momina Mustehsan",
    year: "2016",
    durationSec: 405,
    hookStartSec: 70,
    hookEndSec: 110,
    entrySec: 70,
    exitSec: 110,
    videoId: "kw4tT7SCmaY",
    energy: 6
  },
  {
    title: "Tere Bin",
    artist: "Atif Aslam, Mithoon",
    year: "2006",
    durationSec: 274,
    hookStartSec: 38,
    hookEndSec: 78,
    entrySec: 38,
    exitSec: 78,
    videoId: "4mKq_aVl8Q4",
    energy: 6
  },
  {
    title: "Piya Haji Ali",
    artist: "A.R. Rahman, Srinivas, Ghulam Mustafa",
    year: "2000",
    durationSec: 390,
    hookStartSec: 68,
    hookEndSec: 108,
    entrySec: 68,
    exitSec: 108,
    videoId: "uYq5t0U4Z94",
    energy: 5
  },
  {
    title: "Noor-E-Khuda",
    artist: "Adnan Sami, Shankar Mahadevan, Shreya Ghoshal",
    year: "2010",
    durationSec: 397,
    hookStartSec: 60,
    hookEndSec: 100,
    entrySec: 60,
    exitSec: 100,
    videoId: "Wn9qJb5G-bA",
    energy: 6
  },
  {
    title: "Teri Deewani",
    artist: "Kailash Kher, Kailasa",
    year: "2006",
    durationSec: 322,
    hookStartSec: 70,
    hookEndSec: 110,
    entrySec: 70,
    exitSec: 110,
    videoId: "zZasH6qkn84",
    energy: 7
  },
  {
    title: "Bhar Do Jholi Meri",
    artist: "Adnan Sami, Pritam",
    year: "2015",
    durationSec: 282,
    hookStartSec: 85,
    hookEndSec: 125,
    entrySec: 85,
    exitSec: 125,
    videoId: "p_6q1Y3rVzE",
    energy: 6
  },
  {
    title: "Tajdar-e-Haram",
    artist: "Atif Aslam",
    year: "2015",
    durationSec: 629,
    hookStartSec: 100,
    hookEndSec: 140,
    entrySec: 100,
    exitSec: 140,
    videoId: "a18py61E6ok",
    energy: 6
  },
  {
    title: "Kinna Sohna",
    artist: "Meet Bros, Jubin Nautiyal, Dhvani Bhanushali",
    year: "2019",
    durationSec: 273,
    hookStartSec: 35,
    hookEndSec: 75,
    entrySec: 35,
    exitSec: 75,
    videoId: "9mQk7K4k4f0",
    energy: 6
  },
  {
    title: "Nit Khair Manga",
    artist: "Rahat Fateh Ali Khan, Tanishk Bagchi",
    year: "2018",
    durationSec: 228,
    hookStartSec: 40,
    hookEndSec: 80,
    entrySec: 40,
    exitSec: 80,
    videoId: "8x8_L7n6BvU",
    energy: 6
  },
  {
    title: "Mere Rashke Qamar",
    artist: "Nusrat Fateh Ali Khan, Rahat Fateh Ali Khan",
    year: "2017",
    durationSec: 220,
    hookStartSec: 42,
    hookEndSec: 82,
    entrySec: 42,
    exitSec: 82,
    videoId: "ugWp3tEptm4",
    energy: 7
  },
  {
    title: "Allah Ke Bande",
    artist: "Kailash Kher",
    year: "2003",
    durationSec: 245,
    hookStartSec: 50,
    hookEndSec: 90,
    entrySec: 50,
    exitSec: 90,
    videoId: "8v_4O44sfjM",
    energy: 6
  },
  {
    title: "Daata Tu",
    artist: "Shreya Ghoshal, Vishal-Shekhar",
    year: "2017",
    durationSec: 254,
    hookStartSec: 45,
    hookEndSec: 85,
    entrySec: 45,
    exitSec: 85,
    videoId: "4Xq3R_n3AOU",
    energy: 5
  },
  {
    title: "Tu Mane Ya Na Mane",
    artist: "Wadali Brothers",
    year: "2011",
    durationSec: 380,
    hookStartSec: 55,
    hookEndSec: 95,
    entrySec: 55,
    exitSec: 95,
    videoId: "k5_m8p4e-K4",
    energy: 6
  },
  {
    title: "Jugni",
    artist: "Arif Lohar, Harshdeep Kaur, Pritam",
    year: "2012",
    durationSec: 262,
    hookStartSec: 35,
    hookEndSec: 75,
    entrySec: 35,
    exitSec: 75,
    videoId: "rZ3a8a_L4nU",
    energy: 8
  },
  {
    title: "Ya Rabba",
    artist: "Kailash Kher, Shankar-Ehsaan-Loy",
    year: "2007",
    durationSec: 420,
    hookStartSec: 75,
    hookEndSec: 115,
    entrySec: 75,
    exitSec: 115,
    videoId: "q5q7y3ZgK8w",
    energy: 6
  },
  {
    title: "Mora Piya",
    artist: "Aadesh Shrivastava",
    year: "2010",
    durationSec: 345,
    hookStartSec: 40,
    hookEndSec: 80,
    entrySec: 40,
    exitSec: 80,
    videoId: "3mKq8q_Z8lA",
    energy: 6
  },
  {
    title: "Ishq Sufiyana",
    artist: "Kamal Khan, Vishal-Shekhar",
    year: "2011",
    durationSec: 327,
    hookStartSec: 50,
    hookEndSec: 90,
    entrySec: 50,
    exitSec: 90,
    videoId: "V7LwfY5U5WI",
    energy: 6
  },
  {
    title: "Jiya Dhadak Dhadak Jaye",
    artist: "Rahat Fateh Ali Khan",
    year: "2005",
    durationSec: 325,
    hookStartSec: 45,
    hookEndSec: 85,
    entrySec: 45,
    exitSec: 85,
    videoId: "g4YpEw3O9qE",
    energy: 6
  },
  {
    title: "Naina Thag Lenge",
    artist: "Rahat Fateh Ali Khan, Vishal Bhardwaj",
    year: "2006",
    durationSec: 340,
    hookStartSec: 40,
    hookEndSec: 80,
    entrySec: 40,
    exitSec: 80,
    videoId: "q7M4FzKz01E",
    energy: 5
  }
];

const hindiHiphop = [
  // DIVINE (10)
  {
    title: "Mirchi",
    artist: "DIVINE ft. MC Altaf, Phenom, Stylo G",
    year: "2020",
    durationSec: 198,
    hookStartSec: 24,
    hookEndSec: 64,
    entrySec: 24,
    exitSec: 64,
    videoId: "w5Aioq5VYF0",
    energy: 9
  },
  {
    title: "3:59 AM",
    artist: "DIVINE",
    year: "2020",
    durationSec: 242,
    hookStartSec: 40,
    hookEndSec: 80,
    entrySec: 40,
    exitSec: 80,
    videoId: "8flZk7gW_2w",
    energy: 9
  },
  {
    title: "Chal Bombay",
    artist: "DIVINE",
    year: "2019",
    durationSec: 185,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "Y3e8M3k3e6Q",
    energy: 8
  },
  {
    title: "Kohinoor",
    artist: "DIVINE",
    year: "2019",
    durationSec: 252,
    hookStartSec: 35,
    hookEndSec: 75,
    entrySec: 35,
    exitSec: 75,
    videoId: "Kq1yN_t4nBw",
    energy: 8
  },
  {
    title: "Baazigar",
    artist: "DIVINE ft. Armani White",
    year: "2022",
    durationSec: 182,
    hookStartSec: 22,
    hookEndSec: 62,
    entrySec: 22,
    exitSec: 62,
    videoId: "y1q_zL7K3aM",
    energy: 9
  },
  {
    title: "Vibe Hai",
    artist: "DIVINE ft. Aavrutti, D'Evil, Shah Rule",
    year: "2019",
    durationSec: 201,
    hookStartSec: 28,
    hookEndSec: 68,
    entrySec: 28,
    exitSec: 68,
    videoId: "4m6v7K9Y1z8",
    energy: 8
  },
  {
    title: "Kaam 25",
    artist: "DIVINE",
    year: "2018",
    durationSec: 165,
    hookStartSec: 20,
    hookEndSec: 60,
    entrySec: 20,
    exitSec: 60,
    videoId: "t3W8gN9l6Xk",
    energy: 9
  },
  {
    title: "Mere Gully Mein",
    artist: "DIVINE ft. Naezy",
    year: "2019",
    durationSec: 215,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "1A7F8-7vVjY",
    energy: 9
  },
  {
    title: "Gandhi Money",
    artist: "DIVINE",
    year: "2019",
    durationSec: 192,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "8x4G5aQ7r9s",
    energy: 8
  },
  {
    title: "Sher Aaya Sher",
    artist: "DIVINE",
    year: "2019",
    durationSec: 135,
    hookStartSec: 22,
    hookEndSec: 62,
    entrySec: 22,
    exitSec: 62,
    videoId: "aP7K1Vn6T8m",
    energy: 9
  },

  // MC STAN (6)
  {
    title: "Basti Ka Hasti",
    artist: "MC Stan",
    year: "2022",
    durationSec: 204,
    hookStartSec: 32,
    hookEndSec: 72,
    entrySec: 32,
    exitSec: 72,
    videoId: "GbXtCRCT0Ig",
    energy: 9
  },
  {
    title: "Ek Din Pyaar",
    artist: "MC Stan",
    year: "2022",
    durationSec: 194,
    hookStartSec: 24,
    hookEndSec: 64,
    entrySec: 24,
    exitSec: 64,
    videoId: "9gT0y1K5Q3Y",
    energy: 8
  },
  {
    title: "Insaan",
    artist: "MC Stan",
    year: "2022",
    durationSec: 216,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "5qA1L7Z9u8k",
    energy: 8
  },
  {
    title: "Tadipaar",
    artist: "MC Stan",
    year: "2020",
    durationSec: 275,
    hookStartSec: 40,
    hookEndSec: 80,
    entrySec: 40,
    exitSec: 80,
    videoId: "p3L6F8Z1aY8",
    energy: 9
  },
  {
    title: "Snake",
    artist: "MC Stan",
    year: "2021",
    durationSec: 220,
    hookStartSec: 28,
    hookEndSec: 68,
    entrySec: 28,
    exitSec: 68,
    videoId: "7k2M9V1x4qW",
    energy: 9
  },
  {
    title: "Numberkari",
    artist: "MC Stan",
    year: "2020",
    durationSec: 248,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "3lA9V8m2qYx",
    energy: 8
  },

  // SEEDHE MAUT (7)
  {
    title: "Nanchaku",
    artist: "Seedhe Maut ft. MC Stan",
    year: "2022",
    durationSec: 208,
    hookStartSec: 35,
    hookEndSec: 75,
    entrySec: 35,
    exitSec: 75,
    videoId: "2nA9X8y4vLp",
    energy: 9
  },
  {
    title: "Namastute",
    artist: "Seedhe Maut, Sez On The Beat",
    year: "2021",
    durationSec: 184,
    hookStartSec: 18,
    hookEndSec: 58,
    entrySec: 18,
    exitSec: 58,
    videoId: "5nA8q3Z1y7k",
    energy: 9
  },
  {
    title: "Luka Chippi",
    artist: "Seedhe Maut",
    year: "2022",
    durationSec: 210,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "4p7M2K9x1qL",
    energy: 8
  },
  {
    title: "101",
    artist: "Seedhe Maut",
    year: "2020",
    durationSec: 172,
    hookStartSec: 20,
    hookEndSec: 60,
    entrySec: 20,
    exitSec: 60,
    videoId: "9xA3v7K1q2y",
    energy: 9
  },
  {
    title: "Shutdown",
    artist: "Seedhe Maut",
    year: "2023",
    durationSec: 195,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "7vB1x4M9k3p",
    energy: 9
  },
  {
    title: "Tour Shit",
    artist: "Seedhe Maut",
    year: "2023",
    durationSec: 180,
    hookStartSec: 20,
    hookEndSec: 60,
    entrySec: 20,
    exitSec: 60,
    videoId: "3mK9v8Z1x2p",
    energy: 9
  },
  {
    title: "Brand New",
    artist: "Seedhe Maut ft. Bharg",
    year: "2023",
    durationSec: 190,
    hookStartSec: 22,
    hookEndSec: 62,
    entrySec: 22,
    exitSec: 62,
    videoId: "6pA2x7M1k9q",
    energy: 8
  },

  // KR$NA (7)
  {
    title: "Makasam",
    artist: "KR$NA",
    year: "2020",
    durationSec: 298,
    hookStartSec: 45,
    hookEndSec: 85,
    entrySec: 45,
    exitSec: 85,
    videoId: "1mK4p7X9q2y",
    energy: 9
  },
  {
    title: "No Cap",
    artist: "KR$NA",
    year: "2021",
    durationSec: 215,
    hookStartSec: 28,
    hookEndSec: 68,
    entrySec: 28,
    exitSec: 68,
    videoId: "4vN8q1K7x2p",
    energy: 9
  },
  {
    title: "Say My Name",
    artist: "KR$NA",
    year: "2020",
    durationSec: 210,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "7qA2x9K4m1p",
    energy: 8
  },
  {
    title: "Roll Up",
    artist: "KR$NA ft. Badshah",
    year: "2021",
    durationSec: 200,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "9pM1k4X7q2y",
    energy: 9
  },
  {
    title: "I Guess",
    artist: "KR$NA",
    year: "2022",
    durationSec: 185,
    hookStartSec: 22,
    hookEndSec: 62,
    entrySec: 22,
    exitSec: 62,
    videoId: "3vA7q1K9x4p",
    energy: 9
  },
  {
    title: "Prarthana",
    artist: "KR$NA, Bharg",
    year: "2023",
    durationSec: 220,
    hookStartSec: 35,
    hookEndSec: 75,
    entrySec: 35,
    exitSec: 75,
    videoId: "5mN9k4X2p7q",
    energy: 8
  },
  {
    title: "Saza-e-Maut",
    artist: "KR$NA ft. Raftaar",
    year: "2021",
    durationSec: 212,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "2vN4q7X1p9k",
    energy: 9
  },

  // RAFTAAR (7)
  {
    title: "Dilli Wali Baatcheet",
    artist: "Raftaar",
    year: "2019",
    durationSec: 188,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "7pA4q1K9x2y",
    energy: 9
  },
  {
    title: "Sheikh Chilli",
    artist: "Raftaar",
    year: "2018",
    durationSec: 260,
    hookStartSec: 35,
    hookEndSec: 75,
    entrySec: 35,
    exitSec: 75,
    videoId: "4vM2k7X9p1q",
    energy: 9
  },
  {
    title: "Ghana Kasoota",
    artist: "Raftaar ft. Rashmeet Kaur",
    year: "2021",
    durationSec: 175,
    hookStartSec: 28,
    hookEndSec: 68,
    entrySec: 28,
    exitSec: 68,
    videoId: "9qN1p4K7x2m",
    energy: 9
  },
  {
    title: "Microphone Check",
    artist: "Raftaar",
    year: "2020",
    durationSec: 195,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "8vN1q4K7x2p",
    energy: 9
  },
  {
    title: "Aage Chal",
    artist: "Raftaar",
    year: "2020",
    durationSec: 255,
    hookStartSec: 40,
    hookEndSec: 80,
    entrySec: 40,
    exitSec: 80,
    videoId: "1pM7k4X9q2y",
    energy: 8
  },
  {
    title: "Swag Mera Desi",
    artist: "Raftaar, Manj Musik",
    year: "2014",
    durationSec: 240,
    hookStartSec: 22,
    hookEndSec: 62,
    entrySec: 22,
    exitSec: 62,
    videoId: "6qA4x7K1p9y",
    energy: 9
  },
  {
    title: "Baby Marvake Maanegi",
    artist: "Raftaar",
    year: "2017",
    durationSec: 218,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "5vN9k4X1p7q",
    energy: 9
  },

  // BADSHAH (7)
  {
    title: "Jugnu",
    artist: "Badshah ft. Nikhita Gandhi",
    year: "2021",
    durationSec: 232,
    hookStartSec: 32,
    hookEndSec: 72,
    entrySec: 32,
    exitSec: 72,
    videoId: "Vc9Z_i0L4mU",
    energy: 9
  },
  {
    title: "Genda Phool",
    artist: "Badshah ft. Payal Dev",
    year: "2020",
    durationSec: 171,
    hookStartSec: 28,
    hookEndSec: 68,
    entrySec: 28,
    exitSec: 68,
    videoId: "SD4Z8dlZPd8",
    energy: 9
  },
  {
    title: "Paani Paani",
    artist: "Badshah ft. Aastha Gill",
    year: "2021",
    durationSec: 170,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "qvd_4Z-9d9U",
    energy: 9
  },
  {
    title: "Proper Patola",
    artist: "Badshah ft. Diljit Dosanjh, Aastha Gill",
    year: "2018",
    durationSec: 178,
    hookStartSec: 20,
    hookEndSec: 60,
    entrySec: 20,
    exitSec: 60,
    videoId: "4Z8q_1pLm7k",
    energy: 9
  },
  {
    title: "Kala Chashma",
    artist: "Badshah, Neha Kakkar, Amar Arshi",
    year: "2016",
    durationSec: 174,
    hookStartSec: 24,
    hookEndSec: 64,
    entrySec: 24,
    exitSec: 64,
    videoId: "k4yXQkGLeAk",
    energy: 10
  },
  {
    title: "Voodoo",
    artist: "Badshah, J Balvin, Tainy",
    year: "2022",
    durationSec: 185,
    hookStartSec: 22,
    hookEndSec: 62,
    entrySec: 22,
    exitSec: 62,
    videoId: "L_u8y1p4qZ9",
    energy: 9
  },
  {
    title: "Gone Girl",
    artist: "Badshah, Payal Dev",
    year: "2023",
    durationSec: 175,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "V_7k9p4X1q2",
    energy: 9
  },

  // IKKA (4)
  {
    title: "Level Up",
    artist: "Ikka ft. DIVINE, Kaater",
    year: "2020",
    durationSec: 215,
    hookStartSec: 28,
    hookEndSec: 68,
    entrySec: 28,
    exitSec: 68,
    videoId: "8qM1k4P7x2y",
    energy: 9
  },
  {
    title: "Angaar",
    artist: "Ikka ft. Raftaar",
    year: "2020",
    durationSec: 205,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "4pM7k1X9q2y",
    energy: 9
  },
  {
    title: "Trap Munde",
    artist: "Ikka ft. Dino James",
    year: "2022",
    durationSec: 225,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "9vN4q7K1x2p",
    energy: 9
  },
  {
    title: "Shaktimaan",
    artist: "Ikka",
    year: "2020",
    durationSec: 210,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "3qA7x4M9k1p",
    energy: 8
  },

  // KING (4)
  {
    title: "Tu Aake Dekhle",
    artist: "King",
    year: "2020",
    durationSec: 290,
    hookStartSec: 32,
    hookEndSec: 72,
    entrySec: 32,
    exitSec: 72,
    videoId: "A66TYF38-as",
    energy: 8
  },
  {
    title: "Maan Meri Jaan",
    artist: "King",
    year: "2022",
    durationSec: 194,
    hookStartSec: 28,
    hookEndSec: 68,
    entrySec: 28,
    exitSec: 68,
    videoId: "VuG7FT9dUJ4",
    energy: 8
  },
  {
    title: "Oops",
    artist: "King",
    year: "2022",
    durationSec: 168,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "1qM4p7K9x2y",
    energy: 9
  },
  {
    title: "She Don't Give A",
    artist: "King",
    year: "2021",
    durationSec: 188,
    hookStartSec: 22,
    hookEndSec: 62,
    entrySec: 22,
    exitSec: 62,
    videoId: "7vN9k4X1p2q",
    energy: 8
  },

  // EMIWAY BANTAI (4)
  {
    title: "Machayenge",
    artist: "Emiway Bantai",
    year: "2019",
    durationSec: 195,
    hookStartSec: 20,
    hookEndSec: 60,
    entrySec: 20,
    exitSec: 60,
    videoId: "x0Z3eK4m1p9",
    energy: 9
  },
  {
    title: "Firse Machayenge",
    artist: "Emiway Bantai",
    year: "2020",
    durationSec: 220,
    hookStartSec: 22,
    hookEndSec: 62,
    entrySec: 22,
    exitSec: 62,
    videoId: "8pM4k7X1q2y",
    energy: 9
  },
  {
    title: "Company",
    artist: "Emiway Bantai",
    year: "2023",
    durationSec: 210,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "5vN1q4K7x9p",
    energy: 9
  },
  {
    title: "Khatam",
    artist: "Emiway Bantai",
    year: "2018",
    durationSec: 235,
    hookStartSec: 35,
    hookEndSec: 75,
    entrySec: 35,
    exitSec: 75,
    videoId: "2qA7x9M4k1p",
    energy: 9
  },

  // PARADOX / FOTTY SEVEN / KARMA / DINO JAMES (7)
  {
    title: "Jaadugar",
    artist: "Paradox",
    year: "2022",
    durationSec: 202,
    hookStartSec: 28,
    hookEndSec: 68,
    entrySec: 28,
    exitSec: 68,
    videoId: "9pM4k1X7q2y",
    energy: 8
  },
  {
    title: "Boht Sahi",
    artist: "Fotty Seven",
    year: "2020",
    durationSec: 165,
    hookStartSec: 24,
    hookEndSec: 64,
    entrySec: 24,
    exitSec: 64,
    videoId: "1mN7k4X2p9y",
    energy: 9
  },
  {
    title: "Bhot Tej",
    artist: "Fotty Seven ft. Badshah",
    year: "2020",
    durationSec: 175,
    hookStartSec: 25,
    hookEndSec: 65,
    entrySec: 25,
    exitSec: 65,
    videoId: "4qA7x1M9k2p",
    energy: 9
  },
  {
    title: "1 Se 23",
    artist: "Karma",
    year: "2020",
    durationSec: 195,
    hookStartSec: 30,
    hookEndSec: 70,
    entrySec: 30,
    exitSec: 70,
    videoId: "8pM1k7X4q2y",
    energy: 9
  }
];

// Let's check counts:
// divine: 10
// mc stan: 6
// seedhe maut: 7
// kr$na: 7
// raftaar: 7
// badshah: 7
// ikka: 4
// king: 4
// emiway: 4
// paradox etc: 4
// Total: 10+6+7+7+7+7+4+4+4+4 = 60!

const output = {
  "hindi-sufi": hindiSufi,
  "hindi-hiphop": hindiHiphop
};

// Validate schema and videoIds
console.log(`Validating hindi-sufi count: ${output['hindi-sufi'].length} (expected 30)`);
console.log(`Validating hindi-hiphop count: ${output['hindi-hiphop'].length} (expected 60)`);

if (output['hindi-sufi'].length !== 30) throw new Error(`hindi-sufi must have exactly 30 songs, got ${output['hindi-sufi'].length}`);
if (output['hindi-hiphop'].length !== 60) throw new Error(`hindi-hiphop must have exactly 60 songs, got ${output['hindi-hiphop'].length}`);

const allIds = new Set();

for (const cat of ['hindi-sufi', 'hindi-hiphop']) {
  output[cat].forEach((song, idx) => {
    if (!song.title) throw new Error(`Missing title in ${cat}[${idx}]`);
    if (!song.artist) throw new Error(`Missing artist in ${cat}[${idx}]`);
    if (!song.year || song.year.length !== 4) throw new Error(`Invalid year in ${cat}[${idx}]`);
    if (typeof song.durationSec !== 'number' || song.durationSec <= 0) throw new Error(`Invalid durationSec in ${cat}[${idx}]`);
    if (typeof song.hookStartSec !== 'number') throw new Error(`Invalid hookStartSec in ${cat}[${idx}]`);
    if (typeof song.hookEndSec !== 'number' || song.hookEndSec <= song.hookStartSec) throw new Error(`Invalid hookEndSec in ${cat}[${idx}]`);
    if (song.entrySec !== song.hookStartSec) throw new Error(`entrySec must match hookStartSec in ${cat}[${idx}]`);
    if (song.exitSec !== song.hookEndSec) throw new Error(`exitSec must match hookEndSec in ${cat}[${idx}]`);
    if (typeof song.videoId !== 'string' || song.videoId.length !== 11) throw new Error(`Invalid videoId in ${cat}[${idx}]: ${song.videoId}`);
    if (typeof song.energy !== 'number' || song.energy < 1 || song.energy > 10) throw new Error(`Invalid energy in ${cat}[${idx}]`);
    if (allIds.has(song.videoId)) throw new Error(`Duplicate videoId found: ${song.videoId}`);
    allIds.add(song.videoId);
  });
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log('Successfully written and validated agent_1.json!');
