export const schema = {
    type: "object",
    required: ["section", "quantity", "name"],
    properties: {
        name: {
            type: "string",
            title: "Name"
        },
        section: {
            type: "string",
            title: "Category",
            enum: ["Food", "Gear", "Night stuff"]
        }, 
        quantity: {
            type: "integer", 
            title: "Quantity", 
            minimum: 0
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
                    scope: "#/properties/section",
                },
                {
                    type: "Control",
                    scope: "#/properties/quantity",
                }
            ]

};