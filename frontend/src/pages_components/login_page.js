import React, { Component } from "react";
import Box from '@mui/material/Box';
import { Button, Container, Grid, TextField, Typography } from "@mui/material";

class Login extends Component {


  render() {

    return (
      <Container component="main" maxWidth="xs">

        <Box
          sx={{
            display: "flex",
            marginTop: 12,
            justifyContent: "center",
            bgcolor: "#94AAF7",
            border: 1,
            borderRadius: 1
          }}
        >
          <Box component="form"
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 3,
              mb: 3
            }}
          >
            <Grid container spacing="10" direction="column" alignItems="center"  >
              <Typography component="h1" variant="h5">
                Sign up
              </Typography>
              <Grid item >
                <TextField
                  variant="outlined"
                  label="Username"
                  onChange={e => this.setState({ usernameForm: e.target.value })}
                  error={!this.state.usernameValid}
                  helperText={!this.state.usernameValid ? "The username is too short!" : ""}
                />
              </Grid>
              <Grid item >
                <TextField
                  variant="outlined"
                  label="Email"
                  onChange={e => this.setState({ emailForm: e.target.value })}
                  error={!this.state.emailValid}
                  helperText={!this.state.emailValid ? "You must use a valid email." : ""}
                />
              </Grid>
              <Grid item >
                <TextField
                  variant="outlined"
                  label="Password"
                  type="password"
                  onChange={e => this.setState({ passwordForm: e.target.value })}
                  error={!this.state.passValid}
                  helperText={!this.state.passValid ? "Your password is too weak." : ""}
                />
              </Grid>
              <Grid item >
                <TextField
                  variant="outlined"
                  label="Confirm Password"
                  type="password"
                  onChange={e => this.setState({ confPasswordForm: e.target.value })}
                  error={!this.state.confPassValid}
                  helperText={!this.state.confPassValid ? "Your passwords must match." : ""}
                />
              </Grid>
              <Grid item>
                <Button
                  type="button"
                  variant="contained"
                  onClick={this.handleChanges}
                >
                  Sign Up
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    );
  }
}

export default Login;