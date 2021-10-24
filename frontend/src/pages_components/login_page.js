import React from "react";
import Box from '@mui/material/Box';
import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import axios from 'axios';
import { Link } from "react-router-dom";
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Redirect } from "react-router";
import { useState } from 'react';

function Login(props) {

  const [emailForm, setEmailForm] = useState("");
  const [passwordForm, setPasswordForm] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("");
  const [redirect, setRedirect] = useState(false);



  const handleLogin = async (e) => {
    e.preventDefault();
    var email = emailForm;
    var password = passwordForm;
    var userData = {
      email,
      password
    };
    loginUser(userData);
  }

  const loginUser = async (credentials) => {

    axios({
      method: "post",
      url: "http://localhost:5000/login",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({'data':credentials}),
    })
      .then((response) => {
        if (response.data.error) {
          setAlertText(response.data.error);
          setAlert(true);
          setAlertType("error");
        } else {
          setAlertText("Login successfull, redirecting you to your account");
          setAlert(true);
          setAlertType("success");

          localStorage.setItem('currentUser', JSON.stringify(response.data.usrID));

          props.loggedHandler(true, response.data.usrID);
          setTimeout(() => {
            setRedirect(true);
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }


  if (redirect) {
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
                onChange={e => setEmailForm( e.target.value )}
              />
            </Grid>
            <Grid item >
              <TextField
                variant="outlined"
                label="Password"
                type="password"
                onChange={e => setPasswordForm( e.target.value )}
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
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box sx={{ mt: "2vh" }}>
        <Collapse in={alert}>
          <Alert severity={alertType || "warning"}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setAlert(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {alertText}
          </Alert>
        </Collapse>
      </Box>
    </Container>
  );

}

export default Login;