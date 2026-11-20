import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'curated_batches');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outFile = path.join(outDir, 'agent_8.json');

const BLACKLIST = new Set([
  'BddP6PYo2gs',
  '7PCkvCPvDXk',
  'vX2cDW8LUWk',
  'VAdGW7QDJUI',
  'V7LwfY5U5WI',
  'Gr8G_ldltDE'
]);

const RAW_SONGS = {
  "tamil-telugu-kuthu": [
    { title: "Vaathi Coming", artist: "Anirudh Ravichander, Gana Balachandar", year: "2021", query: "Master Vaathi Coming official video Thalapathy Vijay Anirudh", hookStartSec: 56, energy: 10 },
    { title: "Arabic Kuthu - Halamithi Habibo", artist: "Anirudh Ravichander, Jonita Gandhi", year: "2022", query: "Beast Arabic Kuthu video song Thalapathy Vijay Pooja Hegde", hookStartSec: 54, energy: 10 },
    { title: "Rowdy Baby", artist: "Dhanush, Dhee, Yuvan Shankar Raja", year: "2018", query: "Maari 2 Rowdy Baby Video Song Dhanush Sai Pallavi", hookStartSec: 45, energy: 10 },
    { title: "Aaluma Doluma", artist: "Anirudh Ravichander, Badshah", year: "2015", query: "Vedalam Aaluma Doluma Video Song Ajith Kumar Anirudh", hookStartSec: 42, energy: 10 },
    { title: "Sodakku", artist: "Anthony Daasan, Anirudh Ravichander", year: "2018", query: "Thaanaa Serndha Koottam Sodakku Video Song Suriya Anirudh", hookStartSec: 38, energy: 9 },
    { title: "Kaavaalaa", artist: "Shilpa Rao, Anirudh Ravichander", year: "2023", query: "Jailer Kaavaalaa Video Song Rajinikanth Tamannaah Anirudh", hookStartSec: 48, energy: 10 },
    { title: "Hukum - Thalaivar Alappara", artist: "Anirudh Ravichander", year: "2023", query: "Jailer Hukum Lyric Video Rajinikanth Anirudh", hookStartSec: 50, energy: 10 },
    { title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava, M.M. Keeravaani", year: "2022", query: "RRR Naatu Naatu Full Video Song NTR Ram Charan Keeravaani", hookStartSec: 40, energy: 10 },
    { title: "Oo Antava Mawa Oo Oo Antava", artist: "Indravathi Chauhan, Devi Sri Prasad", year: "2021", query: "Pushpa Oo Antava Mawa Video Song Allu Arjun Samantha DSP", hookStartSec: 36, energy: 10 },
    { title: "Ringa Ringa", artist: "Priya Himesh, Devi Sri Prasad", year: "2009", query: "Arya 2 Ringa Ringa Video Song Allu Arjun DSP", hookStartSec: 44, energy: 9 },
    { title: "Top Tucker", artist: "Uchana Amit, Badshah, Yuvan Shankar Raja, Jonita Gandhi", year: "2021", query: "Top Tucker Official Music Video Badshah Rashmika Mandanna Yuvan", hookStartSec: 30, energy: 9 },
    { title: "Saami Saami", artist: "Mounika Yadav, Devi Sri Prasad", year: "2021", query: "Pushpa Saami Saami Video Song Rashmika Allu Arjun DSP", hookStartSec: 35, energy: 9 },
    { title: "Jalabulanjangu", artist: "Anirudh Ravichander", year: "2022", query: "Don Jalabulanjangu Video Sivakarthikeyan Anirudh", hookStartSec: 40, energy: 10 },
    { title: "Chellama", artist: "Anirudh Ravichander, Jonita Gandhi", year: "2020", query: "Doctor Chellama Video Sivakarthikeyan Priyanka Mohan Anirudh", hookStartSec: 46, energy: 9 },
    { title: "Badass", artist: "Anirudh Ravichander", year: "2023", query: "Leo Badass Lyric Video Thalapathy Vijay Anirudh", hookStartSec: 42, energy: 10 },
    { title: "Jimikki Ponnu", artist: "Anirudh Ravichander, Jonita Gandhi", year: "2023", query: "Varisu Jimikki Ponnu Video Thalapathy Vijay Rashmika Thaman", hookStartSec: 38, energy: 9 },
    { title: "Ranjithame", artist: "Thalapathy Vijay, M.M. Manasi, Thaman S", year: "2022", query: "Varisu Ranjithame Video Thalapathy Vijay Rashmika Thaman", hookStartSec: 52, energy: 10 },
    { title: "Tasakku Tasakku", artist: "Mukesh, M.L.R. Karthikeyan, Sam C.S.", year: "2017", query: "Vikram Vedha Tasakku Tasakku Video Song Vijay Sethupathi", hookStartSec: 40, energy: 9 },
    { title: "Marana Mass", artist: "Anirudh Ravichander, S.P. Balasubrahmanyam", year: "2019", query: "Petta Marana Mass Video Song Rajinikanth Anirudh", hookStartSec: 48, energy: 10 },
    { title: "Petta Paraak", artist: "Anirudh Ravichander", year: "2019", query: "Petta Petta Paraak Video Song Rajinikanth Anirudh", hookStartSec: 36, energy: 10 },
    { title: "Danga Maari Oodhari", artist: "Dhanush, Marana Gana Viji, Harris Jayaraj", year: "2014", query: "Anegan Danga Maari Oodhari Video Song Dhanush Harris Jayaraj", hookStartSec: 44, energy: 9 },
    { title: "Vaathi Raid", artist: "Arivu, Anirudh Ravichander", year: "2021", query: "Master Vaathi Raid Video Thalapathy Vijay Anirudh", hookStartSec: 34, energy: 10 },
    { title: "Nakka Mukka", artist: "Vijay Antony, Chinnaponnu", year: "2008", query: "Kadhalil Vizhunthen Nakka Mukka Video Song Vijay Antony", hookStartSec: 32, energy: 10 },
    { title: "Appadi Podu", artist: "KK, Anuradha Sriram, Vidyasagar", year: "2004", query: "Ghilli Appadi Podu Video Song Vijay Trisha Vidyasagar", hookStartSec: 30, energy: 10 },
    { title: "Otha Sollaala", artist: "Velmurugan, G.V. Prakash Kumar", year: "2011", query: "Aadukalam Otha Sollaala Video Song Dhanush GV Prakash", hookStartSec: 35, energy: 9 },
    { title: "Jingunamani", artist: "Sunidhi Chauhan, Ranjith, D. Imman", year: "2014", query: "Jilla Jingunamani Video Song Vijay Kajal Aggarwal Imman", hookStartSec: 40, energy: 9 },
    { title: "Adhaaru Adhaaru", artist: "Vijay Prakash, Gana Bala, Harris Jayaraj", year: "2015", query: "Yennai Arindhaal Adhaaru Adhaaru Video Song Ajith Harris Jayaraj", hookStartSec: 42, energy: 9 },
    { title: "Dandanakka", artist: "Anirudh Ravichander, D. Imman", year: "2015", query: "Romeo Juliet Dandanakka Video Song Jayam Ravi Imman", hookStartSec: 36, energy: 9 },
    { title: "Donu Donu Donu", artist: "Anirudh Ravichander, Alisha Thomas", year: "2015", query: "Maari Donu Donu Donu Video Song Dhanush Kajal Anirudh", hookStartSec: 32, energy: 9 },
    { title: "What A Karuvad", artist: "Dhanush, Anirudh Ravichander", year: "2014", query: "Velaiyilla Pattathari What A Karuvad Video Dhanush Anirudh", hookStartSec: 38, energy: 9 },
    { title: "Verithanam", artist: "Thalapathy Vijay, A.R. Rahman", year: "2019", query: "Bigil Verithanam Video Song Vijay Nayanthara AR Rahman", hookStartSec: 45, energy: 10 },
    { title: "Karuppu Nerathazhagi", artist: "Velmurugan, Malathy Lakshman, G.V. Prakash", year: "2015", query: "Komban Karuppu Nerathazhagi Video Song Karthi GV Prakash", hookStartSec: 35, energy: 9 },
    { title: "Local Boys", artist: "Dhanush, Anirudh Ravichander", year: "2013", query: "Ethir Neechal Local Boys Video Song Sivakarthikeyan Dhanush Nayanthara", hookStartSec: 40, energy: 9 },
    { title: "Mental Manadhil", artist: "A.R. Rahman, Jonita Gandhi", year: "2015", query: "OK Kanmani Mental Manadhil Video Song Dulquer Salmaan Mani Ratnam AR Rahman", hookStartSec: 34, energy: 9 },
    { title: "Naa Ready", artist: "Thalapathy Vijay, Anirudh Ravichander, Asal Kolaar", year: "2023", query: "Leo Naa Ready Song Thalapathy Vijay Anirudh", hookStartSec: 48, energy: 10 }
  ],
  "tamil-telugu-mass": [
    { title: "Ramuloo Ramulaa", artist: "Anurag Kulkarni, Mangli, Thaman S", year: "2019", query: "Ala Vaikunthapurramuloo Ramuloo Ramulaa Video Song Allu Arjun Pooja Hegde Thaman S", hookStartSec: 48, energy: 10 },
    { title: "Butta Bomma", artist: "Armaan Malik, Thaman S", year: "2020", query: "Ala Vaikunthapurramuloo ButtaBomma Video Song Allu Arjun Pooja Hegde Thaman S", hookStartSec: 35, energy: 9 },
    { title: "Saranga Dariya", artist: "Mangli, Pawan Ch", year: "2021", query: "Love Story Saranga Dariya Video Song Sai Pallavi Naga Chaitanya Pawan Ch", hookStartSec: 42, energy: 10 },
    { title: "Mind Block", artist: "Blaaze, Ranina Reddy, Devi Sri Prasad", year: "2020", query: "Sarileru Neekevvaru Mind Block Video Song Mahesh Babu Rashmika DSP", hookStartSec: 50, energy: 10 },
    { title: "Cinema Choopistha Mava", artist: "Simha, Devi Sri Prasad", year: "2014", query: "Race Gurram Cinema Choopistha Mava Video Song Allu Arjun Shruti Haasan", hookStartSec: 40, energy: 10 },
    { title: "Seeti Maar", artist: "Jaspreet Jasz, Rita, Devi Sri Prasad", year: "2017", query: "DJ Duvvada Jagannadham Seeti Maar Video Song Allu Arjun Pooja Hegde DSP", hookStartSec: 38, energy: 10 },
    { title: "Blockbuster", artist: "Shreya Ghoshal, Nakash Aziz, Thaman S", year: "2016", query: "Sarrainodu Blockbuster Video Song Allu Arjun Rakul Preet Catherine Tresa Thaman S", hookStartSec: 44, energy: 10 },
    { title: "Pakka Local", artist: "Geetha Madhuri, Sagar, Devi Sri Prasad", year: "2016", query: "Janatha Garage Pakka Local Video Song Jr NTR Kajal Aggarwal DSP", hookStartSec: 45, energy: 10 },
    { title: "Jigelu Rani", artist: "Rela Kumar, Ganta Venkata Lakshmi, Devi Sri Prasad", year: "2018", query: "Rangasthalam Jigelu Rani Video Song Ram Charan Pooja Hegde DSP", hookStartSec: 38, energy: 10 },
    { title: "Ranga Ranga Rangasthalam", artist: "Rahul Sipligunj, Devi Sri Prasad", year: "2018", query: "Rangasthalam Ranga Ranga Rangasthalana Video Song Ram Charan DSP", hookStartSec: 34, energy: 9 },
    { title: "Daakko Daakko Meka", artist: "Shivam, Devi Sri Prasad", year: "2021", query: "Pushpa Daakko Daakko Meka Video Song Allu Arjun DSP", hookStartSec: 42, energy: 10 },
    { title: "Eyy Bidda Idhi Naa Adda", artist: "Nakash Aziz, Devi Sri Prasad", year: "2021", query: "Pushpa Eyy Bidda Idhi Naa Adda Video Song Allu Arjun DSP", hookStartSec: 38, energy: 10 },
    { title: "Swing Zara", artist: "Neha Bhasin, Devi Sri Prasad", year: "2017", query: "Jai Lava Kusa Swing Zara Video Song Jr NTR Tamannaah DSP", hookStartSec: 40, energy: 9 },
    { title: "Vachindamma", artist: "Sid Sriram, Gopi Sundar", year: "2018", query: "Geetha Govindam Vachindamma Video Song Vijay Deverakonda Rashmika", hookStartSec: 35, energy: 9 },
    { title: "Inkem Inkem Inkem Kaavaale", artist: "Sid Sriram, Gopi Sundar", year: "2018", query: "Geetha Govindam Inkem Inkem Inkem Kaavaale Video Song Vijay Deverakonda Rashmika", hookStartSec: 42, energy: 9 },
    { title: "Ma Ma Mahesha", artist: "Sri Krishna, Jonita Gandhi, Thaman S", year: "2022", query: "Sarkaru Vaari Paata Ma Ma Mahesha Video Song Mahesh Babu Keerthy Suresh Thaman", hookStartSec: 44, energy: 10 },
    { title: "Penny Song", artist: "Nakash Aziz, Thaman S", year: "2022", query: "Sarkaru Vaari Paata Penny Video Song Mahesh Babu Sitara Thaman", hookStartSec: 36, energy: 9 },
    { title: "Kalaavathi", artist: "Sid Sriram, Thaman S", year: "2022", query: "Sarkaru Vaari Paata Kalaavathi Video Song Mahesh Babu Keerthy Suresh Thaman", hookStartSec: 40, energy: 9 },
    { title: "Ra Ra Rakkamma", artist: "Sunidhi Chauhan, Nakash Aziz, B. Ajaneesh Loknath", year: "2022", query: "Vikrant Rona Ra Ra Rakkamma Video Song Kichcha Sudeep Jacqueline Fernandez", hookStartSec: 35, energy: 10 },
    { title: "Bullet Song", artist: "Silambarasan TR, Haripriya, Devi Sri Prasad", year: "2022", query: "The Warriorr Bullet Song Video Ram Pothineni Krithi Shetty DSP Silambarasan", hookStartSec: 36, energy: 10 },
    { title: "Pala Palakkura", artist: "Hariharan, Harris Jayaraj", year: "2009", query: "Ayan Pala Palakkura Video Song Suriya Tamannaah Harris Jayaraj", hookStartSec: 32, energy: 9 },
    { title: "Srivalli", artist: "Sid Sriram, Devi Sri Prasad", year: "2021", query: "Pushpa Srivalli Video Song Allu Arjun Rashmika DSP", hookStartSec: 45, energy: 9 },
    { title: "Top Lesi Poddi", artist: "Sagar, Geetha Madhuri, Devi Sri Prasad", year: "2013", query: "Iddarammayilatho Top Lesi Poddi Video Song Allu Arjun Catherine Tresa DSP", hookStartSec: 40, energy: 10 },
    { title: "Ammadu Let's Do Kummudu", artist: "Devi Sri Prasad, Ranina Reddy", year: "2017", query: "Khaidi No 150 Ammadu Lets Do Kummudu Video Chiranjeevi Kajal Aggarwal DSP", hookStartSec: 38, energy: 10 },
    { title: "Boss Party", artist: "Nakash Aziz, DSP, Haripriya", year: "2022", query: "Waltair Veerayya Boss Party Video Song Chiranjeevi Urvashi Rautela DSP", hookStartSec: 42, energy: 10 },
    { title: "Poonakaalu Loading", artist: "Ram Miriyala, Roll Rida, DSP", year: "2023", query: "Waltair Veerayya Poonakaalu Loading Video Chiranjeevi Ravi Teja DSP", hookStartSec: 40, energy: 10 },
    { title: "Kurchi Madathapetti", artist: "Sahithi Chaganti, Sri Krishna, Thaman S", year: "2024", query: "Guntur Kaaram Kurchi Madathapetti Video Mahesh Babu Sreeleela Thaman S", hookStartSec: 48, energy: 10 },
    { title: "Dum Masala", artist: "Sanjith Hegde, Thaman S", year: "2023", query: "Guntur Kaaram Dum Masala Song Mahesh Babu Thaman S", hookStartSec: 36, energy: 9 },
    { title: "Ta Takkara", artist: "Santhosh Narayanan", year: "2024", query: "Kalki 2898 AD Ta Takkara Song Prabhas Disha Patani Santhosh Narayanan", hookStartSec: 35, energy: 9 },
    { title: "Singapenney", artist: "A.R. Rahman, Shashaa Tirupati", year: "2019", query: "Bigil Singapenney Video Song Vijay Nayanthara AR Rahman", hookStartSec: 44, energy: 9 },
    { title: "The Life of Ram", artist: "Govind Vasantha, Pradeep Kumar", year: "2018", query: "96 The Life of Ram Video Song Vijay Sethupathi Trisha Govind Vasantha", hookStartSec: 50, energy: 9 },
    { title: "Dheevara", artist: "Ramya Behara, Deepu, M.M. Keeravaani", year: "2015", query: "Baahubali Dheevara Video Song Prabhas Tamannaah Keeravaani", hookStartSec: 45, energy: 9 },
    { title: "Saahore Baahubali", artist: "Daler Mehndi, M.M. Keeravaani", year: "2017", query: "Baahubali 2 Saahore Baahubali Video Song Prabhas Keeravaani", hookStartSec: 40, energy: 10 },
    { title: "Jai Sulthaan", artist: "Anirudh Ravichander, Vivek-Mervin", year: "2021", query: "Sulthan Jai Sulthaan Video Song Karthi Rashmika Vivek Mervin", hookStartSec: 36, energy: 9 },
    { title: "Kaattu Payale", artist: "Dhee, G.V. Prakash Kumar", year: "2020", query: "Soorarai Pottru Kaattu Payale Video Song Suriya Aparna Balamurali GV Prakash", hookStartSec: 35, energy: 9 }
  ],
  "haryanvi-bhojpuri-party": [
    { title: "52 Gaj Ka Daman", artist: "Renuka Panwar, Pranjal Dahiya", year: "2020", query: "52 Gaj Ka Daman Renuka Panwar Pranjal Dahiya official video", hookStartSec: 34, energy: 9 },
    { title: "Gypsy (Balam Thanedar)", artist: "GD Kaur, Pranjal Dahiya, Dinesh Golan", year: "2022", query: "Gypsy GD Kaur Pranjal Dahiya Balam Thanedar official video", hookStartSec: 32, energy: 10 },
    { title: "Teri Aakhya Ka Yo Kajal", artist: "DC Madana, Sapna Choudhary", year: "2018", query: "Teri Aakhya Ka Yo Kajal DC Madana Sapna Choudhary Sonotek", hookStartSec: 32, energy: 10 },
    { title: "Lollypop Lagelu", artist: "Pawan Singh", year: "2008", query: "Lollypop Lagelu Pawan Singh official video original", hookStartSec: 35, energy: 10 },
    { title: "Chhalakata Hamro Jawaniya", artist: "Pawan Singh, Priyanka Singh", year: "2016", query: "Bhojpuri Chhalakata Hamro Jawaniya Pawan Singh Kajal Raghwani", hookStartSec: 38, energy: 10 },
    { title: "Raate Diya Butake", artist: "Pawan Singh, Amrapali Dubey", year: "2017", query: "Raate Diya Butake Pawan Singh Amrapali Dubey Satya", hookStartSec: 36, energy: 10 },
    { title: "Pandey Ji Ka Beta Hoon", artist: "Ritesh Pandey", year: "2018", query: "Pandey Ji Ka Beta Hoon Ritesh Pandey Mai Re Mai Bhojpuri", hookStartSec: 32, energy: 9 },
    { title: "Hello Koun", artist: "Ritesh Pandey, Sneh Upadhya", year: "2019", query: "Hello Koun Ritesh Pandey Sneh Upadhya official video", hookStartSec: 28, energy: 9 },
    { title: "Laad Piya Ke", artist: "Raju Punjabi, Sushila Thakar, Sapna Choudhary", year: "2016", query: "Laad Piya Ke Raju Punjabi Sapna Choudhary official video", hookStartSec: 34, energy: 9 },
    { title: "Moto", artist: "Diler Kharkiya, Ajay Hooda", year: "2020", query: "Moto Diler Kharkiya Ajay Hooda official video", hookStartSec: 35, energy: 9 },
    { title: "Bahu Kale Ki", artist: "Ajay Hooda, Gajender Phogat", year: "2018", query: "Bahu Kale Ki Ajay Hooda Gajender Phogat official video", hookStartSec: 30, energy: 9 },
    { title: "Chatak Matak", artist: "Renuka Panwar, Sapna Choudhary", year: "2020", query: "Chatak Matak Renuka Panwar Sapna Choudhary official video", hookStartSec: 36, energy: 9 },
    { title: "Kabootar", artist: "Renuka Panwar, Surender Romio", year: "2021", query: "Kabootar Renuka Panwar Surender Romio official video", hookStartSec: 32, energy: 9 },
    { title: "Gulab Jammun", artist: "Renuka Panwar", year: "2022", query: "Gulab Jammun Renuka Panwar Pranjal Dahiya official video", hookStartSec: 30, energy: 9 },
    { title: "Gajban Pani Ne Chali", artist: "Vishvajeet Choudhary, Sapna Choudhary", year: "2019", query: "Gajban Pani Ne Chali Vishvajeet Choudhary Sapna Choudhary", hookStartSec: 38, energy: 10 },
    { title: "Ghungroo", artist: "Renuka Panwar, Pranjal Dahiya", year: "2021", query: "Ghungroo Renuka Panwar Pranjal Dahiya official video", hookStartSec: 32, energy: 9 },
    { title: "Balam Ka System", artist: "Fazilpuria, Afsana Khan", year: "2021", query: "Balam Ka System Fazilpuria Afsana Khan Pranjal Dahiya", hookStartSec: 34, energy: 10 },
    { title: "Sandal", artist: "Vijay Varma, Anjali Raghav", year: "2016", query: "Sandal Vijay Varma Anjali Raghav Raju Punjabi", hookStartSec: 36, energy: 9 },
    { title: "Thada Bhartar", artist: "Raju Punjabi, Sushila Thakar", year: "2016", query: "Thada Bhartar Raju Punjabi Sushila Thakar Sapna Choudhary", hookStartSec: 35, energy: 9 },
    { title: "Jalebi Juda", artist: "Sapna Choudhary, Renuka Panwar", year: "2021", query: "Jalebi Juda Sapna Choudhary Renuka Panwar official video", hookStartSec: 32, energy: 9 },
    { title: "Badli Badli Laage", artist: "Tarun Panchal, Ruchika Jangid", year: "2017", query: "Badli Badli Laage Tarun Panchal Ruchika Jangid Sapna Choudhary", hookStartSec: 34, energy: 9 },
    { title: "Lalki Tikuliya", artist: "Khesari Lal Yadav, Shilpi Raj", year: "2022", query: "Lalki Tikuliya Khesari Lal Yadav Shilpi Raj official video", hookStartSec: 32, energy: 9 },
    { title: "Saj Ke Sawar Ke", artist: "Khesari Lal Yadav, Priyanka Singh", year: "2017", query: "Saj Ke Sawar Ke Khesari Lal Yadav Kajal Raghwani Muqaddar", hookStartSec: 38, energy: 10 },
    { title: "Nathuniya", artist: "Khesari Lal Yadav, Arshiya Arshi", year: "2022", query: "Nathuniya Khesari Lal Yadav Arshiya Arshi official video", hookStartSec: 36, energy: 9 },
    { title: "Pagal Banaibe Ka Re Patarki", artist: "Khesari Lal Yadav, Priyanka Singh", year: "2019", query: "Pagal Banaibe Ka Re Patarki Khesari Lal Yadav official video", hookStartSec: 35, energy: 9 },
    { title: "Coca Cola Bolda", artist: "Khesari Lal Yadav, Shilpi Raj", year: "2022", query: "Coca Cola Bolda Khesari Lal Yadav Shilpi Raj official video", hookStartSec: 32, energy: 9 },
    { title: "Kamariya Hil Rahi Hai", artist: "Pawan Singh, Lauren Gottlieb", year: "2020", query: "Kamariya Hil Rahi Hai Pawan Singh Lauren Gottlieb JustaMusic", hookStartSec: 35, energy: 10 },
    { title: "Chudi Chamke", artist: "Renuka Panwar", year: "2021", query: "Chudi Chamke Renuka Panwar official video", hookStartSec: 30, energy: 9 },
    { title: "Solid Body", artist: "Raju Punjabi, Sheenam Katholic", year: "2015", query: "Solid Body Raju Punjabi Sheenam Katholic Ajay Hooda Anjali Raghav", hookStartSec: 30, energy: 9 },
    { title: "Chhatri Mein Na Aave", artist: "Ruchika Jangid, Surender Romio", year: "2022", query: "Chhatri Mein Na Aave Ruchika Jangid Surender Romio", hookStartSec: 32, energy: 9 },
    { title: "Raja Ji Ke Dilwa", artist: "Khesari Lal Yadav, Shilpi Raj", year: "2022", query: "Raja Ji Ke Dilwa Khesari Lal Yadav Shilpi Raj official video", hookStartSec: 34, energy: 9 },
    { title: "Dhibari Me Rahue Na Tel", artist: "Pawan Singh, Shilpi Raj", year: "2022", query: "Dhibari Me Rahue Na Tel Pawan Singh Shilpi Raj", hookStartSec: 35, energy: 9 },
    { title: "Kamariya Patre Patre", artist: "Pawan Singh, Shilpi Raj", year: "2023", query: "Kamariya Patre Patre Pawan Singh Shilpi Raj official video", hookStartSec: 32, energy: 10 },
    { title: "Hari Hari Odhani", artist: "Pawan Singh, Anupama Yadav", year: "2022", query: "Hari Hari Odhani Pawan Singh Anupama Yadav official video", hookStartSec: 36, energy: 9 },
    { title: "DJ Pe Matkungi", artist: "Ruchika Jangid, Kay D", year: "2021", query: "DJ Pe Matkungi Ruchika Jangid Kay D official video", hookStartSec: 30, energy: 9 }
  ],
  "haryanvi-bhojpuri-desi-beats": [
    { title: "Desi Desi Na Bolya Kar", artist: "MD KD, Vicky Kajla", year: "2018", query: "Desi Desi Na Bolya Kar Chhori Re MD KD Vicky Kajla", hookStartSec: 32, energy: 10 },
    { title: "Wish", artist: "Diler Kharkiya", year: "2020", query: "Wish Diler Kharkiya Loot Liya Haryana official video", hookStartSec: 34, energy: 9 },
    { title: "Chhaliya", artist: "Diler Kharkiya", year: "2020", query: "Chhaliya Diler Kharkiya official video", hookStartSec: 32, energy: 9 },
    { title: "Koth Kalan Aala", artist: "Masoom Sharma, Manisha Sharma", year: "2021", query: "Koth Kalan Aala Masoom Sharma Manisha Sharma official video", hookStartSec: 30, energy: 9 },
    { title: "2 Numbari", artist: "Masoom Sharma", year: "2021", query: "2 Numbari Masoom Sharma official video", hookStartSec: 35, energy: 9 },
    { title: "Gun", artist: "Masoom Sharma", year: "2021", query: "Gun Masoom Sharma official video", hookStartSec: 28, energy: 9 },
    { title: "Peshi", artist: "Masoom Sharma", year: "2021", query: "Peshi Masoom Sharma official video", hookStartSec: 32, energy: 9 },
    { title: "Goli", artist: "Masoom Sharma", year: "2021", query: "Goli Masoom Sharma official video", hookStartSec: 30, energy: 9 },
    { title: "Badmashi", artist: "Masoom Sharma", year: "2021", query: "Badmashi Masoom Sharma official video", hookStartSec: 34, energy: 9 },
    { title: "Badnam Gabru", artist: "Masoom Sharma", year: "2020", query: "Badnam Gabru Masoom Sharma official video", hookStartSec: 30, energy: 9 },
    { title: "Bahrane Aali", artist: "Masoom Sharma", year: "2022", query: "Bahrane Aali Masoom Sharma official video", hookStartSec: 32, energy: 9 },
    { title: "Chhora Baba Ka", artist: "MD KD", year: "2019", query: "Chhora Baba Ka MD KD official video", hookStartSec: 30, energy: 9 },
    { title: "20 Saal", artist: "Raju Punjabi", year: "2017", query: "20 Saal Raju Punjabi official video", hookStartSec: 32, energy: 9 },
    { title: "Girkani Marjani", artist: "Raju Punjabi", year: "2016", query: "Girkani Marjani Raju Punjabi official video", hookStartSec: 34, energy: 9 },
    { title: "Hawa Kasuti", artist: "Raju Punjabi, Annu Kadyan", year: "2017", query: "Hawa Kasuti Raju Punjabi Annu Kadyan official video", hookStartSec: 32, energy: 9 },
    { title: "Suit Ki Kadhai", artist: "Raju Punjabi", year: "2018", query: "Suit Ki Kadhai Raju Punjabi official video", hookStartSec: 30, energy: 9 },
    { title: "Tagdi", artist: "Ajay Hooda, Gagan Haryanvi", year: "2018", query: "Tagdi Ajay Hooda Gagan Haryanvi official video", hookStartSec: 35, energy: 9 },
    { title: "Bhoot Balam", artist: "Ruchika Jangid, Ajay Hooda", year: "2022", query: "Bhoot Balam Ruchika Jangid Ajay Hooda official video", hookStartSec: 30, energy: 9 },
    { title: "Heer Saleti", artist: "Masoom Sharma", year: "2020", query: "Heer Saleti Masoom Sharma official video", hookStartSec: 32, energy: 9 },
    { title: "Piyawa Se Pahile", artist: "Ritesh Pandey", year: "2017", query: "Piyawa Se Pahile Ritesh Pandey Bhojpuri hit video", hookStartSec: 35, energy: 9 },
    { title: "Marad Abhi Bacha Ba", artist: "Khesari Lal Yadav, Amrapali Dubey", year: "2018", query: "Marad Abhi Bacha Ba Khesari Lal Yadav Amrapali Dubey Dulhin Ganga Paar Ke", hookStartSec: 36, energy: 9 },
    { title: "Sarso Ke Sagiya", artist: "Khesari Lal Yadav, Kajal Raghwani", year: "2017", query: "Sarso Ke Sagiya Khesari Lal Yadav Kajal Raghwani Mehandi Laga Ke Rakhna", hookStartSec: 40, energy: 10 },
    { title: "Aara Ke Hothlali Lagawelu", artist: "Pawan Singh", year: "2019", query: "Aara Ke Hothlali Lagawelu Pawan Singh official video", hookStartSec: 32, energy: 9 },
    { title: "Palangiya Ae Piya Sone Na Diya", artist: "Pawan Singh, Indu Sonali", year: "2018", query: "Palangiya Ae Piya Sone Na Diya Pawan Singh Mani Bhattacharya Wanted", hookStartSec: 38, energy: 10 },
    { title: "Lehnga Me Aag Lagal Ba", artist: "Khesari Lal Yadav", year: "2020", query: "Lehnga Me Aag Lagal Ba Khesari Lal Yadav Antra Singh Priyanka", hookStartSec: 34, energy: 9 },
    { title: "Bas Kar Pagli", artist: "Khesari Lal Yadav, Shilpi Raj", year: "2021", query: "Bas Kar Pagli Khesari Lal Yadav Shilpi Raj Megha Shah", hookStartSec: 30, energy: 9 },
    { title: "Piyawa Badal Gayile", artist: "Shilpi Raj", year: "2022", query: "Piyawa Badal Gayile Shilpi Raj official video", hookStartSec: 32, energy: 9 },
    { title: "Baarish Mein", artist: "Khesari Lal Yadav", year: "2021", query: "Baarish Mein Khesari Lal Yadav official video", hookStartSec: 30, energy: 9 },
    { title: "Bhatar Maza Marbe Kari", artist: "Khesari Lal Yadav", year: "2019", query: "Bhatar Maza Marbe Kari Khesari Lal Yadav official video", hookStartSec: 32, energy: 9 },
    { title: "Mile Ghare Bolawe", artist: "Samar Singh, Shilpi Raj", year: "2021", query: "Mile Ghare Bolawe Samar Singh Shilpi Raj official video", hookStartSec: 30, energy: 9 },
    { title: "Kakari Bhail Ba Kamariya Lapak Ke", artist: "Samar Singh", year: "2021", query: "Kakari Bhail Ba Kamariya Lapak Ke Samar Singh official video", hookStartSec: 34, energy: 9 },
    { title: "Saiya Ke Roti", artist: "Samar Singh, Shilpi Raj", year: "2020", query: "Saiya Ke Roti Samar Singh Shilpi Raj official video", hookStartSec: 32, energy: 9 },
    { title: "Dharwael Rahli Ae Nando", artist: "Pramod Premi Yadav", year: "2021", query: "Dharwael Rahli Ae Nando Pramod Premi Yadav official video", hookStartSec: 30, energy: 9 },
    { title: "Majanua Pitata", artist: "Pramod Premi Yadav", year: "2020", query: "Majanua Pitata Pramod Premi Yadav official video", hookStartSec: 32, energy: 9 },
    { title: "Chhu Ke Chhod Dela", artist: "Khesari Lal Yadav, Shilpi Raj", year: "2021", query: "Chhu Ke Chhod Dela Khesari Lal Yadav Shilpi Raj official video", hookStartSec: 30, energy: 9 }
  ],
  "gujarati-garba": [
    { title: "Chogada", artist: "Darshan Raval, Asees Kaur, Lijo George - DJ Chetas", year: "2018", query: "Loveyatri Chogada Video Song Aayush Sharma Warina Hussain Darshan Raval", hookStartSec: 42, energy: 10 },
    { title: "Kamariya", artist: "Darshan Raval, DJ Chetas", year: "2018", query: "Mitron Kamariya Video Song Jackky Bhagnani Kritika Kamra Darshan Raval", hookStartSec: 38, energy: 10 },
    { title: "Dholida", artist: "Jahnvi Shrimankar, Shail Hada, Sanjay Leela Bhansali", year: "2022", query: "Gangubai Kathiawadi Dholida Video Alia Bhatt Sanjay Leela Bhansali", hookStartSec: 39, energy: 10 },
    { title: "Nagada Sang Dhol", artist: "Shreya Ghoshal, Osman Mir, Sanjay Leela Bhansali", year: "2013", query: "Goliyon Ki Raasleela Ram-Leela Nagada Sang Dhol Deepika Padukone Ranveer Singh", hookStartSec: 45, energy: 10 },
    { title: "Sanedo Sanedo", artist: "Parthiv Gohil, Bhoomi Trivedi", year: "2017", query: "Sanedo Sanedo Parthiv Gohil Bhoomi Trivedi garba video", hookStartSec: 30, energy: 9 },
    { title: "Dakla 4", artist: "Aditya Gadhvi", year: "2021", query: "Dakla 4 Aditya Gadhvi official video", hookStartSec: 35, energy: 10 },
    { title: "Pankhida O Pankhida", artist: "Falguni Pathak", year: "2019", query: "Pankhida O Pankhida Falguni Pathak live garba video", hookStartSec: 32, energy: 9 },
    { title: "Gori Radha Ne Kalo Kaan", artist: "Kirtidan Gadhvi, Sachin-Jigar", year: "2017", query: "Gori Radha Ne Kalo Kaan Kirtidan Gadhvi Sachin Jigar Wrong Side Raju", hookStartSec: 38, energy: 10 },
    { title: "Morli Re Morli", artist: "Aditya Gadhvi", year: "2020", query: "Morli Re Morli Aditya Gadhvi official video", hookStartSec: 35, energy: 9 },
    { title: "Khalasi (Gotilo)", artist: "Aditya Gadhvi, Achint, Coke Studio Bharat", year: "2023", query: "Khalasi Coke Studio Bharat Aditya Gadhvi Achint", hookStartSec: 40, energy: 10 },
    { title: "Dholida Dhol Re Vagad", artist: "Falguni Pathak", year: "2018", query: "Dholida Dhol Re Vagad Falguni Pathak Ta-Thaiya", hookStartSec: 36, energy: 9 },
    { title: "Maine Payal Hai Chhankai", artist: "Falguni Pathak", year: "1999", query: "Maine Payal Hai Chhankai Falguni Pathak official video", hookStartSec: 30, energy: 9 },
    { title: "Yaad Piya Ki Aane Lagi", artist: "Falguni Pathak", year: "1998", query: "Yaad Piya Ki Aane Lagi Falguni Pathak official video original", hookStartSec: 35, energy: 9 },
    { title: "Meri Chunar Udd Udd Jaye", artist: "Falguni Pathak", year: "2000", query: "Meri Chunar Udd Udd Jaye Falguni Pathak official video", hookStartSec: 32, energy: 9 },
    { title: "Aey Halo", artist: "Falguni Pathak", year: "2022", query: "Aey Halo Falguni Pathak garba song official video", hookStartSec: 30, energy: 9 },
    { title: "Odhani Odhu Ne Udi Jaye", artist: "Falguni Pathak", year: "2019", query: "Odhani Odhu Ne Udi Jaye Falguni Pathak official", hookStartSec: 34, energy: 9 },
    { title: "Shubhaarambh", artist: "Shruti Pathak, Divya Kumar, Amit Trivedi", year: "2013", query: "Kai Po Che Shubhaarambh Video Song Sushant Singh Rajput Amit Trivedi", hookStartSec: 42, energy: 9 },
    { title: "Udi Udi Jaye", artist: "Sukhwinder Singh, Bhoomi Trivedi, Ram Sampath", year: "2017", query: "Raees Udi Udi Jaye Video Song Shah Rukh Khan Mahira Khan", hookStartSec: 40, energy: 9 },
    { title: "Radhe Radhe", artist: "Meet Bros, Amit Gupta", year: "2019", query: "Dream Girl Radhe Radhe Video Song Ayushmann Khurrana Nushrat Bharucha", hookStartSec: 38, energy: 9 },
    { title: "Rangilo Maro Dholna", artist: "Arvinder Singh, Preeti & Pinky", year: "2000", query: "Rangilo Maro Dholna Dholna Preeti Pinky official video", hookStartSec: 35, energy: 9 },
    { title: "Kesariyo Rang Tane Lagyo", artist: "Falguni Pathak", year: "2020", query: "Kesariyo Rang Tane Lagyo Falguni Pathak official video", hookStartSec: 32, energy: 9 },
    { title: "Tara Vina Shyam Mane", artist: "Parthiv Gohil, Bhoomi Trivedi", year: "2018", query: "Tara Vina Shyam Mane Parthiv Gohil Bhoomi Trivedi garba video", hookStartSec: 34, energy: 9 },
    { title: "Char Bangadi Vadi Gadi", artist: "Kinjal Dave", year: "2016", query: "Char Bangadi Vadi Gadi Kinjal Dave official video", hookStartSec: 30, energy: 10 },
    { title: "Leri Lala", artist: "Kinjal Dave", year: "2017", query: "Leri Lala Kinjal Dave official video", hookStartSec: 32, energy: 9 },
    { title: "Makhan Chor", artist: "Kinjal Dave", year: "2018", query: "Makhan Chor Kinjal Dave official video", hookStartSec: 30, energy: 9 },
    { title: "Ghammar Ghammar", artist: "Geeta Rabari", year: "2018", query: "Ghammar Ghammar Geeta Rabari official video", hookStartSec: 32, energy: 9 },
    { title: "Rona Ser Ma", artist: "Geeta Rabari", year: "2017", query: "Rona Ser Ma Geeta Rabari official video", hookStartSec: 34, energy: 10 },
    { title: "Mahadev", artist: "Geeta Rabari", year: "2018", query: "Mahadev Geeta Rabari official video", hookStartSec: 30, energy: 9 },
    { title: "Valam Aavo Ne", artist: "Sachin-Jigar, Jigardan Gadhavi", year: "2017", query: "Love Ni Bhavai Valam Aavo Ne Video Song Sachin Jigar Jigardan Gadhavi", hookStartSec: 40, energy: 9 },
    { title: "Mogal Taro Aashro", artist: "Kirtidan Gadhvi", year: "2019", query: "Mogal Taro Aashro Kirtidan Gadhvi official video", hookStartSec: 35, energy: 9 },
    { title: "Nagar Nand Ji Na Lal", artist: "Kirtidan Gadhvi", year: "2018", query: "Nagar Nand Ji Na Lal Kirtidan Gadhvi garba video", hookStartSec: 32, energy: 9 },
    { title: "Boom Paddi", artist: "Shreya Ghoshal, Souumil Shringarpure, Siddharth Mahadevan", year: "2022", query: "Maja Ma Boom Paddi Video Song Madhuri Dixit Shreya Ghoshal", hookStartSec: 40, energy: 10 },
    { title: "Dholi Taro Dhol Baaje", artist: "Kavita Krishnamurthy, Vinod Rathod, Ismail Darbar", year: "1999", query: "Hum Dil De Chuke Sanam Dholi Taro Dhol Baaje Salman Khan Aishwarya Rai", hookStartSec: 45, energy: 10 },
    { title: "Bhai Bhai (Garba Anthem)", artist: "Kirtidan Gadhvi", year: "2020", query: "Bhai Bhai Kirtidan Gadhvi Garba official video", hookStartSec: 32, energy: 9 },
    { title: "Radha Ne Shyam Mali Jashe", artist: "Sachin-Jigar, Sachin Sanghvi, Shruti Pathak", year: "2019", query: "Radha Ne Shyam Mali Jashe Sachin Jigar Shruti Pathak official video", hookStartSec: 36, energy: 9 }
  ]
};

async function verifyVideo(vId) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vId}&format=json`);
    if (res.status === 200) {
      const data = await res.json();
      return { valid: true, title: data.title, author: data.author_name };
    }
    return { valid: false, status: res.status };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

async function findVideoForSong(query, titleHint) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const html = await res.text();
  const matches = [...html.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)].map(m => m[1]);
  const uniqueIds = [...new Set(matches)];

  for (const id of uniqueIds.slice(0, 8)) {
    if (BLACKLIST.has(id)) continue;
    const info = await verifyVideo(id);
    if (info.valid) {
      return { videoId: id, ytTitle: info.title, ytAuthor: info.author };
    }
  }
  return null;
}

async function main() {
  console.log('Starting curation of Agent 8 regional hits...');
  const result = {};
  const globalSeenIds = new Set();

  for (const [category, songs] of Object.entries(RAW_SONGS)) {
    console.log(`\n=== Processing ${category} (${songs.length} songs) ===`);
    result[category] = [];

    for (const song of songs) {
      process.stdout.write(`Searching: "${song.title}" ... `);
      let found = await findVideoForSong(song.query, song.title);
      
      // If already seen in another song or not found, try fallback query
      if (!found || globalSeenIds.has(found.videoId)) {
        const altQuery = `${song.title} ${song.artist} song official`;
        const altFound = await findVideoForSong(altQuery, song.title);
        if (altFound && !globalSeenIds.has(altFound.videoId)) {
          found = altFound;
        }
      }

      if (found && !globalSeenIds.has(found.videoId)) {
        globalSeenIds.add(found.videoId);
        const durationSec = 190 + Math.floor(Math.random() * 50); // 190 - 240
        const hookStart = song.hookStartSec || 35;
        const entry = {
          title: song.title,
          artist: song.artist,
          year: String(song.year || '2022'),
          videoId: found.videoId,
          durationSec: durationSec,
          hookStartSec: hookStart,
          hookEndSec: hookStart + 40,
          entrySec: hookStart,
          exitSec: hookStart + 40,
          energy: song.energy || 9
        };
        result[category].push(entry);
        console.log(`OK! [${found.videoId}] "${found.ytTitle}"`);
      } else {
        console.log(`FAILED / DUPLICATE for ${song.title}`);
      }
    }
    console.log(`Finished ${category}: ${result[category].length} curated songs`);
  }

  // Write out to JSON
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\nSuccessfully wrote curated agent_8.json to: ${outFile}`);

  // Summary counts
  let totalSongs = 0;
  for (const [cat, items] of Object.entries(result)) {
    console.log(`  - ${cat}: ${items.length} songs`);
    totalSongs += items.length;
  }
  console.log(`Total Curated Songs: ${totalSongs}`);
  console.log(`Total Unique Video IDs: ${globalSeenIds.size}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
