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
    return ''


# Create a new trip.
@app.route('/create-trip', methods=['POST'])
def add_trip():
    data = request.form.to_dict()
    # TODO: get user id
    user_id = 1
    cur.execute("SELECT kindID FROM kind WHERE name = %s", f"{data['tKind']}")
    cur.execute("SELECT create_trip (%s, %s, %s, TO_DATE(%s,'YYYY/MM/DD'), %s, %s, %s)",
                (f"{data['name']}", user_id, cur.fetchone()[0], f"{data['start']}", f"{data['duration']}",
                 f"{data['location']}", f"{data['content']}"))
    created_trip = cur.fetchone()[0]
    con.commit()

    if created_trip is None:
        return jsonify(error="Data could not be saved"), 500

    return redirect('http://localhost:3000/trip/' + created_trip, code=200)


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


# return the checklist to the given trip for that user
@app.route('/checklist/<trip_id>', methods=['GET', 'PUT'])
def get_checklist(trip_id):
    # TODO: userID, hash trip id?
    user_id = 1
    if request.method == 'GET':
        cur.execute("SELECT fi.name, fi.quantity FROM field fi JOIN form fo ON fi.formID = fo.formID AND fo.tripID = %s WHERE fi.usrID = %s ",
                    (trip_id, user_id))
        checklist = cur.fetchall()
        data = []
        id = 0
        for cl in checklist:
            data.insert(id, {
                'name': cl[0],
                'quantity': cl[1]
            })
            id += 1
        # TODO: error if trip not found
        return jsonify(data)
    else:  # PUT
        # TODO: update checklist, after updating the bacjend.
        return ''


# Edit / see trip
@app.route('/trip/<trip_id>', methods=['GET', 'PUT'])
def get_trip(trip_id):
    # TODO: userID
    user_id = 1

    if request.method == 'GET':
        # TODO: only creator sohuld see 'edit' button
        cur.execute("SELECT kindID, start_date, duration, location FROM trip t WHERE tripID = %s", [trip_id])
        trip = cur.fetchone()
        if trip is None:
            return ()

        data = {
            'kind': trip[0],
            'start': trip[1],
            'duration': trip[2],
            'location': trip[3]
        }
        return jsonify(data)  # todo or error, if no trip / no authorization
    else:  # PUT
        data = request.json['data']
        if trip_id is None:
            trip_id = data['id']

        cur.execute("SELECT usrID FROM trip WHERE tripID = %s", trip_id)
        creator = cur.fetchone()[0]
        if creator is None:
            return jsonify(error="This trip does not exist"), 500  # TODO: error code?
        if creator != user_id:
            return jsonify(error="Only the creator of a trip may update it"), 400  # TODO: error code?

        cur.execute("UPDATE trip SET (name, start_date, duration, location, content) = (%s, TO_DATE(%s, 'YYYY/MM/DD'), "
                    "%s, %s, %s) WHERE tripID = %s RETURNING start_date, duration, location, content;",
                    (f"{data['name']}", f"{data['start']}", f"{data['duration']}", f"{data['location']}",
                     f"{data['content']}", trip_id, user_id))
        trip = cur.fetchone()

        if trip is None:
            return jsonify(error="Updated data could not be saved"), 500

        data = {
            'start': trip[0],
            'duration': trip[1],
            'location': trip[2],
            'description': trip[3]
        }
        return jsonify(data)

