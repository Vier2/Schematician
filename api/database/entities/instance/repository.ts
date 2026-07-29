import { Driver, ManagedTransaction } from 'neo4j-driver'
import type { 
    Search_Query, 
    Cardinality, 
    GraphQL_Instance, 
    GraphQL_Instance_Value,
    GraphQL_Atomic_Instance,
    GraphQL_Composite_Instance, 
    GraphQL_Instance_Object,
    GraphQL_Array_Instance, Data_Type,
    Create_Array_Item_Result,
    Instance_Node_Update,
    Schema_Node_Record,
    Schema_Element_Record
     } from '@schematician/shared'
import { v4 as uuidv4 } from 'uuid'


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
export async function db_remove_array_item(
    driver: Driver,
    user_uid: string,
    array_instance_uid: string,
    item_instance_uid: string
): Promise<boolean> {
    const session =
        driver.session()

    try {
        return await session.executeWrite(
            async transaction => {
                const verification_result =
                    await transaction.run(
                        `
                        MATCH
                            (user:User {
                                uid: $user_uid
                            })
                            -[:OWNS]->
                            (root:Instance)

                        MATCH
                            (root)
                            -[
                                :HAS_OBJECT|HAS_ITEM
                                *0..
                            ]->
                            (array:Instance {
                                uid:
                                    $array_instance_uid,

                                data_type:
                                    'Array'
                            })

                        MATCH
                            (array)
                            -[:HAS_ITEM]->
                            (item:Instance {
                                uid:
                                    $item_instance_uid
                            })

                        RETURN
                            item.uid
                                AS item_uid
                        `,
                        {
                            user_uid,
                            array_instance_uid,
                            item_instance_uid
                        }
                    )

                if (
                    verification_result.records.length ===
                    0
                ) {
                    return false
                }

                await transaction.run(
                    `
                    MATCH
                        (item:Instance {
                            uid:
                                $item_instance_uid
                        })

                    OPTIONAL MATCH
                        (item)
                        -[
                            :HAS_OBJECT|HAS_ITEM
                            *0..
                        ]->
                        (descendant:Instance)

                    WITH
                        collect(
                            DISTINCT descendant
                        ) AS nodes_to_delete

                    UNWIND
                        nodes_to_delete AS node_to_delete

                    DETACH DELETE
                        node_to_delete
                    `,
                    {
                        item_instance_uid
                    }
                )

                await Reindex_Array_Items_In_Transaction(
                    transaction,
                    array_instance_uid
                )

                return true
            }
        )
    } finally {
        await session.close()
    }
}
async function Reindex_Array_Items_In_Transaction(
    transaction: ManagedTransaction,
    array_instance_uid: string
): Promise<void> {
    const result =
        await transaction.run(
            `
            MATCH
                (array:Instance {
                    uid:
                        $array_instance_uid
                })
                -[
                    relationship:HAS_ITEM
                ]->
                (item:Instance)

            RETURN
                item.uid
                    AS item_uid,

                relationship.index
                    AS current_index

            ORDER BY
                relationship.index
            `,
            {
                array_instance_uid
            }
        )

    for (
        const [new_index, record]
        of result.records.entries()
    ) {
        const item_uid =
            record.get(
                'item_uid'
            ) as string

        await transaction.run(
            `
            MATCH
                (array:Instance {
                    uid:
                        $array_instance_uid
                })
                -[
                    relationship:HAS_ITEM
                ]->
                (item:Instance {
                    uid:
                        $item_uid
                })

            SET
                relationship.index =
                    $new_index
            `,
            {
                array_instance_uid,
                item_uid,
                new_index
            }
        )
    }
}

