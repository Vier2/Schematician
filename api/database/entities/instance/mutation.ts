import { builder } from "../../builder.js";
import type { GraphQL_Instance } from "./schema.js";
import { db_create_instance } from "./repository.js";
import { v4 as uuidv4 } from 'uuid'
import { Instance_Ref } from "./schema.js";


export const Instance_Value_Input = builder.inputType('Instance_Value_Input', {
    fields: t => ({
        field_schema_uid: t.string({ required: true }),
        value: t.field({
            type: 'JSON',
            required: false
        })
    })
})

builder.mutationFields(t => ({
    create_instance: t.field({
        type: Instance_Ref,
        args: {
            schema_uid: t.arg.string({ required: true }),
            objects: t.arg({
                type: [Instance_Value_Input],
                required: true
            })
        },
        resolve: (_root, args, context) => {
            if (!context.user) throw new Error('Unauthorized')

            return db_create_instance(
                context.driver,
                context.user.id,
                {
                    uid: uuidv4(),
                    schema_uid: args.schema_uid,
                    objects: args.objects as any
                }
            )
        }
    })
}))