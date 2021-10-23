from flask import Flask, jsonify, request, redirect, url_for
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
import os

load_dotenv()

# get info about the Database from .env
DATABASE = os.getenv('DATABASE')
DATABASE_USERNAME = os.getenv('DATABSE_USERNAME')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')

app = Flask(__name__)

# CORS enables access to the database
CORS(app)


# Get the connection to the database
def connect():
    con = psycopg2.connect(
        database=DATABASE,
        user=DATABASE_USERNAME,
        password=DATABASE_PASSWORD
    )
    return con


@app.route('/')
def home():
    return ''


# Create a new trip.
@app.route('/create-trip', methods=['POST'])
def add_trip():
    con = connect()
    cur = con.cursor()

    user_id = 1  # TODO: get user id
    data = request.form.to_dict()

    cur.execute("SELECT kindID FROM kind WHERE name = %s;", [f"{data['kind']}"])
    cur.execute("SELECT create_trip (%s, %s, %s, TO_DATE(%s,'YYYY/MM/DD'), %s, %s, %s);",
                (f"{data['name']}", user_id, cur.fetchone()[0], f"{data['start']}", f"{data['duration']}",
                 f"{data['location']}", f"{data['content']}"))
    created_trip = cur.fetchone()[0]
    con.commit()

    if created_trip is None:
        cur.close()
        con.close()
        return jsonify(error="Data could not be saved"), 500

    # Add friends to a trip TODO: not tested yet (frontend is missing)
    if data['friends']:
        # build array containing all userIDs
        friends = []
        for friend in data['friends']:
            # get friends id
            cur.execute("SELECT usrID FROM usr WHERE name = %s", [friend])
            f = cur.fetchone()
            friends.append([f[0], created_trip])

        if len(friends) > 0:
            cur.executemany("INSERT INTO participates (usrID, tripID) VALUES (%s, %s)", friends)
            if cur.fetchone() is None:
                cur.close()
                con.close()
                return jsonify(error="Friends could not be added"), 500

    cur.close()
    con.close()
    return redirect('http://localhost:3000/trip/' + str(created_trip), code=200)


# Return 5 soonest trips this user participates in
@app.route('/trips', methods=['GET'])
def get_trips():
    con = connect()
    cur = con.cursor()

    user_id = 1  # TODO: get user id: session['id']?

    cur.execute("SELECT t.tripID, t.name, k.name, t.start_date, t.duration, t.location, t.content "
                "FROM trip t JOIN participates p ON p.usrID = %s AND p.tripID = t.tripID "
                "INNER JOIN kind k ON t.kindID = k.kindID "
                "WHERE t.finished IS NOT False "
                "ORDER BY (t.start_date, t.tripID);",
                [user_id])
    trips = cur.fetchmany(size=5)

    response = []
    counter = 0
    for trip in trips:
        response.insert(counter, {
            'id': trip[0],
            'name': trip[1],
            'kind': trip[2],
            'start': trip[3],
            'duration': trip[4],
            'location': trip[5],
            'content': trip[6],
        })
        counter += 1

    cur.close()
    con.close()
    return jsonify(response)


# Return all kinds 
@app.route('/kinds', methods=['GET'])
def get_kinds():
    con = connect()
    cur = con.cursor()

    cur.execute("SELECT kindID, name FROM kind;")
    kinds = cur.fetchall()

    # If no kinds were found return only 'other'
    if not kinds:
        kinds = [['0', 'other']]
    response = []
    counter = 0
    for kind in kinds:
        response.insert(counter, {
            'id': kind[0],
            'name': kind[1],
        })
        counter += 1

    cur.close()
    con.close()
    return jsonify(response)

# Returns all users 
@app.route('/users', methods=['GET'])
def get_users():
    con = connect()
    cur = con.cursor()

    cur.execute("SELECT usrID, name FROM usr;")
    users = cur.fetchall()

    # If no kinds were found return only 'other'
    if not users:
        users = [['0', 'other']]
    response = []
    counter = 0
    for user in users:
        response.insert(counter, {
            'id': user[0],
            'name': user[1],
        })
        counter += 1

    cur.close()
    con.close()
    return jsonify(response)

