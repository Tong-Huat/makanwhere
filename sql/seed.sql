INSERT INTO cuisines (cuisine) VALUES ('Chinese'),('Western'),('Korean'),('Japanese'),('Vietnamese'),('Thai'),('Middle East'),('Others');


INSERT INTO users (username, password, contact, email) VALUES ('Tonghuat', 'ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413', '93874721', 'tonghuat86@gmail.com'), ('Alina', 'ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413', '93874722', 'alina@gmail.com'),('Adam', 'ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413', '93874723', 'adam@gmail.com');

-- INSERT INTO establishments_ratings (establishment_id, user_id, rating) VALUES (1,1,5),(2,3,3),(3,2,3);

INSERT INTO comments (establishment_id, user_id, comment) VALUES (1,1,'Food was nice'),(2,3,'Food is ok but place is noisy'),(3,2,'Avg food, expected something better.');

INSERT INTO establishments_cuisines (establishment_id, cuisine_id) VALUES (1,1),(2,2),(3,1);

INSERT INTO establishments (name, address, area, cuisine, contact, email, user_id) VALUES ('Tang Tea House (Jurong West)','414 Jurong West St 42 #01-783 Singapore 640414','Jurong','Chinese','64932522','http://www.tangteahouse.com/','1'),
('Makan Fix','Gallop Kranji Farm Resort Kranji','Kranji, Woodgrove','Western','87296064','https://www.facebook.com/MakanFix/','3'),
('Penang Culture','50 Jurong Gateway Road #04-27 Singapore 608549','Jurong','Chinese','65467793','https://halalfoodhunt.com/listing/places/www.penangculture.com.sg','2'),
('Positano Risto @ RP','49 Circular Road, Raffles Place, Singapore 049404','Raffles Place, Cecil, Marina','Others','62358010','https://halalfoodhunt.com/listing/places/positano.com','1'),
('The Buffet Restaurant','81 Anson Road Singapore 079908','Anson, Tanjong Pagar','Chinese','62241133','https://www.millenniumhotels.com/en/singapore/m-hotel-singapore/the-buffet-restaurant/m','1'),
('Atrium Restaurant','317 Outram Road, Singapore 169075','Queenstown, Tiong Bahru, Telok Blangah, Harbourfront','Others','31382530','https://singaporeatrium.holidayinn.com/Atrium-Buffet-Restaurant','1'),
('Pham Quyen', '6 Clementi Road #01-02 129741','Pasir Panjang, Hong Leong Garden, Clementi New Town','Vietnamese','87420433','https://take.app/a/pqdragons','1'),
('Jinjja Chicken (The Clementi Mall)', '#B1-28/29, 3155 Commonwealth Ave W, Singapore 129588','Pasir Panjang, Hong Leong Garden, Clementi New Town','Korean','87420433','http://www.jinjjachicken.com/','1'),
('Santap', '16 Madras Street Singapore 2084136','Little India','Middle East','87680460','https://www.santap.sg/','1'),
('Sora Boru', '313 Orchard Road #B3-19/20 Singapore 238895','Orchard, Cairnhill, River Valley','Japanese','87673845','https://www.facebook.com/SoraBoruSingapore/','1'),
('Springleaf Prata Place', '396, Upper Bukit Timah Road, Singapore 678048','Ardmore, Bukit Timah, Holland Road, Tanglin','Others','90196279','www.spplace.com','1'),
('Fatburger & Buffalo Wings (Novena Square)', '238 Thomson Road, #01-08/09, Singapore 307683','Watten Estate, Novena, Thomson','Western','97112349','https://www.fatburgersg.com/','1'),
('Warong Kim Seafood', '31 Ah Hood Road, Singapore 329979','Balestier, Toa Payoh, Serangoon, Macpherson, Braddell','Chinese','65836488','http://www.warongkims.com','1'),
('Jom Chic-kata', '810 Geylang Road, City Plaza, #01-K2','Geylang, Eunos, Katong, Joo Chiat, Amber Road','Thai','87499679','https://www.facebook.com/jomchickata/','1'),
('The Halal Corner (Bedok)', 'Blk 527 Bedok North Street 3 #01-500','Bedok, Upper East Coast, Eastwood, Kew Drive','Western','81982851','https://www.facebook.com/thehalalcornersg','1'),
('Mama Don', '820 Tampines St 81 #01-526 Singapore 520820','Loyang, Changi, Tampines, Pasir Ris','Japanese','84841111','http://bit.ly/mamadonorders','1'),
('Good Bites','5 Bishan Street 14 #03-01,Singapore 579783','Bishan, Ang Mo Kio','Western','69700233','https://www.goodbites.com.sg/','1'),
('West Coz Cafe @ Yew Tee','
21 Choa Chu Kang North 6, #01-28, Singapore 689578','Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang','Chinese','67791303','http://p2e.com.sg/','1'),
('Mr Uncle','1024 Sembawang Road Singapore 758498','Upper Thomson, Springleaf, Yishun, Sembawang','Others','69884888','https://www.facebook.com/mruncle.sg/','1'),
('My Kampung','33 Sengkang West Ave #B2-07, Seletar Mall, Singapore 797653','Seletar','Chinese',' 65556992','https://www.facebookhttps://yukeegroup.com.sg/','1');