import { builder } from "../../builder.js";
import { db_create_instance } from "./repository.js";
import { Instance_Ref } from "./schema.js";
import type { Data_Type, GraphQL_Instance } from "@schematician/shared";
import { db_get_schema_data_type } from "../schema/repository.js";
import { v4 as uuidv4 } from 'uuid'



function Create_Empty_Instance(
    schema_uid: string,
    data_type: Data_Type
): GraphQL_Instance {
    const base = {
        uid: uuidv4(),
        schema_uid
    }

    switch (data_type) {
        case 'String':
        case 'Number':
        case 'Boolean':
            return {
                ...base,
                data_type,
                value: null
            }

        case 'Composite':
            return {
                ...base,
                data_type,
                objects: []
            }

        case 'Array':
            return {
                ...base,
                data_type,
                items: []
            }

        default: {
            const exhaustive_check: never =
                data_type

            throw new Error(
                `Unsupported schema data type: ${exhaustive_check}`
            )
        }
    }
}
builder.mutationFields(t => ({
    create_instance: t.field({
        type: Instance_Ref,

        args: {
            schema_uid: t.arg.string({
                required: true
            })
        },

        resolve: async (
            _root,
            args,
            context
        ): Promise<GraphQL_Instance> => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }

            const data_type =
                await db_get_schema_data_type(
                    context.driver,
                    context.user.id,
                    args.schema_uid
                )

            const instance =
                Create_Empty_Instance(
                    args.schema_uid,
                    data_type
                )

            return db_create_instance(
                context.driver,
                context.user.id,
                instance
            )
        }
    })
}))
