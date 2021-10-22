import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import EditTripForm from './edit_trip_form'

function EditTripDialog(props) {

    const handleCloseDialog = () => {
        props.handleClose()
    }


    return (

            <main>
                <div className="editTripButton">
                    <Dialog fullWidth={true}
                        onClose={handleCloseDialog}
                        maxWidth={'md'}
                        open={true}>
                
                        <DialogTitle>
                            Edit Trip
                        </DialogTitle>
                       
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <EditTripForm handleClose={props.handleClose} trip={props.trip} getTrip={props.getTrip} getFields={props.getFields}/>
                            </Grid>
                        </DialogContent>
                        
                    </Dialog>
                </div>
            </main> 
    );
  
}

export default EditTripDialog