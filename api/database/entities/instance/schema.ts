import { builder } from '../../builder.js'
import { db_get_instance_values } from './repository.js'

export interface GraphQL_Instance_Value {
    field_schema_uid: string
    value: unknown
}

export interface GraphQL_Instance {
    uid: string
    schema_uid: string
    objects: GraphQL_Instance_Value[]
}

const Instance_Value_Ref =
    builder.objectRef<GraphQL_Instance_Value>('Instance_Value')

export const Instance_Ref =
    builder.objectRef<GraphQL_Instance>('Instance')

Instance_Value_Ref.implement({
    fields: t => ({
        field_schema_uid: t.exposeString('field_schema_uid'),

        value: t.field({
            type: 'JSON',
            resolve: object => object.value
        })
    })
})

Instance_Ref.implement({
    fields: t => ({
        uid: t.exposeString('uid'),

        schema_uid: t.exposeString('schema_uid'),

        objects: t.field({
            type: [Instance_Value_Ref],
            resolve: (instance, _args, context) => {
                if (!context.user) {
                    throw new Error('Unauthorized')
                }

                return db_get_instance_values(
                    context.driver,
                    context.user.id,
                    instance.uid
                )
            }
        })
    })
})