/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { JsonForms } from '@jsonforms/react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { DataGrid } from "@material-ui/data-grid";
import { Box } from '@mui/system';

import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import axios from 'axios';
import { schema, uiSchema } from './create_schema'


function Checklists(props) {

  const [data, setData] = useState();
  const [trips, setTrips] = useState(null);
  const [rows, setRows] = useState(null)
  const apiData = props.apiData;
  const loading = props.loading;
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    getTrips();
    setRows(hardcoded_rows)
  }, [])

  const hardcoded_rows = [{ id: 0, name: "mayonnaise", quantity: 2 }, { id: 1, name: "chicken", quantity: 1 }, { id: 2, name: "chicken", quantity: 1 }, { id: 3, name: "chicken", quantity: 1 }, { id: 4, name: "chicken", quantity: 1 }, { id: 5, name: "chicken", quantity: 1 }]


  const columns = [
    { field: "name", headerName: "Item", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 0.5 },
  ];

  const handleSubmit = async () => {

    if (data && data.rsName && data.rsCat) {

      let bodyFormData = new FormData();
      bodyFormData.append("rsName", data.rsName);
      bodyFormData.append("rsCat", data.rsCat);

      axios({
        method: "post",
        url: "http://127.0.0.1:5000/add-resource",
        data: bodyFormData,
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then((res) => {
          console.log(res);
          props.getData()
        })
        .catch((err) => {
          console.log(err);
        });

    }

  }

  const getTrips = () => {
    axios({
      method: "get",
      url: "http://127.0.0.1:5000/trips",
      data: {},  // TODO: add userID
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        setTrips(res.data)
      })
      .catch((err) => {
        console.log(err);
      });

  }
  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ paddingLeft: "22vw", mt: 5 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `vertical-tab-${index}`,
      'aria-controls': `vertical-tabpanel-${index}`,
    };
  }


  return (

    <Box alignSelf='flex-start' alignContent='center'
      sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', maxHeight: "80vh", width: 1 }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        sx={{ borderRight: 1, borderColor: 'divider' }}
      >
        <Tab label="My list" {...a11yProps(0)} />
        {trips &&
          trips.map((row) => {
            return (
              <Tab label={row.name} {...a11yProps(row.id)} />
            );
          })}
      </Tabs>

      <TabPanel value={value} index={0} sx={{ paddingLeft: 240 }} >
        <DataGrid
          rows={rows || []}
          columns={columns}
          disableColumnMenu={true}
          checkboxSelection={true}
          autoHeight
        />
      </TabPanel>
      {trips &&
        trips.map((row) => {
          return (
            <TabPanel value={value} index={row.id}>
              <DataGrid
                rows={rows || []}
                columns={columns}
                disableColumnMenu={true}
                checkboxSelection={true}
                autoHeight
              />
            </TabPanel>
          );
        })}
      <Box sx={{paddingLeft: "10vw", mt: 5}}>

        <h2> Add Item </h2>

        <JsonForms
          data={data}
          schema={schema}
          uischema={uiSchema}
          renderers={materialRenderers}
          onChange={({ data, errors }) => { setData(data); }}
          cells={materialCells}
        />

        <Button onClick={handleSubmit} style={{ margin: '1%' }} variant="outlined" color="default" >SUBMIT</Button>

        {loading === true ? (
          <div>
            <h2>Loading...</h2>
          </div>
        ) : (
          <section >
            {apiData.map((rs) => {
              const rsId = rs[0];
              const rsName = rs[1];
              const rsCat = rs[2];

              return (
                <div className="rs-container" key={String(rsId)}>
                  <h2>{rsName}</h2>
                  <p>
                    <strong>Category:</strong> {rsCat}
                  </p>
                </div>
              );
            })}
          </section>
        )}
      </Box>
    </Box>
  );

}

export default Checklists