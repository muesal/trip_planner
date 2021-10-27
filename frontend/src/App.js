/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import { Switch, Route, Link } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Person from '@material-ui/icons/Person';

import "./App.css";
import Trips from "./pages_components/trips_page"
import Checklist from "./pages_components/checklist_page"
import ChecklistRedirect from "./pages_components/checklist_redirect"
import Account from "./pages_components/account_page";
import Trip from "./pages_components/trip_page";

import { useHistory } from "react-router-dom";
import Login from './pages_components/login_page';
import Signin from './pages_components/signin_page';
import Home from './pages_components/home_page';

import {logout, useAuth} from './auth/index'


function App() {

  const [logged] = useAuth();
  const history = useHistory();

  const goToTrip = (trip) => {
    history.push(`/trip/${trip}`);
  }

  return (

    <div className="App">
      <header>
        <div className="menuTitle">
          <h1>
            UTrip
          </h1>
        </div>
        {logged ? (
          <div className="menuButtons">
            <div className="menuButton">
              <Button component={Link} to="/home" variant="text" color="inherit">
                Home
              </Button>
            </div>
            <div className="menuButton">
              <Button component={Link} to="/trips" variant="text" color="inherit">
                Trips
              </Button>
            </div>

            <div className="menuButton">
              <Button component={Link} to="/checklist" variant="text" color="inherit">
                Checklist
              </Button>
            </div>
          </div>) : (
          <div className="menuButtons">
            <div className="menuButton">
              <Button component={Link} to="/home" variant="text" color="inherit">
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
              <Button onClick={() => logout()} component={Link} to="/home" variant="text" color="inherit">
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="accountButton">
            <div className="menuButton">
              <Button component={Link} to="/signin" variant="text" color="inherit">
                Sign in
              </Button>
            </div>
            <div className="menuButton">
              <Button component={Link} to="/login" variant="text" color="inherit">
                Log in
              </Button>
            </div>
          </div>
        )
        }

      </header>

      <Switch>
        <Route exact path={["/", "/home"]} render={() => <Home />} />
        <Route exact path={"/login"} render={() => <Login/>} />
        <Route exact path={"/signin"} render={() => <Signin/>} />
        <Route exact path={"/trips"} render={() => <Trips goToTrip={goToTrip} />} />
        <Route exact path={"/checklist"} render={() => <ChecklistRedirect />} />        
        <Route exact path={"/account"} component={Account} />
        <Route exact path={"/checklist/:id"} render={(matchProps) => <Checklist {...matchProps}/>} />        
        <Route exact path={"/trip/:id"} render={(matchProps) => <Trip {...matchProps} />} />
      </Switch>
    </div>
  );
};

export default App;
