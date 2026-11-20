import urllib.request
import urllib.parse
import json
import re
import time
import os

# 100 Curated Punjabi Songs List
SONGS_SPECS = {
    "punjabi-party": [
        {"title": "Lover", "artist": "Diljit Dosanjh", "year": "2021", "energy": 10, "hookStart": 40, "query": "Diljit Dosanjh Lover Official Music Video"},
        {"title": "Born to Shine", "artist": "Diljit Dosanjh", "year": "2020", "energy": 10, "hookStart": 52, "query": "Diljit Dosanjh Born To Shine Official Music Video"},
        {"title": "G.O.A.T.", "artist": "Diljit Dosanjh", "year": "2020", "energy": 10, "hookStart": 45, "query": "Diljit Dosanjh GOAT Official Music Video"},
        {"title": "Lemonade", "artist": "Diljit Dosanjh", "year": "2022", "energy": 10, "hookStart": 38, "query": "Diljit Dosanjh Lemonade Official Music Video"},
        {"title": "Naina", "artist": "Diljit Dosanjh, Badshah", "year": "2024", "energy": 10, "hookStart": 48, "query": "Naina Crew Diljit Dosanjh Badshah Official Video"},
        {"title": "Tauba Tauba", "artist": "Karan Aujla", "year": "2024", "energy": 10, "hookStart": 37, "query": "Tauba Tauba Karan Aujla Bad Newz Official Video"},
        {"title": "Softly", "artist": "Karan Aujla, Ikky", "year": "2023", "energy": 10, "hookStart": 42, "query": "Karan Aujla Softly Official Music Video"},
        {"title": "52 Bars", "artist": "Karan Aujla, Ikky", "year": "2023", "energy": 10, "hookStart": 35, "query": "Karan Aujla 52 Bars Official Music Video"},
        {"title": "Winning Speech", "artist": "Karan Aujla, Mxrci", "year": "2024", "energy": 10, "hookStart": 44, "query": "Karan Aujla Winning Speech Official Music Video"},
        {"title": "Brown Munde", "artist": "AP Dhillon, Gurinder Gill, Shinda Kahlon", "year": "2020", "energy": 10, "hookStart": 48, "query": "Brown Munde AP Dhillon Gurinder Gill Official Music Video"},
        {"title": "Excuses", "artist": "AP Dhillon, Gurinder Gill", "year": "2020", "energy": 10, "hookStart": 62, "query": "AP Dhillon Excuses Official Music Video Kehndi Hundi Si"},
        {"title": "Insane", "artist": "AP Dhillon, Gurinder Gill, Shinda Kahlon", "year": "2021", "energy": 10, "hookStart": 40, "query": "AP Dhillon Insane Official Music Video"},
        {"title": "295", "artist": "Sidhu Moosewala", "year": "2021", "energy": 10, "hookStart": 50, "query": "Sidhu Moose Wala 295 Official Audio Video Moosetape"},
        {"title": "So High", "artist": "Sidhu Moosewala", "year": "2017", "energy": 10, "hookStart": 42, "query": "Sidhu Moose Wala So High Official Music Video"},
        {"title": "The Last Ride", "artist": "Sidhu Moosewala", "year": "2022", "energy": 10, "hookStart": 45, "query": "Sidhu Moose Wala The Last Ride Official Video"},
        {"title": "Brown Rang", "artist": "Yo Yo Honey Singh", "year": "2011", "energy": 10, "hookStart": 40, "query": "Brown Rang Yo Yo Honey Singh Official Music Video"},
        {"title": "Dope Shope", "artist": "Yo Yo Honey Singh, Deep Money", "year": "2011", "energy": 10, "hookStart": 48, "query": "Dope Shope Yo Yo Honey Singh Deep Money Official Video"},
        {"title": "Love Dose", "artist": "Yo Yo Honey Singh", "year": "2014", "energy": 9, "hookStart": 50, "query": "Love Dose Yo Yo Honey Singh Desi Kalakaar Official Video"},
        {"title": "Angreji Beat", "artist": "Yo Yo Honey Singh, Gippy Grewal", "year": "2011", "energy": 10, "hookStart": 38, "query": "Angreji Beat Gippy Grewal Honey Singh Official Video"},
        {"title": "Baller", "artist": "Shubh", "year": "2022", "energy": 10, "hookStart": 32, "query": "Shubh Baller Official Music Video"},
        {"title": "Cheques", "artist": "Shubh", "year": "2023", "energy": 10, "hookStart": 35, "query": "Shubh Cheques Official Music Video Still Rollin"},
        {"title": "Elevated", "artist": "Shubh", "year": "2021", "energy": 10, "hookStart": 36, "query": "Shubh Elevated Official Music Video"},
        {"title": "With You", "artist": "AP Dhillon", "year": "2023", "energy": 9, "hookStart": 38, "query": "AP Dhillon With You Official Music Video"},
        {"title": "White Brown Black", "artist": "Karan Aujla, Avvy Sra", "year": "2022", "energy": 10, "hookStart": 45, "query": "White Brown Black Karan Aujla Avvy Sra Official Video"},
        {"title": "Chauffeur", "artist": "Diljit Dosanjh, Tory Lanez", "year": "2022", "energy": 9, "hookStart": 40, "query": "Diljit Dosanjh Chauffeur Tory Lanez Official Music Video"},
        {"title": "Kinni Kinni", "artist": "Diljit Dosanjh", "year": "2023", "energy": 10, "hookStart": 42, "query": "Diljit Dosanjh Kinni Kinni Official Music Video Ghost"},
        {"title": "Admiring You", "artist": "Karan Aujla, Preston Pablo", "year": "2023", "energy": 10, "hookStart": 35, "query": "Karan Aujla Admiring You Official Music Video"},
        {"title": "Jee Ni Karda", "artist": "Karan Sehmbi", "year": "2018", "energy": 9, "hookStart": 42, "query": "Jee Ni Karda Karan Sehmbi Official Music Video"},
        {"title": "High Rated Gabru", "artist": "Guru Randhawa", "year": "2017", "energy": 10, "hookStart": 44, "query": "High Rated Gabru Guru Randhawa Official Music Video"},
        {"title": "Lahore", "artist": "Guru Randhawa", "year": "2017", "energy": 10, "hookStart": 40, "query": "Lahore Guru Randhawa Official Music Video"}
    ],
    "punjabi-wedding": [
        {"title": "Gud Naal Ishq Mitha", "artist": "Navraj Hans, Harshdeep Kaur", "year": "2019", "energy": 10, "hookStart": 45, "query": "Gud Naal Ishq Mitha Ek Ladki Ko Dekha Toh Aisa Laga Official Video"},
        {"title": "Laung Da Lashkara", "artist": "Jasbir Jassi, Mahalakshmi Iyer, Hard Kaur", "year": "2011", "energy": 10, "hookStart": 50, "query": "Laung Da Lashkara Patiala House Official Video"},
        {"title": "Mundian To Bach Ke", "artist": "Panjabi MC", "year": "2002", "energy": 10, "hookStart": 30, "query": "Panjabi MC Mundian To Bach Ke Official Video"},
        {"title": "Kangana Tera Ni", "artist": "Dr Zeus, Master Rakesh", "year": "2003", "energy": 10, "hookStart": 42, "query": "Kangana Dr Zeus Master Rakesh Official Music Video Unda Da Influence"},
        {"title": "Ishq Tera Tadpave (Oh Ho Ho Ho)", "artist": "Sukhbir", "year": "1999", "energy": 10, "hookStart": 35, "query": "Ishq Tera Tadpave Sukhbir Oh Ho Ho Ho Official Video"},
        {"title": "Morni Banke", "artist": "Guru Randhawa, Neha Kakkar", "year": "2018", "energy": 10, "hookStart": 40, "query": "Morni Banke Badhaai Ho Guru Randhawa Neha Kakkar Official Video"},
        {"title": "Sauda Khara Khara", "artist": "Diljit Dosanjh, Sukhbir, Dhvani Bhanushali", "year": "2019", "energy": 10, "hookStart": 44, "query": "Sauda Khara Khara Good Newwz Diljit Dosanjh Sukhbir Official Video"},
        {"title": "Suit Suit", "artist": "Guru Randhawa, Arjun", "year": "2017", "energy": 10, "hookStart": 38, "query": "Suit Suit Hindi Medium Guru Randhawa Arjun Official Video"},
        {"title": "Coka", "artist": "Sukh-E Muzical Doctorz", "year": "2019", "energy": 10, "hookStart": 40, "query": "Coka Sukhe Muzical Doctorz Official Music Video"},
        {"title": "Kala Chashma", "artist": "Amar Arshi, Badshah, Neha Kakkar", "year": "2016", "energy": 10, "hookStart": 45, "query": "Kala Chashma Baar Baar Dekho Sidharth Katrina Badshah Neha Kakkar"},
        {"title": "Lamberghini", "artist": "The Doorbeen, Ragini", "year": "2018", "energy": 10, "hookStart": 36, "query": "Lamberghini The Doorbeen feat Ragini Official Music Video"},
        {"title": "Na Na Na Na", "artist": "J Star", "year": "2014", "energy": 9, "hookStart": 38, "query": "Na Na Na Na J Star Official Video"},
        {"title": "Bapu Zimidar", "artist": "Jassie Gill", "year": "2014", "energy": 9, "hookStart": 42, "query": "Bapu Zimidar Jassie Gill Official Music Video"},
        {"title": "3 Peg", "artist": "Sharry Mann", "year": "2016", "energy": 10, "hookStart": 48, "query": "3 Peg Sharry Mann Official Music Video Mista Baaz"},
        {"title": "Hostel", "artist": "Sharry Mann", "year": "2017", "energy": 9, "hookStart": 44, "query": "Hostel Sharry Mann Official Music Video Parmish Verma"},
        {"title": "Yaar Anmulle", "artist": "Sharry Mann", "year": "2011", "energy": 9, "hookStart": 50, "query": "Yaar Anmulle Sharry Mann Official Music Video"},
        {"title": "Jaguar", "artist": "Sukh-E Muzical Doctorz, Bohemia", "year": "2015", "energy": 10, "hookStart": 42, "query": "Jaguar Muzical Doctorz Sukhe Feat Bohemia Official Video"},
        {"title": "Patiala Peg", "artist": "Diljit Dosanjh", "year": "2014", "energy": 10, "hookStart": 45, "query": "Patiala Peg Diljit Dosanjh Official Music Video"},
        {"title": "5 Taara", "artist": "Diljit Dosanjh", "year": "2015", "energy": 10, "hookStart": 46, "query": "5 Taara Diljit Dosanjh Official Music Video"},
        {"title": "Do You Know", "artist": "Diljit Dosanjh", "year": "2016", "energy": 9, "hookStart": 40, "query": "Do You Know Diljit Dosanjh Official Music Video"},
        {"title": "Raat Di Gedi", "artist": "Diljit Dosanjh, Neeru Bajwa", "year": "2017", "energy": 10, "hookStart": 44, "query": "Raat Di Gedi Diljit Dosanjh Neeru Bajwa Official Video"},
        {"title": "Illegal Weapon", "artist": "Jasmine Sandlas, Garry Sandhu", "year": "2017", "energy": 10, "hookStart": 48, "query": "Illegal Weapon Jasmine Sandlas Garry Sandhu Official Video"},
        {"title": "Sip Sip", "artist": "Jasmine Sandlas, Intense", "year": "2018", "energy": 10, "hookStart": 36, "query": "Sip Sip Jasmine Sandlas Intense Official Video"},
        {"title": "Dil Chori", "artist": "Yo Yo Honey Singh, Simar Kaur, Ishers", "year": "2017", "energy": 10, "hookStart": 42, "query": "Dil Chori Sonu Ke Titu Ki Sweety Yo Yo Honey Singh"},
        {"title": "Gallan Goodiyaan", "artist": "Yashita Sharma, Manish Kumar Tipu, Farhan Akhtar, Shankar Mahadevan", "year": "2015", "energy": 10, "hookStart": 50, "query": "Gallan Goodiyaan Dil Dhadakne Do Official Video"},
        {"title": "Wakhra Swag", "artist": "Navv Inder, Badshah", "year": "2015", "energy": 10, "hookStart": 44, "query": "Wakhra Swag Navv Inder feat Badshah Official Video"},
        {"title": "Backbone", "artist": "Harrdy Sandhu", "year": "2017", "energy": 9, "hookStart": 45, "query": "Backbone Harrdy Sandhu Official Music Video Jaani B Praak"},
        {"title": "Kya Baat Ay", "artist": "Harrdy Sandhu", "year": "2018", "energy": 10, "hookStart": 40, "query": "Kya Baat Ay Harrdy Sandhu Official Music Video Jaani B Praak"},
        {"title": "Naah", "artist": "Harrdy Sandhu, Nora Fatehi", "year": "2017", "energy": 10, "hookStart": 42, "query": "Naah Harrdy Sandhu feat Nora Fatehi Official Video Jaani B Praak"},
        {"title": "Lehanga", "artist": "Jass Manak", "year": "2019", "energy": 10, "hookStart": 36, "query": "Lehanga Jass Manak Official Music Video"}
    ],
    "punjabi-sad": [
        {"title": "Qismat", "artist": "Ammy Virk, B Praak", "year": "2017", "energy": 7, "hookStart": 65, "query": "Qismat Ammy Virk Sargun Mehta B Praak Jaani Official Video"},
        {"title": "Filhall", "artist": "B Praak, Akshay Kumar, Nupur Sanon", "year": "2019", "energy": 7, "hookStart": 60, "query": "Filhall B Praak Akshay Kumar Nupur Sanon Jaani Official Video"},
        {"title": "Filhaal 2 Mohabbat", "artist": "B Praak, Akshay Kumar, Nupur Sanon", "year": "2021", "energy": 7, "hookStart": 70, "query": "Filhaal 2 Mohabbat B Praak Akshay Kumar Jaani Official Video"},
        {"title": "Pachtaoge", "artist": "Arijit Singh, B Praak", "year": "2019", "energy": 7, "hookStart": 55, "query": "Pachtaoge Arijit Singh Vicky Kaushal Nora Fatehi Jaani B Praak"},
        {"title": "Mann Bharrya", "artist": "B Praak", "year": "2017", "energy": 7, "hookStart": 58, "query": "Mann Bharrya B Praak Jaani Official Video Himanshi Khurana"},
        {"title": "Mann Bharryaa 2.0", "artist": "B Praak", "year": "2021", "energy": 7, "hookStart": 62, "query": "Mann Bharryaa 2.0 Shershaah Sidharth Kiara B Praak Jaani"},
        {"title": "Soch", "artist": "Harrdy Sandhu", "year": "2013", "energy": 7, "hookStart": 64, "query": "Soch Harrdy Sandhu Official Video Jaani B Praak"},
        {"title": "Hath Chumme", "artist": "Ammy Virk, B Praak", "year": "2018", "energy": 7, "hookStart": 56, "query": "Hath Chumme Ammy Virk B Praak Jaani Official Video"},
        {"title": "Kaun Hoyega", "artist": "B Praak, Divya Bhatt, Ammy Virk", "year": "2018", "energy": 7, "hookStart": 60, "query": "Kaun Hoyega Qismat Ammy Virk Sargun Mehta B Praak Jaani"},
        {"title": "Teri Mitti", "artist": "B Praak", "year": "2019", "energy": 7, "hookStart": 68, "query": "Teri Mitti Kesari Akshay Kumar Parineeti Chopra B Praak"},
        {"title": "Dholna", "artist": "B Praak", "year": "2018", "energy": 7, "hookStart": 55, "query": "Dholna Qismat Ammy Virk Sargun Mehta B Praak Jaani"},
        {"title": "Kuch Bhi Ho Jaye", "artist": "B Praak", "year": "2020", "energy": 7, "hookStart": 62, "query": "Kuch Bhi Ho Jaye B Praak Jaani Official Music Video"},
        {"title": "Bewafa", "artist": "Imran Khan", "year": "2009", "energy": 7, "hookStart": 45, "query": "Bewafa Imran Khan Official Music Video Unforgettable"},
        {"title": "Masstaani", "artist": "B Praak, Jaani", "year": "2018", "energy": 7, "hookStart": 58, "query": "Masstaani B Praak Jaani Official Music Video"},
        {"title": "Rona Sikhade Ve", "artist": "Miel, Jaani, B Praak", "year": "2018", "energy": 7, "hookStart": 52, "query": "Rona Sikhade Ve Miel Jaani B Praak Official Video"},
        {"title": "Zindagi Tere Naal", "artist": "Khan Bhaini", "year": "2021", "energy": 7, "hookStart": 48, "query": "Zindagi Tere Naal Khan Bhaini Official Music Video Sycostyle"},
        {"title": "Rabb Manneya", "artist": "Lakhwinder Wadali, Neeti Mohan", "year": "2021", "energy": 7, "hookStart": 56, "query": "Rabb Manneya Koi Jaane Na Lakhwinder Wadali Neeti Mohan"},
        {"title": "Bewafai", "artist": "B Praak, Gauahar Khan", "year": "2020", "energy": 7, "hookStart": 65, "query": "Bewafai B Praak Gauahar Khan Rochak Kohli Manoj Muntashir"},
        {"title": "Taare", "artist": "Aatish", "year": "2018", "energy": 7, "hookStart": 54, "query": "Taare Aatish Nirmaan Goldboy Official Music Video"},
        {"title": "Baarish Ki Jaaye", "artist": "B Praak, Nawazuddin Siddiqui, Sunanda Sharma", "year": "2021", "energy": 7, "hookStart": 50, "query": "Baarish Ki Jaaye B Praak Nawazuddin Siddiqui Sunanda Sharma Jaani"}
    ],
    "punjabi-gym": [
        {"title": "Same Beef", "artist": "Bohemia, Sidhu Moosewala", "year": "2019", "energy": 10, "hookStart": 48, "query": "Same Beef Bohemia Sidhu Moose Wala Byg Byrd Official Video"},
        {"title": "Old Skool", "artist": "Prem Dhillon, Sidhu Moosewala, Naseeb", "year": "2020", "energy": 10, "hookStart": 45, "query": "Old Skool Prem Dhillon Sidhu Moose Wala Naseeb Official Video"},
        {"title": "Bambiha Bole", "artist": "Amrit Maan, Sidhu Moosewala", "year": "2020", "energy": 10, "hookStart": 46, "query": "Bambiha Bole Amrit Maan Sidhu Moose Wala Official Video"},
        {"title": "Dollar", "artist": "Sidhu Moosewala", "year": "2018", "energy": 10, "hookStart": 42, "query": "Dollar Sidhu Moose Wala Dakuaan Da Munda Official Video"},
        {"title": "Legend", "artist": "Sidhu Moosewala", "year": "2019", "energy": 10, "hookStart": 50, "query": "Legend Sidhu Moose Wala The Kidd Official Music Video"},
        {"title": "Famous", "artist": "Sidhu Moosewala", "year": "2018", "energy": 10, "hookStart": 44, "query": "Famous Sidhu Moose Wala Byg Byrd Official Video PBX 1"},
        {"title": "Tibeyan Da Putt", "artist": "Sidhu Moosewala", "year": "2020", "energy": 10, "hookStart": 45, "query": "Tibeyan Da Putt Sidhu Moose Wala The Kidd Official Video"},
        {"title": "Bad", "artist": "Sidhu Moosewala", "year": "2020", "energy": 10, "hookStart": 40, "query": "Bad Sidhu Moose Wala Street Boyz Official Video"},
        {"title": "Don't Look", "artist": "Karan Aujla", "year": "2019", "energy": 10, "hookStart": 44, "query": "Dont Look Karan Aujla Jay Trak Rupan Bal Official Video"},
        {"title": "Chitta Kurta", "artist": "Karan Aujla", "year": "2019", "energy": 10, "hookStart": 46, "query": "Chitta Kurta Karan Aujla Deep Jandu Sukh Sanghera Official Video"},
        {"title": "Mexico", "artist": "Karan Aujla", "year": "2020", "energy": 10, "hookStart": 42, "query": "Mexico Karan Aujla Sukh Sanghera Official Video"},
        {"title": "Jhanjar", "artist": "Karan Aujla", "year": "2020", "energy": 10, "hookStart": 40, "query": "Jhanjar Karan Aujla Desi Crew Official Video"},
        {"title": "Defaulter", "artist": "Jordan Sandhu", "year": "2019", "energy": 10, "hookStart": 48, "query": "Defaulter Jordan Sandhu Bhumika Sharma The Boss Official Video"},
        {"title": "Teeje Week", "artist": "Jordan Sandhu", "year": "2018", "energy": 10, "hookStart": 45, "query": "Teeje Week Jordan Sandhu The Boss Bunty Bains Official Video"},
        {"title": "Muchh Rakhi Aa", "artist": "Jordan Sandhu", "year": "2015", "energy": 10, "hookStart": 40, "query": "Muchh Rakhi Aa Jordan Sandhu Desi Crew Official Video"},
        {"title": "Combination", "artist": "Amrit Maan", "year": "2019", "energy": 10, "hookStart": 44, "query": "Combination Amrit Maan Dr Zeus Official Music Video"},
        {"title": "Peg Di Waashna", "artist": "Amrit Maan, Dj Flow", "year": "2017", "energy": 10, "hookStart": 45, "query": "Peg Di Waashna Amrit Maan feat Dj Flow Official Video"},
        {"title": "Trending Nakhra", "artist": "Amrit Maan, Ginni Kapoor", "year": "2018", "energy": 10, "hookStart": 40, "query": "Trending Nakhra Amrit Maan Ginni Kapoor Intense Official Video"},
        {"title": "We Rollin", "artist": "Shubh", "year": "2021", "energy": 10, "hookStart": 32, "query": "We Rollin Shubh Official Music Video"},
        {"title": "No Love", "artist": "Shubh", "year": "2022", "energy": 10, "hookStart": 34, "query": "No Love Shubh Official Music Video"}
    ]
}

