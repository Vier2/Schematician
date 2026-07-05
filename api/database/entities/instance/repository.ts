import { Driver } from 'neo4j-driver'
import type { GraphQL_Instance, GraphQL_Instance_Value } from './schema.js'
import type { Search_Query } from '../schema/types.js'
export async function db_get_all_instances(
    driver: Driver,
    user_uid: string
): Promise<GraphQL_Instance[]> {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(i:Instance)
            RETURN i
            `,
            { user_uid }
        )

        return result.records.map(record => ({
            ...record.get('i').properties,
            objects: []
        }))
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
            CALL {
                WITH i
                UNWIND $objects AS object
                MATCH (field:Schema {uid: object.field_schema_uid})
                CREATE (v:InstanceValue {
                    value: object.value,
                    field_schema_uid: object.field_schema_uid
                })
                CREATE (i)-[:HAS_VALUE]->(v)
                CREATE (v)-[:FOR_FIELD]->(field)
                RETURN count(*) AS created_values
            }

            RETURN i
            `,
            {
                user_uid,
                instance_uid: instance.uid,
                schema_uid: instance.schema_uid,
                objects: instance.objects ?? []
            }
        )

        const record = result.records[0]

        if (!record) {
            throw new Error(
                `Instance creation returned no record. Check user_uid=${user_uid} and schema_uid=${instance.schema_uid}`
            )
        }

        return {
            ...record.get('i').properties,
            objects: instance.objects ?? []
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
            RETURN i
            `,
            { user_uid, instance_uid }
        )

        const record = result.records[0]

        return record
            ? {
                ...record.get('i').properties,
                objects: []
            }
            : null
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
} export async function db_get_instance_values(
    driver: Driver,
    user_uid: string,
    instance_uid: string
): Promise<GraphQL_Instance_Value[]> {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(i:Instance {uid: $instance_uid})
            OPTIONAL MATCH (i)-[:HAS_VALUE]->(v:InstanceValue)-[:FOR_FIELD]->(field:Schema)
            RETURN collect({
                field_schema_uid: field.uid,
                value: v.value
            }) AS objects
            `,
            { user_uid, instance_uid }
        )

        const objects = result.records[0]?.get('objects') ?? []

        return objects.filter(
            (object: GraphQL_Instance_Value) =>
                object.field_schema_uid !== null
        )
    } finally {
        await session.close()
    }
}

export async function db_search_instances(
    driver: Driver,
    user_uid: string,
    search_query: Search_Query
): Promise<GraphQL_Instance[]> {
    const session = driver.session()

    const filters = search_query.filters ?? []
    const logic = search_query.logic === 'or' ? 'OR' : 'AND'

    const where_parts: string[] = []
    const match_parts: string[] = []
    const params: Record<string, unknown> = { user_uid }

    filters.forEach((filter, index) => {
        params[`field_uid_${index}`] = filter.field_schema_uid
        params[`value_${index}`] = filter.value

        match_parts.push(`
            OPTIONAL MATCH (i)-[:HAS_VALUE]->(v_${index}:InstanceValue)-[:FOR_FIELD]->(field_${index}:Schema {uid: $field_uid_${index}})
        `)

        if (filter.operator === 'has_field') {
            where_parts.push(`field_${index} IS NOT NULL`)
            return
        }

        if (filter.operator === 'equals') {
            where_parts.push(`field_${index} IS NOT NULL AND v_${index}.value = $value_${index}`)
            return
        }

        if (filter.operator === 'contains') {
            where_parts.push(`
                field_${index} IS NOT NULL
                AND toLower(toString(v_${index}.value))
                    CONTAINS toLower(toString($value_${index}))
            `)
            return
        }

        if (filter.operator === 'greater_than') {
            where_parts.push(`field_${index} IS NOT NULL AND v_${index}.value > $value_${index}`)
            return
        }

        if (filter.operator === 'less_than') {
            where_parts.push(`field_${index} IS NOT NULL AND v_${index}.value < $value_${index}`)
            return
        }
    })

    const where_clause =
        where_parts.length > 0
            ? `WHERE ${where_parts.join(` ${logic} `)}`
            : ''

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(i:Instance)
            ${match_parts.join('\n')}
            ${where_clause}
            RETURN DISTINCT i
            `,
            params
        )

        return result.records.map(record => ({
            ...record.get('i').properties,
            objects: []
        }))
    } finally {
        await session.close()
    }
}