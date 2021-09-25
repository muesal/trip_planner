import React, { Fragment, useState, useEffect } from 'react';
import './App.css';

const App = () => {
    useEffect(() => {
        const getAPI = () => {
            // Change this endpoint to whatever local or online address you have
            // Local PostgreSQL Database
            const API = 'http://127.0.0.1:5000/';

            fetch(API)
                .then((response) => {
                    console.log(response);
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                    setLoading(false);
                    setApiData(data);
                });
        };
        getAPI();
    }, []);
    const [apiData, setApiData] = useState([]);
    const [loading, setLoading] = useState(true);
    return (
        <Fragment>
            <header>
                <h1>Trip Planner - Add Resource</h1>
            </header>
            <div className="form-container">
                <h2>Add Resource</h2>
                <form method="POST" action="http://127.0.0.1:5000/add-resource">
                    <div>
                        <label>Name</label>
                        <input type="text" name="rsName" required />
                    </div>
                    <div>
                        <label>Category (e.g., Food, Gear)</label>
                        <input type="text" name="rsCat" required />
                    </div>
                    <div>
                        <button type="submit">Add Resource</button>
                    </div>
                </form>
            </div>
            <main>
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
};

export default App;
