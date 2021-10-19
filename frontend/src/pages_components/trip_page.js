/* eslint-disable react-hooks/exhaustive-deps */


import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { JsonForms } from '@jsonforms/react';
import moment from 'moment'
import { schema, uiSchema } from './ressources_schema'
import { materialRenderers, materialCells, } from '@jsonforms/material-renderers';
import EditTripDialog from "./edit_trip_dialog"
import axios from "axios";


function Trip(props) {

    const [tripEditDialogOpen, setTripEditDialogOpen] = useState(false);
    const [days, setDays] = useState([])
    const [data, setData] = useState()
    const [selectedDay, setSelectedDay] = useState(0)
    const [trip, setTrip] = useState(null)
    const [fields, setFields] = useState()

    useEffect(() => {
        getTrip();
        getFields();
    }, [])

    useEffect(() => {
        if(trip)
            processCalendar();
    }, [trip]) 

    const handleOpen = () => {
        setTripEditDialogOpen(true)
    }

    const handleClose = () => {
        setTripEditDialogOpen(false)
    }

    const processCalendar = () => {
        let days_array = []
        days_array.push(moment(trip.start).format("DD/MM/YYYY"))
        for(let i = 1; i < trip.duration; i++) {
            days_array.push(moment(days_array[i-1], "DD/MM/YYYY").add(1, 'days').format("DD/MM/YYYY"))
        }
        setDays(days_array)
    }

    const getFields = () => {
        axios({
                method: "get",
                url: `http://127.0.0.1:5000/forms/${props.match.params.id}`,
                data: {},  // TODO: add userID
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => {
                    let field_tmp = new Array(res.data[res.data.length - 1].dayOfTrip + 1);
                    for(let i = 0; i < field_tmp.length; i++) 
                        field_tmp[i] = {}
                    
                    for(let field of res.data) {
                        if(!field_tmp[field.dayOfTrip][field.formName]) 
                            field_tmp[field.dayOfTrip][field.formName] = []
                        
                        field_tmp[field.dayOfTrip][field.formName].push(field)
                    }
                    setFields(field_tmp)
                })
                .catch((err) => {
                    console.log(err);
                });
   
    }

    const getTrip = () => {
        axios({
                method: "get",
                url: `http://127.0.0.1:5000/trip/${props.match.params.id}`,
                data: {},  // TODO: add userID
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => {
                    setTrip(res.data)
                })
                .catch((err) => {
                    console.log(err);
                });    
    }
 
    return (

            <main>

            <div className="editTripButton">
                    <Button onClick={handleOpen} variant="contained" color="inherit" >Edit Trip</Button>

                    {tripEditDialogOpen && 
                        <EditTripDialog handleClose={handleClose} trip={trip} />}
                </div>

                <div className="tripDetails">

                    <div className="tripName">
                        <Typography component="div" variant="h5">
                            {trip ? trip.name : ""}
                        </Typography>
                    </div> 
                    <div className="tripKind">
                        <Typography component="div" variant="h6">
                            {trip ? trip.kind + " trip" : ""}
                        </Typography>
                    </div> 
                    <div className="descriptionBox" >
                        <Box p={"20px"} border={1} borderRadius={2}> 
                            {trip ? trip.content : ""}
                        </Box>
                    </div>
                    <div className="tripDateDuration">
                        <Box  py={"20px"}> 
                            {trip ? moment(trip.start).format("DD/MM/YYYY") + " - " + trip.duration + "days" : ""}
                        </Box>
                    </div>
                </div>
                
                <div className="resources">  
                    <div className="calendar"> 
                        {days.map((day, index) => {
                            return (
                                <div className="day" key={index}>
                                    <Button onClick={() => {setSelectedDay(index)}} variant="contained" color="inherit" >{day}</Button>
                                </div>          
                            );
                        })}
                    
                    </div>
                    <div className="resourcesForm"> 
                    <JsonForms
                        data={data}
                        schema={schema}
                        uischema={uiSchema}
                        renderers={materialRenderers}
                        onChange={({ data, errors }) => {setData(data);}}
                        cells={materialCells}
                    />
                    </div> 

                    <div className="formChoice">
                        {fields && 
                            Object.keys(fields[selectedDay]).map((form, index) => {
                            return (
                                <div className="formButton" key={index}>
                                    <Button onClick={() => {console.log("hello")}} variant="contained" color="inherit" >{fields[selectedDay][form][0].formName}</Button>
                                </div>          
                            );
                        })}
                    </div> 
                </div> 
            </main> 
    );
  
}

export default Trip