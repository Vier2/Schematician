import type { ManagedTransaction, Driver } from "neo4j-driver"
import type { Repository_Operation } from "@schematician/shared"
import type { 
    Match_Entities_Operation,
    Match_Owned_Entities_Operation,
    Create_Owned_Entity_Operation,
    Create_Entity_Operation,
    Update_Entity_Operation,
    Delete_Entity_Operation,
    Match_Related_Entities_Operation,
    Create_Relationship_Operation,
    Delete_Relationship_Operation,
    Return_Cardinality,
    Entity_Label,
    Entity_Reference,
    Related_Entity_Return, 
    Related_Entity_Return_Mode,
    Entity_Return,
    Entity_Type_Map,
 } from "@schematician/shared"
import { 
    Validate_Cypher_Identifier,
    Build_Where_Conditions
 } from "./cypher/utils.js"

export async function Execute_Repository_Operation(
    transaction:
        ManagedTransaction,

    operation:
        Repository_Operation
): Promise<unknown> {
    switch (
    operation.operation
    ) {
        case 'Match_Entities':
            return Execute_Match_Entities(
                transaction,
                operation
            )

        case 'Match_Owned_Entities':
            return Execute_Match_Owned_Entities(
                transaction,
                operation
            )

        case 'Create_Entity':
            return Execute_Create_Entity(
                transaction,
                operation
            )
        case 'Create_Owned_Entity': 
            return Execute_Create_Owned_Entity(
                transaction,
                operation
            )
        case 'Update_Entity':
            return Execute_Update_Entity(
                transaction,
                operation
            )

        case 'Delete_Entity':
            return Execute_Delete_Entity(
                transaction,
                operation
            )

        case 'Create_Relationship':
            return Execute_Create_Relationship(
                transaction,
                operation
            )

        case 'Delete_Relationship':
            return Execute_Delete_Relationship(
                transaction,
                operation
            )

        case 'Match_Related_Entities':
            return Execute_Match_Related_Entities(
                transaction,
                operation
            )
        default: {
            const exhaustive_check:
                never =
                operation

            throw new Error(
                `Unsupported repository operation: ${exhaustive_check}`
            )
        }
    }
}


export async function Execute_Read<
    Result
>(
    driver: Driver,
    operation: (
        transaction:
            ManagedTransaction
    ) => Promise<Result>
): Promise<Result> {
    const session =
        driver.session()

    try {
        return await session.executeRead(
            operation
        )
    }
    finally {
        await session.close()
    }
}


export async function Execute_Write<
    Result
>(
    driver: Driver,
    operation: (
        transaction:
            ManagedTransaction
    ) => Promise<Result>
): Promise<Result> {
    const session =
        driver.session()

    try {
        return await session.executeWrite(
            operation
        )
    }
    finally {
        await session.close()
    }
}


export async function Execute_Match_Entities<
    Entity extends Entity_Label,
    Cardinality extends Return_Cardinality
>(
    transaction:
        ManagedTransaction,

    operation:
        Match_Entities_Operation<
            Entity,
            Cardinality
        >
): Promise<
    Entity_Return<
        Entity,
        Cardinality
    >
> {
    Validate_Cypher_Identifier(
        operation.entity
    )


    const where =
        Build_Where_Conditions(
            'entity',
            operation.where ?? {},
            'where'
        )


    const query = `
        MATCH
            (entity:${operation.entity})

        ${where.cypher
            ? `WHERE ${where.cypher}`
            : ''
        }

        RETURN entity

        ${operation.return === 'One'
            ? 'LIMIT 1'
            : ''
        }
    `


    const result =
        await transaction.run(
            query,
            where.parameters
        )


    const entities =
        result.records.map(
            record =>
                record
                    .get('entity')
                    .properties as Entity_Type_Map[Entity]
        )


    if (
        operation.return === 'One'
    ) {
        return (
            entities[0]
            ?? null
        ) as Entity_Return<
            Entity,
            Cardinality
        >
    }


    return entities as Entity_Return<
        Entity,
        Cardinality
    >
}



export async function Execute_Match_Owned_Entities<
    Entity extends Entity_Label,
    Cardinality extends Return_Cardinality
>(
    transaction:
        ManagedTransaction,

    operation:
        Match_Owned_Entities_Operation<
            Entity,
            Cardinality
        >
): Promise<
    Entity_Return<
        Entity,
        Cardinality
    >
