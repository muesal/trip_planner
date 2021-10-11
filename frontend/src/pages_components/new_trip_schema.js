export const schema = {
    type: "object",
    required: ["title", "description", "date", "duration"],
    properties: {
        title: {
            type: "string",
            title: "Title"
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
                    scope: "#/properties/title"
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