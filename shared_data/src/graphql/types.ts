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

export interface GraphQL_Instance_Value {
    instance_uid: string
    schema_uid: string
    value: JSON_Value | null
}
export interface GraphQL_Schema_Element {
    /**
     * UID of this specific HAS_ELEMENT relationship.
     */
    uid: string

    /**
     * Child Schema node referenced by the relationship.
     */
    element: GraphQL_Schema

    index: number
    required: boolean
    cardinality: Cardinality
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

export interface Schema_Element_Link_Create_Input {
    role: 'HAS_ELEMENT'

    element_schema_uid: string

    properties: {
        index: number
        required: boolean
        cardinality: Cardinality
    }
}

export interface Schema_Association_Link_Create_Input {
    role:
    | 'HAS_PROPERTY'
    | 'HAS_IDENTIFIER'

    element_schema_uid: string

    properties: {
        value: JSON_Value
    }
}


export interface Schema_Node_Record {
    uid: string
    data_type: Data_Type
}

export interface Schema_Element_Record {
    relationship_uid: string
    index: number
    element_schema_uid: string
}

export interface Instance_Node_Update {
    uid:
    string

    schema_uid:
    string

    data_type: Data_Type

    value_json: JSON_Value
}

export type Schema_Link_Create_Input =
    | Schema_Element_Link_Create_Input
    | Schema_Association_Link_Create_Input

export type GraphQL_Instance =
| GraphQL_Atomic_Instance
| GraphQL_Composite_Instance
| GraphQL_Array_Instance

export interface GraphQL_Instance_Value {
    schema_uid: string
    value: JSON_Value
}

export interface Create_Array_Item_Result {
    item:
    GraphQL_Instance

    index:
    number
}
interface GraphQL_Instance_Base {
    uid: string
    schema_uid: string
    data_type: Data_Type
}
export interface GraphQL_Instance_Object {
    element_relationship_uid: string
    instance: GraphQL_Instance
}

export interface Schema_Element_Update_Input {
    /**
     * UID of the HAS_ELEMENT relationship.
     *
     * Undefined only for a genuinely new element.
     */
    uid?: string

    /**
     * UID of the child Schema node.
     */
    element_uid: string

    index: number
    required: boolean
    cardinality: Cardinality
}

export interface Delete_Instance_Input {
    uid: string
}

export interface Delete_Instance_Payload {
    success: boolean
    message: string
    deleted_uid: string
}

export interface Delete_Instance_Response {
    delete_instance: Delete_Instance_Payload
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

