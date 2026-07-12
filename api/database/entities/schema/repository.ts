import { Driver, ManagedTransaction } from 'neo4j-driver'
import type { GraphQL_Schema } from '../../schema.js'
import type { Search_Query, Field_Role, Update_Schema_Data } from './types.js'
import type { Delete_Schema_Result, Schema_Association_Update } from './types.js'
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

async function Create_Schema_Link_In_Transaction(
    transaction: ManagedTransaction,
    user_uid: string,
    parent_schema_uid: string,
    child_schema_uid: string,
    role: Schema_Link_Role,
    index?: number,
    value?: unknown
): Promise<void> {
    const result = await transaction.run(
        `
        MATCH
            (u:User {uid: $user_uid})
            -[:OWNS]->
            (parent:Schema {uid: $parent_schema_uid})

        MATCH
            (u)-[:OWNS]->
            (child:Schema {uid: $child_schema_uid})

        MERGE
            (parent)-[relationship:${role}]->(child)

        SET
            relationship.index = $index,
            relationship.value = $value
        `,
        {
            user_uid,
            parent_schema_uid,
            child_schema_uid,
            index: index ?? null,
            value: value ?? null
        }
    )

    if (result.summary.counters.updates().relationshipsCreated === 0) {
        /*
         * MERGE may have matched an existing relationship, so this does not
         * always indicate failure. The MATCH clauses failing would simply
         * produce no records, however.
         */
    }
}
export async function db_create_schema(
    driver: Driver,
    user_uid: string,
    schema: GraphQL_Schema
): Promise<GraphQL_Schema> {
    const session = driver.session()

    try {
        return await session.executeWrite(
            async transaction => {
                const {
                    elements = [],
                    properties = [],
                    identifiers = [],

                    constraints,
                    enumerations,
                    options,

                    ...flat_schema_fields
                } = schema

                /*
                 * Neo4j node properties cannot contain arbitrary nested
                 * objects or arrays of objects.
                 *
                 * Store JSON-compatible structured fields as serialized JSON,
                 * or later represent them with dedicated graph nodes.
                 */
                const node_properties = {
                    ...flat_schema_fields,

                    constraints_json:
                        constraints === undefined
                            ? null
                            : JSON.stringify(constraints),

                    enumerations_json:
                        enumerations === undefined
                            ? null
                            : JSON.stringify(enumerations),

                    options_json:
                        options === undefined
                            ? null
                            : JSON.stringify(options)
                }

                const create_result = await transaction.run(
                    `
                    MATCH (user:User {uid: $user_uid})

                    CREATE (schema:Schema $node_properties)

                    CREATE (user)-[:OWNS]->(schema)

                    RETURN schema
                    `,
                    {
                        user_uid,
                        node_properties
                    }
                )

                const record = create_result.records[0]

                if (!record) {
                    throw new Error(
                        `Could not create schema "${schema.name}". User was not found.`
                    )
                }

                /*
                 * Elements are ordered structural connections.
                 */
                for (const [index, child_schema] of elements.entries()) {
                    if (!child_schema.uid) {
                        throw new Error(
                            `Element "${child_schema.name}" has no uid. ` +
                            'Referenced schemas must be created before they can be linked.'
                        )
                    }

                    await Create_Schema_Link_In_Transaction(
                        transaction,
                        user_uid,
                        schema.uid,
                        child_schema.uid,
                        'HAS_ELEMENT',
                        index
                    )
                }

                /*
                 * Properties are schema associations. Their values belong to
                 * the relationship, not the child Schema node.
                 */
                for (const [index, property] of properties.entries()) {
                    if (!property.schema.uid) {
                        throw new Error(
                            `Property schema "${property.schema.name}" has no uid.`
                        )
                    }

                    await Create_Schema_Link_In_Transaction(
                        transaction,
                        user_uid,
                        schema.uid,
                        property.schema.uid,
                        'HAS_PROPERTY',
                        index,
                        property.value
                    )
                }

                /*
                 * Identifiers follow the same association model.
                 */
                for (const [index, identifier] of identifiers.entries()) {
                    if (!identifier.schema.uid) {
                        throw new Error(
                            `Identifier schema "${identifier.schema.name}" has no uid.`
                        )
                    }

                    await Create_Schema_Link_In_Transaction(
                        transaction,
                        user_uid,
                        schema.uid,
                        identifier.schema.uid,
                        'HAS_IDENTIFIER',
                        index,
                        identifier.value
                    )
                }

                return record.get('schema').properties as GraphQL_Schema
            }
        )
    }
    finally {
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


async function Replace_Schema_Links(
    transaction: ManagedTransaction,
    user_uid: string,
    parent_schema_uid: string,
    relationship_type:
        | 'HAS_ELEMENT'
        | 'HAS_PROPERTY'
        | 'HAS_IDENTIFIER',
    associations: Schema_Association_Update[]
): Promise<void> {
    /*
     * Relationship types cannot be passed as Cypher parameters.
     * The type is safe here because it is restricted by the union.
     */

    await transaction.run(
        `
        MATCH
            (u:User {uid: $user_uid})
            -[:OWNS]->
            (parent:Schema {
                uid: $parent_schema_uid
            })

        OPTIONAL MATCH
            (parent)-[old:${relationship_type}]->()

        DELETE old
        `,
        {
            user_uid,
            parent_schema_uid
        }
    )

    if (associations.length === 0) {
        return
    }

    await transaction.run(
        `
        UNWIND $associations AS association

        MATCH
            (u:User {uid: $user_uid})
            -[:OWNS]->
            (parent:Schema {
                uid: $parent_schema_uid
            })

        MATCH
            (u)-[:OWNS]->
            (child:Schema {
                uid: association.schema_uid
            })

        CREATE
            (parent)-[link:${relationship_type}]->(child)

        SET
            link.index = association.index,
            link.value = association.value
        `,
        {
            user_uid,
            parent_schema_uid,
            associations
        }
    )
}

export async function db_update_schema(
    driver: Driver,
    user_uid: string,
    schema: Update_Schema_Data
): Promise<GraphQL_Schema | null> {
    const session = driver.session()

    try {
        return await session.executeWrite(
            async transaction => {
                const {
                    uid,
                    elements = [],
                    properties = [],
                    identifiers = [],
                    constraints,
                    enumerations,
                    options,
                    ...flat_schema_fields
                } = schema

                /*
                 * Neo4j node properties cannot directly contain arbitrary
                 * nested JavaScript objects.
                 *
                 * JSON fields are serialized here. You could instead create
                 * dedicated nodes later.
                 */
                const node_updates = {
                    ...flat_schema_fields,

                    constraints_json:
                        constraints === undefined
                            ? null
                            : JSON.stringify(
                                constraints
                            ),

                    enumerations_json:
                        enumerations === undefined
                            ? null
                            : JSON.stringify(
                                enumerations
                            ),

                    options_json:
                        options === undefined
                            ? null
                            : JSON.stringify(
                                options
                            )
                }

                const update_result =
                    await transaction.run(
                        `
                        MATCH
                            (u:User {
                                uid: $user_uid
                            })
                            -[:OWNS]->
                            (schema:Schema {
                                uid: $uid
                            })

                        SET schema += $updates

                        RETURN schema
                        `,
                        {
                            user_uid,
                            uid,
                            updates: node_updates
                        }
                    )

                if (
                    update_result.records.length === 0
                ) {
                    return null
                }

                await Replace_Schema_Links(
                    transaction,
                    user_uid,
                    uid,
                    'HAS_ELEMENT',
                    elements
                )

                await Replace_Schema_Links(
                    transaction,
                    user_uid,
                    uid,
                    'HAS_PROPERTY',
                    properties
                )

                await Replace_Schema_Links(
                    transaction,
                    user_uid,
                    uid,
                    'HAS_IDENTIFIER',
                    identifiers
                )

                return update_result.records[0]!
                    .get('schema')
                    .properties as GraphQL_Schema
            }
        )
    }
    finally {
        await session.close()
    }
}

export async function db_delete_schema(
    driver: Driver,
    user_uid: string,
    schema_uid: string
): Promise<Delete_Schema_Result> {
    const session = driver.session()

    try {
        const result = await session.run(
            `
            MATCH
                (u:User {uid: $user_uid})
                -[:OWNS]->
                (schema:Schema {
                    uid: $schema_uid
                })

            WITH schema, schema.uid AS deleted_uid

            DETACH DELETE schema

            RETURN deleted_uid
            `,
            {
                user_uid,
                schema_uid
            }
        )

        const record = result.records[0]

        if (!record) {
            return {
                success: false,
                message:
                    'Schema was not found or is not owned by the current user.'
            }
        }

        return {
            success: true,
            message: 'Schema deleted successfully.',
            deleted_uid:
                record.get('deleted_uid')
        }
    }
    finally {
        await session.close()
    }
}