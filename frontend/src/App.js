/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
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

function App() {

    const [apiData, setApiData] = useState([]);
    const [loading, setLoading] = useState(true);
    const history = useHistory();

    useEffect(() => {
        getData();
    }, []);

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

                <div className="menuButtons">
                    <div className="menuButton">
                        <Button component={Link} to="/trips" variant="contained" color="primary">
                            Trips
                        </Button>
                    </div>

                    <div className="menuButton">
                        <Button component={Link} to="/checklist" variant="contained" color="primary">
                            Checklist
                        </Button>
                    </div>
                </div>

                <div className="accountButton">
                    <div className="accountIcon">
                        <Person>
                            Account Icon
                        </Person>
                    </div>
                    <div className="menuButton">
                        <Button style={{ fontSize: '18px' }} component={Link} to="/account" variant="text" color="inherit">
                            My Account
                        </Button>
                    </div>
                </div>
                    
            </header>  

            <Switch>
                <Route exact path={["/", "/trips"]} render={() => <Trips goToTrip={goToTrip}/>} />
                <Route exact path={"/checklist/:id"} render={(matchProps) => <Checklist apiData={apiData} loading={loading} getData={getData} {...matchProps}/>} />
                <Route exact path={"/checklist"} render={() => <ChecklistRedirect apiData={apiData} loading={loading} getData={getData}/>} />
                <Route exact path={"/account"} component={Account} />
                <Route exact path={"/trip/:id"} render={(matchProps) => <Trip {...matchProps}/>}/>
            </Switch>

        </div>

        
        
    );
};

export default App;
