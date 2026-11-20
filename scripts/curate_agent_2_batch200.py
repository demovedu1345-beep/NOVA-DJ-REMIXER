import json
import os
import time
import urllib.request
import concurrent.futures
import yt_dlp

CACHE_FILE = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\agent_2_batch200_cache.json"
OUT_FILE = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200\agent_2.json"

EXISTING_AGENT_5_PATH = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches\agent_5.json"

# Base candidates from agent_5
BASE_WEDDING = []
BASE_SAD = []

if os.path.exists(EXISTING_AGENT_5_PATH):
    try:
        with open(EXISTING_AGENT_5_PATH, "r", encoding="utf-8") as f:
            a5 = json.load(f)
            BASE_WEDDING = a5.get("punjabi-wedding", [])
            BASE_SAD = a5.get("punjabi-sad", [])
    except Exception as e:
        print("Error loading agent_5.json:", e)

WEDDING_CANDIDATES = [
    # Gurdas Maan
    {"title": "Ki Banu Duniya Da", "artist": "Gurdas Maan, Diljit Dosanjh", "year": "2015", "hookStartSec": 75, "energy": 9, "query": "Ki Banu Duniya Da Gurdas Maan Diljit Dosanjh Coke Studio MTV"},
    {"title": "Challa", "artist": "Gurdas Maan", "year": "1986", "hookStartSec": 45, "energy": 8, "query": "Challa Gurdas Maan official audio video"},
    {"title": "Apna Punjab Hove", "artist": "Gurdas Maan", "year": "1994", "hookStartSec": 35, "energy": 9, "query": "Apna Punjab Hove Gurdas Maan official video"},
    {"title": "Mamla Gadbad Hai", "artist": "Gurdas Maan", "year": "1984", "hookStartSec": 40, "energy": 8, "query": "Mamla Gadbad Hai Gurdas Maan official song"},
    {"title": "Sajna Ve Sajna", "artist": "Gurdas Maan", "year": "1995", "hookStartSec": 40, "energy": 8, "query": "Sajna Ve Sajna Gurdas Maan official video"},
    {"title": "Boot Polishan", "artist": "Gurdas Maan", "year": "2008", "hookStartSec": 45, "energy": 8, "query": "Boot Polishan Gurdas Maan official video"},
    {"title": "Pind Nankan", "artist": "Gurdas Maan", "year": "2018", "hookStartSec": 40, "energy": 8, "query": "Pind Nankan Gurdas Maan official video"},

    # Diljit Dosanjh
    {"title": "Born to Shine", "artist": "Diljit Dosanjh", "year": "2020", "hookStartSec": 30, "energy": 10, "query": "Born to Shine Diljit Dosanjh official music video G.O.A.T."},
    {"title": "G.O.A.T.", "artist": "Diljit Dosanjh", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "G.O.A.T. Official Music Video Diljit Dosanjh"},
    {"title": "Lover", "artist": "Diljit Dosanjh", "year": "2021", "hookStartSec": 30, "energy": 9, "query": "Lover Diljit Dosanjh official music video MoonChild Era"},
    {"title": "Kinni Kinni", "artist": "Diljit Dosanjh", "year": "2023", "hookStartSec": 25, "energy": 9, "query": "Kinni Kinni Diljit Dosanjh official video Ghost"},
    {"title": "Hass Hass", "artist": "Diljit Dosanjh, Sia", "year": "2023", "hookStartSec": 30, "energy": 9, "query": "Diljit Dosanjh Sia Hass Hass official music video"},
    {"title": "Naina", "artist": "Diljit Dosanjh, Badshah", "year": "2024", "hookStartSec": 30, "energy": 9, "query": "Naina Crew Diljit Dosanjh Badshah Kareena Tabu Kriti"},
    {"title": "Lemonade", "artist": "Diljit Dosanjh", "year": "2022", "hookStartSec": 30, "energy": 9, "query": "Lemonade Diljit Dosanjh official music video Drive Thru"},
    {"title": "Clash", "artist": "Diljit Dosanjh", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Clash Diljit Dosanjh official music video G.O.A.T."},
    {"title": "Case", "artist": "Diljit Dosanjh", "year": "2023", "hookStartSec": 30, "energy": 9, "query": "Case Diljit Dosanjh official video Ghost"},
    {"title": "Peaches", "artist": "Diljit Dosanjh", "year": "2022", "hookStartSec": 25, "energy": 9, "query": "Peaches Diljit Dosanjh official video Drive Thru"},
    {"title": "Vibe", "artist": "Diljit Dosanjh", "year": "2021", "hookStartSec": 30, "energy": 9, "query": "Vibe Diljit Dosanjh official video MoonChild Era"},
    {"title": "Jatt Fire Karda", "artist": "Diljit Dosanjh", "year": "2015", "hookStartSec": 40, "energy": 10, "query": "Jatt Fire Karda Diljit Dosanjh official video Speed Records"},
    {"title": "Veer Vaar", "artist": "Diljit Dosanjh", "year": "2015", "hookStartSec": 35, "energy": 10, "query": "Veer Vaar Sardaar Ji Diljit Dosanjh Speed Records"},
    {"title": "Sweetu", "artist": "Diljit Dosanjh", "year": "2014", "hookStartSec": 35, "energy": 9, "query": "Sweetu Disco Singh Diljit Dosanjh Speed Records"},
    {"title": "Muchh", "artist": "Diljit Dosanjh", "year": "2019", "hookStartSec": 30, "energy": 9, "query": "Muchh Diljit Dosanjh official music video Saga Music"},
    {"title": "Laembadgini", "artist": "Diljit Dosanjh", "year": "2016", "hookStartSec": 35, "energy": 9, "query": "Laembadgini Diljit Dosanjh official video Speed Records"},
    {"title": "Proper Patola", "artist": "Diljit Dosanjh, Badshah", "year": "2013", "hookStartSec": 35, "energy": 10, "query": "Proper Patola Diljit Dosanjh Badshah Sony Music India"},

    # Sidhu Moosewala
    {"title": "Soorma", "artist": "Sidhu Moosewala", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Soorma Sidhu Moosewala official video Snappy"},
    {"title": "295", "artist": "Sidhu Moosewala", "year": "2021", "hookStartSec": 45, "energy": 10, "query": "295 Sidhu Moosewala Moosetape official audio video"},
    {"title": "Same Beef", "artist": "Bohemia, Sidhu Moosewala", "year": "2019", "hookStartSec": 40, "energy": 10, "query": "Same Beef Bohemia Sidhu Moosewala official video Saga Music"},
    {"title": "Bambiha Bole", "artist": "Amrit Maan, Sidhu Moosewala", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Bambiha Bole Amrit Maan Sidhu Moosewala official video"},
    {"title": "Old Skool", "artist": "Prem Dhillon, Sidhu Moosewala", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Old Skool Prem Dhillon Sidhu Moosewala official video"},
    {"title": "Dollar", "artist": "Sidhu Moosewala", "year": "2018", "hookStartSec": 35, "energy": 9, "query": "Dollar Dakuaan Da Munda Sidhu Moosewala White Hill Music"},
    {"title": "Tochan", "artist": "Sidhu Moosewala", "year": "2018", "hookStartSec": 40, "energy": 10, "query": "Tochan Sidhu Moosewala Byg Byrd official video Humble Music"},
    {"title": "Tibeyan Da Putt", "artist": "Sidhu Moosewala", "year": "2020", "hookStartSec": 35, "energy": 9, "query": "Tibeyan Da Putt Sidhu Moosewala official video"},
    {"title": "Jatt Da Muqabala", "artist": "Sidhu Moosewala", "year": "2018", "hookStartSec": 35, "energy": 10, "query": "Jatt Da Muqabala Sidhu Moosewala PBX 1 T-Series"},
    {"title": "Just Listen", "artist": "Sidhu Moosewala", "year": "2018", "hookStartSec": 35, "energy": 9, "query": "Just Listen Sidhu Moosewala official video Humble Music"},
    {"title": "Issa Jatt", "artist": "Sidhu Moosewala, Sunny Malton", "year": "2017", "hookStartSec": 35, "energy": 10, "query": "Issa Jatt Sidhu Moosewala Sunny Malton official video"},

    # Karan Aujla
    {"title": "Softly", "artist": "Karan Aujla, Ikky", "year": "2023", "hookStartSec": 25, "energy": 9, "query": "Softly Karan Aujla Ikky Four You official video"},
    {"title": "White Brown Black", "artist": "Avvy Sra, Karan Aujla", "year": "2022", "hookStartSec": 30, "energy": 10, "query": "White Brown Black Avvy Sra Karan Aujla official video"},
    {"title": "Winning Speech", "artist": "Karan Aujla", "year": "2024", "hookStartSec": 30, "energy": 10, "query": "Winning Speech Karan Aujla official music video"},
    {"title": "On Top", "artist": "Karan Aujla", "year": "2022", "hookStartSec": 30, "energy": 10, "query": "On Top Karan Aujla official music video"},
    {"title": "Don't Look", "artist": "Karan Aujla", "year": "2019", "hookStartSec": 35, "energy": 9, "query": "Don't Look Karan Aujla official video Rehaan Records"},
    {"title": "Chitta Kurta", "artist": "Karan Aujla", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Chitta Kurta Karan Aujla official video Rehaan Records"},
    {"title": "Jhanjar", "artist": "Karan Aujla", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Jhanjar Karan Aujla official video Rehaan Records"},
    {"title": "Tauba Tauba", "artist": "Karan Aujla", "year": "2024", "hookStartSec": 35, "energy": 10, "query": "Tauba Tauba Bad Newz Karan Aujla Vicky Kaushal T-Series"},
    {"title": "52 Bars", "artist": "Karan Aujla, Ikky", "year": "2023", "hookStartSec": 30, "energy": 10, "query": "52 Bars Karan Aujla Ikky Four You official music video"},
    {"title": "Players", "artist": "Badshah, Karan Aujla", "year": "2022", "hookStartSec": 30, "energy": 10, "query": "Players Badshah Karan Aujla official music video"},
    {"title": "Mexico", "artist": "Karan Aujla", "year": "2021", "hookStartSec": 30, "energy": 10, "query": "Mexico Karan Aujla official music video BTown"},
    {"title": "Rim vs Jhanjar", "artist": "Karan Aujla", "year": "2018", "hookStartSec": 35, "energy": 9, "query": "Rim vs Jhanjar Karan Aujla official video Rehaan Records"},
    {"title": "Chu Gon Do?", "artist": "Karan Aujla", "year": "2021", "hookStartSec": 30, "energy": 10, "query": "Chu Gon Do Karan Aujla BTown Bacardi Bacardi official video"},

    # Ammy Virk
    {"title": "Wang Da Naap", "artist": "Ammy Virk", "year": "2018", "hookStartSec": 35, "energy": 9, "query": "Wang Da Naap Ammy Virk Mar Gaye Oye Loko Humble Music"},
    {"title": "Mini Cooper", "artist": "Ammy Virk", "year": "2015", "hookStartSec": 35, "energy": 9, "query": "Mini Cooper Ammy Virk official video Speed Records"},
    {"title": "Zindabad Yaarian", "artist": "Ammy Virk", "year": "2015", "hookStartSec": 40, "energy": 10, "query": "Zindabad Yaarian Ammy Virk official video Speed Records"},
    {"title": "Haan Kargi", "artist": "Ammy Virk", "year": "2016", "hookStartSec": 35, "energy": 9, "query": "Haan Kargi Ammy Virk official video Lokdhun"},
    {"title": "Dabbi", "artist": "Ammy Virk", "year": "2021", "hookStartSec": 30, "energy": 9, "query": "Dabbi Ammy Virk official music video Burfi Music"},
    {"title": "Jatt Hunde Aa", "artist": "Ammy Virk", "year": "2020", "hookStartSec": 30, "energy": 9, "query": "Jatt Hunde Aa Ammy Virk official video Saga Music"},
    {"title": "Kudiye Ni", "artist": "Ammy Virk, Aparshakti Khurana", "year": "2019", "hookStartSec": 30, "energy": 9, "query": "Kudiye Ni Aparshakti Khurana Neeti Mohan T-Series"},

    # Jasmine Sandlas
    {"title": "Laddu", "artist": "Garry Sandhu, Jasmine Sandlas", "year": "2017", "hookStartSec": 35, "energy": 9, "query": "Laddu Garry Sandhu Jasmine Sandlas official video Fresh Media"},
    {"title": "Botal Wargi", "artist": "Jasmine Sandlas", "year": "2018", "hookStartSec": 35, "energy": 9, "query": "Botal Wargi Jasmine Sandlas official video Fresh Media"},
    {"title": "Bamb Jatt", "artist": "Amrit Maan, Jasmine Sandlas", "year": "2017", "hookStartSec": 35, "energy": 10, "query": "Bamb Jatt Amrit Maan Jasmine Sandlas White Hill Music"},
    {"title": "Chunni Black", "artist": "Jasmine Sandlas", "year": "2019", "hookStartSec": 30, "energy": 9, "query": "Chunni Black Jasmine Sandlas official video"},
    {"title": "Baghi", "artist": "Jasmine Sandlas", "year": "2020", "hookStartSec": 30, "energy": 9, "query": "Baghi Jasmine Sandlas official video"},

    # Sunanda Sharma
    {"title": "Jaani Tera Naa", "artist": "Sunanda Sharma", "year": "2017", "hookStartSec": 35, "energy": 9, "query": "Jaani Tera Naa Sunanda Sharma official video Amar Audio"},
    {"title": "Patake", "artist": "Sunanda Sharma", "year": "2016", "hookStartSec": 35, "energy": 10, "query": "Patake Sunanda Sharma official video Amar Audio"},
    {"title": "Sandal", "artist": "Sunanda Sharma", "year": "2019", "hookStartSec": 35, "energy": 9, "query": "Sandal Sunanda Sharma official video Amar Audio"},
    {"title": "Duji Vaar Pyar", "artist": "Sunanda Sharma", "year": "2019", "hookStartSec": 40, "energy": 8, "query": "Duji Vaar Pyar Sunanda Sharma official video"},
    {"title": "Barood Dil", "artist": "Sunanda Sharma", "year": "2020", "hookStartSec": 35, "energy": 9, "query": "Barood Dil Sunanda Sharma official video Mad 4 Music"},
    {"title": "Chori Chori", "artist": "Sunanda Sharma", "year": "2021", "hookStartSec": 35, "energy": 9, "query": "Chori Chori Sunanda Sharma official music video"},

    # Mankirt Aulakh
    {"title": "Gangland", "artist": "Mankirt Aulakh", "year": "2017", "hookStartSec": 35, "energy": 10, "query": "Gangland Mankirt Aulakh official video Speed Records"},
    {"title": "Badnam", "artist": "Mankirt Aulakh", "year": "2017", "hookStartSec": 35, "energy": 10, "query": "Badnam Mankirt Aulakh official video Speed Records"},
    {"title": "Kadar", "artist": "Mankirt Aulakh", "year": "2016", "hookStartSec": 40, "energy": 9, "query": "Kadar Mankirt Aulakh official video Speed Records"},
    {"title": "Gallan Mithiyan", "artist": "Mankirt Aulakh", "year": "2015", "hookStartSec": 35, "energy": 9, "query": "Gallan Mithiyan Mankirt Aulakh official video Crown Records"},
    {"title": "Choorhey Wali Bahh", "artist": "Mankirt Aulakh", "year": "2017", "hookStartSec": 35, "energy": 9, "query": "Choorhey Wali Bahh Mankirt Aulakh official video Speed Records"},
    {"title": "Bhabi", "artist": "Mankirt Aulakh", "year": "2020", "hookStartSec": 30, "energy": 9, "query": "Bhabi Mankirt Aulakh official video"},
    {"title": "Jatt Da Blood", "artist": "Mankirt Aulakh", "year": "2016", "hookStartSec": 35, "energy": 9, "query": "Jatt Da Blood Mankirt Aulakh official video"},
    {"title": "Kamli", "artist": "Mankirt Aulakh", "year": "2018", "hookStartSec": 35, "energy": 9, "query": "Kamli Mankirt Aulakh official video"},

    # Harrdy Sandhu
    {"title": "Bijlee Bijlee", "artist": "Harrdy Sandhu", "year": "2021", "hookStartSec": 35, "energy": 10, "query": "Bijlee Bijlee Harrdy Sandhu Palak Tiwari official video"},
    {"title": "Hornn Blow", "artist": "Harrdy Sandhu", "year": "2016", "hookStartSec": 35, "energy": 10, "query": "Hornn Blow Harrdy Sandhu official video T-Series"},
    {"title": "Kudiyan Lahore Diyan", "artist": "Harrdy Sandhu", "year": "2022", "hookStartSec": 30, "energy": 9, "query": "Kudiyan Lahore Diyan Harrdy Sandhu official video"},
    {"title": "Yaar SuperStar", "artist": "Harrdy Sandhu", "year": "2018", "hookStartSec": 35, "energy": 9, "query": "Yaar SuperStar Harrdy Sandhu official video Sony Music India"},

    # Jassi Sidhu
    {"title": "Veer Ji Viyohn", "artist": "Jassi Sidhu", "year": "2003", "hookStartSec": 40, "energy": 10, "query": "Veer Ji Viyohn Jassi Sidhu official video"},
    {"title": "Nai Rehna", "artist": "Jassi Sidhu", "year": "2008", "hookStartSec": 40, "energy": 9, "query": "Nai Rehna Jassi Sidhu official video"},
    {"title": "Chandigarh Kare Aashiqui", "artist": "Jassi Sidhu", "year": "2004", "hookStartSec": 35, "energy": 10, "query": "Chandigarh Kare Aashiqui Jassi Sidhu original video"},
    {"title": "Jawani", "artist": "Jassi Sidhu", "year": "2006", "hookStartSec": 40, "energy": 9, "query": "Jawani Jassi Sidhu official video"},

    # Panjabi MC
    {"title": "Jogi", "artist": "Panjabi MC", "year": "2003", "hookStartSec": 35, "energy": 10, "query": "Jogi Panjabi MC official video"},
    {"title": "Mirza", "artist": "Panjabi MC", "year": "2003", "hookStartSec": 40, "energy": 9, "query": "Mirza Panjabi MC official video"},
    {"title": "Moorni", "artist": "Panjabi MC", "year": "2005", "hookStartSec": 35, "energy": 10, "query": "Moorni Panjabi MC Balle Balle official video"},

    # Sukhbir
    {"title": "Gal Ban Gayi", "artist": "Sukhbir", "year": "1997", "hookStartSec": 40, "energy": 10, "query": "Gal Ban Gayi Sukhbir original video"},
    {"title": "Sauda Khara Khara Original", "artist": "Sukhbir", "year": "1999", "hookStartSec": 40, "energy": 10, "query": "Sauda Khara Khara Sukhbir original song video"},
    {"title": "Punjabi Munde", "artist": "Sukhbir", "year": "2001", "hookStartSec": 40, "energy": 9, "query": "Punjabi Munde Sukhbir official video"},

    # Malkit Singh
    {"title": "Tootak Tootak Tootiyan", "artist": "Malkit Singh", "year": "1988", "hookStartSec": 35, "energy": 10, "query": "Tootak Tootak Tootiyan Hey Jamalo Malkit Singh original"},
    {"title": "Jind Mahi", "artist": "Malkit Singh", "year": "1995", "hookStartSec": 35, "energy": 9, "query": "Jind Mahi Malkit Singh official video"},
    {"title": "Gur Nalo Ishq Mitha Original", "artist": "Malkit Singh, Bally Sagoo", "year": "1990", "hookStartSec": 40, "energy": 10, "query": "Gur Nalo Ishq Mitha Malkit Singh Bally Sagoo original video"},
    {"title": "Kurti Malmal Di", "artist": "Malkit Singh", "year": "1992", "hookStartSec": 35, "energy": 9, "query": "Kurti Malmal Di Malkit Singh official video"},

    # Surjit Bindrakhia
    {"title": "Tera Yaar Bolda", "artist": "Surjit Bindrakhia", "year": "2001", "hookStartSec": 35, "energy": 10, "query": "Tera Yaar Bolda Surjit Bindrakhia official video"},
    {"title": "Dupatta Tera Satrang Da", "artist": "Surjit Bindrakhia", "year": "1994", "hookStartSec": 35, "energy": 10, "query": "Dupatta Tera Satrang Da Surjit Bindrakhia original video"},
    {"title": "Mukhda Dekh Ke", "artist": "Surjit Bindrakhia", "year": "1999", "hookStartSec": 35, "energy": 9, "query": "Mukhda Dekh Ke Surjit Bindrakhia official video"},
    {"title": "Jatt Di Pasand", "artist": "Surjit Bindrakhia", "year": "2000", "hookStartSec": 35, "energy": 10, "query": "Jatt Di Pasand Surjit Bindrakhia official video"},
    {"title": "Billo Ni Tera Dil Mangda", "artist": "Surjit Bindrakhia", "year": "2002", "hookStartSec": 40, "energy": 10, "query": "Billo Ni Tera Dil Mangda Surjit Bindrakhia official video"},
    {"title": "Ishq Brandi", "artist": "Surjit Bindrakhia", "year": "2003", "hookStartSec": 40, "energy": 9, "query": "Ishq Brandi Surjit Bindrakhia official video"},

    # Gippy Grewal & Honey Singh
    {"title": "Angreji Beat", "artist": "Yo Yo Honey Singh, Gippy Grewal", "year": "2011", "hookStartSec": 40, "energy": 10, "query": "Angreji Beat Gippy Grewal Yo Yo Honey Singh International Villager"},
    {"title": "Dope Shope", "artist": "Yo Yo Honey Singh, Deep Money", "year": "2011", "hookStartSec": 35, "energy": 10, "query": "Dope Shope Yo Yo Honey Singh Deep Money International Villager"},
    {"title": "Brown Rang", "artist": "Yo Yo Honey Singh", "year": "2011", "hookStartSec": 35, "energy": 10, "query": "Brown Rang Yo Yo Honey Singh International Villager official video"},
    {"title": "Blue Eyes", "artist": "Yo Yo Honey Singh", "year": "2013", "hookStartSec": 35, "energy": 10, "query": "Blue Eyes Yo Yo Honey Singh official video T-Series"},
    {"title": "Desi Kalakaar", "artist": "Yo Yo Honey Singh", "year": "2014", "hookStartSec": 40, "energy": 9, "query": "Desi Kalakaar Yo Yo Honey Singh official video T-Series"},
    {"title": "Love Dose", "artist": "Yo Yo Honey Singh", "year": "2014", "hookStartSec": 35, "energy": 10, "query": "Love Dose Desi Kalakaar Yo Yo Honey Singh T-Series"},
    {"title": "Oscar", "artist": "Gippy Grewal, Badshah", "year": "2015", "hookStartSec": 35, "energy": 10, "query": "Oscar Kaptaan Gippy Grewal Badshah Tips Official"},
    {"title": "Phulkari", "artist": "Gippy Grewal", "year": "2004", "hookStartSec": 35, "energy": 9, "query": "Phulkari Gippy Grewal official video"},
    {"title": "Car Nachdi", "artist": "Gippy Grewal, Bohemia", "year": "2017", "hookStartSec": 35, "energy": 10, "query": "Car Nachdi Gippy Grewal Bohemia T-Series"},
    {"title": "Patt Lainge", "artist": "Gippy Grewal, Neha Kakkar", "year": "2016", "hookStartSec": 35, "energy": 9, "query": "Patt Lainge Gippy Grewal Neha Kakkar Desi Crew"},

    # Sharry Mann & Harjit Harman
    {"title": "Cute Munda", "artist": "Sharry Mann", "year": "2017", "hookStartSec": 35, "energy": 9, "query": "Cute Munda Sharry Mann official video Lokdhun"},
    {"title": "Pooja Kiven Aa", "artist": "Sharry Mann", "year": "2012", "hookStartSec": 35, "energy": 9, "query": "Pooja Kiven Aa Sharry Mann official video Speed Records"},
    {"title": "Dil Da Dimag", "artist": "Sharry Mann", "year": "2016", "hookStartSec": 35, "energy": 9, "query": "Dil Da Dimag Sharry Mann official video Nick Dhammu"},
    {"title": "Mitraan Da Naa Chalda", "artist": "Harjit Harman", "year": "2004", "hookStartSec": 35, "energy": 9, "query": "Mitraan Da Naa Chalda Harjit Harman T-Series"},
    {"title": "Chhithiye Ni Chhithiye", "artist": "Harjit Harman", "year": "2005", "hookStartSec": 40, "energy": 8, "query": "Chhithiye Ni Chhithiye Harjit Harman T-Series"},

    # Jordan Sandhu & R Nait
    {"title": "Teeje Week", "artist": "Jordan Sandhu", "year": "2018", "hookStartSec": 35, "energy": 9, "query": "Teeje Week Jordan Sandhu official video White Hill Music"},
    {"title": "Handsome Jatta", "artist": "Jordan Sandhu", "year": "2018", "hookStartSec": 35, "energy": 9, "query": "Handsome Jatta Jordan Sandhu Ashke Rhythm Boyz"},
    {"title": "Muchh Rakhi Aa", "artist": "Jordan Sandhu", "year": "2016", "hookStartSec": 35, "energy": 9, "query": "Muchh Rakhi Aa Jordan Sandhu official video"},
    {"title": "Defaulter", "artist": "R Nait", "year": "2019", "hookStartSec": 35, "energy": 9, "query": "Defaulter R Nait official video T-Series"},
    {"title": "Dabda Kithe Aa", "artist": "R Nait", "year": "2019", "hookStartSec": 35, "energy": 9, "query": "Dabda Kithe Aa R Nait official video Speed Records"},

    # Jass Manak & Nimrat Khaira
    {"title": "Prada", "artist": "Jass Manak", "year": "2018", "hookStartSec": 30, "energy": 9, "query": "Prada Jass Manak official video Geet MP3"},
    {"title": "Boss", "artist": "Jass Manak", "year": "2018", "hookStartSec": 30, "energy": 9, "query": "Boss Jass Manak official video Geet MP3"},
    {"title": "Butterfly", "artist": "Jass Manak", "year": "2020", "hookStartSec": 30, "energy": 9, "query": "Butterfly Jass Manak official video Geet MP3"},
    {"title": "Viah", "artist": "Jass Manak", "year": "2019", "hookStartSec": 30, "energy": 9, "query": "Viah Jass Manak official video Geet MP3"},
    {"title": "Peg Di Waashna", "artist": "Amrit Maan", "year": "2017", "hookStartSec": 35, "energy": 9, "query": "Peg Di Waashna Amrit Maan official video Speed Records"},
    {"title": "Sira E Hou", "artist": "Amrit Maan, Nimrat Khaira", "year": "2021", "hookStartSec": 30, "energy": 9, "query": "Sira E Hou Amrit Maan Nimrat Khaira official video"},
    {"title": "Designer", "artist": "Nimrat Khaira", "year": "2017", "hookStartSec": 35, "energy": 9, "query": "Designer Nimrat Khaira official video Speed Records"},
    {"title": "Time Chakda", "artist": "Nimrat Khaira", "year": "2021", "hookStartSec": 30, "energy": 9, "query": "Time Chakda Nimrat Khaira official video Speed Records"},
    {"title": "Bhalwani Gedi", "artist": "Nimrat Khaira", "year": "2020", "hookStartSec": 30, "energy": 9, "query": "Bhalwani Gedi Nimrat Khaira official video Speed Records"},
    {"title": "8 Parche", "artist": "Baani Sandhu, Gur Sidhu", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "8 Parche Baani Sandhu Gur Sidhu official video White Hill Music"},
    {"title": "Bell Bottom", "artist": "Baani Sandhu, Mankirt Aulakh", "year": "2020", "hookStartSec": 30, "energy": 9, "query": "Bell Bottom Baani Sandhu Mankirt Aulakh official video"},

    # Wedding & Folk Traditions
    {"title": "Din Shagna Da", "artist": "Jasleen Royal", "year": "2017", "hookStartSec": 30, "energy": 7, "query": "Din Shagna Da Jasleen Royal Phillauri official video"},
    {"title": "Nachde Ne Saare", "artist": "Jasleen Royal, Harshdeep Kaur, Siddharth Mahadevan", "year": "2016", "hookStartSec": 35, "energy": 10, "query": "Nachde Ne Saare Baar Baar Dekho official video Zee Music"},
    {"title": "Bajre Da Sitta", "artist": "Rashmeet Kaur, Deep Kalsi", "year": "2021", "hookStartSec": 25, "energy": 9, "query": "Bajre Da Sitta Rashmeet Kaur Deep Kalsi official music video"},
    {"title": "Latthe Di Chaadar", "artist": "Neha Bhasin", "year": "2017", "hookStartSec": 35, "energy": 8, "query": "Latthe Di Chaadar Neha Bhasin Punjabi Folk official video"},
    {"title": "Chitta Kukkad", "artist": "Neha Bhasin", "year": "2017", "hookStartSec": 35, "energy": 8, "query": "Chitta Kukkad Neha Bhasin Punjabi Wedding Folk official video"},
    {"title": "Nai Jaana", "artist": "Neha Bhasin", "year": "2016", "hookStartSec": 35, "energy": 8, "query": "Nai Jaana Neha Bhasin Punjabi Folk Wedding Song official video"},
    {"title": "Sadi Gali", "artist": "Lehmber Hussainpuri", "year": "2011", "hookStartSec": 35, "energy": 10, "query": "Sadi Gali Tanu Weds Manu Kangana Ranaut R Madhavan"},
    {"title": "Das Ja", "artist": "Lehmber Hussainpuri", "year": "2005", "hookStartSec": 35, "energy": 9, "query": "Das Ja Lehmber Hussainpuri official video"},
    {"title": "Tunak Tunak Tun", "artist": "Daler Mehndi", "year": "1998", "hookStartSec": 35, "energy": 10, "query": "Tunak Tunak Tun Daler Mehndi official video"},
    {"title": "Bolo Ta Ra Ra", "artist": "Daler Mehndi", "year": "1995", "hookStartSec": 35, "energy": 10, "query": "Bolo Ta Ra Ra Daler Mehndi official video"},
    {"title": "Ho Jayegi Balle Balle", "artist": "Daler Mehndi", "year": "1997", "hookStartSec": 35, "energy": 10, "query": "Ho Jayegi Balle Balle Daler Mehndi official video"},
    {"title": "Kudiyan Shehar Diyan", "artist": "Daler Mehndi, Neha Kakkar", "year": "2017", "hookStartSec": 30, "energy": 9, "query": "Kudiyan Shehar Diyan Poster Boys Daler Mehndi"},
    {"title": "Dhol Jageero Da", "artist": "Panjabi MC", "year": "2001", "hookStartSec": 35, "energy": 10, "query": "Dhol Jageero Da Master Saleem Panjabi MC official video"},
    {"title": "Dil Le Gayi Kudi Gujarat Di", "artist": "Jasbir Jassi", "year": "1998", "hookStartSec": 35, "energy": 10, "query": "Dil Le Gayi Kudi Gujarat Di Jasbir Jassi original video"},
    {"title": "Koka", "artist": "Jasbir Jassi", "year": "2000", "hookStartSec": 35, "energy": 9, "query": "Koka Jasbir Jassi official video"},
    {"title": "Nishani Pyar Di", "artist": "Jasbir Jassi", "year": "2001", "hookStartSec": 35, "energy": 9, "query": "Nishani Pyar Di Jasbir Jassi official video"}
]

SAD_CANDIDATES = [
    # B Praak & Jaani
    {"title": "Besharam Bewaffa", "artist": "B Praak, Jaani", "year": "2020", "hookStartSec": 35, "energy": 7, "query": "Besharam Bewaffa B Praak Divya Khosla Kumar Jaani T-Series"},
    {"title": "Mazaa", "artist": "B Praak, Jaani", "year": "2021", "hookStartSec": 35, "energy": 7, "query": "Mazaa B Praak Gurmeet Choudhary Jaani official video"},
    {"title": "Bewafa Tu", "artist": "B Praak", "year": "2023", "hookStartSec": 35, "energy": 7, "query": "Bewafa Tu B Praak Zohrajabeen official video"},
    {"title": "Zohrajabeen", "artist": "B Praak", "year": "2023", "hookStartSec": 35, "energy": 7, "query": "Zohrajabeen Title Track B Praak Randeep Hooda"},
    {"title": "Dil Tod Ke", "artist": "B Praak, Rochak Kohli", "year": "2020", "hookStartSec": 40, "energy": 7, "query": "Dil Tod Ke B Praak Rochak Kohli Abhishek Singh T-Series"},
    {"title": "Jannat", "artist": "B Praak", "year": "2020", "hookStartSec": 35, "energy": 8, "query": "Jannat Sufna Ammy Virk Tania B Praak Jaani"},
    {"title": "Ammi", "artist": "B Praak", "year": "2020", "hookStartSec": 35, "energy": 7, "query": "Ammi Sufna Ammy Virk B Praak Jaani official video"},
    {"title": "Channa Ve", "artist": "B Praak", "year": "2020", "hookStartSec": 35, "energy": 8, "query": "Channa Ve Sufna Ammy Virk Tania B Praak Jaani"},
    {"title": "Shukriya", "artist": "B Praak", "year": "2020", "hookStartSec": 35, "energy": 7, "query": "Shukriya Sufna Ammy Virk Tania B Praak Jaani"},
    {"title": "Fakira", "artist": "Ammy Virk, B Praak", "year": "2018", "hookStartSec": 35, "energy": 7, "query": "Fakira Qismat Ammy Virk Sargun Mehta B Praak"},
    {"title": "Rabba Ve", "artist": "B Praak", "year": "2019", "hookStartSec": 35, "energy": 7, "query": "Rabba Ve High End Yaariyan B Praak official video"},
    {"title": "Titliaan", "artist": "Afsana Khan, Jaani", "year": "2020", "hookStartSec": 40, "energy": 8, "query": "Titliaan Harrdy Sandhu Sargun Mehta Afsana Khan Jaani"},
    {"title": "Titliaan Warga", "artist": "Harrdy Sandhu, Jaani", "year": "2021", "hookStartSec": 35, "energy": 8, "query": "Titliaan Warga Harrdy Sandhu Jaani official video"},
    {"title": "Yaarr Ni Milyaa", "artist": "Harrdy Sandhu", "year": "2017", "hookStartSec": 40, "energy": 8, "query": "Yaarr Ni Milyaa Harrdy Sandhu B Praak Jaani White Hill Music"},
    {"title": "Joker", "artist": "Harrdy Sandhu", "year": "2014", "hookStartSec": 45, "energy": 7, "query": "Joker Harrdy Sandhu Jaani B Praak official video"},

    # Arijit Singh Punjabi
    {"title": "Channa Mereya Unplugged", "artist": "Arijit Singh", "year": "2016", "hookStartSec": 45, "energy": 7, "query": "Channa Mereya Unplugged Arijit Singh official audio"},
    {"title": "Ve Maahi", "artist": "Arijit Singh, Asees Kaur", "year": "2019", "hookStartSec": 35, "energy": 8, "query": "Ve Maahi Kesari Akshay Kumar Parineeti Chopra Arijit Singh"},
    {"title": "Ik Vaari Aa Acoustic", "artist": "Arijit Singh", "year": "2017", "hookStartSec": 40, "energy": 7, "query": "Ik Vaari Aa Acoustic Arijit Singh Raabta T-Series"},
    {"title": "Dil Na Jaaneya Acoustic", "artist": "Rochak Kohli, Lauv, Akasa", "year": "2019", "hookStartSec": 35, "energy": 7, "query": "Dil Na Jaaneya Good Newwz official song Zee Music"},

    # Prabh Gill
    {"title": "Mere Kol", "artist": "Prabh Gill", "year": "2015", "hookStartSec": 35, "energy": 7, "query": "Mere Kol Prabh Gill official video Speed Records"},
    {"title": "Langhe Paani", "artist": "Prabh Gill", "year": "2016", "hookStartSec": 40, "energy": 7, "query": "Langhe Paani Prabh Gill Bambukat Rhythm Boyz"},
    {"title": "Tareeyan De Desh", "artist": "Prabh Gill", "year": "2016", "hookStartSec": 40, "energy": 7, "query": "Tareeyan De Desh Prabh Gill official video Speed Records"},
    {"title": "Shukar Dateya", "artist": "Prabh Gill", "year": "2016", "hookStartSec": 35, "energy": 8, "query": "Shukar Dateya Prabh Gill official video Speed Records"},
    {"title": "Bacha", "artist": "Prabh Gill", "year": "2016", "hookStartSec": 35, "energy": 7, "query": "Bacha Prabh Gill Jaani B Praak Speed Records"},
    {"title": "Jeen Di Gal", "artist": "Prabh Gill", "year": "2014", "hookStartSec": 40, "energy": 7, "query": "Jeen Di Gal Prabh Gill official video Speed Records"},
    {"title": "Mainu Mangdi", "artist": "Prabh Gill", "year": "2017", "hookStartSec": 35, "energy": 7, "query": "Mainu Mangdi Prabh Gill official video Speed Records"},
    {"title": "Roya Ve", "artist": "Prabh Gill", "year": "2020", "hookStartSec": 35, "energy": 7, "query": "Roya Ve Prabh Gill official video Speed Records"},
    {"title": "Tamanna", "artist": "Prabh Gill", "year": "2014", "hookStartSec": 35, "energy": 7, "query": "Tamanna Prabh Gill official video Endless"},
    {"title": "Teri Aashiqui Ne Mara", "artist": "Prabh Gill", "year": "2017", "hookStartSec": 35, "energy": 7, "query": "Teri Aashiqui Ne Mara Prabh Gill official video"},
    {"title": "Ik Supna", "artist": "Prabh Gill", "year": "2013", "hookStartSec": 35, "energy": 7, "query": "Ik Supna Prabh Gill official video Speed Records"},

    # Akhil
    {"title": "Khaab", "artist": "Akhil", "year": "2016", "hookStartSec": 35, "energy": 8, "query": "Khaab Akhil official video Crown Records"},
    {"title": "Gani", "artist": "Akhil, Manni Sandhu", "year": "2016", "hookStartSec": 35, "energy": 8, "query": "Gani Akhil Manni Sandhu official video Speed Records"},
    {"title": "Teri Kami", "artist": "Akhil", "year": "2016", "hookStartSec": 35, "energy": 7, "query": "Teri Kami Akhil official video Speed Records"},
    {"title": "Rang Gora", "artist": "Akhil", "year": "2018", "hookStartSec": 35, "energy": 8, "query": "Rang Gora Akhil official video Speed Records"},
    {"title": "Kalla Sohna Nai", "artist": "Akhil", "year": "2019", "hookStartSec": 35, "energy": 8, "query": "Kalla Sohna Nai Akhil official video Desi Music Factory"},
    {"title": "Supne", "artist": "Akhil", "year": "2014", "hookStartSec": 35, "energy": 7, "query": "Supne Akhil official video Speed Records"},
    {"title": "Zindagi", "artist": "Akhil", "year": "2017", "hookStartSec": 35, "energy": 7, "query": "Zindagi Akhil official video Speed Records"},
    {"title": "Teri Khaamiyan", "artist": "Akhil", "year": "2018", "hookStartSec": 35, "energy": 7, "query": "Teri Khaamiyan Akhil official video Speed Records"},
    {"title": "Deewana", "artist": "Akhil", "year": "2020", "hookStartSec": 30, "energy": 7, "query": "Deewana Akhil official video White Hill Music"},
    {"title": "Bachalo", "artist": "Akhil", "year": "2020", "hookStartSec": 30, "energy": 8, "query": "Bachalo Akhil official video White Hill Music"},

    # Amrinder Gill
    {"title": "Judaa", "artist": "Amrinder Gill", "year": "2011", "hookStartSec": 40, "energy": 7, "query": "Judaa Amrinder Gill Dr Zeus Speed Records"},
    {"title": "Judaa 2", "artist": "Amrinder Gill", "year": "2014", "hookStartSec": 40, "energy": 7, "query": "Judaa 2 Title Track Amrinder Gill Speed Records"},
    {"title": "Ki Samjhaiye", "artist": "Amrinder Gill", "year": "2011", "hookStartSec": 40, "energy": 7, "query": "Ki Samjhaiye Amrinder Gill Judaa Speed Records"},
    {"title": "Dildarian", "artist": "Amrinder Gill", "year": "2005", "hookStartSec": 40, "energy": 7, "query": "Dildarian Amrinder Gill official video Finetouch"},
    {"title": "Yarrian", "artist": "Amrinder Gill", "year": "2011", "hookStartSec": 40, "energy": 8, "query": "Yarrian Amrinder Gill Judaa Speed Records"},
    {"title": "Supna", "artist": "Amrinder Gill", "year": "2014", "hookStartSec": 40, "energy": 7, "query": "Supna Amrinder Gill Judaa 2 Speed Records"},
    {"title": "Mera Deewanapan", "artist": "Amrinder Gill", "year": "2014", "hookStartSec": 40, "energy": 7, "query": "Mera Deewanapan Amrinder Gill Judaa 2 Speed Records"},
    {"title": "Akhar", "artist": "Amrinder Gill", "year": "2017", "hookStartSec": 35, "energy": 8, "query": "Akhar Lahoriye Amrinder Gill Rhythm Boyz"},
    {"title": "Kurta Suha", "artist": "Amrinder Gill", "year": "2015", "hookStartSec": 35, "energy": 8, "query": "Kurta Suha Angrej Amrinder Gill Rhythm Boyz"},
    {"title": "Mil Ke Baithange", "artist": "Amrinder Gill", "year": "2015", "hookStartSec": 35, "energy": 8, "query": "Mil Ke Baithange Angrej Amrinder Gill Rhythm Boyz"},
    {"title": "Heerey", "artist": "Amrinder Gill", "year": "2016", "hookStartSec": 35, "energy": 7, "query": "Heerey Love Punjab Amrinder Gill Rhythm Boyz"},
    {"title": "Goriyan Gallan", "artist": "Amrinder Gill", "year": "2016", "hookStartSec": 35, "energy": 8, "query": "Goriyan Gallan Love Punjab Amrinder Gill Rhythm Boyz"},

    # Satinder Sartaaj
    {"title": "Sai", "artist": "Satinder Sartaaj", "year": "2010", "hookStartSec": 45, "energy": 8, "query": "Sai Satinder Sartaaj official video Speed Records"},
    {"title": "Udaarian", "artist": "Satinder Sartaaj", "year": "2018", "hookStartSec": 35, "energy": 8, "query": "Udaarian Satinder Sartaaj official video Saga Music"},
    {"title": "Masoomiat", "artist": "Satinder Sartaaj", "year": "2017", "hookStartSec": 40, "energy": 7, "query": "Masoomiat Satinder Sartaaj official video Saga Music"},
    {"title": "Rutba", "artist": "Satinder Sartaaj", "year": "2020", "hookStartSec": 35, "energy": 8, "query": "Rutba Satinder Sartaaj official video Saga Music"},
    {"title": "Sajjan Raazi", "artist": "Satinder Sartaaj", "year": "2016", "hookStartSec": 40, "energy": 8, "query": "Sajjan Raazi Satinder Sartaaj official video"},
    {"title": "Zikr Tera", "artist": "Satinder Sartaaj", "year": "2020", "hookStartSec": 35, "energy": 7, "query": "Zikr Tera Satinder Sartaaj official video"},
    {"title": "Titli", "artist": "Satinder Sartaaj", "year": "2022", "hookStartSec": 35, "energy": 8, "query": "Titli Satinder Sartaaj official video Speed Records"},
    {"title": "Kamaal Ho Gea", "artist": "Satinder Sartaaj", "year": "2021", "hookStartSec": 35, "energy": 8, "query": "Kamaal Ho Gea Satinder Sartaaj official video"},
    {"title": "Auzaar", "artist": "Satinder Sartaaj", "year": "2020", "hookStartSec": 35, "energy": 7, "query": "Auzaar Satinder Sartaaj official video"},
    {"title": "Soohe Khat", "artist": "Satinder Sartaaj", "year": "2013", "hookStartSec": 40, "energy": 7, "query": "Soohe Khat Satinder Sartaaj official video"},

    # Maninder Buttar
    {"title": "Sakhiyaan", "artist": "Maninder Buttar", "year": "2018", "hookStartSec": 35, "energy": 8, "query": "Sakhiyaan Maninder Buttar official video White Hill Music"},
    {"title": "Ik Tera", "artist": "Maninder Buttar", "year": "2019", "hookStartSec": 30, "energy": 8, "query": "Ik Tera Maninder Buttar official video White Hill Music"},
    {"title": "Jamila", "artist": "Maninder Buttar", "year": "2020", "hookStartSec": 30, "energy": 8, "query": "Jamila Maninder Buttar official video White Hill Music"},
    {"title": "Teri Meri Ladayi", "artist": "Maninder Buttar", "year": "2020", "hookStartSec": 30, "energy": 7, "query": "Teri Meri Ladayi Maninder Buttar official video White Hill Music"},
    {"title": "Pani Di Gal", "artist": "Maninder Buttar, Asees Kaur", "year": "2021", "hookStartSec": 30, "energy": 8, "query": "Pani Di Gal Maninder Buttar Asees Kaur Jasmin Bhasin"},
    {"title": "Yari", "artist": "Maninder Buttar", "year": "2014", "hookStartSec": 40, "energy": 7, "query": "Yari Maninder Buttar official video Speed Records"},
    {"title": "Laare", "artist": "Maninder Buttar", "year": "2019", "hookStartSec": 35, "energy": 8, "query": "Laare Maninder Buttar Sargun Mehta White Hill Music"},

    # Kulwinder Billa
    {"title": "Time Table", "artist": "Kulwinder Billa", "year": "2015", "hookStartSec": 35, "energy": 8, "query": "Time Table Kulwinder Billa official video Speed Records"},
    {"title": "Time Table 2", "artist": "Kulwinder Billa", "year": "2015", "hookStartSec": 35, "energy": 8, "query": "Time Table 2 Kulwinder Billa official video Speed Records"},
    {"title": "12 Mahine", "artist": "Kulwinder Billa", "year": "2016", "hookStartSec": 35, "energy": 8, "query": "12 Mahine Kulwinder Billa official video Speed Records"},
    {"title": "Yaad Rekhio", "artist": "Kulwinder Billa", "year": "2017", "hookStartSec": 35, "energy": 7, "query": "Yaad Rekhio Kulwinder Billa official video Speed Records"},
    {"title": "Roon Wargi", "artist": "Kulwinder Billa", "year": "2017", "hookStartSec": 35, "energy": 8, "query": "Roon Wargi Kulwinder Billa official video Lokdhun"},
    {"title": "Mere Yaar", "artist": "Kulwinder Billa", "year": "2018", "hookStartSec": 35, "energy": 8, "query": "Mere Yaar Kulwinder Billa official video White Hill Music"},

    # Bir Singh
    {"title": "Saah", "artist": "Bir Singh", "year": "2016", "hookStartSec": 40, "energy": 7, "query": "Saah Bir Singh Lahoriye Rhythm Boyz"},
    {"title": "Chann Ve", "artist": "Bir Singh", "year": "2017", "hookStartSec": 40, "energy": 7, "query": "Chann Ve Bir Singh Channa Mereya White Hill Music"},
    {"title": "Sochda Hi Reha", "artist": "Bir Singh", "year": "2018", "hookStartSec": 35, "energy": 7, "query": "Sochda Hi Reha Bir Singh official video"},
    {"title": "Bhed", "artist": "Bir Singh", "year": "2019", "hookStartSec": 35, "energy": 7, "query": "Bhed Bir Singh official video Rhythm Boyz"},
    {"title": "Dil Ni Todida", "artist": "Bir Singh", "year": "2021", "hookStartSec": 35, "energy": 7, "query": "Dil Ni Todida Bir Singh official music video"},

    # Ninja
    {"title": "Aadat", "artist": "Ninja", "year": "2015", "hookStartSec": 40, "energy": 7, "query": "Aadat Ninja Malwa Records official video"},
    {"title": "Roi Na", "artist": "Ninja", "year": "2017", "hookStartSec": 40, "energy": 7, "query": "Roi Na Ninja official video Speed Records"},
    {"title": "Hawa De Warke", "artist": "Ninja", "year": "2017", "hookStartSec": 40, "energy": 7, "query": "Hawa De Warke Ninja Channa Mereya White Hill Music"},
    {"title": "Dil", "artist": "Ninja", "year": "2016", "hookStartSec": 35, "energy": 7, "query": "Dil Ninja official video Speed Records"},

    # Kamal Khan
    {"title": "Dil De Varke", "artist": "Kamal Khan", "year": "2012", "hookStartSec": 40, "energy": 7, "query": "Dil De Varke Kamal Khan Fer Mamla Gadbad Gadbad Speed Records"},
    {"title": "Awaaz", "artist": "Kamal Khan", "year": "2018", "hookStartSec": 40, "energy": 7, "query": "Awaaz Qismat Kamal Khan Ammy Virk Jaani B Praak"},
    {"title": "Hathan Diyan Rekhan", "artist": "Kamal Khan", "year": "2016", "hookStartSec": 40, "energy": 7, "query": "Hathan Diyan Rekhan Kamal Khan official video"},
    {"title": "Supna", "artist": "Kamal Khan", "year": "2019", "hookStartSec": 40, "energy": 7, "query": "Supna Kamal Khan official video Speed Records"},

    # Jassie Gill
    {"title": "Guitar Sikhda", "artist": "Jassie Gill", "year": "2017", "hookStartSec": 35, "energy": 8, "query": "Guitar Sikhda Jassie Gill Jaani B Praak Speed Records"},
    {"title": "Dil Tutda", "artist": "Jassie Gill", "year": "2017", "hookStartSec": 40, "energy": 7, "query": "Dil Tutda Jassie Gill official video Speed Records"},
    {"title": "Keh Gayi Sorry", "artist": "Jassie Gill, Shehnaaz Gill", "year": "2020", "hookStartSec": 30, "energy": 7, "query": "Keh Gayi Sorry Jassie Gill Shehnaaz Gill official video"},
    {"title": "Allah Ve", "artist": "Jassie Gill", "year": "2019", "hookStartSec": 35, "energy": 7, "query": "Allah Ve Jassie Gill Jaani Sunny Vik T-Series"},
    {"title": "Rabb Wangu", "artist": "Jassie Gill", "year": "2019", "hookStartSec": 35, "energy": 8, "query": "Rabb Wangu Jassie Gill official video Humble Music"},

    # Garry Sandhu & Gurnazar
    {"title": "Ik Kahani", "artist": "Garry Sandhu", "year": "2017", "hookStartSec": 35, "energy": 7, "query": "Ik Kahani Garry Sandhu official video Fresh Media Records"},
    {"title": "Banda Ban Ja", "artist": "Garry Sandhu", "year": "2015", "hookStartSec": 35, "energy": 8, "query": "Banda Ban Ja Garry Sandhu official video Fresh Media Records"},
    {"title": "Do Gallan", "artist": "Garry Sandhu", "year": "2019", "hookStartSec": 35, "energy": 7, "query": "Do Gallan Garry Sandhu official video Fresh Media Records"},
    {"title": "Kismat", "artist": "Gurnazar", "year": "2019", "hookStartSec": 35, "energy": 7, "query": "Kismat Gurnazar official video Speed Records"},
    {"title": "Kala Tikka", "artist": "Gurnazar", "year": "2017", "hookStartSec": 35, "energy": 8, "query": "Kala Tikka Gurnazar official video Speed Records"},
    {"title": "Izhaar", "artist": "Gurnazar", "year": "2017", "hookStartSec": 35, "energy": 7, "query": "Izhaar Gurnazar official video Speed Records"},
    {"title": "Koi Vi Nahi", "artist": "Shirley Setia, Gurnazar", "year": "2018", "hookStartSec": 35, "energy": 8, "query": "Koi Vi Nahi Shirley Setia Gurnazar official video Speed Records"},

    # Babbal Rai & Falak Shabir & Bilal Saeed
    {"title": "Tera Naam", "artist": "Babbal Rai", "year": "2015", "hookStartSec": 35, "energy": 8, "query": "Tera Naam Babbal Rai official video Speed Records"},
    {"title": "Dream Boy", "artist": "Babbal Rai", "year": "2017", "hookStartSec": 35, "energy": 8, "query": "Dream Boy Babbal Rai official video Speed Records"},
    {"title": "Judaai", "artist": "Falak Shabir", "year": "2013", "hookStartSec": 40, "energy": 7, "query": "Judaai Falak Shabir I Love NY T-Series"},
    {"title": "Rog", "artist": "Falak Shabir", "year": "2008", "hookStartSec": 45, "energy": 7, "query": "Rog Falak Shabir official video"},
    {"title": "Ijazat", "artist": "Falak Shabir", "year": "2012", "hookStartSec": 40, "energy": 8, "query": "Ijazat Falak Shabir official video"},
    {"title": "12 Saal", "artist": "Bilal Saeed", "year": "2011", "hookStartSec": 35, "energy": 8, "query": "12 Saal Bilal Saeed official video Beyond Records"},
    {"title": "Adhi Adhi Raat", "artist": "Bilal Saeed", "year": "2012", "hookStartSec": 40, "energy": 7, "query": "Adhi Adhi Raat Bilal Saeed official video Beyond Records"},
    {"title": "Khair Mangdi", "artist": "Bilal Saeed", "year": "2014", "hookStartSec": 35, "energy": 8, "query": "Khair Mangdi Bilal Saeed official video Beyond Records"},
    {"title": "Baari", "artist": "Bilal Saeed, Momina Mustehsan", "year": "2019", "hookStartSec": 35, "energy": 8, "query": "Baari Bilal Saeed Momina Mustehsan official video One Two Records"},

    # Rahat & Nusrat Fateh Ali Khan (Soulful Punjabi Classics)
    {"title": "Main Tenu Samjhawan Ki", "artist": "Rahat Fateh Ali Khan", "year": "2010", "hookStartSec": 45, "energy": 8, "query": "Main Tenu Samjhawan Ki Rahat Fateh Ali Khan Virsa Punjab"},
    {"title": "Akhiyan", "artist": "Rahat Fateh Ali Khan", "year": "2011", "hookStartSec": 45, "energy": 7, "query": "Akhiyan Rahat Fateh Ali Khan Mirza The Untold Story Speed Records"},
    {"title": "Zaroori Tha", "artist": "Rahat Fateh Ali Khan", "year": "2014", "hookStartSec": 45, "energy": 7, "query": "Zaroori Tha Rahat Fateh Ali Khan Gauahar Kushal Universal Music India"},
    {"title": "Nit Khair Manga", "artist": "Nusrat Fateh Ali Khan", "year": "1991", "hookStartSec": 45, "energy": 8, "query": "Nit Khair Manga Sohneya Nusrat Fateh Ali Khan original"},
    {"title": "Sanu Ek Pal Chain", "artist": "Nusrat Fateh Ali Khan", "year": "1993", "hookStartSec": 45, "energy": 8, "query": "Sanu Ek Pal Chain Nusrat Fateh Ali Khan original video"},
    {"title": "Kinna Sohna Tenu Rab Ne Banaya", "artist": "Nusrat Fateh Ali Khan", "year": "1991", "hookStartSec": 45, "energy": 8, "query": "Kinna Sohna Tenu Rab Ne Banaya Nusrat Fateh Ali Khan original"},

    # Rabbi Shergill
    {"title": "Bulla Ki Jaana", "artist": "Rabbi Shergill", "year": "2004", "hookStartSec": 45, "energy": 8, "query": "Bulla Ki Jaana Rabbi Shergill official video"},
    {"title": "Tere Bina", "artist": "Rabbi Shergill", "year": "2005", "hookStartSec": 45, "energy": 7, "query": "Tere Bina Rabbi Shergill official video"},
    {"title": "Challa", "artist": "Rabbi Shergill", "year": "2012", "hookStartSec": 40, "energy": 8, "query": "Challa Jab Tak Hai Jaan Rabbi Shergill Shah Rukh Khan YRF"},

    # Gurdas Maan Emotional Classics
    {"title": "Vich Pardesan De", "artist": "Gurdas Maan", "year": "1999", "hookStartSec": 45, "energy": 7, "query": "Vich Pardesan De Gurdas Maan official video"},
    {"title": "Pind Diyan Galiyan", "artist": "Gurdas Maan", "year": "2007", "hookStartSec": 45, "energy": 7, "query": "Pind Diyan Galiyan Gurdas Maan official video"},

    # R Nait & Jass Manak Heartbreak
    {"title": "Regret", "artist": "R Nait", "year": "2019", "hookStartSec": 35, "energy": 8, "query": "Regret R Nait official video Speed Records"},
    {"title": "Distance", "artist": "R Nait", "year": "2020", "hookStartSec": 35, "energy": 7, "query": "Distance R Nait official video Speed Records"},
    {"title": "Tera Mera Viah", "artist": "Jass Manak", "year": "2019", "hookStartSec": 30, "energy": 8, "query": "Tera Mera Viah Jass Manak official video Geet MP3"},
    {"title": "Rabb Wargi", "artist": "Jass Manak", "year": "2019", "hookStartSec": 30, "energy": 7, "query": "Rabb Wargi Jass Manak official video Geet MP3"},
    {"title": "Yaara Tere Warga", "artist": "Jass Manak", "year": "2020", "hookStartSec": 30, "energy": 7, "query": "Yaara Tere Warga Jass Manak official video Geet MP3"},
    {"title": "Chehra Tera", "artist": "Jass Manak", "year": "2019", "hookStartSec": 30, "energy": 7, "query": "Chehra Tera Jass Manak official video Geet MP3"},

    # Diljit & Ammy Virk Soulful
    {"title": "Aar Nanki Paar Nanki", "artist": "Diljit Dosanjh", "year": "2018", "hookStartSec": 40, "energy": 7, "query": "Aar Nanki Paar Nanki Diljit Dosanjh White Hill Music"},
    {"title": "Jind Mahi Acoustic", "artist": "Diljit Dosanjh", "year": "2018", "hookStartSec": 35, "energy": 7, "query": "Jind Mahi Diljit Dosanjh official video Speed Records"},
    {"title": "Teri Jatti", "artist": "Ammy Virk", "year": "2022", "hookStartSec": 35, "energy": 8, "query": "Teri Jatti Ammy Virk Tania Burfi Music"},
    {"title": "Taare Baliye", "artist": "Ammy Virk", "year": "2020", "hookStartSec": 35, "energy": 7, "query": "Taare Baliye Ammy Virk official video"},
    {"title": "Regret Ammy", "artist": "Ammy Virk", "year": "2020", "hookStartSec": 35, "energy": 7, "query": "Regret Ammy Virk official music video Speed Records"}
]

cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            cache = json.load(f)
    except Exception as e:
        print("Failed to load cache:", e)

def save_cache():
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print("Failed to save cache:", e)

def verify_oembed(vid):
    if not vid or len(vid) != 11:
        return False, ""
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as res:
            if res.status == 200:
                data = json.loads(res.read().decode())
                return True, data.get("title", "")
    except Exception:
        pass
    return False, ""

def resolve_candidate(cand):
    q = cand["query"]
    if q in cache:
        cached_entry = cache[q]
        vid = cached_entry.get("videoId")
        if vid and len(vid) == 11:
            return {
                "candidate": cand,
                "videoId": vid,
                "durationSec": cached_entry.get("durationSec", 215),
                "yt_title": cached_entry.get("yt_title", "")
            }

    ydl_opts = {
        "quiet": True,
        "extract_flat": True,
        "noplaylist": True,
        "ignoreerrors": True
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch3:{q}", download=False)
            if res and "entries" in res and res["entries"]:
                for entry in res["entries"]:
                    if not entry:
                        continue
                    vid = entry.get("id")
                    if not vid or len(vid) != 11:
                        continue
                    duration = entry.get("duration")
                    ok, yt_title = verify_oembed(vid)
                    if ok:
                        dur = duration if (duration and 90 <= duration <= 450) else 215
                        res_obj = {
                            "candidate": cand,
                            "videoId": vid,
                            "durationSec": dur,
                            "yt_title": yt_title
                        }
                        cache[q] = {
                            "videoId": vid,
                            "durationSec": dur,
                            "yt_title": yt_title
                        }
                        return res_obj
    except Exception as e:
        print(f"Error querying {q}: {e}")
    return None

def process_category(name, base_songs, new_candidates, target_count=105):
    print(f"\n--- Processing {name} ---")
    seen_vids = set()
    seen_titles = set()
    result_songs = []

    # Verify and add base songs first
    for s in base_songs:
        vid = s.get("videoId", "").strip()
        title = s.get("title", "").strip().lower()
        if not vid or len(vid) != 11 or vid in seen_vids or title in seen_titles:
            continue
        ok, _ = verify_oembed(vid)
        if ok:
            seen_vids.add(vid)
            seen_titles.add(title)
            hook_start = int(s.get("hookStartSec") or 35)
            hook_end = int(s.get("hookEndSec") or (hook_start + 40))
            dur = int(s.get("durationSec") or 210)
            result_songs.append({
                "title": s["title"],
                "artist": s["artist"],
                "year": str(s.get("year", "2020")),
                "durationSec": dur,
                "hookStartSec": hook_start,
                "hookEndSec": hook_end,
                "entrySec": hook_start,
                "exitSec": hook_end,
                "videoId": vid,
                "energy": int(s.get("energy", 9 if "wedding" in name else 7))
            })

    print(f"Verified base songs from agent_5: {len(result_songs)}")

    # Resolve new candidates in parallel
    print(f"Resolving {len(new_candidates)} new candidates with ThreadPoolExecutor...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(resolve_candidate, cand): cand for cand in new_candidates}
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            if not res:
                continue
            cand = res["candidate"]
            vid = res["videoId"]
            title = cand["title"].strip()
            title_lower = title.lower()

            if vid in seen_vids or title_lower in seen_titles:
                continue

            seen_vids.add(vid)
            seen_titles.add(title_lower)

            hook_start = int(cand.get("hookStartSec", 35))
            hook_end = hook_start + 40
            dur = int(res["durationSec"])
            if dur < hook_end + 10:
                dur = hook_end + 50
            if dur > 320:
                dur = 220

            result_songs.append({
                "title": title,
                "artist": cand["artist"],
                "year": str(cand.get("year", "2020")),
                "durationSec": dur,
                "hookStartSec": hook_start,
                "hookEndSec": hook_end,
                "entrySec": hook_start,
                "exitSec": hook_end,
                "videoId": vid,
                "energy": int(cand.get("energy", 9 if "wedding" in name else 7))
            })
            print(f"[{len(result_songs)}] Added: {title} ({vid})")

    save_cache()
    print(f"Total authentic verified songs for {name}: {len(result_songs)}")
    return result_songs

def main():
    print("Starting Curation for Agent 2 Batch 200...")
    wedding_songs = process_category("punjabi-wedding", BASE_WEDDING, WEDDING_CANDIDATES, target_count=105)
    sad_songs = process_category("punjabi-sad", BASE_SAD, SAD_CANDIDATES, target_count=105)

    print(f"\nFinal tally:")
    print(f"  punjabi-wedding: {len(wedding_songs)} songs")
    print(f"  punjabi-sad: {len(sad_songs)} songs")

    if len(wedding_songs) < 100:
        print("ERROR: punjabi-wedding has fewer than 100 songs!")
    if len(sad_songs) < 100:
        print("ERROR: punjabi-sad has fewer than 100 songs!")

    out_data = {
        "punjabi-wedding": wedding_songs,
        "punjabi-sad": sad_songs
    }

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2, ensure_ascii=False)

    print(f"\nSuccessfully wrote curated data to {OUT_FILE}!")

if __name__ == "__main__":
    main()
