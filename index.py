from flask import Flask, jsonify, request, redirect
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

con = psycopg2.connect(
    database=DATABASE,
    user=DATABASE_USERNAME,
    password=DATABASE_PASSWORD
)

cur = con.cursor()


@app.route('/')
def home():
    return redirect('http://localhost:3000/trips/', code=200)


# Create a new trip.
@app.route('/create-trip', methods=['POST'])
def add_trip():
    data = request.form.to_dict()
    # TODO: get user id
    user_id = 1
    cur.execute("SELECT kindID FROM kind WHERE name = %s", [f"{data['tKind']}"])
    cur.execute("SELECT create_trip (%s, %s, %s, TO_DATE(%s,'YYYY/MM/DD'), %s, %s, %s)",
                (f"{data['name']}", user_id, cur.fetchone()[0], f"{data['start']}", f"{data['duration']}",
                 f"{data['location']}", f"{data['content']}"))
    created_trip = cur.fetchone()[0]
    con.commit()

    if created_trip is None:
        return jsonify(error="Data could not be saved"), 500

    return redirect('http://localhost:3000/trip/' + str(created_trip), code=200)


# Return 5 soonest trips this user participates in
@app.route('/trips', methods=['GET'])
def get_trips():
    user_id = 1
    # TODO: get user id: session['id']?
    cur.execute(
        '''SELECT t.tripID, t.name, k.name, t.start_date, t.duration, t.location, t.content 
        FROM trip t JOIN participates p ON p.usrID = %s AND p.tripID = t.tripID 
        INNER JOIN kind k ON t.kindID = k.kindID
        WHERE t.finished IS NOT False
        ORDER BY t.start_date''',
        [user_id])
    trips = cur.fetchmany(size=5)

    data = []
    counter = 0
    for trip in trips:
        data.insert(counter, {
            'id': trip[0],
            'name': trip[1],
            'kind': trip[2],
            'start': trip[3],
            'duration': trip[4],
            'location': trip[5],
            'content': trip[6],
        })
        counter += 1
    return jsonify(data)


# Return all kinds 
@app.route('/kinds', methods=['GET'])
def get_kinds():
    cur.execute(
        "SELECT * FROM kind k")
    kinds = cur.fetchall()

    data = []
    counter = 0
    for kind in kinds:
        data.insert(counter, {
            'id': kind[0],
            'name': kind[1],
        })
        counter += 1
    return jsonify(data)


# return the checklist to the given trip for that user
@app.route('/checklist/<trip_id>', methods=['GET', 'PUT', 'POST', 'DELETE'])
def checklist(trip_id):
    # TODO: userID, hash trip id?
    user_id = 1

    # If the trip does not exist or the user is not participating return error
    cur.execute("SELECT * FROM participates WHERE tripID = %s and usrID = %s", (trip_id, user_id))
    up = cur.fetchall()
    if up is None:
        return jsonify(error="Trip not found"), 400  # TODO: Differ between trip not found / user not participating?

    if request.method == 'GET':
        # Get all items this user has for this trip, return them
        cur.execute("SELECT i.itemID, i.name, i.quantity, s.name, i.packed FROM item i"
                    "INNER JOIN section s ON s.sectionID = i.sectionID WHERE tripID = %s AND usrID = %s ",
                    (trip_id, user_id))
        cl = cur.fetchall()
        data = []
        counter = 0
        for cl in cl:
            data.insert(counter, {
                'id': cl[0],
                'name': cl[1],
                'quantity': cl[2],
                'section': cl[3],
                'packed': cl[4]
            })
            counter += 1

        return jsonify(data)

    elif request.method == 'PUT':
        # Update the item (name, quantity, section or packed)
        data = request.json['data']

        cur.execute("SELECT name, quantity, sectionID FROM item WHERE itemID = %s AND usrID = %s AND tripID = %s",
                    (f"{data['item']}", user_id, trip_id))
        item = cur.fetchone()
        if item is None:
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
            cur.execute("SELECT sectionID FROM section WHERE name = %s", [data['section']])
            data['section'] = cur.fetchone()[0]   # TODO: this could throw an error, if the name is wrong

        cur.execute("UPDATE item SET (name, quantity, packed, section) = (%s, %s, %s, %s) WHERE itemID = %s "
                    "RETURNING name, quantity, section, packed",
                    (f"{data['name']}", f"{data['quantity']}", f"{data['packed']}", f"{data['section']}",
                     f"{data['item']}"))
        con.commit()

        it = cur.fetchone()
        item = {
            'id': data['item'],
            'name': it[0],
            'quantity': it[1],
            'section': it[2],
            'packed': it[3]
        }

        return jsonify(item)

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
            cur.execute("SELECT sectionID FROM section WHERE name = %s", [data['section']])
            data['section'] = cur.fetchone()[0]  # TODO: this could throw an error, if the name is wrong

        cur.execute(
            "INSERT INTO item (name, quantity, packed, sectionID, usrID, tripID) VALUES (%s, %s, %s, %s, %s, %s) "
            "RETURNING itemID, packed",
            (f"{data['name']}", f"{data['quantity']}", 'False', f"{data['section']}", user_id, trip_id))
        con.commit()

        it = cur.fetchone()
        item = {
            'id': it[0],
            'name': data['name'],
            'quantity': data['quantity'],
            'section': data['section'],
            'packed': False
        }

        return jsonify(item)

    else:  # DELETE
        # Delete the item (for this user)
        data = request.json['data']

        cur.execute("SELECT name, quantity, sectionID FROM item WHERE itemID = %s AND usrID = %s AND tripID = %s",
                    (data['id'], user_id, trip_id))
        item = cur.fetchone()
        if item is None:
            return jsonify(error="This item could not be found"), 500  # TODO: error code?

        cur.execute("SELECT fieldID FROM field WHERE itemID = %s", [f"{data['item']}"])
        field = cur.fetchone
        if field is None:
            # Delete the item, if it is a personal item (no respective field)
            cur.execute("DELETE FROM item WHERE itemID = %s RETURNING itemID", [f"{data['item']}"])
        else:
            # otherwise un-assign the user from this item
            cur.execute("UPDATE field SET assigned = False WHERE fieldID = %s RETURNING fieldID", (field[0]))
            if cur.fetchone is not None:
                cur.execute("UPDATE item SET (usrID , packed) = (Null, False) WHERE itemID = %s RETURNING itemID", f"{data['item']}")
        it = cur.fetchone
        if it is None:
            return jsonify(error="Item could not be deleted"), 500  # TODO: error code?

        return ''  # TODO: redirect to get item


