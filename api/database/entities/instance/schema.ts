import { builder } from '../../builder.js'
import type { JSON_Value } from '@schematician/shared'
export interface GraphQL_Instance_Value {
    schema_uid: string
    value: JSON_Value
}

export interface GraphQL_Instance {
    uid: string
    schema_uid: string
    objects?: GraphQL_Instance_Value[]
    /**data type of schema */
    value?: JSON_Value
}

/**type needs to change
 * if the data type of the schema is flat
 * meaning: string, number, etc, no objects,
 * if its nested, than objects
 */
const Instance_Value_Ref =
    builder.objectRef<GraphQL_Instance_Value>('Instance_Value')

export const Instance_Ref =
    builder.objectRef<GraphQL_Instance>('Instance')

Instance_Value_Ref.implement({
    fields: t => ({
        schema_uid: t.exposeString('schema_uid'),

        value: t.field({
            type: 'JSON',
            resolve: instance_value => instance_value.value
        })
    })
})

Instance_Ref.implement({
    fields: t => ({
        uid: t.exposeString('uid'),

        schema_uid: t.exposeString('schema_uid'),

        value: t.field({
            type: 'JSON',
            nullable: true,
            resolve: instance => instance.value
        }),

        objects: t.field({
            type: [Instance_Value_Ref],
            nullable: true,
            resolve: instance => instance.objects
        })
    })
})