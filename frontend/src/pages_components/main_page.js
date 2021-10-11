import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@material-ui/core/Button';


function Main(props) {

    const [newTripDialogOpen, setNewTripialogOpen] = useState(false);

    const handleOpen = () => {
        setNewTripialogOpen(true)
    }

    const handleClose = () => {
        setNewTripialogOpen(false)
    }

    const rows_tmp = [
        {id: 0, name: "Nydala", description: "Trip to the lake", date: "01/01/2022", duration: "2 days"}, 
        {id: 1, name: "Climbing Mont Fuji", description: "Travel to Japan", date: "30/10/2021", duration: "2 weeks"},
        {id: 2, name: "Hiking", description: "Hiking in sweden", date: "17/03/2022", duration: "2 days"}
    ]


    return (

            <main>
                <div className="tripList">
                    {rows_tmp.map((row) => {
                        return (
                            <div className="tripCard">
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
                                            <Button size="small">Share</Button>
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