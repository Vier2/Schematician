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
    element: GraphQL_Schema
    required: boolean
    cardinality: Cardinality
    index: number

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

