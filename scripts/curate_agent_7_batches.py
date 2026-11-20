import os
import json
import time
import urllib.request
import concurrent.futures
import yt_dlp

OUTPUT_DIR = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "agent_7.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

MARATHI_SONGS = [
    {
        "title": "Zingaat",
        "artist": "Ajay-Atul",
        "year": "2016",
        "query": "Zingaat Sairat Ajay Atul official video",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Sairat Zaala Ji",
        "artist": "Ajay-Atul, Chinmayi Sripada",
        "year": "2016",
        "query": "Sairat Zaala Ji Ajay Atul official video",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "entrySec": 50,
        "exitSec": 90,
        "energy": 9
    },
    {
        "title": "Yad Lagla",
        "artist": "Ajay-Atul",
        "year": "2016",
        "query": "Yad Lagla Sairat Ajay Atul official video",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Aatach Baya Ka Baavarla",
        "artist": "Shreya Ghoshal, Ajay-Atul",
        "year": "2016",
        "query": "Aatach Baya Ka Baavarla Sairat official video",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Apsara Aali",
        "artist": "Bela Shende, Ajay-Atul",
        "year": "2010",
        "query": "Apsara Aali Natarang Bela Shende official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Wajle Ki Bara",
        "artist": "Bela Shende, Ajay-Atul",
        "year": "2010",
        "query": "Wajle Ki Bara Natarang Bela Shende official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Khel Mandala",
        "artist": "Ajay Gogavale, Ajay-Atul",
        "year": "2010",
        "query": "Khel Mandala Natarang Ajay Atul official song",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 9
    },
    {
        "title": "Shantabai",
        "artist": "Sanjay Londhe",
        "year": "2015",
        "query": "Shantabai Sanjay Londhe official video",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Dolby Walya",
        "artist": "Ajay-Atul, Nagesh Morwekar",
        "year": "2016",
        "query": "Dolby Walya Jaundya Na Balasaheb Ajay Atul",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Kombdi Palali",
        "artist": "Anand Shinde, Vaishali Samant",
        "year": "2006",
        "query": "Kombdi Palali Jatra Anand Shinde Vaishali Samant official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Bring It On",
        "artist": "Sachin Pilgaonkar, Jasraj Joshi",
        "year": "2016",
        "query": "Bring It On Sachin Pilgaonkar title song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "O Kaka",
        "artist": "Avdhoot Gupte",
        "year": "2010",
        "query": "O Kaka Mumbai Pune Mumbai Avdhoot Gupte official song",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Nauvari",
        "artist": "Sanju Rathod, G-Spark",
        "year": "2024",
        "query": "Nauvari Sanju Rathod official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Gulabi Sadi",
        "artist": "Sanju Rathod, G-Spark",
        "year": "2024",
        "query": "Gulabi Sadi Sanju Rathod official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Taambdi Chaambdi",
        "artist": "Kratex, Shreyas",
        "year": "2024",
        "query": "Taambdi Chaambdi Kratex Shreyas official video",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Gulabachi Kali",
        "artist": "Vaishali Samant, Amitraj, Urmila Dhangar",
        "year": "2015",
        "query": "Gulabachi Kali Tu Hi Re official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Deva Shree Ganesha",
        "artist": "Ajay-Atul",
        "year": "2012",
        "query": "Deva Shree Ganesha Ajay Atul official video",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "entrySec": 50,
        "exitSec": 90,
        "energy": 10
    },
    {
        "title": "Mauli Mauli",
        "artist": "Ajay Gogavale, Ajay-Atul",
        "year": "2014",
        "query": "Mauli Mauli Lai Bhaari Ajay Atul official video",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Aala Holicha San",
        "artist": "Swapnil Bandodkar, Ajay-Atul",
        "year": "2014",
        "query": "Aala Holicha San Lai Bhaari official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Dhagala Lagli Kala",
        "artist": "Dada Kondke, Mahendra Kapoor",
        "year": "1985",
        "query": "Dhagala Lagli Kala original song Dada Kondke",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Shitti Vajali",
        "artist": "Avdhoot Gupte, Anand Shinde",
        "year": "2014",
        "query": "Shitti Vajali Rege Avdhoot Gupte Anand Shinde official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Ararara",
        "artist": "Adarsh Shinde",
        "year": "2018",
        "query": "Ararara Mulshi Pattern Adarsh Shinde official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Majhya Raja Ra",
        "artist": "Adarsh Shinde",
        "year": "2018",
        "query": "Majhya Raja Ra Mulshi Pattern Adarsh Shinde",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Hil Pori Hila",
        "artist": "Anand Shinde",
        "year": "1995",
        "query": "Hil Pori Hila Anand Shinde official song",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Chand Pori",
        "artist": "Anand Shinde",
        "year": "2010",
        "query": "Chand Pori Anand Shinde song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Jiv Rangla",
        "artist": "Hariharan, Shreya Ghoshal, Ajay-Atul",
        "year": "2009",
        "query": "Jiv Rangla Jogwa Hariharan Shreya Ghoshal",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Lallati Bhandar",
        "artist": "Ajay Gogavale, Ajay-Atul",
        "year": "2009",
        "query": "Lallati Bhandar Jogwa Ajay Atul official",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Hi Poli Saajuk Tupatli",
        "artist": "Adarsh Shinde",
        "year": "2021",
        "query": "Hi Poli Saajuk Tupatli Pandu Adarsh Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Bhurrum",
        "artist": "Avdhoot Gupte",
        "year": "2021",
        "query": "Bhurrum Pandu Avdhoot Gupte official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Tik Tik Vajate Dokyat",
        "artist": "Sonu Nigam, Sayalie Pankaj",
        "year": "2013",
        "query": "Tik Tik Vajate Dokyat Duniyadari official video",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Zindagi Zindagi",
        "artist": "Sachin Pilgaonkar, Mahesh Manjrekar",
        "year": "2013",
        "query": "Zindagi Zindagi Duniyadari official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Ya Re Ya",
        "artist": "Rohan Pradhan",
        "year": "2013",
        "query": "Ya Re Ya Duniyadari official video song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Hridayi Vasant Phultana",
        "artist": "Suresh Wadkar, Anuradha Paudwal",
        "year": "1988",
        "query": "Hridayi Vasant Phultana Ashi Hi Banwa Banwi",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Ashi Hi Banwa Banwi Title Song",
        "artist": "Sachin, Ashok Saraf",
        "year": "1988",
        "query": "Ashi Hi Banwa Banwi title song original",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 9
    },
    {
        "title": "Mala Ved Lagale",
        "artist": "Swapnil Bandodkar, Ketaki Mategaonkar",
        "year": "2014",
        "query": "Mala Ved Lagale Timepass official song",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 9
    },
    {
        "title": "Madan Manjiri",
        "artist": "Anand Shinde, Vaishali Samant",
        "year": "2015",
        "query": "Madan Manjiri Timepass 2 official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Sunya Sunya",
        "artist": "Adarsh Shinde, Ketaki Mategaonkar",
        "year": "2015",
        "query": "Sunya Sunya Timepass 2 official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Deva Tuza Mi Aabhari",
        "artist": "Adarsh Shinde",
        "year": "2015",
        "query": "Deva Tuza Mi Aabhari Daagdi Chawl official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Dhaga Dhaga",
        "artist": "Harshavardhan Wavare, Anandi Joshi",
        "year": "2015",
        "query": "Dhaga Dhaga Daagdi Chawl official video",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Morya Morya",
        "artist": "Ajay Gogavale, Ajay-Atul",
        "year": "2008",
        "query": "Morya Morya Uladhaal Ajay Atul official video",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Chal Turu Turu",
        "artist": "Jaywant Kulkarni",
        "year": "1985",
        "query": "Chal Turu Turu Jaywant Kulkarni original",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Pori Tujhe Nadan",
        "artist": "Sanju Rathod",
        "year": "2022",
        "query": "Pori Tujhe Nadan Sanju Rathod official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Dimple",
        "artist": "Sanju Rathod",
        "year": "2023",
        "query": "Dimple Sanju Rathod official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Kali Bindi",
        "artist": "Sanju Rathod",
        "year": "2023",
        "query": "Kali Bindi Sanju Rathod official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Mi Dolkar Daryacha Raja",
        "artist": "Hemant Kumar, Suman Kalyanpur",
        "year": "1969",
        "query": "Mi Dolkar Daryacha Raja original song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Paru Go Paru",
        "artist": "Anand Shinde",
        "year": "1998",
        "query": "Paru Go Paru Anand Shinde song",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Dol Doltay Waryav",
        "artist": "Koli Geet",
        "year": "1982",
        "query": "Dol Doltay Waryav original Koli song",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 9
    },
    {
        "title": "Baburao Mast Hai",
        "artist": "Baburao",
        "year": "2014",
        "query": "Baburao Mast Hai official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Nasha Ye Nasha",
        "artist": "Boyz",
        "year": "2017",
        "query": "Nasha Ye Nasha Boyz official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Goti Soda Batli Foda",
        "artist": "Boyz",
        "year": "2017",
        "query": "Goti Soda Batli Foda Boyz official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Papani Papani",
        "artist": "Boyz 2",
        "year": "2018",
        "query": "Papani Papani Boyz 2 official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Ya Re Ya Saare Ya",
        "artist": "Boyz 2",
        "year": "2018",
        "query": "Ya Re Ya Saare Ya Boyz 2 official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Shambho Shankara",
        "artist": "Har Har Mahadev",
        "year": "2022",
        "query": "Shambho Shankara Har Har Mahadev official song",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Majha Bappa",
        "artist": "Adarsh Shinde",
        "year": "2021",
        "query": "Majha Bappa Adarsh Shinde official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Bhingri",
        "artist": "Double Seat",
        "year": "2015",
        "query": "Bhingri Double Seat official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Mohini",
        "artist": "Double Seat",
        "year": "2015",
        "query": "Mohini Double Seat official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Awaaz Vadhav DJ",
        "artist": "Anand Shinde",
        "year": "2016",
        "query": "Awaaz Vadhav DJ Anand Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Mi Honar Suparstar",
        "artist": "Anand Shinde",
        "year": "2017",
        "query": "Mi Honar Suparstar Anand Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Vinchu Chawla",
        "artist": "Avdhoot Gupte",
        "year": "2010",
        "query": "Vinchu Chawla Avdhoot Gupte",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Reshamachya Reghani",
        "artist": "Sulochana Chavhan",
        "year": "1970",
        "query": "Reshamachya Reghani Sulochana Chavhan original",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Bugadi Mazi Sandli Ga",
        "artist": "Uttara Kelkar",
        "year": "1980",
        "query": "Bugadi Mazi Sandli Ga original song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Kashi Mi Jao Mathurechya Bajari",
        "artist": "Sulochana Chavhan",
        "year": "1975",
        "query": "Kashi Mi Jao Mathurechya Bajari Sulochana Chavhan",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Pathi Varti Haath Thevun",
        "artist": "Adarsh Shinde",
        "year": "2020",
        "query": "Pathi Varti Haath Thevun Adarsh Shinde",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Sur Niragas Ho",
        "artist": "Shankar Mahadevan, Anandi Joshi",
        "year": "2015",
        "query": "Sur Niragas Ho Katyar Kaljat Ghusali official",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 9
    },
    {
        "title": "Dil Ki Tapori",
        "artist": "Boyz 3",
        "year": "2022",
        "query": "Dil Ki Tapori Boyz 3 official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Raja Aala",
        "artist": "Devdutta Manisha Baji",
        "year": "2022",
        "query": "Raja Aala Pawankhind official video",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Shivba Raja",
        "artist": "Sher Shivraj",
        "year": "2022",
        "query": "Shivba Raja Sher Shivraj official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Yugat Mandali",
        "artist": "Fatteshikast",
        "year": "2019",
        "query": "Yugat Mandali Fatteshikast official video",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Mard Maratha",
        "artist": "Ajay-Atul",
        "year": "2020",
        "query": "Mard Maratha Tanhaji Ajay Atul song",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Har Har Mahadev",
        "artist": "Pawankhind",
        "year": "2022",
        "query": "Har Har Mahadev Pawankhind official song",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Shivrajyabhishek Geet",
        "artist": "Ajay-Atul",
        "year": "2019",
        "query": "Shivrajyabhishek Geet Ajay Atul official",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Shambhu Raje",
        "artist": "Chhatrapati Sambhaji",
        "year": "2020",
        "query": "Shambhu Raje Chhatrapati Sambhaji title song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Anandache Dohi",
        "artist": "Ajay-Atul",
        "year": "2017",
        "query": "Anandache Dohi Ajay Atul official",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Hey Bappa Re",
        "artist": "Adarsh Shinde",
        "year": "2019",
        "query": "Hey Bappa Re Adarsh Shinde song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Nashik Dhol High Energy",
        "artist": "Nashik Dhol",
        "year": "2019",
        "query": "Nashik Dhol DJ remix beats",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Puneri Dhol Tasha Pathak",
        "artist": "Ganpati Visarjan Dhol",
        "year": "2021",
        "query": "Puneri Dhol Tasha Pathak Ganpati official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Soniyachi Ugavali Sakaal",
        "artist": "Anand Shinde",
        "year": "2005",
        "query": "Soniyachi Ugavali Sakaal Anand Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Aai Bhavani Pavli",
        "artist": "Ajay-Atul",
        "year": "2018",
        "query": "Aai Bhavani Pavli Ajay Atul song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Malhari Martand",
        "artist": "Ajay-Atul",
        "year": "2015",
        "query": "Malhari Martand Ajay Atul",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Aika Dajiba",
        "artist": "Vaishali Samant",
        "year": "2002",
        "query": "Aika Dajiba Vaishali Samant official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Meri Madhubala",
        "artist": "Avdhoot Gupte",
        "year": "2003",
        "query": "Meri Madhubala Avdhoot Gupte official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Jai Jai Maharashtra Majha",
        "artist": "Ajay Gogavale",
        "year": "2023",
        "query": "Jai Jai Maharashtra Majha Ajay Gogavale",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Man Udhan Varyache",
        "artist": "Shankar Mahadevan, Ajay-Atul",
        "year": "2004",
        "query": "Man Udhan Varyache Ajay Atul Agga Bai Arrekcha",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Galyan Sakli Sonyachi",
        "artist": "Koli Geet",
        "year": "1975",
        "query": "Galyan Sakli Sonyachi Koli geet original",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Vaat Baghtoy Rickshawala",
        "artist": "Reshma Sonawane",
        "year": "2008",
        "query": "Vaat Baghtoy Rickshawala original video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Porgi Patli",
        "artist": "Anand Shinde",
        "year": "2012",
        "query": "Porgi Patli Anand Shinde official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Jagana He Nyara Jhala Ji",
        "artist": "Amitraj",
        "year": "2019",
        "query": "Jagana He Nyara Jhala Ji Hirkani official",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Dholkichya Talavar",
        "artist": "Vaishali Samant",
        "year": "2016",
        "query": "Dholkichya Talavar Vaishali Samant",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Aai Majhi Mayecha Sagar",
        "artist": "Anand Shinde",
        "year": "2010",
        "query": "Aai Majhi Mayecha Sagar Anand Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Radha Radha",
        "artist": "Adarsh Shinde",
        "year": "2018",
        "query": "Radha Radha Adarsh Shinde song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Saavli",
        "artist": "Swapnil Bandodkar",
        "year": "2004",
        "query": "Saavli Swapnil Bandodkar official video",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Bappa Moriya Re",
        "artist": "Prahlad Shinde",
        "year": "1990",
        "query": "Bappa Moriya Re Prahlad Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Chal Ga Sakhye Pandharila",
        "artist": "Prahlad Shinde",
        "year": "1985",
        "query": "Chal Ga Sakhye Pandharila Prahlad Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Paule Chalati Pandharichi Vaat",
        "artist": "Prahlad Shinde",
        "year": "1988",
        "query": "Paule Chalati Pandharichi Vaat Prahlad Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Anjanichya Suta",
        "artist": "Avdhoot Gupte",
        "year": "2008",
        "query": "Anjanichya Suta Avdhoot Gupte",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Ganpati Bappa Morya",
        "artist": "Swapnil Bandodkar",
        "year": "2012",
        "query": "Ganpati Bappa Morya Swapnil Bandodkar song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "DJ Walya Dada",
        "artist": "Anand Shinde",
        "year": "2017",
        "query": "DJ Walya Dada Anand Shinde song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Pori Tuze Bharasa Nai Re",
        "artist": "DJ Marathi",
        "year": "2022",
        "query": "Pori Tuze Bharasa Nai Re DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Bai Wadyavar Ya",
        "artist": "Anand Shinde",
        "year": "2015",
        "query": "Bai Wadyavar Ya Anand Shinde song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Aai Tuz Deool Sajlay",
        "artist": "Anand Shinde",
        "year": "2016",
        "query": "Aai Tuz Deool Sajlay Anand Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Gori Gori Paan Phulasaarkhi Chhan",
        "artist": "Suman Kalyanpur",
        "year": "1975",
        "query": "Gori Gori Paan Phulasaarkhi Chhan",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 9
    },
    {
        "title": "Ya Raoji Basa Bhavji",
        "artist": "Sulochana Chavhan",
        "year": "1972",
        "query": "Ya Raoji Basa Bhavji Sulochana Chavhan original",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Padaravarti Jartari Jar",
        "artist": "Sulochana Chavhan",
        "year": "1978",
        "query": "Padaravarti Jartari Jar Sulochana Chavhan",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Kuthe Kuthe Jhayach Honeymoonla",
        "artist": "Dada Kondke",
        "year": "1985",
        "query": "Kuthe Kuthe Jhayach Honeymoonla Dada Kondke",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Dis Char Zale Man",
        "artist": "Ajay-Atul",
        "year": "2010",
        "query": "Dis Char Zale Man Natarang Ajay Atul",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Khanderaya Jhali Mazi Daina",
        "artist": "Popat",
        "year": "2013",
        "query": "Khanderaya Jhali Mazi Daina Popat official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Baji Title Track",
        "artist": "Shreyas Talpade",
        "year": "2015",
        "query": "Baji Title Track Shreyas Talpade official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Bapach Baap",
        "artist": "Adarsh Shinde",
        "year": "2021",
        "query": "Bapach Baap Adarsh Shinde official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Radha Hi Bawari",
        "artist": "Swapnil Bandodkar",
        "year": "2006",
        "query": "Radha Hi Bawari Swapnil Bandodkar official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Saang Na Re",
        "artist": "Swapnil Bandodkar",
        "year": "2007",
        "query": "Saang Na Re Swapnil Bandodkar official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Ya Re Ya Ganpati Bappa Ya",
        "artist": "Avdhoot Gupte",
        "year": "2015",
        "query": "Ya Re Ya Ganpati Bappa Ya Avdhoot Gupte",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Shantabai Part 2",
        "artist": "Sanjay Londhe",
        "year": "2017",
        "query": "Shantabai 2 Sanjay Londhe official video",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Me Shivajiraje Bhosale Boltoy",
        "artist": "Sukhwinder Singh",
        "year": "2009",
        "query": "Me Shivajiraje Bhosale Boltoy title track",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "O Raje",
        "artist": "Sukhwinder Singh",
        "year": "2009",
        "query": "O Raje Me Shivajiraje Bhosale Boltoy official",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Morba Morba",
        "artist": "Ajay-Atul",
        "year": "2016",
        "query": "Morba Morba Jaundya Na Balasaheb Ajay Atul",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Khandoba Re",
        "artist": "Ajay-Atul",
        "year": "2014",
        "query": "Khandoba Re Ajay Atul song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Gomu Sangatina Re",
        "artist": "Hemant Kumar, Asha Bhosle",
        "year": "1972",
        "query": "Gomu Sangatina Re original song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Pari Mhanu Ki Sundari",
        "artist": "Avdhoot Gupte",
        "year": "2009",
        "query": "Pari Mhanu Ki Sundari Avdhoot Gupte",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Aala Baburao",
        "artist": "Baburao",
        "year": "2015",
        "query": "Aala Baburao Marathi song official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Raja Shivchatrapati Title Song",
        "artist": "Ajay-Atul",
        "year": "2008",
        "query": "Raja Shivchatrapati title track Ajay Atul",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Man He Bavare",
        "artist": "Swapnil Bandodkar",
        "year": "2008",
        "query": "Man He Bavare Swapnil Bandodkar official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Prem He",
        "artist": "Swapnil Bandodkar, Ketaki Mategaonkar",
        "year": "2013",
        "query": "Prem He Swapnil Bandodkar Ketaki",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Tuzya Vina",
        "artist": "Classmates",
        "year": "2015",
        "query": "Tuzya Vina Classmates official video",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Teri Meri Yaariyan",
        "artist": "Classmates",
        "year": "2015",
        "query": "Teri Meri Yaariyan Classmates official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Ganpati Dhol Tasha Beat",
        "artist": "Dhol Tasha",
        "year": "2020",
        "query": "Ganpati Dhol Tasha beat official",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "entrySec": 30,
        "exitSec": 70,
        "energy": 10
    },
    {
        "title": "Khelatana Rang Bai",
        "artist": "Dada Kondke",
        "year": "1980",
        "query": "Khelatana Rang Bai Dada Kondke original",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Malyachya Malyamandi",
        "artist": "Dada Kondke",
        "year": "1982",
        "query": "Malyachya Malyamandi Dada Kondke",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Chhatrapati Shivaji Maharaj Powada",
        "artist": "Shahir Sable",
        "year": "1974",
        "query": "Chhatrapati Shivaji Maharaj Powada Shahir Sable",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Zing Zing Zingat DJ Remix",
        "artist": "DJ Marathi",
        "year": "2018",
        "query": "Zing Zing Zingat Marathi DJ remix dhol",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Sairat Theme Symphony",
        "artist": "Ajay-Atul",
        "year": "2016",
        "query": "Sairat Symphony Ajay Atul official",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 9
    },
    {
        "title": "Pori Tujha Roop Sajana",
        "artist": "DJ Marathi",
        "year": "2021",
        "query": "Pori Tujha Roop Sajana DJ remix",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Ye Pori Ye",
        "artist": "Marathi Pop",
        "year": "2020",
        "query": "Ye Pori Ye Marathi song official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Aai Ekvira Devi Bhajan",
        "artist": "Anand Shinde",
        "year": "2018",
        "query": "Aai Ekvira Devi Anand Shinde official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Khandobachi Karbharin",
        "artist": "Anand Shinde",
        "year": "2019",
        "query": "Khandobachi Karbharin Anand Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Majhi Pandharichi Maay",
        "artist": "Ajay-Atul",
        "year": "2018",
        "query": "Majhi Pandharichi Maay Ajay Atul song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Bhingari Ga Bhingari",
        "artist": "Anand Shinde",
        "year": "2014",
        "query": "Bhingari Ga Bhingari Anand Shinde",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Vaat Majhi Baghtoy Rikshawala Remix",
        "artist": "DJ Party",
        "year": "2019",
        "query": "Vaat Majhi Baghtoy Rikshawala DJ remix party",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    }
]

