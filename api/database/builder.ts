import SchemaBuilder from '@pothos/core'
import { GraphQLJSON } from 'graphql-scalars'
import type { App_Context } from './context.js'
import type { JSON_Value } from '@schematician/shared'

export const builder = new SchemaBuilder<{
    Context: App_Context
    Scalars: {
        JSON: { Input: JSON_Value; Output: JSON_Value }
    }
}>({})

builder.addScalarType('JSON', GraphQLJSON)

export const Data_Type_Enum = builder.enumType('Data_Type', {
    values: [
        'String',
        'Number',
        'Boolean',
        'Composite',
        'Array'
    ] as const
})




// ... scalar, enum setup ...

builder.queryType({})
builder.mutationType({})