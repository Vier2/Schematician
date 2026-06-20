import { Driver } from 'neo4j-driver'
import type { GraphQL_Schema } from '../../schema.js'

export type Schema_Link_Role =
    | 'HAS_ELEMENT'
    | 'HAS_PROPERTY'
    | 'HAS_IDENTIFIER'

export async function db_get_all_schemas(
    driver: Driver,
    user_uid: string
): Promise<GraphQL_Schema[]> {
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
export async function db_get_schema_by_uid(
    driver: Driver,
    user_uid: string,
    uid: string
): Promise<GraphQL_Schema | null> {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:Schema {uid: $uid})
            RETURN s
            `,
            { user_uid, uid }
        )

        const record = result.records[0]

        return record
            ? record.get('s').properties
            : null
    } finally {
        await session.close()
    }
}
export async function db_create_schema(
    driver: Driver,
    user_uid: string,
    schema: GraphQL_Schema
): Promise<GraphQL_Schema> {
    const session = driver.session()
    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})
            CREATE (s:Schema $schema)
            CREATE (u)-[:OWNS]->(s)
            RETURN s
            `,
            { user_uid, schema }
        )

        return result.records[0]!.get('s').properties
    } finally {
        await session.close()
    }
}

export async function db_update_schema(
    driver: Driver,
    uid: string,
    updates: Partial<GraphQL_Schema>
): Promise<GraphQL_Schema | null> {
    const session = driver.session()
    try {
        const result = await session.run(
            `
            MATCH (s:Schema {uid: $uid})
            SET s += $updates
            RETURN s
            `,
            { uid, updates }
        )

        const record = result.records[0]

        return record ? record.get('s').properties : null
    } finally {
        await session.close()
    }
}

export async function db_create_schema_link(
    driver: Driver,
    user_uid: string,
    parent_schema_uid: string,
    child_schema_uid: string,
    role: Schema_Link_Role,
    index?: number
): Promise<GraphQL_Schema | null> {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(parent:Schema {uid: $parent_schema_uid})
            MATCH (u)-[:OWNS]->(child:Schema {uid: $child_schema_uid})
            MERGE (parent)-[r:${role}]->(child)
            SET r.index = $index
            RETURN parent
            `,
            {
                user_uid,
                parent_schema_uid,
                child_schema_uid,
                index: index ?? null
            }
        )

        const record = result.records[0]

        return record ? record.get('parent').properties : null
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