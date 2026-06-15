import SchemaBuilder from '@pothos/core'
import { GraphQLJSON } from 'graphql-scalars'
import type { App_Context } from './context.js'

export const builder = new SchemaBuilder<{
    Context: App_Context
    Scalars: {
        JSON: {
            Input: unknown
            Output: unknown
        }
    }
}>({})