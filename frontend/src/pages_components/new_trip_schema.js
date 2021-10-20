import axios from 'axios';

export async function retrieveKinds() {

    axios({
            method: "get",
            url: "http://127.0.0.1:5000/kinds",
            data: {},  // TODO: add userID
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => {
                let kinds = []
                for(let kind of res.data)
                    kinds.push(kind.name)

                schema.properties.kind.enum = kinds
            })
            .catch((err) => {
                console.log(err);
            });
}

export const schema = {
    type: "object",
    required: ["name", "content", "location", "date", "duration", "kind"],
    properties: {
        name: {
            type: "string",
            title: "Name"
        },
        content: {
            type: "string",
            title: "Description",
        },
        location: {
            type: "string",
            title: "Location",
        },
        start: {
            type: "string",
            format: "date",
            title: "Date",
        },
        duration: {
            type: "integer",
            title: "Duration",
        }, 
        kind: {
            type: "string",
            title: "Kind",
            enum: [""]
        }
    }
};

export const uiSchema = {

            type: "VerticalLayout",
            elements: [
                {
                    type: "Control",
                    scope: "#/properties/name"
                },
                {
                    type: "Control",
                    scope: "#/properties/content",
                },
                {
                    type: "Control",
                    scope: "#/properties/location",
                },
                {
                    type: "Control",
                    scope: "#/properties/start",
                },
                {
                    type: "Control",
                    scope: "#/properties/duration",
                }, 
                {
                    type: "Control",
                    scope: "#/properties/kind",
                }
            ]

};