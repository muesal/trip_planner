import React, { useEffect } from "react";
import Box from '@mui/material/Box';
import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

function Account(props) {

  
  const [emailForm, setEmailForm] = useState("");
  const [usernameForm, setUsernameForm] = useState("");
  const [passwordForm, setPasswordForm] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    getData();
  });

  const getData = () => {
    axios({
      method: "get",
      url: "http://127.0.0.1:5000/account",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        'Authorization': "Bearer " + localStorage.getItem('REACT_TOKEN_AUTH_KEY').replaceAll("\"", "")
      },
    })
      .then((res) => {
        setUsr(res.data)
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const setUsr = (data) =>{
    setEmailForm(data.email);
    setUsernameForm(data.username);
    setPasswordForm(data.password);
  }


  const handleUpdate = async (e) => {
    e.preventDefault();
    var id = props.usrID
    var email = emailForm;
    var username = usernameForm;
    var password = passwordForm;
    var userData = {
      id,
      email,
      username,
      password
    };
    updateUser(userData);
  }

  const updateUser = async (credentials) => {

    axios({
      method: "put",
      url: "http://localhost:5000/account",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem('REACT_TOKEN_AUTH_KEY')}`
      },
      data: JSON.stringify({'data': credentials}),
      withCredentials: 'True'
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
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <Container component="main" maxWidth="md">
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
              Your account
            </Typography>
            <Grid item >
              <TextField
                value={usernameForm}
                variant="outlined"
                label="Username"
                onChange={e => setUsernameForm(e.target.value)}
              />
            </Grid>
            <Grid item >
              <TextField
                value={emailForm}
                variant="outlined"
                label="Email"
                onChange={e => setEmailForm(e.target.value)}
              />
            </Grid>
            <Grid item >
              <TextField
                value={passwordForm}
                variant="outlined"
                label="Password"
                type="password"
                onChange={e => setPasswordForm(e.target.value)}
              />
            </Grid>
            <Grid container item>
              <Grid item xs></Grid>
              <Grid item xs>
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleUpdate}
                >
                  Save changes
                </Button>
              </Grid>
              <Grid item xs></Grid>
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

export default Account;