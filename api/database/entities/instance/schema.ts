import { builder } from '../../builder.js'
import { Data_Type_Enum } from '../../builder.js'
import type {
    GraphQL_Atomic_Instance,
    GraphQL_Composite_Instance,
    GraphQL_Array_Instance,
    GraphQL_Instance_Object
} from '@schematician/shared'






export const Atomic_Instance_Ref =
    builder.objectRef<GraphQL_Atomic_Instance>(
        'Atomic_Instance'
    )

export const Composite_Instance_Ref =
    builder.objectRef<GraphQL_Composite_Instance>(
        'Composite_Instance'
    )

export const Array_Instance_Ref =
    builder.objectRef<GraphQL_Array_Instance>(
        'Array_Instance'
    )

export const Instance_Object_Ref =
    builder.objectRef<GraphQL_Instance_Object>(
        'Instance_Object'
    )

export const Instance_Ref =
    builder.unionType('Instance', {
        types: [
            Atomic_Instance_Ref,
            Composite_Instance_Ref,
            Array_Instance_Ref
        ],

        resolveType: instance => {
            switch (instance.data_type) {
                case 'String':
                case 'Number':
                case 'Boolean':
                    return Atomic_Instance_Ref

                case 'Composite':
                    return Composite_Instance_Ref

                case 'Array':
                    return Array_Instance_Ref

                default: {
                    const exhaustive_check: never =
                        instance

                    throw new Error(
                        `Unsupported instance type: ${JSON.stringify(
                            exhaustive_check
                        )
                        }`
                    )
                }
            }
        }
    })


Atomic_Instance_Ref.implement({
    fields: t => ({
        uid: t.exposeString('uid'),

        schema_uid:
            t.exposeString('schema_uid'),

        data_type: t.expose('data_type', {
            type: Data_Type_Enum
        }),

        value: t.field({
            type: 'JSON',
            resolve: instance =>
                instance.value
        })
    })
})

Instance_Object_Ref.implement({
    fields: t => ({
        schema_element_uid:
            t.exposeString(
                'schema_element_uid'
            ),

        instance: t.field({
            type: Instance_Ref,
            resolve: instance_object =>
                instance_object.instance
        })
    })
})

Composite_Instance_Ref.implement({
    fields: t => ({
        uid: t.exposeString('uid'),

        schema_uid:
            t.exposeString('schema_uid'),

        data_type: t.expose('data_type', {
            type: Data_Type_Enum
        }),

        objects: t.field({
            type: [Instance_Object_Ref],
            resolve: instance =>
                instance.objects
        })
    })
})

Array_Instance_Ref.implement({
    fields: t => ({
        uid: t.exposeString('uid'),

        schema_uid:
            t.exposeString('schema_uid'),

        data_type: t.expose('data_type', {
            type: Data_Type_Enum
        }),

        items: t.field({
            type: [Instance_Ref],
            resolve: instance =>
                instance.items
        })
    })
})