# Return all sections
@app.route('/sections', methods=['GET'])
def get_sections():
    con = connect()
    cur = con.cursor()

    cur.execute("SELECT SectionID, name FROM section s;")
    sections = cur.fetchall()

    response = []
    counter = 0
    for section in sections:
        response.insert(counter, {
            'id': section[0],
            'name': section[1],
        })
        counter += 1

    cur.close()
    con.close()
    return jsonify(response)


# return the checklist for the first trip
@app.route('/checklist', methods=['GET'])
def checklist_first():
    con = connect()
    cur = con.cursor()

    user_id = 1  # TODO: userID, hash trip id?

    # Get the id of the first trip of the user
    cur.execute("SELECT t.tripID FROM trip t JOIN participates p ON p.usrID = %s AND p.tripID = t.tripID "
                "WHERE t.finished IS NOT False "
                "ORDER BY (t.start_date, t.tripID) LIMIT 1;",
                [user_id])
    trip = cur.fetchone()

    cur.close()
    con.close()
    if trip is None or not trip:
        return jsonify(error="No unfinished trip found. Try reloading the page."), 400

    return jsonify(trip[0])


# return the checklist to the given trip for that user
@app.route('/checklist/<trip_id>', methods=['GET', 'PUT', 'POST', 'DELETE'])
def checklist(trip_id):
    if trip_id is None:
        return ""

    con = connect()
    cur = con.cursor()

    user_id = 1  # TODO: userID, hash trip id?

    # If the trip does not exist or the user is not participating return error
    cur.execute("SELECT tripID FROM participates WHERE tripID = %s and usrID = %s;", (trip_id, user_id))
    up = cur.fetchall()
    if up is None:
        cur.close()
        con.close()
        return jsonify(error="Trip not found"), 400  # TODO: Differ between trip not found / user not participating?

    if request.method == 'GET':
        # Get all items this user has for this trip, return them
        cur.execute("SELECT i.itemID, i.name, i.quantity, s.name, i.packed"
                    " FROM item i "
                    "INNER JOIN section s ON s.sectionID = i.sectionID "
                    "WHERE tripID = %s AND usrID = %s "
                    "ORDER BY (i.packed);",  # todo: descending or ascending?
                    (trip_id, user_id))
        cl = cur.fetchall()
        response = []
        counter = 0
        for cl in cl:
            response.insert(counter, {
                'itemId': cl[0],
                'name': cl[1],
                'quantity': cl[2],
                'section': cl[3],
                'packed': cl[4]
            })
            counter += 1

    elif request.method == 'PUT':
        # Update the item (name, quantity, section or packed)
        data = request.json['data']

        cur.execute("SELECT name, quantity, sectionID "
                    "FROM item "
                    "WHERE itemID = %s AND usrID = %s AND tripID = %s;",
                    (f"{data['item']}", user_id, trip_id))
        item = cur.fetchone()
        if item is None:
            cur.close()
            con.close()
            return jsonify(error="This item could not be found"), 500  # TODO: error code?

        # check that all fields are correct / filled
        if data['name'] is None:
            data['name'] = item[1]
        if data['quantity'] is None:
            data['quantity'] = item[2]
        else:
            data['quantity'] = int(float(data['quantity']))  # assure that the value is an integer
        if data['packed'] is None:
            data['packed'] = item[2]
        if data['section'] is None:
            data['section'] = item[3]
        else:
            cur.execute("SELECT sectionID FROM section WHERE name = %s;", [data['section']])
            data['section'] = cur.fetchone()[0]  # TODO: this could throw an error, if the name is wrong

        cur.execute("UPDATE item SET (name, quantity, packed, section) = (%s, %s, %s, %s) WHERE itemID = %s "
                    "RETURNING name, quantity, section, packed;",
                    (f"{data['name']}", f"{data['quantity']}", f"{data['packed']}", f"{data['section']}",
                     f"{data['item']}"))
        con.commit()

        it = cur.fetchone()
        response = {
            'id': data['item'],
            'name': it[0],
            'quantity': it[1],
            'section': it[2],
            'packed': it[3]
        }

    elif request.method == 'POST':
        # Insert a new item for this user
        data = request.json['data']

        # check that all fields are correct / filled
        if data['name'] is None:
            data['name'] = 'New Item'
        if data['quantity'] is None:
            data['quantity'] = 1
        else:
            data['quantity'] = int(float(data['quantity']))  # assure that the value is an integer
        if data['section'] is None:
            data['section'] = 1
        else:
            cur.execute("SELECT sectionID FROM section WHERE name = %s;", [data['section']])
            data['section'] = cur.fetchone()[0]  # TODO: this could throw an error, if the name is wrong

        cur.execute(
            "INSERT INTO item (name, quantity, packed, sectionID, usrID, tripID) VALUES (%s, %s, %s, %s, %s, %s) "
            "RETURNING itemID, packed;",
            (f"{data['name']}", f"{data['quantity']}", 'False', f"{data['section']}", user_id, trip_id))
        con.commit()

        it = cur.fetchone()
        response = {
            'id': it[0],
            'name': data['name'],
            'quantity': data['quantity'],
            'section': data['section'],
            'packed': False
        }

    else:  # DELETE
        # Delete the item (for this user)
        data = request.json['data']

        cur.execute("SELECT name, quantity, sectionID "
                    "FROM item "
                    "WHERE itemID = %s AND usrID = %s AND tripID = %s;",
                    (data['id'], user_id, trip_id))
        item = cur.fetchone()
        if item is None:
            cur.close()
            con.close()
            return jsonify(error="This item could not be found"), 500  # TODO: error code?

        cur.execute("SELECT fieldID FROM field WHERE itemID = %s;", [f"{data['item']}"])
        field = cur.fetchone()
        if field is None:
            # Delete the item, if it is a personal item (no respective field)
            cur.execute("DELETE FROM item WHERE itemID = %s RETURNING itemID;", [f"{data['item']}"])
        else:
            # otherwise un-assign the user from this item
            cur.execute("UPDATE field SET assigned = False WHERE fieldID = %s RETURNING fieldID;", (field[0]))
            if cur.fetchone() is not None:
                cur.execute("UPDATE item SET (usrID , packed) = (Null, False) WHERE itemID = %s RETURNING itemID;",
                            f"{data['item']}")
        con.commit()
        it = cur.fetchone()

        cur.close()
        con.close()

        if it is None:
            return jsonify(error="Item could not be deleted"), 500  # TODO: error code?

        return redirect('http://localhost:3000/checklist/' + str(trip_id), code=200)

    cur.close()
    con.close()
    return jsonify(response)


