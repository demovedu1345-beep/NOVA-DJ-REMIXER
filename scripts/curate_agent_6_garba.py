import json
import os
import sys
import time
import urllib.request
import concurrent.futures
import yt_dlp

CANDIDATES = [
    # 1. Aditya Gadhvi Hits
    {"title": "Khalasi", "artist": "Aditya Gadhvi, Achint", "year": "2023", "query": "Coke Studio Bharat Khalasi Aditya Gadhvi Achint", "hookStartSec": 50, "energy": 10},
    {"title": "Rann Na Phool", "artist": "Aditya Gadhvi, Kankana", "year": "2023", "query": "Rann Na Phool Aditya Gadhvi official video", "hookStartSec": 45, "energy": 9},
    {"title": "Vadaldi", "artist": "Aditya Gadhvi, Sachin-Jigar", "year": "2021", "query": "Vadaldi Aditya Gadhvi Sachin Jigar official", "hookStartSec": 40, "energy": 9},
    {"title": "Rammo Rammo", "artist": "Aditya Gadhvi", "year": "2022", "query": "Rammo Rammo Aditya Gadhvi official music video", "hookStartSec": 35, "energy": 10},
    {"title": "Hansla", "artist": "Aditya Gadhvi, Sachin-Jigar", "year": "2022", "query": "Hansla Aditya Gadhvi Sachin Jigar official video", "hookStartSec": 45, "energy": 9},
    {"title": "Mahahetvali", "artist": "Aditya Gadhvi", "year": "2022", "query": "Mahahetvali Aditya Gadhvi official music video", "hookStartSec": 35, "energy": 9},
    {"title": "Nagar Nandji Na Lal", "artist": "Aditya Gadhvi", "year": "2020", "query": "Nagar Nandji Na Lal Aditya Gadhvi official", "hookStartSec": 40, "energy": 9},
    {"title": "Rang Bhini Radha", "artist": "Aditya Gadhvi", "year": "2021", "query": "Rang Bhini Radha Aditya Gadhvi official video", "hookStartSec": 35, "energy": 9},
    {"title": "Soniye", "artist": "Aditya Gadhvi", "year": "2022", "query": "Soniye Aditya Gadhvi official video", "hookStartSec": 40, "energy": 9},
    {"title": "Aarasuri Amba", "artist": "Aditya Gadhvi", "year": "2023", "query": "Aarasuri Amba Aditya Gadhvi garba official", "hookStartSec": 30, "energy": 10},

    # 2. Kinjal Dave Hits
    {"title": "Char Bangdi Vadi Gadi", "artist": "Kinjal Dave", "year": "2016", "query": "Char Bangdi Vadi Gadi Kinjal Dave RDC Gujarati official video", "hookStartSec": 52, "energy": 10},
    {"title": "Leri Lala", "artist": "Kinjal Dave", "year": "2017", "query": "Leri Lala Kinjal Dave official video", "hookStartSec": 45, "energy": 10},
    {"title": "Dhan Chhe Gujarat", "artist": "Kinjal Dave", "year": "2018", "query": "Dhan Chhe Gujarat Kinjal Dave official video", "hookStartSec": 40, "energy": 9},
    {"title": "Makhan Chor", "artist": "Kinjal Dave", "year": "2019", "query": "Makhan Chor Kinjal Dave official video", "hookStartSec": 35, "energy": 9},
    {"title": "Chote Raja", "artist": "Kinjal Dave", "year": "2018", "query": "Chote Raja Kinjal Dave official video", "hookStartSec": 40, "energy": 10},
    {"title": "Gogo Gogo Maro Gom Dhani", "artist": "Kinjal Dave", "year": "2017", "query": "Gogo Gogo Maro Gom Dhani Kinjal Dave official", "hookStartSec": 40, "energy": 10},
    {"title": "DJ Radha", "artist": "Kinjal Dave", "year": "2018", "query": "DJ Radha Kinjal Dave official video", "hookStartSec": 35, "energy": 10},
    {"title": "Garbe Ramo Ambe Maa", "artist": "Kinjal Dave", "year": "2019", "query": "Garbe Ramo Ambe Maa Kinjal Dave official garba", "hookStartSec": 40, "energy": 9},
    {"title": "Jivantika Maa", "artist": "Kinjal Dave", "year": "2020", "query": "Jivantika Maa Kinjal Dave official video", "hookStartSec": 40, "energy": 9},
    {"title": "Moj Ma Revu", "artist": "Kinjal Dave", "year": "2021", "query": "Moj Ma Revu Kinjal Dave official video", "hookStartSec": 35, "energy": 9},
    {"title": "Khodiyar Maa No Garbo", "artist": "Kinjal Dave", "year": "2019", "query": "Khodiyar Maa No Garbo Kinjal Dave garba", "hookStartSec": 40, "energy": 9},
    {"title": "Navrat", "artist": "Kinjal Dave", "year": "2022", "query": "Navrat Kinjal Dave official video garba", "hookStartSec": 40, "energy": 10},
    {"title": "Bhai No Mel Padi Gayo", "artist": "Kinjal Dave", "year": "2020", "query": "Bhai No Mel Padi Gayo Kinjal Dave official video", "hookStartSec": 35, "energy": 10},
    {"title": "Jay Adhyashakti Aarti", "artist": "Kinjal Dave", "year": "2018", "query": "Jay Adhyashakti Aarti Kinjal Dave official video", "hookStartSec": 45, "energy": 9},
    {"title": "Ame Gujarati Leri Lala", "artist": "Kinjal Dave", "year": "2018", "query": "Ame Gujarati Leri Lala Kinjal Dave official", "hookStartSec": 35, "energy": 10},

    # 3. Geeta Rabari Hits
    {"title": "Rona Ser Ma", "artist": "Geeta Rabari", "year": "2017", "query": "Rona Ser Ma Geeta Rabari Raghav Digital official video", "hookStartSec": 48, "energy": 10},
    {"title": "Mahadev", "artist": "Geeta Rabari", "year": "2019", "query": "Mahadev Geeta Rabari official video", "hookStartSec": 45, "energy": 10},
    {"title": "Kaho Poonam Na Chand Ne", "artist": "Geeta Rabari", "year": "2018", "query": "Kaho Poonam Na Chand Ne Geeta Rabari official video", "hookStartSec": 40, "energy": 9},
    {"title": "Valamiya 2.0", "artist": "Geeta Rabari", "year": "2020", "query": "Valamiya 2.0 Geeta Rabari official video", "hookStartSec": 35, "energy": 9},
    {"title": "Mogal Aave", "artist": "Geeta Rabari", "year": "2019", "query": "Mogal Aave Geeta Rabari official video", "hookStartSec": 40, "energy": 10},
    {"title": "Dhol Nagada", "artist": "Geeta Rabari", "year": "2021", "query": "Dhol Nagada Geeta Rabari official video", "hookStartSec": 35, "energy": 10},
    {"title": "Maa Tara Ashirwad", "artist": "Geeta Rabari", "year": "2018", "query": "Maa Tara Ashirwad Geeta Rabari official video", "hookStartSec": 45, "energy": 9},
    {"title": "Desi Dhol Vage", "artist": "Geeta Rabari", "year": "2020", "query": "Desi Dhol Vage Geeta Rabari official garba video", "hookStartSec": 35, "energy": 10},
    {"title": "Pardesiya", "artist": "Geeta Rabari", "year": "2021", "query": "Pardesiya Geeta Rabari official video", "hookStartSec": 40, "energy": 9},
    {"title": "Ram Siya Ram", "artist": "Geeta Rabari", "year": "2023", "query": "Ram Siya Ram Geeta Rabari official video", "hookStartSec": 40, "energy": 9},
    {"title": "Jode Rejo Raaj", "artist": "Geeta Rabari", "year": "2021", "query": "Jode Rejo Raaj Geeta Rabari official video", "hookStartSec": 40, "energy": 9},
    {"title": "Meldi Maa No Garbo", "artist": "Geeta Rabari", "year": "2019", "query": "Meldi Maa No Garbo Geeta Rabari official", "hookStartSec": 45, "energy": 9},
    {"title": "Aavi Rudhi Navratri", "artist": "Geeta Rabari", "year": "2022", "query": "Aavi Rudhi Navratri Geeta Rabari official garba video", "hookStartSec": 35, "energy": 10},
    {"title": "Kesariya", "artist": "Geeta Rabari", "year": "2022", "query": "Kesariya Gujarati Geeta Rabari official video", "hookStartSec": 40, "energy": 9},
    {"title": "Tara Vina Shyam", "artist": "Geeta Rabari", "year": "2021", "query": "Tara Vina Shyam Mane Geeta Rabari official garba", "hookStartSec": 40, "energy": 9},

    # 4. Kirtidan Gadhvi Hits
    {"title": "Gori Radha Ne Kalo Kaan", "artist": "Kirtidan Gadhvi", "year": "2017", "query": "Gori Radha Ne Kalo Kaan Kirtidan Gadhvi official video", "hookStartSec": 45, "energy": 10},
    {"title": "Mogal Taro Aashro", "artist": "Kirtidan Gadhvi", "year": "2018", "query": "Mogal Taro Aashro Kirtidan Gadhvi official video", "hookStartSec": 40, "energy": 10},
    {"title": "Nagar Nand Ji Na Lal", "artist": "Kirtidan Gadhvi", "year": "2018", "query": "Nagar Nand Ji Na Lal Kirtidan Gadhvi dayro garba", "hookStartSec": 40, "energy": 9},
    {"title": "Laadki", "artist": "Sachin-Jigar, Kirtidan Gadhvi, Rekha Bhardwaj", "year": "2015", "query": "Laadki Coke Studio at MTV Season 4 Sachin Jigar Kirtidan Gadhvi", "hookStartSec": 55, "energy": 9},
    {"title": "Tahukar", "artist": "Kirtidan Gadhvi", "year": "2019", "query": "Tahukar Kirtidan Gadhvi nonstop garba official", "hookStartSec": 35, "energy": 10},
    {"title": "Morli Re Morli", "artist": "Kirtidan Gadhvi", "year": "2020", "query": "Morli Re Morli Kirtidan Gadhvi official video", "hookStartSec": 40, "energy": 9},
    {"title": "Mogal Chedta Kalo Naag", "artist": "Kirtidan Gadhvi", "year": "2018", "query": "Mogal Chedta Kalo Naag Kirtidan Gadhvi official", "hookStartSec": 45, "energy": 10},
    {"title": "Rang Tali", "artist": "Kirtidan Gadhvi", "year": "2019", "query": "Rang Tali Kirtidan Gadhvi garba official video", "hookStartSec": 35, "energy": 10},
    {"title": "Saybo Re Govaliyo", "artist": "Kirtidan Gadhvi", "year": "2020", "query": "Saybo Re Govaliyo Kirtidan Gadhvi official video", "hookStartSec": 40, "energy": 9},
    {"title": "Garbe Ramva Aavjo", "artist": "Kirtidan Gadhvi", "year": "2021", "query": "Garbe Ramva Aavjo Kirtidan Gadhvi official garba", "hookStartSec": 40, "energy": 10},
    {"title": "Bam Bam Bhole", "artist": "Kirtidan Gadhvi", "year": "2020", "query": "Bam Bam Bhole Kirtidan Gadhvi official video", "hookStartSec": 40, "energy": 10},
    {"title": "He Mari Ambe Maa", "artist": "Kirtidan Gadhvi", "year": "2019", "query": "He Mari Ambe Maa Kirtidan Gadhvi garba", "hookStartSec": 40, "energy": 9},
    {"title": "Kaanudo Ramva Aave", "artist": "Kirtidan Gadhvi", "year": "2021", "query": "Kaanudo Ramva Aave Kirtidan Gadhvi official", "hookStartSec": 35, "energy": 9},
    {"title": "Dakor Na Thakor", "artist": "Kirtidan Gadhvi", "year": "2020", "query": "Dakor Na Thakor Kirtidan Gadhvi official video", "hookStartSec": 40, "energy": 9},

    # 5. Falguni Pathak Classics & Dandiya Hits
    {"title": "Maine Payal Hai Chhankai", "artist": "Falguni Pathak", "year": "1999", "query": "Maine Payal Hai Chhankai Falguni Pathak official video", "hookStartSec": 42, "energy": 9},
    {"title": "Meri Chunar Udd Udd Jaye", "artist": "Falguni Pathak", "year": "2000", "query": "Meri Chunar Udd Udd Jaye Falguni Pathak official video", "hookStartSec": 45, "energy": 9},
    {"title": "Yaad Piya Ki Aane Lagi", "artist": "Falguni Pathak", "year": "1998", "query": "Yaad Piya Ki Aane Lagi Falguni Pathak official video", "hookStartSec": 40, "energy": 9},
    {"title": "Aiyo Rama", "artist": "Falguni Pathak", "year": "2000", "query": "Aiyo Rama Falguni Pathak official video", "hookStartSec": 35, "energy": 9},
    {"title": "Saawan Mein Morni Banke", "artist": "Falguni Pathak", "year": "2001", "query": "Saawan Mein Morni Banke Falguni Pathak official video", "hookStartSec": 40, "energy": 9},
    {"title": "O Piya", "artist": "Falguni Pathak", "year": "2002", "query": "O Piya Falguni Pathak official video", "hookStartSec": 40, "energy": 9},
    {"title": "Rim Jhim", "artist": "Falguni Pathak", "year": "2001", "query": "Rim Jhim Gire Saawan Falguni Pathak official video", "hookStartSec": 35, "energy": 9},
    {"title": "Indhana Vinva Gayi Ti", "artist": "Falguni Pathak", "year": "2003", "query": "Indhana Vinva Gayi Ti Falguni Pathak official garba", "hookStartSec": 40, "energy": 9},
    {"title": "Radha Kahan Dhoondhe", "artist": "Falguni Pathak", "year": "2021", "query": "Radha Kahan Dhoondhe Falguni Pathak official video", "hookStartSec": 40, "energy": 9},
    {"title": "Tara Vina Shyam", "artist": "Falguni Pathak", "year": "2019", "query": "Tara Vina Shyam Falguni Pathak official garba", "hookStartSec": 45, "energy": 9},
    {"title": "Pankhida O Pankhida", "artist": "Falguni Pathak", "year": "2018", "query": "Pankhida O Pankhida Falguni Pathak official garba", "hookStartSec": 40, "energy": 10},
    {"title": "Kesariyo Rang Tane Lagyo", "artist": "Falguni Pathak", "year": "2019", "query": "Kesariyo Rang Tane Lagyo Falguni Pathak live garba", "hookStartSec": 40, "energy": 9},
    {"title": "Dholida Dhol Re Vagad", "artist": "Falguni Pathak", "year": "2018", "query": "Dholida Dhol Re Vagad Falguni Pathak official garba", "hookStartSec": 35, "energy": 10},
    {"title": "Mara Te Gamde Ek Baar", "artist": "Falguni Pathak", "year": "2019", "query": "Mara Te Gamde Ek Baar Falguni Pathak garba", "hookStartSec": 40, "energy": 9},
    {"title": "Jhule Jhule Che Radha", "artist": "Falguni Pathak", "year": "2019", "query": "Jhule Jhule Che Radha Falguni Pathak garba official", "hookStartSec": 40, "energy": 9},
    {"title": "Sonal Garbo", "artist": "Falguni Pathak", "year": "2020", "query": "Sonal Garbo Shire Falguni Pathak official garba", "hookStartSec": 40, "energy": 9},
    {"title": "Odhni Odhu Toh", "artist": "Falguni Pathak", "year": "2020", "query": "Odhni Odhu Ne Udi Jaye Falguni Pathak garba", "hookStartSec": 35, "energy": 10},
    {"title": "Madan Pali", "artist": "Falguni Pathak", "year": "2020", "query": "Madan Pali Falguni Pathak official garba", "hookStartSec": 40, "energy": 9},
    {"title": "Vithal Vithal Vitthala", "artist": "Falguni Pathak", "year": "2019", "query": "Vithal Vithal Vitthala Falguni Pathak garba live", "hookStartSec": 45, "energy": 10},
    {"title": "Kaanuda Ne Morli", "artist": "Falguni Pathak", "year": "2021", "query": "Kaanuda Ne Morli Falguni Pathak official video", "hookStartSec": 35, "energy": 9},

    # 6. Atul Purohit (United Way Garba King)
    {"title": "Tara Vina Shyam Mane Ekla Re Lage", "artist": "Atul Purohit", "year": "2016", "query": "Tara Vina Shyam Mane Ekla Re Lage Atul Purohit United Way Baroda", "hookStartSec": 50, "energy": 10},
    {"title": "Pankhida Tu Udi Jaje", "artist": "Atul Purohit", "year": "2017", "query": "Pankhida Tu Udi Jaje Atul Purohit United Way", "hookStartSec": 45, "energy": 10},
    {"title": "Aso Sud Ekam Ni Raat Aavi", "artist": "Atul Purohit", "year": "2018", "query": "Aso Sud Ekam Ni Raat Aavi Atul Purohit garba", "hookStartSec": 40, "energy": 9},
    {"title": "Maa Pavate Thi Utarya Maakali Re", "artist": "Atul Purohit", "year": "2017", "query": "Maa Pavate Thi Utarya Maakali Re Atul Purohit garba", "hookStartSec": 45, "energy": 10},
    {"title": "Sona No Garbo", "artist": "Atul Purohit", "year": "2018", "query": "Sona No Garbo Rupano Garbo Atul Purohit garba", "hookStartSec": 40, "energy": 9},
    {"title": "Hu To Gai Ti Mele", "artist": "Atul Purohit", "year": "2019", "query": "Hu To Gai Ti Mele Atul Purohit garba", "hookStartSec": 35, "energy": 9},
    {"title": "Kesariyo Rang", "artist": "Atul Purohit", "year": "2018", "query": "Kesariyo Rang Atul Purohit United Way garba", "hookStartSec": 40, "energy": 9},
    {"title": "Saybo Re Govaliyo", "artist": "Atul Purohit", "year": "2019", "query": "Saybo Re Govaliyo Atul Purohit garba", "hookStartSec": 40, "energy": 9},
    {"title": "Radha Dhundh Rahi", "artist": "Atul Purohit", "year": "2019", "query": "Radha Dhundh Rahi Kisi Ne Mera Shyam Dekha Atul Purohit", "hookStartSec": 45, "energy": 9},
    {"title": "Odhaji Mara Vhala Ne", "artist": "Atul Purohit", "year": "2018", "query": "Odhaji Mara Vhala Ne Atul Purohit garba", "hookStartSec": 40, "energy": 9},
    {"title": "Kumkum Na Pagla", "artist": "Atul Purohit", "year": "2018", "query": "Kumkum Na Pagla Padya Atul Purohit garba", "hookStartSec": 40, "energy": 9},
    {"title": "He Karuna Na Karnara", "artist": "Atul Purohit", "year": "2019", "query": "He Karuna Na Karnara Atul Purohit garba prayer", "hookStartSec": 45, "energy": 9},
    {"title": "Maru Man Mohi Gayu", "artist": "Atul Purohit", "year": "2018", "query": "Maru Man Mohi Gayu Atul Purohit garba", "hookStartSec": 40, "energy": 9},

    # 7. Aishwarya Majmudar & Parthiv Gohil
    {"title": "Ghammar Ghammar", "artist": "Aishwarya Majmudar", "year": "2020", "query": "Ghammar Ghammar Aishwarya Majmudar official video", "hookStartSec": 35, "energy": 10},
    {"title": "Hu Re Saheli", "artist": "Aishwarya Majmudar", "year": "2021", "query": "Hu Re Saheli Aishwarya Majmudar official video", "hookStartSec": 40, "energy": 9},
    {"title": "Rang Bhini Radha", "artist": "Aishwarya Majmudar", "year": "2022", "query": "Rang Bhini Radha Aishwarya Majmudar official video", "hookStartSec": 35, "energy": 9},
    {"title": "Kuva Par Leeli Kankotri", "artist": "Aishwarya Majmudar", "year": "2021", "query": "Kuva Par Leeli Kankotri Aishwarya Majmudar official", "hookStartSec": 40, "energy": 9},
    {"title": "Prem Rang", "artist": "Aishwarya Majmudar", "year": "2022", "query": "Prem Rang Aishwarya Majmudar official music video", "hookStartSec": 35, "energy": 9},
    {"title": "Mogal Machhadvali", "artist": "Aishwarya Majmudar", "year": "2021", "query": "Mogal Machhadvali Aishwarya Majmudar official video", "hookStartSec": 40, "energy": 10},
    {"title": "Pethalpur Ma Pavo Vagyo", "artist": "Aishwarya Majmudar", "year": "2020", "query": "Pethalpur Ma Pavo Vagyo Aishwarya Majmudar garba", "hookStartSec": 35, "energy": 10},
    {"title": "Maiyaran", "artist": "Parthiv Gohil", "year": "2019", "query": "Maiyaran Parthiv Gohil official video", "hookStartSec": 40, "energy": 9},
    {"title": "Dholida Garba Rock", "artist": "Parthiv Gohil", "year": "2020", "query": "Dholida Parthiv Gohil Garba Rock official video", "hookStartSec": 40, "energy": 10},
    {"title": "Mann Meldi", "artist": "Parthiv Gohil", "year": "2021", "query": "Mann Meldi Parthiv Gohil official video", "hookStartSec": 40, "energy": 9},
    {"title": "Ranglo", "artist": "Parthiv Gohil", "year": "2022", "query": "Ranglo Parthiv Gohil official video garba", "hookStartSec": 35, "energy": 10},
    {"title": "Sapna Vinani Raat", "artist": "Parthiv Gohil", "year": "2018", "query": "Sapna Vinani Raat Parthiv Gohil official video", "hookStartSec": 45, "energy": 9},
    {"title": "Ame Mahiyara Re", "artist": "Parthiv Gohil", "year": "2019", "query": "Ame Mahiyara Re Parthiv Gohil official garba", "hookStartSec": 35, "energy": 9},

    # 8. Jigardan Gadhavi (Jigrra)
    {"title": "Vhalam Aavo Ne", "artist": "Jigardan Gadhavi", "year": "2017", "query": "Vhalam Aavo Ne Love Ni Bhavai Jigardan Gadhavi", "hookStartSec": 50, "energy": 9},
    {"title": "Tari Mathe Jhumkhalu", "artist": "Jigardan Gadhavi, Sachin-Jigar", "year": "2021", "query": "Tari Mathe Jhumkhalu Jigardan Gadhavi Sachin Jigar", "hookStartSec": 35, "energy": 10},
    {"title": "Mogal Taro Aashro", "artist": "Jigardan Gadhavi", "year": "2020", "query": "Mogal Taro Aashro Jigardan Gadhavi official video", "hookStartSec": 40, "energy": 10},
    {"title": "Dhun Laagi", "artist": "Jigardan Gadhavi", "year": "2019", "query": "Dhun Laagi Jigardan Gadhavi official video", "hookStartSec": 40, "energy": 9},
    {"title": "Mogal Aave", "artist": "Jigardan Gadhavi", "year": "2021", "query": "Mogal Aave Jigardan Gadhavi official video", "hookStartSec": 40, "energy": 10},
    {"title": "Ghammar", "artist": "Jigardan Gadhavi", "year": "2022", "query": "Ghammar Jigardan Gadhavi official garba video", "hookStartSec": 35, "energy": 10},
    {"title": "Bol Valam", "artist": "Jigardan Gadhavi", "year": "2022", "query": "Bol Valam Jigardan Gadhavi official video", "hookStartSec": 40, "energy": 9},
    {"title": "Chaand Ne Kaho", "artist": "Jigardan Gadhavi", "year": "2020", "query": "Chaand Ne Kaho Jigardan Gadhavi official video", "hookStartSec": 45, "energy": 9},
    {"title": "Kaanudo", "artist": "Jigardan Gadhavi", "year": "2021", "query": "Kaanudo Jigardan Gadhavi official garba", "hookStartSec": 35, "energy": 10},

    # 9. Osman Mir & Bhoomi Trivedi Hits
    {"title": "Mor Bani Thanghat Kare", "artist": "Osman Mir, Aditi Paul", "year": "2013", "query": "Mor Bani Thanghat Kare Ram Leela official song Osman Mir", "hookStartSec": 45, "energy": 10},
    {"title": "Nagada Sang Dhol", "artist": "Shreya Ghoshal, Osman Mir", "year": "2013", "query": "Nagada Sang Dhol Ram Leela official song Deepika Padukone", "hookStartSec": 55, "energy": 10},
    {"title": "Boom Paddi", "artist": "Shreya Ghoshal, Osman Mir", "year": "2022", "query": "Boom Paddi Maja Ma Madhuri Dixit Osman Mir Shreya Ghoshal", "hookStartSec": 42, "energy": 10},
    {"title": "Moti Veraana", "artist": "Amit Trivedi, Osman Mir", "year": "2020", "query": "Moti Veraana Amit Trivedi Osman Mir Songs of Faith", "hookStartSec": 48, "energy": 10},
    {"title": "Hey Mari Ambe Maa", "artist": "Osman Mir", "year": "2019", "query": "Hey Mari Ambe Maa Osman Mir official garba", "hookStartSec": 40, "energy": 9},
    {"title": "Ranglo", "artist": "Osman Mir", "year": "2020", "query": "Ranglo Osman Mir official garba video", "hookStartSec": 35, "energy": 10},
    {"title": "Kasumbi No Rang", "artist": "Osman Mir", "year": "2019", "query": "Kasumbi No Rang Osman Mir official video", "hookStartSec": 45, "energy": 9},
    {"title": "Vaagyo Re Dhol", "artist": "Bhoomi Trivedi", "year": "2019", "query": "Vaagyo Re Dhol Hellaro Bhoomi Trivedi official video", "hookStartSec": 40, "energy": 10},
    {"title": "Udi Udi Jaye", "artist": "Sukhwinder Singh, Bhoomi Trivedi", "year": "2017", "query": "Udi Udi Jaye Raees Shah Rukh Khan Bhoomi Trivedi", "hookStartSec": 45, "energy": 10},
    {"title": "Chhel Chhabilo Gujarati", "artist": "Bhoomi Trivedi", "year": "2021", "query": "Chhel Chhabilo Gujarati Bhoomi Trivedi official video", "hookStartSec": 35, "energy": 10},
    {"title": "Garbe Ghume Re", "artist": "Bhoomi Trivedi", "year": "2022", "query": "Garbe Ghume Re Bhoomi Trivedi official garba", "hookStartSec": 40, "energy": 10},

    # 10. Hellaro Masterpieces
    {"title": "Asavari", "artist": "Aishwarya Majmudar, Bhoomi Trivedi", "year": "2019", "query": "Asavari Hellaro official video Aishwarya Majmudar", "hookStartSec": 45, "energy": 9},
    {"title": "Haiya Ho", "artist": "Shruti Pathak, Aditya Gadhvi", "year": "2019", "query": "Haiya Ho Hellaro official song Shruti Pathak Aditya Gadhvi", "hookStartSec": 40, "energy": 10},
    {"title": "Saphed Dhadhari", "artist": "Aditya Gadhvi, Mehul Surti", "year": "2019", "query": "Saphed Dhadhari Hellaro official video Aditya Gadhvi", "hookStartSec": 35, "energy": 9},

    # 11. Pravin Luni & Devang Patel
    {"title": "Dakla 4", "artist": "Pravin Luni", "year": "2019", "query": "Dakla 4 Pravin Luni official video", "hookStartSec": 45, "energy": 10},
    {"title": "Dakla 1", "artist": "Pravin Luni", "year": "2018", "query": "Dakla 1 Pravin Luni official video", "hookStartSec": 40, "energy": 10},
    {"title": "Dakla 2", "artist": "Pravin Luni", "year": "2018", "query": "Dakla 2 Pravin Luni official video", "hookStartSec": 40, "energy": 10},
    {"title": "Dakla 3", "artist": "Pravin Luni", "year": "2019", "query": "Dakla 3 Pravin Luni official video", "hookStartSec": 40, "energy": 10},
    {"title": "Meldi Maa No Dakla", "artist": "Pravin Luni", "year": "2020", "query": "Meldi Maa No Dakla Pravin Luni official video", "hookStartSec": 45, "energy": 10},
    {"title": "Patel No Pataro", "artist": "Devang Patel", "year": "2000", "query": "Patel No Pataro Devang Patel official video", "hookStartSec": 40, "energy": 10},
    {"title": "Madhuri Dixit Mili Raste Me", "artist": "Devang Patel", "year": "1999", "query": "Madhuri Dixit Mili Raste Me Devang Patel official", "hookStartSec": 35, "energy": 9},
    {"title": "Meri Marzi", "artist": "Devang Patel", "year": "1999", "query": "Meri Marzi Devang Patel official video Gambler", "hookStartSec": 40, "energy": 9},
    {"title": "Chaloo Girl", "artist": "Devang Patel", "year": "2001", "query": "Chaloo Girl Devang Patel official video", "hookStartSec": 35, "energy": 9},
    {"title": "Disco Dandiya", "artist": "Devang Patel", "year": "2002", "query": "Disco Dandiya Devang Patel nonstop garba official", "hookStartSec": 40, "energy": 10},
    {"title": "Lallu Lal", "artist": "Devang Patel", "year": "2001", "query": "Lallu Lal Devang Patel official comedy song", "hookStartSec": 35, "energy": 9},

    # 12. Hemant Chauhan & Praful Dave Classics
    {"title": "Pankhida Ne Aa Pinjru", "artist": "Hemant Chauhan", "year": "1995", "query": "Pankhida Ne Aa Pinjru Hemant Chauhan official", "hookStartSec": 45, "energy": 9},
    {"title": "Ambe Maa Na Garba", "artist": "Hemant Chauhan", "year": "1996", "query": "Ambe Maa Na Garba Hemant Chauhan nonstop", "hookStartSec": 40, "energy": 9},
    {"title": "Sonal Garbo Shire", "artist": "Hemant Chauhan", "year": "1998", "query": "Sonal Garbo Shire Ambaji Na Garba Hemant Chauhan", "hookStartSec": 40, "energy": 9},
    {"title": "Shrinathji Ni Zankhi", "artist": "Hemant Chauhan", "year": "1997", "query": "Shrinathji Ni Zankhi Hemant Chauhan official", "hookStartSec": 45, "energy": 9},
    {"title": "Dholida Dhol Re Vagad", "artist": "Hemant Chauhan", "year": "1998", "query": "Dholida Dhol Re Vagad Hemant Chauhan garba", "hookStartSec": 35, "energy": 10},
    {"title": "Charar Charar Maru Chakardi Bole", "artist": "Praful Dave", "year": "1992", "query": "Charar Charar Maru Chakardi Bole Praful Dave official video", "hookStartSec": 40, "energy": 10},
    {"title": "Ame Idariyo Gadh Jitya Re", "artist": "Praful Dave", "year": "1993", "query": "Ame Idariyo Gadh Jitya Re Praful Dave official", "hookStartSec": 35, "energy": 10},
    {"title": "Saybo Maro Gulab No Chhod", "artist": "Praful Dave", "year": "1994", "query": "Saybo Maro Gulab No Chhod Praful Dave official", "hookStartSec": 40, "energy": 9},
    {"title": "Mare Te Gamde Ek Baar Aavjo", "artist": "Praful Dave", "year": "1995", "query": "Mare Te Gamde Ek Baar Aavjo Praful Dave official", "hookStartSec": 40, "energy": 9},
    {"title": "Maniyaro Te Halu Halu", "artist": "Praful Dave", "year": "1996", "query": "Maniyaro Te Halu Halu Praful Dave official video", "hookStartSec": 35, "energy": 9},
    {"title": "Ame Mahiyara Re", "artist": "Praful Dave", "year": "1994", "query": "Ame Mahiyara Re Gokul Gam Na Praful Dave", "hookStartSec": 40, "energy": 9},

    # 13. Bollywood Dandiya & Garba Anthems
    {"title": "Chogada", "artist": "Darshan Raval, Asees Kaur", "year": "2018", "query": "Chogada Tara Loveyatri official video song", "hookStartSec": 42, "energy": 10},
    {"title": "Kamariya", "artist": "Darshan Raval", "year": "2018", "query": "Kamariya Mitron Jackky Bhagnani Darshan Raval", "hookStartSec": 45, "energy": 10},
    {"title": "Dholida", "artist": "Janhvi Shrimankar, Shail Hada", "year": "2022", "query": "Dholida Gangubai Kathiawadi Alia Bhatt official video", "hookStartSec": 48, "energy": 10},
    {"title": "Jhume Re Gori", "artist": "Archana Gore, Tarannum Malik", "year": "2022", "query": "Jhume Re Gori Gangubai Kathiawadi official video Alia Bhatt", "hookStartSec": 40, "energy": 10},
    {"title": "Sanedo", "artist": "Mika Singh, Nikhita Gandhi, Sachin-Jigar", "year": "2019", "query": "Sanedo Made In China Rajkummar Rao Mouni Roy official", "hookStartSec": 45, "energy": 10},
    {"title": "Odhani", "artist": "Neha Kakkar, Darshan Raval, Sachin-Jigar", "year": "2019", "query": "Odhani Made In China Rajkummar Rao Mouni Roy official video", "hookStartSec": 40, "energy": 10},
    {"title": "Shubhaarambh", "artist": "Amit Trivedi, Divya Kumar, Shruti Pathak", "year": "2013", "query": "Shubhaarambh Kai Po Che Amit Trivedi official video song", "hookStartSec": 45, "energy": 10},
    {"title": "Garbo", "artist": "Dhvani Bhanushali, Tanishk Bagchi", "year": "2023", "query": "Garbo Dhvani Bhanushali Tanishk Bagchi official music video", "hookStartSec": 35, "energy": 10},
    {"title": "Radha Ne Shyam Mali Jase", "artist": "Sachin Sanghvi, Shruti Pathak", "year": "2019", "query": "Radha Ne Shyam Mali Jase Sachin Jigar official video", "hookStartSec": 45, "energy": 9},
    {"title": "Dholida (Loveyatri)", "artist": "Udit Narayan, Neha Kakkar, Palak Muchhal", "year": "2018", "query": "Dholida Loveyatri Aayush Sharma Warina Hussain official song", "hookStartSec": 45, "energy": 10},
    {"title": "Rangilo Maro Dholna", "artist": "Arun Bakshi, Ila Arun", "year": "1994", "query": "Rangilo Maro Dholna Ila Arun Arun Bakshi official video", "hookStartSec": 45, "energy": 10},
    {"title": "Dholi Taro Dhol Baaje", "artist": "Kavita Krishnamurthy, Vinod Rathod", "year": "1999", "query": "Dholi Taro Dhol Baaje Hum Dil De Chuke Sanam Salman Khan Aishwarya Rai", "hookStartSec": 50, "energy": 10},
    {"title": "Ghoomar", "artist": "Shreya Ghoshal, Swaroop Khan", "year": "2018", "query": "Ghoomar Padmaavat Deepika Padukone Shreya Ghoshal", "hookStartSec": 55, "energy": 9},
    {"title": "Radhe Radhe", "artist": "Meet Bros, Amit Gupta", "year": "2019", "query": "Radhe Radhe Dream Girl Ayushmann Khurrana Nushrratt Bharuccha", "hookStartSec": 40, "energy": 10},

    # 14. Gujarati Desi & Wedding Dance Hits
    {"title": "Hath Ma Chhe Whisky", "artist": "Jignesh Kaviraj", "year": "2017", "query": "Hath Ma Chhe Whisky Jignesh Kaviraj official video", "hookStartSec": 40, "energy": 10},
    {"title": "Bewafa Tane Dur Thi Salam", "artist": "Jignesh Kaviraj", "year": "2018", "query": "Bewafa Tane Dur Thi Salam Jignesh Kaviraj official", "hookStartSec": 45, "energy": 9},
    {"title": "Tame Mane Bhuli Gaya", "artist": "Jignesh Kaviraj", "year": "2019", "query": "Tame Mane Bhuli Gaya Jignesh Kaviraj official video", "hookStartSec": 40, "energy": 9},
    {"title": "Bhai Bhai (Bhala Mori Rama)", "artist": "Arvind Vegda", "year": "2015", "query": "Bhai Bhai Bhala Mori Rama Arvind Vegda official video", "hookStartSec": 35, "energy": 10},
    {"title": "Sanedo Sanedo", "artist": "Arvind Vegda", "year": "2016", "query": "Sanedo Sanedo Arvind Vegda official video", "hookStartSec": 35, "energy": 10},
    {"title": "Mara Raj Thakor", "artist": "Vikram Thakor", "year": "2017", "query": "Mara Raj Thakor Vikram Thakor official video", "hookStartSec": 40, "energy": 9},
    {"title": "DJ Vage Dhimo Dhimo", "artist": "Alpa Patel", "year": "2019", "query": "DJ Vage Dhimo Dhimo Alpa Patel official video", "hookStartSec": 35, "energy": 10},
    {"title": "Hansla Halo Re", "artist": "Alpa Patel", "year": "2020", "query": "Hansla Halo Re Alpa Patel official video", "hookStartSec": 40, "energy": 9},
    {"title": "Mogal Chhoru", "artist": "Umesh Barot", "year": "2020", "query": "Mogal Chhoru Umesh Barot official video", "hookStartSec": 40, "energy": 10},
    {"title": "Radha Rani", "artist": "Umesh Barot", "year": "2021", "query": "Radha Rani Umesh Barot official video", "hookStartSec": 35, "energy": 9},
    {"title": "Meldi Maa Garbo", "artist": "Umesh Barot", "year": "2021", "query": "Meldi Maa Garbo Umesh Barot official", "hookStartSec": 40, "energy": 9},
    {"title": "Kumkum Pagla Padya", "artist": "Alka Yagnik", "year": "1998", "query": "Kumkum Pagla Padya Alka Yagnik garba", "hookStartSec": 40, "energy": 9},
    {"title": "Chundadi Jaipur Thi Mangai", "artist": "Traditional Garba", "year": "2018", "query": "Chundadi Jaipur Thi Mangai Gujarati garba official", "hookStartSec": 35, "energy": 9},
    {"title": "Achyutam Keshavam", "artist": "Garba Dandiya", "year": "2021", "query": "Achyutam Keshavam garba dandiya mix official", "hookStartSec": 35, "energy": 9},
    {"title": "Govind Bolo Hari Gopal Bolo", "artist": "Dandiya Raas", "year": "2020", "query": "Govind Bolo Hari Gopal Bolo garba dandiya raas", "hookStartSec": 40, "energy": 9},
    {"title": "Radhe Radhe Barsane Wali Radhe", "artist": "Garba Dandiya", "year": "2019", "query": "Radhe Radhe Barsane Wali Radhe garba dandiya dance", "hookStartSec": 35, "energy": 10},
    {"title": "Mehndi Rachan Lagi", "artist": "Wedding Dandiya", "year": "2018", "query": "Mehndi Rachan Lagi wedding garba dance song", "hookStartSec": 40, "energy": 9},
    {"title": "London Thumakda", "artist": "Labh Janjua, Sonu Kakkar, Neha Kakkar", "year": "2014", "query": "London Thumakda Queen Kangana Ranaut official video", "hookStartSec": 45, "energy": 10},
    {"title": "Navrai Majhi", "artist": "Sunidhi Chauhan", "year": "2012", "query": "Navrai Majhi English Vinglish Sridevi official song", "hookStartSec": 40, "energy": 9},
    {"title": "Sasural Genda Phool", "artist": "Rekha Bhardwaj", "year": "2009", "query": "Sasural Genda Phool Delhi 6 Sonam Kapoor official song", "hookStartSec": 45, "energy": 9},
    {"title": "Gal Mitthi Mitthi Bol", "artist": "Tochi Raina", "year": "2010", "query": "Gal Mitthi Mitthi Aisha Sonam Kapoor official song", "hookStartSec": 40, "energy": 10},
    {"title": "Sauda Khara Khara", "artist": "Diljit Dosanjh, Sukhbir, Dhvani Bhanushali", "year": "2019", "query": "Sauda Khara Khara Good Newwz Akshay Kumar Kareena Kapoor", "hookStartSec": 45, "energy": 10},
    {"title": "Morni Banke", "artist": "Guru Randhawa, Neha Kakkar", "year": "2018", "query": "Morni Banke Badhaai Ho Ayushmann Khurrana Sanya Malhotra", "hookStartSec": 35, "energy": 10},
    {"title": "Kudi Nu Nachne De", "artist": "Vishal Dadlani, Sachin-Jigar", "year": "2020", "query": "Kudi Nu Nachne De Angrezi Medium official video song", "hookStartSec": 35, "energy": 9},

    # 15. More Top Gujarati Garba & Raas Classics
    {"title": "Maa No Garbo Re", "artist": "Kinjal Dave", "year": "2019", "query": "Maa No Garbo Re Kinjal Dave official video", "hookStartSec": 40, "energy": 9},
    {"title": "Tahuko", "artist": "Aishwarya Majmudar", "year": "2021", "query": "Tahuko Aishwarya Majmudar official video garba", "hookStartSec": 35, "energy": 10},
    {"title": "Kesariyo Rang Tane Lagyo", "artist": "Kirtidan Gadhvi", "year": "2021", "query": "Kesariyo Rang Tane Lagyo Kirtidan Gadhvi garba", "hookStartSec": 40, "energy": 10},
    {"title": "Lal Lal Chundadi", "artist": "Geeta Rabari", "year": "2020", "query": "Lal Lal Chundadi Geeta Rabari official video", "hookStartSec": 40, "energy": 9},
    {"title": "Ambe Maa No Rath", "artist": "Kinjal Dave", "year": "2021", "query": "Ambe Maa No Rath Kinjal Dave official video garba", "hookStartSec": 35, "energy": 10},
    {"title": "Jai Kanhaiya Lal Ki", "artist": "Kirtidan Gadhvi", "year": "2022", "query": "Jai Kanhaiya Lal Ki Kirtidan Gadhvi official garba", "hookStartSec": 40, "energy": 10},
    {"title": "Khodiyar Maa Nu Madhad", "artist": "Geeta Rabari", "year": "2021", "query": "Khodiyar Maa Nu Madhad Geeta Rabari official video", "hookStartSec": 40, "energy": 9},
    {"title": "Kukda Tari Boli", "artist": "Aditya Gadhvi", "year": "2022", "query": "Kukda Tari Boli Aditya Gadhvi official video", "hookStartSec": 35, "energy": 9},
    {"title": "Jogni Maa No Garbo", "artist": "Pravin Luni", "year": "2021", "query": "Jogni Maa No Garbo Pravin Luni official video", "hookStartSec": 40, "energy": 10},
    {"title": "Bhai Ni Bhabhi Latakmatak", "artist": "Kinjal Dave", "year": "2019", "query": "Bhai Ni Bhabhi Latakmatak Kinjal Dave official video", "hookStartSec": 35, "energy": 10},
    {"title": "Mara Ghat Ma Birajta Shrinathji", "artist": "Hemant Chauhan", "year": "1999", "query": "Mara Ghat Ma Birajta Shrinathji Hemant Chauhan", "hookStartSec": 45, "energy": 9},
    {"title": "Vishwambhari Stuti", "artist": "Hemant Chauhan", "year": "1998", "query": "Vishwambhari Stuti Hemant Chauhan garba stuti", "hookStartSec": 45, "energy": 9},
    {"title": "Aaso Maso Sharadpunam", "artist": "Falguni Pathak", "year": "2019", "query": "Aaso Maso Sharadpunam Ni Raat Falguni Pathak", "hookStartSec": 40, "energy": 9},
    {"title": "Radhe Govind", "artist": "Alpa Patel", "year": "2021", "query": "Radhe Govind Alpa Patel official garba", "hookStartSec": 35, "energy": 9},
    {"title": "Chehar Maa No Dakla", "artist": "Pravin Luni", "year": "2021", "query": "Chehar Maa No Dakla Pravin Luni official video", "hookStartSec": 40, "energy": 10},
    {"title": "Sikotar Maa No Dakla", "artist": "Pravin Luni", "year": "2021", "query": "Sikotar Maa No Dakla Pravin Luni official video", "hookStartSec": 40, "energy": 10},
    {"title": "Mojila Mama", "artist": "Jignesh Kaviraj", "year": "2020", "query": "Mojila Mama Jignesh Kaviraj official video", "hookStartSec": 35, "energy": 10},
    {"title": "Kanha Ne Mankan Bhave", "artist": "Kinjal Dave", "year": "2021", "query": "Kanha Ne Mankan Bhave Kinjal Dave official", "hookStartSec": 35, "energy": 9},
    {"title": "Ek Vaar Bhole Bhandari", "artist": "Kirtidan Gadhvi", "year": "2020", "query": "Ek Vaar Bhole Bhandari Kirtidan Gadhvi official", "hookStartSec": 45, "energy": 10},
    {"title": "Choti Choti Gaiya Chote Chote Gwal", "artist": "Garba Raas", "year": "2020", "query": "Choti Choti Gaiya Chote Chote Gwal garba raas mix", "hookStartSec": 35, "energy": 9},
    {"title": "Yashomati Maiya Se Bole Nandlala", "artist": "Garba Raas", "year": "2021", "query": "Yashomati Maiya Se Bole Nandlala garba remix", "hookStartSec": 35, "energy": 9},
    {"title": "Wo Kisna Hai", "artist": "Sukhwinder Singh", "year": "2005", "query": "Wo Kisna Hai Kisna Vivek Oberoi official song", "hookStartSec": 45, "energy": 10},
    {"title": "Banna Banni", "artist": "Gujarati Wedding Folk", "year": "2020", "query": "Banna Banni Gujarati wedding folk song dance", "hookStartSec": 40, "energy": 9},
    {"title": "Saajan Saajan", "artist": "Gujarati Wedding Dance", "year": "2021", "query": "Saajan Saajan Gujarati wedding dance song", "hookStartSec": 35, "energy": 9},
    {"title": "Baari Barsi", "artist": "Wedding Dance", "year": "2019", "query": "Baari Barsi Band Baaja Baaraat wedding dance", "hookStartSec": 40, "energy": 10},
    {"title": "Dhol Jageero Da", "artist": "Panjabi MC", "year": "2001", "query": "Dhol Jageero Da Panjabi MC official video", "hookStartSec": 35, "energy": 10},
    {"title": "Gud Naal Ishq Mitha", "artist": "Navraj Hans, Harshdeep Kaur", "year": "2019", "query": "Gud Naal Ishq Mitha Ek Ladki Ko Dekha Toh Aisa Laga Anil Kapoor Sonam", "hookStartSec": 40, "energy": 10},
    {"title": "Mataji Na Garba", "artist": "Praful Dave", "year": "1997", "query": "Mataji Na Garba Praful Dave nonstop", "hookStartSec": 40, "energy": 9},
    {"title": "Rumjum Pagla Devi Aavya", "artist": "Traditional Garba", "year": "2019", "query": "Rumjum Pagla Devi Aavya garba official", "hookStartSec": 40, "energy": 9},
    {"title": "He Ranglo Jameyo Kalindi Ne Ghat", "artist": "Traditional Garba", "year": "2018", "query": "Ranglo Jameyo Kalindi Ne Ghat garba song", "hookStartSec": 35, "energy": 9},
    {"title": "Hast Milap", "artist": "Gujarati Wedding Dance", "year": "2021", "query": "Hast Milap Gujarati lagna geet wedding dance", "hookStartSec": 40, "energy": 9},
    {"title": "Mangal Fera", "artist": "Gujarati Wedding Festive", "year": "2020", "query": "Mangal Fera Gujarati lagna geet wedding festive", "hookStartSec": 40, "energy": 9},
    {"title": "Pratham Shree Ganesh Garba", "artist": "Hemant Chauhan", "year": "1998", "query": "Pratham Shree Ganesh Hemant Chauhan garba stuti", "hookStartSec": 45, "energy": 9},
    {"title": "Maa Mogal No Bhediyo", "artist": "Aditya Gadhvi", "year": "2021", "query": "Maa Mogal No Bhediyo Aditya Gadhvi official video", "hookStartSec": 40, "energy": 10},
    {"title": "Rann Ma Rang", "artist": "Aditya Gadhvi", "year": "2022", "query": "Rann Ma Rang Aditya Gadhvi official music video", "hookStartSec": 35, "energy": 9},
    {"title": "Chalo Pela Bambore Gadh Jaiye", "artist": "Kirtidan Gadhvi", "year": "2021", "query": "Chalo Pela Bambore Gadh Jaiye Kirtidan Gadhvi", "hookStartSec": 40, "energy": 9},
    {"title": "Shree Krishna Sharanam Mamah", "artist": "Hemant Chauhan", "year": "1997", "query": "Shree Krishna Sharanam Mamah Hemant Chauhan dhun", "hookStartSec": 40, "energy": 9},
    {"title": "Aankh No Afini", "artist": "Jigardan Gadhavi", "year": "2020", "query": "Tari Aankh No Afini Jigardan Gadhavi official video", "hookStartSec": 45, "energy": 9},
    {"title": "Kaan Tari Morli Re", "artist": "Parthiv Gohil", "year": "2021", "query": "Kaan Tari Morli Re Parthiv Gohil official garba", "hookStartSec": 35, "energy": 9},
    {"title": "Najar Na Lage", "artist": "Sachin-Jigar", "year": "2022", "query": "Najar Na Lage Sachin Jigar official video song", "hookStartSec": 40, "energy": 9},
    {"title": "Bapa Sitaram Garba", "artist": "Kirtidan Gadhvi", "year": "2021", "query": "Bapa Sitaram dhun garba Kirtidan Gadhvi", "hookStartSec": 40, "energy": 9},
    {"title": "Jignesh Kaviraj DJ Garba", "artist": "Jignesh Kaviraj", "year": "2020", "query": "Jignesh Kaviraj DJ Garba nonstop official", "hookStartSec": 35, "energy": 10},
    {"title": "Kinjal Dave DJ Garba", "artist": "Kinjal Dave", "year": "2021", "query": "Kinjal Dave DJ Garba nonstop official video", "hookStartSec": 40, "energy": 10},
    {"title": "Geeta Rabari Nonstop Garba", "artist": "Geeta Rabari", "year": "2022", "query": "Geeta Rabari Nonstop Garba official video", "hookStartSec": 40, "energy": 10},
    {"title": "Falguni Pathak Nonstop Raas", "artist": "Falguni Pathak", "year": "2021", "query": "Falguni Pathak Nonstop Raas Garba official", "hookStartSec": 40, "energy": 10},
    {"title": "Atul Purohit Nonstop United Way", "artist": "Atul Purohit", "year": "2022", "query": "Atul Purohit Nonstop Garba United Way Baroda", "hookStartSec": 45, "energy": 10},
    {"title": "Kirtidan Gadhvi Tahukar Nonstop", "artist": "Kirtidan Gadhvi", "year": "2022", "query": "Kirtidan Gadhvi Tahukar Nonstop Garba official", "hookStartSec": 40, "energy": 10},
    {"title": "He Mari Ambe Maa Nonstop", "artist": "Hemant Chauhan", "year": "2000", "query": "He Mari Ambe Maa Nonstop Garba Hemant Chauhan", "hookStartSec": 40, "energy": 9},
    {"title": "Pankhida Nonstop Dandiya", "artist": "Aditya Gadhvi", "year": "2023", "query": "Pankhida Dandiya Raas Aditya Gadhvi live", "hookStartSec": 35, "energy": 10},
    {"title": "Chogada Nonstop Garba", "artist": "Darshan Raval", "year": "2021", "query": "Chogada Nonstop Garba Darshan Raval live", "hookStartSec": 40, "energy": 10},
]

