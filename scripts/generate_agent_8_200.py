# -*- coding: utf-8 -*-
import json
import os
import sys
import time
import urllib.request
import concurrent.futures
import yt_dlp

BLACKLIST = {
    'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
    'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g'
}

KANNADA_CANDIDATES = [
    # Kantara
    {"title": "Singara Siriye", "artist": "Vijay Prakash, Ananya Bhat, B. Ajaneesh Loknath", "year": 2022, "hookStartSec": 52, "energy": 9.5, "query": "Kantara Singara Siriye official video song Vijay Prakash Hombale Films"},
    {"title": "Varaha Roopam", "artist": "Sai Vignesh, B. Ajaneesh Loknath", "year": 2022, "hookStartSec": 45, "energy": 10, "query": "Kantara Varaha Roopam official video song Sai Vignesh Hombale Films"},
    {"title": "Rebel Song", "artist": "Ajaneesh Loknath", "year": 2022, "hookStartSec": 35, "energy": 9.5, "query": "Kantara Rebel Song official video Ajaneesh Loknath Hombale Films"},
    {"title": "Karma Song", "artist": "Ajaneesh Loknath, Venkatesh D.C.", "year": 2022, "hookStartSec": 40, "energy": 9, "query": "Kantara Karma Song official video Hombale Films"},
    
    # KGF Chapter 1 & 2
    {"title": "Salaam Rocky Bhai", "artist": "Vijay Prakash, Santhosh Venky, Ravi Basrur", "year": 2018, "hookStartSec": 45, "energy": 10, "query": "KGF Salaam Rocky Bhai Kannada video song Yash Ravi Basrur"},
    {"title": "Dheera Dheera", "artist": "Ananya Bhat, Ravi Basrur", "year": 2018, "hookStartSec": 50, "energy": 9.5, "query": "KGF Dheera Dheera Kannada video song Yash Ravi Basrur"},
    {"title": "Jokae", "artist": "Aira Udupi, Ravi Basrur", "year": 2018, "hookStartSec": 42, "energy": 10, "query": "KGF Jokae Kannada video song Yash Tamannaah Ravi Basrur"},
    {"title": "Sidila Bharava", "artist": "Ananya Bhat, Ravi Basrur", "year": 2018, "hookStartSec": 38, "energy": 9.5, "query": "KGF Sidila Bharava Kannada song Ravi Basrur"},
    {"title": "Toofan", "artist": "Brijesh Sandilya, Mohan Krishna, Ravi Basrur", "year": 2022, "hookStartSec": 48, "energy": 10, "query": "KGF Chapter 2 Toofan Kannada video song Yash Ravi Basrur Hombale Films"},
    {"title": "Sulthana", "artist": "K.G. Ranjith, Ravi Basrur", "year": 2022, "hookStartSec": 40, "energy": 10, "query": "KGF Chapter 2 Sulthana Kannada video song Yash Ravi Basrur Hombale Films"},
    {"title": "Mehabooba", "artist": "Ananya Bhat, Ravi Basrur", "year": 2022, "hookStartSec": 55, "energy": 9.5, "query": "KGF Chapter 2 Mehabooba Kannada video song Yash Srinidhi Ravi Basrur"},
    {"title": "Falak Tu Garaj Tu", "artist": "Suvarna Rathod, Ravi Basrur", "year": 2022, "hookStartSec": 44, "energy": 9, "query": "KGF Chapter 2 Falak Tu Garaj Tu Kannada video song Ravi Basrur"},
    {"title": "The Monster Song", "artist": "Adithi Sagar, Ravi Basrur", "year": 2022, "hookStartSec": 35, "energy": 10, "query": "KGF Chapter 2 The Monster Song Kannada Adithi Sagar Ravi Basrur"},

    # Vikrant Rona
    {"title": "Ra Ra Rakkamma", "artist": "Sunidhi Chauhan, Nakash Aziz, B. Ajaneesh Loknath", "year": 2022, "hookStartSec": 50, "energy": 10, "query": "Vikrant Rona Ra Ra Rakkamma Kannada video Kiccha Sudeep Jacqueline Ajaneesh"},
    {"title": "Hey Fakira", "artist": "Sanjith Hegde, B. Ajaneesh Loknath", "year": 2022, "hookStartSec": 45, "energy": 9, "query": "Vikrant Rona Hey Fakira Kannada video Kiccha Sudeep Ajaneesh"},
    {"title": "Gumma Banda Gumma", "artist": "Anup Bhandari, B. Ajaneesh Loknath", "year": 2022, "hookStartSec": 36, "energy": 9.5, "query": "Vikrant Rona Gumma Banda Gumma Kannada video song Ajaneesh"},

    # Roberrt
    {"title": "Baa Baa Baa Na Ready", "artist": "Vyasaraj Sosale, Arjun Janya", "year": 2021, "hookStartSec": 44, "energy": 10, "query": "Roberrt Baa Baa Baa Na Ready video song Darshan Arjun Janya Anand Audio"},
    {"title": "Kannu Hodiyaka", "artist": "Shreya Ghoshal, Arjun Janya", "year": 2021, "hookStartSec": 48, "energy": 9.5, "query": "Roberrt Kannu Hodiyaka video song Darshan Asha Bhat Arjun Janya"},
    {"title": "Baby Dance Floor Ready", "artist": "Nakash Aziz, Arjun Janya", "year": 2021, "hookStartSec": 40, "energy": 10, "query": "Roberrt Baby Dance Floor Ready video song Darshan Arjun Janya"},
    {"title": "Jai Sriram", "artist": "Divya Kumar, Arjun Janya", "year": 2021, "hookStartSec": 42, "energy": 9.5, "query": "Roberrt Jai Sriram video song Darshan Arjun Janya Anand Audio"},
    {"title": "Dostha Kano", "artist": "Vijay Prakash, Hemanth, Arjun Janya", "year": 2021, "hookStartSec": 46, "energy": 9, "query": "Roberrt Dostha Kano video song Darshan Arjun Janya"},

    # Pogaru
    {"title": "Karabuu", "artist": "Chandan Shetty", "year": 2021, "hookStartSec": 45, "energy": 10, "query": "Pogaru Karabuu video song Dhruva Sarja Rashmika Mandanna Chandan Shetty"},
    {"title": "Pogaru Title Track", "artist": "Chandan Shetty", "year": 2021, "hookStartSec": 38, "energy": 10, "query": "Pogaru Title Track video song Dhruva Sarja Chandan Shetty Anand Audio"},
    {"title": "Banda Nod Prowdu", "artist": "Chandan Shetty, Vijay Prakash", "year": 2021, "hookStartSec": 42, "energy": 9.5, "query": "Pogaru Banda Nod Prowdu video song Dhruva Sarja Chandan Shetty"},

    # Tagaru
    {"title": "Tagaru Banthu Tagaru", "artist": "Anthony Daasan, Charan Raj", "year": 2018, "hookStartSec": 35, "energy": 10, "query": "Tagaru Banthu Tagaru video song Shiva Rajkumar Charan Raj PRK Audio"},
    {"title": "Mental Ho Jave", "artist": "Ananya Bhat, Charan Raj", "year": 2018, "hookStartSec": 40, "energy": 10, "query": "Tagaru Mental Ho Jave video song Shiva Rajkumar Charan Raj PRK Audio"},
    {"title": "Balma", "artist": "Charan Raj", "year": 2018, "hookStartSec": 45, "energy": 9, "query": "Tagaru Balma video song Charan Raj PRK Audio"},
    {"title": "Hold On", "artist": "Sanjith Hegde, Charan Raj", "year": 2018, "hookStartSec": 38, "energy": 9.5, "query": "Tagaru Hold On video song Sanjith Hegde Charan Raj PRK Audio"},

    # Yuvarathnaa
    {"title": "Feel the Power", "artist": "Shashaa Tirupati, Thaman S", "year": 2021, "hookStartSec": 42, "energy": 10, "query": "Yuvarathnaa Feel the Power video song Puneeth Rajkumar Thaman S Hombale"},
    {"title": "Oorigobba Raja", "artist": "Armaan Malik, Jonita Gandhi, Thaman S", "year": 2021, "hookStartSec": 46, "energy": 10, "query": "Yuvarathnaa Oorigobba Raja video song Puneeth Rajkumar Thaman S Hombale"},
    {"title": "Paatashala", "artist": "Vijay Prakash, Thaman S", "year": 2021, "hookStartSec": 50, "energy": 9, "query": "Yuvarathnaa Paatashala video song Puneeth Rajkumar Thaman S Hombale"},
    {"title": "Power of Youth", "artist": "Nakash Aziz, Thaman S", "year": 2021, "hookStartSec": 38, "energy": 9.5, "query": "Yuvarathnaa Power of Youth video song Puneeth Rajkumar Thaman S"},

    # James
    {"title": "Trademark", "artist": "MC Vickey, Aditi Sagar, Charan Raj", "year": 2022, "hookStartSec": 40, "energy": 10, "query": "James Trademark video song Puneeth Rajkumar Charan Raj Chethan Kumar"},
    {"title": "Salaam Soldier", "artist": "Sanjith Hegde, Charan Raj", "year": 2022, "hookStartSec": 44, "energy": 9.5, "query": "James Salaam Soldier video song Puneeth Rajkumar Charan Raj"},

    # Kotigobba 2 & 3
    {"title": "Pataki Poriyo", "artist": "Vijay Prakash, Anuradha Bhat, Arjun Janya", "year": 2021, "hookStartSec": 48, "energy": 10, "query": "Kotigobba 3 Pataki Poriyo video song Kiccha Sudeep Madonna Arjun Janya Anand Audio"},
    {"title": "Nee Chitrada", "artist": "Vijay Prakash, Arjun Janya", "year": 2021, "hookStartSec": 52, "energy": 9, "query": "Kotigobba 3 Nee Chitrada video song Kiccha Sudeep Arjun Janya Anand Audio"},
    {"title": "Aakashane Aadarisalu", "artist": "Vyasaraj Sosale, Arjun Janya", "year": 2021, "hookStartSec": 46, "energy": 9.5, "query": "Kotigobba 3 Aakashane Aadarisalu video song Kiccha Sudeep Arjun Janya"},
    {"title": "Saaluthillave", "artist": "Vijay Prakash, Shreya Ghoshal, D. Imman", "year": 2016, "hookStartSec": 50, "energy": 9, "query": "Kotigobba 2 Saaluthillave video song Kiccha Sudeep Nithya Menen Imman"},
    {"title": "Kotigobba Kotigobba", "artist": "Vijay Prakash, D. Imman", "year": 2016, "hookStartSec": 40, "energy": 9.5, "query": "Kotigobba 2 Kotigobba video song Kiccha Sudeep D Imman"},

    # Salaga
    {"title": "Suri Anna", "artist": "Anthony Daasan, Charan Raj", "year": 2021, "hookStartSec": 36, "energy": 10, "query": "Salaga Suri Anna video song Duniya Vijay Charan Raj Anand Audio"},
    {"title": "Salaga Title Track", "artist": "Charan Raj", "year": 2021, "hookStartSec": 42, "energy": 9.5, "query": "Salaga Title Track video song Duniya Vijay Charan Raj Anand Audio"},
    {"title": "Tinga Tinga", "artist": "Girija Siddi, Naveen Sajju, Charan Raj", "year": 2021, "hookStartSec": 35, "energy": 10, "query": "Salaga Tinga Tinga video song Duniya Vijay Charan Raj Anand Audio"},
    {"title": "Maleye Maleye", "artist": "Sanjith Hegde, Aishwarya Rangarajan, Charan Raj", "year": 2021, "hookStartSec": 48, "energy": 9, "query": "Salaga Maleye Maleye video song Duniya Vijay Sanjith Hegde Charan Raj"},

    # Kaatera
    {"title": "Pasandaagavne", "artist": "V. Harikrishna", "year": 2023, "hookStartSec": 44, "energy": 10, "query": "Kaatera Pasandaagavne video song Darshan Aradhanaa V Harikrishna Anand Audio"},
    {"title": "Yaava Janumada Gelathi", "artist": "Hemant Kumar, V. Harikrishna", "year": 2023, "hookStartSec": 50, "energy": 9, "query": "Kaatera Yaava Janumada Gelathi video song Darshan V Harikrishna Anand Audio"},
    {"title": "Kaatera Theme", "artist": "V. Harikrishna", "year": 2023, "hookStartSec": 30, "energy": 10, "query": "Kaatera Theme video song Darshan V Harikrishna Anand Audio"},

    # Mufti
    {"title": "Chanooranu", "artist": "Ravi Basrur", "year": 2017, "hookStartSec": 45, "energy": 9.5, "query": "Mufti Chanooranu video song Shiva Rajkumar Sriimurali Ravi Basrur"},
    {"title": "Onti Salaga", "artist": "Ravi Basrur", "year": 2017, "hookStartSec": 38, "energy": 10, "query": "Mufti Onti Salaga video song Sriimurali Shiva Rajkumar Ravi Basrur"},

    # Bhajarangi & Bhajarangi 2
    {"title": "Nee Sigoovaregu", "artist": "Sid Sriram, Arjun Janya", "year": 2021, "hookStartSec": 52, "energy": 9, "query": "Bhajarangi 2 Nee Sigoovaregu video song Shiva Rajkumar Sid Sriram Arjun Janya"},
    {"title": "Re Re Bhajarangi", "artist": "Kailash Kher, Arjun Janya", "year": 2021, "hookStartSec": 42, "energy": 10, "query": "Bhajarangi 2 Re Re Bhajarangi video song Shiva Rajkumar Kailash Kher Arjun Janya"},
    {"title": "Bhajarangi Title Song", "artist": "Arjun Janya", "year": 2013, "hookStartSec": 40, "energy": 9.5, "query": "Bhajarangi Title Song Shiva Rajkumar Arjun Janya"},

    # Raajakumara
    {"title": "Bombe Helutaithe", "artist": "Vijay Prakash, V. Harikrishna", "year": 2017, "hookStartSec": 46, "energy": 9, "query": "Raajakumara Bombe Helutaithe video song Puneeth Rajkumar V Harikrishna"},
    {"title": "Appu Dance", "artist": "Santhosh Venky, V. Harikrishna", "year": 2017, "hookStartSec": 42, "energy": 10, "query": "Raajakumara Appu Dance video song Puneeth Rajkumar V Harikrishna"},
    {"title": "Yaakinge", "artist": "Puneeth Rajkumar, V. Harikrishna", "year": 2017, "hookStartSec": 38, "energy": 9.5, "query": "Raajakumara Yaakinge video song Puneeth Rajkumar V Harikrishna"},

    # The Villain
    {"title": "Tick Tick Tick", "artist": "Kailash Kher, Prem, Arjun Janya", "year": 2018, "hookStartSec": 44, "energy": 10, "query": "The Villain Tick Tick Tick video song Shiva Rajkumar Sudeep Arjun Janya"},
    {"title": "I Am Villain", "artist": "Amit Mutreja, Arjun Janya", "year": 2018, "hookStartSec": 40, "energy": 9.5, "query": "The Villain I Am Villain video song Kiccha Sudeep Arjun Janya"},
    {"title": "Bolo Bolo Ramappa", "artist": "Kushboo, Arjun Janya", "year": 2018, "hookStartSec": 45, "energy": 9.5, "query": "The Villain Bolo Bolo Ramappa video song Shiva Rajkumar Arjun Janya"},

    # Ugramm
    {"title": "Ugramm Veeram", "artist": "Ravi Basrur", "year": 2014, "hookStartSec": 36, "energy": 10, "query": "Ugramm Veeram video song Sriimurali Ravi Basrur"},
    {"title": "Chanana Chanana", "artist": "Anuradha Bhat, Ravi Basrur", "year": 2014, "hookStartSec": 48, "energy": 9, "query": "Ugramm Chanana Chanana video song Sriimurali Ravi Basrur"},

    # Kirik Party
    {"title": "Belageddu", "artist": "Vijay Prakash, B. Ajaneesh Loknath", "year": 2016, "hookStartSec": 42, "energy": 9.5, "query": "Kirik Party Belageddu video song Rakshit Shetty Rashmika Ajaneesh Loknath"},
    {"title": "Hey Who Are You", "artist": "B. Ajaneesh Loknath, Bharath B J", "year": 2016, "hookStartSec": 38, "energy": 10, "query": "Kirik Party Hey Who Are You video song Rakshit Shetty Ajaneesh"},
    {"title": "Thirboki Jeevana", "artist": "B. Ajaneesh Loknath", "year": 2016, "hookStartSec": 35, "energy": 9.5, "query": "Kirik Party Thirboki Jeevana video song Rakshit Shetty Ajaneesh"},
    {"title": "Katheyonda Helide", "artist": "Sachin Warrier, B. Ajaneesh Loknath", "year": 2016, "hookStartSec": 46, "energy": 9, "query": "Kirik Party Katheyonda Helide video song Rakshit Shetty Ajaneesh"},

    # Natasaarvabhowma
    {"title": "Open The Bottle", "artist": "Vijay Prakash, D. Imman", "year": 2019, "hookStartSec": 45, "energy": 10, "query": "Natasaarvabhowma Open The Bottle video song Puneeth Rajkumar D Imman"},
    {"title": "Natasaarvabhowma Title Song", "artist": "Santhosh Venky, D. Imman", "year": 2019, "hookStartSec": 40, "energy": 9.5, "query": "Natasaarvabhowma Title Track video song Puneeth Rajkumar D Imman"},
    {"title": "Dance With Appu", "artist": "D. Imman", "year": 2019, "hookStartSec": 38, "energy": 10, "query": "Natasaarvabhowma Dance With Appu video song Puneeth Rajkumar D Imman"},

    # Doddmane Hudga
    {"title": "Abhimanigale Nammane Devaru", "artist": "Shiva Rajkumar, Puneeth Rajkumar, V. Harikrishna", "year": 2016, "hookStartSec": 44, "energy": 10, "query": "Doddmane Hudga Abhimanigale Nammane Devaru video song Puneeth Rajkumar"},
    {"title": "Thraas Aakkathi", "artist": "V. Harikrishna", "year": 2016, "hookStartSec": 40, "energy": 9.5, "query": "Doddmane Hudga Thraas Aakkathi video song Puneeth Rajkumar Radhika Pandit"},

    # Hebbuli
    {"title": "Sundari", "artist": "Vijay Prakash, Arjun Janya", "year": 2017, "hookStartSec": 48, "energy": 9.5, "query": "Hebbuli Sundari video song Kiccha Sudeep Amala Paul Arjun Janya"},
    {"title": "Huliraya", "artist": "Siddhartha Belmannu, Arjun Janya", "year": 2017, "hookStartSec": 42, "energy": 10, "query": "Hebbuli Huliraya video song Kiccha Sudeep Arjun Janya Zee Music"},
    {"title": "Usire Usire", "artist": "Shaan, Shreya Ghoshal, Arjun Janya", "year": 2017, "hookStartSec": 50, "energy": 9, "query": "Hebbuli Usire Usire video song Kiccha Sudeep Arjun Janya"},

    # Yajamana
    {"title": "Shivanandi", "artist": "Kaala Bhairava, Santhosh Venky, V. Harikrishna", "year": 2019, "hookStartSec": 44, "energy": 10, "query": "Yajamana Shivanandi video song Darshan V Harikrishna D Beats"},
    {"title": "Basanni", "artist": "V. Harikrishna, Varsha B. Suresh", "year": 2019, "hookStartSec": 42, "energy": 10, "query": "Yajamana Basanni video song Darshan Tanya Hope V Harikrishna D Beats"},
    {"title": "Ondu Munjane", "artist": "Shreya Ghoshal, Sonu Nigam, V. Harikrishna", "year": 2019, "hookStartSec": 52, "energy": 9, "query": "Yajamana Ondu Munjane video song Darshan Rashmika V Harikrishna"},
    {"title": "Hathruthine", "artist": "Vijay Prakash, V. Harikrishna", "year": 2019, "hookStartSec": 40, "energy": 9.5, "query": "Yajamana Hathruthine video song Darshan V Harikrishna"},

    # 777 Charlie
    {"title": "Torture Song", "artist": "Vijay Prakash, Nobin Paul", "year": 2022, "hookStartSec": 42, "energy": 9.5, "query": "777 Charlie Torture Song Kannada video Rakshit Shetty Nobin Paul"},
    {"title": "Journey Song", "artist": "K.S. Harisankar, Nobin Paul", "year": 2022, "hookStartSec": 46, "energy": 9, "query": "777 Charlie Journey Song Kannada video Rakshit Shetty Nobin Paul"},

    # Badava Rascal
    {"title": "Udupi Hotelu", "artist": "Vasuki Vaibhav", "year": 2021, "hookStartSec": 40, "energy": 10, "query": "Badava Rascal Udupi Hotelu video song Dhananjaya Vasuki Vaibhav Anand Audio"},
    {"title": "Badava Rascal Title Song", "artist": "Vasuki Vaibhav", "year": 2021, "hookStartSec": 38, "energy": 9.5, "query": "Badava Rascal Title Song Dhananjaya Vasuki Vaibhav Anand Audio"},

    # Popcorn Monkey Tiger & Head Bush
    {"title": "Maadeva", "artist": "Sanjith Hegde, Charan Raj", "year": 2020, "hookStartSec": 42, "energy": 10, "query": "Popcorn Monkey Tiger Maadeva video song Dhananjaya Charan Raj PRK Audio"},
    {"title": "Psychedelic Maadeva", "artist": "Charan Raj", "year": 2020, "hookStartSec": 35, "energy": 10, "query": "Popcorn Monkey Tiger Psychedelic Maadeva video song Charan Raj PRK Audio"},
    {"title": "Habibi Habibi", "artist": "Charan Raj", "year": 2022, "hookStartSec": 44, "energy": 9.5, "query": "Head Bush Habibi Habibi video song Dhananjaya Charan Raj Zee Music South"},
    {"title": "Rowdyism", "artist": "Charan Raj", "year": 2022, "hookStartSec": 36, "energy": 10, "query": "Head Bush Rowdyism video song Dhananjaya Charan Raj Zee Music South"},

    # Ghost & Kabzaa
    {"title": "OGM Ghost", "artist": "Arjun Janya", "year": 2023, "hookStartSec": 35, "energy": 10, "query": "Ghost OGM video song Shiva Rajkumar Arjun Janya Anand Audio"},
    {"title": "Chum Chum Chogada", "artist": "Aira Udupi, Ravi Basrur", "year": 2023, "hookStartSec": 46, "energy": 9.5, "query": "Kabzaa Chum Chum Chogada Kannada video song Upendra Sudeep Ravi Basrur Anand Audio"},
    {"title": "Kabzaa Title Track", "artist": "Ravi Basrur", "year": 2023, "hookStartSec": 40, "energy": 10, "query": "Kabzaa Title Track Kannada video song Upendra Ravi Basrur Anand Audio"},

    # Avane Srimannarayana
    {"title": "Hands Up", "artist": "Vijay Prakash, B. Ajaneesh Loknath", "year": 2019, "hookStartSec": 45, "energy": 10, "query": "Avane Srimannarayana Hands Up video song Rakshit Shetty Ajaneesh Loknath"},
    {"title": "Narayana Narayana", "artist": "B. Ajaneesh Loknath", "year": 2019, "hookStartSec": 40, "energy": 9.5, "query": "Avane Srimannarayana Narayana Narayana video song Rakshit Shetty"},

    # Victory 1 & 2
    {"title": "Khali Quarter Bottle", "artist": "Vijay Prakash, Arjun Janya", "year": 2013, "hookStartSec": 48, "energy": 10, "query": "Victory Khali Quarter Bottle video song Sharan Arjun Janya Anand Audio"},
    {"title": "Kanna Minche", "artist": "Arjun Janya", "year": 2013, "hookStartSec": 42, "energy": 9, "query": "Victory Kanna Minche video song Sharan Arjun Janya Anand Audio"},
    {"title": "Naa Boardu Irada Bus-uu", "artist": "Arjun Janya", "year": 2018, "hookStartSec": 40, "energy": 10, "query": "Victory 2 Naa Boardu Irada Bus-uu video song Sharan Arjun Janya Anand Audio"},

    # Ayogya
    {"title": "Yenammi Yenammi", "artist": "Vijay Prakash, Palak Muchhal, Arjun Janya", "year": 2018, "hookStartSec": 46, "energy": 9.5, "query": "Ayogya Yenammi Yenammi video song Sathish Ninasam Rachita Ram Arjun Janya"},

    # Santhu Straight Forward & Masterpiece
    {"title": "Self Made Shehzaada", "artist": "Ravi Basrur, V. Harikrishna", "year": 2016, "hookStartSec": 40, "energy": 10, "query": "Santhu Straight Forward Self Made Shehzaada video song Yash Radhika Pandit"},
    {"title": "Anthu Inthu", "artist": "Sonu Nigam, V. Harikrishna", "year": 2016, "hookStartSec": 48, "energy": 9, "query": "Santhu Straight Forward Anthu Inthu video song Yash Radhika Pandit"},
    {"title": "Annange Love Aagide", "artist": "Chintan Vikas, V. Harikrishna", "year": 2015, "hookStartSec": 44, "energy": 10, "query": "Masterpiece Annange Love Aagide video song Yash Shanvi Srivastava"},
    {"title": "KD No 1", "artist": "Tippu, V. Harikrishna", "year": 2015, "hookStartSec": 38, "energy": 9.5, "query": "Masterpiece KD No 1 video song Yash V Harikrishna"},

    # Googly
    {"title": "Bisilu Kudureondu", "artist": "Sonu Nigam, Joshua Sridhar", "year": 2013, "hookStartSec": 50, "energy": 9, "query": "Googly Bisilu Kudureondu video song Yash Kriti Kharbanda Joshua Sridhar"},
    {"title": "Yeno Yeno Aagide", "artist": "Haricharan, Joshua Sridhar", "year": 2013, "hookStartSec": 45, "energy": 9, "query": "Googly Yeno Yeno Aagide video song Yash Kriti Kharbanda Joshua Sridhar"},
    {"title": "Googly Gandasarella", "artist": "Joshua Sridhar", "year": 2013, "hookStartSec": 38, "energy": 9.5, "query": "Googly Gandasarella video song Yash Joshua Sridhar"},

    # Jackie & Anna Bond & Paramathma
    {"title": "Shiva Antha Hoguthidde", "artist": "Tippu, V. Harikrishna", "year": 2010, "hookStartSec": 42, "energy": 10, "query": "Jackie Shiva Antha Hoguthidde video song Puneeth Rajkumar V Harikrishna"},
    {"title": "Jackie Jackie", "artist": "Naveen Madhav, V. Harikrishna", "year": 2010, "hookStartSec": 40, "energy": 9.5, "query": "Jackie Title Track video song Puneeth Rajkumar V Harikrishna"},
    {"title": "Tumba Nodbedi", "artist": "V. Harikrishna", "year": 2012, "hookStartSec": 44, "energy": 9.5, "query": "Anna Bond Tumba Nodbedi video song Puneeth Rajkumar Priyamani V Harikrishna"},
    {"title": "Boni Aagada", "artist": "Tippu, V. Harikrishna", "year": 2012, "hookStartSec": 38, "energy": 9.5, "query": "Anna Bond Boni Aagada video song Puneeth Rajkumar V Harikrishna"},
    {"title": "College Gatalli", "artist": "V. Harikrishna", "year": 2011, "hookStartSec": 46, "energy": 9, "query": "Paramathma College Gatalli video song Puneeth Rajkumar V Harikrishna"},
    {"title": "Yaavanig Gothu", "artist": "Tippu, V. Harikrishna", "year": 2011, "hookStartSec": 40, "energy": 9.5, "query": "Paramathma Yaavanig Gothu video song Puneeth Rajkumar V Harikrishna"},

    # Hudugaru
    {"title": "Pankaja", "artist": "Mamta Sharma, V. Harikrishna", "year": 2011, "hookStartSec": 44, "energy": 10, "query": "Hudugaru Pankaja video song Puneeth Rajkumar Radhika Pandit V Harikrishna"},
    {"title": "Enchandane", "artist": "Sonu Nigam, V. Harikrishna", "year": 2011, "hookStartSec": 48, "energy": 9, "query": "Hudugaru Enchandane video song Puneeth Rajkumar V Harikrishna"},

    # Jogi & Appu & Abhi
    {"title": "Bin Ladenu Nan Maava", "artist": "Gurukiran", "year": 2005, "hookStartSec": 42, "energy": 10, "query": "Jogi Bin Ladenu Nan Maava video song Shiva Rajkumar Gurukiran"},
    {"title": "Bhedro Bhedro", "artist": "Gurukiran", "year": 2005, "hookStartSec": 38, "energy": 9.5, "query": "Jogi Bhedro Bhedro video song Shiva Rajkumar Gurukiran"},
    {"title": "Taliban Alla Alla", "artist": "Upendra, Gurukiran", "year": 2002, "hookStartSec": 40, "energy": 10, "query": "Appu Taliban Alla Alla video song Puneeth Rajkumar Rakshita Gurukiran"},
    {"title": "Mama Mama Maza Maado", "artist": "Puneeth Rajkumar, Gurukiran", "year": 2003, "hookStartSec": 44, "energy": 10, "query": "Abhi Mama Mama Maza Maado video song Puneeth Rajkumar Ramya Gurukiran"},
    {"title": "Jeeva Kannada Deha Kannada", "artist": "Shankar Mahadevan, Chakri", "year": 2004, "hookStartSec": 45, "energy": 9.5, "query": "Veera Kannadiga Jeeva Kannada video song Puneeth Rajkumar Chakri"},

    # Upendra & A & Om
    {"title": "Uppige Thale Illa", "artist": "Upendra, Gurukiran", "year": 1999, "hookStartSec": 42, "energy": 10, "query": "Upendra Uppige Thale Illa video song Upendra Gurukiran"},
    {"title": "Hello Hello", "artist": "Gurukiran", "year": 1998, "hookStartSec": 40, "energy": 9.5, "query": "A Movie Hello Hello video song Upendra Gurukiran"},
    {"title": "Hey Dinakara", "artist": "Dr. Rajkumar, Hamsalekha", "year": 1995, "hookStartSec": 45, "energy": 9, "query": "Om Hey Dinakara video song Shiva Rajkumar Dr Rajkumar Hamsalekha"},

    # Yuva (2024)
    {"title": "Obbane Shiva Obbane Yuva", "artist": "Santhosh Venky, B. Ajaneesh Loknath", "year": 2024, "hookStartSec": 44, "energy": 10, "query": "Yuva Obbane Shiva Obbane Yuva video song Yuva Rajkumar Ajaneesh Loknath Hombale"},
    {"title": "Kaaneyagi", "artist": "Sanjith Hegde, B. Ajaneesh Loknath", "year": 2024, "hookStartSec": 48, "energy": 9, "query": "Yuva Kaaneyagi video song Yuva Rajkumar Ajaneesh Loknath Hombale Films"},

    # Rambo 2
    {"title": "Chutu Chutu", "artist": "Ravindra Soragavi, Shamitha Malnad, Arjun Janya", "year": 2018, "hookStartSec": 45, "energy": 10, "query": "Rambo 2 Chutu Chutu video song Sharan Ashika Ranganath Arjun Janya"},
    {"title": "Dum Maro Dum", "artist": "Arjun Janya", "year": 2018, "hookStartSec": 38, "energy": 9.5, "query": "Rambo 2 Dum Maro Dum video song Sharan Arjun Janya Anand Audio"},

    # Shivalinga & Ranna
    {"title": "Ranga Ranga", "artist": "Arjun Janya", "year": 2016, "hookStartSec": 42, "energy": 9.5, "query": "Shivalinga Ranga Ranga video song Shiva Rajkumar Vedhika Arjun Janya"},
    {"title": "Babbar Sher", "artist": "Devi Sri Prasad, V. Harikrishna", "year": 2015, "hookStartSec": 44, "energy": 10, "query": "Ranna Babbar Sher video song Sudeep Rachita Ram Harikrishna"},

    # Chakravarthy
    {"title": "Ondu Malebillu", "artist": "Armaan Malik, Shreya Ghoshal, Arjun Janya", "year": 2017, "hookStartSec": 50, "energy": 9, "query": "Chakravarthy Ondu Malebillu video song Darshan Deepa Sannidhi Arjun Janya"},
    {"title": "Naughty Girl", "artist": "Arjun Janya", "year": 2017, "hookStartSec": 38, "energy": 9.5, "query": "Chakravarthy Naughty Girl video song Darshan Arjun Janya"},

    # Ulidavaru Kandanthe & Bell Bottom & Banaras
    {"title": "Gatiya Ilidu", "artist": "B. Ajaneesh Loknath", "year": 2014, "hookStartSec": 44, "energy": 9, "query": "Ulidavaru Kandanthe Gatiya Ilidu video song Rakshit Shetty Ajaneesh"},
    {"title": "Tiger Dance", "artist": "B. Ajaneesh Loknath", "year": 2014, "hookStartSec": 30, "energy": 10, "query": "Ulidavaru Kandanthe Tiger Dance video song Hulivesha Ajaneesh Loknath"},
    {"title": "Yettkond Hoda", "artist": "Anthony Daasan, B. Ajaneesh Loknath", "year": 2019, "hookStartSec": 42, "energy": 9.5, "query": "Bell Bottom Yettkond Hoda video song Rishab Shetty Hariprriya Ajaneesh"},
    {"title": "Belakina Kavithe", "artist": "Sanjith Hegde, Sangeetha Ravindranath, B. Ajaneesh Loknath", "year": 2022, "hookStartSec": 46, "energy": 9, "query": "Banaras Belakina Kavithe video song Zaid Khan Sonal Monteiro Sanjith Hegde"},

    # Love Mocktail 1 & 2
    {"title": "Love You Chinna", "artist": "Shruthi V S, Raghu Dixit", "year": 2020, "hookStartSec": 45, "energy": 9, "query": "Love Mocktail Love You Chinna video song Darling Krishna Milana Raghu Dixit"},
    {"title": "Neene Saniha", "artist": "Shreya Ghoshal, Nakul Abhyankar", "year": 2022, "hookStartSec": 48, "energy": 9, "query": "Love Mocktail 2 Neene Saniha video song Darling Krishna Milana Nakul Abhyankar"},
    {"title": "Ide Swarga", "artist": "Sanjith Hegde, Nakul Abhyankar", "year": 2022, "hookStartSec": 42, "energy": 9.5, "query": "Love Mocktail 2 Ide Swarga video song Darling Krishna Sanjith Hegde"},

    # Drama & Gaja & Kalasipalya
    {"title": "Thund Haikla Savasa", "artist": "Vijay Prakash, V. Harikrishna", "year": 2012, "hookStartSec": 42, "energy": 10, "query": "Drama Thund Haikla Savasa video song Yash Radhika Pandit Harikrishna"},
    {"title": "Bangari Yare Nee", "artist": "V. Harikrishna", "year": 2008, "hookStartSec": 44, "energy": 9.5, "query": "Gaja Bangari Yare Nee video song Darshan Navya Nair Harikrishna"},
    {"title": "Kuntbidthini", "artist": "Sadhu Kokila", "year": 2004, "hookStartSec": 40, "energy": 10, "query": "Kalasipalya Kuntbidthini video song Darshan Rakshita Sadhu Kokila"},
    {"title": "Jinke Marina", "artist": "Gurukiran", "year": 2004, "hookStartSec": 42, "energy": 10, "query": "Kanti Jinke Marina video song Sriimurali Ramya Gurukiran"},
    {"title": "Preethse Antha", "artist": "RP Patnaik", "year": 2003, "hookStartSec": 46, "energy": 9, "query": "Excuse Me Preethse Antha video song Sunil Raoh Ramya RP Patnaik"},

    # Additional Kannada blockbusters
    {"title": "Sikpatte Ishta", "artist": "Upendra, V. Harikrishna", "year": 2010, "hookStartSec": 44, "energy": 9.5, "query": "Super Sikpatte Ishta video song Upendra Nayanthara Harikrishna"},
    {"title": "Tinbedakammi", "artist": "Poornachandra Tejaswi", "year": 2013, "hookStartSec": 40, "energy": 9.5, "query": "Lucia Tinbedakammi video song Sathish Ninasam Poornachandra Tejaswi"},
    {"title": "Soul of Dia", "artist": "Sanjith Hegde, B. Ajaneesh Loknath", "year": 2020, "hookStartSec": 45, "energy": 9, "query": "Dia Soul of Dia video song Sanjith Hegde Ajaneesh Loknath"},
    {"title": "Bere Yaaro", "artist": "V. Harikrishna", "year": 2013, "hookStartSec": 44, "energy": 9, "query": "Kaddipudi Bere Yaaro video song Shiva Rajkumar Radhika Pandit Harikrishna"},
    {"title": "Om Hindu Guruthu", "artist": "Hemanth, Kaviraj, Hamsalekha", "year": 2013, "hookStartSec": 42, "energy": 9.5, "query": "Raja Huli Om Hindu Guruthu video song Yash Hamsalekha"},
    {"title": "Falling in Love", "artist": "Hamsalekha", "year": 2013, "hookStartSec": 46, "energy": 9, "query": "Raja Huli Falling in Love video song Yash Meghana Raj Hamsalekha"},
    {"title": "Baite Baite", "artist": "Arjun Janya", "year": 2013, "hookStartSec": 40, "energy": 9.5, "query": "Varadanayaka Baite Baite video song Sudeep Chiranjeevi Sarja Arjun Janya"},
    {"title": "Hello Hello", "artist": "Arjun Janya", "year": 2013, "hookStartSec": 42, "energy": 9.5, "query": "Bachchan Hello Hello video song Sudeep Bhavana Arjun Janya"},
    {"title": "Upadhyaksha Title Song", "artist": "Arjun Janya", "year": 2024, "hookStartSec": 38, "energy": 9.5, "query": "Upadhyaksha Title Song Chikkanna Arjun Janya Anand Audio"},
    {"title": "Martin Theme", "artist": "Mani Sharma", "year": 2024, "hookStartSec": 35, "energy": 10, "query": "Martin Title Track video song Dhruva Sarja Mani Sharma Zee Music South"},
    {"title": "Kantara Leelamma", "artist": "B. Ajaneesh Loknath", "year": 2022, "hookStartSec": 38, "energy": 9.5, "query": "Kantara Leelamma song Ajaneesh Loknath Hombale Films"},
    {"title": "Prathikara", "artist": "Ravi Basrur", "year": 2023, "hookStartSec": 40, "energy": 10, "query": "Salaar Prathikara Kannada video song Prabhas Ravi Basrur Hombale Films"},
    {"title": "Sooreede Kannada", "artist": "Ravi Basrur", "year": 2023, "hookStartSec": 45, "energy": 9.5, "query": "Salaar Soorya Sooreede Kannada song Prabhas Prithviraj Ravi Basrur Hombale"},
    {"title": "KGF Monster Energy", "artist": "Ravi Basrur", "year": 2018, "hookStartSec": 30, "energy": 10, "query": "KGF Monster Theme BGM Ravi Basrur Yash Hombale Films"},
    {"title": "Tagaru Theme", "artist": "Charan Raj", "year": 2018, "hookStartSec": 32, "energy": 10, "query": "Tagaru Theme Music Shiva Rajkumar Charan Raj PRK Audio"},
    {"title": "Birbal Title Track", "artist": "Saurabh Vaibhav", "year": 2019, "hookStartSec": 38, "energy": 9, "query": "Birbal Title Track M.G. Srinivas Saurabh Vaibhav"},
    {"title": "Majestic Theme", "artist": "Sadhu Kokila", "year": 2002, "hookStartSec": 35, "energy": 10, "query": "Majestic Title Theme Darshan Sadhu Kokila"},
    {"title": "Alamelamma", "artist": "Judah Sandhy", "year": 2017, "hookStartSec": 42, "energy": 9, "query": "Operation Alamelamma Title Track Rishi Judah Sandhy"},
    {"title": "Santhu Straight Forward Title", "artist": "V. Harikrishna", "year": 2016, "hookStartSec": 36, "energy": 10, "query": "Santhu Straight Forward Title Song Yash V Harikrishna"}
]

