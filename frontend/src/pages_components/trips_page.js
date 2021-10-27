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

  return (

    <Grid container >
      <Grid item xs>

      </Grid>
      <Grid item xs={6}>
        <div className="tripList">
          {trips.map((row) => {
            return (
              <div className="tripCard" key={row.id}>
             
                <Card sx={{ border: 1, display: 'flex', backgroundColor: '#118B22', color: "white" }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <CardContent sx={{ flex: '1 0 auto' }}>
                      <Typography component="div" variant="h4" color="white">
                        {row.name}
                      </Typography>
                      <Typography component="div" variant="h5" color="white">
                        {row.kind}
                      </Typography>
                      <Typography variant="subtitle1"  color="white">
                        {row.content}
                      </Typography>
                      <Typography variant="subtitle1"  component="div" color="white">
                        {`${row.location} - ${moment(row.start).format("DD/MM/YYYY")}`}
                      </Typography>
                      <Typography variant="subtitle1"  component="div" color="white">
                        duration : {row.duration} days
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button onClick={() => { props.goToTrip(row.id) }} variant="text" color="inherit">
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
      <Grid container alignContent="flex-start" item xs>
        <Grid item xs>

        </Grid>
        <Grid item >
          <Box className="newTripButton" sx={{mt: 3}}>
            <Button onClick={handleOpen} variant="contained" >Create Trip</Button>

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