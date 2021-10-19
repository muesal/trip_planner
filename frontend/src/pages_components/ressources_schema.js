import axios from 'axios';

export function updateSchemas(fields) {

   
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
        tKind: {
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
                    scope: "#/properties/tKind",
                }
            ]

};