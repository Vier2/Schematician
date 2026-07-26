import { Driver, ManagedTransaction } from 'neo4j-driver'
import type { 
    Search_Query, 
    Cardinality, 
    GraphQL_Instance, 
    GraphQL_Instance_Value,
    GraphQL_Atomic_Instance,
    GraphQL_Composite_Instance, 
    GraphQL_Instance_Object,
    GraphQL_Array_Instance, Data_Type
     } from '@schematician/shared'



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
        return await session.executeWrite(
            async transaction => {
                await Create_Instance_Recursively(
                    transaction,
                    user_uid,
                    instance
                )

                return instance
            }
        )
    } finally {
        await session.close()
    }
}


async function Create_Instance_Node(
    transaction: ManagedTransaction,
    user_uid: string,
    instance: GraphQL_Instance
): Promise<void> {
    const result = await transaction.run(
        `
        MATCH
            (user:User {
                uid: $user_uid
            })
            -[:OWNS]->
            (schema:Schema {
                uid: $schema_uid
            })

        WHERE schema.data_type = $data_type

        CREATE
            (instance:Instance {
                uid: $instance_uid,
                schema_uid: $schema_uid,
                data_type: $data_type
            })

        CREATE
            (user)-[:OWNS]->(instance)

        CREATE
            (instance)-[:INSTANCE_OF]->(schema)

        RETURN instance
        `,
        {
            user_uid,
            instance_uid: instance.uid,
            schema_uid: instance.schema_uid,
            data_type: instance.data_type
        }
    )

    if (result.records.length === 0) {
        throw new Error(
            [
                'Could not create instance.',
                `user_uid=${user_uid}`,
                `instance_uid=${instance.uid}`,
                `schema_uid=${instance.schema_uid}`,
                `data_type=${instance.data_type}`,
                'Check schema ownership and data-type compatibility.'
            ].join(' ')
        )
    }
}
async function Set_Atomic_Instance_Value(
    transaction: ManagedTransaction,
    instance: GraphQL_Atomic_Instance
): Promise<void> {
    const value_json =
        JSON.stringify(instance.value)

    if (value_json === undefined) {
        throw new Error(
            `Instance ${instance.uid} contains a value that cannot be serialized as JSON.`
        )
    }

    const result = await transaction.run(
        `
        MATCH
            (instance:Instance {
                uid: $instance_uid
            })

        SET instance.value_json = $value_json

        RETURN instance
        `,
        {
            instance_uid: instance.uid,
            value_json
        }
    )

    if (result.records.length === 0) {
        throw new Error(
            `Atomic instance ${instance.uid} was not found after creation.`
        )
    }
}

async function Create_Composite_Instance_Objects(
    transaction: ManagedTransaction,
    user_uid: string,
    instance: GraphQL_Composite_Instance
): Promise<void> {
    const used_schema_element_uids =
        new Set<string>()

    for (const object of instance.objects) {
        if (
            used_schema_element_uids.has(
                object.element_relationship_uid
            )
        ) {
            throw new Error(
                [
                    `Composite instance ${instance.uid}`,
                    'contains more than one value for',
                    `schema element ${object.element_relationship_uid}.`,
                    'Use an array instance for an array-cardinality element.'
                ].join(' ')
            )
        }

        used_schema_element_uids.add(
            object.element_relationship_uid
        )

        await Validate_Composite_Object(
            transaction,
            instance,
            object
        )

        await Create_Instance_Recursively(
            transaction,
            user_uid,
            object.instance
        )

        await Create_Composite_Object_Link(
            transaction,
            instance.uid,
            object
        )
    }
}

async function Create_Composite_Object_Link(
    transaction: ManagedTransaction,
    parent_instance_uid: string,
    object: GraphQL_Instance_Object
): Promise<void> {
    const result = await transaction.run(
        `
        MATCH
            (parent:Instance {
                uid: $parent_instance_uid
            })

        MATCH
            (child:Instance {
                uid: $child_instance_uid
            })

        CREATE
            (parent)
            -[:HAS_OBJECT {
                schema_element_uid:
                    $schema_element_uid
            }]->
            (child)

        RETURN parent
        `,
        {
            parent_instance_uid,
            child_instance_uid:
                object.instance.uid,

            schema_element_uid:
                object.element_relationship_uid
        }
    )

    if (result.records.length === 0) {
        throw new Error(
            [
                'Could not create HAS_OBJECT relationship',
                `from ${parent_instance_uid}`,
                `to ${object.instance.uid}.`
            ].join(' ')
        )
    }
}