# Edit / see trip
@app.route('/trip/<trip_id>', methods=['GET', 'PUT', 'DELETE'])
def get_trip(trip_id):
    # TODO: userID
    user_id = 1

    if request.method == 'GET':
        # TODO: only creator sohuld see 'edit' button
        cur.execute('''SELECT t.name, k.name, t.start_date, t.duration, t.location, t.content 
                        FROM trip t INNER JOIN kind k ON t.kindID = k.kindID
                        WHERE tripID = %s''', [trip_id])
        trip = cur.fetchone()
        if trip is None:
            return ()

        data = {
            'id': trip_id,
            'name': trip[0],
            'kind': trip[1],
            'start': trip[2],
            'duration': trip[3],
            'location': trip[4],
            'content': trip[5],
        }
        return jsonify(data)  # todo or error, if no trip / no authorization
    elif request.method == 'PUT':
        data = request.json['data']

        cur.execute("SELECT usrID, name, start_date, duration, location FROM trip WHERE tripID = %s", [trip_id])
        trip = cur.fetchone()
        if trip is None:
            return jsonify(error="This trip does not exist"), 500  # TODO: error code?
        if trip[0] != user_id:
            return jsonify(error="Only the creator of a trip may update it"), 400  # TODO: error code?

        # check that all fields are correct / filled
        if data['name'] is None:
            data['name'] = trip[1]
        if data['start'] is None:
            data['start'] = trip[2]
        if data['location'] is None:
            data['location'] = trip[5]

        cur.execute("UPDATE trip SET (name, start_date, location, content) = (%s, TO_DATE(%s, 'DD/MM/YYYY'), "
                    "%s, %s) WHERE tripID = %s RETURNING start_date, duration, location, content, kindID",
                    (f"{data['name']}", f"{data['start']}", f"{data['location']}", f"{data['content']}", trip_id))
        trip = cur.fetchone()
        con.commit()

        if trip is None:
            return jsonify(error="Updated data could not be saved"), 500

        # If the duration changes, the fields of the trip must be adapted
        if data['duration'] is not None:
            data['duration'] = int(float(data['duration']))  # assure that the value is an integer
            duration = int(trip[1])
            if duration > data['duration'] > 0:
                cur.execute("SELECT decrease_duration(%s, %s, %s)", (f"{data['duration']}", duration, trip_id))
                con.commit()
                update = cur.fetchone()
                # TODO: check if worked.
            if data['duration'] > duration:
                cur.execute("SELECT increase_duration(%s, %s, %s)", (f"{data['duration']}", duration, trip_id))
                con.commit()
                update = cur.fetchone()
                # TODO: check if worked.

        # If the kind changed, the fields of the new kind must be added

        if data['kind'] is not None:
            cur.execute("SELECT kindID FROM kind WHERE name = %s", [f"{data['kind']}"])
            kind = cur.fetchone()
            if kind is not None and kind[0] != trip[4]:
                cur.execute("SELECT set_kind(%s, %s)", (kind, trip_id))
                con.commit()
                update = cur.fetchone()
                # TODO: check if worked

        data = {
            'id': trip_id,
            'start': trip[0],
            'duration': trip[1],
            'location': trip[2],
            'description': trip[3],
            'kind': trip[4]
        }
        return jsonify(data)

    else:  # DELETE
        cur.execute("SELECT usrID FROM trip WHERE tripID = %s", [trip_id])
        trip = cur.fetchone()
        if trip is None:
            return jsonify(error="This trip does not exist"), 500  # TODO: error code?
        if trip[0] != user_id:
            return jsonify(error="Only the creator of a trip may update it"), 400  # TODO: error code?

        cur.execute("DELETE FROM trip WHERE tripID = %s RETURNING tripID", [trip_id])
        con.commit()
        trip = cur.fetchone()

        if trip is None:
            return jsonify(error="Trip could not be deleted"), 500

        return redirect('http://localhost:3000/trips/', code=200)


# Get form 
@app.route('/forms/<trip_id>', methods=['GET', 'PUT'])
def get_forms(trip_id):
    if request.method == 'GET':
        cur.execute('''SELECT fo.formID, fo.name, fo.dayOfTrip, fi.fieldID, i.name, i.quantity, s.name, i.usrID, i.packed, u.name
                        FROM form fo LEFT OUTER  JOIN field fi ON fo.formID = fi.formID 
                        LEFT OUTER JOIN item i ON i.itemID = fi.itemID
                        LEFT OUTER JOIN section s ON s.sectionID = i.sectionID 
                        LEFT OUTER JOIN usr u ON u.usrID = i.usrID  
                        WHERE fo.tripID = %s
                        ORDER BY fo.formID, fo.formID, fi.fieldID''', [trip_id])




        
        forms = cur.fetchall()
        if forms is None:
            return ()

        data = []
        counter = 0
        for form in forms:
            data.insert(counter, {
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
        return jsonify(data)
    #else:  # PUT
        #TODO
