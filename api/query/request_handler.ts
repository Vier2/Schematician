import { createYoga } from 'graphql-yoga'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { graphql_schema } from '../database/schema.js'
export const yoga = createYoga<{
    req: FastifyRequest
    reply: FastifyReply
}>({
    schema: graphql_schema,
    graphqlEndpoint: '/graphql'
})