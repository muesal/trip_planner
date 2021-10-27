from flask import Flask, jsonify, request, redirect, url_for
import flask_praetorian
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required, JWTManager, set_access_cookies
from dotenv import load_dotenv
import psycopg2
import os

from models import db, User

load_dotenv()

# get info about the Database from .env
DATABASE = os.getenv('DATABASE')
DATABASE_USERNAME = os.getenv('DATABASE_USERNAME')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')

app = Flask(__name__)
app.config['SECRET_KEY'] = 'qasdtfzghjbvcftdr567z8uijnhbvgfcdres45r6t7z8u9i0o'
app.config["JWT_SECRET_KEY"] = 'qAWQ3W4E5Ra3w4erdfrt67zughu8z7t6frdesw34e5r6tzughji'
app.config["JWT_TOKEN_LOCATION"] = "cookies"
app.config['JWT_COOKIE_SECURE'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = \
    "postgresql://" + DATABASE_USERNAME + ":" + DATABASE_PASSWORD + "@localhost:5432/" + DATABASE

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, support_credentials=True)
jwt = JWTManager(app)
guard = flask_praetorian.Praetorian()
guard.init_app(app, User)
db.init_app(app)


# Get the connection to the database
def connect():
    con = psycopg2.connect(
        database=DATABASE,
        user=DATABASE_USERNAME,
        password=DATABASE_PASSWORD
    )
    return con


# set up  the database
with app.app_context():
    db.create_all()
    db.session.commit()
    if db.session.query(User.usrid).count() < 1:
        connection = connect()
        cursor = connection.cursor()
        cursor.execute(open("trip.sql", "r").read())
        cursor.execute(open("functions.sql", "r").read())
        cursor.execute(open("insert_data.sql", "r").read())
        connection.commit()
        cursor.close()
        connection.close()


@app.after_request
def middleware_for_response(response):
    # Allowing the credentials in the response.
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route('/')
def home():
    return ''


# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json['data']
    user = guard.authenticate(data['email'], data['password'])
    return {'access_token': guard.encode_jwt_token(user)}, 200


@app.route('/refresh', methods=['POST'])
def refresh():
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    return {'access_token': new_token}, 200


# Logout
@app.route('/logout')
def logout():
    # Unset the user id
    # session.pop('user_id')
    return redirect(url_for('home'), code=200)


# Signin
@app.route('/signin', methods=['POST'])
def signin():
    con = connect()
    cur = con.cursor()
    data = request.json['data']

    # Check if email already in database: must be unique
    cur.execute("SELECT * FROM usr WHERE email = %s;", [f"{data['email']}"])
    email = cur.fetchall()
    if email:
        cur.close()
        con.close()
        return jsonify({'error': "The email already exist."})

    cur.execute("SELECT * FROM usr WHERE name = %s;", [f"{data['username']}"])
    name = cur.fetchall()
    if name:
        cur.close()
        con.close()
        return jsonify({'error': "The username already exist."})

    else:
        cur.execute(
            "INSERT INTO usr (name, email, hashed_password, is_active, roles) VALUES (%s, %s, %s, %s, %s) RETURNING usrID;",
            (f"{data['username']}", f"{data['email']}", f"{guard.hash_password(data['password'])}", "true", "user"))
        con.commit()
    cur.close()
    con.close()

    user = guard.authenticate(data['email'], data['password'])
    return {'access_token': guard.encode_jwt_token(user)}, 200


# Create a new trip.
@app.route('/create-trip', methods=['POST'])
@flask_praetorian.auth_required
def add_trip():
    con = connect()
    cur = con.cursor()

    token = guard.read_token_from_header()
    user_id = guard.extract_jwt_token(token)['id']
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
    if "friends" in data:
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
    return redirect(url_for('trip', trip_id=created_trip), code=200)


