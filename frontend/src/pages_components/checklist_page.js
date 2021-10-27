/* eslint-disable react-hooks/exhaustive-deps */

import React, {useState, useEffect} from 'react';
import {JsonForms} from '@jsonforms/react';
import { useHistory } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import {Box} from '@mui/system';
import {materialRenderers, materialCells} from '@jsonforms/material-renderers';
import axios from 'axios';
import {schema, uiSchema} from './create_schema'


function Checklist(props) {


    const [data, setData] = useState();
    const [trips, setTrips] = useState(null);
    const [items, setItems] = useState()
    const [value, setValue] = useState(props.match.params.id - 1);
    const [checked, setChecked] = useState();

    const [forceUpdate, setForceUpdate] = useState(false);
    const history = useHistory();


    useEffect(() => {
        getTrips();
    }, [])

    useEffect(() => {
        setChecked()
        setItems()
        getItems();
    }, [forceUpdate])

    const handleChange = (event, newValue) => {
        setValue(newValue);
        history.push(`/checklist/${newValue + 1}`);

        let forceUpdateTmp = forceUpdate
        setForceUpdate(!forceUpdateTmp);
    };

    const handleSubmit = async () => {

        if (data && data.name && data.section && data.quantity) {

            axios({
                method: "post",
                url: `http://127.0.0.1:5000/checklist/${props.match.params.id}`,
                credentials: 'include',
                data: {data},
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': "Bearer " + localStorage.getItem('REACT_TOKEN_AUTH_KEY').replaceAll("\"", "")
                },
            })
                .then((res) => {
                    setData(null)
                    getItems()
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
            credentials: 'include',
            data: {},
            headers: {
                "Content-Type": "application/json",
                'Authorization': "Bearer " + localStorage.getItem('REACT_TOKEN_AUTH_KEY').replaceAll("\"", "")
            },
        })
            .then((res) => {
                setTrips(res.data)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const getItems = () => {
        axios({
            method: "get",
            url: `http://127.0.0.1:5000/checklist/${props.match.params.id}`,
            credentials: 'include',
            data: {},
            headers: {
                "Content-Type": "application/json",
                'Authorization': "Bearer " + localStorage.getItem('REACT_TOKEN_AUTH_KEY').replaceAll("\"", "")
            },
        })
            .then((res) => {
                setItems(res.data);
                let checked_tmp = new Array(res.data.length)
                for(let i = 0 ; i < res.data.length ; i++) 
                    checked_tmp[i] = res.data[i].packed
                
                setChecked(checked_tmp)
            })
            .catch((err) => {
                console.log("error", err);
            });
    }

    const handleToggle = (index) => () => {
        
        const newChecked = [...checked];
        newChecked[index] = !newChecked[index]
        setChecked(newChecked);

        let data = {item: items[index].itemId, packed: newChecked[index]}

        axios({
            method: "put",
            url: `http://127.0.0.1:5000/checklist/${props.match.params.id}`,
            credentials: 'include',
            data: {data},
            headers: {
                "Content-Type": "application/json",
                'Authorization': "Bearer " + localStorage.getItem('REACT_TOKEN_AUTH_KEY').replaceAll("\"", "")
            },
        })
            .then((res) => {
            })
            .catch((err) => {
                console.log("error", err);
            });
    }

    return (

        <Box alignSelf='flex-start' alignContent='center'
             sx={{flexGrow: 1, bgcolor: 'background.paper', display: 'flex', maxHeight: "80vh", width: 1}}
        >
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                sx={{borderRight: 1, borderColor: 'divider'}}
            >
               
                {trips &&
                trips.map((trip, index) => {
                    return (
                        <Tab key={index} label={trip.name} />
                    );
                })}
            </Tabs>
            
            <List sx={{ m: 5 , bgcolor: 'background.paper' }}>
                {items && checked && items.map((item, index) => {
                    return (
                        <ListItem
                            key={index}
                            disablePadding
                        >
                            <ListItemButton role={undefined} onClick={handleToggle(index)} disableRipple dense>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checked[index]}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemText primary={item.name + " x" + item.quantity} />

                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
            

            <Box sx={{paddingLeft: "10vw", mt: 5}}>

                <h2> Add Item </h2>

                <JsonForms
                    data={data}
                    schema={schema}
                    uischema={uiSchema}
                    renderers={materialRenderers}
                    onChange={({data, errors}) => {
                        setData(data);
                    }}
                    cells={materialCells}
                />

                <Button onClick={handleSubmit} style={{margin: '1%'}} variant="outlined" color="default">SUBMIT</Button>

            </Box>
        </Box>
    );

}

export default Checklist