MARWADI_SONGS = [
    {
        "title": "Chaudhary",
        "artist": "Amit Trivedi feat. Mame Khan",
        "year": "2012",
        "query": "Chaudhary Coke Studio Mame Khan official video",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Banna Re",
        "artist": "Chitralekha Sen",
        "year": "2020",
        "query": "Banna Re Chitralekha Sen official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Ghoomar",
        "artist": "Swaroop Khan, Shreya Ghoshal",
        "year": "2018",
        "query": "Ghoomar Padmaavat official video song",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Kesariya Balam",
        "artist": "Mame Khan",
        "year": "2015",
        "query": "Kesariya Balam Mame Khan official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Bajre Ri Roti",
        "artist": "Seema Mishra",
        "year": "2012",
        "query": "Bajre Ri Roti Seema Mishra Veena Music",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Choti Si Umar",
        "artist": "Ila Arun",
        "year": "1993",
        "query": "Choti Si Umar Ila Arun official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Moomal",
        "artist": "Mame Khan",
        "year": "2016",
        "query": "Moomal Mame Khan official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Nimbooda Nimbooda",
        "artist": "Karsan Sagathia, Kavita Krishnamurthy",
        "year": "1999",
        "query": "Nimbooda Nimbooda Hum Dil De Chuke Sanam official",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 10
    },
    {
        "title": "Pallo Latke",
        "artist": "Jyotica Tangri, Yasser Desai",
        "year": "2017",
        "query": "Pallo Latke Shaadi Mein Zaroor Aana official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Hichki",
        "artist": "Mame Khan",
        "year": "2013",
        "query": "Hichki Coke Studio Mame Khan official video",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Kali Kankari",
        "artist": "Seema Mishra",
        "year": "2001",
        "query": "Kali Kankari Seema Mishra Veena Music official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Kurja",
        "artist": "Seema Mishra",
        "year": "2002",
        "query": "Kurja Seema Mishra Veena Music official",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Gorband Nakhralo",
        "artist": "Seema Mishra",
        "year": "2001",
        "query": "Gorband Nakhralo Seema Mishra Veena Music",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Banna Re Baga Me Jhula Ghalya",
        "artist": "Seema Mishra",
        "year": "2002",
        "query": "Banna Re Baga Me Jhula Ghalya Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Chirmi",
        "artist": "Seema Mishra",
        "year": "2000",
        "query": "Chirmi Ra Dala Char Seema Mishra Veena Music",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Moruda",
        "artist": "Seema Mishra",
        "year": "2002",
        "query": "Moruda Seema Mishra Veena Music official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Oji Re Deewana",
        "artist": "Seema Mishra",
        "year": "2003",
        "query": "Oji Re Deewana Seema Mishra Veena Music",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Rum Jhum Badala",
        "artist": "Seema Mishra",
        "year": "2004",
        "query": "Rum Jhum Badala Seema Mishra Veena Music",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Byan Ji Nakhrali",
        "artist": "Seema Mishra",
        "year": "2003",
        "query": "Byan Ji Nakhrali Seema Mishra Veena Music",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Mhari Ghoomar Chhe Nakhrali",
        "artist": "Seema Mishra",
        "year": "2000",
        "query": "Mhari Ghoomar Chhe Nakhrali Seema Mishra Veena Music",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Balam Choto So",
        "artist": "Seema Mishra",
        "year": "2002",
        "query": "Balam Choto So Seema Mishra Veena Music",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Cham Cham Chamke Chunri",
        "artist": "Rajasthani DJ",
        "year": "2019",
        "query": "Cham Cham Chamke Chunri Rajasthani DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Ghoonghat Ki Oat Mein Rajasthani",
        "artist": "Seema Mishra",
        "year": "2004",
        "query": "Ghoonghat Ki Oat Mein Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Dharti Dhoran Ri",
        "artist": "Kuldeep Singh",
        "year": "1990",
        "query": "Dharti Dhoran Ri Rajasthani song official",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Tejaji Maharaj",
        "artist": "Prakash Mali",
        "year": "2015",
        "query": "Tejaji Maharaj Prakash Mali official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Runiche Ra Dhaniya",
        "artist": "Prakash Mali",
        "year": "2014",
        "query": "Runiche Ra Dhaniya Prakash Mali official",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Pichham Dhara Su Mahare",
        "artist": "Prakash Mali",
        "year": "2016",
        "query": "Pichham Dhara Su Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Sugna Ri Pukaar",
        "artist": "Prakash Mali",
        "year": "2017",
        "query": "Sugna Ri Pukaar Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Jamkudi Ghumkudi",
        "artist": "Jagdish Vaishnav",
        "year": "2018",
        "query": "Jamkudi Ghumkudi Rajasthani DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Byan Mhari Nach Chham Chham",
        "artist": "Rajasthani DJ",
        "year": "2020",
        "query": "Byan Mhari Nach Chham Chham DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Chham Chham Baaje Payal",
        "artist": "Folk DJ",
        "year": "2019",
        "query": "Chham Chham Baaje Payal Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Runicha Mein Nachva De",
        "artist": "Rajasthani DJ",
        "year": "2018",
        "query": "Runicha Mein Nachva De DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Chhoti Moti Byan",
        "artist": "Rajasthani DJ",
        "year": "2019",
        "query": "Chhoti Moti Byan Rajasthani DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "DJ Baaje Runicha Mein",
        "artist": "Prakash Mali",
        "year": "2016",
        "query": "DJ Baaje Runicha Mein Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Mhare Hiwda Mein Nache Mor",
        "artist": "Hariharan, Kavita Krishnamurthy",
        "year": "1999",
        "query": "Mhare Hiwda Mein Nache Mor Hum Saath Saath Hain official",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Dhol Baje Re",
        "artist": "Rajasthani Folk",
        "year": "2015",
        "query": "Dhol Baje Re Rajasthani folk song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Chala Runicha DJ Baaje",
        "artist": "Chhotu Singh Rawna",
        "year": "2020",
        "query": "Chala Runicha DJ Baaje Chhotu Singh Rawna",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Mahadevji Re Mandir Mein",
        "artist": "Chhotu Singh Rawna",
        "year": "2021",
        "query": "Mahadevji Re Mandir Mein Chhotu Singh Rawna",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Banna Sa",
        "artist": "Chhotu Singh Rawna",
        "year": "2021",
        "query": "Banna Sa Chhotu Singh Rawna official song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Roona Ghoona Baje Ghooghra",
        "artist": "Prakash Mali",
        "year": "2015",
        "query": "Roona Ghoona Baje Ghooghra Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Padharo Mhare Desh",
        "artist": "Mame Khan",
        "year": "2018",
        "query": "Padharo Mhare Desh Mame Khan official",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Holi Khelne Aayo Re",
        "artist": "Rajasthani Folk",
        "year": "2017",
        "query": "Holi Khelne Aayo Re Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Fagan Aayo Re",
        "artist": "Rajasthani Fagan Dhamaka",
        "year": "2019",
        "query": "Fagan Aayo Re Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Chang Baje Re",
        "artist": "Fagan Geet",
        "year": "2018",
        "query": "Chang Baje Re Rajasthani fagan song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Rang Mat Daale Re Sawariya",
        "artist": "Rajasthani Holi",
        "year": "2019",
        "query": "Rang Mat Daale Re Sawariya Rajasthani",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Mahari Naar Nakhrali",
        "artist": "Rajasthani DJ",
        "year": "2020",
        "query": "Mahari Naar Nakhrali DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "DJ Walo Gano Laga Re",
        "artist": "Rajasthani DJ",
        "year": "2021",
        "query": "DJ Walo Gano Laga Re Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Sajan Aayo Paavna",
        "artist": "Seema Mishra",
        "year": "2005",
        "query": "Sajan Aayo Paavna Seema Mishra",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Dhol Thali Baje",
        "artist": "Rajasthani Folk",
        "year": "2018",
        "query": "Dhol Thali Baje Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Baisa Ra Jatan Karo",
        "artist": "Seema Mishra",
        "year": "2004",
        "query": "Baisa Ra Jatan Karo Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Beera Mhara Ramdev",
        "artist": "Prakash Mali",
        "year": "2015",
        "query": "Beera Mhara Ramdev Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Maa Karni Bhajan",
        "artist": "Prakash Mali",
        "year": "2016",
        "query": "Maa Karni Bhajan Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Mataji Ri Chirja",
        "artist": "Seema Mishra",
        "year": "2006",
        "query": "Mataji Ri Chirja Seema Mishra",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Majisa Ri Chirja",
        "artist": "Prakash Mali",
        "year": "2017",
        "query": "Majisa Ri Chirja Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Gajanand Maharaj Aao Ni",
        "artist": "Prakash Mali",
        "year": "2015",
        "query": "Gajanand Maharaj Aao Ni Prakash Mali",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Supna Mein Aaya Banna Sa",
        "artist": "Seema Mishra",
        "year": "2003",
        "query": "Supna Mein Aaya Banna Sa Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Banno Mharo Charbhuja Ro Nath",
        "artist": "Prakash Mali",
        "year": "2016",
        "query": "Banno Mharo Charbhuja Ro Nath Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Payoji Maine Ram Ratan Dhan Payo",
        "artist": "Rajasthani Folk",
        "year": "2010",
        "query": "Payoji Maine Ram Ratan Dhan Payo Rajasthani",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Sanwariya Seth Bhajan",
        "artist": "DJ Mix",
        "year": "2020",
        "query": "Sanwariya Seth Bhajan DJ remix",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Khatu Naresh Ki Jai",
        "artist": "Khatu Shyam Bhajan",
        "year": "2021",
        "query": "Khatu Naresh Ki Jai Khatu Shyam",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Mhare Khatu Wale Shyam",
        "artist": "Lakhbir Singh Lakkha",
        "year": "2016",
        "query": "Mhare Khatu Wale Shyam Lakhbir Singh Lakkha",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Banna Thari Chadhti Jawani",
        "artist": "DJ Remix",
        "year": "2019",
        "query": "Banna Thari Chadhti Jawani DJ",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Byan Ji DJ Pe Nache",
        "artist": "Mamta Vajpayee",
        "year": "2018",
        "query": "Byan Ji DJ Pe Nache Mamta Vajpayee",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Nach Byan Ghoomar Ghal",
        "artist": "Rajasthani DJ",
        "year": "2020",
        "query": "Nach Byan Ghoomar Ghal Rajasthani DJ",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Thari Bhabhi Nache DJ Pe",
        "artist": "Marwadi DJ",
        "year": "2021",
        "query": "Thari Bhabhi Nache DJ Pe Marwadi song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Bhabhi Tharo Deewano",
        "artist": "DJ Song",
        "year": "2020",
        "query": "Bhabhi Tharo Deewano Rajasthani DJ",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Jodhpur Ro Safo",
        "artist": "Rajasthani Folk",
        "year": "2019",
        "query": "Jodhpur Ro Safo Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Jaipur Ki Chundadi",
        "artist": "Rajasthani Folk",
        "year": "2018",
        "query": "Jaipur Ki Chundadi Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Marwad Mein Baaje Dhol",
        "artist": "Marwadi Folk",
        "year": "2019",
        "query": "Marwad Mein Baaje Dhol Marwadi song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Thar Ri Ret",
        "artist": "Mame Khan",
        "year": "2020",
        "query": "Thar Ri Ret Mame Khan song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Sanwariya Tharo Naam",
        "artist": "Prakash Mali",
        "year": "2017",
        "query": "Sanwariya Tharo Naam Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Pabuji Ki Phad",
        "artist": "Rajasthani Folk Epic",
        "year": "2018",
        "query": "Pabuji Ki Phad Rajasthani folk song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Devnarayan Bhagwan Bhajan",
        "artist": "Hemraj Saini",
        "year": "2016",
        "query": "Devnarayan Bhagwan Bhajan Hemraj Saini",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Goga Ji Maharaj Bhajan",
        "artist": "Prakash Mali",
        "year": "2015",
        "query": "Goga Ji Maharaj Bhajan Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Bheru Ji Bhajan",
        "artist": "Prakash Mali",
        "year": "2016",
        "query": "Bheru Ji Bhajan Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Nakoda Bhairav Bhajan",
        "artist": "Prakash Mali",
        "year": "2017",
        "query": "Nakoda Bhairav Bhajan Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Mor Bole Re Pinjra Mein",
        "artist": "Rajasthani Folk",
        "year": "2018",
        "query": "Mor Bole Re Pinjra Mein Rajasthani",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Ud Ja Re Kaga Mhare Desh",
        "artist": "Folk",
        "year": "2017",
        "query": "Ud Ja Re Kaga Mhare Desh Rajasthani song",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Kalo Kood Padyo Mela Mein",
        "artist": "Ila Arun",
        "year": "1995",
        "query": "Kalo Kood Padyo Mela Mein Ila Arun official",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Resham Ka Rumaal",
        "artist": "Ila Arun",
        "year": "1993",
        "query": "Resham Ka Rumaal Ila Arun official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Bichhuda",
        "artist": "Ila Arun",
        "year": "1994",
        "query": "Bichhuda Ila Arun official video",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Chidiya",
        "artist": "Ila Arun",
        "year": "1996",
        "query": "Chidiya Ila Arun official song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Morni Baaga Ma Bole",
        "artist": "Rajasthani Folk",
        "year": "2018",
        "query": "Morni Baaga Ma Bole Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Balam Ji Mhane Pihar Pohnchaye Do",
        "artist": "Seema Mishra",
        "year": "2004",
        "query": "Balam Ji Mhane Pihar Pohnchaye Do Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Nanad Bhojai",
        "artist": "Seema Mishra",
        "year": "2005",
        "query": "Nanad Bhojai Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Saas Ladhe Bhabhi Ladhe",
        "artist": "Seema Mishra",
        "year": "2003",
        "query": "Saas Ladhe Bhabhi Ladhe Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Piya Aao",
        "artist": "Sachin-Jigar feat. Mame Khan",
        "year": "2015",
        "query": "Piya Aao Coke Studio Sachin Jigar Mame Khan",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "entrySec": 45,
        "exitSec": 85,
        "energy": 9
    },
    {
        "title": "Banna Double Sim Ko Phone",
        "artist": "Rajasthani DJ",
        "year": "2019",
        "query": "Banna Double Sim Ko Phone DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Kamariya Patli Re",
        "artist": "Rajasthani DJ",
        "year": "2020",
        "query": "Kamariya Patli Re Rajasthani DJ",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Banna Jodhpur Su Aayo",
        "artist": "Seema Mishra",
        "year": "2002",
        "query": "Banna Jodhpur Su Aayo Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Thare Vaste Re Banna",
        "artist": "Folk DJ",
        "year": "2020",
        "query": "Thare Vaste Re Banna DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Banna Bullet Layo Re",
        "artist": "Rajasthani DJ",
        "year": "2021",
        "query": "Banna Bullet Layo Re Rajasthani DJ",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Gori Thari Chunari",
        "artist": "DJ Song",
        "year": "2020",
        "query": "Gori Thari Chunari Rajasthani DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Sona Ra Jhumka",
        "artist": "Marwadi Folk",
        "year": "2019",
        "query": "Sona Ra Jhumka Marwadi folk song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Chuda Chhamkawe",
        "artist": "Rajasthani DJ",
        "year": "2021",
        "query": "Chuda Chhamkawe Rajasthani DJ song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Hath Mein Rumal Mharo",
        "artist": "Seema Mishra",
        "year": "2003",
        "query": "Hath Mein Rumal Mharo Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Piliya",
        "artist": "Seema Mishra",
        "year": "2001",
        "query": "Piliya Seema Mishra Veena Music",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Vivah Geet Banna Banni",
        "artist": "Seema Mishra",
        "year": "2002",
        "query": "Vivah Geet Banna Banni Seema Mishra",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Mehandi Rachan Lagi Hatha Mein",
        "artist": "Rajasthani Folk Wedding",
        "year": "2016",
        "query": "Mehandi Rachan Lagi Hatha Mein Rajasthani wedding song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Mayra Geet Bhaat Bhare Beera",
        "artist": "Seema Mishra",
        "year": "2004",
        "query": "Mayra Geet Bhaat Bhare Beera Seema Mishra",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Todi Naakhi Re Balam Churiyo",
        "artist": "Rajasthani Folk",
        "year": "2018",
        "query": "Todi Naakhi Re Balam Churiyo",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Gori Nache Re Nagori Nache",
        "artist": "Rajasthani DJ",
        "year": "2019",
        "query": "Gori Nache Re Nagori Nache DJ",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Banni Tharo Banno Diwano",
        "artist": "Rajasthani Song",
        "year": "2020",
        "query": "Banni Tharo Banno Diwano Rajasthani",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Banni Sa Mithi Bol",
        "artist": "Rajasthani Folk",
        "year": "2019",
        "query": "Banni Sa Mithi Bol Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Jhir Mir Jhir Mir Meh Barse",
        "artist": "Seema Mishra",
        "year": "2002",
        "query": "Jhir Mir Jhir Mir Meh Barse Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Saawan Aayo Re",
        "artist": "Rajasthani Folk",
        "year": "2018",
        "query": "Saawan Aayo Re Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Gangaur Geet Ghor Ghor Gomti",
        "artist": "Seema Mishra",
        "year": "2003",
        "query": "Gangaur Geet Ghor Ghor Gomti Seema Mishra",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Runiche Chalo Re",
        "artist": "Prakash Mali",
        "year": "2016",
        "query": "Runiche Chalo Re Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Kesariya Balam Aavo Ni",
        "artist": "Folk Version",
        "year": "2018",
        "query": "Kesariya Balam Aavo Ni Padharo Mhare Desh",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Mharo Chhail Bhanwar Ro Kangasiyo",
        "artist": "Seema Mishra",
        "year": "2001",
        "query": "Mharo Chhail Bhanwar Ro Kangasiyo Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Nakhralo Devar Mharo",
        "artist": "Seema Mishra",
        "year": "2002",
        "query": "Nakhralo Devar Mharo Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Chhatar Singh Ji Ro Byav",
        "artist": "Rajasthani Comedy Song",
        "year": "2018",
        "query": "Chhatar Singh Ji Ro Byav",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Papaji Ki Jaan Kasooti",
        "artist": "Rajasthani DJ",
        "year": "2020",
        "query": "Papaji Ki Jaan Kasooti Rajasthani",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Banna Thari Boli Meethi",
        "artist": "Folk",
        "year": "2019",
        "query": "Banna Thari Boli Meethi Rajasthani song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Banni Ko Kangasiyo",
        "artist": "Folk",
        "year": "2018",
        "query": "Banni Ko Kangasiyo Rajasthani folk",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Jija Tu Kala Main Gori Ghani",
        "artist": "Folk DJ",
        "year": "2019",
        "query": "Jija Tu Kala Main Gori Ghani DJ",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Gori Tharo Rup Suhana",
        "artist": "DJ Folk",
        "year": "2020",
        "query": "Gori Tharo Rup Suhana Rajasthani DJ",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Runicha Ra Raja Ajmal Ji Ra Kavra",
        "artist": "Prakash Mali",
        "year": "2015",
        "query": "Runicha Ra Raja Ajmal Ji Ra Kavra Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Moruda Bolyo Re Aadhi Raat",
        "artist": "Seema Mishra",
        "year": "2002",
        "query": "Moruda Bolyo Re Aadhi Raat Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Hariyala Banna",
        "artist": "Folk",
        "year": "2018",
        "query": "Hariyala Banna Rajasthani folk song",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Chundadi",
        "artist": "Seema Mishra",
        "year": "2003",
        "query": "Chundadi Seema Mishra Veena Music",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Dholi Thali Vaje Re",
        "artist": "Folk",
        "year": "2019",
        "query": "Dholi Thali Vaje Re Rajasthani folk",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Banna Paranya Thore Sang",
        "artist": "Folk",
        "year": "2020",
        "query": "Banna Paranya Thore Sang Rajasthani",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Thari Surat Pe Man Mohyo Balam",
        "artist": "Folk",
        "year": "2019",
        "query": "Thari Surat Pe Man Mohyo Balam Rajasthani",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Mhari Tejal Ghodali",
        "artist": "Rajasthani DJ",
        "year": "2021",
        "query": "Mhari Tejal Ghodali Rajasthani DJ",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 10
    },
    {
        "title": "Jhunjhunu Wali Dadi Ma",
        "artist": "Rani Sati Dadi Bhajan",
        "year": "2018",
        "query": "Rani Sati Dadi Bhajan Rajasthani",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 9
    },
    {
        "title": "Khatu Shyam Ji Ro Melo Aayo",
        "artist": "Bhajan",
        "year": "2020",
        "query": "Khatu Shyam Ji Ro Melo Aayo Rajasthani",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Salasar Balaji Bhajan",
        "artist": "Prakash Mali",
        "year": "2017",
        "query": "Salasar Balaji Bhajan Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Osian Mataji Bhajan",
        "artist": "Prakash Mali",
        "year": "2018",
        "query": "Osian Sachiya Mataji Bhajan Prakash Mali",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "entrySec": 40,
        "exitSec": 80,
        "energy": 10
    },
    {
        "title": "Tan Man Bheego Re",
        "artist": "Seema Mishra",
        "year": "2005",
        "query": "Tan Man Bheego Re Seema Mishra",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    },
    {
        "title": "Banna Pardesi",
        "artist": "Rajasthani Folk",
        "year": "2019",
        "query": "Banna Pardesi Rajasthani folk",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "entrySec": 35,
        "exitSec": 75,
        "energy": 9
    }
]

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True,
}

