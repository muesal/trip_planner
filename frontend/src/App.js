import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import "./App.css";
import Main from "./pages_components/main_page";
import Trips from "./pages_components/trips_page"
import Create from "./pages_components/create_page"
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
                    <AppBar position="static" >
                        <Toolbar>

                            <div className="menuTitle"> 
                                <h1>
                                    UTRIP 
                                </h1>
                            </div>

                            <div className="menuButtons">
                                <div className="menuButton">
                                    <Button component={Link} to="/main" variant="contained" color="primary">
                                        Main
                                    </Button>
                                </div>
                                
                                <div className="menuButton">
                                    <Button component={Link} to="/trips" variant="contained" color="primary">
                                        My Trips
                                    </Button>
                                </div>

                                <div className="menuButton">
                                    <Button component={Link} to="/create" variant="contained" color="primary">
                                        Create Trip
                                    </Button>
                                </div>
                            </div>

                            <div className="accountButton">
                                <div className="accountIcon">
                                    <IconButton edge="start" color="inherit" aria-label="account" sx={{ mr: 2 }}>
                                        <AccountCircleIcon />
                                    </IconButton>
                                </div>
                                <div className="menuButton">
                                    <Button component={Link} to="/account" variant="contained" color="primary">
                                        My Account
                                    </Button>
                                </div>
                            </div>

                        </Toolbar>
                    </AppBar>
                </header>

            
                <Switch>
                    <Route exact path={["/", "/main"]} component={Main} />
                    <Route exact path={"/trips"} component={Trips} />
                    <Route exact path={"/create"} render={() => <Create apiData={apiData} loading={loading} getData={getData}/>} />
                    <Route exact path={"/account"} component={Account} />
                </Switch>

            </Router>
        </div>

        
        
    );
};

export default App;
