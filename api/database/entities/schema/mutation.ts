import {
    db_create_schema,
    db_update_schema,
    db_create_schema_link,
    type Schema_Link_Role
} from './repository.js'

import { v4 as uuidv4 } from 'uuid'
import { db_delete_schema } from './repository.js'
import { builder, Data_Type, Data_Type_Ref } from '../../builder.js'
import { Schema_Ref } from '../../schema.js'
import type { Update_Schema_Data, Delete_Schema_Result } from './types.js'
const Schema_Link_Role_Ref =
    builder.enumType('Schema_Link_Role', {
        values: {
            HAS_ELEMENT: { value: 'HAS_ELEMENT' },
            HAS_PROPERTY: { value: 'HAS_PROPERTY' },
            HAS_IDENTIFIER: { value: 'HAS_IDENTIFIER' }
        } as const
    })

/**
* Describes one element/property/identifier connection.
*
* `value` belongs to the relationship, not the child Schema node.
*/
const Schema_Association_Input_Ref =
    builder.inputType(
        'Schema_Association_Input',
        {
            fields: t => ({
                schema_uid: t.string({
                    required: true
                }),

                index: t.int(),

                value: t.field({
                    type: 'JSON'
                })
            })
        }
    )
/**
 * Represents all editable data for one schema.
 */
const Update_Schema_Input_Ref =
    builder.inputType(
        'Update_Schema_Input',
        {
            fields: t => ({
                uid: t.string({
                    required: true
                }),

                name: t.string({
                    required: true
                }),

                data_type: t.field({
                    type: Data_Type_Ref,
                    required: true
                }),

                image: t.string(),

                rules: t.string(),

                logic: t.string(),

                relationships: t.string(),

                constraints: t.field({
                    type: 'JSON'
                }),

                enumerations: t.field({
                    type: ['JSON']
                }),

                options: t.field({
                    type: ['JSON']
                }),

                elements: t.field({
                    type: [
                        Schema_Association_Input_Ref
                    ]
                }),

                properties: t.field({
                    type: [
                        Schema_Association_Input_Ref
                    ]
                }),

                identifiers: t.field({
                    type: [
                        Schema_Association_Input_Ref
                    ]
                })
            })
        }
    )



const Delete_Schema_Result_Ref =
    builder.objectRef<Delete_Schema_Result>(
        'Delete_Schema_Result'
    )

Delete_Schema_Result_Ref.implement({
    fields: t => ({
        success: t.exposeBoolean('success'),

        message: t.exposeString('message'),

        deleted_uid: t.exposeString(
            'deleted_uid',
            {
                nullable: true
            }
        )
    })
})

builder.mutationFields(t => ({
    create_schema: t.field({
        type: Schema_Ref,
        args: {
            name: t.arg.string({ required: true }),
            data_type: t.arg({ type: Data_Type_Ref, required: true })
        },
        resolve: (_root, args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }

            return db_create_schema(context.driver, context.user.id, {
                ...args,
                uid: uuidv4()
            } as any)
        }
    }),

    /**
      * Replaces the editable state of an existing schema.
      *
      * Because this receives the whole schema, omitted relationship
      * lists are interpreted as empty lists.
      */
    update_schema: t.field({
        type: Schema_Ref,
        nullable: true,

        args: {
            schema: t.arg({
                type: Update_Schema_Input_Ref,
                required: true
            })
        },

        resolve: (_root, args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }

            return db_update_schema(
                context.driver,
                context.user.id,
                args.schema as Update_Schema_Data
            )
        }
    }),

    delete_schema: t.field({
        type: Delete_Schema_Result_Ref,

        args: {
            uid: t.arg.string({
                required: true
            })
        },

        resolve: (_root, args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }

            return db_delete_schema(
                context.driver,
                context.user.id,
                args.uid
            )
        }
    }),
    create_schema_link: t.field({
        type: Schema_Ref,
        nullable: true,
        args: {
            parent_schema_uid: t.arg.string({ required: true }),
            child_schema_uid: t.arg.string({ required: true }),
            role: t.arg({
                type: Schema_Link_Role_Ref,
                required: true
            }),
            index: t.arg.int(),
            value: t.arg({ type: 'JSON' })
        },
        resolve: (_root, args, context) => {
            if (!context.user) throw new Error('Unauthorized')

            return db_create_schema_link(
                context.driver,
                context.user.id,
                args.parent_schema_uid,
                args.child_schema_uid,
                args.role as Schema_Link_Role,
                args.index ?? undefined,
                args.value ?? undefined
            )
        }
    })
}))