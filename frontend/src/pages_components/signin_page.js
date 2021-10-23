import React, { useState } from "react";
import Box from '@mui/material/Box';
import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Redirect } from "react-router";


function Signin(props) {

  const [usernameForm, setUsernameForm] = useState("");
  const [emailForm, setEmailForm] = useState("");
  const [passwordForm, setPasswordForm] = useState("");
  const [confPasswordForm, setConfPasswordForm] = useState("");
  const [usernameValid, setUsernameValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [passValid, setPasswordValid] = useState(true);
  const [confPassValid, setConfPasswordValid] = useState(true);
  const [alert, setAlert] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("");
  const [redirect, setRedirect] = useState(false);



  const checkEmail = async (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  const checkPassword = async (registerPasswd) => {
    var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.:(),;])[A-Za-z\d@$!%*?&.:(),;]{7,25}$/;
    return passw.test(registerPasswd);
  }

  const handleChanges = async (e) => {
    e.preventDefault();
    if (usernameForm.length < 8) {
      setUsernameValid(false);
    }
    else {
      setUsernameValid(true);
    }
    setEmailValid(await checkEmail(emailForm));
    setPasswordValid(await checkPassword(passwordForm));
    if (!passValid || (confPasswordForm !== passwordForm)) {
      setConfPasswordValid(false);
    }
    else {
      setConfPasswordValid(true);
    }
    if (usernameValid && emailValid && passValid && confPassValid) {
      handleRegister();
    }
  }

  const handleRegister = async () => {
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

  const registerUser = async (credentials) => {

    axios({
      method: "post",
      url: "http://localhost:5000/signin",
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(credentials),
    })
      .then((response) => {
        if (response.data.error) {
          setAlertText(response.data.error);
          setAlert(true);
          setAlertType("error");
        }
        if (response.data.msg) {
          setAlertText(response.data.msg);
          setAlert(true);
          setAlertType("success");
          props.loggedHandler(true, response.data.usrID);
          setTimeout(() => {
            setRedirect(true);
          }, 2000);
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
              Sign in
            </Typography>
            <Grid item >
              <TextField
                variant="outlined"
                label="Username"
                onChange={e => setUsernameForm( e.target.value )}
                error={!usernameValid}
                helperText={!usernameValid ? "The username is too short!" : ""}
              />
            </Grid>
            <Grid item >
              <TextField
                variant="outlined"
                label="Email"
                onChange={e => setEmailForm( e.target.value )}
                error={!emailValid}
                helperText={!emailValid ? "You must use a valid email." : ""}
              />
            </Grid>
            <Grid item >
              <TextField
                variant="outlined"
                label="Password"
                type="password"
                onChange={e => setPasswordForm( e.target.value )}
                error={!passValid}
                helperText={!passValid ? "Your password is too weak." : ""}
              />
            </Grid>
            <Grid item >
              <TextField
                variant="outlined"
                label="Confirm Password"
                type="password"
                onChange={e => setConfPasswordForm( e.target.value )}
                error={!confPassValid}
                helperText={!confPassValid ? "Your passwords must match." : ""}
              />
            </Grid>
            <Grid item>
              <Button
                type="button"
                variant="contained"
                onClick={handleChanges}
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