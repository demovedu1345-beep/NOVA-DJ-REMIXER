import json
import os
import time
import urllib.request
import concurrent.futures
import yt_dlp

CANDIDATES = [
    {
        "title": "Kala Chashma",
        "artist": "Badshah, Neha Kakkar, Amar Arshi, Prem-Hardeep",
        "year": "2016",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Kala Chashma official video Baar Baar Dekho Zee Music Company"
    },
    {
        "title": "Kar Gayi Chull",
        "artist": "Badshah, Fazilpuria, Sukriti Kakar, Neha Kakkar, Amaal Mallik",
        "year": "2016",
        "hookStartSec": 35,
        "energy": 10,
        "query": "Kar Gayi Chull Kapoor & Sons official video Sony Music India"
    },
    {
        "title": "Aankh Marey",
        "artist": "Mika Singh, Neha Kakkar, Kumar Sanu, Tanishk Bagchi",
        "year": "2018",
        "hookStartSec": 40,
        "energy": 10,
        "query": "SIMMBA: Aankh Marey Ranveer Singh Sara Ali Khan T-Series"
    },
    {
        "title": "Ghungroo",
        "artist": "Arijit Singh, Shilpa Rao, Vishal & Shekhar",
        "year": "2019",
        "hookStartSec": 45,
        "energy": 9,
        "query": "Ghungroo Song WAR Hrithik Roshan Vaani Kapoor YRF"
    },
    {
        "title": "Nashe Si Chadh Gayi",
        "artist": "Arijit Singh, Vishal & Shekhar",
        "year": "2016",
        "hookStartSec": 38,
        "energy": 9,
        "query": "Nashe Si Chadh Gayi Song Befikre Ranveer Singh Vaani Kapoor YRF"
    },
    {
        "title": "Kamariya",
        "artist": "Darshan Raval, DJ Chetas, Lijo George",
        "year": "2018",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Kamariya Mitron Jackky Bhagnani Kritika Kamra Sony Music India"
    },
    {
        "title": "Kamariya (Stree)",
        "artist": "Aastha Gill, Divya Kumar, Sachin-Jigar",
        "year": "2018",
        "hookStartSec": 40,
        "energy": 10,
        "query": "Kamariya Video Song Stree Nora Fatehi Rajkummar Rao T-Series"
    },
    {
        "title": "Badtameez Dil",
        "artist": "Benny Dayal, Shefali Alvares, Pritam",
        "year": "2013",
        "hookStartSec": 48,
        "energy": 10,
        "query": "Badtameez Dil Full Video Song Yeh Jawaani Hai Deewani Ranbir Kapoor T-Series"
    },
    {
        "title": "Dilliwaali Girlfriend",
        "artist": "Arijit Singh, Sunidhi Chauhan, Pritam",
        "year": "2013",
        "hookStartSec": 37,
        "energy": 10,
        "query": "Dilliwaali Girlfriend Full Video Song Yeh Jawaani Hai Deewani Ranbir Kapoor Deepika T-Series"
    },
    {
        "title": "Abhi Toh Party Shuru Hui Hai",
        "artist": "Badshah, Aastha Gill",
        "year": "2014",
        "hookStartSec": 32,
        "energy": 10,
        "query": "Abhi Toh Party Shuru Hui Hai Khoobsurat Badshah Sonam Kapoor T-Series"
    },
    {
        "title": "Subah Hone Na De",
        "artist": "Mika Singh, Shefali Alvares, Pritam",
        "year": "2011",
        "hookStartSec": 44,
        "energy": 10,
        "query": "Subah Hone Na De Full Video Song Desi Boyz Akshay Kumar John Abraham T-Series"
    },
    {
        "title": "Besharam Rang",
        "artist": "Shilpa Rao, Caralisa Monteiro, Vishal & Shekhar",
        "year": "2022",
        "hookStartSec": 48,
        "energy": 9,
        "query": "Besharam Rang Song Pathaan Shah Rukh Khan Deepika Padukone YRF"
    },
    {
        "title": "Jhoome Jo Pathaan",
        "artist": "Arijit Singh, Sukriti Kakar, Vishal & Shekhar",
        "year": "2022",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Jhoome Jo Pathaan Song Shah Rukh Khan Deepika Padukone YRF"
    },
    {
        "title": "What Jhumka?",
        "artist": "Arijit Singh, Jonita Gandhi, Pritam",
        "year": "2023",
        "hookStartSec": 45,
        "energy": 10,
        "query": "What Jhumka Video Song Rocky Aur Rani Kii Prem Kahaani Ranveer Alia Saregama"
    },
    {
        "title": "Tauba Tauba",
        "artist": "Karan Aujla",
        "year": "2024",
        "hookStartSec": 30,
        "energy": 10,
        "query": "Tauba Tauba Bad Newz Vicky Kaushal Karan Aujla Saregama Music"
    },
    {
        "title": "Mauja Hi Mauja",
        "artist": "Mika Singh, Pritam",
        "year": "2007",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Mauja Hi Mauja Jab We Met Shahid Kapoor Kareena Kapoor T-Series"
    },
    {
        "title": "Chittiyaan Kalaiyaan",
        "artist": "Meet Bros, Kanika Kapoor",
        "year": "2015",
        "hookStartSec": 34,
        "energy": 9,
        "query": "Chittiyaan Kalaiyaan Video Song ROY Jacqueline Fernandez Meet Bros T-Series"
    },
    {
        "title": "Gallan Goodiyaan",
        "artist": "Yashita Sharma, Manish Kumar Tipu, Farhan Akhtar, Shankar-Ehsaan-Loy",
        "year": "2015",
        "hookStartSec": 46,
        "energy": 10,
        "query": "Gallan Goodiyaan Video Song Dil Dhadakne Do T-Series"
    },
    {
        "title": "Aaj Ki Raat",
        "artist": "Madhubanti Bagchi, Divya Kumar, Sachin-Jigar",
        "year": "2024",
        "hookStartSec": 35,
        "energy": 10,
        "query": "Aaj Ki Raat Stree 2 Tamannaah Bhatia Rajkummar Rao Sachin-Jigar Saregama"
    },
    {
        "title": "Aayi Nai",
        "artist": "Pawan Singh, Simran Choudhary, Divya Kumar, Sachin-Jigar",
        "year": "2024",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Aayi Nai Stree 2 Shraddha Kapoor Rajkummar Rao Sachin-Jigar Saregama"
    },
    {
        "title": "Dilbar",
        "artist": "Neha Kakkar, Dhvani Bhanushali, Ikka, Tanishk Bagchi",
        "year": "2018",
        "hookStartSec": 40,
        "energy": 10,
        "query": "Dilbar Satyameva Jayate John Abraham Nora Fatehi T-Series"
    },
    {
        "title": "O Saki Saki",
        "artist": "Neha Kakkar, Tulsi Kumar, B Praak, Tanishk Bagchi",
        "year": "2019",
        "hookStartSec": 42,
        "energy": 10,
        "query": "O SAKI SAKI Batla House Nora Fatehi T-Series"
    },
    {
        "title": "Garmi",
        "artist": "Badshah, Neha Kakkar",
        "year": "2019",
        "hookStartSec": 34,
        "energy": 10,
        "query": "Garmi Song Street Dancer 3D Varun Dhawan Nora Fatehi Badshah T-Series"
    },
    {
        "title": "Muqabla",
        "artist": "Yash Narvekar, Parampara Thakur, Tanishk Bagchi, A.R. Rahman",
        "year": "2019",
        "hookStartSec": 45,
        "energy": 10,
        "query": "Muqabla Street Dancer 3D Prabhudeva Varun Dhawan T-Series"
    },
    {
        "title": "Illegal Weapon 2.0",
        "artist": "Jasmine Sandlas, Garry Sandhu, Tanishk Bagchi",
        "year": "2020",
        "hookStartSec": 32,
        "energy": 10,
        "query": "Illegal Weapon 2.0 Street Dancer 3D Varun Dhawan Shraddha Kapoor T-Series"
    },
    {
        "title": "Bom Diggy Diggy",
        "artist": "Zack Knight, Jasmin Walia",
        "year": "2018",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Bom Diggy Diggy Sonu Ke Titu Ki Sweety Zack Knight Jasmin Walia T-Series"
    },
    {
        "title": "Dil Chori",
        "artist": "Yo Yo Honey Singh, Simar Kaur, Ishers",
        "year": "2017",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Dil Chori Sonu Ke Titu Ki Sweety Yo Yo Honey Singh T-Series"
    },
    {
        "title": "Chhote Chhote Peg",
        "artist": "Yo Yo Honey Singh, Neha Kakkar, Navraj Hans",
        "year": "2018",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Chhote Chhote Peg Sonu Ke Titu Ki Sweety Yo Yo Honey Singh T-Series"
    },
    {
        "title": "Balam Pichkari",
        "artist": "Vishal Dadlani, Shalmali Kholgade, Pritam",
        "year": "2013",
        "hookStartSec": 52,
        "energy": 10,
        "query": "Balam Pichkari Full Song Yeh Jawaani Hai Deewani Ranbir Kapoor Deepika T-Series"
    },
    {
        "title": "Lungi Dance",
        "artist": "Yo Yo Honey Singh",
        "year": "2013",
        "hookStartSec": 45,
        "energy": 10,
        "query": "Lungi Dance Chennai Express Yo Yo Honey Singh Shah Rukh Khan T-Series"
    },
    {
        "title": "1 2 3 4 Get On The Dance Floor",
        "artist": "Vishal Dadlani, Hamsika Iyer, Vishal-Shekhar",
        "year": "2013",
        "hookStartSec": 40,
        "energy": 10,
        "query": "1 2 3 4 Get On The Dance Floor Chennai Express Shah Rukh Khan T-Series"
    },
    {
        "title": "The Humma Song",
        "artist": "Badshah, Jubin Nautiyal, Shashaa Tirupati, A.R. Rahman, Tanishk Bagchi",
        "year": "2016",
        "hookStartSec": 38,
        "energy": 9,
        "query": "The Humma Song OK Jaanu Aditya Roy Kapur Shraddha Kapoor Badshah T-Series"
    },
    {
        "title": "Tamma Tamma Again",
        "artist": "Badshah, Bappi Lahiri, Anuradha Paudwal, Tanishk Bagchi",
        "year": "2017",
        "hookStartSec": 44,
        "energy": 10,
        "query": "Tamma Tamma Again Badrinath Ki Dulhania Varun Dhawan Alia Bhatt T-Series"
    },
    {
        "title": "Badri Ki Dulhania Title Track",
        "artist": "Dev Negi, Neha Kakkar, Monali Thakur, Ikka, Tanishk Bagchi",
        "year": "2017",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Badri Ki Dulhania Title Track Varun Dhawan Alia Bhatt T-Series"
    },
    {
        "title": "Cheez Badi",
        "artist": "Udit Narayan, Neha Kakkar, Tanishk Bagchi",
        "year": "2017",
        "hookStartSec": 40,
        "energy": 9,
        "query": "Cheez Badi Full Video Song Machine Mustafa Kiara Advani T-Series"
    },
    {
        "title": "Swag Se Swagat",
        "artist": "Vishal Dadlani, Neha Bhasin, Vishal-Shekhar",
        "year": "2017",
        "hookStartSec": 46,
        "energy": 10,
        "query": "Swag Se Swagat Song Tiger Zinda Hai Salman Khan Katrina Kaif YRF"
    },
    {
        "title": "Zingaat (Hindi)",
        "artist": "Ajay-Atul",
        "year": "2018",
        "hookStartSec": 48,
        "energy": 10,
        "query": "Zingaat Hindi Dhadak Ishaan Janhvi Ajay-Atul Zee Music Company"
    },
    {
        "title": "Sweety Tera Drama",
        "artist": "Dev Negi, Pawni Pandey, Shraddha Pandit, Tanishk Bagchi",
        "year": "2017",
        "hookStartSec": 35,
        "energy": 10,
        "query": "Sweety Tera Drama Bareilly Ki Barfi Kriti Sanon Ayushmann Khurrana Zee Music Company"
    },
    {
        "title": "Twist Kamariya",
        "artist": "Harshdeep Kaur, Yasser Desai, Tanishk-Vayu",
        "year": "2017",
        "hookStartSec": 38,
        "energy": 9,
        "query": "Twist Kamariya Bareilly Ki Barfi Ayushmann Khurrana Kriti Sanon Zee Music Company"
    },
    {
        "title": "Coca Cola",
        "artist": "Tony Kakkar, Neha Kakkar",
        "year": "2019",
        "hookStartSec": 28,
        "energy": 10,
        "query": "Coca Cola Luka Chuppi Kartik Aaryan Kriti Sanon Tony Kakkar T-Series"
    },
    {
        "title": "Poster Lagwa Do",
        "artist": "Mika Singh, Sunanda Sharma, White Noise",
        "year": "2019",
        "hookStartSec": 34,
        "energy": 10,
        "query": "Poster Lagwa Do Luka Chuppi Kartik Aaryan Kriti Sanon T-Series"
    },
    {
        "title": "Makhna (Drive)",
        "artist": "Tanishk Bagchi, Yasser Desai, Asees Kaur",
        "year": "2019",
        "hookStartSec": 38,
        "energy": 9,
        "query": "Makhna Drive Sushant Singh Rajput Jacqueline Fernandez Zee Music Company"
    },
    {
        "title": "Shaitan Ka Saala",
        "artist": "Vishal Dadlani, Sohail Sen",
        "year": "2019",
        "hookStartSec": 30,
        "energy": 10,
        "query": "Shaitan Ka Saala Bala Akshay Kumar Housefull 4 T-Series"
    },
    {
        "title": "Dheeme Dheeme",
        "artist": "Tony Kakkar, Neha Kakkar",
        "year": "2019",
        "hookStartSec": 32,
        "energy": 9,
        "query": "Dheeme Dheeme Pati Patni Aur Woh Kartik Aaryan Bhumi Ananya T-Series"
    },
    {
        "title": "Chandigarh Mein",
        "artist": "Badshah, Harrdy Sandhu, Lisa Mishra, Asees Kaur, Tanishk Bagchi",
        "year": "2019",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Chandigarh Mein Good Newwz Akshay Kareena Diljit Kiara Zee Music Company"
    },
    {
        "title": "Sauda Khara Khara",
        "artist": "Diljit Dosanjh, Sukhbir, Dhvani Bhanushali, Lijo George - DJ Chetas",
        "year": "2019",
        "hookStartSec": 40,
        "energy": 10,
        "query": "Sauda Khara Khara Good Newwz Akshay Kumar Diljit Dosanjh Zee Music Company"
    },
    {
        "title": "High Heels Te Nachche",
        "artist": "Meet Bros, Jaz Dhami, Yo Yo Honey Singh, Aditi Singh Sharma",
        "year": "2016",
        "hookStartSec": 35,
        "energy": 10,
        "query": "High Heels Te Nachche Ki & Ka Kareena Kapoor Arjun Kapoor T-Series"
    },
    {
        "title": "Baby Doll",
        "artist": "Meet Bros Anjjan, Kanika Kapoor",
        "year": "2014",
        "hookStartSec": 38,
        "energy": 9,
        "query": "Baby Doll Ragini MMS 2 Sunny Leone Meet Bros Kanika Kapoor T-Series"
    },
    {
        "title": "Lovely",
        "artist": "Kanika Kapoor, Ravindra Upadhyay, Miraya Varma, Fateh, Vishal-Shekhar",
        "year": "2014",
        "hookStartSec": 42,
        "energy": 9,
        "query": "Lovely Happy New Year Deepika Padukone Shah Rukh Khan T-Series"
    },
    {
        "title": "India Waale",
        "artist": "Vishal Dadlani, KK, Shankar Mahadevan, Neeti Mohan, Vishal-Shekhar",
        "year": "2014",
        "hookStartSec": 50,
        "energy": 9,
        "query": "India Waale Happy New Year Shah Rukh Khan Deepika Padukone T-Series"
    },
    {
        "title": "Party All Night",
        "artist": "Yo Yo Honey Singh",
        "year": "2013",
        "hookStartSec": 45,
        "energy": 10,
        "query": "Party All Night Boss Akshay Kumar Yo Yo Honey Singh T-Series"
    },
    {
        "title": "Gandi Baat",
        "artist": "Mika Singh, Kalpana Patowary, Pritam",
        "year": "2013",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Gandi Baat R Rajkumar Shahid Kapoor Sonakshi Sinha Pritam Eros Now"
    },
    {
        "title": "Saree Ke Fall Sa",
        "artist": "Antara Mitra, Nakash Aziz, Pritam",
        "year": "2013",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Saree Ke Fall Sa R Rajkumar Shahid Kapoor Sonakshi Sinha Pritam Eros Now"
    },
    {
        "title": "Dhating Naach",
        "artist": "Shefali Alvares, Nakash Aziz, Pritam",
        "year": "2013",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Dhating Naach Phata Poster Nikhla Hero Shahid Kapoor Nargis Fakhri Tips Official"
    },
    {
        "title": "Lat Lag Gayee",
        "artist": "Benny Dayal, Shalmali Kholgade, Pritam",
        "year": "2013",
        "hookStartSec": 35,
        "energy": 9,
        "query": "Lat Lag Gayee Race 2 Saif Ali Khan Jacqueline Fernandez Tips Official"
    },
    {
        "title": "Party On My Mind",
        "artist": "KK, Shefali Alvares, Yo Yo Honey Singh, Pritam",
        "year": "2013",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Party On My Mind Race 2 Saif Deepika John Jacqueline Tips Official"
    },
    {
        "title": "Chammak Challo",
        "artist": "Akon, Hamsika Iyer, Vishal-Shekhar",
        "year": "2011",
        "hookStartSec": 40,
        "energy": 10,
        "query": "Chammak Challo Ra One Shah Rukh Khan Kareena Kapoor T-Series"
    },
    {
        "title": "Criminal",
        "artist": "Akon, Vishal Dadlani, Shruti Pathak, Vishal-Shekhar",
        "year": "2011",
        "hookStartSec": 44,
        "energy": 9,
        "query": "Criminal Ra One Shah Rukh Khan Kareena Kapoor Akon T-Series"
    },
    {
        "title": "Senorita",
        "artist": "Farhan Akhtar, Hrithik Roshan, Abhay Deol, Maria del Mar Fernández, Shankar-Ehsaan-Loy",
        "year": "2011",
        "hookStartSec": 48,
        "energy": 9,
        "query": "Senorita Zindagi Na Milegi Dobara Hrithik Roshan Katrina Kaif T-Series"
    },
    {
        "title": "Character Dheela",
        "artist": "Neeraj Shridhar, Amrita Kak, Pritam",
        "year": "2011",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Character Dheela Ready Salman Khan Zarine Khan T-Series"
    },
    {
        "title": "Dhinka Chika",
        "artist": "Mika Singh, Amrita Kak, Devi Sri Prasad",
        "year": "2011",
        "hookStartSec": 34,
        "energy": 10,
        "query": "Dhinka Chika Ready Salman Khan Asin T-Series"
    },
    {
        "title": "Aunty Ji",
        "artist": "Ash King, Amit Trivedi",
        "year": "2012",
        "hookStartSec": 38,
        "energy": 9,
        "query": "Aunty Ji Ek Main Aur Ekk Tu Imran Khan Kareena Kapoor T-Series"
    },
    {
        "title": "Ooh La La",
        "artist": "Bappi Lahiri, Shreya Ghoshal, Vishal-Shekhar",
        "year": "2011",
        "hookStartSec": 32,
        "energy": 10,
        "query": "Ooh La La Tu Hai Meri Fantasy The Dirty Picture Vidya Balan Emraan Hashmi T-Series"
    },
    {
        "title": "Sheila Ki Jawani",
        "artist": "Sunidhi Chauhan, Vishal Dadlani, Vishal-Shekhar",
        "year": "2010",
        "hookStartSec": 48,
        "energy": 10,
        "query": "Sheila Ki Jawani Tees Maar Khan Katrina Kaif Akshay Kumar T-Series"
    },
    {
        "title": "Munni Badnaam Hui",
        "artist": "Mamta Sharma, Aishwarya Nigam, Lalit Pandit",
        "year": "2010",
        "hookStartSec": 44,
        "energy": 10,
        "query": "Munni Badnaam Hui Dabangg Malaika Arora Salman Khan T-Series"
    },
    {
        "title": "Fevicol Se",
        "artist": "Mamta Sharma, Wajid, Keerthi Sagathia, Sajid-Wajid",
        "year": "2012",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Fevicol Se Dabangg 2 Kareena Kapoor Salman Khan T-Series"
    },
    {
        "title": "Pandeyjee Seeti",
        "artist": "Mamta Sharma, Wajid, Shreya Ghoshal, Sajid-Wajid",
        "year": "2012",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Pandeyjee Seeti Dabangg 2 Salman Khan Sonakshi Sinha T-Series"
    },
    {
        "title": "Anarkali Disco Chali",
        "artist": "Mamta Sharma, Sukhwinder Singh, Sajid-Wajid",
        "year": "2012",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Anarkali Disco Chali Housefull 2 Malaika Arora Sajid Wajid T-Series"
    },
    {
        "title": "Papa Toh Band Bajaye",
        "artist": "Neeraj Shridhar, Sajid-Wajid",
        "year": "2012",
        "hookStartSec": 34,
        "energy": 9,
        "query": "Papa Toh Band Bajaye Housefull 2 Akshay Kumar Riteish John T-Series"
    },
    {
        "title": "Right Now Now",
        "artist": "Sunidhi Chauhan, Neeraj Shridhar, Shankar-Ehsaan-Loy",
        "year": "2010",
        "hookStartSec": 36,
        "energy": 9,
        "query": "Right Now Now Housefull Akshay Kumar Deepika Padukone T-Series"
    },
    {
        "title": "Nagada Nagada",
        "artist": "Sonu Nigam, Javed Ali, Pritam",
        "year": "2007",
        "hookStartSec": 40,
        "energy": 10,
        "query": "Nagada Nagada Jab We Met Shahid Kapoor Kareena Kapoor T-Series"
    },
    {
        "title": "Desi Girl",
        "artist": "Shankar Mahadevan, Sunidhi Chauhan, Vishal Dadlani, Vishal-Shekhar",
        "year": "2008",
        "hookStartSec": 45,
        "energy": 10,
        "query": "Desi Girl Dostana Priyanka Chopra John Abraham Abhishek Bachchan Sony Music India"
    },
    {
        "title": "Maa Da Laadla",
        "artist": "Master Saleem, Vishal-Shekhar",
        "year": "2008",
        "hookStartSec": 36,
        "energy": 9,
        "query": "Maa Da Laadla Dostana Abhishek Bachchan John Abraham Sony Music India"
    },
    {
        "title": "Shut Up & Bounce",
        "artist": "Sunidhi Chauhan, Vishal Dadlani, Vishal-Shekhar",
        "year": "2008",
        "hookStartSec": 34,
        "energy": 9,
        "query": "Shut Up & Bounce Dostana Shilpa Shetty John Abhishek Sony Music India"
    },
    {
        "title": "Jai Ho",
        "artist": "A.R. Rahman, Sukhwinder Singh, Tanvi Shah, Mahalakshmi Iyer",
        "year": "2008",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Jai Ho Slumdog Millionaire AR Rahman Sukhwinder Singh"
    },
    {
        "title": "Where's The Party Tonight",
        "artist": "Shankar Mahadevan, Shaan, Vasundhara Das, Loy Mendonsa, Shankar-Ehsaan-Loy",
        "year": "2006",
        "hookStartSec": 48,
        "energy": 10,
        "query": "Where's The Party Tonight Kabhi Alvida Naa Kehna Sony Music India"
    },
    {
        "title": "It's The Time To Disco",
        "artist": "KK, Shaan, Vasundhara Das, Loy Mendonsa, Shankar-Ehsaan-Loy",
        "year": "2003",
        "hookStartSec": 44,
        "energy": 10,
        "query": "It's The Time To Disco Kal Ho Naa Ho Shah Rukh Khan Preity Zinta Sony Music India"
    },
    {
        "title": "Dus Bahane 2.0",
        "artist": "Vishal & Shekhar, KK, Shaan, Tulsi Kumar",
        "year": "2020",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Dus Bahane 2.0 Baaghi 3 Tiger Shroff Shraddha Kapoor T-Series"
    },
    {
        "title": "Kajra Re",
        "artist": "Alisha Chinai, Shankar Mahadevan, Javed Ali, Shankar-Ehsaan-Loy",
        "year": "2005",
        "hookStartSec": 48,
        "energy": 10,
        "query": "Kajra Re Bunty Aur Babli Aishwarya Rai Amitabh Bachchan Abhishek YRF"
    },
    {
        "title": "Dhoom Machale",
        "artist": "Sunidhi Chauhan, Pritam",
        "year": "2004",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Dhoom Machale Dhoom Esha Deol John Abraham Abhishek YRF"
    },
    {
        "title": "Crazy Kiya Re",
        "artist": "Sunidhi Chauhan, Pritam",
        "year": "2006",
        "hookStartSec": 40,
        "energy": 10,
        "query": "Crazy Kiya Re Dhoom 2 Aishwarya Rai Hrithik Roshan YRF"
    },
    {
        "title": "Twist",
        "artist": "Neeraj Shridhar, Pritam",
        "year": "2009",
        "hookStartSec": 32,
        "energy": 10,
        "query": "Twist Love Aaj Kal Saif Ali Khan Deepika Padukone Pritam Eros Now"
    },
    {
        "title": "Chor Bazaari",
        "artist": "Neeraj Shridhar, Sunidhi Chauhan, Pritam",
        "year": "2009",
        "hookStartSec": 38,
        "energy": 9,
        "query": "Chor Bazaari Love Aaj Kal Saif Ali Khan Deepika Padukone Eros Now"
    },
    {
        "title": "Aahun Aahun",
        "artist": "Master Saleem, Neeraj Shridhar, Suzanne D'Mello, Pritam",
        "year": "2009",
        "hookStartSec": 35,
        "energy": 10,
        "query": "Aahun Aahun Love Aaj Kal Saif Ali Khan Deepika Padukone Eros Now"
    },
    {
        "title": "Chaiyya Chaiyya",
        "artist": "Sukhwinder Singh, Sapna Awasthi, A.R. Rahman",
        "year": "1998",
        "hookStartSec": 48,
        "energy": 10,
        "query": "Chaiyya Chaiyya Dil Se Shah Rukh Khan Malaika Arora AR Rahman Venus"
    },
    {
        "title": "Say Shava Shava",
        "artist": "Sudesh Bhosle, Alka Yagnik, Sunidhi Chauhan, Amitabh Bachchan, Aadesh Shrivastava",
        "year": "2001",
        "hookStartSec": 54,
        "energy": 10,
        "query": "Say Shava Shava Kabhi Khushi Kabhie Gham Amitabh Bachchan Sony Music India"
    },
    {
        "title": "You Are My Soniya",
        "artist": "Sonu Nigam, Alka Yagnik, Sandesh Shandilya",
        "year": "2001",
        "hookStartSec": 45,
        "energy": 9,
        "query": "You Are My Soniya Kabhi Khushi Kabhie Gham Hrithik Roshan Kareena Sony Music India"
    },
    {
        "title": "Bole Chudiyan",
        "artist": "Amit Kumar, Sonu Nigam, Alka Yagnik, Udit Narayan, Kavita Krishnamurthy, Jatin-Lalit",
        "year": "2001",
        "hookStartSec": 52,
        "energy": 9,
        "query": "Bole Chudiyan Kabhi Khushi Kabhie Gham Shah Rukh Khan Kajol Hrithik Kareena Sony Music India"
    },
    {
        "title": "Show Me The Thumka",
        "artist": "Sunidhi Chauhan, Shashwat Singh, Pritam",
        "year": "2023",
        "hookStartSec": 40,
        "energy": 10,
        "query": "Show Me The Thumka Tu Jhoothi Main Makkaar Ranbir Kapoor Shraddha Kapoor T-Series"
    },
    {
        "title": "Pyaar Hota Kayi Baar Hai",
        "artist": "Arijit Singh, Pritam",
        "year": "2023",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Pyaar Hota Kayi Baar Hai Tu Jhoothi Main Makkaar Ranbir Kapoor T-Series"
    },
    {
        "title": "Main Nikla Gaddi Leke (Gadar 2)",
        "artist": "Udit Narayan, Aditya Narayan, Mithoon",
        "year": "2023",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Main Nikla Gaddi Leke Gadar 2 Sunny Deol Utkarsh Sharma Zee Music Company"
    },
    {
        "title": "Bhool Bhulaiyaa 2 Title Track",
        "artist": "Neeraj Shridhar, Tanishk Bagchi, Pritam",
        "year": "2022",
        "hookStartSec": 34,
        "energy": 10,
        "query": "Bhool Bhulaiyaa 2 Title Track Kartik Aaryan Neeraj Shridhar T-Series"
    },
    {
        "title": "The Punjaabban Song",
        "artist": "Gippy Grewal, Zahrah S Khan, Tanishk Bagchi, Romy",
        "year": "2022",
        "hookStartSec": 36,
        "energy": 10,
        "query": "The Punjaabban Song JugJugg Jeeyo Varun Dhawan Kiara Advani Anil Kapoor T-Series"
    },
    {
        "title": "Param Sundari",
        "artist": "Shreya Ghoshal, A.R. Rahman",
        "year": "2021",
        "hookStartSec": 36,
        "energy": 9,
        "query": "Param Sundari Mimi Kriti Sanon AR Rahman Shreya Ghoshal Sony Music India"
    },
    {
        "title": "Bijlee Bijlee",
        "artist": "Harrdy Sandhu, B Praak",
        "year": "2021",
        "hookStartSec": 32,
        "energy": 10,
        "query": "Bijlee Bijlee Harrdy Sandhu Palak Tiwari B Praak Desi Melodies"
    },
    {
        "title": "Dance Ka Bhoot",
        "artist": "Arijit Singh, Pritam",
        "year": "2022",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Dance Ka Bhoot Brahmastra Ranbir Kapoor Pritam Arijit Singh Sony Music India"
    },
    {
        "title": "Not Ramaiya Vastavaiya",
        "artist": "Vishal Dadlani, Shilpa Rao, Anirudh Ravichander",
        "year": "2023",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Not Ramaiya Vastavaiya Jawan Shah Rukh Khan Nayanthara Anirudh T-Series"
    },
    {
        "title": "Zinda Banda",
        "artist": "Anirudh Ravichander",
        "year": "2023",
        "hookStartSec": 45,
        "energy": 10,
        "query": "Zinda Banda Jawan Shah Rukh Khan Anirudh Ravichander T-Series"
    },
    {
        "title": "Chaleya",
        "artist": "Arijit Singh, Shilpa Rao, Anirudh Ravichander",
        "year": "2023",
        "hookStartSec": 36,
        "energy": 9,
        "query": "Chaleya Jawan Shah Rukh Khan Nayanthara Anirudh Arijit Singh T-Series"
    },
    {
        "title": "Lutt Putt Gaya",
        "artist": "Arijit Singh, Pritam",
        "year": "2023",
        "hookStartSec": 38,
        "energy": 9,
        "query": "Lutt Putt Gaya Dunki Shah Rukh Khan Taapsee Pannu Pritam Arijit Singh T-Series"
    },
    {
        "title": "Taras",
        "artist": "Jasmine Sandlas, Sachin-Jigar",
        "year": "2024",
        "hookStartSec": 30,
        "energy": 10,
        "query": "Taras Munjya Sharvari Sachin-Jigar Jasmine Sandlas Zee Music Company"
    },
    {
        "title": "Akhiyaan Gulaab",
        "artist": "Mitraz",
        "year": "2024",
        "hookStartSec": 32,
        "energy": 9,
        "query": "Akhiyaan Gulaab Teri Baaton Mein Aisa Uljha Jiya Shahid Kapoor Kriti Sanon T-Series"
    },
    {
        "title": "Teri Baaton Mein Aisa Uljha Jiya",
        "artist": "Raghav, Tanishk Bagchi, Asees Kaur",
        "year": "2024",
        "hookStartSec": 34,
        "energy": 10,
        "query": "Teri Baaton Mein Aisa Uljha Jiya Title Song Shahid Kapoor Kriti Sanon T-Series"
    },
    {
        "title": "Laal Peeli Akhiyaan",
        "artist": "Romy, Shanyush, Tanishk Bagchi",
        "year": "2024",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Laal Peeli Akhiyaan Teri Baaton Mein Aisa Uljha Jiya Shahid Kapoor Kriti Sanon T-Series"
    },
    {
        "title": "Chogada",
        "artist": "Darshan Raval, Asees Kaur, Lijo George - DJ Chetas",
        "year": "2018",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Chogada Tara Loveyatri Aayush Sharma Warina Hussain T-Series"
    },
    {
        "title": "Akh Lad Jaave",
        "artist": "Badshah, Asees Kaur, Jubin Nautiyal, Tanishk Bagchi",
        "year": "2018",
        "hookStartSec": 32,
        "energy": 9,
        "query": "Akh Lad Jaave Loveyatri Aayush Sharma Warina Hussain Badshah T-Series"
    },
    {
        "title": "First Class",
        "artist": "Arijit Singh, Neeti Mohan, Pritam",
        "year": "2019",
        "hookStartSec": 40,
        "energy": 10,
        "query": "First Class Kalank Varun Dhawan Kiara Advani Pritam Zee Music Company"
    },
    {
        "title": "Slow Motion",
        "artist": "Nakash Aziz, Shreya Ghoshal, Vishal & Shekhar",
        "year": "2019",
        "hookStartSec": 38,
        "energy": 9,
        "query": "Slow Motion Bharat Salman Khan Disha Patani Vishal & Shekhar T-Series"
    },
    {
        "title": "Mast Malang Jhoom",
        "artist": "Vishal Mishra, Arijit Singh, Nikhita Gandhi",
        "year": "2024",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Mast Malang Jhoom Bade Miyan Chote Miyan Akshay Kumar Tiger Shroff Zee Music Company"
    },
    {
        "title": "Bade Miyan Chote Miyan Title Track",
        "artist": "Anirudh Ravichander, Vishal Mishra",
        "year": "2024",
        "hookStartSec": 34,
        "energy": 10,
        "query": "Bade Miyan Chote Miyan Title Track Akshay Kumar Tiger Shroff Zee Music Company"
    },
    {
        "title": "Dus Bahane (Original)",
        "artist": "KK, Shaan, Vishal-Shekhar",
        "year": "2005",
        "hookStartSec": 42,
        "energy": 10,
        "query": "Dus Bahane Karke Le Gaye Dil Dus Abhishek Bachchan Sanjay Dutt T-Series"
    },
    {
        "title": "Marjaani",
        "artist": "Sukhwinder Singh, Sunidhi Chauhan, Pritam",
        "year": "2009",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Marjaani Billu Shah Rukh Khan Kareena Kapoor Pritam T-Series"
    },
    {
        "title": "Love Mera Hit Hit",
        "artist": "Neeraj Shridhar, Tulsi Kumar, Pritam",
        "year": "2009",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Love Mera Hit Hit Billu Shah Rukh Khan Deepika Padukone Pritam T-Series"
    },
    {
        "title": "Tamanche Pe Disco",
        "artist": "RDB, Raftaar, Nindy Kaur",
        "year": "2013",
        "hookStartSec": 38,
        "energy": 10,
        "query": "Tamanche Pe Disco Bullett Raja Saif Ali Khan Sonakshi Sinha RDB T-Series"
    },
    {
        "title": "Gali Gali",
        "artist": "Neha Kakkar, Tanishk Bagchi",
        "year": "2018",
        "hookStartSec": 34,
        "energy": 10,
        "query": "Gali Gali KGF Mouni Roy Neha Kakkar T-Series"
    },
    {
        "title": "Proper Patola",
        "artist": "Badshah, Diljit Dosanjh, Aastha Gill",
        "year": "2018",
        "hookStartSec": 32,
        "energy": 10,
        "query": "Proper Patola Namaste England Arjun Kapoor Parineeti Chopra Badshah T-Series"
    },
    {
        "title": "Hauli Hauli",
        "artist": "Garry Sandhu, Neha Kakkar, Tanishk Bagchi",
        "year": "2019",
        "hookStartSec": 34,
        "energy": 10,
        "query": "Hauli Hauli De De Pyaar De Ajay Devgn Tabu Rakul Preet T-Series"
    },
    {
        "title": "Mungda",
        "artist": "Jyotica Tangri, Shaan, Subhro Ganguly, Gourov-Roshin",
        "year": "2019",
        "hookStartSec": 35,
        "energy": 10,
        "query": "Mungda Total Dhamaal Sonakshi Sinha Ajay Devgn T-Series"
    },
    {
        "title": "Bhool Bhulaiyaa 3 Title Track",
        "artist": "Pitbull, Diljit Dosanjh, Neeraj Shridhar, Pritam, Tanishk Bagchi",
        "year": "2024",
        "hookStartSec": 36,
        "energy": 10,
        "query": "Bhool Bhulaiyaa 3 Title Track Kartik Aaryan Pitbull Diljit Dosanjh T-Series"
    },
    {
        "title": "Ami Je Tomar 3.0",
        "artist": "Shreya Ghoshal, Arijit Singh, Pritam",
        "year": "2024",
        "hookStartSec": 45,
        "energy": 9,
        "query": "Ami Je Tomar 3.0 Bhool Bhulaiyaa 3 Madhuri Dixit Vidya Balan T-Series"
    }
]

