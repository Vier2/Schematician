import { builder, Data_Type } from './builder.js'
import { db_get_schema_elements, db_get_schema_properties, db_get_schema_identifiers } from './entities/schema/repository.js'
export interface GraphQL_Constraints {
    minimum_number?: number
    maximum_number?: number
    can_be_positive?: boolean
    can_be_negative?: boolean
    minimum_characters?: number
    maximum_characters?: number
    regex?: string
    lowercase?: boolean
    uppercase?: boolean
}

export interface GraphQL_Schema {
    name: string
    uid: string
    data_type: Data_Type
    image?: string
    rules?: string
    logic?: string
    relationships?: string
    elements?: GraphQL_Schema[]
    properties?: GraphQL_Schema_Association[]
    identifiers?: GraphQL_Schema_Association[]
    constraints?: GraphQL_Constraints
    enumerations?: unknown[]
    options?: unknown[]
}

export interface GraphQL_Schema_Association {
    schema: GraphQL_Schema
    value: unknown
}

const Constraints_Ref =
    builder.objectRef<GraphQL_Constraints>('Constraints')

const Schema_Association_Ref =
    builder.objectRef<GraphQL_Schema_Association>('Schema_Association')

export const Schema_Ref =
    builder.objectRef<GraphQL_Schema>('Schema')

Constraints_Ref.implement({
    fields: t => ({
        minimum_number: t.exposeFloat('minimum_number', { nullable: true }),
        maximum_number: t.exposeFloat('maximum_number', { nullable: true }),
        can_be_positive: t.exposeBoolean('can_be_positive', { nullable: true }),
        can_be_negative: t.exposeBoolean('can_be_negative', { nullable: true }),
        minimum_characters: t.exposeInt('minimum_characters', { nullable: true }),
        maximum_characters: t.exposeInt('maximum_characters', { nullable: true }),
        regex: t.exposeString('regex', { nullable: true }),
        lowercase: t.exposeBoolean('lowercase', { nullable: true }),
        uppercase: t.exposeBoolean('uppercase', { nullable: true })
    })
})

Schema_Association_Ref.implement({
    fields: t => ({
        schema: t.field({
            type: Schema_Ref,
            resolve: association => association.schema
        }),
        value: t.field({
            type: 'JSON',
            resolve: association => association.value
        }),
       

    })
})

Schema_Ref.implement({
    fields: t => ({
        name: t.exposeString('name'),
        uid: t.exposeString('uid'),

        data_type: t.expose('data_type', {
            type: Data_Type
        }),

        image: t.exposeString('image', { nullable: true }),
        rules: t.exposeString('rules', { nullable: true }),
        logic: t.exposeString('logic', { nullable: true }),
        relationships: t.exposeString('relationships', { nullable: true }),

        elements: t.field({
            type: [Schema_Ref],
            nullable: true,
            resolve: (schema, _args, context) => {
                return db_get_schema_elements(
                    context.driver,
                    context.user!.id,
                    schema.uid
                )
            }
        }),

        properties: t.field({
            type: [Schema_Association_Ref],
            nullable: true,
            resolve: (schema, _args, context) => {
                return db_get_schema_properties(
                    context.driver,
                    context.user!.id,
                    schema.uid!
                )
            }
        }),

        identifiers: t.field({
            type: [Schema_Association_Ref],
            nullable: true,
            resolve: (schema, _args, context) => {
                return db_get_schema_identifiers(
                    context.driver,
                    context.user!.id,
                    schema.uid
                )
            }
        }),

        constraints: t.field({
            type: Constraints_Ref,
            nullable: true,
            resolve: schema => schema.constraints
        }),

        enumerations: t.field({
            type: ['JSON'],
            nullable: true,
            resolve: schema => schema.enumerations
        }),

        options: t.field({
            type: ['JSON'],
            nullable: true,
            resolve: schema => schema.options
        })
    })
})