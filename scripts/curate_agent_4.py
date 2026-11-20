import json
import os
import re
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor

RAW_HINDI_SUFI = [
    {"title": "Chaiyya Chaiyya", "artist": "Sukhwinder Singh, Sapna Awasthi · A.R. Rahman", "year": "1998", "query": "Chaiyya Chaiyya Dil Se official video", "hookStartSec": 75, "energy": 9},
    {"title": "Kun Faya Kun", "artist": "A.R. Rahman, Javed Ali, Mohit Chauhan · A.R. Rahman", "year": "2011", "query": "Kun Faya Kun Rockstar official video", "hookStartSec": 85, "energy": 8},
    {"title": "Arziyan", "artist": "Javed Ali, Kailash Kher · A.R. Rahman", "year": "2009", "query": "Arziyan Delhi-6 official video", "hookStartSec": 75, "energy": 8},
    {"title": "Sajdaa", "artist": "Rahat Fateh Ali Khan, Shankar Mahadevan, Richa Sharma · Shankar-Ehsaan-Loy", "year": "2010", "query": "Sajdaa My Name Is Khan official video", "hookStartSec": 80, "energy": 8},
    {"title": "Maula Mere Maula", "artist": "Roop Kumar Rathod · Mithoon", "year": "2007", "query": "Maula Mere Maula Anwar official video", "hookStartSec": 65, "energy": 8},
    {"title": "Teri Deewani", "artist": "Kailash Kher · Paresh Kamath, Naresh Kamath", "year": "2006", "query": "Teri Deewani Kailash Kher official video", "hookStartSec": 55, "energy": 9},
    {"title": "Khwaja Mere Khwaja", "artist": "A.R. Rahman · A.R. Rahman", "year": "2008", "query": "Khwaja Mere Khwaja Jodhaa Akbar official video", "hookStartSec": 100, "energy": 8},
    {"title": "Mere Rashke Qamar", "artist": "Nusrat Fateh Ali Khan, Rahat Fateh Ali Khan · Tanishk Bagchi", "year": "2017", "query": "Mere Rashke Qamar Baadshaho official video", "hookStartSec": 45, "energy": 9},
    {"title": "Bulleya", "artist": "Amit Mishra, Shilpa Rao · Pritam", "year": "2016", "query": "Bulleya Ae Dil Hai Mushkil official video", "hookStartSec": 50, "energy": 9},
    {"title": "Iktara", "artist": "Kavita Seth, Amitabh Bhattacharya · Amit Trivedi", "year": "2009", "query": "Iktara Wake Up Sid official video", "hookStartSec": 55, "energy": 8},
    {"title": "Piya Haji Ali", "artist": "A.R. Rahman, Srinivas, Murtaza Ghulam Qadir · A.R. Rahman", "year": "2000", "query": "Piya Haji Ali Fiza official video", "hookStartSec": 60, "energy": 8},
    {"title": "Nit Khair Manga", "artist": "Rahat Fateh Ali Khan · Tanishk Bagchi", "year": "2018", "query": "Nit Khair Manga Raid official video", "hookStartSec": 45, "energy": 8},
    {"title": "Sanu Ek Pal Chain", "artist": "Rahat Fateh Ali Khan · Tanishk Bagchi", "year": "2018", "query": "Sanu Ek Pal Chain Raid official video", "hookStartSec": 50, "energy": 8},
    {"title": "Bhar Do Jholi Meri", "artist": "Adnan Sami · Pritam", "year": "2015", "query": "Bhar Do Jholi Meri Bajrangi Bhaijaan official video", "hookStartSec": 70, "energy": 9},
    {"title": "O Re Piya", "artist": "Rahat Fateh Ali Khan · Salim-Sulaiman", "year": "2007", "query": "O Re Piya Aaja Nachle official video", "hookStartSec": 60, "energy": 8},
    {"title": "Afreen Afreen", "artist": "Rahat Fateh Ali Khan, Momina Mustehsan · Faakhir Mehmood", "year": "2016", "query": "Afreen Afreen Coke Studio Season 9", "hookStartSec": 85, "energy": 8},
    {"title": "Tajdar-e-Haram", "artist": "Atif Aslam · Shiraz Uppal", "year": "2015", "query": "Tajdar-e-Haram Coke Studio Season 8 Atif Aslam", "hookStartSec": 110, "energy": 8},
    {"title": "Saiyaan", "artist": "Kailash Kher · Paresh Kamath, Naresh Kamath", "year": "2007", "query": "Saiyaan Kailash Kher official video", "hookStartSec": 60, "energy": 8},
    {"title": "Tu Mane Ya Na Mane", "artist": "Wadali Brothers · Puranchand Wadali, Pyarelal Wadali", "year": "2004", "query": "Tu Mane Ya Na Mane Wadali Brothers", "hookStartSec": 50, "energy": 8},
    {"title": "Chaap Tilak", "artist": "Abida Parveen, Rahat Fateh Ali Khan · Strings", "year": "2014", "query": "Chaap Tilak Coke Studio Season 7", "hookStartSec": 75, "energy": 8},
    {"title": "Dama Dam Mast Qalandar", "artist": "Mika Singh, Yo Yo Honey Singh · Traditional", "year": "2013", "query": "Dama Dam Mast Qalandar Mika Singh official video", "hookStartSec": 45, "energy": 9},
    {"title": "Noor-E-Khuda", "artist": "Adnan Sami, Shankar Mahadevan, Shreya Ghoshal · Shankar-Ehsaan-Loy", "year": "2010", "query": "Noor E Khuda My Name Is Khan official video", "hookStartSec": 80, "energy": 8},
    {"title": "Maula Mere Lele Meri Jaan", "artist": "Sukhwinder Singh, Krishna Beura · Salim-Sulaiman", "year": "2007", "query": "Maula Mere Lele Meri Jaan Chak De India official video", "hookStartSec": 50, "energy": 9},
    {"title": "Shukran Allah", "artist": "Sonu Nigam, Shreya Ghoshal, Salim Merchant · Salim-Sulaiman", "year": "2009", "query": "Shukran Allah Kurbaan official video", "hookStartSec": 60, "energy": 8},
    {"title": "Ali Maula", "artist": "Salim Merchant · Salim-Sulaiman", "year": "2009", "query": "Ali Maula Kurbaan official video", "hookStartSec": 55, "energy": 8},
    {"title": "Jiya Dhadak Dhadak Jaye", "artist": "Rahat Fateh Ali Khan · Faisal Rafi, Rohail Hyatt", "year": "2005", "query": "Jiya Dhadak Dhadak Jaye Kalyug official video", "hookStartSec": 50, "energy": 8},
    {"title": "Bol Na Halke Halke", "artist": "Rahat Fateh Ali Khan, Mahalakshmi Iyer · Shankar-Ehsaan-Loy", "year": "2007", "query": "Bol Na Halke Halke Jhoom Barabar Jhoom official video", "hookStartSec": 60, "energy": 8},
    {"title": "Tere Mast Mast Do Nain", "artist": "Rahat Fateh Ali Khan · Sajid-Wajid", "year": "2010", "query": "Tere Mast Mast Do Nain Dabangg official video", "hookStartSec": 55, "energy": 8},
    {"title": "Dagabaaz Re", "artist": "Rahat Fateh Ali Khan, Shreya Ghoshal · Sajid-Wajid", "year": "2012", "query": "Dagabaaz Re Dabangg 2 official video", "hookStartSec": 50, "energy": 8},
    {"title": "Naina", "artist": "Rahat Fateh Ali Khan · Vishal Bhardwaj", "year": "2006", "query": "Naina Omkara official video Rahat Fateh Ali Khan", "hookStartSec": 65, "energy": 8},
    {"title": "Jag Ghoomeya", "artist": "Rahat Fateh Ali Khan · Vishal-Shekhar", "year": "2016", "query": "Jag Ghoomeya Sultan official video", "hookStartSec": 55, "energy": 8},
    {"title": "Mast Magan", "artist": "Arijit Singh, Chinmayi Sripada · Shankar-Ehsaan-Loy", "year": "2014", "query": "Mast Magan 2 States official video", "hookStartSec": 65, "energy": 8},
    {"title": "Kabira", "artist": "Tochi Raina, Rekha Bhardwaj · Pritam", "year": "2013", "query": "Kabira Yeh Jawaani Hai Deewani official video", "hookStartSec": 45, "energy": 8},
    {"title": "Madno", "artist": "Kshitij Tarey, Chinmayi Sripada · Mithoon", "year": "2010", "query": "Madno Lamhaa official video", "hookStartSec": 60, "energy": 8},
    {"title": "Mora Piya", "artist": "Aadesh Shrivastava · Aadesh Shrivastava", "year": "2010", "query": "Mora Piya Raajneeti official video", "hookStartSec": 50, "energy": 8},
    {"title": "Jashn-E-Bahaaraa", "artist": "Javed Ali · A.R. Rahman", "year": "2008", "query": "Jashn E Bahaaraa Jodhaa Akbar official video", "hookStartSec": 60, "energy": 8},
    {"title": "Tu Hi Haqeeqat", "artist": "Javed Ali · Pritam", "year": "2009", "query": "Tu Hi Haqeeqat Tum Mile official video", "hookStartSec": 55, "energy": 8},
    {"title": "Deewana Kar Raha Hai", "artist": "Javed Ali · Rashid Khan", "year": "2012", "query": "Deewana Kar Raha Hai Raaz 3 official video", "hookStartSec": 60, "energy": 8},
    {"title": "Guzarish", "artist": "Javed Ali, Sonu Nigam · A.R. Rahman", "year": "2008", "query": "Ghajini Guzarish official video", "hookStartSec": 50, "energy": 8},
    {"title": "Ishaqzaade", "artist": "Javed Ali, Shreya Ghoshal · Amit Trivedi", "year": "2012", "query": "Ishaqzaade Title Track official video", "hookStartSec": 55, "energy": 8},
    {"title": "Tu Hi Meri Shab Hai", "artist": "KK · Pritam", "year": "2006", "query": "Tu Hi Meri Shab Hai Gangster official video", "hookStartSec": 60, "energy": 9},
    {"title": "Labon Ko", "artist": "KK · Pritam", "year": "2007", "query": "Labon Ko Bhool Bhulaiyaa official video", "hookStartSec": 45, "energy": 8},
    {"title": "Zara Sa", "artist": "KK · Pritam", "year": "2008", "query": "Zara Sa Jannat official video", "hookStartSec": 50, "energy": 9},
    {"title": "Haan Tu Hain", "artist": "KK · Pritam", "year": "2008", "query": "Haan Tu Hain Jannat official video", "hookStartSec": 55, "energy": 8},
    {"title": "Tujhe Sochta Hoon", "artist": "KK · Pritam", "year": "2012", "query": "Tujhe Sochta Hoon Jannat 2 official video", "hookStartSec": 50, "energy": 8},
    {"title": "Woh Lamhe Woh Baatein", "artist": "Atif Aslam · Mithoon", "year": "2005", "query": "Woh Lamhe Woh Baatein Zeher official video", "hookStartSec": 45, "energy": 9},
    {"title": "Aadat", "artist": "Atif Aslam · Goher Mumtaz", "year": "2005", "query": "Aadat Kalyug Atif Aslam official video", "hookStartSec": 50, "energy": 9},
    {"title": "Tere Bin", "artist": "Atif Aslam · Mithoon", "year": "2006", "query": "Tere Bin Bas Ek Pal official video", "hookStartSec": 55, "energy": 8},
    {"title": "Pehli Nazar Mein", "artist": "Atif Aslam · Pritam", "year": "2008", "query": "Pehli Nazar Mein Race official video", "hookStartSec": 50, "energy": 8},
    {"title": "Tu Jaane Na", "artist": "Atif Aslam · Pritam", "year": "2009", "query": "Tu Jaane Na Ajab Prem Ki Ghazab Kahani official video", "hookStartSec": 65, "energy": 8},
    {"title": "Jeena Jeena", "artist": "Atif Aslam · Sachin-Jigar", "year": "2015", "query": "Jeena Jeena Badlapur official video", "hookStartSec": 50, "energy": 8},
    {"title": "Main Rang Sharbaton Ka", "artist": "Atif Aslam, Chinmayi Sripada · Pritam", "year": "2013", "query": "Main Rang Sharbaton Ka official video", "hookStartSec": 55, "energy": 8},
    {"title": "Dil Diyan Gallan", "artist": "Atif Aslam · Vishal-Shekhar", "year": "2017", "query": "Dil Diyan Gallan Tiger Zinda Hai official video", "hookStartSec": 60, "energy": 8},
    {"title": "Dekhte Dekhte", "artist": "Atif Aslam · Rochak Kohli", "year": "2018", "query": "Dekhte Dekhte Batti Gul Meter Chalu official video", "hookStartSec": 50, "energy": 8},
    {"title": "Phir Mohabbat", "artist": "Arijit Singh, Mohd Irfan, Saim Bhat · Mithoon", "year": "2011", "query": "Phir Mohabbat Murder 2 official video", "hookStartSec": 60, "energy": 8},
    {"title": "Duaa", "artist": "Arijit Singh, Nandini Srikar · Vishal-Shekhar", "year": "2012", "query": "Duaa Shanghai official video", "hookStartSec": 55, "energy": 8},
    {"title": "Raabta", "artist": "Arijit Singh · Pritam", "year": "2012", "query": "Raabta Agent Vinod official video", "hookStartSec": 45, "energy": 8},
    {"title": "Tum Hi Ho", "artist": "Arijit Singh · Mithoon", "year": "2013", "query": "Tum Hi Ho Aashiqui 2 official video", "hookStartSec": 60, "energy": 9},
    {"title": "Chahun Main Ya Naa", "artist": "Arijit Singh, Palak Muchhal · Jeet Gannguli", "year": "2013", "query": "Chahun Main Ya Naa Aashiqui 2 official video", "hookStartSec": 55, "energy": 8},
    {"title": "Sunn Raha Hai", "artist": "Ankit Tiwari · Ankit Tiwari", "year": "2013", "query": "Sunn Raha Hai Na Tu Aashiqui 2 official video", "hookStartSec": 65, "energy": 8},
    {"title": "Galliyan", "artist": "Ankit Tiwari · Ankit Tiwari", "year": "2014", "query": "Galliyan Ek Villain official video", "hookStartSec": 60, "energy": 9},
    {"title": "Tu Hai Ki Nahi", "artist": "Ankit Tiwari · Ankit Tiwari", "year": "2015", "query": "Tu Hai Ki Nahi Roy official video", "hookStartSec": 50, "energy": 8},
    {"title": "Teri Jhuki Nazar", "artist": "Shafqat Amanat Ali · Pritam", "year": "2013", "query": "Teri Jhuki Nazar Murder 3 official video", "hookStartSec": 55, "energy": 8},
    {"title": "Mitwa", "artist": "Shafqat Amanat Ali, Shankar Mahadevan · Shankar-Ehsaan-Loy", "year": "2006", "query": "Mitwa Kabhi Alvida Naa Kehna official video", "hookStartSec": 65, "energy": 9},
    {"title": "Yeh Honsla", "artist": "Shafqat Amanat Ali · Salim-Sulaiman", "year": "2006", "query": "Yeh Honsla Dor official video", "hookStartSec": 55, "energy": 8},
    {"title": "Mora Saiyan", "artist": "Shafqat Amanat Ali · Fuzon", "year": "2002", "query": "Mora Saiyan Fuzon official video", "hookStartSec": 60, "energy": 8},
    {"title": "Namo Namo", "artist": "Amit Trivedi · Amit Trivedi", "year": "2018", "query": "Namo Namo Kedarnath official video", "hookStartSec": 45, "energy": 8},
    {"title": "Qaafirana", "artist": "Arijit Singh, Nikhita Gandhi · Amit Trivedi", "year": "2018", "query": "Qaafirana Kedarnath official video", "hookStartSec": 50, "energy": 8},
    {"title": "Raanjhanaa", "artist": "Jaswinder Singh, Shiraz Uppal · A.R. Rahman", "year": "2013", "query": "Raanjhanaa Title Song official video", "hookStartSec": 55, "energy": 9},
    {"title": "Tum Tak", "artist": "Javed Ali, Keerthi Sagathia · A.R. Rahman", "year": "2013", "query": "Tum Tak Raanjhanaa official video", "hookStartSec": 60, "energy": 8},
    {"title": "Piya Milenge", "artist": "Sukhwinder Singh, KMMC Sufi Ensemble · A.R. Rahman", "year": "2013", "query": "Piya Milenge Raanjhanaa official video", "hookStartSec": 65, "energy": 8},
    {"title": "Heer", "artist": "Harshdeep Kaur · A.R. Rahman", "year": "2012", "query": "Heer Jab Tak Hai Jaan official video", "hookStartSec": 45, "energy": 8},
    {"title": "Zaalima", "artist": "Arijit Singh, Harshdeep Kaur · JAM8", "year": "2017", "query": "Zaalima Raees official video", "hookStartSec": 50, "energy": 8},
    {"title": "Katiya Karun", "artist": "Harshdeep Kaur · A.R. Rahman", "year": "2011", "query": "Katiya Karun Rockstar official video", "hookStartSec": 45, "energy": 8},
    {"title": "Dilbaro", "artist": "Harshdeep Kaur, Vibha Saraf, Shankar Mahadevan · Shankar-Ehsaan-Loy", "year": "2018", "query": "Dilbaro Raazi official video", "hookStartSec": 50, "energy": 8},
    {"title": "Ik Onkar", "artist": "Harshdeep Kaur · A.R. Rahman", "year": "2006", "query": "Ik Onkar Rang De Basanti official video", "hookStartSec": 30, "energy": 8},
    {"title": "Rubaroo", "artist": "A.R. Rahman, Naresh Iyer · A.R. Rahman", "year": "2006", "query": "Rubaroo Rang De Basanti official video", "hookStartSec": 55, "energy": 9},
    {"title": "Lukka Chuppi", "artist": "Lata Mangeshkar, A.R. Rahman · A.R. Rahman", "year": "2006", "query": "Luka Chuppi Rang De Basanti official video", "hookStartSec": 60, "energy": 8},
    {"title": "Ye Jo Halka Halka Suroor Hai", "artist": "Nusrat Fateh Ali Khan · Nusrat Fateh Ali Khan", "year": "1991", "query": "Ye Jo Halka Halka Suroor Hai Nusrat Fateh Ali Khan official", "hookStartSec": 70, "energy": 9},
    {"title": "Kali Kali Zulfon Ke Phande", "artist": "Nusrat Fateh Ali Khan · Nusrat Fateh Ali Khan", "year": "1993", "query": "Kali Kali Zulfon Ke Phande Nusrat Fateh Ali Khan", "hookStartSec": 75, "energy": 9},
    {"title": "Lut Gaye", "artist": "Jubin Nautiyal · Tanishk Bagchi", "year": "2021", "query": "Lut Gaye Jubin Nautiyal official video", "hookStartSec": 45, "energy": 8},
    {"title": "Raataan Lambiyan", "artist": "Jubin Nautiyal, Asees Kaur · Tanishk Bagchi", "year": "2021", "query": "Raataan Lambiyan Shershaah official video", "hookStartSec": 50, "energy": 8},
    {"title": "Ranjha", "artist": "B Praak, Jasleen Royal · Jasleen Royal", "year": "2021", "query": "Ranjha Shershaah official video", "hookStartSec": 45, "energy": 8},
    {"title": "Teri Mitti", "artist": "B Praak · Arko", "year": "2019", "query": "Teri Mitti Kesari official video", "hookStartSec": 55, "energy": 9},
    {"title": "Filhall", "artist": "B Praak · Jaani", "year": "2019", "query": "Filhall B Praak Akshay Kumar official video", "hookStartSec": 50, "energy": 8},
    {"title": "Pachtaoge", "artist": "Arijit Singh · B Praak, Jaani", "year": "2019", "query": "Pachtaoge Arijit Singh official video", "hookStartSec": 45, "energy": 8},
    {"title": "Kinna Sona", "artist": "Jubin Nautiyal · Meet Bros", "year": "2019", "query": "Kinna Sona Marjaavaan official video", "hookStartSec": 40, "energy": 8},
    {"title": "Halka Halka", "artist": "Sunidhi Chauhan, Divya Kumar · Amit Trivedi", "year": "2018", "query": "Halka Halka Fanney Khan official video", "hookStartSec": 45, "energy": 8}
]

