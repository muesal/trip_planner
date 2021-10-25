/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { Switch, Route, Link } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Person from '@material-ui/icons/Person';

import "./App.css";
import Trips from "./pages_components/trips_page"
import Checklist from "./pages_components/checklist_page"
import Account from "./pages_components/account_page";
import Trip from "./pages_components/trip_page";

import { useHistory } from "react-router-dom";
import Login from './pages_components/login_page';
import Signin from './pages_components/signin_page';
import Home from './pages_components/home_page';

import {logout, useAuth} from './auth/index'


function App() {

  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logged] = useAuth()
  const [usrID, setUsrID] = useState("");
  const history = useHistory();

  useEffect(() => {
    getData();
  }, []);

  const loggedHandler = (loged, id) => {
    setUsrID(id);
  }

  const getData = () => {
    const API = 'http://127.0.0.1:5000/';

    setLoading(true)
    /*fetch(API)
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((data) => {
            console.log(data);
            setLoading(false);
            setApiData(data);
        });*/

  };

  const goToTrip = (trip) => {
    history.push(`/trip/${trip}`);
  }

  return (

    <div className="App">
      <header>
        <div className="menuTitle">
          <h1>
            UTRIP
          </h1>
        </div>
        {logged ? (
          <div className="menuButtons">
            <div className="menuButton">
              <Button component={Link} to="/home" variant="contained" color="primary">
                Home
              </Button>
            </div>
            <div className="menuButton">
              <Button component={Link} to="/trips" variant="contained" color="primary">
                Trips
              </Button>
            </div>

            <div className="menuButton">
              <Button component={Link} to="/checklists" variant="contained" color="primary">
                Checklist
              </Button>
            </div>
          </div>) : (
          <div className="menuButtons">
            <div className="menuButton">
              <Button component={Link} to="/home" variant="contained" color="primary">
                Home
              </Button>
            </div>
          </div>
        )}
        {logged ? (
          <div className="accountButton">
            <div className="menuButton">
              <Button component={Link} to="/account" variant="text" color="inherit">
                <Person>
                  Account Icon
                </Person>
                My Account
              </Button>
            </div>
            <div className="menuButton">
              <Button onClick={() => logout()} component={Link} to="/home" variant="contained" color="primary">
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="accountButton">
            <div className="menuButton">
              <Button component={Link} to="/signin" variant="contained" color="primary">
                Sign in
              </Button>
            </div>
            <div className="menuButton">
              <Button component={Link} to="/login" variant="contained" color="primary">
                Log in
              </Button>
            </div>
          </div>
        )
        }

      </header>

      <Switch>
        <Route exact path={["/", "/home"]} render={() => <Home />} />
        <Route exact path={"/login"} render={() => <Login loggedHandler={loggedHandler} />} />
        <Route exact path={"/signin"} render={() => <Signin loggedHandler={loggedHandler} />} />
        <Route exact path={"/trips"} render={() => <Trips goToTrip={goToTrip} />} />
        <Route exact path={"/checklists"} render={() => <Checklist apiData={apiData} loading={loading} getData={getData} />} />
        <Route exact path={"/account"} component={Account} />
        <Route exact path={"/trip/:id"} render={(matchProps) => <Trip {...matchProps} />} />
      </Switch>
    </div>
  );
};

export default App;
