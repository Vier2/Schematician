import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { driver } from './driver.js'
export interface App_Context {
    req: FastifyRequest
    reply: FastifyReply
    driver: typeof driver
    user?: { id: string }
}

export function build_context({ req, reply }: {
    req: FastifyRequest
    reply: FastifyReply
}): App_Context {
    const auth_header = req.headers.authorization

    if (!auth_header?.startsWith('Bearer ')) {
        return { req, reply, driver }
    }

    const token = auth_header.split(' ')[1]

    if (!token) {
        return { req, reply, driver }
    }

    const secret = process.env.JWT_SECRET

    if (!secret) {
        throw new Error('Missing JWT_SECRET environment variable')
    }

    try {
        const payload = jwt.verify(token, secret) as { user_id: string }
        return {
            req,
            reply,
            driver,
            user: { id: payload.user_id }
        }
    } catch {
        return { req, reply, driver }
    }
}