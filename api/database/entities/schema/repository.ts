import { Driver, ManagedTransaction } from 'neo4j-driver'
import type { GraphQL_Schema ,GraphQL_Schema_Element,
    GraphQL_Schema_Association,
    JSON_Value,
     Cardinality, Schema_Link_Create_Input } from '@schematician/shared'
import type { Search_Query, Field_Role, Update_Schema_Data } from '@schematician/shared'
import type { Delete_Schema_Result, Data_Type, 
    Schema_Association_Update, Schema_Element_Update_Input } from '@schematician/shared'
import { v4 as uuidv4 } from 'uuid'
import { 
    Execute_Match_Owned_Entities, 
    Execute_Create_Relationship,
    Execute_Match_Related_Entities,

    Execute_Write,
    Execute_Match_Entities,
    Execute_Create_Entity,
    Execute_Create_Owned_Entity,
    Execute_Read } from '../../utils.js'
import type { Relationship_Type } from '@schematician/shared'
export async function db_get_all_schemas(
    driver: Driver,
    user_uid: string
): Promise<GraphQL_Schema[]> {
    return await Execute_Read(
        driver,

        async transaction =>
            await Execute_Match_Owned_Entities(
                transaction,
                {
                    operation:
                        'Match_Owned_Entities',

                    user_uid,

                    entity:
                        'Schema',

                    return:
                        'Many'
                }
            )
    )
}

export async function db_get_schema_by_uid(
    driver: Driver,
    user_uid: string,
    uid: string
): Promise<GraphQL_Schema | null> {
    return await Execute_Read(
        driver,

        async transaction =>
            await Execute_Match_Owned_Entities(
                transaction,
                {
                    operation:
                        'Match_Owned_Entities',

                    user_uid,

                    entity:
                        'Schema',

                    where: {
                        uid
                    },

                    return:
                        'One'
                }
            )
    )
}

async function Create_Schema_Link_In_Transaction(
    transaction: ManagedTransaction,
    user_uid: string,
    composite_schema_uid: string,
    link: Schema_Link_Create_Input
): Promise<void> {
    const parent_schema =
        await Execute_Match_Owned_Entities(
            transaction,
            {
                operation:
                    'Match_Owned_Entities',

                user_uid,

                entity:
                    'Schema',

                where: {
                    uid:
                        composite_schema_uid
                },

                return:
                    'One'
            }
        )


    const child_schema =
        await Execute_Match_Owned_Entities(
            transaction,
            {
                operation:
                    'Match_Owned_Entities',

                user_uid,

                entity:
                    'Schema',

                where: {
                    uid:
                        link.element_schema_uid
                },

                return:
                    'One'
            }
        )


    if (
        !parent_schema ||
        !child_schema
    ) {
        throw new Error(
            [
                `Could not create ${link.role} relationship.`,
                `Parent schema: ${composite_schema_uid}.`,
                `Child schema: ${link.element_schema_uid}.`,
                'The user or one of the schemas was not found.'
            ].join(' ')
        )
    }


    if (
        link.role === 'HAS_ELEMENT'
    ) {
        await Execute_Create_Relationship(
            transaction,
            {
                operation:
                    'Create_Relationship',

                from: {
                    entity:
                        'Schema',

                    where: {
                        uid:
                            composite_schema_uid
                    }
                },

                relationship:
                    'HAS_ELEMENT',

                relationship_properties: {
                    uid:
                        uuidv4(),

                    index:
                        link.properties.index,

                    required:
                        link.properties.required,

                    cardinality:
                        link.properties.cardinality
                },

                to: {
                    entity:
                        'Schema',

                    where: {
                        uid:
                            link.element_schema_uid
                    }
                }
            }
        )

        return
    }


    await Execute_Create_Relationship(
        transaction,
        {
            operation:
                'Create_Relationship',

            from: {
                entity:
                    'Schema',

                where: {
                    uid:
                        composite_schema_uid
                }
            },

            relationship:
                link.role,

            relationship_properties: {
                value:
                    link.properties.value
            },

            to: {
                entity:
                    'Schema',

                where: {
                    uid:
                        link.element_schema_uid
                }
            }
        }
    )
}