RAW_DIWALI_PARTY = [
    {"title": "Gallan Goodiyaan", "artist": "Yashita Sharma, Farhan Akhtar, Shankar Mahadevan, Sukhwinder Singh · Shankar-Ehsaan-Loy", "year": "2015", "query": "Gallan Goodiyaan Dil Dhadakne Do official video", "hookStartSec": 45, "energy": 9},
    {"title": "London Thumakda", "artist": "Labh Janjua, Sonu Kakkar, Neha Kakkar · Amit Trivedi", "year": "2014", "query": "London Thumakda Queen official video", "hookStartSec": 40, "energy": 9},
    {"title": "Zingaat", "artist": "Ajay-Atul · Ajay-Atul", "year": "2018", "query": "Zingaat Dhadak official video", "hookStartSec": 45, "energy": 9},
    {"title": "Chogada", "artist": "Darshan Raval, Asees Kaur · Lijo George - DJ Chetas", "year": "2018", "query": "Chogada Loveyatri official video", "hookStartSec": 50, "energy": 9},
    {"title": "Nagada Sang Dhol", "artist": "Shreya Ghoshal, Osman Mir · Sanjay Leela Bhansali", "year": "2013", "query": "Nagada Sang Dhol Ram Leela official video", "hookStartSec": 55, "energy": 9},
    {"title": "Bole Chudiyan", "artist": "Amitabh Bachchan, Sonu Nigam, Alka Yagnik, Udit Narayan, Kavita Krishnamurthy · Jatin-Lalit", "year": "2001", "query": "Bole Chudiyan K3G official video", "hookStartSec": 60, "energy": 9},
    {"title": "Sauda Khara Khara", "artist": "Diljit Dosanjh, Sukhbir, Dhvani Bhanushali · Lijo George - DJ Chetas", "year": "2019", "query": "Sauda Khara Khara Good Newwz official video", "hookStartSec": 40, "energy": 9},
    {"title": "Cutiepie", "artist": "Pardeep Singh Sran, Nakash Aziz · Pritam", "year": "2016", "query": "Cutiepie Ae Dil Hai Mushkil official video", "hookStartSec": 45, "energy": 9},
    {"title": "Dilliwali Girlfriend", "artist": "Arijit Singh, Sunidhi Chauhan · Pritam", "year": "2013", "query": "Dilliwali Girlfriend YJHD official video", "hookStartSec": 45, "energy": 9},
    {"title": "Dholida", "artist": "Udit Narayan, Neha Kakkar, Palak Muchhal · Tanishk Bagchi", "year": "2018", "query": "Dholida Loveyatri official video", "hookStartSec": 45, "energy": 9},
    {"title": "Radha Nachegi", "artist": "Ritu Pathak, Shabab Sabri, Danish Sabri · Sajid-Wajid", "year": "2015", "query": "Radha Nachegi Tevar official video", "hookStartSec": 50, "energy": 9},
    {"title": "Sweety Tera Drama", "artist": "Dev Negi, Pawni Pandey, Shraddha Pandit · Tanishk Bagchi", "year": "2017", "query": "Sweety Tera Drama Bareilly Ki Barfi official video", "hookStartSec": 40, "energy": 9},
    {"title": "Kamariya", "artist": "Darshan Raval · Lijo George - DJ Chetas", "year": "2018", "query": "Kamariya Mitron official video Darshan Raval", "hookStartSec": 45, "energy": 9},
    {"title": "Shubhaarambh", "artist": "Amit Trivedi, Shruti Pathak, Divya Kumar · Amit Trivedi", "year": "2013", "query": "Shubhaarambh Kai Po Che official video", "hookStartSec": 50, "energy": 8},
    {"title": "Udi Udi Jaye", "artist": "Sukhwinder Singh, Bhoomi Trivedi, Karsan Sagathia · Ram Sampath", "year": "2017", "query": "Udi Udi Jaye Raees official video", "hookStartSec": 45, "energy": 9},
    {"title": "Rangtaari", "artist": "Dev Negi, Yo Yo Honey Singh · Tanishk Bagchi", "year": "2018", "query": "Rangtaari Loveyatri official video", "hookStartSec": 40, "energy": 9},
    {"title": "Sanedo", "artist": "Mika Singh, Nikhita Gandhi, Benny Dayal · Sachin-Jigar", "year": "2019", "query": "Sanedo Made In China official video", "hookStartSec": 45, "energy": 9},
    {"title": "Odhani", "artist": "Darshan Raval, Neha Kakkar · Sachin-Jigar", "year": "2019", "query": "Odhani Made In China official video", "hookStartSec": 40, "energy": 9},
    {"title": "Radhe Radhe", "artist": "Meet Bros, Amit Gupta · Meet Bros", "year": "2019", "query": "Radhe Radhe Dream Girl official video", "hookStartSec": 45, "energy": 9},
    {"title": "Dil Chori", "artist": "Yo Yo Honey Singh, Simar Kaur, Ishers · Yo Yo Honey Singh", "year": "2017", "query": "Dil Chori Sonu Ke Titu Ki Sweety official video", "hookStartSec": 45, "energy": 9},
    {"title": "Chhote Chhote Peg", "artist": "Yo Yo Honey Singh, Neha Kakkar, Navraj Hans · Yo Yo Honey Singh", "year": "2018", "query": "Chhote Chhote Peg Sonu Ke Titu Ki Sweety official video", "hookStartSec": 40, "energy": 9},
    {"title": "Bom Diggy Diggy", "artist": "Zack Knight, Jasmin Walia · Zack Knight", "year": "2018", "query": "Bom Diggy Diggy Sonu Ke Titu Ki Sweety official video", "hookStartSec": 45, "energy": 9},
    {"title": "Morni Banke", "artist": "Guru Randhawa, Neha Kakkar · Tanishk Bagchi", "year": "2018", "query": "Morni Banke Badhaai Ho official video", "hookStartSec": 45, "energy": 9},
    {"title": "Badtameez Dil", "artist": "Benny Dayal, Shefali Alvares · Pritam", "year": "2013", "query": "Badtameez Dil Yeh Jawaani Hai Deewani official video", "hookStartSec": 50, "energy": 9},
    {"title": "Balam Pichkari", "artist": "Vishal Dadlani, Shalmali Kholgade · Pritam", "year": "2013", "query": "Balam Pichkari Yeh Jawaani Hai Deewani official video", "hookStartSec": 45, "energy": 9},
    {"title": "Kar Gayi Chull", "artist": "Badshah, Fazilpuria, Sukriti Kakar, Neha Kakkar · Amaal Mallik", "year": "2016", "query": "Kar Gayi Chull Kapoor and Sons official video", "hookStartSec": 40, "energy": 9},
    {"title": "Let's Nacho", "artist": "Badshah, Benny Dayal · Nucleya, Benny Dayal", "year": "2016", "query": "Lets Nacho Kapoor and Sons official video", "hookStartSec": 40, "energy": 9},
    {"title": "Abhi Toh Party Shuru Hui Hai", "artist": "Badshah, Aastha Gill · Badshah", "year": "2014", "query": "Abhi Toh Party Shuru Hui Hai Khoobsurat official video", "hookStartSec": 40, "energy": 9},
    {"title": "Kala Chashma", "artist": "Amar Arshi, Badshah, Neha Kakkar · Badshah", "year": "2016", "query": "Kala Chashma Baar Baar Dekho official video", "hookStartSec": 45, "energy": 9},
    {"title": "Nachde Ne Saare", "artist": "Jasleen Royal, Harshdeep Kaur, Siddharth Mahadevan · Jasleen Royal", "year": "2016", "query": "Nachde Ne Saare Baar Baar Dekho official video", "hookStartSec": 45, "energy": 9},
    {"title": "The Humma Song", "artist": "Jubin Nautiyal, Shashaa Tirupati, Badshah · A.R. Rahman, Tanishk Bagchi", "year": "2017", "query": "The Humma Song OK Jaanu official video", "hookStartSec": 45, "energy": 9},
    {"title": "Proper Patola", "artist": "Badshah, Diljit Dosanjh, Aastha Gill · Badshah", "year": "2018", "query": "Proper Patola Namaste England official video", "hookStartSec": 40, "energy": 9},
    {"title": "Aankh Marey", "artist": "Neha Kakkar, Mika Singh, Kumar Sanu · Tanishk Bagchi", "year": "2018", "query": "Aankh Marey Simmba official video", "hookStartSec": 40, "energy": 9},
    {"title": "Coca Cola", "artist": "Tony Kakkar, Neha Kakkar · Tony Kakkar", "year": "2019", "query": "Coca Cola Luka Chuppi official video", "hookStartSec": 35, "energy": 9},
    {"title": "Poster Lagwa Do", "artist": "Mika Singh, Sunanda Sharma · White Noise", "year": "2019", "query": "Poster Lagwa Do Luka Chuppi official video", "hookStartSec": 40, "energy": 9},
    {"title": "Hauli Hauli", "artist": "Garry Sandhu, Neha Kakkar · Tanishk Bagchi", "year": "2019", "query": "Hauli Hauli De De Pyaar De official video", "hookStartSec": 40, "energy": 9},
    {"title": "Mukhda Vekh Ke", "artist": "Mika Singh, Dhvani Bhanushali · Manj Musik", "year": "2019", "query": "Mukhda Vekh Ke De De Pyaar De official video", "hookStartSec": 40, "energy": 9},
    {"title": "Makhna", "artist": "Tanishk Bagchi, Yasser Desai, Asees Kaur · Tanishk Bagchi", "year": "2019", "query": "Makhna Drive official video", "hookStartSec": 40, "energy": 8},
    {"title": "Chandigarh Mein", "artist": "Badshah, Harrdy Sandhu, Neha Kakkar, Asees Kaur · Tanishk Bagchi", "year": "2019", "query": "Chandigarh Mein Good Newwz official video", "hookStartSec": 40, "energy": 9},
    {"title": "Laung Da Lashkara", "artist": "Hard Kaur, Jasbir Jassi, Mahalakshmi Iyer · Shankar-Ehsaan-Loy", "year": "2011", "query": "Laung Da Lashkara Patiala House official video", "hookStartSec": 45, "energy": 9},
    {"title": "Mauja Hi Mauja", "artist": "Mika Singh · Pritam", "year": "2007", "query": "Mauja Hi Mauja Jab We Met official video", "hookStartSec": 45, "energy": 9},
    {"title": "Nagada Nagada", "artist": "Sonu Nigam, Javed Ali · Pritam", "year": "2007", "query": "Nagada Nagada Jab We Met official video", "hookStartSec": 50, "energy": 9},
    {"title": "Ainvayi Ainvayi", "artist": "Salim Merchant, Sunidhi Chauhan · Salim-Sulaiman", "year": "2010", "query": "Ainvayi Ainvayi Band Baaja Baaraat official video", "hookStartSec": 45, "energy": 9},
    {"title": "Dum Dum", "artist": "Benny Dayal, Himani Kapoor · Salim-Sulaiman", "year": "2010", "query": "Dum Dum Band Baaja Baaraat official video", "hookStartSec": 50, "energy": 8},
    {"title": "Baari Barsi", "artist": "Harshdeep Kaur, Labh Janjua, Salim Merchant · Salim-Sulaiman", "year": "2010", "query": "Baari Barsi Band Baaja Baaraat official video", "hookStartSec": 45, "energy": 8},
    {"title": "Jee Karda", "artist": "Labh Janjua, Suzanne D'Mello · Pritam", "year": "2008", "query": "Jee Karda Singh Is Kinng official video", "hookStartSec": 45, "energy": 9},
    {"title": "Subah Hone Na De", "artist": "Mika Singh, Shefali Alvares · Pritam", "year": "2011", "query": "Subah Hone Na De Desi Boyz official video", "hookStartSec": 45, "energy": 9},
    {"title": "Desi Boyz", "artist": "KK, Bob · Pritam", "year": "2011", "query": "Make Some Noise For The Desi Boyz official video", "hookStartSec": 40, "energy": 9},
    {"title": "Jhak Maar Ke", "artist": "Neeraj Shridhar, Harshdeep Kaur · Pritam", "year": "2011", "query": "Jhak Maar Ke Desi Boyz official video", "hookStartSec": 45, "energy": 8},
    {"title": "Tune Maari Entriyaan", "artist": "Vishal Dadlani, KK, Neeti Mohan, Bappi Lahiri · Sohail Sen", "year": "2014", "query": "Tune Maari Entriyaan Gunday official video", "hookStartSec": 45, "energy": 9},
    {"title": "Jashn E Ishqa", "artist": "Javed Ali, Shadab Faridi · Sohail Sen", "year": "2014", "query": "Jashn E Ishqa Gunday official video", "hookStartSec": 40, "energy": 9},
    {"title": "Gandi Baat", "artist": "Mika Singh, Kalpana Patowary · Pritam", "year": "2013", "query": "Gandi Baat R Rajkumar official video", "hookStartSec": 40, "energy": 9},
    {"title": "Saree Ke Fall Sa", "artist": "Antara Mitra, Nakash Aziz · Pritam", "year": "2013", "query": "Saree Ke Fall Sa R Rajkumar official video", "hookStartSec": 45, "energy": 9},
    {"title": "Dhating Nach", "artist": "Nakash Aziz, Shefali Alvares · Pritam", "year": "2013", "query": "Dhating Nach Phata Poster Nikhla Hero official video", "hookStartSec": 40, "energy": 9},
    {"title": "Agal Bagal", "artist": "Mika Singh · Pritam", "year": "2013", "query": "Agal Bagal Phata Poster Nikhla Hero official video", "hookStartSec": 40, "energy": 9},
    {"title": "Besharmi Ki Height", "artist": "Benny Dayal, Shalmali Kholgade · Sajid-Wajid", "year": "2014", "query": "Besharmi Ki Height Main Tera Hero official video", "hookStartSec": 40, "energy": 9},
    {"title": "Palat Tera Dhyan Kidhar Hai", "artist": "Arijit Singh · Sajid-Wajid", "year": "2014", "query": "Palat Tera Dhyan Kidhar Hai Main Tera Hero official video", "hookStartSec": 40, "energy": 9},
    {"title": "Shanivaar Raati", "artist": "Arijit Singh, Shalmali Kholgade · Sajid-Wajid", "year": "2014", "query": "Shanivaar Raati Main Tera Hero official video", "hookStartSec": 45, "energy": 9},
    {"title": "High Heels Te Nachche", "artist": "Meet Bros, Jaz Dhami, Yo Yo Honey Singh · Meet Bros", "year": "2016", "query": "High Heels Te Nachche Ki and Ka official video", "hookStartSec": 40, "energy": 9},
    {"title": "Chittiyaan Kalaiyaan", "artist": "Meet Bros Anjjan, Kanika Kapoor · Meet Bros Anjjan", "year": "2015", "query": "Chittiyaan Kalaiyaan Roy official video", "hookStartSec": 40, "energy": 9},
    {"title": "Baby Doll", "artist": "Meet Bros Anjjan, Kanika Kapoor · Meet Bros Anjjan", "year": "2014", "query": "Baby Doll Ragini MMS 2 official video", "hookStartSec": 45, "energy": 9},
    {"title": "Lovely", "artist": "Kanika Kapoor, Ravindra Upadhyay · Dr Zeus", "year": "2014", "query": "Lovely Happy New Year official video", "hookStartSec": 45, "energy": 9},
    {"title": "India Waale", "artist": "Vishal Dadlani, KK, Shankar Mahadevan, Neeti Mohan · Vishal-Shekhar", "year": "2014", "query": "India Waale Happy New Year official video", "hookStartSec": 50, "energy": 9},
    {"title": "Gulaabo", "artist": "Vishal Dadlani, Anusha Mani · Amit Trivedi", "year": "2015", "query": "Gulaabo Shaandaar official video", "hookStartSec": 45, "energy": 9},
    {"title": "Shaam Shaandaar", "artist": "Amit Trivedi · Amit Trivedi", "year": "2015", "query": "Shaam Shaandaar official video", "hookStartSec": 40, "energy": 9},
    {"title": "Show Me The Thumka", "artist": "Sunidhi Chauhan, Shashwat Singh · Pritam", "year": "2023", "query": "Show Me The Thumka Tu Jhoothi Main Makkaar official video", "hookStartSec": 45, "energy": 9},
    {"title": "Pyaar Hota Kayi Baar Hai", "artist": "Arijit Singh · Pritam", "year": "2023", "query": "Pyaar Hota Kayi Baar Hai official video", "hookStartSec": 45, "energy": 9},
    {"title": "Tere Pyaar Mein", "artist": "Arijit Singh, Nikhita Gandhi · Pritam", "year": "2023", "query": "Tere Pyaar Mein Tu Jhoothi Main Makkaar official video", "hookStartSec": 45, "energy": 9},
    {"title": "What Jhumka?", "artist": "Arijit Singh, Jonita Gandhi · Pritam", "year": "2023", "query": "What Jhumka Rocky Aur Rani Kii Prem Kahaani official video", "hookStartSec": 45, "energy": 9},
    {"title": "Dhindhora Baje Re", "artist": "Darshan Raval, Bhoomi Trivedi · Pritam", "year": "2023", "query": "Dhindhora Baje Re Rocky Aur Rani Kii Prem Kahaani official video", "hookStartSec": 50, "energy": 9},
    {"title": "Heart Throb", "artist": "Dev Negi · Pritam", "year": "2023", "query": "Heart Throb Rocky Aur Rani Kii Prem Kahaani official video", "hookStartSec": 40, "energy": 9},
    {"title": "Tauba Tauba", "artist": "Karan Aujla · Karan Aujla", "year": "2024", "query": "Tauba Tauba Bad Newz official video", "hookStartSec": 35, "energy": 9},
    {"title": "Aaj Ki Raat", "artist": "Madhubanti Bagchi, Divya Kumar · Sachin-Jigar", "year": "2024", "query": "Aaj Ki Raat Stree 2 official video", "hookStartSec": 45, "energy": 9},
    {"title": "Aayi Nai", "artist": "Pawan Singh, Simran Choudhary, Divya Kumar · Sachin-Jigar", "year": "2024", "query": "Aayi Nai Stree 2 official video", "hookStartSec": 40, "energy": 9},
    {"title": "Milegi Milegi", "artist": "Mika Singh · Sachin-Jigar", "year": "2018", "query": "Milegi Milegi Stree official video", "hookStartSec": 40, "energy": 9},
    {"title": "Kamariya - Stree", "artist": "Aastha Gill, Jigar Saraiya · Sachin-Jigar", "year": "2018", "query": "Kamariya Stree official video Nora Fatehi", "hookStartSec": 40, "energy": 9},
    {"title": "Mehndi Laga Ke Rakhna", "artist": "Lata Mangeshkar, Udit Narayan · Jatin-Lalit", "year": "1995", "query": "Mehndi Laga Ke Rakhna DDLJ official video", "hookStartSec": 60, "energy": 9},
    {"title": "Saajanji Ghar Aaye", "artist": "Kumar Sanu, Alka Yagnik, Kavita Krishnamurthy · Jatin-Lalit", "year": "1998", "query": "Saajanji Ghar Aaye Kuch Kuch Hota Hai official video", "hookStartSec": 55, "energy": 9},
    {"title": "Say Shava Shava", "artist": "Alka Yagnik, Sunidhi Chauhan, Udit Narayan, Sudesh Bhosle, Amitabh Bachchan · Aadesh Shrivastava", "year": "2001", "query": "Say Shava Shava K3G official video", "hookStartSec": 60, "energy": 9},
    {"title": "You Are My Soniya", "artist": "Sonu Nigam, Alka Yagnik · Sandesh Shandilya", "year": "2001", "query": "You Are My Soniya K3G official video", "hookStartSec": 50, "energy": 9},
    {"title": "Deewangi Deewangi", "artist": "Shaan, Udit Narayan, Shreya Ghoshal, Sunidhi Chauhan · Vishal-Shekhar", "year": "2007", "query": "Deewangi Deewangi Om Shanti Om official video", "hookStartSec": 55, "energy": 9},
    {"title": "Dhoom Taana", "artist": "Abhijeet Bhattacharya, Shreya Ghoshal · Vishal-Shekhar", "year": "2007", "query": "Dhoom Taana Om Shanti Om official video", "hookStartSec": 50, "energy": 9},
    {"title": "Dard-E-Disco", "artist": "Sukhwinder Singh · Vishal-Shekhar", "year": "2007", "query": "Dard-E-Disco Om Shanti Om official video", "hookStartSec": 45, "energy": 9},
    {"title": "Malhari", "artist": "Vishal Dadlani · Sanjay Leela Bhansali", "year": "2015", "query": "Malhari Bajirao Mastani official video", "hookStartSec": 45, "energy": 9},
    {"title": "Pinga", "artist": "Shreya Ghoshal, Vaishali Made · Sanjay Leela Bhansali", "year": "2015", "query": "Pinga Bajirao Mastani official video", "hookStartSec": 50, "energy": 9},
    {"title": "Ghoomar", "artist": "Shreya Ghoshal, Swaroop Khan · Sanjay Leela Bhansali", "year": "2018", "query": "Ghoomar Padmaavat official video", "hookStartSec": 55, "energy": 9},
    {"title": "Khalibali", "artist": "Shivam Pathak, Shail Hada · Sanjay Leela Bhansali", "year": "2018", "query": "Khalibali Padmaavat official video", "hookStartSec": 50, "energy": 9},
    {"title": "Chhalka Chhalka Re", "artist": "Richa Sharma, Mahalaxmi Iyer, Vaishali Samant · A.R. Rahman", "year": "2002", "query": "Chhalka Chhalka Re Saathiya official video", "hookStartSec": 45, "energy": 8}
]

