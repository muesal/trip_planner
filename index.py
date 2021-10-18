from flask import Flask, jsonify, request, redirect
from flask.templating import render_template
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
import os
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager, set_access_cookies

load_dotenv()

# get info about the Database from .env
DATABASE = os.getenv('DATABASE')
DATABASE_USERNAME = os.getenv('DATABSE_USERNAME')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')


# get jwt secret from .env
SECRET = os.getenv('SECRET')

app = Flask(__name__)

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = SECRET 
app.config["JWT_TOKEN_LOCATION"] ="cookies"
app.config['JWT_COOKIE_SECURE'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
jwt = JWTManager(app)

# CORS enables access to the database
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

con = psycopg2.connect(
    database = DATABASE,
    user = DATABASE_USERNAME,
    password = DATABASE_PASSWORD
    )

cur = con.cursor()

@app.route('/')
def home():
    cur.execute('SELECT * FROM usr')
    rows = cur.fetchall()
    print(rows)
    return jsonify(rows)

@app.route('/add-resource', methods=['GET', 'POST'])
def add_resource():
    if request.method == 'POST':
        data = request.form.to_dict()
        print(data)
        cur.execute("INSERT INTO usr  (name, email) VALUES (%s, %s)",
            (f"{data['rsName']}",f"{data['rsCat']}"))
        con.commit()

        return redirect('http://localhost:3000', code="200")
    else:
        return 'Form submission failed'


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.json['username']
        email = request.json['email']
        passwd = request.json['password']
        
        if username != 'testtest' or passwd != 'Test123$': # TO-DO: here we need to check the database and encrypt the password
          return jsonify({'msg': 'Wrong username or password'}), 401
        access_token = create_access_token(identity=email)
        response = jsonify({'login': True})
        set_access_cookies(response, access_token)
        return response
        #return redirect('http://localhost:3000', code="200")
    else:
        return 'Form submission failed'

@app.route("/protected", methods=["GET"])
@jwt_required(locations=["cookies"])
def protected():
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity
    return jsonify({'msg': 'Wrong username or password'}), 401



