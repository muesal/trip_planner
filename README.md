# UTrip

## Set Up


Assuming that python3 is installed:

Create a virtual environment in the directory of the project, i.e. the repository root:
>python3 -m venv trip<br>

Activate it on Linux:
>source trip/bin/activate

Or on windows:
>.\trip\Scripts\activate

Once the environment is activated install all backend-requirements:
>pip install -r requirements.txt


The backend uses a PostgreSQL database.
Install Postgresql following this: https://www.postgresql.org/download/.
Create a database where you want UTrip to store the data and a fitting `.env`, where you store the corresponding information.
>DATABASE="utrip"<br>
>DATABASE_USERNAME="postgres"<br>
>DATABASE_PASSWORD="123456789"<br>

The file should also contain some functionality for flask, namely:
>SECRET_KEY="very_secrete"<br>
>JWT_SECRET_KEY="do_not_share"<br>


Fo the frontend you need Node.js.
To install it on linux run:
>sudo apt install npm<br>

On windows visit https://nodejs.org/en/download/ and download and install it.

Next install all the packages needed for the fronted.
Navigate to the `frontend` folder and type:
>npm install<br>

Now you are ready to go!

To start flask naigate into the root of the repositors and set the path to the flask app, on Linux:
>export FLASK_APP=index.py <br>
>export FLASK_ENV=development <br>

And on Windows:
>set FLASK_APP=index.py <br>
>set FLASK_ENV=development <br>

And then start Flask:
>flask run<br>

In another window navigate into `frontend` and start the frontend with
>npm start<br>

##User Manual

The user manual can be found in `UTrip.pdf`

