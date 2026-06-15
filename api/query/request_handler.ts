import { createYoga } from 'graphql-yoga'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { graphql_schema } from '../database/schema.js'
import { build_context } from '../database/context.js'

export const yoga = createYoga<{
    req: FastifyRequest
    reply: FastifyReply
}>({
    schema: graphql_schema,
    graphqlEndpoint: '/graphql',
    context: build_context
})