import axios from 'axios';

export async function retrieveSections() {

    axios({
            method: "get",
            url: "http://127.0.0.1:5000/sections",
            data: {},  // TODO: add userID
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => {
                let sections = []
                for(let section of res.data)
                    sections.push(section.name)

                schema.properties.section.enum = sections
            })
            .catch((err) => {
                console.log(err);
            });
}

export const schema = {
    type: "object",
    required: ["name", "quantity", "section"],
    properties: {
        name: {
            type: "string",
            title: "Name"
        },
        quantity: {
            type: "integer",
            title: "Quantity",
            minimum: 0
        },
        section: {
            type: "string",
            title: "Section",
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
                    scope: "#/properties/quantity",
                },
                {
                    type: "Control",
                    scope: "#/properties/section",
                },
            
            ]

};