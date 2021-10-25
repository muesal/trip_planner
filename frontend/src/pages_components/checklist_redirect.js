/* eslint-disable react-hooks/exhaustive-deps */

import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';


function Checklist_redirect(props) {

    const [trip, setTrip] = useState(null);


    useEffect(() => {
        axios({
            method: "get",
            url: "http://127.0.0.1:5000/checklist",
            credentials: 'include',
            data: {},
            headers: {
                "Content-Type": "application/json",
                'Authorization': "Bearer " + localStorage.getItem('REACT_TOKEN_AUTH_KEY').replaceAll("\"", "")
            },
        })
            .then((res) => {
                setTrip(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [])

  if (trip) {
    return <Redirect to={"/checklist/" + trip} />
  }
  return(
        <>
          <p>You should be redirected to <a href={"/checklist/" + trip}>checklist</a>.</p>
        </>

    );

}

export default Checklist_redirect