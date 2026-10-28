import 'dotenv/config'   // ESM style — must be first import
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET)
import Fastify from 'fastify'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { yoga } from '../query/request_handler.js'
import { Asset_Routes } from '../rest/object/router.js'
import fastifyEnv from '@fastify/env'

import type
 { Environment } from './types.js'

const fastify =
    Fastify()

const environment_schema = {
    type: 'object',

    required: [
        'R2_BUCKET_NAME',
        'R2_ACCOUNT_ID',
    ],

    properties: {
        R2_BUCKET_NAME: {
            type: 'string'
        },

        R2_ACCOUNT_ID: {
            type: 'string'
        },

        R2_ACCESS_KEY_ID: {
            type: 'string'
        },

        R2_SECRET_ACCESS_KEY: {
            type: 'string'
        }
    }
}

await fastify.register(
    fastifyEnv,
    {
        schema:
            environment_schema,

        dotenv:
            true
    }
)

declare module 'fastify' {
    interface FastifyInstance {
        config: Environment
    }
}

const app = Fastify()
app.route({
    url: yoga.graphqlEndpoint,
    method: ['GET', 'POST', 'OPTIONS'],
    handler: (request: FastifyRequest, reply: FastifyReply) =>
        yoga.handleNodeRequestAndResponse(request, reply, {
            req: request,
            reply
        })
})

const asset_routes = await
    Asset_Routes({
        r2_bucket_name:
        fastify.config.R2_BUCKET_NAME,
        r2_account_id:
            fastify.config.R2_ACCOUNT_ID
    })


app.register(asset_routes)

async function Start_Server() {
    await app.listen({
        port: 3000,
        host: '0.0.0.0'
    })

    console.log(`Server running on http://localhost:3000${yoga.graphqlEndpoint}`)
}

Start_Server()