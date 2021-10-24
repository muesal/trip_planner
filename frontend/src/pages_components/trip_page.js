/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { JsonForms } from '@jsonforms/react';
import moment from 'moment'
import { schema, uiSchema, updateSchemas } from './ressources_schema'
import { materialRenderers, materialCells, } from '@jsonforms/material-renderers';
import { retrieveKinds } from './new_trip_schema'
import { retrieveSections, schema as fieldSchema, uiSchema as fieldUiSchema } from './new_field_schema';
import { retrieveUsers } from './ressources_schema'
import EditTripDialog from "./edit_trip_dialog"

import axios from "axios";


function Trip(props) {

    const [tripEditDialogOpen, setTripEditDialogOpen] = useState(false);
    const [days, setDays] = useState([])
    const [data, setData] = useState({})
    const [selectedDay, setSelectedDay] = useState(0)
    const [selectedForm, setSelectedForm] = useState("")
    const [trip, setTrip] = useState(null)
    const [fields, setFields] = useState()
    const [formOK, setFormOK] = useState(false)
    const [addingField, setAddingField] = useState(false)
    const [fieldData, setFieldData] = useState({})
    const [users, setUsers] = useState([])
    const [formsCompletion, setFormsCompletion] = useState()

    useEffect(() => {
        getUsers()
        getTrip();
        getFields();
        retrieveKinds();
        retrieveSections();
    }, [])

    useEffect(() => {
        if(trip)
            processCalendar();
    }, [trip]) 

    useEffect(() => {
        if(fields) {

            if(selectedForm === "")
                setSelectedForm(Object.keys(fields[selectedDay])[0])

            if(formOK)
                setFormOK(false)
            else 
                changeSchemas(fields[selectedDay][selectedForm])
        }
    }, [fields]) 

    useEffect(() => {
        if(days.length > 0 && fields)
            computeFormsCompletion()
    }, [days, fields]) 

    useEffect(() => {
        setAddingField(false)
        if(fields) {
            setSelectedForm(Object.keys(fields[selectedDay])[0])
            if(formOK)
                setFormOK(false)
            else 
                changeSchemas(fields[selectedDay][selectedForm])
            
        }
    }, [selectedDay]) 

    useEffect(() => {
        setAddingField(false)
        if(fields) {
            if(formOK)
                setFormOK(false)
            else 
                changeSchemas(fields[selectedDay][selectedForm])
        }
    }, [selectedForm]) 

   useEffect(() => {
        if(!formOK && fields) {
            changeSchemas(fields[selectedDay][selectedForm])
        }
    }, [formOK])

    const handleOpen = () => {
        setTripEditDialogOpen(true)
    }

    const handleClose = () => {
        setTripEditDialogOpen(false)
    }

    const changeSchemas = (form) => {

        if(form) {
            let data_tmp = {};
            for(let field of form) {
                if(field.fieldUsrName) {
                    data_tmp[field.fieldName] = field.fieldUsrName
                }
            }
            setData(data_tmp)
        }   

        setFormOK(updateSchemas(form))

        

    }

    const submitChange = (newData) => {

        if( JSON.stringify(data) !== JSON.stringify(newData) ) {

            let data_tmp = data
            setData(newData)    

            let assignData = {}
            for(let key of Object.keys(newData)) {
                if(!data_tmp[key] || data_tmp[key] !== newData[key]) {
                    for(let user of users) {
                        if(user.name === newData[key]) {
                            assignData.userID = user.id
                            break
                        }
                        
                    }
                    for(let field of fields[selectedDay][selectedForm]) {
                        if(field.fieldName === key) {
                            assignData.fieldID = field.fieldID
                            break
                        }
                        
                    }
                    break
                }
            }

            axios({
                method: "put",
                url: `http://127.0.0.1:5000/forms/${props.match.params.id}`,
                data: {assignData},  // TODO: add userID
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => {
                    getFields()
                    
                })
                .catch((err) => {
                    console.log(err);
                });

        }


    }

    const submitField = () => {
       
        let fieldData_tmp = fieldData
        fieldData_tmp.formID = fields[selectedDay][selectedForm][0].formID
        setFormOK(false)
        if(fieldData && fieldData.name && fieldData.quantity && fieldData.section && fieldData.formID) {
            axios({
                    method: "post",
                    url: "http://127.0.0.1:5000/forms/" + trip.id,
                    data: {fieldData},  // TODO: add userID
                    headers: { "Content-Type": "application/json" },
                })
                    .then((res) => {
                        setAddingField(false)
                        setFieldData({})
                        getFields();
                    })
                    .catch((err) => {
                        console.log(err);
                    });

        }
        
    }

    const processCalendar = () => {
        let days_array = ["Whole Trip"]
        days_array.push(moment(trip.start).format("DD/MM/YYYY"))
        for(let i = 1; i < trip.duration; i++) {
            days_array.push(moment(days_array[i], "DD/MM/YYYY").add(1, 'days').format("DD/MM/YYYY"))
        }
        setDays(days_array)
    }

    const getUsers = async () =>  {
        axios({
            method: "get",
            url: "http://127.0.0.1:5000/users",
            data: {},  // TODO: add userID
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => {
                retrieveUsers(res.data)
                setUsers(res.data)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const getFields = async () => {
       


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

    const computeFormsCompletion = () => {


        let formsCompletion_tmp = Array(days.length)

        for(let day in days) {
            formsCompletion_tmp[day] = {}

            for(let form of Object.keys(fields[day])) {
                let formCompleted = true;
                for(let field of fields[day][form]) {
                    if(field.fieldName && !field.fieldUsrID) {
                        formCompleted = false
                        break
                    }
                }  
                formsCompletion_tmp[day][form] = formCompleted
            }
        }

        setFormsCompletion(formsCompletion_tmp)

    }

    const isDayCompleted = (day) => {
        for(let form of Object.keys(formsCompletion[day])) {
            if(formsCompletion[day][form] === false)
                return false
        }

        return true
    }
 
    return (

            <main>
       
                <div className="editTripButton">
                    <Button onClick={handleOpen} variant="contained" color="inherit" >Edit Trip</Button>

                    {tripEditDialogOpen && 
                        <EditTripDialog handleClose={handleClose} trip={trip} getTrip={getTrip} getFields={getFields} />}
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
                            {trip ? moment(trip.start).format("DD/MM/YYYY") + " - " + trip.duration + " days" : ""}
                        </Box>
                    </div>
                </div>
                
                <div className="resources">  
                    <div className="calendar"> 
                        {days.map((day, index) => {
                            return (
                                <div className="day" key={index}>
                                    {formsCompletion && isDayCompleted(index) ? 
                                    <Button onClick={() => {setSelectedDay(index)}} variant="contained" color="inherit" >{day}</Button> : 
                                    <Button onClick={() => {setSelectedDay(index)}} variant="contained" color="secondary" >{day}</Button> }
                                </div>          
                            );
                        })}
                    
                    </div>

                    <div className="form">  
                        <div className="formTitle">
                            {selectedForm &&
                                <h2> {days[selectedDay]} - {selectedForm}</h2>}
                        </div>  

                        <div className="resourcesForm"> 
                            { formOK ? <JsonForms
                                data={data}
                                schema={schema}
                                uischema={uiSchema}
                                renderers={materialRenderers}
                                onChange={({ data, errors }) => {submitChange(data);}}
                                cells={materialCells}
                            /> : 
                            <p> The form is empty </p>}

                            <div className="addFieldButton">
                                <Button onClick={() => {setAddingField(true)}} variant="text" color="primary" >add field</Button>
                            
                                { addingField && 
                                    <>
                                        <JsonForms
                                            data={fieldData}
                                            schema={fieldSchema}
                                            uischema={fieldUiSchema}
                                            renderers={materialRenderers}
                                            onChange={({ data, errors }) => {setFieldData(data);}}
                                            cells={materialCells}
                                        /> 
                                        
                                        <Button onClick={submitField} variant="outlined" color="primary" >submit</Button>
                                    </>
                                }
                            
                            </div>   
                        </div> 
                    </div> 

                    <div className="formChoice">
                        {fields && 
                            Object.keys(fields[selectedDay]).map((form, index) => {
                            return (
                                <div className="formButton" key={index}>
                                    {formsCompletion && formsCompletion[selectedDay][form] ? 
                                        <Button onClick={() => {setSelectedForm(form)}} variant="contained" color="inherit" >{fields[selectedDay][form][0].formName}</Button> : 
                                        <Button onClick={() => {setSelectedForm(form)}} variant="contained" color="secondary" >{fields[selectedDay][form][0].formName}</Button>}
                                </div>          
                            );
                        })}
                    </div> 
                </div> 
            </main> 
    );
  
}

export default Trip