ODIA_CANDIDATES = [
    # Rangabati & Folk Anthems
    {"title": "Rangabati (Original)", "artist": "Jitendra Haripal, Krishna Patel", "year": 1979, "hookStartSec": 35, "energy": 10, "query": "Rangabati Original Sambalpuri Song Jitendra Haripal Krishna Patel"},
    {"title": "Rangabati Coke Studio", "artist": "Sona Mohapatra, Rituraj Mohanty, Ram Sampath", "year": 2015, "hookStartSec": 50, "energy": 10, "query": "Rangabati Coke Studio MTV Season 4 Sona Mohapatra Rituraj Ram Sampath"},
    {"title": "Sambalpuri Dalkhai", "artist": "Jitendra Haripal, Traditional", "year": 2018, "hookStartSec": 40, "energy": 10, "query": "Dalkhai Re Dalkhai Sambalpuri folk song Jitendra Haripal"},
    {"title": "Rasarkeli Bo", "artist": "Traditional Sambalpuri Folk", "year": 2019, "hookStartSec": 38, "energy": 9.5, "query": "Rasarkeli Bo Sambalpuri song official video"},
    {"title": "Hai Re Hai", "artist": "Mantu Chhuria", "year": 2020, "hookStartSec": 42, "energy": 10, "query": "Hai Re Hai Mantu Chhuria Sambalpuri hit video song"},
    
    # Mantu Chhuria Sambalpuri Hits
    {"title": "Pua Mora Bhola Shankara", "artist": "Mantu Chhuria", "year": 2021, "hookStartSec": 45, "energy": 10, "query": "Pua Mora Bhola Shankara Mantu Chhuria Sambalpuri hit song"},
    {"title": "Sambalpuria Babu", "artist": "Mantu Chhuria", "year": 2019, "hookStartSec": 38, "energy": 10, "query": "Sambalpuria Babu Mantu Chhuria official video song"},
    {"title": "Mahima", "artist": "Mantu Chhuria", "year": 2020, "hookStartSec": 40, "energy": 9.5, "query": "Mahima Mantu Chhuria Sambalpuri video song"},
    {"title": "Gulab Jamun", "artist": "Mantu Chhuria, Asima Panda", "year": 2021, "hookStartSec": 44, "energy": 10, "query": "Gulab Jamun Mantu Chhuria Asima Panda Sambalpuri video song"},
    {"title": "Aji Kali Ka Toka", "artist": "Mantu Chhuria", "year": 2019, "hookStartSec": 42, "energy": 10, "query": "Aji Kali Ka Toka Mantu Chhuria Sambalpuri song"},
    {"title": "Tor Bapke Pachar", "artist": "Mantu Chhuria", "year": 2020, "hookStartSec": 38, "energy": 10, "query": "Tor Bapke Pachar Mantu Chhuria Sambalpuri song"},
    {"title": "Tor Chati Tale Gulaab Ka Phool", "artist": "Mantu Chhuria", "year": 2021, "hookStartSec": 46, "energy": 9.5, "query": "Tor Chati Tale Gulaab Ka Phool Mantu Chhuria Sambalpuri song"},
    {"title": "Selfie Beli", "artist": "Mantu Chhuria, Asima Panda", "year": 2018, "hookStartSec": 40, "energy": 10, "query": "Selfie Beli Mantu Chhuria Asima Panda Sambalpuri song"},
    {"title": "Chhata", "artist": "Mantu Chhuria", "year": 2019, "hookStartSec": 35, "energy": 9.5, "query": "Chhata Mantu Chhuria Sambalpuri video song"},
    {"title": "Sambalpuri Mashup", "artist": "Mantu Chhuria", "year": 2021, "hookStartSec": 45, "energy": 10, "query": "Sambalpuri Mashup Mantu Chhuria official video"},
    {"title": "Aashiq Babu", "artist": "Mantu Chhuria", "year": 2022, "hookStartSec": 42, "energy": 9.5, "query": "Aashiq Babu Mantu Chhuria Sambalpuri video song"},
    {"title": "Pagal Premi", "artist": "Mantu Chhuria", "year": 2020, "hookStartSec": 38, "energy": 9.5, "query": "Pagal Premi Mantu Chhuria Sambalpuri video song"},
    {"title": "Tuku Tuku Gali", "artist": "Mantu Chhuria", "year": 2021, "hookStartSec": 40, "energy": 10, "query": "Tuku Tuku Gali Mantu Chhuria Sambalpuri song"},
    {"title": "Bhabhabhata", "artist": "Mantu Chhuria", "year": 2022, "hookStartSec": 36, "energy": 9.5, "query": "Bhabhabhata Mantu Chhuria Sambalpuri song"},

    # Asima Panda Hits
    {"title": "Dhol Nishan", "artist": "Asima Panda", "year": 2020, "hookStartSec": 44, "energy": 10, "query": "Dhol Nishan Asima Panda Sambalpuri video song"},
    {"title": "Kalia Mora Mo Priya", "artist": "Asima Panda", "year": 2021, "hookStartSec": 48, "energy": 9.5, "query": "Kalia Mora Mo Priya Asima Panda Odia song"},
    {"title": "Hula Huli", "artist": "Asima Panda", "year": 2019, "hookStartSec": 42, "energy": 10, "query": "Hula Huli Asima Panda Sambalpuri video song"},
    {"title": "College Girl", "artist": "Asima Panda", "year": 2020, "hookStartSec": 38, "energy": 9.5, "query": "College Girl Asima Panda Sambalpuri song"},
    {"title": "Gura Gura", "artist": "Asima Panda", "year": 2021, "hookStartSec": 40, "energy": 10, "query": "Gura Gura Asima Panda Sambalpuri video song"},
    {"title": "To Jhia Ta Heroine Lagi", "artist": "Asima Panda", "year": 2021, "hookStartSec": 42, "energy": 9.5, "query": "To Jhia Ta Heroine Lagi Asima Panda Sambalpuri song"},
    {"title": "Desi Munda", "artist": "Asima Panda", "year": 2022, "hookStartSec": 36, "energy": 10, "query": "Desi Munda Asima Panda Sambalpuri song"},
    {"title": "Babusan", "artist": "Asima Panda", "year": 2020, "hookStartSec": 40, "energy": 9.5, "query": "Babusan Asima Panda Odia video song"},
    {"title": "Chori Chori Dil Chori", "artist": "Asima Panda", "year": 2021, "hookStartSec": 45, "energy": 9.5, "query": "Chori Chori Dil Chori Asima Panda Sambalpuri video song"},
    {"title": "Chulbuli", "artist": "Asima Panda", "year": 2022, "hookStartSec": 38, "energy": 10, "query": "Chulbuli Asima Panda Sambalpuri song"},
    {"title": "Tora Hasare Kete Jadu", "artist": "Asima Panda", "year": 2021, "hookStartSec": 46, "energy": 9, "query": "Tora Hasare Kete Jadu Asima Panda Odia song"},
    {"title": "O Balma", "artist": "Asima Panda", "year": 2021, "hookStartSec": 42, "energy": 9.5, "query": "O Balma Asima Panda Sambalpuri song"},
    {"title": "Sundari Phula", "artist": "Asima Panda", "year": 2022, "hookStartSec": 40, "energy": 9.5, "query": "Sundari Phula Asima Panda Sambalpuri video song"},

    # Humane Sagar Blockbusters
    {"title": "Tu Mo Love Story Title Track", "artist": "Humane Sagar, Ananya Nanda", "year": 2017, "hookStartSec": 52, "energy": 9.5, "query": "Tu Mo Love Story Title Track Humane Sagar Ananya Nanda Tarang Music"},
    {"title": "Ishq Tu Hi Tu", "artist": "Humane Sagar", "year": 2015, "hookStartSec": 48, "energy": 9.5, "query": "Ishq Tu Hi Tu Title Track Humane Sagar Tarang Music"},
    {"title": "To Akhire Mu", "artist": "Humane Sagar", "year": 2017, "hookStartSec": 50, "energy": 9.5, "query": "To Akhire Mu Title Song Humane Sagar Babushan Tarang Music"},
    {"title": "Chehera", "artist": "Humane Sagar", "year": 2018, "hookStartSec": 46, "energy": 9.5, "query": "Chehera Humane Sagar official Odia video song"},
    {"title": "Baby Title Track", "artist": "Humane Sagar", "year": 2016, "hookStartSec": 44, "energy": 10, "query": "Baby Title Track Anubhav Mohanty Humane Sagar OdiaONE"},
    {"title": "Love Station", "artist": "Humane Sagar", "year": 2016, "hookStartSec": 42, "energy": 10, "query": "Love Station Title Track Babushan Elina Humane Sagar Tarang Music"},
    {"title": "Sister Sridevi", "artist": "Humane Sagar, Sunidhi Chauhan", "year": 2017, "hookStartSec": 45, "energy": 10, "query": "Sister Sridevi Title Song Babushan Sivani Humane Sagar Tarang Music"},
    {"title": "Sundergarh Ra Salman Khan", "artist": "Humane Sagar", "year": 2018, "hookStartSec": 40, "energy": 10, "query": "Sundergarh Ra Salman Khan Title Song Babushan Humane Sagar Tarang Music"},
    {"title": "Hero No 1", "artist": "Humane Sagar", "year": 2017, "hookStartSec": 42, "energy": 10, "query": "Hero No 1 Title Song Babushan Humane Sagar Tarang Music"},
    {"title": "Tu Kahibu Na Mu", "artist": "Humane Sagar", "year": 2018, "hookStartSec": 48, "energy": 9.5, "query": "Tu Kahibu Na Mu Humane Sagar Odia romantic song Tarang Music"},
    {"title": "Romeo Raja", "artist": "Humane Sagar", "year": 2020, "hookStartSec": 44, "energy": 9.5, "query": "Romeo Raja Title Song Amlan Humane Sagar Tarang Music"},
    {"title": "Abhay Title Song", "artist": "Humane Sagar", "year": 2017, "hookStartSec": 42, "energy": 10, "query": "Abhay Title Song Anubhav Mohanty Humane Sagar Tarang Music"},
    {"title": "Prem Kumar", "artist": "Humane Sagar", "year": 2018, "hookStartSec": 45, "energy": 10, "query": "Prem Kumar Title Song Anubhav Mohanty Humane Sagar Tarang Music"},
    {"title": "Tu Mo Hero", "artist": "Humane Sagar", "year": 2017, "hookStartSec": 40, "energy": 10, "query": "Tu Mo Hero Title Song Humane Sagar Tarang Music"},
    {"title": "Golmaal Love", "artist": "Humane Sagar", "year": 2019, "hookStartSec": 42, "energy": 9.5, "query": "Golmaal Love Title Song Babushan Tamanna Humane Sagar Tarang Music"},
    {"title": "Tora Dina Sarigala", "artist": "Humane Sagar", "year": 2019, "hookStartSec": 44, "energy": 9, "query": "Tora Dina Sarigala Humane Sagar Odia song"},
    {"title": "Premam Title Track", "artist": "Humane Sagar", "year": 2022, "hookStartSec": 46, "energy": 9.5, "query": "Premam Title Track Babushan Prakruti Humane Sagar"},
    {"title": "Dil Diwana Heigala", "artist": "Humane Sagar", "year": 2017, "hookStartSec": 48, "energy": 9.5, "query": "Dil Diwana Heigala Title Song Babushan Sheetal Humane Sagar Tarang Music"},
    {"title": "Nijhum Rati", "artist": "Humane Sagar", "year": 2018, "hookStartSec": 50, "energy": 9, "query": "Nijhum Rati Humane Sagar Odia hit song"},
    {"title": "A Mana Mo Mana", "artist": "Humane Sagar", "year": 2019, "hookStartSec": 46, "energy": 9, "query": "A Mana Mo Mana Humane Sagar Odia song"},
    {"title": "Mana Mora Kanduchhi", "artist": "Humane Sagar", "year": 2019, "hookStartSec": 48, "energy": 9, "query": "Mana Mora Kanduchhi Humane Sagar Odia song"},
    {"title": "Mun Barsha Heijibi", "artist": "Humane Sagar", "year": 2018, "hookStartSec": 45, "energy": 9, "query": "Mun Barsha Heijibi Humane Sagar Odia song"},
    {"title": "Akhi Palakare Tu", "artist": "Humane Sagar", "year": 2018, "hookStartSec": 52, "energy": 9, "query": "Akhi Palakare Tu Humane Sagar Odia romantic song"},
    {"title": "Mo Akhire Tu", "artist": "Humane Sagar", "year": 2019, "hookStartSec": 48, "energy": 9, "query": "Mo Akhire Tu Humane Sagar Odia song"},
    {"title": "Dhire Dhire Bhala Pai Gali", "artist": "Humane Sagar", "year": 2016, "hookStartSec": 50, "energy": 9.5, "query": "Agastya Dhire Dhire Bhala Pai Gali Humane Sagar Anubhav"},
    {"title": "Agastya Title Song", "artist": "Humane Sagar", "year": 2016, "hookStartSec": 42, "energy": 10, "query": "Agastya Title Track Anubhav Mohanty Humane Sagar"},

    # Classic & High-Energy Odia Film Dance Hits
    {"title": "Chal Kariba Thia Pala", "artist": "Papu Pom Pom", "year": 2012, "hookStartSec": 40, "energy": 10, "query": "Chal Kariba Thia Pala Papu Pom Pom Balunga Toka Sarthak Music"},
    {"title": "Suna Panjuri", "artist": "Sidharth TV, Classic", "year": 1995, "hookStartSec": 45, "energy": 9, "query": "Suna Panjuri Title Song Sidharth Music"},
    {"title": "Pua Mora Kala Thakura", "artist": "Sidharth Music Classic", "year": 1988, "hookStartSec": 42, "energy": 9, "query": "Pua Mora Kala Thakura Title Song Sidharth TV"},
    {"title": "Balunga Toka Title Song", "artist": "Papu Pom Pom, Anubhav Mohanty", "year": 2011, "hookStartSec": 44, "energy": 10, "query": "Balunga Toka Title Song Anubhav Mohanty Barsha Sarthak Music"},
    {"title": "Pagala Premi Title Song", "artist": "Sabyasachi Mishra", "year": 2007, "hookStartSec": 46, "energy": 9.5, "query": "Pagala Premi Title Track Sabyasachi Arpita Sarthak Music"},
    {"title": "I Love You Title Song", "artist": "Anubhav Mohanty, Namrata Shirodkar", "year": 2004, "hookStartSec": 50, "energy": 9.5, "query": "I Love You Title Song Anubhav Mohanty Sarthak Music"},
    {"title": "Something Something Title Song", "artist": "Anubhav Mohanty, Barsha Priyadarshini", "year": 2012, "hookStartSec": 42, "energy": 10, "query": "Something Something Title Track Anubhav Mohanty Barsha Sarthak Music"},
    {"title": "Deewana Deewani", "artist": "Babushan Mohanty", "year": 2013, "hookStartSec": 45, "energy": 9.5, "query": "Deewana Deewani Title Song Babushan Mohanty Sarthak Music"},
    {"title": "Matric Fail Title Song", "artist": "Anubhav Mohanty", "year": 2012, "hookStartSec": 40, "energy": 10, "query": "Matric Fail Title Song Anubhav Mohanty Barsha Sarthak Music"},
    {"title": "ACP Ranveer Title Song", "artist": "Anubhav Mohanty", "year": 2012, "hookStartSec": 42, "energy": 10, "query": "ACP Ranveer Title Song Anubhav Mohanty Sarthak Music"},
    {"title": "Romeo The Lover Boy", "artist": "Babushan Mohanty", "year": 2009, "hookStartSec": 44, "energy": 9.5, "query": "Romeo The Lover Boy Title Track Babushan Sarthak Music"},
    {"title": "Tu Mo Girlfriend", "artist": "Babushan Mohanty", "year": 2011, "hookStartSec": 42, "energy": 9.5, "query": "Tu Mo Girlfriend Title Song Babushan Mihir Das Sarthak Music"},
    {"title": "Superstar Title Song", "artist": "Anubhav Mohanty", "year": 2013, "hookStartSec": 40, "energy": 10, "query": "Superstar Title Song Anubhav Mohanty Sarthak Music"},
    {"title": "Mu Premi Mu Pagala", "artist": "Harihar Dash", "year": 2011, "hookStartSec": 44, "energy": 10, "query": "Mu Premi Mu Pagala Title Song Harihar Dash Anubha Sarthak Music"},
    {"title": "Premi No 1", "artist": "Anubhav Mohanty", "year": 2005, "hookStartSec": 48, "energy": 9.5, "query": "Premi No 1 Title Song Anubhav Mohanty Koyel Mallick"},
    {"title": "Sanju Aau Sanjana", "artist": "Babushan Mohanty", "year": 2010, "hookStartSec": 46, "energy": 9.5, "query": "Sanju Aau Sanjana Title Song Babushan Parija Sarthak Music"},
    {"title": "Love Pain Kuchh Bhi Karega", "artist": "Babushan Mohanty", "year": 2016, "hookStartSec": 42, "energy": 10, "query": "Love Pain Kuchh Bhi Karega Title Song Babushan Supriya Tarang Music"},
    {"title": "Sriman Surdas", "artist": "Babushan Mohanty", "year": 2018, "hookStartSec": 40, "energy": 10, "query": "Sriman Surdas Title Song Babushan Bhoomika Tarang Music"},
    {"title": "Only Pyaar", "artist": "Babushan Mohanty", "year": 2018, "hookStartSec": 44, "energy": 9.5, "query": "Only Pyaar Title Song Babushan Supriya"},
    {"title": "Ajab Sanju Ra Gajab Love", "artist": "Babushan Mohanty", "year": 2019, "hookStartSec": 42, "energy": 9.5, "query": "Ajab Sanju Ra Gajab Love Title Song Babushan Archita"},
    {"title": "Golapi Golapi", "artist": "Babushan Mohanty", "year": 2014, "hookStartSec": 48, "energy": 9, "query": "Golapi Golapi Title Song Babushan Archita Sarthak Music"},
    {"title": "Loafer Title Song", "artist": "Babushan Mohanty", "year": 2011, "hookStartSec": 40, "energy": 10, "query": "Loafer Title Song Babushan Archita Sarthak Music"},
    {"title": "Daman Ekada", "artist": "Anurag Kulkarni, Gaurav Anand", "year": 2022, "hookStartSec": 45, "energy": 9.5, "query": "Daman Ekada video song Babushan Dipanwit Gaurav Anand"},
    {"title": "Daman Title Track", "artist": "Babushan Mohanty, Gaurav Anand", "year": 2022, "hookStartSec": 40, "energy": 9.5, "query": "Daman Title Song Babushan Gaurav Anand"},
    {"title": "Nichhatiya Mana", "artist": "Babushan Mohanty, Gaurav Anand", "year": 2022, "hookStartSec": 48, "energy": 9, "query": "Daman Nichhatiya Mana Babushan Gaurav Anand"},

    # More Sambalpuri Superhits
    {"title": "Dil Ka Raja", "artist": "Babu Sambalpuri", "year": 2021, "hookStartSec": 42, "energy": 10, "query": "Dil Ka Raja Sambalpuri song official video"},
    {"title": "Lali Lali Phula", "artist": "Sambalpuri Superhit", "year": 2020, "hookStartSec": 40, "energy": 9.5, "query": "Lali Lali Phula Sambalpuri video song"},
    {"title": "Mor Jamna Pari", "artist": "Sambalpuri Superhit", "year": 2019, "hookStartSec": 44, "energy": 10, "query": "Mor Jamna Pari Sambalpuri video song"},
    {"title": "Dhol Baje Re", "artist": "Sambalpuri Folk", "year": 2021, "hookStartSec": 38, "energy": 10, "query": "Dhol Baje Re Sambalpuri dance song"},
    {"title": "A Mor Sona", "artist": "Sambalpuri Hit", "year": 2020, "hookStartSec": 42, "energy": 9.5, "query": "A Mor Sona Sambalpuri song video"},
    {"title": "A Mor Pardesia", "artist": "Sambalpuri Folk", "year": 2021, "hookStartSec": 45, "energy": 9.5, "query": "A Mor Pardesia Sambalpuri song"},
    {"title": "Maya", "artist": "Sambalpuri Hit", "year": 2020, "hookStartSec": 40, "energy": 9.5, "query": "Maya Sambalpuri video song official"},
    {"title": "Tor Mor Prem Kahani", "artist": "Sambalpuri Romantic Dance", "year": 2021, "hookStartSec": 44, "energy": 9.5, "query": "Tor Mor Prem Kahani Sambalpuri video song"},
    {"title": "Sambalpuri Desi Beat", "artist": "DJ Sambalpuri", "year": 2022, "hookStartSec": 35, "energy": 10, "query": "Sambalpuri Desi Beat official dance video"},
    {"title": "Sambalpuri Dhuku Dhuku", "artist": "Sambalpuri Hit", "year": 2021, "hookStartSec": 38, "energy": 10, "query": "Dhuku Dhuku Sambalpuri song video"},
    {"title": "Jhara Phula", "artist": "Sambalpuri Song", "year": 2020, "hookStartSec": 42, "energy": 9, "query": "Jhara Phula Sambalpuri video song"},
    {"title": "Sambalpuri Karma Geet", "artist": "Folk Dance", "year": 2019, "hookStartSec": 40, "energy": 9.5, "query": "Sambalpuri Karma Geet folk dance song"},
    {"title": "Phula Baula Re", "artist": "Traditional Odia Sambalpuri", "year": 2018, "hookStartSec": 45, "energy": 9.5, "query": "Phula Baula Re traditional Sambalpuri song"},
    {"title": "Chheli Chara Toka", "artist": "Sambalpuri Hit", "year": 2020, "hookStartSec": 38, "energy": 9.5, "query": "Chheli Chara Toka Sambalpuri video song"},
    {"title": "Pua Mora Jagar Bati", "artist": "Sambalpuri Song", "year": 2021, "hookStartSec": 42, "energy": 9.5, "query": "Pua Mora Jagar Bati Sambalpuri song"},
    {"title": "Sambalpuri Mahua", "artist": "Sambalpuri Dance", "year": 2021, "hookStartSec": 36, "energy": 10, "query": "Mahua Sambalpuri video song"},
    {"title": "Kani Phula", "artist": "Sambalpuri Hit", "year": 2020, "hookStartSec": 40, "energy": 9, "query": "Kani Phula Sambalpuri song video"},
    {"title": "Jui Phula", "artist": "Sambalpuri Hit", "year": 2021, "hookStartSec": 42, "energy": 9, "query": "Jui Phula Sambalpuri song video"},
    {"title": "Baje Bainsi Nache Ghungura", "artist": "Odia Folk Dance", "year": 2018, "hookStartSec": 44, "energy": 9.5, "query": "Baje Bainsi Nache Ghungura Odia folk dance song"},
    {"title": "Jai Phula", "artist": "Odia Folk", "year": 2019, "hookStartSec": 40, "energy": 9, "query": "Jai Phula Odia folk dance song"},
    {"title": "Baje Ghadghadi Nache Mayura", "artist": "Odia Folk", "year": 2018, "hookStartSec": 42, "energy": 9.5, "query": "Baje Ghadghadi Nache Mayura Odia dance song"},
    {"title": "Sambalpuri Dhabalgiri", "artist": "Sambalpuri Folk", "year": 2020, "hookStartSec": 38, "energy": 9.5, "query": "Sambalpuri Dhabalgiri song video"},
    {"title": "Boli Boli", "artist": "Sambalpuri Dance", "year": 2021, "hookStartSec": 40, "energy": 9.5, "query": "Boli Boli Sambalpuri dance song"},
    {"title": "Luku Chhuku", "artist": "Sambalpuri Hit", "year": 2021, "hookStartSec": 36, "energy": 10, "query": "Luku Chhuku Sambalpuri song video"},
    {"title": "Sambalpuria Chora", "artist": "Sambalpuri Dance", "year": 2020, "hookStartSec": 42, "energy": 9.5, "query": "Sambalpuria Chora Sambalpuri song"},
    {"title": "Rani Gula", "artist": "Sambalpuri Song", "year": 2021, "hookStartSec": 38, "energy": 9.5, "query": "Rani Gula Sambalpuri video song"},
    {"title": "Nuakhai Juhar", "artist": "Sambalpuri Folk Anthem", "year": 2020, "hookStartSec": 44, "energy": 9.5, "query": "Nuakhai Juhar Sambalpuri festival song"},
    {"title": "Nuakhai Bhetghat", "artist": "Sambalpuri Festival Song", "year": 2021, "hookStartSec": 42, "energy": 9.5, "query": "Nuakhai Bhetghat Sambalpuri video song"},
    {"title": "Sambalpuri Ghumra", "artist": "Folk Traditional", "year": 2019, "hookStartSec": 35, "energy": 10, "query": "Sambalpuri Ghumra dance song video"},
    {"title": "Sambalpuri Nacha", "artist": "Folk Rhythm", "year": 2020, "hookStartSec": 38, "energy": 10, "query": "Sambalpuri Nacha folk rhythm dance song"},

    # Devotional & Cultural Celebration Dance Hits
    {"title": "Chaka Aakhi Sabu Dekhuchi", "artist": "Bhikhari Bala, Classic", "year": 1985, "hookStartSec": 45, "energy": 9, "query": "Chaka Aakhi Sabu Dekhuchi Bhikhari Bala Sidharth Music"},
    {"title": "Jagannatha Swami Nayana Pathagami", "artist": "Devotional Anthem", "year": 2015, "hookStartSec": 40, "energy": 9.5, "query": "Jagannatha Swami Nayana Pathagami Odia song"},
    {"title": "Kalia Re Kalia", "artist": "Devotional Dance Hit", "year": 2018, "hookStartSec": 44, "energy": 9.5, "query": "Kalia Re Kalia Odia devotional song Sidharth Music"},
    {"title": "Ahe Nila Saila", "artist": "Bhikhari Bala", "year": 1980, "hookStartSec": 48, "energy": 9, "query": "Ahe Nila Saila Bhikhari Bala Odia devotional Sidharth Music"},
    {"title": "Bada Danda Re Nache Gauri", "artist": "Festival Dance", "year": 2019, "hookStartSec": 42, "energy": 10, "query": "Bada Danda Re Nache Gauri Odia song Sidharth TV"},
    {"title": "Rathayatra Danda", "artist": "Jagannath Dance Hit", "year": 2021, "hookStartSec": 40, "energy": 9.5, "query": "Rathayatra Danda Odia devotional dance song"},
    {"title": "Kalia Bada Danda Re", "artist": "Bhajan Dance", "year": 2020, "hookStartSec": 44, "energy": 9.5, "query": "Kalia Bada Danda Re Odia song Sidharth Music"},

    # Additional Popular Modern Odia Tracks
    {"title": "Tike Tike Achha Lage", "artist": "Babushan Mohanty", "year": 2015, "hookStartSec": 46, "energy": 9, "query": "Tike Tike Achha Lage Sanju Aau Sanjana Babushan Sarthak Music"},
    {"title": "Tu Mora Dil Ki Dhadkan", "artist": "Odia Hit Song", "year": 2018, "hookStartSec": 42, "energy": 9, "query": "Tu Mora Dil Ki Dhadkan Odia song Tarang Music"},
    {"title": "Chal Tike Prema Kariba", "artist": "Odia Hit Song", "year": 2021, "hookStartSec": 44, "energy": 9.5, "query": "Chal Tike Prema Kariba Odia movie song"},
    {"title": "Jhia Ta Badmas", "artist": "Odia Dance Song", "year": 2019, "hookStartSec": 38, "energy": 10, "query": "Jhia Ta Badmas Odia dance song Tarang Music"},
    {"title": "Mu Eka Tumara", "artist": "Sabyasachi, Archita", "year": 2013, "hookStartSec": 48, "energy": 9, "query": "Mu Eka Tumara Title Song Sabyasachi Archita Sarthak Music"},
    {"title": "To Sathire Katai Debi", "artist": "Humane Sagar", "year": 2020, "hookStartSec": 46, "energy": 9, "query": "To Sathire Katai Debi Humane Sagar Odia song"},
    {"title": "Priya Re Priya Re", "artist": "Humane Sagar", "year": 2021, "hookStartSec": 44, "energy": 9, "query": "Priya Re Priya Re Humane Sagar Odia song"},
    {"title": "Mayabini Bana Joshna", "artist": "Akshaya Mohanty Classic", "year": 1982, "hookStartSec": 48, "energy": 9, "query": "Mayabini Bana Joshna Akshaya Mohanty classic Odia song"},
    {"title": "Jaiphula Re", "artist": "Odia Folk Song", "year": 2019, "hookStartSec": 40, "energy": 9.5, "query": "Jaiphula Re Odia folk song official video"},
    {"title": "Nache Odisha Nache", "artist": "Odia Dance Anthem", "year": 2021, "hookStartSec": 38, "energy": 10, "query": "Nache Odisha Nache dance celebration song"},
    {"title": "Halia", "artist": "Sambalpuri Folk Song", "year": 2020, "hookStartSec": 42, "energy": 9.5, "query": "Halia Sambalpuri folk song video"},
    {"title": "Karama Puja Song", "artist": "Sambalpuri Folk", "year": 2021, "hookStartSec": 40, "energy": 9.5, "query": "Karama Puja Sambalpuri traditional folk song"},
    {"title": "Tu Eka Aama Saha Bharasa", "artist": "Odia Classic Devotional", "year": 1986, "hookStartSec": 46, "energy": 9, "query": "Tu Eka Aama Saha Bharasa Odia song Sidharth TV"},
    # Extra Top Odia & Sambalpuri Hits
    {"title": "Chuni Tale Black Money", "artist": "Mantu Chhuria, Asima Panda", "year": 2021, "hookStartSec": 40, "energy": 10, "query": "Chuni Tale Black Money Mantu Chhuria Asima Panda Sambalpuri song"},
    {"title": "Rangila Toka", "artist": "Papu Pom Pom", "year": 2012, "hookStartSec": 42, "energy": 10, "query": "Rangila Toka Title Song Papu Pom Pom Sarthak Music"},
    {"title": "Rourkela Wali", "artist": "Sambalpuri Hit", "year": 2021, "hookStartSec": 38, "energy": 9.5, "query": "Rourkela Wali Sambalpuri video song"},
    {"title": "Sambalpuri Chutkuchuta", "artist": "Sambalpuri Folk", "year": 2019, "hookStartSec": 40, "energy": 10, "query": "Sambalpuri Chutkuchuta folk dance song"},
    {"title": "Basi Baje", "artist": "Asima Panda", "year": 2021, "hookStartSec": 42, "energy": 9.5, "query": "Basi Baje Asima Panda Sambalpuri song"},
    {"title": "Sambalpuri Gulgula", "artist": "Mantu Chhuria", "year": 2020, "hookStartSec": 38, "energy": 10, "query": "Gulgula Mantu Chhuria Sambalpuri video song"},
    {"title": "Gaan Toki", "artist": "Mantu Chhuria", "year": 2022, "hookStartSec": 40, "energy": 9.5, "query": "Gaan Toki Mantu Chhuria Sambalpuri song"},
    {"title": "Dil Kahuchi Tu Mo Pain", "artist": "Humane Sagar", "year": 2018, "hookStartSec": 46, "energy": 9, "query": "Dil Kahuchi Tu Mo Pain Humane Sagar Odia song"},
    {"title": "Mate Ta Prema Heigala", "artist": "Humane Sagar, Ananya Nanda", "year": 2017, "hookStartSec": 48, "energy": 9.5, "query": "Mate Ta Prema Heigala Humane Sagar Tarang Music"},
    {"title": "Tate Mu Jete Chahunche", "artist": "Humane Sagar", "year": 2019, "hookStartSec": 50, "energy": 9, "query": "Tate Mu Jete Chahunche Humane Sagar Odia romantic song"},
    {"title": "Kahinki Tu Ete Mane Padu", "artist": "Humane Sagar", "year": 2018, "hookStartSec": 46, "energy": 9, "query": "Kahinki Tu Ete Mane Padu Humane Sagar Odia song"},
    {"title": "Bou", "artist": "Humane Sagar", "year": 2020, "hookStartSec": 45, "energy": 9, "query": "Bou Humane Sagar Odia hit song"},
    {"title": "Tor Mor Jodi", "artist": "Sambalpuri Hit", "year": 2021, "hookStartSec": 42, "energy": 9.5, "query": "Tor Mor Jodi Sambalpuri video song"},
    {"title": "Sambalpuria Pila", "artist": "Mantu Chhuria", "year": 2021, "hookStartSec": 38, "energy": 10, "query": "Sambalpuria Pila Mantu Chhuria Sambalpuri song"},
    {"title": "Chaka Nayana", "artist": "Devotional Dance", "year": 2020, "hookStartSec": 44, "energy": 9.5, "query": "Chaka Nayana Odia devotional song Sidharth TV"},
    {"title": "Mu Paradesi Chadhei", "artist": "Akshaya Mohanty", "year": 1985, "hookStartSec": 48, "energy": 9, "query": "Mu Paradesi Chadhei Akshaya Mohanty classic Odia song"},
    {"title": "Dahi Machha", "artist": "Odia Folk", "year": 2019, "hookStartSec": 40, "energy": 9.5, "query": "Dahi Machha Odia traditional dance song"},
    {"title": "Mo Priya Tharu Kiye Adhika Sundara", "artist": "Odia Classic", "year": 1982, "hookStartSec": 45, "energy": 9, "query": "Mo Priya Tharu Kiye Adhika Sundara classic Odia song"},
    {"title": "Paparapa", "artist": "Odia Party Song", "year": 2021, "hookStartSec": 38, "energy": 10, "query": "Paparapa Odia dance party song Tarang Music"},
    {"title": "Hai Mora Dil", "artist": "Humane Sagar", "year": 2020, "hookStartSec": 44, "energy": 9.5, "query": "Hai Mora Dil Humane Sagar Odia song"}
]

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True,
    'default_search': 'ytsearch3',
}

