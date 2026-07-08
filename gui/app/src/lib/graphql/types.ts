import type { Data_Type } from "$lib/Schema/models"

export interface GraphQL_Schema {
    name: string
    uid: string
    data_type: Data_Type
    image?: string
    rules?: string
    logic?: string
    relationships?: string
    elements?: GraphQL_Schema[]
    properties?: GraphQL_Schema_Association[]
    identifiers?: GraphQL_Schema_Association[]
    constraints?: GraphQL_Constraints
    enumerations?: unknown[]
    options?: unknown[]
}

export interface GraphQL_Schema_Association {
    schema: GraphQL_Schema
    value: unknown
}
export interface GraphQL_Constraints {
    minimum_number?: number
    maximum_number?: number
    can_be_positive?: boolean
    can_be_negative?: boolean
    minimum_characters?: number
    maximum_characters?: number
    regex?: string
    lowercase?: boolean
    uppercase?: boolean
}

export interface GraphQl_Instance {
    schema_uid: string
    objects: GraphQL_Instance_Value[]
    uid: string
}
export interface GraphQL_Instance_Value {
    field_schema_uid: string
    value: unknown
}

export interface GraphQL_Response<T> {
    data?: T
    errors?: { message: string }[]
}
export type GraphQL_Operation_Type = 'query' | 'mutation'

export interface Create_Schema_Input {
    name: string
    data_type: Data_Type
}

export interface Create_Schema_Response {
    create_schema: GraphQL_Schema
}

export type GraphQL_Variable_Type =
    | 'String'
    | 'String!'
    | 'Int'
    | 'Int!'
    | 'Float'
    | 'Float!'
    | 'Boolean'
    | 'Boolean!'
    | 'Data_Type'
    | 'Data_Type!'
    | 'JSON'
    | 'JSON!'

export interface GraphQL_Variable_Definition {
    name: string
    type: GraphQL_Variable_Type
}

export interface Send_GraphQL_Options<Input_Type> {
    api_url: string
    operation_type: GraphQL_Operation_Type
    operation_name: string
    field_name: string
    variables?: GraphQL_Variable_Definition[]
    input_data?: Input_Type
    selection: string[]
    token?: string
}

