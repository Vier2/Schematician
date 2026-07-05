import { builder } from "../../builder.js"


const Instance_Value_Input = builder.inputType('Instance_Value_Input', {
    fields: t => ({
        field_schema_uid: t.string({ required: true }),
        value: t.field({
            type: 'JSON',
            required: false
        })
    })
})