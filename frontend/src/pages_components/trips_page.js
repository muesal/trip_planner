import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@material-ui/core/Button';
import NewTripDialog from "./new_trip_dialog"
import axios from "axios";

function Main(props) {

    const [newTripDialogOpen, setNewTripialogOpen] = useState(false);

    useEffect(() => {
        getTrip();
    }, [])

    const handleOpen = () => {
        setNewTripialogOpen(true)
    }

    const handleClose = () => {
        setNewTripialogOpen(false)
    }

    const rows_tmp = [
        {id: 0, name: "Nydala", description: "Let's go to the lake, best place in town to see northern lights", date: "01/01/2022", duration: 3}, 
        {id: 1, name: "Climbing Mont Fuji", description: "Travel to Japan", date: "30/10/2021", duration: 14},
        {id: 2, name: "Hiking", description: "Hiking in sweden", date: "17/03/2022", duration: 2}
    ]

    const getTrip = () => {
        axios({
                method: "get",
                url: "http://127.0.0.1:5000/trips",
                data: {},  // TODO: add userID
                headers: { "Content-Type": "application/json" },
            })
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log(err);
                });
    }


    return (

            <main>

                <div className="newTripButton">
                    <Button onClick={handleOpen} variant="contained" color="inherit" >Create Trip</Button>

                    {newTripDialogOpen && 
                        <NewTripDialog handleClose={handleClose} />}
                </div>

                <div className="tripList">
                    {rows_tmp.map((row) => {
                        return (
                            <div className="tripCard" key={row.id}>
                                <Card sx={{ display: 'flex', backgroundColor: 'rgb(156, 156, 247)' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        <CardContent sx={{ flex: '1 0 auto' }}>
                                            <Typography component="div" variant="h5">
                                                {row.name}
                                            </Typography>
                                            <Typography variant="subtitle1" color="text.secondary" >
                                                {row.description}
                                            </Typography>
                                            <Typography variant="subtitle1" color="text.secondary" component="div">
                                                {row.date}
                                            </Typography>
                                            <Typography variant="subtitle1" color="text.secondary" component="div">
                                                {row.duration}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button onClick={() =>{props.goToTrip(row)}} variant="text" color="primary">
                                                More
                                            </Button>
                                        </CardActions>
                                        
                                    </Box>
                                </Card>

                            </div>
                        );
                    })}
                </div> 

            </main> 
    );
  
}

export default Main