> {
    Validate_Cypher_Identifier(
        operation.entity
    )


    const where =
        Build_Where_Conditions(
            'entity',
            operation.where ?? {},
            'entity_where'
        )


    const query = `
        MATCH
            (user:User {
                uid: $user_uid
            })
            -[:OWNS]->
            (entity:${operation.entity})

        ${where.cypher
            ? `WHERE ${where.cypher}`
            : ''
        }

        RETURN entity

        ${operation.return === 'One'
            ? 'LIMIT 1'
            : ''
        }
    `


    const result =
        await transaction.run(
            query,
            {
                user_uid:
                    operation.user_uid,

                ...where.parameters
            }
        )


    const entities =
        result.records.map(
            record =>
                record
                    .get('entity')
                    .properties as Entity_Type_Map[Entity]
        )


    if (
        operation.return === 'One'
    ) {
        return (
            entities[0]
            ?? null
        ) as Entity_Return<
            Entity,
            Cardinality
        >
    }


    return entities as Entity_Return<
        Entity,
        Cardinality
    >
}

export async function Execute_Create_Entity<
    Entity extends Entity_Label
>(
    transaction:
        ManagedTransaction,

    operation:
        Create_Entity_Operation<Entity>
): Promise<
    Entity_Type_Map[Entity]
> {
    Validate_Cypher_Identifier(
        operation.entity
    )


    const query = `
        CREATE
            (entity:${operation.entity})

        SET
            entity += $properties

        RETURN entity
    `


    const result =
        await transaction.run(
            query,
            {
                properties:
                    operation.properties
            }
        )


    return result.records[0]!
        .get('entity')
        .properties as Entity_Type_Map[Entity]
}


export async function Execute_Update_Entity<
    Entity extends Entity_Label
>(
    transaction:
        ManagedTransaction,

    operation:
        Update_Entity_Operation<Entity>
): Promise<
    Entity_Type_Map[Entity] | null
> {
    Validate_Cypher_Identifier(
        operation.entity
    )


    if (
        Object.keys(
            operation.where
        ).length === 0
    ) {
        throw new Error(
            'Update_Entity requires at least one WHERE property.'
        )
    }


    if (
        Object.keys(
            operation.properties
        ).length === 0
    ) {
        throw new Error(
            'Update_Entity requires at least one property to update.'
        )
    }


    const where =
        Build_Where_Conditions(
            'entity',
            operation.where,
            'where'
        )


    const query = `
        MATCH
            (entity:${operation.entity})

        WHERE
            ${where.cypher}

        SET
            entity += $properties

        RETURN entity

        LIMIT 1
    `


    const result =
        await transaction.run(
            query,
            {
                ...where.parameters,

                properties:
                    operation.properties
            }
        )


    if (
        result.records.length === 0
    ) {
        return null
    }


    return result.records[0]!
        .get('entity')
        .properties as Entity_Type_Map[Entity]
}


export async function Execute_Delete_Entity<
    Entity extends Entity_Label
>(
    transaction:
        ManagedTransaction,

    operation:
        Delete_Entity_Operation<Entity>
): Promise<number> {
    Validate_Cypher_Identifier(
        operation.entity
    )


    if (
        Object.keys(
            operation.where
        ).length === 0
    ) {
        throw new Error(
            'Delete_Entity requires at least one WHERE property.'
        )
    }


    const where =
        Build_Where_Conditions(
            'entity',
            operation.where,
            'where'
        )


    const query = `
        MATCH
            (entity:${operation.entity})

        WHERE
            ${where.cypher}

        ${operation.detach
            ? 'DETACH DELETE entity'
            : 'DELETE entity'
        }
    `


    const result =
        await transaction.run(
            query,
            where.parameters
        )


    return result.summary
        .counters
        .updates()
        .nodesDeleted
}



export async function Execute_Create_Relationship<
    From_Entity extends Entity_Label,
    To_Entity extends Entity_Label
>(
    transaction:
        ManagedTransaction,

    operation:
        Create_Relationship_Operation<
            From_Entity,
            To_Entity
        >
): Promise<
    Record<string, unknown>
