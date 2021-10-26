-- noinspection SqlNoDataSourceInspectionForFile

DROP TABLE IF EXISTS
    message, chat, topic, field, item, section,
    form, participates, trip, kindField, kind, friend
    CASCADE;

------------------------------------------------------------------------------------------------------------------------
-- Create all tables
------------------------------------------------------------------------------------------------------------------------
-- CREATE CREATE TABLE IF NOT EXISTS usr (
--    usrID           SERIAL PRIMARY KEY,
--    name            VARCHAR(50) UNIQUE,
--    email           VARCHAR(50) UNIQUE,
--    hashed_password Text,
--    is_active       Boolean,
--    roles           VARCHAR(50)
--);

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
    name       VARCHAR(50),
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
  usrID  INTEGER REFERENCES usr ON DELETE CASCADE,
  UNIQUE (tripID, usrID)
);

CREATE TABLE form (
    formID    SERIAL PRIMARY KEY,
    tripID    INTEGER REFERENCES trip ON DELETE CASCADE,
    name      VARCHAR(59),
    dayOfTrip INTEGER
);

CREATE TABLE item (
    itemID      SERIAL PRIMARY KEY,
    name        VARCHAR(100),
    quantity    INTEGER CHECK (quantity > 0),
    sectionID   INTEGER REFERENCES section,
    usrID       INTEGER REFERENCES usr ON DELETE CASCADE,
    tripID      INTEGER REFERENCES trip ON DELETE CASCADE,
    packed      boolean
);

CREATE TABLE field (
    fieldID     SERIAL PRIMARY KEY,
    formID      INTEGER REFERENCES form ON DELETE CASCADE,
    itemID      INTEGER REFERENCES item ON DELETE CASCADE,
    assigned    BOOLEAN
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