def resolve_song(song, used_vids_lock, used_vids):
    q = song['query']
    title = song['title']
    artist = song['artist']
    year = str(song.get('year', '2020'))
    hook_start = int(song.get('hookStartSec', 35))
    hook_end = int(song.get('hookEndSec', 75))
    entry_sec = int(song.get('entrySec', hook_start))
    exit_sec = int(song.get('exitSec', hook_end))
    energy = int(song.get('energy', 10))

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch3:{q}", download=False)
            if not res or 'entries' not in res:
                return None
            for entry in res['entries']:
                vid = entry.get('id')
                if not vid or len(vid) != 11:
                    continue
                with used_vids_lock:
                    if vid in used_vids:
                        continue
                
                # Check oEmbed
                try:
                    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
                    req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=5) as r:
                        if r.status == 200:
                            dur = int(entry.get('duration') or 210)
                            if dur < 60 or dur > 700:
                                dur = 210
                            with used_vids_lock:
                                used_vids.add(vid)
                            return {
                                "title": title,
                                "artist": artist,
                                "year": year,
                                "durationSec": dur,
                                "hookStartSec": hook_start,
                                "hookEndSec": hook_end,
                                "entrySec": entry_sec,
                                "exitSec": exit_sec,
                                "videoId": vid,
                                "energy": energy
                            }
                except Exception:
                    continue
    except Exception as e:
        print(f"Error on {title}: {e}")
    return None

def main():
    import threading
    used_vids = set()
    used_vids_lock = threading.Lock()

    print(f"Resolving {len(MARATHI_SONGS)} Marathi songs...")
    marathi_results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(resolve_song, s, used_vids_lock, used_vids) for s in MARATHI_SONGS]
        for f in concurrent.futures.as_completed(futures):
            res = f.result()
            if res:
                marathi_results.append(res)
                print(f"[Marathi] {len(marathi_results)}: {res['title']} ({res['videoId']})")

    print(f"\nResolving {len(MARWADI_SONGS)} Marwadi songs...")
    marwadi_results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(resolve_song, s, used_vids_lock, used_vids) for s in MARWADI_SONGS]
        for f in concurrent.futures.as_completed(futures):
            res = f.result()
            if res:
                marwadi_results.append(res)
                print(f"[Marwadi] {len(marwadi_results)}: {res['title']} ({res['videoId']})")

    print(f"\nResults count: Marathi={len(marathi_results)}, Marwadi={len(marwadi_results)}")

    final_data = {
        "marathi-party": marathi_results,
        "marwadi-rajasthani": marwadi_results
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)

    print(f"\nSuccessfully wrote output to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
