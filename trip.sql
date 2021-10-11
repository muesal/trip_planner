DROP TABLE IF EXISTS
    message, chat, topic, field, section, item,
    form, participates, trip, kindItem, kind, friend, usr;

------------------------------------------------------------------------------------------------------------------------
-- Create all tables
------------------------------------------------------------------------------------------------------------------------
CREATE TABLE usr (
    usrID    SERIAL PRIMARY KEY,
    name     VARCHAR(50),
    email    VARCHAR(50) UNIQUE,
    password VARCHAR(50) UNIQUE
);

CREATE TABLE friend (
    usrID1 INTEGER REFERENCES usr (usrID) ON DELETE CASCADE,
    usrID2 INTEGER REFERENCES usr (usrID) ON DELETE CASCADE
);

-- tables for trips and forms
CREATE TABLE kind (
    kindID INTEGER PRIMARY KEY,
    name   VARCHAR(50)
);

CREATE TABLE kindItem (
    kindID   INTEGER REFERENCES kind ON DELETE CASCADE,
    name     VARCHAR(50),
    UNIQUE (kindID, name)
); -- maybe add cardinality to sort them?
-- maybe add quantity. Maybe quantity per day / per person: calculate in create_trip

CREATE TABLE trip (
    tripID     SERIAL PRIMARY KEY,
    usrID      INTEGER REFERENCES usr,
    kindID     VARCHAR(50),
    start_date DATE,
    duration   INTEGER CHECK (duration > 0),
    location   VARCHAR(50)
);

CREATE TABLE participates (
  tripID INTEGER REFERENCES trip ON DELETE CASCADE,
  usrID  INTEGER REFERENCES usr ON DELETE CASCADE
);

CREATE TABLE form (
    formID    SERIAL PRIMARY KEY,
    tripID    INTEGER REFERENCES trip ON DELETE CASCADE,
    name      VARCHAR(59),
    dayOfTrip INTEGER
);

CREATE TABLE item (
    itemID   SERIAL PRIMARY KEY,
    name     VARCHAR(100),
    quantity INTEGER CHECK (quantity > 0)
);

CREATE TABLE section (
    sectionID SERIAL PRIMARY KEY,
    name      VARCHAR(100)
);

CREATE TABLE field (
    fieldID     SERIAL PRIMARY KEY,
    formID      INTEGER REFERENCES form ON DELETE CASCADE,
    itemID      INTEGER REFERENCES item,
    sectionID   INTEGER REFERENCES section,
    usrID       INTEGER REFERENCES usr
);

-- tables for the chat
CREATE TABLE topic (
    topicID INTEGER PRIMARY KEY,
    name    VARCHAR(50)
);

CREATE TABLE chat (
    chatID  SERIAL PRIMARY KEY,
    name    VARCHAR(50),
    topicID INTEGER REFERENCES topic,
    tripID  INTEGER REFERENCES trip ON DELETE CASCADE,
    UNIQUE (topicID, tripID)
);

CREATE TABLE message (
    messageID SERIAL PRIMARY KEY,
    text      TEXT,
    usrID     INTEGER REFERENCES usr ON DELETE CASCADE,
    date      timestamp,
    chatID    INTEGER REFERENCES chat ON DELETE CASCADE
);

------------------------------------------------------------------------------------------------------------------------
-- Create functions
------------------------------------------------------------------------------------------------------------------------
-- create trip with given data, add its forms, default fields, and chats
CREATE OR REPLACE FUNCTION create_trip (usr int, kind int, start_date DATE,
    duration int, location char ) returns int AS $$
DECLARE
    trip INTEGER;
    form INTEGER;
    item INTEGER;
    i record;
    t record;
BEGIN

    -- create trip
    INSERT INTO trip (usrID, kindID, start_date, duration, location) VALUES
        (usr, kind, start_date, duration, location) RETURNING tripID INTO trip;

    -- create general form
    INSERT INTO form (tripID, name, dayOfTrip) VALUES
        (trip, 'General', 0) RETURNING formID INTO form;

    -- add its fields
    FOR i IN SELECT name FROM  kindItem WHERE kindID = kind
    loop
        INSERT INTO item (name, quantity) VALUES (i.name, 1) RETURNING itemID INTO item;
        INSERT INTO field (formID, itemID) VALUES (form, item);
    END loop;

    -- create forms for every day
    FOR day in 1..duration loop
        INSERT INTO form (tripID, name, dayOfTrip) VALUES
            (trip, 'Breakfast', day), (trip, 'Lunch', day),
            (trip, 'Dinner', day), (trip, 'Night', day), (trip, 'Other', day);
    END loop;

    -- create chats
    FOR t IN SELECT topicID, name FROM  topic ORDER BY topicID
    loop
        INSERT INTO chat (name, topicID, tripID) VALUES (t.name, t.topicID, trip);
    END loop;

    -- return id of the created trip
    RETURN trip;
END;
$$ LANGUAGE plpgsql;


------------------------------------------------------------------------------------------------------------------------
-- Insert default data (kind, kindItem, section, topic)
------------------------------------------------------------------------------------------------------------------------
INSERT INTO kind (kindID, name) VALUES (1, 'hiking'), (2, 'climbing');

INSERT INTO kindItem (kindID, name) VALUES
    (1, 'tent'), (1, 'sleeping bag'), (1, 'matches'),
    (2, 'helmet'), (2, 'magnesium'), (2, 'harness'), (2, 'rope');

INSERT INTO topic (topicID, name) VALUES (1, 'General'), (2, 'Transport'), (3, 'Food');

-- todo: insert into section.

-- create two users, which are friends, user1 creates a hiking trip.
CREATE OR REPLACE FUNCTION insert_data () returns void AS $$
    INSERT INTO usr (name, email, password) VALUES
        ('user1', 'user1@testmail.com', '123456789'),
        ('user2', 'user2@testmail.com', '987654321');

    INSERT INTO friend (usrID1, usrID2) VALUES (1, 2);

    -- user 1 creates a hiking trip starting today with a duration of 3 days, in umea
    SELECT create_trip (1, 1, current_date, 3, 'Umea');

    INSERT INTO participates (tripID, usrID) VALUES (1, 1), (1, 2);

$$ LANGUAGE SQL;




