import { Driver } from 'neo4j-driver'
import type { GraphQL_Schema } from '../../schema.js'
import type { Search_Query, Field_Role } from './types.js'
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
    index?: number,
    value?: unknown
): Promise<GraphQL_Schema | null> {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(parent:Schema {uid: $parent_schema_uid})
            MATCH (u)-[:OWNS]->(child:Schema {uid: $child_schema_uid})
            MERGE (parent)-[r:${role}]->(child)
            SET r.index = $index,
                r.value = $value
            RETURN parent
            `,
            {
                user_uid,
                parent_schema_uid,
                child_schema_uid,
                index: index ?? null,
                value: value ?? null
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
export async function db_get_schema_properties(
    driver: Driver,
    user_uid: string,
    schema_uid: string
) {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:Schema {uid: $schema_uid})
            MATCH (s)-[r:HAS_PROPERTY]->(child:Schema)
            RETURN child, r
            ORDER BY coalesce(r.index, 999999)
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

export async function db_get_schema_identifiers(
    driver: Driver,
    user_uid: string,
    schema_uid: string
) {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:Schema {uid: $schema_uid})
            MATCH (s)-[r:HAS_IDENTIFIER]->(child:Schema)
            RETURN child, r
            ORDER BY coalesce(r.index, 999999)
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


function Get_Relationship_Types(role: Field_Role = 'any'): string {
    if (role === 'element') return 'HAS_ELEMENT'
    if (role === 'property') return 'HAS_PROPERTY'
    if (role === 'identifier') return 'HAS_IDENTIFIER'

    return 'HAS_ELEMENT|HAS_PROPERTY|HAS_IDENTIFIER'
}

export async function db_search_schemas(
    driver: Driver,
    user_uid: string,
    search_query: Search_Query
): Promise<GraphQL_Schema[]> {
    const session = driver.session()

    const filters = search_query.filters ?? []
    const logic = search_query.logic === 'or' ? 'OR' : 'AND'

    const where_parts: string[] = []
    const match_parts: string[] = []
    const params: Record<string, unknown> = { user_uid }

    filters.forEach((filter, index) => {
        const relationship_types = Get_Relationship_Types(filter.field_role)

        params[`field_uid_${index}`] = filter.field_schema_uid
        params[`value_${index}`] = filter.value

        match_parts.push(`
            OPTIONAL MATCH (s)-[r_${index}:${relationship_types}]->(field_${index}:Schema {uid: $field_uid_${index}})
        `)

        if (
            filter.operator === 'has_field' ||
            filter.operator === 'has_element' ||
            filter.operator === 'has_property' ||
            filter.operator === 'has_identifier'
        ) {
            where_parts.push(`field_${index} IS NOT NULL`)
            return
        }

        if (filter.operator === 'equals') {
            where_parts.push(`field_${index} IS NOT NULL AND r_${index}.value = $value_${index}`)
            return
        }

        if (filter.operator === 'contains') {
            where_parts.push(`
                field_${index} IS NOT NULL
                AND toLower(toString(r_${index}.value))
                    CONTAINS toLower(toString($value_${index}))
            `)
            return
        }

        if (filter.operator === 'greater_than') {
            where_parts.push(`field_${index} IS NOT NULL AND r_${index}.value > $value_${index}`)
            return
        }

        if (filter.operator === 'less_than') {
            where_parts.push(`field_${index} IS NOT NULL AND r_${index}.value < $value_${index}`)
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
            MATCH (u:User {uid: $user_uid})-[:OWNS]->(s:Schema)
            ${match_parts.join('\n')}
            ${where_clause}
            RETURN DISTINCT s
            `,
            params
        )

        return result.records.map(record => record.get('s').properties)
    } finally {
        await session.close()
    }
}