import { Data_Type, Cardinality} from "../schema/types"
export type JSON_Value =
    | string
    | number
    | boolean
    | null
    | JSON_Value[]
    | {
        [key: string]: JSON_Value
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
export interface GraphQL_Schema_Element {
    uid: string,
    element: GraphQL_Schema
    required: boolean
    cardinality: Cardinality
    index: number

}

export interface Create_Schema_Link_Result {
    parent: GraphQL_Schema
    schema_element_uid?: string
}
export interface GraphQL_Schema {
    name: string
    uid: string
    data_type: Data_Type
    image?: string
    rules?: string
    logic?: string
    relationships?: string
    elements?: GraphQL_Schema_Element[]
    properties?: GraphQL_Schema_Association[]
    identifiers?: GraphQL_Schema_Association[]
    constraints?: GraphQL_Constraints
    enumerations?: JSON_Value[]
    options?: JSON_Value[]
}

export interface GraphQL_Schema_Association {
    schema: GraphQL_Schema
    value: JSON_Value
}


export type GraphQL_Instance =
| GraphQL_Atomic_Instance
| GraphQL_Composite_Instance
| GraphQL_Array_Instance

export interface GraphQL_Instance_Value {
    schema_uid: string
    value: JSON_Value
}
interface GraphQL_Instance_Base {
    uid: string
    schema_uid: string
    data_type: Data_Type
}
export interface GraphQL_Instance_Object {
    schema_element_uid: string

    instance: GraphQL_Instance
}

export interface GraphQL_Atomic_Instance
    extends GraphQL_Instance_Base {
    data_type: 'String' | 'Number' | 'Boolean'

    value: JSON_Value | null /**For unintialized */
}
export interface GraphQL_Composite_Instance
    extends GraphQL_Instance_Base {
    data_type: 'Composite'

    objects: GraphQL_Instance_Object[]
}

export interface GraphQL_Array_Instance
    extends GraphQL_Instance_Base {
    data_type: 'Array'

    items: GraphQL_Instance[]
}