export async function db_create_schema(
    driver: Driver,
    user_uid: string,
    schema: GraphQL_Schema
): Promise<GraphQL_Schema> {
    return await Execute_Write(
        driver,

        async transaction => {
            const {
                elements = [],
                properties = [],
                identifiers = [],

                constraints,
                enumerations,
                options,

                ...flat_schema_fields
            } =
                schema


            const node_properties = {
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


           

          


            /*
             * Create the Schema node.
             */
            const created_schema =
                await Execute_Create_Owned_Entity(
                    transaction,
                    {
                        operation:
                            'Create_Owned_Entity',

                        user_uid,

                        entity:
                            'Schema',

                        properties:
                            node_properties
                    }
                )


            /*
             * Elements
             */

            for (
                const [
                    fallback_index,
                    schema_element
                ]
                of elements.entries()
            ) {
                const element_schema_uid =
                    schema_element
                        .element
                        .uid


                if (!element_schema_uid) {
                    throw new Error(
                        [
                            `Element "${schema_element.element.name}"`,
                            'has no UID.',
                            'Referenced schemas must be created',
                            'before they can be linked.'
                        ].join(' ')
                    )
                }


                await Create_Schema_Link_In_Transaction(
                    transaction,
                    user_uid,
                    schema.uid,
                    {
                        role:
                            'HAS_ELEMENT',

                        element_schema_uid,

                        properties: {
                            index:
                                schema_element.index
                                ?? fallback_index,

                            required:
                                schema_element.required,

                            cardinality:
                                schema_element.cardinality
                        }
                    }
                )
            }


            /*
             * Properties
             */

            for (
                const property
                of properties
            ) {
                const property_schema_uid =
                    property.schema.uid


                if (!property_schema_uid) {
                    throw new Error(
                        `Property schema "${property.schema.name}" has no UID.`
                    )
                }


                await Create_Schema_Link_In_Transaction(
                    transaction,
                    user_uid,
                    schema.uid,
                    {
                        role:
                            'HAS_PROPERTY',

                        element_schema_uid:
                            property_schema_uid,

                        properties: {
                            value:
                                property.value
                        }
                    }
                )
            }


            /*
             * Identifiers
             */

            for (
                const identifier
                of identifiers
            ) {
                const identifier_schema_uid =
                    identifier.schema.uid


                if (!identifier_schema_uid) {
                    throw new Error(
                        `Identifier schema "${identifier.schema.name}" has no UID.`
                    )
                }


                await Create_Schema_Link_In_Transaction(
                    transaction,
                    user_uid,
                    schema.uid,
                    {
                        role:
                            'HAS_IDENTIFIER',

                        element_schema_uid:
                            identifier_schema_uid,

                        properties: {
                            value:
                                identifier.value
                        }
                    }
                )
            }


            return created_schema
        }
    )
}


export async function db_create_schema_link(
    driver: Driver,
    user_uid: string,
    composite_schema_uid: string,
    link: Schema_Link_Create_Input
): Promise<GraphQL_Schema | null> {
    return await Execute_Write(
        driver,

        async transaction => {
            await Create_Schema_Link_In_Transaction(
                transaction,
                user_uid,
                composite_schema_uid,
                link
            )


            return await Execute_Match_Owned_Entities(
                transaction,
                {
                    operation:
                        'Match_Owned_Entities',

                    user_uid,

                    entity:
                        'Schema',

                    where: {
                        uid:
                            composite_schema_uid
                    },

                    return:
                        'One'
                }
            )
        }
    )
}


export async function db_get_schema_elements(
    driver: Driver,
    user_uid: string,
    composite_schema_uid: string
): Promise<GraphQL_Schema_Element[]> {
    return await Execute_Read(
        driver,

        async transaction => {
            const parent =
                await Execute_Match_Owned_Entities(
                    transaction,
                    {
                        operation:
                            'Match_Owned_Entities',

                        user_uid,

                        entity:
                            'Schema',

                        where: {
                            uid:
                                composite_schema_uid
                        },

                        return:
                            'One'
                    }
                )


            if (!parent) {
                return []
            }


            const results =
                await Execute_Match_Related_Entities(
                    transaction,
                    {
                        operation:
                            'Match_Related_Entities',

                        from: {
                            entity:
                                'Schema',

                            where: {
                                uid:
                                    composite_schema_uid
                            }
                        },

                        relationship:
                            'HAS_ELEMENT',

                        to:
                            'Schema',

                        direction:
                            'Outgoing',

                        return:
                            'Many',

                        return_mode:
                            'Entity_And_Relationship',

                        order_by_relationship_property:
                            'index'
                    }
                )


            return results.map(
                result => ({
                    element:
                        result.entity,

                    required:
                        result.relationship
                            .required as boolean,

                    cardinality:
                        result.relationship
                            .cardinality as Cardinality,

                    index:
                        Neo4j_Number_To_Number(
                            result.relationship.index
                        ),

                    uid:
                        result.relationship
                            .uid as string
                })
            )
        }
    )
}

function Neo4j_Number_To_Number(
    value: unknown
): number {
    if (
        typeof value === 'object' &&
        value !== null &&
        'toNumber' in value &&
        typeof (
            value as {
                toNumber?: unknown
            }
        ).toNumber === 'function'
    ) {
        return (
            value as {
                toNumber:
                () => number
            }
        ).toNumber()
    }


    return Number(
        value
    )
}
export function Get_JSON_Relationship_Value(
    relationship:
        Record<string, unknown>
): JSON_Value {
    const value =
        relationship.value
        ?? null


    if (
        !Is_JSON_Value(
    
            value
        )
    ) {
        throw new Error(
            'Relationship value is not a valid JSON_Value.'
        )
    }


    return value
}
export function Is_JSON_Value(
    value: unknown
): value is JSON_Value {
    if (
        value === null
    ) {
        return true
    }


    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
    ) {
        return true
    }


    if (
        Array.isArray(
            value
        )
    ) {
        return value.every(
            Is_JSON_Value
        )
    }


    if (
        typeof value === 'object'
    ) {
        return Object.values(
            value
        ).every(
            Is_JSON_Value
        )
    }


    return false
}
export async function db_get_schema_data_type(
    driver: Driver,
    user_uid: string,
    schema_uid: string
): Promise<Data_Type> {
    return await Execute_Read(
        driver,

        async transaction => {
            const schema =
                await Execute_Match_Owned_Entities(
                    transaction,
                    {
                        operation:
                            'Match_Owned_Entities',

                        user_uid,

                        entity:
                            'Schema',

                        where: {
                            uid:
                                schema_uid
                        },

                        return:
                            'One'
                    }
                )


            if (!schema) {
                throw new Error(
                    `Schema ${schema_uid} was not found or is not owned by user ${user_uid}.`
                )
            }


            return schema.data_type
        }
    )
}
export async function db_get_schema_properties(
    driver: Driver,
    user_uid: string,
    schema_uid: string
): Promise<
    GraphQL_Schema_Association[]
