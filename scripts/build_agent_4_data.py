import json
import concurrent.futures
import yt_dlp
import re
import os

KUTHU_RAW = [
    {
        "title": "Vaathi Coming",
        "artist": "Anirudh Ravichander, Gana Balachandar",
        "movie": "Master",
        "year": "2021",
        "hookStartSec": 56,
        "hookEndSec": 96,
        "energy": 10,
        "query": "Master Vaathi Coming Video Thalapathy Vijay Anirudh"
    },
    {
        "title": "Aaluma Doluma",
        "artist": "Anirudh Ravichander, Badshah",
        "movie": "Vedalam",
        "year": "2015",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 10,
        "query": "Vedalam Aaluma Doluma Video Song Ajith Anirudh"
    },
    {
        "title": "Arabic Kuthu - Halamithi Habibo",
        "artist": "Anirudh Ravichander, Jonita Gandhi",
        "movie": "Beast",
        "year": "2022",
        "hookStartSec": 54,
        "hookEndSec": 94,
        "energy": 9,
        "query": "Beast Arabic Kuthu Video Song Thalapathy Vijay Pooja Hegde Anirudh"
    },
    {
        "title": "Kaavaalaa",
        "artist": "Anirudh Ravichander, Shilpa Rao",
        "movie": "Jailer",
        "year": "2023",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Jailer Kaavaalaa Video Song Rajinikanth Tamannaah Anirudh"
    },
    {
        "title": "Naa Ready",
        "artist": "Anirudh Ravichander, Thalapathy Vijay, Asal Kolaar",
        "movie": "Leo",
        "year": "2023",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 10,
        "query": "Leo Naa Ready Song Video Thalapathy Vijay Anirudh"
    },
    {
        "title": "Jalabulanjangu",
        "artist": "Anirudh Ravichander",
        "movie": "Don",
        "year": "2022",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 9,
        "query": "Don Jalabulanjangu Video Song Sivakarthikeyan Anirudh"
    },
    {
        "title": "Sodakku",
        "artist": "Anirudh Ravichander, Anthony Daasan",
        "movie": "Thaanaa Serndha Koottam",
        "year": "2018",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 9,
        "query": "Thaanaa Serndha Koottam Sodakku Video Song Suriya Anirudh"
    },
    {
        "title": "Marana Mass",
        "artist": "Anirudh Ravichander, S.P. Balasubrahmanyam",
        "movie": "Petta",
        "year": "2019",
        "hookStartSec": 55,
        "hookEndSec": 95,
        "energy": 10,
        "query": "Petta Marana Mass Video Song Rajinikanth Anirudh"
    },
    {
        "title": "Why This Kolaveri Di",
        "artist": "Anirudh Ravichander, Dhanush",
        "movie": "3",
        "year": "2011",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 8,
        "query": "3 Why This Kolaveri Di Official Video Song Dhanush Anirudh"
    },
    {
        "title": "Maari Thara Local",
        "artist": "Anirudh Ravichander, Dhanush",
        "movie": "Maari",
        "year": "2015",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Maari Thara Local Video Song Dhanush Anirudh"
    },
    {
        "title": "Don'u Don'u Don'u",
        "artist": "Anirudh Ravichander, Alisha Thomas",
        "movie": "Maari",
        "year": "2015",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 8,
        "query": "Maari Donu Donu Donu Video Song Dhanush Kajal Aggarwal Anirudh"
    },
    {
        "title": "Chumma Kizhi",
        "artist": "Anirudh Ravichander, S.P. Balasubrahmanyam",
        "movie": "Darbar",
        "year": "2020",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 9,
        "query": "Darbar Chumma Kizhi Video Song Rajinikanth Anirudh"
    },
    {
        "title": "Chellamma",
        "artist": "Anirudh Ravichander, Jonita Gandhi",
        "movie": "Doctor",
        "year": "2021",
        "hookStartSec": 52,
        "hookEndSec": 92,
        "energy": 8,
        "query": "Doctor Chellamma Lyric Video Sivakarthikeyan Anirudh Nelson"
    },
    {
        "title": "Dippam Dappam",
        "artist": "Anirudh Ravichander, Anthony Daasan",
        "movie": "Kaathuvaakula Rendu Kaadhal",
        "year": "2022",
        "hookStartSec": 36,
        "hookEndSec": 76,
        "energy": 9,
        "query": "Dippam Dappam Video Song Kaathuvaakula Rendu Kaadhal Anirudh"
    },
    {
        "title": "Two Two Two",
        "artist": "Anirudh Ravichander, Sunidhi Chauhan, Sanjana Kalmanje",
        "movie": "Kaathuvaakula Rendu Kaadhal",
        "year": "2021",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Two Two Two Lyric Video Kaathuvaakula Rendu Kaadhal Anirudh"
    },
    {
        "title": "Private Party",
        "artist": "Anirudh Ravichander, Jonita Gandhi",
        "movie": "Don",
        "year": "2022",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 8,
        "query": "Don Private Party Video Song Sivakarthikeyan Priyanka Mohan Anirudh"
    },
    {
        "title": "Senjitaley",
        "artist": "Anirudh Ravichander",
        "movie": "Remo",
        "year": "2016",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 8,
        "query": "Remo Senjitaley Video Song Sivakarthikeyan Keerthi Suresh Anirudh"
    },
    {
        "title": "Remo Nee Kadhalan",
        "artist": "Anirudh Ravichander",
        "movie": "Remo",
        "year": "2016",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 8,
        "query": "Remo Nee Kadhalan Video Song Sivakarthikeyan Anirudh"
    },
    {
        "title": "Open The Tasmac",
        "artist": "Anirudh Ravichander, Deva",
        "movie": "Maan Karate",
        "year": "2014",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Maan Karate Open The Tasmac Video Song Sivakarthikeyan Anirudh"
    },
    {
        "title": "Local Boys",
        "artist": "Anirudh Ravichander, Dhanush, Velmurugan",
        "movie": "Ethir Neechal",
        "year": "2013",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 9,
        "query": "Ethir Neechal Local Boys Video Song Dhanush Sivakarthikeyan Anirudh"
    },
    {
        "title": "Ethir Neechal Adi",
        "artist": "Anirudh Ravichander, Hiphop Tamizha, Yo Yo Honey Singh",
        "movie": "Ethir Neechal",
        "year": "2013",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 9,
        "query": "Ethir Neechal Adi Video Song Sivakarthikeyan Priya Anand Anirudh"
    },
    {
        "title": "Rowdy Baby",
        "artist": "Yuvan Shankar Raja, Dhanush, Dhee",
        "movie": "Maari 2",
        "year": "2018",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "Maari 2 Rowdy Baby Video Song Dhanush Sai Pallavi Yuvan Shankar Raja"
    },
    {
        "title": "Machi Open The Bottle",
        "artist": "Yuvan Shankar Raja, Mano, Premji Amaren, Haricharan, Tippu",
        "movie": "Mankatha",
        "year": "2011",
        "hookStartSec": 52,
        "hookEndSec": 92,
        "energy": 9,
        "query": "Mankatha Machi Open The Bottle Video Song Ajith Kumar Yuvan"
    },
    {
        "title": "Vilaiyaadu Mankatha",
        "artist": "Yuvan Shankar Raja, Sucharitha, Premji Amaren",
        "movie": "Mankatha",
        "year": "2011",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 9,
        "query": "Mankatha Vilaiyaadu Mankatha Video Song Ajith Kumar Yuvan"
    },
    {
        "title": "Saroja Saman Nikalo",
        "artist": "Yuvan Shankar Raja, Shankar Mahadevan, Premji Amaren",
        "movie": "Chennai 600028",
        "year": "2007",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Chennai 600028 Saroja Saman Nikalo Video Song Yuvan Shankar Raja"
    },
    {
        "title": "Otha Sollaala",
        "artist": "G.V. Prakash Kumar, Velmurugan",
        "movie": "Aadukalam",
        "year": "2011",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 9,
        "query": "Aadukalam Otha Sollaala Video Song Dhanush GV Prakash"
    },
    {
        "title": "Danga Maari Oodhari",
        "artist": "Harris Jayaraj, Dhanush, Marana Gana Viji, Naveen Madhav",
        "movie": "Anegan",
        "year": "2015",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "Anegan Danga Maari Oodhari Video Song Dhanush Harris Jayaraj"
    },
    {
        "title": "Tasakku Tasakku",
        "artist": "Sam C.S., Mukesh, M.L.R. Karthikeyan, Guna",
        "movie": "Vikram Vedha",
        "year": "2017",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 9,
        "query": "Vikram Vedha Tasakku Tasakku Video Song Vijay Sethupathi Sam CS"
    },
    {
        "title": "Appadi Podu",
        "artist": "Vidyasagar, KK, Anuradha Sriram",
        "movie": "Ghilli",
        "year": "2004",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 10,
        "query": "Ghilli Appadi Podu Video Song Thalapathy Vijay Trisha Vidyasagar"
    },
    {
        "title": "Kokkarakko",
        "artist": "Vidyasagar, Udit Narayan, Sujatha Mohan",
        "movie": "Ghilli",
        "year": "2004",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Ghilli Kokkarakko Video Song Thalapathy Vijay Trisha Vidyasagar"
    },
    {
        "title": "Naaka Mukka",
        "artist": "Vijay Antony, Nakash Aziz, Chinnaponnu",
        "movie": "Kadhalil Vizhunthen",
        "year": "2008",
        "hookStartSec": 36,
        "hookEndSec": 76,
        "energy": 10,
        "query": "Kadhalil Vizhunthen Naaka Mukka Video Song Vijay Antony Nakul"
    },
    {
        "title": "Aathichoodi",
        "artist": "Vijay Antony, Dinesh Kanagaratnam",
        "movie": "TN 07 AL 4777",
        "year": "2009",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 9,
        "query": "TN 07 AL 4777 Aathichoodi Video Song Vijay Antony Pasupathy"
    },
    {
        "title": "Dailamo Dailamo",
        "artist": "Vijay Antony, Sangeetha Rajeshwaran",
        "movie": "Dishyum",
        "year": "2006",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Dishyum Dailamo Dailamo Video Song Jiiva Sandhya Vijay Antony"
    },
    {
        "title": "Ulagam Oruvanukka",
        "artist": "Santhosh Narayanan, Ananthu, Santhosh Narayanan, Gana Bala",
        "movie": "Kabali",
        "year": "2016",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 9,
        "query": "Kabali Ulagam Oruvanukka Video Song Rajinikanth Santhosh Narayanan"
    },
    {
        "title": "Neruppu Da",
        "artist": "Santhosh Narayanan, Arunraja Kamaraj",
        "movie": "Kabali",
        "year": "2016",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "Kabali Neruppu Da Video Song Rajinikanth Santhosh Narayanan"
    },
    {
        "title": "Rakita Rakita Rakita",
        "artist": "Santhosh Narayanan, Dhanush, Dhee",
        "movie": "Jagame Thandhiram",
        "year": "2020",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "Jagame Thandhiram Rakita Rakita Video Song Dhanush Santhosh Narayanan"
    },
    {
        "title": "Bujji",
        "artist": "Santhosh Narayanan, Anirudh Ravichander",
        "movie": "Jagame Thandhiram",
        "year": "2020",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Jagame Thandhiram Bujji Video Song Dhanush Santhosh Narayanan"
    },
    {
        "title": "Karuppu Nerathazhagi",
        "artist": "G.V. Prakash Kumar, Velmurugan, Malavika Sundar",
        "movie": "Komban",
        "year": "2015",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Komban Karuppu Nerathazhagi Video Song Karthi GV Prakash"
    },
    {
        "title": "Jingunamani",
        "artist": "D. Imman, Ranjith, Sunidhi Chauhan",
        "movie": "Jilla",
        "year": "2014",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 9,
        "query": "Jilla Jingunamani Video Song Thalapathy Vijay Kajal Aggarwal D Imman"
    },
    {
        "title": "Dandanakka",
        "artist": "D. Imman, Anirudh Ravichander",
        "movie": "Romeo Juliet",
        "year": "2015",
        "hookStartSec": 46,
        "hookEndSec": 86,
        "energy": 9,
        "query": "Romeo Juliet Dandanakka Video Song Jayam Ravi Hansika D Imman"
    },
    {
        "title": "Yammadi Aathadi",
        "artist": "D. Imman, Shreya Ghoshal",
        "movie": "Yennamo Yedho",
        "year": "2014",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 8,
        "query": "Yennamo Yedho Yammadi Aathadi Video Song Gautham Karthik D Imman"
    },
    {
        "title": "Adhaaru Adhaaru",
        "artist": "Harris Jayaraj, Vijay Prakash, Gana Bala",
        "movie": "Yennai Arindhaal",
        "year": "2015",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 9,
        "query": "Yennai Arindhaal Adhaaru Adhaaru Video Song Ajith Kumar Harris Jayaraj"
    },
    {
        "title": "Tirunelveli Halwada",
        "artist": "Harris Jayaraj, Palakkad Sreeram",
        "movie": "Saamy",
        "year": "2003",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 9,
        "query": "Saamy Tirunelveli Halwada Video Song Vikram Harris Jayaraj"
    },
    {
        "title": "Machan Meesai",
        "artist": "Vidyasagar, Pushpavanam Kuppusamy",
        "movie": "Dhill",
        "year": "2001",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 9,
        "query": "Dhill Machan Meesai Video Song Chiyaan Vikram Vidyasagar"
    },
    {
        "title": "Kumbida Pona Deivam",
        "artist": "Dhina, Shankar Mahadevan, Malathy Lakshman",
        "movie": "Thirupaachi",
        "year": "2005",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Thirupaachi Kumbida Pona Deivam Video Song Thalapathy Vijay Dhina"
    },
    {
        "title": "Dheemthanakka Thillana",
        "artist": "Devi Sri Prasad, Divya",
        "movie": "Villu",
        "year": "2009",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "Villu Dheemthanakka Thillana Video Song Vijay Nayanthara DSP"
    },
    {
        "title": "Daddy Mummy",
        "artist": "Devi Sri Prasad, Naveen Madhav, Mamta Mohandas",
        "movie": "Villu",
        "year": "2009",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Villu Daddy Mummy Video Song Thalapathy Vijay DSP"
    },
    {
        "title": "Ringa Ringa",
        "artist": "Devi Sri Prasad, Priya Himesh",
        "movie": "Arya 2",
        "year": "2009",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 10,
        "query": "Arya 2 Ringa Ringa Video Song Allu Arjun DSP"
    },
    {
        "title": "Seeti Maar",
        "artist": "Devi Sri Prasad, Jaspreet Jasz, Rita",
        "movie": "DJ Duvvada Jagannadham",
        "year": "2017",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 10,
        "query": "DJ Duvvada Jagannadham Seeti Maar Video Song Allu Arjun Pooja Hegde DSP"
    },
    {
        "title": "Pakka Local",
        "artist": "Devi Sri Prasad, Geetha Madhuri, Sagar",
        "movie": "Janatha Garage",
        "year": "2016",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 9,
        "query": "Janatha Garage Pakka Local Video Song Jr NTR Kajal Aggarwal DSP"
    },
    {
        "title": "Jigelu Rani",
        "artist": "Devi Sri Prasad, Rela Kumar, Ganta Venkata Lakshmi",
        "movie": "Rangasthalam",
        "year": "2018",
        "hookStartSec": 52,
        "hookEndSec": 92,
        "energy": 9,
        "query": "Rangasthalam Jigelu Rani Video Song Ram Charan Pooja Hegde DSP"
    },
    {
        "title": "Aa Ante Amalapuram",
        "artist": "Devi Sri Prasad, Malathy Lakshman",
        "movie": "Arya",
        "year": "2004",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Arya Aa Ante Amalapuram Video Song Allu Arjun DSP"
    },
    {
        "title": "Kevvu Keka",
        "artist": "Devi Sri Prasad, Mamta Sharma, Murali",
        "movie": "Gabbar Singh",
        "year": "2012",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 10,
        "query": "Gabbar Singh Kevvu Keka Video Song Pawan Kalyan DSP"
    },
    {
        "title": "Cinema Choopistha Mava",
        "artist": "S.S. Thaman, Simha",
        "movie": "Race Gurram",
        "year": "2014",
        "hookStartSec": 46,
        "hookEndSec": 86,
        "energy": 9,
        "query": "Race Gurram Cinema Choopistha Mava Video Song Allu Arjun Thaman"
    },
    {
        "title": "Blockbuster",
        "artist": "S.S. Thaman, Shreya Ghoshal, Nakash Aziz, Simha",
        "movie": "Sarrainodu",
        "year": "2016",
        "hookStartSec": 54,
        "hookEndSec": 94,
        "energy": 10,
        "query": "Sarrainodu Blockbuster Video Song Allu Arjun Rakul Preet Thaman"
    },
    {
        "title": "Butta Bomma",
        "artist": "S.S. Thaman, Armaan Malik",
        "movie": "Ala Vaikunthapurramuloo",
        "year": "2020",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 8,
        "query": "Ala Vaikunthapurramuloo ButtaBomma Video Song Allu Arjun Pooja Hegde Thaman"
    },
    {
        "title": "Ramuloo Ramulaa",
        "artist": "S.S. Thaman, Anurag Kulkarni, Mangli",
        "movie": "Ala Vaikunthapurramuloo",
        "year": "2019",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 9,
        "query": "Ala Vaikunthapurramuloo Ramuloo Ramulaa Video Song Allu Arjun Thaman"
    },
    {
        "title": "OMG Daddy",
        "artist": "S.S. Thaman, Rahul Sipligunj, Roll Rida, Blaaze",
        "movie": "Ala Vaikunthapurramuloo",
        "year": "2019",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 8,
        "query": "Ala Vaikunthapurramuloo OMG Daddy Video Song Allu Arjun Thaman"
    },
    {
        "title": "Kurchi Madathapetti",
        "artist": "S.S. Thaman, Sahithi Chaganti, Sri Krishna",
        "movie": "Guntur Kaaram",
        "year": "2024",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 10,
        "query": "Guntur Kaaram Kurchi Madathapetti Video Song Mahesh Babu Sreeleela Thaman"
    },
    {
        "title": "Dum Masala",
        "artist": "S.S. Thaman, Sanjith Hegde, Thaman S",
        "movie": "Guntur Kaaram",
        "year": "2023",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 9,
        "query": "Guntur Kaaram Dum Masala Video Song Mahesh Babu Thaman"
    },
    {
        "title": "Saranga Dariya",
        "artist": "Pawan Ch, Mangli",
        "movie": "Love Story",
        "year": "2021",
        "hookStartSec": 36,
        "hookEndSec": 76,
        "energy": 9,
        "query": "Love Story Saranga Dariya Video Song Naga Chaitanya Sai Pallavi"
    },
    {
        "title": "Bullet Song",
        "artist": "Devi Sri Prasad, Silambarasan TR, Haripriya",
        "movie": "The Warriorr",
        "year": "2022",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "The Warriorr Bullet Song Video Ram Pothineni Krithi Shetty DSP"
    },
    {
        "title": "Ra Ra Rakkamma",
        "artist": "B. Ajaneesh Loknath, Nakash Aziz, Sunidhi Chauhan",
        "movie": "Vikrant Rona",
        "year": "2022",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "Vikrant Rona Ra Ra Rakkamma Video Song Kichcha Sudeep Jacqueline"
    },
    {
        "title": "Saami Saami",
        "artist": "Devi Sri Prasad, Mounika Yadav",
        "movie": "Pushpa: The Rise",
        "year": "2021",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 9,
        "query": "Pushpa Saami Saami Video Song Allu Arjun Rashmika DSP"
    },
    {
        "title": "Oo Antava Mava.. Oo Oo Antava",
        "artist": "Devi Sri Prasad, Indravathi Chauhan",
        "movie": "Pushpa: The Rise",
        "year": "2021",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 9,
        "query": "Pushpa Oo Antava Mava Video Song Allu Arjun Samantha DSP"
    },
    {
        "title": "Daakko Daakko Meka",
        "artist": "Devi Sri Prasad, Sivam",
        "movie": "Pushpa: The Rise",
        "year": "2021",
        "hookStartSec": 52,
        "hookEndSec": 92,
        "energy": 9,
        "query": "Pushpa Daakko Daakko Meka Video Song Allu Arjun DSP"
    },
    {
        "title": "Eyy Bidda Idhi Naa Adda",
        "artist": "Devi Sri Prasad, Nakash Aziz",
        "movie": "Pushpa: The Rise",
        "year": "2021",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Pushpa Eyy Bidda Idhi Naa Adda Video Song Allu Arjun DSP"
    },
    {
        "title": "Pushpa Pushpa",
        "artist": "Devi Sri Prasad, Nakash Aziz, Deepak Blue",
        "movie": "Pushpa 2: The Rule",
        "year": "2024",
        "hookStartSec": 46,
        "hookEndSec": 86,
        "energy": 10,
        "query": "Pushpa 2 Pushpa Pushpa Video Song Allu Arjun DSP"
    },
    {
        "title": "Sooseki (The Couple Song)",
        "artist": "Devi Sri Prasad, Shreya Ghoshal",
        "movie": "Pushpa 2: The Rule",
        "year": "2024",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 8,
        "query": "Pushpa 2 Sooseki Video Song Allu Arjun Rashmika Mandanna DSP"
    },
    {
        "title": "Peelings",
        "artist": "Devi Sri Prasad, Laxman, Ramya Behara",
        "movie": "Pushpa 2: The Rule",
        "year": "2024",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Pushpa 2 Peelings Video Song Allu Arjun DSP"
    },
    {
        "title": "Kissik",
        "artist": "Devi Sri Prasad, Sublahshini",
        "movie": "Pushpa 2: The Rule",
        "year": "2024",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Pushpa 2 Kissik Video Song Allu Arjun Sreeleela DSP"
    },
    {
        "title": "Top Lesi Poddi",
        "artist": "Devi Sri Prasad, Sagar, Geetha Madhuri",
        "movie": "Iddarammayilatho",
        "year": "2013",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "Iddarammayilatho Top Lesi Poddi Video Song Allu Arjun Catherine DSP"
    },
    {
        "title": "Super Machi",
        "artist": "Devi Sri Prasad, Shravana Bhargavi, Magizh Thirumeni",
        "movie": "S/O Satyamurthy",
        "year": "2015",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 9,
        "query": "S/O Satyamurthy Super Machi Video Song Allu Arjun Samantha DSP"
    },
    {
        "title": "Dimaak Kharaab",
        "artist": "Mani Sharma, Keerthana Sharma, Saketh",
        "movie": "iSmart Shankar",
        "year": "2019",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 9,
        "query": "iSmart Shankar Dimaak Kharaab Video Song Ram Pothineni Mani Sharma"
    },
    {
        "title": "Gunna Gunna Mamidi",
        "artist": "S.S. Thaman",
        "movie": "Nayak",
        "year": "2013",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Nayak Hey Nayak / Laila O Laila Video Song Ram Charan Thaman"
    },
    {
        "title": "Naatu Naatu",
        "artist": "M.M. Keeravaani, Rahul Sipligunj, Kaala Bhairava",
        "movie": "RRR",
        "year": "2022",
        "hookStartSec": 46,
        "hookEndSec": 86,
        "energy": 10,
        "query": "RRR Naatu Naatu Video Song NTR Ram Charan MM Keeravaani"
    },
    {
        "title": "Ettara Jenda",
        "artist": "M.M. Keeravaani, Vishal Mishra, Prudhvi Chandra",
        "movie": "RRR",
        "year": "2022",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "RRR Ettara Jenda Video Song NTR Ram Charan Alia Bhatt Keeravaani"
    },
    {
        "title": "Chuttamalle",
        "artist": "Anirudh Ravichander, Shilpa Rao",
        "movie": "Devara: Part 1",
        "year": "2024",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 8,
        "query": "Devara Chuttamalle Video Song NTR Janhvi Kapoor Anirudh"
    },
    {
        "title": "Daavudi",
        "artist": "Anirudh Ravichander, Nakash Aziz, Akasa",
        "movie": "Devara: Part 1",
        "year": "2024",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 10,
        "query": "Devara Daavudi Video Song NTR Janhvi Kapoor Anirudh"
    },
    {
        "title": "Ayayyo",
        "artist": "Anirudh Ravichander, Santhosh Venky",
        "movie": "Devara: Part 1",
        "year": "2024",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Devara Ayayyo Video Song NTR Koratala Siva Anirudh"
    },
    {
        "title": "Verithanam",
        "artist": "A.R. Rahman, Thalapathy Vijay",
        "movie": "Bigil",
        "year": "2019",
        "hookStartSec": 55,
        "hookEndSec": 95,
        "energy": 10,
        "query": "Bigil Verithanam Video Song Thalapathy Vijay AR Rahman"
    },
    {
        "title": "Mersal Arasan",
        "artist": "A.R. Rahman, G.V. Prakash Kumar, Naresh Iyer, Sharanya Srinivas",
        "movie": "Mersal",
        "year": "2017",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 9,
        "query": "Mersal Mersal Arasan Video Song Thalapathy Vijay AR Rahman"
    },
    {
        "title": "Aalaporaan Thamizhan",
        "artist": "A.R. Rahman, Kailash Kher, D. Sathyaprakash, Deepak Blue",
        "movie": "Mersal",
        "year": "2017",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 9,
        "query": "Mersal Aalaporaan Thamizhan Video Song Thalapathy Vijay AR Rahman"
    },
    {
        "title": "Chill Bro",
        "artist": "Vivek-Mervin, Dhanush",
        "movie": "Pattas",
        "year": "2020",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 9,
        "query": "Pattas Chill Bro Video Song Dhanush Sneha Vivek Mervin"
    },
    {
        "title": "Morattu Single",
        "artist": "Hiphop Tamizha",
        "movie": "Natpe Thunai",
        "year": "2019",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Natpe Thunai Morattu Single Video Song Hiphop Tamizha"
    },
    {
        "title": "Vaadi Pulla Vaadi",
        "artist": "Hiphop Tamizha",
        "movie": "Meesaya Murukku",
        "year": "2017",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 8,
        "query": "Meesaya Murukku Vaadi Pulla Vaadi Video Song Hiphop Tamizha"
    },
    {
        "title": "Jithu Jilladi",
        "artist": "G.V. Prakash Kumar, Deva, Balachandran",
        "movie": "Theri",
        "year": "2016",
        "hookStartSec": 46,
        "hookEndSec": 86,
        "energy": 9,
        "query": "Theri Jithu Jilladi Video Song Thalapathy Vijay GV Prakash Atlee"
    },
    {
        "title": "Guleba",
        "artist": "Vivek-Mervin, Anirudh Ravichander, Mervin Solomon",
        "movie": "Gulaebaghavali",
        "year": "2018",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Gulaebaghavali Guleba Video Song Prabhudeva Hansika Anirudh"
    },
    {
        "title": "Ta Takkara",
        "artist": "Santhosh Narayanan, Sanjith Hegde, Dhee",
        "movie": "Kalki 2898 AD",
        "year": "2024",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 8,
        "query": "Kalki 2898 AD Ta Takkara Theme Video Prabhas Disha Patani Santhosh Narayanan"
    },
    {
        "title": "Mind Block",
        "artist": "Devi Sri Prasad, Blaaze, Ranina Reddy",
        "movie": "Sarileru Neekevvaru",
        "year": "2020",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "Sarileru Neekevvaru Mind Block Video Song Mahesh Babu Rashmika DSP"
    }
]

