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

