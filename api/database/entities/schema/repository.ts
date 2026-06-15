
import { Driver } from 'neo4j-driver'
import type { GraphQL_Schema } from './schema.js'

export async function db_get_all_schemas(driver: Driver, user_uid: string): Promise<GraphQL_Schema[]> {
    const session = driver.session()
    try {
        const result = await session.run(
            `MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:Schema) RETURN s`,
            { user_uid }
        )
        return result.records.map(record => record.get('s').properties)
    } finally {
        await session.close()
    }
}

export async function db_create_schema(driver: Driver, user_uid: string, schema: GraphQL_Schema): Promise<GraphQL_Schema> {
    const session = driver.session()
    try {
        const result = await session.run(
            `MATCH (u:User {uid: $user_uid})
             CREATE (s:Schema $schema)
             CREATE (u)-[:OWNS]->(s)
             RETURN s`,
            { user_uid, schema }
        )
        return result.records[0]!.get('s').properties
    } finally {
        await session.close()
    }
}

export async function db_update_schema(driver: Driver, uid: string, updates: Partial<GraphQL_Schema>): Promise<GraphQL_Schema | null> {
    const session = driver.session()
    try {
        const result = await session.run(
            `MATCH (s:Schema {uid: $uid})
             SET s += $updates
             RETURN s`,
            { uid, updates }
        )
        const record = result.records[0]
        return record ? record.get('s').properties : null
    } finally {
        await session.close()
    }
}