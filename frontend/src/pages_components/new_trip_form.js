import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import React, {  useState } from 'react';
import { schema, uiSchema } from './new_trip_schema'
import { materialRenderers, materialCells, } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';


function NewTripForm(props) {

    const [data, setData] = useState();

    const cancelCreation = () => {
        props.handleClose();
    }

    const submitTrip = async () => {

        console.log(data)
        
        /*if(data && data.rsName && data.rsCat) {

            let bodyFormData = new FormData();
            bodyFormData.append("rsName", data.rsName);
            bodyFormData.append("rsCat", data.rsCat);

            axios({
                method: "post",
                url: "http://127.0.0.1:5000/add-resource",
                data: bodyFormData,
                headers: { "Content-Type": "multipart/form-data" },
            })
                .then((res) => {
                    console.log(res);
                    props.getData()
                })
                .catch((err) => {
                    console.log(err);
                });

        }*/

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