def search_and_verify(candidate):
    query = candidate.get('query') or f"{candidate['title']} {candidate['artist']} official video"
    hook_start = int(candidate.get('hookStartSec', 42))
    hook_end = int(candidate.get('hookEndSec') or (hook_start + 40))
    entry_sec = max(0, hook_start - 15)
    exit_sec = hook_end + 20
    energy = candidate.get('energy', 9.5)
    year = int(candidate.get('year', 2021))
    title = candidate['title']
    artist = candidate['artist']

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch3:{query}", download=False)
            if not res or 'entries' not in res or not res['entries']:
                return None

            for entry in res['entries']:
                vid = entry.get('id')
                if not vid or len(vid) != 11 or vid in BLACKLIST:
                    continue

                # Verify via oEmbed
                try:
                    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
                    req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=5) as r:
                        if r.status == 200:
                            dur = int(entry.get('duration') or 220)
                            if dur < 110 or dur > 500:
                                dur = 220
                            
                            # Ensure entry, hook, exit bounds
                            actual_hook_start = min(hook_start, dur - 40)
                            actual_hook_end = min(actual_hook_start + 35, dur - 5)
                            actual_entry = max(0, actual_hook_start - 15)
                            actual_exit = min(dur, actual_hook_end + 20)

                            return {
                                "title": title,
                                "artist": artist,
                                "year": year,
                                "durationSec": dur,
                                "hookStartSec": actual_hook_start,
                                "hookEndSec": actual_hook_end,
                                "entrySec": actual_entry,
                                "exitSec": actual_exit,
                                "videoId": vid,
                                "energy": energy
                            }
                except Exception:
                    continue
    except Exception as e:
        print(f"Error on {title}: {e}")

    return None

