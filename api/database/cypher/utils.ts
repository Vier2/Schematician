interface Cypher_Conditions {
    cypher:
    string

    parameters:
    Record<string, unknown>
}


export function Validate_Cypher_Identifier(
    identifier: string
): void {
    if (
        !/^[A-Za-z_][A-Za-z0-9_]*$/.test(
            identifier
        )
    ) {
        throw new Error(
            `Invalid Cypher identifier: ${identifier}`
        )
    }
}


export function Build_Where_Conditions(
    variable: string,

    properties:
        object,

    parameter_prefix: string
): Cypher_Conditions {
    Validate_Cypher_Identifier(
        variable
    )

    const conditions:
        string[] = []

    const parameters:
        Record<string, unknown> = {}


    for (
        const [
            property,
            value
        ] of Object.entries(
            properties
        )
    ) {
        Validate_Cypher_Identifier(
            property
        )

        const parameter_name =
            `${parameter_prefix}_${property}`


        conditions.push(
            `${variable}.${property} = $${parameter_name}`
        )


        parameters[
            parameter_name
        ] =
            value
    }


    return {
        cypher:
            conditions.join(
                ' AND '
            ),

        parameters
    }
}


export function Build_Set_Properties(
    variable: string,

    properties:
        Record<string, unknown>,

    parameter_prefix: string
): Cypher_Conditions {
    Validate_Cypher_Identifier(
        variable
    )

    const assignments:
        string[] = []

    const parameters:
        Record<string, unknown> = {}


    for (
        const [
            property,
            value
        ] of Object.entries(
            properties
        )
    ) {
        Validate_Cypher_Identifier(
            property
        )

        const parameter_name =
            `${parameter_prefix}_${property}`

        assignments.push(
            `${variable}.${property} = $${parameter_name}`
        )

        parameters[
            parameter_name
        ] =
            value
    }


    return {
        cypher:
            assignments.join(
                ', '
            ),

        parameters
    }
}