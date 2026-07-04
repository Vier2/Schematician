import { Driver } from 'neo4j-driver'
import type { GraphQL_Instance } from './schema.js'
export async function db_get_instance_by_uid(
    driver: Driver,
    user_uid: string,
    instance_uid: string
): Promise<GraphQL_Instance | null> {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:Instance {uid: $instance_uid})
            RETURN s
            `,
            { user_uid, instance_uid }
        )

        const record = result.records[0]

        return record
            ? record.get('s').properties
            : null
    } finally {
        await session.close()
    }
}
export async function db_get_all_instances(
    driver: Driver,
    user_uid: string
): Promise<GraphQL_Instance[]> {
    const session = driver.session()
    try {
        const result = await session.run(
            `MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:instance) RETURN s`,
            { user_uid }
        )

        return result.records.map(record => record.get('s').properties)
    } finally {
        await session.close()
    }
}


export async function db_create_instance(
    driver: Driver,
    user_uid: string,
    instance: GraphQL_Instance
): Promise<GraphQL_Instance> {
    const session = driver.session()
    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})
            CREATE (s:instance $instance)
            CREATE (u)-[:OWNS]->(s)
            RETURN s
            `,
            { user_uid, instance }
        )

        return result.records[0]!.get('s').properties
    } finally {
        await session.close()
    }
}


export async function db_update_instance(
    driver: Driver,
    uid: string,
    updates: Partial<GraphQL_Instance>
): Promise<GraphQL_Instance | null> {
    const session = driver.session()
    try {
        const result = await session.run(
            `
            MATCH (s:instance {uid: $uid})
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