def parse_duration_sec(dur_str):
    if not dur_str:
        return 210
    parts = dur_str.strip().split(':')
    try:
        if len(parts) == 2:
            return int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    except:
        pass
    return 210

def fetch_youtube_video(query):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote_plus(query)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            match = re.search(r'var ytInitialData = ({.*?});</script>', html)
            if not match:
                # regex fallback for video IDs
                vids = re.findall(r'watch\?v=([a-zA-Z0-9_-]{11})', html)
                if vids:
                    return vids[0], "Video Title", "Channel", 210
                return None, None, None, 210
            
            data = json.loads(match.group(1))
            sections = data.get('contents', {}).get('twoColumnSearchResultsRenderer', {}).get('primaryContents', {}).get('sectionListRenderer', {}).get('contents', [])
            for sec in sections:
                for item in sec.get('itemSectionRenderer', {}).get('contents', []):
                    vr = item.get('videoRenderer')
                    if vr and 'videoId' in vr:
                        vid = vr['videoId']
                        title = vr.get('title', {}).get('runs', [{}])[0].get('text', '')
                        channel = vr.get('ownerText', {}).get('runs', [{}])[0].get('text', '')
                        dur_text = vr.get('lengthText', {}).get('simpleText', '')
                        dur_sec = parse_duration_sec(dur_text)
                        return vid, title, channel, dur_sec
    except Exception as e:
        print(f"Error fetching '{query}': {e}")
    return None, None, None, 210

