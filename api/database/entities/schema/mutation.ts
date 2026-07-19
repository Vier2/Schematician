import {
    db_create_schema,
    db_update_schema,
    db_create_schema_link,
} from './repository.js'
import { v4 as uuidv4 } from 'uuid'
import { db_delete_schema, db_get_schema_elements } from './repository.js'
import { builder, Data_Type_Enum } from '../../builder.js'
import { Schema_Ref } from '../../schema.js'
import type { Update_Schema_Data, Delete_Schema_Result , GraphQL_Schema_Element} from '@schematician/shared'
import type { GraphQL_Schema_Link_Input, Schema_Element_Update } from './types.js'

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
                    type: Data_Type_Enum,
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
                type: [Schema_Element_Update_Input_Ref]
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
    
    
    export const Cardinality_Enum = builder.enumType(
        'Cardinality',
        {
            values: [
                'Single',
                'Array'
            ] as const
        }
    )
    const Schema_Link_Role_Ref =
        builder.enumType('Schema_Link_Role', {
            values: {
                HAS_ELEMENT: { value: 'HAS_ELEMENT' },
                HAS_PROPERTY: { value: 'HAS_PROPERTY' },
                HAS_IDENTIFIER: { value: 'HAS_IDENTIFIER' }
            } as const
        })

export const Schema_Element_Update_Input_Ref =
    builder.inputRef<Schema_Element_Update>(
        'Schema_Element_Update_Input'
    )

Schema_Element_Update_Input_Ref.implement({
    fields: t => ({
        element_uid: t.string({
            required: true
        }),

        required: t.boolean({
            required: true
        }),

        cardinality: t.field({
            type: Cardinality_Enum,
            required: true
        }),

        index: t.int({
            required: true
        })
    })
})
export const Schema_Element_Ref =
    builder.objectRef<GraphQL_Schema_Element>(
        'Schema_Element'
    )

Schema_Element_Ref.implement({
    fields: t => ({
        element: t.field({
            type: Schema_Ref,
            resolve: schema_element =>
                schema_element.element
        }),

        required: t.exposeBoolean('required'),

        cardinality: t.expose('cardinality', {
            type: Cardinality_Enum
        }),

        index: t.exposeInt('index')
    })
})

export const Schema_Link_Input_Ref =
    builder.inputRef<GraphQL_Schema_Link_Input>(
        'Schema_Link_Input'
    )

Schema_Link_Input_Ref.implement({
    fields: t => ({
        child_schema_uid: t.string({
            required: true
        }),

        role: t.field({
            type: Schema_Link_Role_Ref,
            required: true
        }),

        index: t.int(),

        required: t.boolean(),

        cardinality: t.field({
            type: Cardinality_Enum
        }),

        value: t.field({
            type: 'JSON'
        })
    })
})

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
            data_type: t.arg({ type: Data_Type_Enum, required: true })
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
            parent_schema_uid: t.arg.string({
                required: true
            }),

            link: t.arg({
                type: Schema_Link_Input_Ref,
                required: true
            })
        },

        resolve: (_root, args, context) => {
            if (!context.user) {
                throw new Error('Unauthorized')
            }

            const link = args.link

            if (link.role === 'HAS_ELEMENT') {
                if (
                    link.index == null ||
                    link.required == null ||
                    link.cardinality == null
                ) {
                    throw new Error(
                        'HAS_ELEMENT requires index, required, and cardinality.'
                    )
                }

                return db_create_schema_link(
                    context.driver,
                    context.user.id,
                    args.parent_schema_uid,
                    {
                        role: 'HAS_ELEMENT',
                        child_schema_uid:
                            link.child_schema_uid,
                        properties: {
                            index: link.index,
                            required: link.required,
                            cardinality: link.cardinality
                        }
                    }
                )
            }

            return db_create_schema_link(
                context.driver,
                context.user.id,
                args.parent_schema_uid,
                {
                    role: link.role,
                    child_schema_uid:
                        link.child_schema_uid,
                    properties: {
                        value: link.value
                    }
                }
            )
        }
    })
}))