# Return 5 soonest trips this user participates in
@app.route('/trips', methods=['GET'])
@flask_praetorian.auth_required
def get_trips():
    con = connect()
    cur = con.cursor()

    token = guard.read_token_from_header()
    user_id = guard.extract_jwt_token(token)['id']

    cur.execute("SELECT t.tripID, t.name, k.name, t.start_date, t.duration, t.location, t.content "
                "FROM trip t JOIN participates p ON p.usrID = %s AND p.tripID = t.tripID "
                "INNER JOIN kind k ON t.kindID = k.kindID "
                "WHERE t.finished IS NOT True "
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

    # If no user were found return only 'none'
    if not users:
        users = [['-1', 'none']]
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


# Returns all users
@app.route('/invite/<trip_id>', methods=['PUT'])
@flask_praetorian.auth_required
def invite_friend(trip_id):
    con = connect()
    cur = con.cursor()

    token = guard.read_token_from_header()
    user_id = guard.extract_jwt_token(token)['id']

    cur.execute("SELECT tripID FROM participates WHERE tripID = %s and usrID = %s;", (trip_id, user_id))
    up = cur.fetchall()
    if up is None:
        cur.close()
        con.close()
        return jsonify(error="Trip not found"), 400

    data = request.json['data']
    if 'email' not in data:
        cur.close()
        con.close()
        return jsonify(error="Please give a valid email address"), 400

    cur.execute("SELECT usrID FROM usr WHERE email = %s", [f"{data['email']}"])
    u = cur.fetchone()
    if u is None:
        cur.close()
        con.close()
        return jsonify(error="Please give a valid email address"), 202

    cur.execute("SELECT tripID FROM participates WHERE tripID = %s and usrID = %s;", (trip_id, u[0]))
    ut = cur.fetchone()
    if ut is not None:
        cur.close()
        con.close()
        return jsonify("User already invited"), 200

    cur.execute("INSERT INTO participates (tripID, usrID) VALUES (%s, %s) RETURNING usrID;", (trip_id, u[0]))
    con.commit()
    u = cur.fetchone()

    cur.close()
    con.close()
    if u is None:
        return jsonify(error="User could not be invited"), 400

    return jsonify("User successfully added to trip"), 200


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
@flask_praetorian.auth_required
def checklist_first():
    con = connect()
    cur = con.cursor()

    token = guard.read_token_from_header()
    user_id = guard.extract_jwt_token(token)['id']

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
@flask_praetorian.auth_required
def checklist(trip_id):
    if trip_id is None:
        return ""

    con = connect()
    cur = con.cursor()

    token = guard.read_token_from_header()
    user_id = guard.extract_jwt_token(token)['id']

    # If the trip does not exist or the user is not participating return error
    cur.execute("SELECT tripID FROM participates WHERE tripID = %s and usrID = %s;", (trip_id, user_id))
    up = cur.fetchall()
    if up is None:
        cur.close()
        con.close()
        return jsonify(error="Trip not found"), 400

    if request.method == 'GET':
        # Get all items this user has for this trip, return them
        cur.execute("SELECT i.itemID, i.name, i.quantity, s.name, i.packed"
                    " FROM item i "
                    "INNER JOIN section s ON s.sectionID = i.sectionID "
                    "WHERE tripID = %s AND usrID = %s "
                    "ORDER BY i.itemID;", 
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

        cur.execute("SELECT name, quantity, packed, sectionID "
                    "FROM item "
                    "WHERE itemID = %s AND usrID = %s AND tripID = %s;",
                    (f"{data['item']}", user_id, trip_id))
        item = cur.fetchone()
        if item is None:
            cur.close()
            con.close()
            return jsonify(error="This item could not be found"), 500  # TODO: error code?

        # check that all fields are correct / filled
        if 'name' not in data or data['name'] is None:
            data['name'] = item[0]
        if 'quantity' not in data or data['quantity'] is None:
            data['quantity'] = item[1]
        else:
            data['quantity'] = int(float(data['quantity']))  # assure that the value is an integer
        if 'packed' not in data or data['packed'] is None:
            data['packed'] = item[2]
        if 'section' not in data or data['section'] is None:
            data['section'] = item[3]
        else:
            cur.execute("SELECT sectionID FROM section WHERE name = %s;", [data['section']])
            data['section'] = cur.fetchone()[0]  # TODO: this could throw an error, if the name is wrong

        cur.execute("UPDATE item SET (name, quantity, packed, sectionid) = (%s, %s, %s, %s) WHERE itemID = %s "
                    "RETURNING name, quantity, sectionid, packed;",
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
        if 'name' not in data or data['name'] is None:
            data['name'] = 'New Item'
        if 'quantity' not in data or data['quantity'] is None:
            data['quantity'] = 1
        else:
            data['quantity'] = int(float(data['quantity']))  # assure that the value is an integer
        if 'section' not in data or data['section'] is None:
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

        return redirect(url_for('checklist', trip_id=trip_id), code=200)

    cur.close()
    con.close()
    return jsonify(response)


# Edit / see trip
@app.route('/trip/<trip_id>', methods=['GET', 'PUT', 'DELETE'])
@flask_praetorian.auth_required
def get_trip(trip_id):
    con = connect()
    cur = con.cursor()

    token = guard.read_token_from_header()
    user_id = guard.extract_jwt_token(token)['id']

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

        # special case for finishing a trip
        if "finished" in data:
            cur.execute('''UPDATE trip SET finished = %s
                            WHERE tripID = %s
                            RETURNING tripid, finished;''',
                        (data['finished'], trip_id))
            con.commit()
            trip = cur.fetchone()

            if trip is None:
                cur.close()
                con.close()
                return jsonify(error="Updated data could not be saved"), 500

            cur.close()
            con.close()
            return jsonify({'id': trip[0], 'finished': trip[1]})

        # check that all fields are correct / filled
        if 'name' not in data or data['name'] is None:
            data['name'] = trip[1]
        if 'start' not in data or data['start'] is None:
            data['start'] = trip[2]
        if 'location' not in data or data['location'] is None:
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
        if 'duration' not in data or data['duration'] is not None:
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

        return redirect(url_for('trips'), code=200)

    cur.close()
    con.close()
    return jsonify(response)


# Get form 
@app.route('/forms/<trip_id>', methods=['GET', 'POST', 'PUT'])
@flask_praetorian.auth_required
def get_forms(trip_id):
    con = connect()
    cur = con.cursor()

    token = guard.read_token_from_header()
    user_id = guard.extract_jwt_token(token)['id']

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

        if 'userID' not in data:
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
@flask_praetorian.auth_required
def account():
    con = connect()
    cur = con.cursor()

    token = guard.read_token_from_header()
    user_id = guard.extract_jwt_token(token)['id']

    # If the trip does not exist or the user is not participating return error
    cur.execute("SELECT name, email, hashed_password FROM usr WHERE usrID = %s;", [user_id])
    user = cur.fetchone()
    if user is None:
        cur.close()
        con.close()
        return jsonify(error="User not found"), 400

    if request.method == 'GET':
        response = {
            'id': user_id,
            'username': user[0],
            'email': user[1],
            'password': user[2]
        }

    elif request.method == 'PUT':
        # Update the user (name, email, password, friends)
        data = request.json['data']

        # check that all fields are correct / filled
        if 'username' not in data or data['username'] is None:
            data['username'] = user[0]
        if 'email' not in data or data['email'] is None:
            data['email'] = user[1]
        if 'password' not in data or data['password'] is None:
            data['password'] = user[1]

        cur.execute("UPDATE usr SET (name, email, hashed_password) = (%s, %s, %s) WHERE usrID = %s "
                    "RETURNING name, email, hashed_password;",
                    (f"{data['username']}", f"{data['email']}", f"{guard.hash_password(data['password'])}", user_id))
        con.commit()

        u = cur.fetchone()
        if u is None:
            cur.close()
            con.close()
            return jsonify(error="User could not be updated"), 500

        user_auth = guard.authenticate(data['email'], data['password'])

        response = {
            'id': user_id,
            'name': u[0],
            'email': u[1],
            'access_token': guard.encode_jwt_token(user_auth)
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

        return redirect(url_for('home'), code=200)

    cur.close()
    con.close()
    return jsonify(response)
