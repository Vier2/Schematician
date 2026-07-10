import { Data_Type } from "../../builder.js"
export interface Schema_Association_Update {
    schema_uid: string
    index?: number | null
    value?: unknown
}
export interface Delete_Schema_Result {
    success: boolean
    message: string
    deleted_uid?: string
}

export interface Update_Schema_Data {
    uid: string
    name: string
    data_type: Data_Type

    image?: string 
    rules?: string 
    logic?: string 
    relationships?: string 

    constraints?: unknown
    enumerations?: unknown[]
    options?: unknown[]

    elements?: Schema_Association_Update[]
    properties?: Schema_Association_Update[]
    identifiers?: Schema_Association_Update[]
}

export type Search_Target =
    | 'schemas'
    | 'instances'
    | 'activity'

export type Filter_Operator =
    | 'equals'
    | 'contains'
    | 'greater_than'
    | 'less_than'
    | 'has_field'
    | 'has_element'
    | 'has_property'
    | 'has_identifier'

export type Field_Role =
    | 'any'
    | 'element'
    | 'property'
    | 'identifier'

export interface Search_Filter {
    field_schema_uid: string
    field_role?: Field_Role
    operator: Filter_Operator
    value?: unknown
}

export interface Search_Query {
    target: Search_Target
    filters?: Search_Filter[]
    logic?: 'and' | 'or'
}