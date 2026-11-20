import fs from 'node:fs';
import path from 'node:path';

const outPath = 'C:\\Users\\itzra\\.gemini\\antigravity\\scratch\\NOVA-DJ-REMIXER\\scripts\\curated_batches\\agent_3.json';

// Candidate lists with query, title, artist, year, hookStartSec, energy
export const romanticCandidates = [
  {
    query: "Tum Hi Ho Aashiqui 2 official video song Arijit Singh T-Series",
    title: "Tum Hi Ho",
    artist: "Arijit Singh, Mithoon",
    year: "2013",
    hookStartSec: 62,
    energy: 8
  },
  {
    query: "Kesariya Brahmastra official video Ranbir Kapoor Arijit Singh Sony Music India",
    title: "Kesariya",
    artist: "Arijit Singh, Pritam",
    year: "2022",
    hookStartSec: 65,
    energy: 9
  },
  {
    query: "Raataan Lambiyan Shershaah official video Jubin Nautiyal T-Series",
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal, Asees Kaur, Tanishk Bagchi",
    year: "2021",
    hookStartSec: 42,
    energy: 8
  },
  {
    query: "Gerua Dilwale official video song Shah Rukh Khan Kajol Sony Music India",
    title: "Gerua",
    artist: "Arijit Singh, Antara Mitra, Pritam",
    year: "2015",
    hookStartSec: 85,
    energy: 9
  },
  {
    query: "Apna Bana Le Bhediya official video Varun Dhawan Arijit Singh Zee Music Company",
    title: "Apna Bana Le",
    artist: "Arijit Singh, Sachin-Jigar",
    year: "2022",
    hookStartSec: 64,
    energy: 9
  },
  {
    query: "Shayad Love Aaj Kal official video Kartik Aaryan Arijit Singh Sony Music India",
    title: "Shayad",
    artist: "Arijit Singh, Pritam",
    year: "2020",
    hookStartSec: 40,
    energy: 8
  },
  {
    query: "Pehle Bhi Main Animal official video Ranbir Kapoor Vishal Mishra T-Series",
    title: "Pehle Bhi Main",
    artist: "Vishal Mishra, Harshavardhan Rameshwar",
    year: "2023",
    hookStartSec: 36,
    energy: 8
  },
  {
    query: "Pehli Nazar Mein Race official video song Atif Aslam Tips Official",
    title: "Pehli Nazar Mein",
    artist: "Atif Aslam, Pritam",
    year: "2008",
    hookStartSec: 52,
    energy: 9
  },
  {
    query: "Tera Hone Laga Hoon Ajab Prem Ki Ghazab Kahani official video Atif Aslam Tips Official",
    title: "Tera Hone Laga Hoon",
    artist: "Atif Aslam, Alisha Chinai, Pritam",
    year: "2009",
    hookStartSec: 55,
    energy: 9
  },
  {
    query: "Subhanallah Yeh Jawaani Hai Deewani official video Ranbir Kapoor T-Series",
    title: "Subhanallah",
    artist: "Sreerama Chandra, Shilpa Rao, Pritam",
    year: "2013",
    hookStartSec: 48,
    energy: 8
  },
  {
    query: "Ilahi Yeh Jawaani Hai Deewani official video Ranbir Kapoor Arijit Singh T-Series",
    title: "Ilahi",
    artist: "Arijit Singh, Pritam",
    year: "2013",
    hookStartSec: 35,
    energy: 9
  },
  {
    query: "Hawayein Jab Harry Met Sejal official video Shah Rukh Khan Arijit Singh Sony Music India",
    title: "Hawayein",
    artist: "Arijit Singh, Pritam",
    year: "2017",
    hookStartSec: 50,
    energy: 9
  },
  {
    query: "Tum Se Hi Jab We Met official video Shahid Kapoor Mohit Chauhan T-Series",
    title: "Tum Se Hi",
    artist: "Mohit Chauhan, Pritam",
    year: "2007",
    hookStartSec: 48,
    energy: 8
  },
  {
    query: "Zaalima Raees official video Shah Rukh Khan Arijit Singh Zee Music Company",
    title: "Zaalima",
    artist: "Arijit Singh, Harshdeep Kaur, JAM8",
    year: "2017",
    hookStartSec: 54,
    energy: 9
  },
  {
    query: "Dil Diyan Gallan Tiger Zinda Hai official video Salman Khan Atif Aslam YRF",
    title: "Dil Diyan Gallan",
    artist: "Atif Aslam, Vishal-Shekhar",
    year: "2017",
    hookStartSec: 52,
    energy: 8
  },
  {
    query: "Tera Ban Jaunga Kabir Singh official video Shahid Kapoor T-Series",
    title: "Tera Ban Jaunga",
    artist: "Akhil Sachdeva, Tulsi Kumar",
    year: "2019",
    hookStartSec: 42,
    energy: 9
  },
  {
    query: "Bekhayali Kabir Singh official video Shahid Kapoor Sachet Tandon T-Series",
    title: "Bekhayali",
    artist: "Sachet Tandon, Sachet-Parampara",
    year: "2019",
    hookStartSec: 72,
    energy: 9
  },
  {
    query: "Tujh Mein Rab Dikhta Hai Rab Ne Bana Di Jodi official video Shah Rukh Khan YRF",
    title: "Tujh Mein Rab Dikhta Hai",
    artist: "Roop Kumar Rathod, Salim-Sulaiman",
    year: "2008",
    hookStartSec: 55,
    energy: 9
  },
  {
    query: "Haule Haule Rab Ne Bana Di Jodi official video Shah Rukh Khan Sukhwinder Singh YRF",
    title: "Haule Haule",
    artist: "Sukhwinder Singh, Salim-Sulaiman",
    year: "2008",
    hookStartSec: 60,
    energy: 9
  },
  {
    query: "Suraj Hua Maddham Kabhi Khushi Kabhie Gham official video Shah Rukh Khan Sony Music India",
    title: "Suraj Hua Maddham",
    artist: "Sonu Nigam, Alka Yagnik, Sandesh Shandilya",
    year: "2001",
    hookStartSec: 70,
    energy: 9
  },
  {
    query: "Kal Ho Naa Ho title track official video Shah Rukh Khan Sonu Nigam Sony Music India",
    title: "Kal Ho Naa Ho",
    artist: "Sonu Nigam, Shankar-Ehsaan-Loy",
    year: "2003",
    hookStartSec: 62,
    energy: 8
  },
  {
    query: "Kuch Kuch Hota Hai title track official video Shah Rukh Khan Kajol Sony Music India",
    title: "Kuch Kuch Hota Hai",
    artist: "Udit Narayan, Alka Yagnik, Jatin-Lalit",
    year: "1998",
    hookStartSec: 75,
    energy: 8
  },
  {
    query: "Tujhe Dekha Toh DDLJ official video Shah Rukh Khan Kajol YRF",
    title: "Tujhe Dekha Toh",
    artist: "Kumar Sanu, Lata Mangeshkar, Jatin-Lalit",
    year: "1995",
    hookStartSec: 65,
    energy: 9
  },
  {
    query: "Bol Do Na Zara Azhar official video Emraan Hashmi Armaan Malik T-Series",
    title: "Bol Do Na Zara",
    artist: "Armaan Malik, Amaal Mallik",
    year: "2016",
    hookStartSec: 46,
    energy: 8
  },
  {
    query: "Sun Saathiya ABCD 2 official video Shraddha Kapoor Zee Music Company",
    title: "Sun Saathiya",
    artist: "Priya Saraiya, Divya Kumar, Sachin-Jigar",
    year: "2015",
    hookStartSec: 36,
    energy: 9
  },
  {
    query: "Main Tenu Samjhawan Ki Humpty Sharma Ki Dulhania official video Arijit Singh Sony Music India",
    title: "Samjhawan",
    artist: "Arijit Singh, Shreya Ghoshal, Sharib-Toshi",
    year: "2014",
    hookStartSec: 50,
    energy: 9
  },
  {
    query: "Mast Magan 2 States official video Arjun Kapoor Alia Bhatt T-Series",
    title: "Mast Magan",
    artist: "Arijit Singh, Chinmayi Sripada, Shankar-Ehsaan-Loy",
    year: "2014",
    hookStartSec: 48,
    energy: 8
  },
  {
    query: "Galliyan Ek Villain official video Sidharth Malhotra Ankit Tiwari T-Series",
    title: "Galliyan",
    artist: "Ankit Tiwari",
    year: "2014",
    hookStartSec: 56,
    energy: 9
  },
  {
    query: "Ban Ja Rani Tumhari Sulu official video Guru Randhawa T-Series",
    title: "Ban Ja Rani",
    artist: "Guru Randhawa",
    year: "2017",
    hookStartSec: 32,
    energy: 9
  },
  {
    query: "Nazm Nazm Bareilly Ki Barfi official video Ayushmann Khurrana Zee Music Company",
    title: "Nazm Nazm",
    artist: "Arko",
    year: "2017",
    hookStartSec: 38,
    energy: 8
  },
  {
    query: "Humsafar Badrinath Ki Dulhania official video Varun Dhawan Alia Bhatt T-Series",
    title: "Humsafar",
    artist: "Akhil Sachdeva, Mansheel Gujral",
    year: "2017",
    hookStartSec: 45,
    energy: 8
  },
  {
    query: "Enna Sona OK Jaanu official video Arijit Singh AR Rahman Sony Music India",
    title: "Enna Sona",
    artist: "Arijit Singh, A.R. Rahman",
    year: "2017",
    hookStartSec: 35,
    energy: 8
  },
  {
    query: "Kaun Tujhe M.S. Dhoni official video Sushant Singh Rajput Palak Muchhal T-Series",
    title: "Kaun Tujhe",
    artist: "Palak Muchhal, Amaal Mallik",
    year: "2016",
    hookStartSec: 45,
    energy: 8
  },
  {
    query: "Jab Tak M.S. Dhoni official video Sushant Singh Rajput Armaan Malik T-Series",
    title: "Jab Tak",
    artist: "Armaan Malik, Amaal Mallik",
    year: "2016",
    hookStartSec: 42,
    energy: 8
  },
  {
    query: "Jeena Jeena Badlapur official video Varun Dhawan Atif Aslam Eros Now",
    title: "Jeena Jeena",
    artist: "Atif Aslam, Sachin-Jigar",
    year: "2015",
    hookStartSec: 46,
    energy: 8
  },
  {
    query: "Channa Mereya Ae Dil Hai Mushkil official video Ranbir Kapoor Arijit Singh Sony Music India",
    title: "Channa Mereya",
    artist: "Arijit Singh, Pritam",
    year: "2016",
    hookStartSec: 62,
    energy: 9
  },
  {
    query: "Ae Dil Hai Mushkil title track official video Ranbir Kapoor Arijit Singh Sony Music India",
    title: "Ae Dil Hai Mushkil",
    artist: "Arijit Singh, Pritam",
    year: "2016",
    hookStartSec: 48,
    energy: 9
  },
  {
    query: "Bulleya Ae Dil Hai Mushkil official video Ranbir Kapoor Aishwarya Rai Sony Music India",
    title: "Bulleya",
    artist: "Amit Mishra, Shilpa Rao, Pritam",
    year: "2016",
    hookStartSec: 52,
    energy: 9
  },
  {
    query: "Deva Deva Brahmastra official video Ranbir Kapoor Arijit Singh Sony Music India",
    title: "Deva Deva",
    artist: "Arijit Singh, Jonita Gandhi, Pritam",
    year: "2022",
    hookStartSec: 48,
    energy: 9
  },
  {
    query: "Tere Hawaale Laal Singh Chaddha official video Aamir Khan Arijit Singh T-Series",
    title: "Tere Hawaale",
    artist: "Arijit Singh, Shilpa Rao, Pritam",
    year: "2022",
    hookStartSec: 58,
    energy: 8
  },
  {
    query: "O Maahi Dunki official video Shah Rukh Khan Arijit Singh T-Series",
    title: "O Maahi",
    artist: "Arijit Singh, Pritam",
    year: "2023",
    hookStartSec: 46,
    energy: 9
  },
  {
    query: "Satranga Animal official video Ranbir Kapoor Rashmika Mandanna Arijit Singh T-Series",
    title: "Satranga",
    artist: "Arijit Singh, Shreyas Puranik",
    year: "2023",
    hookStartSec: 50,
    energy: 8
  },
  {
    query: "Chaleya Jawan official video Shah Rukh Khan Nayanthara Arijit Singh T-Series",
    title: "Chaleya",
    artist: "Arijit Singh, Shilpa Rao, Anirudh Ravichander",
    year: "2023",
    hookStartSec: 36,
    energy: 9
  },
  {
    query: "Lut Gaye official music video Jubin Nautiyal Emraan Hashmi T-Series",
    title: "Lut Gaye",
    artist: "Jubin Nautiyal, Tanishk Bagchi",
    year: "2021",
    hookStartSec: 45,
    energy: 9
  },
  {
    query: "Raabta Agent Vinod official video Saif Ali Khan Kareena Kapoor T-Series",
    title: "Raabta",
    artist: "Arijit Singh, Hamsika Iyer, Pritam",
    year: "2012",
    hookStartSec: 44,
    energy: 8
  },
  {
    query: "Pee Loon Once Upon A Time In Mumbaai official video Emraan Hashmi Mohit Chauhan T-Series",
    title: "Pee Loon",
    artist: "Mohit Chauhan, Pritam",
    year: "2010",
    hookStartSec: 52,
    energy: 8
  },
  {
    query: "Tum Mile title track official video Emraan Hashmi Neeraj Shridhar Sony Music India",
    title: "Tum Mile",
    artist: "Neeraj Shridhar, Pritam",
    year: "2009",
    hookStartSec: 54,
    energy: 9
  },
  {
    query: "Tu Hi Meri Shab Hai Gangster official video Emraan Hashmi KK Sony Music India",
    title: "Tu Hi Meri Shab Hai",
    artist: "KK, Pritam",
    year: "2006",
    hookStartSec: 58,
    energy: 9
  },
  {
    query: "Labon Ko Bhool Bhulaiyaa official video Akshay Kumar KK T-Series",
    title: "Labon Ko",
    artist: "KK, Pritam",
    year: "2007",
    hookStartSec: 50,
    energy: 8
  },
  {
    query: "Zara Sa Jannat official video Emraan Hashmi KK Sony Music India",
    title: "Zara Sa",
    artist: "KK, Pritam",
    year: "2008",
    hookStartSec: 48,
    energy: 9
  },
  {
    query: "Haan Tu Hain Jannat official video Emraan Hashmi KK Sony Music India",
    title: "Haan Tu Hain",
    artist: "KK, Pritam",
    year: "2008",
    hookStartSec: 46,
    energy: 8
  },
  {
    query: "Te Amo Dum Maaro Dum official video Rana Daggubati Bipasha Basu T-Series",
    title: "Te Amo",
    artist: "Ash King, Sunidhi Chauhan, Pritam",
    year: "2011",
    hookStartSec: 40,
    energy: 8
  },
  {
    query: "Bin Tere I Hate Luv Storys official video Imran Khan Sonam Kapoor Sony Music India",
    title: "Bin Tere",
    artist: "Shafqat Amanat Ali, Sunidhi Chauhan, Vishal-Shekhar",
    year: "2010",
    hookStartSec: 50,
    energy: 8
  },
  {
    query: "Bahara I Hate Luv Storys official video Imran Khan Sonam Kapoor Sony Music India",
    title: "Bahara",
    artist: "Shreya Ghoshal, Sona Mohapatra, Vishal-Shekhar",
    year: "2010",
    hookStartSec: 42,
    energy: 9
  },
  {
    query: "Hey Shona Ta Ra Rum Pum official video Saif Ali Khan Rani Mukerji YRF",
    title: "Hey Shona",
    artist: "Shaan, Sunidhi Chauhan, Vishal-Shekhar",
    year: "2007",
    hookStartSec: 45,
    energy: 8
  },
  {
    query: "Bol Na Halke Halke Jhoom Barabar Jhoom official video Abhishek Bachchan YRF",
    title: "Bol Na Halke Halke",
    artist: "Rahat Fateh Ali Khan, Mahalakshmi Iyer, Shankar-Ehsaan-Loy",
    year: "2007",
    hookStartSec: 64,
    energy: 8
  },
  {
    query: "Falak Tak Tashan official video Akshay Kumar Kareena Kapoor YRF",
    title: "Falak Tak",
    artist: "Udit Narayan, Mahalakshmi Iyer, Vishal-Shekhar",
    year: "2008",
    hookStartSec: 54,
    energy: 8
  },
  {
    query: "Tu Jaane Na Ajab Prem Ki Ghazab Kahani official video Ranbir Kapoor Atif Aslam Tips Official",
    title: "Tu Jaane Na",
    artist: "Atif Aslam, Pritam",
    year: "2009",
    hookStartSec: 60,
    energy: 9
  },
  {
    query: "Main Rang Sharbaton Ka Phata Poster Nikhla Hero official video Shahid Kapoor Tips Official",
    title: "Main Rang Sharbaton Ka",
    artist: "Atif Aslam, Chinmayi Sripada, Pritam",
    year: "2013",
    hookStartSec: 48,
    energy: 8
  },
  {
    query: "Saibo Shor In The City official video Radhika Apte Shreya Ghoshal Sony Music India",
    title: "Saibo",
    artist: "Shreya Ghoshal, Tochi Raina, Sachin-Jigar",
    year: "2011",
    hookStartSec: 36,
    energy: 8
  },
  {
    query: "Pani Da Rang Vicky Donor official video Ayushmann Khurrana Eros Now",
    title: "Pani Da Rang",
    artist: "Ayushmann Khurrana, Rochak Kohli",
    year: "2012",
    hookStartSec: 38,
    energy: 8
  },
  {
    query: "Saadi Galli Aaja Nautanki Saala official video Ayushmann Khurrana T-Series",
    title: "Saadi Galli Aaja",
    artist: "Ayushmann Khurrana, Neeti Mohan, Rochak Kohli",
    year: "2013",
    hookStartSec: 34,
    energy: 9
  },
  {
    query: "Kabira Yeh Jawaani Hai Deewani official video Ranbir Kapoor Deepika Padukone T-Series",
    title: "Kabira",
    artist: "Tochi Raina, Rekha Bhardwaj, Pritam",
    year: "2013",
    hookStartSec: 48,
    energy: 8
  },
  {
    query: "Agar Tum Saath Ho Tamasha official video Ranbir Kapoor Deepika Padukone T-Series",
    title: "Agar Tum Saath Ho",
    artist: "Alka Yagnik, Arijit Singh, A.R. Rahman",
    year: "2015",
    hookStartSec: 62,
    energy: 9
  },
  {
    query: "Matargashti Tamasha official video Ranbir Kapoor Deepika Padukone Mohit Chauhan T-Series",
    title: "Matargashti",
    artist: "Mohit Chauhan, A.R. Rahman",
    year: "2015",
    hookStartSec: 32,
    energy: 9
  },
  {
    query: "Ishq Wala Love Student of the Year official video Alia Bhatt Sidharth Malhotra Sony Music India",
    title: "Ishq Wala Love",
    artist: "Shekhar Ravjiani, Salim Merchant, Neeti Mohan, Vishal-Shekhar",
    year: "2012",
    hookStartSec: 42,
    energy: 8
  },
  {
    query: "Jag Ghoomeya Sultan official video Salman Khan Anushka Sharma Rahat Fateh Ali Khan YRF",
    title: "Jag Ghoomeya",
    artist: "Rahat Fateh Ali Khan, Vishal-Shekhar",
    year: "2016",
    hookStartSec: 54,
    energy: 8
  },
  {
    query: "Dilbaro Raazi official video Alia Bhatt Harshdeep Kaur Zee Music Company",
    title: "Dilbaro",
    artist: "Harshdeep Kaur, Vibha Saraf, Shankar-Ehsaan-Loy",
    year: "2018",
    hookStartSec: 40,
    energy: 8
  },
  {
    query: "Dil Ko Tumse Pyaar Hua Rehnaa Hai Terre Dil Mein official video Dia Mirza Saregama",
    title: "Dil Ko Tumse Pyaar Hua",
    artist: "Roop Kumar Rathod, Harris Jayaraj",
    year: "2001",
    hookStartSec: 56,
    energy: 8
  },
  {
    query: "Zara Zara Rehnaa Hai Terre Dil Mein official video Dia Mirza Bombay Jayashri Saregama",
    title: "Zara Zara",
    artist: "Bombay Jayashri, Harris Jayaraj",
    year: "2001",
    hookStartSec: 52,
    energy: 9
  },
  {
    query: "Sach Keh Raha Hai Deewana Rehnaa Hai Terre Dil Mein official video KK Saregama",
    title: "Sach Keh Raha Hai Deewana",
    artist: "KK, Harris Jayaraj",
    year: "2001",
    hookStartSec: 62,
    energy: 9
  },
  {
    query: "Woh Ladki Hai Kahan Dil Chahta Hai official video Saif Ali Khan Sonali Kulkarni T-Series",
    title: "Woh Ladki Hai Kahan",
    artist: "Shaan, Kavita Krishnamurthy, Shankar-Ehsaan-Loy",
    year: "2001",
    hookStartSec: 44,
    energy: 9
  },
  {
    query: "Jaane Kyun Dostana official video Priyanka Chopra John Abraham Vishal-Shekhar Sony Music India",
    title: "Jaane Kyun",
    artist: "Vishal Dadlani, Vishal-Shekhar",
    year: "2008",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Kaho Naa Pyaar Hai title track official video Hrithik Roshan Ameesha Patel Saregama",
    title: "Kaho Naa Pyaar Hai",
    artist: "Udit Narayan, Alka Yagnik, Rajesh Roshan",
    year: "2000",
    hookStartSec: 68,
    energy: 9
  },
  {
    query: "Ek Ladki Ko Dekha Toh Aisa Laga 1942 A Love Story official video Anil Kapoor Kumar Sanu Saregama",
    title: "Ek Ladki Ko Dekha Toh Aisa Laga",
    artist: "Kumar Sanu, R.D. Burman",
    year: "1994",
    hookStartSec: 42,
    energy: 8
  },
  {
    query: "Aankhon Ki Gustakhiyan Hum Dil De Chuke Sanam official video Salman Khan Aishwarya Rai T-Series",
    title: "Aankhon Ki Gustakhiyan",
    artist: "Kumar Sanu, Kavita Krishnamurthy, Ismail Darbar",
    year: "1999",
    hookStartSec: 55,
    energy: 9
  },
  {
    query: "Chand Chupa Badal Mein Hum Dil De Chuke Sanam official video Salman Khan Aishwarya Rai T-Series",
    title: "Chand Chupa Badal Mein",
    artist: "Udit Narayan, Alka Yagnik, Ismail Darbar",
    year: "1999",
    hookStartSec: 64,
    energy: 9
  },
  {
    query: "Mitwa Kabhi Alvida Naa Kehna official video Shah Rukh Khan Rani Mukerji Sony Music India",
    title: "Mitwa",
    artist: "Shafqat Amanat Ali, Shankar Mahadevan, Shankar-Ehsaan-Loy",
    year: "2006",
    hookStartSec: 58,
    energy: 9
  },
  {
    query: "Tumhi Dekho Naa Kabhi Alvida Naa Kehna official video Shah Rukh Khan Rani Mukerji Sony Music India",
    title: "Tumhi Dekho Naa",
    artist: "Sonu Nigam, Alka Yagnik, Shankar-Ehsaan-Loy",
    year: "2006",
    hookStartSec: 52,
    energy: 8
  },
  {
    query: "Sajni Laapataa Ladies official video Arijit Singh Ram Sampath T-Series",
    title: "Sajni",
    artist: "Arijit Singh, Ram Sampath",
    year: "2024",
    hookStartSec: 36,
    energy: 8
  }
];

