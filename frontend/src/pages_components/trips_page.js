import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@material-ui/core/Button';
import NewTripDialog from "./new_trip_dialog"
import { retrieveKinds } from './new_trip_schema'


import axios from "axios";
import moment from 'moment'
import { Grid } from '@material-ui/core';

function Main(props) {

  const [newTripDialogOpen, setNewTripialogOpen] = useState(false);
  const [trips, setTrips] = useState([])

  useEffect(() => {
    getTrips();
    retrieveKinds();
  }, [])

  const handleOpen = () => {
    setNewTripialogOpen(true)
  }

  const handleClose = () => {
    setNewTripialogOpen(false)
  }

  /*const trips_hard = [
      {id: 0, name: "Nydala", description: "Let's go to the lake, best place in town to see northern lights", date: "01/01/2022", duration: 3}, 
      {id: 1, name: "Climbing Mont Fuji", description: "Travel to Japan", date: "30/10/2021", duration: 14},
      {id: 2, name: "Hiking", description: "Hiking in sweden", date: "17/03/2022", duration: 2}
  ]*/

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

    <Grid container xs>
      <Grid item xs>

      </Grid>
      <Grid item xs={6}>
        <div className="tripList">
          {trips.map((row) => {
            return (
              <div className="tripCard" key={row.id}>
                <Card sx={{ border: 1, display: 'flex', backgroundColor: 'rgb(156, 156, 247)' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <CardContent sx={{ flex: '1 0 auto' }}>
                      <Typography component="div" variant="h4">
                        {row.name}
                      </Typography>
                      <Typography component="div" variant="h5">
                        {row.kind}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" >
                        {row.content}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" component="div">
                        {`${row.location} - ${moment(row.start).format("DD/MM/YYYY")}`}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" component="div">
                        duration : {row.duration} days
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button onClick={() => { props.goToTrip(row.id) }} variant="text" color="primary">
                        More
                      </Button>
                    </CardActions>

                  </Box>
                </Card>

              </div>
            );
          })}
        </div>
      </Grid>
      <Grid container item xs>
        <Grid item xs>

        </Grid>
        <Grid item alignContent="flex-start">
          <Box className="newTripButton" sx={{mt: 1}}>
            <Button onClick={handleOpen} variant="contained" color="inherit" >Create Trip</Button>

            {newTripDialogOpen &&
              <NewTripDialog handleClose={handleClose} getTrips={getTrips} />}
          </Box>
        </Grid>
        <Grid item xs>

        </Grid>
      </Grid>
    </Grid>

  );

}

export default Main