async function Validate_Composite_Object(
    transaction: ManagedTransaction,
    parent_instance: GraphQL_Composite_Instance,
    object: GraphQL_Instance_Object
): Promise<void> {
    const result = await transaction.run(
        `
        MATCH
            (composite_schema:Schema {
                uid: $composite_schema_uid
            })
            -[schema_element:HAS_ELEMENT]->
            (element_schema:Schema {
                uid: $element_schema_uid
            })

        WHERE
            schema_element.uid =
                $schema_element_uid

        RETURN
            schema_element.required
                AS required,

            schema_element.cardinality
                AS cardinality,

            element_schema.data_type
                AS element_data_type
        `,
        {
            composite_schema_uid:
                parent_instance.schema_uid,

            schema_element_uid:
                object.element_relationship_uid,

            element_schema_uid:
                object.instance.schema_uid
        }
    )

    const record = result.records[0]

    if (!record) {
        throw new Error(
            [
                `Schema element ${object.element_relationship_uid}`,
                `does not belong to schema ${parent_instance.schema_uid}`,
                'or does not reference child schema',
                `${object.instance.schema_uid}.`
            ].join(' ')
        )
    }

    const cardinality =
        record.get('cardinality') as Cardinality

    if (cardinality === 'Array') {
        /*
         * See the array-cardinality modeling note below.
         */
        throw new Error(
            [
                `Schema element ${object.element_relationship_uid}`,
                'has Array cardinality.',
                'It cannot currently be instantiated as a normal',
                'single composite object.'
            ].join(' ')
        )
    }
}
async function Create_Instance_Recursively(
    transaction: ManagedTransaction,
    user_uid: string,
    instance: GraphQL_Instance
): Promise<void> {
    await Create_Instance_Node(
        transaction,
        user_uid,
        instance
    )

    switch (instance.data_type) {
        case 'String':
        case 'Number':
        case 'Boolean':
            await Set_Atomic_Instance_Value(
                transaction,
                instance
            )

            return

        case 'Composite':
            await Create_Composite_Instance_Objects(
                transaction,
                user_uid,
                instance
            )

            return

        case 'Array':
            await Create_Array_Instance_Items(
                transaction,
                user_uid,
                instance
            )

            return

        default: {
            const exhaustive_check: never =
                instance

            throw new Error(
                `Unsupported instance type: ${JSON.stringify(
                    exhaustive_check
                )
                }`
            )
        }
    }
}

async function Get_Array_Item_Schema_UID(
    transaction: ManagedTransaction,
    array_schema_uid: string
): Promise<string> {
    const result = await transaction.run(
        `
        MATCH
            (array_schema:Schema {
                uid: $array_schema_uid,
                data_type: 'Array'
            })
            -[schema_element:HAS_ELEMENT]->
            (item_schema:Schema)

        RETURN
            item_schema.uid AS item_schema_uid,
            schema_element.cardinality
                AS cardinality,
            schema_element.index
                AS element_index

        ORDER BY schema_element.index
        `,
        {
            array_schema_uid
        }
    )

    if (result.records.length !== 1) {
        throw new Error(
            [
                `Array schema ${array_schema_uid}`,
                'must contain exactly one item-schema element.',
                `Found ${result.records.length}.`
            ].join(' ')
        )
    }

    const record = result.records[0]!

    const cardinality =
        record.get('cardinality') as Cardinality

    if (cardinality !== 'Single') {
        throw new Error(
            [
                `Array schema ${array_schema_uid}`,
                'must define its item element with',
                'Single cardinality.',
                'The Array schema itself supplies',
                'the repeated cardinality.'
            ].join(' ')
        )
    }

    return record.get(
        'item_schema_uid'
    ) as string
}

async function Create_Array_Item_Link(
    transaction: ManagedTransaction,
    array_instance_uid: string,
    item_instance_uid: string,
    index: number
): Promise<void> {
    const result = await transaction.run(
        `
        MATCH
            (array_instance:Instance {
                uid: $array_instance_uid,
                data_type: 'Array'
            })

        MATCH
            (item_instance:Instance {
                uid: $item_instance_uid
            })

        CREATE
            (array_instance)
            -[:HAS_ITEM {
                index: $index
            }]->
            (item_instance)

        RETURN array_instance
        `,
        {
            array_instance_uid,
            item_instance_uid,
            index
        }
    )

    if (result.records.length === 0) {
        throw new Error(
            [
                'Could not create HAS_ITEM relationship',
                `from ${array_instance_uid}`,
                `to ${item_instance_uid}.`
            ].join(' ')
        )
    }
}
async function Create_Array_Instance_Items(
    transaction: ManagedTransaction,
    user_uid: string,
    instance: GraphQL_Array_Instance
): Promise<void> {
    const item_schema_uid =
        await Get_Array_Item_Schema_UID(
            transaction,
            instance.schema_uid
        )

    for (
        let index = 0;
        index < instance.items.length;
        index += 1
    ) {
        const item = instance.items[index]!

        if (item.schema_uid !== item_schema_uid) {
            throw new Error(
                [
                    `Array instance ${instance.uid}`,
                    `requires items of schema ${item_schema_uid},`,
                    `but item ${index} uses schema ${item.schema_uid}.`
                ].join(' ')
            )
        }

        await Create_Instance_Recursively(
            transaction,
            user_uid,
            item
        )

        await Create_Array_Item_Link(
            transaction,
            instance.uid,
            item.uid,
            index
        )
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
            MATCH
                (u:User {uid: $user_uid})
                -[:OWNS]->
                (i:Instance {uid: $instance_uid})

            OPTIONAL MATCH
                (i)-[:HAS_VALUE]->(iv:InstanceValue)

            RETURN
                i,
                collect(
                    CASE
                        WHEN iv IS NULL
                        THEN null
                        ELSE iv.properties
                    END
                ) AS objects
            `,
            {
                user_uid,
                instance_uid
            }
        )

        const record = result.records[0]

        if (!record) {
            return null
        }

        const instance_properties =
            record.get('i').properties

        const objects =
            (
                record.get('objects') as
                Array<GraphQL_Instance_Value | null>
            ).filter(
                (
                    object
                ): object is GraphQL_Instance_Value =>
                    object !== null
            )

        return {
            ...instance_properties,

            objects:
                objects.length > 0
                    ? objects
                    : undefined
        }
    }
    finally {
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
                object.schema_uid !== null
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