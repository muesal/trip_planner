
import React, { Component } from "react";
import Box from '@mui/material/Box';
import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import axios from 'axios';

class Signin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      usernameForm: "",
      emailForm: "",
      passwordForm: "",
      confPasswordForm: "",
      usernameValid: true,
      emailValid: true,
      passValid: true,
      confPassValid: true
    }
  }

  async checkEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  async checkPassword(registerPasswd) {
    var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.:(),;])[A-Za-z\d@$!%*?&.:(),;]{7,25}$/;
    return passw.test(registerPasswd);
  }

  handleChanges = async (e) => {
    e.preventDefault();
    if (this.state.usernameForm.length < 8) {
      this.setState({ usernameValid: false });
    }
    else {
      this.setState({ usernameValid: true });
    }
    this.setState({ emailValid: await this.checkEmail(this.state.emailForm) });
    this.setState({ passValid: await this.checkPassword(this.state.passwordForm) });
    if (!this.state.passValid || (this.state.confPasswordForm !== this.state.passwordForm)) {
      this.setState({ confPassValid: false });
    }
    else {
      this.setState({ confPassValid: true });
    }
    if (this.state.usernameValid && this.state.emailValid && this.state.passValid && this.state.confPassValid) {
      this.handleRegister();
    }
  }

  async handleRegister() {
    var username = this.state.usernameForm;
    var email = this.state.emailForm;
    var password = this.state.passwordForm;
    var userData = {
      username,
      email,
      password
    };
    this.registerUser(userData);
  }

  async registerUser(credentials) {

    axios({
      method: "post",
      url: "http://localhost:5000/register",
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

export default Signin;