# Trip Planning App

## Set Up

Follow this [tutorial](https://dev.to/andrewbaisden/creating-react-flask-apps-that-connect-to-postgresql-and-harperdb-1op0), ignoring the stuff about harperdb

Assuming that python is installed:

1. Install [nmp](https://www.npmjs.com/) (used for some js funcionality, I guess)

2. Create a virtual environment in the directory of the project, i.e. the repository root, and activate it:
    >python3 -m venv trip<br>
    >. trip/bin/activate
    
    If you call it trip, it will be ignorded by git.

4. In the environment, install Flask-related things:
    > pip install flask

    Flask-Cors is used by the web app to fetch data from the API.
    >pip install Flask-Cors

    python-dotenv reads key-value pairs from the .env file
    >pip install python-dotenv

    psycopg2 is used to send SQL statements to the database.
    It needs some [prerequisites](https://www.psycopg.org/docs/install.html#build-prerequisites), if the installation fails check if they are all met.
    >pip install psycopg2

### Create a PostgreSQL Database

Create a new database (e.g. "trip_planner") and execute `trip.sql`, creating three tables and inserting to rows to the table route.


### Create a Flask backend server that is connected to the pgSCL database

The flask backend server is implemented in `index.py`.

In order for the app to connect to the database add a file `.env` the root of the repository, containing add the following lines:
>DATABASE="trip_planner" <br>
>DATABSE_USERNAME="postgres" <br>
>DATABASE_PASSWORD=""


When in the root of the repository activate the python environment and set up the environment by running:
>export FLASK_APP=index.py <br>
>export FLASK_ENV=development

Then start the web app with
>flask run

The output houl look like this:
> Serving Flask app "index.py" (lazy loading) <br>
> Environment: development <br>
> Debug mode: on <br>
> Running on http://127.0.0.1:5000/ (Press CTRL+C to quit) <br>
> Restarting with stat

See the web app by clicking the link the app is running on (line 4).
You should see the content of the resource table in json format.
This out put is generated with `def home()` in `index.py`.

When started in the dev environment, changes on the files are taken into account automatically, with no need to restart the server, reloading the page is sufficient.
It is however common that if something fails instead of the actual exception a `TypeError: exceptions must derive from BaseException` is shown.
Reload the page to see the actual error message.
However, to change something on the DB from outside the web app, the server must be stopped.

If the server cannot connect to the database, maybe the `postgresql.conf` is configured wrongly.
Find it with `locate postgresql.conf` and adjust the port to 5432.

### Build the front end

The files in the frontend folder were created with the command 'npx create-react-app frontend`.
The Files `frontend/src/App.js` and `frontend/src/App.css`, containing the main funcionalities of the frontend, are adapted to fit our pourpose.

Start the server in the directory 'frontend' with:
>npm start 

Consider `frontend/READme.md` for more information about React.

