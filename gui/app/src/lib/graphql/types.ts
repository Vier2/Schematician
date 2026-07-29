import type { Data_Type } from "@schematician/shared"
import type { 
    GraphQL_Instance_Value,
    GraphQL_Schema, GraphQL_Instance } from "@schematician/shared"




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
export interface Save_Instance_Response {
    data?: {
        save_instance:
        GraphQL_Instance | null
    }

    errors?: Array<{
        message: string
    }>
}

export interface Save_Instance_Response {
    save_instance:
    GraphQL_Instance | null
}

export interface Save_Instance_Input {
    instance:
    GraphQL_Instance
}



export interface Update_Schema_Response {
    schema: GraphQL_Schema
}

export interface Get_Schema_By_UID_Input {
    uid: string
}
export interface Get_Schema_By_UID_Response {
    schema: GraphQL_Schema | null
}
export interface Get_Instance_By_UID_Input {
    uid: string
}


export interface Update_Instance_Values_Response {
    data?: {
        update_instance_values:
        GraphQL_Instance_Value[]
    }

    errors?: {
        message: string
    }[]
}

export interface Get_Instance_By_UID_Response {
    instance: GraphQL_Instance | null
}

export interface Delete_Schema_Input {
    uid: string
}

export interface Delete_Schema_Payload {
    success: boolean
    message: string
    deleted_uid?: string | null
}

export interface Delete_Schema_Response {
    delete_schema: Delete_Schema_Payload
}
export interface Create_Instance_Input {
    schema_uid: string
    /**All you should need is the source schema */
}
export interface Create_Instance_Response {
    create_instance: GraphQL_Instance
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
    | `${string}_Input`
    | `${string}_Input!`
export interface GraphQL_Variable_Definition {
    name: string
    type: GraphQL_Variable_Type
}

export interface Remove_Array_Item_Response {
    remove_array_item:
    boolean
}


export interface Create_Array_Item_Response {
    create_array_item: {
        item:
        GraphQL_Instance

        index:
        number
    }
}

export interface Create_Array_Item_Input {
    array_instance_uid: string
}


export interface Remove_Array_Item_Input {
    array_instance_uid:
    string

    item_instance_uid:
    string
}
export type GraphQL_Selection =
    | string
    | GraphQL_Field_Selection
    | GraphQL_Inline_Fragment

export interface GraphQL_Field_Selection {
    field: string
    selection: GraphQL_Selection[]
}

export interface GraphQL_Inline_Fragment {
    fragment_on: string
    selection: GraphQL_Selection[]
}
export interface Send_GraphQL_Options<Input_Type> {
    api_url: string
    operation_type: GraphQL_Operation_Type
    operation_name: string
    field_name: string
    variables?: GraphQL_Variable_Definition[]
    input_data?: Input_Type
    selection: GraphQL_Selection[]
    token?: string
}

