import React, { Component } from "react";
import Box from '@mui/material/Box';
import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import axios from 'axios';
import { Link } from "react-router-dom";
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Redirect } from "react-router";

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      emailForm: "",
      passwordForm: "",
      alert: false,
      alertText: "",
      alertType: "",
      redirect: false
    }
  }


  handleLogin = async (e) => {
    e.preventDefault();
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
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(credentials),
    })
      .then((response) => {
        if (response.data.error) {
          this.setState({ alertText: response.data.error });
          this.setState({ alert: true });
          this.setState({ alertType: "error" });
        }
        if (response.data.msg) {
          this.setState({ alertText: response.data.msg });
          this.setState({ alert: true })
          this.setState({ alertType: "success" });
          setTimeout(() => {
            this.setState({ redirect: true });
          }, 2000);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }


  render() {
    if (this.state.redirect) {
      return <Redirect to={'/account'}></Redirect>;
    }

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
                />
              </Grid>
              <Grid item >
                <TextField
                  variant="outlined"
                  label="Password"
                  type="password"
                  onChange={e => this.setState({ passwordForm: e.target.value })}
                />
              </Grid>
              <Grid container item>
                <Grid item xs>
                  <Link to={{ pathname: "/signin" }}>Sign in</Link>
                </Grid>
                <Grid item xs></Grid>
                <Grid item xs>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={this.handleLogin}
                  >
                    Login
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box sx={{ mt: "2vh" }}>
          <Collapse in={this.state.alert}>
            <Alert severity={this.state.alertType || "warning"}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    this.setState({ alert: false });
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2 }}
            >
              {this.state.alertText}
            </Alert>
          </Collapse>
        </Box>
      </Container>
    );
  }
}

export default Login;