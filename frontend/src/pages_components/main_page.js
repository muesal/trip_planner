import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import NewTripDialog from "./new_trip_dialog"

function Main(props) {

    const [newTripDialogOpen, setNewTripialogOpen] = useState(false);

    const handleOpen = () => {
        setNewTripialogOpen(true)
    }

    const handleClose = () => {
        setNewTripialogOpen(false)
    }


    return (

            <main>
                <div className="newTripButton">
                    <Button onClick={handleOpen} variant="contained" color="inherit" >Create Trip</Button>
                
                    {newTripDialogOpen && 
                        <NewTripDialog handleClose={handleClose} />}
                </div>
            </main> 
    );
  
}

export default Main