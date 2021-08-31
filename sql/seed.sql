INSERT INTO cuisines (cuisine) VALUES ('Chinese'),('Western'),('Korean'),('Japanese'),('Vietnamese'),('Thai'),('Middle East'),('Others');
-- INSERT INTO establishments (name, address, zone, cuisine_id, rating, contact, can_reserve, email, user_id) VALUES ()

INSERT INTO users (username, password, contact, email) VALUES ('Tonghuat', '123456', '93874721', 'tonghuat86@gmail.com'), ('Alina', '123456', '93874722', 'alina@gmail.com'),('Adam', '123456', '93874723', 'adam@gmail.com');

INSERT INTO establishments_ratings (establishment_id, user_id, rating) VALUES (1,1,5),(2,3,3),(3,2,3);

INSERT INTO comments (establishment_id, user_id, comment) VALUES (1,1,'Food was nice'),(2,3,'Food is ok but place is noisy'),(3,2,'Avg food, expected something better.');

