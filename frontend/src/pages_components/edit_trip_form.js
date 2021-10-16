import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import React, {  useState, useEffect } from 'react';
import { schema, uiSchema } from './new_trip_schema'
import { materialRenderers, materialCells, } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import axios from "axios";
import moment from "moment";


function EditTripForm(props) {

    const [data, setData] = useState();

    const cancelEdit = () => {
        props.handleClose();
    }

    const saveChanges = () => {


        axios({
                method: "put",
                url: "http://127.0.0.1:5000/trip/" + props.trip.id,
                data: {data},  // TODO: add userID
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log(err);
                });
        props.handleClose();
    }


    const deleteTrip = () => {
        props.handleClose();
    }

    useEffect(() => {
        console.log(props.trip)
        props.trip.start = moment(props.trip.start).format("DD/MM/YYYY")
        setData(props.trip)
    }, [props.trip])

    return (
        <Grid item xs={12} container direction="column" data-cy="formContainer">
        
        <JsonForms
            data={data}
            schema={schema}
            uischema={uiSchema}
            renderers={materialRenderers}
            onChange={({ data, errors }) => {setData(data);}}
            cells={materialCells}
        />

        <Grid item  container direction="row" justifyContent="flex-end" style={{paddingTop:'2%'}}>
                <Button onClick={deleteTrip} style={{margin:'2%'}} color="primary" variant="outlined"> Delete </Button>
                <Button onClick={saveChanges} style={{margin:'2%'}} color="primary" variant="outlined"> Save </Button>
                <Button onClick={cancelEdit} style={{margin:'2%'}} color="secondary" variant="outlined"> Cancel </Button>
        </Grid>

    </Grid>

    )
}

export default EditTripForm;