# Edit / see trip
@app.route('/trip/<trip_id>', methods=['GET', 'PUT', 'DELETE'])
def get_trip(trip_id):
    con = connect()
    cur = con.cursor()

    user_id = 1  # TODO: userID

    if request.method == 'GET':
        # TODO: only creator sohuld see 'edit' button
        cur.execute("SELECT t.name, k.name, t.start_date, t.duration, t.location, t.content "
                    "FROM trip t "
                    "INNER JOIN kind k ON t.kindID = k.kindID "
                    "WHERE tripID = %s;",
                    [trip_id])
        trip = cur.fetchone()
        if trip is None:
            cur.close()
            con.close()
            return jsonify(error="This trip does not exist"), 500  # TODO: error code?

        cur.execute("SELECT usrID, name FROM usr WHERE usrID IN (SELECT usrID FROM participates WHERE tripID = %s);",
                    [trip_id])
        f = cur.fetchall()

        friends = {}
        for friend in f:
            friends[friend[0]] = friend[1]

        response = {
            'id': trip_id,
            'name': trip[0],
            'kind': trip[1],
            'start': trip[2],
            'duration': trip[3],
            'location': trip[4],
            'content': trip[5],
            'friends': friends,
        }

    elif request.method == 'PUT':
        data = request.json['data']

        cur.execute("SELECT usrID, name, start_date, duration, location FROM trip WHERE tripID = %s;", [trip_id])
        trip = cur.fetchone()
        if trip is None:
            cur.close()
            con.close()
            return jsonify(error="This trip does not exist"), 500  # TODO: error code?
        if trip[0] != user_id:
            cur.close()
            con.close()
            return jsonify(error="Only the creator of a trip may update it"), 400  # TODO: error code?

        # check that all fields are correct / filled
        if data['name'] is None:
            data['name'] = trip[1]
        if data['start'] is None:
            data['start'] = trip[2]
        if data['location'] is None:
            data['location'] = trip[5]

        cur.execute("UPDATE trip SET (name, start_date, location, content) = (%s, TO_DATE(%s, 'YYYY/MM/DD'), "
                    "%s, %s) WHERE tripID = %s RETURNING start_date, duration, location, content, kindID;",
                    (f"{data['name']}", f"{data['start']}", f"{data['location']}", f"{data['content']}", trip_id))
        con.commit()
        trip = cur.fetchone()

        if trip is None:
            cur.close()
            con.close()
            return jsonify(error="Updated data could not be saved"), 500

        # If the duration changes, the fields of the trip must be adapted
        if data['duration'] is not None:
            data['duration'] = int(float(data['duration']))  # assure that the value is an integer
            duration = int(trip[1])
            if duration != data['duration']:
                if duration > data['duration']:
                    cur.execute("SELECT decrease_duration(%s, %s, %s)", (f"{data['duration']}", duration, trip_id))
                    con.commit()
                    update = cur.fetchone()

                else:  # data['duration'] > duration:
                    cur.execute("SELECT increase_duration(%s, %s, %s)", (f"{data['duration']}", duration, trip_id))
                    con.commit()
                    update = cur.fetchone()

                if update is None:
                    cur.close()
                    con.close()
                    return jsonify(error="Updated data could not be saved"), 500

        # If the kind changed, the fields of the new kind must be added
        if data['kind'] is not None:
            cur.execute("SELECT kindID FROM kind WHERE name = %s;", [f"{data['kind']}"])
            kind = cur.fetchone()
            if kind is not None and kind[0] != trip[4]:
                cur.execute("SELECT set_kind(%s, %s);", (kind, trip_id))
                con.commit()
                update = cur.fetchone()
                if update is None:
                    cur.close()
                    con.close()
                    return jsonify(error="Updated data could not be saved"), 500

        response = {
            'id': trip_id,
            'start': trip[0],
            'duration': trip[1],
            'location': trip[2],
            'description': trip[3],
            'kind': trip[4]
        }

    else:  # DELETE
        cur.execute("SELECT usrID FROM trip WHERE tripID = %s;", [trip_id])
        trip = cur.fetchone()
        if trip is None:
            cur.close()
            con.close()
            return jsonify(error="This trip does not exist"), 500  # TODO: error code?
        if trip[0] != user_id:
            cur.close()
            con.close()
            return jsonify(error="Only the creator of a trip may update it"), 400  # TODO: error code?

        cur.execute("DELETE FROM trip WHERE tripID = %s RETURNING tripID;", [trip_id])
        con.commit()
        trip = cur.fetchone()

        cur.close()
        con.close()
        if trip is None:
            return jsonify(error="Trip could not be deleted"), 500

        return redirect('http://localhost:3000/trips/', code=200)

    cur.close()
    con.close()
    return jsonify(response)