> {
    Validate_Cypher_Identifier(
        operation.from.entity
    )

    Validate_Cypher_Identifier(
        operation.to.entity
    )

    Validate_Cypher_Identifier(
        operation.relationship
    )


    const from_where =
        Build_Where_Conditions(
            'from_entity',
            operation.from.where,
            'from'
        )


    const to_where =
        Build_Where_Conditions(
            'to_entity',
            operation.to.where,
            'to'
        )


    if (
        !from_where.cypher ||
        !to_where.cypher
    ) {
        throw new Error(
            'Create_Relationship requires identifying properties for both entities.'
        )
    }


    const query = `
        MATCH
            (from_entity:${operation.from.entity})

        WHERE
            ${from_where.cypher}

        MATCH
            (to_entity:${operation.to.entity})

        WHERE
            ${to_where.cypher}

        CREATE
            (from_entity)
            -[
                relationship:${operation.relationship}
            ]->
            (to_entity)

        SET
            relationship += $relationship_properties

        RETURN relationship
    `


    const result =
        await transaction.run(
            query,
            {
                ...from_where.parameters,
                ...to_where.parameters,

                relationship_properties:
                    operation.relationship_properties
                    ?? {}
            }
        )


    if (
        result.records.length === 0
    ) {
        throw new Error(
            'Could not create relationship because one or both entities were not found.'
        )
    }


    return result.records[0]!
        .get('relationship')
        .properties
}



export async function Execute_Delete_Relationship<
    From_Entity extends Entity_Label,
    To_Entity extends Entity_Label
>(
    transaction:
        ManagedTransaction,

    operation:
        Delete_Relationship_Operation<
            From_Entity,
            To_Entity
        >
): Promise<number> {
    Validate_Cypher_Identifier(
        operation.from.entity
    )

    Validate_Cypher_Identifier(
        operation.to.entity
    )

    Validate_Cypher_Identifier(
        operation.relationship
    )


    const from_where =
        Build_Where_Conditions(
            'from_entity',
            operation.from.where,
            'from'
        )


    const to_where =
        Build_Where_Conditions(
            'to_entity',
            operation.to.where,
            'to'
        )


    const relationship_where =
        Build_Where_Conditions(
            'relationship',
            operation.relationship_where
            ?? {},
            'relationship'
        )


    if (
        !from_where.cypher ||
        !to_where.cypher
    ) {
        throw new Error(
            'Delete_Relationship requires identifying properties for both entities.'
        )
    }


    const query = `
        MATCH
            (from_entity:${operation.from.entity})
            -[
                relationship:${operation.relationship}
            ]->
            (to_entity:${operation.to.entity})

        WHERE
            ${from_where.cypher}

            AND
            ${to_where.cypher}

            ${relationship_where.cypher
            ? `AND ${relationship_where.cypher}`
            : ''
        }

        DELETE relationship
    `


    const result =
        await transaction.run(
            query,
            {
                ...from_where.parameters,
                ...to_where.parameters,
                ...relationship_where.parameters
            }
        )


    return result.summary
        .counters
        .updates()
        .relationshipsDeleted
}



export async function Execute_Match_Related_Entities<
    From_Entity extends Entity_Label,
    To_Entity extends Entity_Label,
    Cardinality extends Return_Cardinality,
    Return_Mode extends Related_Entity_Return_Mode = 'Entity'
>(
    transaction:
        ManagedTransaction,

    operation:
        Match_Related_Entities_Operation<
            From_Entity,
            To_Entity,
            Cardinality,
            Return_Mode
        >
): Promise<
    Related_Entity_Return<
        To_Entity,
        Cardinality,
        Return_Mode
    >
