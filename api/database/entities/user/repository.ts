import { Driver } from 'neo4j-driver'
import type { GraphQL_User } from '@schematician/shared'

export async function db_get_user_by_uuid(driver: Driver, uid: string): Promise<GraphQL_User | null> {
    const session = driver.session()
    try {
        const result = await session.run(
            `MATCH (u:User {uid: $uid}) RETURN u`,
            { uid }
        )
        const record = result.records[0]
        return record ? record.get('u').properties : null
    } finally {
        await session.close()
    }
}

export async function db_get_user_by_email(driver: Driver, email: string): Promise<GraphQL_User | null> {
    const session = driver.session()
    try {
        const result = await session.run(
            `MATCH (u:User {email: $email}) RETURN u`,
            { email }
        )
        const record = result.records[0]
        return record ? record.get('u').properties : null
    } finally {
        await session.close()
    }
}

export async function db_create_user(driver: Driver, uid: string, username: string, email: string, password: string): Promise<GraphQL_User> {
    const session = driver.session()
    try {
        const result = await session.run(
            `CREATE (u:User {uid: $uid, username: $username, email: $email, password: $password}) RETURN u`,
            { uid, username, email, password }
        )
        return result.records[0]!.get('u').properties
    } finally {
        await session.close()
    }
}

export async function db_delete_user(driver: Driver, uid: string): Promise<boolean> {
    const session = driver.session()
    try {
        await session.run(
            `MATCH (u:User {uid: $uid}) DETACH DELETE u`,
            { uid }
        )
        return true
    } finally {
        await session.close()
    }
}