def main():
    results = {}
    used_vids = set()

    total_count = sum(len(v) for v in SONGS_SPECS.values())
    print(f"Starting curation of {total_count} songs...")

    for category, songs in SONGS_SPECS.items():
        print(f"\n--- Processing Category: {category} ({len(songs)} songs) ---")
        results[category] = []
        for i, s in enumerate(songs, 1):
            q = s['query']
            vid, yt_title, ch, dur = fetch_youtube_video(q)
            
            # If duplicate or None, try alternative search
            if not vid or vid in used_vids or len(vid) != 11:
                alt_q = f"{s['title']} {s['artist']} punjabi song"
                print(f"Retrying with alternate query: {alt_q}")
                vid, yt_title, ch, dur = fetch_youtube_video(alt_q)

            if not vid or vid in used_vids or len(vid) != 11:
                print(f"WARNING: could not find unique videoId for {s['title']} by {s['artist']}")
            else:
                used_vids.add(vid)
                print(f"[{category} {i}/{len(songs)}] {s['title']} -> {vid} ({dur}s) | {yt_title[:40]} | {ch}")

            hook_start = s['hookStart']
            hook_end = hook_start + 40
            # Ensure duration is reasonable
            duration_val = dur if 120 <= dur <= 500 else 220

            item = {
                "title": s["title"],
                "artist": s["artist"],
                "year": str(s["year"]),
                "durationSec": duration_val,
                "hookStartSec": hook_start,
                "hookEndSec": hook_end,
                "entrySec": hook_start,
                "exitSec": hook_end,
                "videoId": vid,
                "energy": s["energy"]
            }
            results[category].append(item)
            time.sleep(0.3)

    # Save to curated_batches/agent_5.json
    out_dir = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches"
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "agent_5.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"\nSuccessfully wrote {out_file}!")
    print(f"Unique Video IDs: {len(used_vids)} / {total_count}")
    for cat, list_songs in results.items():
        print(f" - {cat}: {len(list_songs)} songs")

if __name__ == "__main__":
    main()
