DROP TABLE IF EXISTS establishments;
DROP TABLE IF EXISTS cuisines;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS establishments_ratings;
DROP TABLE IF EXISTS comments;

CREATE TABLE IF NOT EXISTS establishments (id SERIAL PRIMARY KEY, name TEXT, address TEXT, zone TEXT, cuisine_id INTEGER, ratings TEXT, contact NUMERIC(8),can_reserve BOOLEAN, email TEXT, user_id INTEGER);

CREATE TABLE IF NOT EXISTS cuisines (id SERIAL PRIMARY KEY, cuisine TEXT);

CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT, password TEXT, contact NUMERIC(8), email TEXT);

CREATE TABLE IF NOT EXISTS establishments_ratings (id SERIAL PRIMARY KEY, establishment_id INTEGER, user_id INTEGER, rating INTEGER);

CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, comment TEXT, establishment_id INTEGER, user_id INTEGER);

--  copying database 
-- \copy establishments from '/users/midzham/desktop/makan.csv' delimiter ',' csv header;


