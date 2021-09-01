INSERT INTO cuisines (cuisine) VALUES ('Chinese'),('Western'),('Korean'),('Japanese'),('Vietnamese'),('Thai'),('Middle East'),('Others');


INSERT INTO users (username, password, contact, email) VALUES ('Tonghuat', 'ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413', '93874721', 'tonghuat86@gmail.com'), ('Alina', 'ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413', '93874722', 'alina@gmail.com'),('Adam', 'ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413', '93874723', 'adam@gmail.com');

INSERT INTO establishments_ratings (establishment_id, user_id, rating) VALUES (1,1,5),(2,3,3),(3,2,3);

INSERT INTO comments (establishment_id, user_id, comment) VALUES (1,1,'Food was nice'),(2,3,'Food is ok but place is noisy'),(3,2,'Avg food, expected something better.');

INSERT INTO establishments (name, address, area, cuisine, contact, email, user_id) VALUES ('Tang Tea House (Jurong West)','414 Jurong West St 42 #01-783 Singapore 640414','Jurong','Chinese','64932522','http://www.tangteahouse.com/','1'),
('Makan Fix','Gallop Kranji Farm Resort Kranji','Woodgrove','Western','87296064','https://www.facebook.com/MakanFix/','3'),
('Penang Culture','50 Jurong Gateway Road #04-27 Singapore 608549','Jurong','Chinese','65467793','https://halalfoodhunt.com/listing/places/www.penangculture.com.sg','2');