def fetch_song_data(item):
    q = item["query"]
    cmd = ['yt-dlp', '--js-runtimes', 'node', '--no-warnings', '--print', '%(id)s|||%(duration)s|||%(title)s', f'ytsearch1:{q}']
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        out = res.stdout.strip()
        parts = out.split('|||')
        if len(parts) >= 1 and len(parts[0].strip()) == 11:
            vid = parts[0].strip()
            dur = 240
            if len(parts) >= 2 and parts[1].strip().isdigit():
                dur = int(parts[1].strip())
            return {
                "title": item["title"],
                "artist": item["artist"],
                "year": str(item["year"]),
                "durationSec": dur if (150 <= dur <= 500) else 240,
                "hookStartSec": item["hookStartSec"],
                "hookEndSec": item["hookStartSec"] + 40,
                "entrySec": item["hookStartSec"],
                "exitSec": item["hookStartSec"] + 40,
                "videoId": vid,
                "energy": item["energy"]
            }
        else:
            print(f"Failed query for {item['title']}: output '{out}'")
            return None
    except Exception as e:
        print(f"Exception query for {item['title']}: {e}")
        return None

def main():
    print(f"Starting fetch for {len(RAW_HINDI_SUFI)} Sufi and {len(RAW_DIWALI_PARTY)} Diwali songs...")
    
    seen_vids = set()
    sufi_songs = []
    diwali_songs = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        sufi_results = list(executor.map(fetch_song_data, RAW_HINDI_SUFI))
    
    for s in sufi_results:
        if s and s["videoId"] not in seen_vids:
            seen_vids.add(s["videoId"])
            sufi_songs.append(s)
            if len(sufi_songs) == 80:
                break
                
    print(f"Curated {len(sufi_songs)} unique Hindi Sufi songs.")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        diwali_results = list(executor.map(fetch_song_data, RAW_DIWALI_PARTY))
        
    for d in diwali_results:
        if d and d["videoId"] not in seen_vids:
            seen_vids.add(d["videoId"])
            diwali_songs.append(d)
            if len(diwali_songs) == 80:
                break
                
    print(f"Curated {len(diwali_songs)} unique Diwali party songs.")
    
    out_dir = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "agent_4.json")
    
    final_payload = {
        "hindi-sufi": sufi_songs,
        "diwali-party-songs": diwali_songs
    }
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(final_payload, f, indent=2, ensure_ascii=False)
        
    print(f"Wrote {len(sufi_songs)} sufi and {len(diwali_songs)} diwali songs to {out_path}!")

if __name__ == "__main__":
    main()
