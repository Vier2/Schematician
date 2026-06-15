import type { FastifyRequest, FastifyReply } from 'fastify'
import { driver } from './driver.js'
import jwt from 'jsonwebtoken'

// context.ts — back to throwing on missing/invalid token
export interface App_Context {
    req: FastifyRequest
    reply: FastifyReply
    driver: typeof driver
    user: { id: string }
}

export function build_context({ req, reply }: { req: FastifyRequest, reply: FastifyReply }): App_Context {
    const auth_header = req.headers.authorization

    if (!auth_header?.startsWith('Bearer ')) {
        throw new Error('Unauthorized')
    }

    const token = auth_header.split(' ')[1]!
    const secret = process.env.JWT_SECRET!

    try {
        const payload = jwt.verify(token, secret) as { user_id: string }
        return { req, reply, driver, user: { id: payload.user_id } }
    } catch {
        throw new Error('Invalid or expired token')
    }
}