def main():
    print(f"Total Kannada candidates: {len(KANNADA_CANDIDATES)}")
    print(f"Total Odia candidates: {len(ODIA_CANDIDATES)}")

    results = {
        "kannada-hits": [],
        "odia-hits": []
    }
    used_vids = set()

    # Process Kannada
    print("\n--- Processing kannada-hits ---")
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(search_and_verify, s): s for s in KANNADA_CANDIDATES}
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            if res:
                vid = res['videoId']
                if vid not in used_vids:
                    used_vids.add(vid)
                    results["kannada-hits"].append(res)
                    print(f" [KANNADA {len(results['kannada-hits'])}] {res['title']} -> {vid} ({res['durationSec']}s)")
                else:
                    print(f" [SKIP DUP] {res['title']} -> {vid}")
            else:
                s = futures[future]
                print(f" [FAILED] {s['title']}")

    # Process Odia
    print("\n--- Processing odia-hits ---")
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
        futures = {executor.submit(search_and_verify, s): s for s in ODIA_CANDIDATES}
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            if res:
                vid = res['videoId']
                if vid not in used_vids:
                    used_vids.add(vid)
                    results["odia-hits"].append(res)
                    print(f" [ODIA {len(results['odia-hits'])}] {res['title']} -> {vid} ({res['durationSec']}s)")
                else:
                    print(f" [SKIP DUP] {res['title']} -> {vid}")
            else:
                s = futures[future]
                print(f" [FAILED] {s['title']}")

    print(f"\nFinal tally: kannada-hits: {len(results['kannada-hits'])}, odia-hits: {len(results['odia-hits'])}")
    
    out_path = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200\agent_8.json"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Saved results to {out_path} successfully!")

if __name__ == '__main__':
    main()