// Candidates for hindi-retro (80 songs)
export const retroCandidates = [
  {
    query: "Dum Maro Dum Saregama official video Asha Bhosle Hare Rama Hare Krishna",
    title: "Dum Maro Dum",
    artist: "Asha Bhosle, R.D. Burman",
    year: "1971",
    hookStartSec: 44,
    energy: 9
  },
  {
    query: "Disco Deewane Nazia Hassan official video Biddu Saregama",
    title: "Disco Deewane",
    artist: "Nazia Hassan, Biddu",
    year: "1981",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "Yeh Mera Dil Pyar Ka Diwana Don official video Helen Amitabh Bachchan Kalyanji Anandji",
    title: "Yeh Mera Dil",
    artist: "Asha Bhosle, Kalyanji-Anandji",
    year: "1978",
    hookStartSec: 42,
    energy: 9
  },
  {
    query: "Om Shanti Om Karz official video Rishi Kapoor Kishore Kumar Saregama",
    title: "Om Shanti Om",
    artist: "Kishore Kumar, Laxmikant-Pyarelal",
    year: "1980",
    hookStartSec: 55,
    energy: 9
  },
  {
    query: "Chura Liya Hai Tumne Jo Dil Ko Yaadon Ki Baaraat official video Zeenat Aman Saregama",
    title: "Chura Liya Hai Tumne",
    artist: "Asha Bhosle, Mohd. Rafi, R.D. Burman",
    year: "1973",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Laila O Laila Qurbani official video Zeenat Aman Feroz Khan Saregama",
    title: "Laila O Laila",
    artist: "Amit Kumar, Kanchan, Kalyanji-Anandji",
    year: "1980",
    hookStartSec: 45,
    energy: 9
  },
  {
    query: "Khaike Paan Banaraswala Don official video Amitabh Bachchan Kishore Kumar",
    title: "Khaike Paan Banaraswala",
    artist: "Kishore Kumar, Kalyanji-Anandji",
    year: "1978",
    hookStartSec: 54,
    energy: 9
  },
  {
    query: "Bachna Ae Haseeno Hum Kisise Kum Naheen official video Rishi Kapoor Saregama",
    title: "Bachna Ae Haseeno",
    artist: "Kishore Kumar, R.D. Burman",
    year: "1977",
    hookStartSec: 50,
    energy: 9
  },
  {
    query: "Jawani Jaaneman Namak Halaal official video Parveen Babi Asha Bhosle Saregama",
    title: "Jawani Jaaneman",
    artist: "Asha Bhosle, Bappi Lahiri",
    year: "1982",
    hookStartSec: 46,
    energy: 9
  },
  {
    query: "Aap Jaisa Koi Qurbani official video Zeenat Aman Nazia Hassan Saregama",
    title: "Aap Jaisa Koi",
    artist: "Nazia Hassan, Biddu",
    year: "1980",
    hookStartSec: 36,
    energy: 9
  },
  {
    query: "Sara Zamana Yaarana official video Amitabh Bachchan Kishore Kumar",
    title: "Sara Zamana",
    artist: "Kishore Kumar, Rajesh Roshan",
    year: "1981",
    hookStartSec: 48,
    energy: 9
  },
  {
    query: "Pag Ghunghroo Baandh Namak Halaal official video Amitabh Bachchan Kishore Kumar Saregama",
    title: "Pag Ghunghroo Baandh",
    artist: "Kishore Kumar, Bappi Lahiri",
    year: "1982",
    hookStartSec: 65,
    energy: 9
  },
  {
    query: "Raat Baaki Baat Baaki Namak Halaal official video Parveen Babi Bappi Lahiri Saregama",
    title: "Raat Baaki Baat Baaki",
    artist: "Bappi Lahiri, Asha Bhosle",
    year: "1982",
    hookStartSec: 48,
    energy: 9
  },
  {
    query: "Pyaar Do Pyaar Lo Janbaaz official video Rekha Sapna Mukherjee",
    title: "Pyaar Do Pyaar Lo",
    artist: "Sapna Mukherjee, Kalyanji-Anandji",
    year: "1986",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Hari Om Hari Pyaara Dushman official video Usha Uthup Bappi Lahiri",
    title: "Hari Om Hari",
    artist: "Usha Uthup, Bappi Lahiri",
    year: "1980",
    hookStartSec: 35,
    energy: 9
  },
  {
    query: "Ramba Ho Ho Ho Armaan official video Usha Uthup Bappi Lahiri",
    title: "Ramba Ho Ho Ho",
    artist: "Usha Uthup, Bappi Lahiri",
    year: "1981",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "I Am A Disco Dancer Disco Dancer official video Mithun Chakraborty Bappi Lahiri",
    title: "I Am A Disco Dancer",
    artist: "Vijay Benedict, Bappi Lahiri",
    year: "1982",
    hookStartSec: 45,
    energy: 9
  },
  {
    query: "Jimmy Jimmy Jimmy Aaja Disco Dancer official video Mithun Chakraborty Parvati Khan",
    title: "Jimmy Jimmy Jimmy Aaja",
    artist: "Parvati Khan, Bappi Lahiri",
    year: "1982",
    hookStartSec: 36,
    energy: 9
  },
  {
    query: "Yaad Aa Raha Hai Disco Dancer official video Mithun Chakraborty Bappi Lahiri",
    title: "Yaad Aa Raha Hai",
    artist: "Bappi Lahiri",
    year: "1982",
    hookStartSec: 42,
    energy: 9
  },
  {
    query: "Koi Yahan Nache Nache Disco Dancer official video Bappi Lahiri Usha Uthup",
    title: "Koi Yahan Nache Nache",
    artist: "Bappi Lahiri, Usha Uthup",
    year: "1982",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Zooby Zooby Dance Dance official video Mithun Chakraborty Alisha Chinai",
    title: "Zooby Zooby",
    artist: "Alisha Chinai, Bappi Lahiri",
    year: "1987",
    hookStartSec: 35,
    energy: 9
  },
  {
    query: "Dance Dance Dance Dance title song official video Mithun Chakraborty Bappi Lahiri",
    title: "Dance Dance",
    artist: "Alisha Chinai, Vijay Benedict, Bappi Lahiri",
    year: "1987",
    hookStartSec: 45,
    energy: 9
  },
  {
    query: "Dil Le Gayi Teri Bindiya Dharmatma official video Feroz Khan Hema Malini",
    title: "Dil Le Gayi Teri Bindiya",
    artist: "Amit Kumar, Kanchan, Kalyanji-Anandji",
    year: "1975",
    hookStartSec: 42,
    energy: 8
  },
  {
    query: "Mehbooba Mehbooba Sholay official video Helen RD Burman",
    title: "Mehbooba Mehbooba",
    artist: "R.D. Burman",
    year: "1975",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "Yeh Dosti Hum Nahi Todenge Sholay official video Amitabh Bachchan Dharmendra",
    title: "Yeh Dosti Hum Nahi Todenge",
    artist: "Kishore Kumar, Manna Dey, R.D. Burman",
    year: "1975",
    hookStartSec: 50,
    energy: 9
  },
  {
    query: "Piya Tu Ab Toh Aaja Caravan official video Helen Asha Bhosle RD Burman",
    title: "Piya Tu Ab Toh Aaja",
    artist: "Asha Bhosle, R.D. Burman",
    year: "1971",
    hookStartSec: 36,
    energy: 9
  },
  {
    query: "Chadti Jawaani Meri Chaal Mastani Caravan official video Jeetendra Asha Bhosle RD Burman",
    title: "Chadti Jawaani Meri Chaal Mastani",
    artist: "Mohd. Rafi, Lata Mangeshkar, R.D. Burman",
    year: "1971",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Jai Jai Shiv Shankar Aap Ki Kasam official video Rajesh Khanna Mumtaz Kishore Kumar",
    title: "Jai Jai Shiv Shankar",
    artist: "Kishore Kumar, Lata Mangeshkar, R.D. Burman",
    year: "1974",
    hookStartSec: 48,
    energy: 9
  },
  {
    query: "Zindagi Ek Safar Hai Suhana Andaz official video Rajesh Khanna Kishore Kumar",
    title: "Zindagi Ek Safar Hai Suhana",
    artist: "Kishore Kumar, Shankar-Jaikishan",
    year: "1971",
    hookStartSec: 35,
    energy: 9
  },
  {
    query: "Lekar Hum Deewana Dil Yaadon Ki Baaraat official video Kishore Kumar Asha Bhosle RD Burman",
    title: "Lekar Hum Deewana Dil",
    artist: "Asha Bhosle, Kishore Kumar, R.D. Burman",
    year: "1973",
    hookStartSec: 36,
    energy: 9
  },
  {
    query: "Roop Tera Mastana Aradhana official video Rajesh Khanna Sharmila Tagore Kishore Kumar",
    title: "Roop Tera Mastana",
    artist: "Kishore Kumar, S.D. Burman",
    year: "1969",
    hookStartSec: 45,
    energy: 9
  },
  {
    query: "Meri Umar Ke Naujawano Karz official video Rishi Kapoor Kishore Kumar",
    title: "Meri Umar Ke Naujawano",
    artist: "Kishore Kumar, Laxmikant-Pyarelal",
    year: "1980",
    hookStartSec: 50,
    energy: 9
  },
  {
    query: "Paisa Yeh Paisa Karz official video Rishi Kapoor Kishore Kumar",
    title: "Paisa Yeh Paisa",
    artist: "Kishore Kumar, Laxmikant-Pyarelal",
    year: "1980",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Ek Hasina Thi Karz official video Rishi Kapoor Kishore Kumar Asha Bhosle",
    title: "Ek Hasina Thi",
    artist: "Kishore Kumar, Asha Bhosle, Laxmikant-Pyarelal",
    year: "1980",
    hookStartSec: 60,
    energy: 8
  },
  {
    query: "Julie Julie Johny Ka Dil Tumpe Aaya Jeete Hain Shaan Se official video Mithun Chakraborty",
    title: "Julie Julie Johny Ka Dil Tumpe Aaya",
    artist: "Anu Malik, Kavita Krishnamurthy",
    year: "1988",
    hookStartSec: 42,
    energy: 9
  },
  {
    query: "Tamma Tamma Loge Thanedaar official video Sanjay Dutt Madhuri Dixit Bappi Lahiri",
    title: "Tamma Tamma Loge",
    artist: "Bappi Lahiri, Anuradha Paudwal",
    year: "1990",
    hookStartSec: 46,
    energy: 9
  },
  {
    query: "Jumma Chumma De De Hum official video Amitabh Bachchan Kimi Katkar Sudesh Bhosle",
    title: "Jumma Chumma De De",
    artist: "Sudesh Bhosle, Kavita Krishnamurthy, Laxmikant-Pyarelal",
    year: "1991",
    hookStartSec: 52,
    energy: 9
  },
  {
    query: "Tirchi Topiwale Tridev official video Naseeruddin Shah Sonam Amit Kumar",
    title: "Oye Oye (Tirchi Topiwale)",
    artist: "Amit Kumar, Sapna Mukherjee, Kalyanji-Anandji",
    year: "1989",
    hookStartSec: 48,
    energy: 9
  },
  {
    query: "Gali Gali Mein Phirta Hai Tridev official video Jackie Shroff Sangeeta Bijlani",
    title: "Gali Gali Mein Phirta Hai",
    artist: "Manhar Udhas, Alka Yagnik, Kalyanji-Anandji",
    year: "1989",
    hookStartSec: 45,
    energy: 8
  },
  {
    query: "Main Teri Dushman Dushman Tu Nagina official video Sridevi Anuradha Paudwal",
    title: "Main Teri Dushman Dushman Tu",
    artist: "Anuradha Paudwal, Laxmikant-Pyarelal",
    year: "1986",
    hookStartSec: 48,
    energy: 9
  },
  {
    query: "Hawa Hawai Mr India official video Sridevi Kavita Krishnamurthy",
    title: "Hawa Hawai",
    artist: "Kavita Krishnamurthy, Laxmikant-Pyarelal",
    year: "1987",
    hookStartSec: 52,
    energy: 9
  },
  {
    query: "Kaate Nahin Kat Te Mr India official video Anil Kapoor Sridevi Kishore Kumar Alisha Chinai",
    title: "Kaate Nahin Kat Te",
    artist: "Kishore Kumar, Alisha Chinai, Laxmikant-Pyarelal",
    year: "1987",
    hookStartSec: 45,
    energy: 9
  },
  {
    query: "Sochna Kya Ghayal official video Sunny Deol Kumar Sanu Bappi Lahiri",
    title: "Sochna Kya",
    artist: "Kumar Sanu, Shabbir Kumar, Bappi Lahiri",
    year: "1990",
    hookStartSec: 42,
    energy: 8
  },
  {
    query: "Tip Tip Barsa Paani Mohra official video Akshay Kumar Raveena Tandon Venus",
    title: "Tip Tip Barsa Paani",
    artist: "Udit Narayan, Alka Yagnik, Viju Shah",
    year: "1994",
    hookStartSec: 44,
    energy: 9
  },
  {
    query: "Tu Cheez Badi Hai Mast Mast Mohra official video Akshay Kumar Raveena Tandon Venus",
    title: "Tu Cheez Badi Hai Mast Mast",
    artist: "Udit Narayan, Kavita Krishnamurthy, Viju Shah",
    year: "1994",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Subah Se Lekar Shaam Tak Mohra official video Akshay Kumar Raveena Tandon Venus",
    title: "Subah Se Lekar Shaam Tak",
    artist: "Udit Narayan, Sadhana Sargam, Viju Shah",
    year: "1994",
    hookStartSec: 46,
    energy: 8
  },
  {
    query: "Chane Ke Khet Mein Anjaam official video Madhuri Dixit Poornima",
    title: "Chane Ke Khet Mein",
    artist: "Poornima, Anand-Milind",
    year: "1994",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "Ole Ole Yeh Dillagi official video Saif Ali Khan Abhijeet YRF",
    title: "Ole Ole",
    artist: "Abhijeet, Dilip Sen-Sameer Sen",
    year: "1994",
    hookStartSec: 35,
    energy: 9
  },
  {
    query: "Chaiyya Chaiyya Dil Se official video Shah Rukh Khan Malaika Arora Sukhwinder Singh",
    title: "Chaiyya Chaiyya",
    artist: "Sukhwinder Singh, Sapna Awasthi, A.R. Rahman",
    year: "1998",
    hookStartSec: 42,
    energy: 9
  },
  {
    query: "Tan Tana Tan Tan Tan Tara Judwaa official video Salman Khan Karisma Kapoor Anu Malik",
    title: "Tan Tana Tan Tan Tan Tara",
    artist: "Abhijeet, Poornima, Anu Malik",
    year: "1997",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "Oonchi Hai Building Judwaa official video Salman Khan Karisma Kapoor Anu Malik",
    title: "Oonchi Hai Building",
    artist: "Anu Malik, Poornima",
    year: "1997",
    hookStartSec: 42,
    energy: 9
  },
  {
    query: "Husn Hai Suhana Coolie No 1 official video Govinda Karisma Kapoor Abhijeet TIPS",
    title: "Husn Hai Suhana",
    artist: "Abhijeet, Chandana Dixit, Anand-Milind",
    year: "1995",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "Main Toh Raste Se Jaa Raha Tha Coolie No 1 official video Govinda Karisma Kapoor TIPS",
    title: "Main Toh Raste Se Jaa Raha Tha",
    artist: "Kumar Sanu, Alka Yagnik, Anand-Milind",
    year: "1995",
    hookStartSec: 36,
    energy: 9
  },
  {
    query: "Akhiyon Se Goli Maare Dulhe Raja official video Govinda Raveena Tandon Sonu Nigam TIPS",
    title: "Akhiyon Se Goli Maare",
    artist: "Sonu Nigam, Jaspinder Narula, Anand-Milind",
    year: "1998",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Kisi Disco Mein Jaaye Bade Miyan Chote Miyan official video Govinda Raveena Tandon TIPS",
    title: "Kisi Disco Mein Jaaye",
    artist: "Udit Narayan, Alka Yagnik, Viju Shah",
    year: "1998",
    hookStartSec: 44,
    energy: 9
  },
  {
    query: "Makhna Bade Miyan Chote Miyan official video Amitabh Bachchan Govinda TIPS",
    title: "Makhna",
    artist: "Govinda, Amit Kumar, Alka Yagnik, Viju Shah",
    year: "1998",
    hookStartSec: 42,
    energy: 9
  },
  {
    query: "What Is Mobile Number Haseena Maan Jaayegi official video Govinda Karisma Kapoor TIPS",
    title: "What Is Mobile Number",
    artist: "Sonu Nigam, Alka Yagnik, Anu Malik",
    year: "1999",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Chunari Chunari Biwi No 1 official video Salman Khan Sushmita Sen Abhijeet TIPS",
    title: "Chunari Chunari",
    artist: "Abhijeet, Anuradha Sriram, Anu Malik",
    year: "1999",
    hookStartSec: 45,
    energy: 9
  },
  {
    query: "Ishq Tera Tadpave Sukhbir official video Oh Ho Ho Ho",
    title: "Ishq Tera Tadpave (Oh Ho Ho Ho)",
    artist: "Sukhbir",
    year: "1999",
    hookStartSec: 35,
    energy: 9
  },
  {
    query: "Gur Naalo Ishq Mitha Bally Sagoo Malkit Singh official video",
    title: "Gur Naalo Ishq Mitha",
    artist: "Bally Sagoo, Malkit Singh",
    year: "1997",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "Dardi Rab Rab Kardi Daler Mehndi official video",
    title: "Dardi Rab Rab Kardi",
    artist: "Daler Mehndi",
    year: "1996",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Bolo Ta Ra Ra Daler Mehndi official video",
    title: "Bolo Ta Ra Ra",
    artist: "Daler Mehndi",
    year: "1995",
    hookStartSec: 36,
    energy: 9
  },
  {
    query: "Ho Jayegi Balle Balle Daler Mehndi official video",
    title: "Ho Jayegi Balle Balle",
    artist: "Daler Mehndi",
    year: "1997",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "Tunak Tunak Tun Daler Mehndi official video",
    title: "Tunak Tunak Tun",
    artist: "Daler Mehndi",
    year: "1998",
    hookStartSec: 35,
    energy: 9
  },
  {
    query: "Dilbar Dilbar Sirf Tum official video Sushmita Sen Sanjay Kapoor T-Series",
    title: "Dilbar Dilbar",
    artist: "Alka Yagnik, Nadeem-Shravan",
    year: "1999",
    hookStartSec: 45,
    energy: 9
  },
  {
    query: "Yeh Kaali Kaali Aankhen Baazigar official video Shah Rukh Khan Kajol Kumar Sanu Venus",
    title: "Yeh Kaali Kaali Aankhen",
    artist: "Kumar Sanu, Anu Malik",
    year: "1993",
    hookStartSec: 48,
    energy: 9
  },
  {
    query: "Baazigar O Baazigar Baazigar official video Shah Rukh Khan Kajol Kumar Sanu Venus",
    title: "Baazigar O Baazigar",
    artist: "Kumar Sanu, Alka Yagnik, Anu Malik",
    year: "1993",
    hookStartSec: 52,
    energy: 8
  },
  {
    query: "Chura Ke Dil Mera Main Khiladi Tu Anari official video Akshay Kumar Shilpa Shetty Venus",
    title: "Chura Ke Dil Mera",
    artist: "Kumar Sanu, Alka Yagnik, Anu Malik",
    year: "1994",
    hookStartSec: 46,
    energy: 9
  },
  {
    query: "Main Khiladi Tu Anari title track official video Akshay Kumar Saif Ali Khan Venus",
    title: "Main Khiladi Tu Anari",
    artist: "Abhijeet, Udit Narayan, Anu Malik",
    year: "1994",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Ruk Ja O Dil Deewane DDLJ official video Shah Rukh Khan Kajol Udit Narayan YRF",
    title: "Ruk Ja O Dil Deewane",
    artist: "Udit Narayan, Jatin-Lalit",
    year: "1995",
    hookStartSec: 45,
    energy: 9
  },
  {
    query: "Mehndi Laga Ke Rakhna DDLJ official video Shah Rukh Khan Kajol Udit Narayan Lata Mangeshkar YRF",
    title: "Mehndi Laga Ke Rakhna",
    artist: "Udit Narayan, Lata Mangeshkar, Jatin-Lalit",
    year: "1995",
    hookStartSec: 55,
    energy: 9
  },
  {
    query: "Mere Khwabon Mein DDLJ official video Kajol Lata Mangeshkar YRF",
    title: "Mere Khwabon Mein",
    artist: "Lata Mangeshkar, Jatin-Lalit",
    year: "1995",
    hookStartSec: 42,
    energy: 8
  },
  {
    query: "Koi Mil Gaya Kuch Kuch Hota Hai official video Shah Rukh Khan Kajol Rani Mukerji Sony Music India",
    title: "Koi Mil Gaya",
    artist: "Udit Narayan, Alka Yagnik, Kavita Krishnamurthy, Jatin-Lalit",
    year: "1998",
    hookStartSec: 50,
    energy: 9
  },
  {
    query: "Ladki Badi Anjani Hai Kuch Kuch Hota Hai official video Shah Rukh Khan Kajol Sony Music India",
    title: "Ladki Badi Anjani Hai",
    artist: "Kumar Sanu, Alka Yagnik, Jatin-Lalit",
    year: "1998",
    hookStartSec: 46,
    energy: 9
  },
  {
    query: "Urvasi Urvasi Humse Hai Muqabala official video Prabhu Deva AR Rahman",
    title: "Urvasi Urvasi",
    artist: "A.R. Rahman, Suresh Peters",
    year: "1994",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "Muqabla Muqabla Humse Hai Muqabala official video Prabhu Deva AR Rahman",
    title: "Muqabla Muqabla",
    artist: "Mano, Swarnalatha, A.R. Rahman",
    year: "1994",
    hookStartSec: 42,
    energy: 9
  },
  {
    query: "Humma Humma Bombay official video Prabhu Deva Sonali Bendre AR Rahman",
    title: "Humma Humma",
    artist: "Remo Fernandes, Swarnalatha, A.R. Rahman",
    year: "1995",
    hookStartSec: 38,
    energy: 9
  },
  {
    query: "Yeh Ladka Hai Deewana Kuch Kuch Hota Hai official video Shah Rukh Khan Kajol Sony Music India",
    title: "Yeh Ladka Hai Deewana",
    artist: "Udit Narayan, Alka Yagnik, Jatin-Lalit",
    year: "1998",
    hookStartSec: 44,
    energy: 9
  },
  {
    query: "Jadoo Teri Nazar Darr official video Shah Rukh Khan Juhi Chawla Udit Narayan YRF",
    title: "Jadoo Teri Nazar",
    artist: "Udit Narayan, Shiv-Hari",
    year: "1993",
    hookStartSec: 40,
    energy: 9
  },
  {
    query: "Tu Mere Saamne Darr official video Shah Rukh Khan Juhi Chawla Lata Mangeshkar YRF",
    title: "Tu Mere Saamne",
    artist: "Udit Narayan, Lata Mangeshkar, Shiv-Hari",
    year: "1993",
    hookStartSec: 48,
    energy: 8
  }
];
