
export const schema = {
    type: "object",
    required: ["email"],
    properties: {
        email: {
            type: "string", 
            title: "Email"
        }
    }
};

export const uiSchema = {

            type: "VerticalLayout",
            elements: [
                {
                    type: "Control",
                    scope: "#/properties/email"
                }
            ]

};