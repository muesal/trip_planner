export const schema = {
    type: "object",
    required: ["name", "description", "date", "duration"],
    properties: {
        name: {
            type: "string",
            title: "Name"
        },
        description: {
            type: "string",
            title: "Description",
        },
        date: {
            type: "string",
            title: "Date",
        },
        duration: {
            type: "string",
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
                    scope: "#/properties/description",
                },
                {
                    type: "Control",
                    scope: "#/properties/date",
                },
                {
                    type: "Control",
                    scope: "#/properties/duration",
                }
            ]

};