# Get form 
@app.route('/forms/<trip_id>', methods=['GET', 'POST', 'PUT'])
def get_forms(trip_id):
    con = connect()
    cur = con.cursor()

    user_id = 1  # TODO: user ID

    if request.method == 'GET':
        cur.execute("SELECT fo.formID, fo.name, fo.dayOfTrip, fi.fieldID, i.name, i.quantity, s.name, i.usrID, "
                    "i.packed, u.name "
                    "FROM form fo LEFT OUTER  JOIN field fi ON fo.formID = fi.formID "
                    "LEFT OUTER JOIN item i ON i.itemID = fi.itemID "
                    "LEFT OUTER JOIN section s ON s.sectionID = i.sectionID "
                    "LEFT OUTER JOIN usr u ON u.usrID = i.usrID "
                    "WHERE fo.tripID = %s "
                    "ORDER BY fo.formID, fo.formID, fi.fieldID;",
                    [trip_id])

        forms = cur.fetchall()
        if forms is None:
            cur.close()
            con.close()
            return jsonify(error="No forms found for this trip"), 500

        response = []
        counter = 0
        for form in forms:
            response.insert(counter, {
                'tripID': trip_id,
                'formID': form[0],
                'formName': form[1],
                'dayOfTrip': form[2],
                'fieldID': form[3],
                'fieldName': form[4],
                'fieldQuantity': form[5],
                'sectionName': form[6],
                'fieldUsrID': form[7],
                'fieldPacked': form[8],
                'fieldUsrName': form[9]
            })
            counter += 1

    elif request.method == 'POST': 

        data = request.json['fieldData']

        cur.execute("SELECT sectionID FROM section WHERE name = %s;", [f"{data['section']}"])
        cur.execute("SELECT add_field(%s, %s, %s, %s, %s)",
                    (f"{data['formID']}", f"{data['name']}", f"{data['quantity']}", cur.fetchone()[0], trip_id))
        con.commit()

        fld = cur.fetchone()
        response = {
            'fieldID': fld[0]
        }

    else:  # PUT

        data = request.json['assignData']
        
        if 'userID' not in  data :
            data['userID'] = None

        cur.execute("SELECT assign_field(%s, %s)",
                    (data['userID'], f"{data['fieldID']}"))
        con.commit()

        response = {
            'ok': "OK"
        }

    cur.close()
    con.close()
    return jsonify(response)


