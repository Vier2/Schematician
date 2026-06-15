import 'dotenv/config'   // ESM style — must be first import
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET)
import Fastify from 'fastify'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { yoga } from '../query/request_handler.js'

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

async function Start_Server() {
    await app.listen({
        port: 3000,
        host: '0.0.0.0'
    })

    console.log(`Server running on http://localhost:3000${yoga.graphqlEndpoint}`)
}

Start_Server()