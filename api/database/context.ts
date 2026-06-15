import type { FastifyRequest, FastifyReply } from 'fastify'
import { driver } from './driver.js'

export interface App_Context {
    req: FastifyRequest
    reply: FastifyReply
    driver: typeof driver
    user?: { id: string }   // populated after JWT verification
}

export function build_context({ req, reply }: { req: FastifyRequest, reply: FastifyReply }): App_Context {
    // verify JWT from Authorization header here, attach user
    return { req, reply, driver }
}