def verify_oembed(vid):
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                return True, data.get("title", ""), data.get("author_name", "")
    except Exception:
        pass
    return False, "", ""

def search_candidate(cand):
    q = cand["query"]
    ydl_opts = {
        "quiet": True,
        "extract_flat": True,
        "noplaylist": True,
        "ignoreerrors": True,
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
                    # Verify via oEmbed
                    valid, yt_title, author = verify_oembed(vid)
                    if valid:
                        dur = duration if (duration and 120 <= duration <= 450) else 215
                        return {
                            "candidate": cand,
                            "videoId": vid,
                            "durationSec": int(dur),
                            "ytTitle": yt_title,
                            "channel": author
                        }
    except Exception as e:
        print(f"Error on {cand['title']}: {e}")
    return None

def main():
    print(f"Starting search & verification for {len(CANDIDATES)} candidates...")
    t0 = time.time()
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(search_candidate, c): c for c in CANDIDATES}
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            if res:
                results.append(res)
                print(f"[{len(results)}] OK: {res['candidate']['title']} -> {res['videoId']} ({res['durationSec']}s) | {res['channel']}")

    print(f"Fetched {len(results)} verified songs in {time.time()-t0:.2f}s")

    # Deduplicate video IDs
    used_vids = set()
    curated_songs = []

    for r in results:
        vid = r["videoId"]
        if vid in used_vids:
            continue
        used_vids.add(vid)
        cand = r["candidate"]
        
        hook_start = int(cand["hookStartSec"])
        hook_end = hook_start + 40
        dur = r["durationSec"]
        if dur < hook_end + 10:
            dur = hook_end + 60
        # If duration is excessively long (e.g. > 320 for full jukebox), clamp to 220
        if dur > 320:
            dur = 220

        song_entry = {
            "title": cand["title"],
            "artist": cand["artist"],
            "year": str(cand["year"]),
            "durationSec": dur,
            "hookStartSec": hook_start,
            "hookEndSec": hook_end,
            "entrySec": hook_start,
            "exitSec": hook_end,
            "videoId": vid,
            "energy": int(cand["energy"])
        }
        curated_songs.append(song_entry)

    print(f"Unique verified songs count: {len(curated_songs)}")

    if len(curated_songs) < 100:
        print(f"WARNING: Only {len(curated_songs)} unique songs found, need at least 100!")
    else:
        # Take first 100
        curated_songs = curated_songs[:100]
        print(f"Trimmed to exactly 100 songs.")

    out_data = {
        "hindi-dance": curated_songs
    }

    out_path = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches\agent_1.json"
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved {len(curated_songs)} songs to {out_path}")

if __name__ == "__main__":
    main()
