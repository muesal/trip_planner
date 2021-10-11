export const schema = {
    type: "object",
    required: ["rsName", "rsCat"],
    properties: {
        rsName: {
            type: "string",
            title: "Name"
        },
        rsCat: {
            type: "string",
            title: "Category",
            enum: ["Food", "Gear", "Night stuff"]
        }
    }
};

export const uiSchema = {

            type: "VerticalLayout",
            elements: [
                {
                    type: "Control",
                    scope: "#/properties/rsName"
                },
                {
                    type: "Control",
                    scope: "#/properties/rsCat",
                }
            ]

};