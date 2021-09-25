DROP TABLE IF EXISTS usr;
DROP TABLE IF EXISTS resource;

CREATE TABLE usr(
   usrID SERIAL PRIMARY KEY,
   name VARCHAR(50),
   email VARCHAR(50) UNIQUE
);

CREATE TABLE resource(
    resourceID SERIAL PRIMARY KEY,
    name VARCHAR (100),
    category VARCHAR(50)
);

INSERT INTO usr (name, email) VALUES
('user1', 'user1@test.se'), ('user2', 'user2@test.se');

INSERT INTO resource (name, category) VALUES
    ('Potatoes', 'Food'), ('Tent', 'Gear');

