------------------------------------------------------------------------------------------------------------------------
-- Insert default data (kind, kindField, section, topic)
------------------------------------------------------------------------------------------------------------------------
INSERT INTO kind (kindID, name) VALUES (1, 'hiking'), (2, 'climbing'), (3, 'scubadiving'), (4, 'other');

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
    SELECT create_trip ('Climbing in Umea', 1, 2, current_date, 3, 'Umea', 'A beautiful climbing trip in the famous mountains of Umea City');
    SELECT create_trip ('Scubadiving in Australia', 1, 3, current_date, 7, 'Australia', 'Australian fish are funny so will be this trip');

    -- usr1 brings element 1
    SELECT assign_field(1, 1);

    INSERT INTO participates (tripID, usrID) VALUES (1, 2), (2, 2);

$$ LANGUAGE SQL;

SELECT insert_data();
