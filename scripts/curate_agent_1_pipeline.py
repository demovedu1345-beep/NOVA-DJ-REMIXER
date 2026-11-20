import os
import sys
import json
import time
import urllib.request
import concurrent.futures
import yt_dlp

WORKSPACE = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER"
EXISTING_PATH = os.path.join(WORKSPACE, "scripts", "existing_agent1_data.json")
OUTPUT_DIR = os.path.join(WORKSPACE, "scripts", "curated_batches_200")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "agent_1.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(EXISTING_PATH, "r", encoding="utf-8") as f:
    existing_meta = json.load(f)

GLOBAL_SEEN_VIDS = set(existing_meta["existingVids"])
BLACKLIST = {
    'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
    'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g', 'dQw4w9WgXcQ'
}

SUFI_CANDIDATES = [
    {"title": "Tu Jhoom", "artist": "Abida Parveen, Naseebo Lal", "year": "2022", "hookStartSec": 45, "energy": 9, "query": "Tu Jhoom Coke Studio Season 14 official music video"},
    {"title": "Pasoori", "artist": "Ali Sethi, Shae Gill", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Pasoori Coke Studio Season 14 official video Ali Sethi Shae Gill"},
    {"title": "Mast Nazron Se Allah Bachaye", "artist": "Nusrat Fateh Ali Khan", "year": "1993", "hookStartSec": 50, "energy": 8, "query": "Mast Nazron Se Allah Bachaye Nusrat Fateh Ali Khan official"},
    {"title": "Sochta Hoon Ke Woh Kitne Masoom The", "artist": "Nusrat Fateh Ali Khan", "year": "1989", "hookStartSec": 55, "energy": 8, "query": "Sochta Hoon Ke Woh Kitne Masoom The Nusrat Fateh Ali Khan original"},
    {"title": "Tumhein Dillagi Bhool Jaani Padegi", "artist": "Nusrat Fateh Ali Khan", "year": "1992", "hookStartSec": 60, "energy": 8, "query": "Tumhein Dillagi Bhool Jaani Padegi Nusrat Fateh Ali Khan official"},
    {"title": "Sanson Ki Mala Pe Simroon Main", "artist": "Nusrat Fateh Ali Khan", "year": "1990", "hookStartSec": 50, "energy": 9, "query": "Sanson Ki Mala Pe Simroon Main Nusrat Fateh Ali Khan original"},
    {"title": "Gorakh Dhandha", "artist": "Nusrat Fateh Ali Khan", "year": "1988", "hookStartSec": 55, "energy": 8, "query": "Tum Ek Gorakh Dhandha Ho Nusrat Fateh Ali Khan"},
    {"title": "Mera Piya Ghar Aaya", "artist": "Nusrat Fateh Ali Khan", "year": "1994", "hookStartSec": 45, "energy": 9, "query": "Mera Piya Ghar Aaya Nusrat Fateh Ali Khan original video"},
    {"title": "Haq Ali Ali Maula Ali Ali", "artist": "Nusrat Fateh Ali Khan", "year": "1988", "hookStartSec": 50, "energy": 9, "query": "Haq Ali Ali Maula Ali Ali Nusrat Fateh Ali Khan original"},
    {"title": "Allah Hoo Allah Hoo", "artist": "Nusrat Fateh Ali Khan", "year": "1992", "hookStartSec": 55, "energy": 9, "query": "Allah Hoo Allah Hoo Nusrat Fateh Ali Khan official"},
    {"title": "Bismillah", "artist": "Salim-Sulaiman, Kailash Kher, Munawar Masoom", "year": "2013", "hookStartSec": 40, "energy": 9, "query": "Bismillah Salim Sulaiman Kailash Kher Coke Studio MTV"},
    {"title": "Dilruba", "artist": "Kailash Kher, Kailasa", "year": "2006", "hookStartSec": 42, "energy": 9, "query": "Dilruba Kailash Kher Kailasa official video"},
    {"title": "Tauba Tauba", "artist": "Kailash Kher, Kailasa", "year": "2006", "hookStartSec": 38, "energy": 9, "query": "Tauba Tauba Kailash Kher Kailasa official video"},
    {"title": "Albela Sajan", "artist": "Kailash Kher, Kailasa", "year": "2006", "hookStartSec": 45, "energy": 9, "query": "Albela Sajan Kailash Kher Kailasa"},
    {"title": "Babam Bam", "artist": "Kailash Kher, Kailasa", "year": "2007", "hookStartSec": 35, "energy": 9, "query": "Babam Bam Kailash Kher Kailasa official"},
    {"title": "Chaandan Mein", "artist": "Kailash Kher, Kailasa", "year": "2009", "hookStartSec": 40, "energy": 8, "query": "Chaandan Mein Kailash Kher Kailasa official video Sony Music"},
    {"title": "Rang Deeni", "artist": "Kailash Kher, Kailasa", "year": "2009", "hookStartSec": 45, "energy": 9, "query": "Rang Deeni Kailash Kher Kailasa official"},
    {"title": "Kaun Hai Woh", "artist": "Kailash Kher, Mounima", "year": "2015", "hookStartSec": 42, "energy": 9, "query": "Kaun Hain Voh Baahubali Kailash Kher Prabhas Zee Music"},
    {"title": "Jay-Jaykara", "artist": "Kailash Kher", "year": "2017", "hookStartSec": 40, "energy": 10, "query": "Jay-Jaykara Baahubali 2 Kailash Kher official video"},
    {"title": "Yun Hi Chala Chal", "artist": "Udit Narayan, Hariharan, Kailash Kher", "year": "2004", "hookStartSec": 48, "energy": 9, "query": "Yun Hi Chala Chal Swades Shah Rukh Khan AR Rahman"},
    {"title": "Ya Rabba", "artist": "Kailash Kher", "year": "2007", "hookStartSec": 46, "energy": 8, "query": "Ya Rabba Salaam-E-Ishq Kailash Kher official video T-Series"},
    {"title": "O Sanam", "artist": "Lucky Ali", "year": "1996", "hookStartSec": 35, "energy": 8, "query": "O Sanam Lucky Ali Sunoh official video"},
    {"title": "Sunoh", "artist": "Lucky Ali", "year": "1996", "hookStartSec": 40, "energy": 8, "query": "Sunoh Lucky Ali official video"},
    {"title": "Dekha Hai Aise Bhi", "artist": "Lucky Ali", "year": "1998", "hookStartSec": 38, "energy": 8, "query": "Dekha Hai Aise Bhi Lucky Ali Sifar official video"},
    {"title": "Gori Teri Aankhein Kahe", "artist": "Lucky Ali, Kavita Krishnamurthy", "year": "2001", "hookStartSec": 42, "energy": 8, "query": "Gori Teri Aankhein Kahe Lucky Ali official video"},
    {"title": "Tere Mere Saath", "artist": "Lucky Ali", "year": "2001", "hookStartSec": 40, "energy": 8, "query": "Tere Mere Saath Lucky Ali Aks official video"},
    {"title": "Aa Bhi Jaa", "artist": "Lucky Ali, Sunidhi Chauhan", "year": "2002", "hookStartSec": 44, "energy": 8, "query": "Aa Bhi Jaa Sur Lucky Ali Sunidhi Chauhan"},
    {"title": "Jaane Kya Dhoondta Hai", "artist": "Lucky Ali", "year": "2002", "hookStartSec": 38, "energy": 8, "query": "Jaane Kya Dhoondta Hai Lucky Ali Sur official"},
    {"title": "Hairat", "artist": "Lucky Ali", "year": "2010", "hookStartSec": 36, "energy": 9, "query": "Hairat Anjaana Anjaani Lucky Ali Ranbir Kapoor"},
    {"title": "Safarnama", "artist": "Lucky Ali", "year": "2015", "hookStartSec": 40, "energy": 8, "query": "Safarnama Tamasha Lucky Ali AR Rahman Ranbir Kapoor"},
    {"title": "Kitni Haseen Zindagi", "artist": "Lucky Ali", "year": "2001", "hookStartSec": 42, "energy": 8, "query": "Kitni Haseen Zindagi Lucky Ali Aks"},
    {"title": "Masakali", "artist": "Mohit Chauhan", "year": "2009", "hookStartSec": 38, "energy": 9, "query": "Masakali Delhi-6 Mohit Chauhan AR Rahman Sonam Kapoor"},
    {"title": "Phir Se Udd Chala", "artist": "Mohit Chauhan", "year": "2011", "hookStartSec": 42, "energy": 9, "query": "Phir Se Udd Chala Rockstar Mohit Chauhan AR Rahman Ranbir Kapoor"},
    {"title": "Jo Bhi Main", "artist": "Mohit Chauhan", "year": "2011", "hookStartSec": 45, "energy": 8, "query": "Jo Bhi Main Rockstar Mohit Chauhan AR Rahman"},
    {"title": "Hawaa Hawaa", "artist": "Mohit Chauhan", "year": "2011", "hookStartSec": 40, "energy": 9, "query": "Hawaa Hawaa Rockstar Mohit Chauhan AR Rahman"},
    {"title": "Aur Ho", "artist": "Mohit Chauhan, Alma Ferovic", "year": "2011", "hookStartSec": 48, "energy": 8, "query": "Aur Ho Rockstar Mohit Chauhan AR Rahman"},
    {"title": "Sadda Haq", "artist": "Mohit Chauhan", "year": "2011", "hookStartSec": 50, "energy": 10, "query": "Sadda Haq Rockstar Mohit Chauhan AR Rahman Ranbir Kapoor"},
    {"title": "Tum Se Hi", "artist": "Mohit Chauhan", "year": "2007", "hookStartSec": 42, "energy": 8, "query": "Tum Se Hi Jab We Met Mohit Chauhan Kareena Shahid"},
    {"title": "Dooba Dooba", "artist": "Silk Route, Mohit Chauhan", "year": "1998", "hookStartSec": 35, "energy": 8, "query": "Dooba Dooba Silk Route Mohit Chauhan official video"},
    {"title": "Boondein", "artist": "Silk Route, Mohit Chauhan", "year": "1998", "hookStartSec": 40, "energy": 8, "query": "Boondein Silk Route Mohit Chauhan official"},
    {"title": "Guncha Koi", "artist": "Mohit Chauhan", "year": "2005", "hookStartSec": 42, "energy": 8, "query": "Guncha Koi Main Meri Patni Aur Woh Mohit Chauhan"},
    {"title": "Matargashti", "artist": "Mohit Chauhan", "year": "2015", "hookStartSec": 38, "energy": 9, "query": "Matargashti Tamasha Mohit Chauhan AR Rahman Ranbir Deepika"},
    {"title": "Bheegi Si Bhaagi Si", "artist": "Mohit Chauhan, Shreya Ghoshal", "year": "2010", "hookStartSec": 40, "energy": 9, "query": "Bheegi Si Bhaagi Si Raajneeti Mohit Chauhan Shreya Ghoshal"},
    {"title": "Aa Jao Meri Tamanna", "artist": "Javed Ali", "year": "2009", "hookStartSec": 38, "energy": 8, "query": "Aa Jao Meri Tamanna Ajab Prem Ki Ghazab Kahani Javed Ali"},
    {"title": "Lab Par Aaye", "artist": "Javed Ali", "year": "2020", "hookStartSec": 42, "energy": 8, "query": "Lab Par Aaye Javed Ali official song"},
    {"title": "Rangrez Mere", "artist": "Wadali Brothers, Krsna Solo", "year": "2011", "hookStartSec": 45, "energy": 9, "query": "Rangrez Mere Tanu Weds Manu Wadali Brothers Krsna Solo"},
    {"title": "Charkha", "artist": "Wadali Brothers", "year": "2005", "hookStartSec": 50, "energy": 8, "query": "Charkha Wadali Brothers official sufi"},
    {"title": "Ghoonghat Chhuk Oye", "artist": "Wadali Brothers", "year": "2006", "hookStartSec": 46, "energy": 8, "query": "Ghoonghat Chhuk Oye Wadali Brothers"},
    {"title": "Bulla Ki Jaana", "artist": "Rabbi Shergill", "year": "2004", "hookStartSec": 40, "energy": 9, "query": "Bulla Ki Jaana Rabbi Shergill official video"},
    {"title": "Tere Bin Sanu Soniya", "artist": "Rabbi Shergill", "year": "2005", "hookStartSec": 42, "energy": 8, "query": "Tere Bin Sanu Soniya Rabbi Shergill official"},
    {"title": "Dhol Yaara Dhol", "artist": "Rabbi Shergill", "year": "2005", "hookStartSec": 38, "energy": 8, "query": "Dhol Yaara Dhol Rabbi Shergill"},
    {"title": "Bismil Ki Mehfil - Kali Kali Zulfon", "artist": "Bismil", "year": "2022", "hookStartSec": 45, "energy": 9, "query": "Bismil Ki Mehfil Kali Kali Zulfon official live"},
    {"title": "Bismil Ki Mehfil - Tere Bina Jeena Saza Ho Gaya", "artist": "Bismil", "year": "2023", "hookStartSec": 42, "energy": 9, "query": "Bismil Ki Mehfil Tere Bina Jeena Saza Ho Gaya"},
    {"title": "Bismil Ki Mehfil - Halka Halka Suroor", "artist": "Bismil", "year": "2022", "hookStartSec": 45, "energy": 9, "query": "Bismil Ki Mehfil Halka Halka Suroor live sufi"},
    {"title": "Bismil Ki Mehfil - Mast Nazron Se", "artist": "Bismil", "year": "2023", "hookStartSec": 40, "energy": 9, "query": "Bismil Ki Mehfil Mast Nazron Se live"},
    {"title": "Bismil", "artist": "Sukhwinder Singh", "year": "2014", "hookStartSec": 48, "energy": 9, "query": "Bismil Haider Shahid Kapoor Sukhwinder Singh Vishal Bhardwaj"},
    {"title": "Aao Na", "artist": "Vishal Dadlani", "year": "2014", "hookStartSec": 45, "energy": 9, "query": "Aao Na Haider Vishal Dadlani Vishal Bhardwaj"},
    {"title": "Qaafirana", "artist": "Arijit Singh, Nikhita Gandhi", "year": "2018", "hookStartSec": 38, "energy": 8, "query": "Qaafirana Kedarnath Sushant Singh Rajput Sara Ali Khan Arijit Singh"},
    {"title": "Jaan 'Nisaar", "artist": "Arijit Singh", "year": "2018", "hookStartSec": 42, "energy": 8, "query": "Jaan Nisaar Kedarnath Arijit Singh Amit Trivedi"},
    {"title": "Man Kunto Maula", "artist": "Shadab Faridi, Altamash Faridi", "year": "2014", "hookStartSec": 40, "energy": 9, "query": "Man Kunto Maula Gunday Ranveer Singh Arjun Kapoor Sohail Sen"},
    {"title": "Jiya Re", "artist": "Neeti Mohan, AR Rahman", "year": "2012", "hookStartSec": 38, "energy": 9, "query": "Jiya Re Jab Tak Hai Jaan Neeti Mohan Anushka Sharma AR Rahman"},
    {"title": "Saans", "artist": "Shreya Ghoshal, Mohit Chauhan", "year": "2012", "hookStartSec": 40, "energy": 8, "query": "Saans Jab Tak Hai Jaan Shah Rukh Khan Katrina Kaif AR Rahman"},
    {"title": "Zariya", "artist": "AR Rahman, Farah Siraj, Ani Choying Drolma", "year": "2013", "hookStartSec": 45, "energy": 9, "query": "Zariya AR Rahman Coke Studio MTV Season 3"},
    {"title": "Aao Balma", "artist": "AR Rahman, Ustad Ghulam Mustafa Khan", "year": "2013", "hookStartSec": 48, "energy": 8, "query": "Aao Balma AR Rahman Coke Studio MTV Season 3"},
    {"title": "Soz O Salam", "artist": "AR Rahman", "year": "2013", "hookStartSec": 50, "energy": 8, "query": "Soz O Salam AR Rahman Coke Studio MTV"},
    {"title": "Noor-Un-Ala-Noor", "artist": "AR Rahman, Murtuza Khan, Qadir Khan", "year": "2004", "hookStartSec": 45, "energy": 8, "query": "Noor Un Ala Noor Meenaxi AR Rahman official"},
    {"title": "Rehna Tu", "artist": "AR Rahman", "year": "2009", "hookStartSec": 44, "energy": 8, "query": "Rehna Tu Delhi-6 AR Rahman Abhishek Bachchan"},
    {"title": "Dil Gira Dafatan", "artist": "Ash King, AR Rahman", "year": "2009", "hookStartSec": 40, "energy": 8, "query": "Dil Gira Dafatan Delhi-6 AR Rahman Ash King"},
    {"title": "Khalbali", "artist": "AR Rahman, Mohammed Aslam, Nacim", "year": "2006", "hookStartSec": 38, "energy": 9, "query": "Khalbali Rang De Basanti AR Rahman Aamir Khan"},
    {"title": "Ay Hairathe", "artist": "Hariharan, Alka Yagnik, AR Rahman", "year": "2007", "hookStartSec": 44, "energy": 8, "query": "Ay Hairathe Guru AR Rahman Hariharan Abhishek Aishwarya"},
    {"title": "Mayya Mayya", "artist": "Maryem Tollar, Chinmayi, Keerthi Sagathia, AR Rahman", "year": "2007", "hookStartSec": 36, "energy": 9, "query": "Mayya Mayya Guru Mallika Sherawat AR Rahman"},
    {"title": "Tu Mun Shudi", "artist": "AR Rahman, Rabbi Shergill", "year": "2013", "hookStartSec": 42, "energy": 9, "query": "Tu Mun Shudi Raanjhanaa AR Rahman Rabbi Shergill Dhanush"},
    {"title": "Nazar Laaye", "artist": "Rashid Ali, Neeti Mohan, AR Rahman", "year": "2013", "hookStartSec": 38, "energy": 8, "query": "Nazar Laaye Raanjhanaa AR Rahman Rashid Ali Neeti Mohan"},
    {"title": "Ay Sakhi", "artist": "Sukhwinder Singh, AR Rahman", "year": "2013", "hookStartSec": 40, "energy": 9, "query": "Ay Sakhi Raanjhanaa AR Rahman Sukhwinder Singh"},
    {"title": "Chandni Raat", "artist": "Ali Sethi", "year": "2019", "hookStartSec": 45, "energy": 8, "query": "Chandni Raat Ali Sethi official music video"},
    {"title": "Ranjish Hi Sahi", "artist": "Ali Sethi", "year": "2017", "hookStartSec": 48, "energy": 8, "query": "Ranjish Hi Sahi Ali Sethi Coke Studio Season 10"},
    {"title": "Dil Lagaayein", "artist": "Ali Sethi", "year": "2019", "hookStartSec": 42, "energy": 8, "query": "Dil Lagaayein Ali Sethi official song"},
    {"title": "Sammi Meri Waar", "artist": "Umair Jaswal, Quratulain Balouch", "year": "2015", "hookStartSec": 40, "energy": 9, "query": "Sammi Meri Waar Umair Jaswal Quratulain Balouch Coke Studio Season 8"},
    {"title": "Wohi Khuda Hai", "artist": "Atif Aslam", "year": "2019", "hookStartSec": 50, "energy": 8, "query": "Wohi Khuda Hai Atif Aslam Coke Studio Season 12"},
    {"title": "Kadi Te Has Bol", "artist": "Atif Aslam", "year": "2020", "hookStartSec": 38, "energy": 9, "query": "Kadi Te Has Bol Atif Aslam Velo Sound Station"},
    {"title": "Man Aamadeh Am", "artist": "Atif Aslam, Gul Panrra", "year": "2015", "hookStartSec": 45, "energy": 8, "query": "Man Aamadeh Am Atif Aslam Gul Panrra Coke Studio Season 8"},
    {"title": "Tu Kuja Man Kuja", "artist": "Shiraz Uppal, Rafaqat Ali Khan", "year": "2016", "hookStartSec": 48, "energy": 8, "query": "Tu Kuja Man Kuja Shiraz Uppal Rafaqat Ali Khan Coke Studio Season 9"},
    {"title": "Paar Chanaa De", "artist": "Shilpa Rao, Noori", "year": "2016", "hookStartSec": 45, "energy": 8, "query": "Paar Chanaa De Shilpa Rao Noori Coke Studio Season 9"},
    {"title": "Faasle", "artist": "Kaavish, Quratulain Balouch", "year": "2017", "hookStartSec": 42, "energy": 8, "query": "Faasle Kaavish Quratulain Balouch Coke Studio Season 10"},
    {"title": "Ghoom Charakhana", "artist": "Ali Zafar", "year": "2010", "hookStartSec": 45, "energy": 8, "query": "Ghoom Charakhana Ali Zafar Coke Studio"},
    {"title": "Dastan-e-Ishq", "artist": "Ali Zafar", "year": "2009", "hookStartSec": 42, "energy": 8, "query": "Dastan-e-Ishq Ali Zafar Coke Studio"},
    {"title": "Yar Dhadhi", "artist": "Ali Zafar", "year": "2009", "hookStartSec": 40, "energy": 8, "query": "Yar Dhadhi Ali Zafar Coke Studio"},
    {"title": "Madhubala", "artist": "Amit Trivedi", "year": "2020", "hookStartSec": 35, "energy": 8, "query": "Madhubala Amit Trivedi official video"},
    {"title": "Naina Da Kya Kasoor", "artist": "Amit Trivedi", "year": "2018", "hookStartSec": 38, "energy": 9, "query": "Naina Da Kya Kasoor Andhadhun Ayushmann Khurrana Amit Trivedi"},
    {"title": "Daak Ticket", "artist": "Javed Bashir, Mohit Chauhan", "year": "2015", "hookStartSec": 42, "energy": 8, "query": "Daak Ticket Hawaizaada Ayushmann Khurrana Javed Bashir"},
    {"title": "Saibo", "artist": "Shreya Ghoshal, Tochi Raina", "year": "2011", "hookStartSec": 40, "energy": 8, "query": "Saibo Shor in the City Shreya Ghoshal Tochi Raina"},
    {"title": "Gal Mitthi Mitthi", "artist": "Tochi Raina", "year": "2010", "hookStartSec": 38, "energy": 9, "query": "Gal Mitthi Mitthi Aisha Tochi Raina Amit Trivedi Sonam Kapoor"},
    {"title": "Iktara Male Version", "artist": "Tochi Raina", "year": "2009", "hookStartSec": 44, "energy": 8, "query": "Iktara Male Version Wake Up Sid Tochi Raina Ranbir Kapoor"},
    {"title": "Genda Phool", "artist": "Rekha Bhardwaj", "year": "2009", "hookStartSec": 35, "energy": 9, "query": "Sasural Genda Phool Delhi-6 Rekha Bhardwaj AR Rahman"},
    {"title": "Phir Le Aya Dil", "artist": "Rekha Bhardwaj", "year": "2012", "hookStartSec": 45, "energy": 8, "query": "Phir Le Aya Dil Barfi Rekha Bhardwaj Pritam Ranbir Kapoor"},
    {"title": "Ranjha Ranjha", "artist": "Rekha Bhardwaj, Javed Ali, AR Rahman", "year": "2010", "hookStartSec": 40, "energy": 9, "query": "Ranjha Ranjha Raavan AR Rahman Rekha Bhardwaj Abhishek Aishwarya"},
    {"title": "Thok De Killi", "artist": "Sukhwinder Singh", "year": "2010", "hookStartSec": 38, "energy": 9, "query": "Thok De Killi Raavan Sukhwinder Singh AR Rahman"},
    {"title": "Beera Beera", "artist": "Vijay Prakash, Mustafa Kutoane, Keerthi Sagathia", "year": "2010", "hookStartSec": 35, "energy": 9, "query": "Beera Raavan Abhishek Bachchan AR Rahman"},
    {"title": "Tere Naina", "artist": "Shafqat Amanat Ali", "year": "2010", "hookStartSec": 42, "energy": 8, "query": "Tere Naina My Name Is Khan Shah Rukh Khan Kajol Shafqat Amanat Ali"},
    {"title": "Khamaj", "artist": "Shafqat Amanat Ali, Fuzon", "year": "2002", "hookStartSec": 44, "energy": 8, "query": "Khamaj Fuzon Shafqat Amanat Ali official video"},
    {"title": "Ankhiyan", "artist": "Shafqat Amanat Ali, Fuzon", "year": "2002", "hookStartSec": 40, "energy": 8, "query": "Ankhiyan Fuzon Shafqat Amanat Ali"},
    {"title": "Sanware", "artist": "Rahat Fateh Ali Khan", "year": "2015", "hookStartSec": 42, "energy": 8, "query": "Sanware Phantom Rahat Fateh Ali Khan Saif Katrina"},
    {"title": "Fakeera", "artist": "Sanam Puri", "year": "2015", "hookStartSec": 40, "energy": 8, "query": "Fakeera Badlapur Varun Dhawan Sanam Puri Sachin-Jigar"},
    {"title": "Sajde", "artist": "Arijit Singh, Nihira Joshi, Gulzar", "year": "2014", "hookStartSec": 45, "energy": 8, "query": "Sajde Kill Dil Arijit Singh Ranveer Singh Parineeti Chopra"},
    {"title": "Daata Tu", "artist": "Shreya Ghoshal", "year": "2017", "hookStartSec": 45, "energy": 8, "query": "Daata Tu Tiger Zinda Hai Shreya Ghoshal Salman Khan"},
    {"title": "Tu Koi Aur Hai", "artist": "AR Rahman, Alma Ferovic, Arjun Chandy", "year": "2015", "hookStartSec": 50, "energy": 8, "query": "Tu Koi Aur Hai Tamasha AR Rahman Ranbir Kapoor Deepika"},
    {"title": "Chitta Ve", "artist": "Babu Haabi, Shahid Mallya, Bhanu Pratap", "year": "2016", "hookStartSec": 36, "energy": 10, "query": "Chitta Ve Udta Punjab Shahid Kapoor Amit Trivedi"},
    {"title": "Ikk Kudi", "artist": "Shahid Mallya, Amit Trivedi", "year": "2016", "hookStartSec": 42, "energy": 8, "query": "Ikk Kudi Udta Punjab Shahid Mallya Alia Bhatt Diljit"},
    {"title": "Hass Nache Le", "artist": "Shahid Mallya", "year": "2016", "hookStartSec": 38, "energy": 9, "query": "Hass Nache Le Udta Punjab Shahid Mallya Amit Trivedi"},
    {"title": "Daryaa", "artist": "Ammy Virk, Shahid Mallya", "year": "2018", "hookStartSec": 44, "energy": 8, "query": "Daryaa Manmarziyaan Ammy Virk Shahid Mallya Amit Trivedi"},
    {"title": "Chonch Ladhiyaan", "artist": "Harshdeep Kaur, Jazim Sharma", "year": "2018", "hookStartSec": 38, "energy": 8, "query": "Chonch Ladhiyaan Manmarziyaan Harshdeep Kaur Jazim Sharma"},
    {"title": "Halla", "artist": "Jyoti Nooran, Romi", "year": "2018", "hookStartSec": 40, "energy": 9, "query": "Halla Manmarziyaan Jyoti Nooran Romi Amit Trivedi"},
    {"title": "Sacchi Mohabbat", "artist": "Shahid Mallya, Jonita Gandhi", "year": "2018", "hookStartSec": 42, "energy": 8, "query": "Sacchi Mohabbat Manmarziyaan Shahid Mallya Jonita Gandhi"},
    {"title": "Meherbaan", "artist": "Ash King, Shilpa Rao, Shekhar Ravjiani", "year": "2014", "hookStartSec": 38, "energy": 8, "query": "Meherbaan Bang Bang Hrithik Roshan Katrina Kaif"},
    {"title": "Subhanallah", "artist": "Sreerama Chandra, Shilpa Rao", "year": "2013", "hookStartSec": 40, "energy": 8, "query": "Subhanallah Yeh Jawaani Hai Deewani Ranbir Kapoor Deepika Pritam"},
    {"title": "Tose Naina", "artist": "Arijit Singh", "year": "2013", "hookStartSec": 42, "energy": 8, "query": "Tose Naina Mickey Virus Arijit Singh official"},
    {"title": "Mar Jawan", "artist": "Shruti Pathak, Salim Merchant", "year": "2008", "hookStartSec": 40, "energy": 8, "query": "Mar Jawan Fashion Salim Sulaiman Shruti Pathak"},
    {"title": "Teri Ore", "artist": "Rahat Fateh Ali Khan, Shreya Ghoshal", "year": "2008", "hookStartSec": 42, "energy": 8, "query": "Teri Ore Singh Is Kinng Akshay Kumar Katrina Kaif Rahat Fateh Ali Khan"},
    {"title": "Aas Paas Khuda", "artist": "Rahat Fateh Ali Khan", "year": "2010", "hookStartSec": 44, "energy": 8, "query": "Aas Paas Khuda Anjaana Anjaani Rahat Fateh Ali Khan Ranbir Priyanka"},
    {"title": "Dil Toh Bachcha Hai", "artist": "Rahat Fateh Ali Khan", "year": "2010", "hookStartSec": 40, "energy": 8, "query": "Dil Toh Bachcha Hai Ji Ishqiya Rahat Fateh Ali Khan Naseeruddin Shah"},
    {"title": "Rishte Naate", "artist": "Rahat Fateh Ali Khan, Suzanne D'Mello", "year": "2009", "hookStartSec": 42, "energy": 8, "query": "Rishte Naate De Dana Dan Akshay Kumar Katrina Rahat Fateh Ali Khan"},
    {"title": "Raanjha", "artist": "B Praak, Jasleen Royal", "year": "2021", "hookStartSec": 40, "energy": 8, "query": "Ranjha Shershaah Sidharth Malhotra Kiara Advani B Praak Jasleen Royal"},
    {"title": "Mann Bharryaa 2.0", "artist": "B Praak", "year": "2021", "hookStartSec": 45, "energy": 9, "query": "Mann Bharryaa 2.0 Shershaah B Praak Sidharth Malhotra Kiara Advani"},
    {"title": "Teri Mitti", "artist": "B Praak", "year": "2019", "hookStartSec": 45, "energy": 9, "query": "Teri Mitti Kesari Akshay Kumar B Praak Arko"},
    {"title": "Filhall", "artist": "B Praak", "year": "2019", "hookStartSec": 42, "energy": 8, "query": "Filhall B Praak Akshay Kumar Nupur Sanon official music video"},
    {"title": "Dholna", "artist": "B Praak", "year": "2018", "hookStartSec": 40, "energy": 9, "query": "Dholna Qismat Ammy Virk Sargun Mehta B Praak"},
    {"title": "Qismat", "artist": "Ammy Virk, B Praak", "year": "2017", "hookStartSec": 42, "energy": 9, "query": "Qismat Ammy Virk Sargun Mehta B Praak Jaani"},
    {"title": "Besharam Bewaffa", "artist": "B Praak", "year": "2020", "hookStartSec": 40, "energy": 8, "query": "Besharam Bewaffa B Praak Divya Khosla Kumar Jaani"},
    {"title": "Baarish Ki Jaaye", "artist": "B Praak", "year": "2021", "hookStartSec": 38, "energy": 8, "query": "Baarish Ki Jaaye B Praak Nawazuddin Siddiqui Sunanda Sharma"},
    {"title": "Din Shagna Da", "artist": "Jasleen Royal", "year": "2017", "hookStartSec": 35, "energy": 8, "query": "Din Shagna Da Phillauri Jasleen Royal Anushka Sharma"},
    {"title": "Kho Gaye Hum Kahan", "artist": "Jasleen Royal, Prateek Kuhad", "year": "2016", "hookStartSec": 36, "energy": 8, "query": "Kho Gaye Hum Kahan Baar Baar Dekho Jasleen Royal Prateek Kuhad"},
    {"title": "Cold/Mess", "artist": "Prateek Kuhad", "year": "2018", "hookStartSec": 38, "energy": 8, "query": "Cold/Mess Prateek Kuhad official music video"},
    {"title": "Kasoor", "artist": "Prateek Kuhad", "year": "2020", "hookStartSec": 36, "energy": 8, "query": "Kasoor Prateek Kuhad official music video"},
    {"title": "Baarishein", "artist": "Anuv Jain", "year": "2018", "hookStartSec": 42, "energy": 8, "query": "Baarishein Anuv Jain official studio video"},
    {"title": "Alag Aasmaan", "artist": "Anuv Jain", "year": "2020", "hookStartSec": 38, "energy": 8, "query": "Alag Aasmaan Anuv Jain official video"},
    {"title": "Husn", "artist": "Anuv Jain", "year": "2023", "hookStartSec": 40, "energy": 8, "query": "Husn Anuv Jain official music video"},
    {"title": "Gul", "artist": "Anuv Jain", "year": "2021", "hookStartSec": 38, "energy": 8, "query": "Gul Anuv Jain official music video"},
    {"title": "Mishri", "artist": "Anuv Jain", "year": "2020", "hookStartSec": 36, "energy": 8, "query": "Mishri Anuv Jain official studio track"},
    {"title": "Rihaayi", "artist": "Paradox", "year": "2022", "hookStartSec": 35, "energy": 8, "query": "Rihaayi Paradox MTV Hustle 2.0 official video"},
    {"title": "Mora Piya", "artist": "Aadesh Shrivastava", "year": "2010", "hookStartSec": 42, "energy": 9, "query": "Mora Piya Raajneeti Aadesh Shrivastava Katrina Ranbir"},
    {"title": "Piya Ke Rang", "artist": "Kailash Kher, Kailasa", "year": "2012", "hookStartSec": 40, "energy": 8, "query": "Piya Ke Rang Kailash Kher Rangeele official"}
]

HIPHOP_CANDIDATES = [
    {"title": "Farak", "artist": "DIVINE", "year": "2017", "hookStartSec": 35, "energy": 10, "query": "DIVINE - Farak official music video"},
    {"title": "Jungli Sher", "artist": "DIVINE", "year": "2016", "hookStartSec": 38, "energy": 10, "query": "DIVINE - Jungli Sher official video Apple Music"},
    {"title": "One Side", "artist": "DIVINE", "year": "2019", "hookStartSec": 40, "energy": 9, "query": "DIVINE - One Side Kohinoor official audio"},
    {"title": "Teesri Manzil", "artist": "DIVINE", "year": "2019", "hookStartSec": 35, "energy": 9, "query": "DIVINE - Teesri Manzil official video Kohinoor"},
    {"title": "Gandhi Money", "artist": "DIVINE", "year": "2019", "hookStartSec": 36, "energy": 10, "query": "DIVINE - Gandhi Money Kohinoor official audio"},
    {"title": "Wallah", "artist": "DIVINE", "year": "2019", "hookStartSec": 38, "energy": 9, "query": "DIVINE - Wallah official video"},
    {"title": "Akela", "artist": "DIVINE", "year": "2022", "hookStartSec": 40, "energy": 9, "query": "DIVINE - Akela official music video Gunehgar"},
    {"title": "Bornfire", "artist": "DIVINE ft. Russ", "year": "2022", "hookStartSec": 35, "energy": 9, "query": "DIVINE - Bornfire ft Russ official video Gunehgar"},
    {"title": "Rider", "artist": "DIVINE ft. Lisa Mishra", "year": "2020", "hookStartSec": 36, "energy": 9, "query": "DIVINE - Rider ft Lisa Mishra official video Punya Paap"},
    {"title": "Sitara", "artist": "DIVINE ft. Jonita Gandhi", "year": "2022", "hookStartSec": 40, "energy": 9, "query": "DIVINE - Sitara ft Jonita Gandhi official video Gunehgar"},
    {"title": "Chal Par", "artist": "DIVINE", "year": "2020", "hookStartSec": 38, "energy": 9, "query": "DIVINE - Chal Par official video Punya Paap"},
    {"title": "Punya Paap", "artist": "DIVINE", "year": "2020", "hookStartSec": 42, "energy": 10, "query": "DIVINE - Punya Paap official music video"},
    {"title": "Street Lori", "artist": "DIVINE ft. Wazir Patar", "year": "2022", "hookStartSec": 36, "energy": 9, "query": "DIVINE - Street Lori ft Wazir Patar official video Gunehgar"},
    {"title": "Top 5 D.O.A.", "artist": "DIVINE", "year": "2020", "hookStartSec": 35, "energy": 9, "query": "DIVINE - Top 5 D.O.A. official video Punya Paap"},
    {"title": "4.10", "artist": "DIVINE, Sidhu Moose Wala", "year": "2024", "hookStartSec": 40, "energy": 10, "query": "DIVINE Sidhu Moose Wala 4.10 official video"},
    {"title": "Chorni", "artist": "DIVINE, Sidhu Moose Wala", "year": "2023", "hookStartSec": 38, "energy": 10, "query": "Chorni Sidhu Moose Wala DIVINE official video"},
    {"title": "101", "artist": "Seedhe Maut", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Seedhe Maut - 101 official video"},
    {"title": "Scalp Dem", "artist": "Seedhe Maut ft. Delhi Sultanate", "year": "2020", "hookStartSec": 38, "energy": 9, "query": "Seedhe Maut Scalp Dem official video"},
    {"title": "Class-Sikh Maut Vol II", "artist": "Seedhe Maut, Prabh Deep", "year": "2018", "hookStartSec": 45, "energy": 10, "query": "Seedhe Maut Prabh Deep Class-Sikh Maut Vol II official"},
    {"title": "Pankh", "artist": "Seedhe Maut", "year": "2019", "hookStartSec": 40, "energy": 9, "query": "Seedhe Maut - Pankh official video Bayaan"},
    {"title": "Dum Ghutte", "artist": "Seedhe Maut", "year": "2022", "hookStartSec": 36, "energy": 9, "query": "Seedhe Maut - Dum Ghutte official video Nayaab"},
    {"title": "Keh Chuka", "artist": "Seedhe Maut", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Seedhe Maut - Keh Chuka official video Nayaab"},
    {"title": "Baat Aisi Hai", "artist": "Seedhe Maut", "year": "2022", "hookStartSec": 40, "energy": 9, "query": "Seedhe Maut - Baat Aisi Hai official video Nayaab"},
    {"title": "Do Guna", "artist": "Seedhe Maut", "year": "2021", "hookStartSec": 35, "energy": 10, "query": "Seedhe Maut - Do Guna official video"},
    {"title": "Anaadi", "artist": "Seedhe Maut", "year": "2022", "hookStartSec": 36, "energy": 9, "query": "Seedhe Maut - Anaadi official video Nayaab"},
    {"title": "Gandi Aulaad", "artist": "Seedhe Maut", "year": "2022", "hookStartSec": 38, "energy": 10, "query": "Seedhe Maut - Gandi Aulaad official video Nayaab"},
    {"title": "Hausla", "artist": "Seedhe Maut", "year": "2022", "hookStartSec": 40, "energy": 9, "query": "Seedhe Maut - Hausla official video Nayaab"},
    {"title": "Maina", "artist": "Seedhe Maut", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Seedhe Maut - Maina official video Nayaab"},
    {"title": "Brand New", "artist": "Seedhe Maut, Bharg", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "Seedhe Maut Brand New Lunch Break official video"},
    {"title": "Kodfe", "artist": "Seedhe Maut", "year": "2023", "hookStartSec": 36, "energy": 9, "query": "Seedhe Maut - Kodfe Lunch Break official video"},
    {"title": "Na Jaaye", "artist": "Seedhe Maut", "year": "2021", "hookStartSec": 40, "energy": 9, "query": "Seedhe Maut - Na Jaaye official video"},
    {"title": "Swah", "artist": "Seedhe Maut", "year": "2023", "hookStartSec": 38, "energy": 10, "query": "Seedhe Maut - Swah Lunch Break official video"},
    {"title": "Chup", "artist": "Seedhe Maut", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "Seedhe Maut - Chup Nayaab official video"},
    {"title": "Lukka Chippi", "artist": "Seedhe Maut", "year": "2023", "hookStartSec": 36, "energy": 10, "query": "Seedhe Maut - Lukka Chippi Lunch Break official video"},
    {"title": "Shutdown", "artist": "Seedhe Maut", "year": "2023", "hookStartSec": 38, "energy": 10, "query": "Seedhe Maut - Shutdown official video"},
    {"title": "Kavi", "artist": "Seedhe Maut", "year": "2023", "hookStartSec": 40, "energy": 9, "query": "Seedhe Maut - Kavi Lunch Break official video"},
    {"title": "Vyanjan", "artist": "KR$NA", "year": "2016", "hookStartSec": 35, "energy": 10, "query": "KR$NA - Vyanjan official music video"},
    {"title": "Untitled", "artist": "KR$NA", "year": "2020", "hookStartSec": 38, "energy": 10, "query": "KR$NA - Untitled official video"},
    {"title": "Seedha Makeover", "artist": "KR$NA", "year": "2019", "hookStartSec": 40, "energy": 10, "query": "KR$NA - Seedha Makeover official video"},
    {"title": "Say My Name", "artist": "KR$NA", "year": "2020", "hookStartSec": 36, "energy": 10, "query": "KR$NA - Say My Name official music video"},
    {"title": "Fall Off", "artist": "KR$NA", "year": "2021", "hookStartSec": 38, "energy": 10, "query": "KR$NA - Fall Off official music video Still Here"},
    {"title": "Blow Up", "artist": "KR$NA", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "KR$NA - Blow Up official video"},
    {"title": "Wanna Know", "artist": "KR$NA", "year": "2023", "hookStartSec": 36, "energy": 9, "query": "KR$NA - Wanna Know official music video Far From Over"},
    {"title": "Still Here (Intro)", "artist": "KR$NA", "year": "2021", "hookStartSec": 35, "energy": 10, "query": "KR$NA - Still Here Intro official audio"},
    {"title": "Living Legend", "artist": "KR$NA ft. Rashmeet Kaur", "year": "2021", "hookStartSec": 40, "energy": 10, "query": "KR$NA - Living Legend ft Rashmeet Kaur official video Still Here"},
    {"title": "Zaruri Nahi", "artist": "KR$NA", "year": "2021", "hookStartSec": 38, "energy": 9, "query": "KR$NA - Zaruri Nahi official video"},
    {"title": "Time Will Tell", "artist": "KR$NA", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "KR$NA - Time Will Tell official audio EP"},
    {"title": "Farak Nahi Padta", "artist": "KR$NA", "year": "2019", "hookStartSec": 38, "energy": 9, "query": "KR$NA - Farak Nahi Padta official video"},
    {"title": "Aage Chal", "artist": "Raftaar", "year": "2019", "hookStartSec": 35, "energy": 9, "query": "Raftaar - Aage Chal official music video"},
    {"title": "Drama", "artist": "Raftaar", "year": "2020", "hookStartSec": 36, "energy": 10, "query": "Raftaar - Drama official video Mr Nair"},
    {"title": "Naachne Ka Malket", "artist": "Raftaar", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Raftaar - Naachne Ka Malket official video"},
    {"title": "Microfone Check", "artist": "Raftaar", "year": "2021", "hookStartSec": 38, "energy": 10, "query": "Raftaar - Microphone Check official video"},
    {"title": "Sheikh Chilli", "artist": "Raftaar", "year": "2018", "hookStartSec": 40, "energy": 10, "query": "Raftaar - Sheikh Chilli official music video"},
    {"title": "Anime Hentai", "artist": "Raftaar", "year": "2021", "hookStartSec": 36, "energy": 10, "query": "Raftaar - Anime Hentai official audio"},
    {"title": "GOAT", "artist": "Raftaar", "year": "2021", "hookStartSec": 35, "energy": 10, "query": "Raftaar - GOAT official music video"},
    {"title": "Shringaar", "artist": "Raftaar, Akasa, Aastha Gill", "year": "2022", "hookStartSec": 38, "energy": 10, "query": "Shringaar Akasa Aastha Gill Raftaar official video Sony Music"},
    {"title": "Phone Mila Ke", "artist": "Raftaar, Akasa", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "Phone Mila Ke Raftaar Akasa official music video"},
    {"title": "Sanak", "artist": "Badshah", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "Badshah - Sanak official music video 3:00 AM Sessions"},
    {"title": "Players", "artist": "Badshah, Karan Aujla", "year": "2022", "hookStartSec": 36, "energy": 10, "query": "Badshah x Karan Aujla - Players official music video"},
    {"title": "Daaku", "artist": "Badshah, Sharvi Yadav", "year": "2024", "hookStartSec": 35, "energy": 10, "query": "Badshah - Daaku official music video Ek Tha Raja"},
    {"title": "Soulmate", "artist": "Badshah, Arijit Singh", "year": "2024", "hookStartSec": 40, "energy": 9, "query": "Badshah Arijit Singh Soulmate official video Ek Tha Raja"},
    {"title": "Voodoo", "artist": "Badshah, J Balvin, Tainy", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "Badshah J Balvin Tainy Voodoo official music video"},
    {"title": "Therapy", "artist": "Badshah", "year": "2018", "hookStartSec": 40, "energy": 9, "query": "Badshah - Therapy official video ONE album"},
    {"title": "Illzaam", "artist": "Badshah", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Badshah - Illzaam official music video Retropanda"},
    {"title": "Demon", "artist": "Ikka", "year": "2021", "hookStartSec": 35, "energy": 10, "query": "Ikka - Demon official music video"},
    {"title": "Maa", "artist": "Ikka", "year": "2021", "hookStartSec": 40, "energy": 9, "query": "Ikka - Maa official music video"},
    {"title": "Nishu", "artist": "Ikka", "year": "2022", "hookStartSec": 36, "energy": 10, "query": "Ikka - Nishu official title track video"},
    {"title": "Shuruwat", "artist": "Ikka", "year": "2022", "hookStartSec": 35, "energy": 9, "query": "Ikka - Shuruwat official video Nishu"},
    {"title": "Sab Jaanta Hai", "artist": "Ikka", "year": "2022", "hookStartSec": 38, "energy": 10, "query": "Ikka - Sab Jaanta Hai official video Nishu"},
    {"title": "Interview", "artist": "Ikka", "year": "2020", "hookStartSec": 36, "energy": 9, "query": "Ikka - Interview official video I album"},
    {"title": "Dhoop Chhaon", "artist": "Ikka ft. Rawal", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Ikka Rawal Dhoop Chhaon official video Nishu"},
    {"title": "Firse Machayenge", "artist": "Emiway Bantai", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Emiway Bantai - Firse Machayenge official music video"},
    {"title": "Khatam Hue Vande", "artist": "Emiway Bantai", "year": "2020", "hookStartSec": 38, "energy": 10, "query": "Emiway Bantai - Khatam Hue Vande official video"},
    {"title": "Giraftaar", "artist": "Emiway Bantai", "year": "2018", "hookStartSec": 36, "energy": 10, "query": "Emiway Bantai - Giraftaar official music video"},
    {"title": "Bantai Ki Public", "artist": "Emiway Bantai", "year": "2021", "hookStartSec": 35, "energy": 10, "query": "Emiway Bantai - Bantai Ki Public official video Maloom Hai Na"},
    {"title": "Chhod Diya", "artist": "Emiway Bantai", "year": "2021", "hookStartSec": 40, "energy": 9, "query": "Emiway Bantai - Chhod Diya official music video"},
    {"title": "Kaha Par Hu", "artist": "Emiway Bantai", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Emiway Bantai - Kaha Par Hu official music video"},
    {"title": "Kaun Hai Ye", "artist": "Emiway Bantai", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Emiway Bantai - Kaun Hai Ye official music video"},
    {"title": "Jump Kar", "artist": "Emiway Bantai", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Emiway Bantai - Jump Kar official music video"},
    {"title": "Round One", "artist": "Emiway Bantai", "year": "2020", "hookStartSec": 36, "energy": 10, "query": "Emiway Bantai - Round One official video"},
    {"title": "Good Boy", "artist": "Emiway Bantai", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "Emiway Bantai - Good Boy official music video KOTS"},
    {"title": "Kots", "artist": "Emiway Bantai", "year": "2023", "hookStartSec": 38, "energy": 10, "query": "Emiway Bantai - King of the Streets KOTS title track"},
    {"title": "Wata", "artist": "MC Stan", "year": "2018", "hookStartSec": 35, "energy": 10, "query": "MC Stan - Wata official music video"},
    {"title": "Khuja Mat", "artist": "MC Stan", "year": "2019", "hookStartSec": 36, "energy": 10, "query": "MC Stan - Khuja Mat official music video"},
    {"title": "Yedi Banti", "artist": "MC Stan", "year": "2019", "hookStartSec": 38, "energy": 10, "query": "MC Stan - Yedi Banti official video"},
    {"title": "Astagfirullah", "artist": "MC Stan", "year": "2019", "hookStartSec": 42, "energy": 9, "query": "MC Stan - Astagfirullah official music video"},
    {"title": "Lowkey", "artist": "MC Stan", "year": "2020", "hookStartSec": 38, "energy": 9, "query": "MC Stan - Lowkey Tadipaar official audio"},
    {"title": "Regret", "artist": "MC Stan", "year": "2022", "hookStartSec": 36, "energy": 9, "query": "MC Stan - Regret Insaan official video"},
    {"title": "Shana Bann", "artist": "MC Stan", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "MC Stan - Shana Bann official video Insaan"},
    {"title": "Bitch", "artist": "MC Stan", "year": "2022", "hookStartSec": 35, "energy": 9, "query": "MC Stan - Bitch Insaan official audio"},
    {"title": "Broke Is A Joke", "artist": "MC Stan", "year": "2021", "hookStartSec": 36, "energy": 10, "query": "MC Stan - Broke Is A Joke official music video"},
    {"title": "Urvashi", "artist": "MC Stan", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "MC Stan - Urvashi official music video"},
    {"title": "Haath Varthi", "artist": "MC Stan, KSHMR", "year": "2023", "hookStartSec": 36, "energy": 10, "query": "KSHMR MC Stan Haath Varthi official music video Karam"},
    {"title": "Go To Sleep", "artist": "Hanumankind", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "Hanumankind - Go To Sleep official video"},
    {"title": "Rush Hour", "artist": "Hanumankind", "year": "2024", "hookStartSec": 36, "energy": 10, "query": "Hanumankind - Rush Hour official music video"},
    {"title": "Genghis", "artist": "Hanumankind", "year": "2021", "hookStartSec": 35, "energy": 10, "query": "Hanumankind - Genghis official music video"},
    {"title": "Damnson", "artist": "Hanumankind", "year": "2021", "hookStartSec": 38, "energy": 10, "query": "Hanumankind - Damnson official music video"},
    {"title": "Southside", "artist": "Hanumankind", "year": "2020", "hookStartSec": 36, "energy": 10, "query": "Hanumankind - Southside official video"},
    {"title": "The Last Dance", "artist": "Hanumankind", "year": "2024", "hookStartSec": 35, "energy": 10, "query": "Hanumankind - The Last Dance official video"},
    {"title": "Dracula", "artist": "King", "year": "2020", "hookStartSec": 38, "energy": 9, "query": "King - Dracula The Carnival official video"},
    {"title": "Me & Me", "artist": "King", "year": "2022", "hookStartSec": 36, "energy": 9, "query": "King - Me & Me Champagne Talk official video"},
    {"title": "IConic", "artist": "King", "year": "2021", "hookStartSec": 35, "energy": 10, "query": "King - IConic official music video"},
    {"title": "Sarkaare", "artist": "King", "year": "2023", "hookStartSec": 36, "energy": 10, "query": "King - Sarkaare New Life official video"},
    {"title": "Ilzaam", "artist": "King", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "King - Ilzaam Champagne Talk official video"},
    {"title": "Baazi", "artist": "King", "year": "2020", "hookStartSec": 36, "energy": 9, "query": "King - Baazi The Carnival official audio"},
    {"title": "Gumshuda", "artist": "King", "year": "2020", "hookStartSec": 38, "energy": 8, "query": "King - Gumshuda official music video"},
    {"title": "Ghumakkad", "artist": "King", "year": "2021", "hookStartSec": 35, "energy": 9, "query": "King - Ghumakkad official video"},
    {"title": "Legends", "artist": "King", "year": "2023", "hookStartSec": 36, "energy": 10, "query": "King - Legends New Life official video"},
    {"title": "Bhot Tej", "artist": "Fotty Seven ft. Badshah", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Fotty Seven Badshah Bhot Tej official video"},
    {"title": "Pagal Hai Kya", "artist": "Fotty Seven", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Fotty Seven - Pagal Hai Kya official music video"},
    {"title": "Kar Lenge Bhai", "artist": "Fotty Seven", "year": "2021", "hookStartSec": 36, "energy": 9, "query": "Fotty Seven - Kar Lenge Bhai official video"},
    {"title": "Chal Nikal", "artist": "Fotty Seven", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Fotty Seven - Chal Nikal official music video"},
    {"title": "Confessions", "artist": "Fotty Seven", "year": "2021", "hookStartSec": 38, "energy": 9, "query": "Fotty Seven - Confessions official video"},
    {"title": "You Got This", "artist": "Fotty Seven", "year": "2022", "hookStartSec": 35, "energy": 9, "query": "Fotty Seven - You Got This official video"},
    {"title": "Khoya Sab", "artist": "Bella", "year": "2020", "hookStartSec": 40, "energy": 9, "query": "Bella - Khoya Sab official music video"},
    {"title": "UFO", "artist": "Bella", "year": "2021", "hookStartSec": 36, "energy": 9, "query": "Bella - UFO official music video"},
    {"title": "Raakh", "artist": "Bella", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Bella - Raakh official music video"},
    {"title": "Space Cadet", "artist": "Bella", "year": "2021", "hookStartSec": 35, "energy": 9, "query": "Bella - Space Cadet official video"},
    {"title": "Beast Inside", "artist": "Bella", "year": "2022", "hookStartSec": 36, "energy": 10, "query": "Bella - Beast Inside official audio"},
    {"title": "Main Bas Kehna Chahta Hoon", "artist": "Bella", "year": "2021", "hookStartSec": 40, "energy": 9, "query": "Bella - Main Bas Kehna Chahta Hoon official video"},
    {"title": "Dhoondhe Sab", "artist": "Bella", "year": "2023", "hookStartSec": 36, "energy": 9, "query": "Bella - Dhoondhe Sab official video"},
    {"title": "1 Se 23", "artist": "Karma", "year": "2019", "hookStartSec": 35, "energy": 9, "query": "Karma - 1 Se 23 official video Kalamkaar"},
    {"title": "Karma", "artist": "Karma", "year": "2020", "hookStartSec": 38, "energy": 10, "query": "Karma - Karma official music video Kalamkaar"},
    {"title": "I Get It", "artist": "Karma", "year": "2021", "hookStartSec": 35, "energy": 9, "query": "Karma - I Get It official music video"},
    {"title": "Warm Up", "artist": "Karma", "year": "2020", "hookStartSec": 36, "energy": 9, "query": "Karma - Warm Up official video Kalamkaar"},
    {"title": "Narmahat Anthem", "artist": "Karma", "year": "2021", "hookStartSec": 35, "energy": 10, "query": "Karma - Narmahat Anthem official video"},
    {"title": "Glitch", "artist": "Paradox", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "Paradox - Glitch MTV Hustle 2.0 official video"},
    {"title": "Badmash Chora", "artist": "MC Square", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "MC Square - Badmash Chora MTV Hustle 2.0 official video"},
    {"title": "2 Woofer", "artist": "MC Square", "year": "2023", "hookStartSec": 36, "energy": 10, "query": "MC Square - 2 Woofer official music video"},
    {"title": "Naina Ki Talwar", "artist": "MC Square", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "MC Square - Naina Ki Talwar MTV Hustle 2.0"},
    {"title": "Chehre", "artist": "MC Square", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "MC Square - Chehre MTV Hustle 2.0"},
    {"title": "UP Se", "artist": "Panther", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "Panther - UP Se MTV Hustle 2.0 official video"},
    {"title": "Galat Karam", "artist": "Panther", "year": "2023", "hookStartSec": 36, "energy": 10, "query": "Panther - Galat Karam official music video"},
    {"title": "Parinda", "artist": "Panther", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Panther - Parinda MTV Hustle 2.0 official video"},
    {"title": "Dard-E-Dil", "artist": "Panther", "year": "2022", "hookStartSec": 40, "energy": 9, "query": "Panther - Dard-E-Dil MTV Hustle 2.0"},
    {"title": "Jalaluddin", "artist": "Gravity", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "Gravity - Jalaluddin MTV Hustle 2.0 official video"},
    {"title": "Pop Smoke", "artist": "Gravity", "year": "2022", "hookStartSec": 36, "energy": 10, "query": "Gravity - Pop Smoke MTV Hustle 2.0"},
    {"title": "Puthi Sawaar", "artist": "Gravity", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "Gravity - Puthi Sawaar MTV Hustle 2.0"},
    {"title": "Sarkaar", "artist": "Gravity", "year": "2023", "hookStartSec": 38, "energy": 10, "query": "Gravity - Sarkaar official music video"},
    {"title": "Girlfriend", "artist": "Dino James", "year": "2017", "hookStartSec": 40, "energy": 9, "query": "Dino James - Girlfriend official music video"},
    {"title": "Yaadein", "artist": "Dino James", "year": "2018", "hookStartSec": 42, "energy": 9, "query": "Dino James - Yaadein official music video"},
    {"title": "Dooriyan", "artist": "Dino James ft. Kaprila", "year": "2020", "hookStartSec": 40, "energy": 9, "query": "Dino James - Dooriyan ft Kaprila official video"},
    {"title": "Pyaar Pyaar", "artist": "Dino James", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Dino James - Pyaar Pyaar official music video D album"},
    {"title": "Nidarr", "artist": "Dino James", "year": "2021", "hookStartSec": 36, "energy": 10, "query": "Dino James - Nidarr official music video"},
    {"title": "Woh", "artist": "Dino James, Ikka, Badshah", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Dino James Ikka Badshah Woh official video"},
    {"title": "Jungli Babban", "artist": "Rawal, Bharg", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Rawal Bharg Jungli Babban official video Sab Chahiye"},
    {"title": "Bombay Safari", "artist": "Rawal, Bharg", "year": "2020", "hookStartSec": 36, "energy": 9, "query": "Rawal Bharg Bombay Safari official audio Sab Chahiye"},
    {"title": "Magan", "artist": "Rawal, Bharg", "year": "2020", "hookStartSec": 38, "energy": 9, "query": "Rawal Bharg Magan official video Sab Chahiye"},
    {"title": "Baat Bangayi", "artist": "Rawal, Bharg", "year": "2021", "hookStartSec": 35, "energy": 9, "query": "Rawal Bharg Baat Bangayi official audio"},
    {"title": "Chudail", "artist": "Rawal, Bharg", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Rawal Bharg Chudail official video Sab Chahiye"},
    {"title": "Way Too Easy", "artist": "Brodha V ft. Raftaar", "year": "2018", "hookStartSec": 35, "energy": 10, "query": "Brodha V Raftaar Way Too Easy official video"},
    {"title": "Let Em Talk", "artist": "Brodha V", "year": "2017", "hookStartSec": 36, "energy": 10, "query": "Brodha V - Let Em Talk official music video"},
    {"title": "Class-Sikh", "artist": "Prabh Deep", "year": "2017", "hookStartSec": 35, "energy": 9, "query": "Prabh Deep - Class-Sikh album title track official"},
    {"title": "Suno", "artist": "Prabh Deep", "year": "2017", "hookStartSec": 38, "energy": 9, "query": "Prabh Deep - Suno official music video Class-Sikh"},
    {"title": "Chitta", "artist": "Prabh Deep", "year": "2020", "hookStartSec": 36, "energy": 9, "query": "Prabh Deep - Chitta official music video King"},
    {"title": "Amar", "artist": "Prabh Deep", "year": "2020", "hookStartSec": 38, "energy": 9, "query": "Prabh Deep - Amar official music video"},
    {"title": "Paapi", "artist": "Prabh Deep", "year": "2021", "hookStartSec": 35, "energy": 9, "query": "Prabh Deep - Paapi official video Tabia"},
    {"title": "Maya", "artist": "Prabh Deep", "year": "2021", "hookStartSec": 36, "energy": 9, "query": "Prabh Deep - Maya official audio Tabia"},
    {"title": "Waqaf", "artist": "Prabh Deep", "year": "2021", "hookStartSec": 38, "energy": 9, "query": "Prabh Deep - Waqaf official video Tabia"},
    {"title": "Jamnapar", "artist": "Raga", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Raga - Jamnapar official music video"},
    {"title": "Kaller", "artist": "Raga", "year": "2021", "hookStartSec": 36, "energy": 10, "query": "Raga - Kaller official music video"},
    {"title": "Do Gulaab", "artist": "Raga", "year": "2021", "hookStartSec": 38, "energy": 9, "query": "Raga - Do Gulaab official music video"},
    {"title": "Jahannum", "artist": "Raga", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Raga - Jahannum official video"},
    {"title": "Overthink", "artist": "Spectra", "year": "2022", "hookStartSec": 36, "energy": 9, "query": "Spectra - Overthink MTV Hustle 2.0 official video"},
    {"title": "Hustle Bumps", "artist": "GD 47", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "GD 47 - Hustle Bumps MTV Hustle 2.0"},
    {"title": "Sher", "artist": "EPR Iyer", "year": "2019", "hookStartSec": 38, "energy": 10, "query": "EPR Iyer - Ekla Cholo Re Sher MTV Hustle official"},
    {"title": "Q", "artist": "EPR Iyer", "year": "2022", "hookStartSec": 36, "energy": 10, "query": "EPR Iyer - Q official music video"}
]

DIWALI_CANDIDATES = [
    {"title": "Ghungroo", "artist": "Arijit Singh, Shilpa Rao, Vishal & Shekhar", "year": "2019", "hookStartSec": 45, "energy": 9, "query": "Ghungroo Song WAR Hrithik Roshan Vaani Kapoor YRF"},
    {"title": "Nashe Si Chadh Gayi", "artist": "Arijit Singh, Vishal & Shekhar", "year": "2016", "hookStartSec": 38, "energy": 9, "query": "Nashe Si Chadh Gayi Song Befikre Ranveer Singh Vaani Kapoor YRF"},
    {"title": "Jai Jai Shivshankar", "artist": "Vishal Dadlani, Benny Dayal", "year": "2019", "hookStartSec": 40, "energy": 10, "query": "Jai Jai Shivshankar Song WAR Hrithik Roshan Tiger Shroff YRF"},
    {"title": "Malhari", "artist": "Vishal Dadlani, Sanjay Leela Bhansali", "year": "2015", "hookStartSec": 42, "energy": 10, "query": "Malhari Full Video Song Bajirao Mastani Ranveer Singh Eros Now"},
    {"title": "Pinga", "artist": "Shreya Ghoshal, Vaishali Made", "year": "2015", "hookStartSec": 45, "energy": 9, "query": "Pinga Video Song Bajirao Mastani Deepika Padukone Priyanka Chopra"},
    {"title": "Gajanana", "artist": "Sukhwinder Singh", "year": "2015", "hookStartSec": 40, "energy": 10, "query": "Gajanana Bajirao Mastani Sukhwinder Singh Ranveer Singh"},
    {"title": "Deva Shree Ganesha", "artist": "Ajay Gogavale, Ajay-Atul", "year": "2012", "hookStartSec": 48, "energy": 10, "query": "Deva Shree Ganesha Agneepath Hrithik Roshan Ajay Atul Sony Music"},
    {"title": "Chikni Chameli", "artist": "Shreya Ghoshal, Ajay-Atul", "year": "2012", "hookStartSec": 42, "energy": 10, "query": "Chikni Chameli Agneepath Katrina Kaif Shreya Ghoshal Ajay Atul"},
    {"title": "Gun Gun Guna", "artist": "Udit Narayan, Sunidhi Chauhan", "year": "2012", "hookStartSec": 38, "energy": 9, "query": "Gun Gun Guna Agneepath Hrithik Roshan Priyanka Chopra"},
    {"title": "Dilbar", "artist": "Neha Kakkar, Dhvani Bhanushali, Ikka", "year": "2018", "hookStartSec": 35, "energy": 10, "query": "Dilbar Satyameva Jayate John Abraham Nora Fatehi T-Series"},
    {"title": "O Saki Saki", "artist": "Neha Kakkar, Tulsi Kumar, B Praak", "year": "2019", "hookStartSec": 36, "energy": 10, "query": "O SAKI SAKI Batla House Nora Fatehi T-Series"},
    {"title": "Illegal Weapon 2.0", "artist": "Jasmine Sandlas, Garry Sandhu", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Illegal Weapon 2.0 Street Dancer 3D Varun Shraddha T-Series"},
    {"title": "Muqabla", "artist": "Yash Narvekar, Parampara Thakur", "year": "2020", "hookStartSec": 36, "energy": 10, "query": "Muqabla Street Dancer 3D Prabhu Deva Varun Dhawan T-Series"},
    {"title": "Nachan Nu Jee Karda", "artist": "Romy, Nikhita Gandhi", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Nachan Nu Jee Karda Angrezi Medium Radhika Madan T-Series"},
    {"title": "Dance Pe Chance", "artist": "Sunidhi Chauhan, Labh Janjua", "year": "2008", "hookStartSec": 40, "energy": 9, "query": "Dance Pe Chance Rab Ne Bana Di Jodi Shah Rukh Khan Anushka Sharma"},
    {"title": "Haule Haule", "artist": "Sukhwinder Singh", "year": "2008", "hookStartSec": 38, "energy": 9, "query": "Haule Haule Rab Ne Bana Di Jodi Shah Rukh Khan Anushka YRF"},
    {"title": "Mahi Ve", "artist": "Sadhana Sargam, Sujata Bhattacharya, Udit Narayan, Sonu Nigam, Shankar Mahadevan", "year": "2003", "hookStartSec": 45, "energy": 10, "query": "Maahi Ve Kal Ho Naa Ho Shah Rukh Khan Preity Zinta Saif Sony Music"},
    {"title": "It's The Time To Disco", "artist": "Shaan, Vasundhara Das, KK, Loy Mendonsa", "year": "2003", "hookStartSec": 40, "energy": 10, "query": "Its The Time To Disco Kal Ho Naa Ho Shah Rukh Khan Preity Saif Sony Music"},
    {"title": "Pretty Woman", "artist": "Shankar Mahadevan, Ravi Khote", "year": "2003", "hookStartSec": 38, "energy": 10, "query": "Pretty Woman Kal Ho Naa Ho Shah Rukh Khan Preity Zinta Sony Music"},
    {"title": "Where's The Party Tonight", "artist": "Shankar Mahadevan, Shaan, Joi Barua, Vasundhara Das", "year": "2006", "hookStartSec": 42, "energy": 10, "query": "Wheres The Party Tonight Kabhi Alvida Naa Kehna Abhishek Preity John"},
    {"title": "Rock 'N' Roll Soniye", "artist": "Shankar Mahadevan, Shaan, Mahalaxmi Iyer", "year": "2006", "hookStartSec": 44, "energy": 10, "query": "Rock N Roll Soniye Kabhi Alvida Naa Kehna Amitabh Shah Rukh Rani Preity"},
    {"title": "Dus Bahane 2.0", "artist": "Vishal & Shekhar, KK, Shaan, Tulsi Kumar", "year": "2020", "hookStartSec": 36, "energy": 10, "query": "Dus Bahane 2.0 Baaghi 3 Tiger Shroff Shraddha Kapoor T-Series"},
    {"title": "Desi Girl", "artist": "Shankar Mahadevan, Sunidhi Chauhan, Vishal Dadlani", "year": "2008", "hookStartSec": 44, "energy": 10, "query": "Desi Girl Dostana Priyanka Chopra John Abraham Abhishek Bachchan Sony Music"},
    {"title": "Maa Da Laadla", "artist": "Master Saleem", "year": "2008", "hookStartSec": 40, "energy": 10, "query": "Maa Da Laadla Dostana Abhishek Bachchan John Abraham Sony Music"},
    {"title": "Jaane Kyun", "artist": "Vishal Dadlani", "year": "2008", "hookStartSec": 38, "energy": 9, "query": "Jaane Kyun Dostana Priyanka Chopra John Abhishek Sony Music"},
    {"title": "Dhoom Machale", "artist": "Sunidhi Chauhan", "year": "2004", "hookStartSec": 42, "energy": 10, "query": "Dhoom Machale Song Dhoom Esha Deol John Abraham Abhishek YRF"},
    {"title": "Crazy Kiya Re", "artist": "Sunidhi Chauhan", "year": "2006", "hookStartSec": 38, "energy": 10, "query": "Crazy Kiya Re Dhoom 2 Aishwarya Rai Hrithik Roshan YRF"},
    {"title": "Touch Me", "artist": "KK, Alisha Chinai", "year": "2006", "hookStartSec": 40, "energy": 9, "query": "Touch Me Dhoom 2 Bipasha Basu Uday Chopra YRF"},
    {"title": "Kamli", "artist": "Sunidhi Chauhan", "year": "2013", "hookStartSec": 36, "energy": 10, "query": "Kamli Dhoom 3 Katrina Kaif Aamir Khan Sunidhi Chauhan YRF"},
    {"title": "Malang", "artist": "Siddharth Mahadevan, Shilpa Rao", "year": "2013", "hookStartSec": 42, "energy": 10, "query": "Malang Dhoom 3 Aamir Khan Katrina Kaif YRF"},
    {"title": "Senorita", "artist": "Farhan Akhtar, Hrithik Roshan, Abhay Deol, Maria del Mar Fernández", "year": "2011", "hookStartSec": 45, "energy": 10, "query": "Senorita Zindagi Na Milegi Dobara Hrithik Katrina Farhan Abhay T-Series"},
    {"title": "Sooraj Ki Baahon Mein", "artist": "Loy Mendonsa, Dominique Cerejo, Clinton Cerejo", "year": "2011", "hookStartSec": 38, "energy": 9, "query": "Sooraj Ki Baahon Mein Zindagi Na Milegi Dobara Hrithik Katrina T-Series"},
    {"title": "Ik Junoon (Paint It Red)", "artist": "Vishal Dadlani", "year": "2011", "hookStartSec": 40, "energy": 10, "query": "Ik Junoon Paint It Red Zindagi Na Milegi Dobara Hrithik Katrina T-Series"},
    {"title": "Girls Like To Swing", "artist": "Sunidhi Chauhan", "year": "2015", "hookStartSec": 38, "energy": 10, "query": "Girls Like To Swing Dil Dhadakne Do Anushka Sharma Sunidhi Chauhan"},
    {"title": "Dil Dhadakne Do Title Track", "artist": "Priyanka Chopra, Farhan Akhtar", "year": "2015", "hookStartSec": 36, "energy": 9, "query": "Dil Dhadakne Do Title Song Priyanka Chopra Farhan Akhtar T-Series"},
    {"title": "Pehli Baar", "artist": "Diljit Dosanjh, Sukriti Kakar", "year": "2015", "hookStartSec": 38, "energy": 9, "query": "Pehli Baar Dil Dhadakne Do Ranveer Singh Anushka Sharma T-Series"},
    {"title": "Make Some Noise For The Desi Boyz", "artist": "KK, Bob", "year": "2011", "hookStartSec": 40, "energy": 10, "query": "Make Some Noise For The Desi Boyz Akshay Kumar John Abraham T-Series"},
    {"title": "Hookah Bar", "artist": "Himesh Reshammiya, Vineet Singh, Aman Trikha", "year": "2012", "hookStartSec": 35, "energy": 10, "query": "Hookah Bar Khiladi 786 Akshay Kumar Asin Himesh Reshammiya Eros Now"},
    {"title": "Balma", "artist": "Shreya Ghoshal, Sreerama Chandra", "year": "2012", "hookStartSec": 38, "energy": 10, "query": "Balma Khiladi 786 Akshay Kumar Claudia Ciesla Himesh Reshammiya Eros Now"},
    {"title": "Lonely Lonely", "artist": "Himesh Reshammiya, Yo Yo Honey Singh, Hamsika Iyer", "year": "2012", "hookStartSec": 36, "energy": 10, "query": "Lonely Khiladi 786 Akshay Kumar Asin Himesh Honey Singh Eros Now"},
    {"title": "Jumme Ki Raat", "artist": "Mika Singh, Palak Muchhal", "year": "2014", "hookStartSec": 42, "energy": 10, "query": "Jumme Ki Raat Kick Salman Khan Jacqueline Fernandez Mika Singh T-Series"},
    {"title": "Hangover", "artist": "Salman Khan, Shreya Ghoshal", "year": "2014", "hookStartSec": 40, "energy": 8, "query": "Hangover Kick Salman Khan Jacqueline Fernandez T-Series"},
    {"title": "Devil-Yaar Naa Miley", "artist": "Yo Yo Honey Singh, Jasmine Sandlas", "year": "2014", "hookStartSec": 35, "energy": 10, "query": "Yaar Naa Miley Kick Salman Khan Nargis Fakhri Honey Singh T-Series"},
    {"title": "Lungi Dance", "artist": "Yo Yo Honey Singh", "year": "2013", "hookStartSec": 38, "energy": 10, "query": "Lungi Dance Chennai Express Shah Rukh Khan Deepika Honey Singh T-Series"},
    {"title": "1 2 3 4 Get On The Dance Floor", "artist": "Vishal Dadlani, Hamsika Iyer", "year": "2013", "hookStartSec": 35, "energy": 10, "query": "1 2 3 4 Get On The Dance Floor Chennai Express Shah Rukh Khan Priyamani"},
    {"title": "Titli", "artist": "Chinmayi Sripaada, Gopi Sunder", "year": "2013", "hookStartSec": 40, "energy": 8, "query": "Titli Chennai Express Shah Rukh Khan Deepika Padukone T-Series"},
    {"title": "Kashmir Main Tu Kanyakumari", "artist": "Sunidhi Chauhan, Arijit Singh, Neeti Mohan", "year": "2013", "hookStartSec": 38, "energy": 9, "query": "Kashmir Main Tu Kanyakumari Chennai Express Shah Rukh Khan Deepika"},
    {"title": "Tamanche Pe Disco", "artist": "RDB, Nindy Kaur, Raftaar", "year": "2013", "hookStartSec": 36, "energy": 10, "query": "Tamanche Pe Disco Bullett Raja Saif Ali Khan Sonakshi Sinha"},
    {"title": "Gandi Baat", "artist": "Mika Singh, Kalpana Patowary", "year": "2013", "hookStartSec": 38, "energy": 10, "query": "Gandi Baat R Rajkumar Shahid Kapoor Prabhu Dheva Mika Singh Eros Now"},
    {"title": "Party All Night", "artist": "Yo Yo Honey Singh", "year": "2013", "hookStartSec": 35, "energy": 10, "query": "Party All Night Boss Akshay Kumar Sonakshi Honey Singh T-Series"},
    {"title": "Boss Title Track", "artist": "Meet Bros, Yo Yo Honey Singh", "year": "2013", "hookStartSec": 36, "energy": 10, "query": "Boss Title Track Akshay Kumar Meet Bros Honey Singh T-Series"},
    {"title": "Sunny Sunny", "artist": "Yo Yo Honey Singh, Neha Kakkar", "year": "2014", "hookStartSec": 35, "energy": 10, "query": "Sunny Sunny Yaariyan Honey Singh Neha Kakkar T-Series"},
    {"title": "Chaar Botal Vodka", "artist": "Yo Yo Honey Singh", "year": "2014", "hookStartSec": 35, "energy": 10, "query": "Chaar Botal Vodka Ragini MMS 2 Sunny Leone Honey Singh T-Series"},
    {"title": "Dheere Dheere", "artist": "Yo Yo Honey Singh", "year": "2015", "hookStartSec": 38, "energy": 9, "query": "Dheere Dheere Se Meri Zindagi Hrithik Roshan Sonam Kapoor Honey Singh T-Series"},
    {"title": "Love Dose", "artist": "Yo Yo Honey Singh", "year": "2014", "hookStartSec": 36, "energy": 10, "query": "Love Dose Desi Kalakaar Yo Yo Honey Singh Urvashi Rautela T-Series"},
    {"title": "Blue Eyes", "artist": "Yo Yo Honey Singh", "year": "2013", "hookStartSec": 35, "energy": 10, "query": "Blue Eyes Yo Yo Honey Singh official music video T-Series"},
    {"title": "Dope Shope", "artist": "Yo Yo Honey Singh, Deep Money", "year": "2011", "hookStartSec": 35, "energy": 10, "query": "Dope Shope International Villager Yo Yo Honey Singh Deep Money"},
    {"title": "Angreji Beat", "artist": "Yo Yo Honey Singh, Gippy Grewal", "year": "2012", "hookStartSec": 35, "energy": 10, "query": "Angreji Beat Cocktail Deepika Padukone Saif Ali Khan Honey Singh Eros Now"},
    {"title": "Second Hand Jawani", "artist": "Miss Pooja, Neha Kakkar, Nakkash Aziz", "year": "2012", "hookStartSec": 38, "energy": 10, "query": "Second Hand Jawani Cocktail Saif Ali Khan Deepika Padukone Eros Now"},
    {"title": "Daaru Desi", "artist": "Benny Dayal, Shalmali Kholgade", "year": "2012", "hookStartSec": 36, "energy": 9, "query": "Daaru Desi Cocktail Deepika Padukone Saif Diana Penty Eros Now"},
    {"title": "Tumhi Ho Bandhu", "artist": "Neeraj Shridhar, Kavita Seth", "year": "2012", "hookStartSec": 40, "energy": 10, "query": "Tumhi Ho Bandhu Cocktail Saif Ali Khan Deepika Diana Eros Now"},
    {"title": "Jhoome Jo Pathaan", "artist": "Arijit Singh, Sukriti Kakar, Vishal & Shekhar", "year": "2023", "hookStartSec": 38, "energy": 10, "query": "Jhoome Jo Pathaan Shah Rukh Khan Deepika Arijit Singh Vishal Shekhar YRF"},
    {"title": "Besharam Rang", "artist": "Shilpa Rao, Caralisa Monteiro", "year": "2022", "hookStartSec": 40, "energy": 10, "query": "Besharam Rang Song Pathaan Shah Rukh Khan Deepika Shilpa Rao YRF"},
    {"title": "Not Ramaiya Vastavaiya", "artist": "Anirudh Ravichander, Vishal Dadlani, Shilpa Rao", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "Not Ramaiya Vastavaiya Jawan Shah Rukh Khan Nayanthara Anirudh T-Series"},
    {"title": "Zinda Banda", "artist": "Anirudh Ravichander", "year": "2023", "hookStartSec": 36, "energy": 10, "query": "Zinda Banda Jawan Shah Rukh Khan Anirudh T-Series"},
    {"title": "Chaleya", "artist": "Arijit Singh, Shilpa Rao", "year": "2023", "hookStartSec": 38, "energy": 9, "query": "Chaleya Jawan Shah Rukh Khan Nayanthara Arijit Singh Shilpa Rao T-Series"},
    {"title": "Lutt Putt Gaya", "artist": "Arijit Singh", "year": "2023", "hookStartSec": 36, "energy": 9, "query": "Lutt Putt Gaya Dunki Shah Rukh Khan Taapsee Pannu Arijit Singh T-Series"},
    {"title": "Jaanam", "artist": "Vishal Mishra", "year": "2024", "hookStartSec": 35, "energy": 9, "query": "Jaanam Bad Newz Vicky Kaushal Triptii Dimri Vishal Mishra"},
    {"title": "Taras", "artist": "Jasmine Sandlas, Sachin-Jigar", "year": "2024", "hookStartSec": 35, "energy": 10, "query": "Taras Munjya Sharvari Sachin Jigar Jasmine Sandlas"},
    {"title": "Chedkhaniyan", "artist": "Arijit Singh, Nikhita Gandhi", "year": "2023", "hookStartSec": 36, "energy": 10, "query": "Chedkhaniyan Shehzada Kartik Aaryan Kriti Sanon Arijit Singh"},
    {"title": "Munda Sona Hoon Main", "artist": "Diljit Dosanjh, Nikhita Gandhi", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "Munda Sona Hoon Main Shehzada Kartik Aaryan Kriti Sanon Diljit Dosanjh"},
    {"title": "Character Dheela 2.0", "artist": "Neeraj Shridhar", "year": "2023", "hookStartSec": 35, "energy": 10, "query": "Character Dheela 2.0 Shehzada Kartik Aaryan Neeraj Shridhar"},
    {"title": "Bhool Bhulaiyaa 2 Title Track", "artist": "Neeraj Shridhar", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "Bhool Bhulaiyaa 2 Title Track Kartik Aaryan Neeraj Shridhar T-Series"},
    {"title": "Ami Je Tomar", "artist": "Arijit Singh", "year": "2022", "hookStartSec": 45, "energy": 9, "query": "Ami Je Tomar Bhool Bhulaiyaa 2 Kartik Aaryan Arijit Singh T-Series"},
    {"title": "De Taali", "artist": "Yo Yo Honey Singh, Armaan Malik, Shashwat Singh", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "De Taali Bhool Bhulaiyaa 2 Kartik Aaryan Honey Singh Armaan Malik T-Series"},
    {"title": "Haan Main Galat", "artist": "Arijit Singh, Shashwat Singh", "year": "2020", "hookStartSec": 36, "energy": 10, "query": "Haan Main Galat Love Aaj Kal Kartik Aaryan Sara Ali Khan Pritam"},
    {"title": "Twist", "artist": "Neeraj Shridhar", "year": "2009", "hookStartSec": 35, "energy": 10, "query": "Twist Love Aaj Kal Saif Ali Khan Deepika Padukone Neeraj Shridhar Eros Now"},
    {"title": "Chor Bazaari", "artist": "Neeraj Shridhar, Sunidhi Chauhan", "year": "2009", "hookStartSec": 38, "energy": 10, "query": "Chor Bazaari Love Aaj Kal Saif Ali Khan Deepika Padukone Eros Now"},
    {"title": "Aahun Aahun", "artist": "Master Saleem, Neeraj Shridhar, Suzanne D'Mello", "year": "2009", "hookStartSec": 36, "energy": 10, "query": "Aahun Aahun Love Aaj Kal Saif Ali Khan Deepika Padukone Eros Now"},
    {"title": "Yeh Ishq Hai", "artist": "Shreya Ghoshal", "year": "2007", "hookStartSec": 38, "energy": 10, "query": "Yeh Ishq Hai Jab We Met Kareena Kapoor Shahid Kapoor Shreya Ghoshal"},
    {"title": "Punjabi Wedding Song", "artist": "Sunidhi Chauhan, Benny Dayal", "year": "2014", "hookStartSec": 40, "energy": 10, "query": "Punjabi Wedding Song Hasee Toh Phasee Sidharth Malhotra Parineeti Chopra"},
    {"title": "Drama Queen", "artist": "Shreya Ghoshal, Vishal Dadlani", "year": "2014", "hookStartSec": 36, "energy": 10, "query": "Drama Queen Hasee Toh Phasee Parineeti Chopra Sidharth Malhotra"},
    {"title": "Shake It Like Shammi", "artist": "Benny Dayal", "year": "2014", "hookStartSec": 35, "energy": 10, "query": "Shake It Like Shammi Hasee Toh Phasee Sidharth Malhotra"},
    {"title": "Gujariya", "artist": "Nikhil D'Souza, Neeti Mohan", "year": "2014", "hookStartSec": 38, "energy": 9, "query": "Gujariya Queen Kangana Ranaut Amit Trivedi"},
    {"title": "Sadi Gali", "artist": "Lehmber Hussainpuri", "year": "2011", "hookStartSec": 35, "energy": 10, "query": "Sadi Gali Tanu Weds Manu Kangana Ranaut R Madhavan Lehmber Hussainpuri"},
    {"title": "Banno", "artist": "Brijesh Shandllya, Swati Sharma", "year": "2015", "hookStartSec": 35, "energy": 10, "query": "Banno Tanu Weds Manu Returns Kangana Ranaut R Madhavan Eros Now"},
    {"title": "Ghani Bawri", "artist": "Jyoti Nooran", "year": "2015", "hookStartSec": 38, "energy": 10, "query": "Ghani Bawri Tanu Weds Manu Returns Kangana Ranaut Jyoti Nooran"},
    {"title": "Mari Gali", "artist": "NS Chauhan, Dilbagh Singh", "year": "2015", "hookStartSec": 35, "energy": 10, "query": "Mari Gali Tanu Weds Manu Returns Kangana Ranaut"},
    {"title": "Navrai Majhi", "artist": "Sunidhi Chauhan, Swanand Kirkire", "year": "2012", "hookStartSec": 40, "energy": 10, "query": "Navrai Majhi English Vinglish Sridevi Amit Trivedi Sunidhi Chauhan"},
    {"title": "Twist Kamariya", "artist": "Harshdeep Kaur, Yasser Desai, Tanishk Bagchi", "year": "2017", "hookStartSec": 36, "energy": 10, "query": "Twist Kamariya Bareilly Ki Barfi Ayushmann Khurrana Kriti Sanon Zee Music"},
    {"title": "Badri Ki Dulhania", "artist": "Dev Negi, Neha Kakkar, Monali Thakur, Ikka", "year": "2017", "hookStartSec": 40, "energy": 10, "query": "Badri Ki Dulhania Title Track Varun Dhawan Alia Bhatt T-Series"},
    {"title": "Tamma Tamma Again", "artist": "Bappi Lahiri, Anuradha Paudwal, Badshah", "year": "2017", "hookStartSec": 38, "energy": 10, "query": "Tamma Tamma Again Badrinath Ki Dulhania Varun Dhawan Alia Bhatt T-Series"},
    {"title": "Aashiq Surrender Hua", "artist": "Amaal Mallik, Shreya Ghoshal", "year": "2017", "hookStartSec": 36, "energy": 10, "query": "Aashiq Surrender Hua Badrinath Ki Dulhania Varun Dhawan Alia Bhatt T-Series"},
    {"title": "Dhingana", "artist": "Mika Singh", "year": "2017", "hookStartSec": 36, "energy": 10, "query": "Dhingana Raees Shah Rukh Khan Mika Singh Zee Music Company"},
    {"title": "Laila Main Laila", "artist": "Pawni Pandey", "year": "2017", "hookStartSec": 38, "energy": 10, "query": "Laila Main Laila Raees Sunny Leone Shah Rukh Khan Zee Music Company"},
    {"title": "Suit Suit", "artist": "Guru Randhawa, Arjun", "year": "2017", "hookStartSec": 35, "energy": 10, "query": "Suit Suit Hindi Medium Irrfan Khan Guru Randhawa T-Series"},
    {"title": "Ban Ja Rani", "artist": "Guru Randhawa", "year": "2017", "hookStartSec": 35, "energy": 9, "query": "Ban Ja Rani Tumhari Sulu Vidya Balan Guru Randhawa T-Series"},
    {"title": "Hawa Hawa", "artist": "Mika Singh, Prakriti Kakar", "year": "2017", "hookStartSec": 36, "energy": 10, "query": "Hawa Hawa Mubarakan Anil Kapoor Arjun Kapoor Mika Singh T-Series"},
    {"title": "The Goggle Song", "artist": "Sonu Nigam, Armaan Malik, Tulsi Kumar, Neeti Mohan", "year": "2017", "hookStartSec": 38, "energy": 10, "query": "The Goggle Song Mubarakan Anil Kapoor Arjun Kapoor Ileana T-Series"},
    {"title": "Mubarakan Title Track", "artist": "Juggy D, Yash Narvekar, Badshah, Sukriti Kakar", "year": "2017", "hookStartSec": 35, "energy": 10, "query": "Mubarakan Title Track Anil Kapoor Arjun Kapoor Badshah T-Series"},
    {"title": "Peeyu Datha", "artist": "Ajay Gogavale", "year": "2018", "hookStartSec": 38, "energy": 9, "query": "Peeyu Datha Dhadak Ishaan Khatter Janhvi Kapoor Ajay Atul Zee Music"},
    {"title": "Akh Lad Jaave", "artist": "Badshah, Asees Kaur, Jubin Nautiyal", "year": "2018", "hookStartSec": 35, "energy": 10, "query": "Akh Lad Jaave Loveyatri Aayush Sharma Warina Hussain Badshah T-Series"},
    {"title": "Badhaaiyan Tenu", "artist": "Brijesh Shandilya", "year": "2018", "hookStartSec": 36, "energy": 10, "query": "Badhaaiyan Tenu Badhaai Ho Ayushmann Khurrana Zee Music"},
    {"title": "Sajan Bade Senti", "artist": "Dev Negi, Harjot Kaur", "year": "2018", "hookStartSec": 36, "energy": 10, "query": "Sajan Bade Senti Badhaai Ho Ayushmann Khurrana Sanya Malhotra Zee Music"},
    {"title": "Tu Laung Main Elaachi", "artist": "Tulsi Kumar", "year": "2019", "hookStartSec": 38, "energy": 9, "query": "Tu Laung Main Elaachi Luka Chuppi Kartik Aaryan Kriti Sanon T-Series"},
    {"title": "Duniyaa", "artist": "Akhil, Dhvani Bhanushali", "year": "2019", "hookStartSec": 36, "energy": 8, "query": "Duniyaa Luka Chuppi Kartik Aaryan Kriti Sanon T-Series"},
    {"title": "The Naari Naari Song", "artist": "Vishal Dadlani, Jonita Gandhi", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "The Naari Naari Song Made In China Rajkummar Rao Mouni Roy Sony Music"},
    {"title": "Laal Ghaghra", "artist": "Manj Musik, Herbie Sahara, Neha Kakkar", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Laal Ghaghra Good Newwz Akshay Kumar Kareena Kapoor Zee Music"},
    {"title": "Shaitan Ka Saala", "artist": "Vishal Dadlani, Sohail Sen", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Shaitan Ka Saala Bala Housefull 4 Akshay Kumar T-Series"},
    {"title": "Chammo", "artist": "Sukhwinder Singh, Shreya Ghoshal, Shadab Faridi", "year": "2019", "hookStartSec": 38, "energy": 10, "query": "Chammo Housefull 4 Akshay Kumar Riteish Kriti Sanon T-Series"},
    {"title": "Ek Chumma", "artist": "Altamash Faridi, Jyotica Tangri, Nakash Aziz", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Ek Chumma Housefull 4 Akshay Kumar Riteish Bobby T-Series"},
    {"title": "Bhoot Song", "artist": "Mika Singh, Farhad Samji", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "The Bhoot Song Housefull 4 Akshay Kumar Nawazuddin Siddiqui T-Series"},
    {"title": "Pappi Jhappi", "artist": "Meet Bros, Harry Arora", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "Pappi Jhappi Govinda Naam Mera Vicky Kaushal Kiara Advani Sony Music"},
    {"title": "Bijli", "artist": "Mika Singh, Neha Kakkar, Sachin-Jigar", "year": "2022", "hookStartSec": 35, "energy": 10, "query": "Bijli Govinda Naam Mera Vicky Kaushal Kiara Advani Mika Singh Sony Music"},
    {"title": "Bana Sharabi", "artist": "Jubin Nautiyal", "year": "2022", "hookStartSec": 38, "energy": 9, "query": "Bana Sharabi Govinda Naam Mera Vicky Kaushal Kiara Advani"},
    {"title": "Hello Ji", "artist": "Meet Bros, Kanika Kapoor", "year": "2019", "hookStartSec": 35, "energy": 10, "query": "Hello Ji Ragini MMS Returns Sunny Leone Meet Bros Zee Music"},
    {"title": "Slow Motion", "artist": "Nakash Aziz, Shreya Ghoshal", "year": "2019", "hookStartSec": 38, "energy": 10, "query": "Slow Motion Bharat Salman Khan Disha Patani T-Series"},
    {"title": "Aithey Aa", "artist": "Akasa Singh, Neeti Mohan, Kamaal Khan", "year": "2019", "hookStartSec": 36, "energy": 10, "query": "Aithey Aa Bharat Salman Khan Katrina Kaif T-Series"},
    {"title": "Jhume Re Gori", "artist": "Archana Gore, Tarannum Malik Jain", "year": "2022", "hookStartSec": 40, "energy": 10, "query": "Jhume Re Gori Gangubai Kathiawadi Alia Bhatt Sanjay Leela Bhansali"},
    {"title": "Shikayat", "artist": "Archana Gore", "year": "2022", "hookStartSec": 42, "energy": 9, "query": "Shikayat Gangubai Kathiawadi Huma Qureshi Sanjay Leela Bhansali"},
    {"title": "Dholi Taro Dhol Baaje", "artist": "Kavita Krishnamurthy, Vinod Rathod, Karsan Sagathia", "year": "1999", "hookStartSec": 45, "energy": 10, "query": "Dholi Taro Dhol Baaje Hum Dil De Chuke Sanam Salman Khan Aishwarya Rai"},
    {"title": "Aankhon Ki Gustakhiyan", "artist": "Kumar Sanu, Kavita Krishnamurthy", "year": "1999", "hookStartSec": 42, "energy": 8, "query": "Aankhon Ki Gustakhiyan Hum Dil De Chuke Sanam Salman Khan Aishwarya Rai"},
    {"title": "Nimbooda", "artist": "Kavita Krishnamurthy, Karsan Sagathia", "year": "1999", "hookStartSec": 40, "energy": 10, "query": "Nimbooda Hum Dil De Chuke Sanam Aishwarya Rai Salman Khan"},
    {"title": "Chand Chupa Badal Mein", "artist": "Udit Narayan, Alka Yagnik", "year": "1999", "hookStartSec": 44, "energy": 8, "query": "Chand Chupa Badal Mein Hum Dil De Chuke Sanam Salman Khan Aishwarya Rai"},
    {"title": "Mehndi Hai Rachnewali", "artist": "Alka Yagnik", "year": "2001", "hookStartSec": 40, "energy": 8, "query": "Mehndi Hai Rachnewali Zubeidaa Karisma Kapoor AR Rahman Alka Yagnik"},
    {"title": "Radha Kaise Na Jale", "artist": "Asha Bhosle, Udit Narayan", "year": "2001", "hookStartSec": 42, "energy": 9, "query": "Radha Kaise Na Jale Lagaan Aamir Khan Gracy Singh AR Rahman"},
    {"title": "Mitwa Lagaan", "artist": "Udit Narayan, Alka Yagnik, Sukhwinder Singh", "year": "2001", "hookStartSec": 45, "energy": 9, "query": "Mitwa Lagaan Aamir Khan AR Rahman Udit Narayan"},
    {"title": "Chhan Ke Mohalla", "artist": "Sunidhi Chauhan, Ritu Pathak", "year": "2010", "hookStartSec": 38, "energy": 10, "query": "Chhan Ke Mohalla Action Replayy Aishwarya Rai Sunidhi Chauhan"},
    {"title": "Zor Ka Jhatka", "artist": "Daler Mehndi, Richa Sharma", "year": "2010", "hookStartSec": 35, "energy": 10, "query": "Zor Ka Jhatka Action Replayy Akshay Kumar Aishwarya Rai Daler Mehndi"},
    {"title": "O O Jaane Jaana", "artist": "Kamaal Khan", "year": "1998", "hookStartSec": 35, "energy": 10, "query": "O O Jaane Jaana Pyaar Kiya To Darna Kya Salman Khan"},
    {"title": "Chunari Chunari", "artist": "Abhijeet, Anuradha Sriram", "year": "1999", "hookStartSec": 40, "energy": 10, "query": "Chunari Chunari Biwi No 1 Salman Khan Sushmita Sen"},
    {"title": "Makhna Govinda", "artist": "Amit Kumar, Udit Narayan, Alka Yagnik", "year": "1998", "hookStartSec": 40, "energy": 10, "query": "Makhna Bade Miyan Chote Miyan Amitabh Bachchan Govinda Madhuri"},
    {"title": "Kisi Disco Mein Jaaye", "artist": "Udit Narayan, Alka Yagnik", "year": "1998", "hookStartSec": 38, "energy": 10, "query": "Kisi Disco Mein Jaaye Bade Miyan Chote Miyan Govinda Raveena Tandon"},
    {"title": "Ankhiyon Se Goli Maare", "artist": "Sonu Nigam, Jaspinder Narula", "year": "1998", "hookStartSec": 36, "energy": 10, "query": "Ankhiyon Se Goli Maare Dulhe Raja Govinda Raveena Tandon"},
    {"title": "Husn Hai Suhana", "artist": "Abhijeet, Chandana Dixit", "year": "1995", "hookStartSec": 35, "energy": 10, "query": "Husn Hai Suhana Coolie No 1 Govinda Karisma Kapoor"},
    {"title": "Main Toh Raste Se Jaa Raha Tha", "artist": "Kumar Sanu, Alka Yagnik", "year": "1995", "hookStartSec": 35, "energy": 10, "query": "Main Toh Raste Se Jaa Raha Tha Coolie No 1 Govinda Karisma Kapoor"},
    {"title": "Mirchi Lagi Toh", "artist": "Kumar Sanu, Alka Yagnik", "year": "1995", "hookStartSec": 35, "energy": 10, "query": "Mirchi Lagi Toh Coolie No 1 Govinda Karisma Kapoor"},
    {"title": "Teri Bhabhi", "artist": "Dev Negi, Neha Kakkar", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Teri Bhabhi Coolie No 1 Varun Dhawan Sara Ali Khan Dev Negi Neha Kakkar"},
    {"title": "Mummy Kassam", "artist": "Udit Narayan, Monali Thakur", "year": "2020", "hookStartSec": 35, "energy": 10, "query": "Mummy Kassam Coolie No 1 Varun Dhawan Sara Ali Khan Udit Narayan"},
    {"title": "Sona Kitna Sona Hai", "artist": "Udit Narayan, Poornima", "year": "1997", "hookStartSec": 40, "energy": 10, "query": "Sona Kitna Sona Hai Hero No 1 Govinda Karisma Kapoor"}
]

print(f"Total candidates proposed:")
print(f"  hindi-sufi: {len(SUFI_CANDIDATES)}")
print(f"  hindi-hiphop: {len(HIPHOP_CANDIDATES)}")
print(f"  diwali-party-songs: {len(DIWALI_CANDIDATES)}")

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True,
    'default_search': 'ytsearch3',
}

def resolve_single_song(item, used_in_run):
    title = item['title']
    artist = item['artist']
    query = item['query']
    hook_start = int(item['hookStartSec'])
    hook_end = int(item.get('hookEndSec') or (hook_start + 40))
    energy = int(item.get('energy') or 9)
    year = str(item.get('year') or '2022')

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch3:{query}", download=False)
            if not res or 'entries' not in res or not res['entries']:
                return None

            for entry in res['entries']:
                vid = entry.get('id')
                if not vid or len(vid) != 11 or vid in BLACKLIST or vid in GLOBAL_SEEN_VIDS or vid in used_in_run:
                    continue

                # Verify with oEmbed
                try:
                    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
                    req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=6) as resp:
                        if resp.status == 200:
                            dur = int(entry.get('duration') or 210)
                            if dur < 110 or dur > 480:
                                dur = 210
                            
                            return {
                                'title': title,
                                'artist': artist,
                                'year': year,
                                'durationSec': dur,
                                'hookStartSec': hook_start,
                                'hookEndSec': hook_end,
                                'entrySec': hook_start,
                                'exitSec': hook_end,
                                'videoId': vid,
                                'energy': energy
                            }
                except Exception:
                    continue
    except Exception as e:
        print(f"Error on {title}: {e}")
    return None

def process_category(cat_name, candidates, target_count=110):
    print(f"\n==========================================")
    print(f"Resolving Category: {cat_name} (Candidates: {len(candidates)}, Target: {target_count}+)")
    print(f"==========================================")
    
    resolved = []
    used_vids = set()
    used_titles = set()

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_item = {executor.submit(resolve_single_song, c, used_vids): c for c in candidates}
        for future in concurrent.futures.as_completed(future_to_item):
            item = future_to_item[future]
            try:
                res = future.result()
                if res:
                    vid = res['videoId']
                    t_key = res['title'].lower().strip()
                    if vid not in used_vids and vid not in GLOBAL_SEEN_VIDS and t_key not in used_titles:
                        used_vids.add(vid)
                        used_titles.add(t_key)
                        resolved.append(res)
                        print(f"[{len(resolved):03d}/{len(candidates)}] OK: {res['title'][:25]:25} -> {vid} (dur: {res['durationSec']}s)")
                    else:
                        print(f"[SKIP DUP]: {res['title']} -> {vid}")
                else:
                    print(f"[FAILED]: {item['title']}")
            except Exception as e:
                print(f"[ERROR]: {item['title']} - {e}")

    print(f"\nDone {cat_name}: {len(resolved)} successfully resolved.")
    return resolved

def main():
    t_start = time.time()
    results = {}

    results["hindi-sufi"] = process_category("hindi-sufi", SUFI_CANDIDATES, 110)
    results["hindi-hiphop"] = process_category("hindi-hiphop", HIPHOP_CANDIDATES, 110)
    results["diwali-party-songs"] = process_category("diwali-party-songs", DIWALI_CANDIDATES, 110)

    print("\n==========================================")
    print("FINAL SUMMARY OF RESOLVED BATCH:")
    for cat, list_songs in results.items():
        print(f"  {cat}: {len(list_songs)} songs")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nSuccessfully wrote batch to {OUTPUT_FILE}")
    print(f"Total time elapsed: {time.time() - t_start:.2f}s")

if __name__ == "__main__":
    main()
