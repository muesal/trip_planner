export function updateSchemas(fields) {

    if(!fields || (fields.length === 1 && !fields[0].fieldID))
        return false;

    let elements_tmp = []
    let required_tmp = []
    let properties_tmp = {}

    for(let field of fields) {
        properties_tmp[field.fieldName] = {
            type: "string",
            title: field.fieldName + " x" + field.fieldQuantity 
        };

        required_tmp.push(field.fieldName)

        elements_tmp.push({
            type: "Control",
            scope: "#/properties/" + field.fieldName 
        })
    }

    schema.required = required_tmp
    schema.properties = properties_tmp
    uiSchema.elements = elements_tmp
    
    return true;
   
}

export const schema = {
    type: "object",
    required: [""],
    properties: {
    
    }
};

export const uiSchema = {

            type: "VerticalLayout",
            elements: [
            
            ]

};