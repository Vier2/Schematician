import { builder } from "../../builder.js";
import { db_create_instance, 
    db_save_instance,
    db_create_array_item,
    db_remove_array_item,
    db_delete_instance,
    Validate_Instance_Tree, Validate_Unique_Instance_UIDs } from "./repository.js";
import { Instance_Ref } from "./schema.js";
import type { Data_Type,
    Create_Array_Item_Result,
    Delete_Instance_Payload,
     GraphQL_Instance, GraphQL_Instance_Value, JSON_Value } from "@schematician/shared";
import { db_get_schema_data_type } from "../schema/repository.js";
import { v4 as uuidv4 } from 'uuid'


export const Create_Array_Item_Result_Ref =
    builder.objectRef<Create_Array_Item_Result>(
        'Create_Array_Item_Result'
    )

const Delete_Instance_Result_Ref =
        builder.objectRef<Delete_Instance_Payload>(
            'Delete_Instance_Result'
        )

Delete_Instance_Result_Ref.implement({
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
Create_Array_Item_Result_Ref.implement({
    fields: t => ({
        item:
            t.field({
                type:
                    Instance_Ref,

                resolve:
                    result =>
                        result.item
            }),

        index:
            t.int({
                resolve:
                    result =>
                        result.index
            })
    })
})

const Instance_Value_Ref =
    builder.objectRef<GraphQL_Instance_Value>(
        'Instance_Value'
    )

Instance_Value_Ref.implement({
    fields: t => ({
        instance_uid:
            t.exposeString(
                'instance_uid'
            ),

        schema_uid:
            t.exposeString(
                'schema_uid'
            ),

        value:
            t.expose(
                'value',
                {
                    type: 'JSON',
                    nullable: true
                }
            )
    })
})
const Instance_Value_Update_Input_Ref =
    builder.inputRef<GraphQL_Instance_Value>(
        'Instance_Value_Update_Input'
    )

Instance_Value_Update_Input_Ref.implement({
    fields: t => ({
        instance_uid:
            t.string({
                required: true
            }),

        schema_uid:
            t.string({
                required: true
            }),

        value:
            t.field({
                type: 'JSON',
                required: false
            })
    })
})
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
            schema_uid:
                t.arg.string({
                    required: true
                })
        },

        resolve: async (
            _root,
            args,
            context
        ): Promise<GraphQL_Instance> => {
            if (!context.user) {
                throw new Error(
                    'Unauthorized'
                )
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
    }),

    save_instance: t.field({
        type: Instance_Ref,
        nullable: true,

        args: {
            instance:
                t.arg({
                    type: 'JSON',
                    required: true
                })
        },

        resolve: async (
            _root,
            args,
            context
        ): Promise<GraphQL_Instance | null> => {
            if (!context.user) {
                throw new Error(
                    'Unauthorized'
                )
            }

            Validate_Instance_Tree(
                args.instance
            )

            Validate_Unique_Instance_UIDs(
                args.instance
            )

            return db_save_instance(
                context.driver,
                context.user.id,
                args.instance
            )
        }
    }),
    create_array_item: t.field({
        type:
            Create_Array_Item_Result_Ref,

        args: {
            array_instance_uid:
                t.arg.string({
                    required: true
                })
        },

        resolve: async (
            _root,
            args,
            context
        ): Promise<Create_Array_Item_Result> => {
            if (!context.user) {
                throw new Error(
                    'Unauthorized'
                )
            }

            return db_create_array_item(
                context.driver,
                context.user.id,
                args.array_instance_uid
            )
        }
    }),
    remove_array_item: t.field({
        type:
            'Boolean',

        args: {
            array_instance_uid:
                t.arg.string({
                    required: true
                }),

            item_instance_uid:
                t.arg.string({
                    required: true
                })
        },

        resolve: async (
            _root,
            args,
            context
        ): Promise<boolean> => {
            if (!context.user) {
                throw new Error(
                    'Unauthorized'
                )
            }

            return db_remove_array_item(
                context.driver,
                context.user.id,
                args.array_instance_uid,
                args.item_instance_uid
            )
        }
    }),
    delete_instance: t.field({
        type: Delete_Instance_Result_Ref,
    
            args: {
                uid: t.arg.string({
                    required: true
                })
            },
    
            resolve: (_root, args, context) => {
                if (!context.user) {
                    throw new Error('Unauthorized')
                }
    
                return db_delete_instance(
                    context.driver,
                    context.user.id,
                    args.uid
                )
            }
        })
    
    
}))