> {
    Validate_Cypher_Identifier(
        operation.from.entity
    )

    Validate_Cypher_Identifier(
        operation.to
    )

    Validate_Cypher_Identifier(
        operation.relationship
    )


    const from_where =
        Build_Where_Conditions(
            'from_entity',
            operation.from.where,
            'from'
        )


    const to_where =
        Build_Where_Conditions(
            'to_entity',
            operation.to_where ?? {},
            'to'
        )


    const relationship_where =
        Build_Where_Conditions(
            'relationship',
            operation.relationship_where ?? {},
            'relationship'
        )


    if (!from_where.cypher) {
        throw new Error(
            'Match_Related_Entities requires identifying properties for the source entity.'
        )
    }


    const relationship_pattern =
        operation.direction === 'Incoming'
            ? `
                (from_entity)
                <-[
                    relationship:${operation.relationship}
                ]-
                (to_entity:${operation.to})
            `
            : `
                (from_entity)
                -[
                    relationship:${operation.relationship}
                ]->
                (to_entity:${operation.to})
            `


    let order_by = ''

    if (
        operation.order_by_relationship_property
    ) {
        Validate_Cypher_Identifier(
            operation.order_by_relationship_property
        )

        order_by = `
            ORDER BY
                relationship.${operation.order_by_relationship_property}
        `
    }


    const query = `
        MATCH
            (from_entity:${operation.from.entity})

        MATCH
            ${relationship_pattern}

        WHERE
            ${from_where.cypher}

            ${to_where.cypher
            ? `AND ${to_where.cypher}`
            : ''
        }

            ${relationship_where.cypher
            ? `AND ${relationship_where.cypher}`
            : ''
        }

        RETURN
            to_entity,
            relationship

        ${order_by}

        ${operation.return === 'One'
            ? 'LIMIT 1'
            : ''
        }
    `


    const result =
        await transaction.run(
            query,
            {
                ...from_where.parameters,
                ...to_where.parameters,
                ...relationship_where.parameters
            }
        )


    const results =
        result.records.map(
            record => {
                const entity =
                    record
                        .get('to_entity')
                        .properties as Entity_Type_Map[To_Entity]


                if (
                    operation.return_mode ===
                    'Entity_And_Relationship'
                ) {
                    return {
                        entity,

                        relationship:
                            record
                                .get('relationship')
                                .properties
                    }
                }


                return entity
            }
        )


    if (
        operation.return === 'One'
    ) {
        return (
            results[0] ?? null
        ) as Related_Entity_Return<
            To_Entity,
            Cardinality,
            Return_Mode
        >
    }


    return results as Related_Entity_Return<
        To_Entity,
        Cardinality,
        Return_Mode
    >
}
interface Built_Entity_Reference {
    match:
    string

    where:
    string

    parameters:
    Record<string, unknown>
}


function Build_Entity_Reference<
    Entity extends Entity_Label
>(
    variable:
        string,

    reference:
        Entity_Reference<Entity>,

    parameter_prefix:
        string
): Built_Entity_Reference {
    Validate_Cypher_Identifier(
        variable
    )

    Validate_Cypher_Identifier(
        reference.entity
    )


    const conditions =
        Build_Where_Conditions(
            variable,
            reference.where,
            `${parameter_prefix}_where`
        )


    const parameters:
        Record<string, unknown> = {
        ...conditions.parameters
    }


    let match =
        `(${variable}:${reference.entity})`


    if (
        reference.owned_by
    ) {
        const user_variable =
            `${variable}_owner`

        Validate_Cypher_Identifier(
            user_variable
        )


        const user_uid_parameter =
            `${parameter_prefix}_owner_user_uid`


        match = `
            (${user_variable}:User {
                uid: $${user_uid_parameter}
            })
            -[:OWNS]->
            (${variable}:${reference.entity})
        `


        parameters[
            user_uid_parameter
        ] =
            reference.owned_by.user_uid
    }


    return {
        match,

        where:
            conditions.cypher,

        parameters
    }
}

export async function Execute_Create_Owned_Entity<
    Entity extends Entity_Label
>(
    transaction:
        ManagedTransaction,

    operation:
        Create_Owned_Entity_Operation<Entity>
): Promise<
    Entity_Type_Map[Entity]
> {
    Validate_Cypher_Identifier(
        operation.entity
    )


    const query = `
        MATCH
            (user:User {
                uid: $user_uid
            })

        CREATE
            (entity:${operation.entity})

        SET
            entity += $properties

        CREATE
            (user)
            -[:OWNS]->
            (entity)

        RETURN entity
    `


    const result =
        await transaction.run(
            query,
            {
                user_uid:
                    operation.user_uid,

                properties:
                    operation.properties
            }
        )


    if (
        result.records.length === 0
    ) {
        throw new Error(
            `Could not create owned ${operation.entity}. User was not found.`
        )
    }


    return result.records[0]!
        .get(
            'entity'
        )
        .properties as Entity_Type_Map[Entity]
}