import type { Send_GraphQL_Options } from "./types"

function Build_GraphQL_Selection(
    selection: string[],
    indent = '        '
): string {
    return selection
        .map(field => `${indent}${field}`)
        .join('\n')
}

export async function Send_GraphQL_Request<
    Response_Type,
    Input_Type = undefined
>(
    options: Send_GraphQL_Options<Input_Type>
): Promise<Response_Type> {
    const variable_definitions =
        options.variables?.length
            ? `(${options.variables
                .map(variable => `$${variable.name}: ${variable.type}`)
                .join(', ')})`
            : ''

    const field_arguments =
        options.variables?.length
            ? `(${options.variables
                .map(variable => `${variable.name}: $${variable.name}`)
                .join(', ')})`
            : ''

    const selection =
        Build_GraphQL_Selection(options.selection)

    const query = `
        ${options.operation_type} ${options.operation_name}${variable_definitions} {
            ${options.field_name}${field_arguments} {
${selection}
            }
        }
    `

    const token =
        options.token ?? localStorage.getItem('token') ?? undefined

    const response = await fetch(`${options.api_url}/graphql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {})
        },
        body: JSON.stringify({
            query,
            variables: options.input_data ?? {}
        })
    })

    const result = await response.json()

    if (result.errors?.length) {
        throw new Error(
            result.errors
                .map((error: { message: string }) => error.message)
                .join('\n')
        )
    }

    return result.data as Response_Type
}