print(f"Kuthu count: {len(KUTHU_RAW)}")


MASS_RAW = [
    {
        "title": "Badass",
        "artist": "Anirudh Ravichander",
        "movie": "Leo",
        "year": "2023",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 10,
        "query": "Leo Badass Lyric Video Thalapathy Vijay Anirudh"
    },
    {
        "title": "Bloody Sweet",
        "artist": "Anirudh Ravichander, Siddharth Basrur",
        "movie": "Leo",
        "year": "2023",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 10,
        "query": "Leo Bloody Sweet Video Thalapathy Vijay Anirudh"
    },
    {
        "title": "Ordinary Person",
        "artist": "Anirudh Ravichander, Nikhita Gandhi",
        "movie": "Leo",
        "year": "2023",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 9,
        "query": "Leo Ordinary Person Video Thalapathy Vijay Anirudh"
    },
    {
        "title": "Lokiverse 2.0",
        "artist": "Anirudh Ravichander",
        "movie": "Leo",
        "year": "2023",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "Leo Lokiverse 2.0 Thalapathy Vijay Lokesh Kanagaraj Anirudh"
    },
    {
        "title": "I'm Scared",
        "artist": "Anirudh Ravichander",
        "movie": "Leo",
        "year": "2023",
        "hookStartSec": 32,
        "hookEndSec": 72,
        "energy": 9,
        "query": "Leo Im Scared Video Thalapathy Vijay Anirudh"
    },
    {
        "title": "Vikram Title Track",
        "artist": "Anirudh Ravichander",
        "movie": "Vikram",
        "year": "2022",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 10,
        "query": "Vikram Title Track Video Kamal Haasan Anirudh"
    },
    {
        "title": "Once Upon a Time",
        "artist": "Anirudh Ravichander",
        "movie": "Vikram",
        "year": "2022",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 10,
        "query": "Vikram Once Upon A Time Video Kamal Haasan Anirudh"
    },
    {
        "title": "Rolex Theme",
        "artist": "Anirudh Ravichander",
        "movie": "Vikram",
        "year": "2022",
        "hookStartSec": 25,
        "hookEndSec": 65,
        "energy": 10,
        "query": "Vikram Rolex Theme Video Suriya Kamal Haasan Anirudh"
    },
    {
        "title": "Eagle Is Coming",
        "artist": "Anirudh Ravichander",
        "movie": "Vikram",
        "year": "2022",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 9,
        "query": "Vikram Eagle Is Coming Video Kamal Haasan Anirudh"
    },
    {
        "title": "Wasted",
        "artist": "Anirudh Ravichander",
        "movie": "Vikram",
        "year": "2022",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Vikram Wasted Video Song Kamal Haasan Anirudh"
    },
    {
        "title": "Hukum - Thalaivar Alappara",
        "artist": "Anirudh Ravichander, Super Subu",
        "movie": "Jailer",
        "year": "2023",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 10,
        "query": "Jailer Hukum Video Song Rajinikanth Anirudh Nelson"
    },
    {
        "title": "Tiger Ka Hukum",
        "artist": "Anirudh Ravichander",
        "movie": "Jailer",
        "year": "2023",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 10,
        "query": "Jailer Tiger Ka Hukum Lyric Video Rajinikanth Anirudh"
    },
    {
        "title": "Jailer Theme",
        "artist": "Anirudh Ravichander",
        "movie": "Jailer",
        "year": "2023",
        "hookStartSec": 28,
        "hookEndSec": 68,
        "energy": 10,
        "query": "Jailer Theme Alappara Video Rajinikanth Anirudh"
    },
    {
        "title": "Muthuvel Pandian Theme",
        "artist": "Anirudh Ravichander",
        "movie": "Jailer",
        "year": "2023",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 9,
        "query": "Jailer Muthuvel Pandian Theme Rajinikanth Anirudh"
    },
    {
        "title": "Beast Mode",
        "artist": "Anirudh Ravichander",
        "movie": "Beast",
        "year": "2022",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 10,
        "query": "Beast Beast Mode Video Thalapathy Vijay Anirudh"
    },
    {
        "title": "Jolly O Gymkhana",
        "artist": "Anirudh Ravichander, Thalapathy Vijay",
        "movie": "Beast",
        "year": "2022",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "Beast Jolly O Gymkhana Video Song Thalapathy Vijay Anirudh"
    },
    {
        "title": "Master Raid",
        "artist": "Anirudh Ravichander",
        "movie": "Master",
        "year": "2021",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 10,
        "query": "Master Master Raid Video Thalapathy Vijay Anirudh"
    },
    {
        "title": "Vaathi Raid",
        "artist": "Anirudh Ravichander, Arivu",
        "movie": "Master",
        "year": "2021",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 10,
        "query": "Master Vaathi Raid Video Thalapathy Vijay Anirudh Arivu"
    },
    {
        "title": "Polakattum Para Para",
        "artist": "Anirudh Ravichander, Santhosh Narayanan",
        "movie": "Master",
        "year": "2021",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Master Polakattum Para Para Video Song Vijay Sethupathi Anirudh"
    },
    {
        "title": "JD Intro Theme",
        "artist": "Anirudh Ravichander",
        "movie": "Master",
        "year": "2021",
        "hookStartSec": 25,
        "hookEndSec": 65,
        "energy": 10,
        "query": "Master JD Intro Theme Video Thalapathy Vijay Anirudh"
    },
    {
        "title": "Petta Paraak",
        "artist": "Anirudh Ravichander",
        "movie": "Petta",
        "year": "2019",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 10,
        "query": "Petta Petta Paraak Video Song Rajinikanth Anirudh"
    },
    {
        "title": "Petta Theme",
        "artist": "Anirudh Ravichander",
        "movie": "Petta",
        "year": "2019",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "Petta Theme Rajinikanth Anirudh"
    },
    {
        "title": "Aaha Kalyanam - Jithu Theme",
        "artist": "Anirudh Ravichander",
        "movie": "Petta",
        "year": "2019",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 9,
        "query": "Petta Jithu Theme Vijay Sethupathi Anirudh"
    },
    {
        "title": "Surviva",
        "artist": "Anirudh Ravichander, Yogi B, Mali Manoj",
        "movie": "Vivegam",
        "year": "2017",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 10,
        "query": "Vivegam Surviva Video Song Ajith Kumar Anirudh"
    },
    {
        "title": "Thalai Viduthalai",
        "artist": "Anirudh Ravichander, Harish Swaminathan",
        "movie": "Vivegam",
        "year": "2017",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 10,
        "query": "Vivegam Thalai Viduthalai Video Song Ajith Kumar Anirudh"
    },
    {
        "title": "The Theri Theme",
        "artist": "Anirudh Ravichander",
        "movie": "Vedalam",
        "year": "2015",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "Vedalam The Theri Theme Ajith Kumar Anirudh"
    },
    {
        "title": "Veera Vinayaka",
        "artist": "Anirudh Ravichander, Vishal Dadlani",
        "movie": "Vedalam",
        "year": "2015",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Vedalam Veera Vinayaka Video Song Ajith Kumar Anirudh"
    },
    {
        "title": "The Sword of Destiny (Kaththi Theme)",
        "artist": "Anirudh Ravichander",
        "movie": "Kaththi",
        "year": "2014",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 10,
        "query": "Kaththi The Sword of Destiny Theme Thalapathy Vijay Anirudh"
    },
    {
        "title": "Bad Eyes Villain Theme",
        "artist": "Anirudh Ravichander",
        "movie": "Kaththi",
        "year": "2014",
        "hookStartSec": 28,
        "hookEndSec": 68,
        "energy": 9,
        "query": "Kaththi Bad Eyes Villain Theme Anirudh"
    },
    {
        "title": "Selfie Pulla",
        "artist": "Anirudh Ravichander, Thalapathy Vijay, Sunidhi Chauhan",
        "movie": "Kaththi",
        "year": "2014",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "Kaththi Selfie Pulla Video Song Thalapathy Vijay Samantha Anirudh"
    },
    {
        "title": "Aathi",
        "artist": "Anirudh Ravichander, Vishal Dadlani",
        "movie": "Kaththi",
        "year": "2014",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 9,
        "query": "Kaththi Aathi Video Song Thalapathy Vijay Samantha Anirudh"
    },
    {
        "title": "Salaam Rocky Bhai",
        "artist": "Ravi Basrur, Vijay Prakash",
        "movie": "KGF Chapter 1",
        "year": "2018",
        "hookStartSec": 46,
        "hookEndSec": 86,
        "energy": 10,
        "query": "KGF Salaam Rocky Bhai Video Song Yash Ravi Basrur"
    },
    {
        "title": "Dheera Dheera",
        "artist": "Ravi Basrur, Ananya Bhat",
        "movie": "KGF Chapter 1",
        "year": "2018",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "KGF Dheera Dheera Video Song Yash Ravi Basrur"
    },
    {
        "title": "KGF Theme",
        "artist": "Ravi Basrur",
        "movie": "KGF Chapter 1",
        "year": "2018",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "KGF Chapter 1 Theme Song Yash Ravi Basrur"
    },
    {
        "title": "Toofan",
        "artist": "Ravi Basrur, Bamba Bakya",
        "movie": "KGF Chapter 2",
        "year": "2022",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 10,
        "query": "KGF Chapter 2 Toofan Video Song Yash Ravi Basrur"
    },
    {
        "title": "Sulthana",
        "artist": "Ravi Basrur, Mohan Krishna, Santhosh Venky",
        "movie": "KGF Chapter 2",
        "year": "2022",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 10,
        "query": "KGF Chapter 2 Sulthana Video Song Yash Ravi Basrur"
    },
    {
        "title": "Mehabooba",
        "artist": "Ravi Basrur, Ananya Bhat",
        "movie": "KGF Chapter 2",
        "year": "2022",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 9,
        "query": "KGF Chapter 2 Mehabooba Video Song Yash Srinidhi Ravi Basrur"
    },
    {
        "title": "The Monster Song",
        "artist": "Ravi Basrur, Adithi Sagar",
        "movie": "KGF Chapter 2",
        "year": "2022",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 10,
        "query": "KGF Chapter 2 The Monster Song Video Yash Ravi Basrur"
    },
    {
        "title": "Sooreede",
        "artist": "Ravi Basrur, Harini Ivaturi",
        "movie": "Salaar",
        "year": "2023",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Salaar Sooreede Video Song Prabhas Prithviraj Ravi Basrur"
    },
    {
        "title": "Sound of Salaar",
        "artist": "Ravi Basrur",
        "movie": "Salaar",
        "year": "2023",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "Salaar Sound of Salaar Prabhas Prashanth Neel Ravi Basrur"
    },
    {
        "title": "Prathikadalo",
        "artist": "Ravi Basrur",
        "movie": "Salaar",
        "year": "2023",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Salaar Prathikadalo Video Song Prabhas Ravi Basrur"
    },
    {
        "title": "Vinaraa",
        "artist": "Ravi Basrur, Sachin Basrur",
        "movie": "Salaar",
        "year": "2023",
        "hookStartSec": 36,
        "hookEndSec": 76,
        "energy": 9,
        "query": "Salaar Vinaraa Video Song Prabhas Ravi Basrur"
    },
    {
        "title": "Saahore Baahubali",
        "artist": "M.M. Keeravaani, Daler Mehndi, M.M. Keeravaani",
        "movie": "Baahubali 2: The Conclusion",
        "year": "2017",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 10,
        "query": "Baahubali 2 Saahore Baahubali Video Song Prabhas MM Keeravaani"
    },
    {
        "title": "Dandalayya",
        "artist": "M.M. Keeravaani, Kaala Bhairava",
        "movie": "Baahubali 2: The Conclusion",
        "year": "2017",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Baahubali 2 Dandalayya Video Song Prabhas Anushka MM Keeravaani"
    },
    {
        "title": "Dheevara",
        "artist": "M.M. Keeravaani, Ramya Behara, Deepu",
        "movie": "Baahubali: The Beginning",
        "year": "2015",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 9,
        "query": "Baahubali Dheevara Video Song Prabhas Tamannaah MM Keeravaani"
    },
    {
        "title": "Sivuni Aana",
        "artist": "M.M. Keeravaani, Mounima",
        "movie": "Baahubali: The Beginning",
        "year": "2015",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Baahubali Sivuni Aana Video Song Prabhas MM Keeravaani"
    },
    {
        "title": "Mamatala Thalli",
        "artist": "M.M. Keeravaani, Satya Yamini",
        "movie": "Baahubali: The Beginning",
        "year": "2015",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Baahubali Mamatala Thalli Video Song Prabhas MM Keeravaani"
    },
    {
        "title": "Dosti",
        "artist": "M.M. Keeravaani, Hemachandra",
        "movie": "RRR",
        "year": "2021",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 9,
        "query": "RRR Dosti Video Song NTR Ram Charan MM Keeravaani"
    },
    {
        "title": "Raamam Raaghavam",
        "artist": "M.M. Keeravaani, Vijay Prakash, Chandana Bala Kalyan",
        "movie": "RRR",
        "year": "2022",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 10,
        "query": "RRR Raamam Raaghavam Video Song Ram Charan MM Keeravaani"
    },
    {
        "title": "Komuram Bheemudo",
        "artist": "M.M. Keeravaani, Kaala Bhairava",
        "movie": "RRR",
        "year": "2022",
        "hookStartSec": 52,
        "hookEndSec": 92,
        "energy": 9,
        "query": "RRR Komuram Bheemudo Video Song NTR MM Keeravaani"
    },
    {
        "title": "Sholay",
        "artist": "M.M. Keeravaani, Vishal Mishra",
        "movie": "RRR",
        "year": "2022",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "RRR Sholay Video Song Ram Charan Jr NTR MM Keeravaani"
    },
    {
        "title": "Fear Song",
        "artist": "Anirudh Ravichander",
        "movie": "Devara: Part 1",
        "year": "2024",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 10,
        "query": "Devara Fear Song Video NTR Koratala Siva Anirudh"
    },
    {
        "title": "All Hail The Tiger",
        "artist": "Anirudh Ravichander",
        "movie": "Devara: Part 1",
        "year": "2024",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "Devara All Hail The Tiger Theme NTR Anirudh"
    },
    {
        "title": "Red Sea Theme",
        "artist": "Anirudh Ravichander",
        "movie": "Devara: Part 1",
        "year": "2024",
        "hookStartSec": 28,
        "hookEndSec": 68,
        "energy": 9,
        "query": "Devara Red Sea Theme NTR Anirudh"
    },
    {
        "title": "Theme of Kalki",
        "artist": "Santhosh Narayanan, Kaala Bhairava, Gowtham Bharadwaj",
        "movie": "Kalki 2898 AD",
        "year": "2024",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 10,
        "query": "Kalki 2898 AD Theme of Kalki Video Prabhas Santhosh Narayanan"
    },
    {
        "title": "Bhairava Anthem",
        "artist": "Santhosh Narayanan, Diljit Dosanjh, Santhosh Narayanan",
        "movie": "Kalki 2898 AD",
        "year": "2024",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 10,
        "query": "Kalki 2898 AD Bhairava Anthem Video Prabhas Diljit Dosanjh Santhosh Narayanan"
    },
    {
        "title": "Veera Dheera",
        "artist": "Santhosh Narayanan",
        "movie": "Kalki 2898 AD",
        "year": "2024",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 9,
        "query": "Kalki 2898 AD Veera Dheera Prabhas Santhosh Narayanan"
    },
    {
        "title": "Kalki Theme",
        "artist": "Santhosh Narayanan",
        "movie": "Kalki 2898 AD",
        "year": "2024",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "Kalki 2898 AD Title Theme Prabhas Santhosh Narayanan"
    },
    {
        "title": "Mawaa Enthaina",
        "artist": "S.S. Thaman, Sri Krishna, Ram Miriyala",
        "movie": "Guntur Kaaram",
        "year": "2024",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Guntur Kaaram Mawaa Enthaina Video Song Mahesh Babu Thaman"
    },
    {
        "title": "Guntur Kaaram Title Track",
        "artist": "S.S. Thaman",
        "movie": "Guntur Kaaram",
        "year": "2024",
        "hookStartSec": 32,
        "hookEndSec": 72,
        "energy": 9,
        "query": "Guntur Kaaram Mass Anthem Mahesh Babu Thaman"
    },
    {
        "title": "Sarileru Neekevvaru Anthem",
        "artist": "Devi Sri Prasad, Shankar Mahadevan",
        "movie": "Sarileru Neekevvaru",
        "year": "2020",
        "hookStartSec": 46,
        "hookEndSec": 86,
        "energy": 10,
        "query": "Sarileru Neekevvaru Anthem Video Song Mahesh Babu DSP"
    },
    {
        "title": "Suryudivo Chandrudivo",
        "artist": "Devi Sri Prasad, B Praak",
        "movie": "Sarileru Neekevvaru",
        "year": "2020",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 8,
        "query": "Sarileru Neekevvaru Suryudivo Chandrudivo Video Mahesh Babu DSP"
    },
    {
        "title": "Ala Vaikunthapurramuloo Title Track",
        "artist": "S.S. Thaman, Sri Krishna, Priya Sisters",
        "movie": "Ala Vaikunthapurramuloo",
        "year": "2020",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "Ala Vaikunthapurramuloo Title Track Video Allu Arjun Thaman"
    },
    {
        "title": "Sittharala Sirapadu",
        "artist": "S.S. Thaman, Sooraj Santhosh, Srikrishna",
        "movie": "Ala Vaikunthapurramuloo",
        "year": "2020",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Ala Vaikunthapurramuloo Sittharala Sirapadu Video Allu Arjun Thaman"
    },
    {
        "title": "Maguva Maguva",
        "artist": "S.S. Thaman, Sid Sriram",
        "movie": "Vakeel Saab",
        "year": "2020",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 8,
        "query": "Vakeel Saab Maguva Maguva Video Song Pawan Kalyan Sid Sriram Thaman"
    },
    {
        "title": "Satyameva Jayathe",
        "artist": "S.S. Thaman, Shankar Mahadevan, Prudhvi Chandra",
        "movie": "Vakeel Saab",
        "year": "2021",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "Vakeel Saab Satyameva Jayathe Video Song Pawan Kalyan Thaman"
    },
    {
        "title": "Kadhile Kaalame",
        "artist": "S.S. Thaman, Sudharshan Ashok",
        "movie": "Vakeel Saab",
        "year": "2021",
        "hookStartSec": 36,
        "hookEndSec": 76,
        "energy": 8,
        "query": "Vakeel Saab Kadhile Kaalame Video Song Pawan Kalyan Thaman"
    },
    {
        "title": "Bheemla Nayak Title Song",
        "artist": "S.S. Thaman, Thaman S, Sri Krishna",
        "movie": "Bheemla Nayak",
        "year": "2022",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 10,
        "query": "Bheemla Nayak Title Song Video Pawan Kalyan Rana Thaman"
    },
    {
        "title": "Lala Bheemla",
        "artist": "S.S. Thaman, Arun Kaundinya",
        "movie": "Bheemla Nayak",
        "year": "2021",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 10,
        "query": "Bheemla Nayak Lala Bheemla Video Song Pawan Kalyan Thaman"
    },
    {
        "title": "Adavi Thalli Maata",
        "artist": "S.S. Thaman, Kummari Durgavva, Sahithi Chaganti",
        "movie": "Bheemla Nayak",
        "year": "2022",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 8,
        "query": "Bheemla Nayak Adavi Thalli Maata Song Pawan Kalyan Thaman"
    },
    {
        "title": "Akhanda Title Song",
        "artist": "S.S. Thaman, Shankar Mahadevan, Siddharth Mahadevan",
        "movie": "Akhanda",
        "year": "2021",
        "hookStartSec": 50,
        "hookEndSec": 90,
        "energy": 10,
        "query": "Akhanda Title Song Video Nandamuri Balakrishna Boyapati Thaman"
    },
    {
        "title": "Jai Balayya",
        "artist": "S.S. Thaman, Geetha Madhuri, Sahithi Chaganti",
        "movie": "Akhanda",
        "year": "2021",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 10,
        "query": "Akhanda Jai Balayya Video Song Nandamuri Balakrishna Thaman"
    },
    {
        "title": "Roar of Akhanda",
        "artist": "S.S. Thaman",
        "movie": "Akhanda",
        "year": "2021",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "Roar of Akhanda Title BGM Balakrishna Thaman"
    },
    {
        "title": "Jai Balayya (Mass Anthem)",
        "artist": "S.S. Thaman, Karrunya",
        "movie": "Veera Simha Reddy",
        "year": "2022",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 10,
        "query": "Veera Simha Reddy Jai Balayya Mass Anthem Video Balakrishna Thaman"
    },
    {
        "title": "Suguna Sundari",
        "artist": "S.S. Thaman, Ram Miriyala, Snigdha Sharma",
        "movie": "Veera Simha Reddy",
        "year": "2022",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 9,
        "query": "Veera Simha Reddy Suguna Sundari Video Balakrishna Shruti Haasan Thaman"
    },
    {
        "title": "Maa Bava Manobhavalu",
        "artist": "S.S. Thaman, Sahithi Chaganti, Yamini Ghantasala",
        "movie": "Veera Simha Reddy",
        "year": "2023",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 10,
        "query": "Veera Simha Reddy Maa Bava Manobhavalu Video Balakrishna Chandrika Ravi Thaman"
    },
    {
        "title": "Boss Party",
        "artist": "Devi Sri Prasad, Nakash Aziz, DSP, Haripriya",
        "movie": "Waltair Veerayya",
        "year": "2022",
        "hookStartSec": 46,
        "hookEndSec": 86,
        "energy": 10,
        "query": "Waltair Veerayya Boss Party Video Chiranjeevi Urvashi Rautela DSP"
    },
    {
        "title": "Poonakaalu Loading",
        "artist": "Devi Sri Prasad, Ram Miriyala, Roll Rida",
        "movie": "Waltair Veerayya",
        "year": "2022",
        "hookStartSec": 48,
        "hookEndSec": 88,
        "energy": 10,
        "query": "Waltair Veerayya Poonakaalu Loading Video Chiranjeevi Ravi Teja DSP"
    },
    {
        "title": "Veerayya Title Track",
        "artist": "Devi Sri Prasad, Anurag Kulkarni",
        "movie": "Waltair Veerayya",
        "year": "2023",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 9,
        "query": "Waltair Veerayya Veerayya Title Track Video Chiranjeevi DSP"
    },
    {
        "title": "Thaar Maar Thakkar Maar",
        "artist": "S.S. Thaman, Shreya Ghoshal",
        "movie": "Godfather",
        "year": "2022",
        "hookStartSec": 44,
        "hookEndSec": 84,
        "energy": 9,
        "query": "GodFather Thaar Maar Thakkar Maar Video Chiranjeevi Salman Khan Thaman"
    },
    {
        "title": "Blast Baby",
        "artist": "S.S. Thaman",
        "movie": "Godfather",
        "year": "2022",
        "hookStartSec": 38,
        "hookEndSec": 78,
        "energy": 9,
        "query": "GodFather Blast Baby Video Song Chiranjeevi Thaman"
    },
    {
        "title": "Najabhaja",
        "artist": "S.S. Thaman, Sri Krishna, Prudhvi Chandra",
        "movie": "Godfather",
        "year": "2022",
        "hookStartSec": 40,
        "hookEndSec": 80,
        "energy": 9,
        "query": "GodFather Najabhaja Video Song Chiranjeevi Mohan Raja Thaman"
    },
    {
        "title": "Mankatha Theme",
        "artist": "Yuvan Shankar Raja",
        "movie": "Mankatha",
        "year": "2011",
        "hookStartSec": 28,
        "hookEndSec": 68,
        "energy": 10,
        "query": "Mankatha Theme Music Ajith Kumar Yuvan Shankar Raja"
    },
    {
        "title": "Billa Theme",
        "artist": "Yuvan Shankar Raja",
        "movie": "Billa",
        "year": "2007",
        "hookStartSec": 30,
        "hookEndSec": 70,
        "energy": 10,
        "query": "Billa Theme Music Ajith Kumar Yuvan Shankar Raja"
    },
    {
        "title": "Arrambam Theme",
        "artist": "Yuvan Shankar Raja",
        "movie": "Arrambam",
        "year": "2013",
        "hookStartSec": 32,
        "hookEndSec": 72,
        "energy": 9,
        "query": "Arrambam Theme Music Ajith Kumar Yuvan Shankar Raja"
    },
    {
        "title": "Theemai Dhaan Vellum",
        "artist": "Hiphop Tamizha, Arvind Swamy",
        "movie": "Thani Oruvan",
        "year": "2015",
        "hookStartSec": 42,
        "hookEndSec": 82,
        "energy": 10,
        "query": "Thani Oruvan Theemai Dhaan Vellum Video Jayam Ravi Arvind Swamy Hiphop Tamizha"
    },
    {
        "title": "Thani Oruvan Theme",
        "artist": "Hiphop Tamizha",
        "movie": "Thani Oruvan",
        "year": "2015",
        "hookStartSec": 28,
        "hookEndSec": 68,
        "energy": 10,
        "query": "Thani Oruvan Theme Music Hiphop Tamizha"
    },
    {
        "title": "Arima Arima",
        "artist": "A.R. Rahman, Hariharan, Sadhana Sargam",
        "movie": "Enthiran",
        "year": "2010",
        "hookStartSec": 52,
        "hookEndSec": 92,
        "energy": 10,
        "query": "Enthiran Arima Arima Video Song Rajinikanth Aishwarya Rai AR Rahman"
    },
    {
        "title": "Athiradee",
        "artist": "A.R. Rahman, AR Rahman, Sayanora Philip",
        "movie": "Sivaji: The Boss",
        "year": "2007",
        "hookStartSec": 45,
        "hookEndSec": 85,
        "energy": 10,
        "query": "Sivaji The Boss Athiradee Video Song Rajinikanth Shriya Saran AR Rahman"
    },
    {
        "title": "Singam Theme",
        "artist": "Devi Sri Prasad",
        "movie": "Singam",
        "year": "2010",
        "hookStartSec": 35,
        "hookEndSec": 75,
        "energy": 10,
        "query": "Singam Theme Song Suriya Devi Sri Prasad Hari"
    }
]

print(f"Mass count: {len(MASS_RAW)}")