> {
    return await Execute_Read(
        driver,

        transaction =>
            Get_Schema_Associations_In_Transaction(
                transaction,
                user_uid,
                schema_uid,
                'HAS_PROPERTY'
            )
    )
}
export function Get_Relationship_Index(
    relationship:
        Record<string, unknown>
): number {
    const index =
        relationship.index


    if (
        index === undefined ||
        index === null
    ) {
        return 999999
    }


    return Neo4j_Number_To_Number(
        index
    )
}

export async function db_get_schema_identifiers(
    driver: Driver,
    user_uid: string,
    schema_uid: string
): Promise<
    GraphQL_Schema_Association[]
> {
    return await Execute_Read(
        driver,

        transaction =>
            Get_Schema_Associations_In_Transaction(
                transaction,
                user_uid,
                schema_uid,
                'HAS_IDENTIFIER'
            )
    )
}


export function Get_Relationship_Types(
    role: Field_Role = 'any'
): Relationship_Type[] {
    switch (role) {
        case 'element':
            return [
                'HAS_ELEMENT'
            ]

        case 'property':
            return [
                'HAS_PROPERTY'
            ]

        case 'identifier':
            return [
                'HAS_IDENTIFIER'
            ]

        case 'any':
            return [
                'HAS_ELEMENT',
                'HAS_PROPERTY',
                'HAS_IDENTIFIER'
            ]
    }
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
async function Replace_Schema_Element_Links(
    transaction: ManagedTransaction,
    user_uid: string,
    composite_schema_uid: string,
    elements: Schema_Element_Update_Input[]
): Promise<void> {
    await transaction.run(
        `
        MATCH
            (user:User {
                uid: $user_uid
            })
            -[:OWNS]->
            (parent:Schema {
                uid: $composite_schema_uid
            })

        OPTIONAL MATCH
            (parent)-[relationship:HAS_ELEMENT]->()

        DELETE relationship
        `,
        {
            user_uid,
            composite_schema_uid
        }
    )

    const relationship_inputs =
        elements.map(schema_element => ({
            relationship_uid:
                schema_element.uid ??
                uuidv4(),

            element_schema_uid:
                schema_element.element_uid,

            index:
                schema_element.index,

            required:
                schema_element.required,

            cardinality:
                schema_element.cardinality
        }))

    await transaction.run(
        `
        UNWIND
            $relationship_inputs
            AS relationship_input

        MATCH
            (user:User {
                uid: $user_uid
            })
            -[:OWNS]->
            (parent:Schema {
                uid: $composite_schema_uid
            })

        MATCH
            (user)
            -[:OWNS]->
            (child:Schema {
                uid:
                    relationship_input.element_schema_uid
            })

        CREATE
            (parent)-[relationship:HAS_ELEMENT {
                uid:
                    relationship_input.relationship_uid,

                index:
                    relationship_input.index,

                required:
                    relationship_input.required,

                cardinality:
                    relationship_input.cardinality
            }]->(child)
        `,
        {
            user_uid,
            composite_schema_uid,
            relationship_inputs
        }
    )
}

async function Replace_Schema_Links(
    transaction: ManagedTransaction,
    user_uid: string,
    composite_schema_uid: string,
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
                uid: $composite_schema_uid
            })

        OPTIONAL MATCH
            (parent)-[old:${relationship_type}]->()

        DELETE old
        `,
        {
            user_uid,
            composite_schema_uid
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
                uid: $composite_schema_uid
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
            composite_schema_uid,
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
                if (elements !== undefined) {
                    await Replace_Schema_Element_Links(
                        transaction,
                        user_uid,
                        uid,
                        elements
                    )
                }

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

export async function Get_Schema_Associations_In_Transaction(
    transaction:
        ManagedTransaction,

    user_uid:
        string,

    schema_uid:
        string,

    relationship:
        'HAS_PROPERTY'
        | 'HAS_IDENTIFIER'
): Promise<
    GraphQL_Schema_Association[]
> {
    const results =
        await Execute_Match_Related_Entities(
            transaction,
            {
                operation:
                    'Match_Related_Entities',

                from: {
                    entity:
                        'Schema',

                    where: {
                        uid:
                            schema_uid
                    },

                    owned_by: {
                        user_uid
                    }
                },

                relationship,

                to:
                    'Schema',

                direction:
                    'Outgoing',

                return:
                    'Many',

                return_mode:
                    'Entity_And_Relationship'
            }
        )


    results.sort(
        (
            first,
            second
        ) =>
            Get_Relationship_Index(
                first.relationship
            )
            -
            Get_Relationship_Index(
                second.relationship
            )
    )


    return results.map(
        result => ({
            schema:
                result.entity,

            value:
                Get_JSON_Relationship_Value(
                    result.relationship
                )
        })
    )
}