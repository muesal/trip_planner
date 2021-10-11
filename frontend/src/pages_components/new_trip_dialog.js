import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import NewTripForm from './new_trip_form'

function NewTripDialog(props) {

    const handleCloseDialog = () => {
        props.handleClose()
    }


    return (

            <main>
                <div className="newTripButton">
                    <Dialog fullWidth={true}
                        onClose={handleCloseDialog}
                        maxWidth={'md'}
                        open={true}>
                
                        <DialogTitle>
                            Create New Trip
                        </DialogTitle>
                       
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <NewTripForm handleClose={props.handleClose} />
                            </Grid>
                        </DialogContent>
                        
                    </Dialog>
                </div>
            </main> 
    );
  
}

export default NewTripDialog