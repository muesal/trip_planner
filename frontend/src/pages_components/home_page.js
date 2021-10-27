import React from "react";
import Box from '@mui/material/Box';
import { Grid, Typography } from "@mui/material";

function Home() {

  return (

    <Box className="greencont"
      sx={{
        width: 1,
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          justifyContent: "center",
          mt: 3,
          mb: 3
        }}
      >
        <Grid container spacing="10" direction="column" alignItems="center"  >
          <Typography component="h1" variant="h2">
            WELCOME TO UTrip
          </Typography>
          <Typography component="h1" variant="h4">
            Plan your trip easier than ever!
          </Typography>
          <Typography component="h1" variant="h6">
            A really easy-to-use trip planning application.
          </Typography>
          <Typography component="h1" variant="h6">
            Intuitive, fast and easy to use.
          </Typography>
          <Typography component="h1" variant="caption">
            What are you waiting for?
          </Typography>
        </Grid>
      </Box>
    </Box>
  );
}

export default Home;