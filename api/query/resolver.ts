import { builder } from "../database/builder.js"
import { Schema_Ref } from "../database/schema.js"
builder.queryType({
    fields: t => ({
        schema: t.field({
            type: Schema_Ref,
            nullable: true,
            args: {
                name: t.arg.string({ required: true })
            },
            resolve: (root, args) => {
                // your data fetching logic here
                return null
            }
        })
    })
})