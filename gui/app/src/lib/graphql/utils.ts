import type { 
    Send_GraphQL_Options, GraphQL_Schema, 
    Create_Instance_Input, Create_Instance_Response,
    Get_Schema_By_UID_Input, 
    Get_Schema_By_UID_Response, Delete_Schema_Response, 
    Delete_Schema_Input, Delete_Schema_Payload, 
    Get_Instance_By_UID_Input, Get_Instance_By_UID_Response,
    GraphQl_Instance, GraphQL_Selection} from "./types"

function Build_GraphQL_Selection(
    selection: GraphQL_Selection[],
    indentation_level = 3
): string {
    const indentation = '    '.repeat(indentation_level)

    return selection
        .map(field => {
            if (typeof field === 'string') {
                return `${indentation}${field}`
            }

            const nested_selection =
                Build_GraphQL_Selection(
                    field.selection,
                    indentation_level + 1
                )

            return `${indentation}${field.field} {
${nested_selection}
${indentation}}`
        })
        .join('\n')
}
export async function Create_Instance(
    api_url: string,
    schema_uid: string
): Promise<GraphQl_Instance> {
    const result =
        await Send_GraphQL_Request<
            Create_Instance_Response,
            Create_Instance_Input
        >({
            api_url,
            operation_type: 'mutation',
            operation_name: 'Create_Instance',
            field_name: 'create_instance',

            variables: [
                {
                    name: 'schema_uid',
                    type: 'String!'
                }
            ],

            input_data: {
                schema_uid
            },

            selection: [
                'uid'
            ]
        })

    return result.create_instance
}

export async function Delete_Schema(
    api_url: string,
    uid: string,
    token?: string
): Promise<Delete_Schema_Payload> {
    const response =
        await Send_GraphQL_Request<
            Delete_Schema_Response,
            Delete_Schema_Input
        >({
            api_url,
            operation_type: 'mutation',
            operation_name: 'Delete_Schema',
            field_name: 'delete_schema',

            variables: [
                {
                    name: 'uid',
                    type: 'String!'
                }
            ],

            input_data: {
                uid
            },

            selection: [
                'success',
                'message',
                'deleted_uid'
            ],

            token
        })

    return response.delete_schema
}
export async function Get_Schema_By_UID(
    api_url: string,
    uid: string,
    token?: string
): Promise<GraphQL_Schema | null> {
    const response =
        await Send_GraphQL_Request<
            Get_Schema_By_UID_Response,
            Get_Schema_By_UID_Input
        >({
            api_url,
            operation_type: 'query',
            operation_name: 'Get_Schema_By_UID',
            field_name: 'schema',

            variables: [
                {
                    name: 'uid',
                    type: 'String!'
                }
            ],

            input_data: {
                uid
            },

            selection: [
                'uid',
                'name',
                'data_type',
                'image',
                'rules',
                'logic',
                'relationships',
                'enumerations',
                'options'
            ],

            token
        })

    return response.schema
}

export async function Get_Instance_By_UID(
    api_url: string,
    uid: string,
    token?: string
): Promise<GraphQl_Instance | null> {
    const response =
        await Send_GraphQL_Request<
            Get_Instance_By_UID_Response,
            Get_Instance_By_UID_Input
        >({
            api_url,
            operation_type: 'query',
            operation_name: 'Get_Instance_By_UID',
            field_name: 'instance',

            variables: [
                {
                    name: 'uid',
                    type: 'String!'
                }
            ],

            input_data: {
                uid
            },

            selection: [
                'uid',
                'schema_uid',
                'value',
                {
                    field: 'objects',
                    selection: [
                        'schema_uid',
                        'value'
                    ]
                }
            ],

            token
        })

    return response.instance
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

    const response = await fetch(`${options.api_url}`, {
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


