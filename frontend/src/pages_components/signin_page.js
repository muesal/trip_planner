import React, { useState } from "react";
import Box from '@mui/material/Box';
import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Redirect } from "react-router";
import { login } from "../auth/index";


function Signin(props) {

  const [usernameForm, setUsernameForm] = useState("");
  const [emailForm, setEmailForm] = useState("");
  const [passwordForm, setPasswordForm] = useState("");
  const [confPasswordForm, setConfPasswordForm] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passError, setPasswordError] = useState(false);
  const [confPassError, setConfPasswordError] = useState(false);



  const checkEmail = async (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  const checkPassword = async (registerPasswd) => {
    var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.:(),;])[A-Za-z\d@$!%*?&.:(),;]{7,25}$/;
    return passw.test(registerPasswd);
  }

  const validateRegister = async () => {

    var valid = true;

    if (usernameForm.length < 8) {
      setUsernameError(true);
      valid = false;
    }
    else {
      setUsernameError(false);
    }
    var emailvalid = await checkEmail(emailForm);
    if (emailvalid !== true) {
      valid = false;
    }

    setEmailError(!emailvalid);
    var passvalid = await checkPassword(passwordForm);
    if (passvalid !== true) {
      valid = false;
    }
    setPasswordError(!passvalid);
    if (!await checkPassword(confPasswordForm) || (confPasswordForm !== passwordForm)) {
      setConfPasswordError(true);
      valid = false;
    }
    else {
      setConfPasswordError(false);
    }
    return valid;
  }


  const handleRegister = async (e) => {
    e.preventDefault();
    var valid = await validateRegister();
    if (valid) {
      var username = usernameForm;
      var email = emailForm;
      var password = passwordForm;
      var userData = {
        username,
        email,
        password
      };
      registerUser(userData);
    }
  }

  const registerUser = async (credentials) => {
    axios({
      method: "post",
      url: "http://localhost:5000/signin",
      credentials: 'include',
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ 'data': credentials })
    })
      .then((response) => {
        if (response.data.error) {
          setAlertText(response.data.error);
          setAlert(true);
          setAlertType("error");
        }
        else {
          setAlertText("Signin successfull, redirecting you to your account");
          setAlert(true);
          setAlertType("success");

          login(response.data.access_token);

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

      <Box className="greencont"
        sx={{
          display: "flex",
          marginTop: 12,
          justifyContent: "center",
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
            <Typography component="h1" variant="h5" color="black">
              Sign in
            </Typography>
            <Grid item >
              <TextField
                variant="outlined"
                color="success"
                label="Username"
                onChange={e => setUsernameForm(e.target.value)}
                error={usernameError}
                helperText={usernameError ? "The username is too short!" : ""}
              />
            </Grid>
            <Grid item >
              <TextField
                variant="outlined"
                color="success"
                label="Email"
                onChange={e => setEmailForm(e.target.value)}
                error={emailError}
                helperText={emailError ? "You must use a valid email." : ""}
              />
            </Grid>
            <Grid item >
              <TextField
                variant="outlined"
                color="success"
                label="Password"
                type="password"
                onChange={e => setPasswordForm(e.target.value)}
                error={passError}
                helperText={passError ? "Your password is too weak." : ""}
              />
            </Grid>
            <Grid item >
              <TextField
                variant="outlined"
                color="success"
                label="Confirm Password"
                type="password"
                onChange={e => setConfPasswordForm(e.target.value)}
                error={confPassError}
                helperText={confPassError ? "Your passwords must match." : ""}
              />
            </Grid>
            <Grid item>
              <Button
                type="button"
                variant="outlined"
                color="success"
                onClick={handleRegister}
              >
                Sign Up
              </Button>
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

export default Signin;