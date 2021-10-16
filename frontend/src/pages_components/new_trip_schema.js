export const schema = {
    type: "object",
    required: ["name", "content", "location", "date", "duration"],
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
            title: "Date",
        },
        duration: {
            type: "number",
            title: "Duration",
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
                }
            ]

};