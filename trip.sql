DROP TABLE IF EXISTS
    message, chat, topic, field, section,
    form, participates, trip, kindField, kind, friend, usr
    CASCADE;

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

CREATE TABLE section (
    sectionID INTEGER PRIMARY KEY,
    name      VARCHAR(100)
);

CREATE TABLE kindField (
    kindID    INTEGER REFERENCES kind ON DELETE CASCADE,
    name      VARCHAR(50),
    sectionID INTEGER REFERENCES section,
    UNIQUE (kindID, name)
); -- maybe add cardinality to sort them?
-- maybe add quantity. Maybe quantity per day / per person: calculate in create_trip

CREATE TABLE trip (
    tripID     SERIAL PRIMARY KEY,
    usrID      INTEGER REFERENCES usr,
    kindID     INTEGER REFERENCES kind,
    start_date DATE, -- format: YYYYMMDD
    duration   INTEGER CHECK (duration > 0),
    location   VARCHAR(50),
    content    TEXT,
    finished   BOOLEAN
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

CREATE TABLE field (
    fieldID     SERIAL PRIMARY KEY,
    formID      INTEGER REFERENCES form ON DELETE CASCADE,
    name        VARCHAR(100),
    quantity    INTEGER CHECK (quantity > 0),
    sectionID   INTEGER REFERENCES section,
    usrID       INTEGER REFERENCES usr,
    packed      boolean
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
    FOR i IN SELECT name, sectionID FROM  kindField WHERE kindID = kind
    loop
        INSERT INTO field (formID, name, quantity, sectionID, packed) VALUES (form, i.name, 1, i.sectionID, false);
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
-- Insert default data (kind, kindField, section, topic)
------------------------------------------------------------------------------------------------------------------------
INSERT INTO kind (kindID, name) VALUES (1, 'hiking'), (2, 'climbing');

INSERT INTO section (sectionID, name) VALUES (1, 'Gear'), (2, 'Food');

INSERT INTO kindField (kindID, name, sectionID) VALUES
    (1, 'tent', 1), (1, 'sleeping bag',1), (1, 'matches',1),
    (2, 'helmet',1), (2, 'magnesium',1), (2, 'harness',1), (2, 'rope',1);

INSERT INTO topic (topicID, name) VALUES (1, 'General'), (2, 'Transport'), (3, 'Food');

-- create two users, which are friends, user1 creates a hiking trip.
CREATE OR REPLACE FUNCTION insert_data () returns void AS $$
    INSERT INTO usr (name, email, password) VALUES
        ('user1', 'user1@testmail.com', '123456789'),
        ('user2', 'user2@testmail.com', '987654321');

    INSERT INTO friend (usrID1, usrID2) VALUES (1, 2);

    -- user 1 creates a climbing trip starting today with a duration of 3 days, in umea
    SELECT create_trip (1, 2, current_date, 3, 'Umea');

    -- usr1 will bring everything
    UPDATE field SET usrID = 1;

    INSERT INTO participates (tripID, usrID) VALUES (1, 1), (1, 2);

$$ LANGUAGE SQL;