export async function db_move_array_item(
    driver: Driver,
    user_uid: string,
    array_instance_uid: string,
    item_instance_uid: string,
    target_index: number
): Promise<boolean> {
    const session =
        driver.session()

    try {
        return await session.executeWrite(
            async transaction => {
                const result =
                    await transaction.run(
                        `
                        MATCH
                            (user:User {
                                uid: $user_uid
                            })
                            -[:OWNS]->
                            (root:Instance)

                        MATCH
                            (root)
                            -[
                                :HAS_OBJECT|HAS_ITEM
                                *0..
                            ]->
                            (array:Instance {
                                uid:
                                    $array_instance_uid,

                                data_type:
                                    'Array'
                            })

                        MATCH
                            (array)
                            -[
                                relationship:HAS_ITEM
                            ]->
                            (item:Instance)

                        RETURN
                            item.uid
                                AS item_uid,

                            relationship.index
                                AS current_index

                        ORDER BY
                            relationship.index
                        `,
                        {
                            user_uid,
                            array_instance_uid
                        }
                    )

                if (
                    result.records.length ===
                    0
                ) {
                    return false
                }

                const item_uids =
                    result.records.map(
                        record =>
                            record.get(
                                'item_uid'
                            ) as string
                    )

                const current_index =
                    item_uids.indexOf(
                        item_instance_uid
                    )

                if (current_index === -1) {
                    return false
                }

                if (
                    target_index < 0 ||
                    target_index >=
                    item_uids.length
                ) {
                    throw new Error(
                        [
                            `Target index "${target_index}"`,
                            'is outside the array bounds.'
                        ].join(' ')
                    )
                }

                const [
                    moved_item_uid
                ] =
                    item_uids.splice(
                        current_index,
                        1
                    )

                item_uids.splice(
                    target_index,
                    0,
                    moved_item_uid!
                )

                for (
                    const [index, item_uid]
                    of item_uids.entries()
                ) {
                    await transaction.run(
                        `
                        MATCH
                            (array:Instance {
                                uid:
                                    $array_instance_uid
                            })
                            -[
                                relationship:HAS_ITEM
                            ]->
                            (item:Instance {
                                uid:
                                    $item_uid
                            })

                        SET
                            relationship.index =
                                $index
                        `,
                        {
                            array_instance_uid,
                            item_uid,
                            index
                        }
                    )
                }

                return true
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
export async function db_create_array_item(
    driver: Driver,
    user_uid: string,
    array_instance_uid: string
): Promise<Create_Array_Item_Result> {
    const session =
        driver.session()

    try {
        return await session.executeWrite(
            async transaction => {
                const array_result =
                    await transaction.run(
                        `
                        MATCH
                            (user:User {
                                uid: $user_uid
                            })
                            -[:OWNS]->
                            (root:Instance)

                        MATCH
                            (root)
                            -[
                                :HAS_OBJECT|HAS_ITEM
                                *0..
                            ]->
                            (array:Instance {
                                uid:
                                    $array_instance_uid,

                                data_type:
                                    'Array'
                            })

                        MATCH
                            (array_schema:Schema {
                                uid:
                                    array.schema_uid
                            })
                            -[
                                item_schema_relationship:
                                    HAS_ELEMENT
                            ]->
                            (item_schema:Schema)

                        OPTIONAL MATCH
                            (array)
                            -[
                                existing_relationship:
                                    HAS_ITEM
                            ]->
                            (:Instance)

                        RETURN
                            item_schema.uid
                                AS item_schema_uid,

                            item_schema_relationship.uid
                                AS item_schema_relationship_uid,

                            count(
                                existing_relationship
                            ) AS item_count
                        `,
                        {
                            user_uid,
                            array_instance_uid
                        }
                    )

                if (
                    array_result.records.length ===
                    0
                ) {
                    throw new Error(
                        [
                            `Array instance "${array_instance_uid}"`,
                            'was not found or is not owned by the current user.'
                        ].join(' ')
                    )
                }

                if (
                    array_result.records.length !==
                    1
                ) {
                    throw new Error(
                        [
                            `The schema for array instance`,
                            `"${array_instance_uid}"`,
                            'must have exactly one item schema.'
                        ].join(' ')
                    )
                }

                const record =
                    array_result.records[0]

                const item_schema_uid =
                    record!.get(
                        'item_schema_uid'
                    ) as string

                const raw_item_count =
                    record!.get(
                        'item_count'
                    )

                const index =
                    typeof raw_item_count ===
                        'number'
                        ? raw_item_count
                        : raw_item_count.toNumber()

                const item =
                    await Create_Instance_From_Schema_In_Transaction(
                        transaction,
                        item_schema_uid,
                        user_uid
                    )

                await transaction.run(
                    `
                    MATCH
                        (array:Instance {
                            uid:
                                $array_instance_uid
                        })

                    MATCH
                        (item:Instance {
                            uid:
                                $item_instance_uid
                        })

                    CREATE
                        (array)-[
                            relationship:HAS_ITEM {
                                index:
                                    $index
                            }
                        ]->(item)
                    `,
                    {
                        array_instance_uid,

                        item_instance_uid:
                            item.uid,

                        index
                    }
                )

                return {
                    item,
                    index
                }
            }
        )
    } finally {
        await session.close()
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
    const session =
        driver.session()

    try {
        return await session.executeRead(
            transaction =>
                Get_Instance_By_UID_In_Transaction(
                    transaction,
                    user_uid,
                    instance_uid
                )
        )
    } finally {
        await session.close()
    }
}

async function Get_Composite_Instance_Objects_In_Transaction(
    transaction: ManagedTransaction,
    user_uid: string,
    composite_instance_uid: string
): Promise<GraphQL_Instance_Object[]> {
    const result =
        await transaction.run(
            `
            MATCH
                (user:User {
                    uid: $user_uid
                })
                -[:OWNS]->
                (composite:Instance {
                    uid: $composite_instance_uid,
                    data_type: 'Composite'
                })

            MATCH
                (composite)
                -[
                    relationship:HAS_OBJECT
                ]->
                (child:Instance)

            RETURN
                relationship.element_relationship_uid
                    AS element_relationship_uid,

                child.uid
                    AS child_instance_uid,

                relationship.index
                    AS relationship_index

            ORDER BY
                relationship.index
            `,
            {
                user_uid,
                composite_instance_uid
            }
        )

    const objects:
        GraphQL_Instance_Object[] = []

    for (const record of result.records) {
        const child_instance_uid =
            record.get(
                'child_instance_uid'
            ) as string

        const child_instance =
            await Get_Instance_By_UID_In_Transaction(
                transaction,
                user_uid,
                child_instance_uid
            )

        if (!child_instance) {
            throw new Error(
                [
                    `Composite instance "${composite_instance_uid}"`,
                    `references missing child instance "${child_instance_uid}".`
                ].join(' ')
            )
        }

        objects.push({
            element_relationship_uid:
                record.get(
                    'element_relationship_uid'
                ) as string,

            instance:
                child_instance
        })
    }

    return objects
}

async function Get_Array_Instance_Items_In_Transaction(
    transaction: ManagedTransaction,
    user_uid: string,
    array_instance_uid: string
): Promise<GraphQL_Instance[]> {
    const result =
        await transaction.run(
            `
            MATCH
                (user:User {
                    uid: $user_uid
                })
                -[:OWNS]->
                (array:Instance {
                    uid: $array_instance_uid,
                    data_type: 'Array'
                })

            MATCH
                (array)
                -[
                    relationship:HAS_ITEM
                ]->
                (item:Instance)

            RETURN
                item.uid
                    AS item_instance_uid,

                relationship.index
                    AS item_index

            ORDER BY
                relationship.index
            `,
            {
                user_uid,
                array_instance_uid
            }
        )

    const items:
        GraphQL_Instance[] = []

    for (const record of result.records) {
        const item_instance_uid =
            record.get(
                'item_instance_uid'
            ) as string

        const item =
            await Get_Instance_By_UID_In_Transaction(
                transaction,
                user_uid,
                item_instance_uid
            )

        if (!item) {
            throw new Error(
                [
                    `Array instance "${array_instance_uid}"`,
                    `references missing item instance "${item_instance_uid}".`
                ].join(' ')
            )
        }

        items.push(item)
    }

    return items
}
async function Get_Instance_By_UID_In_Transaction(
    transaction: ManagedTransaction,
    user_uid: string,
    instance_uid: string
): Promise<GraphQL_Instance | null> {
    const result =
        await transaction.run(
            `
            MATCH
                (user:User {
                    uid: $user_uid
                })
                -[:OWNS]->
                (instance:Instance {
                    uid: $instance_uid
                })

            OPTIONAL MATCH
                (instance)
                -[:HAS_VALUE]->
                (instance_value:InstanceValue)

            RETURN
                instance,
                instance_value
            `,
            {
                user_uid,
                instance_uid
            }
        )

    const record =
        result.records[0]

    if (!record) {
        return null
    }

    const instance_properties =
        record.get('instance').properties

    const data_type =
        instance_properties.data_type as
        GraphQL_Instance['data_type']

    const schema_uid =
        instance_properties.schema_uid as string

    switch (data_type) {
        case 'String':
        case 'Number':
        case 'Boolean': {
            const instance_value_node =
                record.get(
                    'instance_value'
                )

            return {
              

                uid:
                    instance_properties.uid,

                schema_uid,

                data_type,

                value:
                    instance_value_node
                        ? instance_value_node
                            .properties
                            .value
                        : null
            }
        }

        case 'Composite': {
            const objects =
                await Get_Composite_Instance_Objects_In_Transaction(
                    transaction,
                    user_uid,
                    instance_uid
                )

            return {


                uid:
                    instance_properties.uid,

                schema_uid,

                data_type:
                    'Composite',

                objects
            }
        }

        case 'Array': {
            const items =
                await Get_Array_Instance_Items_In_Transaction(
                    transaction,
                    user_uid,
                    instance_uid
                )

            return {
               

                uid:
                    instance_properties.uid,

                schema_uid,

                data_type:
                    'Array',

                items
            }
        }

        default: {
            const exhaustive_check: never =
                data_type

            throw new Error(
                `Unsupported instance data type: ${exhaustive_check}`
            )
        }
    }
}
export function Collect_Instance_Values(
    instance: GraphQL_Instance,
    values: GraphQL_Instance_Value[] = []
): GraphQL_Instance_Value[] {
    if (
        instance.data_type === 'String' ||
        instance.data_type === 'Number' ||
        instance.data_type === 'Boolean'
    ) {
        values.push({
            instance_uid:
                instance.uid,

            schema_uid:
                instance.schema_uid,

            value:
                instance.value
        })

        return values
    }

    if (instance.data_type === 'Composite') {
        for (const object of instance.objects) {
            Collect_Instance_Values(
                object.instance,
                values
            )
        }

        return values
    }
    if (instance.data_type === 'Array') {

        for (const item of instance.items) {
            Collect_Instance_Values(
                item,
                values
            )
        }
    }

    return values
}
export async function db_update_instance_values(
    driver: Driver,
    user_uid: string,
    root_instance_uid: string,
    values: GraphQL_Instance_Value[]
): Promise<GraphQL_Instance_Value[]> {
    if (values.length === 0) {
        return []
    }

    const session =
        driver.session()

    try {
        return await session.executeWrite(
            async transaction => {
                const result =
                    await transaction.run(
                        `
                        MATCH
                            (user:User {
                                uid: $user_uid
                            })
                            -[:OWNS]->
                            (root:Instance {
                                uid: $root_instance_uid
                            })

                        UNWIND
                            $values AS value_update

                        MATCH path =
                            (root)
                            -[:HAS_OBJECT|HAS_ITEM*0..]->
                            (instance:Instance {
                                uid:
                                    value_update.instance_uid
                            })

                        SET
                            instance.value_json =
                                value_update.value_json

                        RETURN
                            instance.uid AS instance_uid,
                            instance.schema_uid AS schema_uid,
                            instance.value_json AS value_json
                        `,
                        {
                            user_uid,
                            root_instance_uid,

                            values:
                                values.map(value => ({
                                    instance_uid:
                                        value.instance_uid,

                                    value_json:
                                        value.value === null
                                            ? null
                                            : JSON.stringify(
                                                value.value
                                            )
                                }))
                        }
                    )

                return result.records.map(
                    record => {
                        const value_json =
                            record.get(
                                'value_json'
                            ) as string | null

                        return {
                            instance_uid:
                                record.get(
                                    'instance_uid'
                                ),

                            schema_uid:
                                record.get(
                                    'schema_uid'
                                ),

                            value:
                                value_json === null
                                    ? null
                                    : JSON.parse(
                                        value_json
                                    )
                        }
                    }
                )
            }
        )
    } finally {
        await session.close()
    }
}
function Collect_Instance_Node_Updates(
    instance: GraphQL_Instance,
    updates: Instance_Node_Update[] = []
): Instance_Node_Update[] {
    const is_atomic =
        instance.data_type ===
        'String' ||
        instance.data_type ===
        'Number' ||
        instance.data_type ===
        'Boolean'

    updates.push({
        uid:
            instance.uid,

        schema_uid:
            instance.schema_uid,

        data_type:
            instance.data_type,

        value_json:
            is_atomic &&
                instance.value !== null
                ? JSON.stringify(
                    instance.value
                )
                : null
    })

    if (
        instance.data_type ===
        'Composite'
    ) {
        for (
            const object
            of instance.objects
        ) {
            Collect_Instance_Node_Updates(
                object.instance,
                updates
            )
        }
    }

    if (
        instance.data_type ===
        'Array'
    ) {
        for (
            const item
            of instance.items
        ) {
            Collect_Instance_Node_Updates(
                item,
                updates
            )
        }
    }

    return updates
}
async function Get_Schema_Node_In_Transaction(
    transaction: ManagedTransaction,
    schema_uid: string
): Promise<{
    schema: Schema_Node_Record
    elements: Schema_Element_Record[]
}> {
    const result =
        await transaction.run(
            `
            MATCH
                (schema:Schema {
                    uid: $schema_uid
                })

            OPTIONAL MATCH
                (schema)
                -[
                    element_relationship:
                        HAS_ELEMENT
                ]->
                (child_schema:Schema)

            RETURN
                schema.uid
                    AS schema_uid,

                schema.data_type
                    AS data_type,

                element_relationship.uid
                    AS relationship_uid,

                element_relationship.index
                    AS element_index,

                child_schema.uid
                    AS element_schema_uid

            ORDER BY
                element_relationship.index
            `,
            {
                schema_uid
            }
        )

    if (result.records.length === 0) {
        throw new Error(
            `Schema "${schema_uid}" was not found.`
        )
    }

    const first_record =
        result.records[0]

    const schema: Schema_Node_Record = {
        uid:
            first_record!.get(
                'schema_uid'
            ),

        data_type:
            first_record!.get(
                'data_type'
            )
    }

    const elements: Schema_Element_Record[] =
        result.records.flatMap(
            record => {
                const relationship_uid =
                    record.get(
                        'relationship_uid'
                    )

                const element_schema_uid =
                    record.get(
                        'element_schema_uid'
                    )

                if (
                    !relationship_uid ||
                    !element_schema_uid
                ) {
                    return []
                }

                const raw_index =
                    record.get(
                        'element_index'
                    )

                return [{
                    relationship_uid,

                    index:
                        typeof raw_index ===
                            'number'
                            ? raw_index
                            : raw_index.toNumber(),

                    element_schema_uid
                }]
            }
        )

    return {
        schema,
        elements
    }
}
export async function Create_Instance_From_Schema_In_Transaction(
    transaction: ManagedTransaction,
    schema_uid: string,
    user_id: string
): Promise<GraphQL_Instance> {
    const {
        schema,
        elements
    } =
        await Get_Schema_Node_In_Transaction(
            transaction,
            schema_uid
        )

    const instance_uid =
        uuidv4()

    const instance_shell: GraphQL_Instance = {
        uid:
            instance_uid,

        schema_uid,

        data_type:
            schema.data_type,

        ...(
            schema.data_type === 'Composite'
                ? {
                    objects: []
                }
                : schema.data_type === 'Array'
                    ? {
                        items: []
                    }
                    : {
                        value: null
                    }
        )
    } as GraphQL_Instance

    await Create_Instance_Node(
        transaction,
        user_id,
        instance_shell
    )

    switch (schema.data_type) {
        case 'String':
        case 'Number':
        case 'Boolean':
            return {
                uid:
                    instance_uid,

                schema_uid,

                data_type:
                    schema.data_type,

                value:
                    null
            }

        case 'Composite': {
            const objects:
                GraphQL_Instance_Object[] = []

            for (
                const schema_element
                of elements
            ) {
                const child_instance =
                    await Create_Instance_From_Schema_In_Transaction(
                        transaction,
                        schema_element.element_schema_uid,
                        user_id
                    )

                await transaction.run(
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
                        (parent)-[
                            relationship:HAS_OBJECT {
                                element_relationship_uid:
                                    $element_relationship_uid,

                                index:
                                    $index
                            }
                        ]->(child)
                    `,
                    {
                        parent_instance_uid:
                            instance_uid,

                        child_instance_uid:
                            child_instance.uid,

                        element_relationship_uid:
                            schema_element.relationship_uid,

                        index:
                            schema_element.index
                    }
                )

                objects.push({
                    element_relationship_uid:
                        schema_element.relationship_uid,

                    instance:
                        child_instance
                })
            }

            return {
                uid:
                    instance_uid,

                schema_uid,

                data_type:
                    'Composite',

                objects
            }
        }

        case 'Array': {
            if (elements.length !== 1) {
                throw new Error(
                    [
                        `Array schema "${schema_uid}"`,
                        'must have exactly one HAS_ELEMENT relationship.'
                    ].join(' ')
                )
            }

            /*
             * Arrays are created empty.
             *
             * Each item must be created explicitly through
             * create_array_item.
             */
            return {
                uid:
                    instance_uid,

                schema_uid,

                data_type:
                    'Array',

                items:
                    []
            }
        }

        default: {
            const exhaustive_check: never =
                schema.data_type

            throw new Error(
                `Unsupported schema data type: ${exhaustive_check}`
            )
        }
    }
}

export async function db_save_instance(
    driver: Driver,
    user_uid: string,
    instance: GraphQL_Instance
): Promise<GraphQL_Instance | null> {
    const updates =
        Collect_Instance_Node_Updates(
            instance
        )

    const session =
        driver.session()

    try {
        return await session.executeWrite(
            async transaction => {
                const ownership_result =
                    await transaction.run(
                        `
                        MATCH
                            (user:User {
                                uid:
                                    $user_uid
                            })
                            -[:OWNS]->
                            (root:Instance {
                                uid:
                                    $root_instance_uid
                            })

                        RETURN
                            root.uid
                                AS root_uid
                        `,
                        {
                            user_uid,

                            root_instance_uid:
                                instance.uid
                        }
                    )

                if (
                    ownership_result.records.length ===
                    0
                ) {
                    return null
                }

                /*
                 * Confirm that every submitted UID belongs to the
                 * persisted root tree.
                 */
                const submitted_uids =
                    updates.map(
                        update =>
                            update.uid
                    )

                const identity_result =
                    await transaction.run(
                        `
                        MATCH
                            (root:Instance {
                                uid:
                                    $root_instance_uid
                            })

                        MATCH
                            (root)
                            -[
                                :HAS_OBJECT|HAS_ITEM
                                *0..
                            ]->
                            (instance_node:Instance)

                        WHERE
                            instance_node.uid
                            IN $submitted_uids

                        RETURN
                            collect(
                                DISTINCT
                                instance_node.uid
                            ) AS matched_uids
                        `,
                        {
                            root_instance_uid:
                                instance.uid,

                            submitted_uids
                        }
                    )
                const matched_uids =
                    identity_result.records[0]!
                        .get(
                            'matched_uids'
                        ) as string[]

                if (
                    matched_uids.length !==
                    submitted_uids.length
                ) {
                    const matched_uid_set =
                        new Set(
                            matched_uids
                        )

                    const invalid_uids =
                        submitted_uids.filter(
                            uid =>
                                !matched_uid_set.has(
                                    uid
                                )
                        )

                    throw new Error(
                        [
                            'The submitted instance contains nodes',
                            'that do not belong to the persisted root:',
                            invalid_uids.join(', ')
                        ].join(' ')
                    )
                }

                await transaction.run(
                    `
                    UNWIND
                        $updates AS update

                    MATCH
                        (instance_node:Instance {
                            uid:
                                update.uid
                        })

                    SET
                        instance_node.value_json =
                            update.value_json
                    `,
                    {
                        updates
                    }
                )

                return instance
            }
        )
    } finally {
        await session.close()
    }
}
async function Create_Instance_Children_In_Transaction(
    transaction: ManagedTransaction,
    parent_instance: GraphQL_Instance
): Promise<void> {
    if (
        parent_instance.data_type === 'String' ||
        parent_instance.data_type === 'Number' ||
        parent_instance.data_type === 'Boolean'
    ) {
        return
    }

    if (
        parent_instance.data_type ===
        'Composite'
    ) {
        for (
            const [index, object]
            of parent_instance.objects.entries()
        ) {
            const child_instance =
                object.instance

            const child_properties =
                Get_Instance_Node_Properties(
                    child_instance
                )

            const result =
                await transaction.run(
                    `
                    MATCH
                        (parent:Instance {
                            uid: $parent_instance_uid
                        })

                    CREATE
                        (child:Instance $child_properties)

                    CREATE
                        (parent)-[
                            relationship:HAS_OBJECT {
                                element_relationship_uid:
                                    $element_relationship_uid,

                                index:
                                    $index
                            }
                        ]->(child)

                    RETURN child
                    `,
                    {
                        parent_instance_uid:
                            parent_instance.uid,

                        child_properties,

                        element_relationship_uid:
                            object.element_relationship_uid,

                        index
                    }
                )

            if (result.records.length === 0) {
                throw new Error(
                    [
                        'Could not create composite child.',
                        `Parent instance: ${parent_instance.uid}.`,
                        `Child instance: ${child_instance.uid}.`
                    ].join(' ')
                )
            }

            await Create_Instance_Children_In_Transaction(
                transaction,
                child_instance
            )
        }

        return
    }
    if (parent_instance.data_type === 'Array')
    for (
        const [index, item]
        of parent_instance.items.entries()
    ) {
        const item_properties =
            Get_Instance_Node_Properties(
                item
            )

        const result =
            await transaction.run(
                `
                MATCH
                    (parent:Instance {
                        uid: $parent_instance_uid
                    })

                CREATE
                    (item:Instance $item_properties)

                CREATE
                    (parent)-[
                        relationship:HAS_ITEM {
                            index: $index
                        }
                    ]->(item)

                RETURN item
                `,
                {
                    parent_instance_uid:
                        parent_instance.uid,

                    item_properties,

                    index
                }
            )

        if (result.records.length === 0) {
            throw new Error(
                [
                    'Could not create array item.',
                    `Parent instance: ${parent_instance.uid}.`,
                    `Item instance: ${item.uid}.`
                ].join(' ')
            )
        }

        await Create_Instance_Children_In_Transaction(
            transaction,
            item
        )
    }
}

function Get_Instance_Node_Properties(
    instance: GraphQL_Instance
): Record<string, unknown> {
    const properties: Record<string, unknown> = {
        uid:
            instance.uid,

        schema_uid:
            instance.schema_uid,

        data_type:
            instance.data_type,

        value_json:
            null
    }

    if (
        instance.data_type === 'String' ||
        instance.data_type === 'Number' ||
        instance.data_type === 'Boolean'
    ) {
        properties.value_json =
            instance.value === null
                ? null
                : JSON.stringify(
                    instance.value
                )
    }

    return properties
}
export function Validate_Unique_Instance_UIDs(
    instance: GraphQL_Instance,
    encountered_uids:
        Set<string> = new Set()
): void {
    if (encountered_uids.has(instance.uid)) {
        throw new Error(
            `Duplicate instance UID "${instance.uid}" in submitted instance tree.`
        )
    }

    encountered_uids.add(
        instance.uid
    )

    if (instance.data_type === 'Composite') {
        for (const object of instance.objects) {
            Validate_Unique_Instance_UIDs(
                object.instance,
                encountered_uids
            )
        }

        return
    }

    if (instance.data_type === 'Array') {
        for (const item of instance.items) {
            Validate_Unique_Instance_UIDs(
                item,
                encountered_uids
            )
        }
    }
}
export function Validate_Instance_Tree(
    instance: unknown
): asserts instance is GraphQL_Instance {
    if (
        typeof instance !== 'object' ||
        instance === null
    ) {
        throw new Error(
            'Instance must be an object.'
        )
    }

    const candidate =
        instance as Partial<GraphQL_Instance>

    if (
        typeof candidate.uid !== 'string' ||
        candidate.uid.length === 0
    ) {
        throw new Error(
            'Every instance requires a UID.'
        )
    }

    if (
        typeof candidate.schema_uid !== 'string' ||
        candidate.schema_uid.length === 0
    ) {
        throw new Error(
            `Instance "${candidate.uid}" requires a schema UID.`
        )
    }

    switch (candidate.data_type) {
        case 'String':
        case 'Number':
        case 'Boolean': {
            if (!('value' in candidate)) {
                throw new Error(
                    `Atomic instance "${candidate.uid}" requires a value property.`
                )
            }

            return
        }

        case 'Composite': {
            if (
                !('objects' in candidate) ||
                !Array.isArray(candidate.objects)
            ) {
                throw new Error(
                    `Composite instance "${candidate.uid}" requires an objects array.`
                )
            }

            for (const object of candidate.objects) {
                if (
                    typeof object !== 'object' ||
                    object === null ||
                    typeof object.element_relationship_uid !==
                    'string'
                ) {
                    throw new Error(
                        `Composite instance "${candidate.uid}" contains an invalid object.`
                    )
                }

                Validate_Instance_Tree(
                    object.instance
                )
            }

            return
        }

        case 'Array': {
            if (
                !('items' in candidate) ||
                !Array.isArray(candidate.items)
            ) {
                throw new Error(
                    `Array instance "${candidate.uid}" requires an items array.`
                )
            }

            for (const item of candidate.items) {
                Validate_Instance_Tree(item)
            }

            return
        }

        default:
            throw new Error(
                `Instance "${candidate.uid}" has an unsupported data type.`
            )
    }
}
export async function db_get_instance_values(
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