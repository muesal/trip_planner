import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import React, {  useState } from 'react';
import { schema, uiSchema } from './new_trip_schema'
import { materialRenderers, materialCells, } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import moment from 'moment'
import axios from 'axios'



function NewTripForm(props) {

    const [data, setData] = useState();

    const cancelCreation = () => {
        props.handleClose();
    }

    const submitTrip = async () => {

        data.start = moment(data.start, "YYYY-MM-DD").format("YYYY/MM/DD")
        
        if(data && data.name && data.content && data.duration && data.location && data.start && data.kind) {


            let bodyFormData = new FormData();
            bodyFormData.append("name", data.name);
            bodyFormData.append("content", data.content);
            bodyFormData.append("duration", data.duration);
            bodyFormData.append("location", data.location);
            bodyFormData.append("start", data.start);
            bodyFormData.append("kind", data.kind);

            axios({
                method: "post",
                url: "http://127.0.0.1:5000/create-trip",
                credentials: 'include',
                data: bodyFormData,
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': "Bearer " + localStorage.getItem('REACT_TOKEN_AUTH_KEY').replaceAll("\"", "")
                },
            })
                .then((res) => {
                    props.getTrips();
                    props.handleClose();
                })
                .catch((err) => {
                    console.log(err);
                });

        }

        props.getTrips(); 
    }

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

        <Grid item  container direction="row" justify="flex-end" style={{paddingTop:'2%'}}>
                <Button onClick={cancelCreation} style={{margin:'2%'}} color="secondary" variant="outlined"> Cancel </Button>
                <Button onClick={submitTrip} style={{margin:'2%'}} color="primary" variant="outlined"> Create </Button>
        </Grid>

    </Grid>

    )
}

export default NewTripForm;