import React, { Fragment, useState } from 'react';
import Button from '@material-ui/core/Button';

function Main(props) {

    return (

            <main>
                <div className="newTripButton">
                    <Button onClick={() => {console.log("Hello")}} variant="contained" color="inherit" >Create Trip</Button>
                </div>
            </main> 
    );
  
}

export default Main