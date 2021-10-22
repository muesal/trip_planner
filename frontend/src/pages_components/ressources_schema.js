let  users = [""]

export function updateSchemas(fields) {
        
    if(!fields || (fields.length === 1 && !fields[0].fieldID))
        return false;

    console.log("fields", fields)

    let elements_tmp = []
    let properties_tmp = {}

    for(let field of fields) {
        properties_tmp[field.fieldName] = {
            type: ["string", "null"],
            title: field.fieldName + " x" + field.fieldQuantity,
            enum: users
        };

        elements_tmp.push({
            type: "Control",
            scope: "#/properties/" + field.fieldName 
        })
    }

    schema.properties = properties_tmp
    uiSchema.elements = elements_tmp
    
    return true;
   
}

export async function retrieveUsers(data) {

    users = [null]
    for(let user of data)
        users.push(user.name)

}


export const schema = {
    type: "object",
    required: [],
    properties: {
    }
};

export const uiSchema = {

            type: "VerticalLayout",
            elements: [
            
            ]

};