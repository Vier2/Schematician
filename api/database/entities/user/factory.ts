import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { Driver } from 'neo4j-driver'
import { db_create_user, db_get_user_by_email } from './repository.js'

export async function register_user(driver: Driver, username: string, email: string, password: string) {
    const existing = await db_get_user_by_email(driver, email)
    if (existing) {
        throw new Error('User already exists')
    }

    const uid = uuidv4()
    const hashed = await bcrypt.hash(password, 10)
    const user = await db_create_user(driver, uid, username, email, hashed)

    const token = jwt.sign(
        { user_id: user.uid },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    )

    return { user, token }
}

export async function login_user(driver: Driver, email: string, password: string) {
    const user = await db_get_user_by_email(driver, email)
    if (!user) {
        throw new Error('User not found')
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
        throw new Error('Invalid password')
    }

    const token = jwt.sign(
        { user_id: user.uid },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    )

    return { user, token }
}