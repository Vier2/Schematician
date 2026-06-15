import SchemaBuilder from '@pothos/core'
import { GraphQLJSON } from 'graphql-scalars'
import type { App_Context } from './context.js'

export const builder = new SchemaBuilder<{
    Context: App_Context
    Scalars: {
        JSON: { Input: unknown; Output: unknown }
    }
}>({})

builder.addScalarType('JSON', GraphQLJSON)

export enum Data_Type {
    String = 'String',
    Number = 'Number',
    Boolean = 'Boolean',
    Interface = 'Interface',
    Associative_Array = 'Associative_Array'
}

export const Data_Type_Ref = builder.enumType(Data_Type, {
    name: 'Data_Type'
})


// ... scalar, enum setup ...

builder.queryType({})
builder.mutationType({})