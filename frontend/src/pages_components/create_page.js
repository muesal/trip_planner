import React, { Fragment, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import Button from '@mui/material/Button';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import axios from 'axios';
import { schema, uiSchema } from './create_schema'


function Create(props) {

    const [data, setData] = useState();
    const apiData = props.apiData;
    const loading = props.loading;

    const handleSubmit = async () => {
       
        if(data && data.rsName && data.rsCat) {

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

    return (

        <Fragment>

            <main>
                <JsonForms
                    data={data}
                    schema={schema}
                    uischema={uiSchema}
                    renderers={materialRenderers}
                    onChange={({ data, errors }) => {setData(data);}}
                    cells={materialCells}
                />

                <Button onClick={handleSubmit} style={{margin:'1%'}} variant="outlined" color="info" >SUBMIT</Button>
                
                {loading === true ? (
                    <div>
                        <h1>Loading...</h1>
                    </div>
                ) : (
                    <section>
                        {apiData.map((rs) => {
                            const rsId = rs[0];
                            const rsName = rs[1];
                            const rsCat = rs[2];

                            return (
                                <div className="rs-container" key={String(rsId)}>
                                    <h1>{rsName}</h1>
                                    <p>
                                        <strong>Category:</strong> {rsCat}
                                    </p>
                                </div>
                            );
                        })}
                    </section>
                )}
            </main>
        </Fragment>
    );
  
}

export default Create