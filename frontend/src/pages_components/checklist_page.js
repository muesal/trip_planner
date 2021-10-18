/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { JsonForms } from '@jsonforms/react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { DataGrid } from "@material-ui/data-grid";

import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import axios from 'axios';
import { schema, uiSchema } from './create_schema'


function Checklists(props) {

    const [data, setData] = useState();
    const [trips, setTrips] = useState(null);
    const [rows, setRows] = useState(null)
    const apiData = props.apiData;
    const loading = props.loading;  

    useEffect(() => {
        getTrips();
        setRows(hardcoded_rows)
    }, [])

    const hardcoded_rows = [{id: 0, name: "mayonnaise", quantity: 2}, {id: 1, name: "chicken", quantity: 1}]

    const columns = [
        { field: "name", headerName: "Item", flex: 1 },
        { field: "quantity", headerName: "Quantity", flex: 0.5 },
    ];

    const handleSubmit = async () => {
       
        if(data && data.rsName && data.rsCat) {

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

        }
        
    }

    const getTrips = () => {
        axios({
                method: "get",
                url: "http://127.0.0.1:5000/trips",
                data: {},  // TODO: add userID
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => {
                    setTrips(res.data)
                })
                .catch((err) => {
                    console.log(err);
                });
 
    }

    return (

        <div className="checklistPage">
            {<div className="checklistMenu">
                <Grid item  container direction="column" justifyContent="flex-end" style={{paddingTop:'2%'}}>

                    {trips && 
                        trips.map((row) => {
                            return (
                                <div className="tripButton" key={row.id}>
                                    <Button  style={{width:200}} color="primary" variant="outlined"> {row.name} </Button>
                                </div>
                            );
                    })}
                </Grid>
            </div>}


          
                <div className="Checklist"> 

                    <DataGrid
                        rows={rows || []}
                        columns={columns}
                        disableColumnMenu={true}
                        checkboxSelection={true}
                        autoHeight
                        
                    />

                </div> 

                <div className="addResources">

                    <h2> Add Resource </h2>

                    <JsonForms
                        data={data}
                        schema={schema}
                        uischema={uiSchema}
                        renderers={materialRenderers}
                        onChange={({ data, errors }) => {setData(data);}}
                        cells={materialCells}
                    />

                    <Button onClick={handleSubmit} style={{margin:'1%'}} variant="outlined" color="default" >SUBMIT</Button>
                    

                    {loading === true ? (
                        <div>
                            <h2>Loading...</h2>
                        </div>
                    ) : (
                        <section>
                            {apiData.map((rs) => {
                                const rsId = rs[0];
                                const rsName = rs[1];
                                const rsCat = rs[2];

                                return (
                                    <div className="rs-container" key={String(rsId)}>
                                        <h2>{rsName}</h2>
                                        <p>
                                            <strong>Category:</strong> {rsCat}
                                        </p>
                                    </div>
                                );
                            })}
                        </section>
                    )}
                </div>
            
        </div>
    );
  
}

export default Checklists