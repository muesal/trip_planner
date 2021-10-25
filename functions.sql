------------------------------------------------------------------------------------------------------------------------
-- Create functions
------------------------------------------------------------------------------------------------------------------------
-- create trip with given data, add its forms, default fields, and chats
CREATE OR REPLACE FUNCTION create_trip (trip_name varchar(50), usr int, kind int, start_date DATE,
    duration int, location char, content TEXT ) returns int AS $$
DECLARE
    trip INTEGER;
    form INTEGER;
    i record;
    t record;
BEGIN

    -- create trip
    INSERT INTO trip (name, usrID, kindID, start_date, duration, location, content) VALUES
        (trip_name, usr, kind, start_date, duration, location, content) RETURNING tripID INTO trip;

    -- create general form
    INSERT INTO form (tripID, name, dayOfTrip) VALUES
        (trip, 'General', 0) RETURNING formID INTO form;

    -- add its fields
    PERFORM set_kind(kind, trip);

    -- create forms for every day
    PERFORM increase_duration (duration, 0, trip);

    -- create chats
    FOR t IN SELECT topicID, name FROM  topic ORDER BY topicID
    loop
        INSERT INTO chat (name, topicID, tripID) VALUES (t.name, t.topicID, trip);
    END loop;

    -- creator participates in the trip
    INSERT INTO participates (usrID, tripID) VALUES (usr, trip);

    -- return id of the created trip
    RETURN trip;
END;
$$ LANGUAGE plpgsql;

-- Function that deletes forms if the duration of a trip is decreased
CREATE OR REPLACE FUNCTION decrease_duration (duration_new int, duration_old int, trp int) returns void AS $$
DECLARE
    frm INTEGER;
BEGIN
    FOR day in duration_new + 1..duration_old loop
        for frm in SELECT formID FROM form WHERE tripID = trp and dayOfTrip = day loop
            DELETE FROM item WHERE itemID IN (SELECT fieldID FROM field WHERE formID = frm); -- TODO: after merge with checklist
            DELETE FROM form WHERE formID = frm;
        END loop;
    END loop;
    UPDATE trip SET duration = duration_new WHERE tripID = trp;
END;
$$ LANGUAGE plpgsql;

-- Function that adds forms for every day that gets added
CREATE OR REPLACE FUNCTION increase_duration (duration_new int, duration_old int, trp int) returns void AS $$
BEGIN
    FOR day in (duration_old+1)..duration_new loop
        INSERT INTO form (tripID, name, dayOfTrip) VALUES
            (trp, 'Breakfast', day), (trp, 'Lunch', day),
            (trp, 'Dinner', day), (trp, 'Night', day);
    END loop;
    UPDATE trip SET duration = duration_new WHERE tripID = trp;
END;
$$ LANGUAGE plpgsql;

-- Insert the generic fields (with items) to the general form of the trip
CREATE OR REPLACE FUNCTION set_kind (knd int, trp int) returns void AS $$
DECLARE
    i record;
    frm INTEGER;
    itm INTEGER;
BEGIN
    SELECT formID FROM form WHERE tripID = trp and dayOfTrip = 0 INTO frm;
    FOR i IN SELECT name, sectionID FROM kindField WHERE kindID = knd loop
       INSERT INTO item (name, quantity, sectionID, packed, tripID) VALUES (i.name, 1, i.sectionID, false, trp)
            RETURNING itemID into itm;
        INSERT INTO field (formID, itemID, assigned) VALUES (frm, itm, false);
    END loop;
    UPDATE trip SET kindID = knd WHERE tripID = trp;
END;
$$ LANGUAGE plpgsql;

-- assign a usr to a field
CREATE OR REPLACE FUNCTION assign_field (usr int, fld int) returns void AS $$
DECLARE
    itm INTEGER;
BEGIN
    UPDATE field SET assigned = TRUE WHERE fieldID = fld RETURNING itemID INTO itm;
    UPDATE item SET (packed, usrID) = (false, usr) WHERE itemID = itm;
END;
$$ LANGUAGE plpgsql;

-- add a field and corresponding item
CREATE OR REPLACE FUNCTION add_field (frm int, name VARCHAR, quant int, section int, trp int)
returns INTEGER AS $$
DECLARE
    itm INTEGER;
    fld INTEGER;
BEGIN
    INSERT INTO item (name, quantity, packed, sectionID, tripID) VALUES (name, quant, False, section, trp)
        RETURNING itemID INTO itm;
    INSERT INTO field (formID, itemID, assigned) VALUES (frm, itm, False) RETURNING fieldID into fld;
    RETURN fld;
END;
$$ LANGUAGE plpgsql;

-- Delete a user. Unset it from all assigned items
CREATE OR REPLACE FUNCTION delete_usr (user_ int) returns void AS $$
DECLARE
    itm INTEGER;
    trp INTEGER;
    trp_u record;
BEGIN
    -- un-assign fields
    FOR itm in SELECT itemID FROM item WHERE usrID = user_ loop
        UPDATE field SET assigned = false WHERE itemID = itm;
        IF FOUND THEN
            UPDATE item SET (usrID, packed) = (Null, False) WHERE itemID = itm;
        end if;
    end loop;


    -- reassign / delete trip
    DELETE FROM participates WHERE usrID = user_;

    FOR trp in SELECT tripID FROM trip WHERE usrID = user_ loop
        SELECT usrID FROM participates WHERE tripID = trp LIMIT 1 INTO trp_u;

        IF NOT FOUND THEN
            DELETE FROM TRIP WHERE tripID = trp;
        ELSE
            UPDATE trip SET usrID = trp_u.usrID WHERE tripID = trp;
        end if;
    end loop;

    DELETE FROM usr WHERE usrID = user_;
END;
$$ LANGUAGE plpgsql;
