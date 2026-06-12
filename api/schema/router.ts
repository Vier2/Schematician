import type { FastifyInstance } from 'fastify'

export default async function Schema_Routes(server: FastifyInstance) {
    server.post('/create_schema', async (request, reply) => {
        return { users: [] }
    })
    server.get('/all_schemas', async (request, reply) => {
        return {schemas: []}

    })
    server.post('update_schema', async (request, reply) => {
        return{updated_schema: ''}
    })

    server.post('/', async (request, reply) => {
        return { created: true }
    })
}