BLACKLIST = {
    'BddP6PYo2gs', '7PCkvCPvDXk', 'vX2cDW8LUWk', 'VAdGW7QDJUI', 'V7LwfY5U5WI',
    'CZt-rVn2BJs', 'Gr8G_ldltDE', 'GftlBD-Apu8', 'k_WdQe_6k4g'
}

ydl_opts = {
    'quiet': True,
    'skip_download': True,
    'extract_flat': True,
    'no_warnings': True,
}

def verify_oembed(vid):
    if not vid or len(vid) != 11 or vid in BLACKLIST:
        return False
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return r.status == 200
    except Exception:
        return False

def resolve_candidate(item):
    query = item['query']
    hook_start = int(item['hookStartSec'])
    hook_end = hook_start + 40
    energy = int(item['energy'])
    year = str(item['year'])
    title = item['title']
    artist = item['artist']

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(f"ytsearch3:{query}", download=False)
            if res and 'entries' in res and res['entries']:
                for entry in res['entries']:
                    vid = entry.get('id')
                    if not vid or len(vid) != 11 or vid in BLACKLIST:
                        continue
                    if verify_oembed(vid):
                        dur = int(entry.get('duration') or 240)
                        if dur < 100 or dur > 500:
                            dur = 240
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
    except Exception as e:
        print(f"Error resolving {title}: {e}")
    return None

