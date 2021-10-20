import React, { Component } from "react";
import Box from '@mui/material/Box';
import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import axios from 'axios';
import { Link } from "react-router-dom";

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      emailForm: "",
      passwordForm: "",
      emailValid: true,
      passValid: true,
    }
  }


  async handleLogin() {
    var email = this.state.emailForm;
    var password = this.state.passwordForm;
    var userData = {
      email,
      password
    };
    this.loginUser(userData);
  }

  async loginUser(credentials) {

    axios({
      method: "post",
      url: "http://localhost:5000/login",
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(credentials),
    })
      .then((response) => {
        console.log(response.data);
        return response.data;
      })
      .catch((err) => {
        console.log(err);
      });

  }


  render() {

    return (
      <Container component="main" maxWidth="xs">

        <Box
          sx={{
            display: "flex",
            marginTop: "22vh",
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
                Login
              </Typography>
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
              <Grid container item>
                <Grid xs>
                  <Link to={{pathname: "/signin"}}>Sign in</Link>
                </Grid>
                <Grid xs></Grid>
                <Grid xs>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={this.handleChanges}
                  >
                    Login
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    );
  }
}

export default Login;