# GET / Update / Delete the account of the user
@app.route('/account', methods=['GET', 'PUT', 'DELETE'])
def profile():
    con = connect()
    cur = con.cursor()

    user_id = 1  # TODO: userID, hash trip id?

    # If the trip does not exist or the user is not participating return error
    cur.execute("SELECT name, email FROM usr WHERE usrID = %s;", [user_id])
    user = cur.fetchall()
    if user is None:
        cur.close()
        con.close()
        return jsonify(error="User not found"), 400

    # Get all friends TODO: as sql function
    cur.execute("SELECT usrID1, u.name "
                "FROM friend f "
                "JOIN usr u ON u.userID = f.userID1 "
                "WHERE userID2 = %s "
                "UNION "
                "SELECT usrID2, u.name "
                "FROM friend f "
                "JOIN usr u ON u.userID = f.userID21 "
                "WHERE userID1 = %s;",
                [user_id])
    f = cur.fetchall()

    friends = {}
    for friend in f:
        friends[friend[0]] = friend[1]

    if request.method == 'GET':
        response = {
            'userId': user[0],
            'name': user[1],
            'email': user[2],
            'friends': friends
        }

    elif request.method == 'PUT':
        # Update the user (name, email, password?)
        data = request.json['data']

        # check that all fields are correct / filled
        if data['name'] is None:
            data['name'] = user[0]
        if data['email'] is None:
            data['email'] = user[1]

        # TODO: password?

        cur.execute("UPDATE usr SET (name, email) = (%s, %s) WHERE usrID = %s "
                    "RETURNING name, email;",
                    (f"{data['name']}", f"{data['email']}", user_id))
        con.commit()

        u = cur.fetchone()
        if u is None:
            cur.close()
            con.close()
            return jsonify(error="User could not be updated"), 500

        # TODO: seperate routes add / remove friend would be more efficient...
        # Compare the lists of friends, update the friends of the db
        if data['friends'] is None:
            data['friends'] = {}
        friends_old = set(friends)
        friends_new = set(data['friends'])
        f = []
        for friend in friends_old - friends_new:
            # delete those friends
            f.append([user_id, friend, friend, user_id])
            cur.executemany("DELETE FROM friend WHERE (usrid1 = %s AND usrID2 = %s) OR (usrid1 = %s AND usrID2 = %s)",
                            f)
            con.commit()
            if cur.fetchone() is None:
                cur.close()
                con.close()
                return jsonify(error="Friends could not be deleted"), 500

        f = []
        for friend in friends_new - friends_old:
            # insert those friends
            f.append([user_id, friend])
            cur.executemany("INSERT INTO friend (useID1, usrID2) VALUES (%s, %s)", f)
            con.commit()
            if cur.fetchone() is None:
                cur.close()
                con.close()
                return jsonify(error="Friends could not be added"), 500

        response = {
            'id': user_id,
            'name': u[0],
            'email': u[1],
            'friends': friends_new
        }

    else:  # DELETE
        # Delete the user

        # delete user
        cur.execute("SELECT delete_usr(%s);", [user_id])
        con.commit()
        u = cur.fetchone()

        cur.close()
        con.close()

        if u is None:
            return jsonify(error="User could not be deleted"), 500  # TODO: error code?

        return redirect('http://localhost:3000/', code=200)

    cur.close()
    con.close()
    return jsonify(response)
