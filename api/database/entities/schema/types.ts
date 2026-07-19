import type { Cardinality, JSON_Value } from "@schematician/shared"

export type Schema_Link_Role =
    | 'HAS_ELEMENT'
    | 'HAS_PROPERTY'
    | 'HAS_IDENTIFIER'

export interface GraphQL_Schema_Link_Input {
    child_schema_uid: string
    role: Schema_Link_Role
    index?: number | null
    required?: boolean | null
    cardinality?: Cardinality | null
    value?: JSON_Value
}

export interface Schema_Element_Link_Properties {
    index: number
    required: boolean
    cardinality: Cardinality
}

export interface Schema_Value_Link_Properties {
    value: unknown
}

export type Schema_Link_Input =
    | {
        role: 'HAS_ELEMENT'
        child_schema_uid: string
        properties: Schema_Element_Link_Properties
    }
    | {
        role: 'HAS_PROPERTY' | 'HAS_IDENTIFIER'
        child_schema_uid: string
        properties: Schema_Value_Link_Properties
    }

export interface Schema_Element_Update {
    element_uid: string
    required: boolean
    cardinality: Cardinality
    index: number
}