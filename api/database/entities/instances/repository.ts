import { Driver } from 'neo4j-driver'
import type { GraphQL_Instance } from './schema.js'

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
            MATCH (schema:Schema {uid: $schema_uid})

            CREATE (i:Instance {
                uid: $instance_uid,
                schema_uid: $schema_uid
            })

            CREATE (u)-[:OWNS]->(i)
            CREATE (i)-[:INSTANCE_OF]->(schema)

            WITH i
            UNWIND $objects AS object
                MATCH (field:Schema {uid: object.field_schema_uid})
                CREATE (v:InstanceValue {
                    value: object.value,
                    field_schema_uid: object.field_schema_uid
                })
                CREATE (i)-[:HAS_VALUE]->(v)
                CREATE (v)-[:FOR_FIELD]->(field)

            RETURN i
            `,
            {
                user_uid,
                instance_uid: instance.uid,
                schema_uid: instance.schema_uid,
                objects: instance.objects ?? []
            }
        )

        return {
            ...result.records[0]!.get('i').properties,
            objects: instance.objects
        }
    } finally {
        await session.close()
    }
}
export async function db_get_instance_by_uid(
    driver: Driver,
    user_uid: string,
    instance_uid: string
): Promise<GraphQL_Instance | null> {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(i:Instance {uid: $instance_uid})
            OPTIONAL MATCH (i)-[:HAS_VALUE]->(v:InstanceValue)-[:FOR_FIELD]->(field:Schema)

            RETURN i, collect({
                field_schema_uid: field.uid,
                value: v.value
            }) AS objects
            `,
            { user_uid, instance_uid }
        )

        const record = result.records[0]
        if (!record) return null

        return {
            ...record.get('i').properties,
            objects: record.get('objects').filter(
                (object: any) => object.field_schema_uid !== null
            )
        }
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
            MATCH (s:Instance {uid: $uid})
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