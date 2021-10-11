import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Person from '@material-ui/icons/Person';

import "./App.css";
import Trips from "./pages_components/trips_page"
import Checklist from "./pages_components/checklist_page"
import Account from "./pages_components/account_page";


const App = () => {

    useEffect(() => {
        getData();
    }, []);

    const getData = () => {
        const API = 'http://127.0.0.1:5000/';

        setLoading(true)
        fetch(API)
            .then((response) => {
                console.log(response);
                return response.json();
            })
            .then((data) => {
                console.log(data);
                setLoading(false);
                setApiData(data);
            });
    };

    const [apiData, setApiData] = useState([]);
    const [loading, setLoading] = useState(true);

    return (

        <div className="App">
           <Router>

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
                                    <Button component={Link} to="/checklists" variant="contained" color="primary">
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
                                    <Button className="test" style={{ fontSize: '18px' }} component={Link} to="/account" variant="text" color="inherit">
                                        My Account
                                    </Button>
                                </div>
                            </div>

                      
                </header>  

                <Switch>
                    <Route exact path={["/", "/trips"]} render={() => <Trips />} />
                    <Route exact path={"/checklists"} render={() => <Checklist apiData={apiData} loading={loading} getData={getData}/>} />
                    <Route exact path={"/account"} component={Account} />
                </Switch>

            </Router>
        </div>

        
        
    );
};

export default App;