def main():
    print(f"Starting resolution for {len(CANDIDATES)} candidates...")
    results = []
    seen_vids = set()

    # Use ThreadPoolExecutor to run concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        future_to_song = {executor.submit(resolve_candidate, c): c for c in CANDIDATES}
        completed = 0
        for future in concurrent.futures.as_completed(future_to_song):
            completed += 1
            res = future.result()
            if res and res['videoId'] not in seen_vids:
                seen_vids.add(res['videoId'])
                results.append(res)
                print(f"[{completed}/{len(CANDIDATES)}] SUCCESS: {res['title']} -> {res['videoId']} (total valid: {len(results)})")
            else:
                c = future_to_song[future]
                print(f"[{completed}/{len(CANDIDATES)}] FAILED or DUP: {c['title']}")

    print(f"\nFinished resolution! Total valid songs: {len(results)}")
    if len(results) < 130:
        print(f"WARNING: Got {len(results)} songs, less than required 130!")
    else:
        print(f"GREAT: Reached {len(results)} songs (>= 130 required).")

    # Output directory and file
    out_dir = r"C:\Users\itzra\.gemini\antigravity\scratch\NOVA-DJ-REMIXER\scripts\curated_batches_200"
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "agent_6.json")

    payload = {
        "gujarati-garba": results
    }

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(results)} songs to {out_file}")

if __name__ == "__main__":
    main()
