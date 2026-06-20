import { Driver } from 'neo4j-driver'

export interface User_Node {
    uid: string
    username: string
    email: string
    password: string
}

export async function db_get_user_by_uuid(driver: Driver, uid: string): Promise<User_Node | null> {
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

export async function db_get_user_by_email(driver: Driver, email: string): Promise<User_Node | null> {
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

export async function db_create_user(driver: Driver, uid: string, username: string, email: string, password: string): Promise<User_Node> {
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

export async function db_get_schema_elements(driver: Driver, user_uid: string, schema_uid: string) {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:Schema {uid: $schema_uid})
            MATCH (s)-[r:HAS_ELEMENT]->(child:Schema)
            RETURN child
            ORDER BY r.index
            `,
            { user_uid, schema_uid }
        )

        return result.records.map(record => record.get('child').properties)
    } finally {
        await session.close()
    }
}

export async function db_get_schema_properties(driver: Driver, user_uid: string, schema_uid: string) {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:Schema {uid: $schema_uid})
            MATCH (s)-[:HAS_PROPERTY]->(child:Schema)
            RETURN child
            `,
            { user_uid, schema_uid }
        )

        return result.records.map(record => ({
            schema: record.get('child').properties,
            value: null
        }))
    } finally {
        await session.close()
    }
}

export async function db_get_schema_identifiers(driver: Driver, user_uid: string, schema_uid: string) {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:Schema {uid: $schema_uid})
            MATCH (s)-[r:HAS_IDENTIFIER]->(child:Schema)
            RETURN child, r
            `,
            { user_uid, schema_uid }
        )

        return result.records.map(record => ({
            schema: record.get('child').properties,
            value: record.get('r').properties.value ?? null
        }))
    } finally {
        await session.close()
    }
}